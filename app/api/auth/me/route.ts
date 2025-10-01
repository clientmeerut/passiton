import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  // Enhanced debugging
  console.log('=== AUTH DEBUG ===');
  console.log('Token exists:', !!token);
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Request URL:', req.url);
  console.log('All cookies:', req.cookies.getAll());

  if (!token) {
    console.log('Auth check: No token found in cookies');
    return NextResponse.json({ loggedIn: false, debug: 'no_token' });
  }

  try {
    console.log('Attempting JWT verification...');
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as any;
    console.log('JWT decoded successfully:', { userId: decoded._id || decoded.userId, isAdmin: decoded.isAdmin });

    // Handle admin token
    if (decoded.isAdmin && decoded.userId === 'admin') {
      return NextResponse.json({
        loggedIn: true,
        isAdmin: true,
        user: {
          userId: 'admin',
          email: 'admin',
          username: 'admin',
          fullName: 'Administrator',
          isAdmin: true
        },
      });
    }

    const userId = decoded._id || decoded.userId;

    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      console.log('Auth check: User not found in database for userId:', userId);
      return NextResponse.json({ loggedIn: false, debug: 'user_not_found' });
    }

    console.log('User found successfully:', user.email);

    return NextResponse.json({
      loggedIn: true,
      isAdmin: false,
      user: {
        userId: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        collegeIdUrl: user.collegeIdUrl,
        verified: user.verified,
        collegeName: user.collegeName,
        mobile: user.mobile,
      },
    });
  } catch (error) {
    console.log('Auth check: JWT verification failed:', error);
    console.log('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ loggedIn: false, debug: 'jwt_verification_failed', error: error instanceof Error ? error.message : 'Unknown error' });
  }
}
