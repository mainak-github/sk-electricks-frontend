'use client'

import { useState, useEffect } from 'react'
import url from '../../../url'

// API Functions
const fetchEmployees = async () => {
  try {
    const response = await fetch(`${url.API_URL}/employees`);
    const data = await response.json();
    return data.employees || [];
  } catch (error) {
    console.error('Error fetching employees:', error);
    return [];
  }
};

const fetchAccounts = async () => {
  try {
    const response = await fetch(`${url.API_URL}/accounts`);
    const data = await response.json();
    // Fixed: Use data.data and handle success check
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return [];
  }
};

const fetchExpenseEntries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    
    const response = await fetch(`${url.API_URL}/expense-entries?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching expense entries:', error);
    return { success: false, data: [], pagination: {} };
  }
};

const createExpenseEntry = async (expenseData) => {
  try {
    const response = await fetch(`${url.API_URL}/expense-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating expense entry:', error);
    return { success: false, message: 'Failed to create expense entry' };
  }
};

const updateExpenseEntry = async (id, expenseData) => {
  try {
    const response = await fetch(`${url.API_URL}/expense-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(expenseData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating expense entry:', error);
    return { success: false, message: 'Failed to update expense entry' };
  }
};

const deleteExpenseEntry = async (id) => {
  try {
    const response = await fetch(`${url.API_URL}/expense-entries/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting expense entry:', error);
    return { success: false, message: 'Failed to delete expense entry' };
  }
};

const getNextExpenseCode = async () => {
  try {
    const response = await fetch(`${url.API_URL}/expense-entries/utils/next-code`);
    const data = await response.json();
    return data.data?.expenseCode || 'PAY-1';
  } catch (error) {
    console.error('Error getting next expense code:', error);
    return 'PAY-1';
  }
};

export default function ExpenseEntry() {
  const [formData, setFormData] = useState({
    expenseHead: '',
    selectCategory: '',
    expenseAmount: '',
    payFromAccount: '',
    selectEmployee: '',
    payTo: '',
    expenseDate: new Date().toISOString().split('T')[0],
    expenseCode: 'PAY-1',
    narration: ''
  });

  // Dynamic Data States
  const [employees, setEmployees] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [expenseEntries, setExpenseEntries] = useState([]);
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
  const expenseHeads = [
    'Office Supplies',
    'Travel & Transport',
    'Utilities',
    'Marketing',
    'Equipment',
    'Maintenance',
    'Professional Services'
  ];

  const categories = [
    'Administrative',
    'Operational',
    'Marketing',
    'IT & Technology',
    'Human Resources',
    'Finance'
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        console.log('Loading initial data...');
        
        const [employeeData, accountData, nextCode] = await Promise.all([
          fetchEmployees(),
          fetchAccounts(),
          getNextExpenseCode()
        ]);
        
        console.log('Employee data:', employeeData);
        console.log('Account data:', accountData);
        console.log('Next code:', nextCode);
        
        setEmployees(employeeData || []);
        // Fixed: Filter active accounts and handle different response structures
        const activeAccounts = Array.isArray(accountData) 
          ? accountData.filter(acc => acc.isActive !== false) 
          : [];
        setAccounts(activeAccounts);
        setFormData(prev => ({ ...prev, expenseCode: nextCode }));
        
        // Load expense entries after accounts are loaded
        if (activeAccounts.length > 0) {
          await loadExpenseEntries();
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load expense entries
  const loadExpenseEntries = async (params = {}) => {
    try {
      const result = await fetchExpenseEntries({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        ...params
      });
      
      console.log('Expense entries result:', result);
      
      if (result.success) {
        setExpenseEntries(result.data || []);
        setPagination(result.pagination || {});
      } else {
        console.log('No expense entries found or API not ready');
        setExpenseEntries([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Error loading expense entries:', error);
      setExpenseEntries([]);
      setPagination({});
    }
  };

  // Reload entries when page or search changes
  useEffect(() => {
    if (accounts.length > 0) { // Only load entries after accounts are loaded
      const timeoutId = setTimeout(() => {
        loadExpenseEntries();
      }, 300); // Debounce for search
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, rowsPerPage, searchTerm, accounts]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveExpense = async () => {
    // Validate required fields
    if (!formData.expenseHead || !formData.expenseAmount || !formData.payFromAccount || !formData.payTo) {
      setError('Please fill in all required fields (Expense Head, Amount, Payment Account, Pay To)');
      return;
    }

    // Validate expense amount
    if (parseFloat(formData.expenseAmount) <= 0) {
      setError('Expense amount must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const expenseData = {
        expenseHead: formData.expenseHead,
        selectCategory: formData.selectCategory || undefined,
        expenseAmount: parseFloat(formData.expenseAmount),
        payFromAccount: formData.payFromAccount,
        selectEmployee: formData.selectEmployee || undefined,
        payTo: formData.payTo.trim(),
        expenseDate: formData.expenseDate,
        expenseCode: formData.expenseCode,
        narration: formData.narration.trim() || undefined
      };

      console.log('Saving expense data:', expenseData);

      let result;
      if (editingEntry) {
        result = await updateExpenseEntry(editingEntry._id, expenseData);
      } else {
        result = await createExpenseEntry(expenseData);
      }

      console.log('Save result:', result);

      if (result.success) {
        // Reload entries
        await loadExpenseEntries();
        
        // Reset form
        await resetForm();
        setEditingEntry(null);
        
        // Show success message briefly
        const successMessage = editingEntry ? 'Expense updated successfully!' : 'Expense created successfully!';
        setError(''); // Clear any previous errors
        
        // You could add a success state here if needed
        console.log(successMessage);
      } else {
        setError(result.message || 'Failed to save expense entry');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      setError('Failed to save expense entry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    const nextCode = await getNextExpenseCode();
    setFormData({
      expenseHead: '',
      selectCategory: '',
      expenseAmount: '',
      payFromAccount: '',
      selectEmployee: '',
      payTo: '',
      expenseDate: new Date().toISOString().split('T')[0],
      expenseCode: nextCode,
      narration: ''
    });
    setEditingEntry(null);
    setError('');
  };

  const handleEditEntry = (entry) => {
    console.log('Editing entry:', entry);
    setFormData({
      expenseHead: entry.expenseHead || '',
      selectCategory: entry.selectCategory || '',
      expenseAmount: entry.expenseAmount?.toString() || '',
      payFromAccount: entry.payFromAccount?._id || entry.payFromAccount || '',
      selectEmployee: entry.selectEmployee?._id || entry.selectEmployee || '',
      payTo: entry.payTo || '',
      expenseDate: entry.expenseDate ? new Date(entry.expenseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      expenseCode: entry.expenseCode || '',
      narration: entry.narration || ''
    });
    setEditingEntry(entry);
    setError('');
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    setLoading(true);
    try {
      const result = await deleteExpenseEntry(id);
      if (result.success) {
        await loadExpenseEntries();
        setError(''); // Clear any previous errors
      } else {
        setError(result.message || 'Failed to delete expense entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete expense entry');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadExpenseEntries();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearch(false);
    setCurrentPage(1);
  };

  // Print functionality
  const handlePrint = () => {
    if (expenseEntries.length === 0) {
      alert('No data to print');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Expense Entry List</title>
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
          <h1>Expense Entry List</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${expenseEntries.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Expense Code</th>
                <th>Date</th>
                <th>Head</th>
                <th>Payment From</th>
                <th>Amount</th>
                <th>Pay To</th>
                <th>Narration</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              ${expenseEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.expenseCode || 'N/A'}</td>
                  <td>${entry.expenseDate ? new Date(entry.expenseDate).toLocaleDateString() : 'N/A'}</td>
                  <td>${entry.expenseHead || 'N/A'}</td>
                  <td>${entry.payFromAccount?.accountName || 'N/A'}</td>
                  <td>₹ ${entry.expenseAmount?.toFixed(2) || '0.00'}</td>
                  <td>${entry.payTo || 'N/A'}</td>
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
    if (expenseEntries.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['SL', 'Expense Code', 'Expense Date', 'Expense Head', 'Payment From', 'Expense Amount', 'Pay To', 'Narration', 'Created By'],
      ...expenseEntries.map((entry, index) => [
        index + 1,
        entry.expenseCode || 'N/A',
        entry.expenseDate ? new Date(entry.expenseDate).toLocaleDateString() : 'N/A',
        entry.expenseHead || 'N/A',
        entry.payFromAccount?.accountName || 'N/A',
        entry.expenseAmount?.toFixed(2) || '0.00',
        entry.payTo || 'N/A',
        entry.narration || '-',
        entry.createdBy || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_entries_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Show loading screen for initial load
  if (loading && accounts.length === 0 && employees.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading initial data...</p>
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
            {editingEntry ? 'Edit Expense Entry' : 'Expense Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Expense Head */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Head <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.expenseHead}
                  onChange={(e) => handleInputChange('expenseHead', e.target.value)}
                >
                  <option value="">Select Expense Head</option>
                  {expenseHeads.map(head => (
                    <option key={head} value={head}>{head}</option>
                  ))}
                </select>
              </div>

              {/* Select Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Category (Optional)</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.selectCategory}
                  onChange={(e) => handleInputChange('selectCategory', e.target.value)}
                >
                  <option value="">Select Category (Optional)</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Expense Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Amount <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.expenseAmount}
                  onChange={(e) => handleInputChange('expenseAmount', e.target.value)}
                  placeholder="Expense Amount"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Pay From Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pay From Account <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.payFromAccount}
                  onChange={(e) => handleInputChange('payFromAccount', e.target.value)}
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

              {/* Employee and Pay To Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Select Employee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Employee</label>
                  <select 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.selectEmployee}
                    onChange={(e) => handleInputChange('selectEmployee', e.target.value)}
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.employeeName} ({employee.employeeCode})
                      </option>
                    ))}
                  </select>
                  {employees.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No employees found.</p>
                  )}
                </div>

                {/* Pay To */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay To <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.payTo}
                    onChange={(e) => handleInputChange('payTo', e.target.value)}
                    placeholder="Pay To"
                  />
                </div>
              </div>

              {/* Expense Date and Code Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Expense Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expense Date</label>
                  <input 
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.expenseDate}
                    onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                  />
                </div>

                {/* Expense Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expense Code</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                    value={formData.expenseCode}
                    onChange={(e) => handleInputChange('expenseCode', e.target.value)}
                    readOnly={!editingEntry}
                  />
                </div>
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
              onClick={handleSaveExpense}
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

          {/* Debug Info (Remove in production) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>Accounts loaded: {accounts.length}</p>
              <p>Employees loaded: {employees.length}</p>
              <p>Expense entries: {expenseEntries.length}</p>
              <p>Current page: {currentPage}</p>
              <p>Total records: {pagination.totalRecords || 0}</p>
            </div>
          )}
        </div>
      </div>

      {/* Expense Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Expense Entry List {pagination.totalRecords ? `(${pagination.totalRecords} total)` : ''}
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
                disabled={expenseEntries.length === 0}
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Export to CSV"
              >
                📤
              </button>
              <button 
                onClick={handlePrint}
                disabled={expenseEntries.length === 0}
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
                placeholder="Search by expense code, head, or pay to..."
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
              <div className="grid grid-cols-10 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>SL</div>
                <div>Expense Code</div>
                <div>Expense Date</div>
                <div>Expense Head</div>
                <div>Payment From</div>
                <div>Expense Amount</div>
                <div>Pay To</div>
                <div>Narration</div>
                <div>Created By</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {loading && expenseEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  Loading expense entries...
                </div>
              ) : expenseEntries.length > 0 ? (
                expenseEntries.map((entry, index) => (
                  <div key={entry._id} className="grid grid-cols-10 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{((currentPage - 1) * rowsPerPage) + index + 1}</div>
                    <div className="font-medium text-teal-600">{entry.expenseCode || 'N/A'}</div>
                    <div>{entry.expenseDate ? new Date(entry.expenseDate).toLocaleDateString() : 'N/A'}</div>
                    <div>{entry.expenseHead || 'N/A'}</div>
                    <div>{entry.payFromAccount?.accountName || 'N/A'}</div>
                    <div className="font-medium">₹ {entry.expenseAmount?.toFixed(2) || '0.00'}</div>
                    <div>{entry.payTo || 'N/A'}</div>
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
                  {searchTerm ? 'No matching records found' : 'No expense entries found. Create your first expense entry above.'}
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
