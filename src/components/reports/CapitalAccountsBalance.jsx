'use client'

import { useState } from 'react'

export default function CapitalAccountsBalance() {
  const [filterType, setFilterType] = useState('All Capital Account')
  const [fromDate, setFromDate] = useState('21/08/2025')
  const [toDate, setToDate] = useState('21/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample capital accounts balance data with Indian context
  const [capitalAccountsData] = useState([
    { 
      id: 1, 
      sl: 1, 
      accountName: 'Owner Capital', 
      accountCode: 'CAP001',
      openingBalance: 500000.00, 
      debitAmount: 25000.00, 
      creditAmount: 150000.00, 
      balance: 625000.00
    },
    { 
      id: 2, 
      sl: 2, 
      accountName: 'Partner A Capital', 
      accountCode: 'CAP002',
      openingBalance: 300000.00, 
      debitAmount: 10000.00, 
      creditAmount: 75000.00, 
      balance: 365000.00
    },
    { 
      id: 3, 
      sl: 3, 
      accountName: 'Partner B Capital', 
      accountCode: 'CAP003',
      openingBalance: 200000.00, 
      debitAmount: 5000.00, 
      creditAmount: 50000.00, 
      balance: 245000.00
    },
    { 
      id: 4, 
      sl: 4, 
      accountName: 'Retained Earnings', 
      accountCode: 'CAP004',
      openingBalance: 150000.00, 
      debitAmount: 0.00, 
      creditAmount: 80000.00, 
      balance: 230000.00
    },
    { 
      id: 5, 
      sl: 5, 
      accountName: 'Share Capital', 
      accountCode: 'CAP005',
      openingBalance: 1000000.00, 
      debitAmount: 0.00, 
      creditAmount: 200000.00, 
      balance: 1200000.00
    }
  ])

  const [filteredData, setFilteredData] = useState(capitalAccountsData)

  // Filter options for capital accounts
  const filterOptions = [
    'All Capital Account',
    'Owner Capital',
    'Partner Capital', 
    'Share Capital',
    'Retained Earnings',
    'Additional Paid-in Capital',
    'Capital Reserve',
    'General Reserve'
  ]

  // Calculate totals
  const totalAccounts = filteredData.length
  const totalOpeningBalance = filteredData.reduce((sum, item) => sum + item.openingBalance, 0)
  const totalDebitAmount = filteredData.reduce((sum, item) => sum + item.debitAmount, 0)
  const totalCreditAmount = filteredData.reduce((sum, item) => sum + item.creditAmount, 0)
  const totalBalance = filteredData.reduce((sum, item) => sum + item.balance, 0)

  const handleGetReport = () => {
    console.log('Generating capital accounts balance report with filters:', {
      filterType,
      fromDate,
      toDate
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Apply filter based on filterType
    let filtered = capitalAccountsData
    if (filterType !== 'All Capital Account') {
      filtered = capitalAccountsData.filter(item => 
        item.accountName.toLowerCase().includes(filterType.toLowerCase()) ||
        (filterType === 'Partner Capital' && item.accountName.toLowerCase().includes('partner'))
      )
    }
    
    setFilteredData(filtered)
    setShowSearch(false)
    // Here you would typically make an API call to get filtered data based on dates and filters
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(capitalAccountsData)
    } else {
      const filtered = capitalAccountsData.filter(entry =>
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountCode.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(capitalAccountsData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Capital Balance Report</title>
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
          <h1>Capital Balance Report</h1>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Account Name</th>
                <th>Opening Balance</th>
                <th>Debit Amount</th>
                <th>Credit Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.accountName}</td>
                  <td class="amount">₹${entry.openingBalance.toFixed(2)}</td>
                  <td class="amount">₹${entry.debitAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.creditAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.balance.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="2"><strong>Grand Total</strong></td>
                <td class="amount"><strong>₹${totalOpeningBalance.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalDebitAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalCreditAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalBalance.toFixed(2)}</strong></td>
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
      ['SL', 'Account Name', 'Opening Balance', 'Debit Amount', 'Credit Amount', 'Balance'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.accountName,
        entry.openingBalance.toFixed(2),
        entry.debitAmount.toFixed(2),
        entry.creditAmount.toFixed(2),
        entry.balance.toFixed(2)
      ]),
      ['Grand Total', '', totalOpeningBalance.toFixed(2), totalDebitAmount.toFixed(2), totalCreditAmount.toFixed(2), totalBalance.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'capital_accounts_balance_report.csv'
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
          <h2 className="font-medium text-lg">Capital Balance Report</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select 
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {filterOptions.map(option => (
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
            <h3 className="text-lg font-medium">Capital Balance Report</h3>
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
                placeholder="Search by account name or account code..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[150px]">Account Name</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Opening Balance</th>
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
                        <td className="py-2 px-3 text-xs font-medium">{entry.accountName}</td>
                        <td className="py-2 px-3 text-xs text-right">₹{entry.openingBalance.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-right">
                          <span className={entry.debitAmount > 0 ? 'text-red-600' : 'text-gray-600'}>
                            ₹{entry.debitAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-right">
                          <span className={entry.creditAmount > 0 ? 'text-green-600' : 'text-gray-600'}>
                            ₹{entry.creditAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-right">
                          <span className={
                            entry.balance > 0 ? 'text-blue-600 font-medium' :
                            entry.balance < 0 ? 'text-red-600 font-medium' :
                            'text-gray-600'
                          }>
                            ₹{entry.balance.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="2">
                        Grand Total
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalOpeningBalance.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalDebitAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalCreditAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalBalance.toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Accounts:</span>
                <div className="text-lg font-bold text-blue-600">{totalAccounts}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Opening Balance:</span>
                <div className="text-lg font-bold text-purple-600">₹{totalOpeningBalance.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Credits:</span>
                <div className="text-lg font-bold text-green-600">₹{totalCreditAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Current Balance:</span>
                <div className={`text-lg font-bold ${totalBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ₹{totalBalance.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Total Debits:</span>
                <div className="text-lg font-bold text-red-600">₹{totalDebitAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Net Equity:</span>
                <div className="text-lg font-bold text-blue-600">₹{(totalCreditAmount - totalDebitAmount + totalOpeningBalance).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}