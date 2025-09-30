import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { College } from '@/models/College';

// Test endpoint to see what colleges are in the database
export async function GET() {
  try {
    await connectToDatabase();

    const allColleges = await College.find({})
      .select('name addedBy verified usageCount createdAt')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const stats = {
      total: await College.countDocuments({}),
      verified: await College.countDocuments({ verified: true }),
      unverified: await College.countDocuments({ verified: false })
    };

    return NextResponse.json({
      colleges: allColleges,
      stats,
      message: 'Recent colleges in database'
    });
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch colleges' },
      { status: 500 }
    );
  }
}