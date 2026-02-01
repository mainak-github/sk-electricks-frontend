'use client'

import { useState, useEffect } from 'react'
import config from '../../../url' // Adjust path as needed

export default function MonthlySalaryReport() {
  const [filters, setFilters] = useState({
    payYear: new Date().getFullYear().toString(),
    payMonth: new Date().toLocaleString('default', { month: 'long' })
  })

  const [salaryData, setSalaryData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Additional states
  const [paymentData, setPaymentData] = useState([])
  const [statistics, setStatistics] = useState(null)

  // Load initial statistics
  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.payMonth) params.append('payMonth', filters.payMonth)
      if (filters.payYear) params.append('payYear', filters.payYear)

      const response = await fetch(`${config.API_URL}/salary/stats?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setStatistics(data.data)
      }
    } catch (error) {
      console.error('❌ Error loading statistics:', error)
    }
  }

  const loadSalaryPayments = async () => {
    try {
      console.log('🔍 Loading salary payments for:', filters.payMonth, filters.payYear)
      
      const params = new URLSearchParams({
        payMonth: filters.payMonth,
        payYear: filters.payYear,
        limit: 1000 // Get all payments for the month
      })

      const response = await fetch(`${config.API_URL}/salary?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setPaymentData(data.data || [])
        console.log('✅ Loaded salary payments:', data.data?.length || 0)
        return data.data || []
      } else {
        console.log('⚠️ No salary payments found for this period')
        setPaymentData([])
        return []
      }
    } catch (error) {
      console.error('❌ Error loading salary payments:', error)
      setError('Failed to load salary payments: ' + error.message)
      return []
    }
  }

  const processSalaryData = async (payments) => {
    if (!payments || payments.length === 0) {
      console.log('⚠️ No payments to process')
      return []
    }

    console.log('🔄 Processing salary data for', payments.length, 'payments')

    // Group payments by employee (in case there are multiple payments per employee)
    const employeePayments = {}
    payments.forEach(payment => {
      const employeeId = payment.employeeId?._id || payment.employeeId
      const employeeName = payment.employeeName || payment.employeeId?.employeeName || 'N/A'
      const employeeCode = payment.employeeId?.employeeCode || 'N/A'
      const department = payment.employeeId?.selectDepartment || 'N/A'
      const designation = payment.employeeId?.selectDesignation || 'N/A'
      const basicSalary = payment.employeeId?.salary || 0

      if (!employeePayments[employeeId]) {
        employeePayments[employeeId] = {
          employeeId,
          employeeName,
          employeeCode,
          department,
          designation,
          basicSalary,
          payments: []
        }
      }
      employeePayments[employeeId].payments.push(payment)
    })

    // Process each employee's salary data
    const processed = Object.values(employeePayments).map((emp, index) => {
      // Calculate total payments for this employee
      const totalPaid = emp.payments.reduce((sum, payment) => sum + (payment.paymentAmount || 0), 0)
      
      // Get the most recent payment for other details
      const latestPayment = emp.payments[emp.payments.length - 1]
      
      // Mock calculations (you can enhance these based on your business logic)
      const attendance = Math.floor(Math.random() * 25) + 1 // Mock attendance (you can integrate with attendance API)
      const leaveWithPay = Math.floor(Math.random() * 3) // Mock leave days
      const deduction = emp.basicSalary * 0.02 // 2% deduction for PF/ESI
      const conveyance = attendance > 20 ? 2000 : (attendance * 100)
      const ma = emp.basicSalary >= 25000 ? 1000 : 500 // Medical Allowance
      const ta = attendance > 15 ? 800 : 0 // Travel Allowance  
      const da = emp.basicSalary >= 30000 ? 600 : 300 // Dearness Allowance
      
      // Sales commission from payment data or employee data
      const salesCommissionPercent = emp.payments[0]?.commissionPercent || 0
      const salesAmount = Math.random() * 50000 // Mock sales data
      const salesCommission = (salesAmount * salesCommissionPercent) / 100
      
      return {
        id: emp.employeeId,
        sl: index + 1,
        name: emp.employeeName,
        employeeCode: emp.employeeCode,
        department: emp.department,
        designation: emp.designation,
        salary: emp.basicSalary,
        attendance,
        leaveWithPay,
        deduction,
        conveyance,
        ma,
        ta,
        da,
        othersCommission: 0,
        salesAmount,
        salesCommissionPercent,
        salesCommission,
        paidPayable: totalPaid, // Actual amount paid
        payYear: filters.payYear,
        payMonth: filters.payMonth,
        // Additional info
        totalPayments: emp.payments.length,
        paymentDates: emp.payments.map(p => new Date(p.entryDate).toLocaleDateString('en-GB')).join(', '),
        paymentTypes: [...new Set(emp.payments.map(p => p.paymentType))].join(', ')
      }
    })

    console.log('✅ Processed salary data for', processed.length, 'employees')
    return processed
  }

  // Calculate totals
  const calculateTotals = (data) => {
    return data.reduce((totals, item) => ({
      salary: totals.salary + (item.salary || 0),
      attendance: totals.attendance + (item.attendance || 0),
      leaveWithPay: totals.leaveWithPay + (item.leaveWithPay || 0),
      deduction: totals.deduction + (item.deduction || 0),
      conveyance: totals.conveyance + (item.conveyance || 0),
      ma: totals.ma + (item.ma || 0),
      ta: totals.ta + (item.ta || 0),
      da: totals.da + (item.da || 0),
      othersCommission: totals.othersCommission + (item.othersCommission || 0),
      salesAmount: totals.salesAmount + (item.salesAmount || 0),
      salesCommissionPercent: totals.salesCommissionPercent + (item.salesCommissionPercent || 0),
      salesCommission: totals.salesCommission + (item.salesCommission || 0),
      paidPayable: totals.paidPayable + (item.paidPayable || 0)
    }), {
      salary: 0, attendance: 0, leaveWithPay: 0, deduction: 0, conveyance: 0,
      ma: 0, ta: 0, da: 0, othersCommission: 0, salesAmount: 0,
      salesCommissionPercent: 0, salesCommission: 0, paidPayable: 0
    })
  }

  const totals = calculateTotals(filteredData)

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGetReport = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      console.log('🔍 Generating report for:', filters.payMonth, filters.payYear)
      
      // Load salary payments for the selected month/year
      const payments = await loadSalaryPayments()
      
      if (payments.length === 0) {
        setSalaryData([])
        setFilteredData([])
        setSuccess(`ℹ️ No salary payments found for ${filters.payMonth} ${filters.payYear}`)
        return
      }
      
      // Process the payment data into salary report format
      const processed = await processSalaryData(payments)
      setSalaryData(processed)
      setFilteredData(processed)
      setCurrentPage(1)
      
      // Apply search if active
      if (searchTerm.trim() !== '') {
        handleSearch(processed)
      }
      
      // Refresh statistics
      await loadStatistics()
      
      setSuccess(`✅ Generated salary report for ${processed.length} employees with payments in ${filters.payMonth} ${filters.payYear}`)
      console.log('✅ Report generated successfully')
      
    } catch (error) {
      console.error('❌ Error generating report:', error)
      setError('Failed to generate report: ' + error.message)
      setSalaryData([])
      setFilteredData([])
    } finally {
      setLoading(false)
    }
  }

  // Search functionality
  const handleSearch = (dataToSearch = salaryData) => {
    if (searchTerm.trim() === '') {
      setFilteredData(dataToSearch)
    } else {
      const searchFiltered = dataToSearch.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.employeeCode && item.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredData(searchFiltered)
    }
    setCurrentPage(1)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(salaryData)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Monthly Salary Payable Report - Fayullah Factory</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 12px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 3px solid #0f766e;
              padding-bottom: 20px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #0f766e;
              margin-bottom: 10px;
            }
            .filters {
              margin-bottom: 20px;
              text-align: center;
              background-color: #f0f9ff;
              padding: 15px;
              border-radius: 8px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              font-size: 10px;
            }
            th, td { 
              border: 1px solid #333; 
              padding: 4px; 
              text-align: center; 
            }
            th { 
              background-color: #f2f2f2; 
              font-weight: bold; 
              font-size: 9px;
            }
            .total-row {
              font-weight: bold;
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🏭 Fayullah Factory</div>
            <h2>Monthly Salary Payable Report</h2>
            <div>Only employees with salary payments</div>
          </div>
          <div class="filters">
            <p><strong>Pay Year:</strong> ${filters.payYear} | <strong>Pay Month:</strong> ${filters.payMonth}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Employees with Payments:</strong> ${filteredData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th rowspan="2">SL</th>
                <th rowspan="2">Employee Code</th>
                <th rowspan="2">Name</th>
                <th rowspan="2">Department</th>
                <th rowspan="2">Designation</th>
                
                <th rowspan="2">Attendance</th>
                <th rowspan="2">Leave With Pay</th>
                <th rowspan="2">Deduction</th>
               
                <th rowspan="2">MA</th>
                <th rowspan="2">TA</th>
                <th rowspan="2">DA</th>
                <th rowspan="2">Others Commission</th>
                <th colspan="3">Sales</th>
                <th rowspan="2">Amount Paid</th>
              </tr>
              <tr>
                <th>Amount</th>
                <th>Commission%</th>
                <th>Commission</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map(item => `
                <tr>
                  <td>${item.sl}</td>
                  <td>${item.employeeCode || 'N/A'}</td>
                  <td style="text-align: left;">${item.name}</td>
                  <td style="text-align: left;">${item.department}</td>
                  <td style="text-align: left;">${item.designation}</td>
                  <td>₹${item.salary.toFixed(2)}</td>
                  <td>${item.attendance}</td>
                  <td>${item.leaveWithPay}</td>
                  <td>₹${item.deduction.toFixed(2)}</td>
                  <td>₹${item.conveyance.toFixed(2)}</td>
                  <td>₹${item.ma.toFixed(2)}</td>
                  <td>₹${item.ta.toFixed(2)}</td>
                  <td>₹${item.da.toFixed(2)}</td>
                  <td>₹${item.othersCommission.toFixed(2)}</td>
                  <td>₹${item.salesAmount.toFixed(2)}</td>
                  <td>${item.salesCommissionPercent.toFixed(2)}%</td>
                  <td>₹${item.salesCommission.toFixed(2)}</td>
                  <td>₹${item.paidPayable.toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>Grand Total:</strong></td>
                <td><strong>₹${totals.salary.toFixed(2)}</strong></td>
                <td><strong>${totals.attendance}</strong></td>
                <td><strong>${totals.leaveWithPay}</strong></td>
                <td><strong>₹${totals.deduction.toFixed(2)}</strong></td>
                <td><strong>₹${totals.conveyance.toFixed(2)}</strong></td>
                <td><strong>₹${totals.ma.toFixed(2)}</strong></td>
                <td><strong>₹${totals.ta.toFixed(2)}</strong></td>
                <td><strong>₹${totals.da.toFixed(2)}</strong></td>
                <td><strong>₹${totals.othersCommission.toFixed(2)}</strong></td>
                <td><strong>₹${totals.salesAmount.toFixed(2)}</strong></td>
                <td><strong>${totals.salesCommissionPercent.toFixed(2)}%</strong></td>
                <td><strong>₹${totals.salesCommission.toFixed(2)}</strong></td>
                <td><strong>₹${totals.paidPayable.toFixed(2)}</strong></td>
              </tr>
            </tbody>
          </table>
          <div class="footer">
            Monthly Salary Report - Only Employees with Salary Payments<br>
            Professional Salary Management System - Fayullah Factory<br>
            Generated by SuperAdmin on ${new Date().toLocaleString()}
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
      ['SL', 'Employee Code', 'Name', 'Department', 'Designation', 'Attendance', 'Leave With Pay', 'Deduction', 'MA', 'TA', 'DA', 'Others Commission', 'Sales Amount', 'Sales Commission%', 'Sales Commission', 'Amount Paid', 'Payment Count', 'Payment Dates', 'Payment Types'],
      ...filteredData.map(item => [
        item.sl,
        item.employeeCode || 'N/A',
        item.name,
        item.department,
        item.designation,
        item.salary,
        item.attendance,
        item.leaveWithPay,
        item.deduction,
        item.conveyance,
        item.ma,
        item.ta,
        item.da,
        item.othersCommission,
        item.salesAmount,
        item.salesCommissionPercent,
        item.salesCommission,
        item.paidPayable,
        item.totalPayments,
        item.paymentDates,
        item.paymentTypes
      ]),
      ['Grand Total:', '', '', '', '', totals.salary, totals.attendance, totals.leaveWithPay, totals.deduction, totals.conveyance, totals.ma, totals.ta, totals.da, totals.othersCommission, totals.salesAmount, totals.salesCommissionPercent, totals.salesCommission, totals.paidPayable, '', '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `monthly_salary_report_${filters.payMonth}_${filters.payYear}_paid_employees_only.csv`
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

  // Clear success/error messages after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 8000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">📊 Monthly Salary Report</h1>
                <p className="text-teal-100">Only employees with salary payments for the selected month</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">👤 SuperAdmin</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">💼 Finance Department</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">📅 {new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">🏭 Fayullah Factory</div>
                <div className="text-teal-200">Smart Manufacturing Unit</div>
                <div className="text-xs opacity-80 mt-2">Paid Employees Report</div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="p-6 bg-gradient-to-r from-gray-50 to-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">💰</div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ₹{statistics.totalAmount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-green-700 font-medium">Total Paid This Month</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">👥</div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{statistics.totalPayments || 0}</div>
                      <div className="text-sm text-blue-700 font-medium">Payments Made</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">📈</div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        ₹{statistics.avgPayment?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-purple-700 font-medium">Average Payment</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">📊</div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">{filteredData.length}</div>
                      <div className="text-sm text-orange-700 font-medium">Employees Paid</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter Section */}
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Report Configuration</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <div className="text-sm text-yellow-800">
                <strong>ℹ️ Note:</strong> This report shows only employees who have received salary payments in the selected month/year period.
              </div>
            </div>
            <div className="flex items-end gap-4 mb-4">
              {/* Select Pay of Year */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Pay Year</label>
                <select 
                  className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 min-w-[120px] bg-white"
                  value={filters.payYear}
                  onChange={(e) => handleFilterChange('payYear', e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>

              {/* Select Pay of Month */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Pay Month</label>
                <select 
                  className="border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 min-w-[120px] bg-white"
                  value={filters.payMonth}
                  onChange={(e) => handleFilterChange('payMonth', e.target.value)}
                >
                  <option value="January">January</option>
                  <option value="February">February</option>
                  <option value="March">March</option>
                  <option value="April">April</option>
                  <option value="May">May</option>
                  <option value="June">June</option>
                  <option value="July">July</option>
                  <option value="August">August</option>
                  <option value="September">September</option>
                  <option value="October">October</option>
                  <option value="November">November</option>
                  <option value="December">December</option>
                </select>
              </div>

              {/* Get Report Button */}
              <button 
                onClick={handleGetReport}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-lg font-bold"
              >
                {loading ? '⏳ Processing...' : '🔍 Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-green-600 text-2xl mr-4">✅</div>
              <div>
                <h3 className="text-green-800 font-bold text-lg">Success!</h3>
                <p className="text-green-700">{success}</p>
              </div>
              <button 
                onClick={() => setSuccess(null)}
                className="ml-auto text-green-600 hover:text-green-800 text-xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-red-600 text-2xl mr-4">⚠️</div>
              <div>
                <h3 className="text-red-800 font-bold text-lg">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-800 text-xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Report Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">📊 Employees with Salary Payments</h3>
                <p className="text-gray-600 mt-1">
                  {loading ? 'Processing...' : 
                   filteredData.length === 0 ? 'No employees with payments found' :
                   `${filteredData.length} employee${filteredData.length !== 1 ? 's' : ''} received payments in ${filters.payMonth} ${filters.payYear}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-md"
                  title="Search"
                >
                  🔍
                </button>
                <button 
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
                  className="p-3 border-2 border-blue-200 rounded-xl hover:bg-blue-50 disabled:opacity-50 transition-all shadow-md"
                  title="Export to CSV"
                >
                  📤
                </button>
                <button 
                  onClick={handlePrint}
                  disabled={filteredData.length === 0}
                  className="p-3 border-2 border-purple-200 rounded-xl hover:bg-purple-50 disabled:opacity-50 transition-all shadow-md"
                  title="Print"
                >
                  🖨️
                </button>
              </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name, department, designation, or employee code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                />
                <button 
                  onClick={() => handleSearch()}
                  className="bg-teal-600 text-white px-6 py-3 rounded-xl text-sm hover:bg-teal-700 transition-colors font-bold"
                >
                  Search
                </button>
                <button 
                  onClick={handleClearSearch}
                  className="bg-gray-500 text-white px-6 py-3 rounded-xl text-sm hover:bg-gray-600 transition-colors font-bold"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Report Period Info */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl mb-6 border border-blue-200">
              <div className="text-sm">
                <span className="font-bold text-blue-800">Report Period: </span>
                <span className="text-blue-700">
                  {filters.payMonth} {filters.payYear} | 
                  Employees with Payments: {filteredData.length} | 
                  Total Payments: ₹{totals.paidPayable.toLocaleString()} | 
                  Generated: {new Date().toLocaleString('en-GB')}
                </span>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="relative">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600"></div>
                <p className="mt-4 text-gray-600 font-medium text-lg">Loading salary payments...</p>
              </div>
            ) : (
              <div className="overflow-auto max-h-96 border-t border-gray-300" style={{ width: '100%', overflowX: 'auto' }}>
                <table className="w-full text-xs" style={{ minWidth: '1200px' }}>
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-8">SL</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-20">Code</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-24">Name</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-20">Dept.</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-24">Designation</th>
                      {/* <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-16">Basic Salary</th> */}
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-12">Att.</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-12">Leave</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-16">Deduction</th>
                      {/* <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-16">Convey.</th> */}
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-12">MA</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-12">TA</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-12">DA</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-16">Others</th>
                      <th colSpan="3" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50">Sales</th>
                      <th rowSpan="2" className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-20">Amount Paid</th>
                    </tr>
                    <tr>
                      <th className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-16">Amount</th>
                      <th className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-12">%</th>
                      <th className="border border-gray-300 p-2 font-semibold text-gray-700 bg-gray-50 w-16">Comm.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentEntries.length > 0 ? (
                      <>
                        {currentEntries.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 p-2 text-center text-xs">{item.sl}</td>
                            <td className="border border-gray-300 p-2 text-left text-xs font-medium" title={item.employeeCode}>
                              {item.employeeCode || 'N/A'}
                            </td>
                            <td className="border border-gray-300 p-2 text-left text-xs font-medium" title={item.name}>
                              {item.name}
                            </td>
                            <td className="border border-gray-300 p-2 text-left text-xs" title={item.department}>
                              {item.department}
                            </td>
                            <td className="border border-gray-300 p-2 text-left text-xs" title={item.designation}>
                              {item.designation}
                            </td>
                            <td className="border border-gray-300 p-2 text-right text-xs font-medium">
                              ₹{(item.salary/1000).toFixed(0)}k
                            </td>
                            <td className="border border-gray-300 p-2 text-center text-xs">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                item.attendance >= 22 ? 'bg-green-100 text-green-800' : 
                                item.attendance >= 15 ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-red-100 text-red-800'
                              }`}>
                                {item.attendance}
                              </span>
                            </td>
                            <td className="border border-gray-300 p-2 text-center text-xs">{item.leaveWithPay}</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">₹{item.deduction.toFixed(0)}</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">₹{item.conveyance.toFixed(0)}</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">₹{item.ma.toFixed(0)}</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">₹{item.ta.toFixed(0)}</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">₹{item.da.toFixed(0)}</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">₹{item.othersCommission.toFixed(0)}</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">₹{(item.salesAmount/1000).toFixed(0)}k</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">{item.salesCommissionPercent.toFixed(1)}%</td>
                            <td className="border border-gray-300 p-2 text-right text-xs">₹{item.salesCommission.toFixed(0)}</td>
                            <td className="border border-gray-300 p-2 text-right text-xs font-bold text-green-600" title={`${item.totalPayments} payment(s) on: ${item.paymentDates}`}>
                              ₹{(item.paidPayable/1000).toFixed(1)}k
                            </td>
                          </tr>
                        ))}
                        {/* Grand Total Row */}
                        <tr className="bg-gradient-to-r from-teal-50 to-cyan-50 font-bold sticky bottom-0">
                          <td colSpan="5" className="border border-gray-300 p-2 text-center bg-teal-50 text-xs font-bold">
                            Grand Total ({filteredData.length} employees):
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{(totals.salary/1000).toFixed(0)}k
                          </td>
                          <td className="border border-gray-300 p-2 text-center bg-teal-50 text-xs font-bold">
                            {totals.attendance.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-center bg-teal-50 text-xs font-bold">
                            {totals.leaveWithPay.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{totals.deduction.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{totals.conveyance.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{totals.ma.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{totals.ta.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{totals.da.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{totals.othersCommission.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{(totals.salesAmount/1000).toFixed(0)}k
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            {totals.salesCommissionPercent.toFixed(1)}%
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold">
                            ₹{totals.salesCommission.toFixed(0)}
                          </td>
                          <td className="border border-gray-300 p-2 text-right bg-teal-50 text-xs font-bold text-green-600">
                            ₹{(totals.paidPayable/1000).toFixed(1)}k
                          </td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan="18" className="border border-gray-300 p-8 text-center text-gray-500">
                          {searchTerm ? 'No matching records found' : 
                           'No salary payments found for the selected month/year. Click "Generate Report" to load data.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredData.length > 0 && (
              <div className="flex justify-between items-center mt-6 p-6 border-t border-gray-200 bg-gray-50 text-sm">
                <div className="flex items-center gap-2">
                  <span>Rows per page:</span>
                  <select 
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="border-2 border-gray-300 rounded-lg px-3 py-1"
                  >
                    <option value="5">5</option>
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
                      disabled={currentPage === 1}
                      className="px-3 py-1 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ◀ Prev
                    </button>
                    <div className="px-3 py-1 bg-teal-100 text-teal-800 rounded-lg font-bold">
                      Page {currentPage} of {totalPages || 1}
                    </div>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next ▶
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
