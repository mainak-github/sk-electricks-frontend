'use client'

import { useState, useMemo } from 'react'

export default function ExpenseRecord() {
  const [filterType, setFilterType] = useState('All')
  const [recordType, setRecordType] = useState('without details')
  const [fromDate, setFromDate] = useState('2025-08-20')
  const [toDate, setToDate] = useState('2025-08-20')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Filter Type options (based on screenshot)
  const filterTypeOptions = [
    'All',
    'Date Wise',
    'Account Wise',
    'Category Wise',
    'Monthly',
    'Yearly'
  ]

  // Record Type options (based on screenshot)
  const recordTypeOptions = [
    'without details',
    'with details',
    'summary only'
  ]

  // Extended sample expense record data with multiple dates
  const [expenseData] = useState([
    {
      id: 1,
      sl: 1,
      date: '2025-08-18',
      voucherNo: 'EXP000',
      accountName: 'Office Supplies',
      particulars: 'Previous day office supplies purchase',
      debitAmount: 2500.00,
      creditAmount: 0.00,
      balance: 2500.00
    },
    {
      id: 2,
      sl: 2,
      date: '2025-08-19',
      voucherNo: 'EXP001',
      accountName: 'Travel Expense',
      particulars: 'Business trip expenses',
      debitAmount: 8500.00,
      creditAmount: 0.00,
      balance: 8500.00
    },
    {
      id: 3,
      sl: 3,
      date: '2025-08-20',
      voucherNo: 'EXP002',
      accountName: 'Office Rent',
      particulars: 'Monthly office rent payment',
      debitAmount: 15000.00,
      creditAmount: 0.00,
      balance: 15000.00
    },
    {
      id: 4,
      sl: 4,
      date: '2025-08-20',
      voucherNo: 'EXP003',
      accountName: 'Utilities Expense',
      particulars: 'Electricity and water bills',
      debitAmount: 3500.00,
      creditAmount: 0.00,
      balance: 3500.00
    },
    {
      id: 5,
      sl: 5,
      date: '2025-08-20',
      voucherNo: 'EXP004',
      accountName: 'Salary & Wages',
      particulars: 'Employee salary payment',
      debitAmount: 45000.00,
      creditAmount: 0.00,
      balance: 45000.00
    },
    {
      id: 6,
      sl: 6,
      date: '2025-08-20',
      voucherNo: 'EXP005',
      accountName: 'Transport Expense',
      particulars: 'Vehicle maintenance and fuel',
      debitAmount: 8500.00,
      creditAmount: 500.00,
      balance: 8000.00
    },
    {
      id: 7,
      sl: 7,
      date: '2025-08-20',
      voucherNo: 'EXP006',
      accountName: 'Marketing Expense',
      particulars: 'Advertisement and promotion',
      debitAmount: 12000.00,
      creditAmount: 0.00,
      balance: 12000.00
    },
    {
      id: 8,
      sl: 8,
      date: '2025-08-21',
      voucherNo: 'EXP007',
      accountName: 'Telephone Expense',
      particulars: 'Phone and internet bills',
      debitAmount: 2800.00,
      creditAmount: 0.00,
      balance: 2800.00
    },
    {
      id: 9,
      sl: 9,
      date: '2025-08-21',
      voucherNo: 'EXP008',
      accountName: 'Office Stationery',
      particulars: 'Papers, pens and supplies',
      debitAmount: 1500.00,
      creditAmount: 0.00,
      balance: 1500.00
    },
    {
      id: 10,
      sl: 10,
      date: '2025-08-22',
      voucherNo: 'EXP009',
      accountName: 'Fuel Expense',
      particulars: 'Petrol and diesel',
      debitAmount: 5200.00,
      creditAmount: 0.00,
      balance: 5200.00
    },
    {
      id: 11,
      sl: 11,
      date: '2025-08-22',
      voucherNo: 'EXP010',
      accountName: 'Insurance Premium',
      particulars: 'Office insurance payment',
      debitAmount: 6000.00,
      creditAmount: 0.00,
      balance: 6000.00
    },
    {
      id: 12,
      sl: 12,
      date: '2025-08-23',
      voucherNo: 'EXP011',
      accountName: 'Miscellaneous Expense',
      particulars: 'Other office expenses',
      debitAmount: 2400.00,
      creditAmount: 0.00,
      balance: 2400.00
    }
  ])

  // Function to convert date from YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Filter data based on date range and search term
  const filteredData = useMemo(() => {
    if (!showReport) return []
    
    let filtered = expenseData.filter(entry => {
      const entryDate = new Date(entry.date)
      const from = new Date(fromDate)
      const to = new Date(toDate)
      
      // Set time to start/end of day for proper comparison
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      
      return entryDate >= from && entryDate <= to
    })
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(entry =>
        entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [expenseData, searchTerm, fromDate, toDate, showReport])

  const handleGetReport = () => {
    console.log('Generating expense record report:', {
      filterType,
      recordType,
      fromDate,
      toDate,
      recordsFound: filteredData.length
    })
    setShowReport(true)
    setCurrentPage(1)
    setSearchTerm('')
    setShowSearch(false)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
  }

  // Calculate totals for filtered data
  const totals = useMemo(() => {
    return filteredData.reduce((acc, entry) => {
      acc.totalDebit += entry.debitAmount
      acc.totalCredit += entry.creditAmount
      acc.totalBalance += entry.balance
      return acc
    }, {
      totalDebit: 0,
      totalCredit: 0,
      totalBalance: 0,
      count: filteredData.length
    })
  }, [filteredData])

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Expense Record Report</title>
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
          <h1>Expense Record Report</h1>
          <div class="header-info">
            <p>Filter Type: ${filterType}</p>
            <p>Record Type: ${recordType}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Period: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}</p>
            <p>Total Records: ${filteredData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Voucher No</th>
                <th>Account Name</th>
                <th>Particulars</th>
                <th>Debit Amount</th>
                <th>Credit Amount</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${formatDateForDisplay(entry.date)}</td>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.accountName}</td>
                  <td>${entry.particulars}</td>
                  <td class="amount">${entry.debitAmount.toFixed(2)}</td>
                  <td class="amount">${entry.creditAmount.toFixed(2)}</td>
                  <td class="amount">${entry.balance.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="totals">
                <td colspan="5">Grand Total:</td>
                <td class="amount">${totals.totalDebit.toFixed(2)}</td>
                <td class="amount">${totals.totalCredit.toFixed(2)}</td>
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

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['SL', 'Date', 'Voucher No', 'Account Name', 'Particulars', 'Debit Amount', 'Credit Amount', 'Balance'],
      ...filteredData.map((entry, index) => [
        index + 1,
        formatDateForDisplay(entry.date),
        entry.voucherNo,
        entry.accountName,
        entry.particulars,
        entry.debitAmount.toFixed(2),
        entry.creditAmount.toFixed(2),
        entry.balance.toFixed(2)
      ]),
      ['Grand Total:', '', '', '', '', totals.totalDebit.toFixed(2), totals.totalCredit.toFixed(2), totals.totalBalance.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense_record_report_${fromDate}_to_${toDate}.csv`
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
          <h2 className="font-medium text-lg">Expense Record</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select 
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
              <input 
                type="date"
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                className="bg-teal-500 text-white px-6 py-2 mt-7 rounded text-sm hover:bg-teal-600 transition-colors flex items-center gap-2"
              >
                🔍 REPORT
              </button>
            </div>

            {/* Print button */}
            {showReport && (
              <div className="flex items-end mt-7">
                <button 
                  onClick={handlePrint}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors"
                  title="Print"
                >
                  🖨️
                </button>
              </div>
            )}
          </div>

          {/* Show date range info when report is generated */}
          {showReport && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Report Period:</strong> {formatDateForDisplay(fromDate)} to {formatDateForDisplay(toDate)} 
                <span className="ml-4"><strong>Records Found:</strong> {filteredData.length}</span>
                <span className="ml-4"><strong>Filter:</strong> {filterType}</span>
                <span className="ml-4"><strong>Type:</strong> {recordType}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Report Results - Only show when showReport is true */}
      {showReport && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Expense Record Report</h3>
              <div className="flex gap-2">
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

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                {filteredData.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No expense records found for the selected date range.</p>
                  </div>
                ) : (
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">SL</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">Date</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">Voucher No</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">Account Name</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">Particulars</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 border-r">Debit Amount</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 border-r">Credit Amount</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((entry, index) => (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3 text-xs border-r">{index + 1}</td>
                          <td className="py-2 px-3 text-xs border-r">{formatDateForDisplay(entry.date)}</td>
                          <td className="py-2 px-3 text-xs border-r">{entry.voucherNo}</td>
                          <td className="py-2 px-3 text-xs font-medium border-r">{entry.accountName}</td>
                          <td className="py-2 px-3 text-xs border-r">{entry.particulars}</td>
                          <td className="py-2 px-3 text-xs text-right border-r">{entry.debitAmount.toFixed(2)}</td>
                          <td className="py-2 px-3 text-xs text-right border-r">{entry.creditAmount.toFixed(2)}</td>
                          <td className="py-2 px-3 text-xs text-right font-medium">{entry.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-100 font-bold border-t-2">
                        <td className="py-2 px-3 text-xs border-r" colSpan="5">Grand Total :</td>
                        <td className="py-2 px-3 text-xs text-right border-r">{totals.totalDebit.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-right border-r">{totals.totalCredit.toFixed(2)}</td>
                        <td className="py-2 px-3 text-xs text-right font-bold">{totals.totalBalance.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}