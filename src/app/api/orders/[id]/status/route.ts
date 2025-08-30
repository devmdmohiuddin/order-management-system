// api/orders/[id]/status/route.ts (PATCH - Update Order Status)
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { status, returnReason } = await request.json();
    
    // Validate status
    const validStatuses = ['Pending', 'In Progress', 'Complete', 'Returned', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Validate return reason for returned/cancelled orders
    if (['Returned', 'Cancelled'].includes(status) && !returnReason) {
      return NextResponse.json(
        { message: 'Return reason is required for returned/cancelled orders' },
        { status: 400 }
      );
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { status };
    if (returnReason) {
      updateData.returnReason = returnReason;
    }
    
    const order = await Order.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email');
    
    if (!order) {
      return NextResponse.json(
        { message: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { message: 'Failed to update order status' },
      { status: 500 }
    );
  }
}