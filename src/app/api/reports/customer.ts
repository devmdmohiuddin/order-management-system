// 2. Fixed: /pages/api/reports/customers.ts
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types/index'

interface CustomerReport {
  _id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: Date;
  customerSince: Date;
  status: 'active' | 'inactive';
}

interface CustomerResponse {
  customers: CustomerReport[];
  summary: {
    totalCustomers: number;
    totalRevenue: number;
    averageOrderValue: number;
    repeatCustomerRate: number;
  };
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<CustomerResponse>>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ 
      success: false,
      error: `Method ${req.method} not allowed` 
    });
  }

  await connectToDatabase();

  try {
    const { 
      type = 'repeat',
      limit = 50,
      sortBy = 'totalSpent',
      order = 'desc'
    } = req.query;

    // Get customer analytics from orders
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerAggregation: any[] = [
      {
        $group: {
          _id: '$userId',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalAmount' },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      { $unwind: '$userDetails' },
      {
        $project: {
          _id: '$_id',
          name: { $concat: ['$userDetails.firstName', ' ', '$userDetails.lastName'] },
          email: '$userDetails.email',
          phone: '$userDetails.phone',
          totalOrders: 1,
          totalSpent: 1,
          averageOrderValue: { $divide: ['$totalSpent', '$totalOrders'] },
          lastOrderDate: 1,
          customerSince: '$userDetails.createdAt',
          status: {
            $cond: {
              if: {
                $gte: [
                  '$lastOrderDate',
                  { $subtract: [new Date(), 90 * 24 * 60 * 60 * 1000] }
                ]
              },
              then: 'active',
              else: 'inactive'
            }
          }
        }
      }
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchConditions: any = {};

    // Filter customers based on type
    switch (type) {
      case 'repeat':
        matchConditions.totalOrders = { $gt: 1 };
        break;
      case 'new':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        matchConditions.customerSince = { $gte: thirtyDaysAgo };
        break;
      case 'top':
        matchConditions.totalSpent = { $gt: 1000 };
        break;
      case 'inactive':
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        matchConditions.lastOrderDate = { $lt: ninetyDaysAgo };
        break;
    }

    // Add match stage if there are conditions
    if (Object.keys(matchConditions).length > 0) {
      customerAggregation.push({ $match: matchConditions });
    }

    // Add sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortObj: any = {};
    sortObj[sortBy as string] = sortOrder;
    customerAggregation.push({ $sort: sortObj });

    // Add limit
    customerAggregation.push({ $limit: Number(limit) });

    const customerResult = await Order.aggregate(customerAggregation);

    // Format customers data to match CustomerReport interface
    const customers: CustomerReport[] = customerResult.map(item => ({
      _id: item._id.toString(),
      name: item.name,
      email: item.email || '',
      phone: item.phone,
      totalOrders: item.totalOrders,
      totalSpent: item.totalSpent,
      averageOrderValue: item.averageOrderValue,
      lastOrderDate: item.lastOrderDate,
      customerSince: item.customerSince,
      status: item.status
    }));

    // Calculate summary
    const summary = {
      totalCustomers: customers.length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      averageOrderValue: customers.reduce((sum, c) => sum + c.averageOrderValue, 0) / customers.length || 0,
      repeatCustomerRate: (customers.filter(c => c.totalOrders > 1).length / customers.length * 100) || 0
    };

    const responseData: CustomerResponse = {
      customers,
      summary
    };

    return res.status(200).json({
      success: true,
      data: responseData,
      message: 'Customer report generated successfully'
    });
  } catch (error) {
    console.error('Customer reports API error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}