import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import Product from '../../../models/Product';
import { ApiResponse, CreateProductRequest } from '../../../types';
import { MongoServerError } from 'mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  await connectToDatabase();

  switch (req.method) {
    case 'GET':
      try {
        const products = await Product.find({}).sort({ createdAt: -1 });
        return res.status(200).json({
          success: true,
          data: products,
          message: 'Products retrieved successfully'
        });
      } catch (error) {
        console.error(error)
        return res.status(500).json({
          success: false,
          error: 'Failed to retrieve products'
        });
      }

    case 'POST':
      try {
        const productData: CreateProductRequest = req.body;
        const product = new Product(productData);
        await product.save();
        
        return res.status(201).json({
          success: true,
          data: product,
          message: 'Product created successfully'
        });
      } catch (error: unknown) {
        if (error instanceof MongoServerError && error.code === 11000) {
            return res.status(400).json({
              success: false,
              error: 'Phone number already exists'
            });
          }
        return res.status(400).json({
          success: false,
          error: 'Failed to create product'
        });
      }

    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
  }
}