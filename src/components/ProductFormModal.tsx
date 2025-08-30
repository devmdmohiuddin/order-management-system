// components/ProductFormModal.tsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Product } from '@/types/product.types';
import { useProductForm } from '@/hooks/useProducts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: { name: string; price: number; stockCount: number }) => Promise<void>;
  product?: Product | null;
  title: string;
  submitText: string;
  isSubmitting?: boolean;
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  title,
  submitText,
  isSubmitting = false,
}) => {
  const { formData, errors, updateField, validateForm, resetForm } = useProductForm(product || undefined);

  useEffect(() => {
    if (isOpen && product) {
      // Reset form with product data when opening for edit
      resetForm();
    }
  }, [isOpen, product, resetForm]);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      await onSubmit(formData);
      onClose();
      resetForm();
    } catch (error) {
      // Error handling is done in parent component
      console.error(error)
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter product name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.price ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.price}
              onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Stock Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Count *
            </label>
            <input
              type="number"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.stockCount ? 'border-red-300' : 'border-gray-300'
              }`}
              value={formData.stockCount}
              onChange={(e) => updateField('stockCount', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            {errors.stockCount && (
              <p className="mt-1 text-sm text-red-600">{errors.stockCount}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(errors).length > 0 || !formData.name.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : submitText}
          </button>
        </div>
      </div>
    </div>
  );
};