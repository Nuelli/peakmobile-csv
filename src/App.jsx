import React, { useState } from 'react';
import CSVUploader from './components/CSVUploader';
import DataPreview from './components/DataPreview';
import SummaryDashboard from './components/SummaryDashboard';
import { validateAndFormatPhone, detectTelco } from './utils/phoneValidator';
import { Upload } from 'lucide-react';

function App() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [phoneColumn, setPhoneColumn] = useState(null);
  const [bundleColumn, setBundleColumn] = useState(null);
  const [processedData, setProcessedData] = useState([]);
  const [stats, setStats] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'

  const handleCSVUpload = (parsedData, headers) => {
    setData(parsedData);
    setColumns(headers);
    setPhoneColumn(null);
    setBundleColumn(null);
    setProcessedData([]);
    setStats(null);
    setSortDirection('desc'); // Reset sort direction on new upload
  };

  const handleProcessData = (phoneCol, bundleCol) => {
    if (!phoneCol) {
      alert('Please select a phone number column');
      return;
    }

    setPhoneColumn(phoneCol);
    setBundleColumn(bundleCol);

    // Process data
    const processed = data.map((row, index) => {
      const phone = row[phoneCol];
      const validation = validateAndFormatPhone(phone);
      const telco = validation.isValid ? detectTelco(validation.formatted) : null;

      return {
        ...row,
        _index: index,
        _originalPhone: phone,
        _formattedPhone: validation.formatted,
        _isValid: validation.isValid,
        _errors: validation.errors,
        _telco: telco,
        _edited: false
      };
    });

    setProcessedData(processed);
    calculateStats(processed, phoneCol, bundleCol);
  };

  const calculateStats = (data, phoneCol, bundleCol) => {
    const validCount = data.filter(row => row._isValid).length;
    const invalidCount = data.length - validCount;
    const duplicates = new Set();
    const seenPhones = new Set();

    data.forEach(row => {
      if (row._isValid) {
        if (seenPhones.has(row._formattedPhone)) {
          duplicates.add(row._formattedPhone);
        }
        seenPhones.add(row._formattedPhone);
      }
    });

    const telcoCounts = {};
    data.forEach(row => {
      if (row._telco) {
        telcoCounts[row._telco] = (telcoCounts[row._telco] || 0) + 1;
      }
    });

    setStats({
      totalRecords: data.length,
      validRecords: validCount,
      invalidRecords: invalidCount,
      duplicateCount: duplicates.size,
      telcoCounts
    });
  };

  const handleEditRow = (index, field, value) => {
    const updated = [...processedData];
    updated[index] = { ...updated[index], [field]: value, _edited: true };
    
    if (field === '_originalPhone') {
      const validation = validateAndFormatPhone(value);
      const telco = validation.isValid ? detectTelco(validation.formatted) : null;
      updated[index]._formattedPhone = validation.formatted;
      updated[index]._isValid = validation.isValid;
      updated[index]._errors = validation.errors;
      updated[index]._telco = telco;
      // Also update the original column data so it displays the new value
      if (phoneColumn) {
        updated[index][phoneColumn] = value;
      }
    }
    
    setProcessedData(updated);
    calculateStats(updated, phoneColumn, bundleColumn);
  };

  const handleDeleteRow = (index) => {
    const updated = processedData.filter((_, i) => i !== index);
    setProcessedData(updated);
    calculateStats(updated, phoneColumn, bundleColumn);
  };

  const handleRemoveDuplicates = () => {
    const seen = new Set();
    const updated = processedData.filter(row => {
      if (row._isValid) {
        if (seen.has(row._formattedPhone)) {
          return false;
        }
        seen.add(row._formattedPhone);
      }
      return true;
    });
    setProcessedData(updated);
    calculateStats(updated, phoneColumn, bundleColumn);
  };

  const handleSortByBundle = () => {
    if (!bundleColumn) {
      alert('Please select a bundle column to sort');
      return;
    }
    const newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
    const updated = [...processedData].sort((a, b) => {
      const aVal = parseFloat(a[bundleColumn]) || 0;
      const bVal = parseFloat(b[bundleColumn]) || 0;
      if (newDirection === 'desc') {
        return bVal - aVal; // Largest to smallest
      } else {
        return aVal - bVal; // Smallest to largest
      }
    });
    setProcessedData(updated);
    setSortDirection(newDirection);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/peak-logo.png" alt="PeakMobile" className="h-28" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CSV Data Cleaner</h1>
                <p className="text-gray-600">Smart Data Validation & Cleaning Tool</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {!data.length ? (
          <CSVUploader onUpload={handleCSVUpload} />
        ) : (
          <div className="space-y-6">
            {stats && (
              <SummaryDashboard
                stats={stats}
                onRemoveDuplicates={handleRemoveDuplicates}
                onSortByBundle={handleSortByBundle}
                bundleColumn={bundleColumn}
                sortDirection={sortDirection}
              />
            )}
            <DataPreview
              data={processedData.length ? processedData : data}
              columns={columns}
              isProcessed={processedData.length > 0}
              phoneColumn={phoneColumn}
              bundleColumn={bundleColumn}
              onProcessData={handleProcessData}
              onEditRow={handleEditRow}
              onDeleteRow={handleDeleteRow}
              onReset={() => {
                setData([]);
                setColumns([]);
                setPhoneColumn(null);
                setBundleColumn(null);
                setProcessedData([]);
                setStats(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
