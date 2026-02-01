'use client'

import { useState } from 'react'

export default function ItemReOrderList() {
  const [formData, setFormData] = useState({
    filterType: 'All'
  })

  const [reorderEntries, setReorderEntries] = useState([
    {
      id: 1,
      sl: 1,
      code: 'P00078',
      itemName: 'Rice Premium',
      group: 'Rice',
      category: 'Grains',
      reOrderQty: '0 kg',
      currentStock: '-4 kg'
    },
    {
      id: 2,
      sl: 2,
      code: 'P00079',
      itemName: 'Bangla Cement',
      group: '2 lr pet + LD',
      category: '100 mic',
      reOrderQty: '0 kg',
      currentStock: '-38 kg'
    },
    {
      id: 3,
      sl: 3,
      code: 'P00081',
      itemName: 'Atash Rice-Jora Horin',
      group: 'Rice',
      category: 'Premium',
      reOrderQty: '0 kg',
      currentStock: '-141 kg'
    },
    {
      id: 4,
      sl: 4,
      code: 'P00082',
      itemName: 'Miniket Rice - Abul Khair 25 Kg',
      group: 'Rice',
      category: 'Miniket',
      reOrderQty: '0.25 Kg Bag',
      currentStock: '-13.25 Kg Bag'
    },
    {
      id: 5,
      sl: 5,
      code: 'P00083',
      itemName: 'Miniket Rice - Abul Khair 50 Kg',
      group: 'Rice',
      category: 'Miniket',
      reOrderQty: '0.50 Kg Bag',
      currentStock: '-31.50 Kg Bag'
    }
  ])

  const [filteredEntries, setFilteredEntries] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const filterTypes = [
    'All',
    'Below Re-order Level',
    'Out of Stock',
    'Critical Stock'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGetReport = () => {
    try {
      // Apply filter based on filter type
      let filtered = [...reorderEntries]
      
      if (formData.filterType === 'Below Re-order Level') {
        // Filter items that need reordering (negative stock or low stock)
        filtered = filtered.filter(entry => 
          entry.currentStock.includes('-') || 
          parseFloat(entry.currentStock.replace(/[^0-9.-]/g, '')) < 10
        )
      } else if (formData.filterType === 'Out of Stock') {
        // Filter items with negative stock
        filtered = filtered.filter(entry => entry.currentStock.includes('-'))
      } else if (formData.filterType === 'Critical Stock') {
        // Filter items with very low or negative stock
        filtered = filtered.filter(entry => {
          const stock = parseFloat(entry.currentStock.replace(/[^0-9.-]/g, ''))
          return stock < 5
        })
      }
      
      setFilteredEntries(filtered)
      setShowTable(true)
      setCurrentPage(1)
      console.log('Generating re-order report for:', formData)
      console.log('Filtered entries:', filtered.length)
    } catch (error) {
      console.error('Error filtering entries:', error)
      alert('Error generating report.')
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (!showTable) return
    
    if (searchTerm.trim() === '') {
      handleGetReport() // Re-apply original filters
    } else {
      const filtered = filteredEntries.filter(entry =>
        entry.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.group.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Item Re-Order List Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0f766e; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <h1>Item Re-Order List Report</h1>
          <p>Filter Type: ${formData.filterType}</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Code</th>
                <th>Item Name</th>
                <th>Group</th>
                <th>Category</th>
                <th>Re-Order Qty</th>
                <th>Current Stock</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td class="text-center">${entry.sl}</td>
                  <td>${entry.code}</td>
                  <td>${entry.itemName}</td>
                  <td>${entry.group}</td>
                  <td>${entry.category}</td>
                  <td class="text-right">${entry.reOrderQty}</td>
                  <td class="text-right">${entry.currentStock}</td>
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
      ['SL', 'Code', 'Item Name', 'Group', 'Category', 'Re-Order Qty', 'Current Stock'],
      ...filteredEntries.map(entry => [
        entry.sl,
        entry.code,
        entry.itemName,
        entry.group,
        entry.category,
        entry.reOrderQty,
        entry.currentStock
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'item_reorder_list.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to remove this item from the re-order list?')) {
      const updatedEntries = reorderEntries.filter(entry => entry.id !== id)
      setReorderEntries(updatedEntries)
      
      // Update filtered entries if table is shown
      if (showTable) {
        const filtered = updatedEntries.filter(entry => {
          if (formData.filterType === 'Below Re-order Level') {
            return entry.currentStock.includes('-') || 
                   parseFloat(entry.currentStock.replace(/[^0-9.-]/g, '')) < 10
          } else if (formData.filterType === 'Out of Stock') {
            return entry.currentStock.includes('-')
          } else if (formData.filterType === 'Critical Stock') {
            const stock = parseFloat(entry.currentStock.replace(/[^0-9.-]/g, ''))
            return stock < 5
          }
          return true
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

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Item Re-Order List Report</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Filter Type */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Filter Type</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.filterType}
                onChange={(e) => handleInputChange('filterType', e.target.value)}
              >
                {filterTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
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

            {/* Print Button */}
            <div className="flex items-end">
              <button 
                onClick={handlePrint}
                className="bg-gray-600 text-white px-6 py-2 rounded text-sm hover:bg-gray-700 transition-colors flex items-center gap-2"
                disabled={!showTable}
              >
                🖨️ Print
              </button>
            </div>
          </div>

          {/* Current Filter Display */}
          <div className="text-sm text-gray-600 mb-4">
            Current Filter: <span className="font-medium">{formData.filterType}</span>
          </div>
        </div>
      </div>

      {/* Item Re-Order List Table */}
      {showTable && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Re-Order Items List</h3>
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
                  placeholder="Search by item name, code, group, or category..."
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
              Showing {filteredEntries.length} items that need reordering ({formData.filterType})
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">SL</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Code</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Item Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Group</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Category</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold text-gray-700">Re-Order Qty</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold text-gray-700">Current Stock</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEntries.length > 0 ? (
                    currentEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-xs text-center">{entry.sl}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs font-medium text-teal-600">{entry.code}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">{entry.itemName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">{entry.group}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">{entry.category}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs text-right">{entry.reOrderQty}</td>
                        <td className={`border border-gray-300 px-3 py-2 text-xs text-right font-medium ${
                          entry.currentStock.includes('-') ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {entry.currentStock}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <div className="flex justify-center gap-1">
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-xs"
                              title="Create Purchase Order"
                            >
                              🛒
                            </button>
                            <button 
                              onClick={() => handleDeleteEntry(entry.id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                              title="Remove from List"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                        {searchTerm ? 'No matching items found' : 'No items need reordering'}
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