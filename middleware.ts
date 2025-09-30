import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key';

async function verifyJWT(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.log('JWT verification failed:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Only protect specific admin and dashboard routes
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/list-opportunity');

  // Skip middleware for non-protected paths
  if (!isProtectedPath) {
    return NextResponse.next();
  }

  // For protected paths, check authentication
  if (!token) {
    console.log(`Middleware: No token found for protected path: ${pathname}`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    console.log(`Middleware: Invalid token for protected path: ${pathname}`);
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/list-opportunity/:path*'
  ],
};
