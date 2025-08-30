// api/products/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { ApiResponse } from '@/types/index'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  await connectToDatabase();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Product ID is required',
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const product = await Product.findById(id);

        if (!product) {
          return res.status(404).json({
            success: false,
            error: 'Product not found',
          });
        }

        return res.status(200).json({
          success: true,
          data: product,
        });
      }

      case 'PUT': {
        const { name, price, stockCount } = req.body;

        // Check if product exists
        const existingProduct = await Product.findById(id);
        if (!existingProduct) {
          return res.status(404).json({
            success: false,
            error: 'Product not found',
          });
        }

        // Check for duplicate name (if name is being updated)
        if (name && name !== existingProduct.name) {
          const duplicateProduct = await Product.findOne({ 
            name, 
            _id: { $ne: id } 
          });
          if (duplicateProduct) {
            return res.status(400).json({
              success: false,
              error: 'Product name already exists',
            });
          }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          { name, price, stockCount },
          { new: true, runValidators: true }
        );

        return res.status(200).json({
          success: true,
          data: updatedProduct,
          message: 'Product updated successfully',
        });
      }

      case 'DELETE': {
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({
            success: false,
            error: 'Product not found',
          });
        }

        await Product.findByIdAndDelete(id);

        return res.status(200).json({
          success: true,
          data: null,
          message: 'Product deleted successfully',
        });
      }

      default: {
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${req.method} not allowed`,
        });
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
   catch (error: any) { 
    console.error('Product API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}