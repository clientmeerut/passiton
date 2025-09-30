import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
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

  // If admin user, return admin's featured opportunities
  const opportunities = await Opportunity.find({ userId }).sort({ featured: -1, createdAt: -1 }).lean();
  return NextResponse.json({ opportunities });
}