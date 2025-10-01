import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import { rateLimit } from '@/lib/rate-limit';
import { validateEnvironment } from '@/lib/env';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(req, 5, 15 * 60 * 1000); // 5 attempts per 15 minutes
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Validate environment
  try {
    validateEnvironment();
  } catch (error) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const { email, password } = await req.json();

  // Validate input
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Check for admin credentials from environment variables
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD &&
      email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const adminToken = await new SignJWT({
      userId: 'admin',
      email: 'admin',
      fullName: 'Administrator',
      username: 'admin',
      isAdmin: true
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);
    const res = NextResponse.json({ success: true, isAdmin: true });
    res.cookies.set({
      name: 'token',
      value: adminToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  }

  try {
    await connectToDatabase();
  } catch (dbError) {
    return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const token = await new SignJWT({
    _id: user._id,
    userId: user._id,
    email: user.email,
    fullName: user.fullName,
    username: user.username,
    isAdmin: false
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);
  const res = NextResponse.json({ success: true, isAdmin: false });
  res.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
