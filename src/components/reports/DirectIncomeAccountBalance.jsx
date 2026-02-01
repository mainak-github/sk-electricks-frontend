'use client'

import { useState } from 'react'

export default function DirectIncomeAccountBalance() {
  const [selectedAccount, setSelectedAccount] = useState('All Income Account')
  const [fromDate, setFromDate] = useState('24/08/2025')
  const [toDate, setToDate] = useState('24/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample direct income account balance data
  const [balanceData] = useState([
    { 
      id: 1, 
      sl: 1, 
      accountName: 'Discount on Purchase',
      openingBalance: 0.00,
      debitAmount: 0.00,
      creditAmount: 50.00,
      balance: 50.00,
      category: 'Purchase Discount'
    },
    { 
      id: 2, 
      sl: 2, 
      accountName: 'Transport Cost on Sales',
      openingBalance: 0.00,
      debitAmount: 0.00,
      creditAmount: 1512323232324792.00,
      balance: 1512323232324792.00,
      category: 'Transportation Income'
    },
    { 
      id: 3, 
      sl: 3, 
      accountName: 'Sales Return',
      openingBalance: 0.00,
      debitAmount: 2500.00,
      creditAmount: 0.00,
      balance: -2500.00,
      category: 'Sales Adjustment'
    },
    { 
      id: 4, 
      sl: 4, 
      accountName: 'Service Revenue',
      openingBalance: 0.00,
      debitAmount: 0.00,
      creditAmount: 45000.00,
      balance: 45000.00,
      category: 'Service Income'
    },
    { 
      id: 5, 
      sl: 5, 
      accountName: 'Commission Received',
      openingBalance: 0.00,
      debitAmount: 0.00,
      creditAmount: 15000.00,
      balance: 15000.00,
      category: 'Other Income'
    },
    { 
      id: 6, 
      sl: 6, 
      accountName: 'Interest Income',
      openingBalance: 500.00,
      debitAmount: 0.00,
      creditAmount: 8500.00,
      balance: 9000.00,
      category: 'Financial Income'
    },
    { 
      id: 7, 
      sl: 7, 
      accountName: 'Rental Income',
      openingBalance: 0.00,
      debitAmount: 0.00,
      creditAmount: 12000.00,
      balance: 12000.00,
      category: 'Property Income'
    },
    { 
      id: 8, 
      sl: 8, 
      accountName: 'Dividend Received',
      openingBalance: 1000.00,
      debitAmount: 0.00,
      creditAmount: 3500.00,
      balance: 4500.00,
      category: 'Investment Income'
    }
  ])

  const [filteredData, setFilteredData] = useState([])

  // Account options for dropdown (based on the screenshot)
  const accountOptions = [
    'All Income Account',
    'Discount on Purchase',
    'Transport Cost on Sales', 
    'Sales Return',
    'Service Revenue',
    'Commission Received',
    'Interest Income',
    'Rental Income',
    'Dividend Received',
    'Other Income',
    'Freight Outward',
    'Cash Discount',
    'Trade Discount'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalOpeningBalance = filteredData.reduce((sum, item) => sum + item.openingBalance, 0)
  const totalDebitAmount = filteredData.reduce((sum, item) => sum + item.debitAmount, 0)
  const totalCreditAmount = filteredData.reduce((sum, item) => sum + item.creditAmount, 0)
  const totalBalance = filteredData.reduce((sum, item) => sum + item.balance, 0)

  const handleGetReport = () => {
    console.log('Generating direct income account balance with account:', selectedAccount)
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Filter data based on selected account
    let filtered = balanceData
    
    if (selectedAccount !== 'All Income Account') {
      filtered = filtered.filter(item => 
        item.accountName.toLowerCase() === selectedAccount.toLowerCase()
      )
    }
    
    setFilteredData(filtered)
    setShowSearch(false)
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      // Re-apply account filter
      let filtered = balanceData
      if (selectedAccount !== 'All Income Account') {
        filtered = filtered.filter(item => 
          item.accountName.toLowerCase() === selectedAccount.toLowerCase()
        )
      }
      setFilteredData(filtered)
    } else {
      let baseData = balanceData
      if (selectedAccount !== 'All Income Account') {
        baseData = baseData.filter(item => 
          item.accountName.toLowerCase() === selectedAccount.toLowerCase()
        )
      }
      
      const filtered = baseData.filter(entry =>
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    // Re-apply account filter
    let filtered = balanceData
    if (selectedAccount !== 'All Income Account') {
      filtered = filtered.filter(item => 
        item.accountName.toLowerCase() === selectedAccount.toLowerCase()
      )
    }
    setFilteredData(filtered)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Direct Income Account Balance Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Direct Income Account Balance Report</h1>
          <p>Filter Type: ${selectedAccount}</p>
          <p>Period: ${fromDate} to ${toDate}</p>
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
                <td colspan="2"><strong>Grand Total :</strong></td>
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
    a.download = 'direct_income_account_balance.csv'
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

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Direct Income Balance Report</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
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
            <h3 className="text-lg font-medium">
              Direct Income Balance Report
              {selectedAccount !== 'All Income Account' && (
                <span className="text-sm font-normal text-gray-600 ml-2">- {selectedAccount}</span>
              )}
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
                placeholder="Search by account name or category..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[200px]">Account Name</th>
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
                        <td className="py-2 px-3 text-xs font-medium text-blue-600">{entry.accountName}</td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-gray-600">
                          ₹{entry.openingBalance.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-red-600">
                          ₹{entry.debitAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-green-600">
                          ₹{entry.creditAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-bold text-purple-600">
                          ₹{entry.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="2">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-gray-600">₹{totalOpeningBalance.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-red-600">₹{totalDebitAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-green-600">₹{totalCreditAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-purple-600">₹{totalBalance.toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching records found' : selectedAccount === 'All Income Account' ? 'Click "GET REPORT" to view income balance data' : 'No data available for selected account'}
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
                <div className="text-lg font-bold text-blue-600">{totalEntries}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Opening Balance:</span>
                <div className="text-lg font-bold text-gray-600">₹{totalOpeningBalance.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Credit Amount:</span>
                <div className="text-lg font-bold text-green-600">₹{totalCreditAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Net Balance:</span>
                <div className="text-lg font-bold text-purple-600">₹{totalBalance.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Total Debit Amount:</span>
                <div className="text-lg font-bold text-red-600">₹{totalDebitAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Filter Type:</span>
                <div className="text-lg font-bold text-cyan-600">{selectedAccount}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Report Type:</span>
                <div className="text-lg font-bold text-orange-600">Income Balance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}