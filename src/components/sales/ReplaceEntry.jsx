'use client'

import { useState } from 'react'
import { Plus, Save, RotateCcw, ChevronDown, Calendar } from 'lucide-react'

export default function ProductReplaceEntry() {
  // Get today's date in DD/MM/YYYY format
  const getTodayFormatted = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  const [formData, setFormData] = useState({
    searchCustomer: '',
    customerName: '',
    institutionName: '',
    contactNo: '',
    customerAddress: '',
    currentDue: '0',
    voucherNo: '',
    entryDate: getTodayFormatted(),
    narration: '',
    othersCharge: '0',
    total: '0',
    searchReturnItem: '',
    returnQty: '',
    returnRate: '',
    returnTotal: '0',
    searchGivenItem: '',
    givenQty: '',
    givenRate: '',
    givenTotal: '0'
  })

  const [returnCartItems, setReturnCartItems] = useState([])
  const [givenCartItems, setGivenCartItems] = useState([])

  // Sample data
  const customers = [
    { id: 1, name: 'General Customer', address: '123 Main St', contact: '01234567890', institution: 'ABC Company', due: '500' },
    { id: 2, name: 'Customer B', address: '456 Oak Ave', contact: '01987654321', institution: 'XYZ Corp', due: '1200' },
    { id: 3, name: 'Customer C', address: '789 Pine Rd', contact: '01122334455', institution: 'DEF Ltd', due: '800' }
  ]

  const items = [
    { id: 1, name: 'Product A', rate: 100, qty: 10 },
    { id: 2, name: 'Product B', rate: 200, qty: 5 },
    { id: 3, name: 'Product C', rate: 150, qty: 8 }
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCustomerSelect = (customer) => {
    setFormData(prev => ({
      ...prev,
      searchCustomer: customer.name,
      customerName: customer.name,
      customerAddress: customer.address,
      contactNo: customer.contact,
      institutionName: customer.institution,
      currentDue: customer.due
    }))
  }

  const addToReturnCart = () => {
    if (!formData.searchReturnItem) {
      alert('Please select a return item')
      return
    }

    const newItem = {
      id: Date.now(),
      name: formData.searchReturnItem,
      qty: parseFloat(formData.returnQty) || 1,
      rate: parseFloat(formData.returnRate) || 100,
      total: (parseFloat(formData.returnQty) || 1) * (parseFloat(formData.returnRate) || 100)
    }

    setReturnCartItems(prev => [...prev, newItem])
    setFormData(prev => ({ 
      ...prev, 
      searchReturnItem: '', 
      returnQty: '', 
      returnRate: '', 
      returnTotal: '0' 
    }))
  }

  const addToGivenCart = () => {
    if (!formData.searchGivenItem) {
      alert('Please select a given item')
      return
    }

    const newItem = {
      id: Date.now(),
      name: formData.searchGivenItem,
      qty: parseFloat(formData.givenQty) || 1,
      rate: parseFloat(formData.givenRate) || 100,
      total: (parseFloat(formData.givenQty) || 1) * (parseFloat(formData.givenRate) || 100)
    }

    setGivenCartItems(prev => [...prev, newItem])
    setFormData(prev => ({ 
      ...prev, 
      searchGivenItem: '', 
      givenQty: '', 
      givenRate: '', 
      givenTotal: '0' 
    }))
  }

  const removeFromReturnCart = (id) => {
    setReturnCartItems(prev => prev.filter(item => item.id !== id))
  }

  const removeFromGivenCart = (id) => {
    setGivenCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateReturnCartItem = (id, field, value) => {
    setReturnCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: parseFloat(value) || 0 }
        updatedItem.total = updatedItem.qty * updatedItem.rate
        return updatedItem
      }
      return item
    }))
  }

  const updateGivenCartItem = (id, field, value) => {
    setGivenCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: parseFloat(value) || 0 }
        updatedItem.total = updatedItem.qty * updatedItem.rate
        return updatedItem
      }
      return item
    }))
  }

  const handleSave = () => {
    if (returnCartItems.length === 0 && givenCartItems.length === 0) {
      alert('Please add items to either return or given cart')
      return
    }

    if (!formData.searchCustomer) {
      alert('Please select a customer')
      return
    }

    console.log('Saving product replace entry:', {
      customer: formData.searchCustomer,
      returnItems: returnCartItems,
      givenItems: givenCartItems,
      formData
    })
    
    alert('Product replace entry saved successfully!')
  }

  const handleReset = () => {
    setFormData({
      searchCustomer: '',
      customerName: '',
      institutionName: '',
      contactNo: '',
      customerAddress: '',
      currentDue: '0',
      voucherNo: '',
      entryDate: getTodayFormatted(),
      narration: '',
      othersCharge: '0',
      total: '0',
      searchReturnItem: '',
      returnQty: '',
      returnRate: '',
      returnTotal: '0',
      searchGivenItem: '',
      givenQty: '',
      givenRate: '',
      givenTotal: '0'
    })
    setReturnCartItems([])
    setGivenCartItems([])
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-semibold">Product Replace Entry</h2>
        </div>

        <div className="p-6">
          {/* Customer Information Section */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
              <div className="relative">
                <select
                  className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                  value={formData.searchCustomer}
                  onChange={(e) => {
                    const selectedCustomer = customers.find(c => c.name === e.target.value)
                    if (selectedCustomer) {
                      handleCustomerSelect(selectedCustomer)
                    } else {
                      handleInputChange('searchCustomer', e.target.value)
                    }
                  }}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.name}>{customer.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.institutionName}
                onChange={(e) => handleInputChange('institutionName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Due</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.currentDue}
                onChange={(e) => handleInputChange('currentDue', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact No</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.contactNo}
                onChange={(e) => handleInputChange('contactNo', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Address</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={formData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
              />
            </div>
          </div>

          {/* Main Content - Two Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Return Items Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Return Items Information</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Return Item</label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                    value={formData.searchReturnItem}
                    onChange={(e) => handleInputChange('searchReturnItem', e.target.value)}
                  >
                    <option value="">Select Return Item</option>
                    {items.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">QTY</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.returnQty}
                    onChange={(e) => handleInputChange('returnQty', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Rate</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.returnRate}
                    onChange={(e) => handleInputChange('returnRate', e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">Total</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                  value={(parseFloat(formData.returnQty) || 0) * (parseFloat(formData.returnRate) || 0)}
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Press Enter Key to Cart</p>
              </div>

              <button
                onClick={addToReturnCart}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                ADD TO CART
              </button>
            </div>

            {/* Given Item Cart Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Given Item cart Information</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Given Item</label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                    value={formData.searchGivenItem}
                    onChange={(e) => handleInputChange('searchGivenItem', e.target.value)}
                  >
                    <option value="">Select Given Item</option>
                    {items.map(item => (
                      <option key={item.id} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
                <div className="mt-2 text-xs text-gray-500">No options</div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">Total</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                  value="0"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Press Enter Key to Cart</p>
              </div>

              <button
                onClick={addToGivenCart}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                ADD TO CART
              </button>

              {/* Right side info */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Voucher No</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.voucherNo}
                    onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                    placeholder="RP4"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Entry Date</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.entryDate}
                      onChange={(e) => handleInputChange('entryDate', e.target.value)}
                    />
                    <Calendar className="absolute right-3 top-3 h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs text-gray-600 mb-1">Narration...</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 h-16"
                  value={formData.narration}
                  onChange={(e) => handleInputChange('narration', e.target.value)}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Others Charge</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.othersCharge}
                    onChange={(e) => handleInputChange('othersCharge', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Total</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                    value={formData.total}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Return Cart Items Table */}
          {returnCartItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Return Items</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                  <div>SL Item</div>
                  <div>QTY</div>
                  <div>Rate (Per)</div>
                  <div>Total</div>
                  <div>Actions</div>
                </div>

                {returnCartItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-5 gap-2 text-xs py-2 border-b">
                    <div className="font-medium">{item.name}</div>
                    <div>
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 text-xs"
                        value={item.qty}
                        onChange={(e) => updateReturnCartItem(item.id, 'qty', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 text-xs"
                        value={item.rate}
                        onChange={(e) => updateReturnCartItem(item.id, 'rate', e.target.value)}
                      />
                    </div>
                    <div className="font-medium text-green-600">
                      {item.total.toFixed(2)}
                    </div>
                    <div>
                      <button
                        onClick={() => removeFromReturnCart(item.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Given Cart Items Table */}
          {givenCartItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Given Items</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                  <div>SL Item</div>
                  <div>QTY</div>
                  <div>Rate (Per)</div>
                  <div>Total</div>
                  <div>Actions</div>
                </div>

                {givenCartItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-5 gap-2 text-xs py-2 border-b">
                    <div className="font-medium">{item.name}</div>
                    <div>
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 text-xs"
                        value={item.qty}
                        onChange={(e) => updateGivenCartItem(item.id, 'qty', e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        className="w-full border rounded px-2 py-1 text-xs"
                        value={item.rate}
                        onChange={(e) => updateGivenCartItem(item.id, 'rate', e.target.value)}
                      />
                    </div>
                    <div className="font-medium text-green-600">
                      {item.total.toFixed(2)}
                    </div>
                    <div>
                      <button
                        onClick={() => removeFromGivenCart(item.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Remove"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSave}
              className="bg-teal-600 text-white px-8 py-2 rounded hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <Save size={16} />
              SAVE
            </button>
            <button
              onClick={handleReset}
              className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              RESET
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}