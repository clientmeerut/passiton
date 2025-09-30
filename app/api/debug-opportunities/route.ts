import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';

export async function GET() {
  try {
    await connectToDatabase();

    // Get all opportunities (active and inactive) with debug info
    const allOpportunities = await Opportunity.find({})
      .sort({ createdAt: -1 })
      .lean();

    const activeOpportunities = await Opportunity.find({ active: true })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      debug: {
        totalOpportunities: allOpportunities.length,
        activeOpportunities: activeOpportunities.length,
        inactiveOpportunities: allOpportunities.length - activeOpportunities.length,
        allOpportunities: allOpportunities.map(opp => ({
          id: opp._id,
          title: opp.title,
          company: opp.company,
          type: opp.type,
          active: opp.active,
          createdAt: opp.createdAt
        })),
        sampleOpportunity: allOpportunities[0] || null
      }
    });
  } catch (error) {
    console.error('Debug opportunities error:', error);
    return NextResponse.json(
      { error: 'Failed to debug opportunities', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}