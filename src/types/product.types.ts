// types/product.ts
export interface Product {
  _id: string;
  name: string;
  price: number;
  stockCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  stockCount: number;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface ProductFormData {
  name: string;
  price: number;
  stockCount: number;
}

export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface ProductFilters {
  search: string;
  stockStatus: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy: 'name' | 'price' | 'stockCount' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface StockStatus {
  status: 'out-of-stock' | 'low-stock' | 'medium-stock' | 'in-stock';
  color: string;
  text: string;
}