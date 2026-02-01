'use client'

import { useState } from 'react'

export default function AdvanceCustomerBalance() {
  const [filterType, setFilterType] = useState('All Debtor')
  const [fromDate, setFromDate] = useState('21/08/2025')
  const [toDate, setToDate] = useState('21/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample customer balance data
  const [customerData] = useState([
    { 
      id: 1, 
      sl: 1, 
      customerName: 'Rajesh Kumar', 
      contactNo: '9876543210',
      address: 'New Delhi', 
      received: 45000.00, 
      payment: 42000.00, 
      balance: 3000.00
    },
    { 
      id: 2, 
      sl: 2, 
      customerName: 'Priya Sharma', 
      contactNo: '9845628561',
      address: 'Mumbai', 
      received: 32000.00, 
      payment: 30000.00, 
      balance: 2000.00
    },
    { 
      id: 3, 
      sl: 3, 
      customerName: 'Amit Patel', 
      contactNo: '9811440051',
      address: 'Ahmedabad', 
      received: 28000.00, 
      payment: 28000.00, 
      balance: 0.00
    },
    { 
      id: 4, 
      sl: 4, 
      customerName: 'Sneha Gupta', 
      contactNo: '9555546789',
      address: 'Kolkata', 
      received: 15000.00, 
      payment: 12000.00, 
      balance: 3000.00
    }
  ])

  const [filteredData, setFilteredData] = useState(customerData)

  // Filter options
  const filterOptions = [
    'All Debtor',
    'Positive Balance',
    'Zero Balance',
    'Negative Balance'
  ]

  // Calculate totals
  const totalCustomers = filteredData.length
  const totalReceived = filteredData.reduce((sum, item) => sum + item.received, 0)
  const totalPayment = filteredData.reduce((sum, item) => sum + item.payment, 0)
  const totalBalance = filteredData.reduce((sum, item) => sum + item.balance, 0)
  const positiveBalance = filteredData.filter(item => item.balance > 0).length
  const zeroBalance = filteredData.filter(item => item.balance === 0).length

  const handleGetReport = () => {
    console.log('Generating advance customer balance report with filters:', {
      filterType,
      fromDate,
      toDate
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Apply filter based on filterType
    let filtered = customerData
    if (filterType === 'Positive Balance') {
      filtered = customerData.filter(item => item.balance > 0)
    } else if (filterType === 'Zero Balance') {
      filtered = customerData.filter(item => item.balance === 0)
    } else if (filterType === 'Negative Balance') {
      filtered = customerData.filter(item => item.balance < 0)
    }
    
    setFilteredData(filtered)
    setShowSearch(false)
    // Here you would typically make an API call to get filtered data based on dates and filters
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(customerData)
    } else {
      const filtered = customerData.filter(entry =>
        entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.contactNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.address.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(customerData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Advance Debtor/Customer Balance Report</title>
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
          <h1>Advance Debtor/Customer Balance Report</h1>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Customer Name</th>
                <th>Contact No</th>
                <th>Address</th>
                <th>Received</th>
                <th>Payment</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.customerName}</td>
                  <td>${entry.contactNo}</td>
                  <td>${entry.address}</td>
                  <td class="amount">${entry.received.toFixed(2)}</td>
                  <td class="amount">${entry.payment.toFixed(2)}</td>
                  <td class="amount">${entry.balance.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>Grand Total</strong></td>
                <td class="amount"><strong>${totalReceived.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalPayment.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalBalance.toFixed(2)}</strong></td>
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
      ['SL', 'Customer Name', 'Contact No', 'Address', 'Received', 'Payment', 'Balance'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.customerName,
        entry.contactNo,
        entry.address,
        entry.received.toFixed(2),
        entry.payment.toFixed(2),
        entry.balance.toFixed(2)
      ]),
      ['Grand Total', '', '', '', totalReceived.toFixed(2), totalPayment.toFixed(2), totalBalance.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'advance_customer_balance_report.csv'
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
          <h2 className="font-medium text-lg">Advance Debtor/Customer Balance Report</h2>
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
                🔍 GET REPORT
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
            <h3 className="text-lg font-medium">Advance Debtor/Customer Balance Report</h3>
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
                placeholder="Search by customer name, contact no, or address..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[150px]">Customer Name</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Contact No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[120px]">Address</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Received</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Payment</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.customerName}</td>
                        <td className="py-2 px-3 text-xs text-center font-mono">{entry.contactNo}</td>
                        <td className="py-2 px-3 text-xs">{entry.address}</td>
                        <td className="py-2 px-3 text-xs text-right">₹{entry.received.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-right">₹{entry.payment.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-right">
                          <span className={
                            entry.balance > 0 ? 'text-green-600 font-medium' :
                            entry.balance < 0 ? 'text-red-600 font-medium' :
                            'text-gray-600'
                          }>
                            ₹{entry.balance.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="4">
                        Grand Total
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalReceived.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalPayment.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalBalance.toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Customers:</span>
                <div className="text-lg font-bold text-blue-600">{totalCustomers}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Received:</span>
                <div className="text-lg font-bold text-green-600">₹{totalReceived.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Payment:</span>
                <div className="text-lg font-bold text-orange-600">₹{totalPayment.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Net Balance:</span>
                <div className={`text-lg font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{totalBalance.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Positive Balance:</span>
                <div className="text-lg font-bold text-green-600">{positiveBalance}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Zero Balance:</span>
                <div className="text-lg font-bold text-gray-600">{zeroBalance}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}