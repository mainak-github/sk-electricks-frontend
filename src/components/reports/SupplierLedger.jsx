'use client'

import { useState, useMemo } from 'react'

export default function SupplierLedger() {
  const [filterType, setFilterType] = useState('All')
  const [supplierFilter, setSupplierFilter] = useState('Select Supplier')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)
  
  // Convert to proper date format for input fields
  const formatDateForInput = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }
  
  const formatDateForDisplay = (dateStr) => {
    const date = new Date(dateStr)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
  
  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  
  const [fromDate, setFromDate] = useState(todayStr)
  const [toDate, setToDate] = useState(todayStr)

  // Sample supplier ledger data
  const [supplierData] = useState([
    {
      id: 1,
      sl: 1,
      date: '2025-08-20',
      supplierName: 'ABC Suppliers Ltd',
      contactNo: '01777159969',
      address: 'Dhaka',
      opening: 15000.00,
      purchaseAmount: 250000.00,
      payment: 240000.00,
      received: 0.00,
      return: 5000.00,
      balance: 20000.00
    },
    {
      id: 2,
      sl: 2,
      date: '2025-08-20',
      supplierName: 'Prime Trading Co',
      contactNo: '01711458962',
      address: 'Chittagong',
      opening: 8000.00,
      purchaseAmount: 180000.00,
      payment: 175000.00,
      received: 0.00,
      return: 3000.00,
      balance: 10000.00
    },
    {
      id: 3,
      sl: 3,
      date: '2025-08-19',
      supplierName: 'Metro Wholesale',
      contactNo: '01912345678',
      address: 'Sylhet',
      opening: 0.00,
      purchaseAmount: 120000.00,
      payment: 130000.00,
      received: 0.00,
      return: 0.00,
      balance: -10000.00
    },
    {
      id: 4,
      sl: 4,
      date: '2025-08-19',
      supplierName: 'Global Import Export',
      contactNo: '+95123132121',
      address: 'Rajshahi',
      opening: 25000.00,
      purchaseAmount: 300000.00,
      payment: 280000.00,
      received: 0.00,
      return: 8000.00,
      balance: 37000.00
    },
    {
      id: 5,
      sl: 5,
      date: '2025-08-18',
      supplierName: 'Delta Suppliers',
      contactNo: '01612302221',
      address: 'Khulna',
      opening: 12000.00,
      purchaseAmount: 95000.00,
      payment: 90000.00,
      received: 0.00,
      return: 2000.00,
      balance: 15000.00
    },
    // Additional sample data for better testing
    {
      id: 6,
      sl: 6,
      date: '2025-08-15',
      supplierName: 'Tech Solutions',
      contactNo: '01876543210',
      address: 'Dhaka',
      opening: 5000.00,
      purchaseAmount: 75000.00,
      payment: 70000.00,
      received: 0.00,
      return: 1000.00,
      balance: 9000.00
    },
    {
      id: 7,
      sl: 7,
      date: '2025-08-10',
      supplierName: 'Premium Goods',
      contactNo: '01987654321',
      address: 'Chittagong',
      opening: 20000.00,
      purchaseAmount: 150000.00,
      payment: 160000.00,
      received: 0.00,
      return: 5000.00,
      balance: 5000.00
    }
  ])

  // Filter options for date range
  const dateFilterOptions = [
    'All',
    'Today',
    'This Week',
    'This Month',
    'Custom Range'
  ]

  // Filter options for suppliers
  const supplierOptions = [
    'Select Supplier',
    'ABC Suppliers Ltd',
    'Prime Trading Co',
    'Metro Wholesale', 
    'Global Import Export',
    'Delta Suppliers',
    'Tech Solutions',
    'Premium Goods'
  ]

  // Date filtering logic
  const getDateRange = (filterType) => {
    const now = new Date()
    let startDate, endDate

    switch (filterType) {
      case 'Today':
        startDate = endDate = now.toISOString().split('T')[0]
        break
      case 'This Week':
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 6)
        startDate = startOfWeek.toISOString().split('T')[0]
        endDate = endOfWeek.toISOString().split('T')[0]
        break
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        break
      case 'Custom Range':
        return { startDate: fromDate, endDate: toDate }
      default:
        return null
    }
    
    return { startDate, endDate }
  }

  // Auto-update date fields when filter type changes
  const handleFilterTypeChange = (newFilterType) => {
    setFilterType(newFilterType)
    
    if (newFilterType !== 'Custom Range') {
      const dateRange = getDateRange(newFilterType)
      if (dateRange) {
        setFromDate(dateRange.startDate)
        setToDate(dateRange.endDate)
      }
    }
  }

  // Use useMemo to filter data based on search term, supplier selection, and date filters
  const filteredData = useMemo(() => {
    let filtered = supplierData;
    
    // Filter by supplier selection
    if (supplierFilter !== 'Select Supplier') {
      filtered = filtered.filter(entry => entry.supplierName === supplierFilter);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(entry =>
        entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.contactNo.includes(searchTerm) ||
        entry.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by date range
    if (filterType !== 'All') {
      const dateRange = getDateRange(filterType)
      if (dateRange) {
        const { startDate, endDate } = dateRange
        filtered = filtered.filter(entry => {
          return entry.date >= startDate && entry.date <= endDate
        })
      }
    }
    
    return filtered;
  }, [supplierData, searchTerm, supplierFilter, filterType, fromDate, toDate]);

  const handleGetReport = () => {
    console.log('Generating supplier report:', {
      filterType,
      supplierFilter,
      fromDate,
      toDate,
      dateRange: getDateRange(filterType)
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    setShowSearch(false)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
  }

  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce((acc, entry) => {
      acc.totalOpening += entry.opening
      acc.totalPurchase += entry.purchaseAmount
      acc.totalPayment += entry.payment
      acc.totalReceived += entry.received
      acc.totalReturn += entry.return
      acc.totalBalance += entry.balance
      return acc
    }, {
      totalOpening: 0,
      totalPurchase: 0,
      totalPayment: 0,
      totalReceived: 0,
      totalReturn: 0,
      totalBalance: 0,
      count: filteredData.length
    })
  }, [filteredData])

  // Print functionality with proper date formatting
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Supplier Ledger Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0d9488; }
            .amount { text-align: right; }
            .header-info { margin: 20px 0; }
            .totals { background-color: #f9f9f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Supplier Ledger Report</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Period: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}</p>
            <p>Filter Type: ${filterType}</p>
            <p>Supplier: ${supplierFilter}</p>
            <p>Total Records: ${totals.count}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Supplier Name</th>
                <th>Contact No</th>
                <th>Address</th>
                <th>Opening</th>
                <th>Purchase Amount</th>
                <th>Payment</th>
                <th>Received</th>
                <th>Return</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${formatDateForDisplay(entry.date)}</td>
                  <td>${entry.supplierName}</td>
                  <td>${entry.contactNo}</td>
                  <td>${entry.address}</td>
                  <td class="amount">${entry.opening.toFixed(2)}</td>
                  <td class="amount">${entry.purchaseAmount.toFixed(2)}</td>
                  <td class="amount">${entry.payment.toFixed(2)}</td>
                  <td class="amount">${entry.received.toFixed(2)}</td>
                  <td class="amount">${entry.return.toFixed(2)}</td>
                  <td class="amount">${entry.balance.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="totals">
                <td colspan="5">TOTAL</td>
                <td class="amount">${totals.totalOpening.toFixed(2)}</td>
                <td class="amount">${totals.totalPurchase.toFixed(2)}</td>
                <td class="amount">${totals.totalPayment.toFixed(2)}</td>
                <td class="amount">${totals.totalReceived.toFixed(2)}</td>
                <td class="amount">${totals.totalReturn.toFixed(2)}</td>
                <td class="amount">${totals.totalBalance.toFixed(2)}</td>
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

  // Export functionality with proper date formatting
  const handleExport = () => {
    const csvContent = [
      ['SL', 'Date', 'Supplier Name', 'Contact No', 'Address', 'Opening', 'Purchase Amount', 'Payment', 'Received', 'Return', 'Balance'],
      ...filteredData.map((entry) => [
        entry.sl,
        formatDateForDisplay(entry.date),
        entry.supplierName,
        entry.contactNo,
        entry.address,
        entry.opening.toFixed(2),
        entry.purchaseAmount.toFixed(2),
        entry.payment.toFixed(2),
        entry.received.toFixed(2),
        entry.return.toFixed(2),
        entry.balance.toFixed(2)
      ]),
      ['TOTAL', '', '', '', '', totals.totalOpening.toFixed(2), totals.totalPurchase.toFixed(2), totals.totalPayment.toFixed(2), totals.totalReceived.toFixed(2), totals.totalReturn.toFixed(2), totals.totalBalance.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supplier_ledger_${formatDateForDisplay(fromDate)}_to_${formatDateForDisplay(toDate)}.csv`
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
          <h2 className="font-medium text-lg">Supplier Ledger</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Filter</label>
              <select 
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => handleFilterTypeChange(e.target.value)}
              >
                {dateFilterOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Supplier</label>
              <select 
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
              >
                {supplierOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
              <input 
                type="date"
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value)
                  setFilterType('Custom Range')
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input 
                type="date"
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value)
                  setFilterType('Custom Range')
                }}
              />
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                className="bg-teal-600 text-white px-6 py-2 mt-7 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                📊 GET REPORT
              </button>
            </div>
          </div>

          {/* Date Range Info */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Selected Period:</strong> {formatDateForDisplay(fromDate)} to {formatDateForDisplay(toDate)}
              {filterType !== 'All' && filterType !== 'Custom Range' && (
                <span className="ml-2 text-blue-600">({filterType})</span>
              )}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Supplier:</strong> {supplierFilter}
            </p>
          </div>
        </div>
      </div>

      {/* Report Results - Only show when showReport is true */}
      {showReport && (
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Supplier Ledger Report</h3>
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

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-700">Opening</h4>
              <p className="text-lg font-bold text-blue-900">{totals.totalOpening.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-700">Purchase</h4>
              <p className="text-lg font-bold text-green-900">{totals.totalPurchase.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-700">Payment</h4>
              <p className="text-lg font-bold text-purple-900">{totals.totalPayment.toFixed(2)}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-700">Received</h4>
              <p className="text-lg font-bold text-yellow-900">{totals.totalReceived.toFixed(2)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-orange-700">Return</h4>
              <p className="text-lg font-bold text-orange-900">{totals.totalReturn.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-red-700">Balance</h4>
              <p className="text-lg font-bold text-red-900">{totals.totalBalance.toFixed(2)}</p>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by supplier name, contact, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button 
                onClick={() => {}}
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
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">SL</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Date</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Supplier Name</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Contact No</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Address</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Opening</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Purchase Amount</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Payment</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Received</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Return</th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 text-xs">{entry.sl}</td>
                      <td className="py-2 px-2 text-xs">{formatDateForDisplay(entry.date)}</td>
                      <td className="py-2 px-2 text-xs font-medium">{entry.supplierName}</td>
                      <td className="py-2 px-2 text-xs">{entry.contactNo}</td>
                      <td className="py-2 px-2 text-xs">{entry.address}</td>
                      <td className="py-2 px-2 text-xs text-right">{entry.opening.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-medium">{entry.purchaseAmount.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right">{entry.payment.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right">{entry.received.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right">{entry.return.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-medium">
                        <span className={entry.balance > 0 ? 'text-red-600' : entry.balance < 0 ? 'text-green-600' : 'text-gray-900'}>
                          {entry.balance.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-8 text-gray-500">
                      {searchTerm || supplierFilter !== 'Select Supplier' ? 'No matching records found' : 'No data available for the selected date range'}
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