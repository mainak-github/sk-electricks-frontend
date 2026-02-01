'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function ItemStockReport() {
  const [filters, setFilters] = useState({
    filterType: 'All Item Stock',
    dateFrom: '',
    dateTo: ''
  })

  const [stockData, setStockData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const API_BASE = `${config.API_URL}/items/stock/report`
  const CATEGORIES_API = `${config.API_URL}/categories`

  useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(CATEGORIES_API)
      if (!response.ok) {
        console.warn('Categories API not available, using defaults')
        setCategories([
          { id: 'electronics', label: 'Electronics', value: 'Electronics' },
          { id: 'clothing', label: 'Clothing', value: 'Clothing' },
          { id: 'food', label: 'Food', value: 'Food' },
          { id: 'books', label: 'Books', value: 'Books' }
        ])
        return
      }
      const result = await response.json()
      if (result.success && result.data) {
        const processedCategories = result.data.map((cat, index) => ({
          ...cat,
          id: cat.id || cat._id || `cat-${index}`,
          value: cat.value || cat.name || cat.label,
          label: cat.label || cat.name
        }))
        setCategories(processedCategories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([
        { id: 'electronics', label: 'Electronics', value: 'Electronics' },
        { id: 'clothing', label: 'Clothing', value: 'Clothing' },
        { id: 'food', label: 'Food', value: 'Food' }
      ])
    }
  }

  // Fetch stock report from API
  const fetchStockReport = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params = new URLSearchParams()
      
      if (filters.filterType && filters.filterType !== 'All Item Stock') {
        params.append('filterType', filters.filterType)
      }
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom)
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo)
      }

      console.log('Fetching stock report from:', `${API_BASE}?${params.toString()}`)
      
      const response = await fetch(`${API_BASE}?${params.toString()}`)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server error response:', errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('Stock report result:', result)
      
      if (result.success) {
        const dataWithSerialNumbers = (result.data || []).map((item, index) => ({
          ...item,
          sl: index + 1,
          serials: item.hsnCode ? '📋' : ''
        }))
        setStockData(dataWithSerialNumbers)
        setFilteredData(dataWithSerialNumbers)
      } else {
        throw new Error(result.error || 'Failed to fetch stock report')
      }
    } catch (error) {
      console.error('Error fetching stock report:', error)
      setError(error.message)
      alert(`Error fetching stock report: ${error.message}\n\nPlease check:\n1. Backend server is running\n2. API route is configured correctly\n3. Database connection is active`)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals
  const calculateTotals = (data) => {
    return data.reduce((totals, item) => ({
      openingStock: totals.openingStock + (item.openingStock || 0),
      purchased: totals.purchased + (item.purchased || 0),
      production: totals.production + (item.production || 0),
      sold: totals.sold + (item.sold || 0),
      consume: totals.consume + (item.consume || 0),
      purchaseReturn: totals.purchaseReturn + (item.purchaseReturn || 0),
      salesReturn: totals.salesReturn + (item.salesReturn || 0),
      transferOut: totals.transferOut + (item.transferOut || 0),
      transferIn: totals.transferIn + (item.transferIn || 0),
      damage: totals.damage + (item.damage || 0),
      replaceReturn: totals.replaceReturn + (item.replaceReturn || 0),
      replaceGiven: totals.replaceGiven + (item.replaceGiven || 0),
      currentStock: totals.currentStock + (item.currentStock || 0),
      stockValue: totals.stockValue + (item.stockValue || 0)
    }), {
      openingStock: 0,
      purchased: 0,
      production: 0,
      sold: 0,
      consume: 0,
      purchaseReturn: 0,
      salesReturn: 0,
      transferOut: 0,
      transferIn: 0,
      damage: 0,
      replaceReturn: 0,
      replaceGiven: 0,
      currentStock: 0,
      stockValue: 0
    })
  }

  const totals = calculateTotals(filteredData)

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGetReport = () => {
    fetchStockReport()
    setCurrentPage(1)
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(stockData)
    } else {
      const searchFiltered = stockData.filter(item =>
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.group && item.group.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.hsnCode && item.hsnCode.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredData(searchFiltered)
    }
    setCurrentPage(1)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(stockData)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Item Stock Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .header h2 {
              margin: 5px 0;
              color: #0d9488;
            }
            .filters {
              margin-bottom: 20px;
              text-align: center;
              background: #f0f0f0;
              padding: 10px;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 9px;
            }
            th, td { 
              border: 1px solid #333; 
              padding: 4px; 
              text-align: center; 
            }
            th { 
              background-color: #0d9488; 
              color: white;
              font-weight: bold; 
              font-size: 8px;
            }
            .total-row {
              font-weight: bold;
              background-color: #e6f7f5;
              border-top: 3px solid #0d9488;
            }
            .text-left { text-align: left; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>🏭 Item Stock Report</h2>
            <p>Comprehensive Inventory Movement Analysis</p>
          </div>
          <div class="filters">
            <p><strong>Filter Type:</strong> ${filters.filterType}</p>
            ${filters.dateFrom ? `<p><strong>Date From:</strong> ${new Date(filters.dateFrom).toLocaleDateString()}</p>` : ''}
            ${filters.dateTo ? `<p><strong>Date To:</strong> ${new Date(filters.dateTo).toLocaleDateString()}</p>` : ''}
            <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-IN')}</p>
            <p><strong>Total Items:</strong> ${filteredData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th rowspan="2">SL</th>
                <th rowspan="2">Code</th>
                <th rowspan="2">Item Name</th>
                <th rowspan="2">Group</th>
                <th rowspan="2">Category</th>
                <th rowspan="2">HSN</th>
                <th rowspan="2">Opening</th>
                <th rowspan="2">Purchased</th>
                <th rowspan="2">Production</th>
                <th rowspan="2">Sold</th>
                <th rowspan="2">Consume</th>
                <th colspan="2">Return</th>
                <th colspan="2">Transfer</th>
                <th rowspan="2">Damage</th>
                <th colspan="2">Replace</th>
                <th rowspan="2">Costing Rate</th>
                <th rowspan="2">Current Stock</th>
                <th rowspan="2">Stock Value (₹)</th>
              </tr>
              <tr>
                <th>Purchase</th>
                <th>Sales</th>
                <th>Out</th>
                <th>In</th>
                <th>Return</th>
                <th>Given</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => `
                <tr>
                  <td>${item.sl}</td>
                  <td>${item.code}</td>
                  <td class="text-left">${item.itemName}</td>
                  <td class="text-left">${item.group || '-'}</td>
                  <td class="text-left">${item.category || '-'}</td>
                  <td>${item.hsnCode || '-'}</td>
                  <td class="text-right">${item.openingStock}</td>
                  <td class="text-right">${item.purchased}</td>
                  <td class="text-right">${item.production}</td>
                  <td class="text-right">${item.sold}</td>
                  <td class="text-right">${item.consume}</td>
                  <td class="text-right">${item.purchaseReturn}</td>
                  <td class="text-right">${item.salesReturn}</td>
                  <td class="text-right">${item.transferOut}</td>
                  <td class="text-right">${item.transferIn}</td>
                  <td class="text-right">${item.damage}</td>
                  <td class="text-right">${item.replaceReturn}</td>
                  <td class="text-right">${item.replaceGiven}</td>
                  <td class="text-right">₹${item.costingRate.toFixed(2)}</td>
                  <td class="text-right"><strong>${item.currentStock} ${item.unit}</strong></td>
                  <td class="text-right"><strong>₹${item.stockValue.toFixed(2)}</strong></td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6" class="text-center"><strong>Grand Total:</strong></td>
                <td class="text-right"><strong>${totals.openingStock.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.purchased.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.production.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.sold.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.consume.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.purchaseReturn.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.salesReturn.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.transferOut.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.transferIn.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.damage.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.replaceReturn.toFixed(0)}</strong></td>
                <td class="text-right"><strong>${totals.replaceGiven.toFixed(0)}</strong></td>
                <td class="text-right">-</td>
                <td class="text-right"><strong>${totals.currentStock.toFixed(0)}</strong></td>
                <td class="text-right"><strong>₹${totals.stockValue.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
            <p>This is a computer-generated report. Verified by inventory management system.</p>
          </div>
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
      ['SL', 'Code', 'Item Name', 'Group', 'Category', 'HSN Code', 'Opening Stock', 'Purchased', 'Production', 'Sold', 'Consume', 'Purchase Return', 'Sales Return', 'Transfer Out', 'Transfer In', 'Damage', 'Replace Return', 'Replace Given', 'Costing Rate', 'Current Stock', 'Stock Value'],
      ...filteredData.map(item => [
        item.sl,
        item.code,
        item.itemName,
        item.group || '',
        item.category || '',
        item.hsnCode || '',
        item.openingStock,
        item.purchased,
        item.production,
        item.sold,
        item.consume,
        item.purchaseReturn,
        item.salesReturn,
        item.transferOut,
        item.transferIn,
        item.damage,
        item.replaceReturn,
        item.replaceGiven,
        item.costingRate.toFixed(2),
        `${item.currentStock} ${item.unit}`,
        item.stockValue.toFixed(2)
      ]),
      ['Grand Total:', '', '', '', '', '', totals.openingStock.toFixed(0), totals.purchased.toFixed(0), totals.production.toFixed(0), totals.sold.toFixed(0), totals.consume.toFixed(0), totals.purchaseReturn.toFixed(0), totals.salesReturn.toFixed(0), totals.transferOut.toFixed(0), totals.transferIn.toFixed(0), totals.damage.toFixed(0), totals.replaceReturn.toFixed(0), totals.replaceGiven.toFixed(0), '', totals.currentStock.toFixed(0), totals.stockValue.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `item_stock_report_${filters.filterType}_${new Date().toISOString().split('T')[0]}.csv`
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
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Stock Report</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-3">
                <button
                  onClick={() => setError(null)}
                  className="text-sm font-medium text-red-800 hover:text-red-600"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg flex items-center gap-2">
            📊 Item Stock Report
          </h2>
          <p className="text-xs text-teal-50 mt-1">Comprehensive inventory movement tracking with real-time calculations</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter Type</label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={filters.filterType}
                onChange={(e) => handleFilterChange('filterType', e.target.value)}
              >
                <option value="All Item Stock">All Item Stock</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date From</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date To</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            {/* Get Report Button */}
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-cyan-600 hover:to-teal-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    🔍 GET REPORT
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          {filteredData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-600 font-medium">Total Items</p>
                <p className="text-2xl font-bold text-blue-700">{filteredData.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-600 font-medium">Current Stock</p>
                <p className="text-2xl font-bold text-green-700">{totals.currentStock.toFixed(0)}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                <p className="text-xs text-purple-600 font-medium">Total Purchased</p>
                <p className="text-2xl font-bold text-purple-700">{totals.purchased.toFixed(0)}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                <p className="text-xs text-orange-600 font-medium">Total Sold</p>
                <p className="text-2xl font-bold text-orange-700">{totals.sold.toFixed(0)}</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                <p className="text-xs text-teal-600 font-medium">Stock Value</p>
                <p className="text-2xl font-bold text-teal-700">₹{totals.stockValue.toFixed(0)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Table - Rest of the component remains the same as previous version */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              📋 Detailed Stock Report
              {filteredData.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({filteredData.length} items)
                </span>
              )}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Search"
              >
                🔍
              </button>
              <button 
                onClick={handleExport}
                disabled={filteredData.length === 0}
                className="p-2 border border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to CSV"
              >
                📤
              </button>
              <button 
                onClick={handlePrint}
                disabled={filteredData.length === 0}
                className="p-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                placeholder="Search by item name, code, group, category, or HSN code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button 
                onClick={handleSearch}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors"
              >
                Search
              </button>
              <button 
                onClick={handleClearSearch}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Table */}
          <div className="relative w-full">
            <div className="overflow-x-auto overflow-y-auto max-h-96 border border-gray-300 rounded-lg" style={{ maxWidth: '100%' }}>
              <table className="text-xs w-full" style={{ minWidth: '1400px' }}>
                <thead className="sticky top-0 bg-gradient-to-r from-teal-600 to-cyan-600 text-white z-10">
                  <tr>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[40px]">SL</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[80px]">Code</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[150px]">Item Name</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[100px]">Group</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[100px]">Category</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[70px]">HSN</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[70px]">Opening</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[80px]">Purchased</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[80px]">Production</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[60px]">Sold</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[70px]">Consume</th>
                    <th colSpan="2" className="border border-teal-500 p-2 font-semibold">Return</th>
                    <th colSpan="2" className="border border-teal-500 p-2 font-semibold">Transfer</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[60px]">Damage</th>
                    <th colSpan="2" className="border border-teal-500 p-2 font-semibold">Replace</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[90px]">Costing Rate</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[90px]">Current Stock</th>
                    <th rowSpan="2" className="border border-teal-500 p-2 font-semibold min-w-[100px]">Stock Value</th>
                  </tr>
                  <tr>
                    <th className="border border-teal-500 p-2 font-semibold min-w-[70px]">Purchase</th>
                    <th className="border border-teal-500 p-2 font-semibold min-w-[60px]">Sales</th>
                    <th className="border border-teal-500 p-2 font-semibold min-w-[50px]">Out</th>
                    <th className="border border-teal-500 p-2 font-semibold min-w-[40px]">In</th>
                    <th className="border border-teal-500 p-2 font-semibold min-w-[60px]">Return</th>
                    <th className="border border-teal-500 p-2 font-semibold min-w-[50px]">Given</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="21" className="border border-gray-300 p-8 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                          <p className="text-gray-600 font-medium">Loading stock report...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentEntries.length > 0 ? (
                    <>
                      {currentEntries.map((item) => (
                        <tr key={item.id} className="hover:bg-teal-50 transition-colors">
                          <td className="border border-gray-300 p-2 text-center">{item.sl}</td>
                          <td className="border border-gray-300 p-2 text-center font-medium text-blue-600">{item.code}</td>
                          <td className="border border-gray-300 p-2 text-left font-medium" title={item.itemName}>{item.itemName}</td>
                          <td className="border border-gray-300 p-2 text-left" title={item.group}>{item.group || '-'}</td>
                          <td className="border border-gray-300 p-2 text-left" title={item.category}>{item.category || '-'}</td>
                          <td className="border border-gray-300 p-2 text-center">
                            {item.hsnCode ? (
                              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                                {item.hsnCode}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="border border-gray-300 p-2 text-right">{item.openingStock}</td>
                          <td className="border border-gray-300 p-2 text-right text-green-600 font-medium">{item.purchased}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.production}</td>
                          <td className="border border-gray-300 p-2 text-right text-red-600 font-medium">{item.sold}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.consume}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.purchaseReturn}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.salesReturn}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.transferOut}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.transferIn}</td>
                          <td className="border border-gray-300 p-2 text-right text-orange-600">{item.damage}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.replaceReturn}</td>
                          <td className="border border-gray-300 p-2 text-right">{item.replaceGiven}</td>
                          <td className="border border-gray-300 p-2 text-right font-medium">₹{item.costingRate.toFixed(2)}</td>
                          <td className="border border-gray-300 p-2 text-right">
                            <span className={`font-bold ${item.currentStock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.currentStock} {item.unit}
                            </span>
                          </td>
                          <td className="border border-gray-300 p-2 text-right font-bold text-teal-600">
                            ₹{item.stockValue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {/* Grand Total Row */}
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold sticky bottom-0 border-t-4 border-teal-600">
                        <td colSpan="6" className="border border-gray-400 p-2 text-center text-sm">
                          <span className="text-teal-700">📊 Grand Total</span>
                        </td>
                        <td className="border border-gray-400 p-2 text-right">{totals.openingStock.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right text-green-700">{totals.purchased.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{totals.production.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right text-red-700">{totals.sold.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{totals.consume.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{totals.purchaseReturn.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{totals.salesReturn.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{totals.transferOut.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{totals.transferIn.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right text-orange-700">{totals.damage.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{totals.replaceReturn.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">{totals.replaceGiven.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right">-</td>
                        <td className="border border-gray-400 p-2 text-right text-teal-700 text-sm">{totals.currentStock.toFixed(0)}</td>
                        <td className="border border-gray-400 p-2 text-right text-teal-700 text-sm">₹{totals.stockValue.toFixed(2)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan="21" className="border border-gray-300 p-8 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-6xl">📦</div>
                          <p className="text-lg font-medium">
                            {searchTerm ? 'No matching records found' : 'No stock data available'}
                          </p>
                          <p className="text-sm">
                            {searchTerm ? 'Try adjusting your search terms' : 'Click "GET REPORT" to fetch stock data'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-medium">Rows per page:</span>
              <select 
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">
                {filteredData.length === 0 
                  ? '0-0 of 0' 
                  : `${startIndex + 1}-${Math.min(endIndex, filteredData.length)} of ${filteredData.length}`
                }
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="First Page"
                >
                  ⏮
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Previous Page"
                >
                  ◀
                </button>
                <span className="px-4 py-1.5 bg-teal-50 border border-teal-300 rounded-lg text-teal-700 font-semibold">
                  {currentPage} / {totalPages || 1}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Next Page"
                >
                  ▶
                </button>
                <button 
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  title="Last Page"
                >
                  ⏭
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
