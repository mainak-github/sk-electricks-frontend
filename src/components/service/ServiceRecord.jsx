'use client'

import { useState } from 'react'

export default function ServiceRecord() {
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

  const [serviceRecords, setServiceRecords] = useState([
    {
      id: 1,
      date: '2025-08-18',
      voucherNo: 'SV-001',
      customerName: 'tanyir',
      institution: 'mwt',
      itemName: 'Hand Watch',
      quantity: '3 Pcs',
      rate: '1,000.00',
      discount: '0%',
      GST: '0%',
      total: '3,000.00',
      serviceBy: 'SOFT TASK',
      type: 'Regular Service'
    },
    {
      id: 2,
      date: '2025-08-17',
      voucherNo: 'SV-002',
      customerName: 'Another Customer',
      institution: 'ABC Corp',
      itemName: 'Button',
      quantity: '3 Pcs',
      rate: '15.00',
      discount: '8.89%',
      GST: '0%',
      total: '41.00',
      serviceBy: 'SOFT TASK',
      type: 'Repair Service'
    },
    {
      id: 3,
      date: '2025-08-16',
      voucherNo: 'SV-003',
      customerName: 'Test Client',
      institution: 'Test Company',
      itemName: 'Mobile Phone',
      quantity: '1 Pcs',
      rate: '25,000.00',
      discount: '5%',
      GST: '15%',
      total: '27,187.50',
      serviceBy: 'Tech Team',
      type: 'Premium Service'
    }
  ])

  const [filteredRecords, setFilteredRecords] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filterTypes = ['All', 'Regular Service', 'Repair Service', 'Premium Service', 'Maintenance Service']
  const recordTypes = ['with item', 'without item', 'summary only']

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
      
      const filtered = serviceRecords.filter(record => {
        const recordDate = new Date(record.date)
        const dateInRange = recordDate >= fromDate && recordDate <= toDate
        
        // Filter by type if not "All"
        if (formData.filterType === 'All') {
          return dateInRange
        }
        
        return record.type === formData.filterType && dateInRange
      })
      
      setFilteredRecords(filtered)
      setShowTable(true)
      setCurrentPage(1) // Reset to first page
      console.log('Generating report for:', formData)
      console.log('Filtered records:', filtered.length)
    } catch (error) {
      console.error('Error filtering records:', error)
      alert('Error processing dates. Please check date format.')
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (!showTable) return
    
    if (searchTerm.trim() === '') {
      handleGetReport() // Re-apply original filters
    } else {
      const filtered = filteredRecords.filter(record =>
        record.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.serviceBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredRecords(filtered)
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
          <title>Service Record Report</title>
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
          <h1>Service Record Report</h1>
          <p>Filter Type: ${formData.filterType}</p>
          <p>Record Type: ${formData.recordType}</p>
          <p>Period: ${formData.fromDate} to ${formData.toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Voucher No</th>
                <th>Customer Name</th>
                <th>Institution</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Discount</th>
                <th>GST</th>
                <th>Total</th>
                <th>Service By</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${filteredRecords.map(record => `
                <tr>
                  <td>${new Date(record.date).toLocaleDateString('en-GB')}</td>
                  <td>${record.voucherNo}</td>
                  <td>${record.customerName}</td>
                  <td>${record.institution}</td>
                  <td>${record.itemName}</td>
                  <td>${record.quantity}</td>
                  <td class="text-right">${record.rate}</td>
                  <td class="text-right">${record.discount}</td>
                  <td class="text-right">${record.GST}</td>
                  <td class="text-right">${record.total}</td>
                  <td>${record.serviceBy}</td>
                  <td>${record.type}</td>
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
      ['Date', 'Voucher No', 'Customer Name', 'Institution', 'Item Name', 'Quantity', 'Rate', 'Discount', 'GST', 'Total', 'Service By', 'Type'],
      ...filteredRecords.map(record => [
        new Date(record.date).toLocaleDateString('en-GB'),
        record.voucherNo,
        record.customerName,
        record.institution,
        record.itemName,
        record.quantity,
        record.rate,
        record.discount,
        record.GST,
        record.total,
        record.serviceBy,
        record.type
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'service_record.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete record
  const handleDeleteRecord = (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      const updatedRecords = serviceRecords.filter(record => record.id !== id)
      setServiceRecords(updatedRecords)
      
      // Update filtered records if table is shown
      if (showTable) {
        const fromDate = parseDisplayDate(formData.fromDate)
        const toDate = parseDisplayDate(formData.toDate)
        
        const filtered = updatedRecords.filter(record => {
          const recordDate = new Date(record.date)
          const dateInRange = recordDate >= fromDate && recordDate <= toDate
          
          if (formData.filterType === 'All') {
            return dateInRange
          }
          
          return record.type === formData.filterType && dateInRange
        })
        
        setFilteredRecords(filtered)
      }
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentRecords = filteredRecords.slice(startIndex, endIndex)

  // Calculate totals
  const totalAmount = filteredRecords.reduce((sum, record) => 
    sum + (parseFloat(record.total.replace(',', '')) || 0), 0
  )

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <h2 className="font-medium text-lg mb-6">Service Record</h2>
          
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
                className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 w-full justify-center"
              >
                🔍 REPORT
              </button>
            </div>
          </div>

          {/* Print Button */}
          <div className="mb-4">
            <button 
              onClick={handlePrint}
              className="p-2 border rounded hover:bg-gray-50 transition-colors"
              title="Print Report"
            >
              🖨️
            </button>
          </div>

          {/* Current Filter Display */}
          <div className="text-sm text-gray-600 mb-4">
            Filter: <span className="font-medium">{formData.filterType}</span>
            <span className="ml-4">
              Record Type: <span className="font-medium">{formData.recordType}</span>
            </span>
            <span className="ml-4">
              Date Range: <span className="font-medium">{formData.fromDate} to {formData.toDate}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Service Record Report */}
      {showTable && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Service Record Report</h3>
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
                  placeholder="Search by voucher, customer, institution, item, service person, or type..."
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
              Showing {filteredRecords.length} records from {formData.fromDate} to {formData.toDate}
              {formData.filterType !== 'All' && ` (Filter: ${formData.filterType})`}
            </div>

            {/* Table Headers */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-13 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                  <div>Date</div>
                  <div>Voucher No</div>
                  <div>Customer</div>
                  <div>Institution</div>
                  <div>Item Name</div>
                  <div>Qty</div>
                  <div className="text-right">Rate</div>
                  <div>Disc%</div>
                  <div>GST%</div>
                  <div className="text-right">Total</div>
                  <div>Service By</div>
                  <div>Type</div>
                  <div>Actions</div>
                </div>

                {/* Table Rows */}
                {currentRecords.length > 0 ? (
                  currentRecords.map((record) => (
                    <div key={record.id} className="grid grid-cols-13 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                      <div>{new Date(record.date).toLocaleDateString('en-GB')}</div>
                      <div className="font-medium text-teal-600">{record.voucherNo}</div>
                      <div className="truncate" title={record.customerName}>{record.customerName}</div>
                      <div className="truncate" title={record.institution}>{record.institution}</div>
                      <div className="truncate" title={record.itemName}>{record.itemName}</div>
                      <div>{record.quantity}</div>
                      <div className="text-right">₹ {record.rate}</div>
                      <div className="text-center">{record.discount}</div>
                      <div className="text-center">{record.GST}</div>
                      <div className="text-right font-medium text-green-600">₹ {record.total}</div>
                      <div>{record.serviceBy}</div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.type === 'Regular Service' 
                            ? 'bg-blue-100 text-blue-800' 
                            : record.type === 'Repair Service'
                            ? 'bg-orange-100 text-orange-800'
                            : record.type === 'Premium Service'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.type}
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
                          onClick={() => handleDeleteRecord(record.id)}
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
                    {searchTerm ? 'No matching records found' : 'No records found for the selected criteria'}
                  </div>
                )}

                {/* Summary Row */}
                {filteredRecords.length > 0 && (
                  <div className="grid grid-cols-13 gap-2 text-xs py-3 border-t-2 border-teal-600 bg-teal-50 font-semibold">
                    <div className="col-span-9 text-right">TOTAL:</div>
                    <div className="text-right text-green-600">
                      ₹ {totalAmount.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
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
                  {filteredRecords.length === 0 
                    ? '0-0 of 0' 
                    : `${startIndex + 1}-${Math.min(endIndex, filteredRecords.length)} of ${filteredRecords.length}`
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