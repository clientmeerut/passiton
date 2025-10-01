import { NextResponse } from 'next/server';

export async function POST() {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== LOGOUT DEBUG ===');
    console.log('Logout request received');
  }

  const res = NextResponse.json({ message: 'Logged out' });

  // Clear the token cookie with the same settings used when setting it
  res.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0), // Expire immediately
    maxAge: 0, // Also set maxAge to 0
  });

  // Try alternative cookie clearing methods as fallback
  res.cookies.delete('token');

  // Also try clearing without specific settings in case domain/path mismatches
  res.cookies.set('token', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  });

  if (process.env.NODE_ENV === 'development') {
    console.log('Cookie cleared with settings:', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
      maxAge: 0,
    });
  }

  return res;
}
