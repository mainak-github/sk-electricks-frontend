'use client'

import { useState, useEffect, useCallback } from 'react'
import url from '../../../url'
export default function CustomerDueBalance() {
  const [filterType, setFilterType] = useState('All Customer')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)
  const [customerData, setCustomerData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filterOptions, setFilterOptions] = useState(['All Customer'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    totalBillAmount: 0,
    totalReceived: 0,
    totalBalance: 0
  })



  // Fetch filter options on component mount
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Fetch filter options from backend
  const fetchFilterOptions = async () => {
    try {
      const response = await fetch(`${url.API_URL}/customers/filter-options`)
      const result = await response.json()

      if (result.success) {
        setFilterOptions(result.data.filterOptions)
      }
    } catch (error) {
      console.error('Error fetching filter options:', error)
      setError('Failed to load filter options')
    }
  }

  // Fetch customers with current filters
  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        filterType,
        search: searchTerm,
        page: currentPage.toString(),
        limit: rowsPerPage.toString(),
        sortBy: 'customerName',
        sortOrder: 'asc'
      })

      const response = await fetch(`${url.API_URL}/customers?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setCustomerData(result.data)
        setFilteredData(result.data)
        setPagination(result.pagination)
      } else {
        throw new Error(result.message || 'Failed to fetch customers')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      setError('Failed to load customer data. Please try again.')
      setCustomerData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }, [filterType, searchTerm, currentPage, rowsPerPage])

  // Fetch due balance report
  const fetchDueBalanceReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        filterType
      })

      const response = await fetch(`${url.API_URL}/customers/due-balance-report?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setFilteredData(result.data)
        setSummary(result.summary)
        setShowReport(true)
        setCurrentPage(1)
        setSearchTerm('')
        setShowSearch(false)
      } else {
        throw new Error(result.message || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error fetching due balance report:', error)
      setError('Failed to generate report. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle get report button
  const handleGetReport = () => {
    console.log('Generating report with filter:', filterType)
    fetchDueBalanceReport()
  }

  // Search functionality
  const handleSearch = () => {
    setCurrentPage(1)
    if (showReport) {
      // If showing report, filter locally
      if (searchTerm.trim() === '') {
        // Re-fetch report data
        fetchDueBalanceReport()
      } else {
        const filtered = customerData.filter(entry =>
          entry.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.contactNo.includes(searchTerm) ||
          entry.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredData(filtered)
      }
    } else {
      // Fetch from server with search term
      fetchCustomers()
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
    if (showReport) {
      fetchDueBalanceReport()
    } else {
      fetchCustomers()
    }
    setShowSearch(false)
  }

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  // Handle rows per page change
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage)
    setCurrentPage(1)
  }

  // Fetch data when dependencies change
  useEffect(() => {
    if (showReport) {
      // Don't auto-fetch when showing report
      return
    }
    fetchCustomers()
  }, [fetchCustomers, showReport])

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Customer Due Balance Report</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #7c3aed;
              padding-bottom: 10px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #7c3aed;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-info {
              font-size: 12px;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 6px; 
              text-align: left; 
              font-size: 10px; 
            }
            th { 
              background-color: #f8f9fa; 
              font-weight: bold;
              text-align: center;
            }
            .amount { 
              text-align: right !important; 
              font-family: monospace;
            }
            .summary {
              margin-top: 20px;
              border: 1px solid #ddd;
              padding: 10px;
              background-color: #f8f9fa;
            }
            .summary-title {
              font-weight: bold;
              margin-bottom: 10px;
            }
            .summary-item {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">SK Electrics</div>
            <div class="report-title">Customer Due Balance Report</div>
            <div class="report-info">
              Generated on: ${new Date().toLocaleString()} | 
              Filter: ${filterType} | 
              Total Records: ${filteredData.length}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Code</th>
                <th>Customer Name</th>
                <th>Contact No</th>
                <th>Address</th>
                <th>Opening</th>
                <th>Bill Amount</th>
                <th>Received</th>
                <th>Payment</th>
                <th>Return</th>
                <th>Discount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td style="text-align: center;">${entry.sl}</td>
                  <td style="font-weight: bold;">${entry.code}</td>
                  <td>${entry.customerName}</td>
                  <td>${entry.contactNo}</td>
                  <td>${entry.address}</td>
                  <td class="amount">${entry.opening.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="amount">${entry.billAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="amount">${entry.received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="amount">${entry.payment.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="amount">${entry.return.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="amount">${entry.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  <td class="amount" style="font-weight: bold; ${entry.balance > 0 ? 'color: red;' : entry.balance < 0 ? 'color: green;' : ''}">${entry.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          ${showReport ? `
            <div class="summary">
              <div class="summary-title">Report Summary</div>
              <div class="summary-item">
                <span>Total Customers:</span>
                <span>${summary.totalCustomers}</span>
              </div>
              <div class="summary-item">
                <span>Total Bill Amount:</span>
                <span>${summary.totalBillAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="summary-item">
                <span>Total Received:</span>
                <span>${summary.totalReceived.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="summary-item">
                <span>Total Outstanding Balance:</span>
                <span style="font-weight: bold;">${summary.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          ` : ''}
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
      ['SL', 'Code', 'Customer Name', 'Contact No', 'Address', 'Opening', 'Bill Amount', 'Received', 'Payment', 'Return', 'Discount', 'Balance'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.code,
        entry.customerName,
        entry.contactNo,
        entry.address,
        entry.opening.toFixed(2),
        entry.billAmount.toFixed(2),
        entry.received.toFixed(2),
        entry.payment.toFixed(2),
        entry.return.toFixed(2),
        entry.discount.toFixed(2),
        entry.balance.toFixed(2)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const BOM = '\uFEFF' // UTF-8 BOM for Excel compatibility
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `customer_due_balance_${filterType.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Get current entries for display (when not showing report with server-side pagination)
  const getCurrentEntries = () => {
    if (showReport) {
      // For reports, handle pagination locally
      const startIndex = (currentPage - 1) * rowsPerPage
      const endIndex = startIndex + rowsPerPage
      return filteredData.slice(startIndex, endIndex)
    } else {
      // For regular customer list, data is already paginated from server
      return filteredData
    }
  }

  const currentEntries = getCurrentEntries()
  const totalPages = showReport ? Math.ceil(filteredData.length / rowsPerPage) : pagination.totalPages
  const totalRecords = showReport ? filteredData.length : pagination.totalRecords

  return (
    <div className="p-4 max-w-full">
      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-800 text-sm">
              <span className="font-medium">Error:</span> {error}
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Customer Due Balance Report</h2>
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
                disabled={loading}
              >
                {filterOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                disabled={loading}
                className="bg-teal-600 text-white mt-7 px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    📊 GET REPORT
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Summary Cards - Show only when report is loaded */}
          {showReport && !loading && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-blue-600 text-sm font-medium">Total Customers</div>
                <div className="text-2xl font-bold text-blue-800">{summary.totalCustomers}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-600 text-sm font-medium">Total Bill Amount</div>
                <div className="text-2xl font-bold text-green-800">₹{summary.totalBillAmount.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-yellow-600 text-sm font-medium">Total Received</div>
                <div className="text-2xl font-bold text-yellow-800">₹{summary.totalReceived.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-red-600 text-sm font-medium">Outstanding Balance</div>
                <div className="text-2xl font-bold text-red-800">₹{summary.totalBalance.toLocaleString('en-IN')}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Results - Show when report is generated or customers are loaded */}
      {(showReport || (!showReport && currentEntries.length > 0)) && (
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              {showReport ? 'Customer Due Balance Report' : 'Customer List'}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 border rounded hover:bg-gray-50 transition-colors ${showSearch ? 'bg-gray-100' : ''}`}
                title="Search"
                disabled={loading}
              >
                🔍
              </button>
              <button 
                onClick={handleExport}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Export to CSV"
                disabled={loading || currentEntries.length === 0}
              >
                📤
              </button>
              <button 
                onClick={handlePrint}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Print"
                disabled={loading || currentEntries.length === 0}
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
                placeholder="Search by customer name, code, contact, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                disabled={loading}
              />
              <button 
                onClick={handleSearch}
                disabled={loading}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                Search
              </button>
              <button 
                onClick={handleClearSearch}
                disabled={loading}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-teal-600 border-t-transparent"></div>
              <span className="ml-2 text-gray-600">Loading data...</span>
            </div>
          )}

          {/* Table - Scrollable */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">SL</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Code</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Customer Name</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Contact No</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Address</th>
                    {showReport && (
                      <>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Opening</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Bill Amount</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Received</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Payment</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Return</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Discount</th>
                        <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Balance</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 text-xs">{entry.sl}</td>
                        <td className="py-2 px-2 text-xs font-medium">{entry.code}</td>
                        <td className="py-2 px-2 text-xs">{entry.customerName}</td>
                        <td className="py-2 px-2 text-xs">{entry.contactNo}</td>
                        <td className="py-2 px-2 text-xs">{entry.address}</td>
                        {showReport && (
                          <>
                            <td className="py-2 px-2 text-xs text-right">{entry.opening?.toFixed(2) || '0.00'}</td>
                            <td className="py-2 px-2 text-xs text-right font-medium">{entry.billAmount?.toFixed(2) || '0.00'}</td>
                            <td className="py-2 px-2 text-xs text-right">{entry.received?.toFixed(2) || '0.00'}</td>
                            <td className="py-2 px-2 text-xs text-right">{entry.payment?.toFixed(2) || '0.00'}</td>
                            <td className="py-2 px-2 text-xs text-right">{entry.return?.toFixed(2) || '0.00'}</td>
                            <td className="py-2 px-2 text-xs text-right">{entry.discount?.toFixed(2) || '0.00'}</td>
                            <td className="py-2 px-2 text-xs text-right font-medium">
                              <span className={entry.balance > 0 ? 'text-red-600' : entry.balance < 0 ? 'text-green-600' : 'text-gray-900'}>
                                {entry.balance?.toFixed(2) || '0.00'}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={showReport ? "12" : "5"} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No matching records found' : 'No data available'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && currentEntries.length > 0 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
                  className="border rounded px-2 py-1"
                  disabled={loading}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {totalRecords === 0 
                    ? '0-0 of 0' 
                    : showReport 
                      ? `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, filteredData.length)} of ${filteredData.length}`
                      : `${(pagination.currentPage - 1) * rowsPerPage + 1}-${Math.min((pagination.currentPage - 1) * rowsPerPage + currentEntries.length, totalRecords)} of ${totalRecords}`
                  }
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => showReport ? setCurrentPage(prev => Math.max(1, prev - 1)) : handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <span className="px-2 py-1 text-sm">
                    {currentPage} / {totalPages}
                  </span>
                  <button 
                    onClick={() => showReport ? setCurrentPage(prev => Math.min(totalPages, prev + 1)) : handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  )
}
