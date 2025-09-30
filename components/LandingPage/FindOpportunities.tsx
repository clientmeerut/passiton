"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function FindOpportunities() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        className="bg-gradient-to-br from-[#5B3DF6] via-[#755FF5] to-[#8B7BFF] rounded-3xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
          <div className="absolute top-1/2 right-0 w-24 h-24 bg-white rounded-full translate-x-12"></div>
          <div className="absolute bottom-0 left-1/3 w-20 h-20 bg-white rounded-full translate-y-10"></div>
        </div>

        <div className="relative px-8 sm:px-12 py-12 sm:py-16">
          <div className="text-center max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                🚀 Find Amazing Opportunities
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
                Discover jobs, internships, mentorship programs, coaching sessions, and more!
                Connect with opportunities that will accelerate your career growth.
              </p>
            </motion.div>

            {/* Opportunity Categories Preview */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-10"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
            >
              {[
                { icon: "💼", label: "Jobs", count: "50+" },
                { icon: "🎓", label: "Internships", count: "30+" },
                { icon: "👨‍🏫", label: "Mentors", count: "25+" },
                { icon: "📚", label: "Coaching", count: "15+" }
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20"
                >
                  <div className="text-3xl sm:text-4xl mb-2">{item.icon}</div>
                  <div className="text-white font-semibold text-sm sm:text-base mb-1">
                    {item.label}
                  </div>
                  <div className="text-white/80 text-xs sm:text-sm font-medium">
                    {item.count} Available
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/opportunities">
                <motion.button
                  className="group relative px-8 sm:px-12 py-4 sm:py-5 bg-white text-[#5B3DF6] rounded-full font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 overflow-hidden"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Button background animation */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />

                  <span className="relative z-10 flex items-center gap-3">
                    <span>🔍 Explore Opportunities</span>
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Bottom Stats */}
            <motion.div
              className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-white/80 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>New opportunities added daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Connect directly with employers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>100% free to explore</span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}