import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

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

  // Additional check for admin routes
  if (pathname.startsWith('/admin')) {
    const user = payload as { isAdmin?: boolean; [key: string]: any };
    if (!user.isAdmin) {
      console.log(`Middleware: Non-admin user attempted to access admin path: ${pathname}`);
      return NextResponse.redirect(new URL('/', request.url));
    }
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
