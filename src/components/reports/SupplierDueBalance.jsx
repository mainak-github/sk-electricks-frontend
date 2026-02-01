'use client'

import url from '../../../url'  
import { useState, useEffect, useCallback } from 'react'

export default function SupplierDueBalance() {
  const [filterType, setFilterType] = useState('All Supplier')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)
  const [supplierData, setSupplierData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [filterOptions, setFilterOptions] = useState(['All Supplier'])
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState({
    totalSuppliers: 0,
    totalBillAmount: 0,
    totalPayment: 0,
    totalReceived: 0,
    totalBalance: 0
  })
  const [error, setError] = useState()

  // Fetch filter options on mount
  useEffect(() => {
    fetchFilterOptions()
  }, [])

  // Fetch filter options from backend
  const fetchFilterOptions = async () => {
    try {
      const res = await fetch(`${url.API_URL}/suppliers/filter-options`)
      const result = await res.json()
      if (result.success) {
        setFilterOptions(result.data.filterOptions)
      }
    } catch (error) {
      setError('Failed to load filter options')
    }
  }

  // Fetch supplier list with pagination and filters
  const fetchSuppliers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        filterType,
        search: searchTerm,
        page: currentPage.toString(),
        limit: rowsPerPage.toString()
      })
      const res = await fetch(`${url.API_URL}/suppliers?${params}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      const result = await res.json()
      if (result.success) {
        setSupplierData(result.data)
        setFilteredData(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch suppliers')
      }
    } catch (error) {
      setError('Failed to load suppliers')
      setSupplierData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }, [filterType, searchTerm, currentPage, rowsPerPage])

  // Fetch supplier due balance report
  const fetchDueBalanceReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ filterType })
      const res = await fetch(`${url.API_URL}/suppliers/due-balance-report?${params}`)
      if (!res.ok) throw new Error(`HTTP error ${res.status}`)
      const result = await res.json()
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
      setError('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  // Handle GET REPORT button
  const handleGetReport = () => {
    fetchDueBalanceReport()
  }

  // Search functionality
  const handleSearch = () => {
    setCurrentPage(1)
    if (showReport) {
      if (!searchTerm.trim()) fetchDueBalanceReport()
      else {
        const filtered = filteredData.filter(entry =>
          entry.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.contactNo.includes(searchTerm) ||
          entry.address.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFilteredData(filtered)
      }
    } else {
      fetchSuppliers()
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
    if (showReport) fetchDueBalanceReport()
    else fetchSuppliers()
    setShowSearch(false)
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredData.slice(startIndex, endIndex)

  // Print functionality
  const handlePrint = () => {
    const html = `
      <html>
        <head>
          <title>Supplier Due Balance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
            h1 { text-align: center; color: #7c3aed; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 10px; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .amount { text-align: right; font-family: monospace; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <h1>Supplier Due Balance Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Supplier Name</th>
                <th>Contact No</th>
                <th>Address</th>
                <th>Opening</th>
                <th>Bill Amount</th>
                <th>Payment</th>
                <th>Received</th>
                <th>Return</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(entry => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.supplierName}</td>
                  <td>${entry.contactNo}</td>
                  <td>${entry.address}</td>
                  <td class="amount">${entry.opening?.toFixed(2) || '0.00'}</td>
                  <td class="amount">${entry.billAmount?.toFixed(2) || '0.00'}</td>
                  <td class="amount">${entry.payment?.toFixed(2) || '0.00'}</td>
                  <td class="amount">${entry.received?.toFixed(2) || '0.00'}</td>
                  <td class="amount">${entry.return?.toFixed(2) || '0.00'}</td>
                  <td class="amount" style="font-weight: bold;${entry.balance > 0 ? 'color:red;' : entry.balance < 0 ? 'color:green;' : ''}">${entry.balance?.toFixed(2) || '0.00'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.print()
  }

  // Export CSV
  const handleExport = () => {
    const csvContent = [
      ['SL', 'Supplier Name', 'Contact No', 'Address', 'Opening', 'Bill Amount', 'Payment', 'Received', 'Return', 'Balance'],
      ...filteredData.map(entry => [
        entry.sl,
        entry.supplierName,
        entry.contactNo,
        entry.address,
        entry.opening?.toFixed(2),
        entry.billAmount?.toFixed(2),
        entry.payment?.toFixed(2),
        entry.received?.toFixed(2),
        entry.return?.toFixed(2),
        entry.balance?.toFixed(2)
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supplier_due_balance.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // UI
  return (
    <div className="p-4">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <span className="font-medium text-red-800">Error: </span> {error}
          <button onClick={() => setError(null)} className="ml-4 text-red-600">✕</button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Supplier Due Balance Report</h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
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
                className="bg-teal-600 text-white mt-7 px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                {loading ?  <div className="animate-spin rounded-full h-4 w-4 border border-white border-t-transparent"></div> : <>📊 GET REPORT</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReport && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Supplier Due Balance Report</h3>
              <div className="flex gap-2">
                <button onClick={() => setShowSearch(!showSearch)}
                  className={`p-2 border rounded hover:bg-gray-50 transition-colors${showSearch ? ' bg-gray-100' : ''}`}
                  title="Search"
                  disabled={loading}
                >🔍</button>
                <button onClick={handleExport}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors"
                  title="Export to CSV"
                  disabled={loading || currentEntries.length === 0}
                >📤</button>
                <button onClick={handlePrint}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors"
                  title="Print"
                  disabled={loading || currentEntries.length === 0}
                >🖨️</button>
              </div>
            </div>

            {showSearch && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by supplier name, contact, or address..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button onClick={handleSearch}
                  className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
                >Search</button>
                <button onClick={handleClearSearch}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                >Clear</button>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-blue-600 text-sm font-medium">Total Suppliers</div>
                <div className="text-2xl font-bold text-blue-800">{summary.totalSuppliers}</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-green-600 text-sm font-medium">Total Bill Amount</div>
                <div className="text-2xl font-bold text-green-800">₹{summary.totalBillAmount.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <div className="text-yellow-600 text-sm font-medium">Total Payment</div>
                <div className="text-2xl font-bold text-yellow-800">₹{summary.totalPayment.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="text-red-600 text-sm font-medium">Outstanding Balance</div>
                <div className="text-2xl font-bold text-red-800">₹{summary.totalBalance.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">SL</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Supplier Name</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Contact No</th>
                    <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Address</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Opening</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Bill Amount</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Payment</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Received</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Return</th>
                    <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map(entry => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 text-xs">{entry.sl}</td>
                        <td className="py-2 px-2 text-xs">{entry.supplierName}</td>
                        <td className="py-2 px-2 text-xs">{entry.contactNo}</td>
                        <td className="py-2 px-2 text-xs">{entry.address}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.opening?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.billAmount?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.payment?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.received?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-2 text-xs text-right">{entry.return?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-2 text-xs text-right font-medium">
                          <span className={entry.balance > 0 ? 'text-red-600' : entry.balance < 0 ? 'text-green-600' : 'text-gray-900'}>
                            {entry.balance?.toFixed(2) || '0.00'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-8 text-gray-500">
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
                  onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
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
                  {filteredData.length === 0
                    ? '0-0 of 0'
                    : `${startIndex + 1}-${Math.min(endIndex, filteredData.length)} of ${filteredData.length}`
                  }
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >‹</button>
                  <span className="px-2 py-1 text-sm">{currentPage} / {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || totalPages === 0 || loading}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >›</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
