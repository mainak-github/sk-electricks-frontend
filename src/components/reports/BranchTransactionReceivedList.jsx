'use client'

import { useState } from 'react'

export default function BranchTransactionReceivedList() {
  const [filterType, setFilterType] = useState('All')
  const [branchFilter, setBranchFilter] = useState('By Branch')
  const [fromDate, setFromDate] = useState('21/08/2025')
  const [toDate, setToDate] = useState('21/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample branch transaction received data
  const [transactionData] = useState([
    { 
      id: 1, 
      sl: 1, 
      branchName: 'Dhaka Branch', 
      transactionType: 'Payment Received', 
      invoiceNo: 'REC-2024-001', 
      amount: 25000.00, 
      receivedDate: '20/08/2025',
      customerName: 'Ahmed Trading', 
      paymentMethod: 'Bank Transfer',
      referenceNo: 'TXN-2024-1001',
      status: 'Confirmed' 
    },
    { 
      id: 2, 
      sl: 2, 
      branchName: 'Chittagong Branch', 
      transactionType: 'Cash Received', 
      invoiceNo: 'REC-2024-002', 
      amount: 15000.00, 
      receivedDate: '21/08/2025',
      customerName: 'Rahman Suppliers', 
      paymentMethod: 'Cash',
      referenceNo: 'CASH-2024-2001',
      status: 'Confirmed' 
    },
    { 
      id: 3, 
      sl: 3, 
      branchName: 'Sylhet Branch', 
      transactionType: 'Online Payment', 
      invoiceNo: 'REC-2024-003', 
      amount: 32000.00, 
      receivedDate: '19/08/2025',
      customerName: 'Karim Enterprise', 
      paymentMethod: 'Mobile Banking',
      referenceNo: 'MOB-2024-3001',
      status: 'Processing' 
    }
  ])

  const [filteredData, setFilteredData] = useState(transactionData)

  // Filter options
  const filterOptions = [
    'All',
    'Payment Received',
    'Cash Received',
    'Online Payment'
  ]

  const branchOptions = [
    'By Branch',
    'Dhaka Branch',
    'Chittagong Branch',
    'Sylhet Branch',
    'Rajshahi Branch',
    'Khulna Branch'
  ]

  // Calculate totals
  const totalTransactions = filteredData.length
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0)
  const confirmedTransactions = filteredData.filter(item => item.status === 'Confirmed').length
  const processingTransactions = filteredData.filter(item => item.status === 'Processing').length

  const handleGetReport = () => {
    console.log('Generating branch transaction received list with filters:', {
      filterType,
      branchFilter,
      fromDate,
      toDate
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    setFilteredData(transactionData)
    setShowSearch(false)
    // Here you would typically make an API call to get filtered data based on dates and filters
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(transactionData)
    } else {
      const filtered = transactionData.filter(entry =>
        entry.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.referenceNo.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(transactionData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Branch Transaction Received List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Branch Transaction Received List</h1>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Branch Name</th>
                <th>Transaction Type</th>
                <th>Invoice No</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Received Date</th>
                <th>Payment Method</th>
                <th>Reference No</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.branchName}</td>
                  <td>${entry.transactionType}</td>
                  <td>${entry.invoiceNo}</td>
                  <td>${entry.customerName}</td>
                  <td class="amount">${entry.amount.toFixed(2)}</td>
                  <td>${entry.receivedDate}</td>
                  <td>${entry.paymentMethod}</td>
                  <td>${entry.referenceNo}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>Total Amount</strong></td>
                <td class="amount"><strong>${totalAmount.toFixed(2)}</strong></td>
                <td colspan="4"><strong>Total: ${totalTransactions} transactions</strong></td>
              </tr>
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
      ['SL', 'Branch Name', 'Transaction Type', 'Invoice No', 'Customer Name', 'Amount', 'Received Date', 'Payment Method', 'Reference No', 'Status'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.branchName,
        entry.transactionType,
        entry.invoiceNo,
        entry.customerName,
        entry.amount.toFixed(2),
        entry.receivedDate,
        entry.paymentMethod,
        entry.referenceNo,
        entry.status
      ]),
      ['Total Transactions', totalTransactions, '', '', '', totalAmount.toFixed(2), '', '', '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'branch_transaction_received_list.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const handleFromDateChange = (e) => {
    setFromDate(formatDateForDisplay(e.target.value))
  }

  const handleToDateChange = (e) => {
    setToDate(formatDateForDisplay(e.target.value))
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredData.slice(startIndex, endIndex)

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Branch Transaction Received List</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select 
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {filterOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select 
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                {branchOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={formatDateForInput(fromDate)}
                onChange={handleFromDateChange}
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={formatDateForInput(toDate)}
                onChange={handleToDateChange}
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                className="bg-teal-600 text-white mt-7 px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                🔍 REPORT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Results - Only show when showReport is true */}
      {showReport && (
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Branch Transaction Received List</h3>
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
                placeholder="Search by branch, transaction type, invoice no, customer, or reference..."
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

          {/* Table - Scrollable */}
          <div className="overflow-x-auto max-w-6xl mx-auto border rounded">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">SL</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Branch Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Transaction Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Invoice No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[150px]">Customer Name</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Received Date</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Payment Method</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Reference No</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.branchName}</td>
                        <td className="py-2 px-3 text-xs">
                          <span className={
                            entry.transactionType === 'Payment Received' ? 'text-green-600 font-medium' :
                            entry.transactionType === 'Cash Received' ? 'text-blue-600 font-medium' :
                            'text-purple-600 font-medium'
                          }>
                            {entry.transactionType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs font-mono">{entry.invoiceNo}</td>
                        <td className="py-2 px-3 text-xs">{entry.customerName}</td>
                        <td className="py-2 px-3 text-xs text-right">₹{entry.amount.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-center">{entry.receivedDate}</td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.paymentMethod === 'Cash' ? 'bg-green-100 text-green-800' :
                            entry.paymentMethod === 'Bank Transfer' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {entry.paymentMethod}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs font-mono text-center">{entry.referenceNo}</td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            entry.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="5">
                        Total Transactions: {totalTransactions}
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-center font-bold" colSpan="4">
                        Confirmed: {confirmedTransactions} | Processing: {processingTransactions}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching records found' : 'No data available'}
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
                {filteredData.length === 0 
                  ? '0-0 of 0' 
                  : `${startIndex + 1}-${Math.min(endIndex, filteredData.length)} of ${filteredData.length}`
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

          {/* Summary Information */}
          <div className="mt-4 p-4 bg-gray-50 rounded border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Total Transactions:</span>
                <div className="text-lg font-bold text-blue-600">{totalTransactions}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Amount:</span>
                <div className="text-lg font-bold text-green-600">₹{totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Confirmed:</span>
                <div className="text-lg font-bold text-green-600">{confirmedTransactions}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Processing:</span>
                <div className="text-lg font-bold text-yellow-600">{processingTransactions}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}