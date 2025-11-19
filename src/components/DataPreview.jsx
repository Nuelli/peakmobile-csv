import React, { useState, useRef } from 'react';
import { Download, RotateCcw, AlertCircle, CheckCircle, Trash2, Edit2, Save, X } from 'lucide-react';
import { saveAs } from 'file-saver';

function DataPreview({ data, columns, isProcessed, phoneColumn, bundleColumn, onProcessData, onEditRow, onDeleteRow, onReset }) {
  const [selectedPhoneCol, setSelectedPhoneCol] = useState(phoneColumn);
  const [selectedBundleCol, setSelectedBundleCol] = useState(bundleColumn);
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [errorPopup, setErrorPopup] = useState(null);
  const [downloadPopup, setDownloadPopup] = useState(null);
  const tableScrollRef = useRef(null);
  const topScrollRef = useRef(null);
  const tableRef = useRef(null);

  const handleProcessClick = () => {
    onProcessData(selectedPhoneCol, selectedBundleCol);
  };

  const handleDownloadRequest = (validOnly = false) => {
    if (!isProcessed) {
      alert('Please process the data first');
      return;
    }
    
    // Show download options popup
    setDownloadPopup({ validOnly });
  };

  const handleExportCSV = (validOnly = false, includeTelco = false) => {
    let exportData = data;
    
    // Filter to valid records only if requested
    if (validOnly) {
      exportData = data.filter(row => row._isValid);
      if (exportData.length === 0) {
        alert('No valid records found to export');
        return;
      }
    }

    const processedData = exportData.map(row => {
      const newRow = { ...row };
      // Replace original phone column with formatted phone number
      if (phoneColumn && row._formattedPhone) {
        newRow[phoneColumn] = row._formattedPhone;
      }
      // Add telco column if requested
      if (includeTelco && row._telco) {
        newRow['Telco'] = row._telco;
      }
      // Remove internal fields
      delete newRow._index;
      delete newRow._originalPhone;
      delete newRow._formattedPhone;
      delete newRow._isValid;
      delete newRow._errors;
      delete newRow._telco;
      delete newRow._edited;
      return newRow;
    });

    const headers = Object.keys(processedData[0] || {});
    const csv = [
      headers.join(','),
      ...processedData.map(row =>
        headers.map(h => {
          const val = row[h];
          if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
            return `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        }).join(',')
      )
    ].join('\n');

    const telcoSuffix = includeTelco ? '_with_telco' : '';
    const filename = validOnly ? `valid_records_only${telcoSuffix}.csv` : `cleaned_data${telcoSuffix}.csv`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, filename);
    
    // Close popup
    setDownloadPopup(null);
  };

  const handleEditStart = (rowIndex, field) => {
    setEditingCell({ rowIndex, field });
    setEditValue(data[rowIndex][field] || '');
  };

  const handleEditSave = (rowIndex, field) => {
    if (field === selectedPhoneCol) {
      // For phone column, save to _originalPhone field to trigger revalidation
      onEditRow(rowIndex, '_originalPhone', editValue);
    } else {
      // For other columns, save directly to the field
      onEditRow(rowIndex, field, editValue);
    }
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
                className="w-full text-white font-semibold py-2 px-4 rounded-lg transition"
                style={{ backgroundColor: '#151E3D' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#a84a03ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#151E3D'}
              >
                Validate & Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Horizontal Scrollbar */}
      <div className="mb-2 overflow-x-auto" ref={topScrollRef} onScroll={(e) => {
        if (tableScrollRef.current) {
          tableScrollRef.current.scrollLeft = e.target.scrollLeft;
        }
      }}>
        <div style={{ width: tableRef.current?.scrollWidth || '100%', height: '8px', minWidth: '100%' }} />
      </div>

      {/* Data Table */}
      <div className="mb-6 overflow-x-auto" ref={tableScrollRef} onScroll={(e) => {
        if (topScrollRef.current) {
          topScrollRef.current.scrollLeft = e.target.scrollLeft;
        }
        // Update top scrollbar width when table scrolls
        if (topScrollRef.current && tableRef.current) {
          const topInner = topScrollRef.current.querySelector('div');
          if (topInner) {
            topInner.style.width = tableRef.current.scrollWidth + 'px';
          }
        }
      }}>
        <table className="w-full text-sm" ref={tableRef}>
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
                      <div 
                        className="flex items-center gap-1 cursor-pointer rounded px-2 py-1 transition"
                        onClick={() => setErrorPopup({ rowIndex: idx, errors: row._errors || [] })}
                        title="Click to view errors"
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        <span className="text-red-700 text-xs font-semibold">Invalid</span>
                      </div>
                    )}
                  </td>
                )}
                {columns.map(col => (
                  <td key={col} className="px-4 py-3 text-gray-700">
                    {editingCell?.rowIndex === idx && editingCell?.field === col ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="flex-1 px-2 py-1 border border-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSave(idx, col);
                            if (e.key === 'Escape') handleEditCancel();
                          }}
                        />
                        <button
                          onClick={() => handleEditSave(idx, col)}
                          className="p-1 text-green-600 rounded transition"
                          title="Save"
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="p-1 text-gray-600 rounded transition"
                          title="Cancel"
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        className={`flex items-center gap-2 rounded px-1 py-1 transition group ${
                          isProcessed ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
                        }`}
                        onClick={() => isProcessed && handleEditStart(idx, col)}
                        title={isProcessed ? 'Click to edit' : 'Process data first to edit'}
                        onMouseEnter={(e) => isProcessed && (e.target.style.backgroundColor = '#dbeafe')}
                        onMouseLeave={(e) => isProcessed && (e.target.style.backgroundColor = 'transparent')}
                      >
                        <span>{row[col]}</span>
                        {isProcessed && <Edit2 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                      </div>
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
                        <button
                          onClick={() => onDeleteRow(idx)}
                          className="p-1 text-red-600 rounded transition"
                          title="Delete Row"
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#dbeafe'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
          <>
            <button
              onClick={() => handleDownloadRequest(false)}
              className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-lg transition"
              style={{ backgroundColor: '#151E3D' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#a84a03ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#151E3D'}
            >
              <Download className="w-4 h-4" />
              Download CSV
            </button>
            <button
              onClick={() => handleDownloadRequest(true)}
              className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-lg transition"
              style={{ backgroundColor: '#151E3D' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#a84a03ff'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#151E3D'}
            >
              <Download className="w-4 h-4" />
              Download Valid Records Only
            </button>
          </>
        )}
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-white font-semibold py-2 px-4 rounded-lg transition"
          style={{ backgroundColor: '#151E3D' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#a84a03ff'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#151E3D'}
        >
          <RotateCcw className="w-4 h-4" />
          Upload New File
        </button>
      </div>

      {/* Error Popup Modal */}
      {errorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setErrorPopup(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Row {errorPopup.rowIndex + 1} - Validation Errors
              </h3>
              <button
                onClick={() => setErrorPopup(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {errorPopup.errors.length > 0 ? (
                errorPopup.errors.map((error, idx) => (
                  <div key={idx} className="bg-red-50 border border-red-200 rounded p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-sm">No specific errors found.</p>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setErrorPopup(null)}
                className="px-4 py-2 text-white rounded-lg transition"
                style={{ backgroundColor: '#151E3D' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#a84a03ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#151E3D'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Options Popup Modal */}
      {downloadPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setDownloadPopup(null)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Download className="w-5 h-5 text-blue-600" />
                Download Options
              </h3>
              <button
                onClick={() => setDownloadPopup(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 text-sm mb-4">
                {downloadPopup.validOnly 
                  ? 'Download valid records only with the following options:'
                  : 'Download all processed records with the following options:'
                }
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => handleExportCSV(downloadPopup.validOnly, false)}
                  className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-gray-600" />
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Standard CSV</p>
                      <p className="text-sm text-gray-600">Original columns with cleaned phone numbers</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleExportCSV(downloadPopup.validOnly, true)}
                  className="w-full flex items-center justify-between p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition bg-blue-25"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-blue-600" />
                    <div className="text-left">
                      <p className="font-medium text-blue-900">CSV with Telco Column</p>
                      <p className="text-sm text-blue-700">Includes an additional 'Telco' column with provider information</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDownloadPopup(null)}
                className="px-4 py-2 text-white rounded-lg transition"
                style={{ backgroundColor: '#151E3D' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#a84a03ff'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#151E3D'}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataPreview;
