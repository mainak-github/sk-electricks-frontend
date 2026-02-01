'use client'

import { useState } from 'react'

export default function ItemStockReport() {
  const [filterType, setFilterType] = useState('All Item Stock')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample item stock data based on the screenshot
  const [itemStockData] = useState([
    {
      id: 1,
      sl: 1,
      code: 'ITM001',
      itemName: 'Basmati Rice Premium',
      group: 'Rice',
      category: 'Grains',
      serials: 'BR001',
      openingStock: 500.00,
      purchased: 1000.00,
      production: 0.00,
      sold: 350.00,
      consumed: 50.00,
      purchaseReturn: 25.00,
      salesReturn: 15.00,
      transfer: 0.00,
      received: 0.00,
      damage: 5.00,
      replaceReturn: 0.00,
      replaceGiven: 0.00,
      costingRate: 85.50,
      currentStock: 1085.00,
      stockValue: 92775.00
    },
    {
      id: 2,
      sl: 2,
      code: 'ITM002',
      itemName: 'Wheat Flour',
      group: 'Flour',
      category: 'Grains',
      serials: 'WF001',
      openingStock: 200.00,
      purchased: 500.00,
      production: 0.00,
      sold: 180.00,
      consumed: 20.00,
      purchaseReturn: 10.00,
      salesReturn: 5.00,
      transfer: 0.00,
      received: 0.00,
      damage: 2.00,
      replaceReturn: 0.00,
      replaceGiven: 0.00,
      costingRate: 45.00,
      currentStock: 493.00,
      stockValue: 22185.00
    },
    {
      id: 3,
      sl: 3,
      code: 'ITM003',
      itemName: 'Cooking Oil',
      group: 'Oil',
      category: 'Edible Oil',
      serials: 'CO001',
      openingStock: 150.00,
      purchased: 300.00,
      production: 0.00,
      sold: 120.00,
      consumed: 10.00,
      purchaseReturn: 5.00,
      salesReturn: 8.00,
      transfer: 0.00,
      received: 0.00,
      damage: 1.00,
      replaceReturn: 0.00,
      replaceGiven: 0.00,
      costingRate: 120.00,
      currentStock: 322.00,
      stockValue: 38640.00
    },
    {
      id: 4,
      sl: 4,
      code: 'ITM004',
      itemName: 'Sugar Crystal',
      group: 'Sugar',
      category: 'Sweetener',
      serials: 'SC001',
      openingStock: 100.00,
      purchased: 250.00,
      production: 0.00,
      sold: 90.00,
      consumed: 15.00,
      purchaseReturn: 0.00,
      salesReturn: 3.00,
      transfer: 0.00,
      received: 0.00,
      damage: 1.00,
      replaceReturn: 0.00,
      replaceGiven: 0.00,
      costingRate: 55.00,
      currentStock: 247.00,
      stockValue: 13585.00
    }
  ])

  const [filteredData, setFilteredData] = useState(itemStockData)

  // Filter options for item stock
  const filterOptions = [
    'All Item Stock',
    'Active Items',
    'Inactive Items',
    'Low Stock Items',
    'Out of Stock Items',
    'High Value Items'
  ]

  // Calculate grand totals
  const grandTotals = {
    openingStock: filteredData.reduce((sum, item) => sum + item.openingStock, 0),
    purchased: filteredData.reduce((sum, item) => sum + item.purchased, 0),
    production: filteredData.reduce((sum, item) => sum + item.production, 0),
    sold: filteredData.reduce((sum, item) => sum + item.sold, 0),
    consumed: filteredData.reduce((sum, item) => sum + item.consumed, 0),
    purchaseReturn: filteredData.reduce((sum, item) => sum + item.purchaseReturn, 0),
    salesReturn: filteredData.reduce((sum, item) => sum + item.salesReturn, 0),
    transfer: filteredData.reduce((sum, item) => sum + item.transfer, 0),
    received: filteredData.reduce((sum, item) => sum + item.received, 0),
    damage: filteredData.reduce((sum, item) => sum + item.damage, 0),
    replaceReturn: filteredData.reduce((sum, item) => sum + item.replaceReturn, 0),
    replaceGiven: filteredData.reduce((sum, item) => sum + item.replaceGiven, 0),
    currentStock: filteredData.reduce((sum, item) => sum + item.currentStock, 0),
    stockValue: filteredData.reduce((sum, item) => sum + item.stockValue, 0)
  }

  const handleGetReport = () => {
    console.log('Generating item stock report with filter:', filterType)
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    setFilteredData(itemStockData)
    setShowSearch(false)
    // Here you would typically make an API call to get filtered data
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(itemStockData)
    } else {
      const filtered = itemStockData.filter(entry =>
        entry.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(itemStockData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Item Stock Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Item Stock Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Code</th>
                <th>Item Name</th>
                <th>Group</th>
                <th>Category</th>
                <th>Serials</th>
                <th>Opening Stock</th>
                <th>Purchased</th>
                <th>Production</th>
                <th>Sold</th>
                <th>Consumed</th>
                <th>Purchase Return</th>
                <th>Sales Return</th>
                <th>Transfer</th>
                <th>Received</th>
                <th>Damage</th>
                <th>Replace Return</th>
                <th>Replace Given</th>
                <th>Costing Rate</th>
                <th>Current Stock</th>
                <th>Stock Value</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.code}</td>
                  <td>${entry.itemName}</td>
                  <td>${entry.group}</td>
                  <td>${entry.category}</td>
                  <td>${entry.serials}</td>
                  <td class="amount">${entry.openingStock.toFixed(2)}</td>
                  <td class="amount">${entry.purchased.toFixed(2)}</td>
                  <td class="amount">${entry.production.toFixed(2)}</td>
                  <td class="amount">${entry.sold.toFixed(2)}</td>
                  <td class="amount">${entry.consumed.toFixed(2)}</td>
                  <td class="amount">${entry.purchaseReturn.toFixed(2)}</td>
                  <td class="amount">${entry.salesReturn.toFixed(2)}</td>
                  <td class="amount">${entry.transfer.toFixed(2)}</td>
                  <td class="amount">${entry.received.toFixed(2)}</td>
                  <td class="amount">${entry.damage.toFixed(2)}</td>
                  <td class="amount">${entry.replaceReturn.toFixed(2)}</td>
                  <td class="amount">${entry.replaceGiven.toFixed(2)}</td>
                  <td class="amount">${entry.costingRate.toFixed(2)}</td>
                  <td class="amount">${entry.currentStock.toFixed(2)}</td>
                  <td class="amount">${entry.stockValue.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6"><strong>Grand Total</strong></td>
                <td class="amount"><strong>${grandTotals.openingStock.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.purchased.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.production.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.sold.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.consumed.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.purchaseReturn.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.salesReturn.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.transfer.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.received.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.damage.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.replaceReturn.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.replaceGiven.toFixed(2)}</strong></td>
                <td class="amount">-</td>
                <td class="amount"><strong>${grandTotals.currentStock.toFixed(2)}</strong></td>
                <td class="amount"><strong>${grandTotals.stockValue.toFixed(2)}</strong></td>
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
      ['SL', 'Code', 'Item Name', 'Group', 'Category', 'Serials', 'Opening Stock', 'Purchased', 'Production', 'Sold', 'Consumed', 'Purchase Return', 'Sales Return', 'Transfer', 'Received', 'Damage', 'Replace Return', 'Replace Given', 'Costing Rate', 'Current Stock', 'Stock Value'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.code,
        entry.itemName,
        entry.group,
        entry.category,
        entry.serials,
        entry.openingStock.toFixed(2),
        entry.purchased.toFixed(2),
        entry.production.toFixed(2),
        entry.sold.toFixed(2),
        entry.consumed.toFixed(2),
        entry.purchaseReturn.toFixed(2),
        entry.salesReturn.toFixed(2),
        entry.transfer.toFixed(2),
        entry.received.toFixed(2),
        entry.damage.toFixed(2),
        entry.replaceReturn.toFixed(2),
        entry.replaceGiven.toFixed(2),
        entry.costingRate.toFixed(2),
        entry.currentStock.toFixed(2),
        entry.stockValue.toFixed(2)
      ]),
      ['Grand Total', '', '', '', '', '', 
        grandTotals.openingStock.toFixed(2),
        grandTotals.purchased.toFixed(2),
        grandTotals.production.toFixed(2),
        grandTotals.sold.toFixed(2),
        grandTotals.consumed.toFixed(2),
        grandTotals.purchaseReturn.toFixed(2),
        grandTotals.salesReturn.toFixed(2),
        grandTotals.transfer.toFixed(2),
        grandTotals.received.toFixed(2),
        grandTotals.damage.toFixed(2),
        grandTotals.replaceReturn.toFixed(2),
        grandTotals.replaceGiven.toFixed(2),
        '',
        grandTotals.currentStock.toFixed(2),
        grandTotals.stockValue.toFixed(2)
      ]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'item_stock_report.csv'
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
          <h2 className="font-medium text-lg">Item Stock Report</h2>
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
            <h3 className="text-lg font-medium">Item Stock Report</h3>
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
                placeholder="Search by item name, code, group, or category..."
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

          {/* Table - Scrollable horizontally only */}
          <div className="overflow-x-auto border rounded max-w-4xl">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 border-r">SL</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Code</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700 min-w-[150px]">Item Name</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Group</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Category</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Serials</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Opening Stock</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Purchased</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Production</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Sold</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Consumed</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Purchase Return</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Sales Return</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Transfer</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Received</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Damage</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Replace Return</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Replace Given</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Costing Rate (AVG.)</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Current Stock</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Stock Value</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 text-xs sticky left-0 bg-white border-r">{entry.sl}</td>
                        <td className="py-2 px-2 text-xs">{entry.code}</td>
                        <td className="py-2 px-2 text-xs font-medium">{entry.itemName}</td>
                        <td className="py-2 px-2 text-xs">{entry.group}</td>
                        <td className="py-2 px-2 text-xs">{entry.category}</td>
                        <td className="py-2 px-2 text-xs">{entry.serials}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.openingStock.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.purchased.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.production.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.sold.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.consumed.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.purchaseReturn.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.salesReturn.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.transfer.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.received.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.damage.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.replaceReturn.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.replaceGiven.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.costingRate.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right font-medium">{entry.currentStock.toFixed(2)}</td>
                        <td className="py-2 px-2 text-xs text-right font-medium">{entry.stockValue.toFixed(2)}</td>
                      </tr>
                    ))}
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-2 text-xs font-bold sticky left-0 bg-gray-100 border-r" colSpan="6">
                        Grand Total
                      </td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.openingStock.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.purchased.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.production.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.sold.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.consumed.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.purchaseReturn.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.salesReturn.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.transfer.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.received.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.damage.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.replaceReturn.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.replaceGiven.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right">-</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.currentStock.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">{grandTotals.stockValue.toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="21" className="text-center py-8 text-gray-500">
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
        </div>
      </div>
      )}
    </div>
  )
}