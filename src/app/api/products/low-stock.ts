// 3. Fixed: /pages/api/products/low-stock.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';

interface LowStockProduct {
  _id: string;
  name: string;
  currentStock: number;
  price: number;
  createdAt: Date;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  }

  await connectToDatabase();

  try {
    const { threshold = 10 } = req.query;
    
    const lowStockProducts = await Product.find({
      stockCount: { $lte: Number(threshold) }
    }).sort({ stockCount: 1 }); // Sort by lowest stock first

    const formattedProducts: LowStockProduct[] = lowStockProducts.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      currentStock: product.stockCount,
      price: product.price,
      createdAt: product.createdAt
    }));

    return res.status(200).json({
      products: formattedProducts,
      count: formattedProducts.length,
      threshold: Number(threshold)
    });
  } catch (error) {
    console.error('Low stock API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}