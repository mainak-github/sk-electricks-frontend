'use client'

import { useState, useMemo } from 'react'

export default function DailyLedger() {
  const [fromDate, setFromDate] = useState('2025-08-20')
  const [toDate, setToDate] = useState('2025-08-20')
  const [showReport, setShowReport] = useState(false)

  // Extended sample daily ledger data with multiple dates
  const [ledgerData] = useState([
    {
      id: 1,
      sl: 1,
      date: '2025-08-18',
      particular: 'Cash received from previous sales',
      vchNo: 'RCP000',
      vchType: 'Receipt',
      debit: 15000.00,
      credit: 0.00
    },
    {
      id: 2,
      sl: 2,
      date: '2025-08-19',
      particular: 'Office supplies purchase',
      vchNo: 'PAY000',
      vchType: 'Payment',
      debit: 0.00,
      credit: 2500.00
    },
    {
      id: 3,
      sl: 3,
      date: '2025-08-20',
      particular: 'Cash received from sales',
      vchNo: 'RCP001',
      vchType: 'Receipt',
      debit: 25000.00,
      credit: 0.00
    },
    {
      id: 4,
      sl: 4,
      date: '2025-08-20',
      particular: 'Office rent payment',
      vchNo: 'PAY001',
      vchType: 'Payment',
      debit: 0.00,
      credit: 15000.00
    },
    {
      id: 5,
      sl: 5,
      date: '2025-08-20',
      particular: 'Salary payment to employees',
      vchNo: 'PAY002',
      vchType: 'Payment',
      debit: 0.00,
      credit: 45000.00
    },
    {
      id: 6,
      sl: 6,
      date: '2025-08-20',
      particular: 'Bank loan received',
      vchNo: 'RCP002',
      vchType: 'Receipt',
      debit: 100000.00,
      credit: 0.00
    },
    {
      id: 7,
      sl: 7,
      date: '2025-08-20',
      particular: 'Utilities expense payment',
      vchNo: 'PAY003',
      vchType: 'Payment',
      debit: 0.00,
      credit: 3500.00
    },
    {
      id: 8,
      sl: 8,
      date: '2025-08-21',
      particular: 'Equipment purchase',
      vchNo: 'PAY004',
      vchType: 'Payment',
      debit: 0.00,
      credit: 85000.00
    },
    {
      id: 9,
      sl: 9,
      date: '2025-08-21',
      particular: 'Customer payment received',
      vchNo: 'RCP003',
      vchType: 'Receipt',
      debit: 18000.00,
      credit: 0.00
    },
    {
      id: 10,
      sl: 10,
      date: '2025-08-22',
      particular: 'Marketing expense',
      vchNo: 'PAY005',
      vchType: 'Payment',
      debit: 0.00,
      credit: 12000.00
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

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!showReport) return []
    
    return ledgerData.filter(entry => {
      const entryDate = new Date(entry.date)
      const from = new Date(fromDate)
      const to = new Date(toDate)
      
      // Set time to start/end of day for proper comparison
      from.setHours(0, 0, 0, 0)
      to.setHours(23, 59, 59, 999)
      
      return entryDate >= from && entryDate <= to
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [ledgerData, fromDate, toDate, showReport])

  const handleGetReport = () => {
    console.log('Generating daily ledger report:', {
      fromDate,
      toDate,
      recordsFound: filteredData.length
    })
    setShowReport(true)
  }

  // Calculate totals and balances for filtered data
  const totals = useMemo(() => {
    const totalDebit = filteredData.reduce((sum, entry) => sum + entry.debit, 0)
    const totalCredit = filteredData.reduce((sum, entry) => sum + entry.credit, 0)
    const openingBalance = 1512323225534287.50 // As shown in screenshot
    const grandTotal = totalDebit - totalCredit
    const closingBalance = openingBalance + grandTotal
    
    return {
      totalDebit,
      totalCredit,
      openingBalance,
      grandTotal,
      closingBalance
    }
  }, [filteredData])

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Daily Ledger Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0d9488; }
            .amount { text-align: right; }
            .header-info { margin: 20px 0; }
            .totals { background-color: #f9f9f9; font-weight: bold; }
            .summary-row { background-color: #e5e7eb; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Daily Ledger Report</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Period: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}</p>
            <p>Total Records: ${filteredData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Particular</th>
                <th>VCH No</th>
                <th>VCH Type</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry, index) => {
                let runningBalance = totals.openingBalance;
                for (let i = 0; i <= index; i++) {
                  runningBalance += (filteredData[i].debit - filteredData[i].credit);
                }
                return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${formatDateForDisplay(entry.date)}</td>
                  <td>${entry.particular}</td>
                  <td>${entry.vchNo}</td>
                  <td>${entry.vchType}</td>
                  <td class="amount">${entry.debit.toFixed(2)}</td>
                  <td class="amount">${entry.credit.toFixed(2)}</td>
                  <td class="amount">${runningBalance.toFixed(2)}</td>
                </tr>
              `}).join('')}
              <tr class="summary-row">
                <td colspan="5">Opening Balance :</td>
                <td class="amount">${totals.openingBalance.toFixed(2)}</td>
                <td class="amount"></td>
                <td class="amount"></td>
              </tr>
              <tr class="summary-row">
                <td colspan="5">Grand Total :</td>
                <td class="amount">${totals.totalDebit.toFixed(2)}</td>
                <td class="amount">${totals.totalCredit.toFixed(2)}</td>
                <td class="amount"></td>
              </tr>
              <tr class="summary-row">
                <td colspan="5">Closing Balance :</td>
                <td class="amount">${totals.closingBalance.toFixed(2)}</td>
                <td class="amount">0.00</td>
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
      ['SL', 'Date', 'Particular', 'VCH No', 'VCH Type', 'Debit', 'Credit', 'Balance'],
      ...filteredData.map((entry, index) => {
        let runningBalance = totals.openingBalance;
        for (let i = 0; i <= index; i++) {
          runningBalance += (filteredData[i].debit - filteredData[i].credit);
        }
        return [
          index + 1,
          formatDateForDisplay(entry.date),
          entry.particular,
          entry.vchNo,
          entry.vchType,
          entry.debit.toFixed(2),
          entry.credit.toFixed(2),
          runningBalance.toFixed(2)
        ]
      }),
      ['Opening Balance:', '', '', '', '', totals.openingBalance.toFixed(2), '', ''],
      ['Grand Total:', '', '', '', '', totals.totalDebit.toFixed(2), totals.totalCredit.toFixed(2), ''],
      ['Closing Balance:', '', '', '', '', totals.closingBalance.toFixed(2), '0.00', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `daily_ledger_report_${fromDate}_to_${toDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4">
      <div className="bg-white">
        {/* Header */}
        <h2 className="text-xl font-medium text-gray-800 mb-6">Daily Ledger</h2>
        
        {/* Filter Section */}
        <div className="flex items-center gap-4 mb-6">
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
              className="bg-teal-600 text-white px-6 py-2 mt-7 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              🔍 GET REPORT
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
            </p>
          </div>
        )}

        {/* Report Table - Only show when showReport is true */}
        {showReport && (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              {filteredData.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No records found for the selected date range.</p>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 border-r">SL</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 border-r">Date</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 border-r">Particular</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 border-r">VCH No</th>
                      <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700 border-r">VCH Type</th>
                      <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700 border-r">Debit</th>
                      <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700 border-r">Credit</th>
                      <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((entry, index) => {
                      let runningBalance = totals.openingBalance;
                      for (let i = 0; i <= index; i++) {
                        runningBalance += (filteredData[i].debit - filteredData[i].credit);
                      }
                      return (
                        <tr key={entry.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3 text-sm border-r">{index + 1}</td>
                          <td className="py-2 px-3 text-sm border-r">{formatDateForDisplay(entry.date)}</td>
                          <td className="py-2 px-3 text-sm border-r">{entry.particular}</td>
                          <td className="py-2 px-3 text-sm border-r">{entry.vchNo}</td>
                          <td className="py-2 px-3 text-sm border-r">{entry.vchType}</td>
                          <td className="py-2 px-3 text-sm text-right border-r">{entry.debit > 0 ? entry.debit.toFixed(2) : ''}</td>
                          <td className="py-2 px-3 text-sm text-right border-r">{entry.credit > 0 ? entry.credit.toFixed(2) : ''}</td>
                          <td className="py-2 px-3 text-sm text-right">{runningBalance.toFixed(2)}</td>
                        </tr>
                      )
                    })}
                    
                    {/* Summary rows */}
                    <tr className="bg-gray-100 border-t-2">
                      <td className="py-2 px-3 text-sm border-r" colSpan="5">Opening Balance :</td>
                      <td className="py-2 px-3 text-sm text-right border-r">{totals.openingBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="py-2 px-3 text-sm text-right border-r"></td>
                      <td className="py-2 px-3 text-sm text-right"></td>
                    </tr>
                    
                    <tr className="bg-gray-100">
                      <td className="py-2 px-3 text-sm border-r" colSpan="5">Grand Total :</td>
                      <td className="py-2 px-3 text-sm text-right border-r">{totals.totalDebit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-sm text-right border-r">{totals.totalCredit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-sm text-right"></td>
                    </tr>
                    
                    <tr className="bg-gray-100">
                      <td className="py-2 px-3 text-sm border-r" colSpan="5">Closing Balance :</td>
                      <td className="py-2 px-3 text-sm text-right border-r">{totals.closingBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className="py-2 px-3 text-sm text-right border-r">0.00</td>
                      <td className="py-2 px-3 text-sm text-right"></td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Export button - only show when report is generated and has data */}
        {showReport && filteredData.length > 0 && (
          <div className="flex justify-end mt-4">
            <button 
              onClick={handleExport}
              className="p-2 border rounded hover:bg-gray-50 transition-colors"
              title="Export to CSV"
            >
              📤 Export
            </button>
          </div>
        )}
      </div>
    </div>
  )
}