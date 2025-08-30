// 1. Fixed: /pages/api/reports/sales.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';
import { ApiResponse } from '@/types/index'

interface SalesReport {
  productId: string;
  productName: string;
  category: string;
  totalQuantitySold: number;
  totalRevenue: number;
  averagePrice: number;
  lastSoldDate: Date;
}

interface SalesPeriodData {
  date: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
}

interface SalesResponse {
  salesByProduct: SalesReport[];
  periodData: SalesPeriodData[];
  summary: {
    totalRevenue: number;
    totalQuantitySold: number;
    averageOrderValue: number;
    topSellingProduct: string;
    productsAnalyzed: number;
  };
  filters: {
    period: string;
    category: string;
    productId: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse<ApiResponse<SalesResponse>>
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
      period = 'month',
      startDate,
      endDate,
      productId,
      category,
      limit = 50
    } = req.query;

    // Build date filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate as string);
    }

    // Get sales data from database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const salesAggregation: any[] = [
      { $match: { status: 'Complete', ...dateFilter } },
      { $unwind: '$products' },
      {
        $lookup: {
          from: 'products',
          localField: 'products.productId',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: '$products.productId',
          productName: { $first: '$products.name' },
          category: { $first: '$productDetails.category' },
          totalQuantitySold: { $sum: '$products.quantity' },
          totalRevenue: { $sum: { $multiply: ['$products.priceAtOrder', '$products.quantity'] } },
          averagePrice: { $avg: '$products.priceAtOrder' },
          lastSoldDate: { $max: '$createdAt' }
        }
      }
    ];

    // Add category filter if specified
    if (category) {
      salesAggregation.splice(3, 0, { $match: { 'productDetails.category': category } });
    }

    // Add product filter if specified
    if (productId) {
      salesAggregation[0].$match['products.productId'] = productId;
    }

    const salesResult = await Order.aggregate([
      ...salesAggregation,
      { $sort: { totalRevenue: -1 } },
      { $limit: Number(limit) }
    ]);

    // Format sales data to match SalesReport interface
    const salesData: SalesReport[] = salesResult.map(item => ({
      productId: item._id.toString(),
      productName: item.productName,
      category: item.category || 'Uncategorized',
      totalQuantitySold: item.totalQuantitySold,
      totalRevenue: item.totalRevenue,
      averagePrice: item.averagePrice,
      lastSoldDate: item.lastSoldDate
    }));

    // Get period data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodAggregation: any[] = [
      { $match: { status: 'Complete', ...dateFilter } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: period === 'day' ? '%Y-%m-%d' : 
                     period === 'week' ? '%Y-%U' :
                     period === 'month' ? '%Y-%m' : '%Y',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ];

    const periodResult = await Order.aggregate(periodAggregation);

    // Format period data
    const formattedPeriodData: SalesPeriodData[] = periodResult.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.orders,
      avgOrderValue: item.avgOrderValue
    }));

    // Calculate summary
    const summary = {
      totalRevenue: salesData.reduce((sum, item) => sum + item.totalRevenue, 0),
      totalQuantitySold: salesData.reduce((sum, item) => sum + item.totalQuantitySold, 0),
      averageOrderValue: salesData.reduce((sum, item) => sum + item.averagePrice, 0) / salesData.length || 0,
      topSellingProduct: salesData[0]?.productName || 'N/A',
      productsAnalyzed: salesData.length
    };

    const responseData: SalesResponse = {
      salesByProduct: salesData,
      periodData: formattedPeriodData,
      summary,
      filters: {
        period: period as string,
        category: (category as string) || 'all',
        productId: (productId as string) || 'all',
        dateRange: {
          start: (startDate as string) || 'all-time',
          end: (endDate as string) || 'current'
        }
      }
    };

    return res.status(200).json({
      success: true,
      data: responseData,
      message: 'Sales report generated successfully'
    });
  } catch (error) {
    console.error('Sales reports API error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}