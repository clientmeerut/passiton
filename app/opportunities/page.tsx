"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus } from "lucide-react";

interface Opportunity {
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
  createdAt: string;
  deadline?: string;
  contactEmail: string;
  contactPhone?: string;
  active: boolean;
  userId?: {
    verified?: boolean;
  } | string;
}


const categoryConfig = {
  all: { icon: "🌟", label: "All Opportunities", color: "bg-gray-100 text-gray-700" },
  job: { icon: "💼", label: "Jobs", color: "bg-blue-100 text-blue-700" },
  internship: { icon: "🎓", label: "Internships", color: "bg-green-100 text-green-700" },
  mentor: { icon: "👨‍🏫", label: "Mentorship", color: "bg-purple-100 text-purple-700" },
  coaching: { icon: "📚", label: "Coaching", color: "bg-orange-100 text-orange-700" },
  freelance: { icon: "💻", label: "Freelance", color: "bg-pink-100 text-pink-700" },
  event: { icon: "🎪", label: "Events", color: "bg-yellow-100 text-yellow-700" }
};

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const response = await fetch('/api/opportunities/public');
        const data = await response.json();
        if (data.success) {
          setOpportunities(data.opportunities);
        }
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesCategory = selectedCategory === "all" || opp.type === selectedCategory;
    const matchesSearch = searchTerm === "" ||
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const featuredOpportunities = filteredOpportunities.filter(opp => opp.featured);
  const regularOpportunities = filteredOpportunities.filter(opp => !opp.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7ed] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#5B3DF6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5B3DF6] font-semibold text-lg">Loading amazing opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7ed] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-[#23185B] mb-4">
            🚀 Discover Amazing Opportunities
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Find your next career move, learning opportunity, or networking event.
            Connect with top companies, mentors, and educational programs.
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search opportunities, companies, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-6 pr-4 py-4 rounded-full bg-white border-2 border-[#E0D5FA] text-[#23185B] focus:border-[#5B3DF6] focus:outline-none text-lg shadow-lg transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12 px-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {Object.entries(categoryConfig).map(([key, config]) => (
            <motion.button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 text-xs sm:text-sm ${
                selectedCategory === key
                  ? "bg-[#5B3DF6] text-white shadow-lg scale-105"
                  : `${config.color} hover:scale-105 shadow-md`
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-1 sm:mr-2">{config.icon}</span>
              <span className="hidden sm:inline">{config.label}</span>
              <span className="sm:hidden">{config.label.split(' ')[0]}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Results Counter */}
        <div className="text-center mb-8">
          <p className="text-[#5B3DF6] font-semibold text-lg">
            {filteredOpportunities.length} opportunit{filteredOpportunities.length !== 1 ? 'ies' : 'y'} found
            {searchTerm && (
              <span className="text-gray-600 ml-2">for "{searchTerm}"</span>
            )}
          </p>
        </div>

        {/* Featured Opportunities */}
        {featuredOpportunities.length > 0 && (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#23185B] mb-8 text-center">
              ⭐ Featured Opportunities
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredOpportunities.map((opportunity, index) => (
                <OpportunityCard key={opportunity._id} opportunity={opportunity} featured={opportunity.featured} delay={index * 0.1} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Regular Opportunities */}
        {regularOpportunities.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-[#23185B] mb-8 text-center">
              💼 All Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {regularOpportunities.map((opportunity, index) => (
                <OpportunityCard key={opportunity._id} opportunity={opportunity} featured={opportunity.featured} delay={index * 0.05} />
              ))}
            </div>
          </motion.div>
        )}

        {/* No Results */}
        {filteredOpportunities.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-[#23185B] mb-2">
              No opportunities found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or category filters.
            </p>
            <motion.button
              onClick={() => {
                setSelectedCategory("all");
                setSearchTerm("");
              }}
              className="px-6 py-3 bg-[#5B3DF6] text-white rounded-full hover:bg-[#4C33D4] transition-colors duration-300 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Reset Filters
            </motion.button>
          </motion.div>
        )}

        {/* Floating Add Opportunity Button */}
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
        >
          <Link href="/list-opportunity">
            <motion.button
              className="group relative w-16 h-16 bg-gradient-to-r from-[#5B3DF6] to-[#755FF5] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" />

              {/* Tooltip */}
              <div className="absolute right-full mr-3 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                List New Opportunity
                <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-black rotate-45"></div>
              </div>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

interface OpportunityCardProps {
  opportunity: Opportunity;
  featured: boolean;
  delay: number;
}

function OpportunityCard({ opportunity, featured, delay }: OpportunityCardProps) {
  const typeConfig = categoryConfig[opportunity.type];
  const isFeatured = opportunity.featured;

  return (
    <motion.div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
        isFeatured
          ? "border-[#FFE158] shadow-yellow-100 bg-gradient-to-br from-yellow-50 to-orange-50"
          : "border-transparent hover:border-[#5B3DF6]"
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {isFeatured && (
        <div className="bg-gradient-to-r from-[#FFE158] to-[#FFC107] px-4 py-2 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 opacity-20"></div>
          <p className="text-[#23185B] font-bold text-sm text-center relative z-10 flex items-center justify-center gap-2">
            <span className="text-yellow-600">⭐</span>
            FEATURED OPPORTUNITY
            <span className="text-yellow-600">⭐</span>
          </p>
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#23185B] mb-1 line-clamp-2">
              {opportunity.title}
            </h3>
            <p className="text-[#5B3DF6] font-semibold mb-2">{opportunity.company}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeConfig.color}`}>
            {typeConfig.icon} {typeConfig.label}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <span className="mr-2">📍</span>
            <span>{opportunity.location}</span>
          </div>
          {opportunity.duration && (
            <div className="flex items-center text-gray-600 text-sm">
              <span className="mr-2">⏰</span>
              <span>{opportunity.duration}</span>
            </div>
          )}
          {opportunity.salary && (
            <div className="flex items-center text-green-600 text-sm font-semibold">
              <span className="mr-2">💰</span>
              <span>{opportunity.salary}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {opportunity.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
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
              +{opportunity.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Verification Badge */}
        {opportunity.userId && typeof opportunity.userId === 'object' && (
          <div className="flex justify-center mb-4">
            {opportunity.userId.verified ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                Verified Poster
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Unverified Poster
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Posted: {new Date(opportunity.createdAt).toLocaleDateString()}
            {opportunity.deadline && (
              <div className="text-red-500 font-medium">
                Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
              </div>
            )}
          </div>
          <motion.a
            href={`mailto:${opportunity.contactEmail}?subject=Interest in ${opportunity.title}`}
            className="px-4 py-2 bg-[#5B3DF6] text-white rounded-full text-sm font-semibold hover:bg-[#4C33D4] transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📧 Apply Now
          </motion.a>
        </div>
      </div>
    </motion.div>
  );
}