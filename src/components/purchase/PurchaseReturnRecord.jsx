'use client'

import { useState } from 'react'

export default function PurchaseReturnRecord() {
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

  const [purchaseReturnEntries, setPurchaseReturnEntries] = useState([
    {
      id: 1,
      date: '2025-08-01',
      supplier: 'ABC Suppliers Ltd',
      returnNo: 'RET-2025-001',
      originalInvoice: 'INV-2025-001',
      particulars: 'Defective Office Supplies - Returned Items',
      category: 'Office Supplies',
      location: 'Main Warehouse',
      user: 'John Doe',
      amount: '2,500.00',
      reason: 'Damaged goods',
      status: 'Processed',
      type: 'without item'
    },
    {
      id: 2,
      date: '2025-08-03',
      supplier: 'Tech Solutions Inc',
      returnNo: 'RET-2025-002',
      originalInvoice: 'INV-2025-002',
      particulars: 'Computer Hardware - Faulty Laptops',
      category: 'IT Equipment',
      location: 'IT Department',
      user: 'Jane Smith',
      amount: '45,000.00',
      reason: 'Hardware malfunction',
      status: 'Pending',
      type: 'with item'
    },
    {
      id: 3,
      date: '2025-08-05',
      supplier: 'Global Manufacturing Co',
      returnNo: 'RET-2025-003',
      originalInvoice: 'INV-2025-003',
      particulars: 'Raw Materials - Substandard Steel Sheets',
      category: 'Raw Materials',
      location: 'Factory Floor',
      user: 'Ahmed Khan',
      amount: '15,200.00',
      reason: 'Quality issues',
      status: 'Processed',
      type: 'with item'
    },
    {
      id: 4,
      date: '2025-08-07',
      supplier: 'Industrial Supplies Co',
      returnNo: 'RET-2025-004',
      originalInvoice: 'INV-2025-004',
      particulars: 'Safety Equipment - Wrong Specifications',
      category: 'Safety Equipment',
      location: 'Safety Department',
      user: 'David Wilson',
      amount: '5,300.00',
      reason: 'Wrong specifications',
      status: 'In Progress',
      type: 'without item'
    },
    {
      id: 5,
      date: '2025-08-10',
      supplier: 'Office Furniture Ltd',
      returnNo: 'RET-2025-005',
      originalInvoice: 'INV-2025-005',
      particulars: 'Office Chairs - Color Mismatch',
      category: 'Furniture',
      location: 'Main Office',
      user: 'Sarah Johnson',
      amount: '18,750.00',
      reason: 'Color mismatch',
      status: 'Processed',
      type: 'with item'
    },
    {
      id: 6,
      date: '2025-08-12',
      supplier: 'Chemical Supplies Inc',
      returnNo: 'RET-2025-006',
      originalInvoice: 'INV-2025-006',
      particulars: 'Chemical Products - Expired Items',
      category: 'Chemicals',
      location: 'Chemical Storage',
      user: 'Mike Brown',
      amount: '8,900.00',
      reason: 'Expired products',
      status: 'Rejected',
      type: 'without item'
    },
    {
      id: 7,
      date: '2025-08-14',
      supplier: 'Today\'s Supplier',
      returnNo: 'RET-2025-007',
      originalInvoice: 'INV-2025-007',
      particulars: 'Today\'s Return - Test Items',
      category: 'Test Category',
      location: 'Test Location',
      user: 'Test User',
      amount: '3,500.00',
      reason: 'Testing purposes',
      status: 'Processed',
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
    'By Supplier',
    'By Item',
    'By Group', 
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
      
      const filtered = purchaseReturnEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        const dateInRange = entryDate >= fromDate && entryDate <= toDate
        
        // Filter by record type
        const typeMatch = entry.type === formData.recordType
        
        return dateInRange && typeMatch
      })
      
      setFilteredEntries(filtered)
      setShowTable(true)
      setCurrentPage(1)
      console.log('Generating purchase return report for:', formData)
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
        entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <title>Purchase Return Record Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0f766e; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Purchase Return Record Report</h1>
          <p>Filter Type: ${formData.filterType}</p>
          <p>Record Type: ${formData.recordType}</p>
          <p>Period: ${formData.fromDate} to ${formData.toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Supplier</th>
                <th>Return No</th>
                <th>Original Invoice</th>
                <th>Particulars</th>
                <th>Category</th>
                <th>Location</th>
                <th>User</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.date}</td>
                  <td>${entry.supplier}</td>
                  <td>${entry.returnNo}</td>
                  <td>${entry.originalInvoice}</td>
                  <td>${entry.particulars}</td>
                  <td>${entry.category}</td>
                  <td>${entry.location}</td>
                  <td>${entry.user}</td>
                  <td class="text-right">${entry.amount} BDT</td>
                  <td>${entry.reason}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
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
      ['Date', 'Supplier', 'Return No', 'Original Invoice', 'Particulars', 'Category', 'Location', 'User', 'Amount', 'Reason', 'Status'],
      ...filteredEntries.map(entry => [
        entry.date,
        entry.supplier,
        entry.returnNo,
        entry.originalInvoice,
        entry.particulars,
        entry.category,
        entry.location,
        entry.user,
        entry.amount,
        entry.reason,
        entry.status
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'purchase_return_record.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase return record?')) {
      const updatedEntries = purchaseReturnEntries.filter(entry => entry.id !== id)
      setPurchaseReturnEntries(updatedEntries)
      
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
          <h2 className="font-medium text-lg">Purchase Return Record</h2>
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

      {/* Purchase Return Record Report */}
      {showTable && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Purchase Return Record Report</h3>
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
                  placeholder="Search by supplier, return no, invoice, particulars, category, reason, or status..."
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
              Showing {filteredEntries.length} return records for {formData.recordType} purchases from {formData.fromDate} to {formData.toDate}
            </div>

            {/* Table Headers */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                  <div>Date</div>
                  <div>Supplier</div>
                  <div>Return No</div>
                  <div>Original Invoice</div>
                  <div>Particulars</div>
                  <div>Category</div>
                  <div>Location</div>
                  <div>User</div>
                  <div className="text-right">Amount</div>
                  <div>Reason</div>
                  <div>Status</div>
                  <div>Actions</div>
                </div>

                {/* Table Rows */}
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-12 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                      <div>{new Date(entry.date).toLocaleDateString('en-GB')}</div>
                      <div className="font-medium text-gray-700">{entry.supplier}</div>
                      <div className="font-medium text-red-600">{entry.returnNo}</div>
                      <div className="font-medium text-teal-600">{entry.originalInvoice}</div>
                      <div className="truncate" title={entry.particulars}>{entry.particulars}</div>
                      <div>{entry.category}</div>
                      <div>{entry.location}</div>
                      <div>{entry.user}</div>
                      <div className="text-right font-medium text-red-600">
                        -{entry.amount} BDT
                      </div>
                      <div className="truncate" title={entry.reason}>{entry.reason}</div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.status === 'Processed' 
                            ? 'bg-green-100 text-green-800' 
                            : entry.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
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
                  <div className="grid grid-cols-12 gap-2 text-xs py-3 border-t-2 border-red-600 bg-red-50 font-semibold">
                    <div className="col-span-8 text-right">TOTAL RETURN AMOUNT:</div>
                    <div className="text-right text-red-600">
                      -{totalAmount.toLocaleString('en-BD', { minimumFractionDigits: 2 })} BDT
                    </div>
                    <div className="col-span-3"></div>
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