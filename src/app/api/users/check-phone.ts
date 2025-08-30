import type { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';
import { ApiResponse } from './../../../types/index';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await connectToDatabase();

  try {
    const { phone } = req.body;
    const user = await User.findOne({ phone });
    
    return res.status(200).json({
      success: true,
      data: {
        exists: !!user,
        user: user || null
      }
    });
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      error: 'Failed to check phone number'
    });
  }
}