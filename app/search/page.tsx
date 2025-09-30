// app/search/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getStates, getCitiesByState } from '@/utils/indianStatesAndCities';

interface Product {
  _id: string;
  title: string;
  image: string;
  price: number;
  college: string;
  category: string;
  state?: string;
  city?: string;
  userId?: {
    verified?: boolean;
  } | string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q')?.trim() || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchProducts = async () => {
    if (!query) {
      setLoading(false);
      return;
    }

    try {
      let url = `/api/search?q=${encodeURIComponent(query)}`;
      if (selectedState) url += `&state=${encodeURIComponent(selectedState)}`;
      if (selectedCity) url += `&city=${encodeURIComponent(selectedCity)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const fetchedProducts = data.products || [];
      setAllProducts(fetchedProducts);
      setProducts(fetchedProducts);
    } catch (err) {
      console.error('🔴 Error fetching products:', err);
      setError('Something went wrong while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [query, selectedState, selectedCity]);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedCity(''); // Reset city when state changes
  };

  const clearFilters = () => {
    setSelectedState('');
    setSelectedCity('');
  };

  if (!query) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#23185B] text-xl">
        Please enter a search term.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-[#faf7ed] min-h-[70vh] flex items-center justify-center text-[#23185B] text-xl">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-6 h-6 border-3 border-[#5B3DF6] border-t-transparent rounded-full"></div>
          Searching for "{query}"...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-[#faf7ed] min-h-screen py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Filters Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#23185B] mb-4 sm:mb-0">
            Search Results for "{query}"
          </h1>

          <motion.button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-[#5B3DF6] text-white rounded-full hover:bg-[#4C33D4] transition-colors duration-300 shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>🌍</span>
            <span className="font-semibold">Location Filters</span>
            <motion.span
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              ▼
            </motion.span>
          </motion.button>
        </div>

        {/* Filters Panel */}
        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden mb-6"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-[#E0D5FA]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* State Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  Filter by State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold appearance-none cursor-pointer transition-all duration-200 hover:border-[#5B3DF6]"
                >
                  <option value="">All States</option>
                  {getStates().map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  Filter by City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold appearance-none cursor-pointer transition-all duration-200 hover:border-[#5B3DF6] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedState ? 'All Cities' : 'Select State First'}</option>
                  {selectedState && getCitiesByState(selectedState).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <motion.button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-300 font-semibold border-2 border-gray-200 hover:border-gray-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!selectedState && !selectedCity}
                >
                  🗑️ Clear Filters
                </motion.button>
              </div>
            </div>

            {/* Active Filters Display */}
            {(selectedState || selectedCity) && (
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm font-semibold text-[#5B3DF6]">Active Filters:</span>
                {selectedState && (
                  <span className="px-3 py-1 bg-[#5B3DF6] text-white rounded-full text-sm font-medium">
                    📍 {selectedState}
                  </span>
                )}
                {selectedCity && (
                  <span className="px-3 py-1 bg-[#22C55E] text-white rounded-full text-sm font-medium">
                    🏙️ {selectedCity}
                  </span>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Results Counter */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-[#5B3DF6] font-semibold">
            {products.length} result{products.length !== 1 ? 's' : ''} found
            {(selectedState || selectedCity) && (
              <span className="text-gray-600 ml-2">
                (filtered by location)
              </span>
            )}
          </p>
        </div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {products.map((product) => (
            <motion.div
              key={product._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
            >
              <Link
                href={`/product/${product._id}`}
                className="group block rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white border-2 border-transparent hover:border-[#5B3DF6]"
              >
                <div className="relative w-full h-48 sm:h-52 md:h-56 bg-gray-100">
                  <Image
                    src={product.image || '/default.png'}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="p-4 text-[#23185B]">
                  <h2 className="text-lg font-semibold truncate group-hover:text-[#5B3DF6] transition-colors">
                    {product.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-1">{product.college}</p>
                  {(product.state || product.city) && (
                    <p className="text-xs text-[#5B3DF6] font-medium mb-2">
                      📍 {product.city && product.state ? `${product.city}, ${product.state}` : product.state || product.city}
                    </p>
                  )}

                  {/* Verification Badge */}
                  {product.userId && typeof product.userId === 'object' && (
                    <div className="flex items-center mb-2">
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

                  <div className="mt-2 font-bold text-xl text-[#22C55E]">₹{product.price}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results Message */}
        {products.length === 0 && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-[#23185B] mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-6">
              {(selectedState || selectedCity)
                ? `No products found for "${query}" in the selected location.`
                : `No products found for "${query}".`
              }
            </p>
            {(selectedState || selectedCity) && (
              <motion.button
                onClick={clearFilters}
                className="px-6 py-3 bg-[#5B3DF6] text-white rounded-full hover:bg-[#4C33D4] transition-colors duration-300 font-semibold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🗑️ Clear Location Filters
              </motion.button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}