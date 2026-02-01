'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

// API Configuration
const API_BASE_URL = `${config.API_URL}/salary`

// API Service Functions
const salaryPaymentAPI = {
  // Create salary payments
  createPayments: async (paymentData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      })
      return await response.json()
    } catch (error) {
      console.error('Error creating payments:', error)
      throw error
    }
  },

  // Get all payments
  getPayments: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`${API_BASE_URL}/?${queryString}`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching payments:', error)
      throw error
    }
  },

  // Get employees for dropdown
  getEmployeesForPayment: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`)
      return await response.json()
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  },

  // Delete payment
  deletePayment: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      })
      return await response.json()
    } catch (error) {
      console.error('Error deleting payment:', error)
      throw error
    }
  },

  // Generate payment code
  generatePaymentCode: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/generate-code`)
      const result = await response.json()
      return result.success ? result.data.paymentCode : null
    } catch (error) {
      console.error('Error generating payment code:', error)
      return null
    }
  }
}

export default function SalaryPayment() {
  // Date utility functions
  const getTodayFormatted = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateForInput = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }

  const formatDateForDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const getCurrentMonth = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    return months[new Date().getMonth()]
  }

  const getCurrentYear = () => {
    return new Date().getFullYear().toString()
  }

  // Generate payment code (fallback)
  const generatePaymentCode = () => {
    const prefix = 'EPAY'
    const timestamp = Date.now().toString().slice(-4)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}${timestamp}${random}`
  }

  // State Management
  const [formData, setFormData] = useState({
    paymentType: 'Basic Salary',
    paymentFromAccount: '',
    paymentToEmployee: '',
    paymentAmount: '',
    paymentCode: '',
    entryDate: getTodayFormatted(),
    payYear: getCurrentYear(),
    payMonth: getCurrentMonth(),
    salaryAccount: 'Salary',
    narration: ''
  })

  const [employees, setEmployees] = useState([])
  const [paymentEntries, setPaymentEntries] = useState([])
  const [paymentCart, setPaymentCart] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Load data on component mount
  useEffect(() => {
    loadInitialData()
  }, [])

  // Update filtered entries when payment entries change
  useEffect(() => {
    handleSearch()
  }, [paymentEntries, searchTerm])

  // Load pagination data when page or rows per page changes
  useEffect(() => {
    loadPaymentEntries()
  }, [currentPage, rowsPerPage])

  // Load initial data
  const loadInitialData = async () => {
    try {
      setLoading(true)
      
      // Load employees and generate payment code concurrently
      const [employeesResult, paymentCode] = await Promise.all([
        salaryPaymentAPI.getEmployeesForPayment(),
        salaryPaymentAPI.generatePaymentCode()
      ])
      
      if (employeesResult.success) {
        setEmployees(employeesResult.data)
      }
      
      setFormData(prev => ({
        ...prev,
        paymentCode: paymentCode || generatePaymentCode()
      }))
      
      // Load payment entries
      await loadPaymentEntries()
      
    } catch (error) {
      console.error('Error loading initial data:', error)
      setError('Failed to load initial data. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  // Load payment entries with pagination
  const loadPaymentEntries = async () => {
    try {
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm })
      }
      
      const result = await salaryPaymentAPI.getPayments(params)
      
      if (result.success) {
        const formattedEntries = result.data.map(entry => ({
          id: entry._id,
          paymentCode: entry.paymentCode,
          employee: entry.employeeName,
          paymentDate: entry.formattedEntryDate,
          payFromAcc: entry.paymentFromAccount,
          payForMonth: entry.payMonth,
          year: entry.payYear.toString(),
          payTotal: entry.formattedAmount,
          narration: entry.narration || '',
          paymentBy: entry.paymentBy,
          status: entry.status,
          createdAt: new Date(entry.createdAt).getTime()
        }))
        
        setPaymentEntries(formattedEntries)
        setTotalPages(result.pagination.totalPages)
        setTotalCount(result.pagination.totalCount)
      } else {
        setError(result.message || 'Failed to load payment entries')
      }
    } catch (error) {
      console.error('Error loading payment entries:', error)
      setError('Failed to connect to server. Please check your connection.')
    }
  }

  const handleInputChange = (field, value) => {
    if (field === 'entryDate' && value.includes('-')) {
      // Handle date input change
      const formattedDate = formatDateForDisplay(value)
      setFormData(prev => ({
        ...prev,
        entryDate: formattedDate
      }))
      
      // Auto-update month and year
      const date = new Date(value)
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ]
      setFormData(prev => ({
        ...prev,
        payMonth: months[date.getMonth()],
        payYear: date.getFullYear().toString()
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleAddToPayment = () => {
    if (!formData.paymentToEmployee || !formData.paymentAmount) {
      alert('Please select an employee and enter payment amount')
      return
    }

    // Find employee details
    const selectedEmployee = employees.find(emp => emp.id === formData.paymentToEmployee)
    if (!selectedEmployee) {
      alert('Selected employee not found')
      return
    }

    const newCartItem = {
      id: Date.now(),
      employeeId: selectedEmployee.id,
      employee: selectedEmployee.name,
      paymentType: formData.paymentType,
      amount: formData.paymentAmount,
      account: formData.salaryAccount
    }

    setPaymentCart(prev => [...prev, newCartItem])
    
    // Clear employee and amount
    setFormData(prev => ({
      ...prev,
      paymentToEmployee: '',
      paymentAmount: ''
    }))
  }

  const handleRemoveFromCart = (id) => {
    setPaymentCart(prev => prev.filter(item => item.id !== id))
  }

  const calculateCartTotal = () => {
    return paymentCart.reduce((total, item) => {
      return total + (parseFloat(item.amount) || 0)
    }, 0).toFixed(2)
  }

  const handleSave = async () => {
    if (paymentCart.length === 0) {
      alert('Please add at least one payment to the cart')
      return
    }

    if (!formData.paymentFromAccount) {
      alert('Please select a payment from account')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const paymentData = {
        paymentType: formData.paymentType,
        paymentFromAccount: formData.paymentFromAccount,
        entryDate: formatDateForInput(formData.entryDate),
        payYear: parseInt(formData.payYear),
        payMonth: formData.payMonth,
        salaryAccount: formData.salaryAccount,
        narration: formData.narration,
        payments: paymentCart.map(item => ({
          employeeId: item.employeeId,
          employeeName: item.employee,
          paymentType: item.paymentType,
          amount: parseFloat(item.amount),
          account: item.account
        }))
      }

      const result = await salaryPaymentAPI.createPayments(paymentData)
      
      if (result.success) {
        // Clear cart and reset form
        setPaymentCart([])
        
        // Generate new payment code
        const newPaymentCode = await salaryPaymentAPI.generatePaymentCode()
        
        setFormData(prev => ({
          ...prev,
          paymentFromAccount: '',
          paymentToEmployee: '',
          paymentAmount: '',
          paymentCode: newPaymentCode || generatePaymentCode(),
          narration: ''
        }))
        
        // Reload payment entries
        await loadPaymentEntries()
        
        alert(`${result.count} payment(s) saved successfully for ${formData.entryDate}!`)
      } else {
        setError(result.message || 'Failed to save payments')
        alert(`Error: ${result.message}`)
      }
    } catch (error) {
      console.error('Error saving payments:', error)
      setError('Failed to connect to server. Please check your connection.')
      alert('Error saving payments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(paymentEntries)
    } else {
      const filtered = paymentEntries.filter(entry =>
        entry.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.paymentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.payFromAcc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.payForMonth.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.year.includes(searchTerm)
      )
      setFilteredEntries(filtered)
    }
  }

  // Clear search and reload from server
  const handleClearSearch = async () => {
    setSearchTerm('')
    setShowSearch(false)
    setCurrentPage(1)
    await loadPaymentEntries()
  }

  // Server-side search
  const handleServerSearch = async () => {
    setCurrentPage(1)
    await loadPaymentEntries()
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Salary Payment Entry List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Fayullah Factory</div>
            <div class="report-title">Salary Payment Entry List</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${totalCount}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Payment Code</th>
                <th>Employee</th>
                <th>Payment Date</th>
                <th>Pay From Account</th>
                <th>Pay For Month</th>
                <th>Year</th>
                <th>Pay Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${paymentEntries.map(entry => `
                <tr>
                  <td>${entry.paymentCode}</td>
                  <td>${entry.employee}</td>
                  <td>${entry.paymentDate}</td>
                  <td>${entry.payFromAcc}</td>
                  <td>${entry.payForMonth}</td>
                  <td>${entry.year}</td>
                  <td>${entry.payTotal}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Salary Payment Report - Fayullah Factory Management System
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
      ['Fayullah Factory - Salary Payment Entry List'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${totalCount}`],
      [],
      ['Payment Code', 'Employee', 'Payment Date', 'Pay From Account', 'Pay For Month', 'Year', 'Pay Total', 'Narration', 'Payment By', 'Status'],
      ...paymentEntries.map(entry => [
        entry.paymentCode,
        entry.employee,
        entry.paymentDate,
        entry.payFromAcc,
        entry.payForMonth,
        entry.year,
        entry.payTotal,
        entry.narration,
        entry.paymentBy,
        entry.status
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `salary_payment_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return
    }

    try {
      setLoading(true)
      const result = await salaryPaymentAPI.deletePayment(id)
      
      if (result.success) {
        await loadPaymentEntries()
        alert('Payment entry deleted successfully')
      } else {
        alert(`Error deleting entry: ${result.message}`)
      }
    } catch (error) {
      console.error('Error deleting entry:', error)
      alert('Error deleting entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Generate new payment code
  const handleGenerateNewCode = async () => {
    try {
      const newCode = await salaryPaymentAPI.generatePaymentCode()
      if (newCode) {
        setFormData(prev => ({
          ...prev,
          paymentCode: newCode
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          paymentCode: generatePaymentCode()
        }))
      }
    } catch (error) {
      console.error('Error generating payment code:', error)
      setFormData(prev => ({
        ...prev,
        paymentCode: generatePaymentCode()
      }))
    }
  }

  // Quick date shortcuts
  const setToday = () => {
    const today = getTodayFormatted()
    setFormData(prev => ({
      ...prev,
      entryDate: today,
      payMonth: getCurrentMonth(),
      payYear: getCurrentYear()
    }))
  }

  const setYesterday = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const formattedDate = formatDateForDisplay(yesterday.toISOString().split('T')[0])
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]
    
    setFormData(prev => ({
      ...prev,
      entryDate: formattedDate,
      payMonth: months[yesterday.getMonth()],
      payYear: yesterday.getFullYear().toString()
    }))
  }

  // Pagination calculations
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount)

  // Generate years and months
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 2; i <= currentYear + 2; i++) {
    years.push(i.toString())
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Loading state
  if (loading && employees.length === 0) {
    return (
      <div className="p-4 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading salary payment system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">Salary Payment Entry</h2>
          <div className="text-right">
            <div className="text-sm font-semibold">Fayullah Factory</div>
            <div className="text-xs opacity-90">Payroll Management System</div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {/* Payment Type */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment Type</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.paymentType}
                onChange={(e) => handleInputChange('paymentType', e.target.value)}
                disabled={loading}
              >
                <option value="Basic Salary">Basic Salary</option>
                <option value="Overtime">Overtime</option>
                <option value="Bonus">Bonus</option>
                <option value="Allowance">Allowance</option>
                <option value="Commission">Commission</option>
              </select>
            </div>

            {/* Payment From Account */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment From Account *</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.paymentFromAccount}
                onChange={(e) => handleInputChange('paymentFromAccount', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Account</option>
                <option value="Cash">Cash</option>
                <option value="Bank - Primary">Bank - Primary</option>
                <option value="Bank - Salary">Bank - Salary</option>
                <option value="Petty Cash">Petty Cash</option>
              </select>
            </div>

            {/* Payment Code */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment Code</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.paymentCode}
                  onChange={(e) => handleInputChange('paymentCode', e.target.value)}
                  disabled={loading}
                />
                <button 
                  onClick={handleGenerateNewCode}
                  className="bg-gray-200 text-gray-700 px-2 py-2 rounded text-xs hover:bg-gray-300 transition-colors disabled:opacity-50"
                  title="Generate New Code"
                  disabled={loading}
                >
                  🔄
                </button>
              </div>
            </div>

            {/* Entry Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Entry Date</label>
              <input 
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formatDateForInput(formData.entryDate)}
                onChange={(e) => handleInputChange('entryDate', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Payment To Employee */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment To Employee *</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.paymentToEmployee}
                onChange={(e) => handleInputChange('paymentToEmployee', e.target.value)}
                disabled={loading}
              >
                <option value="">Select Employee</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.displayName}</option>
                ))}
              </select>
            </div>

            {/* Select Pay of Year */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Select Pay of Year</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.payYear}
                onChange={(e) => handleInputChange('payYear', e.target.value)}
                disabled={loading}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Select Pay of Month */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Select Pay of Month</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.payMonth}
                onChange={(e) => handleInputChange('payMonth', e.target.value)}
                disabled={loading}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {/* Choose a salary Account */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Choose a Salary Account</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.salaryAccount}
                onChange={(e) => handleInputChange('salaryAccount', e.target.value)}
                disabled={loading}
              >
                <option value="Salary">Salary</option>
                <option value="Allowance">Allowance</option>
                <option value="Bonus">Bonus</option>
                <option value="Overtime">Overtime</option>
              </select>
            </div>
          </div>

          {/* Date Shortcuts */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={setToday}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Today
            </button>
            <button 
              onClick={setYesterday}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
              disabled={loading}
            >
              Yesterday
            </button>
          </div>

          {/* Current Date Display */}
          <div className="text-sm text-gray-600 mb-4">
            Selected Date: <span className="font-medium">{formData.entryDate}</span>
            <span className="ml-4">Pay Period: <span className="font-medium">{formData.payMonth} {formData.payYear}</span></span>
          </div>

          {/* Payment Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment Amount *</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.paymentAmount}
                onChange={(e) => handleInputChange('paymentAmount', e.target.value)}
                placeholder="Enter amount"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddToPayment()
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter or click Add to Payment to add to cart</p>
            </div>
            
            {/* Add to Payment Button */}
            <div className="flex items-end">
              <button 
                onClick={handleAddToPayment}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                ADD TO PAYMENT
              </button>
            </div>
          </div>

          {/* Payment Cart */}
          {paymentCart.length > 0 && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Cart</h4>
              <div className="space-y-2">
                {paymentCart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded border">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{item.employee}</div>
                      <div className="text-xs text-gray-500">{item.paymentType} - {item.account}</div>
                    </div>
                    <div className="text-sm font-medium text-green-600">
                      ₹ {parseFloat(item.amount).toFixed(2)}
                    </div>
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="ml-3 text-red-500 hover:text-red-700"
                      title="Remove from cart"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-semibold text-lg text-green-600">₹ {calculateCartTotal()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Narration */}
          <div className="mb-6">
            <label className="block text-xs text-gray-600 mb-1">Narration</label>
            <textarea 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows="3"
              placeholder="Enter payment description or notes..."
              value={formData.narration}
              onChange={(e) => handleInputChange('narration', e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={paymentCart.length === 0 || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  💾 SAVE PAYMENTS ({paymentCart.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Salary Payment Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Salary Payment Entry List ({totalCount} records)
            </h3>
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
                placeholder="Search by employee name, payment code, account, month, or year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleServerSearch()
                  }
                }}
              />
              <button 
                onClick={handleServerSearch}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Search
              </button>
              <button 
                onClick={handleClearSearch}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Clear
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Payment Code</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Employee</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Payment Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Pay From Acc</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Pay For Month</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Year</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Pay Total</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Narration</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Payment By</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="11" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-2"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : paymentEntries.length > 0 ? (
                  paymentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs font-medium text-teal-600">{entry.paymentCode}</td>
                      <td className="py-3 px-2 text-xs">{entry.employee}</td>
                      <td className="py-3 px-2 text-xs">{entry.paymentDate}</td>
                      <td className="py-3 px-2 text-xs">{entry.payFromAcc}</td>
                      <td className="py-3 px-2 text-xs">{entry.payForMonth}</td>
                      <td className="py-3 px-2 text-xs">{entry.year}</td>
                      <td className="py-3 px-2 text-xs font-medium">{entry.payTotal}</td>
                      <td className="py-3 px-2 text-xs max-w-32 truncate" title={entry.narration}>{entry.narration}</td>
                      <td className="py-3 px-2 text-xs">{entry.paymentBy}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.status === 'Completed' 
                            ? 'bg-green-100 text-green-800' 
                            : entry.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-xs p-1"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 text-xs p-1"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="text-center py-8 text-gray-500">
                      {searchTerm ? 'No matching records found' : 'No payment entries found'}
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
                disabled={loading}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {totalCount === 0 
                  ? '0-0 of 0' 
                  : `${startIndex + 1}-${endIndex} of ${totalCount}`
                }
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0 || loading}
                  className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
