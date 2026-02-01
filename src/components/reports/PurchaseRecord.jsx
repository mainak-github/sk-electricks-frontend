'use client'

import { useState } from 'react'

export default function PurchaseRecord() {
  const [filterType, setFilterType] = useState('All')
  const [recordType, setRecordType] = useState('without Item')
  const [fromDate, setFromDate] = useState('24/08/2025')
  const [toDate, setToDate] = useState('24/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample purchase record data with Indian business context
  const [purchaseRecordData] = useState([
    { 
      id: 1, 
      sl: 1, 
      date: '24/08/2025',
      purchaseNo: 'PUR-2025-001',
      supplierName: 'Tata Steel Limited',
      productService: 'Raw Materials - Steel Sheets',
      quantity: 100,
      unitPrice: 15000.00,
      totalAmount: 1500000.00,
      gstAmount: 270000.00,
      finalAmount: 1770000.00,
      paymentStatus: 'Paid',
      purchasedBy: 'Rajesh Kumar'
    },
    { 
      id: 2, 
      sl: 2, 
      date: '23/08/2025',
      purchaseNo: 'PUR-2025-002',
      supplierName: 'L&T Construction Equipment',
      productService: 'Heavy Machinery Parts',
      quantity: 25,
      unitPrice: 45000.00,
      totalAmount: 1125000.00,
      gstAmount: 202500.00,
      finalAmount: 1327500.00,
      paymentStatus: 'Pending',
      purchasedBy: 'Priya Singh'
    },
    { 
      id: 3, 
      sl: 3, 
      date: '22/08/2025',
      purchaseNo: 'PUR-2025-003',
      supplierName: 'Bharat Electronics Ltd',
      productService: 'Electronic Components',
      quantity: 500,
      unitPrice: 2500.00,
      totalAmount: 1250000.00,
      gstAmount: 225000.00,
      finalAmount: 1475000.00,
      paymentStatus: 'Partial',
      purchasedBy: 'Amit Sharma'
    },
    { 
      id: 4, 
      sl: 4, 
      date: '21/08/2025',
      purchaseNo: 'PUR-2025-004',
      supplierName: 'Hindustan Petroleum Corp',
      productService: 'Industrial Chemicals',
      quantity: 200,
      unitPrice: 8500.00,
      totalAmount: 1700000.00,
      gstAmount: 306000.00,
      finalAmount: 2006000.00,
      paymentStatus: 'Paid',
      purchasedBy: 'Sneha Reddy'
    },
    { 
      id: 5, 
      sl: 5, 
      date: '20/08/2025',
      purchaseNo: 'PUR-2025-005',
      supplierName: 'Godrej Industries',
      productService: 'Manufacturing Equipment',
      quantity: 15,
      unitPrice: 125000.00,
      totalAmount: 1875000.00,
      gstAmount: 337500.00,
      finalAmount: 2212500.00,
      paymentStatus: 'Overdue',
      purchasedBy: 'Vikram Patel'
    },
    { 
      id: 6, 
      sl: 6, 
      date: '19/08/2025',
      purchaseNo: 'PUR-2025-006',
      supplierName: 'Mahindra & Mahindra',
      productService: 'Vehicle Fleet',
      quantity: 8,
      unitPrice: 275000.00,
      totalAmount: 2200000.00,
      gstAmount: 396000.00,
      finalAmount: 2596000.00,
      paymentStatus: 'Paid',
      purchasedBy: 'Anita Gupta'
    },
    { 
      id: 7, 
      sl: 7, 
      date: '18/08/2025',
      purchaseNo: 'PUR-2025-007',
      supplierName: 'Asian Paints Ltd',
      productService: 'Industrial Paints & Coatings',
      quantity: 300,
      unitPrice: 3200.00,
      totalAmount: 960000.00,
      gstAmount: 172800.00,
      finalAmount: 1132800.00,
      paymentStatus: 'Pending',
      purchasedBy: 'Rajesh Khanna'
    },
    { 
      id: 8, 
      sl: 8, 
      date: '17/08/2025',
      purchaseNo: 'PUR-2025-008',
      supplierName: 'Larsen & Toubro',
      productService: 'Construction Materials',
      quantity: 75,
      unitPrice: 18000.00,
      totalAmount: 1350000.00,
      gstAmount: 243000.00,
      finalAmount: 1593000.00,
      paymentStatus: 'Partial',
      purchasedBy: 'Meera Joshi'
    },
    { 
      id: 9, 
      sl: 9, 
      date: '16/08/2025',
      purchaseNo: 'PUR-2025-009',
      supplierName: 'Reliance Industries',
      productService: 'Petrochemical Products',
      quantity: 120,
      unitPrice: 12500.00,
      totalAmount: 1500000.00,
      gstAmount: 270000.00,
      finalAmount: 1770000.00,
      paymentStatus: 'Paid',
      purchasedBy: 'Suresh Nair'
    },
    { 
      id: 10, 
      sl: 10, 
      date: '15/08/2025',
      purchaseNo: 'PUR-2025-010',
      supplierName: 'Wipro Infrastructure',
      productService: 'IT Infrastructure Setup',
      quantity: 1,
      unitPrice: 2500000.00,
      totalAmount: 2500000.00,
      gstAmount: 450000.00,
      finalAmount: 2950000.00,
      paymentStatus: 'Paid',
      purchasedBy: 'Kavitha Menon'
    }
  ])

  const [filteredData, setFilteredData] = useState(purchaseRecordData)

  // Filter options for purchase record
  const filterTypeOptions = [
    'All',
    'Paid',
    'Pending',
    'Partial',
    'Overdue',
    'Cancelled'
  ]

  const recordTypeOptions = [
    'without Item',
    'with Item'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalAmount = filteredData.reduce((sum, item) => sum + item.totalAmount, 0)
  const totalGstAmount = filteredData.reduce((sum, item) => sum + item.gstAmount, 0)
  const totalFinalAmount = filteredData.reduce((sum, item) => sum + item.finalAmount, 0)
  const paidAmount = filteredData.filter(item => item.paymentStatus === 'Paid').reduce((sum, item) => sum + item.finalAmount, 0)
  const pendingAmount = filteredData.filter(item => item.paymentStatus === 'Pending' || item.paymentStatus === 'Partial' || item.paymentStatus === 'Overdue').reduce((sum, item) => sum + item.finalAmount, 0)

  const handleGetReport = () => {
    console.log('Generating purchase record with filters:', {
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
    let filtered = purchaseRecordData
    
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
        item.paymentStatus.toLowerCase() === filterType.toLowerCase()
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
      setFilteredData(purchaseRecordData)
    } else {
      const filtered = purchaseRecordData.filter(entry =>
        entry.purchaseNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.productService.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.purchasedBy.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(purchaseRecordData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Purchase Record</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            .paid { color: #10b981; font-weight: bold; }
            .pending { color: #f59e0b; font-weight: bold; }
            .partial { color: #3b82f6; font-weight: bold; }
            .overdue { color: #ef4444; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Purchase Record</h1>
          <p>Filter: ${filterType} | Record Type: ${recordType}</p>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Purchase No</th>
                <th>Supplier Name</th>
                <th>Product/Service</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
                <th>GST Amount</th>
                <th>Final Amount</th>
                <th>Payment Status</th>
                <th>Purchased By</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.date}</td>
                  <td>${entry.purchaseNo}</td>
                  <td>${entry.supplierName}</td>
                  <td>${entry.productService}</td>
                  <td>${entry.quantity}</td>
                  <td class="amount">₹${entry.unitPrice.toFixed(2)}</td>
                  <td class="amount">₹${entry.totalAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.gstAmount.toFixed(2)}</td>
                  <td class="amount">₹${entry.finalAmount.toFixed(2)}</td>
                  <td>${entry.paymentStatus}</td>
                  <td>${entry.purchasedBy}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="7"><strong>Grand Total :</strong></td>
                <td class="amount"><strong>₹${totalAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalGstAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalFinalAmount.toFixed(2)}</strong></td>
                <td colspan="2"></td>
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
      ['SL', 'Date', 'Purchase No', 'Supplier Name', 'Product/Service', 'Quantity', 'Unit Price', 'Total Amount', 'GST Amount', 'Final Amount', 'Payment Status', 'Purchased By'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.date,
        entry.purchaseNo,
        entry.supplierName,
        entry.productService,
        entry.quantity,
        entry.unitPrice.toFixed(2),
        entry.totalAmount.toFixed(2),
        entry.gstAmount.toFixed(2),
        entry.finalAmount.toFixed(2),
        entry.paymentStatus,
        entry.purchasedBy
      ]),
      ['Grand Total', '', '', '', '', '', '', totalAmount.toFixed(2), totalGstAmount.toFixed(2), totalFinalAmount.toFixed(2), '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'purchase_record.csv'
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
          <h2 className="font-medium text-lg">Purchase Record</h2>
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
            <h3 className="text-lg font-medium">Purchase Record</h3>
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
                placeholder="Search by purchase no, supplier name, product/service, payment status or purchased by..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Purchase No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[200px]">Supplier Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[180px]">Product/Service</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Qty</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Unit Price</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Total Amount</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">GST Amount</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Final Amount</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Payment Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Purchased By</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs">{entry.date}</td>
                        <td className="py-2 px-3 text-xs font-medium text-blue-600">{entry.purchaseNo}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.supplierName}</td>
                        <td className="py-2 px-3 text-xs">{entry.productService}</td>
                        <td className="py-2 px-3 text-xs text-center">{entry.quantity}</td>
                        <td className="py-2 px-3 text-xs text-right">₹{entry.unitPrice.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-purple-600">
                          ₹{entry.totalAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-orange-600">
                          ₹{entry.gstAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-bold text-green-600">
                          ₹{entry.finalAmount.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                            entry.paymentStatus === 'Pending' ? 'bg-orange-100 text-orange-800' :
                            entry.paymentStatus === 'Partial' ? 'bg-blue-100 text-blue-800' :
                            entry.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.paymentStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs">{entry.purchasedBy}</td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="7">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-purple-600">₹{totalAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-orange-600">₹{totalGstAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-green-600">₹{totalFinalAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right" colSpan="2"></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="12" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Purchases:</span>
                <div className="text-lg font-bold text-blue-600">{totalEntries}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Purchase Amount:</span>
                <div className="text-lg font-bold text-purple-600">₹{totalAmount.toFixed(2)}</div>
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
                <span className="font-medium text-gray-600">Paid Amount:</span>
                <div className="text-lg font-bold text-green-600">₹{paidAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Outstanding Amount:</span>
                <div className="text-lg font-bold text-red-600">₹{pendingAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Payment Rate:</span>
                <div className="text-lg font-bold text-indigo-600">{totalFinalAmount > 0 ? ((paidAmount / totalFinalAmount) * 100).toFixed(1) : '0.0'}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}