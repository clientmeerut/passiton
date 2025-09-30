import { connectToDatabase } from '@/lib/db';
import { Opportunity } from '@/models/Opportunity';
import { User } from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// 🛡️ In-memory rate limiter
const rateLimitMap = new Map<string, number>(); // userId => timestamp

export async function POST(req: Request) {
  await connectToDatabase();

  const cookieStore = await cookies();
  //@ts-ignore
  const token: string | undefined = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const userId = (payload as any).userId;

  // ✅ Rate limit check (30 sec)
  const now = Date.now();
  const lastRequestTime = rateLimitMap.get(userId);
  if (lastRequestTime && now - lastRequestTime < 30 * 1000) {
    const waitTime = Math.ceil((30 * 1000 - (now - lastRequestTime)) / 1000);
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${waitTime} sec.` },
      { status: 429 }
    );
  }
  rateLimitMap.set(userId, now);

  // Handle admin user specially (admin userId is "admin", not a valid ObjectId)
  let user;
  let userEmail = '';

  if (userId === 'admin') {
    // For admin user, we'll create a mock user object
    user = { _id: 'admin', email: 'admin@passiton.com' };
    userEmail = 'admin@passiton.com';
  } else {
    user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    userEmail = user.email;
  }

  // ✅ Check opportunity count for this user (limit to 10)
  const existingOpportunitiesCount = await Opportunity.countDocuments({ userId });
  if (existingOpportunitiesCount >= 10) {
    return NextResponse.json(
      { error: 'You can only create up to 10 opportunities.' },
      { status: 403 }
    );
  }

  const data = await req.json();
  const {
    title,
    company,
    type,
    location,
    duration,
    salary,
    description,
    requirements,
    tags,
    deadline,
    contactEmail,
    contactPhone
  } = data;

  // ✅ Backend validation
  if (!title || title.trim().length < 3) {
    return NextResponse.json({ error: 'Title must be at least 3 characters long.' }, { status: 400 });
  }

  if (!company || company.trim().length < 2) {
    return NextResponse.json({ error: 'Company name must be at least 2 characters long.' }, { status: 400 });
  }

  if (!type || !['job', 'internship', 'mentor', 'coaching', 'freelance', 'event'].includes(type)) {
    return NextResponse.json({ error: 'Invalid opportunity type.' }, { status: 400 });
  }

  if (!location || location.trim().length < 2) {
    return NextResponse.json({ error: 'Location must be provided.' }, { status: 400 });
  }

  if (!description || description.trim().length < 10) {
    return NextResponse.json({ error: 'Description must be at least 10 characters long.' }, { status: 400 });
  }

  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return NextResponse.json({ error: 'Valid contact email is required.' }, { status: 400 });
  }

  // Parse requirements and tags from comma-separated strings
  const requirementsArray = requirements ? requirements.split(',').map((r: string) => r.trim()).filter(Boolean) : [];
  const tagsArray = tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];

  const opportunity = await Opportunity.create({
    title: title.trim(),
    company: company.trim(),
    type,
    location: location.trim(),
    duration: duration?.trim() || undefined,
    salary: salary?.trim() || undefined,
    description: description.trim(),
    requirements: requirementsArray,
    tags: tagsArray,
    deadline: deadline ? new Date(deadline) : undefined,
    contactEmail: contactEmail.trim(),
    contactPhone: contactPhone?.trim() || undefined,
    userId: userId,
    active: true,
    featured: userId === 'admin'
  });

  return NextResponse.json({ success: true, opportunity });
}

export async function DELETE(req: Request) {
  await connectToDatabase();

  const cookieStore = await cookies();
  //@ts-ignore
  const token: string | undefined = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
  }

  const userId = (payload as any).userId;
  const { searchParams } = new URL(req.url);
  const opportunityId = searchParams.get('id');

  if (!opportunityId) {
    return NextResponse.json({ error: 'Opportunity ID required' }, { status: 400 });
  }

  try {
    // Find and delete the opportunity, ensuring it belongs to the current user
    const deletedOpportunity = await Opportunity.findOneAndDelete({
      _id: opportunityId,
      userId: userId
    });

    if (!deletedOpportunity) {
      return NextResponse.json({ error: 'Opportunity not found or you do not have permission to delete it' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    return NextResponse.json({ error: 'Failed to delete opportunity' }, { status: 500 });
  }
}