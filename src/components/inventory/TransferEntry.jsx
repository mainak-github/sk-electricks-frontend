'use client'

import { useState } from 'react'

export default function TransferEntry() {
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
    if (!dateStr) return ''
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const [formData, setFormData] = useState({
    searchItem: '',
    toBranch: '',
    branchAddress: '',
    voucherNo: 'T8',
    entryDate: getTodayFormatted(),
    narration: '',
    subTotal: 0.00,
    transportCost: 0,
    grandTotal: 0.00
  })

  const [cartItems, setCartItems] = useState([])
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [selectedItemForEdit, setSelectedItemForEdit] = useState(null)

  const availableItems = [
    { id: 1, name: 'Rice Premium', rate: 85.00, unit: 'kg' },
    { id: 2, name: 'Wheat Flour', rate: 45.00, unit: 'kg' },
    { id: 3, name: 'Sugar White', rate: 65.00, unit: 'kg' },
    { id: 4, name: 'Oil Soybean', rate: 120.00, unit: 'ltr' },
    { id: 5, name: 'Salt Refined', rate: 25.00, unit: 'kg' }
  ]

  const branches = [
    { id: 1, name: 'Main Branch', address: '123 Main Street, Dhaka-1000' },
    { id: 2, name: 'Chittagong Branch', address: '456 Port Road, Chittagong-4000' },
    { id: 3, name: 'Sylhet Branch', address: '789 Tea Garden Road, Sylhet-3100' },
    { id: 4, name: 'Rajshahi Branch', address: '321 University Road, Rajshahi-6000' }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Update branch address when branch is selected
      if (field === 'toBranch') {
        const selectedBranch = branches.find(branch => branch.name === value)
        updated.branchAddress = selectedBranch ? selectedBranch.address : ''
      }
      
      // Calculate totals when transport cost changes
      if (field === 'transportCost') {
        const transportCost = parseFloat(value) || 0
        updated.grandTotal = updated.subTotal + transportCost
      }
      
      return updated
    })
  }

  const handleDateChange = (value) => {
    const formattedDate = formatDateForDisplay(value)
    handleInputChange('entryDate', formattedDate)
  }

  const addToCart = () => {
    if (!formData.searchItem) {
      alert('Please select an item')
      return
    }

    const selectedItem = availableItems.find(item => item.name === formData.searchItem)
    if (!selectedItem) {
      alert('Selected item not found')
      return
    }

    const newItem = {
      id: Date.now(),
      sl: cartItems.length + 1,
      itemName: selectedItem.name,
      qty: 1,
      rate: selectedItem.rate,
      total: selectedItem.rate * 1
    }

    setCartItems(prev => [...prev, newItem])
    setFormData(prev => ({ ...prev, searchItem: '' }))
    setShowItemDropdown(false)
    calculateTotals([...cartItems, newItem])
  }

  const updateCartItem = (id, field, value) => {
    setCartItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === 'qty' || field === 'rate') {
            updatedItem.total = (parseFloat(updatedItem.qty) || 0) * (parseFloat(updatedItem.rate) || 0)
          }
          return updatedItem
        }
        return item
      })
      calculateTotals(updated)
      return updated
    })
  }

  const removeCartItem = (id) => {
    if (window.confirm('Are you sure you want to remove this item?')) {
      setCartItems(prev => {
        const updated = prev.filter(item => item.id !== id)
        // Re-index the serial numbers
        const reIndexed = updated.map((item, index) => ({
          ...item,
          sl: index + 1
        }))
        calculateTotals(reIndexed)
        return reIndexed
      })
    }
  }

  const calculateTotals = (items) => {
    const subTotal = items.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0)
    const transportCost = parseFloat(formData.transportCost) || 0
    const grandTotal = subTotal + transportCost

    setFormData(prev => ({
      ...prev,
      subTotal: subTotal,
      grandTotal: grandTotal
    }))
  }

  const handleSaveTransfer = () => {
    // Validation
    if (!formData.toBranch) {
      alert('Please select a branch to transfer to')
      return
    }

    if (cartItems.length === 0) {
      alert('Please add at least one item to transfer')
      return
    }

    if (!formData.entryDate) {
      alert('Please select entry date')
      return
    }

    // Simulate saving
    const transferData = {
      voucherNo: formData.voucherNo,
      entryDate: formData.entryDate,
      toBranch: formData.toBranch,
      branchAddress: formData.branchAddress,
      items: cartItems,
      narration: formData.narration,
      subTotal: formData.subTotal,
      transportCost: formData.transportCost,
      grandTotal: formData.grandTotal,
      createdAt: new Date().toISOString()
    }

    console.log('Transfer Entry Saved:', transferData)
    alert(`Transfer Entry ${formData.voucherNo} saved successfully!\nItems transferred to ${formData.toBranch}`)
    
    // Auto-generate next voucher number
    const nextVoucherNum = parseInt(formData.voucherNo.replace('T', '')) + 1
    setFormData(prev => ({
      ...prev,
      voucherNo: `T${nextVoucherNum}`
    }))
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setFormData({
        searchItem: '',
        toBranch: '',
        branchAddress: '',
        voucherNo: 'T8',
        entryDate: getTodayFormatted(),
        narration: '',
        subTotal: 0.00,
        transportCost: 0,
        grandTotal: 0.00
      })
      setCartItems([])
      setShowItemDropdown(false)
      setSelectedItemForEdit(null)
    }
  }

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(formData.searchItem.toLowerCase())
  )

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Transfer Entry</h2>
        </div>
        
        <div className="p-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Side - Item Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Item cart / Product cart information</h3>
              
              {/* Search Item */}
              <div className="mb-4 relative">
                <label className="block text-xs text-gray-600 mb-1">Search Item</label>
                <input
                  type="text"
                  placeholder="Search items..."
                  value={formData.searchItem}
                  onChange={(e) => {
                    handleInputChange('searchItem', e.target.value)
                    setShowItemDropdown(true)
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                
                {/* Dropdown for items */}
                {showItemDropdown && filteredItems.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          handleInputChange('searchItem', item.name)
                          setShowItemDropdown(false)
                        }}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      >
                        {item.name} - ₹ {item.rate}/{item.unit}
                      </div>
                    ))}
                  </div>
                )}
                
                {showItemDropdown && filteredItems.length === 0 && formData.searchItem && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1">
                    <div className="px-3 py-2 text-sm text-gray-500">No options</div>
                  </div>
                )}
              </div>

              {/* Total and Add to Cart */}
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">Total</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Press Enter Key to add to Cart"
                    readOnly
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                  />
                  <button
                    onClick={addToCart}
                    className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                  >
                    ADD TO CART
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Branch Information */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">To Branch/ Item Cart & Total Amounts Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* To Branch */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">To Branch</label>
                  <select
                    value={formData.toBranch}
                    onChange={(e) => handleInputChange('toBranch', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="">To Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.name}>{branch.name}</option>
                    ))}
                  </select>
                </div>

                {/* Branch Address */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Branch Address</label>
                  <input
                    type="text"
                    value={formData.branchAddress}
                    onChange={(e) => handleInputChange('branchAddress', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Branch Address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Voucher No */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Voucher No</label>
                  <input
                    type="text"
                    value={formData.voucherNo}
                    onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>

                {/* Entry Date */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Entry Date</label>
                  <input
                    type="date"
                    value={formatDateForInput(formData.entryDate)}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">SL</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Item Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">QTY</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold text-gray-700">Rate (Per)</th>
                    <th className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold text-gray-700">Total</th>
                    <th className="border border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-xs text-center">{item.sl}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">{item.itemName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateCartItem(item.id, 'qty', e.target.value)}
                            className="w-16 text-xs text-center border rounded px-1 py-1"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateCartItem(item.id, 'rate', e.target.value)}
                            className="w-20 text-xs text-right border rounded px-1 py-1"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-xs text-right">
                          {item.total.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <button
                            onClick={() => removeCartItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Remove Item"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="border border-gray-300 px-3 py-8 text-center text-gray-500 text-sm">
                        No items added to transfer cart
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Side - Narration */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Narration</label>
              <textarea
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
                placeholder="Narration..."
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
              />
            </div>

            {/* Right Side - Totals and Buttons */}
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Sub Total */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sub Total (Rs)</label>
                  <input
                    type="number"
                    value={formData.subTotal.toFixed(2)}
                    readOnly
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-right"
                  />
                </div>

                {/* Transport Cost */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Transport Cost (Rs)</label>
                  <input
                    type="number"
                    value={formData.transportCost}
                    onChange={(e) => handleInputChange('transportCost', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-teal-500"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Grand Total */}
              <div className="mb-6">
                <label className="block text-xs text-gray-600 mb-1">Grand Total (Rs)</label>
                <input
                  type="number"
                  value={formData.grandTotal.toFixed(2)}
                  readOnly
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 text-right font-semibold"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveTransfer}
                  className="flex-1 bg-teal-600 text-white px-6 py-3 rounded text-sm font-medium hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                >
                  💾 SAVE TRANSFER
                </button>
                <button
                  onClick={handleReset}
                  className="bg-teal-600 text-white px-6 py-3 rounded text-sm font-medium hover:bg-teal-700 transition-colors"
                >
                  RESET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}