// api/orders/stats/route.ts (GET - Order Statistics)
import { NextResponse } from 'next/server';
import {connectToDatabase} from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET() {
  try {
    await connectToDatabase();
    
    const [stats] = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
          },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] }
          },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'Complete'] }, 1, 0] }
          },
          returned: {
            $sum: { $cond: [{ $eq: ['$status', 'Returned'] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    return NextResponse.json(stats || {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      returned: 0,
      cancelled: 0
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    return NextResponse.json(
      { message: 'Failed to fetch order statistics' },
      { status: 500 }
    );
  }
}
