'use client'

import { useState } from 'react'

export default function BalanceSheetReport() {
  const [filterType, setFilterType] = useState('Date Wise')
  const [toDate, setToDate] = useState('21/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample balance sheet data - combined liabilities and assets
  const [balanceSheetData] = useState([
    // Liabilities
    { id: 1, sl: 1, accountType: 'Liability', accountName: 'Supplier Due Balance', amount: 125000.00 },
    { id: 2, sl: 2, accountType: 'Liability', accountName: 'Capital Account', amount: 500000.00 },
    { id: 3, sl: 3, accountType: 'Liability', accountName: 'Loan (Liability)', amount: 250000.00 },
    { id: 4, sl: 4, accountType: 'Liability', accountName: 'Advance Received From Customer', amount: 15000.00 },
    { id: 5, sl: 5, accountType: 'Liability', accountName: 'Received Product Value From Branches', amount: 35000.00 },
    { id: 6, sl: 6, accountType: 'Liability', accountName: 'Vat Balance', amount: 8500.00 },
    { id: 7, sl: 7, accountType: 'Liability', accountName: 'Profit/Loss', amount: 45000.00 },
    { id: 8, sl: 8, accountType: 'Liability', accountName: 'Difference In Opening', amount: 2500.00 },
    // Assets
    { id: 9, sl: 9, accountType: 'Asset', accountName: 'Cash In Hand', amount: 25000.00 },
    { id: 10, sl: 10, accountType: 'Asset', accountName: 'Bank Accounts Balance', amount: 150000.00 },
    { id: 11, sl: 11, accountType: 'Asset', accountName: 'Customer Due Balance', amount: 185000.00 },
    { id: 12, sl: 12, accountType: 'Asset', accountName: 'Fixed Assets', amount: 300000.00 },
    { id: 13, sl: 13, accountType: 'Asset', accountName: 'Advance Payment to Supplier', amount: 12000.00 },
    { id: 14, sl: 14, accountType: 'Asset', accountName: 'Receiveable From Others Branches', amount: 18000.00 },
    { id: 15, sl: 15, accountType: 'Asset', accountName: 'Transfer Product Value To Others Branches', amount: 28000.00 },
    { id: 16, sl: 16, accountType: 'Asset', accountName: 'Closing Product Inventory/Stock Value', amount: 263000.00 }
  ])

  const [filteredData, setFilteredData] = useState(balanceSheetData)

  // Filter options
  const filterOptions = [
    'Date Wise',
    'Monthly',
    'Quarterly',
    'Yearly'
  ]

  // Calculate totals
  const liabilitiesTotal = filteredData.filter(item => item.accountType === 'Liability').reduce((sum, item) => sum + item.amount, 0)
  const assetsTotal = filteredData.filter(item => item.accountType === 'Asset').reduce((sum, item) => sum + item.amount, 0)
  const grandTotal = liabilitiesTotal + assetsTotal

  const handleGetReport = () => {
    console.log('Generating balance sheet report with filter:', filterType, 'To Date:', toDate)
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    setFilteredData(balanceSheetData)
    setShowSearch(false)
    // Here you would typically make an API call to get filtered data
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(balanceSheetData)
    } else {
      const filtered = balanceSheetData.filter(entry =>
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(balanceSheetData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Balance Sheet Report</title>
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
          <h1>Balance Sheet Report</h1>
          <p>As on: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Account Type</th>
                <th>Account Name</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.accountType}</td>
                  <td>${entry.accountName}</td>
                  <td class="amount">${entry.amount.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="3"><strong>Grand Total</strong></td>
                <td class="amount"><strong>${grandTotal.toFixed(2)}</strong></td>
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
      ['SL', 'Account Type', 'Account Name', 'Amount'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.accountType,
        entry.accountName,
        entry.amount.toFixed(2)
      ]),
      ['Grand Total', '', '', grandTotal.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'balance_sheet_report.csv'
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
          <h2 className="font-medium text-lg">Balance Sheet Report</h2>
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
                {filterOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
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
                📊 GET REPORT
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
            <h3 className="text-lg font-medium">Balance Sheet Report</h3>
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
                placeholder="Search by account name or type..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Account Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[250px]">Account Name</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs">
                          <span className={entry.accountType === 'Liability' ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                            {entry.accountType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.accountName}</td>
                        <td className="py-2 px-3 text-xs text-right">{entry.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="3">
                        Grand Total
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold">{grandTotal.toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
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
                <div className="text-lg font-bold text-blue-600">{filteredData.length}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Liabilities:</span>
                <div className="text-lg font-bold text-red-600">₹{liabilitiesTotal.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Assets:</span>
                <div className="text-lg font-bold text-green-600">₹{assetsTotal.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Net Worth:</span>
                <div className={`text-lg font-bold ${(assetsTotal - liabilitiesTotal) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{(assetsTotal - liabilitiesTotal).toFixed(2)}
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