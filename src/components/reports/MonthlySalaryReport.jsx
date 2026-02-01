'use client'

import { useState } from 'react'

export default function MonthlySalaryReport() {
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedMonth, setSelectedMonth] = useState('August')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Year options
  const yearOptions = ['2023', '2024', '2025', '2026']

  // Month options
  const monthOptions = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Sample salary data matching the screenshot structure
  const [salaryData] = useState([
    {
      id: 1,
      sl: 1,
      name: 'q',
      department: '',
      designation: '',
      salary: 21000.00,
      attendance: 0,
      leaveWithPay: 0,
      deduction: 0.00,
      conveyance: 0.00,
      ma: 0.00,
      ta: 0.00,
      da: 0.00,
      othersCommission: 0.00,
      salesAmount: 0.00,
      commissionPercent: 0.00,
      salesCommission: 0.00,
      paidPay: 0.00
    },
    {
      id: 2,
      sl: 2,
      name: 'Khawar Zahid',
      department: 'Logistics',
      designation: 'Junior Accountant',
      salary: 25000.00,
      attendance: 0,
      leaveWithPay: 0,
      deduction: 0.00,
      conveyance: 0.00,
      ma: 0.00,
      ta: 0.00,
      da: 0.00,
      othersCommission: 0.00,
      salesAmount: 0.00,
      commissionPercent: 25000.00,
      salesCommission: 0.00,
      paidPay: 0.00
    },
    {
      id: 3,
      sl: 3,
      name: 'wwq',
      department: 'Account',
      designation: 'Cashier',
      salary: 24000.00,
      attendance: 1,
      leaveWithPay: 1,
      deduction: 0.00,
      conveyance: 0.00,
      ma: 0.00,
      ta: 0.00,
      da: 0.00,
      othersCommission: 0.00,
      salesAmount: 0.00,
      commissionPercent: 2.00,
      salesCommission: 0.00,
      paidPay: 1.60
    },
    {
      id: 4,
      sl: 4,
      name: 'xxx',
      department: '',
      designation: '',
      salary: 25000.00,
      attendance: 1,
      leaveWithPay: 1,
      deduction: 0.00,
      conveyance: 0.00,
      ma: 0.00,
      ta: 0.00,
      da: 0.00,
      othersCommission: 0.00,
      salesAmount: 0.00,
      commissionPercent: 0.00,
      salesCommission: 0.00,
      paidPay: 1.60
    }
  ])

  const [filteredData, setFilteredData] = useState(salaryData)

  // Calculate totals
  const totalSalary = filteredData.reduce((sum, item) => sum + item.salary, 0)
  const totalAttendance = filteredData.reduce((sum, item) => sum + item.attendance, 0)
  const totalLeaveWithPay = filteredData.reduce((sum, item) => sum + item.leaveWithPay, 0)
  const totalDeduction = filteredData.reduce((sum, item) => sum + item.deduction, 0)
  const totalConveyance = filteredData.reduce((sum, item) => sum + item.conveyance, 0)
  const totalMA = filteredData.reduce((sum, item) => sum + item.ma, 0)
  const totalTA = filteredData.reduce((sum, item) => sum + item.ta, 0)
  const totalDA = filteredData.reduce((sum, item) => sum + item.da, 0)
  const totalOthersCommission = filteredData.reduce((sum, item) => sum + item.othersCommission, 0)
  const totalSalesAmount = filteredData.reduce((sum, item) => sum + item.salesAmount, 0)
  const totalCommissionPercent = filteredData.reduce((sum, item) => sum + item.commissionPercent, 0)
  const totalSalesCommission = filteredData.reduce((sum, item) => sum + item.salesCommission, 0)
  const totalPaidPay = filteredData.reduce((sum, item) => sum + item.paidPay, 0)

  const handleGetReport = () => {
    console.log('Generating salary report for:', {
      year: selectedYear,
      month: selectedMonth
    })
    setShowReport(true)
    setCurrentPage(1)
    setSearchTerm('')
    
    // Here you would typically filter data based on year and month
    // For now, we'll use all data
    setFilteredData(salaryData)
    setShowSearch(false)
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredData(salaryData)
    } else {
      const filtered = salaryData.filter(entry =>
        entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.designation.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(salaryData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Monthly Salary Payable Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
            th, td { border: 1px solid #ddd; padding: 4px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Monthly Salary Payable Report</h1>
          <p>Year: ${selectedYear} | Month: ${selectedMonth}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Attendance</th>
                <th>Leave With Pay</th>
                <th>Deduction</th>
                <th>Conveyance</th>
                <th>MA</th>
                <th>TA</th>
                <th>DA</th>
                <th>Others Commission</th>
                <th>Sales Amount</th>
                <th>Commission%</th>
                <th>Sales Commission</th>
                <th>Paid Pay</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.name}</td>
                  <td>${entry.department}</td>
                  <td>${entry.designation}</td>
                  <td class="amount">${entry.salary.toFixed(2)}</td>
                  <td class="amount">${entry.attendance}</td>
                  <td class="amount">${entry.leaveWithPay}</td>
                  <td class="amount">${entry.deduction.toFixed(2)}</td>
                  <td class="amount">${entry.conveyance.toFixed(2)}</td>
                  <td class="amount">${entry.ma.toFixed(2)}</td>
                  <td class="amount">${entry.ta.toFixed(2)}</td>
                  <td class="amount">${entry.da.toFixed(2)}</td>
                  <td class="amount">${entry.othersCommission.toFixed(2)}</td>
                  <td class="amount">${entry.salesAmount.toFixed(2)}</td>
                  <td class="amount">${entry.commissionPercent.toFixed(2)}</td>
                  <td class="amount">${entry.salesCommission.toFixed(2)}</td>
                  <td class="amount">${entry.paidPay.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4"><strong>Grand Total :</strong></td>
                <td class="amount"><strong>${totalSalary.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalAttendance}</strong></td>
                <td class="amount"><strong>${totalLeaveWithPay}</strong></td>
                <td class="amount"><strong>${totalDeduction.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalConveyance.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalMA.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalTA.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalDA.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalOthersCommission.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalSalesAmount.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalCommissionPercent.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalSalesCommission.toFixed(2)}</strong></td>
                <td class="amount"><strong>${totalPaidPay.toFixed(2)}</strong></td>
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
      ['SL', 'Name', 'Department', 'Designation', 'Salary', 'Attendance', 'Leave With Pay', 'Deduction', 'Conveyance', 'MA', 'TA', 'DA', 'Others Commission', 'Sales Amount', 'Commission%', 'Sales Commission', 'Paid Pay'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.name,
        entry.department,
        entry.designation,
        entry.salary.toFixed(2),
        entry.attendance,
        entry.leaveWithPay,
        entry.deduction.toFixed(2),
        entry.conveyance.toFixed(2),
        entry.ma.toFixed(2),
        entry.ta.toFixed(2),
        entry.da.toFixed(2),
        entry.othersCommission.toFixed(2),
        entry.salesAmount.toFixed(2),
        entry.commissionPercent.toFixed(2),
        entry.salesCommission.toFixed(2),
        entry.paidPay.toFixed(2)
      ]),
      ['Grand Total', '', '', '', totalSalary.toFixed(2), totalAttendance, totalLeaveWithPay, totalDeduction.toFixed(2), totalConveyance.toFixed(2), totalMA.toFixed(2), totalTA.toFixed(2), totalDA.toFixed(2), totalOthersCommission.toFixed(2), totalSalesAmount.toFixed(2), totalCommissionPercent.toFixed(2), totalSalesCommission.toFixed(2), totalPaidPay.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'monthly_salary_report.csv'
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
          <h2 className="font-medium text-lg">Monthly Salary Payable Report</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Pay of Year</label>
              <select 
                className="w-32 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Pay of Month</label>
              <select 
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {monthOptions.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
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
            <h3 className="text-lg font-medium">Monthly Salary Payable Report</h3>
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
                placeholder="Search by name, department, or designation..."
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
            <table className="max-w-4xl text-xs">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">SL</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Name</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Department</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Designation</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Salary</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Attendance</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Leave With Pay</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Deduction</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Conveyance</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">MA</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">TA</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">DA</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Others Commission</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Sales Amount</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Commission%</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700 border-r">Sales Commission</th>
                  <th className="text-center py-2 px-2 font-semibold text-gray-700">Paid Pay</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-2 text-center border-r">{entry.sl}</td>
                        <td className="py-2 px-2 border-r">{entry.name}</td>
                        <td className="py-2 px-2 border-r">{entry.department}</td>
                        <td className="py-2 px-2 border-r">{entry.designation}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.salary.toFixed(2)}</td>
                        <td className="py-2 px-2 text-center border-r">{entry.attendance}</td>
                        <td className="py-2 px-2 text-center border-r">{entry.leaveWithPay}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.deduction.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.conveyance.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.ma.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.ta.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.da.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.othersCommission.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.salesAmount.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.commissionPercent.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right border-r">{entry.salesCommission.toFixed(2)}</td>
                        <td className="py-2 px-2 text-right">{entry.paidPay.toFixed(2)}</td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-2 font-bold text-center border-r" colSpan="4">
                        Grand Total :
                      </td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalSalary.toFixed(2)}</td>
                      <td className="py-2 px-2 text-center font-bold border-r">{totalAttendance.toFixed(0)}</td>
                      <td className="py-2 px-2 text-center font-bold border-r">{totalLeaveWithPay.toFixed(0)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalDeduction.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalConveyance.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalMA.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalTA.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalDA.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalOthersCommission.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalSalesAmount.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalCommissionPercent.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold border-r">{totalSalesCommission.toFixed(2)}</td>
                      <td className="py-2 px-2 text-right font-bold">{totalPaidPay.toFixed(2)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="17" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching records found' : 'No data available for selected period'}
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
                <span className="font-medium text-gray-600">Total Employees:</span>
                <div className="text-lg font-bold text-blue-600">{filteredData.length}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Salary:</span>
                <div className="text-lg font-bold text-purple-600">{totalSalary.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Attendance:</span>
                <div className="text-lg font-bold text-green-600">{totalAttendance}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Paid:</span>
                <div className="text-lg font-bold text-orange-600">{totalPaidPay.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}