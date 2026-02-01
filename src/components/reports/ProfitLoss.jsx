'use client'

import { useState } from 'react'

export default function ProfitLossReport() {
  const [filterType, setFilterType] = useState('Date Wise')
  const [fromDate, setFromDate] = useState('21/08/2025')
  const [toDate, setToDate] = useState('21/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample profit loss data based on the screenshot
  const [profitLossData] = useState({
    debitEntries: [
      { id: 1, particular: 'Purchase Account', amount: 250000.00 },
      { id: 2, particular: 'Product Transfer Received Amount', amount: 15000.00 },
      { id: 3, particular: 'Service Expense Account', amount: 8500.00 },
      { id: 4, particular: 'Sales Return', amount: 3200.00 },
      { id: 5, particular: 'Direct Expense', amount: 12000.00 },
      { id: 6, particular: 'Product Wise Profit', amount: 0.00 }
    ],
    creditEntries: [
      { id: 1, particular: 'Purchase Return', amount: 5000.00 },
      { id: 2, particular: 'Sales Account', amount: 320000.00 },
      { id: 3, particular: 'Product Transfer Amount', amount: 8000.00 },
      { id: 4, particular: 'Service Account', amount: 4500.00 },
      { id: 5, particular: 'Direct Income', amount: 2500.00 },
      { id: 6, particular: 'Closing Inventory', amount: 185000.00 }
    ],
    calculations: {
      totalDebitAmount: 288700.00,
      totalCreditAmount: 525000.00,
      productProfitAmount: 45000.00,
      indirectExpense: 3500.00,
      netProfitLoss: 232800.00,
      totalDebit: 288700.00,
      previousGrossProfit: 0.00,
      indirectIncome: 1200.00,
      totalCredit: 525000.00
    }
  })

  // Filter options for profit loss
  const filterOptions = [
    'Date Wise',
    'Monthly',
    'Quarterly',
    'Yearly',
    'Custom Range'
  ]

  const handleGetReport = () => {
    console.log('Generating profit loss report with filter:', filterType, 'From:', fromDate, 'To:', toDate)
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    setShowSearch(false)
    // Here you would typically make an API call to get filtered data
  }

  // Search functionality
  const handleSearch = () => {
    // Implementation for search if needed
    console.log('Search term:', searchTerm)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Profit Loss Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; margin-bottom: 20px; }
            .amount { text-align: right; }
            .two-column { display: flex; gap: 20px; }
            .column { flex: 1; }
            .total-row { background-color: #d4f4dd; font-weight: bold; }
            .calculation-row { background-color: #f0f0f0; }
            .net-profit { background-color: #ffcccc; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Profit Loss Report</h1>
            <p>Period: ${fromDate} to ${toDate}</p>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            
            <div class="two-column">
              <div class="column">
                <table>
                  <thead>
                    <tr>
                      <th>PARTICULARS</th>
                      <th>Debit</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${profitLossData.debitEntries.map((entry) => `
                      <tr>
                        <td>${entry.particular}</td>
                        <td class="amount">${entry.amount.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                    <tr class="total-row">
                      <td><strong>Total Debit Amount:</strong></td>
                      <td class="amount"><strong>${profitLossData.calculations.totalDebitAmount.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="column">
                <table>
                  <thead>
                    <tr>
                      <th>PARTICULARS</th>
                      <th>Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${profitLossData.creditEntries.map((entry) => `
                      <tr>
                        <td>${entry.particular}</td>
                        <td class="amount">${entry.amount.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                    <tr class="total-row">
                      <td><strong>Total Credit Amount:</strong></td>
                      <td class="amount"><strong>${profitLossData.calculations.totalCreditAmount.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
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
      ['Profit Loss Report'],
      [`Period: ${fromDate} to ${toDate}`],
      [''],
      ['DEBIT PARTICULARS', 'Amount', 'CREDIT PARTICULARS', 'Amount'],
      ...Array.from({ length: Math.max(profitLossData.debitEntries.length, profitLossData.creditEntries.length) }, (_, i) => [
        profitLossData.debitEntries[i]?.particular || '',
        profitLossData.debitEntries[i]?.amount?.toFixed(2) || '',
        profitLossData.creditEntries[i]?.particular || '',
        profitLossData.creditEntries[i]?.amount?.toFixed(2) || ''
      ]),
      ['Total Debit Amount:', profitLossData.calculations.totalDebitAmount.toFixed(2), 'Total Credit Amount:', profitLossData.calculations.totalCreditAmount.toFixed(2)],
      ['Net Profit/Loss:', profitLossData.calculations.netProfitLoss.toFixed(2), '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'profit_loss_report.csv'
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

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Profit Loss Report</h2>
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
                📊 REPORT
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
            <h3 className="text-lg text-center w-full text-green-700 font-bold">Profit Loss Report</h3>
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
                placeholder="Search by particular..."
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

          {/* Two Column Layout - Scrollable */}
          <div className="overflow-x-auto max-w-4xl mx-auto">
            <div className="flex gap-4 min-w-[800px]">
              {/* Debit Column */}
              <div className="flex-1">
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 py-2 px-3 text-left text-sm font-semibold">PARTICULARS</th>
                      <th className="border border-gray-400 py-2 px-3 text-right text-sm font-semibold">Debit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitLossData.debitEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 py-2 px-3 text-sm">{entry.particular}</td>
                        <td className="border border-gray-300 py-2 px-3 text-sm text-right">{entry.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    
                    {/* Calculation Note */}
                    <tr className="bg-gray-100">
                      <td className="border border-gray-300 py-2 px-3 text-sm italic" colSpan="2">
                        ( Costing : 0.00 , Sold : 0.00 , Reversal : 0 ) = 0.00
                      </td>
                    </tr>
                    
                    {/* Total Debit Amount */}
                    <tr className="bg-green-200">
                      <td className="border border-gray-300 py-2 px-3 text-sm font-bold">Total Debit Amount:</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right font-bold">{profitLossData.calculations.totalDebitAmount.toFixed(2)}</td>
                    </tr>
                    
                    {/* Separator */}
                    <tr>
                      <td className="border border-gray-300 py-1 px-3 text-sm text-center" colSpan="2">----</td>
                    </tr>
                    
                    {/* Additional Calculations */}
                    <tr>
                      <td className="border border-gray-300 py-2 px-3 text-sm">Product Profit Amount</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right">BDT {profitLossData.calculations.productProfitAmount.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 py-2 px-3 text-sm">Indirect Expense :</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right">{profitLossData.calculations.indirectExpense.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-red-200">
                      <td className="border border-gray-300 py-2 px-3 text-sm font-bold">Net Profit/ Loss :</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right font-bold">BDT {profitLossData.calculations.netProfitLoss.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 py-2 px-3 text-sm font-bold">Total Debit :</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right font-bold">{profitLossData.calculations.totalDebit.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Credit Column */}
              <div className="flex-1">
                <table className="w-full border-collapse border">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-400 py-2 px-3 text-left text-sm font-semibold">PARTICULARS</th>
                      <th className="border border-gray-400 py-2 px-3 text-right text-sm font-semibold">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profitLossData.creditEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 py-2 px-3 text-sm">{entry.particular}</td>
                        <td className="border border-gray-300 py-2 px-3 text-sm text-right">{entry.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                    
                    {/* Total Credit Amount */}
                    <tr className="bg-green-200">
                      <td className="border border-gray-300 py-2 px-3 text-sm font-bold">Total Credit Amount :</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right font-bold">{profitLossData.calculations.totalCreditAmount.toFixed(2)}</td>
                    </tr>
                    
                    {/* Separator */}
                    <tr>
                      <td className="border border-gray-300 py-1 px-3 text-sm text-center" colSpan="2">----</td>
                    </tr>
                    
                    {/* Additional Calculations */}
                    <tr>
                      <td className="border border-gray-300 py-2 px-3 text-sm">Previous Gross Profit/Loss</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right">{profitLossData.calculations.previousGrossProfit.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 py-2 px-3 text-sm">Indirect Income :</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right">{profitLossData.calculations.indirectIncome.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 py-2 px-3 text-sm font-bold">Total Credit :</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm text-right font-bold">{profitLossData.calculations.totalCredit.toFixed(2)}</td>
                    </tr>
                    
                    {/* Empty rows to match debit side */}
                    <tr>
                      <td className="border border-gray-300 py-2 px-3 text-sm">&nbsp;</td>
                      <td className="border border-gray-300 py-2 px-3 text-sm">&nbsp;</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary Information */}
          <div className="mt-4 text-sm text-gray-600">
            <p>Report Period: {fromDate} to {toDate}</p>
            <p>Total Items: {profitLossData.debitEntries.length + profitLossData.creditEntries.length}</p>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}