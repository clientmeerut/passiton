'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CheckCircle, XCircle, Loader2, Eye, Heart, Briefcase, MapPin, Clock, DollarSign, Plus, Trash2 } from 'lucide-react';
import UserInfoCard from '@/components/UserInfoCard';
import { useAuth } from '@/hooks/useAuth';

type Product = {
  _id: string;
  title: string;
  price: string;
  category: string;
  image: string;
  college: string;
  sold: boolean;
  featured?: boolean;
  createdAt: string;
};

type Opportunity = {
  _id: string;
  title: string;
  company: string;
  type: "job" | "internship" | "mentor" | "coaching" | "freelance" | "event";
  location: string;
  duration?: string;
  salary?: string;
  description: string;
  requirements: string[];
  tags: string[];
  featured: boolean;
  postedDate: string;
  deadline?: string;
  contactEmail: string;
  contactPhone?: string;
  active: boolean;
};

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [opportunitiesLoading, setOpportunitiesLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [togglingOpportunity, setTogglingOpportunity] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingOpportunity, setDeletingOpportunity] = useState<string | null>(null);
  const router = useRouter();

  // Use the authentication hook
  const { user, loading: authLoading, isAuthenticated } = useAuth(true);

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      // Fetch products
      setLoading(true);
      const productsRes = await fetch('/api/dashboard/products', {
        credentials: 'include'
      });
      const productsData = await productsRes.json();

      if (productsRes.status === 401) {
        router.push('/auth/login');
        return;
      }

      setProducts(productsData.products || []);
      setLoading(false);

      // Fetch opportunities
      setOpportunitiesLoading(true);
      const opportunitiesRes = await fetch('/api/dashboard/opportunities', {
        credentials: 'include'
      });
      const opportunitiesData = await opportunitiesRes.json();

      if (opportunitiesRes.status === 401) {
        router.push('/auth/login');
        return;
      }

      setOpportunities(opportunitiesData.opportunities || []);
      setOpportunitiesLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
      setOpportunitiesLoading(false);
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Add focus event listener to refresh data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleToggleSold = async (productId: string, sold: boolean) => {
    setToggling(productId);
    await fetch('/api/dashboard/toggle-sold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, sold }),
    });
    setProducts(products =>
      products.map(p =>
        p._id === productId ? { ...p, sold } : p
      )
    );
    setToggling(null);
  };

  const handleToggleOpportunityActive = async (opportunityId: string, active: boolean) => {
    setTogglingOpportunity(opportunityId);
    try {
      await fetch('/api/dashboard/toggle-opportunity-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, active }),
      });
      setOpportunities(opportunities =>
        opportunities.map(opp =>
          opp._id === opportunityId ? { ...opp, active } : opp
        )
      );
    } catch (error) {
      console.error('Error toggling opportunity status:', error);
    } finally {
      setTogglingOpportunity(null);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    setDeleting(productId);
    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(product => product._id !== productId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity? This action cannot be undone.')) {
      return;
    }

    setDeletingOpportunity(opportunityId);
    try {
      const response = await fetch(`/api/opportunities?id=${opportunityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOpportunities(prev => prev.filter(opportunity => opportunity._id !== opportunityId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete opportunity');
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      alert('Failed to delete opportunity');
    } finally {
      setDeletingOpportunity(null);
    }
  };

  const categoryConfig = {
    job: { icon: "💼", label: "Job", color: "bg-blue-100 text-blue-700" },
    internship: { icon: "🎓", label: "Internship", color: "bg-green-100 text-green-700" },
    mentor: { icon: "👨‍🏫", label: "Mentorship", color: "bg-purple-100 text-purple-700" },
    coaching: { icon: "📚", label: "Coaching", color: "bg-orange-100 text-orange-700" },
    freelance: { icon: "💻", label: "Freelance", color: "bg-pink-100 text-pink-700" },
    event: { icon: "🎪", label: "Event", color: "bg-yellow-100 text-yellow-700" }
  };

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#faf7ed] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5B3DF6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5B3DF6] font-semibold text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7ed] flex flex-col items-center py-10 px-4">
      
      <motion.div
        className="text-center mb-7"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl sm:text-4xl font-black text-[#5B3DF6] mb-2">
          {user?.isAdmin ? '🛡️ Admin Personal Dashboard' : 'Dashboard'}
        </h1>
        {user?.isAdmin && (
          <div className="flex items-center justify-center gap-4">
            <p className="text-sm text-gray-600">Manage your featured listings</p>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-3 py-1 bg-[#5B3DF6] text-white rounded-full text-xs hover:bg-[#4C33D4] transition-colors"
            >
              Back to Admin Dashboard
            </button>
          </div>
        )}
      </motion.div>
      <UserInfoCard />
      <div className='h-10'></div>
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl border-2 border-[#E0D5FA] p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-[#23185B]">My Listings</h2>
          <motion.button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#5B3DF6] text-white rounded-full hover:bg-[#4C33D4] transition-colors duration-300 font-semibold text-xs sm:text-sm shadow-lg disabled:opacity-50 w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                🔄 Refresh
              </>
            )}
          </motion.button>
        </div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#5B3DF6]" size={32} />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-[#a78bfa] font-semibold py-10">
            You haven&apos;t listed any items yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
            {products.map(product => (
              <motion.div
                key={product._id}
                className={`flex flex-col items-center shadow-sm rounded-xl p-6 border-2 transition-transform hover:scale-105 relative ${
                  product.featured
                    ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-[#FFE158] shadow-yellow-200'
                    : 'bg-[#f7f4e8] border-gray-200'
                } ${product.sold ? 'opacity-60' : ''}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Featured Badge */}
                {product.featured && (
                  <div className="absolute top-3 left-3">
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xs shadow-lg">
                      ⭐ FEATURED
                    </span>
                  </div>
                )}

                <div className="w-full flex justify-end absolute top-3 right-3">
                  {product.sold ? (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-200 text-green-700 font-bold text-xs">
                      <CheckCircle size={16} /> Sold
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 font-bold text-xs">
                      <Eye size={16} /> Active
                    </span>
                  )}
                </div>
                <Image
                  src={product.image}
                  alt={product.title}
                  width={80}
                  height={80}
                  className="rounded-xl object-contain mb-2"
                />
                <span className="mt-1 font-semibold text-lg text-[#23185B] text-center">{product.title}</span>
                <span className="text-[#23185B] font-bold">₹{product.price}</span>
                <span className="text-xs text-[#7c689c] mb-2">{product.category}</span>
                <div className="flex flex-col gap-2 mt-2 w-full">
                  <button
                    className={`px-3 sm:px-4 py-2 rounded-lg font-bold shadow transition text-white ${
                      product.sold
                        ? 'bg-[#5B3DF6] hover:bg-[#3b278e]'
                        : 'bg-[#22C55E] hover:bg-[#16a34a]'
                    } flex items-center justify-center gap-2 text-xs sm:text-sm w-full`}
                    disabled={toggling === product._id}
                    onClick={() => handleToggleSold(product._id, !product.sold)}
                  >
                    {toggling === product._id && <Loader2 size={14} className="animate-spin" />}
                    {product.sold ? (
                      <>
                        <XCircle size={14} />
                        <span className="hidden sm:inline">Mark as Unsold</span>
                        <span className="sm:hidden">Unsold</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle size={14} />
                        <span className="hidden sm:inline">Mark as Sold</span>
                        <span className="sm:hidden">Sold</span>
                      </>
                    )}
                  </button>
                  <button
                    className="px-3 sm:px-4 py-2 rounded-lg bg-[#FFE158] hover:bg-yellow-400 text-[#23185B] font-bold shadow transition flex items-center justify-center gap-2 text-xs sm:text-sm w-full"
                    onClick={() => router.push(`/product/${product._id}`)}
                  >
                    <Eye size={14} />
                    <span>View</span>
                  </button>
                  <button
                    className="px-3 sm:px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold shadow transition flex items-center justify-center gap-2 text-xs sm:text-sm w-full"
                    disabled={deleting === product._id}
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    {deleting === product._id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* My Opportunities Section */}
      <div className="h-10"></div>
      <div className="w-full max-w-5xl bg-white/90 rounded-3xl shadow-2xl border-2 border-[#E0D5FA] p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-[#23185B] flex items-center gap-2 sm:gap-3">
            <Briefcase className="text-[#5B3DF6]" size={20} />
            My Opportunities
          </h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <motion.button
              onClick={fetchData}
              disabled={opportunitiesLoading}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-300 font-semibold text-xs sm:text-sm shadow disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {opportunitiesLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  🔄
                </>
              )}
            </motion.button>
            <motion.button
              onClick={() => router.push('/list-opportunity')}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-[#5B3DF6] text-white rounded-full hover:bg-[#4C33D4] transition-colors duration-300 font-semibold text-xs sm:text-sm shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">List New</span>
              <span className="sm:hidden">New</span>
            </motion.button>
          </div>
        </div>

        {opportunitiesLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-[#5B3DF6]" size={32} />
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">💼</div>
            <p className="text-[#a78bfa] font-semibold mb-4">
              You haven&apos;t listed any opportunities yet.
            </p>
            <motion.button
              onClick={() => router.push('/list-opportunity')}
              className="px-6 py-3 bg-[#5B3DF6] text-white rounded-full hover:bg-[#4C33D4] transition-colors duration-300 font-semibold shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🚀 List Your First Opportunity
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map(opportunity => {
              const typeConfig = categoryConfig[opportunity.type];
              return (
                <motion.div
                  key={opportunity._id}
                  className={`rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg relative ${
                    opportunity.featured
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-[#FFE158] shadow-yellow-200'
                      : 'bg-[#f7f4e8] border-gray-200'
                  } ${!opportunity.active ? 'opacity-60' : ''}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Featured Badge */}
                  {opportunity.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-xs shadow-lg">
                        ⭐ FEATURED
                      </span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {opportunity.active ? (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-200 text-green-700 font-bold text-xs">
                        <CheckCircle size={14} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-200 text-gray-600 font-bold text-xs">
                        <XCircle size={14} /> Inactive
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="pr-20 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.icon} {typeConfig.label}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-[#23185B] mb-1 line-clamp-2">
                      {opportunity.title}
                    </h3>
                    <p className="text-[#5B3DF6] font-semibold mb-2">{opportunity.company}</p>

                    <div className="space-y-1 mb-3">
                      <div className="flex items-center text-gray-600 text-sm">
                        <MapPin size={14} className="mr-2" />
                        <span>{opportunity.location}</span>
                      </div>
                      {opportunity.duration && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Clock size={14} className="mr-2" />
                          <span>{opportunity.duration}</span>
                        </div>
                      )}
                      {opportunity.salary && (
                        <div className="flex items-center text-green-600 text-sm font-semibold">
                          <DollarSign size={14} className="mr-2" />
                          <span>{opportunity.salary}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-2 mb-3">
                      {opportunity.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {opportunity.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-[#E0D5FA] text-[#5B3DF6] rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {opportunity.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{opportunity.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                    <button
                      className={`flex-1 min-w-[120px] px-3 py-2 rounded-full font-bold text-sm shadow transition text-white flex items-center justify-center gap-2 ${
                        opportunity.active
                          ? 'bg-gray-500 hover:bg-gray-600'
                          : 'bg-[#22C55E] hover:bg-[#16a34a]'
                      }`}
                      disabled={togglingOpportunity === opportunity._id}
                      onClick={() => handleToggleOpportunityActive(opportunity._id, !opportunity.active)}
                    >
                      {togglingOpportunity === opportunity._id && <Loader2 size={14} className="animate-spin" />}
                      {opportunity.active ? (
                        <>
                          <XCircle size={14} /> Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle size={14} /> Activate
                        </>
                      )}
                    </button>
                    <button
                      className="px-3 py-2 rounded-full bg-[#FFE158] hover:bg-yellow-400 text-[#23185B] font-bold shadow transition flex items-center gap-1 text-sm"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      className="px-3 py-2 rounded-full bg-red-500 hover:bg-red-600 text-white font-bold shadow transition flex items-center gap-1 text-sm"
                      disabled={deletingOpportunity === opportunity._id}
                      onClick={() => handleDeleteOpportunity(opportunity._id)}
                    >
                      {deletingOpportunity === opportunity._id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}