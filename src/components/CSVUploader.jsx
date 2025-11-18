import React, { useRef } from 'react';
import Papa from 'papaparse';
import { Upload, AlertCircle } from 'lucide-react';

function CSVUploader({ onUpload }) {
  const fileInputRef = useRef(null);
  const [error, setError] = React.useState(null);
  const [fileName, setFileName] = React.useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      return;
    }

    setError(null);
    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data.length === 0) {
          setError('CSV file is empty');
          return;
        }
        const headers = results.meta.fields || Object.keys(results.data[0]);
        onUpload(results.data, headers);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <Upload className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload CSV File</h2>
          <p className="text-gray-600 mb-6">
            Select a CSV file containing customer data (phone numbers, airtime allocations, etc.)
          </p>

          <div 
            className="border-2 border-dashed border-indigo-300 rounded-lg p-8 mb-6 transition"
            onMouseEnter={(e) => e.target.style.borderColor = '#CC5801'}
            onMouseLeave={(e) => e.target.style.borderColor = '#a5b4fc'}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-white font-semibold py-3 px-6 rounded-lg transition"
              style={{ backgroundColor: '#151E3D' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#CC5801'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#151E3D'}
            >
              Choose CSV File
            </button>
            {fileName && (
              <p className="text-sm text-gray-600 mt-3">Selected: <span className="font-semibold">{fileName}</span></p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-red-800 font-semibold">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Your CSV should have columns for phone numbers and optionally bundle sizes. The tool will automatically validate and format the data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CSVUploader;
