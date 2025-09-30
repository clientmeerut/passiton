"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Filter,
  User,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  School,
  Phone,
  Eye
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  username: string;
  verified: boolean;
  createdAt: string;
  collegeName?: string;
  mobile?: string;
  collegeIdUrl: string;
}

export default function AdminUsers() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    verified: '',
    search: ''
  });
  const [verifyingUsers, setVerifyingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check if user is admin
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.loggedIn || !data.isAdmin) {
          router.push('/login');
          return;
        }
      });

    fetchUsers();
  }, [router, page, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.verified && { verified: filters.verified }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (userId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates })
      });

      if (response.ok) {
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const toggleUserVerification = async (userId: string, currentStatus: boolean) => {
    setVerifyingUsers(prev => new Set(prev).add(userId));

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !currentStatus })
      });

      if (response.ok) {
        // Update user in local state
        setUsers(prev => prev.map(user =>
          user._id === userId
            ? { ...user, verified: !currentStatus }
            : user
        ));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update verification status');
      }
    } catch (error) {
      console.error('Error toggling verification:', error);
      alert('Failed to update verification status');
    } finally {
      setVerifyingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf7ed] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5B3DF6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5B3DF6] font-semibold text-lg">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7ed] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={() => router.push('/admin/dashboard')}
            className="p-3 bg-white rounded-full shadow-lg text-[#5B3DF6] hover:bg-[#E0D5FA] transition-colors duration-300"
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#23185B]">
              👥 Manage Users
            </h1>
            <p className="text-lg text-gray-600">
              View and manage all users on the platform
            </p>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-6 border-2 border-[#E0D5FA] mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                <Search className="inline w-4 h-4 mr-2" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                <Filter className="inline w-4 h-4 mr-2" />
                Verification Status
              </label>
              <select
                value={filters.verified}
                onChange={(e) => setFilters(prev => ({ ...prev, verified: e.target.value }))}
                className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="">All Users</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified Only</option>
              </select>
            </div>

            <div className="flex items-end">
              <motion.button
                onClick={() => setFilters({ verified: '', search: '' })}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-300 font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear Filters
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Users List */}
        <div className="space-y-4">
          {users.map((user, index) => (
            <motion.div
              key={user._id}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-[#5B3DF6] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* User Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-2 sm:gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-[#5B3DF6] to-[#755FF5] rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg sm:text-xl font-bold text-[#23185B] mb-1 break-words">{user.fullName}</h3>
                        <p className="text-[#5B3DF6] font-semibold text-sm sm:text-base break-all">@{user.username}</p>
                      </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap self-start ${
                      user.verified
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.verified ? '✅ Verified' : '❌ Unverified'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    <div className="flex items-center text-gray-600 text-sm min-w-0">
                      <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span className="break-all">{user.email}</span>
                    </div>
                    {user.mobile && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{user.mobile}</span>
                      </div>
                    )}
                    {user.collegeName && (
                      <div className="flex items-center text-gray-600 text-sm min-w-0">
                        <School className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="break-words">{user.collegeName}</span>
                      </div>
                    )}
                    <div className="flex items-center text-gray-600 text-sm">
                      <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                      <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {user.collegeIdUrl && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">College ID URL: </span>
                      <a
                        href={user.collegeIdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#5B3DF6] hover:underline text-sm"
                      >
                        View College ID
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions - Mobile Responsive */}
                <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[160px]">
                  <motion.button
                    onClick={() => router.push(`/admin/users/${user._id}`)}
                    className="w-full px-3 py-2 bg-[#5B3DF6] text-white rounded-lg text-sm font-semibold hover:bg-[#4A2DE8] transition-colors duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">View Profile</span>
                    <span className="sm:hidden">Profile</span>
                  </motion.button>

                  <motion.button
                    onClick={() => toggleUserVerification(user._id, user.verified)}
                    disabled={verifyingUsers.has(user._id)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2 ${
                      user.verified
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {verifyingUsers.has(user._id) ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                        <span className="hidden sm:inline">Updating...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        {user.verified ? <XCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                        <span>{user.verified ? 'Unverify' : 'Verify'}</span>
                      </>
                    )}
                  </motion.button>

                  {user.collegeIdUrl && (
                    <motion.a
                      href={user.collegeIdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors duration-300 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">View ID</span>
                      <span className="sm:hidden">ID</span>
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="flex justify-center mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <motion.button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-full font-semibold transition-colors duration-300 ${
                    page === pageNum
                      ? 'bg-[#5B3DF6] text-white'
                      : 'bg-white text-[#5B3DF6] hover:bg-[#E0D5FA]'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {pageNum}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {users.length === 0 && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-2xl font-bold text-[#23185B] mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your search or filters.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}