import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rate-limit';
import { validateEnvironment } from '@/lib/env';

export async function POST(req: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(req, 3, 60 * 60 * 1000); // 3 signups per hour
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429 }
    );
  }

  // Validate environment
  try {
    validateEnvironment();
  } catch (error) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  await connectToDatabase();
  const { email, username, password, fullName, collegeIdUrl } = await req.json();

  // Validate input
  if (!email || !password || !username || !fullName) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
  }

  // Password strength validation
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  try {
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const existingUsernameUser = await User.findOne({ username });
    if (existingUsernameUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
    }

    const user = await User.create({
      email,
      username,
      password: hashed,
      fullName,
      collegeIdUrl,
      verified: false,
    });

    // ✅ Create JWT token and set cookie
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

    const res = NextResponse.json({ message: 'User created', user });

    res.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
