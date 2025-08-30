// types/index.ts

// API Response Types

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}


// User Types
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  address: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {
  id: string;
}

// Product Types
export interface CreateProductRequest {
  name: string;
  price: number;
  stockCount: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

// Order Types
export interface CreateOrderProduct {
  productId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  phone: string; // User's phone (will create if doesn't exist)
  userDetails?: CreateUserRequest; // If user doesn't exist
  products: CreateOrderProduct[];
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: 'Pending' | 'In Progress' | 'Complete' | 'Returned' | 'Cancelled';
  returnReason?: string;
}

// Dashboard Types
export interface DashboardStats {
  pendingOrders: number;
  inProgressOrders: number;
  totalUsers: number;
  totalProducts: number;
  lowStockProducts: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export interface ProductSalesReport {
  productId: string;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  salesByMonth: { month: string; quantity: number; revenue: number; }[];
}

export interface RepeatCustomer {
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  orderCount: number;
  totalSpent: number;
}