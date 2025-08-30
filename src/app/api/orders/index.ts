import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import User from '../../../models/User';
import { ApiResponse, CreateOrderRequest } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  await connectToDatabase();

  switch (req.method) {
    case 'GET':
      try {
        const { status, limit = 50, page = 1 } = req.query;
        
        const query = status && status !== 'all' ? { status } : {};
        const skip = (Number(page) - 1) * Number(limit);
        
        const orders = await Order.find(query)
          .populate('userId', 'firstName lastName phone')
          .sort({ createdAt: -1 })
          .limit(Number(limit))
          .skip(skip);
          
        const total = await Order.countDocuments(query);
        
        return res.status(200).json({
          success: true,
          data: {
            orders,
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total,
              pages: Math.ceil(total / Number(limit))
            }
          }
        });
      } catch (error) {
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve orders'
        });
      }

    case 'POST':
      try {
        const orderData: CreateOrderRequest = req.body;
        
        // Find or create user
        let user = await User.findOne({ phone: orderData.phone });
        if (!user && orderData.userDetails) {
          user = new User(orderData.userDetails);
          await user.save();
        } else if (!user) {
          return res.status(400).json({
            success: false,
            error: 'User not found and no user details provided'
          });
        }

        // Validate products and stock
        const orderProducts = [];
        for (const item of orderData.products) {
          const product = await Product.findById(item.productId);
          if (!product) {
            return res.status(400).json({
              success: false,
              error: `Product not found: ${item.productId}`
            });
          }
          
          if (product.stockCount < item.quantity) {
            return res.status(400).json({
              success: false,
              error: `Insufficient stock for ${product.name}. Available: ${product.stockCount}, Requested: ${item.quantity}`
            });
          }

          orderProducts.push({
            productId: product._id,
            quantity: item.quantity,
            priceAtOrder: product.price,
            name: product.name
          });
        }

        // Create order
        const order = new Order({
          userId: user._id,
          products: orderProducts
        });
        
        await order.save();

        // Update stock counts
        for (const item of orderData.products) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stockCount: -item.quantity } }
          );
        }

        // Populate order with user details
        await order.populate('userId', 'firstName lastName phone');

        return res.status(201).json({
          success: true,
          data: order,
          message: 'Order created successfully'
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any 
      catch (error: any) {
        return res.status(400).json({
          success: false,
          error: error.message || 'Failed to create order'
        });
      }

    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }
}