// types/order.types.ts
export interface IOrderProduct {
  productId: string;
  quantity: number;
  priceAtOrder: number;
  name: string;
}

export interface IOrder {
  _id: string;
  orderId: string;
  userId: string;
  products: IOrderProduct[];
  status: 'Pending' | 'In Progress' | 'Complete' | 'Returned' | 'Cancelled';
  returnReason?: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  pending: number;
  inProgress: number;
  completed: number;
  returned: number;
  cancelled: number;
  total: number;
}

export interface OrderFilters {
  status?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface OrderResponse {
  orders: IOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}