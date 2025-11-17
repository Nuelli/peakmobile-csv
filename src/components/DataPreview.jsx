import React, { useState } from 'react';
import { Download, RotateCcw, AlertCircle, CheckCircle, Trash2, Edit2, Save, X } from 'lucide-react';
import { saveAs } from 'file-saver';

function DataPreview({ data, columns, isProcessed, phoneColumn, bundleColumn, onProcessData, onEditRow, onDeleteRow, onReset }) {
  const [selectedPhoneCol, setSelectedPhoneCol] = useState(phoneColumn);
  const [selectedBundleCol, setSelectedBundleCol] = useState(bundleColumn);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleProcessClick = () => {
    onProcessData(selectedPhoneCol, selectedBundleCol);
  };

  const handleExportCSV = () => {
    if (!isProcessed) {
      alert('Please process the data first');
      return;
    }

    const exportData = data.map(row => {
      const newRow = { ...row };
      delete newRow._index;
      delete newRow._originalPhone;
      delete newRow._formattedPhone;
      delete newRow._isValid;
      delete newRow._errors;
      delete newRow._telco;
      delete newRow._edited;
      return newRow;
    });

    const headers = Object.keys(exportData[0] || {});
    const csv = [
      headers.join(','),
      ...exportData.map(row =>
        headers.map(h => {
          const val = row[h];
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'cleaned_data.csv');
  };

  const handleEditStart = (rowIndex, field) => {
    setEditingCell({ rowIndex, field });
    setEditValue(data[rowIndex][field] || '');
  };

  const handleEditSave = (rowIndex, field) => {
    onEditRow(rowIndex, field, editValue);
    setEditingCell(null);
  };

  const handleEditCancel = () => {
    setEditingCell(null);
  };

  if (!data.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Column Selection */}
      {!isProcessed && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configure Columns</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number Column *
              </label>
              <select
                value={selectedPhoneCol || ''}
                onChange={(e) => setSelectedPhoneCol(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select column...</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bundle Size Column (Optional)
              </label>
              <select
                value={selectedBundleCol || ''}
                onChange={(e) => setSelectedBundleCol(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">None</option>
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleProcessClick}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Validate & Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left font-semibold text-gray-700 w-12">No.</th>
              {isProcessed && <th className="px-4 py-3 text-left font-semibold text-gray-700 w-20">Status</th>}
              {columns.map(col => (
                <th key={col} className="px-4 py-3 text-left font-semibold text-gray-700">
                  {col}
                  {col === selectedPhoneCol && <span className="text-indigo-600 ml-1">📱</span>}
                  {col === selectedBundleCol && <span className="text-purple-600 ml-1">📦</span>}
                </th>
              ))}
              {isProcessed && (
                <>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Formatted Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Telco</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 w-24">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx} className={`border-b border-gray-200 hover:bg-gray-50 ${
                isProcessed && !row._isValid ? 'bg-red-50' : ''
              }`}>
                <td className="px-4 py-3 text-gray-700 font-medium">{idx + 1}</td>
                {isProcessed && (
                  <td className="px-4 py-3">
                    {row._isValid ? (
                      <div className="flex items-center gap-1">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-700 text-xs font-semibold">Valid</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 text-xs font-semibold">Invalid</span>
                      </div>
                    )}
                  </td>
                )}
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 text-gray-700">
                    {editingCell?.rowIndex === idx && editingCell?.field === col ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                    ) : (
                      <span>{row[col]}</span>
                    )}
                  </td>
                ))}
                {isProcessed && (
                  <>
                    <td className="px-4 py-3 text-gray-700">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        row._isValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row._formattedPhone || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {row._telco ? (
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                          {row._telco}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editingCell?.rowIndex === idx ? (
                          <>
                            <button
                              onClick={() => handleEditSave(idx, selectedPhoneCol)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="p-1 text-gray-600 hover:bg-gray-200 rounded transition"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditStart(idx, selectedPhoneCol)}
                              className="p-1 text-blue-600 hover:bg-blue-100 rounded transition"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteRow(idx)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Error Messages */}
      {isProcessed && data.some(row => row._errors?.length > 0) && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Validation Errors
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.map((row, idx) => (
              row._errors?.length > 0 && (
                <div key={idx} className="text-sm text-red-800">
                  <strong>Row {idx + 1}:</strong> {row._errors.join(', ')}
                </div>
              )
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {isProcessed && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Download Cleaned CSV
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          <RotateCcw className="w-4 h-4" />
          Upload New File
        </button>
      </div>
    </div>
  );
}

export default DataPreview;
