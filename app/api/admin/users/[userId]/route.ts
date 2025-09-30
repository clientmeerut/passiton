import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { Opportunity } from '@/models/Opportunity';
import jwt from 'jsonwebtoken';

// Helper function to verify admin access
async function verifyAdmin(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return decoded.isAdmin && decoded.userId === 'admin';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  // Verify admin access
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { userId } = await params;

    // Get user details
    const user = await User.findById(userId).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's products
    const products = await Product.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get user's opportunities
    const opportunities = await Opportunity.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Get statistics
    const stats = {
      totalProducts: products.length,
      soldProducts: products.filter(p => p.sold).length,
      activeProducts: products.filter(p => !p.sold).length,
      totalOpportunities: opportunities.length,
      activeOpportunities: opportunities.filter(o => o.active).length,
      inactiveOpportunities: opportunities.filter(o => !o.active).length,
    };

    return NextResponse.json({
      success: true,
      user,
      products,
      opportunities,
      stats
    });
  } catch (error) {
    console.error('Admin user details error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user details' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  // Verify admin access
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { userId } = await params;
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'product' or 'opportunity'
    const itemId = searchParams.get('itemId');

    if (!type || !itemId) {
      return NextResponse.json({ error: 'Type and itemId required' }, { status: 400 });
    }

    let deletedItem;
    if (type === 'product') {
      // Verify the product belongs to this user
      deletedItem = await Product.findOneAndDelete({ _id: itemId, userId });
    } else if (type === 'opportunity') {
      // Verify the opportunity belongs to this user
      deletedItem = await Opportunity.findOneAndDelete({ _id: itemId, userId });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    if (!deletedItem) {
      return NextResponse.json({ error: `${type} not found or doesn't belong to user` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`
    });
  } catch (error) {
    console.error('Admin delete user content error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  // Verify admin access
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { userId } = await params;
    const { verified } = await req.json();

    if (typeof verified !== 'boolean') {
      return NextResponse.json({ error: 'Verified field must be a boolean' }, { status: 400 });
    }

    // Update user verification status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { verified },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin user verification error:', error);
    return NextResponse.json(
      { error: 'Failed to update user verification' },
      { status: 500 }
    );
  }
}