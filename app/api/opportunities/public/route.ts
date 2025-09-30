import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch all active opportunities, sorted by featured first, then by creation date
    const opportunities = await Opportunity.find({ active: true })
      .populate('userId', 'name email verified') // Include verification status
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    // Handle admin posts - mark them as verified
    const processedOpportunities = opportunities.map(opportunity => {
      if (opportunity.userId === 'admin') {
        opportunity.userId = { verified: true };
      }
      return opportunity;
    });

    return NextResponse.json({
      success: true,
      opportunities: processedOpportunities || []
    });
  } catch (error) {
    console.error('Error fetching public opportunities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    );
  }
}