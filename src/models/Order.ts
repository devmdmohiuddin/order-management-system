// models/Order.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderProduct {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtOrder: number; // Store price at time of order (for historical accuracy)
  name: string; // Store product name at time of order
}

export interface IOrder extends Document {
  orderId: string; // Auto-generated unique ID
  userId: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  status: 'Pending' | 'In Progress' | 'Complete' | 'Returned' | 'Cancelled';
  returnReason?: string;
  totalAmount: number; // Calculated field
  createdAt: Date;
  updatedAt: Date;
}

const OrderProductSchema = new Schema<IOrderProduct>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  priceAtOrder: {
    type: Number,
    required: [true, 'Price at order is required'],
    min: [0, 'Price cannot be negative']
  },
  name: {
    type: String,
    required: [true, 'Product name is required']
  }
}, { _id: false }); // No separate _id for sub-documents

const OrderSchema = new Schema<IOrder>({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  products: {
    type: [OrderProductSchema],
    required: [true, 'At least one product is required'],
    validate: {
      validator: function(v: IOrderProduct[]) {
        return v && v.length > 0;
      },
      message: 'Order must contain at least one product'
    }
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Complete', 'Returned', 'Cancelled'],
    default: 'Pending'
  },
  returnReason: {
    type: String,
    required: function(this: IOrder) {
      return this.status === 'Returned' || this.status === 'Cancelled';
    },
    trim: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate orderId
OrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderId = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  
  // Calculate total amount
  this.totalAmount = this.products.reduce((total, product) => {
    return total + (product.priceAtOrder * product.quantity);
  }, 0);
  
  next();
});

// Indexes for performance
OrderSchema.index({ orderId: 1 }); // Unique index
OrderSchema.index({ userId: 1 }); // For user's orders
OrderSchema.index({ status: 1 }); // For filtering by status
OrderSchema.index({ createdAt: -1 }); // For sorting by date
OrderSchema.index({ 'products.productId': 1 }); // For product sales reports

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);