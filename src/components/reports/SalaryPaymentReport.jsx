'use client'

import { useState } from 'react'

export default function SalaryPaymentReport() {
  const [filterType, setFilterType] = useState('All')
  const [recordType, setRecordType] = useState('without details')
  const [fromDate, setFromDate] = useState('24/08/2025')
  const [toDate, setToDate] = useState('24/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample salary payment data with Indian business context
  const [salaryPaymentData] = useState([
    { 
      id: 1, 
      sl: 1, 
      date: '24/08/2025',
      employeeId: 'EMP-001',
      employeeName: 'Rajesh Kumar',
      designation: 'Production Manager',
      department: 'Manufacturing',
      basicSalary: 45000.00,
      allowances: 8000.00,
      overtimePay: 2500.00,
      grossSalary: 55500.00,
      pf: 5400.00,
      esi: 445.00,
      incomeTax: 4200.00,
      totalDeductions: 10045.00,
      netSalary: 45455.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'HDFC-****1234',
      paymentStatus: 'Paid'
    },
    { 
      id: 2, 
      sl: 2, 
      date: '24/08/2025',
      employeeId: 'EMP-002',
      employeeName: 'Priya Singh',
      designation: 'Quality Control Engineer',
      department: 'Quality Assurance',
      basicSalary: 38000.00,
      allowances: 6500.00,
      overtimePay: 1800.00,
      grossSalary: 46300.00,
      pf: 4560.00,
      esi: 371.00,
      incomeTax: 2800.00,
      totalDeductions: 7731.00,
      netSalary: 38569.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'ICICI-****5678',
      paymentStatus: 'Paid'
    },
    { 
      id: 3, 
      sl: 3, 
      date: '24/08/2025',
      employeeId: 'EMP-003',
      employeeName: 'Amit Sharma',
      designation: 'Senior Technician',
      department: 'Production',
      basicSalary: 32000.00,
      allowances: 5200.00,
      overtimePay: 3200.00,
      grossSalary: 40400.00,
      pf: 3840.00,
      esi: 323.00,
      incomeTax: 1800.00,
      totalDeductions: 5963.00,
      netSalary: 34437.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'SBI-****9012',
      paymentStatus: 'Pending'
    },
    { 
      id: 4, 
      sl: 4, 
      date: '23/08/2025',
      employeeId: 'EMP-004',
      employeeName: 'Sneha Reddy',
      designation: 'Chemical Engineer',
      department: 'R&D',
      basicSalary: 48000.00,
      allowances: 9200.00,
      overtimePay: 0.00,
      grossSalary: 57200.00,
      pf: 5760.00,
      esi: 458.00,
      incomeTax: 5100.00,
      totalDeductions: 11318.00,
      netSalary: 45882.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'AXIS-****3456',
      paymentStatus: 'Processing'
    },
    { 
      id: 5, 
      sl: 5, 
      date: '23/08/2025',
      employeeId: 'EMP-005',
      employeeName: 'Vikram Patel',
      designation: 'Machine Operator',
      department: 'Production',
      basicSalary: 28000.00,
      allowances: 4200.00,
      overtimePay: 4500.00,
      grossSalary: 36700.00,
      pf: 3360.00,
      esi: 294.00,
      incomeTax: 1200.00,
      totalDeductions: 4854.00,
      netSalary: 31846.00,
      paymentMethod: 'Cash',
      bankAccount: 'N/A',
      paymentStatus: 'Paid'
    },
    { 
      id: 6, 
      sl: 6, 
      date: '22/08/2025',
      employeeId: 'EMP-006',
      employeeName: 'Anita Gupta',
      designation: 'HR Manager',
      department: 'Human Resources',
      basicSalary: 42000.00,
      allowances: 7800.00,
      overtimePay: 0.00,
      grossSalary: 49800.00,
      pf: 5040.00,
      esi: 398.00,
      incomeTax: 3600.00,
      totalDeductions: 9038.00,
      netSalary: 40762.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'PNB-****7890',
      paymentStatus: 'Paid'
    },
    { 
      id: 7, 
      sl: 7, 
      date: '22/08/2025',
      employeeId: 'EMP-007',
      employeeName: 'Rajesh Khanna',
      designation: 'Maintenance Supervisor',
      department: 'Maintenance',
      basicSalary: 35000.00,
      allowances: 6000.00,
      overtimePay: 2800.00,
      grossSalary: 43800.00,
      pf: 4200.00,
      esi: 350.00,
      incomeTax: 2400.00,
      totalDeductions: 6950.00,
      netSalary: 36850.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'BOI-****2468',
      paymentStatus: 'Failed'
    },
    { 
      id: 8, 
      sl: 8, 
      date: '21/08/2025',
      employeeId: 'EMP-008',
      employeeName: 'Meera Joshi',
      designation: 'Accounts Manager',
      department: 'Finance',
      basicSalary: 46000.00,
      allowances: 8500.00,
      overtimePay: 0.00,
      grossSalary: 54500.00,
      pf: 5520.00,
      esi: 436.00,
      incomeTax: 4800.00,
      totalDeductions: 10756.00,
      netSalary: 43744.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'CANARA-****1357',
      paymentStatus: 'Paid'
    },
    { 
      id: 9, 
      sl: 9, 
      date: '21/08/2025',
      employeeId: 'EMP-009',
      employeeName: 'Suresh Nair',
      designation: 'Safety Officer',
      department: 'Safety',
      basicSalary: 36000.00,
      allowances: 6300.00,
      overtimePay: 1500.00,
      grossSalary: 43800.00,
      pf: 4320.00,
      esi: 350.00,
      incomeTax: 2200.00,
      totalDeductions: 6870.00,
      netSalary: 36930.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'UCO-****9753',
      paymentStatus: 'Pending'
    },
    { 
      id: 10, 
      sl: 10, 
      date: '20/08/2025',
      employeeId: 'EMP-010',
      employeeName: 'Kavitha Menon',
      designation: 'IT Administrator',
      department: 'IT',
      basicSalary: 40000.00,
      allowances: 7200.00,
      overtimePay: 2200.00,
      grossSalary: 49400.00,
      pf: 4800.00,
      esi: 395.00,
      incomeTax: 3400.00,
      totalDeductions: 8595.00,
      netSalary: 40805.00,
      paymentMethod: 'Bank Transfer',
      bankAccount: 'KOTAK-****8642',
      paymentStatus: 'Paid'
    }
  ])

  const [filteredData, setFilteredData] = useState(salaryPaymentData)

  // Filter options for salary payment
  const filterTypeOptions = [
    'All',
    'Paid',
    'Pending',
    'Processing',
    'Failed',
    'Cancelled'
  ]

  const recordTypeOptions = [
    'without details',
    'with details'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalBasicSalary = filteredData.reduce((sum, item) => sum + item.basicSalary, 0)
  const totalAllowances = filteredData.reduce((sum, item) => sum + item.allowances, 0)
  const totalOvertimePay = filteredData.reduce((sum, item) => sum + item.overtimePay, 0)
  const totalGrossSalary = filteredData.reduce((sum, item) => sum + item.grossSalary, 0)
  const totalDeductionsSum = filteredData.reduce((sum, item) => sum + item.totalDeductions, 0)
  const totalNetSalary = filteredData.reduce((sum, item) => sum + item.netSalary, 0)
  const paidSalaries = filteredData.filter(item => item.paymentStatus === 'Paid').reduce((sum, item) => sum + item.netSalary, 0)
  const pendingSalaries = filteredData.filter(item => item.paymentStatus === 'Pending').reduce((sum, item) => sum + item.netSalary, 0)

  const handleGetReport = () => {
    console.log('Generating salary payment report with filters:', {
      filterType,
      recordType,
      fromDate,
      toDate
    })
    setShowReport(true)
    setCurrentPage(1)
    // Reset search when generating new report
    setSearchTerm('')
    
    // Apply filter based on filterType and date range
    let filtered = salaryPaymentData
    
    // Date filtering logic
    if (fromDate && toDate) {
      const fromDateObj = parseDate(fromDate)
      const toDateObj = parseDate(toDate)
      
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.date)
        return itemDate >= fromDateObj && itemDate <= toDateObj
      })
    }
    
    // Status filtering logic
    if (filterType !== 'All') {
      filtered = filtered.filter(item => 
        item.paymentStatus.toLowerCase() === filterType.toLowerCase()
      )
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
      setFilteredData(salaryPaymentData)
    } else {
      const filtered = salaryPaymentData.filter(entry =>
        entry.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.paymentStatus.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(salaryPaymentData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Salary Payment Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            .paid { color: #10b981; font-weight: bold; }
            .pending { color: #f59e0b; font-weight: bold; }
            .processing { color: #3b82f6; font-weight: bold; }
            .failed { color: #ef4444; font-weight: bold; }
            .cancelled { color: #6b7280; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Salary Payment Report</h1>
          <p>Filter: ${filterType} | Record Type: ${recordType}</p>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Employee ID</th>
                <th>Employee Name</th>
                <th>Designation</th>
                <th>Department</th>
                <th>Basic Salary</th>
                <th>Allowances</th>
                <th>Overtime Pay</th>
                <th>Gross Salary</th>
                <th>Total Deductions</th>
                <th>Net Salary</th>
                <th>Payment Method</th>
                <th>Bank Account</th>
                <th>Payment Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.date}</td>
                  <td>${entry.employeeId}</td>
                  <td>${entry.employeeName}</td>
                  <td>${entry.designation}</td>
                  <td>${entry.department}</td>
                  <td class="amount">₹${entry.basicSalary.toFixed(2)}</td>
                  <td class="amount">₹${entry.allowances.toFixed(2)}</td>
                  <td class="amount">₹${entry.overtimePay.toFixed(2)}</td>
                  <td class="amount">₹${entry.grossSalary.toFixed(2)}</td>
                  <td class="amount">₹${entry.totalDeductions.toFixed(2)}</td>
                  <td class="amount">₹${entry.netSalary.toFixed(2)}</td>
                  <td>${entry.paymentMethod}</td>
                  <td>${entry.bankAccount}</td>
                  <td>${entry.paymentStatus}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="6"><strong>Grand Total :</strong></td>
                <td class="amount"><strong>₹${totalBasicSalary.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalAllowances.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalOvertimePay.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalGrossSalary.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalDeductionsSum.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalNetSalary.toFixed(2)}</strong></td>
                <td colspan="3"></td>
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
      ['SL', 'Date', 'Employee ID', 'Employee Name', 'Designation', 'Department', 'Basic Salary', 'Allowances', 'Overtime Pay', 'Gross Salary', 'PF', 'ESI', 'Income Tax', 'Total Deductions', 'Net Salary', 'Payment Method', 'Bank Account', 'Payment Status'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.date,
        entry.employeeId,
        entry.employeeName,
        entry.designation,
        entry.department,
        entry.basicSalary.toFixed(2),
        entry.allowances.toFixed(2),
        entry.overtimePay.toFixed(2),
        entry.grossSalary.toFixed(2),
        entry.pf.toFixed(2),
        entry.esi.toFixed(2),
        entry.incomeTax.toFixed(2),
        entry.totalDeductions.toFixed(2),
        entry.netSalary.toFixed(2),
        entry.paymentMethod,
        entry.bankAccount,
        entry.paymentStatus
      ]),
      ['Grand Total', '', '', '', '', '', totalBasicSalary.toFixed(2), totalAllowances.toFixed(2), totalOvertimePay.toFixed(2), totalGrossSalary.toFixed(2), '', '', '', totalDeductionsSum.toFixed(2), totalNetSalary.toFixed(2), '', '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'salary_payment_report.csv'
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
          <h2 className="font-medium text-lg">Salary Payment Report</h2>
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
                {filterTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Record Type</label>
              <select 
                className="w-40 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
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
                🔍 REPORT
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
            <h3 className="text-lg font-medium">Salary Payment Report</h3>
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
                placeholder="Search by employee ID, name, designation, department, payment method or status..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Employee ID</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[120px]">Employee Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Designation</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Department</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Basic Salary</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Allowances</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Overtime Pay</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Gross Salary</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Total Deductions</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Net Salary</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Payment Method</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Bank Account</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs">{entry.date}</td>
                        <td className="py-2 px-3 text-xs font-medium text-blue-600">{entry.employeeId}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.employeeName}</td>
                        <td className="py-2 px-3 text-xs">{entry.designation}</td>
                        <td className="py-2 px-3 text-xs">{entry.department}</td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-purple-600">
                          ₹{entry.basicSalary.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-orange-600">
                          ₹{entry.allowances.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-pink-600">
                          ₹{entry.overtimePay.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-bold text-green-600">
                          ₹{entry.grossSalary.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-red-600">
                          ₹{entry.totalDeductions.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-bold text-cyan-600">
                          ₹{entry.netSalary.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs">{entry.paymentMethod}</td>
                        <td className="py-2 px-3 text-xs font-mono">{entry.bankAccount}</td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                            entry.paymentStatus === 'Pending' ? 'bg-orange-100 text-orange-800' :
                            entry.paymentStatus === 'Processing' ? 'bg-blue-100 text-blue-800' :
                            entry.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="6">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-purple-600">₹{totalBasicSalary.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-orange-600">₹{totalAllowances.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-pink-600">₹{totalOvertimePay.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-green-600">₹{totalGrossSalary.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-red-600">₹{totalDeductionsSum.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-cyan-600">₹{totalNetSalary.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right" colSpan="3"></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="15" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Employees:</span>
                <div className="text-lg font-bold text-blue-600">{totalEntries}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Basic Salary:</span>
                <div className="text-lg font-bold text-purple-600">₹{totalBasicSalary.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Gross Salary:</span>
                <div className="text-lg font-bold text-green-600">₹{totalGrossSalary.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Net Salary:</span>
                <div className="text-lg font-bold text-cyan-600">₹{totalNetSalary.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Total Allowances:</span>
                <div className="text-lg font-bold text-orange-600">₹{totalAllowances.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Overtime:</span>
                <div className="text-lg font-bold text-pink-600">₹{totalOvertimePay.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Deductions:</span>
                <div className="text-lg font-bold text-red-600">₹{totalDeductionsSum.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Paid Salaries:</span>
                <div className="text-lg font-bold text-green-600">₹{paidSalaries.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Pending Salaries:</span>
                <div className="text-lg font-bold text-orange-600">₹{pendingSalaries.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Payment Success Rate:</span>
                <div className="text-lg font-bold text-green-600">{totalNetSalary > 0 ? ((paidSalaries / totalNetSalary) * 100).toFixed(1) : '0.0'}%</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Average Salary:</span>
                <div className="text-lg font-bold text-indigo-600">₹{totalEntries > 0 ? (totalNetSalary / totalEntries).toFixed(2) : '0.00'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}