'use client'

import React, { useState, useEffect, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8085/api/admin';

export default function CustomerReceiptRecord() {
  // STATE
  const [receiptData, setReceiptData] = useState([]);
  const [totals, setTotals] = useState({
    totalReceipts: 0, totalDiscounts: 0, totalNet: 0, count: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FILTER STATE
  const [filterType, setFilterType] = useState('All');
  const [recordType, setRecordType] = useState('without details');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // DATE PICKERS
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);

  // FILTER OPTIONS
  const filterOptions = ['All', 'Today', 'This Week', 'This Month', 'Custom Range'];
  const recordTypeOptions = ['without details', 'with details', 'summary only'];

  // UTILS
  const formatDateForDisplay = dateStr => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };



  const safeToFixed = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    return Number(value).toFixed(decimals);
  };

  // DATA FETCHER
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        filterType,
        recordType,
        ...(filterType === 'Custom Range' ? { fromDate, toDate } : {}),
        search: searchTerm,
        page: currentPage.toString(),
        limit: rowsPerPage.toString()
      }).toString();

      const res = await fetch(`${API_BASE_URL}/customer-receipts?${params}`, {
        method: 'GET',
        
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (data.success) {
        // Ensure all data has safe defaults
        const safeData = (data.data || []).map(record => ({
          ...record,
          receiptAmount: record.receiptAmount || 0,
          discountAmount: record.discountAmount || 0,
          netAmount: record.netAmount || 0,
          customerName: record.customerName || '',
          receiptNo: record.receiptNo || '',
          invoiceNo: record.invoiceNo || '',
          paymentMethod: record.paymentMethod || 'Cash',
          collectedBy: record.collectedBy || 'System',
          remarks: record.remarks || ''
        }));

        setReceiptData(safeData);
        setTotals(data.totals || {
          totalReceipts: 0, totalDiscounts: 0, totalNet: 0, count: 0
        });
        setPagination(data.pagination || {
          currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false
        });
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }

    } catch (e) {
      console.error('Fetch error:', e);
      setError(e.message || 'Network error');
      setReceiptData([]);
      setTotals({ totalReceipts: 0, totalDiscounts: 0, totalNet: 0, count: 0 });
      setPagination({ currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false });
    } finally {
      setLoading(false);
    }
  }, [filterType, recordType, fromDate, toDate, searchTerm, currentPage, rowsPerPage]);

  // TRIGGER FETCH
  useEffect(() => {
    if (showReport) {
      fetchData();
    }
  }, [showReport, fetchData, currentPage, rowsPerPage]);

  // FILTER LOGIC
  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setCurrentPage(1);
    if (type !== 'Custom Range') {
      const now = new Date();
      let start, end;
      switch (type) {
        case 'Today':
          start = end = now.toISOString().split('T')[0];
          break;
        case 'This Week':
          const wstart = new Date(now);
          wstart.setDate(now.getDate() - now.getDay());
          const wend = new Date(wstart);
          wend.setDate(wstart.getDate() + 6);
          start = wstart.toISOString().split('T')[0];
          end = wend.toISOString().split('T')[0];
          break;
        case 'This Month':
          start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
        default:
          start = end = today;
      }
      setFromDate(start);
      setToDate(end);
    }
  };

  const handleGetReport = () => {
    setShowReport(true);
    setCurrentPage(1);
    fetchData();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearch(false);
    setCurrentPage(1);
    fetchData();
  };

  // EXPORT
  const handleExport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filterType,
        recordType,
        ...(filterType === 'Custom Range' ? { fromDate, toDate } : {}),
        search: searchTerm
      }).toString();

      const res = await fetch(`${API_BASE_URL}/customer-receipts/export?${params}`, {
        method: 'GET',
      
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `customer_receipt_record_${formatDateForDisplay(fromDate)}_to_${formatDateForDisplay(toDate)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || 'Export error');
    } finally {
      setLoading(false);
    }
  };

  // PRINT
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Customer Receipt Record</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0d9488; }
            .amount { text-align: right; }
            .header-info { margin: 20px 0; }
            .totals { background-color: #f9f9f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Customer Receipt Record</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Period: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}</p>
            <p>Filter Type: ${filterType}</p>
            <p>Record Type: ${recordType}</p>
            <p>Total Records: ${totals.count}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Receipt No</th>
                <th>Customer Name</th>
                <th>Institution</th>
                <th>Invoice No</th>
                <th>Receipt Amount</th>
                <th>Discount</th>
                <th>Net Amount</th>
                <th>Payment Method</th>
                <th>Collected By</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${receiptData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${formatDateForDisplay(entry.date)}</td>
                  <td>${entry.receiptNo}</td>
                  <td>${entry.customerName}</td>
                  <td>${entry.institutionName || ''}</td>
                  <td>${entry.invoiceNo}</td>
                  <td class="amount">${safeToFixed(entry.receiptAmount)}</td>
                  <td class="amount">${safeToFixed(entry.discountAmount)}</td>
                  <td class="amount">${safeToFixed(entry.netAmount)}</td>
                  <td>${entry.paymentMethod}</td>
                  <td>${entry.collectedBy}</td>
                  <td>${entry.remarks}</td>
                </tr>
              `).join('')}
              <tr class="totals">
                <td colspan="6">TOTAL</td>
                <td class="amount">${safeToFixed(totals.totalReceipts)}</td>
                <td class="amount">${safeToFixed(totals.totalDiscounts)}</td>
                <td class="amount">${safeToFixed(totals.totalNet)}</td>
                <td colspan="3"></td>
              </tr>
            </tbody>
          </table>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-4">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="mt-2 text-sm text-red-600 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Customer Receipt Record</h2>
        </div>

        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => handleFilterTypeChange(e.target.value)}
              >
                {filterOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
              <select
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
              >
                {recordTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setFilterType('Custom Range');
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setFilterType('Custom Range');
                }}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGetReport}
                disabled={loading}
                className="bg-teal-500 text-white mt-7 px-6 py-2 rounded text-sm hover:bg-teal-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                🔍 GET REPORT
              </button>
            </div>
          </div>

          {/* Date Range Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Selected Period:</strong> {formatDateForDisplay(fromDate)} to {formatDateForDisplay(toDate)}
              {filterType !== 'All' && filterType !== 'Custom Range' && (
                <span className="ml-2 text-blue-600">({filterType})</span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {showReport && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Customer Receipt Record</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors"
                  title="Search"
                >
                  🔍
                </button>
                <button
                  onClick={handleExport}
                  disabled={loading}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Export to CSV"
                >
                  📤
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors"
                  title="Print"
                >
                  🖨️
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700">Total Receipts</h4>
                <p className="text-xl font-bold text-blue-900">{totals.count}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-700">Receipt Amount</h4>
                <p className="text-xl font-bold text-green-900">{safeToFixed(totals.totalReceipts)}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-yellow-700">Total Discount</h4>
                <p className="text-xl font-bold text-yellow-900">{safeToFixed(totals.totalDiscounts)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-700">Net Amount</h4>
                <p className="text-xl font-bold text-purple-900">{safeToFixed(totals.totalNet)}</p>
              </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by customer, receipt no, invoice no, institution, contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  Search
                </button>
                <button
                  onClick={handleClearSearch}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">SL</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Date</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Receipt No</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Customer Name</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Institution</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Invoice No</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Receipt Amount</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Discount</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Net Amount</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Payment Method</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Collected By</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {receiptData.length > 0 ? (
                    receiptData.map((entry) => (
                      <tr key={entry._id || entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 text-xs">{entry.sl}</td>
                        <td className="py-2 px-2 text-xs">{formatDateForDisplay(entry.date)}</td>
                        <td className="py-2 px-2 text-xs font-medium text-blue-600">{entry.receiptNo}</td>
                        <td className="py-2 px-2 text-xs font-medium">{entry.customerName}</td>
                        <td className="py-2 px-2 text-xs">{entry.institutionName || ''}</td>
                        <td className="py-2 px-2 text-xs text-blue-600">{entry.invoiceNo}</td>
                        <td className="py-2 px-2 text-xs text-right font-medium">{safeToFixed(entry.receiptAmount)}</td>
                        <td className="py-2 px-2 text-xs text-right">
                          <span className={(entry.discountAmount || 0) > 0 ? 'text-red-600' : 'text-gray-900'}>
                            {safeToFixed(entry.discountAmount)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs text-right font-medium text-green-600">{safeToFixed(entry.netAmount)}</td>
                        <td className="py-2 px-2 text-xs">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.paymentMethod === 'Cash' ? 'bg-green-100 text-green-800' :
                            entry.paymentMethod === 'Bank Transfer' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs font-medium text-indigo-600">{entry.collectedBy}</td>
                        <td className="py-2 px-2 text-xs text-gray-600">{entry.remarks}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="12" className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No matching records found' : 'No data available for the selected date range'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {pagination.totalRecords === 0
                    ? '0-0 of 0'
                    : `${((currentPage - 1) * rowsPerPage) + 1}-${Math.min(currentPage * rowsPerPage, pagination.totalRecords)} of ${pagination.totalRecords}`
                  }
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={!pagination.hasPrev}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.hasNext}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
