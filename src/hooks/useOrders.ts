// hooks/useOrders.ts
import { useState, useEffect, useCallback } from 'react';
import { orderService } from '@/services/orderService';
import { IOrder, OrderStats, OrderFilters, OrderResponse } from '@/types/order.types';

export interface CreateOrderData {
  userId: string;
  products: {
    productId: string;
    quantity: number;
  }[];
  status?: 'Pending' | 'In Progress' | 'Complete' | 'Returned' | 'Cancelled';
}

export const useOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const fetchOrders = useCallback(async (
    page: number = 1,
    limit: number = 10,
    filters?: OrderFilters
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getOrders(page, limit, filters);
      setOrders(response.orders);
      setPagination({
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderStats = useCallback(async () => {
    try {
      const orderStats = await orderService.getOrderStats();
      setStats(orderStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order stats');
    }
  }, []);

  const updateOrderStatus = useCallback(async (
    orderId: string,
    status: IOrder['status'],
    returnReason?: string
  ) => {
    setLoading(true);
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, status, returnReason);
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? updatedOrder : order
        )
      );
      // Refresh stats after status update
      fetchOrderStats();
      return updatedOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrderStats]);

  const getOrderById = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      const order = await orderService.getOrderById(orderId);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrder = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      await orderService.deleteOrder(orderId);
      setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
      fetchOrderStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrderStats]);

  const createOrder = useCallback(async (orderData: CreateOrderData) => {
    setLoading(true);
    try {
      const newOrder = await orderService.createOrder(orderData);
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      // Refresh stats after creating order
      fetchOrderStats();
      return newOrder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchOrderStats]);

  return {
    orders,
    loading,
    error,
    stats,
    pagination,
    fetchOrders,
    fetchOrderStats,
    createOrder,
    updateOrderStatus,
    getOrderById,
    deleteOrder,
    setError
  };
};