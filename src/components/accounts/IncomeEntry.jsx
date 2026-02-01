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

const fetchIncomeEntries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    
    const response = await fetch(`${url.API_URL}/income-entries?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching income entries:', error);
    return { success: false, data: [], pagination: {} };
  }
};

const createIncomeEntry = async (incomeData) => {
  try {
    const response = await fetch(`${url.API_URL}/income-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incomeData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating income entry:', error);
    return { success: false, message: 'Failed to create income entry' };
  }
};

const updateIncomeEntry = async (id, incomeData) => {
  try {
    const response = await fetch(`${url.API_URL}/income-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(incomeData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating income entry:', error);
    return { success: false, message: 'Failed to update income entry' };
  }
};

const deleteIncomeEntry = async (id) => {
  try {
    const response = await fetch(`${url.API_URL}/income-entries/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting income entry:', error);
    return { success: false, message: 'Failed to delete income entry' };
  }
};

const getNextIncomeCode = async () => {
  try {
    const response = await fetch(`${url.API_URL}/income-entries/utils/next-code`);
    const data = await response.json();
    return data.data?.incomeCode || 'RCV-1';
  } catch (error) {
    console.error('Error getting next income code:', error);
    return 'RCV-1';
  }
};

export default function IncomeEntry() {
  const [formData, setFormData] = useState({
    incomeHead: '',
    receiptIntoAccount: '',
    incomeAmount: '',
    incomeCode: 'RCV-1',
    incomeDate: new Date().toISOString().split('T')[0],
    narration: ''
  });

  // States
  const [accounts, setAccounts] = useState([]);
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [incomeItems, setIncomeItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);

  // Static Options
  const incomeHeads = [
    'Sales Revenue',
    'Service Income',
    'Interest Income',
    'Rental Income',
    'Commission Income',
    'Dividend Income',
    'Other Income'
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [accountData, nextCode] = await Promise.all([
          fetchAccounts(),
          getNextIncomeCode()
        ]);
        
        const activeAccounts = Array.isArray(accountData) 
          ? accountData.filter(acc => acc.isActive !== false) 
          : [];
        setAccounts(activeAccounts);
        setFormData(prev => ({ ...prev, incomeCode: nextCode }));
        
        await loadIncomeEntries();
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load income entries
  const loadIncomeEntries = async (params = {}) => {
    try {
      const result = await fetchIncomeEntries({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        ...params
      });
      
      if (result.success) {
        setIncomeEntries(result.data || []);
        setPagination(result.pagination || {});
      } else {
        setIncomeEntries([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Error loading income entries:', error);
      setIncomeEntries([]);
      setPagination({});
    }
  };

  // Reload entries when page or search changes
  useEffect(() => {
    if (accounts.length > 0) {
      const timeoutId = setTimeout(() => {
        loadIncomeEntries();
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

  const handleAddToIncome = () => {
    if (!formData.incomeHead || !formData.receiptIntoAccount || !formData.incomeAmount) {
      setError('Income head, receipt account, and amount are required');
      return;
    }

    if (parseFloat(formData.incomeAmount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    const selectedAccount = accounts.find(acc => acc._id === formData.receiptIntoAccount);
    
    const newItem = {
      id: Date.now(),
      incomeHead: formData.incomeHead,
      receiptIntoAccount: formData.receiptIntoAccount,
      accountName: selectedAccount?.accountName || 'Unknown Account',
      incomeAmount: parseFloat(formData.incomeAmount)
    };
    
    setIncomeItems(prev => [...prev, newItem]);
    
    // Clear form fields for adding more items
    setFormData(prev => ({
      ...prev,
      incomeHead: '',
      receiptIntoAccount: '',
      incomeAmount: ''
    }));
    
    setError('');
  };

  const handleSaveIncome = async () => {
    if (incomeItems.length === 0) {
      setError('Please add at least one income item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const incomeData = {
        items: incomeItems.map(item => ({
          incomeHead: item.incomeHead,
          receiptIntoAccount: item.receiptIntoAccount,
          incomeAmount: item.incomeAmount
        })),
        incomeDate: formData.incomeDate,
        incomeCode: formData.incomeCode,
        narration: formData.narration
      };

      let result;
      if (editingEntry) {
        result = await updateIncomeEntry(editingEntry._id, incomeData);
      } else {
        result = await createIncomeEntry(incomeData);
      }

      if (result.success) {
        await loadIncomeEntries();
        await resetForm();
        setEditingEntry(null);
      } else {
        setError(result.message || 'Failed to save income entry');
      }
    } catch (error) {
      console.error('Error saving income:', error);
      setError('Failed to save income entry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    const nextCode = await getNextIncomeCode();
    setFormData({
      incomeHead: '',
      receiptIntoAccount: '',
      incomeAmount: '',
      incomeCode: nextCode,
      incomeDate: new Date().toISOString().split('T')[0],
      narration: ''
    });
    setIncomeItems([]);
    setEditingEntry(null);
    setError('');
  };

  const handleEditEntry = (entry) => {
    setFormData({
      incomeHead: '',
      receiptIntoAccount: '',
      incomeAmount: '',
      incomeDate: entry.incomeDate ? new Date(entry.incomeDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      incomeCode: entry.incomeCode || '',
      narration: entry.narration || ''
    });
    
    // Convert items for editing
    const editItems = entry.items?.map((item, index) => ({
      id: Date.now() + index,
      incomeHead: item.incomeHead,
      receiptIntoAccount: item.receiptIntoAccount._id || item.receiptIntoAccount,
      accountName: item.receiptIntoAccount.accountName || 'Unknown Account',
      incomeAmount: item.incomeAmount
    })) || [];
    
    setIncomeItems(editItems);
    setEditingEntry(entry);
    setError('');
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    setLoading(true);
    try {
      const result = await deleteIncomeEntry(id);
      if (result.success) {
        await loadIncomeEntries();
      } else {
        setError(result.message || 'Failed to delete income entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete income entry');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (id) => {
    setIncomeItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadIncomeEntries();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearch(false);
    setCurrentPage(1);
  };

  // Print functionality
  const handlePrint = () => {
    if (incomeEntries.length === 0) {
      alert('No data to print');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Income Entry List</title>
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
          <h1>Income Entry List</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${incomeEntries.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Income Code</th>
                <th>Date</th>
                <th>Income Total</th>
                <th>Narration</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              ${incomeEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.incomeCode || 'N/A'}</td>
                  <td>${entry.incomeDate ? new Date(entry.incomeDate).toLocaleDateString() : 'N/A'}</td>
                  <td>₹ ${entry.incomeTotal?.toFixed(2) || '0.00'}</td>
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
    if (incomeEntries.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['SL', 'Income Code', 'Income Date', 'Income Total', 'Narration', 'Created By'],
      ...incomeEntries.map((entry, index) => [
        index + 1,
        entry.incomeCode || 'N/A',
        entry.incomeDate ? new Date(entry.incomeDate).toLocaleDateString() : 'N/A',
        entry.incomeTotal?.toFixed(2) || '0.00',
        entry.narration || '-',
        entry.createdBy || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `income_entries_${new Date().toISOString().split('T')[0]}.csv`;
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
            {editingEntry ? 'Edit Income Entry' : 'Income Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Income Head */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Head <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.incomeHead}
                  onChange={(e) => handleInputChange('incomeHead', e.target.value)}
                >
                  <option value="">Select Income Head</option>
                  {incomeHeads.map(head => (
                    <option key={head} value={head}>{head}</option>
                  ))}
                </select>
              </div>

              {/* Receipt Into Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Into Account <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.receiptIntoAccount}
                  onChange={(e) => handleInputChange('receiptIntoAccount', e.target.value)}
                >
                  <option value="">Select Account</option>
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

              {/* Income Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Income Amount <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.incomeAmount}
                  onChange={(e) => handleInputChange('incomeAmount', e.target.value)}
                  placeholder="Income Amount"
                />
              </div>

              {/* Add to Income Button */}
              <div>
                <button 
                  onClick={handleAddToIncome}
                  className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  ADD TO INCOME
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Income Code and Date Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Income Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Income Code</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                    value={formData.incomeCode}
                    onChange={(e) => handleInputChange('incomeCode', e.target.value)}
                    readOnly={!editingEntry}
                  />
                </div>

                {/* Income Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Income Date</label>
                  <input 
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.incomeDate}
                    onChange={(e) => handleInputChange('incomeDate', e.target.value)}
                  />
                </div>
              </div>

              {/* Income Table */}
              <div className="border rounded p-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold text-gray-700 mb-2">
                  <div>SL</div>
                  <div>Income Head</div>
                  <div>Account</div>
                  <div>Amount</div>
                  <div>Actions</div>
                </div>
                
                {incomeItems.length > 0 ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {incomeItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-4 gap-2 text-xs py-1 border-t">
                        <div>{index + 1}</div>
                        <div className="truncate" title={item.incomeHead}>{item.incomeHead}</div>
                        <div className="truncate" title={item.accountName}>{item.accountName}</div>
                        <div>₹ {item.incomeAmount.toFixed(2)}</div>
                        <div>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Remove"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm border-t">
                    No items added yet
                  </div>
                )}
                
                {/* Total */}
                {incomeItems.length > 0 && (
                  <div className="border-t mt-2 pt-2 text-sm font-semibold text-right">
                    Total: ₹ {incomeItems.reduce((sum, item) => sum + item.incomeAmount, 0).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Narration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Narration</label>
            <textarea 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows="3"
              placeholder="Narration..."
              value={formData.narration}
              onChange={(e) => handleInputChange('narration', e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSaveIncome}
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

      {/* Income Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Income Entry List {pagination.totalRecords ? `(${pagination.totalRecords} total)` : ''}
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
                disabled={incomeEntries.length === 0}
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Export to CSV"
              >
                📤
              </button>
              <button 
                onClick={handlePrint}
                disabled={incomeEntries.length === 0}
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
                placeholder="Search by income code, narration, or income head..."
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
              <div className="grid grid-cols-8 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>SL</div>
                <div>Income Code</div>
                <div>Income Date</div>
                <div>Items Count</div>
                <div>Income Total</div>
                <div>Narration</div>
                <div>Created By</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {loading && incomeEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  Loading income entries...
                </div>
              ) : incomeEntries.length > 0 ? (
                incomeEntries.map((entry, index) => (
                  <div key={entry._id} className="grid grid-cols-8 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{((currentPage - 1) * rowsPerPage) + index + 1}</div>
                    <div className="font-medium text-teal-600">{entry.incomeCode || 'N/A'}</div>
                    <div>{entry.incomeDate ? new Date(entry.incomeDate).toLocaleDateString() : 'N/A'}</div>
                    <div>{entry.items?.length || 0} items</div>
                    <div className="font-medium">₹ {entry.incomeTotal?.toFixed(2) || '0.00'}</div>
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
                  {searchTerm ? 'No matching records found' : 'No income entries found. Create your first income entry above.'}
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
