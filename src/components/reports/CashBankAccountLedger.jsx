'use client'

import { useState, useMemo } from 'react'

export default function CashBankAccountLedger() {
  const [selectedAccount, setSelectedAccount] = useState('')
  const [fromDate, setFromDate] = useState('2025-08-20')
  const [toDate, setToDate] = useState('2025-08-20')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Account options based on the screenshot
  const accountOptions = [
    { value: '', label: 'Select Account' },
    { value: 'cash-in-hand', label: 'Cash in Hand' },
    { value: 'petty-cash', label: 'Petty Cash' },
    { value: 'bank-abc', label: 'ABC Bank Ltd.' },
    { value: 'bank-xyz', label: 'XYZ Bank Ltd.' },
    { value: 'mobile-banking', label: 'Mobile Banking' },
    { value: 'credit-card', label: 'Credit Card' }
  ]

  // Extended sample cash/bank ledger data with multiple dates
  const [ledgerData] = useState([
    {
      id: 1,
      sl: 1,
      date: '2025-08-18',
      particulars: 'Opening Balance',
      voucherType: 'Opening',
      voucherNo: 'OPB-001',
      debit: 50000.00,
      credit: 0.00,
      balance: 50000.00,
      balanceType: 'Dr',
      description: 'Opening balance for cash account',
      account: 'cash-in-hand'
    },
    {
      id: 2,
      sl: 2,
      date: '2025-08-18',
      particulars: 'Sale Receipt - Ahmed Trading',
      voucherType: 'Receipt',
      voucherNo: 'RCV-001',
      debit: 25000.00,
      credit: 0.00,
      balance: 75000.00,
      balanceType: 'Dr',
      description: 'Cash received from customer',
      account: 'cash-in-hand'
    },
    {
      id: 3,
      sl: 3,
      date: '2025-08-19',
      particulars: 'Bank Deposit',
      voucherType: 'Journal',
      voucherNo: 'JV-001',
      debit: 100000.00,
      credit: 0.00,
      balance: 100000.00,
      balanceType: 'Dr',
      description: 'Cash deposited from main account',
      account: 'bank-abc'
    },
    {
      id: 4,
      sl: 4,
      date: '2025-08-19',
      particulars: 'Office Rent Payment',
      voucherType: 'Payment',
      voucherNo: 'PAY-001',
      debit: 0.00,
      credit: 15000.00,
      balance: 60000.00,
      balanceType: 'Dr',
      description: 'Monthly office rent payment',
      account: 'cash-in-hand'
    },
    {
      id: 5,
      sl: 5,
      date: '2025-08-20',
      particulars: 'Supplier Payment - City Corporation',
      voucherType: 'Payment',
      voucherNo: 'PAY-002',
      debit: 0.00,
      credit: 30000.00,
      balance: 70000.00,
      balanceType: 'Dr',
      description: 'Payment to supplier via bank',
      account: 'bank-abc'
    },
    {
      id: 6,
      sl: 6,
      date: '2025-08-20',
      particulars: 'ATM Withdrawal',
      voucherType: 'Journal',
      voucherNo: 'JV-002',
      debit: 0.00,
      credit: 20000.00,
      balance: 40000.00,
      balanceType: 'Dr',
      description: 'Cash withdrawn from ATM',
      account: 'cash-in-hand'
    },
    {
      id: 7,
      sl: 7,
      date: '2025-08-20',
      particulars: 'Sale Receipt - Digital Solutions',
      voucherType: 'Receipt',
      voucherNo: 'RCV-002',
      debit: 35000.00,
      credit: 0.00,
      balance: 75000.00,
      balanceType: 'Dr',
      description: 'Cash received from customer',
      account: 'cash-in-hand'
    },
    {
      id: 8,
      sl: 8,
      date: '2025-08-21',
      particulars: 'Online Transfer Receipt',
      voucherType: 'Receipt',
      voucherNo: 'RCV-003',
      debit: 50000.00,
      credit: 0.00,
      balance: 120000.00,
      balanceType: 'Dr',
      description: 'Payment received via bank transfer',
      account: 'bank-abc'
    },
    {
      id: 9,
      sl: 9,
      date: '2025-08-21',
      particulars: 'Petty Cash Fund',
      voucherType: 'Journal',
      voucherNo: 'JV-003',
      debit: 5000.00,
      credit: 0.00,
      balance: 5000.00,
      balanceType: 'Dr',
      description: 'Petty cash fund setup',
      account: 'petty-cash'
    },
    {
      id: 10,
      sl: 10,
      date: '2025-08-22',
      particulars: 'Mobile Banking Transfer',
      voucherType: 'Receipt',
      voucherNo: 'RCV-004',
      debit: 15000.00,
      credit: 0.00,
      balance: 15000.00,
      balanceType: 'Dr',
      description: 'Payment received via mobile banking',
      account: 'mobile-banking'
    },
    {
      id: 11,
      sl: 11,
      date: '2025-08-22',
      particulars: 'Utility Bills Payment',
      voucherType: 'Payment',
      voucherNo: 'PAY-003',
      debit: 0.00,
      credit: 8500.00,
      balance: 6500.00,
      balanceType: 'Dr',
      description: 'Electricity and water bills payment',
      account: 'mobile-banking'
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

  // Filter data based on date range, account, and search term
  const filteredData = useMemo(() => {
    if (!showReport) return []
    
    let filtered = ledgerData.filter(entry => {
      const entryDate = new Date(entry.date)
      const from = new Date(fromDate)
      const to = new Date(toDate)
      
      // Set time to start/end of day for proper comparison
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      
      const dateInRange = entryDate >= from && entryDate <= to
      const accountMatches = !selectedAccount || entry.account === selectedAccount
      
      return dateInRange && accountMatches
    })
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(entry =>
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [ledgerData, searchTerm, fromDate, toDate, selectedAccount, showReport])

  const handleGetReport = () => {
    console.log('Generating cash/bank account ledger:', {
      selectedAccount,
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
      acc.totalDebit += entry.debit
      acc.totalCredit += entry.credit
      return acc
    }, {
      totalDebit: 0,
      totalCredit: 0,
      count: filteredData.length,
      closingBalance: filteredData.length > 0 ? filteredData[filteredData.length - 1].balance : 0,
      closingBalanceType: filteredData.length > 0 ? filteredData[filteredData.length - 1].balanceType : 'Dr'
    })
  }, [filteredData])

  // Print functionality
  const handlePrint = () => {
    const selectedAccountName = accountOptions.find(opt => opt.value === selectedAccount)?.label || 'All Accounts'
    const printContent = `
      <html>
        <head>
          <title>Cash/Bank Account Ledger</title>
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
          <h1>Cash/Bank Account Ledger</h1>
          <div class="header-info">
            <p>Account: ${selectedAccountName}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Period: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}</p>
            <p>Total Records: ${filteredData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Particulars</th>
                <th>Voucher Type</th>
                <th>Voucher No</th>
                <th>Debit Amount</th>
                <th>Credit Amount</th>
                <th>Balance</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${formatDateForDisplay(entry.date)}</td>
                  <td>${entry.particulars}</td>
                  <td>${entry.voucherType}</td>
                  <td>${entry.voucherNo}</td>
                  <td class="amount">${entry.debit.toFixed(2)}</td>
                  <td class="amount">${entry.credit.toFixed(2)}</td>
                  <td class="amount">${entry.balance.toFixed(2)} ${entry.balanceType}</td>
                  <td>${entry.description}</td>
                </tr>
              `).join('')}
              <tr class="totals">
                <td colspan="5">TOTAL</td>
                <td class="amount">${totals.totalDebit.toFixed(2)}</td>
                <td class="amount">${totals.totalCredit.toFixed(2)}</td>
                <td class="amount">${totals.closingBalance.toFixed(2)} ${totals.closingBalanceType}</td>
                <td></td>
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
    const selectedAccountName = accountOptions.find(opt => opt.value === selectedAccount)?.label || 'All Accounts'
    const csvContent = [
      ['SL', 'Date', 'Particulars', 'Voucher Type', 'Voucher No', 'Debit Amount', 'Credit Amount', 'Balance', 'Description'],
      ...filteredData.map((entry, index) => [
        index + 1,
        formatDateForDisplay(entry.date),
        entry.particulars,
        entry.voucherType,
        entry.voucherNo,
        entry.debit.toFixed(2),
        entry.credit.toFixed(2),
        `${entry.balance.toFixed(2)} ${entry.balanceType}`,
        entry.description
      ]),
      ['TOTAL', '', '', '', '', totals.totalDebit.toFixed(2), totals.totalCredit.toFixed(2), `${totals.closingBalance.toFixed(2)} ${totals.closingBalanceType}`, '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cash_bank_ledger_${fromDate}_to_${toDate}.csv`
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
          <h2 className="font-medium text-lg">Cash/ Bank Balance Ledger</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Account</label>
              <select 
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {accountOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
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
                🔍 GET REPORT
              </button>
            </div>
          </div>

          {/* Show filter info when report is generated */}
          {showReport && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <strong>Account:</strong> {accountOptions.find(opt => opt.value === selectedAccount)?.label || 'All Accounts'}
                <span className="ml-4"><strong>Period:</strong> {formatDateForDisplay(fromDate)} to {formatDateForDisplay(toDate)}</span>
                <span className="ml-4"><strong>Records Found:</strong> {filteredData.length}</span>
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
              <h3 className="text-lg font-medium">Cash/Bank Account Ledger</h3>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-blue-700">Total Transactions</h4>
                <p className="text-xl font-bold text-blue-900">{totals.count}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-green-700">Total Debit</h4>
                <p className="text-xl font-bold text-green-900">{totals.totalDebit.toFixed(2)}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-red-700">Total Credit</h4>
                <p className="text-xl font-bold text-red-900">{totals.totalCredit.toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-purple-700">Closing Balance</h4>
                <p className="text-xl font-bold text-purple-900">{totals.closingBalance.toFixed(2)} {totals.closingBalanceType}</p>
              </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by particulars, voucher type, voucher no, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
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
              {filteredData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No records found for the selected criteria.</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">SL</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Date</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Particulars</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Voucher Type</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Voucher No</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Debit Amount</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Credit Amount</th>
                      <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">Balance</th>
                      <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntries.map((entry, index) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 text-xs">{startIndex + index + 1}</td>
                        <td className="py-2 px-2 text-xs">{formatDateForDisplay(entry.date)}</td>
                        <td className="py-2 px-2 text-xs font-medium">{entry.particulars}</td>
                        <td className="py-2 px-2 text-xs">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            entry.voucherType === 'Receipt' ? 'bg-green-100 text-green-800' :
                            entry.voucherType === 'Payment' ? 'bg-red-100 text-red-800' :
                            entry.voucherType === 'Journal' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.voucherType}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs font-medium text-blue-600">{entry.voucherNo}</td>
                        <td className="py-2 px-2 text-xs text-right font-medium">
                          {entry.debit > 0 ? (
                            <span className="text-green-600">{entry.debit.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400">0.00</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-xs text-right font-medium">
                          {entry.credit > 0 ? (
                            <span className="text-red-600">{entry.credit.toFixed(2)}</span>
                          ) : (
                            <span className="text-gray-400">0.00</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-xs text-right font-medium">
                          <span className={entry.balanceType === 'Dr' ? 'text-green-600' : 'text-red-600'}>
                            {entry.balance.toFixed(2)} {entry.balanceType}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-600">{entry.description}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold border-t-2">
                      <td className="py-2 px-2 text-xs" colSpan="5">TOTAL</td>
                      <td className="py-2 px-2 text-xs text-right font-bold text-green-600">{totals.totalDebit.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold text-red-600">{totals.totalCredit.toFixed(2)}</td>
                      <td className="py-2 px-2 text-xs text-right font-bold">
                        <span className={totals.closingBalanceType === 'Dr' ? 'text-green-600' : 'text-red-600'}>
                          {totals.closingBalance.toFixed(2)} {totals.closingBalanceType}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs"></td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* Pagination */}
            {filteredData.length > 0 && (
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
            )}
          </div>
        </div>
      )}
    </div>
  )
}