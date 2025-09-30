import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    console.log('Auth check: No token found in cookies');
    return NextResponse.json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

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
      return NextResponse.json({ loggedIn: false });
    }

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
    return NextResponse.json({ loggedIn: false });
  }
}
