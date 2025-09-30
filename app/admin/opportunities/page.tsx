"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar
} from "lucide-react";

interface Opportunity {
  _id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  duration?: string;
  salary?: string;
  description: string;
  active: boolean;
  featured: boolean;
  createdAt: string;
  deadline?: string;
  contactEmail: string;
  userId?: {
    fullName: string;
    email: string;
  };
}

export default function AdminOpportunities() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    search: ''
  });

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

    fetchOpportunities();
  }, [router, page, filters]);

  const fetchOpportunities = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.type && { type: filters.type }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/admin/opportunities?${params}`);
      const data = await response.json();

      if (data.success) {
        setOpportunities(data.opportunities);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOpportunity = async (opportunityId: string, updates: any) => {
    try {
      const response = await fetch('/api/admin/opportunities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId, updates })
      });

      if (response.ok) {
        fetchOpportunities(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating opportunity:', error);
    }
  };

  const deleteOpportunity = async (opportunityId: string) => {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    try {
      const response = await fetch(`/api/admin/opportunities?id=${opportunityId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchOpportunities(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting opportunity:', error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      job: 'bg-blue-100 text-blue-700',
      internship: 'bg-green-100 text-green-700',
      mentor: 'bg-purple-100 text-purple-700',
      coaching: 'bg-orange-100 text-orange-700',
      freelance: 'bg-pink-100 text-pink-700',
      event: 'bg-yellow-100 text-yellow-700'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      job: '💼',
      internship: '🎓',
      mentor: '👨‍🏫',
      coaching: '📚',
      freelance: '💻',
      event: '🎪'
    };
    return icons[type as keyof typeof icons] || '📋';
  };

  if (loading && opportunities.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf7ed] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5B3DF6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5B3DF6] font-semibold text-lg">Loading opportunities...</p>
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
              🎯 Manage Opportunities
            </h1>
            <p className="text-lg text-gray-600">
              View, edit, and manage all opportunities on the platform
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                <Search className="inline w-4 h-4 mr-2" />
                Search
              </label>
              <input
                type="text"
                placeholder="Search opportunities..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                <Filter className="inline w-4 h-4 mr-2" />
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none appearance-none cursor-pointer transition-all duration-200"
              >
                <option value="">All Types</option>
                <option value="job">Jobs</option>
                <option value="internship">Internships</option>
                <option value="mentor">Mentorship</option>
                <option value="coaching">Coaching</option>
                <option value="freelance">Freelance</option>
                <option value="event">Events</option>
              </select>
            </div>

            <div className="flex items-end">
              <motion.button
                onClick={() => setFilters({ status: '', type: '', search: '' })}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors duration-300 font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Clear Filters
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {opportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity._id}
              className="bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-[#5B3DF6] transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(opportunity.type)}`}>
                          {getTypeIcon(opportunity.type)} {opportunity.type}
                        </span>
                        {opportunity.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1">
                            <Star className="w-3 h-3" /> Featured
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          opportunity.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {opportunity.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-[#23185B] mb-1">{opportunity.title}</h3>
                      <p className="text-[#5B3DF6] font-semibold">{opportunity.company}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2" />
                      {opportunity.location}
                    </div>
                    {opportunity.duration && (
                      <div className="flex items-center text-gray-600 text-sm">
                        <Clock className="w-4 h-4 mr-2" />
                        {opportunity.duration}
                      </div>
                    )}
                    {opportunity.salary && (
                      <div className="flex items-center text-green-600 text-sm font-semibold">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {opportunity.salary}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{opportunity.description}</p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div>
                      Posted: {new Date(opportunity.createdAt).toLocaleDateString()}
                      {opportunity.deadline && (
                        <span className="ml-4">
                          Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {opportunity.userId && (
                      <div>By: {opportunity.userId.fullName}</div>
                    )}
                  </div>
                </div>

                {/* Actions - Mobile Responsive */}
                <div className="flex flex-col gap-2 w-full lg:w-auto lg:min-w-[140px]">
                  <motion.button
                    onClick={() => updateOpportunity(opportunity._id, { active: !opportunity.active })}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2 ${
                      opportunity.active
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {opportunity.active ? <XCircle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                    <span className="hidden sm:inline">{opportunity.active ? 'Deactivate' : 'Activate'}</span>
                    <span className="sm:hidden">{opportunity.active ? 'Off' : 'On'}</span>
                  </motion.button>

                  <motion.button
                    onClick={() => updateOpportunity(opportunity._id, { featured: !opportunity.featured })}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 flex items-center justify-center gap-2 ${
                      opportunity.featured
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Star className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{opportunity.featured ? 'Unfeature' : 'Feature'}</span>
                    <span className="sm:hidden">{opportunity.featured ? 'Unstar' : 'Star'}</span>
                  </motion.button>

                  <motion.button
                    onClick={() => deleteOpportunity(opportunity._id)}
                    className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors duration-300 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                    <span>Delete</span>
                  </motion.button>
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

        {opportunities.length === 0 && !loading && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-[#23185B] mb-2">No opportunities found</h3>
            <p className="text-gray-600">Try adjusting your filters or add some opportunities.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}