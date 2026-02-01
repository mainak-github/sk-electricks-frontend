'use client'

import { useState, useMemo } from 'react'

export default function CashBankBalance() {
  const [filterType, setFilterType] = useState('Cash & Bank')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample cash & bank balance data
  const [balanceData] = useState([
    {
      id: 1,
      sl: 1,
      accountName: 'Cash',
      accountType: 'CASH IN HAND',
      openingBalance: 0.00,
      debitAmount: 1512323237750239.50,
      creditAmount: 5441919.00,
      balance: 1512323232308320.50
    },
    {
      id: 2,
      sl: 2,
      accountName: 'Petty Cash',
      accountType: 'CASH IN HAND',
      openingBalance: 60000.00,
      debitAmount: 72090.00,
      creditAmount: 14611.00,
      balance: 117479.00
    },
    {
      id: 3,
      sl: 3,
      accountName: 'Test',
      accountType: 'CASH IN HAND',
      openingBalance: 120.00,
      debitAmount: 0.00,
      creditAmount: 441361.00,
      balance: -441241.00
    },
    {
      id: 4,
      sl: 4,
      accountName: 'Sight LC',
      accountType: 'BANK ACCOUNT',
      openingBalance: 0.00,
      debitAmount: 100.00,
      creditAmount: 6224704.00,
      balance: -6224604.00
    }
  ])

  // Filter options
  const filterOptions = [
    'Cash & Bank',
    'Cash Only',
    'Bank Only',
    'All Accounts'
  ]

  // Use useMemo to filter data based on filter type and search term
  const filteredData = useMemo(() => {
    let filtered = balanceData;
    
    // Filter by account type
    if (filterType === 'Cash Only') {
      filtered = filtered.filter(entry => entry.accountType === 'CASH IN HAND');
    } else if (filterType === 'Bank Only') {
      filtered = filtered.filter(entry => entry.accountType === 'BANK ACCOUNT');
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(entry =>
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [balanceData, filterType, searchTerm]);

  const handleGetReport = () => {
    console.log('Generating cash & bank balance report with filter:', filterType)
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    setShowSearch(false)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
  }

  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce((acc, entry) => {
      acc.totalOpening += entry.openingBalance
      acc.totalDebit += entry.debitAmount
      acc.totalCredit += entry.creditAmount
      acc.totalBalance += entry.balance
      return acc
    }, {
      totalOpening: 0,
      totalDebit: 0,
      totalCredit: 0,
      totalBalance: 0
    })
  }, [filteredData])

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Cash & Bank Balance Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0d9488; }
            .amount { text-align: right; }
            .header-info { margin: 20px 0; }
            .totals { background-color: #f9f9f9; font-weight: bold; }
            .negative { color: red; }
            .positive { color: green; }
          </style>
        </head>
        <body>
          <h1>Cash & Bank Balance Report</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Filter Type: ${filterType}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Account Name</th>
                <th>Acc. Type</th>
                <th>Opening Balance</th>
                <th>Debit Amount - (IN)</th>
                <th>Credit Amount - (Out)</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.accountName}</td>
                  <td>${entry.accountType}</td>
                  <td class="amount">${entry.openingBalance.toFixed(2)}</td>
                  <td class="amount">${entry.debitAmount.toFixed(2)}</td>
                  <td class="amount">${entry.creditAmount.toFixed(2)}</td>
                  <td class="amount ${entry.balance < 0 ? 'negative' : 'positive'}">${entry.balance.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="totals">
                <td colspan="3">Grand Total</td>
                <td class="amount">${totals.totalOpening.toFixed(2)}</td>
                <td class="amount">${totals.totalDebit.toFixed(2)}</td>
                <td class="amount">${totals.totalCredit.toFixed(2)}</td>
                <td class="amount ${totals.totalBalance < 0 ? 'negative' : 'positive'}">${totals.totalBalance.toFixed(2)}</td>
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
      ['SL', 'Account Name', 'Acc. Type', 'Opening Balance', 'Debit Amount - (IN)', 'Credit Amount - (Out)', 'Balance'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.accountName,
        entry.accountType,
        entry.openingBalance.toFixed(2),
        entry.debitAmount.toFixed(2),
        entry.creditAmount.toFixed(2),
        entry.balance.toFixed(2)
      ]),
      ['Grand Total', '', '', totals.totalOpening.toFixed(2), totals.totalDebit.toFixed(2), totals.totalCredit.toFixed(2), totals.totalBalance.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cash_bank_balance.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredData.slice(startIndex, endIndex)

  // Format large numbers
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Cash & Bank Balance Report</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6">
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
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                className="bg-teal-600 text-white px-6 py-2 mt-7 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
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
            <h3 className="text-lg font-medium">Cash & Bank Balance Report</h3>
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700">Total Opening</h4>
              <p className="text-base font-bold text-blue-900">{formatAmount(totals.totalOpening)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-700">Total Debit (IN)</h4>
              <p className="text-base font-bold text-green-900">{formatAmount(totals.totalDebit)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-700">Total Credit (OUT)</h4>
              <p className="text-base font-bold text-yellow-900">{formatAmount(totals.totalCredit)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-700">Net Balance</h4>
              <p className={`text-base font-bold ${totals.totalBalance >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatAmount(totals.totalBalance)}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by account name or account type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button 
                onClick={() => {}}
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
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">SL</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Account Name</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Acc. Type</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Opening Balance</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Debit Amount - (IN)</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Credit Amount - (Out)</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 text-xs">{entry.sl}</td>
                      <td className="py-2 px-2 text-xs font-medium">{entry.accountName}</td>
                      <td className="py-2 px-2 text-xs">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.accountType === 'CASH IN HAND' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.accountType}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs text-right">{formatAmount(entry.openingBalance)}</td>
                      <td className="py-2 px-2 text-xs text-right font-medium text-green-600">{formatAmount(entry.debitAmount)}</td>
                      <td className="py-2 px-2 text-xs text-right font-medium text-blue-600">{formatAmount(entry.creditAmount)}</td>
                      <td className="py-2 px-2 text-xs text-right font-medium">
                        <span className={entry.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatAmount(entry.balance)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      {searchTerm || filterType !== 'Cash & Bank' ? 'No matching records found' : 'No data available'}
                    </td>
                  </tr>
                )}
                
                {/* Grand Total Row */}
                {currentEntries.length > 0 && (
                  <tr className="border-t-2 bg-gray-100 font-semibold">
                    <td className="py-3 px-2 text-xs" colSpan="3">Grand Total</td>
                    <td className="py-3 px-2 text-xs text-right font-bold">{formatAmount(totals.totalOpening)}</td>
                    <td className="py-3 px-2 text-xs text-right font-bold text-green-600">{formatAmount(totals.totalDebit)}</td>
                    <td className="py-3 px-2 text-xs text-right font-bold text-blue-600">{formatAmount(totals.totalCredit)}</td>
                    <td className="py-3 px-2 text-xs text-right font-bold">
                      <span className={totals.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatAmount(totals.totalBalance)}
                      </span>
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
        </div>
      </div>
      )}
    </div>
  )
}