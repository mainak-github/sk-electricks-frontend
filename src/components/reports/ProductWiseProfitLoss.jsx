'use client'

import { useState } from 'react'

export default function ProductWiseProfitLoss() {
  const [filterType, setFilterType] = useState('All Item Stock')
  const [dateType, setDateType] = useState('Date Wise')
  const [fromDate, setFromDate] = useState('21/08/2025')
  const [toDate, setToDate] = useState('21/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample product wise profit loss data
  const [productData] = useState([
    {
      id: 1,
      sl: 1,
      itemCode: 'RICE001',
      itemName: 'Premium Basmati Rice',
      group: 'Grains',
      soldQty: 150.00,
      soldAmount: 22500.00,
      costPrice: 18000.00,
      profit: 4500.00,
      profitPercentage: 25.00
    },
    {
      id: 2,
      sl: 2,
      itemCode: 'OIL001',
      itemName: 'Sunflower Cooking Oil',
      group: 'Edible Oil',
      soldQty: 85.00,
      soldAmount: 12750.00,
      costPrice: 10200.00,
      profit: 2550.00,
      profitPercentage: 25.00
    },
    {
      id: 3,
      sl: 3,
      itemCode: 'SUGAR001',
      itemName: 'Refined Sugar',
      group: 'Sweetener',
      soldQty: 200.00,
      soldAmount: 14000.00,
      costPrice: 12000.00,
      profit: 2000.00,
      profitPercentage: 16.67
    },
    {
      id: 4,
      sl: 4,
      itemCode: 'WHEAT001',
      itemName: 'Whole Wheat Flour',
      group: 'Flour',
      soldQty: 120.00,
      soldAmount: 8400.00,
      costPrice: 7200.00,
      profit: 1200.00,
      profitPercentage: 16.67
    }
  ])

  const [filteredData, setFilteredData] = useState(productData)

  // Filter options
  const filterOptions = [
    'All Item Stock',
    'High Profit Items',
    'Low Profit Items',
    'Loss Making Items',
    'Top Selling Items'
  ]

  const dateTypeOptions = [
    'Date Wise',
    'Monthly',
    'Quarterly',
    'Yearly'
  ]

  // Calculate grand totals
  const grandTotals = {
    soldQty: filteredData.reduce((sum, item) => sum + item.soldQty, 0),
    soldAmount: filteredData.reduce((sum, item) => sum + item.soldAmount, 0),
    costPrice: filteredData.reduce((sum, item) => sum + item.costPrice, 0),
    profit: filteredData.reduce((sum, item) => sum + item.profit, 0),
    profitPercentage: filteredData.length > 0 ? 
      (filteredData.reduce((sum, item) => sum + item.profit, 0) / filteredData.reduce((sum, item) => sum + item.soldAmount, 0)) * 100 : 0
  }

  const handleGetReport = () => {
    console.log('Generating product wise profit loss report with filter:', filterType, 'Date Type:', dateType, 'From:', fromDate, 'To:', toDate)
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    setFilteredData(productData)
    setShowSearch(false)
    // Here you would typically make an API call to get filtered data
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(productData)
    } else {
      const filtered = productData.filter(entry =>
        entry.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.group.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(productData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Product Wise Profit Loss Report</title>
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
          <h1>Product Wise Profit Loss Report</h1>
          <p>Period: ${fromDate} to ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Group</th>
                <th>Sold Qty</th>
                <th>Sold Amount</th>
                <th>Cost Price</th>
                <th>Profit</th>
                <th>Profit %</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.itemCode}</td>
                  <td>${entry.itemName}</td>
                  <td>${entry.group}</td>
                  <td class="amount">${entry.soldQty.toFixed(2)}</td>
                  <td class="amount">${entry.soldAmount.toFixed(2)}</td>
                  <td class="amount">${entry.costPrice.toFixed(2)}</td>
                  <td class="amount">${entry.profit.toFixed(2)}</td>
                  <td class="amount">${entry.profitPercentage.toFixed(2)}%</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>Grand Total</strong></td>
                <td class="amount"><strong>${grandTotals.soldQty.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.soldAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.costPrice.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.profit.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.profitPercentage.toFixed(2)}%</strong></td>
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
      ['SL', 'Item Code', 'Item Name', 'Group', 'Sold Qty', 'Sold Amount', 'Cost Price', 'Profit', 'Profit %'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.itemCode,
        entry.itemName,
        entry.group,
        entry.soldQty.toFixed(2),
        entry.soldAmount.toFixed(2),
        entry.costPrice.toFixed(2),
        entry.profit.toFixed(2),
        entry.profitPercentage.toFixed(2) + '%'
      ]),
      ['Grand Total', '', '', '', 
        grandTotals.soldQty.toFixed(2),
        grandTotals.soldAmount.toFixed(2),
        grandTotals.costPrice.toFixed(2),
        grandTotals.profit.toFixed(2),
        grandTotals.profitPercentage.toFixed(2) + '%'
      ]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product_wise_profit_loss.csv'
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
          <h2 className="font-medium text-lg">Item Profit/Loss Report</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Type</label>
              <select 
                className="w-32 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={dateType}
                onChange={(e) => setDateType(e.target.value)}
              >
                {dateTypeOptions.map(option => (
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
            <h3 className="text-lg font-medium">Product Wise Profit/Loss Report</h3>
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
                placeholder="Search by item name, code, or group..."
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
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">SL</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Item Code</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700 min-w-[180px]">Item Name</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Group</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Sold Qty</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Sold Amount</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Cost Price</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Profit</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Profit %</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 text-xs">{entry.sl}</td>
                        <td className="py-2 px-2 text-xs">{entry.itemCode}</td>
                        <td className="py-2 px-2 text-xs font-medium">{entry.itemName}</td>
                        <td className="py-2 px-2 text-xs">{entry.group}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.soldQty.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.soldAmount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.costPrice.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">
                          <span className={entry.profit > 0 ? 'text-green-600' : entry.profit < 0 ? 'text-red-600' : 'text-gray-900'}>
                            {entry.profit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs text-right">
                          <span className={entry.profitPercentage > 0 ? 'text-green-600' : entry.profitPercentage < 0 ? 'text-red-600' : 'text-gray-900'}>
                            {entry.profitPercentage.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-2 text-xs font-bold" colSpan="4">
                        Grand Total
                      </td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.soldQty.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.soldAmount.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.costPrice.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">
                        <span className={grandTotals.profit > 0 ? 'text-green-600' : grandTotals.profit < 0 ? 'text-red-600' : 'text-gray-900'}>
                          {grandTotals.profit.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs text-right font-bold">
                        <span className={grandTotals.profitPercentage > 0 ? 'text-green-600' : grandTotals.profitPercentage < 0 ? 'text-red-600' : 'text-gray-900'}>
                          {grandTotals.profitPercentage.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Sales:</span>
                <div className="text-lg font-bold text-blue-600">₹{grandTotals.soldAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Cost:</span>
                <div className="text-lg font-bold text-orange-600">₹{grandTotals.costPrice.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Profit:</span>
                <div className={`text-lg font-bold ${grandTotals.profit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{grandTotals.profit.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Profit Margin:</span>
                <div className={`text-lg font-bold ${grandTotals.profitPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {grandTotals.profitPercentage.toFixed(2)}%
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