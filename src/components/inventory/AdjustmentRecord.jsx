'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function AdjustmentRecord() {
  const API_BASE = `${config.API_URL}/items/adjustment`

  // Get today's date in DD/MM/YYYY format
  const getTodayFormatted = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Convert DD/MM/YYYY to YYYY-MM-DD for date input
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return ''
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  // Parse DD/MM/YYYY to Date object
  const parseDisplayDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return new Date(year, month - 1, day)
  }

  // Format ISO date to DD/MM/YYYY
  const formatISOToDisplay = (isoDate) => {
    const date = new Date(isoDate)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const [formData, setFormData] = useState({
    filterType: 'All',
    recordType: 'all',
    adjustmentType: '',
    status: '',
    fromDate: getTodayFormatted(),
    toDate: getTodayFormatted()
  })

  const [adjustmentEntries, setAdjustmentEntries] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(null)

  const filterTypes = [
    'All',
    'By Voucher',
    'By Adjustment Type', 
    'By Date Range',
    'By Status'
  ]

  const adjustmentTypes = [
    'All Types',
    'Damage Stock',
    'Lost Stock',
    'Expired Stock',
    'Stock Increase',
    'Stock Decrease',
    'Correction Entry',
    'Theft',
    'Fire Damage',
    'Promotional Giveaway',
    'Return to Supplier',
    'Quality Issue'
  ]

  const statusOptions = [
    'All Status',
    'draft',
    'completed',
    'cancelled'
  ]

  useEffect(() => {
    // Auto-load today's data on mount
    handleGetReport()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDateChange = (field, value) => {
    const formattedDate = formatDateForDisplay(value)
    handleInputChange(field, formattedDate)
  }

  const handleGetReport = async () => {
    try {
      setLoading(true)
      
      // Parse dates from DD/MM/YYYY format
      const fromDate = parseDisplayDate(formData.fromDate)
      const toDate = parseDisplayDate(formData.toDate)
      
      // Validate dates
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        alert('Please enter valid dates')
        return
      }
      
      if (fromDate > toDate) {
        alert('From date cannot be later than to date')
        return
      }

      // Build query parameters
      const params = new URLSearchParams({
        dateFrom: fromDate.toISOString().split('T')[0],
        dateTo: toDate.toISOString().split('T')[0],
        page: 1,
        limit: 1000 // Get all records for client-side filtering
      })

      // Add optional filters
      if (formData.adjustmentType && formData.adjustmentType !== 'All Types') {
        params.append('adjustmentType', formData.adjustmentType)
      }

      if (formData.status && formData.status !== 'All Status') {
        params.append('status', formData.status)
      }

      console.log('Fetching adjustments with params:', params.toString())

      const response = await fetch(`${API_BASE}/report`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Adjustments result:', result)

      if (result.success && result.data) {
        setAdjustmentEntries(result.data)
        setFilteredEntries(result.data)
        setShowTable(true)
        setCurrentPage(1)

        // Fetch stats
        await fetchStats(fromDate, toDate)
      } else {
        throw new Error(result.error || 'Failed to fetch adjustments')
      }

    } catch (error) {
      console.error('Error fetching adjustments:', error)
      alert(`Error loading adjustment records: ${error.message}`)
      setAdjustmentEntries([])
      setFilteredEntries([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async (fromDate, toDate) => {
    try {
      const params = new URLSearchParams({
        dateFrom: fromDate.toISOString().split('T')[0],
        dateTo: toDate.toISOString().split('T')[0]
      })

      const response = await fetch(`${API_BASE}/report/stats`)
      const result = await response.json()

      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (!showTable) return
    
    if (searchTerm.trim() === '') {
      setFilteredEntries(adjustmentEntries)
    } else {
      const filtered = adjustmentEntries.filter(entry =>
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.narration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.adjustmentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.items?.some(item => 
          item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      setFilteredEntries(filtered)
      setCurrentPage(1)
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(adjustmentEntries)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Adjustment Record Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #0f766e;
              padding-bottom: 10px;
            }
            .header h1 {
              color: #0f766e;
              margin: 5px 0;
            }
            .filters {
              margin-bottom: 20px;
              background: #f0f0f0;
              padding: 10px;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 11px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            th { 
              background-color: #0f766e; 
              color: white;
              font-weight: bold; 
            }
            .text-right { text-align: right; }
            .total-row {
              font-weight: bold;
              background-color: #e6f7f5;
              border-top: 3px solid #0f766e;
            }
            .status-completed { 
              background-color: #d1fae5; 
              color: #065f46; 
              padding: 2px 8px; 
              border-radius: 4px;
              display: inline-block;
            }
            .status-draft { 
              background-color: #fef3c7; 
              color: #92400e; 
              padding: 2px 8px; 
              border-radius: 4px;
              display: inline-block;
            }
            .status-cancelled { 
              background-color: #fee2e2; 
              color: #991b1b; 
              padding: 2px 8px; 
              border-radius: 4px;
              display: inline-block;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Adjustment Record Report</h1>
            <p>Comprehensive Inventory Adjustment History</p>
          </div>
          <div class="filters">
            <p><strong>Report Type:</strong> ${formData.recordType}</p>
            <p><strong>Period:</strong> ${formData.fromDate} to ${formData.toDate}</p>
            ${formData.adjustmentType && formData.adjustmentType !== 'All Types' ? `<p><strong>Adjustment Type:</strong> ${formData.adjustmentType}</p>` : ''}
            ${formData.status && formData.status !== 'All Status' ? `<p><strong>Status:</strong> ${formData.status}</p>` : ''}
            <p><strong>Generated on:</strong> ${new Date().toLocaleString('en-IN')}</p>
            <p><strong>Total Records:</strong> ${filteredEntries.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Voucher No</th>
                <th>Adjustment Type</th>
                <th>Items</th>
                <th>Narration</th>
                <th class="text-right">Amount (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${formatISOToDisplay(entry.entryDate)}</td>
                  <td><strong>${entry.voucherNo}</strong></td>
                  <td>${entry.adjustmentType}</td>
                  <td>${entry.items?.length || 0} item(s)</td>
                  <td>${entry.narration || '-'}</td>
                  <td class="text-right">₹${entry.subTotal.toFixed(2)}</td>
                  <td><span class="status-${entry.status}">${entry.status.toUpperCase()}</span></td>
                </tr>
              `).join('')}
              ${filteredEntries.length > 0 ? `
                <tr class="total-row">
                  <td colspan="5" class="text-right"><strong>TOTAL AMOUNT:</strong></td>
                  <td class="text-right"><strong>₹${filteredEntries.reduce((sum, entry) => sum + entry.subTotal, 0).toFixed(2)}</strong></td>
                  <td></td>
                </tr>
              ` : ''}
            </tbody>
          </table>
          ${stats ? `
            <div style="margin-top: 30px; page-break-before: auto;">
              <h3 style="color: #0f766e; border-bottom: 2px solid #0f766e; padding-bottom: 5px;">Summary Statistics</h3>
              <table style="width: 50%; margin-top: 10px;">
                <tr>
                  <td><strong>Total Adjustments:</strong></td>
                  <td class="text-right">${stats.totalAdjustments}</td>
                </tr>
                <tr>
                  <td><strong>Total Value:</strong></td>
                  <td class="text-right">₹${stats.totalValue.toFixed(2)}</td>
                </tr>
              </table>
            </div>
          ` : ''}
          <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
            <p>This is a computer-generated report from Inventory Management System</p>
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
      ['Date', 'Voucher No', 'Adjustment Type', 'Items Count', 'Narration', 'Amount', 'Status', 'Created At'],
      ...filteredEntries.map(entry => [
        formatISOToDisplay(entry.entryDate),
        entry.voucherNo,
        entry.adjustmentType,
        entry.items?.length || 0,
        entry.narration || '',
        entry.subTotal.toFixed(2),
        entry.status,
        new Date(entry.createdAt).toLocaleString('en-IN')
      ]),
      ['', '', '', '', 'TOTAL:', filteredEntries.reduce((sum, entry) => sum + entry.subTotal, 0).toFixed(2), '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `adjustment_record_${formatDateForInput(formData.fromDate)}_to_${formatDateForInput(formData.toDate)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // View details
  const handleViewDetails = (entry) => {
    const itemsList = entry.items?.map((item, index) => 
      `${index + 1}. ${item.itemName} - Qty: ${item.quantity} ${item.unit} @ ₹${item.rate} = ₹${item.total.toFixed(2)}`
    ).join('\n') || 'No items'

    alert(`
📋 Adjustment Details

Voucher No: ${entry.voucherNo}
Date: ${formatISOToDisplay(entry.entryDate)}
Type: ${entry.adjustmentType}
Status: ${entry.status.toUpperCase()}

Items:
${itemsList}

Narration: ${entry.narration || 'N/A'}

Sub Total: ₹${entry.subTotal.toFixed(2)}
Created: ${new Date(entry.createdAt).toLocaleString('en-IN')}
    `)
  }

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this adjustment record?\n\nThis will reverse the stock changes.')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('✅ Adjustment cancelled successfully!')
        // Refresh the report
        await handleGetReport()
      } else {
        throw new Error(result.error || 'Failed to cancel adjustment')
      }
    } catch (error) {
      console.error('Error cancelling adjustment:', error)
      alert(`❌ Error: ${error.message}`)
    }
  }

  // Set date range shortcuts
  const setDateRange = (days) => {
    const today = new Date()
    const fromDate = new Date(today)
    fromDate.setDate(today.getDate() - days)
    
    setFormData(prev => ({
      ...prev,
      fromDate: formatDateForDisplay(fromDate.toISOString().split('T')[0]),
      toDate: getTodayFormatted()
    }))
  }

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  // Calculate total amount
  const totalAmount = filteredEntries.reduce((sum, entry) => 
    sum + (entry.subTotal || 0), 0
  )

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg flex items-center gap-2">
            📊 Adjustment Record
          </h2>
          <p className="text-xs text-teal-50 mt-1">View and manage all inventory adjustment records</p>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            {/* Filter Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Filter Type</label>
              <select 
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.filterType}
                onChange={(e) => handleInputChange('filterType', e.target.value)}
              >
                {filterTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Adjustment Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Adjustment Type</label>
              <select 
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.adjustmentType}
                onChange={(e) => handleInputChange('adjustmentType', e.target.value)}
              >
                {adjustmentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
              <select 
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">From Date</label>
              <input 
                type="date"
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formatDateForInput(formData.fromDate)}
                onChange={(e) => handleDateChange('fromDate', e.target.value)}
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">To Date</label>
              <input 
                type="date"
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formatDateForInput(formData.toDate)}
                onChange={(e) => handleDateChange('toDate', e.target.value)}
              />
            </div>

            {/* Report Button */}
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          {/* Date Range Shortcuts */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={() => setDateRange(0)}
              className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              📅 Today
            </button>
            <button 
              onClick={() => setDateRange(7)}
              className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              📅 Last 7 Days
            </button>
            <button 
              onClick={() => setDateRange(30)}
              className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              📅 Last 30 Days
            </button>
            <button 
              onClick={() => setDateRange(90)}
              className="text-xs px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
            >
              📅 Last 90 Days
            </button>
          </div>

          {/* Current Date Range Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">
                📆 Selected Date Range: <span className="font-bold">{formData.fromDate} to {formData.toDate}</span>
              </span>
              {stats && (
                <span className="text-sm font-medium text-blue-900">
                  💰 Total Value: <span className="font-bold">₹{stats.totalValue.toFixed(2)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Adjustment Record Report */}
      {showTable && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                📋 Adjustment Record Report
                {filteredEntries.length > 0 && (
                  <span className="text-sm font-normal text-gray-500">
                    ({filteredEntries.length} records)
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-teal-500 transition-colors"
                  title="Search"
                >
                  🔍
                </button>
                <button 
                  onClick={handleExport}
                  disabled={filteredEntries.length === 0}
                  className="p-2 border-2 border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export to CSV"
                >
                  📤
                </button>
                <button 
                  onClick={handlePrint}
                  disabled={filteredEntries.length === 0}
                  className="p-2 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  placeholder="Search by voucher no, narration, adjustment type, status, or item name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
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

            {/* Results Summary */}
            <div className="mb-4 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-700">📊 Total Records:</span>
                  <span className="font-bold text-teal-700 ml-2">{filteredEntries.length}</span>
                </div>
                <div>
                  <span className="text-gray-700">📅 Period:</span>
                  <span className="font-medium text-teal-700 ml-2">{formData.fromDate} to {formData.toDate}</span>
                </div>
                <div>
                  <span className="text-gray-700">💰 Total Amount:</span>
                  <span className="font-bold text-teal-700 ml-2">₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                  <tr>
                    <th className="border border-teal-500 px-3 py-2 text-left text-xs font-semibold">Date</th>
                    <th className="border border-teal-500 px-3 py-2 text-left text-xs font-semibold">Voucher No</th>
                    <th className="border border-teal-500 px-3 py-2 text-left text-xs font-semibold">Adjustment Type</th>
                    <th className="border border-teal-500 px-3 py-2 text-center text-xs font-semibold">Items</th>
                    <th className="border border-teal-500 px-3 py-2 text-left text-xs font-semibold">Narration</th>
                    <th className="border border-teal-500 px-3 py-2 text-right text-xs font-semibold">Amount (₹)</th>
                    <th className="border border-teal-500 px-3 py-2 text-center text-xs font-semibold">Status</th>
                    <th className="border border-teal-500 px-3 py-2 text-center text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="border border-gray-300 px-3 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                          <p className="text-gray-600 font-medium">Loading adjustment records...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentEntries.length > 0 ? (
                    <>
                      {currentEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-teal-50 transition-colors">
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            {formatISOToDisplay(entry.entryDate)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs font-bold text-blue-600">
                            {entry.voucherNo}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded font-semibold">
                              {entry.adjustmentType}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs font-medium">
                            {entry.items?.length || 0} item(s)
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-xs">
                            <span className="line-clamp-2" title={entry.narration}>
                              {entry.narration || '-'}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-red-600">
                            ₹{entry.subTotal.toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              entry.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : entry.status === 'draft'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {entry.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <div className="flex gap-2 justify-center">
                              <button 
                                onClick={() => handleViewDetails(entry)}
                                className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-1 rounded transition-colors"
                                title="View Details"
                              >
                                👁️
                              </button>
                              {entry.status !== 'cancelled' && (
                                <button 
                                  onClick={() => handleDeleteEntry(entry._id)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1 rounded transition-colors"
                                  title="Cancel Adjustment"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {/* Summary Row */}
                      <tr className="bg-gradient-to-r from-gray-100 to-gray-200 font-bold border-t-4 border-teal-600">
                        <td colSpan="5" className="border border-gray-400 px-3 py-3 text-right text-sm">
                          <span className="text-teal-700">📊 TOTAL AMOUNT:</span>
                        </td>
                        <td className="border border-gray-400 px-3 py-3 text-right text-sm text-red-700">
                          ₹{totalAmount.toFixed(2)}
                        </td>
                        <td colSpan="2" className="border border-gray-400"></td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan="8" className="border border-gray-300 px-3 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-6xl">📋</div>
                          <p className="text-lg font-medium">
                            {searchTerm ? 'No matching records found' : 'No adjustment records found'}
                          </p>
                          <p className="text-sm">
                            {searchTerm ? 'Try adjusting your search terms' : 'Try changing the date range or filters'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
                  className="border-2 border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                  {filteredEntries.length === 0 
                    ? '0-0 of 0' 
                    : `${startIndex + 1}-${Math.min(endIndex, filteredEntries.length)} of ${filteredEntries.length}`
                  }
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                  >
                    ⏮
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    ◀
                  </button>
                  <span className="px-4 py-1.5 bg-teal-50 border-2 border-teal-300 rounded-lg text-teal-700 font-semibold">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    ▶
                  </button>
                  <button 
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                  >
                    ⏭
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
