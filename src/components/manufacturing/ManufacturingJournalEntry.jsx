'use client'

import { useState, useEffect } from 'react'

export default function ManufacturingJournalEntry() {
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

  // Generate voucher number
  const generateVoucherNo = () => {
    const prefix = 'MJ'
    const timestamp = Date.now().toString().slice(-4)
    return `${prefix}${timestamp}`
  }

  const [formData, setFormData] = useState({
    // Raw Item Information
    searchRawItem: '',
    rawQty: '',
    rawRate: '',
    rawTotal: '',
    
    // Product Cart Information
    searchProductionItem: '',
    productTotal: '',
    
    // Other Information
    voucherNo: generateVoucherNo(),
    entryDate: getTodayFormatted(),
    narration: '',
    labourCost: '0',
    othersCost: '0',
    totalCost: '0'
  })

  const [rawItemsCart, setRawItemsCart] = useState([])
  const [productionCart, setProductionCart] = useState([])
  const [journalEntries, setJournalEntries] = useState([
    {
      id: 1,
      voucherNo: 'MJ001',
      date: '15/08/2025',
      rawItems: 2,
      productionItems: 1,
      totalCost: '₹ 25,000.00',
      status: 'Draft',
      createdAt: new Date('2025-08-15').getTime()
    },
    {
      id: 2,
      voucherNo: 'MJ002',
      date: '16/08/2025',
      rawItems: 3,
      productionItems: 2,
      totalCost: '₹ 38,500.00',
      status: 'Posted',
      createdAt: new Date('2025-08-16').getTime()
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState(journalEntries)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  // Sample data
  const rawItems = [
    { id: 1, name: 'Raw Material A', rate: 50.00 },
    { id: 2, name: 'Raw Material B', rate: 75.00 },
    { id: 3, name: 'Raw Material C', rate: 100.00 },
    { id: 4, name: 'Steel Sheet', rate: 200.00 },
    { id: 5, name: 'Aluminum Rod', rate: 150.00 }
  ]

  const productionItems = [
    { id: 1, name: 'Finished Product A', rate: 500.00 },
    { id: 2, name: 'Finished Product B', rate: 750.00 },
    { id: 3, name: 'Component X', rate: 300.00 },
    { id: 4, name: 'Assembly Y', rate: 1200.00 },
    { id: 5, name: 'Final Product Z', rate: 2000.00 }
  ]

  // Update filtered entries when journal entries change
  useEffect(() => {
    handleSearch()
  }, [journalEntries])

  // Calculate totals whenever carts change
  useEffect(() => {
    calculateTotals()
  }, [rawItemsCart, productionCart, formData.labourCost, formData.othersCost])

  // Auto-fill rate when raw item is selected
  useEffect(() => {
    if (formData.searchRawItem) {
      const selectedItem = rawItems.find(item => item.name === formData.searchRawItem)
      if (selectedItem) {
        setFormData(prev => ({
          ...prev,
          rawRate: selectedItem.rate.toString()
        }))
      }
    }
  }, [formData.searchRawItem])

  // Auto-calculate raw total when qty or rate changes
  useEffect(() => {
    if (formData.rawQty && formData.rawRate) {
      const total = parseFloat(formData.rawQty) * parseFloat(formData.rawRate)
      setFormData(prev => ({
        ...prev,
        rawTotal: total.toFixed(2)
      }))
    }
  }, [formData.rawQty, formData.rawRate])

  const handleInputChange = (field, value) => {
    if (field === 'entryDate' && value.includes('-')) {
      const formattedDate = formatDateForDisplay(value)
      setFormData(prev => ({
        ...prev,
        entryDate: formattedDate
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleAddRawItemToCart = () => {
    if (!formData.rawTotal || !formData.searchRawItem) {
      alert('Please select a raw item and enter total amount')
      return
    }

    const selectedItem = rawItems.find(item => item.name === formData.searchRawItem)
    if (!selectedItem) {
      alert('Please select a valid raw item')
      return
    }

    const newCartItem = {
      id: Date.now(),
      itemName: selectedItem.name,
      qty: parseFloat(formData.rawQty) || 1,
      rate: parseFloat(formData.rawRate) || selectedItem.rate,
      total: parseFloat(formData.rawTotal) || 0
    }

    setRawItemsCart(prev => [...prev, newCartItem])
    
    // Clear fields
    setFormData(prev => ({
      ...prev,
      searchRawItem: '',
      rawQty: '',
      rawRate: '',
      rawTotal: ''
    }))
  }

  const handleAddProductionToCart = () => {
    if (!formData.productTotal || !formData.searchProductionItem) {
      alert('Please select a production item and enter total amount')
      return
    }

    const selectedItem = productionItems.find(item => item.name === formData.searchProductionItem)
    if (!selectedItem) {
      alert('Please select a valid production item')
      return
    }

    const newCartItem = {
      id: Date.now(),
      itemName: selectedItem.name,
      qty: 1,
      rate: selectedItem.rate,
      total: parseFloat(formData.productTotal) || 0
    }

    setProductionCart(prev => [...prev, newCartItem])
    
    // Clear fields
    setFormData(prev => ({
      ...prev,
      searchProductionItem: '',
      productTotal: ''
    }))
  }

  const handleRemoveFromRawCart = (id) => {
    setRawItemsCart(prev => prev.filter(item => item.id !== id))
  }

  const handleRemoveFromProductionCart = (id) => {
    setProductionCart(prev => prev.filter(item => item.id !== id))
  }

  const calculateTotals = () => {
    const rawSubTotal = rawItemsCart.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0)
    }, 0)

    const productionSubTotal = productionCart.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0)
    }, 0)

    const labourCost = parseFloat(formData.labourCost) || 0
    const othersCost = parseFloat(formData.othersCost) || 0

    const totalCost = rawSubTotal + labourCost + othersCost

    setFormData(prev => ({
      ...prev,
      totalCost: totalCost.toFixed(2)
    }))
  }

  const handleSave = () => {
    if (rawItemsCart.length === 0 && productionCart.length === 0) {
      alert('Please add at least one item to the manufacturing journal')
      return
    }

    const newEntry = {
      id: Date.now(),
      voucherNo: formData.voucherNo,
      date: formData.entryDate,
      rawItems: rawItemsCart.length,
      productionItems: productionCart.length,
      totalCost: `₹ ${parseFloat(formData.totalCost).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      status: 'Draft',
      createdAt: Date.now()
    }

    setJournalEntries(prev => [...prev, newEntry])
    setRawItemsCart([])
    setProductionCart([])
    
    // Reset form
    setFormData(prev => ({
      ...prev,
      searchRawItem: '',
      rawQty: '',
      rawRate: '',
      rawTotal: '',
      searchProductionItem: '',
      productTotal: '',
      voucherNo: generateVoucherNo(),
      narration: '',
      labourCost: '0',
      othersCost: '0',
      totalCost: '0'
    }))

    alert(`Manufacturing Journal ${newEntry.voucherNo} saved successfully!`)
  }

  const handleReset = () => {
    setRawItemsCart([])
    setProductionCart([])
    setFormData(prev => ({
      ...prev,
      searchRawItem: '',
      rawQty: '',
      rawRate: '',
      rawTotal: '',
      searchProductionItem: '',
      productTotal: '',
      voucherNo: generateVoucherNo(),
      narration: '',
      labourCost: '0',
      othersCost: '0',
      totalCost: '0'
    }))
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(journalEntries)
    } else {
      const filtered = journalEntries.filter(entry =>
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
    setCurrentPage(1)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(journalEntries)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Manufacturing Journal Entry List</title>
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
            <div class="report-title">Manufacturing Journal Entry List</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredEntries.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Date</th>
                <th>Raw Items</th>
                <th>Production Items</th>
                <th>Total Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.date}</td>
                  <td>${entry.rawItems}</td>
                  <td>${entry.productionItems}</td>
                  <td>${entry.totalCost}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Manufacturing Journal Report - Fayullah Factory Management System
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
      ['Fayullah Factory - Manufacturing Journal Entry List'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [],
      ['Voucher No', 'Date', 'Raw Items', 'Production Items', 'Total Cost', 'Status'],
      ...filteredEntries.map(entry => [
        entry.voucherNo,
        entry.date,
        entry.rawItems,
        entry.productionItems,
        entry.totalCost,
        entry.status
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manufacturing_journal_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      const updatedEntries = journalEntries.filter(entry => entry.id !== id)
      setJournalEntries(updatedEntries)
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  // Handle Enter key for adding to cart
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      if (action === 'raw') {
        handleAddRawItemToCart()
      } else if (action === 'production') {
        handleAddProductionToCart()
      }
    }
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">Manufacturing Journal Entry</h2>
          <div className="text-right">
            <div className="text-sm font-semibold">Fayullah Factory</div>
            <div className="text-xs opacity-90">Manufacturing Management System</div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Consum Raw Items Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Consum Raw Items Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Raw Item */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Search Raw Item</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.searchRawItem}
                  onChange={(e) => handleInputChange('searchRawItem', e.target.value)}
                >
                  <option value="">No options</option>
                  {rawItems.map(item => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* QTY */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">QTY</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.rawQty}
                  onChange={(e) => handleInputChange('rawQty', e.target.value)}
                />
              </div>

              {/* Rate */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Rate</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.rawRate}
                  onChange={(e) => handleInputChange('rawRate', e.target.value)}
                />
              </div>

              {/* Total */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Total</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.rawTotal}
                  onChange={(e) => handleInputChange('rawTotal', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'raw')}
                  placeholder="Press Enter Key to Cart"
                />
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-4">
              <button 
                onClick={handleAddRawItemToCart}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                ADD TO CART
              </button>
            </div>
          </div>

          {/* Item cart / Product cart Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Item cart / Product cart Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Search Production Item */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Search Production Item</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.searchProductionItem}
                  onChange={(e) => handleInputChange('searchProductionItem', e.target.value)}
                >
                  <option value="">No options</option>
                  {productionItems.map(item => (
                    <option key={item.id} value={item.name}>{item.name}</option>
                  ))}
                </select>
              </div>

              {/* Total */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Total</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.productTotal}
                  onChange={(e) => handleInputChange('productTotal', e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, 'production')}
                  placeholder="Press Enter Key to Cart"
                />
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="mb-4">
              <button 
                onClick={handleAddProductionToCart}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
              >
                ADD TO CART
              </button>
            </div>
          </div>

          {/* Raw Items Cart */}
          {rawItemsCart.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Raw Items Cart</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">SL Item</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">QTY</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Rate (Per)</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rawItemsCart.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.itemName}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.qty}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.rate.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium">{item.total.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-center">
                          <button 
                            onClick={() => handleRemoveFromRawCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove from cart"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Production Items Cart */}
          {productionCart.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Production Items Cart</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">SL Item</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">QTY</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Rate (Per)</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionCart.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.itemName}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.qty}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.rate.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium">{item.total.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-center">
                          <button 
                            onClick={() => handleRemoveFromProductionCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove from cart"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other Information & Voucher Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Narration */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Narration...</label>
              <textarea 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows="4"
                placeholder="Enter manufacturing journal description or notes..."
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
              />
            </div>

            {/* Voucher Details & Costs */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Voucher No */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Voucher No</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.voucherNo}
                    onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                  />
                </div>

                {/* Entry Date */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Entry Date</label>
                  <input 
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formatDateForInput(formData.entryDate)}
                    onChange={(e) => handleInputChange('entryDate', e.target.value)}
                  />
                </div>

                {/* Labour Cost */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Labour Cost</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.labourCost}
                    onChange={(e) => handleInputChange('labourCost', e.target.value)}
                  />
                </div>

                {/* Others Cost */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Others Cost</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.othersCost}
                    onChange={(e) => handleInputChange('othersCost', e.target.value)}
                  />
                </div>

                {/* Total Cost */}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Total Cost</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-medium"
                    value={`₹ ${parseFloat(formData.totalCost || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-6 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              RESET
            </button>
            <button 
              onClick={handleSave}
              className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              🔒 SAVE
            </button>
          </div>
        </div>
      </div>

      {/* Manufacturing Journal Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Manufacturing Journal Entry List ({filteredEntries.length} records)</h3>
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
                📊
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
                placeholder="Search by voucher number or status..."
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">SL</th>
                  <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Voucher No</th>
                  <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                  <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Raw Items</th>
                  <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Production Items</th>
                  <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Total Cost</th>
                  <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Status</th>
                  <th className="border-b border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No manufacturing journal entries found
                    </td>
                  </tr>
                ) : (
                  currentEntries.map((entry, index) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="border-b border-gray-300 px-3 py-2 text-xs">{startIndex + index + 1}</td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium text-blue-600">{entry.voucherNo}</td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs">{entry.date}</td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs">{entry.rawItems}</td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs">{entry.productionItems}</td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium">{entry.totalCost}</td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.status === 'Draft' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="View"
                          >
                            👁️
                          </button>
                          <button
                            className="text-green-500 hover:text-green-700 p-1"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {startIndex + 1}-{Math.min(endIndex, filteredEntries.length)} of {filteredEntries.length}
                </span>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ⏮️
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ◀️
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === pageNum
                            ? 'bg-teal-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ▶️
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ⏭️
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