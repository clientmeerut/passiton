import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  // Validate required environment variables
  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const { email, password } = await req.json();

  // Validate input
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
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

  await connectToDatabase();
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
