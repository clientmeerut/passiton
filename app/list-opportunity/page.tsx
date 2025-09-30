"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, Users, Mail, Phone, CheckCircle, XCircle, X } from "lucide-react";

export default function ListOpportunityPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    type: "job",
    location: "",
    duration: "",
    salary: "",
    description: "",
    requirements: "",
    tags: "",
    deadline: "",
    contactEmail: "",
    contactPhone: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'success',
    title: '',
    message: ''
  });

  const opportunityTypes = [
    { value: "job", label: "Job", icon: "💼" },
    { value: "internship", label: "Internship", icon: "🎓" },
    { value: "mentor", label: "Mentorship", icon: "👨‍🏫" },
    { value: "coaching", label: "Coaching", icon: "📚" },
    { value: "freelance", label: "Freelance", icon: "💻" },
    { value: "event", label: "Event", icon: "🎪" }
  ];

  const showNotification = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ show: true, type, title, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification(
          'success',
          'Opportunity Listed Successfully! 🎉',
          'Your opportunity has been posted and is now visible to the community. Redirecting to opportunities page...'
        );
        setTimeout(() => {
          router.push("/opportunities");
        }, 2000);
      } else {
        showNotification(
          'error',
          'Failed to List Opportunity',
          data.error || "Please check your information and try again."
        );
      }
    } catch (error) {
      console.error("Error submitting opportunity:", error);
      showNotification(
        'error',
        'Network Error',
        'Failed to connect to the server. Please check your internet connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7ed] py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            onClick={() => router.back()}
            className="p-3 bg-white rounded-full shadow-lg text-[#5B3DF6] hover:bg-[#E0D5FA] transition-colors duration-300"
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft size={24} />
          </motion.button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#23185B]">
              📝 List New Opportunity
            </h1>
            <p className="text-lg text-gray-600">
              Share amazing opportunities with the community
            </p>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-4 sm:p-6 lg:p-8 border-2 border-[#E0D5FA]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  <Briefcase className="inline w-4 h-4 mr-2" />
                  Opportunity Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
                  placeholder="e.g., Frontend Developer Intern"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  🏢 Company/Organization *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
                  placeholder="e.g., TechStart Solutions"
                />
              </div>
            </div>

            {/* Type and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  🎯 Opportunity Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold appearance-none cursor-pointer transition-all duration-200"
                >
                  {opportunityTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  <MapPin className="inline w-4 h-4 mr-2" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
                  placeholder="e.g., Remote / Mumbai"
                />
              </div>
            </div>

            {/* Duration and Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  <Clock className="inline w-4 h-4 mr-2" />
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
                  placeholder="e.g., 3-6 months"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  <DollarSign className="inline w-4 h-4 mr-2" />
                  Salary/Compensation
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
                  placeholder="e.g., ₹15,000/month"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                📝 Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200 resize-none"
                placeholder="Describe the opportunity, responsibilities, and what makes it exciting..."
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                <Users className="inline w-4 h-4 mr-2" />
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-2xl bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200 resize-none"
                placeholder="List requirements separated by commas (e.g., React.js, JavaScript, HTML/CSS)"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                🏷️ Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
                placeholder="e.g., Remote, Flexible, Learning (separated by commas)"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Contact Email *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
                  placeholder="+91-9876543210"
                />
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-[#5B3DF6] mb-2">
                📅 Application Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-full bg-[#faf7ed] border-2 border-[#E0D5FA] text-[#23185B] focus:ring-2 focus:ring-[#5B3DF6] focus:outline-none font-semibold transition-all duration-200"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-[#5B3DF6] to-[#755FF5] text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSubmitting ? 1 : 1.02, y: isSubmitting ? 0 : -2 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Listing Opportunity...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  🚀 List Opportunity
                </span>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Notification Popup */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Background Overlay */}
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              />

              {/* Notification Card */}
              <motion.div
                className={`relative max-w-md w-full mx-4 rounded-3xl shadow-2xl overflow-hidden ${
                  notification.type === 'success'
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200'
                    : 'bg-gradient-to-br from-red-50 to-rose-50 border-2 border-red-200'
                }`}
                initial={{ scale: 0.7, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.7, y: 50 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                {/* Header */}
                <div className={`px-6 py-4 ${
                  notification.type === 'success'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-red-500 to-rose-500'
                } text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {notification.type === 'success' ? (
                        <CheckCircle size={24} className="text-white" />
                      ) : (
                        <XCircle size={24} className="text-white" />
                      )}
                      <h3 className="font-bold text-lg">{notification.title}</h3>
                    </div>
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className="text-white/80 hover:text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <p className={`text-sm leading-relaxed ${
                    notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {notification.message}
                  </p>

                  {notification.type === 'success' && (
                    <div className="mt-4 flex items-center gap-2 text-green-600">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-medium">Redirecting...</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="px-6 pb-6">
                  <motion.button
                    onClick={() => {
                      setNotification(prev => ({ ...prev, show: false }));
                      if (notification.type === 'success') {
                        router.push("/opportunities");
                      }
                    }}
                    className={`w-full py-3 rounded-full font-semibold text-white transition-all duration-300 ${
                      notification.type === 'success'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {notification.type === 'success' ? '🚀 View Opportunities' : '🔄 Try Again'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}