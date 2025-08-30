import { NextResponse } from 'next/server';
import { MongoServerError } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { ApiResponse, CreateUserRequest } from '@/types';

export async function GET() {
  await connectToDatabase();
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return NextResponse.json<ApiResponse>({
      success: true,
      data: users,
      message: 'Users retrieved successfully'
    }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to retrieve users'
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const userData: CreateUserRequest = await req.json();

    // Check if phone already exists
    const existingUser = await User.findOne({ phone: userData.phone });
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Phone number already exists'
      }, { status: 400 });
    }

    const user = new User(userData);
    await user.save();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: user,
      message: 'User created successfully'
    }, { status: 201 });

  } catch (error: unknown) {
    if (error instanceof MongoServerError && error.code === 11000) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Phone number already exists'
      }, { status: 400 });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to create user'
    }, { status: 400 });
  }
}
