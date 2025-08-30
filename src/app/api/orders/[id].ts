

// 5. Fixed: /pages/api/orders/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import Order from '../../../models/Order';
import Product from '../../../models/Product';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectToDatabase();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        const order = await Order.findOne({ orderId: id })
          .populate('userId', 'firstName lastName phone email address');
        
        if (!order) {
          return res.status(404).json({ error: 'Order not found' });
        }
        
        return res.status(200).json({
          success: true,
          data: order
        });

      case 'PUT':
        const { status, returnReason } = req.body;
        
        const currentOrder = await Order.findOne({ orderId: id });
        if (!currentOrder) {
          return res.status(404).json({ error: 'Order not found' });
        }

        // Validate return reason for cancelled/returned orders
        if ((status === 'Returned' || status === 'Cancelled') && !returnReason) {
          return res.status(400).json({ 
            error: 'Return reason is required for Returned/Cancelled status' 
          });
        }

        // Handle stock restoration for cancelled/returned orders
        if ((status === 'Returned' || status === 'Cancelled') && 
            !['Returned', 'Cancelled'].includes(currentOrder.status)) {
          
          for (const item of currentOrder.products) {
            await Product.findByIdAndUpdate(
              item.productId,
              { $inc: { stockCount: item.quantity } }
            );
          }
        }

        // Update order
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { status };
        if (returnReason) {
          updateData.returnReason = returnReason;
        }

        const updatedOrder = await Order.findOneAndUpdate(
          { orderId: id },
          updateData,
          { new: true, runValidators: true }
        ).populate('userId', 'firstName lastName phone email address');
        
        return res.status(200).json({
          success: true,
          data: updatedOrder,
          message: 'Order updated successfully'
        });

      case 'DELETE':
        // Only allow deletion of pending orders
        const orderToDelete = await Order.findOne({ orderId: id });
        if (!orderToDelete) {
          return res.status(404).json({ error: 'Order not found' });
        }

        if (orderToDelete.status !== 'Pending') {
          return res.status(400).json({ 
            error: 'Only pending orders can be deleted' 
          });
        }

        // Restore stock
        for (const item of orderToDelete.products) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stockCount: item.quantity } }
          );
        }

        await Order.findOneAndDelete({ orderId: id });
        
        return res.status(200).json({ 
          success: true,
          message: 'Order deleted successfully' 
        });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error('Order API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}