    'use client'

import { useState } from 'react'

export default function ContraRecord() {
  const [filterType, setFilterType] = useState('All')
  const [recordType, setRecordType] = useState('without details')
  const [fromDate, setFromDate] = useState('23/08/2025')
  const [toDate, setToDate] = useState('23/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample contra record data with Indian business context
  const [contraRecordData] = useState([
    { 
      id: 1, 
      sl: 1, 
      date: '23/08/2025',
      contraType: 'Cash to Bank Transfer - HDFC Bank', 
      voucherNo: 'CON001',
      fromAccount: 'Cash in Hand',
      toAccount: 'HDFC Bank Current A/c',
      amount: 250000.00, 
      status: 'Completed',
      narration: 'Daily cash deposit to bank'
    },
    { 
      id: 2, 
      sl: 2, 
      date: '22/08/2025',
      contraType: 'Bank to Cash Withdrawal - SBI', 
      voucherNo: 'CON002',
      fromAccount: 'SBI Current A/c',
      toAccount: 'Cash in Hand',
      amount: 75000.00, 
      status: 'Completed',
      narration: 'Cash withdrawal for petty expenses'
    },
    { 
      id: 3, 
      sl: 3, 
      date: '21/08/2025',
      contraType: 'Inter-Bank Transfer - HDFC to ICICI', 
      voucherNo: 'CON003',
      fromAccount: 'HDFC Bank Current A/c',
      toAccount: 'ICICI Bank Savings A/c',
      amount: 150000.00, 
      status: 'Pending',
      narration: 'Fund transfer for investment purpose'
    },
    { 
      id: 4, 
      sl: 4, 
      date: '20/08/2025',
      contraType: 'Cash to Bank - Axis Bank', 
      voucherNo: 'CON004',
      fromAccount: 'Cash in Hand',
      toAccount: 'Axis Bank Current A/c',
      amount: 125000.00, 
      status: 'Completed',
      narration: 'Weekly cash deposit'
    },
    { 
      id: 5, 
      sl: 5, 
      date: '19/08/2025',
      contraType: 'Bank Transfer - ICICI to Punjab National', 
      voucherNo: 'CON005',
      fromAccount: 'ICICI Bank Current A/c',
      toAccount: 'Punjab National Bank A/c',
      amount: 200000.00, 
      status: 'Completed',
      narration: 'Supplier payment preparation'
    },
    { 
      id: 6, 
      sl: 6, 
      date: '18/08/2025',
      contraType: 'Cash Withdrawal - Bank of Baroda', 
      voucherNo: 'CON006',
      fromAccount: 'Bank of Baroda Current A/c',
      toAccount: 'Cash in Hand',
      amount: 50000.00, 
      status: 'Failed',
      narration: 'ATM withdrawal - insufficient funds'
    },
    { 
      id: 7, 
      sl: 7, 
      date: '17/08/2025',
      contraType: 'Inter-Bank Transfer - SBI to HDFC', 
      voucherNo: 'CON007',
      fromAccount: 'SBI Savings A/c',
      toAccount: 'HDFC Bank Current A/c',
      amount: 300000.00, 
      status: 'Completed',
      narration: 'Consolidating funds for major purchase'
    },
    { 
      id: 8, 
      sl: 8, 
      date: '16/08/2025',
      contraType: 'Cash Deposit - Kotak Mahindra Bank', 
      voucherNo: 'CON008',
      fromAccount: 'Cash in Hand',
      toAccount: 'Kotak Mahindra Current A/c',
      amount: 175000.00, 
      status: 'Completed',
      narration: 'Sales collection deposit'
    },
    { 
      id: 9, 
      sl: 9, 
      date: '15/08/2025',
      contraType: 'Bank to Cash - Union Bank of India', 
      voucherNo: 'CON009',
      fromAccount: 'Union Bank Current A/c',
      toAccount: 'Cash in Hand',
      amount: 85000.00, 
      status: 'Processing',
      narration: 'Emergency cash requirement'
    },
    { 
      id: 10, 
      sl: 10, 
      date: '14/08/2025',
      contraType: 'Inter-Bank Transfer - Canara to HDFC', 
      voucherNo: 'CON010',
      fromAccount: 'Canara Bank Savings A/c',
      toAccount: 'HDFC Bank Current A/c',
      amount: 225000.00, 
      status: 'Completed',
      narration: 'Monthly fund consolidation'
    }
  ])

  const [filteredData, setFilteredData] = useState(contraRecordData)

  // Filter options for contra record
  const filterTypeOptions = [
    'All',
    'Completed',
    'Pending',
    'Processing',
    'Failed'
  ]

  const recordTypeOptions = [
    'without details',
    'with details'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0)
  const completedAmount = filteredData.filter(item => item.status === 'Completed').reduce((sum, item) => sum + item.amount, 0)
  const pendingAmount = filteredData.filter(item => item.status === 'Pending' || item.status === 'Processing').reduce((sum, item) => sum + item.amount, 0)

  const handleGetReport = () => {
    console.log('Generating contra record with filters:', {
      filterType,
      recordType,
      fromDate,
      toDate
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Apply filter based on filterType and date range
    let filtered = contraRecordData
    
    // Date filtering logic
    if (fromDate && toDate) {
      const fromDateObj = parseDate(fromDate)
      const toDateObj = parseDate(toDate)
      
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.date)
        return itemDate >= fromDateObj && itemDate <= toDateObj
      })
    }
    
    // Status filtering logic
    if (filterType !== 'All') {
      filtered = filtered.filter(item => 
        item.status.toLowerCase() === filterType.toLowerCase()
      )
    }
    
    setFilteredData(filtered)
    setShowSearch(false)
  }

  // Helper function to parse DD/MM/YYYY date format
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(contraRecordData)
    } else {
      const filtered = contraRecordData.filter(entry =>
        entry.contraType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.fromAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.toAccount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.narration.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(contraRecordData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Contra Record</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            .completed { color: #10b981; font-weight: bold; }
            .pending { color: #f59e0b; font-weight: bold; }
            .processing { color: #3b82f6; font-weight: bold; }
            .failed { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Contra Record</h1>
          <p>Filter: ${filterType} | Record Type: ${recordType}</p>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Contra Type</th>
                <th>Voucher No</th>
                <th>From Account</th>
                <th>To Account</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.date}</td>
                  <td>${entry.contraType}</td>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.fromAccount}</td>
                  <td>${entry.toAccount}</td>
                  <td class="amount">₹${entry.amount.toFixed(2)}</td>
                  <td>${entry.status}</td>
                  <td>${entry.narration}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6"><strong>Grand Total :</strong></td>
                <td class="amount"><strong>₹${totalAmount.toFixed(2)}</strong></td>
                <td colspan="2"></td>
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
      ['SL', 'Date', 'Contra Type', 'Voucher No', 'From Account', 'To Account', 'Amount', 'Status', 'Narration'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.date,
        entry.contraType,
        entry.voucherNo,
        entry.fromAccount,
        entry.toAccount,
        entry.amount.toFixed(2),
        entry.status,
        entry.narration
      ]),
      ['Grand Total', '', '', '', '', '', totalAmount.toFixed(2), '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'contra_record.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr || !dateStr.includes('/')) return ''
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const handleFromDateChange = (e) => {
    const newDate = formatDateForDisplay(e.target.value)
    setFromDate(newDate)
  }

  const handleToDateChange = (e) => {
    const newDate = formatDateForDisplay(e.target.value)
    setToDate(newDate)
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
          <h2 className="font-medium text-lg">Contra Record</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select 
                className="w-32 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {filterTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
              <select 
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
              >
                {recordTypeOptions.map(option => (
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
            <h3 className="text-lg font-medium">Contra Record</h3>
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
                placeholder="Search by contra type, voucher number, accounts, status or narration..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[280px]">Contra Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Voucher No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[180px]">From Account</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[180px]">To Account</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[200px]">Narration</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs">{entry.date}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.contraType}</td>
                        <td className="py-2 px-3 text-xs">{entry.voucherNo}</td>
                        <td className="py-2 px-3 text-xs">{entry.fromAccount}</td>
                        <td className="py-2 px-3 text-xs">{entry.toAccount}</td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-blue-600">
                          ₹{entry.amount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            entry.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                            entry.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            entry.status === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs">{entry.narration}</td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="6">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-blue-600">₹{totalAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right" colSpan="2"></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching records found' : 'No data available for selected date range'}
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
                <div className="text-lg font-bold text-blue-600">{totalEntries}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Amount:</span>
                <div className="text-lg font-bold text-purple-600">₹{totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Completed:</span>
                <div className="text-lg font-bold text-green-600">₹{completedAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Pending:</span>
                <div className="text-lg font-bold text-orange-600">₹{pendingAmount.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Success Rate:</span>
                <div className="text-lg font-bold text-indigo-600">{totalAmount > 0 ? ((completedAmount / totalAmount) * 100).toFixed(1) : '0.0'}%</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Average Transaction:</span>
                <div className="text-lg font-bold text-cyan-600">₹{totalEntries > 0 ? (totalAmount / totalEntries).toFixed(2) : '0.00'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}