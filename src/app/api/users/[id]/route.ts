import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectToDatabase } from "@/lib/mongodb";

// GET /api/users/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve user" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = await params;
  const updateData = await req.json();

  try {
    // check duplicate phone
    if (updateData.phone) {
      const existingUser = await User.findOne({
        phone: updateData.phone,
        _id: { $ne: id },
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: "Phone number already exists" },
          { status: 400 }
        );
      }
    }

    const user = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, data: user, message: "User updated successfully" },
      { status: 200 }
    );
  } 
  catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 400 }
    );
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { success: true, message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
