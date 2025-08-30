// api/products/[id]/orders/route.ts (GET - Product Order History)
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const orders = await Order.find({
      'products.productId': params.id
    })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching product order history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch product order history' },
      { status: 500 }
    );
  }
}