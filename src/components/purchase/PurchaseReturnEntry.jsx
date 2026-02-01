'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function PurchaseReturnEntry() {
  // API Configuration
  const API_BASE_URL = config.API_URL
  const INTEGRATION_API_URL = config.API_URL

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
    const prefix = 'PURR'
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}${timestamp}`
  }

  const [formData, setFormData] = useState({
    searchItem: '',
    searchSupplier: '',
    supplierName: 'General Supplier',
    supplierId: '',
    shopCompanyName: '',
    institutionName: '',
    contactNo: '',
    supplierAddress: '',
    voucherNo: generateVoucherNo(),
    entryDate: getTodayFormatted(),
    discount: '0',
    discountPercent: '0',
    GST: '0',
    GSTPercent: '0',
    total: '',
    narration: '',
    discountGSTMethod: 'individual',
    subTotal: '0.00',
    grandTotal: '0.00',
    purchaseReturnAccount: 'Purchase Return',
    returnReason: 'Other'
  })

  const [purchaseReturnItems, setPurchaseReturnItems] = useState([])
  const [purchaseReturnEntries, setPurchaseReturnEntries] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [items, setItems] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingReturnId, setEditingReturnId] = useState(null)
  const [showReturnDetails, setShowReturnDetails] = useState(false)
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null)

  // API Functions
  const fetchItems = async (search = '') => {
    try {
      const response = await fetch(`${INTEGRATION_API_URL}/items?search=${search}&limit=100`)
      const data = await response.json()
      if (data.data) {
        const formattedItems = data.data.map(item => ({
          id: item._id,
          name: item.name,
          code: item.code,
          rate: item.rate,
          purchasePrice: item.purchasePrice || item.rate,
          taxPercent: item.taxPercent || 0,
          unit: item.unit,
          stock: item.stock,
          category: item.category,
          brand: item.brand
        }))
        setItems(formattedItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      alert('Error fetching items. Please try again.')
    }
  }

  const fetchSuppliers = async (search = '') => {
    try {
      const response = await fetch(`${INTEGRATION_API_URL}/suppliers?search=${search}&limit=100`)
      const data = await response.json()
      if (data.data) {
        const formattedSuppliers = data.data.map(supplier => ({
          id: supplier._id,
          supplierName: supplier.supplierName,
          shopCompanyName: supplier.shopCompanyName || '',
          address: supplier.address || '',
          contactNo: supplier.contactNo || '',
          emailAddress: supplier.emailAddress || '',
          gstNumber: supplier.gstNumber || '',
          locationArea: supplier.locationArea || '',
          openingDue: supplier.openingDue || 0,
          isActive: supplier.isActive
        }))
        setSuppliers(formattedSuppliers)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      alert('Error fetching suppliers. Please try again.')
    }
  }

  const fetchPurchaseReturns = async (page = 1, limit = rowsPerPage, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/purchase-return-entries?page=${page}&limit=${limit}&search=${search}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedEntries = data.data.map(purchaseReturn => ({
          id: purchaseReturn._id,
          voucherNo: purchaseReturn.voucherNo,
          supplier: purchaseReturn.supplierName,
          entryDate: formatDateForDisplay(purchaseReturn.entryDate.split('T')[0]),
          items: purchaseReturn.items.length,
          totalAmount: `₹ ${purchaseReturn.grandTotal.toFixed(2)}`,
          status: purchaseReturn.status,
          returnReason: purchaseReturn.returnReason,
          createdAt: new Date(purchaseReturn.createdAt).getTime(),
          rawData: purchaseReturn
        }))
        setPurchaseReturnEntries(formattedEntries)
        setFilteredEntries(formattedEntries)
      }
    } catch (error) {
      console.error('Error fetching purchase returns:', error)
      alert('Error fetching purchase returns. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchReturnDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-return-entries/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to fetch return details')
      }
    } catch (error) {
      console.error('Error fetching return details:', error)
      alert('Error fetching return details. Please try again.')
      return null
    }
  }

  const savePurchaseReturn = async (returnData) => {
    try {
      setSaving(true)
      const url = isEditMode 
        ? `${API_BASE_URL}/purchase-return-entries/${editingReturnId}` 
        : `${API_BASE_URL}/purchase-return-entries`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const action = isEditMode ? 'updated' : 'saved'
        alert(`Purchase Return ${data.data.voucherNo} ${action} successfully!`)
        await fetchPurchaseReturns()
        return true
      } else {
        alert(data.message || `Error ${isEditMode ? 'updating' : 'saving'} purchase return`)
        return false
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} purchase return:`, error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} purchase return. Please try again.`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const deletePurchaseReturn = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-return-entries/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Purchase return deleted successfully!')
        await fetchPurchaseReturns()
      } else {
        alert(data.message || 'Error deleting purchase return')
      }
    } catch (error) {
      console.error('Error deleting purchase return:', error)
      alert('Error deleting purchase return. Please try again.')
    }
  }

  const updateReturnStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-return-entries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Purchase return status updated to ${status} successfully!`)
        await fetchPurchaseReturns()
      } else {
        alert(data.message || 'Error updating purchase return status')
      }
    } catch (error) {
      console.error('Error updating purchase return status:', error)
      alert('Error updating purchase return status. Please try again.')
    }
  }

  // Load initial data
  useEffect(() => {
    fetchItems()
    fetchSuppliers()
    fetchPurchaseReturns()
  }, [])

  // Calculate totals whenever items change
  useEffect(() => {
    calculateTotals()
  }, [purchaseReturnItems, formData.discount, formData.GST])

  // Update filtered entries when purchase return entries change
  useEffect(() => {
    handleSearch()
  }, [purchaseReturnEntries])

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

  const handleSupplierSelect = (supplierId) => {
    const selectedSupplier = suppliers.find(supplier => supplier.id === supplierId)
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        searchSupplier: supplierId,
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.supplierName,
        shopCompanyName: selectedSupplier.shopCompanyName,
        institutionName: selectedSupplier.shopCompanyName,
        contactNo: selectedSupplier.contactNo,
        supplierAddress: selectedSupplier.address
      }))
    }
  }

  const handleItemSelect = (itemName) => {
    const selectedItem = items.find(item => item.name === itemName)
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        searchItem: itemName,
        total: selectedItem.purchasePrice.toString()
      }))
    }
  }

  const handleAddToCart = () => {
    if (!formData.total || !formData.searchItem) {
      alert('Please select an item and enter total amount')
      return
    }

    const selectedItem = items.find(item => item.name === formData.searchItem)
    if (!selectedItem) {
      alert('Please select a valid item')
      return
    }

    // Check if item already exists in cart
    const existingItemIndex = purchaseReturnItems.findIndex(item => item.itemName === selectedItem.name)
    if (existingItemIndex !== -1) {
      const updatedItems = [...purchaseReturnItems]
      updatedItems[existingItemIndex].qty += 1
      updatedItems[existingItemIndex].total += parseFloat(formData.total) || 0
      setPurchaseReturnItems(updatedItems)
    } else {
      const newItem = {
        id: Date.now(),
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        qty: 1,
        rate: selectedItem.purchasePrice,
        discount: parseFloat(formData.discount) || 0,
        GST: parseFloat(formData.GST) || selectedItem.taxPercent || 0,
        total: parseFloat(formData.total) || 0
      }
      setPurchaseReturnItems(prev => [...prev, newItem])
    }

    // Reset item fields
    setFormData(prev => ({
      ...prev,
      searchItem: '',
      total: '',
      discount: '0',
      GST: '0'
    }))
  }

  const handleRemoveFromCart = (id) => {
    setPurchaseReturnItems(prev => prev.filter(item => item.id !== id))
  }

  const handleQuantityChange = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id)
      return
    }

    setPurchaseReturnItems(prev => prev.map(item => {
      if (item.id === id) {
        const newTotal = item.rate * newQty
        return { ...item, qty: newQty, total: newTotal }
      }
      return item
    }))
  }

  const calculateTotals = () => {
    const cartSubTotal = purchaseReturnItems.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0)
    }, 0)

    const discount = parseFloat(formData.discount) || 0
    const GST = parseFloat(formData.GST) || 0

    const subTotal = cartSubTotal
    const grandTotal = subTotal - discount + GST

    setFormData(prev => ({
      ...prev,
      subTotal: subTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }))
  }

  const handleSave = async () => {
    if (purchaseReturnItems.length === 0) {
      alert('Please add at least one item to the purchase return')
      return
    }

    if (!formData.supplierName || !formData.supplierId) {
      alert('Please select a supplier')
      return
    }

    // Prepare purchase return data for backend
    const returnData = {
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      shopCompanyName: formData.shopCompanyName,
      institutionName: formData.institutionName,
      contactNo: formData.contactNo,
      supplierAddress: formData.supplierAddress,
      entryDate: new Date(formatDateForInput(formData.entryDate)),
      items: purchaseReturnItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        qty: item.qty,
        rate: item.rate,
        discount: item.discount,
        GST: item.GST,
        total: item.total
      })),
      discount: parseFloat(formData.discount) || 0,
      discountPercent: parseFloat(formData.discountPercent) || 0,
      GST: parseFloat(formData.GST) || 0,
      GSTPercent: parseFloat(formData.GSTPercent) || 0,
      subTotal: parseFloat(formData.subTotal) || 0,
      grandTotal: parseFloat(formData.grandTotal) || 0,
      narration: formData.narration,
      discountGSTMethod: formData.discountGSTMethod,
      purchaseReturnAccount: formData.purchaseReturnAccount,
      returnReason: formData.returnReason,
      status: 'Pending'
    }

    const success = await savePurchaseReturn(returnData)
    
    if (success) {
      handleReset()
      setIsEditMode(false)
      setEditingReturnId(null)
    }
  }

  const handleReset = () => {
    setPurchaseReturnItems([])
    setFormData({
      searchItem: '',
      searchSupplier: '',
      supplierName: 'General Supplier',
      supplierId: '',
      shopCompanyName: '',
      institutionName: '',
      contactNo: '',
      supplierAddress: '',
      voucherNo: generateVoucherNo(),
      entryDate: getTodayFormatted(),
      discount: '0',
      discountPercent: '0',
      GST: '0',
      GSTPercent: '0',
      total: '',
      narration: '',
      discountGSTMethod: 'individual',
      subTotal: '0.00',
      grandTotal: '0.00',
      purchaseReturnAccount: 'Purchase Return',
      returnReason: 'Other'
    })
    setIsEditMode(false)
    setEditingReturnId(null)
  }

  // Edit functionality
  const handleEdit = async (purchaseReturn) => {
    try {
      const returnDetails = await fetchReturnDetails(purchaseReturn.id)
      if (!returnDetails) return

      // Populate form with return data
      setFormData({
        searchItem: '',
        searchSupplier: returnDetails.supplierId,
        supplierName: returnDetails.supplierName,
        supplierId: returnDetails.supplierId,
        shopCompanyName: returnDetails.shopCompanyName || '',
        institutionName: returnDetails.institutionName || '',
        contactNo: returnDetails.contactNo || '',
        supplierAddress: returnDetails.supplierAddress || '',
        voucherNo: returnDetails.voucherNo,
        entryDate: formatDateForDisplay(returnDetails.entryDate.split('T')[0]),
        discount: returnDetails.discount.toString(),
        discountPercent: returnDetails.discountPercent.toString(),
        GST: returnDetails.GST.toString(),
        GSTPercent: returnDetails.GSTPercent.toString(),
        total: '',
        narration: returnDetails.narration || '',
        discountGSTMethod: returnDetails.discountGSTMethod || 'individual',
        subTotal: returnDetails.subTotal.toString(),
        grandTotal: returnDetails.grandTotal.toString(),
        purchaseReturnAccount: returnDetails.purchaseReturnAccount || 'Purchase Return',
        returnReason: returnDetails.returnReason || 'Other'
      })

      // Populate cart with items
      const cartItems = returnDetails.items.map((item, index) => ({
        id: Date.now() + index,
        itemId: item.itemId,
        itemName: item.itemName,
        qty: item.qty,
        rate: item.rate,
        discount: item.discount || 0,
        GST: item.GST || 0,
        total: item.total
      }))
      setPurchaseReturnItems(cartItems)

      // Set edit mode
      setIsEditMode(true)
      setEditingReturnId(purchaseReturn.id)

      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('Error loading purchase return for edit:', error)
      alert('Error loading purchase return for editing. Please try again.')
    }
  }

  // View details functionality
  const handleViewDetails = async (purchaseReturn) => {
    try {
      const returnDetails = await fetchReturnDetails(purchaseReturn.id)
      if (returnDetails) {
        setSelectedReturnDetails(returnDetails)
        setShowReturnDetails(true)
      }
    } catch (error) {
      console.error('Error fetching return details:', error)
      alert('Error fetching return details. Please try again.')
    }
  }

  // Status update functionality
  const handleStatusUpdate = (purchaseReturn, newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      updateReturnStatus(purchaseReturn.id, newStatus)
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(purchaseReturnEntries)
    } else {
      const filtered = purchaseReturnEntries.filter(entry =>
        entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setFilteredEntries(purchaseReturnEntries)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Purchase Return Entry List</title>
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
            <div class="report-title">Purchase Return Entry List</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredEntries.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Supplier</th>
                <th>Entry Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Return Reason</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.supplier}</td>
                  <td>${entry.entryDate}</td>
                  <td>${entry.items}</td>
                  <td>${entry.totalAmount}</td>
                  <td>${entry.status}</td>
                  <td>${entry.returnReason}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Purchase Return Report - Fayullah Factory Management System
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
      ['Fayullah Factory - Purchase Return Entry List'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [],
      ['Voucher No', 'Supplier', 'Entry Date', 'Items', 'Total Amount', 'Status', 'Return Reason'],
      ...filteredEntries.map(entry => [
        entry.voucherNo,
        entry.supplier,
        entry.entryDate,
        entry.items,
        entry.totalAmount,
        entry.status,
        entry.returnReason
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `purchase_return_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase return entry? This action cannot be undone.')) {
      deletePurchaseReturn(id)
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">
            {isEditMode ? 'Edit Purchase Return Entry' : 'Purchase Return Entry'}
            {isEditMode && (
              <span className="ml-2 text-sm bg-yellow-500 px-2 py-1 rounded">
                Editing: {formData.voucherNo}
              </span>
            )}
          </h2>
          <div className="text-right">
            <div className="text-sm font-semibold">Fayullah Factory</div>
            <div className="text-xs opacity-90">Purchase Return Management System</div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Edit Mode Actions */}
          {isEditMode && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800 font-medium">
                  🔄 Edit Mode: You are currently editing purchase return {formData.voucherNo}
                </span>
                <button
                  onClick={handleReset}
                  className="text-yellow-600 hover:text-yellow-800 underline text-sm"
                >
                  Cancel Edit
                </button>
              </div>
            </div>
          )}

          {/* Supplier Information Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Creditor/ Supplier, Item/ Product Cart & Total Amounts Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {/* Search Item */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Search Item</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.searchItem}
                  onChange={(e) => handleItemSelect(e.target.value)}
                >
                  <option value="">Select Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.name}>
                      {item.name} - {item.code} (₹{item.purchasePrice})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Supplier */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Search Supplier</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.searchSupplier}
                  onChange={(e) => handleSupplierSelect(e.target.value)}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName} {supplier.shopCompanyName && `- ${supplier.shopCompanyName}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supplier Name */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Supplier Name</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.supplierName}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                />
              </div>

              {/* Contact No */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Contact No</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.contactNo}
                  onChange={(e) => handleInputChange('contactNo', e.target.value)}
                />
              </div>

              {/* Supplier Address */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Supplier Address</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.supplierAddress}
                  onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
                />
              </div>

              {/* Institution Name */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Institution Name</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange('institutionName', e.target.value)}
                />
              </div>

              {/* Voucher No */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Voucher No</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.voucherNo}
                  onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                  disabled={isEditMode}
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

              {/* Return Reason */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Return Reason</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.returnReason}
                  onChange={(e) => handleInputChange('returnReason', e.target.value)}
                >
                  <option value="Defective">Defective</option>
                  <option value="Wrong Item">Wrong Item</option>
                  <option value="Quality Issue">Quality Issue</option>
                  <option value="Excess Quantity">Excess Quantity</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Discount and GST Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Discount (Rs) */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discount (Rs)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', e.target.value)}
              />
            </div>

            {/* Discount % */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discount %</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.discountPercent}
                onChange={(e) => handleInputChange('discountPercent', e.target.value)}
              />
            </div>

            {/* GST (Rs) */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">GST (Rs)</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.GST}
                onChange={(e) => handleInputChange('GST', e.target.value)}
              />
            </div>

            {/* GST % */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">GST %</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.GSTPercent}
                onChange={(e) => handleInputChange('GSTPercent', e.target.value)}
              />
            </div>
          </div>

          {/* Total and Add to Cart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Total</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.total}
                onChange={(e) => handleInputChange('total', e.target.value)}
                placeholder="Press Enter Key to purchase return Cart"
                onKeyDown={(e) => e.key === 'Enter' && handleAddToCart()}
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter Key to purchase return Cart</p>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={handleAddToCart}
                disabled={!formData.searchItem || !formData.total}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ADD TO CART
              </button>
            </div>
          </div>

          {/* Purchase Return Items Table */}
          {purchaseReturnItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Purchase Return Cart</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">SL Item Name</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">QTY</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Rate (Per)</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Discount(%)</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">GST(%)</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseReturnItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.itemName}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="w-16 border border-gray-200 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">₹{item.rate.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.discount}%</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.GST}%</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium">₹{item.total.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-center">
                          <button 
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                            title="Remove from cart"
                          >
                            🗑️ Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Narration */}
          <div className="mb-6">
            <label className="block text-xs text-gray-600 mb-1">Narration...</label>
            <textarea 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows="3"
              placeholder="Enter purchase return description or notes..."
              value={formData.narration}
              onChange={(e) => handleInputChange('narration', e.target.value)}
            />
          </div>

          {/* Discount and GST Method */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 font-medium">Discount and GST Method</span>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="discountGSTMethod"
                  value="total"
                  checked={formData.discountGSTMethod === 'total'}
                  onChange={(e) => handleInputChange('discountGSTMethod', e.target.value)}
                  className="text-teal-600"
                />
                <span className="text-sm">On Total</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="discountGSTMethod"
                  value="individual"
                  checked={formData.discountGSTMethod === 'individual'}
                  onChange={(e) => handleInputChange('discountGSTMethod', e.target.value)}
                  className="text-teal-600"
                />
                <span className="text-sm">Individual Item</span>
              </label>
            </div>
          </div>

          {/* Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Sub Total */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Sub Total (Rs)</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                value={`₹${formData.subTotal}`}
                readOnly
              />
            </div>

            {/* Choose purchase return Account */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Choose purchase return Account</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.purchaseReturnAccount}
                onChange={(e) => handleInputChange('purchaseReturnAccount', e.target.value)}
              >
                <option value="Purchase Return">Purchase Return</option>
                <option value="Purchase Return - Defective">Purchase Return - Defective</option>
                <option value="Purchase Return - Quality Issue">Purchase Return - Quality Issue</option>
              </select>
            </div>

            {/* Grand Total */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Grand Total (Rs)</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-medium"
                value={`₹${formData.grandTotal}`}
                readOnly
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-6 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              disabled={saving}
            >
              {isEditMode ? 'CANCEL EDIT' : 'RESET'}
            </button>
            <button 
              onClick={handleSave}
              disabled={purchaseReturnItems.length === 0 || !formData.supplierId || saving}
              className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? 'UPDATING...' : 'SAVING...'}
                </>
              ) : (
                <>
                  {isEditMode ? '💾 UPDATE PURCHASE RETURN' : '💾 SAVE PURCHASE RETURN'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Return Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Purchase Return Entry List ({filteredEntries.length} records)
              {loading && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
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
              <button
                onClick={() => fetchPurchaseReturns()}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by supplier name, voucher number, or status..."
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Voucher No</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Supplier</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Entry Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Total Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Return Reason</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs font-medium text-teal-600">{entry.voucherNo}</td>
                      <td className="py-3 px-2 text-xs">{entry.supplier}</td>
                      <td className="py-3 px-2 text-xs">{entry.entryDate}</td>
                      <td className="py-3 px-2 text-xs">{entry.items}</td>
                      <td className="py-3 px-2 text-xs font-medium">{entry.totalAmount}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : entry.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.status}
                          </span>
                          {entry.status === 'Pending' && (
                            <select
                              className="text-xs border rounded px-1 py-1"
                              onChange={(e) => handleStatusUpdate(entry, e.target.value)}
                              defaultValue=""
                            >
                              <option value="">Change Status</option>
                              <option value="Completed">Mark as Completed</option>
                              <option value="Cancelled">Cancel</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs">{entry.returnReason}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-xs p-1"
                            title="View Details"
                            onClick={() => handleViewDetails(entry)}
                          >
                            👁️
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-800 text-xs p-1"
                            title="Edit"
                            onClick={() => handleEdit(entry)}
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
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                          Loading purchase returns...
                        </div>
                      ) : searchTerm ? (
                        'No matching records found'
                      ) : (
                        'No purchase return entries found'
                      )}
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
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹ Prev
                </button>
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Return Details Modal */}
      {showReturnDetails && selectedReturnDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Purchase Return Details - {selectedReturnDetails.voucherNo}
              </h3>
              <button
                onClick={() => setShowReturnDetails(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Supplier Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Supplier Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedReturnDetails.supplierName}</p>
                    <p><strong>Company:</strong> {selectedReturnDetails.shopCompanyName || 'N/A'}</p>
                    <p><strong>Contact:</strong> {selectedReturnDetails.contactNo || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedReturnDetails.supplierAddress || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Return Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Date:</strong> {formatDateForDisplay(selectedReturnDetails.entryDate.split('T')[0])}</p>
                    <p><strong>Account:</strong> {selectedReturnDetails.purchaseReturnAccount}</p>
                    <p><strong>Return Reason:</strong> {selectedReturnDetails.returnReason}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedReturnDetails.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : selectedReturnDetails.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedReturnDetails.status}
                      </span>
                    </p>
                    <p><strong>Method:</strong> {selectedReturnDetails.discountGSTMethod}</p>
                    {selectedReturnDetails.narration && (
                      <p><strong>Notes:</strong> {selectedReturnDetails.narration}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Items</h4>
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Item Name</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Rate</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Discount</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">GST</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedReturnDetails.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2 text-xs">{item.itemName}</td>
                          <td className="px-3 py-2 text-xs">{item.qty}</td>
                          <td className="px-3 py-2 text-xs">₹{item.rate.toFixed(2)}</td>
                          <td className="px-3 py-2 text-xs">{item.discount}%</td>
                          <td className="px-3 py-2 text-xs">{item.GST}%</td>
                          <td className="px-3 py-2 text-xs font-medium">₹{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div></div>
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span>₹{selectedReturnDetails.subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>₹{selectedReturnDetails.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST:</span>
                      <span>₹{selectedReturnDetails.GST.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Grand Total:</span>
                      <span>₹{selectedReturnDetails.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowReturnDetails(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowReturnDetails(false)
                    handleEdit({ id: selectedReturnDetails._id })
                  }}
                  className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
                >
                  Edit Purchase Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
