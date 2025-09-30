import Link from 'next/link';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface Props {
  product: {
    _id: string;
    title: string;
    image: string;
    price: string;
    college: string;
    category: string;
    email?: string;
    phone?: string;
    sold?: boolean;
    featured?: boolean;
    userId?: {
      verified?: boolean;
    } | string;
  };
}

// Helper for colored category badge
const categoryColor = (cat: string) => {
  switch (cat.toLowerCase()) {
    case 'books': return 'bg-[#5B3DF6]/90 text-white';
    case 'electronics': return 'bg-[#FFE158]/90 text-[#23185B]';
    case 'furniture': return 'bg-[#F87171]/90 text-white';
    case 'clothing': return 'bg-[#EC4899]/90 text-white';
    case 'stationery': return 'bg-[#34D399]/90 text-[#23185B]';
    default: return 'bg-[#38BDF8]/90 text-white';
  }
};

const ProductCard = memo(function ProductCard({ product }: Props) {
  //console.log(product); // Debug: show product details
  return (
    //<div style={{display: 'none'}}>{JSON.stringify(product)}</div>
    <Link href={`/product/${product._id}`} prefetch={false}>
      <motion.div
        whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(120,80,210,0.10)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 18 }}
        className={`relative rounded-3xl shadow-xl border-2 pb-5 overflow-hidden cursor-pointer transition-all group ${
          product.featured
            ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-[#FFE158] shadow-yellow-200'
            : 'bg-white border-[#E0D5FA]'
        }`}
        style={{
          minHeight: 380
        }}
      >
        {product.featured && (
          <motion.span
            className="absolute top-4 left-4 flex items-center gap-1 px-3 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xs z-10 shadow-lg border-2 border-yellow-300"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-shadow">FEATURED</span>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="animate-pulse">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </motion.span>
        )}
        {product.sold && (
          <span className={`absolute top-4 ${product.featured ? 'right-4' : 'right-4'} flex items-center gap-1 px-3 py-1 rounded-full bg-green-200 text-green-700 font-bold text-xs z-10`}>
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
        <div className="px-4 pt-4">
          <div className={`w-full h-44 flex justify-center items-center rounded-2xl relative overflow-hidden shadow-md border-2 ${
            product.featured
              ? 'bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-300'
              : 'bg-[#faf7ed] border-[#f3e8ff]'
          }`}>
            {product.featured && (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 animate-pulse"></div>
            )}
            <img
              src={product.image}
              alt={product.title}
              loading="lazy"
              decoding="async"
              className="object-contain h-40 w-40 rounded-xl transition-all duration-300 group-hover:opacity-90 relative z-10"
              style={{ contentVisibility: 'auto' }}
            />
          </div>
        </div>
        <div className="px-5 pt-4 space-y-2">
          <h3 className="text-lg font-bold text-[#23185B] truncate">{product.title}</h3>
          <p className="text-sm text-[#6C4AB6] truncate">{product.college}</p>
        </div>
        <div className="px-5 pt-2 pb-1 flex flex-row items-center gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-semibold capitalize shadow-sm {categoryColor(product.category)} {categoryColor(product.category)}"
                style={{background: undefined, color: undefined}}>
            <span className={`${categoryColor(product.category)} px-3 py-1 rounded-full`}>
              {product.category}
            </span>
          </span>
          <span className="ml-auto text-xl font-black text-[#22C55E] tracking-wide drop-shadow-sm">
            ₹{product.price}
          </span>
        </div>
        <div className="px-5 flex flex-col gap-1 mt-3">
          {/* Verification Badge */}
          {product.userId && typeof product.userId === 'object' && (
            <div className="flex items-center gap-1 mb-1">
              {product.userId.verified ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                  Verified Seller
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Unverified Seller
                </span>
              )}
            </div>
          )}

          {/* Contact */}
          {product.phone && (
            <p className="flex items-center gap-1 text-sm text-black font-semibold truncate">📞 {product.phone}</p>
          )}
          {product.email && (
            <p className="flex items-center gap-1 text-sm text-[#5B3DF6] font-semibold break-all">
              ✉️ <span className="underline">{product.email}</span>
            </p>
          )}
        </div>
      </motion.div>
    </Link>
  );
});

export { ProductCard };
