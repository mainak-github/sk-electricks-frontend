'use client'

import { useState, useEffect } from 'react'
import config from '../../../url' // Adjust path as needed

export default function SalaryPaymentReport() {
  const [filterData, setFilterData] = useState({
    filterType: '',
    fromDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    employeeId: '',
    payMonth: '',
    payYear: new Date().getFullYear().toString(),
    paymentFromAccount: '',
    status: ''
  })

  const [reportData, setReportData] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const itemsPerPage = 10

  // Additional data states
  const [employees, setEmployees] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [accounts, setAccounts] = useState([])

  // Load initial data
  useEffect(() => {
    loadEmployees()
    loadStatistics()
  }, [])

  const loadEmployees = async () => {
    try {
      const response = await fetch(`${config.API_URL}/salary/employees`)
      const data = await response.json()
      
      if (data.success) {
        setEmployees(data.data)
        console.log('✅ Loaded employees for salary report:', data.data.length)
      }
    } catch (error) {
      console.error('❌ Error loading employees:', error)
    }
  }

  const loadStatistics = async () => {
    try {
      const params = new URLSearchParams()
      if (filterData.payMonth) params.append('payMonth', filterData.payMonth)
      if (filterData.payYear) params.append('payYear', filterData.payYear)

      const response = await fetch(`${config.API_URL}/salary/stats?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setStatistics(data.data)
        // Extract unique accounts from statistics
        if (data.data.accountBreakdown) {
          setAccounts(Object.keys(data.data.accountBreakdown))
        }
      }
    } catch (error) {
      console.error('❌ Error loading statistics:', error)
    }
  }

  const filterTypes = [
    { value: '', label: 'All Records' },
    { value: 'employee', label: 'By Employee' },
    { value: 'month', label: 'By Month' },
    { value: 'year', label: 'By Year' },
    { value: 'account', label: 'By Account' },
    { value: 'status', label: 'By Status' },
    { value: 'date_range', label: 'By Date Range' }
  ]

  const months = [
    { value: '', label: 'All Months' },
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' }
  ]

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Paid', label: 'Paid' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Cancelled', label: 'Cancelled' }
  ]

  const handleInputChange = (field, value) => {
    setFilterData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerateReport = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      })

      // Add filters based on filter type and values
      if (filterData.fromDate) params.append('startDate', filterData.fromDate)
      if (filterData.toDate) params.append('endDate', filterData.toDate)
      if (filterData.employeeId) params.append('employeeId', filterData.employeeId)
      if (filterData.payMonth) params.append('payMonth', filterData.payMonth)
      if (filterData.payYear) params.append('payYear', filterData.payYear)
      if (filterData.paymentFromAccount) params.append('paymentFromAccount', filterData.paymentFromAccount)
      if (filterData.status) params.append('status', filterData.status)

      console.log('🔍 Fetching salary payments with params:', params.toString())

      const response = await fetch(`${config.API_URL}/salary?${params}`)
      const data = await response.json()

      if (data.success) {
        setReportData(data.data)
        setTotalPages(data.pagination?.totalPages || 1)
        setTotalCount(data.pagination?.totalCount || 0)
        setShowResults(true)
        console.log('✅ Loaded salary payments:', data.data.length, 'records')
      } else {
        throw new Error(data.message || 'Failed to fetch salary payments')
      }
      
    } catch (error) {
      console.error('❌ Error generating report:', error)
      setError(error.message)
      setReportData([])
      setShowResults(true)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber)
    
    // Re-fetch data for new page
    const params = new URLSearchParams({
      page: pageNumber.toString(),
      limit: itemsPerPage.toString()
    })

    if (filterData.fromDate) params.append('startDate', filterData.fromDate)
    if (filterData.toDate) params.append('endDate', filterData.toDate)
    if (filterData.employeeId) params.append('employeeId', filterData.employeeId)
    if (filterData.payMonth) params.append('payMonth', filterData.payMonth)
    if (filterData.payYear) params.append('payYear', filterData.payYear)
    if (filterData.paymentFromAccount) params.append('paymentFromAccount', filterData.paymentFromAccount)
    if (filterData.status) params.append('status', filterData.status)

    setLoading(true)
    try {
      const response = await fetch(`${config.API_URL}/salary?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setReportData(data.data)
      }
    } catch (error) {
      console.error('❌ Error loading page:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Salary Payment Report - Fayullah Factory</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0f766e; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            .report-title { font-size: 20px; margin-bottom: 20px; color: #1f2937; }
            .filter-info { text-align: center; margin-bottom: 20px; font-size: 14px; background-color: #f0f9ff; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .number { text-align: right; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .status-paid { background-color: #d4edda; color: #155724; padding: 2px 8px; border-radius: 4px; }
            .status-pending { background-color: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 4px; }
            .status-processing { background-color: #cce5ff; color: #004085; padding: 2px 8px; border-radius: 4px; }
            .status-cancelled { background-color: #f8d7da; color: #721c24; padding: 2px 8px; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🏭 Fayullah Factory</div>
            <div class="report-title">Salary Payment Report</div>
            <div class="filter-info">
              <strong>Report Period:</strong> ${filterData.fromDate} to ${filterData.toDate}<br>
              ${filterData.filterType ? `<strong>Filter Type:</strong> ${filterTypes.find(f => f.value === filterData.filterType)?.label}<br>` : ''}
              ${filterData.payMonth ? `<strong>Month:</strong> ${filterData.payMonth}<br>` : ''}
              ${filterData.payYear ? `<strong>Year:</strong> ${filterData.payYear}<br>` : ''}
              <strong>Generated on:</strong> ${new Date().toLocaleString()}<br>
              <strong>Total Records:</strong> ${totalCount}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Payment Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Payment Date</th>
                <th>Pay Month</th>
                <th>Pay Year</th>
                <th>Payment Type</th>
                <th>From Account</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.map(record => `
                <tr>
                  <td>${record.paymentCode || 'N/A'}</td>
                  <td>${record.employeeName || 'N/A'}</td>
                  <td>${record.employeeId?.selectDepartment || 'N/A'}</td>
                  <td>${new Date(record.entryDate).toLocaleDateString('en-GB')}</td>
                  <td>${record.payMonth || 'N/A'}</td>
                  <td>${record.payYear || 'N/A'}</td>
                  <td>${record.paymentType || 'N/A'}</td>
                  <td>${record.paymentFromAccount || 'N/A'}</td>
                  <td class="number">₹${record.paymentAmount?.toLocaleString() || '0'}</td>
                  <td><span class="status-${(record.status || '').toLowerCase()}">${record.status || 'N/A'}</span></td>
                  <td>${record.narration || '-'}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="8"><strong>Total Amount</strong></td>
                <td class="number"><strong>₹${reportData.reduce((sum, record) => sum + (record.paymentAmount || 0), 0).toLocaleString()}</strong></td>
                <td colspan="2"></td>
              </tr>
            </tbody>
          </table>
          
          <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666;">
            Professional Salary Payment Management System - Fayullah Factory<br>
            This is a computer-generated report and does not require a signature.
          </div>
        </body>
      </html>
    `
    
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const handleExport = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filterData.fromDate) params.append('startDate', filterData.fromDate)
      if (filterData.toDate) params.append('endDate', filterData.toDate)
      if (filterData.payMonth) params.append('payMonth', filterData.payMonth)
      if (filterData.payYear) params.append('payYear', filterData.payYear)

      const response = await fetch(`${config.API_URL}/salary/export/csv?${params}`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `salary_payment_report_${filterData.fromDate}_to_${filterData.toDate}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Export failed')
      }
    } catch (error) {
      console.error('❌ Export error:', error)
      alert('Export failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const generatePageNumbers = () => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let end = Math.min(totalPages, start + maxVisible - 1)
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  const getStatusColor = (status) => {
    const colors = {
      'Paid': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Processing': 'bg-blue-100 text-blue-800 border-blue-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 text-white px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">💰 Salary Payment Report</h1>
                <p className="text-teal-100">Comprehensive salary payment analytics and reporting</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">👤 SuperAdmin</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">💼 Finance Department</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">📅 {new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">🏭 Fayullah Factory</div>
                <div className="text-teal-200">Smart Manufacturing Unit</div>
                <div className="text-xs opacity-80 mt-2">Financial Reporting System</div>
              </div>
            </div>
          </div>

          {/* Filter Form */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
            {/* Statistics Cards */}
            {statistics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-green-200">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">💰</div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ₹{statistics.totalAmount?.toLocaleString() || '0'}
                      </div>
                      <div className="text-sm text-green-700 font-medium">Total Payments</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">📊</div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{statistics.totalPayments || 0}</div>
                      <div className="text-sm text-blue-700 font-medium">Payment Count</div>
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
                    <div className="text-3xl mr-4">🏦</div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {Object.keys(statistics.accountBreakdown || {}).length}
                      </div>
                      <div className="text-sm text-orange-700 font-medium">Active Accounts</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Report Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {/* Filter Type */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">🔍 Filter Type</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all bg-white"
                  value={filterData.filterType}
                  onChange={(e) => handleInputChange('filterType', e.target.value)}
                >
                  {filterTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">📅 From Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                  value={filterData.fromDate}
                  onChange={(e) => handleInputChange('fromDate', e.target.value)}
                />
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">📅 To Date</label>
                <input 
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all"
                  value={filterData.toDate}
                  onChange={(e) => handleInputChange('toDate', e.target.value)}
                />
              </div>

              {/* Employee */}
              {(filterData.filterType === 'employee' || filterData.filterType === '') && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">👤 Employee</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all bg-white"
                    value={filterData.employeeId}
                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pay Month */}
              {(filterData.filterType === 'month' || filterData.filterType === '') && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">📅 Pay Month</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all bg-white"
                    value={filterData.payMonth}
                    onChange={(e) => handleInputChange('payMonth', e.target.value)}
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Pay Year */}
              {(filterData.filterType === 'year' || filterData.filterType === '') && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">📅 Pay Year</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all bg-white"
                    value={filterData.payYear}
                    onChange={(e) => handleInputChange('payYear', e.target.value)}
                  >
                    <option value="">All Years</option>
                    {[2024, 2025, 2026].map(year => (
                      <option key={year} value={year.toString()}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Payment Account */}
              {(filterData.filterType === 'account' || filterData.filterType === '') && accounts.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">🏦 Payment Account</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all bg-white"
                    value={filterData.paymentFromAccount}
                    onChange={(e) => handleInputChange('paymentFromAccount', e.target.value)}
                  >
                    <option value="">All Accounts</option>
                    {accounts.map(account => (
                      <option key={account} value={account}>
                        {account}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status */}
              {(filterData.filterType === 'status' || filterData.filterType === '') && (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">📊 Status</label>
                  <select
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all bg-white"
                    value={filterData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Generate Report Button */}
              <div className="flex items-end">
                <button 
                  onClick={handleGenerateReport}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl hover:from-cyan-600 hover:to-teal-600 disabled:opacity-50 transition-all shadow-lg font-bold"
                >
                  {loading ? '⏳ Loading...' : '📊 Generate Report'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={handleExport}
                disabled={loading || !showResults}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg font-bold"
              >
                📤 Export CSV
              </button>
              
              <button 
                onClick={handlePrint}
                disabled={loading || !showResults}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all shadow-lg font-bold"
              >
                🖨️ Print Report
              </button>

              <button
                onClick={() => {
                  setShowResults(false)
                  setReportData([])
                  setError(null)
                }}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg font-bold"
              >
                🔄 Clear Results
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="text-red-600 text-2xl mr-4">⚠️</div>
              <div>
                <h3 className="text-red-800 font-bold text-lg">Error Loading Report</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Report Results */}
        {showResults && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">💰 Salary Payment Records</h3>
                  <p className="text-gray-600 mt-1">
                    {loading ? 'Loading...' : `Showing ${reportData.length} of ${totalCount} records`}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={handleExport}
                    disabled={loading}
                    className="p-3 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-all shadow-md"
                    title="Export to CSV"
                  >
                    📤
                  </button>
                  <button 
                    onClick={handlePrint}
                    disabled={loading}
                    className="p-3 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-all shadow-md"
                    title="Print Report"
                  >
                    🖨️
                  </button>
                </div>
              </div>

              {/* Filter Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl mb-6 border border-blue-200">
                <div className="text-sm">
                  <span className="font-bold text-blue-800">Active Filters: </span>
                  <span className="text-blue-700">
                    Period: {filterData.fromDate} to {filterData.toDate}
                    {filterData.filterType && ` | Type: ${filterTypes.find(f => f.value === filterData.filterType)?.label}`}
                    {filterData.payMonth && ` | Month: ${filterData.payMonth}`}
                    {filterData.payYear && ` | Year: ${filterData.payYear}`}
                    {filterData.status && ` | Status: ${filterData.status}`}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600"></div>
                  <p className="mt-4 text-gray-600 font-medium text-lg">Loading salary payment records...</p>
                </div>
              ) : reportData.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">💰</div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">No Salary Payment Records Found</h3>
                  <p className="text-gray-500">Try adjusting your filters or date range</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-teal-50">
                    <tr>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Payment Code</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Employee Details</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Payment Info</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">Amount</th>
                      <th className="text-center py-4 px-4 font-bold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 font-bold text-gray-700">Account & Narration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((record, index) => (
                      <tr key={record._id || index} className="border-b border-gray-100 hover:bg-teal-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-teal-800">{record.paymentCode || 'N/A'}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.entryDate).toLocaleDateString('en-GB')}
                          </div>
                        </td>
                        
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
                              {(record.employeeName || 'N').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-800 text-sm">{record.employeeName || 'N/A'}</div>
                              <div className="text-xs text-gray-500">
                                {record.employeeId?.employeeCode || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-400">
                                {record.employeeId?.selectDepartment || 'N/A'}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {record.payMonth} {record.payYear}
                            </div>
                            <div className="text-xs text-gray-600">
                              Type: {record.paymentType || 'N/A'}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="text-lg font-bold text-green-600">
                            ₹{record.paymentAmount?.toLocaleString() || '0'}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                            {record.status || 'N/A'}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-blue-600">
                              {record.paymentFromAccount || 'N/A'}
                            </div>
                            <div className="text-xs text-gray-600">
                              {record.narration || 'No narration'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Summary Row */}
                    {reportData.length > 0 && (
                      <tr className="border-t-2 bg-gradient-to-r from-teal-50 to-cyan-50 font-bold">
                        <td className="py-4 px-4" colSpan="3">
                          <div className="text-lg text-teal-800">Total Amount</div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-xl font-bold text-green-600">
                            ₹{reportData.reduce((sum, record) => sum + (record.paymentAmount || 0), 0).toLocaleString()}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="text-sm text-teal-700">
                            {reportData.length} payments
                          </div>
                        </td>
                        <td className="py-4 px-4"></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} records
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1 || loading}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      ◀ Previous
                    </button>
                    
                    {generatePageNumbers().map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        disabled={loading}
                        className={`px-4 py-2 border-2 rounded-lg transition-all ${
                          currentPage === page
                            ? 'border-teal-500 bg-teal-100 text-teal-800 font-bold'
                            : 'border-gray-300 hover:border-teal-300 hover:bg-teal-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages || loading}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next ▶
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
