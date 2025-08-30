// hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react';
import { Product, CreateProductRequest, ProductStats, ProductFilters } from '@/types/product.types';
import {productService} from '@/services/productService';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (productData: CreateProductRequest): Promise<boolean> => {
    try {
      setError(null);
      const newProduct = await productService.createProduct(productData);
      setProducts(prev => [newProduct, ...prev]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      return false;
    }
  };

  const updateProduct = async (id: string, productData: Partial<CreateProductRequest>): Promise<boolean> => {
    try {
      setError(null);
      const updatedProduct = await productService.updateProduct(id, productData);
      setProducts(prev => 
        prev.map(product => 
          product._id === id ? updatedProduct : product
        )
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      return false;
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    try {
      setError(null);
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product._id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

// hooks/useProductFilters.ts
export const useProductFilters = (products: Product[]) => {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    stockStatus: 'all',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const filteredProducts = products.filter(product => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!product.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Stock status filter
    if (filters.stockStatus !== 'all') {
      const stockStatus = productService.getStockStatus(product.stockCount).status;
      if (filters.stockStatus !== stockStatus) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    const aValue = a[filters.sortBy];
    const bValue = b[filters.sortBy];
    
    let comparison = 0;
    if (aValue < bValue) comparison = -1;
    if (aValue > bValue) comparison = 1;
    
    return filters.sortOrder === 'desc' ? -comparison : comparison;
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      stockStatus: 'all',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return {
    filters,
    filteredProducts,
    updateFilter,
    resetFilters,
  };
};

// hooks/useProductStats.ts
export const useProductStats = (products: Product[]): ProductStats => {
  return productService.calculateStats(products);
};

// hooks/useProductForm.ts
export const useProductForm = (initialData?: Product) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    price: initialData?.price || 0,
    stockCount: initialData?.stockCount || 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (formData.stockCount < 0) {
      newErrors.stockCount = 'Stock count cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: initialData?.name || '',
      price: initialData?.price || 0,
      stockCount: initialData?.stockCount || 0,
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0 && formData.name.trim() && formData.price > 0,
  };
};