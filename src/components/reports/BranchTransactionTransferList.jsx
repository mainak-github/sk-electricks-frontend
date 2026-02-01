'use client'

import { useState } from 'react'

export default function BranchTransactionTransferList() {
  const [filterType, setFilterType] = useState('All')
  const [branchFilter, setBranchFilter] = useState('By Branch')
  const [fromDate, setFromDate] = useState('21/08/2025')
  const [toDate, setToDate] = useState('21/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample branch transaction transfer data
  const [transactionData] = useState([
    { 
      id: 1, 
      sl: 1, 
      fromBranch: 'Dhaka Branch', 
      toBranch: 'Chittagong Branch',
      transferType: 'Cash Transfer', 
      transferNo: 'TRF-2024-001', 
      amount: 50000.00, 
      transferDate: '20/08/2025',
      purpose: 'Branch Operations', 
      transferMethod: 'Bank Transfer',
      referenceNo: 'TXN-TRF-1001',
      status: 'Completed',
      approvedBy: 'Manager A'
    },
    { 
      id: 2, 
      sl: 2, 
      fromBranch: 'Sylhet Branch', 
      toBranch: 'Rajshahi Branch',
      transferType: 'Product Transfer', 
      transferNo: 'TRF-2024-002', 
      amount: 75000.00, 
      transferDate: '21/08/2025',
      purpose: 'Inventory Rebalancing', 
      transferMethod: 'Internal Transfer',
      referenceNo: 'TXN-TRF-1002',
      status: 'In Transit',
      approvedBy: 'Manager B'
    },
    { 
      id: 3, 
      sl: 3, 
      fromBranch: 'Khulna Branch', 
      toBranch: 'Barisal Branch',
      transferType: 'Emergency Fund', 
      transferNo: 'TRF-2024-003', 
      amount: 25000.00, 
      transferDate: '19/08/2025',
      purpose: 'Urgent Payment', 
      transferMethod: 'Mobile Banking',
      referenceNo: 'TXN-TRF-1003',
      status: 'Pending',
      approvedBy: 'Manager C'
    }
  ])

  const [filteredData, setFilteredData] = useState(transactionData)

  // Filter options
  const filterOptions = [
    'All',
    'Cash Transfer',
    'Product Transfer',
    'Emergency Fund',
    'Regular Transfer'
  ]

  const branchOptions = [
    'By Branch',
    'Dhaka Branch',
    'Chittagong Branch',
    'Sylhet Branch',
    'Rajshahi Branch',
    'Khulna Branch',
    'Barisal Branch'
  ]

  // Calculate totals
  const totalTransfers = filteredData.length
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0)
  const completedTransfers = filteredData.filter(item => item.status === 'Completed').length
  const pendingTransfers = filteredData.filter(item => item.status === 'Pending').length
  const inTransitTransfers = filteredData.filter(item => item.status === 'In Transit').length

  const handleGetReport = () => {
    console.log('Generating branch transaction transfer list with filters:', {
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
        entry.fromBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.toBranch.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.transferType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.transferNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <title>Branch Transaction Transfer List</title>
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
          <h1>Branch Transaction Transfer List</h1>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>From Branch</th>
                <th>To Branch</th>
                <th>Transfer Type</th>
                <th>Transfer No</th>
                <th>Amount</th>
                <th>Transfer Date</th>
                <th>Purpose</th>
                <th>Transfer Method</th>
                <th>Reference No</th>
                <th>Status</th>
                <th>Approved By</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.fromBranch}</td>
                  <td>${entry.toBranch}</td>
                  <td>${entry.transferType}</td>
                  <td>${entry.transferNo}</td>
                  <td class="amount">${entry.amount.toFixed(2)}</td>
                  <td>${entry.transferDate}</td>
                  <td>${entry.purpose}</td>
                  <td>${entry.transferMethod}</td>
                  <td>${entry.referenceNo}</td>
                  <td>${entry.status}</td>
                  <td>${entry.approvedBy}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>Total Amount</strong></td>
                <td class="amount"><strong>${totalAmount.toFixed(2)}</strong></td>
                <td colspan="6"><strong>Total: ${totalTransfers} transfers</strong></td>
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
      ['SL', 'From Branch', 'To Branch', 'Transfer Type', 'Transfer No', 'Amount', 'Transfer Date', 'Purpose', 'Transfer Method', 'Reference No', 'Status', 'Approved By'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.fromBranch,
        entry.toBranch,
        entry.transferType,
        entry.transferNo,
        entry.amount.toFixed(2),
        entry.transferDate,
        entry.purpose,
        entry.transferMethod,
        entry.referenceNo,
        entry.status,
        entry.approvedBy
      ]),
      ['Total Transfers', totalTransfers, '', '', '', totalAmount.toFixed(2), '', '', '', '', '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'branch_transaction_transfer_list.csv'
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
          <h2 className="font-medium text-lg">Branch Transaction Transfer List</h2>
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
            <h3 className="text-lg font-medium">Branch Transaction Transfer List</h3>
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
                placeholder="Search by branch, transfer type, transfer no, purpose, or reference..."
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
          <div className="overflow-x-auto max-w-4xl mx-auto border rounded">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">SL</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[120px]">From Branch</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[120px]">To Branch</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Transfer Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Transfer No</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Transfer Date</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[130px]">Purpose</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Transfer Method</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Reference No</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.fromBranch}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.toBranch}</td>
                        <td className="py-2 px-3 text-xs">
                          <span className={
                            entry.transferType === 'Cash Transfer' ? 'text-green-600 font-medium' :
                            entry.transferType === 'Product Transfer' ? 'text-blue-600 font-medium' :
                            entry.transferType === 'Emergency Fund' ? 'text-red-600 font-medium' :
                            'text-purple-600 font-medium'
                          }>
                            {entry.transferType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs font-mono">{entry.transferNo}</td>
                        <td className="py-2 px-3 text-xs text-right">₹{entry.amount.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-center">{entry.transferDate}</td>
                        <td className="py-2 px-3 text-xs">{entry.purpose}</td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.transferMethod === 'Bank Transfer' ? 'bg-blue-100 text-blue-800' :
                            entry.transferMethod === 'Mobile Banking' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.transferMethod}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs font-mono text-center">{entry.referenceNo}</td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            entry.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                            entry.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-center">{entry.approvedBy}</td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="5">
                        Total Transfers: {totalTransfers}
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-center font-bold" colSpan="6">
                        Completed: {completedTransfers} | In Transit: {inTransitTransfers} | Pending: {pendingTransfers}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Transfers:</span>
                <div className="text-lg font-bold text-blue-600">{totalTransfers}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Amount:</span>
                <div className="text-lg font-bold text-green-600">₹{totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Completed:</span>
                <div className="text-lg font-bold text-green-600">{completedTransfers}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Pending/In Transit:</span>
                <div className="text-lg font-bold text-yellow-600">{pendingTransfers + inTransitTransfers}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}