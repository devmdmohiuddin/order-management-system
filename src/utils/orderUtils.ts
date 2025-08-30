// utils/orderUtils.ts (Utility Functions)
import { IOrder, OrderStats } from '@/types/order.types'

export const calculateOrderStats = (orders: IOrder[]): OrderStats => {
  return orders.reduce(
    (stats, order) => {
      stats.total++;
      switch (order.status) {
        case 'Pending':
          stats.pending++;
          break;
        case 'In Progress':
          stats.inProgress++;
          break;
        case 'Complete':
          stats.completed++;
          break;
        case 'Returned':
          stats.returned++;
          break;
        case 'Cancelled':
          stats.cancelled++;
          break;
      }
      return stats;
    },
    {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      returned: 0,
      cancelled: 0
    }
  );
};

export const formatOrderStatus = (status: string): string => {
  return status.replace(/([A-Z])/g, ' $1').trim();
};

export const getOrderStatusColor = (status: string): string => {
  const colors = {
    'Pending': 'yellow',
    'In Progress': 'blue',
    'Complete': 'green',
    'Returned': 'orange',
    'Cancelled': 'red'
  };
  return colors[status as keyof typeof colors] || 'gray';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateOrderFilters = (filters: any): boolean => {
  // Validate date ranges
  if (filters.startDate && filters.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    if (start > end) return false;
  }
  
  // Validate amount ranges
  if (filters.minAmount && filters.maxAmount) {
    if (parseFloat(filters.minAmount) > parseFloat(filters.maxAmount)) return false;
  }
  
  // Validate status
  if (filters.status) {
    const validStatuses = ['Pending', 'In Progress', 'Complete', 'Returned', 'Cancelled'];
    if (!validStatuses.includes(filters.status)) return false;
  }
  
  return true;
};