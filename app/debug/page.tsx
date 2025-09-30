"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [debugData, setDebugData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [publicData, setPublicData] = useState<any>(null);

  useEffect(() => {
    // Fetch debug data
    fetch('/api/debug-opportunities')
      .then(res => res.json())
      .then(data => {
        setDebugData(data);
      })
      .catch(error => {
        console.error('Debug fetch error:', error);
      });

    // Fetch public opportunities data
    fetch('/api/opportunities/public')
      .then(res => res.json())
      .then(data => {
        setPublicData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Public fetch error:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading debug info...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🐛 Debug Opportunities</h1>

        {/* Debug Info */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Database Debug Info</h2>
          {debugData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {debugData.debug?.totalOpportunities || 0}
                  </div>
                  <div className="text-sm text-blue-800">Total Opportunities</div>
                </div>
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {debugData.debug?.activeOpportunities || 0}
                  </div>
                  <div className="text-sm text-green-800">Active Opportunities</div>
                </div>
                <div className="bg-red-50 p-4 rounded">
                  <div className="text-2xl font-bold text-red-600">
                    {debugData.debug?.inactiveOpportunities || 0}
                  </div>
                  <div className="text-sm text-red-800">Inactive Opportunities</div>
                </div>
              </div>

              {debugData.debug?.allOpportunities && debugData.debug.allOpportunities.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">All Opportunities in Database:</h3>
                  <div className="bg-gray-50 p-4 rounded max-h-60 overflow-y-auto">
                    {debugData.debug.allOpportunities.map((opp: any, index: number) => (
                      <div key={opp.id} className="border-b py-2 last:border-b-0">
                        <div className="font-medium">{index + 1}. {opp.title}</div>
                        <div className="text-sm text-gray-600">
                          {opp.company} | {opp.type} | Active: {opp.active ? '✅' : '❌'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-red-600">Failed to load debug data</p>
          )}
        </div>

        {/* Public API Response */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-bold mb-4">Public API Response</h2>
          {publicData ? (
            <div>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded text-sm font-medium ${
                  publicData.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {publicData.success ? 'Success' : 'Error'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm font-medium mb-2">
                  Opportunities returned: {publicData.opportunities?.length || 0}
                </div>

                {publicData.opportunities && publicData.opportunities.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto">
                    {publicData.opportunities.map((opp: any, index: number) => (
                      <div key={opp._id} className="text-sm py-1">
                        {index + 1}. {opp.title} ({opp.company})
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-red-600 text-sm">No opportunities returned from public API</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-red-600">Failed to load public API data</p>
          )}
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="space-y-2">
            <a
              href="/admin/seed"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🌱 Go to Seed Data Page
            </a>
            <br />
            <a
              href="/opportunities"
              className="inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              👀 View Opportunities Page
            </a>
            <br />
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              🔄 Refresh Debug Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}