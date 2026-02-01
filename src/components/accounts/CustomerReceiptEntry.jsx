'use client'

import { useState, useEffect } from 'react'

// API Configuration
import url from '../../../url'

// API Service Functions
const receiptAPI = {
  // Get all receipt entries with pagination and search
  getReceiptEntries: async (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
      startDate: params.startDate || '',
      endDate: params.endDate || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    }).toString();
    
    const response = await fetch(`${url.API_URL}/receipt-entries?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch receipt entries');
    }
    return response.json();
  },

  // Get next receipt code
  getNextReceiptCode: async () => {
    const response = await fetch(`${url.API_URL}/receipt-entries/utils/next-code`);
    if (!response.ok) {
      throw new Error('Failed to get next receipt code');
    }
    return response.json();
  },

  // Get customers list
  getCustomers: async () => {
    const response = await fetch(`${url.API_URL}/customers`);
    console.log(response)
    if (!response.ok) {
      throw new Error('Failed to get customers');
    }
    return response.json();
  },

  // Get bank accounts list
  getBankAccounts: async () => {
    const response = await fetch(`${url.API_URL}/receipt-entries/utils/bank-accounts`);
    if (!response.ok) {
      throw new Error('Failed to get bank accounts');
    }
    return response.json();
  },

  // Create new receipt entry
  createReceiptEntry: async (receiptData) => {
    const response = await fetch(`${url.API_URL}/receipt-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });
    
    const result = await response.json();
    return { ok: response.ok, ...result };
  },

  // Update receipt entry
  updateReceiptEntry: async (id, receiptData) => {
    const response = await fetch(`${url.API_URL}/receipt-entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(receiptData)
    });
    
    const result = await response.json();
    return { ok: response.ok, ...result };
  },

  // Delete receipt entry
  deleteReceiptEntry: async (id) => {
    const response = await fetch(`${url.API_URL}/receipt-entries/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete receipt entry');
    }
    return response.json();
  }
}

export default function CustomerReceiptEntry() {
  // Form state
  const [formData, setFormData] = useState({
    selectCustomer: '',
    receiptCode: '',
    receiptDate: new Date().toLocaleDateString('en-GB'),
    receivedCashBankAccount: '',
    receivedAmount: '',
    anyDiscount: false,
    narration: '',
    smsToMobile: false
  })

  // Data state
  const [receiptEntries, setReceiptEntries] = useState([])
  const [customers, setCustomers] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [receiptItems, setReceiptItems] = useState([])

  // Pagination state
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
  const [validationErrors, setValidationErrors] = useState([])
  const [editingReceipt, setEditingReceipt] = useState(null)

  // Load initial data
  useEffect(() => {
    loadCustomers()
    loadBankAccounts()
    loadNextReceiptCode()
  }, [])

  // Load receipt entries when pagination or search changes
  useEffect(() => {
    loadReceiptEntries()
  }, [pagination.currentPage, pagination.limit, searchTerm])

  // Load customers
  const loadCustomers = async () => {
    try {
      const response = await receiptAPI.getCustomers()
      console.log('Customers response:', response) // Debug log
      if (response.success || response.customers) {
        // ✅ Fixed: Handle both response formats
        setCustomers(response.customers || response.data || [])
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      setError('Failed to load customers: ' + error.message)
    }
  }

  // Load bank accounts
  const loadBankAccounts = async () => {
    try {
      const response = await receiptAPI.getBankAccounts()
      if (response.success) {
        setBankAccounts(response.data)
      }
    } catch (error) {
      console.error('Error loading bank accounts:', error)
      setError('Failed to load bank accounts: ' + error.message)
    }
  }

  // Load next receipt code
  const loadNextReceiptCode = async () => {
    try {
      const response = await receiptAPI.getNextReceiptCode()
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          receiptCode: response.data.receiptCode
        }))
      }
    } catch (error) {
      console.error('Error loading next receipt code:', error)
    }
  }

  // Load receipt entries
  const loadReceiptEntries = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await receiptAPI.getReceiptEntries({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm
      })
      
      if (response.success) {
        setReceiptEntries(response.data)
        setPagination(prev => ({
          ...prev,
          totalRecords: response.pagination.totalRecords,
          totalPages: response.pagination.totalPages
        }))
      } else {
        setError(response.message || 'Failed to load receipt entries')
      }
    } catch (error) {
      setError('Failed to load receipt entries: ' + error.message)
      console.error('Error loading receipt entries:', error)
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
    
    if (validationErrors.length > 0) {
      setValidationErrors([])
    }
    if (error) {
      setError('')
    }
  }

  // Add to receipt cart
  const handleAddToReceipt = () => {
    if (!formData.selectCustomer || !formData.receivedCashBankAccount || !formData.receivedAmount) {
      setError('Please fill all required fields to add to receipt')
      return
    }

    const newItem = {
      id: Date.now(),
      serialNumber: receiptItems.length + 1,
      receivedInto: formData.receivedCashBankAccount,
      fromCustomer: formData.selectCustomer,
      emiNumber: '',
      voucherNumber: '',
      amount: parseFloat(formData.receivedAmount),
      discount: formData.anyDiscount ? 0 : 0
    }

    setReceiptItems(prev => [...prev, newItem])
    
    // Clear form fields but keep receipt code and date
    setFormData(prev => ({
      ...prev,
      selectCustomer: '',
      receivedCashBankAccount: '',
      receivedAmount: '',
      anyDiscount: false
    }))

    console.log('Adding to receipt:', newItem)
  }

  // Remove item from receipt cart
  const handleRemoveFromReceipt = (itemId) => {
    setReceiptItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Save receipt entry
  const handleSaveReceipt = async () => {
    if (receiptItems.length === 0) {
      setError('Please add at least one item to the receipt')
      return
    }

    setLoading(true)
    setError('')
    setValidationErrors([])

    try {
      const totalAmount = receiptItems.reduce((sum, item) => sum + item.amount, 0)
      const totalDiscount = receiptItems.reduce((sum, item) => sum + item.discount, 0)

      const receiptData = {
        receiptCode: formData.receiptCode,
        receiptDate: formData.receiptDate,
        customer: receiptItems[0].fromCustomer,
        bankAccount: receiptItems[0].receivedInto,
        items: receiptItems.map(item => ({
          serialNumber: item.serialNumber,
          receivedInto: item.receivedInto,
          fromCustomer: item.fromCustomer,
          emiNumber: item.emiNumber,
          voucherNumber: item.voucherNumber,
          amount: item.amount,
          discount: item.discount
        })),
        totalDiscount: totalDiscount,
        receivedTotal: totalAmount,
        narration: formData.narration,
        smsToMobile: formData.smsToMobile,
        createdBy: 'Admin'
      }

      let response
      if (editingReceipt) {
        response = await receiptAPI.updateReceiptEntry(editingReceipt._id, receiptData)
      } else {
        response = await receiptAPI.createReceiptEntry(receiptData)
      }

      if (response.success) {
        setError('')
        setValidationErrors([])
        handleReset()
        loadReceiptEntries()
        
        if (editingReceipt) {
          setEditingReceipt(null)
          alert('Receipt updated successfully!')
        } else {
          alert('Receipt saved successfully!')
          loadNextReceiptCode()
        }
      } else {
        if (response.details && Array.isArray(response.details)) {
          setValidationErrors(response.details)
        } else {
          setError(response.message || 'Failed to save receipt')
        }
      }
    } catch (error) {
      setError('Failed to save receipt: ' + error.message)
      console.error('Error saving receipt:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      selectCustomer: '',
      receiptCode: '',
      receiptDate: new Date().toLocaleDateString('en-GB'),
      receivedCashBankAccount: '',
      receivedAmount: '',
      anyDiscount: false,
      narration: '',
      smsToMobile: false
    })
    setReceiptItems([])
    setEditingReceipt(null)
    setError('')
    setValidationErrors([])
    loadNextReceiptCode()
  }

  // Search functionality
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receipt entry?')) {
      return
    }

    setLoading(true)
    try {
      const response = await receiptAPI.deleteReceiptEntry(id)
      if (response.success) {
        alert('Receipt entry deleted successfully!')
        loadReceiptEntries()
      } else {
        setError(response.message || 'Failed to delete receipt entry')
      }
    } catch (error) {
      setError('Failed to delete receipt entry: ' + error.message)
      console.error('Error deleting receipt entry:', error)
    } finally {
      setLoading(false)
    }
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Receipt Entry List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0f766e; }
          </style>
        </head>
        <body>
          <h1>Receipt Entry List</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Receipt Code</th>
                <th>Receipt Date</th>
                <th>Customer</th>
                <th>Total Discount</th>
                <th>Received Total</th>
                <th>Narration</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              ${receiptEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.receiptCode}</td>
                  <td>${new Date(entry.receiptDate).toLocaleDateString('en-GB')}</td>
                  <td>${entry.customer?.customerName || entry.customer?.name || 'N/A'}</td>
                  <td>₹ ${entry.totalDiscount}</td>
                  <td>₹ ${entry.receivedTotal}</td>
                  <td>${entry.narration}</td>
                  <td>${entry.createdBy}</td>
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
      ['SL', 'Receipt Code', 'Receipt Date', 'Customer', 'Total Discount', 'Received Total', 'Narration', 'Created By'],
      ...receiptEntries.map((entry, index) => [
        index + 1,
        entry.receiptCode,
        new Date(entry.receiptDate).toLocaleDateString('en-GB'),
        entry.customer?.customerName || entry.customer?.name || 'N/A',
        entry.totalDiscount,
        entry.receivedTotal,
        entry.narration,
        entry.createdBy
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'receipt_entries.csv'
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
      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Validation Errors Display */}
      {validationErrors.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
          <div className="flex items-start">
            <span className="text-yellow-500 mr-2 mt-0.5">⚠️</span>
            <div>
              <p className="font-semibold mb-2">Validation Errors Found:</p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((err, idx) => (
                  <li key={idx} className="text-sm">
                    <strong>{err.field ? `${err.field.charAt(0).toUpperCase() + err.field.slice(1)}:` : 'Field:'}</strong> {err.message}
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

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">
            {editingReceipt ? 'Edit Customer Receipt Entry' : 'Customer Receipt Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Select Customer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer *</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.selectCustomer}
                  onChange={(e) => handleInputChange('selectCustomer', e.target.value)}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {/* ✅ Fixed: Use customerName instead of name */}
                      {customer.customerName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Received Cash/Bank Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Received Cash/ Bank Account *</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.receivedCashBankAccount}
                  onChange={(e) => handleInputChange('receivedCashBankAccount', e.target.value)}
                >
                  <option value="">Select Account</option>
                  {bankAccounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.accountName} ({account.accountType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Received Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Received Amount *</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.receivedAmount}
                  onChange={(e) => handleInputChange('receivedAmount', e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              {/* Any Discount */}
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.anyDiscount}
                    onChange={(e) => handleInputChange('anyDiscount', e.target.checked)}
                    className="text-teal-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Any Discount ?</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Press Enter Key to Receipt Cart</p>
              </div>

              {/* Add to Receipt Button */}
              <div>
                <button 
                  onClick={handleAddToReceipt}
                  className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  ADD TO RECEIPT
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Receipt Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Code</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.receiptCode}
                  onChange={(e) => handleInputChange('receiptCode', e.target.value)}
                  disabled={editingReceipt !== null}
                />
              </div>

              {/* Receipt Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.receiptDate.split('/').reverse().join('-')}
                  onChange={(e) => handleInputChange('receiptDate', new Date(e.target.value).toLocaleDateString('en-GB'))}
                />
              </div>

              {/* Receipt Items Cart */}
              <div className="border rounded p-3">
                <div className="grid grid-cols-6 gap-2 text-xs font-semibold text-gray-700 mb-2">
                  <div>SL</div>
                  <div>Account</div>
                  <div>Customer</div>
                  <div>Amount</div>
                  <div>Discount</div>
                  <div>Actions</div>
                </div>
                
                {receiptItems.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto">
                    {receiptItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-6 gap-2 text-xs py-1 border-t">
                        <div>{index + 1}</div>
                        <div className="truncate">
                          {bankAccounts.find(acc => acc._id === item.receivedInto)?.accountName || item.receivedInto}
                        </div>
                        <div className="truncate">
                          {/* ✅ Fixed: Use customerName instead of name */}
                          {customers.find(cust => cust._id === item.fromCustomer)?.customerName || item.fromCustomer}
                        </div>
                        <div>₹{item.amount}</div>
                        <div>₹{item.discount}</div>
                        <div>
                          <button 
                            onClick={() => handleRemoveFromReceipt(item.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Remove"
                          >
                            🗑️
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
              </div>
            </div>
          </div>

          {/* Narration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Narration...</label>
            <textarea 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows="3"
              placeholder="Narration..."
              value={formData.narration}
              onChange={(e) => handleInputChange('narration', e.target.value)}
            />
          </div>

          {/* SMS to Mobile */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.smsToMobile}
                onChange={(e) => handleInputChange('smsToMobile', e.target.checked)}
                className="text-teal-600"
              />
              <span className="text-sm text-gray-700">SMS to Mobile?</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSaveReceipt}
              disabled={loading}
              className="bg-teal-600 text-white px-8 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span>💾</span> {editingReceipt ? 'UPDATE' : 'SAVE'}
            </button>
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-8 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              {editingReceipt ? 'CANCEL' : 'RESET'}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Receipt Entry List ({pagination.totalRecords} records)
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
                placeholder="Search by customer name or receipt code..."
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
              <div className="grid grid-cols-8 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>SL</div>
                <div>Receipt Code</div>
                <div>Receipt Date</div>
                <div>Customer</div>
                <div>Total Discount</div>
                <div>Received Total</div>
                <div>Narration</div>
                <div>Actions</div>
              </div>

              {receiptEntries.length > 0 ? (
                receiptEntries.map((entry, index) => (
                  <div key={entry._id} className="grid grid-cols-8 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{(pagination.currentPage - 1) * pagination.limit + index + 1}</div>
                    <div className="font-medium text-teal-600">{entry.receiptCode}</div>
                    <div>{new Date(entry.receiptDate).toLocaleDateString('en-GB')}</div>
                    {/* ✅ Fixed: Use customerName instead of name */}
                    <div>{entry.customer?.customerName || entry.customer?.name || 'N/A'}</div>
                    <div className="font-medium">₹ {entry.totalDiscount?.toLocaleString('en-IN') || '0'}</div>
                    <div className="font-medium">₹ {entry.receivedTotal?.toLocaleString('en-IN') || '0'}</div>
                    <div>{entry.narration || '-'}</div>
                    <div className="flex gap-1">
                      <button 
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
                  {searchTerm ? 'No matching records found' : 'No receipt entries found'}
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
