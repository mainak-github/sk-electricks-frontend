'use client'

import { useState } from 'react'

export default function BranchTransactionEntry() {
  const [formData, setFormData] = useState({
    toBranch: '',
    toBranchAccount: '',
    fromAccount: '',
    transactionAmount: '',
    branchTranCode: 'BT-4',
    branchTranDate: '19/08/2025',
    narration: ''
  })

  const [branchTransactions, setBranchTransactions] = useState([
    {
      id: 1,
      sl: 1,
      tranCode: 'BT-3',
      tranDate: '19 Aug 2025',
      toBranch: 'Dhaka Branch',
      fromAccount: 'Cash',
      toBranchAccount: 'Cash',
      amount: '10000',
      narration: '',
      createdBy: 'softtask',
      status: 'Pending'
    },
    {
      id: 2,
      sl: 2,
      tranCode: 'BT-2',
      tranDate: '19 Aug 2025',
      toBranch: 'Dhaka Branch',
      fromAccount: 'Cash',
      toBranchAccount: 'Cash',
      amount: '2',
      narration: '',
      createdBy: 'softtask',
      status: 'Pending'
    }
  ])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredTransactions, setFilteredTransactions] = useState(branchTransactions)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Format Indian currency
  const formatIndianCurrency = (amount) => {
    if (!amount) return '₹0'
    const numAmount = parseFloat(amount)
    return `₹${numAmount.toLocaleString('en-IN')}`
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveTransaction = () => {
    if (formData.toBranch && formData.fromAccount && formData.transactionAmount && formData.toBranchAccount) {
      const newTransaction = {
        id: Date.now(),
        sl: branchTransactions.length + 1,
        tranCode: formData.branchTranCode,
        tranDate: formData.branchTranDate,
        toBranch: formData.toBranch,
        fromAccount: formData.fromAccount,
        toBranchAccount: formData.toBranchAccount,
        amount: formData.transactionAmount,
        narration: formData.narration,
        createdBy: 'Admin',
        status: 'Pending'
      }
      
      setBranchTransactions(prev => [...prev, newTransaction])
      setFilteredTransactions(prev => [...prev, newTransaction])
      
      // Reset form
      setFormData({
        toBranch: '',
        toBranchAccount: '',
        fromAccount: '',
        transactionAmount: '',
        branchTranCode: `BT-${Math.floor(Math.random() * 100)}`,
        branchTranDate: '19/08/2025',
        narration: ''
      })
      
      console.log('Saving branch transaction:', newTransaction)
    }
  }

  const handleReset = () => {
    setFormData({
      toBranch: '',
      toBranchAccount: '',
      fromAccount: '',
      transactionAmount: '',
      branchTranCode: 'BT-4',
      branchTranDate: '19/08/2025',
      narration: ''
    })
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredTransactions(branchTransactions)
    } else {
      const filtered = branchTransactions.filter(transaction =>
        transaction.tranCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.toBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.toBranchAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.narration.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTransactions(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredTransactions(branchTransactions)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Branch Transaction List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
          </style>
        </head>
        <body>
          <h1>Branch Transaction List</h1>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Tran Code</th>
                <th>Tran Date</th>
                <th>To Branch</th>
                <th>From Account</th>
                <th>To Branch Account</th>
                <th>Amount</th>
                <th>Narration</th>
                <th>Created By</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTransactions.map((transaction, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${transaction.tranCode}</td>
                  <td>${transaction.tranDate}</td>
                  <td>${transaction.toBranch}</td>
                  <td>${transaction.fromAccount}</td>
                  <td>${transaction.toBranchAccount}</td>
                  <td>${formatIndianCurrency(transaction.amount)}</td>
                  <td>${transaction.narration}</td>
                  <td>${transaction.createdBy}</td>
                  <td>${transaction.status}</td>
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
      ['SL', 'Tran Code', 'Tran Date', 'To Branch', 'From Account', 'To Branch Account', 'Amount', 'Narration', 'Created By', 'Status'],
      ...filteredTransactions.map((transaction, index) => [
        index + 1,
        transaction.tranCode,
        transaction.tranDate,
        transaction.toBranch,
        transaction.fromAccount,
        transaction.toBranchAccount,
        formatIndianCurrency(transaction.amount),
        transaction.narration,
        transaction.createdBy,
        transaction.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'branch_transactions.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete transaction
  const handleDeleteTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const updatedTransactions = branchTransactions.filter(transaction => transaction.id !== id)
      setBranchTransactions(updatedTransactions)
      setFilteredTransactions(updatedTransactions.filter(transaction =>
        searchTerm === '' ||
        transaction.tranCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.toBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.toBranchAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.narration.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    }
  }

  // Update status
  const handleStatusUpdate = (id, newStatus) => {
    const updatedTransactions = branchTransactions.map(transaction =>
      transaction.id === id ? { ...transaction, status: newStatus } : transaction
    )
    setBranchTransactions(updatedTransactions)
    setFilteredTransactions(updatedTransactions)
  }

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex)

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Branch Transaction</h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* To Branch */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Branch</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.toBranch}
                  onChange={(e) => handleInputChange('toBranch', e.target.value)}
                >
                  <option value="">To Branch</option>
                  <option value="Mumbai Branch">Mumbai Branch</option>
                  <option value="Delhi Branch">Delhi Branch</option>
                  <option value="Kolkata Branch">Kolkata Branch</option>
                  <option value="Chennai Branch">Chennai Branch</option>
                  <option value="Bangalore Branch">Bangalore Branch</option>
                  <option value="Hyderabad Branch">Hyderabad Branch</option>
                  <option value="Pune Branch">Pune Branch</option>
                  <option value="Ahmedabad Branch">Ahmedabad Branch</option>
                </select>
              </div>

              {/* From Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Account</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.fromAccount}
                  onChange={(e) => handleInputChange('fromAccount', e.target.value)}
                >
                  <option value="">From Account</option>
                  <option value="Cash">Cash</option>
                  <option value="SBI Bank Account">SBI Bank Account</option>
                  <option value="HDFC Bank Account">HDFC Bank Account</option>
                  <option value="ICICI Bank Account">ICICI Bank Account</option>
                  <option value="Axis Bank Account">Axis Bank Account</option>
                  <option value="PNB Bank Account">PNB Bank Account</option>
                </select>
              </div>

              {/* Transaction Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Amount</label>
                <input 
                  type="number"
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
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 h-32"
                placeholder="Narration..."
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* To Branch Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Branch Account</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.toBranchAccount}
                  onChange={(e) => handleInputChange('toBranchAccount', e.target.value)}
                >
                  <option value="">To Branch Account</option>
                  <option value="Cash">Cash</option>
                  <option value="SBI Bank Account">SBI Bank Account</option>
                  <option value="HDFC Bank Account">HDFC Bank Account</option>
                  <option value="ICICI Bank Account">ICICI Bank Account</option>
                  <option value="Axis Bank Account">Axis Bank Account</option>
                  <option value="PNB Bank Account">PNB Bank Account</option>
                </select>
              </div>

              {/* Branch Tran Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Tran Code</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.branchTranCode}
                  onChange={(e) => handleInputChange('branchTranCode', e.target.value)}
                />
              </div>

              {/* Branch Tran Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Tran Date</label>
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.branchTranDate}
                    onChange={(e) => handleInputChange('branchTranDate', e.target.value)}
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

      {/* Branch Transaction List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Branch Transaction List</h3>
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
                placeholder="Search by transaction code, branch, accounts or narration..."
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
              <div className="grid grid-cols-11 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>SL</div>
                <div>Tran Code</div>
                <div>Tran Date</div>
                <div>To Branch</div>
                <div>From Account</div>
                <div>To Branch Account</div>
                <div>Amount</div>
                <div>Narration</div>
                <div>Created By</div>
                <div>Status</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {currentTransactions.length > 0 ? (
                currentTransactions.map((transaction, index) => (
                  <div key={transaction.id} className="grid grid-cols-11 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{startIndex + index + 1}</div>
                    <div className="font-medium text-teal-600">{transaction.tranCode}</div>
                    <div>{transaction.tranDate}</div>
                    <div>{transaction.toBranch}</div>
                    <div>{transaction.fromAccount}</div>
                    <div>{transaction.toBranchAccount}</div>
                    <div className="font-medium">{formatIndianCurrency(transaction.amount)}</div>
                    <div>{transaction.narration}</div>
                    <div>{transaction.createdBy}</div>
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        transaction.status === 'Pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : transaction.status === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteTransaction(transaction.id)}
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
                {filteredTransactions.length === 0 
                  ? '0-0 of 0' 
                  : `${startIndex + 1}-${Math.min(endIndex, filteredTransactions.length)} of ${filteredTransactions.length}`
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