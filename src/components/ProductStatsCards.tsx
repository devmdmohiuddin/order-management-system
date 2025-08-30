// components/ProductStatsCards.tsx
import React from 'react';
import { Package, DollarSign, AlertTriangle, Box } from 'lucide-react';
import { ProductStats } from '@/types/product.types';

interface ProductStatsCardsProps {
  stats: ProductStats;
  loading?: boolean;
}

export const ProductStatsCards: React.FC<ProductStatsCardsProps> = ({
  stats,
  loading = false,
}) => {
  const cards = [
    {
      title: 'Total Products',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Inventory Value',
      value: `$${stats.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount.toLocaleString(),
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Out of Stock',
      value: stats.outOfStockCount.toLocaleString(),
      icon: Box,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${card.bgColor}`}>
                <Icon className={`h-6 w-6 ${card.iconColor}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};