"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const seedData = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/seed-opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to seed data');
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Seeding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7ed] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          className="bg-white rounded-3xl shadow-xl p-8 border-2 border-[#E0D5FA]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-[#23185B] mb-6 text-center">
            🔧 Admin Panel - Seed Data
          </h1>

          <p className="text-gray-600 mb-8 text-center">
            Click the button below to populate the database with dummy opportunities data.
            This will create sample jobs, internships, mentorship programs, and coaching opportunities.
          </p>

          <div className="text-center">
            <motion.button
              onClick={seedData}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-[#5B3DF6] to-[#755FF5] text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Seeding Data...
                </div>
              ) : (
                '🌱 Seed Dummy Data'
              )}
            </motion.button>
          </div>

          {/* Results */}
          {result && (
            <motion.div
              className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-bold text-green-800 mb-3">✅ Success!</h3>
              <p className="text-green-700 mb-2">{result.message}</p>
              <div className="text-sm text-green-600">
                <p>• Opportunities created: {result.data?.opportunities}</p>
                <p>• Users created: {result.data?.users}</p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              className="mt-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-bold text-red-800 mb-2">❌ Error</h3>
              <p className="text-red-700">{error}</p>
            </motion.div>
          )}

          {/* Instructions */}
          <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
            <h3 className="text-lg font-bold text-blue-800 mb-3">📝 What this does:</h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li>• Creates 3 dummy user accounts for posting opportunities</li>
              <li>• Adds 5 job opportunities with different companies and locations</li>
              <li>• Adds 5 internship opportunities for students</li>
              <li>• Includes mentorship and coaching programs</li>
              <li>• All opportunities will be visible on the /opportunities page</li>
              <li>• Featured opportunities will appear in the featured section</li>
            </ul>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/opportunities"
              className="text-[#5B3DF6] hover:text-[#4C33D4] font-semibold underline"
            >
              → View Opportunities Page
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}