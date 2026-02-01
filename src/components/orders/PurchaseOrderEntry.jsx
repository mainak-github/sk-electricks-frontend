'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function PurchaseOrderEntry() {
  // ✅ NEW: Company Information
  const companyInfo = {
    name: "S.K. ELECTRICALS",
    address: "Faridpur, DURGAPUR, Bardhaman, West Bengal, 713213",
    gstin: "19BRUPM7238Q2ZG",
    state: "West Bengal",
    phone: "+91 8448449093",
    website: "www.skelectrics.com",
    bankName: "BANDHAN BANK",
    accountNo: "10160007406316",
    branchCode: "CITY CENTER",
    jurisdiction: "Durgapur"
  }

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

  // Generate order number
  const generateOrderNo = () => {
    const prefix = 'PO'
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
    orderNo: generateOrderNo(),
    entryDate: getTodayFormatted(),
    expectedDeliveryDate: '',
    itemDescription: '',
    discountRs: '0',
    discountPercent: '0',
    GSTRs: '0',
    GSTPercent: '0',
    total: '',
    narration: '',
    discountGSTMethod: 'Individual Item',
    transportCost: '0',
    subTotal: '0.00',
    grandTotal: '0.00',
    priority: 'Medium',
    paymentTerms: 'Cash'
  })

  const [purchaseCart, setPurchaseCart] = useState([])
  const [purchaseOrderEntries, setPurchaseOrderEntries] = useState([])
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
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)

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
          minStock: item.minStock,
          category: item.category,
          brand: item.brand,
          description: item.description || '',
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

  const fetchPurchaseOrders = async (page = 1, limit = rowsPerPage, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/purchase-order-entries?page=${page}&limit=${limit}&search=${search}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedEntries = data.data.map(order => ({
          id: order._id,
          orderNo: order.orderNo,
          supplier: order.supplierName,
          date: formatDateForDisplay(order.entryDate.split('T')[0]),
          items: order.items.length,
          totalAmount: `₹ ${order.grandTotal.toFixed(2)}`,
          status: order.status,
          priority: order.priority,
          paymentTerms: order.paymentTerms,
          createdAt: new Date(order.createdAt).getTime(),
          rawData: order
        }))
        setPurchaseOrderEntries(formattedEntries)
        setFilteredEntries(formattedEntries)
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error)
      alert('Error fetching purchase orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrderDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-order-entries/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to fetch order details')
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      alert('Error fetching order details. Please try again.')
      return null
    }
  }

  const savePurchaseOrder = async (orderData) => {
    try {
      setSaving(true)
      const url = isEditMode 
        ? `${API_BASE_URL}/purchase-order-entries/${editingOrderId}` 
        : `${API_BASE_URL}/purchase-order-entries`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const action = isEditMode ? 'updated' : 'saved'
        alert(`Purchase Order ${data.data.orderNo} ${action} successfully!`)
        await fetchPurchaseOrders()
        return true
      } else {
        alert(data.message || `Error ${isEditMode ? 'updating' : 'saving'} purchase order`)
        return false
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} purchase order:`, error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} purchase order. Please try again.`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const deletePurchaseOrder = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-order-entries/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Purchase order deleted successfully!')
        await fetchPurchaseOrders()
      } else {
        alert(data.message || 'Error deleting purchase order')
      }
    } catch (error) {
      console.error('Error deleting purchase order:', error)
      alert('Error deleting purchase order. Please try again.')
    }
  }

  const updateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-order-entries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Purchase order status updated to ${status} successfully!`)
        await fetchPurchaseOrders()
      } else {
        alert(data.message || 'Error updating purchase order status')
      }
    } catch (error) {
      console.error('Error updating purchase order status:', error)
      alert('Error updating purchase order status. Please try again.')
    }
  }

  const updateOrderPriority = async (id, priority) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-order-entries/${id}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Purchase order priority updated to ${priority} successfully!`)
        await fetchPurchaseOrders()
      } else {
        alert(data.message || 'Error updating purchase order priority')
      }
    } catch (error) {
      console.error('Error updating purchase order priority:', error)
      alert('Error updating purchase order priority. Please try again.')
    }
  }

  // Load initial data
  useEffect(() => {
    fetchItems()
    fetchSuppliers()
    fetchPurchaseOrders()
  }, [])

  // Calculate totals whenever cart changes
  useEffect(() => {
    calculateTotals()
  }, [purchaseCart, formData.transportCost, formData.discountRs, formData.GSTRs])

  // Update filtered entries when purchase order entries change
  useEffect(() => {
    handleSearch()
  }, [purchaseOrderEntries])

  const handleInputChange = (field, value) => {
    if (field === 'entryDate' && value.includes('-')) {
      const formattedDate = formatDateForDisplay(value)
      setFormData(prev => ({
        ...prev,
        entryDate: formattedDate
      }))
    } else if (field === 'expectedDeliveryDate' && value.includes('-')) {
      const formattedDate = formatDateForDisplay(value)
      setFormData(prev => ({
        ...prev,
        expectedDeliveryDate: formattedDate
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

  // ✅ ENHANCED: Item selection with description
  const handleItemSelect = (itemName) => {
    const selectedItem = items.find(item => item.name === itemName)
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        searchItem: itemName,
        itemDescription: selectedItem.description,
        total: selectedItem.purchasePrice.toString()
      }))
    }
  }

  // ✅ FIXED: Add to cart with proper GST and discount values from DB
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
    const existingItemIndex = purchaseCart.findIndex(item => item.itemName === selectedItem.name)
    if (existingItemIndex !== -1) {
      const updatedCart = [...purchaseCart]
      updatedCart[existingItemIndex].qty += 1
      
      // ✅ FIXED: Recalculate total with proper GST and discount
      const baseAmount = updatedCart[existingItemIndex].rate * updatedCart[existingItemIndex].qty
      const discountAmount = (baseAmount * updatedCart[existingItemIndex].discount) / 100
      const taxableAmount = baseAmount - discountAmount
      const gstAmount = (taxableAmount * updatedCart[existingItemIndex].GST) / 100
      
      updatedCart[existingItemIndex].discountAmount = discountAmount
      updatedCart[existingItemIndex].GSTAmount = gstAmount
      updatedCart[existingItemIndex].total = taxableAmount + gstAmount
      
      setPurchaseCart(updatedCart)
    } else {
      // ✅ FIXED: Use real database values for GST and discount
      const qty = 1
      const rate = selectedItem.purchasePrice
      const discount = 0 // Can be set from form if needed
      const GST = selectedItem.taxPercent || 0 // ✅ FIXED: Use real tax percent from DB
      
      // Calculate amounts properly
      const baseAmount = rate * qty
      const discountAmount = (baseAmount * discount) / 100
      const taxableAmount = baseAmount - discountAmount
      const gstAmount = (taxableAmount * GST) / 100
      const total = taxableAmount + gstAmount

      const newCartItem = {
        id: Date.now(),
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        itemDescription: formData.itemDescription || selectedItem.description,
        qty: qty,
        rate: rate,
        discount: discount,
        discountAmount: discountAmount,
        GST: GST, // ✅ FIXED: Real GST from database
        GSTAmount: gstAmount,
        total: total
      }
      setPurchaseCart(prev => [...prev, newCartItem])
    }
   
    // Clear item, description and total
    setFormData(prev => ({
      ...prev,
      searchItem: '',
      itemDescription: '',
      total: ''
    }))
  }

  const handleRemoveFromCart = (id) => {
    setPurchaseCart(prev => prev.filter(item => item.id !== id))
  }

  // ✅ FIXED: Proper quantity change calculation
  const handleQuantityChange = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id)
      return
    }

    setPurchaseCart(prev => prev.map(item => {
      if (item.id === id) {
        const baseAmount = item.rate * newQty
        const discountAmount = (baseAmount * item.discount) / 100
        const taxableAmount = baseAmount - discountAmount
        const gstAmount = (taxableAmount * item.GST) / 100
        const total = taxableAmount + gstAmount
        
        return { 
          ...item, 
          qty: newQty, 
          discountAmount: discountAmount,
          GSTAmount: gstAmount,
          total: total 
        }
      }
      return item
    }))
  }

  // ✅ ENHANCED: Update discount percentage in cart
  const handleDiscountChange = (id, newDiscount) => {
    setPurchaseCart(prev => prev.map(item => {
      if (item.id === id) {
        const baseAmount = item.rate * item.qty
        const discountAmount = (baseAmount * newDiscount) / 100
        const taxableAmount = baseAmount - discountAmount
        const gstAmount = (taxableAmount * item.GST) / 100
        const total = taxableAmount + gstAmount
        
        return { 
          ...item, 
          discount: newDiscount,
          discountAmount: discountAmount,
          GSTAmount: gstAmount,
          total: total 
        }
      }
      return item
    }))
  }

  // ✅ ENHANCED: Update GST percentage in cart
  const handleGSTChange = (id, newGST) => {
    setPurchaseCart(prev => prev.map(item => {
      if (item.id === id) {
        const baseAmount = item.rate * item.qty
        const discountAmount = (baseAmount * item.discount) / 100
        const taxableAmount = baseAmount - discountAmount
        const gstAmount = (taxableAmount * newGST) / 100
        const total = taxableAmount + gstAmount
        
        return { 
          ...item, 
          GST: newGST,
          discountAmount: discountAmount,
          GSTAmount: gstAmount,
          total: total 
        }
      }
      return item
    }))
  }

  const handleItemDescriptionChange = (id, newDescription) => {
    setPurchaseCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, itemDescription: newDescription }
      }
      return item
    }))
  }

  const calculateTotals = () => {
    const cartSubTotal = purchaseCart.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0)
    }, 0)

    const transportCost = parseFloat(formData.transportCost) || 0
    const discount = parseFloat(formData.discountRs) || 0
    const GST = parseFloat(formData.GSTRs) || 0

    const subTotal = cartSubTotal + transportCost
    const grandTotal = subTotal - discount + GST

    setFormData(prev => ({
      ...prev,
      subTotal: subTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }))
  }

  const handleSave = async () => {
    if (purchaseCart.length === 0) {
      alert('Please add at least one item to the purchase order')
      return
    }

    if (!formData.supplierName || !formData.supplierId) {
      alert('Please select a supplier')
      return
    }

    // Prepare order data for backend
    const orderData = {
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      shopCompanyName: formData.shopCompanyName,
      institutionName: formData.institutionName,
      contactNo: formData.contactNo,
      supplierAddress: formData.supplierAddress,
      entryDate: new Date(formatDateForInput(formData.entryDate)),
      expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formatDateForInput(formData.expectedDeliveryDate)) : null,
      // ✅ ENHANCED: Items with proper calculations
      items: purchaseCart.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemDescription: item.itemDescription,
        qty: item.qty,
        rate: item.rate,
        discount: item.discount,
        discountAmount: item.discountAmount,
        GST: item.GST,
        GSTAmount: item.GSTAmount,
        total: item.total
      })),
      discountRs: parseFloat(formData.discountRs) || 0,
      discountPercent: parseFloat(formData.discountPercent) || 0,
      GSTRs: parseFloat(formData.GSTRs) || 0,
      GSTPercent: parseFloat(formData.GSTPercent) || 0,
      transportCost: parseFloat(formData.transportCost) || 0,
      subTotal: parseFloat(formData.subTotal) || 0,
      grandTotal: parseFloat(formData.grandTotal) || 0,
      narration: formData.narration,
      discountGSTMethod: formData.discountGSTMethod,
      priority: formData.priority,
      paymentTerms: formData.paymentTerms,
      status: 'Draft'
    }

    const success = await savePurchaseOrder(orderData)
    
    if (success) {
      handleReset()
      setIsEditMode(false)
      setEditingOrderId(null)
    }
  }

  const handleReset = () => {
    setPurchaseCart([])
    setFormData({
      searchItem: '',
      searchSupplier: '',
      supplierName: 'General Supplier',
      supplierId: '',
      shopCompanyName: '',
      institutionName: '',
      contactNo: '',
      supplierAddress: '',
      orderNo: generateOrderNo(),
      entryDate: getTodayFormatted(),
      expectedDeliveryDate: '',
      itemDescription: '',
      discountRs: '0',
      discountPercent: '0',
      GSTRs: '0',
      GSTPercent: '0',
      total: '',
      narration: '',
      discountGSTMethod: 'Individual Item',
      transportCost: '0',
      subTotal: '0.00',
      grandTotal: '0.00',
      priority: 'Medium',
      paymentTerms: 'Cash'
    })
    setIsEditMode(false)
    setEditingOrderId(null)
  }

  // Edit functionality
  const handleEdit = async (order) => {
    try {
      const orderDetails = await fetchOrderDetails(order.id)
      if (!orderDetails) return

      // Populate form with order data
      setFormData({
        searchItem: '',
        searchSupplier: orderDetails.supplierId,
        supplierName: orderDetails.supplierName,
        supplierId: orderDetails.supplierId,
        shopCompanyName: orderDetails.shopCompanyName || '',
        institutionName: orderDetails.institutionName || '',
        contactNo: orderDetails.contactNo || '',
        supplierAddress: orderDetails.supplierAddress || '',
        orderNo: orderDetails.orderNo,
        entryDate: formatDateForDisplay(orderDetails.entryDate.split('T')[0]),
        expectedDeliveryDate: orderDetails.expectedDeliveryDate ? formatDateForDisplay(orderDetails.expectedDeliveryDate.split('T')[0]) : '',
        itemDescription: '',
        discountRs: orderDetails.discountRs.toString(),
        discountPercent: orderDetails.discountPercent.toString(),
        GSTRs: orderDetails.GSTRs.toString(),
        GSTPercent: orderDetails.GSTPercent.toString(),
        total: '',
        narration: orderDetails.narration || '',
        discountGSTMethod: orderDetails.discountGSTMethod || 'Individual Item',
        transportCost: orderDetails.transportCost.toString(),
        subTotal: orderDetails.subTotal.toString(),
        grandTotal: orderDetails.grandTotal.toString(),
        priority: orderDetails.priority || 'Medium',
        paymentTerms: orderDetails.paymentTerms || 'Cash'
      })

      // ✅ ENHANCED: Populate cart with items including all calculations
      const cartItems = orderDetails.items.map((item, index) => ({
        id: Date.now() + index,
        itemId: item.itemId,
        itemName: item.itemName,
        itemDescription: item.itemDescription || '',
        qty: item.qty,
        rate: item.rate,
        discount: item.discount || 0,
        discountAmount: item.discountAmount || 0,
        GST: item.GST || 0,
        GSTAmount: item.GSTAmount || 0,
        total: item.total
      }))
      setPurchaseCart(cartItems)

      // Set edit mode
      setIsEditMode(true)
      setEditingOrderId(order.id)

      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('Error loading order for edit:', error)
      alert('Error loading order for editing. Please try again.')
    }
  }

  // View details functionality
  const handleViewDetails = async (order) => {
    try {
      const orderDetails = await fetchOrderDetails(order.id)
      if (orderDetails) {
        setSelectedOrderDetails(orderDetails)
        setShowOrderDetails(true)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      alert('Error fetching order details. Please try again.')
    }
  }

  // Status update functionality
  const handleStatusUpdate = (order, newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      updateOrderStatus(order.id, newStatus)
    }
  }

  // Priority update functionality
  const handlePriorityUpdate = (order, newPriority) => {
    if (window.confirm(`Are you sure you want to change priority to ${newPriority}?`)) {
      updateOrderPriority(order.id, newPriority)
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(purchaseOrderEntries)
    } else {
      const filtered = purchaseOrderEntries.filter(entry =>
        entry.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.priority.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
    setCurrentPage(1)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(purchaseOrderEntries)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // ✅ UPDATED: Print with company info
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Purchase Order Entry List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0f766e; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            .company-details { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
            .report-title { font-size: 20px; color: #374151; margin-bottom: 15px; }
            .report-meta { font-size: 14px; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 30px; }
            th, td { border: 1px solid #d1d5db; padding: 10px; text-align: left; font-size: 12px; }
            th { background-color: #f3f4f6; font-weight: bold; color: #374151; }
            .total-row { background-color: #f9fafb; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyInfo.name}</div>
            <div class="company-details">
              ${companyInfo.address}<br>
              GSTIN: ${companyInfo.gstin} | Phone: ${companyInfo.phone}<br>
              Website: ${companyInfo.website}
            </div>
            <div class="report-title">Purchase Order Entry Report</div>
            <div class="report-meta">
              Generated on: ${new Date().toLocaleString()}<br>
              Total Records: ${filteredEntries.length}<br>
              Total Value: ₹${filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.totalAmount.replace('₹ ', '').replace(',', '')), 0).toFixed(2)}
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Order No</th>
                <th>Supplier</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Payment Terms</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.orderNo}</td>
                  <td>${entry.supplier}</td>
                  <td>${entry.date}</td>
                  <td>${entry.items}</td>
                  <td>${entry.totalAmount}</td>
                  <td>${entry.status}</td>
                  <td>${entry.priority}</td>
                  <td>${entry.paymentTerms}</td>
                </tr>
              `).join('')}
              <tr class="total-row">
                <td colspan="4">Total Orders: ${filteredEntries.length}</td>
                <td>₹${filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.totalAmount.replace('₹ ', '').replace(',', '')), 0).toFixed(2)}</td>
                <td colspan="3">-</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <strong>${companyInfo.name} - Purchase Order Management System</strong><br>
            This report contains confidential business information. Handle with care.
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
      [`${companyInfo.name} - Purchase Order Entry List`],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [`Total Value: ₹${filteredEntries.reduce((sum, entry) => sum + parseFloat(entry.totalAmount.replace('₹ ', '').replace(',', '')), 0).toFixed(2)}`],
      [],
      ['Order No', 'Supplier', 'Date', 'Items', 'Total Amount', 'Status', 'Priority', 'Payment Terms'],
      ...filteredEntries.map(entry => [
        entry.orderNo,
        entry.supplier,
        entry.date,
        entry.items,
        entry.totalAmount,
        entry.status,
        entry.priority,
        entry.paymentTerms
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `purchase_order_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase order? This action cannot be undone.')) {
      deletePurchaseOrder(id)
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
            {isEditMode ? 'Edit Purchase Order' : 'Purchase Order Entry'}
            {isEditMode && (
              <span className="ml-2 text-sm bg-yellow-500 px-2 py-1 rounded">
                Editing: {formData.orderNo}
              </span>
            )}
          </h2>
          <div className="text-right">
            <div className="text-sm font-semibold">{companyInfo.name}</div>
            <div className="text-xs opacity-90">Purchase Management System</div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Edit Mode Actions */}
          {isEditMode && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800 font-medium">
                  🔄 Edit Mode: You are currently editing purchase order {formData.orderNo}
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

          {/* Item Cart / Product Cart Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Item cart / Product cart Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                      {item.stock <= item.minStock && ' - LOW STOCK'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Item Description */}
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Item Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  rows="2"
                  value={formData.itemDescription}
                  onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                  placeholder="Enter item description or details..."
                />
              </div>

              {/* Total */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Total</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.total}
                  onChange={(e) => handleInputChange('total', e.target.value)}
                  placeholder="Press Enter Key to purchase Cart"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddToCart()}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Discount (Rs) */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Discount (Rs)</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.discountRs}
                  onChange={(e) => handleInputChange('discountRs', e.target.value)}
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
                  value={formData.GSTRs}
                  onChange={(e) => handleInputChange('GSTRs', e.target.value)}
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

            {/* Add to Cart Button */}
            <div className="mb-4">
              <button 
                onClick={handleAddToCart}
                disabled={!formData.searchItem || !formData.total}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ADD TO CART
              </button>
            </div>
          </div>

          {/* Creditor/Supplier Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Creditor/ Supplier, Item/ Product Cart & Total Amounts Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
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

              {/* Order No */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Order No</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.orderNo}
                  onChange={(e) => handleInputChange('orderNo', e.target.value)}
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

              {/* Expected Delivery Date */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Expected Delivery Date</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.expectedDeliveryDate ? formatDateForInput(formData.expectedDeliveryDate) : ''}
                  onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Priority</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Payment Terms</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="15 Days">15 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="60 Days">60 Days</option>
                  <option value="90 Days">90 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* ✅ ENHANCED: Purchase Cart with proper calculations and editable fields */}
          {purchaseCart.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Purchase Cart</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Item Name</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Description</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">QTY</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Rate</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Disc %</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Disc Amt</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">GST %</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">GST Amt</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseCart.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium">{item.itemName}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">
                          <textarea
                            className="w-full border border-gray-200 rounded px-2 py-1 text-xs resize-none"
                            rows="2"
                            value={item.itemDescription || ''}
                            onChange={(e) => handleItemDescriptionChange(item.id, e.target.value)}
                            placeholder="Item description..."
                          />
                        </td>
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
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.discount}
                            onChange={(e) => handleDiscountChange(item.id, parseFloat(e.target.value) || 0)}
                            className="w-16 border border-gray-200 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs text-red-600">₹{(item.discountAmount || 0).toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.GST}
                            onChange={(e) => handleGSTChange(item.id, parseFloat(e.target.value) || 0)}
                            className="w-16 border border-gray-200 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs text-blue-600">₹{(item.GSTAmount || 0).toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium text-green-600">₹{item.total.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-center">
                          <button 
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                            title="Remove from cart"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* ✅ NEW: Cart Total Row */}
                    <tr className="bg-blue-50 font-medium">
                      <td colSpan="5" className="border-b border-gray-300 px-3 py-2 text-xs text-right">Cart Totals:</td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs text-red-600">
                        ₹{purchaseCart.reduce((sum, item) => sum + (item.discountAmount || 0), 0).toFixed(2)}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs"></td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs text-blue-600">
                        ₹{purchaseCart.reduce((sum, item) => sum + (item.GSTAmount || 0), 0).toFixed(2)}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2 text-xs font-bold text-green-600">
                        ₹{purchaseCart.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                      </td>
                      <td className="border-b border-gray-300 px-3 py-2"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Narration */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Narration...</label>
              <textarea 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows="4"
                placeholder="Enter purchase order description or notes..."
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
              />
            </div>

            {/* Discount and GST Method & Totals */}
            <div>
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">Discount and GST Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountGSTMethod"
                      value="On Total"
                      checked={formData.discountGSTMethod === 'On Total'}
                      onChange={(e) => handleInputChange('discountGSTMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-xs">On Total</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountGSTMethod"
                      value="Individual Item"
                      checked={formData.discountGSTMethod === 'Individual Item'}
                      onChange={(e) => handleInputChange('discountGSTMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-xs">Individual Item</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Transport Cost */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Transport Cost (Rs)</label>
                  <input 
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.transportCost}
                    onChange={(e) => handleInputChange('transportCost', e.target.value)}
                  />
                </div>

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

                {/* Grand Total */}
                <div className="col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Grand Total (Rs)</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-medium text-lg"
                    value={`₹${formData.grandTotal}`}
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
              disabled={saving}
            >
              {isEditMode ? 'CANCEL EDIT' : 'RESET'}
            </button>
            <button 
              onClick={handleSave}
              disabled={purchaseCart.length === 0 || !formData.supplierId || saving}
              className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? 'UPDATING...' : 'SAVING...'}
                </>
              ) : (
                <>
                  {isEditMode ? '💾 UPDATE ORDER' : '🔒 SAVE PURCHASE ORDER'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Order Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Purchase Order Entry List ({filteredEntries.length} records)
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
                onClick={() => fetchPurchaseOrders()}
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
                placeholder="Search by order number, supplier, status, or priority..."
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
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Order No</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Supplier</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Total Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Priority</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs font-medium text-teal-600">{entry.orderNo}</td>
                      <td className="py-3 px-2 text-xs">{entry.supplier}</td>
                      <td className="py-3 px-2 text-xs">{entry.date}</td>
                      <td className="py-3 px-2 text-xs">{entry.items}</td>
                      <td className="py-3 px-2 text-xs font-medium">{entry.totalAmount}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.status === 'Approved' 
                              ? 'bg-green-100 text-green-800' 
                              : entry.status === 'Sent'
                              ? 'bg-blue-100 text-blue-800'
                              : entry.status === 'Received'
                              ? 'bg-purple-100 text-purple-800'
                              : entry.status === 'Cancelled'
                              ? 'bg-red-100 text-red-800'
                              : entry.status === 'Pending'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.status}
                          </span>
                          {(entry.status === 'Draft' || entry.status === 'Pending') && (
                            <select
                              className="text-xs border rounded px-1 py-1"
                              onChange={(e) => handleStatusUpdate(entry, e.target.value)}
                              defaultValue=""
                            >
                              <option value="">Change Status</option>
                              <option value="Pending">Mark as Pending</option>
                              <option value="Approved">Approve</option>
                              <option value="Cancelled">Cancel</option>
                            </select>
                          )}
                          {entry.status === 'Approved' && (
                            <select
                              className="text-xs border rounded px-1 py-1"
                              onChange={(e) => handleStatusUpdate(entry, e.target.value)}
                              defaultValue=""
                            >
                              <option value="">Change Status</option>
                              <option value="Sent">Mark as Sent</option>
                              <option value="Cancelled">Cancel</option>
                            </select>
                          )}
                          {entry.status === 'Sent' && (
                            <select
                              className="text-xs border rounded px-1 py-1"
                              onChange={(e) => handleStatusUpdate(entry, e.target.value)}
                              defaultValue=""
                            >
                              <option value="">Change Status</option>
                              <option value="Received">Mark as Received</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.priority === 'Urgent'
                              ? 'bg-red-100 text-red-800'
                              : entry.priority === 'High'
                              ? 'bg-orange-100 text-orange-800'
                              : entry.priority === 'Medium'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {entry.priority}
                          </span>
                          <select
                            className="text-xs border rounded px-1 py-1"
                            onChange={(e) => handlePriorityUpdate(entry, e.target.value)}
                            defaultValue=""
                          >
                            <option value="">Change Priority</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                          </select>
                        </div>
                      </td>
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
                          Loading purchase orders...
                        </div>
                      ) : searchTerm ? (
                        'No matching records found'
                      ) : (
                        'No purchase order entries found'
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

      {/* ✅ ENHANCED: Professional Invoice Modal with Company Details */}
      {showOrderDetails && selectedOrderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Purchase Order Invoice - {selectedOrderDetails.orderNo}
              </h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* ✅ ENHANCED: Professional Company Header */}
              <div className="border-b-2 border-teal-200 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div className="w-1/2">
                    <h2 className="text-3xl font-bold text-teal-600 mb-2">{companyInfo.name}</h2>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{companyInfo.address}</p>
                      <p><strong>GSTIN:</strong> {companyInfo.gstin}</p>
                      <p><strong>Phone:</strong> {companyInfo.phone}</p>
                      <p><strong>Website:</strong> {companyInfo.website}</p>
                      <p><strong>State:</strong> {companyInfo.state} | <strong>Jurisdiction:</strong> {companyInfo.jurisdiction}</p>
                    </div>
                  </div>
                  <div className="text-right w-1/2">
                    <div className="mb-3">
                      <h3 className="text-xl font-bold text-gray-800">PURCHASE ORDER</h3>
                      <p className="text-sm text-gray-600">Order No: <strong>{selectedOrderDetails.orderNo}</strong></p>
                      <p className="text-sm text-gray-600">Date: <strong>{formatDateForDisplay(selectedOrderDetails.entryDate.split('T')[0])}</strong></p>
                    </div>
                    <div className="space-x-2">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedOrderDetails.status === 'Approved' 
                          ? 'bg-green-100 text-green-800' 
                          : selectedOrderDetails.status === 'Sent'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedOrderDetails.status === 'Received'
                          ? 'bg-purple-100 text-purple-800'
                          : selectedOrderDetails.status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : selectedOrderDetails.status === 'Pending'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedOrderDetails.status}
                      </span>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        selectedOrderDetails.priority === 'Urgent'
                          ? 'bg-red-100 text-red-800'
                          : selectedOrderDetails.priority === 'High'
                          ? 'bg-orange-100 text-orange-800'
                          : selectedOrderDetails.priority === 'Medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedOrderDetails.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Supplier & Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold text-teal-600 mb-3 text-lg">📍 Supplier Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedOrderDetails.supplierName}</p>
                    <p><strong>Company:</strong> {selectedOrderDetails.shopCompanyName || 'N/A'}</p>
                    <p><strong>Contact:</strong> {selectedOrderDetails.contactNo || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedOrderDetails.supplierAddress || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h4 className="font-semibold text-blue-600 mb-3 text-lg">📋 Order Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Expected Delivery:</strong> {selectedOrderDetails.expectedDeliveryDate ? formatDateForDisplay(selectedOrderDetails.expectedDeliveryDate.split('T')[0]) : 'Not specified'}</p>
                    <p><strong>Payment Terms:</strong> {selectedOrderDetails.paymentTerms}</p>
                    <p><strong>GST Method:</strong> {selectedOrderDetails.discountGSTMethod}</p>
                    {selectedOrderDetails.narration && (
                      <p><strong>Notes:</strong> {selectedOrderDetails.narration}</p>
                    )}
                    {selectedOrderDetails.approvedBy && (
                      <p><strong>Approved By:</strong> {selectedOrderDetails.approvedBy}</p>
                    )}
                    <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* ✅ ENHANCED: Professional Items Table */}
              <div className="mb-6">
                <h4 className="font-semibold text-teal-600 mb-4 text-lg">📦 Order Items</h4>
                <div className="overflow-x-auto border-2 border-teal-100 rounded-lg">
                  <table className="min-w-full">
                    <thead className="bg-teal-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-teal-700 border-b border-teal-200">#</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-teal-700 border-b border-teal-200">Item Details</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-teal-700 border-b border-teal-200">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-teal-700 border-b border-teal-200">Rate</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-teal-700 border-b border-teal-200">Disc %</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-teal-700 border-b border-teal-200">Disc Amt</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-teal-700 border-b border-teal-200">GST %</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-teal-700 border-b border-teal-200">GST Amt</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-teal-700 border-b border-teal-200">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrderDetails.items.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-center font-medium">{index + 1}</td>
                          <td className="px-4 py-4 text-sm">
                            <div>
                              <p className="font-semibold text-gray-800">{item.itemName}</p>
                              {item.itemDescription && (
                                <p className="text-xs text-gray-600 mt-1">{item.itemDescription}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-center font-medium">{item.qty}</td>
                          <td className="px-4 py-4 text-sm text-right">₹{item.rate.toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-center">{item.discount}%</td>
                          <td className="px-4 py-4 text-sm text-right text-red-600">₹{(item.discountAmount || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm text-center">{item.GST}%</td>
                          <td className="px-4 py-4 text-sm text-right text-blue-600">₹{(item.GSTAmount || 0).toFixed(2)}</td>
                          <td className="px-4 py-4 text-sm font-bold text-right text-green-600">₹{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                      {/* Summary Row */}
                      <tr className="bg-gray-100 font-semibold">
                        <td colSpan="5" className="px-4 py-3 text-right">Totals:</td>
                        <td className="px-4 py-3 text-right text-red-600">
                          ₹{selectedOrderDetails.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3"></td>
                        <td className="px-4 py-3 text-right text-blue-600">
                          ₹{selectedOrderDetails.items.reduce((sum, item) => sum + (item.GSTAmount || 0), 0).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-bold">
                          ₹{selectedOrderDetails.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ✅ ENHANCED: Professional Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {selectedOrderDetails.narration && (
                    <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
                      <h5 className="font-semibold text-yellow-800 mb-2 flex items-center">
                        📝 Additional Notes
                      </h5>
                      <p className="text-sm text-yellow-700">{selectedOrderDetails.narration}</p>
                    </div>
                  )}
                  
                  {/* Bank Details */}
                  <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                    <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                      🏦 Bank Details
                    </h5>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Bank:</strong> {companyInfo.bankName}</p>
                      <p><strong>Account No:</strong> {companyInfo.accountNo}</p>
                      <p><strong>Branch:</strong> {companyInfo.branchCode}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-2 border-teal-200 rounded-lg p-6 bg-gradient-to-br from-teal-50 to-blue-50">
                  <h4 className="font-bold text-teal-600 mb-4 text-xl flex items-center">
                    💰 Order Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Items Subtotal:</span>
                      <span className="font-medium">₹{selectedOrderDetails.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Transport Cost:</span>
                      <span className="font-medium">₹{selectedOrderDetails.transportCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-600">
                      <span>Order Discount:</span>
                      <span className="font-medium">-₹{selectedOrderDetails.discountRs.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-blue-600">
                      <span>Additional GST:</span>
                      <span className="font-medium">+₹{selectedOrderDetails.GSTRs.toFixed(2)}</span>
                    </div>
                    <hr className="border-gray-400" />
                    <div className="flex justify-between text-xl font-bold text-teal-700 bg-white p-3 rounded border">
                      <span>Final Total:</span>
                      <span>₹{selectedOrderDetails.grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-3 bg-white p-2 rounded text-center">
                      <strong>Summary:</strong> {selectedOrderDetails.items.length} Items | 
                      Total Qty: {selectedOrderDetails.items.reduce((sum, item) => sum + item.qty, 0)} | 
                      Total Discount: ₹{(selectedOrderDetails.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0) + selectedOrderDetails.discountRs).toFixed(2)} |
                      Total GST: ₹{(selectedOrderDetails.items.reduce((sum, item) => sum + (item.GSTAmount || 0), 0) + selectedOrderDetails.GSTRs).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    const printContent = `
                      <html>
                        <head>
                          <title>Purchase Order - ${selectedOrderDetails.orderNo}</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 15px; line-height: 1.4; }
                            .header { border-bottom: 3px solid #0f766e; padding-bottom: 20px; margin-bottom: 25px; }
                            .company-section { display: flex; justify-content: space-between; align-items: start; }
                            .company-info h1 { color: #0f766e; font-size: 28px; margin: 0 0 10px 0; }
                            .company-details { font-size: 11px; color: #666; line-height: 1.3; }
                            .order-info { text-align: right; }
                            .order-info h2 { font-size: 20px; margin: 0 0 5px 0; }
                            .info-section { display: flex; justify-content: space-between; margin: 20px 0; }
                            .info-box { border: 1px solid #ddd; padding: 12px; border-radius: 6px; width: 48%; }
                            .info-box h3 { color: #0f766e; margin: 0 0 8px 0; font-size: 14px; }
                            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f0f9ff; font-weight: bold; color: #0f766e; }
                            .item-desc { font-size: 10px; color: #666; margin-top: 2px; }
                            .total-section { margin-top: 25px; }
                            .summary-box { float: right; width: 300px; border: 2px solid #0f766e; padding: 15px; border-radius: 8px; }
                            .summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                            .final-total { font-size: 18px; font-weight: bold; border-top: 2px solid #0f766e; padding-top: 10px; }
                            .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 15px; }
                            .bank-info { margin-top: 20px; font-size: 11px; }
                            .status-badges { margin-top: 10px; }
                            .badge { padding: 4px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="company-section">
                              <div class="company-info">
                                <h1>${companyInfo.name}</h1>
                                <div class="company-details">
                                  ${companyInfo.address}<br>
                                  <strong>GSTIN:</strong> ${companyInfo.gstin} | <strong>Phone:</strong> ${companyInfo.phone}<br>
                                  <strong>Website:</strong> ${companyInfo.website} | <strong>State:</strong> ${companyInfo.state}
                                </div>
                              </div>
                              <div class="order-info">
                                <h2>PURCHASE ORDER</h2>
                                <div><strong>Order No:</strong> ${selectedOrderDetails.orderNo}</div>
                                <div><strong>Date:</strong> ${formatDateForDisplay(selectedOrderDetails.entryDate.split('T')[0])}</div>
                                <div class="status-badges">
                                  <span class="badge" style="background-color: #e0f2fe;">${selectedOrderDetails.status}</span>
                                  <span class="badge" style="background-color: #f3e5f5;">${selectedOrderDetails.priority} Priority</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div class="info-section">
                            <div class="info-box">
                              <h3>📍 Supplier Information</h3>
                              <strong>Name:</strong> ${selectedOrderDetails.supplierName}<br>
                              <strong>Company:</strong> ${selectedOrderDetails.shopCompanyName || 'N/A'}<br>
                              <strong>Contact:</strong> ${selectedOrderDetails.contactNo || 'N/A'}<br>
                              <strong>Address:</strong> ${selectedOrderDetails.supplierAddress || 'N/A'}
                            </div>
                            <div class="info-box">
                              <h3>📋 Order Details</h3>
                              <strong>Expected Delivery:</strong> ${selectedOrderDetails.expectedDeliveryDate ? formatDateForDisplay(selectedOrderDetails.expectedDeliveryDate.split('T')[0]) : 'Not specified'}<br>
                              <strong>Payment Terms:</strong> ${selectedOrderDetails.paymentTerms}<br>
                              <strong>GST Method:</strong> ${selectedOrderDetails.discountGSTMethod}<br>
                              <strong>Generated:</strong> ${new Date().toLocaleString()}
                            </div>
                          </div>
                          
                          <table>
                            <thead>
                              <tr>
                                <th style="width: 5%;">#</th>
                                <th style="width: 30%;">Item Details</th>
                                <th style="width: 8%;">Qty</th>
                                <th style="width: 12%;">Rate</th>
                                <th style="width: 8%;">Disc %</th>
                                <th style="width: 10%;">Disc Amt</th>
                                <th style="width: 8%;">GST %</th>
                                <th style="width: 10%;">GST Amt</th>
                                <th style="width: 12%;">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              ${selectedOrderDetails.items.map((item, index) => `
                                <tr>
                                  <td style="text-align: center;">${index + 1}</td>
                                  <td>
                                    <strong>${item.itemName}</strong>
                                    ${item.itemDescription ? `<div class="item-desc">${item.itemDescription}</div>` : ''}
                                  </td>
                                  <td style="text-align: center;">${item.qty}</td>
                                  <td style="text-align: right;">₹${item.rate.toFixed(2)}</td>
                                  <td style="text-align: center;">${item.discount}%</td>
                                  <td style="text-align: right; color: #dc2626;">₹${(item.discountAmount || 0).toFixed(2)}</td>
                                  <td style="text-align: center;">${item.GST}%</td>
                                  <td style="text-align: right; color: #2563eb;">₹${(item.GSTAmount || 0).toFixed(2)}</td>
                                  <td style="text-align: right; font-weight: bold;">₹${item.total.toFixed(2)}</td>
                                </tr>
                              `).join('')}
                              <tr style="background-color: #f3f4f6; font-weight: bold;">
                                <td colspan="5" style="text-align: right;">Totals:</td>
                                <td style="text-align: right; color: #dc2626;">₹${selectedOrderDetails.items.reduce((sum, item) => sum + (item.discountAmount || 0), 0).toFixed(2)}</td>
                                <td></td>
                                <td style="text-align: right; color: #2563eb;">₹${selectedOrderDetails.items.reduce((sum, item) => sum + (item.GSTAmount || 0), 0).toFixed(2)}</td>
                                <td style="text-align: right; color: #059669;">₹${selectedOrderDetails.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</td>
                              </tr>
                            </tbody>
                          </table>
                          
                          <div class="total-section">
                            <div class="summary-box">
                              <h3 style="color: #0f766e; margin: 0 0 15px 0;">💰 Order Summary</h3>
                              <div class="summary-row">
                                <span>Items Subtotal:</span>
                                <span>₹${selectedOrderDetails.items.reduce((sum, item) => sum + item.total, 0).toFixed(2)}</span>
                              </div>
                              <div class="summary-row">
                                <span>Transport Cost:</span>
                                <span>₹${selectedOrderDetails.transportCost.toFixed(2)}</span>
                              </div>
                              <div class="summary-row" style="color: #dc2626;">
                                <span>Order Discount:</span>
                                <span>-₹${selectedOrderDetails.discountRs.toFixed(2)}</span>
                              </div>
                              <div class="summary-row" style="color: #2563eb;">
                                <span>Additional GST:</span>
                                <span>+₹${selectedOrderDetails.GSTRs.toFixed(2)}</span>
                              </div>
                              <div class="final-total">
                                <div class="summary-row">
                                  <span>Final Total:</span>
                                  <span>₹${selectedOrderDetails.grandTotal.toFixed(2)}</span>
                                </div>
                              </div>
                              <div style="font-size: 10px; margin-top: 10px; color: #666; text-align: center;">
                                ${selectedOrderDetails.items.length} Items | Qty: ${selectedOrderDetails.items.reduce((sum, item) => sum + item.qty, 0)}
                              </div>
                            </div>
                            <div style="clear: both;"></div>
                          </div>
                          
                          <div class="bank-info">
                            <h3 style="color: #0f766e;">🏦 Bank Details</h3>
                            <strong>Bank:</strong> ${companyInfo.bankName} | <strong>Account:</strong> ${companyInfo.accountNo} | <strong>Branch:</strong> ${companyInfo.branchCode}
                          </div>
                          
                          ${selectedOrderDetails.narration ? `
                            <div style="margin-top: 20px; padding: 10px; background-color: #fef3c7; border-left: 4px solid #f59e0b;">
                              <strong>📝 Notes:</strong> ${selectedOrderDetails.narration}
                            </div>
                          ` : ''}
                          
                          <div class="footer">
                            <strong>${companyInfo.name}</strong> - Purchase Order Management System<br>
                            This document is generated electronically and contains confidential business information.
                          </div>
                        </body>
                      </html>
                    `
                    const printWindow = window.open('', '_blank')
                    printWindow.document.write(printContent)
                    printWindow.document.close()
                    printWindow.print()
                  }}
                  className="bg-blue-600 text-white px-6 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  🖨️ Print Professional Invoice
                </button>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowOrderDetails(false)
                    handleEdit({ id: selectedOrderDetails._id })
                  }}
                  className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  ✏️ Edit Order
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
