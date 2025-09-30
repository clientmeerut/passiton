import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Product } from '@/models/Product';

function escapeRegex(text: string) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
}


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const state = searchParams.get('state');
  const city = searchParams.get('city');

  if (!q || typeof q !== "string") {
    return NextResponse.json({ message: 'Missing search term' }, { status: 400 });
  }

  await connectToDatabase();

  try {
    const safeQuery = escapeRegex(q.trim());
    const regex = new RegExp(`.*${safeQuery}.*`, 'i');

    // Build the search filter object
    const searchFilter: any = {
      $or: [
        { title: regex },
        { category: regex },
      ],
    };

    // Add location filters if provided
    if (state && typeof state === "string" && state.trim()) {
      searchFilter.state = state.trim();
    }

    if (city && typeof city === "string" && city.trim()) {
      searchFilter.city = city.trim();
    }

    const products = await Product.find(searchFilter)
      .populate('userId', 'verified')
      .sort({ featured: -1, createdAt: -1 })
      .lean() // Better performance
      .limit(50); // Limit results

    // Handle admin posts - mark them as verified
    const processedProducts = products.map(product => {
      if (product.userId === 'admin') {
        product.userId = { verified: true };
      }
      return product;
    });

    const response = NextResponse.json({ products: processedProducts });

    // Add caching headers for search results
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');

    return response;
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ message: 'Server Error' }, { status: 500 });
  }
}
