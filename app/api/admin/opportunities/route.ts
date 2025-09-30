import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
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

export async function GET(req: NextRequest) {
  // Verify admin access
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status'); // 'active', 'inactive', or null for all
    const type = searchParams.get('type'); // opportunity type filter

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    if (status === 'active') filter.active = true;
    if (status === 'inactive') filter.active = false;
    if (type) filter.type = type;

    // Get opportunities with pagination
    const opportunities = await Opportunity.find(filter)
      .populate('userId', 'fullName email')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Opportunity.countDocuments(filter);

    return NextResponse.json({
      success: true,
      opportunities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin opportunities error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  // Verify admin access
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { opportunityId, updates } = await req.json();

    const opportunity = await Opportunity.findByIdAndUpdate(
      opportunityId,
      updates,
      { new: true }
    );

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      opportunity
    });
  } catch (error) {
    console.error('Admin opportunity update error:', error);
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  // Verify admin access
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const opportunityId = searchParams.get('id');

    if (!opportunityId) {
      return NextResponse.json({ error: 'Opportunity ID required' }, { status: 400 });
    }

    const deletedOpportunity = await Opportunity.findByIdAndDelete(opportunityId);

    if (!deletedOpportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Opportunity deleted successfully'
    });
  } catch (error) {
    console.error('Admin opportunity delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    );
  }
}