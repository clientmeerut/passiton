"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Category {
  name: string;
  value: string;
  icon: string;
  bgColor: string;
  hoverColor: string;
  description: string;
}

const categories: Category[] = [
  {
    name: "Books",
    value: "Books",
    icon: "📚",
    bgColor: "bg-blue-100",
    hoverColor: "hover:bg-blue-200",
    description: "Textbooks & Novels"
  },
  {
    name: "Electronics",
    value: "Electronics",
    icon: "💻",
    bgColor: "bg-purple-100",
    hoverColor: "hover:bg-purple-200",
    description: "Gadgets & Devices"
  },
  {
    name: "Furniture",
    value: "Furniture",
    icon: "🪑",
    bgColor: "bg-orange-100",
    hoverColor: "hover:bg-orange-200",
    description: "Tables & Chairs"
  },
  {
    name: "Clothing",
    value: "Clothing",
    icon: "👕",
    bgColor: "bg-pink-100",
    hoverColor: "hover:bg-pink-200",
    description: "Fashion & Apparel"
  },
  {
    name: "Stationery",
    value: "Stationery",
    icon: "✏️",
    bgColor: "bg-green-100",
    hoverColor: "hover:bg-green-200",
    description: "Pens & Supplies"
  },
  {
    name: "Other",
    value: "Other",
    icon: "📦",
    bgColor: "bg-gray-100",
    hoverColor: "hover:bg-gray-200",
    description: "Miscellaneous Items"
  }
];

export default function SearchByCategory() {
  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-[#23185B] mb-4">
          🔍 Browse by Category
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find exactly what you're looking for! Click on any category to explore available items from fellow students.
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-8"
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
        {categories.map((category, index) => (
          <motion.div
            key={category.value}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.5 }}
          >
            <Link href={`/buyer/${category.value}`}>
              <motion.div
                className="group flex flex-col items-center cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Circular Icon Container */}
                <motion.div
                  className={`
                    w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28
                    rounded-full flex items-center justify-center
                    ${category.bgColor} ${category.hoverColor}
                    border-4 border-white shadow-lg
                    transition-all duration-300 ease-in-out
                    group-hover:shadow-xl group-hover:border-[#5B3DF6]
                  `}
                  whileHover={{
                    rotate: [0, -5, 5, -5, 0],
                    transition: { duration: 0.5 }
                  }}
                >
                  <span className="text-3xl sm:text-4xl lg:text-5xl">
                    {category.icon}
                  </span>
                </motion.div>

                {/* Category Name */}
                <motion.h3
                  className="mt-4 text-base sm:text-lg font-bold text-[#23185B] text-center group-hover:text-[#5B3DF6] transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {category.name}
                </motion.h3>

                {/* Category Description */}
                <motion.p
                  className="mt-1 text-xs sm:text-sm text-gray-500 text-center group-hover:text-gray-700 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {category.description}
                </motion.p>

                {/* Hover Effect Indicator */}
                <motion.div
                  className="mt-2 w-0 h-0.5 bg-[#5B3DF6] group-hover:w-12 transition-all duration-300"
                  initial={{ width: 0 }}
                  whileHover={{ width: 48 }}
                />
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="bg-gradient-to-r from-[#5B3DF6] to-[#755FF5] rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">
            Can't find what you're looking for?
          </h3>
          <p className="text-sm sm:text-base mb-4 opacity-90">
            Try our advanced search to find specific items or browse all listings
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link href="/search">
              <motion.button
                className="px-6 py-3 bg-white text-[#5B3DF6] rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🔍 Advanced Search
              </motion.button>
            </Link>
            <Link href="/buyer">
              <motion.button
                className="px-6 py-3 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-[#5B3DF6] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📋 Browse All
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}