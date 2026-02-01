'use client'

import { useState } from 'react'

export default function BranchTransactionPendingList() {
  const [filterType, setFilterType] = useState('By Branch')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample branch transaction pending data
  const [transactionData] = useState([
    { id: 1, sl: 1, branchName: 'Dhaka Branch', transactionType: 'Sales', invoiceNo: 'INV-2024-001', amount: 15000.00, pendingDays: 5, customerName: 'Ahmed Trading', status: 'Pending' },
    { id: 2, sl: 2, branchName: 'Chittagong Branch', transactionType: 'Purchase', invoiceNo: 'PUR-2024-002', amount: 25000.00, pendingDays: 12, customerName: 'Rahman Suppliers', status: 'Pending' },
    { id: 3, sl: 3, branchName: 'Sylhet Branch', transactionType: 'Sales', invoiceNo: 'INV-2024-003', amount: 8500.00, pendingDays: 3, customerName: 'Karim Enterprise', status: 'Pending' },
    { id: 4, sl: 4, branchName: 'Rajshahi Branch', transactionType: 'Sales', invoiceNo: 'INV-2024-004', amount: 32000.00, pendingDays: 8, customerName: 'Modern Traders', status: 'Pending' },
    { id: 5, sl: 5, branchName: 'Khulna Branch', transactionType: 'Purchase', invoiceNo: 'PUR-2024-005', amount: 18500.00, pendingDays: 15, customerName: 'Global Supplies', status: 'Pending' },
    { id: 6, sl: 6, branchName: 'Barisal Branch', transactionType: 'Sales', invoiceNo: 'INV-2024-006', amount: 12000.00, pendingDays: 6, customerName: 'City Commerce', status: 'Pending' },
    { id: 7, sl: 7, branchName: 'Rangpur Branch', transactionType: 'Sales', invoiceNo: 'INV-2024-007', amount: 27500.00, pendingDays: 20, customerName: 'North Trading', status: 'Pending' },
    { id: 8, sl: 8, branchName: 'Comilla Branch', transactionType: 'Purchase', invoiceNo: 'PUR-2024-008', amount: 14000.00, pendingDays: 4, customerName: 'Eastern Suppliers', status: 'Pending' },
    { id: 9, sl: 9, branchName: 'Mymensingh Branch', transactionType: 'Sales', invoiceNo: 'INV-2024-009', amount: 21000.00, pendingDays: 11, customerName: 'Agricultural Traders', status: 'Pending' },
    { id: 10, sl: 10, branchName: 'Jessore Branch', transactionType: 'Sales', invoiceNo: 'INV-2024-010', amount: 16800.00, pendingDays: 7, customerName: 'Southwest Commerce', status: 'Pending' },
    { id: 11, sl: 11, branchName: 'Dhaka Branch', transactionType: 'Purchase', invoiceNo: 'PUR-2024-011', amount: 35000.00, pendingDays: 18, customerName: 'Capital Supplies', status: 'Pending' },
    { id: 12, sl: 12, branchName: 'Chittagong Branch', transactionType: 'Sales', invoiceNo: 'INV-2024-012', amount: 9500.00, pendingDays: 2, customerName: 'Port Trading', status: 'Pending' },
  ])

  const [filteredData, setFilteredData] = useState(transactionData)

  // Filter options
  const filterOptions = [
    'By Branch',
    'By Transaction Type',
    'By Pending Days',
    'By Amount Range'
  ]

  // Calculate totals
  const totalTransactions = filteredData.length
  const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0)
  const salesTransactions = filteredData.filter(item => item.transactionType === 'Sales').length
  const purchaseTransactions = filteredData.filter(item => item.transactionType === 'Purchase').length

  const handleGetReport = () => {
    console.log('Generating branch transaction pending list with filter:', filterType)
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    setFilteredData(transactionData)
    setShowSearch(false)
    // Here you would typically make an API call to get filtered data
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(transactionData)
    } else {
      const filtered = transactionData.filter(entry =>
        entry.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.transactionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(transactionData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Branch Transaction Pending List</title>
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
          <h1>Branch Transaction Pending List</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Branch Name</th>
                <th>Transaction Type</th>
                <th>Invoice No</th>
                <th>Customer Name</th>
                <th>Amount</th>
                <th>Pending Days</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.branchName}</td>
                  <td>${entry.transactionType}</td>
                  <td>${entry.invoiceNo}</td>
                  <td>${entry.customerName}</td>
                  <td class="amount">${entry.amount.toFixed(2)}</td>
                  <td>${entry.pendingDays}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>Total Amount</strong></td>
                <td class="amount"><strong>${totalAmount.toFixed(2)}</strong></td>
                <td colspan="2"><strong>Total: ${totalTransactions} transactions</strong></td>
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
      ['SL', 'Branch Name', 'Transaction Type', 'Invoice No', 'Customer Name', 'Amount', 'Pending Days', 'Status'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.branchName,
        entry.transactionType,
        entry.invoiceNo,
        entry.customerName,
        entry.amount.toFixed(2),
        entry.pendingDays,
        entry.status
      ]),
      ['Total Transactions', totalTransactions, '', '', '', totalAmount.toFixed(2), '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'branch_transaction_pending_list.csv'
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
          <h2 className="font-medium text-lg">Branch Transaction Pending List</h2>
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
            
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                className="bg-teal-600 text-white mt-7 px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                📊 GET REPORT
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
            <h3 className="text-lg font-medium">Branch Transaction Pending List</h3>
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
                placeholder="Search by branch, transaction type, invoice no, or customer..."
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
          <div className="overflow-x-auto max-w-6xl mx-auto border rounded">
            <table className="min-w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">SL</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Branch Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Transaction Type</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Invoice No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[150px]">Customer Name</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Pending Days</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.branchName}</td>
                        <td className="py-2 px-3 text-xs">
                          <span className={entry.transactionType === 'Sales' ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}>
                            {entry.transactionType}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs font-mono">{entry.invoiceNo}</td>
                        <td className="py-2 px-3 text-xs">{entry.customerName}</td>
                        <td className="py-2 px-3 text-xs text-right">₹{entry.amount.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.pendingDays > 15 ? 'bg-red-100 text-red-800' :
                            entry.pendingDays > 7 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {entry.pendingDays} days
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="5">
                        Total Transactions: {totalTransactions}
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold">₹{totalAmount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-center font-bold" colSpan="2">
                        Sales: {salesTransactions} | Purchase: {purchaseTransactions}
                      </td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Transactions:</span>
                <div className="text-lg font-bold text-blue-600">{totalTransactions}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Amount:</span>
                <div className="text-lg font-bold text-green-600">₹{totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Sales Transactions:</span>
                <div className="text-lg font-bold text-green-600">{salesTransactions}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Purchase Transactions:</span>
                <div className="text-lg font-bold text-blue-600">{purchaseTransactions}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}