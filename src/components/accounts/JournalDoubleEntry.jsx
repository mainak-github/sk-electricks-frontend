'use client'

import { useState, useEffect } from 'react'
import url from '../../../url'

// API Functions
const fetchJournalEntries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    
    const response = await fetch(`${url.API_URL}/journal-entries?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    return { success: false, data: [], pagination: {} };
  }
};

const createJournalEntry = async (journalData) => {
  try {
    const response = await fetch(`${url.API_URL}/journal-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(journalData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    return { success: false, message: 'Failed to create journal entry' };
  }
};

const updateJournalEntry = async (id, journalData) => {
  try {
    const response = await fetch(`${url.API_URL}/journal-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(journalData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating journal entry:', error);
    return { success: false, message: 'Failed to update journal entry' };
  }
};

const deleteJournalEntry = async (id) => {
  try {
    const response = await fetch(`${url.API_URL}/journal-entries/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    return { success: false, message: 'Failed to delete journal entry' };
  }
};

const getNextJournalCode = async () => {
  try {
    const response = await fetch(`${url.API_URL}/journal-entries/utils/next-code`);
    const data = await response.json();
    return data.data?.journalCode || 'JRN-1';
  } catch (error) {
    console.error('Error getting next journal code:', error);
    return 'JRN-1';
  }
};

const getAvailableAccounts = async () => {
  try {
    const response = await fetch(`${url.API_URL}/journal-entries/utils/accounts`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [
      'Cash Account',
      'Bank Account',
      'Sales Account',
      'Purchase Account',
      'Rent Account',
      'Salary Account',
      'Office Expenses',
      'Equipment Account'
    ];
  }
};

export default function JournalDoubleEntry() {
  const [formData, setFormData] = useState({
    chooseAccount: '',
    journalCode: 'JRN-1',
    debitAmount: '',
    creditAmount: '',
    journalDate: new Date().toISOString().split('T')[0],
    narration: ''
  });

  // States
  const [journalEntries, setJournalEntries] = useState([]);
  const [tempEntries, setTempEntries] = useState([]);
  const [availableAccounts, setAvailableAccounts] = useState([]);
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
          getAvailableAccounts(),
          getNextJournalCode()
        ]);
        
        setAvailableAccounts(accountData);
        setFormData(prev => ({ ...prev, journalCode: nextCode }));
        
        await loadJournalEntries();
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load journal entries
  const loadJournalEntries = async (params = {}) => {
    try {
      const result = await fetchJournalEntries({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        ...params
      });
      
      if (result.success) {
        setJournalEntries(result.data || []);
        setPagination(result.pagination || {});
      } else {
        setJournalEntries([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setJournalEntries([]);
      setPagination({});
    }
  };

  // Reload entries when page or search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadJournalEntries();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [currentPage, rowsPerPage, searchTerm]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddToJournal = () => {
    if (!formData.chooseAccount || (!formData.debitAmount && !formData.creditAmount)) {
      setError('Please select an account and enter either debit or credit amount');
      return;
    }

    if (formData.debitAmount && formData.creditAmount) {
      setError('Cannot have both debit and credit amounts for the same entry');
      return;
    }

    if ((parseFloat(formData.debitAmount) || 0) <= 0 && (parseFloat(formData.creditAmount) || 0) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    const newTempEntry = {
      id: Date.now(),
      account: formData.chooseAccount,
      debitAmount: formData.debitAmount ? parseFloat(formData.debitAmount) : 0,
      creditAmount: formData.creditAmount ? parseFloat(formData.creditAmount) : 0,
      narration: formData.narration
    };
    
    setTempEntries(prev => [...prev, newTempEntry]);
    
    // Reset only the account and amounts, keep journal code, date and narration
    setFormData(prev => ({
      ...prev,
      chooseAccount: '',
      debitAmount: '',
      creditAmount: ''
    }));
    
    setError('');
  };

  const handleSaveJournal = async () => {
    if (tempEntries.length < 2) {
      setError('Please add at least 2 entries');
      return;
    }

    if (!formData.journalCode) {
      setError('Please provide a journal code');
      return;
    }

    const totalDebit = tempEntries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
    const totalCredit = tempEntries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      setError('Debit and Credit amounts must be equal!');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const journalData = {
        entries: tempEntries.map(entry => ({
          account: entry.account,
          debitAmount: entry.debitAmount || 0,
          creditAmount: entry.creditAmount || 0,
          narration: entry.narration || ''
        })),
        journalDate: formData.journalDate,
        journalCode: formData.journalCode,
        narration: formData.narration
      };

      let result;
      if (editingEntry) {
        result = await updateJournalEntry(editingEntry._id, journalData);
      } else {
        result = await createJournalEntry(journalData);
      }

      if (result.success) {
        await loadJournalEntries();
        await resetForm();
        setEditingEntry(null);
      } else {
        setError(result.message || 'Failed to save journal entry');
      }
    } catch (error) {
      console.error('Error saving journal:', error);
      setError('Failed to save journal entry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    const nextCode = await getNextJournalCode();
    setFormData({
      chooseAccount: '',
      journalCode: nextCode,
      debitAmount: '',
      creditAmount: '',
      journalDate: new Date().toISOString().split('T')[0],
      narration: ''
    });
    setTempEntries([]);
    setEditingEntry(null);
    setError('');
  };

  const handleEditEntry = (entry) => {
    setFormData({
      chooseAccount: '',
      journalCode: entry.journalCode || '',
      debitAmount: '',
      creditAmount: '',
      journalDate: entry.journalDate ? new Date(entry.journalDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      narration: entry.narration || ''
    });
    
    // Convert entries for editing
    const editEntries = entry.entries?.map((item, index) => ({
      id: Date.now() + index,
      account: item.account,
      debitAmount: item.debitAmount || 0,
      creditAmount: item.creditAmount || 0,
      narration: item.narration || ''
    })) || [];
    
    setTempEntries(editEntries);
    setEditingEntry(entry);
    setError('');
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    setLoading(true);
    try {
      const result = await deleteJournalEntry(id);
      if (result.success) {
        await loadJournalEntries();
      } else {
        setError(result.message || 'Failed to delete journal entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete journal entry');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTempEntry = (id) => {
    setTempEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadJournalEntries();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearch(false);
    setCurrentPage(1);
  };

  // Print functionality
  const handlePrint = () => {
    if (journalEntries.length === 0) {
      alert('No data to print');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Journal Entry List</title>
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
          <h1>Journal Entry List</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${journalEntries.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Journal Code</th>
                <th>Date</th>
                <th>Debit Total</th>
                <th>Credit Total</th>
                <th>Narration</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              ${journalEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.journalCode || 'N/A'}</td>
                  <td>${entry.journalDate ? new Date(entry.journalDate).toLocaleDateString() : 'N/A'}</td>
                  <td>₹ ${entry.debitTotal?.toFixed(2) || '0.00'}</td>
                  <td>₹ ${entry.creditTotal?.toFixed(2) || '0.00'}</td>
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
    if (journalEntries.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['SL', 'Journal Code', 'Journal Date', 'Debit Total', 'Credit Total', 'Narration', 'Created By'],
      ...journalEntries.map((entry, index) => [
        index + 1,
        entry.journalCode || 'N/A',
        entry.journalDate ? new Date(entry.journalDate).toLocaleDateString() : 'N/A',
        entry.debitTotal?.toFixed(2) || '0.00',
        entry.creditTotal?.toFixed(2) || '0.00',
        entry.narration || '-',
        entry.createdBy || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal_entries_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Calculate totals for temp entries
  const tempDebitTotal = tempEntries.reduce((sum, entry) => sum + (entry.debitAmount || 0), 0);
  const tempCreditTotal = tempEntries.reduce((sum, entry) => sum + (entry.creditAmount || 0), 0);

  if (loading && journalEntries.length === 0) {
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
            {editingEntry ? 'Edit Journal / Double Entry' : 'Journal / Double Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Choose Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Account <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.chooseAccount}
                  onChange={(e) => handleInputChange('chooseAccount', e.target.value)}
                >
                  <option value="">Choose Account (By Search)</option>
                  {availableAccounts.map(account => (
                    <option key={account} value={account}>{account}</option>
                  ))}
                </select>
              </div>

              {/* Journal Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Journal Code</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                  value={formData.journalCode}
                  onChange={(e) => handleInputChange('journalCode', e.target.value)}
                  placeholder="Journal Code"
                  readOnly={!editingEntry}
                />
              </div>

              {/* Debit Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Debit Amount</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.debitAmount}
                  onChange={(e) => handleInputChange('debitAmount', e.target.value)}
                  placeholder="Debit Amount"
                />
              </div>

              {/* Credit Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Credit Amount</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.creditAmount}
                  onChange={(e) => handleInputChange('creditAmount', e.target.value)}
                  placeholder="Credit Amount"
                />
              </div>

              {/* Add to Journal Button */}
              <div className="pt-4">
                <button 
                  onClick={handleAddToJournal}
                  className="bg-gray-600 text-white px-6 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  ADD TO JOURNAL
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                Press Enter Key to Journal
              </div>
            </div>

            {/* Middle Column - Current Journal Entries */}
            <div>
              <div className="border rounded p-4">
                <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-2">
                  <div>SL</div>
                  <div>Account</div>
                  <div>Debit</div>
                  <div>Credit</div>
                  <div>Actions</div>
                </div>
                
                {tempEntries.length > 0 ? (
                  <>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {tempEntries.map((entry, index) => (
                        <div key={entry.id} className="grid grid-cols-5 gap-2 text-xs py-1 border-b">
                          <div>{index + 1}</div>
                          <div className="truncate" title={entry.account}>{entry.account}</div>
                          <div>{entry.debitAmount > 0 ? `₹${entry.debitAmount.toFixed(2)}` : '-'}</div>
                          <div>{entry.creditAmount > 0 ? `₹${entry.creditAmount.toFixed(2)}` : '-'}</div>
                          <div>
                            <button 
                              onClick={() => handleRemoveTempEntry(entry.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                              title="Remove"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 text-xs py-2 font-semibold border-t">
                      <div></div>
                      <div>Total:</div>
                      <div>₹{tempDebitTotal.toFixed(2)}</div>
                      <div>₹{tempCreditTotal.toFixed(2)}</div>
                      <div></div>
                    </div>
                    
                    <div className="text-center mt-2">
                      <span className={`text-xs ${Math.abs(tempDebitTotal - tempCreditTotal) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(tempDebitTotal - tempCreditTotal) < 0.01 ? 'Balanced ✓' : 'Not Balanced ✗'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No entries added yet
                  </div>
                )}
              </div>

              {/* Narration */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Narration</label>
                <textarea 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 h-24"
                  placeholder="Narration..."
                  value={formData.narration}
                  onChange={(e) => handleInputChange('narration', e.target.value)}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Journal Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Journal Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.journalDate}
                  onChange={(e) => handleInputChange('journalDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSaveJournal}
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

      {/* Journal Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Journal Entry List {pagination.totalRecords ? `(${pagination.totalRecords} total)` : ''}
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
                disabled={journalEntries.length === 0}
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Export to CSV"
              >
                📤
              </button>
              <button 
                onClick={handlePrint}
                disabled={journalEntries.length === 0}
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
                placeholder="Search by journal code, accounts or narration..."
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
                <div>Journal Code</div>
                <div>Journal Date</div>
                <div>Entries Count</div>
                <div>Debit Total</div>
                <div>Credit Total</div>
                <div>Narration</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {loading && journalEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  Loading journal entries...
                </div>
              ) : journalEntries.length > 0 ? (
                journalEntries.map((entry, index) => (
                  <div key={entry._id} className="grid grid-cols-8 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{((currentPage - 1) * rowsPerPage) + index + 1}</div>
                    <div className="font-medium text-teal-600">{entry.journalCode || 'N/A'}</div>
                    <div>{entry.journalDate ? new Date(entry.journalDate).toLocaleDateString() : 'N/A'}</div>
                    <div>{entry.entries?.length || 0} entries</div>
                    <div className="font-medium">₹ {entry.debitTotal?.toFixed(2) || '0.00'}</div>
                    <div className="font-medium">₹ {entry.creditTotal?.toFixed(2) || '0.00'}</div>
                    <div className="truncate max-w-20" title={entry.narration || 'No narration'}>
                      {entry.narration || '-'}
                    </div>
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
                  {searchTerm ? 'No matching records found' : 'No journal entries found. Create your first journal entry above.'}
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
