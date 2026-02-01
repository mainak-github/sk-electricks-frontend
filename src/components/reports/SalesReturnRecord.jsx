'use client'

import { useState } from 'react'

export default function SalesReturnRecord() {
  const [filterType, setFilterType] = useState('All')
  const [recordType, setRecordType] = useState('without Item')
  const [fromDate, setFromDate] = useState('24/08/2025')
  const [toDate, setToDate] = useState('24/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample sales return record data with Indian business context
  const [salesReturnRecordData] = useState([
    { 
      id: 1, 
      sl: 1, 
      date: '24/08/2025',
      returnNo: 'RET-2025-001',
      originalInvoiceNo: 'INV-2025-001',
      customerName: 'Reliance Industries Ltd',
      productService: 'Industrial Equipment Package',
      returnQuantity: 2,
      unitPrice: 85000.00,
      returnAmount: 170000.00,
      gstAmount: 30600.00,
      finalReturnAmount: 200600.00,
      returnReason: 'Defective Items',
      returnStatus: 'Approved',
      processedBy: 'Rahul Sharma'
    },
    { 
      id: 2, 
      sl: 2, 
      date: '23/08/2025',
      returnNo: 'RET-2025-002',
      originalInvoiceNo: 'INV-2025-002',
      customerName: 'Tata Consultancy Services',
      productService: 'Software Licensing',
      returnQuantity: 3,
      unitPrice: 15000.00,
      returnAmount: 45000.00,
      gstAmount: 8100.00,
      finalReturnAmount: 53100.00,
      returnReason: 'Customer Requested',
      returnStatus: 'Pending',
      processedBy: 'Priya Patel'
    },
    { 
      id: 3, 
      sl: 3, 
      date: '22/08/2025',
      returnNo: 'RET-2025-003',
      originalInvoiceNo: 'INV-2025-003',
      customerName: 'Infosys Limited',
      productService: 'IT Consulting Services',
      returnQuantity: 1,
      unitPrice: 25000.00,
      returnAmount: 25000.00,
      gstAmount: 4500.00,
      finalReturnAmount: 29500.00,
      returnReason: 'Wrong Specification',
      returnStatus: 'Rejected',
      processedBy: 'Amit Kumar'
    },
    { 
      id: 4, 
      sl: 4, 
      date: '21/08/2025',
      returnNo: 'RET-2025-004',
      originalInvoiceNo: 'INV-2025-004',
      customerName: 'Wipro Technologies',
      productService: 'Training Programs',
      returnQuantity: 5,
      unitPrice: 8000.00,
      returnAmount: 40000.00,
      gstAmount: 7200.00,
      finalReturnAmount: 47200.00,
      returnReason: 'Quality Issues',
      returnStatus: 'Approved',
      processedBy: 'Sneha Reddy'
    },
    { 
      id: 5, 
      sl: 5, 
      date: '20/08/2025',
      returnNo: 'RET-2025-005',
      originalInvoiceNo: 'INV-2025-005',
      customerName: 'Mahindra Group',
      productService: 'Manufacturing Components',
      returnQuantity: 8,
      unitPrice: 12000.00,
      returnAmount: 96000.00,
      gstAmount: 17280.00,
      finalReturnAmount: 113280.00,
      returnReason: 'Damaged in Transit',
      returnStatus: 'Processing',
      processedBy: 'Vikram Singh'
    },
    { 
      id: 6, 
      sl: 6, 
      date: '19/08/2025',
      returnNo: 'RET-2025-006',
      originalInvoiceNo: 'INV-2025-006',
      customerName: 'Tech Mahindra',
      productService: 'Digital Transformation',
      returnQuantity: 1,
      unitPrice: 175000.00,
      returnAmount: 175000.00,
      gstAmount: 31500.00,
      finalReturnAmount: 206500.00,
      returnReason: 'Not as Ordered',
      returnStatus: 'Approved',
      processedBy: 'Anita Gupta'
    },
    { 
      id: 7, 
      sl: 7, 
      date: '18/08/2025',
      returnNo: 'RET-2025-007',
      originalInvoiceNo: 'INV-2025-007',
      customerName: 'Asian Paints Ltd',
      productService: 'Marketing Solutions',
      returnQuantity: 3,
      unitPrice: 18000.00,
      returnAmount: 54000.00,
      gstAmount: 9720.00,
      finalReturnAmount: 63720.00,
      returnReason: 'Change in Requirements',
      returnStatus: 'Pending',
      processedBy: 'Rajesh Khanna'
    },
    { 
      id: 8, 
      sl: 8, 
      date: '17/08/2025',
      returnNo: 'RET-2025-008',
      originalInvoiceNo: 'INV-2025-008',
      customerName: 'Bharti Airtel',
      productService: 'Telecommunication Setup',
      returnQuantity: 2,
      unitPrice: 45000.00,
      returnAmount: 90000.00,
      gstAmount: 16200.00,
      finalReturnAmount: 106200.00,
      returnReason: 'Technical Issues',
      returnStatus: 'Processing',
      processedBy: 'Meera Joshi'
    },
    { 
      id: 9, 
      sl: 9, 
      date: '16/08/2025',
      returnNo: 'RET-2025-009',
      originalInvoiceNo: 'INV-2025-009',
      customerName: 'HDFC Bank',
      productService: 'Financial Software',
      returnQuantity: 1,
      unitPrice: 95000.00,
      returnAmount: 95000.00,
      gstAmount: 17100.00,
      finalReturnAmount: 112100.00,
      returnReason: 'License Expired',
      returnStatus: 'Rejected',
      processedBy: 'Suresh Nair'
    },
    { 
      id: 10, 
      sl: 10, 
      date: '15/08/2025',
      returnNo: 'RET-2025-010',
      originalInvoiceNo: 'INV-2025-010',
      customerName: 'Godrej Industries',
      productService: 'Supply Chain Management',
      returnQuantity: 2,
      unitPrice: 55000.00,
      returnAmount: 110000.00,
      gstAmount: 19800.00,
      finalReturnAmount: 129800.00,
      returnReason: 'Duplicate Order',
      returnStatus: 'Approved',
      processedBy: 'Kavitha Menon'
    }
  ])

  const [filteredData, setFilteredData] = useState(salesReturnRecordData)

  // Filter options for sales return record
  const filterTypeOptions = [
    'All',
    'Approved',
    'Pending',
    'Processing',
    'Rejected',
    'Cancelled'
  ]

  const recordTypeOptions = [
    'without Item',
    'with Item'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalReturnAmount = filteredData.reduce((sum, item) => sum + item.returnAmount, 0)
  const totalGstAmount = filteredData.reduce((sum, item) => sum + item.gstAmount, 0)
  const totalFinalAmount = filteredData.reduce((sum, item) => sum + item.finalReturnAmount, 0)
  const approvedAmount = filteredData.filter(item => item.returnStatus === 'Approved').reduce((sum, item) => sum + item.finalReturnAmount, 0)
  const pendingAmount = filteredData.filter(item => item.returnStatus === 'Pending' || item.returnStatus === 'Processing').reduce((sum, item) => sum + item.finalReturnAmount, 0)

  const handleGetReport = () => {
    console.log('Generating sales return record with filters:', {
      filterType,
      recordType,
      fromDate,
      toDate
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Apply filter based on filterType and date range
    let filtered = salesReturnRecordData
    
    // Date filtering logic
    if (fromDate && toDate) {
      const fromDateObj = parseDate(fromDate)
      const toDateObj = parseDate(toDate)
      
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.date)
        return itemDate >= fromDateObj && itemDate <= toDateObj
      })
    }
    
    // Status filtering logic
    if (filterType !== 'All') {
      filtered = filtered.filter(item => 
        item.returnStatus.toLowerCase() === filterType.toLowerCase()
      )
    }
    
    setFilteredData(filtered)
    setShowSearch(false)
  }

  // Helper function to parse DD/MM/YYYY date format
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(salesReturnRecordData)
    } else {
      const filtered = salesReturnRecordData.filter(entry =>
        entry.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.originalInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.productService.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.returnStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.returnReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.processedBy.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(salesReturnRecordData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Sales Return Record</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            .approved { color: #10b981; font-weight: bold; }
            .pending { color: #f59e0b; font-weight: bold; }
            .processing { color: #3b82f6; font-weight: bold; }
            .rejected { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Sales Return Record</h1>
          <p>Filter: ${filterType} | Record Type: ${recordType}</p>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Return No</th>
                <th>Original Invoice</th>
                <th>Customer Name</th>
                <th>Product/Service</th>
                <th>Return Qty</th>
                <th>Unit Price</th>
                <th>Return Amount</th>
                <th>GST Amount</th>
                <th>Final Amount</th>
                <th>Return Reason</th>
                <th>Return Status</th>
                <th>Processed By</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.date}</td>
                  <td>${entry.returnNo}</td>
                  <td>${entry.originalInvoiceNo}</td>
                  <td>${entry.customerName}</td>
                  <td>${entry.productService}</td>
                  <td>${entry.returnQuantity}</td>
                  <td class="amount">₹${entry.unitPrice.toFixed(2)}</td>
                  <td class="amount">₹${entry.returnAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.gstAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.finalReturnAmount.toFixed(2)}</td>
                  <td>${entry.returnReason}</td>
                  <td>${entry.returnStatus}</td>
                  <td>${entry.processedBy}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="8"><strong>Grand Total :</strong></td>
                <td class="amount"><strong>₹${totalReturnAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalGstAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalFinalAmount.toFixed(2)}</strong></td>
                <td colspan="3"></td>
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
      ['SL', 'Date', 'Return No', 'Original Invoice', 'Customer Name', 'Product/Service', 'Return Qty', 'Unit Price', 'Return Amount', 'GST Amount', 'Final Amount', 'Return Reason', 'Return Status', 'Processed By'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.date,
        entry.returnNo,
        entry.originalInvoiceNo,
        entry.customerName,
        entry.productService,
        entry.returnQuantity,
        entry.unitPrice.toFixed(2),
        entry.returnAmount.toFixed(2),
        entry.gstAmount.toFixed(2),
        entry.finalReturnAmount.toFixed(2),
        entry.returnReason,
        entry.returnStatus,
        entry.processedBy
      ]),
      ['Grand Total', '', '', '', '', '', '', '', totalReturnAmount.toFixed(2), totalGstAmount.toFixed(2), totalFinalAmount.toFixed(2), '', '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sales_return_record.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (dateStr) => {
    if (!dateStr || !dateStr.includes('/')) return ''
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // Format date for display (DD/MM/YYYY)
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const handleFromDateChange = (e) => {
    const newDate = formatDateForDisplay(e.target.value)
    setFromDate(newDate)
  }

  const handleToDateChange = (e) => {
    const newDate = formatDateForDisplay(e.target.value)
    setToDate(newDate)
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
          <h2 className="font-medium text-lg">Sales Return Record</h2>
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
                {filterTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
              <select 
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={recordType}
                onChange={(e) => setRecordType(e.target.value)}
              >
                {recordTypeOptions.map(option => (
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
                🔍 REPORT
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
            <h3 className="text-lg font-medium">Sales Return Record</h3>
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
                placeholder="Search by return no, invoice no, customer name, product/service, status, reason or processed by..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Return No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Original Invoice</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[180px]">Customer Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[160px]">Product/Service</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Return Qty</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Return Amount</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">GST Amount</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Final Amount</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[130px]">Return Reason</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Return Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Processed By</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs">{entry.date}</td>
                        <td className="py-2 px-3 text-xs font-medium text-blue-600">{entry.returnNo}</td>
                        <td className="py-2 px-3 text-xs font-medium text-indigo-600">{entry.originalInvoiceNo}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.customerName}</td>
                        <td className="py-2 px-3 text-xs">{entry.productService}</td>
                        <td className="py-2 px-3 text-xs text-center">{entry.returnQuantity}</td>
                        <td className="py-2 px-3 text-xs text-right">₹{entry.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-purple-600">
                          ₹{entry.returnAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-orange-600">
                          ₹{entry.gstAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-bold text-green-600">
                          ₹{entry.finalReturnAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs">{entry.returnReason}</td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.returnStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                            entry.returnStatus === 'Pending' ? 'bg-orange-100 text-orange-800' :
                            entry.returnStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            entry.returnStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.returnStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs">{entry.processedBy}</td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="8">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-purple-600">₹{totalReturnAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-orange-600">₹{totalGstAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-green-600">₹{totalFinalAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right" colSpan="3"></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching records found' : 'No data available for selected date range'}
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
                <span className="font-medium text-gray-600">Total Returns:</span>
                <div className="text-lg font-bold text-blue-600">{totalEntries}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Return Amount:</span>
                <div className="text-lg font-bold text-purple-600">₹{totalReturnAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">GST Amount:</span>
                <div className="text-lg font-bold text-orange-600">₹{totalGstAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Final Amount:</span>
                <div className="text-lg font-bold text-green-600">₹{totalFinalAmount.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Approved Amount:</span>
                <div className="text-lg font-bold text-green-600">₹{approvedAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Pending Amount:</span>
                <div className="text-lg font-bold text-red-600">₹{pendingAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Processing Rate:</span>
                <div className="text-lg font-bold text-indigo-600">{totalFinalAmount > 0 ? ((approvedAmount / totalFinalAmount) * 100).toFixed(1) : '0.0'}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}