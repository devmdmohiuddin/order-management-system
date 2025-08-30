"use client";
// pages/ProductManagement.tsx
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Product } from '@/types/product.types';
import { useProducts, useProductFilters, useProductStats } from '@/hooks/useProducts';
import { ProductStatsCards } from '@/components/ProductStatsCards';
import { ProductSearchBar } from '@/components/ProductSearchBar';
import { ProductTable } from '@/components/ProductTable';
import { ProductFormModal } from '@/components/ProductFormModal';

const ProductManagement: React.FC = () => {
  const {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const { filters, filteredProducts, updateFilter, resetFilters } = useProductFilters(products);
  const stats = useProductStats(products);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle create product
  const handleCreateProduct = async (formData: { name: string; price: number; stockCount: number }) => {
    setIsSubmitting(true);
    try {
      const success = await createProduct(formData);
      if (success) {
        toast.success('Product created successfully!');
        setShowAddModal(false);
      } else {
        toast.error('Failed to create product. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update product
  const handleUpdateProduct = async (formData: { name: string; price: number; stockCount: number }) => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    try {
      const success = await updateProduct(selectedProduct._id, formData);
      if (success) {
        toast.success('Product updated successfully!');
        setShowEditModal(false);
        setSelectedProduct(null);
      } else {
        toast.error('Failed to update product. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async (product: Product) => {
    try {
      const success = await deleteProduct(product._id);
      if (success) {
        toast.success(`Product "${product.name}" deleted successfully!`);
      } else {
        toast.error('Failed to delete product. Please try again.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred.');
    }
  };

  // Handle edit click
  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // Handle add click
  const handleAddClick = () => {
    setSelectedProduct(null);
    setShowAddModal(true);
  };

  // Handle modal close
  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Management
          </h1>
          <p className="text-gray-600">
            Manage your product inventory, track stock levels, and monitor product performance.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading products
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <ProductStatsCards stats={stats} loading={loading} />

        {/* Search and Filters */}
        <ProductSearchBar
          filters={filters}
          onFilterChange={updateFilter}
          onAddProduct={handleAddClick}
          onResetFilters={resetFilters}
          totalResults={filteredProducts.length}
        />

        {/* Products Table */}
        <ProductTable
          products={filteredProducts}
          loading={loading}
          onEdit={handleEditClick}
          onDelete={handleDeleteProduct}
        />

        {/* Add Product Modal */}
        <ProductFormModal
          isOpen={showAddModal}
          onClose={handleCloseModals}
          onSubmit={handleCreateProduct}
          title="Add New Product"
          submitText="Add Product"
          isSubmitting={isSubmitting}
        />

        {/* Edit Product Modal */}
        <ProductFormModal
          isOpen={showEditModal}
          onClose={handleCloseModals}
          onSubmit={handleUpdateProduct}
          product={selectedProduct}
          title="Edit Product"
          submitText="Update Product"
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ProductManagement;