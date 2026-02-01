'use client'

import { useState } from 'react'

export default function TaxAccountLedger() {
  const [filterType, setFilterType] = useState('Vat & Tax Account')
  const [fromDate, setFromDate] = useState('23/08/2025')
  const [toDate, setToDate] = useState('23/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample tax account ledger data with Indian context
  const [taxAccountLedgerData] = useState([
    { 
      id: 1, 
      sl: 1, 
      date: '23/08/2025',
      particulars: 'GST Input Tax Credit - Raw Materials Mumbai', 
      voucherNo: 'GST001',
      voucherType: 'GST Input',
      debit: 18000.00, 
      credit: 0.00, 
      balance: 18000.00
    },
    { 
      id: 2, 
      sl: 2, 
      date: '22/08/2025',
      particulars: 'GST Output Tax - Sales Invoice Delhi', 
      voucherNo: 'GST002',
      voucherType: 'GST Output',
      debit: 0.00, 
      credit: 32400.00, 
      balance: -14400.00
    },
    { 
      id: 3, 
      sl: 3, 
      date: '21/08/2025',
      particulars: 'TDS Deducted - Professional Services Chennai', 
      voucherNo: 'TDS001',
      voucherType: 'TDS Deduction',
      debit: 0.00, 
      credit: 5000.00, 
      balance: -19400.00
    },
    { 
      id: 4, 
      sl: 4, 
      date: '20/08/2025',
      particulars: 'VAT Paid - State Government Kolkata', 
      voucherNo: 'VAT001',
      voucherType: 'VAT Payment',
      debit: 0.00, 
      credit: 15000.00, 
      balance: -34400.00
    },
    { 
      id: 5, 
      sl: 5, 
      date: '19/08/2025',
      particulars: 'GST Reverse Charge - Import Services Bangalore', 
      voucherNo: 'RCM001',
      voucherType: 'Reverse Charge',
      debit: 9000.00, 
      credit: 9000.00, 
      balance: -34400.00
    },
    { 
      id: 6, 
      sl: 6, 
      date: '18/08/2025',
      particulars: 'Service Tax Credit - Transportation Hyderabad', 
      voucherNo: 'ST001',
      voucherType: 'Service Tax',
      debit: 3600.00, 
      credit: 0.00, 
      balance: -30800.00
    },
    { 
      id: 7, 
      sl: 7, 
      date: '17/08/2025',
      particulars: 'IGST Payment - Interstate Sale Pune', 
      voucherNo: 'IGST001',
      voucherType: 'IGST',
      debit: 0.00, 
      credit: 21600.00, 
      balance: -52400.00
    },
    { 
      id: 8, 
      sl: 8, 
      date: '16/08/2025',
      particulars: 'CGST & SGST - Local Sales Jaipur', 
      voucherNo: 'CGST001',
      voucherType: 'CGST/SGST',
      debit: 0.00, 
      credit: 14400.00, 
      balance: -66800.00
    },
    { 
      id: 9, 
      sl: 9, 
      date: '15/08/2025',
      particulars: 'Tax Refund Received - Income Tax Ahmedabad', 
      voucherNo: 'REF001',
      voucherType: 'Tax Refund',
      debit: 25000.00, 
      credit: 0.00, 
      balance: -41800.00
    },
    { 
      id: 10, 
      sl: 10, 
      date: '14/08/2025',
      particulars: 'Cess Payment - Clean Energy Cess Lucknow', 
      voucherNo: 'CESS001',
      voucherType: 'Cess',
      debit: 0.00, 
      credit: 7200.00, 
      balance: -49000.00
    }
  ])

  const [filteredData, setFilteredData] = useState(taxAccountLedgerData)

  // Filter options for tax account ledger - as shown in screenshot
  const filterOptions = [
    'Vat & Tax Account'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalDebit = filteredData.reduce((sum, item) => sum + item.debit, 0)
  const totalCredit = filteredData.reduce((sum, item) => sum + item.credit, 0)
  const netBalance = totalDebit - totalCredit

  const handleGetReport = () => {
    console.log('Generating tax account ledger with filters:', {
      filterType,
      fromDate,
      toDate
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Apply filter based on filterType and date range
    let filtered = taxAccountLedgerData
    
    // Date filtering logic
    if (fromDate && toDate) {
      const fromDateObj = parseDate(fromDate)
      const toDateObj = parseDate(toDate)
      
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.date)
        return itemDate >= fromDateObj && itemDate <= toDateObj
      })
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
      setFilteredData(taxAccountLedgerData)
    } else {
      const filtered = taxAccountLedgerData.filter(entry =>
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherType.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(taxAccountLedgerData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Duties & Tax Account Ledger</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            .opening-balance { background-color: #e8f5e8; font-weight: bold; }
            .closing-balance { background-color: #ffe8e8; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Duties & Tax Account Ledger</h1>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Particulars</th>
                <th>VCH No</th>
                <th>VCH Type</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <tr class="opening-balance">
                <td colspan="5"><strong>Opening Balance :</strong></td>
                <td class="amount"><strong>0.00</strong></td>
                <td class="amount"><strong>₹121.50</strong></td>
                <td class="amount"></td>
              </tr>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.date}</td>
                  <td>${entry.particulars}</td>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.voucherType}</td>
                  <td class="amount">₹${entry.debit.toFixed(2)}</td>
                  <td class="amount">₹${entry.credit.toFixed(2)}</td>
                  <td class="amount">₹${entry.balance.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>Grand Total :</strong></td>
                <td class="amount"><strong>₹${totalDebit.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalCredit.toFixed(2)}</strong></td>
                <td class="amount"><strong>0.00</strong></td>
              </tr>
              <tr class="closing-balance">
                <td colspan="5"><strong>Closing Balance :</strong></td>
                <td class="amount"></td>
                <td class="amount"><strong>₹121.50</strong></td>
                <td class="amount"></td>
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
      ['SL', 'Date', 'Particulars', 'VCH No', 'VCH Type', 'Debit', 'Credit', 'Balance'],
      ['Opening Balance', '', '', '', '', '0.00', '121.50', ''],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.date,
        entry.particulars,
        entry.voucherNo,
        entry.voucherType,
        entry.debit.toFixed(2),
        entry.credit.toFixed(2),
        entry.balance.toFixed(2)
      ]),
      ['Grand Total', '', '', '', '', totalDebit.toFixed(2), totalCredit.toFixed(2), '0.00'],
      ['Closing Balance', '', '', '', '', '', '121.50', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'duties_tax_account_ledger.csv'
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
          <h2 className="font-medium text-lg">Duties & Tax Account Ledger</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Account</label>
              <select 
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
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
            <h3 className="text-lg font-medium">Duties & Tax Account Ledger</h3>
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
                placeholder="Search by tax details, voucher number or type..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[300px]">Particular</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">VCH No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">VCH Type</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Debit</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Credit</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance Row */}
                <tr className="border-b bg-green-50">
                  <td className="py-2 px-3 text-xs font-bold" colSpan="5">
                    Opening Balance :
                  </td>
                  <td className="py-2 px-3 text-xs text-right font-bold">0.00</td>
                  <td className="py-2 px-3 text-xs text-right font-bold">-121.50</td>
                  <td className="py-2 px-3 text-xs text-right"></td>
                </tr>

                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs">{entry.date}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.particulars}</td>
                        <td className="py-2 px-3 text-xs">{entry.voucherNo}</td>
                        <td className="py-2 px-3 text-xs">{entry.voucherType}</td>
                        <td className="py-2 px-3 text-xs text-right">
                          <span className={entry.debit > 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                            {entry.debit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-right">
                          <span className={entry.credit > 0 ? 'text-green-600 font-medium' : 'text-gray-600'}>
                            {entry.credit.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-right">
                          <span className="text-blue-600 font-medium">
                            {entry.balance.toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="5">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold">{totalDebit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold">{totalCredit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold">0.00</td>
                    </tr>

                    {/* Closing Balance Row */}
                    <tr className="border-b bg-red-50">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="5">
                        Closing Balance :
                      </td>
                      <td className="py-2 px-3 text-xs text-right"></td>
                      <td className="py-2 px-3 text-xs text-right font-bold">-121.50</td>
                      <td className="py-2 px-3 text-xs text-right"></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Transactions:</span>
                <div className="text-lg font-bold text-blue-600">{totalEntries}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Debits:</span>
                <div className="text-lg font-bold text-red-600">{totalDebit.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Credits:</span>
                <div className="text-lg font-bold text-green-600">{totalCredit.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Net Balance:</span>
                <div className="text-lg font-bold text-blue-600">{netBalance.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Average Transaction:</span>
                <div className="text-lg font-bold text-purple-600">{totalEntries > 0 ? ((totalDebit + totalCredit) / totalEntries).toFixed(2) : '0.00'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Account Status:</span>
                <div className="text-lg font-bold text-orange-600">{netBalance > 0 ? 'Debit Balance' : 'Credit Balance'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}