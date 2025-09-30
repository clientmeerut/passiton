import { use } from "react";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";

// Helper for colored category badge
const categoryColor = (cat: string) => {
  switch (cat.toLowerCase()) {
    case "books":
      return "bg-[#5B3DF6]/90 text-white";
    case "electronics":
      return "bg-[#FFE158]/90 text-[#23185B]";
    case "furniture":
      return "bg-[#F87171]/90 text-white";
    case "clothing":
      return "bg-[#EC4899]/90 text-white";
    case "stationery":
      return "bg-[#34D399]/90 text-[#23185B]";
    default:
      return "bg-[#38BDF8]/90 text-white";
  }
};

type ProductType = {
  _id: string;
  title: string;
  price: string;
  category: string;
  image: string;
  college: string;
  phone?: string;
  email?: string;
  sold?: boolean;
  userId?: {
    verified?: boolean;
  } | string;
};

async function getProduct(id: string): Promise<ProductType | null> {
  try {
    await connectToDatabase();

    // Validate ObjectId format
    if (!id || id.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return null;
    }

    const product = await Product.findById(id).populate('userId', 'verified').lean();
    return product as ProductType | null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = use(getProduct(id));

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf7ed] flex items-center justify-center">
        <div className="bg-white/90 rounded-2xl px-8 py-12 shadow-xl border border-pink-300 flex flex-col items-center">
          <span className="text-5xl mb-3">😢</span>
          <p className="text-2xl font-bold text-pink-500 mb-1">
            Product Not Found
          </p>
          <p className="text-[#7c689c] text-center">
            Sorry, we couldn&apos;t locate that item.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7ed] flex flex-col items-center justify-center py-10 px-3">
      <div className="w-full max-w-lg bg-white/90 rounded-3xl shadow-2xl border-2 border-[#E0D5FA] p-7 flex flex-col items-center relative">
        {/* Sold badge */}
        {product.sold && (
          <span className="absolute top-5 right-5 flex items-center gap-1 px-4 py-1 rounded-full bg-green-200 text-green-700 font-bold text-xs z-10">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
              <path
                d="M5 13l4 4L19 7"
                stroke="#15803d"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Sold
          </span>
        )}
        <div className="w-full flex flex-col items-center gap-3">
          <div className="w-64 h-64 bg-[#faf7ed] rounded-2xl shadow border-2 border-[#f3e8ff] flex items-center justify-center mb-6 overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="object-contain w-60 h-60 rounded-xl shadow"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#5B3DF6] mb-1 text-center">
            {product.title}
          </h2>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl font-black text-[#22C55E] drop-shadow-sm">
              ₹{product.price}
            </span>
            <span
              className={`${categoryColor(product.category)} px-4 py-1 rounded-full text-xs font-bold capitalize shadow-sm`}
            >
              {product.category}
            </span>
          </div>

          <span className="text-sm text-[#7c689c] mb-2 font-medium">
            Posted from: {product.college}
          </span>

          {/* Verification Badge */}
          {product.userId && typeof product.userId === 'object' && (
            <div className="flex justify-center mb-4">
              {product.userId.verified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700 border border-green-200">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Verified Seller
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Unverified Seller
                </span>
              )}
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="w-full flex flex-col gap-3 mt-4">
          {product.phone && (
            <a
              href={`https://wa.me/91${product.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
              </svg>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-xs opacity-90 font-medium">WhatsApp</span>
                <span className="text-sm sm:text-base font-bold truncate max-w-full">
                  +91 {product.phone}
                </span>
              </div>
            </a>
          )}
          {product.email && (
            <a
              href={`mailto:${product.email}`}
              className="group w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-[#5B3DF6] to-[#7C3AED] text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-300"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <div className="flex flex-col items-start min-w-0">
                <span className="text-xs opacity-90 font-medium">Email</span>
                <span className="text-sm sm:text-base font-bold truncate max-w-full">
                  {product.email}
                </span>
              </div>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
