'use client'

import { useState } from 'react'

export default function ManufacturingRecord() {
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
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  // Parse DD/MM/YYYY to Date object
  const parseDisplayDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return new Date(year, month - 1, day)
  }

  const [formData, setFormData] = useState({
    filterType: 'All',
    recordType: 'without item',
    fromDate: getTodayFormatted(),
    toDate: getTodayFormatted()
  })

  const [manufacturingEntries, setManufacturingEntries] = useState([
    {
      id: 1,
      date: '2025-08-01',
      product: 'Aluminum Sheets',
      batchNo: 'MFG-2025-001',
      particulars: 'Sheet Metal Production - Grade A Aluminum',
      category: 'Metal Processing',
      location: 'Production Floor A',
      user: 'John Doe',
      quantity: '500 pcs',
      amount: '45,500.00',
      status: 'Completed',
      type: 'with item'
    },
    {
      id: 2,
      date: '2025-08-03',
      product: 'Assembly Services',
      batchNo: 'MFG-2025-002',
      particulars: 'Custom Assembly Work - Electronic Components',
      category: 'Assembly',
      location: 'Assembly Line 1',
      user: 'Jane Smith',
      quantity: '200 units',
      amount: '125,000.00',
      status: 'In Progress',
      type: 'without item'
    },
    {
      id: 3,
      date: '2025-08-05',
      product: 'CNC Machined Parts',
      batchNo: 'MFG-2025-003',
      particulars: 'Precision Machining - Steel Components',
      category: 'Machining',
      location: 'CNC Workshop',
      user: 'Ahmed Khan',
      quantity: '150 pcs',
      amount: '75,200.00',
      status: 'Quality Check',
      type: 'with item'
    },
    {
      id: 4,
      date: '2025-08-07',
      product: 'Finishing Services',
      batchNo: 'MFG-2025-004',
      particulars: 'Surface Treatment - Anodizing Process',
      category: 'Finishing',
      location: 'Finishing Bay',
      user: 'Maria Rodriguez',
      quantity: '300 pcs',
      amount: '22,500.00',
      status: 'Pending',
      type: 'without item'
    },
    {
      id: 5,
      date: '2025-08-10',
      product: 'Welded Structures',
      batchNo: 'MFG-2025-005',
      particulars: 'Structural Welding - Steel Framework',
      category: 'Welding',
      location: 'Welding Station',
      user: 'David Wilson',
      quantity: '50 units',
      amount: '95,300.00',
      status: 'Completed',
      type: 'with item'
    },
    {
      id: 6,
      date: '2025-08-12',
      product: 'Quality Testing',
      batchNo: 'MFG-2025-006',
      particulars: 'Quality Assurance Testing Services',
      category: 'Quality Control',
      location: 'QC Laboratory',
      user: 'Admin User',
      quantity: '100 tests',
      amount: '18,600.00',
      status: 'In Progress',
      type: 'without item'
    },
    {
      id: 7,
      date: '2025-08-17',
      product: 'Today\'s Production',
      batchNo: 'MFG-2025-007',
      particulars: 'Today\'s Manufacturing - Test Batch',
      category: 'Test Production',
      location: 'Test Area',
      user: 'Test User',
      quantity: '75 pcs',
      amount: '35,000.00',
      status: 'In Progress',
      type: 'without item'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filterTypes = [
    'All',
    'By Product',
    'By Batch',
    'By Category',
    'By Location',
    'By User'
  ]

  const recordTypes = ['with item', 'without item']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDateChange = (field, value) => {
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const formattedDate = formatDateForDisplay(value)
    handleInputChange(field, formattedDate)
  }

  const handleGetReport = () => {
    try {
      // Parse dates from DD/MM/YYYY format
      const fromDate = parseDisplayDate(formData.fromDate)
      const toDate = parseDisplayDate(formData.toDate)
      
      // Validate dates
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        alert('Please enter valid dates in DD/MM/YYYY format')
        return
      }
      
      if (fromDate > toDate) {
        alert('From date cannot be later than to date')
        return
      }
      
      const filtered = manufacturingEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        const dateInRange = entryDate >= fromDate && entryDate <= toDate
        
        // Filter by record type
        const typeMatch = entry.type === formData.recordType
        
        return dateInRange && typeMatch
      })
      
      setFilteredEntries(filtered)
      setShowTable(true)
      setCurrentPage(1)
      console.log('Generating manufacturing report for:', formData)
      console.log('Filtered entries:', filtered.length)
    } catch (error) {
      console.error('Error filtering entries:', error)
      alert('Error processing dates. Please check date format.')
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (!showTable) return
    
    if (searchTerm.trim() === '') {
      handleGetReport() // Re-apply original filters
    } else {
      const filtered = filteredEntries.filter(entry =>
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    if (showTable) {
      handleGetReport() // Re-apply original filters
    }
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Manufacturing Record Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Fayullah Factory</div>
            <div class="report-title">Manufacturing Record Report</div>
            <div>Filter Type: ${formData.filterType}</div>
            <div>Record Type: ${formData.recordType}</div>
            <div>Period: ${formData.fromDate} to ${formData.toDate}</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredEntries.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>Batch No</th>
                <th>Particulars</th>
                <th>Category</th>
                <th>Location</th>
                <th>User</th>
                <th>Quantity</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString('en-GB')}</td>
                  <td>${entry.product}</td>
                  <td>${entry.batchNo}</td>
                  <td>${entry.particulars}</td>
                  <td>${entry.category}</td>
                  <td>${entry.location}</td>
                  <td>${entry.user}</td>
                  <td>${entry.quantity}</td>
                  <td class="text-right">₹ ${entry.amount}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Manufacturing Report - Fayullah Factory Management System
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
      ['Fayullah Factory - Manufacturing Record Report'],
      [`Filter Type: ${formData.filterType}`],
      [`Record Type: ${formData.recordType}`],
      [`Period: ${formData.fromDate} to ${formData.toDate}`],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [],
      ['Date', 'Product', 'Batch No', 'Particulars', 'Category', 'Location', 'User', 'Quantity', 'Amount', 'Status'],
      ...filteredEntries.map(entry => [
        new Date(entry.date).toLocaleDateString('en-GB'),
        entry.product,
        entry.batchNo,
        entry.particulars,
        entry.category,
        entry.location,
        entry.user,
        entry.quantity,
        entry.amount,
        entry.status
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manufacturing_record_${formData.fromDate.replace(/\//g, '-')}_to_${formData.toDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this manufacturing record?')) {
      const updatedEntries = manufacturingEntries.filter(entry => entry.id !== id)
      setManufacturingEntries(updatedEntries)
      
      // Update filtered entries if table is shown
      if (showTable) {
        const fromDate = parseDisplayDate(formData.fromDate)
        const toDate = parseDisplayDate(formData.toDate)
        
        const filtered = updatedEntries.filter(entry => {
          const entryDate = new Date(entry.date)
          const dateInRange = entryDate >= fromDate && entryDate <= toDate
          const typeMatch = entry.type === formData.recordType
          
          return dateInRange && typeMatch
        })
        
        setFilteredEntries(filtered)
      }
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
    sum + parseFloat(entry.amount.replace(',', '')), 0
  )

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Manufacturing Record</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Filter Type */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Filter Type</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.filterType}
                onChange={(e) => handleInputChange('filterType', e.target.value)}
              >
                {filterTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Record Type */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Record Type</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.recordType}
                onChange={(e) => handleInputChange('recordType', e.target.value)}
              >
                {recordTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">From Date</label>
              <input 
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formatDateForInput(formData.fromDate)}
                onChange={(e) => handleDateChange('fromDate', e.target.value)}
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">To Date</label>
              <input 
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formatDateForInput(formData.toDate)}
                onChange={(e) => handleDateChange('toDate', e.target.value)}
              />
            </div>

            {/* Report Button */}
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                🔍 REPORT
              </button>
            </div>
          </div>

          {/* Date Range Shortcuts */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={() => setDateRange(0)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Today
            </button>
            <button 
              onClick={() => setDateRange(7)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setDateRange(30)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setDateRange(90)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Last 90 Days
            </button>
          </div>

          {/* Current Date Range Display */}
          <div className="text-sm text-gray-600 mb-4">
            Selected Date Range: <span className="font-medium">{formData.fromDate} to {formData.toDate}</span>
          </div>
        </div>
      </div>

      {/* Manufacturing Record Report */}
      {showTable && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Manufacturing Record Report</h3>
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
                  placeholder="Search by product, batch no, particulars, category, or status..."
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

            {/* Results Summary */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredEntries.length} records for {formData.recordType} manufacturing from {formData.fromDate} to {formData.toDate}
            </div>

            {/* Table Headers */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-11 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                  <div>Date</div>
                  <div>Product</div>
                  <div>Batch No</div>
                  <div>Particulars</div>
                  <div>Category</div>
                  <div>Location</div>
                  <div>User</div>
                  <div>Quantity</div>
                  <div className="text-right">Amount</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>

                {/* Table Rows */}
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-11 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                      <div>{new Date(entry.date).toLocaleDateString('en-GB')}</div>
                      <div className="font-medium text-gray-700">{entry.product}</div>
                      <div className="font-medium text-teal-600">{entry.batchNo}</div>
                      <div className="truncate" title={entry.particulars}>{entry.particulars}</div>
                      <div>{entry.category}</div>
                      <div>{entry.location}</div>
                      <div>{entry.user}</div>
                      <div className="font-medium text-blue-600">{entry.quantity}</div>
                      <div className="text-right font-medium text-green-600">
                        ₹ {entry.amount}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : entry.status === 'Quality Check'
                            ? 'bg-blue-100 text-blue-800'
                            : entry.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.status === 'In Progress'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No matching records found' : 'Sorry, no matching records found'}
                  </div>
                )}

                {/* Summary Row */}
                {filteredEntries.length > 0 && (
                  <div className="grid grid-cols-11 gap-2 text-xs py-3 border-t-2 border-teal-600 bg-teal-50 font-semibold">
                    <div className="col-span-8 text-right">TOTAL AMOUNT:</div>
                    <div className="text-right text-green-600">
                      ₹ {totalAmount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="col-span-2"></div>
                  </div>
                )}
              </div>
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
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {filteredEntries.length === 0 
                    ? '0-0 of 0' 
                    : `${startIndex + 1}-${Math.min(endIndex, filteredEntries.length)} of ${filteredEntries.length}`
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