'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function AttendanceReport() {
  // State Management for Reporting
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [reportType, setReportType] = useState('daily')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [attendanceStatus, setAttendanceStatus] = useState('all')
  
  // Data States
  const [attendanceData, setAttendanceData] = useState([])
  const [departmentSummary, setDepartmentSummary] = useState([])
  const [attendanceStats, setAttendanceStats] = useState({})
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)
  const [totalRecords, setTotalRecords] = useState(0)

  // ✅ UPDATED API Base URL to match your backend route
  const API_BASE = `${config.API_URL}/attandances`

  // Load initial data
  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (reportType === 'daily') {
      loadDailyReport()
    } else {
      loadCustomRangeReport()
    }
  }, [selectedDate, dateRange, selectedDepartment, selectedEmployee, attendanceStatus, currentPage, reportType])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        fetchEmployees(),
        fetchDepartments()
      ])
      // Load report after data is fetched
      setTimeout(() => {
        loadDailyReport()
      }, 500)
    } catch (error) {
      setError('Failed to load initial data')
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      console.log('🔍 Fetching employees from:', `${config.API_URL}/employees/get/for/attandances?limit=1000&isActive=true`)
      
      const response = await fetch(`${config.API_URL}/employees/get/for/attandances?limit=1000&isActive=true`)
      const data = await response.json()
      
      console.log('👥 Employees API Response:', data)
      
      if (data.success && data.employees) {
        setEmployees(data.employees)
        console.log('✅ Successfully loaded', data.employees.length, 'employees')
      } else if (data.employees) {
        setEmployees(data.employees)
      } else {
        console.error('❌ Invalid employees response')
        setEmployees([])
      }
    } catch (error) {
      console.error('❌ Error fetching employees:', error)
      setError('Failed to connect to employees API: ' + error.message)
    }
  }

  const fetchDepartments = async () => {
    try {
      console.log('🔍 Fetching departments from:', `${config.API_URL}/depertment?isActive=true`)
      
      const response = await fetch(`${config.API_URL}/depertment?isActive=true`)
      const data = await response.json()
      
      console.log('🏢 Departments API Response:', data)
      
      if (data.success && (data.data || data.departments)) {
        const deptList = data.data || data.departments
        setDepartments(Array.isArray(deptList) ? deptList : [])
        console.log('✅ Successfully loaded', deptList.length, 'departments')
      } else {
        console.error('❌ Invalid departments response, using defaults')
        // Set some default departments based on your employee data
        const defaultDepts = [
          { _id: 'logistics', departmentName: 'Logistics' },
          { _id: 'computer', departmentName: 'Computer' },
          { _id: 'production', departmentName: 'Production' }
        ]
        setDepartments(defaultDepts)
      }
    } catch (error) {
      console.error('❌ Error fetching departments:', error)
      // Set default departments
      const defaultDepts = [
        { _id: 'logistics', departmentName: 'Logistics' },
        { _id: 'computer', departmentName: 'Computer' },
        { _id: 'production', departmentName: 'Production' }
      ]
      setDepartments(defaultDepts)
    }
  }

  const loadDailyReport = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        date: selectedDate,
        ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
        ...(attendanceStatus !== 'all' && { status: attendanceStatus })
      })
      
      console.log('🔍 Loading daily report with params:', params.toString())
      console.log('📅 Selected date:', selectedDate)
      
      // ✅ UPDATED: Using correct API endpoints that match your backend
      const endpoints = [
        `${API_BASE}/today?${params}`,
        `${API_BASE}/history?startDate=${selectedDate}&endDate=${selectedDate}&${params}`,
        `${API_BASE}/statistics?date=${selectedDate}&${params}`,
        `${API_BASE}/department-summary?date=${selectedDate}`
      ]

      console.log('📡 API Endpoints:', endpoints)

      const [todayResponse, historyResponse, statsResponse, deptSummaryResponse] = await Promise.all([
        fetch(endpoints[0]).catch(e => ({ ok: false, error: e })),
        fetch(endpoints[1]).catch(e => ({ ok: false, error: e })),
        fetch(endpoints[2]).catch(e => ({ ok: false, error: e })),
        fetch(endpoints[3]).catch(e => ({ ok: false, error: e }))
      ])

      // Process today's attendance
      if (todayResponse.ok) {
        const todayData = await todayResponse.json()
        console.log('📊 Today API Response:', todayData)
        
        if (todayData.success) {
          const records = todayData.data?.records || []
          setAttendanceData(records)
          setAttendanceStats(prevStats => ({ 
            ...prevStats, 
            ...(todayData.data?.summary || {})
          }))
          console.log('✅ Today attendance loaded:', records.length, 'records')
        }
      }

      // If no today data, try history endpoint
      if (historyResponse.ok) {
        const historyData = await historyResponse.json()
        console.log('📊 History API Response:', historyData)
        
        if (historyData.success) {
          const records = historyData.data?.records || []
          setAttendanceData(prev => prev.length > 0 ? prev : records)
          setAttendanceStats(prevStats => ({ 
            ...prevStats, 
            ...(historyData.data?.analytics || {})
          }))
          console.log('✅ History attendance loaded:', records.length, 'records')
        }
      }

      // Process statistics
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        console.log('📊 Stats API Response:', statsData)
        
        if (statsData.success) {
          setAttendanceStats(prevStats => ({ ...prevStats, ...statsData.data }))
        }
      }

      // Process department summary
      if (deptSummaryResponse.ok) {
        const deptData = await deptSummaryResponse.json()
        console.log('🏢 Dept Summary API Response:', deptData)
        
        if (deptData.success) {
          setDepartmentSummary(deptData.data?.departments || [])
        }
      }

    } catch (error) {
      setError('Failed to load daily report: ' + error.message)
      console.error('❌ Error loading daily report:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomRangeReport = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page: currentPage,
        limit: pageSize,
        ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
        ...(selectedEmployee !== 'all' && { employeeId: selectedEmployee }),
        ...(attendanceStatus !== 'all' && { status: attendanceStatus })
      })

      console.log('🔍 Loading custom range report with params:', params.toString())

      const response = await fetch(`${API_BASE}/history?${params}`)
      const data = await response.json()

      console.log('📊 Custom Range API Response:', data)

      if (data.success) {
        setAttendanceData(data.data?.records || [])
        setAttendanceStats(data.data?.analytics || {})
        setTotalRecords(data.data?.pagination?.total || 0)
      }

    } catch (error) {
      setError('Failed to load custom range report: ' + error.message)
      console.error('❌ Error loading custom range report:', error)
    } finally {
      setLoading(false)
    }
  }

  // Create sample attendance data function
  const createSampleData = async () => {
    if (employees.length === 0) {
      alert('No employees found. Please add employees first.')
      return
    }

    try {
      setLoading(true)
      
      // Create sample attendance for first few employees
      const sampleEmployees = employees.slice(0, Math.min(5, employees.length))
      const sampleData = {
        operation: 'mark-present',
        employeeIds: sampleEmployees.map(emp => emp._id),
        date: selectedDate,
        data: {
          clockInTime: '09:00',
          clockOutTime: '18:00',
          workingHours: 8,
          remarks: 'Sample attendance data for testing'
        }
      }

      console.log('Creating sample data:', sampleData)

      const response = await fetch(`${API_BASE}/bulk-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sampleData)
      })

      const result = await response.json()
      console.log('Sample data creation result:', result)

      if (result.success) {
        alert(`✅ Sample attendance data created successfully for ${sampleEmployees.length} employees!`)
        loadDailyReport() // Reload the report
      } else {
        alert('❌ Failed to create sample data: ' + result.error)
      }

    } catch (error) {
      console.error('Error creating sample data:', error)
      alert('❌ Error creating sample data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        startDate: reportType === 'daily' ? selectedDate : dateRange.startDate,
        endDate: reportType === 'daily' ? selectedDate : dateRange.endDate,
        format: 'json',
        ...(selectedDepartment !== 'all' && { department: selectedDepartment }),
        ...(selectedEmployee !== 'all' && { employeeId: selectedEmployee }),
        ...(attendanceStatus !== 'all' && { status: attendanceStatus })
      })

      const response = await fetch(`${API_BASE}/export?${params}`)
      const data = await response.json()

      if (data.success) {
        // Create and download JSON file
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `attendance_report_${reportType}_${selectedDate || dateRange.startDate}_to_${dateRange.endDate}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        
        alert('✅ Report exported successfully!')
      } else {
        throw new Error(data.message || 'Export failed')
      }

    } catch (error) {
      alert('Export failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrintReport = () => {
    const printContent = `
      <html>
        <head>
          <title>Professional Attendance Report - Fayullah Factory</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0f766e; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            .report-title { font-size: 20px; margin-bottom: 20px; color: #1f2937; }
            .report-info { margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px; }
            .stat-card { text-align: center; padding: 15px; border: 2px solid #e5e5e5; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0f766e; margin-bottom: 5px; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f8f9fa; font-weight: bold; }
            .status-present { background-color: #d4edda; color: #155724; text-align: center; font-weight: bold; }
            .status-absent { background-color: #f8d7da; color: #721c24; text-align: center; font-weight: bold; }
            .status-late { background-color: #fff3cd; color: #856404; text-align: center; font-weight: bold; }
            .status-wfh { background-color: #cce5ff; color: #004085; text-align: center; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">🏭 Fayullah Factory</div>
            <div class="report-title">Professional Attendance Report</div>
            <div class="report-info">
              <div>
                <strong>Report Type:</strong> ${reportType.toUpperCase()}<br>
                <strong>Date/Period:</strong> ${reportType === 'daily' ? selectedDate : `${dateRange.startDate} to ${dateRange.endDate}`}<br>
                <strong>Department:</strong> ${selectedDepartment === 'all' ? 'All Departments' : selectedDepartment}
              </div>
              <div>
                <strong>Generated on:</strong> ${new Date().toLocaleString()}<br>
                <strong>Total Records:</strong> ${attendanceData.length}<br>
                <strong>Attendance Rate:</strong> ${attendanceStats.attendanceRate || 0}%
              </div>
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${attendanceStats.totalRecords || 0}</div>
              <div class="stat-label">Total Records</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${attendanceStats.presentCount || 0}</div>
              <div class="stat-label">Present</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${attendanceStats.absentCount || 0}</div>
              <div class="stat-label">Absent</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${attendanceStats.lateCount || 0}</div>
              <div class="stat-label">Late Arrivals</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${(attendanceStats.avgWorkingHours || 0).toFixed(1)}h</div>
              <div class="stat-label">Avg Working Hours</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${attendanceStats.attendanceRate || 0}%</div>
              <div class="stat-label">Attendance Rate</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee Code</th>
                <th>Employee Name</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Status</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Working Hours</th>
                <th>Overtime</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${attendanceData.map(record => `
                <tr>
                  <td>${new Date(record.attendanceDate).toLocaleDateString('en-GB')}</td>
                  <td>${record.employeeCode || 'N/A'}</td>
                  <td>${record.employeeName || 'N/A'}</td>
                  <td>${record.department || 'N/A'}</td>
                  <td>${record.designation || 'N/A'}</td>
                  <td class="status-${(record.status || '').toLowerCase().replace(' ', '-')}">${record.status || 'N/A'}</td>
                  <td>${record.clockIn?.time ? new Date(record.clockIn.time).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) : '-'}</td>
                  <td>${record.clockOut?.time ? new Date(record.clockOut.time).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'}) : '-'}</td>
                  <td>${record.workingHours?.total || 0}h</td>
                  <td>${record.workingHours?.overtime || 0}h</td>
                  <td>${record.remarks?.supervisor || record.remarks?.employee || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Professional Attendance Management System - Fayullah Factory<br>
            This is a computer-generated report and does not require a signature.<br>
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

  const getStatusColor = (status) => {
    const statusColors = {
      'Present': 'bg-green-100 text-green-800 border-green-200',
      'Absent': 'bg-red-100 text-red-800 border-red-200',
      'Late': 'bg-orange-100 text-orange-800 border-orange-200',
      'Half Day': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Early Exit': 'bg-purple-100 text-purple-800 border-purple-200',
      'WFH': 'bg-blue-100 text-blue-800 border-blue-200',
      'On Leave': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Holiday': 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Bulk operations for testing
  const handleBulkOperation = async (operation) => {
    if (employees.length === 0) {
      alert('No employees found. Please add employees first.')
      return
    }

    try {
      setLoading(true)
      
      const selectedEmployeeIds = employees.slice(0, Math.min(10, employees.length)).map(emp => emp._id)
      const bulkData = {
        operation,
        employeeIds: selectedEmployeeIds,
        date: selectedDate,
        data: {
          clockInTime: '09:00',
          clockOutTime: '18:00',
          workingHours: 8,
          remarks: `Bulk ${operation} operation by SuperAdmin`
        }
      }

      const response = await fetch(`${API_BASE}/bulk-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bulkData)
      })

      const result = await response.json()
      
      if (result.success) {
        alert(`✅ Bulk ${operation} completed successfully for ${selectedEmployeeIds.length} employees!`)
        loadDailyReport()
      } else {
        alert(`❌ Bulk operation failed: ${result.error}`)
      }

    } catch (error) {
      alert(`❌ Error in bulk operation: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Professional Header */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">📊 Professional Attendance Reports</h1>
                <p className="text-emerald-100">SuperAdmin Dashboard - Comprehensive Workforce Analytics</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">👤 SuperAdmin</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">🏢 Administration</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">📅 {new Date().toLocaleDateString('en-GB')}</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">⏰ {new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">🏭 Fayullah Factory</div>
                <div className="text-emerald-200">Smart Manufacturing Unit</div>
                <div className="text-xs opacity-80 mt-2">Real-time Analytics & Reporting</div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="p-8 bg-gradient-to-r from-gray-50 to-blue-50">
            {/* Debug Information */}
            <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
              <strong>🔍 Debug Info:</strong> 
              Employees: <span className="font-bold">{employees.length}</span>, 
              Departments: <span className="font-bold">{departments.length}</span>, 
              Attendance Records: <span className="font-bold">{attendanceData.length}</span>
              <br />
              <strong>📡 API Base:</strong> <code className="bg-white px-2 py-1 rounded">{API_BASE}</code>
              {employees.length > 0 && (
                <div className="mt-2">
                  <strong>📋 Employee Sample:</strong> {employees[0]?.employeeName} ({employees[0]?.employeeCode})
                </div>
              )}
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <strong>⚠️ Error:</strong> {error}
                    {attendanceData.length === 0 && employees.length > 0 && (
                      <div className="mt-3 flex gap-2">
                        <button 
                          onClick={createSampleData}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                          ➕ Create Sample Data
                        </button>
                        <button 
                          onClick={() => handleBulkOperation('mark-present')}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          ✅ Mark Present (Bulk)
                        </button>
                        <button 
                          onClick={() => handleBulkOperation('mark-absent')}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          ❌ Mark Absent (Bulk)
                        </button>
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800 font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Report Type Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">📈 Report Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { value: 'daily', label: '📅 Daily Report', desc: 'Single day analysis' },
                  { value: 'weekly', label: '📊 Weekly Report', desc: 'Last 7 days' },
                  { value: 'monthly', label: '📆 Monthly Report', desc: 'Last 30 days' },
                  { value: 'custom', label: '🎯 Custom Range', desc: 'Custom date range' }
                ].map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setReportType(type.value)
                      if (type.value === 'weekly') {
                        setDateRange({
                          startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
                          endDate: new Date().toISOString().split('T')[0]
                        })
                      } else if (type.value === 'monthly') {
                        setDateRange({
                          startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
                          endDate: new Date().toISOString().split('T')[0]
                        })
                      }
                    }}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      reportType === type.value 
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800' 
                        : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="font-bold">{type.label}</div>
                    <div className="text-sm opacity-70">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
              {reportType === 'daily' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-700">📅 Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">📅 Start Date</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">📅 End Date</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-medium"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">🏢 Department</label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                >
                  <option value="all">All Departments</option>
                  {departments && Array.isArray(departments) && departments.map(dept => (
                    <option key={dept._id || dept.id} value={dept.departmentName || dept.name}>
                      {dept.departmentName || dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">👤 Employee ({employees.length})</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                >
                  <option value="all">All Employees ({employees.length})</option>
                  {employees && Array.isArray(employees) && employees.map(emp => (
                    <option key={emp._id || emp.id} value={emp._id || emp.id}>
                      {emp.employeeName} ({emp.employeeCode || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700">📊 Status Filter</label>
                <select
                  value={attendanceStatus}
                  onChange={(e) => setAttendanceStatus(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
                >
                  <option value="all">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                  <option value="Half Day">Half Day</option>
                  <option value="Early Exit">Early Exit</option>
                  <option value="WFH">Work From Home</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Holiday">Holiday</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => reportType === 'daily' ? loadDailyReport() : loadCustomRangeReport()}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-lg font-bold"
                >
                  {loading ? '⏳ Loading...' : '🔍 Generate Report'}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={handleExportReport}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg font-bold"
              >
                📊 Export JSON
              </button>
              
              <button
                onClick={handlePrintReport}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all shadow-lg font-bold"
              >
                🖨️ Print Report
              </button>

              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg font-bold"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          {[
            { label: 'Total Records', value: attendanceStats.totalRecords || 0, icon: '📋', color: 'blue' },
            { label: 'Present Today', value: attendanceStats.presentCount || 0, icon: '✅', color: 'green' },
            { label: 'Absent Today', value: attendanceStats.absentCount || 0, icon: '❌', color: 'red' },
            { label: 'Late Arrivals', value: attendanceStats.lateCount || 0, icon: '⏰', color: 'orange' },
            { label: 'Attendance Rate', value: `${attendanceStats.attendanceRate || 0}%`, icon: '📊', color: 'emerald' },
            { label: 'Avg Working Hours', value: `${(attendanceStats.avgWorkingHours || 0).toFixed(1)}h`, icon: '⏱️', color: 'purple' }
          ].map((stat, index) => (
            <div key={index} className={`bg-white rounded-2xl border-2 border-${stat.color}-200 p-6 text-center hover:shadow-xl transition-all duration-300`}>
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className={`text-3xl font-bold text-${stat.color}-600 mb-2`}>{stat.value}</div>
              <div className={`text-sm text-${stat.color}-700 font-medium`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Department Summary */}
        {departmentSummary.length > 0 && (
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">🏢 Department-wise Summary</h3>
              <p className="text-gray-600 mt-1">Attendance breakdown by departments</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold text-gray-700">Department</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Total</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Present</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Absent</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Late</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Half Day</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">WFH</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">On Leave</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentSummary.map((dept, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-blue-50 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-800">{dept.department || 'N/A'}</td>
                      <td className="text-center py-4 px-4 text-gray-700 font-medium">{dept.totalEmployees}</td>
                      <td className="text-center py-4 px-4">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-bold">
                          {dept.present}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                          {dept.absent}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-bold">
                          {dept.late}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full font-bold">
                          {dept.halfDay}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold">
                          {dept.wfh}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-bold">
                          {dept.onLeave}
                        </span>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className={`inline-flex items-center px-3 py-2 rounded-full font-bold ${
                          dept.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                          dept.attendancePercentage >= 75 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {dept.attendancePercentage}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Attendance Records */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">📋 Detailed Attendance Records</h3>
                <p className="text-gray-600 mt-1">
                  Showing {attendanceData.length} records
                  {totalRecords > attendanceData.length && ` of ${totalRecords} total`}
                </p>
              </div>
              
              {/* Pagination Info */}
              {totalRecords > pageSize && (
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {Math.ceil(totalRecords / pageSize)}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600"></div>
                <p className="mt-4 text-gray-600 font-medium text-lg">Loading attendance records...</p>
              </div>
            ) : attendanceData.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-gray-600 mb-2">No Attendance Records Found</h3>
                <p className="text-gray-500 mb-4">
                  {employees.length > 0 
                    ? 'No attendance data exists for the selected date/filters'
                    : 'No employees found in the system'
                  }
                </p>
                {employees.length > 0 && (
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={createSampleData}
                      className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all shadow-lg font-bold"
                    >
                      ➕ Create Sample Data
                    </button>
                    <button 
                      onClick={() => handleBulkOperation('mark-present')}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-lg font-bold"
                    >
                      ✅ Bulk Mark Present
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-4">
                  Debug: API Base URL is <code>{API_BASE}</code>
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-emerald-50">
                  <tr>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Date</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Employee Details</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Department</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Status</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Clock In</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Clock Out</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Working Hours</th>
                    <th className="text-center py-4 px-4 font-bold text-gray-700">Overtime</th>
                    <th className="text-left py-4 px-4 font-bold text-gray-700">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((record, index) => (
                    <tr key={record._id || index} className="border-b border-gray-100 hover:bg-emerald-50 transition-colors">
                      <td className="py-4 px-4 text-sm font-medium">
                        {new Date(record.attendanceDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            record.status === 'Present' ? 'bg-green-500' :
                            record.status === 'Absent' ? 'bg-red-500' :
                            record.status === 'Late' ? 'bg-orange-500' :
                            'bg-gray-500'
                          }`}>
                            {(record.employeeName || 'N').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-gray-800 text-sm">{record.employeeName || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{record.employeeCode || 'N/A'}</div>
                            <div className="text-xs text-gray-400">{record.designation || 'N/A'}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {record.department || 'N/A'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className={`px-3 py-2 rounded-lg text-xs font-bold border-2 ${getStatusColor(record.status)}`}>
                          {record.status || 'N/A'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center text-sm font-mono">
                        {record.clockIn?.time 
                          ? new Date(record.clockIn.time).toLocaleTimeString('en-GB', {
                              hour: '2-digit', 
                              minute: '2-digit'
                            })
                          : '-'
                        }
                      </td>

                      <td className="py-4 px-4 text-center text-sm font-mono">
                        {record.clockOut?.time 
                          ? new Date(record.clockOut.time).toLocaleTimeString('en-GB', {
                              hour: '2-digit', 
                              minute: '2-digit'
                            })
                          : '-'
                        }
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className={`text-sm font-bold ${
                          (record.workingHours?.total || 0) >= 8 ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {record.workingHours?.total || 0}h
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        {(record.workingHours?.overtime || 0) > 0 ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                            +{record.workingHours.overtime}h
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-sm">
                        <div className="max-w-xs">
                          {record.remarks?.supervisor || record.remarks?.employee || '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {totalRecords > pageSize && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} records
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    ◀ Previous
                  </button>
                  
                  <div className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-bold">
                    Page {currentPage} of {Math.ceil(totalRecords / pageSize)}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(Math.ceil(totalRecords / pageSize), currentPage + 1))}
                    disabled={currentPage >= Math.ceil(totalRecords / pageSize)}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg hover:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
  )
}
