'use client'

import { useState, useEffect } from 'react'

// API Configuration
import url from '../../../url'

// API Service Functions
const accountAPI = {
  // Get all accounts with pagination and search
  getAccounts: async (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
      accountType: params.accountType || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    }).toString();
    
    const response = await fetch(`${url.API_URL}/accounts?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch accounts');
    }
    return response.json();
  },

  // Get next account code
  getNextAccountCode: async () => {
    const response = await fetch(`${url.API_URL}/accounts/utils/next-code`);
    if (!response.ok) {
      throw new Error('Failed to get next account code');
    }
    return response.json();
  },

  // Get account types
  getAccountTypes: async () => {
    const response = await fetch(`${url.API_URL}/accounts/utils/account-types`);
    if (!response.ok) {
      throw new Error('Failed to get account types');
    }
    return response.json();
  },

  // Create new account
  createAccount: async (accountData) => {
    const response = await fetch(`${url.API_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });
    
    // Don't throw error immediately, let the component handle response
    const result = await response.json();
    return { ok: response.ok, ...result };
  },

  // Update account
  updateAccount: async (id, accountData) => {
    const response = await fetch(`${url.API_URL}/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(accountData)
    });
    
    const result = await response.json();
    return { ok: response.ok, ...result };
  },

  // Delete account
  deleteAccount: async (id) => {
    const response = await fetch(`${url.API_URL}/accounts/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete account');
    }
    return response.json();
  }
}

export default function AccountEntry() {
  // Form state
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: '',
    openingBalance: '0'
  })

  // Data state
  const [accountEntries, setAccountEntries] = useState([])
  const [accountTypes, setAccountTypes] = useState([])
  const [pagination, setPagination] = useState({
    totalRecords: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  })

  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState([]) // New state for validation errors
  const [editingAccount, setEditingAccount] = useState(null)

  // Load initial data
  useEffect(() => {
    loadAccountTypes()
    loadNextAccountCode()
  }, [])

  // Load accounts when pagination or search changes
  useEffect(() => {
    loadAccounts()
  }, [pagination.currentPage, pagination.limit, searchTerm])

  // Load account types
  const loadAccountTypes = async () => {
    try {
      const response = await accountAPI.getAccountTypes()
      if (response.success) {
        setAccountTypes(response.data)
      }
    } catch (error) {
      console.error('Error loading account types:', error)
    }
  }

  // Load next account code
  const loadNextAccountCode = async () => {
    try {
      const response = await accountAPI.getNextAccountCode()
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          accountCode: response.data.accountCode
        }))
      }
    } catch (error) {
      console.error('Error loading next account code:', error)
    }
  }

  // Load accounts
  const loadAccounts = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await accountAPI.getAccounts({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm
      })
      
      if (response.success) {
        setAccountEntries(response.data)
        setPagination(prev => ({
          ...prev,
          totalRecords: response.pagination.totalRecords,
          totalPages: response.pagination.totalPages
        }))
      } else {
        setError(response.message || 'Failed to load accounts')
      }
    } catch (error) {
      setError('Failed to load accounts: ' + error.message)
      console.error('Error loading accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
    if (error) {
      setError('')
    }
  }

  // Save or update account - UPDATED WITH VALIDATION ERROR HANDLING
  const handleSaveAccount = async () => {
    if (!formData.accountName.trim() || !formData.accountType) {
      setError('Account name and type are required')
      return
    }

    setLoading(true)
    setError('')
    setValidationErrors([]) // Clear previous validation errors

    try {
      // Clean account code - remove invalid characters and limit length
      const cleanAccountCode = formData.accountCode
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '') // Remove non-alphanumeric characters
        .substring(0, 10); // Limit to 10 characters

      const accountData = {
        accountCode: cleanAccountCode || undefined, // Send undefined if empty to let backend generate
        accountName: formData.accountName.trim(),
        accountType: formData.accountType,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        createdBy: 'Admin'
      }

      console.log('📤 Sending account data:', accountData);

      let response
      if (editingAccount) {
        response = await accountAPI.updateAccount(editingAccount._id, accountData)
      } else {
        response = await accountAPI.createAccount(accountData)
      }

      console.log('📥 Server response:', response);

      if (response.success) {
        setError('')
        setValidationErrors([])
        handleReset()
        loadAccounts()
        
        if (editingAccount) {
          setEditingAccount(null)
          alert('Account updated successfully!')
        } else {
          alert('Account created successfully!')
          loadNextAccountCode()
        }
      } else {
        // Handle validation errors from backend
        if (response.errors && Array.isArray(response.errors)) {
          setValidationErrors(response.errors)
          setError('') // Clear general error when showing validation errors
        } else {
          setError(response.message || 'Failed to save account')
          setValidationErrors([])
        }
      }
    } catch (error) {
      console.error('Frontend error:', error);
      setError('Failed to save account: ' + error.message)
      setValidationErrors([])
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      accountCode: '',
      accountName: '',
      accountType: '',
      openingBalance: '0'
    })
    setEditingAccount(null)
    setError('')
    setValidationErrors([]) // Clear validation errors
    loadNextAccountCode()
  }

  // Search functionality
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    loadAccounts()
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  // Edit entry
  const handleEditEntry = (entry) => {
    setFormData({
      accountCode: entry.accountCode,
      accountName: entry.accountName,
      accountType: entry.accountType,
      openingBalance: entry.openingBalance.toString()
    })
    setEditingAccount(entry)
    setError('')
    setValidationErrors([])
  }

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return
    }

    setLoading(true)
    try {
      const response = await accountAPI.deleteAccount(id)
      if (response.success) {
        alert('Account deleted successfully!')
        loadAccounts()
      } else {
        setError(response.message || 'Failed to delete account')
      }
    } catch (error) {
      setError('Failed to delete account: ' + error.message)
      console.error('Error deleting account:', error)
    } finally {
      setLoading(false)
    }
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Account List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0f766e; }
          </style>
        </head>
        <body>
          <h1>Account List</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Account Type</th>
                <th>Opening Balance</th>
                <th>Entry Date</th>
              </tr>
            </thead>
            <tbody>
              ${accountEntries.map((entry) => `
                <tr>
                  <td>${entry.accountCode}</td>
                  <td>${entry.accountName}</td>
                  <td>${entry.accountType}</td>
                  <td>₹ ${entry.openingBalance}</td>
                  <td>${new Date(entry.createdAt).toLocaleDateString('en-GB')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Code', 'Account Name', 'Account Type', 'Opening Balance', 'Entry Date'],
      ...accountEntries.map((entry) => [
        entry.accountCode,
        entry.accountName,
        entry.accountType,
        entry.openingBalance,
        new Date(entry.createdAt).toLocaleDateString('en-GB')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'account_entries.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
  }

  const handleRowsPerPageChange = (newLimit) => {
    setPagination(prev => ({ 
      ...prev, 
      limit: parseInt(newLimit), 
      currentPage: 1 
    }))
  }

  return (
    <div className="p-4">
      {/* General Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Validation Errors Display - NEW */}
      {validationErrors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold mb-2">Validation Errors Found:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="text-sm">
                    <strong>{err.param ? `${err.param.charAt(0).toUpperCase() + err.param.slice(1)}:` : 'Field:'}</strong> {err.msg}
                    {err.value && (
                      <span className="text-gray-600 ml-1">(received: "{err.value}")</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Form Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">
            {editingAccount ? 'Edit Account Entry' : 'Account Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Account Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Code
                <span className="text-xs text-gray-500 ml-1">(max 10 chars, A-Z, 0-9 only)</span>
              </label>
              <input 
                type="text"
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  validationErrors.some(err => err.param === 'accountCode') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                value={formData.accountCode}
                onChange={(e) => handleInputChange('accountCode', e.target.value)}
                placeholder="Account Code"
                disabled={editingAccount !== null}
                maxLength={10}
              />
              {validationErrors.some(err => err.param === 'accountCode') && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.find(err => err.param === 'accountCode')?.msg}
                </p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Name *</label>
              <input 
                type="text"
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  validationErrors.some(err => err.param === 'accountName') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                placeholder="Account Name"
                required
              />
              {validationErrors.some(err => err.param === 'accountName') && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.find(err => err.param === 'accountName')?.msg}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Type *</label>
              <select 
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  validationErrors.some(err => err.param === 'accountType') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                value={formData.accountType}
                onChange={(e) => handleInputChange('accountType', e.target.value)}
                required
              >
                <option value="">Select Account Type</option>
                {accountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {validationErrors.some(err => err.param === 'accountType') && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.find(err => err.param === 'accountType')?.msg}
                </p>
              )}
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
              <input 
                type="number"
                min="0"
                step="0.01"
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 ${
                  validationErrors.some(err => err.param === 'openingBalance') 
                    ? 'border-red-300 focus:ring-red-500' 
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
                value={formData.openingBalance}
                onChange={(e) => handleInputChange('openingBalance', e.target.value)}
                placeholder="Opening Balance"
              />
              {validationErrors.some(err => err.param === 'openingBalance') && (
                <p className="text-red-500 text-xs mt-1">
                  {validationErrors.find(err => err.param === 'openingBalance')?.msg}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSaveAccount}
              disabled={loading}
              className="bg-teal-600 text-white px-8 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span>💾</span> {editingAccount ? 'UPDATE' : 'SAVE'}
            </button>
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-8 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              {editingAccount ? 'CANCEL' : 'RESET'}
            </button>
          </div>
        </div>
      </div>

      {/* Account List - Same as before */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Account List ({pagination.totalRecords} records)
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
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
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

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by account name, code, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
              <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>Code</div>
                <div>Account Name</div>
                <div>Account Type</div>
                <div>Opening Balance</div>
                <div>Entry Date</div>
                <div>Actions</div>
              </div>

              {accountEntries.length > 0 ? (
                accountEntries.map((entry) => (
                  <div key={entry._id} className="grid grid-cols-6 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div className="font-medium text-teal-600">{entry.accountCode}</div>
                    <div>{entry.accountName}</div>
                    <div>{entry.accountType}</div>
                    <div className="font-medium">₹ {entry.openingBalance.toLocaleString('en-IN')}</div>
                    <div>{new Date(entry.createdAt).toLocaleDateString('en-GB')}</div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditEntry(entry)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No matching records found' : 'No accounts found'}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select 
                value={pagination.limit}
                onChange={(e) => handleRowsPerPageChange(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} 
                ({pagination.totalRecords} total records)
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages || pagination.totalPages === 0}
                  className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
