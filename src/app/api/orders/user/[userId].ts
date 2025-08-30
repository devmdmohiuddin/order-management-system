// 4. Fixed: /pages/api/orders/user/[userId].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../lib/mongodb';
import Order from '../../../../models/Order';
import { ApiResponse } from '../../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  await connectToDatabase();

  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const { page = 1, limit = 10, status } = req.query;
    
    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('userId', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip(skip),
      Order.countDocuments(query)
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('User orders API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}