import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';
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

  // ✅ Check product count for this user
  const existingProductsCount = await Product.countDocuments({ userId });
  if (existingProductsCount >= 20) {
    return NextResponse.json(
      { error: 'You can only upload up to 20 products.' },
      { status: 403 }
    );
  }

  const data = await req.json();
  const { title, price, category, image, phone, college, state, city } = data;

  // ✅ Backend validation
  if (!title || title.trim().length < 3) {
    return NextResponse.json({ error: 'Title must be at least 3 characters long.' }, { status: 400 });
  }

  const numericPrice = parseInt(price);
  if (isNaN(numericPrice) || numericPrice < 10 || numericPrice > 50000) {
    return NextResponse.json({ error: 'Price must be between ₹10 and ₹50,000.' }, { status: 400 });
  }

  if (!/^\d{10}$/.test(phone)) {
    return NextResponse.json({ error: 'Phone number must be 10 digits.' }, { status: 400 });
  }

  if (!category || !image || !college || !state || !city) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }

  const product = await Product.create({
    title: title.trim(),
    price: numericPrice,
    category,
    image,
    phone,
    college,
    state,
    city,
    email: userEmail,
    userId: userId,
    featured: userId === 'admin',
  });

  return NextResponse.json({ success: true, product });
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
  const productId = searchParams.get('id');

  if (!productId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
  }

  try {
    // Find and delete the product, ensuring it belongs to the current user
    const deletedProduct = await Product.findOneAndDelete({
      _id: productId,
      userId: userId
    });

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found or you do not have permission to delete it' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
