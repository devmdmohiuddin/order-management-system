// src/app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Product from '@/models/Product';
import { ApiResponse } from '@/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse>(
      { success: true, data: product },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = await params;
  const { name, price, stockCount } = await req.json();

  try {
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check duplicate
    if (name && name !== existingProduct.name) {
      const duplicate = await Product.findOne({ name, _id: { $ne: id } });
      if (duplicate) {
        return NextResponse.json<ApiResponse>(
          { success: false, error: 'Product name already exists' },
          { status: 400 }
        );
      }
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { name, price, stockCount },
      { new: true, runValidators: true }
    );

    return NextResponse.json<ApiResponse>(
      { success: true, data: updated, message: 'Product updated successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json<ApiResponse>(
      { success: true, data: null, message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json<ApiResponse>(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
