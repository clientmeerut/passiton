'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Eye, CheckCircle, XCircle } from 'lucide-react';

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber?: string;
  college?: string;
  verified: boolean;
  collegeId?: string;
  createdAt: string;
}

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sold: boolean;
  createdAt: string;
}

interface Opportunity {
  _id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  salary?: number;
  stipend?: number;
  duration?: string;
  active: boolean;
  createdAt: string;
}

interface UserStats {
  totalProducts: number;
  soldProducts: number;
  activeProducts: number;
  totalOpportunities: number;
  activeOpportunities: number;
  inactiveOpportunities: number;
}

export default function UserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'opportunities'>('products');
  const [deletingItem, setDeletingItem] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchUserDetails();
  }, [userId]);

  const fetchUserDetails = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setProducts(data.products);
        setOpportunities(data.opportunities);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch user details');
      }
    } catch (err) {
      setError('An error occurred while fetching user details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type: 'product' | 'opportunity', itemId: string) => {
    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
      return;
    }

    setDeletingItem(itemId);
    try {
      const response = await fetch(`/api/admin/users/${userId}?type=${type}&itemId=${itemId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        if (type === 'product') {
          setProducts(products.filter(p => p._id !== itemId));
          setStats(prev => prev ? {
            ...prev,
            totalProducts: prev.totalProducts - 1,
            activeProducts: prev.activeProducts - (products.find(p => p._id === itemId && !p.sold) ? 1 : 0),
            soldProducts: prev.soldProducts - (products.find(p => p._id === itemId && p.sold) ? 1 : 0)
          } : null);
        } else {
          setOpportunities(opportunities.filter(o => o._id !== itemId));
          setStats(prev => prev ? {
            ...prev,
            totalOpportunities: prev.totalOpportunities - 1,
            activeOpportunities: prev.activeOpportunities - (opportunities.find(o => o._id === itemId && o.active) ? 1 : 0),
            inactiveOpportunities: prev.inactiveOpportunities - (opportunities.find(o => o._id === itemId && !o.active) ? 1 : 0)
          } : null);
        }
      } else {
        alert(data.error || 'Failed to delete item');
      }
    } catch (err) {
      alert('An error occurred while deleting the item');
    } finally {
      setDeletingItem(null);
    }
  };

  const toggleUserVerification = async () => {
    if (!user) return;

    setVerifying(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !user.verified })
      });

      if (response.ok) {
        setUser(prev => prev ? { ...prev, verified: !prev.verified } : null);
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update verification status');
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
      alert('Failed to update verification status');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'User not found'}</p>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/users')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Users
          </button>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.fullName}</h1>
                <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
                  <span>@{user.username}</span>
                  <span>{user.email}</span>
                  {user.phoneNumber && <span>{user.phoneNumber}</span>}
                  {user.college && <span>{user.college}</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user.verified ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    <XCircle className="h-4 w-4 mr-1" />
                    Unverified
                  </span>
                )}

                <motion.button
                  onClick={toggleUserVerification}
                  disabled={verifying}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-300 flex items-center gap-2 ${
                    user.verified
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      {user.verified ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      {user.verified ? 'Unverify User' : 'Verify User'}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {stats && (
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalProducts}</div>
                  <div className="text-sm text-gray-600">Total Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.soldProducts}</div>
                  <div className="text-sm text-gray-600">Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.activeProducts}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalOpportunities}</div>
                  <div className="text-sm text-gray-600">Opportunities</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.activeOpportunities}</div>
                  <div className="text-sm text-gray-600">Active Opp.</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.inactiveOpportunities}</div>
                  <div className="text-sm text-gray-600">Inactive Opp.</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Products ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('opportunities')}
                className={`py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'opportunities'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Opportunities ({opportunities.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'products' && (
              <div className="space-y-4">
                {products.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No products found</p>
                ) : (
                  products.map((product) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{product.title}</h3>
                            {product.sold ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Sold
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Available
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>₹{product.price.toLocaleString()}</span>
                            <span>{product.category}</span>
                            <span>{new Date(product.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleDelete('product', product._id)}
                            disabled={deletingItem === product._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            {deletingItem === product._id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'opportunities' && (
              <div className="space-y-4">
                {opportunities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No opportunities found</p>
                ) : (
                  opportunities.map((opportunity) => (
                    <motion.div
                      key={opportunity._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="font-medium text-gray-900">{opportunity.title}</h3>
                            {opportunity.active ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{opportunity.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span className="capitalize">{opportunity.type}</span>
                            {opportunity.location && <span>{opportunity.location}</span>}
                            {opportunity.salary && <span>₹{opportunity.salary.toLocaleString()}</span>}
                            {opportunity.stipend && <span>₹{opportunity.stipend.toLocaleString()}/month</span>}
                            {opportunity.duration && <span>{opportunity.duration}</span>}
                            <span>{new Date(opportunity.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleDelete('opportunity', opportunity._id)}
                            disabled={deletingItem === opportunity._id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                          >
                            {deletingItem === opportunity._id ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}