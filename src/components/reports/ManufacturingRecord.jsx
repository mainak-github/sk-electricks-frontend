'use client'

import { useState } from 'react'

export default function ManufacturingRecord() {
  const [filterType, setFilterType] = useState('All')
  const [recordType, setRecordType] = useState('without Item')
  const [fromDate, setFromDate] = useState('24/08/2025')
  const [toDate, setToDate] = useState('24/08/2025')
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)

  // Sample manufacturing record data with Indian business context
  const [manufacturingRecordData] = useState([
    { 
      id: 1, 
      sl: 1, 
      date: '24/08/2025',
      productionOrderNo: 'MFG-2025-001',
      productName: 'Steel Component - Type A',
      batchNumber: 'BATCH-A-001',
      quantityProduced: 500,
      rawMaterialCost: 125000.00,
      laborCost: 35000.00,
      overheadCost: 15000.00,
      totalCost: 175000.00,
      unitCost: 350.00,
      productionManager: 'Rajesh Kumar',
      qualityStatus: 'Approved',
      productionStatus: 'Completed'
    },
    { 
      id: 2, 
      sl: 2, 
      date: '23/08/2025',
      productionOrderNo: 'MFG-2025-002',
      productName: 'Electronic Circuit Board',
      batchNumber: 'BATCH-E-002',
      quantityProduced: 200,
      rawMaterialCost: 180000.00,
      laborCost: 45000.00,
      overheadCost: 25000.00,
      totalCost: 250000.00,
      unitCost: 1250.00,
      productionManager: 'Priya Singh',
      qualityStatus: 'Pending',
      productionStatus: 'In Progress'
    },
    { 
      id: 3, 
      sl: 3, 
      date: '22/08/2025',
      productionOrderNo: 'MFG-2025-003',
      productName: 'Automotive Parts Set',
      batchNumber: 'BATCH-AUTO-003',
      quantityProduced: 150,
      rawMaterialCost: 275000.00,
      laborCost: 65000.00,
      overheadCost: 35000.00,
      totalCost: 375000.00,
      unitCost: 2500.00,
      productionManager: 'Amit Sharma',
      qualityStatus: 'Approved',
      productionStatus: 'Completed'
    },
    { 
      id: 4, 
      sl: 4, 
      date: '21/08/2025',
      productionOrderNo: 'MFG-2025-004',
      productName: 'Chemical Processing Unit',
      batchNumber: 'BATCH-CHEM-004',
      quantityProduced: 25,
      rawMaterialCost: 450000.00,
      laborCost: 85000.00,
      overheadCost: 65000.00,
      totalCost: 600000.00,
      unitCost: 24000.00,
      productionManager: 'Sneha Reddy',
      qualityStatus: 'Rejected',
      productionStatus: 'On Hold'
    },
    { 
      id: 5, 
      sl: 5, 
      date: '20/08/2025',
      productionOrderNo: 'MFG-2025-005',
      productName: 'Textile Machinery Parts',
      batchNumber: 'BATCH-TEX-005',
      quantityProduced: 75,
      rawMaterialCost: 325000.00,
      laborCost: 55000.00,
      overheadCost: 45000.00,
      totalCost: 425000.00,
      unitCost: 5666.67,
      productionManager: 'Vikram Patel',
      qualityStatus: 'Approved',
      productionStatus: 'Completed'
    },
    { 
      id: 6, 
      sl: 6, 
      date: '19/08/2025',
      productionOrderNo: 'MFG-2025-006',
      productName: 'Precision Engineering Tools',
      batchNumber: 'BATCH-PREC-006',
      quantityProduced: 100,
      rawMaterialCost: 280000.00,
      laborCost: 70000.00,
      overheadCost: 50000.00,
      totalCost: 400000.00,
      unitCost: 4000.00,
      productionManager: 'Anita Gupta',
      qualityStatus: 'Under Review',
      productionStatus: 'In Progress'
    },
    { 
      id: 7, 
      sl: 7, 
      date: '18/08/2025',
      productionOrderNo: 'MFG-2025-007',
      productName: 'Industrial Paint Mixer',
      batchNumber: 'BATCH-PAINT-007',
      quantityProduced: 40,
      rawMaterialCost: 520000.00,
      laborCost: 95000.00,
      overheadCost: 75000.00,
      totalCost: 690000.00,
      unitCost: 17250.00,
      productionManager: 'Rajesh Khanna',
      qualityStatus: 'Approved',
      productionStatus: 'Completed'
    },
    { 
      id: 8, 
      sl: 8, 
      date: '17/08/2025',
      productionOrderNo: 'MFG-2025-008',
      productName: 'Construction Equipment',
      batchNumber: 'BATCH-CONST-008',
      quantityProduced: 10,
      rawMaterialCost: 850000.00,
      laborCost: 125000.00,
      overheadCost: 125000.00,
      totalCost: 1100000.00,
      unitCost: 110000.00,
      productionManager: 'Meera Joshi',
      qualityStatus: 'Pending',
      productionStatus: 'In Progress'
    },
    { 
      id: 9, 
      sl: 9, 
      date: '16/08/2025',
      productionOrderNo: 'MFG-2025-009',
      productName: 'Petrochemical Processing Unit',
      batchNumber: 'BATCH-PETRO-009',
      quantityProduced: 5,
      rawMaterialCost: 1200000.00,
      laborCost: 180000.00,
      overheadCost: 120000.00,
      totalCost: 1500000.00,
      unitCost: 300000.00,
      productionManager: 'Suresh Nair',
      qualityStatus: 'Approved',
      productionStatus: 'Completed'
    },
    { 
      id: 10, 
      sl: 10, 
      date: '15/08/2025',
      productionOrderNo: 'MFG-2025-010',
      productName: 'IT Server Components',
      batchNumber: 'BATCH-IT-010',
      quantityProduced: 80,
      rawMaterialCost: 650000.00,
      laborCost: 95000.00,
      overheadCost: 85000.00,
      totalCost: 830000.00,
      unitCost: 10375.00,
      productionManager: 'Kavitha Menon',
      qualityStatus: 'Under Review',
      productionStatus: 'In Progress'
    }
  ])

  const [filteredData, setFilteredData] = useState(manufacturingRecordData)

  // Filter options for manufacturing record
  const filterTypeOptions = [
    'All',
    'Completed',
    'In Progress',
    'On Hold',
    'Cancelled',
    'Scheduled'
  ]

  const recordTypeOptions = [
    'without Item',
    'with Item'
  ]

  // Calculate totals
  const totalEntries = filteredData.length
  const totalQuantityProduced = filteredData.reduce((sum, item) => sum + item.quantityProduced, 0)
  const totalRawMaterialCost = filteredData.reduce((sum, item) => sum + item.rawMaterialCost, 0)
  const totalLaborCost = filteredData.reduce((sum, item) => sum + item.laborCost, 0)
  const totalOverheadCost = filteredData.reduce((sum, item) => sum + item.overheadCost, 0)
  const totalManufacturingCost = filteredData.reduce((sum, item) => sum + item.totalCost, 0)
  const completedQuantity = filteredData.filter(item => item.productionStatus === 'Completed').reduce((sum, item) => sum + item.quantityProduced, 0)
  const inProgressQuantity = filteredData.filter(item => item.productionStatus === 'In Progress').reduce((sum, item) => sum + item.quantityProduced, 0)

  const handleGetReport = () => {
    console.log('Generating manufacturing record with filters:', {
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
    let filtered = manufacturingRecordData
    
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
        item.productionStatus.toLowerCase() === filterType.toLowerCase()
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
      setFilteredData(manufacturingRecordData)
    } else {
      const filtered = manufacturingRecordData.filter(entry =>
        entry.productionOrderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.productionManager.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.qualityStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.productionStatus.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredData(filtered)
    }
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredData(manufacturingRecordData)
    setShowSearch(false)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Manufacturing Record</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 10px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .amount { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            .completed { color: #10b981; font-weight: bold; }
            .in-progress { color: #f59e0b; font-weight: bold; }
            .on-hold { color: #ef4444; font-weight: bold; }
            .approved { color: #10b981; font-weight: bold; }
            .pending { color: #f59e0b; font-weight: bold; }
            .rejected { color: #ef4444; font-weight: bold; }
            .under-review { color: #3b82f6; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Manufacturing Record</h1>
          <p>Filter: ${filterType} | Record Type: ${recordType}</p>
          <p>From: ${fromDate} To: ${toDate}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Date</th>
                <th>Production Order No</th>
                <th>Product Name</th>
                <th>Batch Number</th>
                <th>Quantity Produced</th>
                <th>Raw Material Cost</th>
                <th>Labor Cost</th>
                <th>Overhead Cost</th>
                <th>Total Cost</th>
                <th>Unit Cost</th>
                <th>Production Manager</th>
                <th>Quality Status</th>
                <th>Production Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry) => `
                <tr>
                  <td>${entry.sl}</td>
                  <td>${entry.date}</td>
                  <td>${entry.productionOrderNo}</td>
                  <td>${entry.productName}</td>
                  <td>${entry.batchNumber}</td>
                  <td>${entry.quantityProduced}</td>
                  <td class="amount">₹${entry.rawMaterialCost.toFixed(2)}</td>
                  <td class="amount">₹${entry.laborCost.toFixed(2)}</td>
                  <td class="amount">₹${entry.overheadCost.toFixed(2)}</td>
                  <td class="amount">₹${entry.totalCost.toFixed(2)}</td>
                  <td class="amount">₹${entry.unitCost.toFixed(2)}</td>
                  <td>${entry.productionManager}</td>
                  <td>${entry.qualityStatus}</td>
                  <td>${entry.productionStatus}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="5"><strong>Grand Total :</strong></td>
                <td><strong>${totalQuantityProduced}</strong></td>
                <td class="amount"><strong>₹${totalRawMaterialCost.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalLaborCost.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalOverheadCost.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹${totalManufacturingCost.toFixed(2)}</strong></td>
                <td colspan="4"></td>
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
      ['SL', 'Date', 'Production Order No', 'Product Name', 'Batch Number', 'Quantity Produced', 'Raw Material Cost', 'Labor Cost', 'Overhead Cost', 'Total Cost', 'Unit Cost', 'Production Manager', 'Quality Status', 'Production Status'],
      ...filteredData.map((entry) => [
        entry.sl,
        entry.date,
        entry.productionOrderNo,
        entry.productName,
        entry.batchNumber,
        entry.quantityProduced,
        entry.rawMaterialCost.toFixed(2),
        entry.laborCost.toFixed(2),
        entry.overheadCost.toFixed(2),
        entry.totalCost.toFixed(2),
        entry.unitCost.toFixed(2),
        entry.productionManager,
        entry.qualityStatus,
        entry.productionStatus
      ]),
      ['Grand Total', '', '', '', '', totalQuantityProduced, totalRawMaterialCost.toFixed(2), totalLaborCost.toFixed(2), totalOverheadCost.toFixed(2), totalManufacturingCost.toFixed(2), '', '', '', '']
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'manufacturing_record.csv'
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
          <h2 className="font-medium text-lg">Manufacturing Record</h2>
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
            <h3 className="text-lg font-medium">Manufacturing Record</h3>
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
                placeholder="Search by production order, product name, batch number, manager, quality status or production status..."
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
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Production Order No</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 min-w-[180px]">Product Name</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Batch Number</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Quantity Produced</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Raw Material Cost</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Labor Cost</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Overhead Cost</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Total Cost</th>
                  <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Unit Cost</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700">Production Manager</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Quality Status</th>
                  <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700">Production Status</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  <>
                    {currentEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-3 text-xs">{entry.sl}</td>
                        <td className="py-2 px-3 text-xs">{entry.date}</td>
                        <td className="py-2 px-3 text-xs font-medium text-blue-600">{entry.productionOrderNo}</td>
                        <td className="py-2 px-3 text-xs font-medium">{entry.productName}</td>
                        <td className="py-2 px-3 text-xs font-medium text-indigo-600">{entry.batchNumber}</td>
                        <td className="py-2 px-3 text-xs text-center">{entry.quantityProduced}</td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-purple-600">
                          ₹{entry.rawMaterialCost.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-orange-600">
                          ₹{entry.laborCost.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-pink-600">
                          ₹{entry.overheadCost.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-bold text-green-600">
                          ₹{entry.totalCost.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs text-right font-medium text-cyan-600">
                          ₹{entry.unitCost.toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-xs">{entry.productionManager}</td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.qualityStatus === 'Approved' ? 'bg-green-100 text-green-800' :
                            entry.qualityStatus === 'Pending' ? 'bg-orange-100 text-orange-800' :
                            entry.qualityStatus === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                            entry.qualityStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.qualityStatus}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-xs text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            entry.productionStatus === 'Completed' ? 'bg-green-100 text-green-800' :
                            entry.productionStatus === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            entry.productionStatus === 'On Hold' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.productionStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {/* Grand Total Row */}
                    <tr className="border-t-2 border-gray-400 bg-gray-100">
                      <td className="py-2 px-3 text-xs font-bold" colSpan="5">
                        Grand Total :
                      </td>
                      <td className="py-2 px-3 text-xs text-center font-bold text-blue-600">{totalQuantityProduced}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-purple-600">₹{totalRawMaterialCost.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-orange-600">₹{totalLaborCost.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-pink-600">₹{totalOverheadCost.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right font-bold text-green-600">₹{totalManufacturingCost.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-right" colSpan="4"></td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="14" className="text-center py-8 text-gray-500">
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
                <span className="font-medium text-gray-600">Total Production Orders:</span>
                <div className="text-lg font-bold text-blue-600">{totalEntries}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Quantity Produced:</span>
                <div className="text-lg font-bold text-indigo-600">{totalQuantityProduced}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Raw Material Cost:</span>
                <div className="text-lg font-bold text-purple-600">₹{totalRawMaterialCost.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Total Manufacturing Cost:</span>
                <div className="text-lg font-bold text-green-600">₹{totalManufacturingCost.toFixed(2)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Labor Cost:</span>
                <div className="text-lg font-bold text-orange-600">₹{totalLaborCost.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Overhead Cost:</span>
                <div className="text-lg font-bold text-pink-600">₹{totalOverheadCost.toFixed(2)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Completed Quantity:</span>
                <div className="text-lg font-bold text-green-600">{completedQuantity}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">In Progress Quantity:</span>
                <div className="text-lg font-bold text-blue-600">{inProgressQuantity}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-2">
              <div>
                <span className="font-medium text-gray-600">Completion Rate:</span>
                <div className="text-lg font-bold text-green-600">{totalQuantityProduced > 0 ? ((completedQuantity / totalQuantityProduced) * 100).toFixed(1) : '0.0'}%</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Average Unit Cost:</span>
                <div className="text-lg font-bold text-cyan-600">₹{totalQuantityProduced > 0 ? (totalManufacturingCost / totalQuantityProduced).toFixed(2) : '0.00'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-600">Production Efficiency:</span>
                <div className="text-lg font-bold text-indigo-600">{totalEntries > 0 ? ((completedQuantity / totalQuantityProduced) * 100).toFixed(1) : '0.0'}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  )
}