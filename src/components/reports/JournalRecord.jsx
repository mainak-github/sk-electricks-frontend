'use client'

import { useState } from 'react'

export default function JournalRecord() {
  const [filterType, setFilterType] = useState('All')
  const [recordType, setRecordType] = useState('without details')
  const [fromDate, setFromDate] = useState('23/08/2025')
  const [toDate, setToDate] = useState('23/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample journal record data with Indian accounting context
  const [journalRecordData] = useState([
    { 
      id: 1, 
      sl: 1, 
      date: '23/08/2025',
      voucherNo: 'JV001',
      voucherType: 'Journal Voucher',
      particulars: 'Bank charges debited by HDFC Bank',
      accountName: 'Bank Charges A/c',
      debitAmount: 1250.00, 
      creditAmount: 0.00,
      narration: 'Monthly bank charges for August 2025'
    },
    { 
      id: 2, 
      sl: 2, 
      date: '23/08/2025',
      voucherNo: 'JV001',
      voucherType: 'Journal Voucher',
      particulars: 'To HDFC Bank A/c',
      accountName: 'HDFC Bank A/c',
      debitAmount: 0.00, 
      creditAmount: 1250.00,
      narration: 'Monthly bank charges for August 2025'
    },
    { 
      id: 3, 
      sl: 3, 
      date: '22/08/2025',
      voucherNo: 'JV002',
      voucherType: 'Journal Voucher',
      particulars: 'Prepaid Insurance adjustment',
      accountName: 'Insurance Expense A/c',
      debitAmount: 5000.00, 
      creditAmount: 0.00,
      narration: 'Monthly insurance expense recognition'
    },
    { 
      id: 4, 
      sl: 4, 
      date: '22/08/2025',
      voucherNo: 'JV002',
      voucherType: 'Journal Voucher',
      particulars: 'To Prepaid Insurance A/c',
      accountName: 'Prepaid Insurance A/c',
      debitAmount: 0.00, 
      creditAmount: 5000.00,
      narration: 'Monthly insurance expense recognition'
    },
    { 
      id: 5, 
      sl: 5, 
      date: '21/08/2025',
      voucherNo: 'JV003',
      voucherType: 'Adjustment Entry',
      particulars: 'Depreciation on Plant & Machinery',
      accountName: 'Depreciation Expense A/c',
      debitAmount: 15000.00, 
      creditAmount: 0.00,
      narration: 'Monthly depreciation for August 2025'
    },
    { 
      id: 6, 
      sl: 6, 
      date: '21/08/2025',
      voucherNo: 'JV003',
      voucherType: 'Adjustment Entry',
      particulars: 'To Accumulated Depreciation A/c',
      accountName: 'Accumulated Depreciation A/c',
      debitAmount: 0.00, 
      creditAmount: 15000.00,
      narration: 'Monthly depreciation for August 2025'
    },
    { 
      id: 7, 
      sl: 7, 
      date: '20/08/2025',
      voucherNo: 'JV004',
      voucherType: 'Journal Voucher',
      particulars: 'Bad Debt written off',
      accountName: 'Bad Debt Expense A/c',
      debitAmount: 8500.00, 
      creditAmount: 0.00,
      narration: 'Writing off uncollectible receivable - Customer XYZ'
    },
    { 
      id: 8, 
      sl: 8, 
      date: '20/08/2025',
      voucherNo: 'JV004',
      voucherType: 'Journal Voucher',
      particulars: 'To Accounts Receivable A/c',
      accountName: 'Accounts Receivable A/c',
      debitAmount: 0.00, 
      creditAmount: 8500.00,
      narration: 'Writing off uncollectible receivable - Customer XYZ'
    },
    { 
      id: 9, 
      sl: 9, 
      date: '19/08/2025',
      voucherNo: 'JV005',
      voucherType: 'Accrual Entry',
      particulars: 'Accrued Interest on Fixed Deposit',
      accountName: 'Interest Receivable A/c',
      debitAmount: 3500.00, 
      creditAmount: 0.00,
      narration: 'Interest accrued on FD with SBI for August 2025'
    },
    { 
      id: 10, 
      sl: 10, 
      date: '19/08/2025',
      voucherNo: 'JV005',
      voucherType: 'Accrual Entry',
      particulars: 'To Interest Income A/c',
      accountName: 'Interest Income A/c',
      debitAmount: 0.00, 
      creditAmount: 3500.00,
      narration: 'Interest accrued on FD with SBI for August 2025'
    },
    { 
      id: 11, 
      sl: 11, 
      date: '18/08/2025',
      voucherNo: 'JV006',
      voucherType: 'Journal Voucher',
      particulars: 'Office Rent Adjustment',
      accountName: 'Rent Expense A/c',
      debitAmount: 25000.00, 
      creditAmount: 0.00,
      narration: 'Rent adjustment for Mumbai office - August 2025'
    },
    { 
      id: 12, 
      sl: 12, 
      date: '18/08/2025',
      voucherNo: 'JV006',
      voucherType: 'Journal Voucher',
      particulars: 'To Rent Payable A/c',
      accountName: 'Rent Payable A/c',
      debitAmount: 0.00, 
      creditAmount: 25000.00,
      narration: 'Rent adjustment for Mumbai office - August 2025'
    }
  ])

  const [filteredData, setFilteredData] = useState(journalRecordData)

  // Filter options for journal record
  const filterTypeOptions = [
    'All',
    'Journal Voucher',
    'Adjustment Entry',
    'Accrual Entry',
    'Closing Entry',
    'Opening Entry'
  ]

  const recordTypeOptions = [
    'without details',
    'with details'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalDebitAmount = filteredData.reduce((sum, item) => sum + item.debitAmount, 0)
  const totalCreditAmount = filteredData.reduce((sum, item) => sum + item.creditAmount, 0)

  const handleGetReport = () => {
    console.log('Generating journal record with filters:', {
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
    let filtered = journalRecordData
    
    // Date filtering logic
    if (fromDate && toDate) {
      const fromDateObj = parseDate(fromDate)
      const toDateObj = parseDate(toDate)
      
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.date)
        return itemDate >= fromDateObj && itemDate <= toDateObj
      })
    }
    
    // Voucher type filtering logic
    if (filterType !== 'All') {
      filtered = filtered.filter(item => 
        item.voucherType.toLowerCase() === filterType.toLowerCase()
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
      setFilteredData(journalRecordData)
    } else {
      const filtered = journalRecordData.filter(entry =>
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.narration.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(journalRecordData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Journal Record</title>
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
          <h1>Journal Record</h1>
          <p>Filter: ${filterType} | Record Type: ${recordType}</p>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Voucher No</th>
                <th>Voucher Type</th>
                <th>Particulars</th>
                <th>Account Name</th>
                <th>Debit Amount</th>
                <th>Credit Amount</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.date}</td>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.voucherType}</td>
                  <td>${entry.particulars}</td>
                  <td>${entry.accountName}</td>
                  <td class="amount">₹${entry.debitAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.creditAmount.toFixed(2)}</td>
                  <td>${entry.narration}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6"><strong>Grand Total :</strong></td>
                <td class="amount"><strong>₹${totalDebitAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalCreditAmount.toFixed(2)}</strong></td>
                <td></td>
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
      ['SL', 'Date', 'Voucher No', 'Voucher Type', 'Particulars', 'Account Name', 'Debit Amount', 'Credit Amount', 'Narration'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.date,
        entry.voucherNo,
        entry.voucherType,
        entry.particulars,
        entry.accountName,
        entry.debitAmount.toFixed(2),
        entry.creditAmount.toFixed(2),
        entry.narration
      ]),
      ['Grand Total', '', '', '', '', '', totalDebitAmount.toFixed(2), totalCreditAmount.toFixed(2), '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'journal_record.csv'
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
          <h2 className="font-medium text-lg">Journal Record</h2>
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
            <h3 className="text-lg font-medium">Journal Record</h3>
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
                placeholder="Search by voucher number, type, particulars, account name or narration..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Voucher No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Voucher Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[200px]">Particulars</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[180px]">Account Name</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Debit Amount</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Credit Amount</th>
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
                        <td className="py-2 px-3 text-xs font-medium text-blue-600">{entry.voucherNo}</td>
                        <td className="py-2 px-3 text-xs">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.voucherType === 'Journal Voucher' ? 'bg-blue-100 text-blue-800' :
                            entry.voucherType === 'Adjustment Entry' ? 'bg-green-100 text-green-800' :
                            entry.voucherType === 'Accrual Entry' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.voucherType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.particulars}</td>
                        <td className="py-2 px-3 text-xs font-medium text-indigo-600">{entry.accountName}</td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-green-600">
                          {entry.debitAmount > 0 ? `₹${entry.debitAmount.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-red-600">
                          {entry.creditAmount > 0 ? `₹${entry.creditAmount.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-xs text-gray-600">{entry.narration}</td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="6">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-green-600">₹{totalDebitAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-red-600">₹{totalCreditAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right"></td>
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
                <span className="font-medium text-gray-600">Total Entries:</span>
                <div className="text-lg font-bold text-blue-600">{totalEntries}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Debits:</span>
                <div className="text-lg font-bold text-green-600">₹{totalDebitAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Credits:</span>
                <div className="text-lg font-bold text-red-600">₹{totalCreditAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Balance:</span>
                <div className={`text-lg font-bold ${
                  (totalDebitAmount - totalCreditAmount) === 0 ? 'text-green-600' : 
                  (totalDebitAmount - totalCreditAmount) > 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  ₹{Math.abs(totalDebitAmount - totalCreditAmount).toFixed(2)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Journal Vouchers:</span>
                <div className="text-lg font-bold text-indigo-600">
                  {filteredData.filter(entry => entry.voucherType === 'Journal Voucher').length}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Adjustment Entries:</span>
                <div className="text-lg font-bold text-purple-600">
                  {filteredData.filter(entry => entry.voucherType === 'Adjustment Entry').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}