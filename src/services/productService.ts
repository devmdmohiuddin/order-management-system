// services/productService.ts
import { Product, CreateProductRequest, UpdateProductRequest, ProductStats } from '@/types/product.types';
import { ApiResponse } from '@/types';

class ProductService {
  private baseUrl = '/api/products';

  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(this.baseUrl);
      const data: ApiResponse<Product[]> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }
      
      return data.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  // Get single product by ID
  async getProduct(id: string): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      const data: ApiResponse<Product> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch product');
      }
      
      if (!data.data) {
        throw new Error('Product not found');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Create new product
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data: ApiResponse<Product> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create product');
      }
      
      if (!data.data) {
        throw new Error('No product data returned');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Update product
  async updateProduct(id: string, productData: Partial<UpdateProductRequest>): Promise<Product> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      
      const data: ApiResponse<Product> = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update product');
      }
      
      if (!data.data) {
        throw new Error('No product data returned');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
      });
      
      const data: ApiResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Get low stock products
  async getLowStockProducts(threshold: number = 10): Promise<Product[]> {
    try {
      const response = await fetch(`/api/products/low-stock?threshold=${threshold}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch low stock products');
      }
      
      return data.products || [];
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      throw error;
    }
  }

  // Calculate product statistics
  calculateStats(products: Product[]): ProductStats {
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, product) => 
      sum + (product.price * product.stockCount), 0
    );
    const lowStockCount = products.filter(p => p.stockCount > 0 && p.stockCount <= 5).length;
    const outOfStockCount = products.filter(p => p.stockCount === 0).length;

    return {
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
    };
  }

  // Get stock status
  getStockStatus(stockCount: number): {
    status: 'out-of-stock' | 'low-stock' | 'medium-stock' | 'in-stock';
    color: string;
    text: string;
  } {
    if (stockCount === 0) {
      return { 
        status: 'out-of-stock', 
        color: 'text-red-600 bg-red-100', 
        text: 'Out of Stock' 
      };
    }
    if (stockCount <= 5) {
      return { 
        status: 'low-stock', 
        color: 'text-yellow-600 bg-yellow-100', 
        text: 'Low Stock' 
      };
    }
    if (stockCount <= 10) {
      return { 
        status: 'medium-stock', 
        color: 'text-orange-600 bg-orange-100', 
        text: 'Medium Stock' 
      };
    }
    return { 
      status: 'in-stock', 
      color: 'text-green-600 bg-green-100', 
      text: 'In Stock' 
    };
  }
}

export const productService = new ProductService();