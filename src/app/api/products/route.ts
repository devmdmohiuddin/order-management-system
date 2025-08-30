import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { ApiResponse, CreateProductRequest } from '@/types/index';
import { MongoServerError } from 'mongodb';

export async function GET() {
  await connectToDatabase();
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return NextResponse.json<ApiResponse>({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to retrieve products'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectToDatabase();
  try {
    const body = await req.json();
    const productData: CreateProductRequest = body;

    const product = new Product(productData);
    await product.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: product,
      message: 'Product created successfully'
    }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Phone number already exists' //TODO: need to see the error msg
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create product'
    }, { status: 400 });
  }
}
