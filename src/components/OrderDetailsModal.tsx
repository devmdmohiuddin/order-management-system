// components/OrderDetailsModal.tsx (Order Details Modal Component)
import React from 'react';
import { IOrder } from '../types/order.types';

interface OrderDetailsModalProps {
  order: IOrder | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Order ID</dt>
                  <dd className="text-sm text-gray-900">{order.orderId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                  <dd className="text-sm text-gray-900">{order.userId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Complete' ? 'bg-green-100 text-green-800' :
                      order.status === 'Returned' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                  <dd className="text-sm text-gray-900 font-semibold">{formatCurrency(order.totalAmount)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="text-sm text-gray-900">{formatDate(order.createdAt)}</dd>
                </div>
                {order.returnReason && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Return Reason</dt>
                    <dd className="text-sm text-gray-900">{order.returnReason}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Products</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price at Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 text-sm text-gray-900">{product.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{product.quantity}</td>
                      <td className="px-4 py-4 text-sm text-gray-500">{formatCurrency(product.priceAtOrder)}</td>
                      <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                        {formatCurrency(product.priceAtOrder * product.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;