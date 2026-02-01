'use client'

import { useState, useEffect } from 'react'
import url from '../../../url'

// API Functions
const fetchAccounts = async () => {
  try {
    const response = await fetch(`${url.API_URL}/accounts`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
};

const fetchContraEntries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    
    const response = await fetch(`${url.API_URL}/contra-entries?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching contra entries:', error);
    return { success: false, data: [], pagination: {} };
  }
};

const createContraEntry = async (contraData) => {
  try {
    const response = await fetch(`${url.API_URL}/contra-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contraData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating contra entry:', error);
    return { success: false, message: 'Failed to create contra entry' };
  }
};

const updateContraEntry = async (id, contraData) => {
  try {
    const response = await fetch(`${url.API_URL}/contra-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contraData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating contra entry:', error);
    return { success: false, message: 'Failed to update contra entry' };
  }
};

const deleteContraEntry = async (id) => {
  try {
    const response = await fetch(`${url.API_URL}/contra-entries/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting contra entry:', error);
    return { success: false, message: 'Failed to delete contra entry' };
  }
};

const getNextContraCode = async () => {
  try {
    const response = await fetch(`${url.API_URL}/contra-entries/utils/next-code`);
    const data = await response.json();
    return data.data?.contraCode || 'CON-1';
  } catch (error) {
    console.error('Error getting next contra code:', error);
    return 'CON-1';
  }
};

export default function ContraSingleEntry() {
  const [formData, setFormData] = useState({
    fromAccount: '',
    toAccount: '',
    transactionAmount: '',
    contraCode: 'CON-1',
    contraDate: new Date().toISOString().split('T')[0],
    narration: ''
  });

  // States
  const [accounts, setAccounts] = useState([]);
  const [contraEntries, setContraEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [accountData, nextCode] = await Promise.all([
          fetchAccounts(),
          getNextContraCode()
        ]);
        
        const activeAccounts = Array.isArray(accountData) 
          ? accountData.filter(acc => acc.isActive !== false) 
          : [];
        setAccounts(activeAccounts);
        setFormData(prev => ({ ...prev, contraCode: nextCode }));
        
        await loadContraEntries();
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load contra entries
  const loadContraEntries = async (params = {}) => {
    try {
      const result = await fetchContraEntries({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        ...params
      });
      
      if (result.success) {
        setContraEntries(result.data || []);
        setPagination(result.pagination || {});
      } else {
        setContraEntries([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Error loading contra entries:', error);
      setContraEntries([]);
      setPagination({});
    }
  };

  // Reload entries when page or search changes
  useEffect(() => {
    if (accounts.length > 0) {
      const timeoutId = setTimeout(() => {
        loadContraEntries();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, rowsPerPage, searchTerm, accounts]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveContra = async () => {
    // Validation
    if (!formData.fromAccount || !formData.toAccount || !formData.transactionAmount) {
      setError('From account, to account, and transaction amount are required');
      return;
    }

    if (parseFloat(formData.transactionAmount) <= 0) {
      setError('Transaction amount must be greater than 0');
      return;
    }

    if (formData.fromAccount === formData.toAccount) {
      setError('From account and To account must be different');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const contraData = {
        fromAccount: formData.fromAccount,
        toAccount: formData.toAccount,
        transactionAmount: parseFloat(formData.transactionAmount),
        contraDate: formData.contraDate,
        contraCode: formData.contraCode,
        narration: formData.narration
      };

      let result;
      if (editingEntry) {
        result = await updateContraEntry(editingEntry._id, contraData);
      } else {
        result = await createContraEntry(contraData);
      }

      if (result.success) {
        await loadContraEntries();
        await resetForm();
        setEditingEntry(null);
      } else {
        setError(result.message || 'Failed to save contra entry');
      }
    } catch (error) {
      console.error('Error saving contra:', error);
      setError('Failed to save contra entry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    const nextCode = await getNextContraCode();
    setFormData({
      fromAccount: '',
      toAccount: '',
      transactionAmount: '',
      contraCode: nextCode,
      contraDate: new Date().toISOString().split('T')[0],
      narration: ''
    });
    setEditingEntry(null);
    setError('');
  };

  const handleEditEntry = (entry) => {
    setFormData({
      fromAccount: entry.fromAccount._id || entry.fromAccount,
      toAccount: entry.toAccount._id || entry.toAccount,
      transactionAmount: entry.transactionAmount.toString(),
      contraDate: entry.contraDate ? new Date(entry.contraDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      contraCode: entry.contraCode || '',
      narration: entry.narration || ''
    });
    setEditingEntry(entry);
    setError('');
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    setLoading(true);
    try {
      const result = await deleteContraEntry(id);
      if (result.success) {
        await loadContraEntries();
      } else {
        setError(result.message || 'Failed to delete contra entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete contra entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadContraEntries();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearch(false);
    setCurrentPage(1);
  };

  // Print functionality
  const handlePrint = () => {
    if (contraEntries.length === 0) {
      alert('No data to print');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Contra Entry List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; margin-bottom: 10px; }
            .header-info { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Contra Entry List</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${contraEntries.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Contra Code</th>
                <th>Date</th>
                <th>From Account</th>
                <th>To Account</th>
                <th>Amount</th>
                <th>Narration</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              ${contraEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.contraCode || 'N/A'}</td>
                  <td>${entry.contraDate ? new Date(entry.contraDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${entry.fromAccount?.accountName || 'N/A'}</td>
                  <td>${entry.toAccount?.accountName || 'N/A'}</td>
                  <td>₹ ${entry.transactionAmount?.toFixed(2) || '0.00'}</td>
                  <td>${entry.narration || '-'}</td>
                  <td>${entry.createdBy || 'N/A'}</td>
                </tr>
              `).join('')}
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

  // Export functionality
  const handleExport = () => {
    if (contraEntries.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['SL', 'Contra Code', 'Contra Date', 'From Account', 'To Account', 'Transaction Amount', 'Narration', 'Created By'],
      ...contraEntries.map((entry, index) => [
        index + 1,
        entry.contraCode || 'N/A',
        entry.contraDate ? new Date(entry.contraDate).toLocaleDateString() : 'N/A',
        entry.fromAccount?.accountName || 'N/A',
        entry.toAccount?.accountName || 'N/A',
        entry.transactionAmount?.toFixed(2) || '0.00',
        entry.narration || '-',
        entry.createdBy || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contra_entries_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="text-red-700 font-bold text-lg hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">
            {editingEntry ? 'Edit Contra / Single Entry' : 'Contra / Single Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* From Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Account <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.fromAccount}
                  onChange={(e) => handleInputChange('fromAccount', e.target.value)}
                >
                  <option value="">Select From Account</option>
                  {accounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.accountName} ({account.accountCode})
                    </option>
                  ))}
                </select>
                {accounts.length === 0 && (
                  <p className="text-xs text-gray-500 mt-1">No accounts found. Please add accounts first.</p>
                )}
              </div>

              {/* To Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Account <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.toAccount}
                  onChange={(e) => handleInputChange('toAccount', e.target.value)}
                >
                  <option value="">Select To Account</option>
                  {accounts
                    .filter(account => account._id !== formData.fromAccount)
                    .map(account => (
                    <option key={account._id} value={account._id}>
                      {account.accountName} ({account.accountCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Transaction Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Amount <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.transactionAmount}
                  onChange={(e) => handleInputChange('transactionAmount', e.target.value)}
                  placeholder="Transaction Amount"
                />
              </div>
            </div>

            {/* Middle Column - Narration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Narration</label>
              <textarea 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 h-32"
                placeholder="Narration..."
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Contra Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contra Code</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                  value={formData.contraCode}
                  onChange={(e) => handleInputChange('contraCode', e.target.value)}
                  readOnly={!editingEntry}
                />
              </div>

              {/* Contra Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contra Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.contraDate}
                  onChange={(e) => handleInputChange('contraDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSaveContra}
              disabled={loading}
              className="bg-teal-600 text-white px-8 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {editingEntry ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  💾 {editingEntry ? 'UPDATE' : 'SAVE'}
                </>
              )}
            </button>
            <button 
              onClick={resetForm}
              disabled={loading}
              className="bg-gray-500 text-white px-8 py-2 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {editingEntry ? 'CANCEL' : 'RESET'}
            </button>
          </div>
        </div>
      </div>

      {/* Contra Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Contra Entry List {pagination.totalRecords ? `(${pagination.totalRecords} total)` : ''}
            </h3>
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
                disabled={contraEntries.length === 0}
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Export to CSV"
              >
                📤
              </button>
              <button 
                onClick={handlePrint}
                disabled={contraEntries.length === 0}
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Print"
              >
                🖨️
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by contra code, accounts or narration..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button 
                onClick={handleSearch}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
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
            <div className="min-w-full">
              <div className="grid grid-cols-9 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>SL</div>
                <div>Contra Code</div>
                <div>Contra Date</div>
                <div>From Account</div>
                <div>To Account</div>
                <div>Transaction Amount</div>
                <div>Narration</div>
                <div>Created By</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {loading && contraEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  Loading contra entries...
                </div>
              ) : contraEntries.length > 0 ? (
                contraEntries.map((entry, index) => (
                  <div key={entry._id} className="grid grid-cols-9 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{((currentPage - 1) * rowsPerPage) + index + 1}</div>
                    <div className="font-medium text-teal-600">{entry.contraCode || 'N/A'}</div>
                    <div>{entry.contraDate ? new Date(entry.contraDate).toLocaleDateString() : 'N/A'}</div>
                    <div className="truncate" title={entry.fromAccount?.accountName}>
                      {entry.fromAccount?.accountName || 'N/A'}
                    </div>
                    <div className="truncate" title={entry.toAccount?.accountName}>
                      {entry.toAccount?.accountName || 'N/A'}
                    </div>
                    <div className="font-medium">₹ {entry.transactionAmount?.toFixed(2) || '0.00'}</div>
                    <div className="truncate max-w-20" title={entry.narration || 'No narration'}>
                      {entry.narration || '-'}
                    </div>
                    <div>{entry.createdBy || 'N/A'}</div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditEntry(entry)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="Edit"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Delete"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No matching records found' : 'No contra entries found. Create your first contra entry above.'}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalRecords > 0 && (
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
                  disabled={loading}
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
                    disabled={currentPage === 1 || loading}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages || 1, prev + 1))}
                    disabled={currentPage >= (pagination.totalPages || 1) || loading}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
