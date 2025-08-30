import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';
import { ApiResponse, UpdateOrderStatusRequest } from '../../../types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'PUT') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  await connectToDatabase();

  try {
    const { orderId, status, returnReason }: UpdateOrderStatusRequest = req.body;
    
    // Validate required fields
    if ((status === 'Returned' || status === 'Cancelled') && !returnReason) {
      return res.status(400).json({
        success: false,
        error: 'Return reason is required for Returned/Cancelled status'
      });
    }

    const currentOrder = await Order.findOne({ orderId });
    if (!currentOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // If changing to Returned/Cancelled, restore stock
    if ((status === 'Returned' || status === 'Cancelled') && 
        !['Returned', 'Cancelled'].includes(currentOrder.status)) {
      
      for (const item of currentOrder.products) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockCount: item.quantity } }
        );
      }
    }

    // Update order status
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status };
    if (returnReason) {
      updateData.returnReason = returnReason;
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'firstName lastName phone');

    return res.status(200).json({
      success: true,
      data: order,
      message: 'Order status updated successfully'
    });

  } 
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  catch (error: any) {
    return res.status(400).json({
      success: false,
      error: error.message || 'Failed to update order status'
    });
  }
}