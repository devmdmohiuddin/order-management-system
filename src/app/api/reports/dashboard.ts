import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { connectToDatabase } from '@/lib/mongodb';
import { ApiResponse, DashboardStats } from './../../../types/index';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await connectToDatabase();

  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Get dashboard statistics
    const [
      pendingOrders,
      inProgressOrders,
      totalUsers,
      totalProducts,
      lowStockProducts,
      monthlyRevenue,
      yearlyRevenue
    ] = await Promise.all([
      Order.countDocuments({ status: 'Pending' }),
      Order.countDocuments({ status: 'In Progress' }),
      User.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ stockCount: { $lt: 10 } }),
      
      // Monthly revenue
      Order.aggregate([
        {
          $match: {
            status: 'Complete',
            createdAt: {
              $gte: new Date(currentYear, currentMonth, 1),
              $lt: new Date(currentYear, currentMonth + 1, 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      // Yearly revenue
      Order.aggregate([
        {
          $match: {
            status: 'Complete',
            createdAt: {
              $gte: new Date(currentYear, 0, 1),
              $lt: new Date(currentYear + 1, 0, 1)
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0)
    ]);

    const stats: DashboardStats = {
      pendingOrders,
      inProgressOrders,
      totalUsers,
      totalProducts,
      lowStockProducts,
      monthlyRevenue,
      yearlyRevenue
    };

    return res.status(200).json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboard statistics'
    });
  }
}