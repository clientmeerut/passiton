"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Briefcase,
  Package,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Settings,
  BarChart3,
  Calendar,
  Shield
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
    verified: number;
    recent: number;
  };
  opportunities: {
    total: number;
    active: number;
    inactive: number;
    recent: number;
    byType: Array<{ _id: string; count: number }>;
  };
  products: {
    total: number;
    sold: number;
    active: number;
    recent: number;
  };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check if user is admin
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.loggedIn || !data.isAdmin) {
          router.push('/login');
          return;
        }
        setUser(data.user);
      });

    // Fetch admin stats
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(error => {
        console.error('Error fetching admin stats:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7ed] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5B3DF6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5B3DF6] font-semibold text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#faf7ed] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }: any) => (
    <motion.div
      className={`bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-transparent hover:border-[${color}] transition-all duration-300`}
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-full bg-${color.split('-')[0]}-100`}>
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 text-${color}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            <TrendingUp className="w-3 h-3" />
            +{trend}
          </div>
        )}
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-[#23185B] mb-1">{value}</div>
      <div className="text-sm text-gray-600 font-medium">{title}</div>
      {subtitle && <div className="text-xs text-gray-500 mt-1">{subtitle}</div>}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#faf7ed] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[#23185B] mb-2">
                🛡️ Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {user?.fullName}! Here's what's happening on your platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
              <motion.button
                onClick={() => router.push('/admin/opportunities')}
                className="px-3 sm:px-4 py-2 bg-[#5B3DF6] text-white rounded-lg sm:rounded-full hover:bg-[#4C33D4] transition-colors duration-300 font-semibold text-sm shadow-lg text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">Manage Opportunities</span>
                <span className="sm:hidden">Opportunities</span>
              </motion.button>
              <motion.button
                onClick={() => router.push('/admin/users')}
                className="px-3 sm:px-4 py-2 bg-white text-[#5B3DF6] border-2 border-[#5B3DF6] rounded-lg sm:rounded-full hover:bg-[#5B3DF6] hover:text-white transition-colors duration-300 font-semibold text-sm shadow-lg text-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">Manage Users</span>
                <span className="sm:hidden">Users</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.users.total}
              subtitle={`${stats.users.verified} verified`}
              icon={Users}
              color="blue-500"
              trend={stats.users.recent}
            />
            <StatCard
              title="Total Opportunities"
              value={stats.opportunities.total}
              subtitle={`${stats.opportunities.active} active`}
              icon={Briefcase}
              color="green-500"
              trend={stats.opportunities.recent}
            />
            <StatCard
              title="Total Products"
              value={stats.products.total}
              subtitle={`${stats.products.sold} sold`}
              icon={Package}
              color="purple-500"
              trend={stats.products.recent}
            />
            <StatCard
              title="Active Listings"
              value={stats.opportunities.active + stats.products.active}
              subtitle="Opportunities + Products"
              icon={Eye}
              color="orange-500"
            />
          </div>
        )}

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Opportunities by Type */}
          {stats?.opportunities.byType && (
            <motion.div
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#E0D5FA]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-bold text-[#23185B] mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#5B3DF6]" />
                Opportunities by Type
              </h3>
              <div className="space-y-3">
                {stats.opportunities.byType.map((item, index) => (
                  <div key={item._id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full bg-${['blue', 'green', 'purple', 'orange', 'pink', 'yellow'][index % 6]}-500`}></div>
                      <span className="capitalize font-medium">{item._id}</span>
                    </div>
                    <span className="font-bold text-[#23185B]">{item.count}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#E0D5FA]"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-[#23185B] mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#5B3DF6]" />
              Recent Activity (7 days)
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="font-medium">New Users</span>
                </div>
                <span className="font-bold text-blue-600">+{stats?.users.recent || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-4 h-4 text-green-500" />
                  <span className="font-medium">New Opportunities</span>
                </div>
                <span className="font-bold text-green-600">+{stats?.opportunities.recent || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-purple-500" />
                  <span className="font-medium">New Products</span>
                </div>
                <span className="font-bold text-purple-600">+{stats?.products.recent || 0}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#E0D5FA]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-[#23185B] mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#5B3DF6]" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.button
              onClick={() => router.push('/admin/seed')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-xl border border-green-200 transition-colors duration-300 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-green-600 font-semibold mb-1">🌱 Seed Data</div>
              <div className="text-sm text-green-700">Add dummy opportunities</div>
            </motion.button>

            <motion.button
              onClick={() => router.push('/debug')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors duration-300 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-blue-600 font-semibold mb-1">🐛 Debug</div>
              <div className="text-sm text-blue-700">View debug information</div>
            </motion.button>

            <motion.button
              onClick={() => router.push('/dashboard')}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors duration-300 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-orange-600 font-semibold mb-1">📝 My Listings</div>
              <div className="text-sm text-orange-700">Manage your posts</div>
            </motion.button>

            <motion.button
              onClick={() => router.push('/opportunities')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors duration-300 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-purple-600 font-semibold mb-1">👀 View Site</div>
              <div className="text-sm text-purple-700">See public opportunities</div>
            </motion.button>

            <motion.button
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST' })
                  .then(() => router.push('/'));
              }}
              className="p-4 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors duration-300 text-left"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-red-600 font-semibold mb-1">🚪 Logout</div>
              <div className="text-sm text-red-700">Exit admin panel</div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}