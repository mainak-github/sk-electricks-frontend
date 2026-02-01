'use client'

import { useState, useEffect } from 'react'

// API Configuration
import url from '../../../url'

// API Service Functions
const supplierPaymentAPI = {
  // Get all payment entries with pagination and search
  getPaymentEntries: async (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search || '',
      startDate: params.startDate || '',
      endDate: params.endDate || '',
      sortBy: params.sortBy || 'createdAt',
      sortOrder: params.sortOrder || 'desc'
    }).toString();
    
    const response = await fetch(`${url.API_URL}/supplier-payments/payment-entries?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch payment entries');
    }
    return response.json();
  },

  // Get next payment code
  getNextPaymentCode: async () => {
    const response = await fetch(`${url.API_URL}/supplier-payments/payment-entries/utils/next-code`);
    if (!response.ok) {
      throw new Error('Failed to get next payment code');
    }
    return response.json();
  },

  // Get suppliers list
  getSuppliers: async () => {
    const response = await fetch(`${url.API_URL}/suppliers`);
    if (!response.ok) {
      throw new Error('Failed to get suppliers');
    }
    return response.json();
  },

  // Get bank accounts list
  getBankAccounts: async () => {
    const response = await fetch(`${url.API_URL}/supplier-payments/payment-entries/utils/bank-accounts`);
    if (!response.ok) {
      throw new Error('Failed to get bank accounts');
    }
    return response.json();
  },

  // Create new payment entry
  createPaymentEntry: async (paymentData) => {
    const response = await fetch(`${url.API_URL}/supplier-payments/payment-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    return { ok: response.ok, ...result };
  },

  // Update payment entry
  updatePaymentEntry: async (id, paymentData) => {
    const response = await fetch(`${url.API_URL}/supplier-payments/payment-entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    return { ok: response.ok, ...result };
  },

  // Delete payment entry
  deletePaymentEntry: async (id) => {
    const response = await fetch(`${url.API_URL}/supplier-payments/payment-entries/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete payment entry');
    }
    return response.json();
  }
}

export default function SupplierPaymentEntry() {
  // Form state
  const [formData, setFormData] = useState({
    selectSupplier: '',
    paymentCode: '',
    paymentDate: new Date().toLocaleDateString('en-GB'),
    paymentCashBankAccount: '',
    paymentAmount: '',
    narration: ''
  })

  // Data state
  const [paymentEntries, setPaymentEntries] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [bankAccounts, setBankAccounts] = useState([])
  const [paymentItems, setPaymentItems] = useState([]) // For the payment cart

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
  const [editingPayment, setEditingPayment] = useState(null)

  // Load initial data
  useEffect(() => {
    loadSuppliers()
    loadBankAccounts()
    loadNextPaymentCode()
  }, [])

  // Load payment entries when pagination or search changes
  useEffect(() => {
    loadPaymentEntries()
  }, [pagination.currentPage, pagination.limit, searchTerm])

  // Load suppliers
  const loadSuppliers = async () => {
    try {
      const response = await supplierPaymentAPI.getSuppliers()
      console.log('Suppliers response:', response) // Debug log
      if (response.success || response.suppliers) {
        setSuppliers(response.suppliers || response.data || [])
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setError('Failed to load suppliers: ' + error.message)
    }
  }

  // Load bank accounts
  const loadBankAccounts = async () => {
    try {
      const response = await supplierPaymentAPI.getBankAccounts()
      if (response.success) {
        setBankAccounts(response.data)
      }
    } catch (error) {
      console.error('Error loading bank accounts:', error)
      setError('Failed to load bank accounts: ' + error.message)
    }
  }

  // Load next payment code
  const loadNextPaymentCode = async () => {
    try {
      const response = await supplierPaymentAPI.getNextPaymentCode()
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          paymentCode: response.data.paymentCode
        }))
      }
    } catch (error) {
      console.error('Error loading next payment code:', error)
    }
  }

  // Load payment entries
  const loadPaymentEntries = async () => {
    setLoading(true)
    setError('')
    
    try {
      const response = await supplierPaymentAPI.getPaymentEntries({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm
      })
      
      if (response.success) {
        setPaymentEntries(response.data)
        setPagination(prev => ({
          ...prev,
          totalRecords: response.pagination.totalRecords,
          totalPages: response.pagination.totalPages
        }))
      } else {
        setError(response.message || 'Failed to load payment entries')
      }
    } catch (error) {
      setError('Failed to load payment entries: ' + error.message)
      console.error('Error loading payment entries:', error)
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

  // Add to payment cart
  const handleAddToPayment = () => {
    if (!formData.selectSupplier || !formData.paymentCashBankAccount || !formData.paymentAmount) {
      setError('Please fill all required fields to add to payment')
      return
    }

    const newItem = {
      id: Date.now(),
      serialNumber: paymentItems.length + 1,
      toAccount: formData.selectSupplier,
      fromAccount: formData.paymentCashBankAccount,
      amount: parseFloat(formData.paymentAmount),
      description: ''
    }

    setPaymentItems(prev => [...prev, newItem])
    
    // Clear form fields but keep payment code and date
    setFormData(prev => ({
      ...prev,
      selectSupplier: '',
      paymentCashBankAccount: '',
      paymentAmount: ''
    }))

    console.log('Adding to payment:', newItem)
  }

  // Remove item from payment cart
  const handleRemoveFromPayment = (itemId) => {
    setPaymentItems(prev => prev.filter(item => item.id !== itemId))
  }

  // Save payment entry
  const handleSavePayment = async () => {
    if (paymentItems.length === 0) {
      setError('Please add at least one item to the payment')
      return
    }

    setLoading(true)
    setError('')
    setValidationErrors([])

    try {
      const totalAmount = paymentItems.reduce((sum, item) => sum + item.amount, 0)

      const paymentData = {
        paymentCode: formData.paymentCode,
        paymentDate: formData.paymentDate,
        supplier: paymentItems[0].toAccount, // Use supplier from first item
        bankAccount: paymentItems[0].fromAccount, // Use bank account from first item
        items: paymentItems.map(item => ({
          serialNumber: item.serialNumber,
          toAccount: item.toAccount,
          fromAccount: item.fromAccount,
          amount: item.amount,
          description: item.description
        })),
        paymentTotal: totalAmount,
        narration: formData.narration,
        paymentMethod: 'Cash',
        createdBy: 'Admin'
      }

      let response
      if (editingPayment) {
        response = await supplierPaymentAPI.updatePaymentEntry(editingPayment._id, paymentData)
      } else {
        response = await supplierPaymentAPI.createPaymentEntry(paymentData)
      }

      if (response.success) {
        setError('')
        setValidationErrors([])
        handleReset()
        loadPaymentEntries()
        
        if (editingPayment) {
          setEditingPayment(null)
          alert('Payment updated successfully!')
        } else {
          alert('Payment saved successfully!')
          loadNextPaymentCode()
        }
      } else {
        if (response.details && Array.isArray(response.details)) {
          setValidationErrors(response.details)
        } else {
          setError(response.message || 'Failed to save payment')
        }
      }
    } catch (error) {
      setError('Failed to save payment: ' + error.message)
      console.error('Error saving payment:', error)
    } finally {
      setLoading(false)
    }
  }

  // Reset form
  const handleReset = () => {
    setFormData({
      selectSupplier: '',
      paymentCode: '',
      paymentDate: new Date().toLocaleDateString('en-GB'),
      paymentCashBankAccount: '',
      paymentAmount: '',
      narration: ''
    })
    setPaymentItems([])
    setEditingPayment(null)
    setError('')
    setValidationErrors([])
    loadNextPaymentCode()
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
    if (!window.confirm('Are you sure you want to delete this payment entry?')) {
      return
    }

    setLoading(true)
    try {
      const response = await supplierPaymentAPI.deletePaymentEntry(id)
      if (response.success) {
        alert('Payment entry deleted successfully!')
        loadPaymentEntries()
      } else {
        setError(response.message || 'Failed to delete payment entry')
      }
    } catch (error) {
      setError('Failed to delete payment entry: ' + error.message)
      console.error('Error deleting payment entry:', error)
    } finally {
      setLoading(false)
    }
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Supplier Payment Entry List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0f766e; }
          </style>
        </head>
        <body>
          <h1>Supplier Payment Entry List</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Payment Code</th>
                <th>Payment Date</th>
                <th>Supplier</th>
                <th>Payment Total</th>
                <th>Narration</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              ${paymentEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.paymentCode}</td>
                  <td>${new Date(entry.paymentDate).toLocaleDateString('en-GB')}</td>
                  <td>${entry.supplier?.supplierName || 'N/A'}</td>
                  <td>₹ ${entry.paymentTotal?.toLocaleString('en-IN') || '0'}</td>
                  <td>${entry.narration || '-'}</td>
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
      ['SL', 'Payment Code', 'Payment Date', 'Supplier', 'Payment Total', 'Narration', 'Created By'],
      ...paymentEntries.map((entry, index) => [
        index + 1,
        entry.paymentCode,
        new Date(entry.paymentDate).toLocaleDateString('en-GB'),
        entry.supplier?.supplierName || 'N/A',
        entry.paymentTotal?.toLocaleString('en-IN') || '0',
        entry.narration || '-',
        entry.createdBy
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'supplier_payment_entries.csv'
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
            {editingPayment ? 'Edit Supplier Payment Entry' : 'Supplier Payment Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Select Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier *</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.selectSupplier}
                  onChange={(e) => handleInputChange('selectSupplier', e.target.value)}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier._id} value={supplier._id}>
                      {supplier.shopCompanyName ? 
                        `${supplier.supplierName} (${supplier.shopCompanyName})` : 
                        supplier.supplierName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Cash/Bank Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Cash/ Bank Account *</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.paymentCashBankAccount}
                  onChange={(e) => handleInputChange('paymentCashBankAccount', e.target.value)}
                >
                  <option value="">Select Account</option>
                  {bankAccounts.map(account => (
                    <option key={account._id} value={account._id}>
                      {account.accountName} ({account.accountType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount *</label>
                <input 
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.paymentAmount}
                  onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                  placeholder="Enter amount"
                />
              </div>

              {/* Press Enter Key to Payment Cart */}
              <div>
                <p className="text-xs text-gray-500 mb-3">Press Enter Key to Payment Cart</p>
                <button 
                  onClick={handleAddToPayment}
                  className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  ADD TO PAYMENT
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Payment Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Code</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.paymentCode}
                  onChange={(e) => handleInputChange('paymentCode', e.target.value)}
                  disabled={editingPayment !== null}
                />
              </div>

              {/* Payment Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.paymentDate.split('/').reverse().join('-')}
                  onChange={(e) => handleInputChange('paymentDate', new Date(e.target.value).toLocaleDateString('en-GB'))}
                />
              </div>

              {/* Payment Items Cart */}
              <div className="border rounded p-3">
                <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-700 mb-2">
                  <div>SL</div>
                  <div>To Account</div>
                  <div>From Account</div>
                  <div>Payment</div>
                  <div>Actions</div>
                </div>
                
                {paymentItems.length > 0 ? (
                  <div className="max-h-40 overflow-y-auto">
                    {paymentItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-5 gap-2 text-xs py-1 border-t">
                        <div>{index + 1}</div>
                        <div className="truncate">
                          {suppliers.find(sup => sup._id === item.toAccount)?.supplierName || item.toAccount}
                        </div>
                        <div className="truncate">
                          {bankAccounts.find(acc => acc._id === item.fromAccount)?.accountName || item.fromAccount}
                        </div>
                        <div>₹{item.amount.toLocaleString('en-IN')}</div>
                        <div>
                          <button 
                            onClick={() => handleRemoveFromPayment(item.id)}
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

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSavePayment}
              disabled={loading}
              className="bg-teal-600 text-white px-8 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <span>💾</span> {editingPayment ? 'UPDATE' : 'SAVE'}
            </button>
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-8 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              {editingPayment ? 'CANCEL' : 'RESET'}
            </button>
          </div>
        </div>
      </div>

      {/* Supplier Payment Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Supplier Payment Entry List ({pagination.totalRecords} records)
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
                placeholder="Search by supplier name or payment code..."
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
                <div>Payment Code</div>
                <div>Payment Date</div>
                <div>Supplier</div>
                <div>Payment Total</div>
                <div>Narration</div>
                <div>Created By</div>
                <div>Actions</div>
              </div>

              {paymentEntries.length > 0 ? (
                paymentEntries.map((entry, index) => (
                  <div key={entry._id} className="grid grid-cols-8 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{(pagination.currentPage - 1) * pagination.limit + index + 1}</div>
                    <div className="font-medium text-teal-600">{entry.paymentCode}</div>
                    <div>{new Date(entry.paymentDate).toLocaleDateString('en-GB')}</div>
                    <div>
                      {entry.supplier?.shopCompanyName ? 
                        `${entry.supplier.supplierName} (${entry.supplier.shopCompanyName})` : 
                        entry.supplier?.supplierName || 'N/A'}
                    </div>
                    <div className="font-medium">₹ {entry.paymentTotal?.toLocaleString('en-IN') || '0'}</div>
                    <div>{entry.narration || '-'}</div>
                    <div>{entry.createdBy}</div>
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
                  {searchTerm ? 'No matching records found' : 'No payment entries found'}
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
