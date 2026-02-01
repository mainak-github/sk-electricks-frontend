'use client'

import { useState } from 'react'

export default function EmployeeLedger() {
  // Get today's date in DD/MM/YYYY format
  const getTodayFormatted = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Convert DD/MM/YYYY to YYYY-MM-DD for date input
  const formatDateForInput = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  // Parse DD/MM/YYYY to Date object
  const parseDisplayDate = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return new Date(year, month - 1, day)
  }

  const [formData, setFormData] = useState({
    selectedEmployee: '',
    fromDate: getTodayFormatted(),
    toDate: getTodayFormatted()
  })

  const [ledgerEntries, setLedgerEntries] = useState([
    {
      id: 1,
      date: '2025-08-01',
      employee: 'John Doe',
      particulars: 'Basic Salary - August 2025',
      paymentCode: 'EPAY001',
      debit: '25,000.00',
      credit: '',
      balance: '25,000.00',
      type: 'Salary'
    },
    {
      id: 2,
      date: '2025-08-05',
      employee: 'Jane Smith',
      particulars: 'Overtime Payment',
      paymentCode: 'EPAY003',
      debit: '3,500.00',
      credit: '',
      balance: '28,500.00',
      type: 'Overtime'
    },
    {
      id: 3,
      date: '2025-08-10',
      employee: 'John Doe',
      particulars: 'Advance Deduction',
      paymentCode: 'ADV001',
      debit: '',
      credit: '5,000.00',
      balance: '23,500.00',
      type: 'Deduction'
    },
    {
      id: 4,
      date: '2025-08-15',
      employee: 'Ahmed Khan',
      particulars: 'Bonus Payment',
      paymentCode: 'BON001',
      debit: '2,000.00',
      credit: '',
      balance: '25,500.00',
      type: 'Bonus'
    },
    {
      id: 5,
      date: '2025-08-12',
      employee: 'Jane Smith',
      particulars: 'Basic Salary - August 2025',
      paymentCode: 'EPAY005',
      debit: '30,000.00',
      credit: '',
      balance: '30,000.00',
      type: 'Salary'
    },
    {
      id: 6,
      date: '2025-08-08',
      employee: 'Maria Rodriguez',
      particulars: 'Commission Payment',
      paymentCode: 'COM001',
      debit: '5,500.00',
      credit: '',
      balance: '5,500.00',
      type: 'Commission'
    },
    {
      id: 7,
      date: '2025-08-14',
      employee: 'John Doe',
      particulars: 'Today\'s Payment - Test Entry',
      paymentCode: 'EPAY007',
      debit: '1,500.00',
      credit: '',
      balance: '25,000.00',
      type: 'Bonus'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const employees = [
    'John Doe',
    'Jane Smith',
    'Ahmed Khan',
    'Maria Rodriguez',
    'David Wilson'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDateChange = (field, value) => {
    // Convert YYYY-MM-DD to DD/MM/YYYY
    const formattedDate = formatDateForDisplay(value)
    handleInputChange(field, formattedDate)
  }

  const handleGetReport = () => {
    if (!formData.selectedEmployee) {
      alert('Please select an employee')
      return
    }

    try {
      // Parse dates from DD/MM/YYYY format
      const fromDate = parseDisplayDate(formData.fromDate)
      const toDate = parseDisplayDate(formData.toDate)
      
      // Validate dates
      if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
        alert('Please enter valid dates in DD/MM/YYYY format')
        return
      }
      
      if (fromDate > toDate) {
        alert('From date cannot be later than to date')
        return
      }
      
      const filtered = ledgerEntries.filter(entry => {
        const entryDate = new Date(entry.date)
        const dateInRange = entryDate >= fromDate && entryDate <= toDate
        
        // If "All" is selected, show all employees within date range
        if (formData.selectedEmployee === 'All') {
          return dateInRange
        }
        
        // Otherwise filter by specific employee
        return entry.employee === formData.selectedEmployee && dateInRange
      })
      
      setFilteredEntries(filtered)
      setShowTable(true)
      setCurrentPage(1) // Reset to first page
      console.log('Generating report for:', formData)
      console.log('Filtered entries:', filtered.length)
    } catch (error) {
      console.error('Error filtering entries:', error)
      alert('Error processing dates. Please check date format.')
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (!showTable) return
    
    if (searchTerm.trim() === '') {
      handleGetReport() // Re-apply original filters
    } else {
      const filtered = filteredEntries.filter(entry =>
        entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.paymentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.employee.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    if (showTable) {
      handleGetReport() // Re-apply original filters
    }
    setShowSearch(false)
  }

  // Set date range shortcuts
  const setDateRange = (days) => {
    const today = new Date()
    const fromDate = new Date(today)
    fromDate.setDate(today.getDate() - days)
    
    setFormData(prev => ({
      ...prev,
      fromDate: formatDateForDisplay(fromDate.toISOString().split('T')[0]),
      toDate: getTodayFormatted()
    }))
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Employee Ledger Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0f766e; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
          <h1>Employee Ledger Report</h1>
          <p>Employee: ${formData.selectedEmployee || 'All Employees'}</p>
          <p>Period: ${formData.fromDate} to ${formData.toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee</th>
                <th>Particulars</th>
                <th>Payment Code</th>
                <th>Debit</th>
                <th>Credit</th>
                <th>Balance</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString('en-GB')}</td>
                  <td>${entry.employee}</td>
                  <td>${entry.particulars}</td>
                  <td>${entry.paymentCode}</td>
                  <td class="text-right">${entry.debit || '-'}</td>
                  <td class="text-right">${entry.credit || '-'}</td>
                  <td class="text-right">${entry.balance}</td>
                  <td>${entry.type}</td>
                </tr>
              `).join('')}
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
      ['Date', 'Employee', 'Particulars', 'Payment Code', 'Debit', 'Credit', 'Balance', 'Type'],
      ...filteredEntries.map(entry => [
        new Date(entry.date).toLocaleDateString('en-GB'),
        entry.employee,
        entry.particulars,
        entry.paymentCode,
        entry.debit || '',
        entry.credit || '',
        entry.balance,
        entry.type
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'employee_ledger.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = ledgerEntries.filter(entry => entry.id !== id)
      setLedgerEntries(updatedEntries)
      
      // Update filtered entries if table is shown
      if (showTable) {
        const fromDate = parseDisplayDate(formData.fromDate)
        const toDate = parseDisplayDate(formData.toDate)
        
        const filtered = updatedEntries.filter(entry => {
          const entryDate = new Date(entry.date)
          const dateInRange = entryDate >= fromDate && entryDate <= toDate
          
          // If "All" is selected, show all employees within date range
          if (formData.selectedEmployee === 'All') {
            return dateInRange
          }
          
          // Otherwise filter by specific employee
          return entry.employee === formData.selectedEmployee && dateInRange
        })
        
        setFilteredEntries(filtered)
      }
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  // Calculate totals
  const totalDebit = filteredEntries.reduce((sum, entry) => 
    sum + (parseFloat(entry.debit.replace(',', '')) || 0), 0
  )
  const totalCredit = filteredEntries.reduce((sum, entry) => 
    sum + (parseFloat(entry.credit.replace(',', '')) || 0), 0
  )

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Employee Ledger</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Select Employee */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Select Employee</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.selectedEmployee}
                onChange={(e) => handleInputChange('selectedEmployee', e.target.value)}
              >
                <option value="">Select Employee</option>
                <option value="All">All Employees</option>
                {employees.map(employee => (
                  <option key={employee} value={employee}>{employee}</option>
                ))}
              </select>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">From Date</label>
              <input 
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formatDateForInput(formData.fromDate)}
                onChange={(e) => handleDateChange('fromDate', e.target.value)}
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">To Date</label>
              <input 
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formatDateForInput(formData.toDate)}
                onChange={(e) => handleDateChange('toDate', e.target.value)}
              />
            </div>

            {/* Get Report Button */}
            <div className="flex items-end">
              <button 
                onClick={handleGetReport}
                className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                🔍 GET REPORT
              </button>
            </div>
          </div>

          {/* Date Range Shortcuts */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button 
              onClick={() => setDateRange(0)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Today
            </button>
            <button 
              onClick={() => setDateRange(7)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Last 7 Days
            </button>
            <button 
              onClick={() => setDateRange(30)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Last 30 Days
            </button>
            <button 
              onClick={() => setDateRange(90)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Last 90 Days
            </button>
          </div>

          {/* Current Date Range Display */}
          <div className="text-sm text-gray-600 mb-4">
            Selected Date Range: <span className="font-medium">{formData.fromDate} to {formData.toDate}</span>
            {formData.selectedEmployee && (
              <span className="ml-4">
                Employee: <span className="font-medium">{formData.selectedEmployee}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Employee Ledger Report */}
      {showTable && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Employee Ledger Report</h3>
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
                  placeholder="Search by employee, particulars, payment code, or type..."
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

            {/* Results Summary */}
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredEntries.length} records for {formData.selectedEmployee || 'selected employee'} from {formData.fromDate} to {formData.toDate}
            </div>

            {/* Table Headers */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <div className="grid grid-cols-9 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                  <div>Date</div>
                  <div>Employee</div>
                  <div>Particulars</div>
                  <div>Payment Code</div>
                  <div className="text-right">Debit</div>
                  <div className="text-right">Credit</div>
                  <div className="text-right">Balance</div>
                  <div>Type</div>
                  <div>Actions</div>
                </div>

                {/* Table Rows */}
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <div key={entry.id} className="grid grid-cols-9 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                      <div>{new Date(entry.date).toLocaleDateString('en-GB')}</div>
                      <div className="font-medium text-gray-700">{entry.employee}</div>
                      <div className="truncate" title={entry.particulars}>{entry.particulars}</div>
                      <div className="font-medium text-teal-600">{entry.paymentCode}</div>
                      <div className="text-right font-medium text-green-600">
                        {entry.debit && `₹ ${entry.debit}`}
                      </div>
                      <div className="text-right font-medium text-red-600">
                        {entry.credit && `₹ ${entry.credit}`}
                      </div>
                      <div className="text-right font-medium">₹ {entry.balance}</div>
                      <div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.type === 'Salary' 
                            ? 'bg-blue-100 text-blue-800' 
                            : entry.type === 'Overtime'
                            ? 'bg-green-100 text-green-800'
                            : entry.type === 'Bonus'
                            ? 'bg-purple-100 text-purple-800'
                            : entry.type === 'Commission'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.type}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-xs"
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? 'No matching records found' : 'Sorry, no matching records found'}
                  </div>
                )}

                {/* Summary Row */}
                {filteredEntries.length > 0 && (
                  <div className="grid grid-cols-9 gap-2 text-xs py-3 border-t-2 border-teal-600 bg-teal-50 font-semibold">
                    <div className="col-span-4 text-right">TOTAL:</div>
                    <div className="text-right text-green-600">
                      ₹ {totalDebit.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-right text-red-600">
                      ₹ {totalCredit.toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-right text-teal-700">
                      ₹ {(totalDebit - totalCredit).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="col-span-2"></div>
                  </div>
                )}
              </div>
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
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {filteredEntries.length === 0 
                    ? '0-0 of 0' 
                    : `${startIndex + 1}-${Math.min(endIndex, filteredEntries.length)} of ${filteredEntries.length}`
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
          </div>
        </div>
      )}
    </div>
  )
}