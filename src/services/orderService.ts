// services/orderService.ts
import { IOrder, OrderStats, OrderFilters, OrderResponse } from '@/types/order.types';

const API_BASE_URL = '/api';

class OrderService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  async getOrders(
    page: number = 1,
    limit: number = 10,
    filters?: OrderFilters
  ): Promise<OrderResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.startDate && { startDate: filters.startDate }),
      ...(filters?.endDate && { endDate: filters.endDate }),
      ...(filters?.minAmount && { minAmount: filters.minAmount.toString() }),
      ...(filters?.maxAmount && { maxAmount: filters.maxAmount.toString() }),
      ...(filters?.search && { search: filters.search })
    });

    const response = await fetch(`${API_BASE_URL}/orders?${queryParams}`);
    return this.handleResponse<OrderResponse>(response);
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
    return this.handleResponse<IOrder>(response);
  }

  async getOrderStats(): Promise<OrderStats> {
    const response = await fetch(`${API_BASE_URL}/orders/stats`);
    return this.handleResponse<OrderStats>(response);
  }

  async updateOrderStatus(
    orderId: string,
    status: IOrder['status'],
    returnReason?: string
  ): Promise<IOrder> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, returnReason })
    });
    return this.handleResponse<IOrder>(response);
  }

  async deleteOrder(orderId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      throw new Error(`Failed to delete order: ${response.status}`);
    }
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<OrderResponse> {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/users/${userId}/orders?${queryParams}`);
    return this.handleResponse<OrderResponse>(response);
  }

  async createOrder(orderData: CreateOrderData): Promise<IOrder> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });
    return this.handleResponse<IOrder>(response);
  }

  async getUsers(): Promise<{ _id: string; name: string; email: string }[]> {
    const response = await fetch(`${API_BASE_URL}/users`);
    return this.handleResponse<{ _id: string; name: string; email: string }[]>(response);
  }

  async getProducts(): Promise<{ _id: string; name: string; price: number; stock: number }[]> {
    const response = await fetch(`${API_BASE_URL}/products`);
    return this.handleResponse<{ _id: string; name: string; price: number; stock: number }[]>(response);
  }
}

export const orderService = new OrderService();