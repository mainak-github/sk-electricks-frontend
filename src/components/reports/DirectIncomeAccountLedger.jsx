'use client'

import { useState } from 'react'

export default function DirectIncomeAccountLedger() {
  const [selectedAccount, setSelectedAccount] = useState('Search Account')
  const [fromDate, setFromDate] = useState('25/08/2025')
  const [toDate, setToDate] = useState('25/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample account options based on the screenshot
  const accountOptions = [
    'Search Account',
    'Sales Revenue',
    'Service Income',
    'Rental Income',
    'Interest Income',
    'Commission Income',
    'Dividend Income',
    'Export Revenue',
    'License Fees',
    'Consulting Revenue',
    'Training Income',
    'Other Operating Income'
  ]

  // Sample ledger data for Direct Income Account
  const [ledgerData] = useState([
    { 
      id: 1, 
      sl: 1, 
      date: '25/08/2025',
      particulars: 'Product Sales - Mumbai Division', 
      voucherType: 'Sales',
      voucherNo: 'SAL001',
      debitAmount: 0.00,
      creditAmount: 185000.00, 
      balance: 185000.00,
      balanceType: 'Cr'
    },
    { 
      id: 2, 
      sl: 2, 
      date: '24/08/2025',
      particulars: 'Service Revenue - IT Consultancy', 
      voucherType: 'Receipt',
      voucherNo: 'RCP002',
      debitAmount: 0.00,
      creditAmount: 125000.00, 
      balance: 310000.00,
      balanceType: 'Cr'
    },
    { 
      id: 3, 
      sl: 3, 
      date: '23/08/2025',
      particulars: 'Rental Income - Commercial Property', 
      voucherType: 'Journal',
      voucherNo: 'JV003',
      debitAmount: 0.00,
      creditAmount: 75000.00, 
      balance: 385000.00,
      balanceType: 'Cr'
    },
    { 
      id: 4, 
      sl: 4, 
      date: '22/08/2025',
      particulars: 'Commission Income - Sales Agent', 
      voucherType: 'Receipt',
      voucherNo: 'RCP004',
      debitAmount: 0.00,
      creditAmount: 35000.00, 
      balance: 420000.00,
      balanceType: 'Cr'
    },
    { 
      id: 5, 
      sl: 5, 
      date: '21/08/2025',
      particulars: 'Interest Income - Fixed Deposits', 
      voucherType: 'Journal',
      voucherNo: 'JV005',
      debitAmount: 0.00,
      creditAmount: 15000.00, 
      balance: 435000.00,
      balanceType: 'Cr'
    },
    { 
      id: 6, 
      sl: 6, 
      date: '20/08/2025',
      particulars: 'Export Sales - International Market', 
      voucherType: 'Sales',
      voucherNo: 'SAL006',
      debitAmount: 0.00,
      creditAmount: 275000.00, 
      balance: 710000.00,
      balanceType: 'Cr'
    },
    { 
      id: 7, 
      sl: 7, 
      date: '19/08/2025',
      particulars: 'Dividend Income - Investments', 
      voucherType: 'Receipt',
      voucherNo: 'RCP007',
      debitAmount: 0.00,
      creditAmount: 45000.00, 
      balance: 755000.00,
      balanceType: 'Cr'
    },
    { 
      id: 8, 
      sl: 8, 
      date: '18/08/2025',
      particulars: 'License Revenue - Software Product', 
      voucherType: 'Sales',
      voucherNo: 'SAL008',
      debitAmount: 0.00,
      creditAmount: 95000.00, 
      balance: 850000.00,
      balanceType: 'Cr'
    },
    { 
      id: 9, 
      sl: 9, 
      date: '17/08/2025',
      particulars: 'Consulting Fees - Business Advisory', 
      voucherType: 'Receipt',
      voucherNo: 'RCP009',
      debitAmount: 0.00,
      creditAmount: 85000.00, 
      balance: 935000.00,
      balanceType: 'Cr'
    },
    { 
      id: 10, 
      sl: 10, 
      date: '16/08/2025',
      particulars: 'Training Income - Corporate Programs', 
      voucherType: 'Sales',
      voucherNo: 'SAL010',
      debitAmount: 0.00,
      creditAmount: 65000.00, 
      balance: 1000000.00,
      balanceType: 'Cr'
    }
  ])

  const [filteredData, setFilteredData] = useState(ledgerData)

  // Calculate totals
  const totalEntries = filteredData.length
  const totalDebitAmount = filteredData.reduce((sum, item) => sum + item.debitAmount, 0)
  const totalCreditAmount = filteredData.reduce((sum, item) => sum + item.creditAmount, 0)
  const closingBalance = filteredData.length > 0 ? filteredData[filteredData.length - 1].balance : 0

  const handleGetReport = () => {
    console.log('Generating ledger report with filters:', {
      selectedAccount,
      fromDate,
      toDate
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Apply filter based on date range
    let filtered = ledgerData
    
    // Date filtering logic
    if (fromDate && toDate) {
      const fromDateObj = parseDate(fromDate)
      const toDateObj = parseDate(toDate)
      
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.date)
        return itemDate >= fromDateObj && itemDate <= toDateObj
      })
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
      setFilteredData(ledgerData)
    } else {
      const filtered = ledgerData.filter(entry =>
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(ledgerData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Direct Income Account Ledger</title>
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
          <h1>Direct Income Account Ledger</h1>
          <p>Account: ${selectedAccount}</p>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Particulars</th>
                <th>Voucher Type</th>
                <th>Voucher No</th>
                <th>Debit Amount</th>
                <th>Credit Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.date}</td>
                  <td>${entry.particulars}</td>
                  <td>${entry.voucherType}</td>
                  <td>${entry.voucherNo}</td>
                  <td class="amount">₹${entry.debitAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.creditAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.balance.toFixed(2)} ${entry.balanceType}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>Grand Total :</strong></td>
                <td class="amount"><strong>₹${totalDebitAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalCreditAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${closingBalance.toFixed(2)} Cr</strong></td>
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
      ['SL', 'Date', 'Particulars', 'Voucher Type', 'Voucher No', 'Debit Amount', 'Credit Amount', 'Balance'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.date,
        entry.particulars,
        entry.voucherType,
        entry.voucherNo,
        entry.debitAmount.toFixed(2),
        entry.creditAmount.toFixed(2),
        `${entry.balance.toFixed(2)} ${entry.balanceType}`
      ]),
      ['Grand Total', '', '', '', '', totalDebitAmount.toFixed(2), totalCreditAmount.toFixed(2), `${closingBalance.toFixed(2)} Cr`]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'direct_income_account_ledger.csv'
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
          <h2 className="font-medium text-lg">Direct Income Balance Ledger</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Account</label>
              <select 
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {accountOptions.map(option => (
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
                🔍 GET REPORT
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
            <h3 className="text-lg font-medium">Direct Income Account Ledger</h3>
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
                placeholder="Search by particulars, voucher number, or voucher type..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[280px]">Particulars</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Voucher Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Voucher No</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Debit Amount</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Credit Amount</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs">{entry.date}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.particulars}</td>
                        <td className="py-2 px-3 text-xs">{entry.voucherType}</td>
                        <td className="py-2 px-3 text-xs">{entry.voucherNo}</td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-red-600">
                          ₹{entry.debitAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-green-600">
                          ₹{entry.creditAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-blue-600">
                          ₹{entry.balance.toFixed(2)} {entry.balanceType}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="5">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-red-600">₹{totalDebitAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-green-600">₹{totalCreditAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-blue-600">₹{closingBalance.toFixed(2)} Cr</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Debit:</span>
                <div className="text-lg font-bold text-red-600">₹{totalDebitAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Credit:</span>
                <div className="text-lg font-bold text-green-600">₹{totalCreditAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Closing Balance:</span>
                <div className="text-lg font-bold text-purple-600">₹{closingBalance.toFixed(2)} Cr</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Net Movement:</span>
                <div className="text-lg font-bold text-indigo-600">₹{(totalCreditAmount - totalDebitAmount).toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Average Transaction:</span>
                <div className="text-lg font-bold text-cyan-600">₹{totalEntries > 0 ? (totalCreditAmount / totalEntries).toFixed(2) : '0.00'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}