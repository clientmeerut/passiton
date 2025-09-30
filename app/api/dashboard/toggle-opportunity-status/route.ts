import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let userId = '';
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    userId = decoded.userId;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // If admin user, they shouldn't be able to toggle opportunities via this endpoint
  if (userId === 'admin') {
    return NextResponse.json({ error: 'Admin users should use admin APIs' }, { status: 403 });
  }

  const { opportunityId, active } = await req.json();
  const opportunity = await Opportunity.findOne({ _id: opportunityId, userId });
  if (!opportunity) return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });

  opportunity.active = active;
  await opportunity.save();

  return NextResponse.json({ success: true });
}