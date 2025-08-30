// components/ProductSearchBar.tsx
import React from 'react';
import { Search, Plus, Filter, X } from 'lucide-react';
import { ProductFilters } from '@/types/product.types';

interface ProductSearchBarProps {
  filters: ProductFilters;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange: (key: keyof ProductFilters, value: any) => void;
  onAddProduct: () => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({
  filters,
  onFilterChange,
  onAddProduct,
  onResetFilters,
  totalResults,
}) => {
  const hasActiveFilters = filters.search || filters.stockStatus !== 'all';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products by name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filters.stockStatus}
              onChange={(e) => onFilterChange('stockStatus', e.target.value)}
            >
              <option value="all">All Products</option>
              <option value="in-stock">In Stock</option>
              <option value="medium-stock">Medium Stock</option>
              <option value="low-stock">Low Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* Sort Options */}
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              onFilterChange('sortBy', sortBy);
              onFilterChange('sortOrder', sortOrder);
            }}
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-desc">Price High-Low</option>
            <option value="price-asc">Price Low-High</option>
            <option value="stockCount-desc">Stock High-Low</option>
            <option value="stockCount-asc">Stock Low-High</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span>Reset</span>
            </button>
          )}

          {/* Add Product Button */}
          <button
            onClick={onAddProduct}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      {/* Results Summary */}
      {(filters.search || hasActiveFilters) && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {totalResults} product{totalResults !== 1 ? 's' : ''}
          {filters.search && (
            <span> for `{filters.search}`</span>
          )}
          {filters.stockStatus !== 'all' && (
            <span> with {filters.stockStatus.replace('-', ' ')} status</span>
          )}
        </div>
      )}
    </div>
  );
};