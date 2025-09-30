import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const parts = url.pathname.split("/");
    const category = decodeURIComponent(parts[parts.length - 1] || "").trim();

    if (!category) {
      return NextResponse.json({ error: "Category missing" }, { status: 400 });
    }

    const products = await Product.find({
      category: { $regex: new RegExp(`^${category}$`, "i") },
    })
      .populate('userId', 'verified')
      .select("title image price college category email phone sold featured userId")
      .sort({ featured: -1, createdAt: -1 })
      .lean() // Use lean() for better performance
      .limit(50); // Limit results to prevent huge payloads

    // Handle admin posts - mark them as verified
    const processedProducts = products.map(product => {
      if (product.userId === 'admin') {
        product.userId = { verified: true };
      }
      return product;
    });

    const response = NextResponse.json({ products: processedProducts });

    // Add caching headers
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return response;
  } catch (err) {
    //console.error('Error fetching products:', err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
