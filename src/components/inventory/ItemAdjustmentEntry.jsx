'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function ItemAdjustmentEntry() {
  const API_BASE = `${config.API_URL}/items/adjustment`
  const ITEMS_API = `${config.API_URL}/items`

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
    adjustType: 'Damage Stock',
    voucherNo: 'A001',
    entryDate: getTodayFormatted(),
    narration: '',
    subTotal: 0.00
  })

  const [cartItems, setCartItems] = useState([])
  const [availableItems, setAvailableItems] = useState([])
  const [showItemDropdown, setShowItemDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const adjustmentTypes = [
    'Damage Stock',
    'Lost Stock',
    'Expired Stock',
    'Stock Increase',
    'Stock Decrease',
    'Correction Entry',
    'Theft',
    'Fire Damage',
    'Promotional Giveaway',
    'Return to Supplier',
    'Quality Issue'
  ]

  // Fetch items and next voucher number on component mount
  useEffect(() => {
    fetchItems()
    fetchNextVoucherNo()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${ITEMS_API}?limit=1000`)
      const result = await response.json()
      
      if (result.success || result.data) {
        const items = (result.data || []).map(item => ({
          id: item._id,
          name: item.name,
          rate: item.rate || item.purchasePrice || 0,
          unit: item.unit || 'pcs',
          code: item.code,
          stock: item.stock || 0
        }))
        setAvailableItems(items)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      alert('Error loading items. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const fetchNextVoucherNo = async () => {
    try {
      const response = await fetch(`${API_BASE}/next-voucher`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          voucherNo: result.data.voucherNo
        }))
      }
    } catch (error) {
      console.error('Error fetching next voucher number:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

    // Check if item already in cart
    const existingItem = cartItems.find(item => item.itemId === selectedItem.id)
    if (existingItem) {
      alert('Item already in cart. Please update the quantity instead.')
      return
    }

    const newItem = {
      id: Date.now(),
      itemId: selectedItem.id,
      sl: cartItems.length + 1,
      itemName: selectedItem.name,
      adjustType: formData.adjustType,
      qty: 1,
      rate: selectedItem.rate,
      total: selectedItem.rate * 1,
      unit: selectedItem.unit,
      currentStock: selectedItem.stock
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
    setFormData(prev => ({
      ...prev,
      subTotal: subTotal
    }))
  }

  const handleSaveAdjustment = async () => {
    // Validation
    if (!formData.adjustType) {
      alert('Please select an adjustment type')
      return
    }

    if (cartItems.length === 0) {
      alert('Please add at least one item to adjust')
      return
    }

    if (!formData.entryDate) {
      alert('Please select entry date')
      return
    }

    // Convert date format for API
    const [day, month, year] = formData.entryDate.split('/')
    const isoDate = `${year}-${month}-${day}`

    // Prepare data for API
    const adjustmentData = {
      voucherNo: formData.voucherNo,
      entryDate: isoDate,
      adjustmentType: formData.adjustType,
      items: cartItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        adjustType: item.adjustType,
        quantity: parseFloat(item.qty),
        rate: parseFloat(item.rate),
        total: parseFloat(item.total)
      })),
      narration: formData.narration,
      subTotal: formData.subTotal
    }

    try {
      setSaving(true)
      console.log('Saving adjustment:', adjustmentData)
      
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adjustmentData)
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        alert(`✅ Item Adjustment Entry ${formData.voucherNo} saved successfully!\n\nStock has been updated accordingly.`)
        
        // Fetch next voucher number
        await fetchNextVoucherNo()
        
        // Reset form
        setCartItems([])
        setFormData(prev => ({
          ...prev,
          searchItem: '',
          adjustType: 'Damage Stock',
          entryDate: getTodayFormatted(),
          narration: '',
          subTotal: 0.00
        }))
        
        // Refresh items list
        await fetchItems()
      } else {
        throw new Error(result.error || 'Failed to save adjustment')
      }
    } catch (error) {
      console.error('Error saving adjustment:', error)
      alert(`❌ Error: ${error.message}\n\nPlease check your internet connection and try again.`)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setFormData({
        searchItem: '',
        adjustType: 'Damage Stock',
        voucherNo: formData.voucherNo, // Keep current voucher number
        entryDate: getTodayFormatted(),
        narration: '',
        subTotal: 0.00
      })
      setCartItems([])
      setShowItemDropdown(false)
    }
  }

  const filteredItems = availableItems.filter(item =>
    item.name.toLowerCase().includes(formData.searchItem.toLowerCase()) ||
    (item.code && item.code.toLowerCase().includes(formData.searchItem.toLowerCase()))
  )

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg flex items-center gap-2">
            📝 Item Adjustment Entry
          </h2>
          <p className="text-xs text-teal-50 mt-1">Record inventory adjustments for damage, loss, or corrections</p>
        </div>
        
        <div className="p-6">
          {/* Header Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Side - Item Selection */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                🛒 Item Cart / Product Cart Information
              </h3>
              
              {/* Search Item */}
              <div className="mb-4 relative">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Search Item {loading && <span className="text-teal-600">(Loading...)</span>}
                </label>
                <input
                  type="text"
                  placeholder="Type to search items..."
                  value={formData.searchItem}
                  onChange={(e) => {
                    handleInputChange('searchItem', e.target.value)
                    setShowItemDropdown(true)
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  disabled={loading}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100"
                />
                
                {/* Dropdown for items */}
                {showItemDropdown && filteredItems.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border-2 border-teal-500 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {filteredItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => {
                          handleInputChange('searchItem', item.name)
                          setShowItemDropdown(false)
                        }}
                        className="px-3 py-2 hover:bg-teal-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-600">
                          {item.code && `Code: ${item.code} | `}
                          Rate: ₹{item.rate}/{item.unit} | 
                          <span className={item.stock <= 0 ? 'text-red-600 font-semibold' : 'text-green-600'}>
                            {' '}Stock: {item.stock} {item.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {showItemDropdown && filteredItems.length === 0 && formData.searchItem && (
                  <div className="absolute z-10 w-full bg-white border-2 border-gray-300 rounded-lg mt-1 shadow-lg">
                    <div className="px-3 py-3 text-sm text-gray-500 text-center">
                      No items found matching "{formData.searchItem}"
                    </div>
                  </div>
                )}
              </div>

              {/* Adjust Type */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Adjustment Type *
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-white">
                  {adjustmentTypes.map((type, index) => (
                    <label key={index} className="flex items-center hover:bg-gray-50 p-2 rounded cursor-pointer">
                      <input
                        type="radio"
                        name="adjustType"
                        value={type}
                        checked={formData.adjustType === type}
                        onChange={(e) => handleInputChange('adjustType', e.target.value)}
                        className="mr-3 text-teal-600 focus:ring-teal-500 w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mb-4">
                <button
                  onClick={addToCart}
                  disabled={loading || !formData.searchItem}
                  className="w-full bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span className="text-lg">➕</span>
                  ADD TO CART
                </button>
              </div>
            </div>

            {/* Right Side - Adjustment Information */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                📋 Adjustment Information
              </h3>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                {/* Voucher No and Entry Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Voucher No
                    </label>
                    <input
                      type="text"
                      value={formData.voucherNo}
                      onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Entry Date *
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.entryDate)}
                      onChange={(e) => handleDateChange(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Adjustment Type Display */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Selected Adjustment Type
                </label>
                <div className="bg-white border-2 border-teal-200 rounded-lg px-4 py-3">
                  <span className="text-sm font-semibold text-teal-700">
                    {formData.adjustType}
                  </span>
                </div>
              </div>

              {/* Sub Total Display */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Sub Total (Rs)
                </label>
                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-300 rounded-lg px-4 py-3">
                  <span className="text-2xl font-bold text-teal-700">
                    ₹ {formData.subTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Cart Items Count */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">Items in Cart:</span>
                  <span className="text-lg font-bold text-blue-700">{cartItems.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📦 Adjustment Cart Items</h3>
            <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                    <th className="border border-teal-500 px-3 py-2 text-left text-xs font-semibold">SL</th>
                    <th className="border border-teal-500 px-3 py-2 text-left text-xs font-semibold">Item Name</th>
                    <th className="border border-teal-500 px-3 py-2 text-left text-xs font-semibold">Adjust Type</th>
                    <th className="border border-teal-500 px-3 py-2 text-center text-xs font-semibold">Current Stock</th>
                    <th className="border border-teal-500 px-3 py-2 text-center text-xs font-semibold">QTY</th>
                    <th className="border border-teal-500 px-3 py-2 text-right text-xs font-semibold">Rate (Per)</th>
                    <th className="border border-teal-500 px-3 py-2 text-right text-xs font-semibold">Total</th>
                    <th className="border border-teal-500 px-3 py-2 text-center text-xs font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <tr key={item.id} className="hover:bg-teal-50 transition-colors">
                        <td className="border border-gray-300 px-3 py-2 text-xs text-center font-medium">{item.sl}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs font-medium">{item.itemName}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">
                          <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-semibold">
                            {item.adjustType}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                          <span className={`font-semibold ${item.currentStock <= 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {item.currentStock} {item.unit}
                          </span>
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateCartItem(item.id, 'qty', e.target.value)}
                            className="w-20 text-xs text-center border-2 border-gray-300 rounded-lg px-2 py-1 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                            min="0.01"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateCartItem(item.id, 'rate', e.target.value)}
                            className="w-24 text-xs text-right border-2 border-gray-300 rounded-lg px-2 py-1 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-xs text-right font-bold text-teal-700">
                          ₹ {item.total.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          <button
                            onClick={() => removeCartItem(item.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            title="Remove Item"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="border border-gray-300 px-3 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-6xl">📦</div>
                          <p className="text-lg font-medium">No items added to adjustment cart</p>
                          <p className="text-sm">Search and select items from the left panel to add them</p>
                        </div>
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
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Narration / Notes
              </label>
              <textarea
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
                placeholder="Enter notes or reason for adjustment..."
                rows={5}
                className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Right Side - Action Buttons */}
            <div className="flex flex-col justify-end">
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleSaveAdjustment}
                  disabled={saving || cartItems.length === 0}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-lg text-sm font-bold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      SAVING...
                    </>
                  ) : (
                    <>
                      🔒 SAVE ADJUSTMENT
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-lg text-sm font-bold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  🔄 RESET
                </button>
              </div>
              
              {/* Help Text */}
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Saving this adjustment will automatically update your inventory stock levels based on the adjustment type selected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
