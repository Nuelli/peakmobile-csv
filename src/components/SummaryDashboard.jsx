import React from 'react';
import { BarChart3, AlertTriangle, CheckCircle, Trash2, SortAsc } from 'lucide-react';

function SummaryDashboard({ stats, onRemoveDuplicates, onSortByBundle, bundleColumn }) {
  if (!stats) return null;

  const validPercentage = stats.totalRecords > 0 ? Math.round((stats.validRecords / stats.totalRecords) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-6 h-6 text-indigo-600" />
        <h2 className="text-2xl font-bold text-gray-900">Data Summary</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Total Records */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-600 text-sm font-semibold">Total Records</p>
          <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalRecords}</p>
        </div>

        {/* Valid Records */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-semibold">Valid Records</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.validRecords}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-green-700 text-xs mt-2">{validPercentage}% valid</p>
        </div>

        {/* Invalid Records */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-semibold">Invalid Records</p>
              <p className="text-3xl font-bold text-red-900 mt-1">{stats.invalidRecords}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>

        {/* Duplicates */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-orange-600 text-sm font-semibold">Duplicate Numbers</p>
          <p className="text-3xl font-bold text-orange-900 mt-1">{stats.duplicateCount}</p>
        </div>
      </div>

      {/* Telco Distribution */}
      {Object.keys(stats.telcoCounts).length > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Telco Distribution</h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Approximate*</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats.telcoCounts).map(([telco, count]) => (
              <div key={telco} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-600 text-sm font-medium">{telco}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{count}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-3">* Results are approximate due to number portability in Kenya. Actual telco may differ from detected provider.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {stats.duplicateCount > 0 && (
          <button
            onClick={onRemoveDuplicates}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
            Remove Duplicates ({stats.duplicateCount})
          </button>
        )}
        {bundleColumn && (
          <button
            onClick={onSortByBundle}
            className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-lg transition"
            style={{ backgroundColor: '#151E3D' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#CC5801'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#151E3D'}
          >
            <SortAsc className="w-4 h-4" />
            Sort by Bundle Size
          </button>
        )}
      </div>
    </div>
  );
}

export default SummaryDashboard;
