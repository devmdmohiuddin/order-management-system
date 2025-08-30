// api/orders/route.ts (GET - List Orders with Filters)
import { NextRequest, NextResponse } from 'next/server';
import {connectToDatabase} from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const search = searchParams.get('search');

    // Build filter object
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      filter.totalAmount = {};
      if (minAmount) filter.totalAmount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.totalAmount.$lte = parseFloat(maxAmount);
    }
    
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { userId: { $regex: search, $options: 'i' } },
        { 'products.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Get orders with pagination
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter)
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}


// api/orders/route.ts (GET - List Orders with Filters, POST - Create Order)

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { userId, products, status = 'Pending' } = await request.json();
    
    // Validate required fields
    if (!userId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { message: 'UserId and products are required' },
        { status: 400 }
      );
    }
    
    // Validate and get product details
    const orderProducts = [];
    let totalAmount = 0;
    
    for (const productData of products) {
      const { productId, quantity } = productData;
      
      if (!productId || !quantity || quantity <= 0) {
        return NextResponse.json(
          { message: 'Each product must have a valid productId and quantity' },
          { status: 400 }
        );
      }
      
      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { message: `Product with ID ${productId} not found` },
          { status: 404 }
        );
      }
      
      // Check stock availability
      if (quantity > product.stock) {
        return NextResponse.json(
          { message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}` },
          { status: 400 }
        );
      }
      
      const subtotal = product.price * quantity;
      totalAmount += subtotal;
      
      orderProducts.push({
        productId: product._id,
        quantity,
        priceAtOrder: product.price,
        name: product.name
      });
      
      // Update product stock
      product.stock -= quantity;
      await product.save();
    }
    
    // Create the order
    const order = new Order({
      userId,
      products: orderProducts,
      status,
      totalAmount
    });
    
    await order.save();
    
    // Populate user details for response
    await order.populate('userId', 'name email');
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { message: 'Failed to create order' },
      { status: 500 }
    );
  }
}