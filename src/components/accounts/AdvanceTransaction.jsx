'use client'

import { useState } from 'react'

export default function AdvanceTransactionEntry() {
  const [formData, setFormData] = useState({
    transactionType: '',
    customerSupplierAccount: '',
    transactionAccountType: '',
    cashBankAccount: '',
    transactionAmount: '',
    transactionDate: '19/08/2025',
    narration: ''
  })

  const [advanceEntries, setAdvanceEntries] = useState([])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState(advanceEntries)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveTransaction = () => {
    if (formData.transactionType && formData.customerSupplierAccount && formData.transactionAmount) {
      const newEntry = {
        id: Date.now(),
        sl: advanceEntries.length + 1,
        transactionDate: formData.transactionDate,
        customerSupplierAccount: formData.customerSupplierAccount,
        transactionType: formData.transactionType,
        transactionAccountType: formData.transactionAccountType,
        cashBankAccount: formData.cashBankAccount,
        transactionAmount: formData.transactionAmount,
        narration: formData.narration,
        createdBy: 'Admin'
      }
      
      setAdvanceEntries(prev => [...prev, newEntry])
      setFilteredEntries(prev => [...prev, newEntry])
      
      // Reset form
      setFormData({
        transactionType: '',
        customerSupplierAccount: '',
        transactionAccountType: '',
        cashBankAccount: '',
        transactionAmount: '',
        transactionDate: '19/08/2025',
        narration: ''
      })
      
      console.log('Saving advance transaction:', newEntry)
    }
  }

  const handleReset = () => {
    setFormData({
      transactionType: '',
      customerSupplierAccount: '',
      transactionAccountType: '',
      cashBankAccount: '',
      transactionAmount: '',
      transactionDate: '19/08/2025',
      narration: ''
    })
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(advanceEntries)
    } else {
      const filtered = advanceEntries.filter(entry =>
        entry.customerSupplierAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.cashBankAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.narration.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(advanceEntries)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Advance Transaction List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
          </style>
        </head>
        <body>
          <h1>Advance Transaction List</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Transaction Date</th>
                <th>Customer/Supplier Account</th>
                <th>Transaction Type</th>
                <th>Account Type</th>
                <th>Cash/Bank Account</th>
                <th>Transaction Amount</th>
                <th>Narration</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.transactionDate}</td>
                  <td>${entry.customerSupplierAccount}</td>
                  <td>${entry.transactionType}</td>
                  <td>${entry.transactionAccountType}</td>
                  <td>${entry.cashBankAccount}</td>
                  <td>₹ ${entry.transactionAmount}</td>
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
      ['SL', 'Transaction Date', 'Customer/Supplier Account', 'Transaction Type', 'Account Type', 'Cash/Bank Account', 'Transaction Amount', 'Narration', 'Created By'],
      ...filteredEntries.map((entry, index) => [
        index + 1,
        entry.transactionDate,
        entry.customerSupplierAccount,
        entry.transactionType,
        entry.transactionAccountType,
        entry.cashBankAccount,
        `₹ ${entry.transactionAmount}`,
        entry.narration,
        entry.createdBy
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'advance_transactions.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = advanceEntries.filter(entry => entry.id !== id)
      setAdvanceEntries(updatedEntries)
      setFilteredEntries(updatedEntries.filter(entry =>
        searchTerm === '' ||
        entry.customerSupplierAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.cashBankAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.narration.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Advance Transaction Entry</h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.transactionType}
                  onChange={(e) => handleInputChange('transactionType', e.target.value)}
                >
                  <option value="">Transaction Type</option>
                  <option value="Advance Received">Advance Received</option>
                  <option value="Advance Payment">Advance Payment</option>
                </select>
              </div>

              {/* Customer/Supplier Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Customer/Supplier Account</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.customerSupplierAccount}
                  onChange={(e) => handleInputChange('customerSupplierAccount', e.target.value)}
                >
                  <option value="">Select Customer/ Supplier Account</option>
                  <option value="Customer A">Customer A</option>
                  <option value="Customer B">Customer B</option>
                  <option value="Supplier X">Supplier X</option>
                  <option value="Supplier Y">Supplier Y</option>
                </select>
              </div>

              {/* Transaction Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Account Type</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.transactionAccountType}
                  onChange={(e) => handleInputChange('transactionAccountType', e.target.value)}
                >
                  <option value="">Transaction Account Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                </select>
              </div>

              {/* Cash/Bank Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cash/Bank Account</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.cashBankAccount}
                  onChange={(e) => handleInputChange('cashBankAccount', e.target.value)}
                >
                  <option value="">Select Cash/Bank Account</option>
                  <option value="Cash Account">Cash Account</option>
                  <option value="Bank Account 1">Bank Account 1</option>
                  <option value="Bank Account 2">Bank Account 2</option>
                  <option value="Savings Account">Savings Account</option>
                  <option value="Current Account">Current Account</option>
                </select>
              </div>

              {/* Transaction Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Amount</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.transactionAmount}
                  onChange={(e) => handleInputChange('transactionAmount', e.target.value)}
                  placeholder="Transaction Amount"
                />
              </div>
            </div>

            {/* Middle Column - Narration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Narration...</label>
              <textarea 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 h-80"
                placeholder="Narration..."
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Transaction Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Date</label>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.transactionDate}
                    onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                  />
                  <span className="absolute right-2 top-2 text-gray-400">📅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSaveTransaction}
              className="bg-teal-600 text-white px-8 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              💾 SAVE
            </button>
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-8 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* Advance Transaction List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Advance Transaction List</h3>
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
                placeholder="Search by customer/supplier, transaction type, cash/bank account or narration..."
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

          {/* Table Headers */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-10 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>SL</div>
                <div>Transaction Date</div>
                <div>Customer/Supplier Account</div>
                <div>Tran Type</div>
                <div>Acc Type</div>
                <div>Cash/Bank Account</div>
                <div>Transaction Amount</div>
                <div>Narration</div>
                <div>Created By</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {currentEntries.length > 0 ? (
                currentEntries.map((entry, index) => (
                  <div key={entry.id} className="grid grid-cols-10 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{startIndex + index + 1}</div>
                    <div>{entry.transactionDate}</div>
                    <div>{entry.customerSupplierAccount}</div>
                    <div className="font-medium text-teal-600">{entry.transactionType}</div>
                    <div>{entry.transactionAccountType}</div>
                    <div>{entry.cashBankAccount}</div>
                    <div className="font-medium">₹ {entry.transactionAmount}</div>
                    <div>{entry.narration}</div>
                    <div>{entry.createdBy}</div>
                    <div className="flex gap-1">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteEntry(entry.id)}
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
                  {searchTerm ? 'No matching records found' : 'Sorry, no matching records found'}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select 
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
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
                {filteredEntries.length === 0 
                  ? '0-0 of 0' 
                  : `${startIndex + 1}-${Math.min(endIndex, filteredEntries.length)} of ${filteredEntries.length}`
                }
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
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