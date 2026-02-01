'use client'

import { useState } from 'react'

export default function DirectExpenseBalanceReport() {
  const [filterType, setFilterType] = useState('All Expense Account')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample direct expense balance data with Indian business context
  const [directExpenseData] = useState([
    { 
      id: 1, 
      sl: 1, 
      accountName: 'Discount on sale',
      openingBalance: 0.00,
      debitAmount: 2141.00,
      creditAmount: 0.00,
      balance: 2141.00,
      accountType: 'Direct Expense',
      category: 'Sales Discount'
    },
    { 
      id: 2, 
      sl: 2, 
      accountName: 'Discount on service',
      openingBalance: 0.00,
      debitAmount: 0.00,
      creditAmount: 0.00,
      balance: 0.00,
      accountType: 'Direct Expense',
      category: 'Service Discount'
    },
    { 
      id: 3, 
      sl: 3, 
      accountName: 'Transport Cost on Purchase',
      openingBalance: 0.00,
      debitAmount: 550.00,
      creditAmount: 0.00,
      balance: 550.00,
      accountType: 'Direct Expense',
      category: 'Transportation'
    },
    { 
      id: 4, 
      sl: 4, 
      accountName: 'Raw Material Purchase',
      openingBalance: 0.00,
      debitAmount: 45000.00,
      creditAmount: 2500.00,
      balance: 42500.00,
      accountType: 'Direct Expense',
      category: 'Material Cost'
    },
    { 
      id: 5, 
      sl: 5, 
      accountName: 'Labor Charges Direct',
      openingBalance: 0.00,
      debitAmount: 18500.00,
      creditAmount: 0.00,
      balance: 18500.00,
      accountType: 'Direct Expense',
      category: 'Labor Cost'
    },
    { 
      id: 6, 
      sl: 6, 
      accountName: 'Manufacturing Overhead',
      openingBalance: 0.00,
      debitAmount: 8750.00,
      creditAmount: 1200.00,
      balance: 7550.00,
      accountType: 'Direct Expense',
      category: 'Overhead'
    },
    { 
      id: 7, 
      sl: 7, 
      accountName: 'Equipment Rental',
      openingBalance: 0.00,
      debitAmount: 12000.00,
      creditAmount: 0.00,
      balance: 12000.00,
      accountType: 'Direct Expense',
      category: 'Equipment Cost'
    },
    { 
      id: 8, 
      sl: 8, 
      accountName: 'Quality Control Expense',
      openingBalance: 0.00,
      debitAmount: 3200.00,
      creditAmount: 0.00,
      balance: 3200.00,
      accountType: 'Direct Expense',
      category: 'Quality Assurance'
    },
    { 
      id: 9, 
      sl: 9, 
      accountName: 'Packaging Material',
      openingBalance: 0.00,
      debitAmount: 5400.00,
      creditAmount: 800.00,
      balance: 4600.00,
      accountType: 'Direct Expense',
      category: 'Packaging'
    },
    { 
      id: 10, 
      sl: 10, 
      accountName: 'Direct Utilities',
      openingBalance: 0.00,
      debitAmount: 15600.00,
      creditAmount: 0.00,
      balance: 15600.00,
      accountType: 'Direct Expense',
      category: 'Utilities'
    },
    { 
      id: 11, 
      sl: 11, 
      accountName: 'Production Supplies',
      openingBalance: 0.00,
      debitAmount: 7800.00,
      creditAmount: 300.00,
      balance: 7500.00,
      accountType: 'Direct Expense',
      category: 'Supplies'
    },
    { 
      id: 12, 
      sl: 12, 
      accountName: 'Freight Inward',
      openingBalance: 0.00,
      debitAmount: 4200.00,
      creditAmount: 0.00,
      balance: 4200.00,
      accountType: 'Direct Expense',
      category: 'Transportation'
    }
  ])

  const [filteredData, setFilteredData] = useState(directExpenseData)

  // Filter options for direct expense balance
  const filterTypeOptions = [
    'All Expense Account',
    'Material Cost',
    'Labor Cost',
    'Transportation',
    'Overhead',
    'Equipment Cost',
    'Quality Assurance',
    'Packaging',
    'Utilities',
    'Supplies',
    'Sales Discount',
    'Service Discount'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalOpeningBalance = filteredData.reduce((sum, item) => sum + item.openingBalance, 0)
  const totalDebitAmount = filteredData.reduce((sum, item) => sum + item.debitAmount, 0)
  const totalCreditAmount = filteredData.reduce((sum, item) => sum + item.creditAmount, 0)
  const totalBalance = filteredData.reduce((sum, item) => sum + item.balance, 0)

  const handleGetReport = () => {
    console.log('Generating direct expense balance report with filter:', filterType)
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Apply filter based on filterType
    let filtered = directExpenseData
    
    // Category filtering logic
    if (filterType !== 'All Expense Account') {
      filtered = filtered.filter(item => 
        item.category.toLowerCase() === filterType.toLowerCase()
      )
    }
    
    setFilteredData(filtered)
    setShowSearch(false)
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(directExpenseData)
    } else {
      const filtered = directExpenseData.filter(entry =>
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(directExpenseData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Direct Expense Balance Report</title>
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
          <h1>Direct Expense Balance Report</h1>
          <p>Filter: ${filterType}</p>
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
      ['SL', 'Account Name', 'Opening Balance', 'Debit Amount', 'Credit Amount', 'Balance', 'Account Type', 'Category'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.accountName,
        entry.openingBalance.toFixed(2),
        entry.debitAmount.toFixed(2),
        entry.creditAmount.toFixed(2),
        entry.balance.toFixed(2),
        entry.accountType,
        entry.category
      ]),
      ['Grand Total', '', totalOpeningBalance.toFixed(2), totalDebitAmount.toFixed(2), totalCreditAmount.toFixed(2), totalBalance.toFixed(2), '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'direct_expense_balance_report.csv'
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
          <h2 className="font-medium text-lg">Direct Expense Balance Report</h2>
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
                {filterTypeOptions.map(option => (
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
            <h3 className="text-lg font-medium">Direct Expense Balance Report</h3>
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
                placeholder="Search by account name, category or account type..."
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
                      {searchTerm ? 'No matching records found' : 'No data available for selected filter'}
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
                <span className="font-medium text-gray-600">Total Opening Balance:</span>
                <div className="text-lg font-bold text-gray-600">₹{totalOpeningBalance.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Debit Amount:</span>
                <div className="text-lg font-bold text-red-600">₹{totalDebitAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Credit Amount:</span>
                <div className="text-lg font-bold text-green-600">₹{totalCreditAmount.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Net Balance:</span>
                <div className="text-lg font-bold text-purple-600">₹{totalBalance.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Average Balance per Account:</span>
                <div className="text-lg font-bold text-indigo-600">₹{totalEntries > 0 ? (totalBalance / totalEntries).toFixed(2) : '0.00'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Net Movement:</span>
                <div className="text-lg font-bold text-cyan-600">₹{(totalDebitAmount - totalCreditAmount).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}