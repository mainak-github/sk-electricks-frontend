'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function PurchaseEntry() {
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
    if (!dateStr) return ''
    if (dateStr.includes('/')) return dateStr
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  // Generate voucher number
  const generateVoucherNo = () => {
    const prefix = 'PUR'
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}${timestamp}`
  }

  const [formData, setFormData] = useState({
    searchItem: '',
    searchSupplier: '',
    selectedQuotation: '', // ✅ NEW
    supplierName: 'General Supplier',
    supplierId: '',
    shopCompanyName: '',
    institutionName: '',
    contactNo: '',
    supplierAddress: '',
    supplierGST: '',
    previousDue: '0',
    voucherNo: generateVoucherNo(),
    entryDate: getTodayFormatted(),
    discount: '0',
    discountPercent: '0',
    GST: '0',
    GSTPercent: '0',
    total: '',
    narration: '',
    discountGSTMethod: 'individual',
    transportCost: '0',
    subTotal: '0.00',
    grandTotal: '0.00',
    paidAmount: '0',
    dueAmount: '0',
    paymentMethod: 'Cash',
    purchaseOrderNo: '',
    invoiceNo: '',
    quotationNo: '', // ✅ NEW
    quotationId: '' // ✅ NEW
  })

  const [purchaseItems, setPurchaseItems] = useState([])
  const [purchaseEntries, setPurchaseEntries] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [items, setItems] = useState([])
  const [quotations, setQuotations] = useState([]) // ✅ NEW

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingQuotations, setLoadingQuotations] = useState(false) // ✅ NEW

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingPurchaseId, setEditingPurchaseId] = useState(null)
  const [showPurchaseDetails, setShowPurchaseDetails] = useState(false)
  const [selectedPurchaseDetails, setSelectedPurchaseDetails] = useState(null)

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
          brand: item.brand,
          description: item.description || ''
        }))
        setItems(formattedItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
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
    }
  }

  // ✅ NEW: Fetch quotations
  const fetchQuotations = async () => {
    try {
      setLoadingQuotations(true)
      const response = await fetch(`${INTEGRATION_API_URL}/qoutations?limit=1000&sortBy=createdAt&sortOrder=desc`)
      const data = await response.json()
      
      if (data.success) {
        const formattedQuotations = data.data.map(quotation => ({
          id: quotation._id,
          quotationNo: quotation.quotationNo,
          customerName: quotation.customerName,
          customerId: quotation.customerId,
          institutionName: quotation.institutionName || '',
          contactNo: quotation.contactNo || '',
          customerAddress: quotation.customerAddress || '',
          customerGST: quotation.customerGST || '',
          serviceCategory: quotation.serviceCategory || '',
          serviceDescription: quotation.serviceDescription || '',
          items: quotation.items || [],
          grandTotal: quotation.grandTotal || 0,
          status: quotation.status || 'Draft',
          entryDate: quotation.entryDate
        }))
        setQuotations(formattedQuotations)
        console.log('Quotations loaded:', formattedQuotations.length)
      }
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoadingQuotations(false)
    }
  }

  // ✅ NEW: Handle quotation selection
  const handleQuotationSelect = async (quotationId) => {
    if (!quotationId) {
      handleInputChange('selectedQuotation', '')
      return
    }

    try {
      const selectedQuotation = quotations.find(q => q.id === quotationId)
      
      if (!selectedQuotation) {
        alert('Quotation not found')
        return
      }

      // Update quotation selection
      handleInputChange('selectedQuotation', quotationId)
      handleInputChange('quotationId', quotationId)
      handleInputChange('quotationNo', selectedQuotation.quotationNo)
      
      // Auto-fill supplier details (treating customer as supplier for purchase)
      if (selectedQuotation.customerId) {
        handleInputChange('supplierId', selectedQuotation.customerId)
        handleInputChange('searchSupplier', selectedQuotation.customerId)
      }
      handleInputChange('supplierName', selectedQuotation.customerName)
      handleInputChange('institutionName', selectedQuotation.institutionName)
      handleInputChange('contactNo', selectedQuotation.contactNo)
      handleInputChange('supplierAddress', selectedQuotation.customerAddress)
      handleInputChange('supplierGST', selectedQuotation.customerGST)

      // Auto-fill narration with service details
      let narration = `Based on Quotation: ${selectedQuotation.quotationNo}. `
      if (selectedQuotation.serviceCategory) {
        narration += `Service: ${selectedQuotation.serviceCategory}. `
      }
      if (selectedQuotation.serviceDescription) {
        narration += selectedQuotation.serviceDescription
      }
      handleInputChange('narration', narration)

      // Auto-add items to cart
      if (selectedQuotation.items && selectedQuotation.items.length > 0) {
        const cartItems = selectedQuotation.items.map((item, index) => {
          const qty = item.qty || 1
          const rate = item.rate || 0
          const discount = item.discount || 0
          const discountAmount = item.discountAmount || 0
          const GST = item.GST || 0
          const GSTAmount = item.GSTAmount || 0
          const total = item.total || (qty * rate)

          return {
            id: Date.now() + index,
            itemId: item.itemId || item._id,
            itemName: item.itemName,
            itemDescription: item.itemDescription || '',
            qty: qty,
            rate: rate,
            discount: discount,
            discountAmount: discountAmount,
            GST: GST,
            GSTAmount: GSTAmount,
            total: total
          }
        })

        const existingItemIds = purchaseItems.map(ci => ci.itemId)
        const newItems = cartItems.filter(item => !existingItemIds.includes(item.itemId))

        if (newItems.length > 0) {
          setPurchaseItems(prev => [...prev, ...newItems])
          alert(`✅ Added ${newItems.length} items from quotation!`)
        } else if (cartItems.length > 0) {
          alert('ℹ️ All quotation items are already in the cart')
        }
      }

      alert('✅ Quotation details auto-filled successfully!')
    } catch (error) {
      console.error('Error loading quotation:', error)
      alert('Error loading quotation. Please try again.')
    }
  }

  const fetchPurchases = async (page = 1, limit = rowsPerPage, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/purchase-entries?page=${page}&limit=${limit}&search=${search}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedEntries = data.data.map(purchase => ({
          id: purchase._id,
          voucherNo: purchase.voucherNo,
          supplier: purchase.supplierName,
          quotationNo: purchase.quotationNo || 'N/A', // ✅ NEW
          entryDate: formatDateForDisplay(purchase.entryDate.split('T')[0]),
          items: purchase.items.length,
          totalAmount: `₹ ${purchase.grandTotal.toFixed(2)}`,
          paidAmount: `₹ ${purchase.paidAmount.toFixed(2)}`,
          dueAmount: `₹ ${purchase.dueAmount.toFixed(2)}`,
          status: purchase.status,
          createdAt: new Date(purchase.createdAt).getTime(),
          rawData: purchase
        }))
        setPurchaseEntries(formattedEntries)
        setFilteredEntries(formattedEntries)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPurchaseDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-entries/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to fetch purchase details')
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error)
      return null
    }
  }

  const savePurchase = async (purchaseData) => {
    try {
      setSaving(true)
      const url = isEditMode 
        ? `${API_BASE_URL}/purchase-entries/${editingPurchaseId}` 
        : `${API_BASE_URL}/purchase-entries`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const action = isEditMode ? 'updated' : 'saved'
        alert(`✅ Purchase ${data.data.voucherNo} ${action} successfully!`)
        await fetchPurchases()
        return true
      } else {
        alert(data.message || `Error ${isEditMode ? 'updating' : 'saving'} purchase`)
        return false
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} purchase:`, error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} purchase. Please try again.`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const deletePurchase = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-entries/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Purchase deleted successfully!')
        await fetchPurchases()
      } else {
        alert(data.message || 'Error deleting purchase')
      }
    } catch (error) {
      console.error('Error deleting purchase:', error)
      alert('Error deleting purchase. Please try again.')
    }
  }

  const updatePurchaseStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/purchase-entries/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Purchase status updated to ${status} successfully!`)
        await fetchPurchases()
      } else {
        alert(data.message || 'Error updating purchase status')
      }
    } catch (error) {
      console.error('Error updating purchase status:', error)
      alert('Error updating purchase status. Please try again.')
    }
  }

  // Load initial data
  useEffect(() => {
    fetchItems()
    fetchSuppliers()
    fetchPurchases()
    fetchQuotations() // ✅ NEW
  }, [])

  // Calculate totals whenever items change
  useEffect(() => {
    calculateTotals()
  }, [purchaseItems, formData.transportCost, formData.discount, formData.GST])

  // Update filtered entries when purchase entries change
  useEffect(() => {
    handleSearch()
  }, [purchaseEntries])

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
        supplierAddress: selectedSupplier.address,
        supplierGST: selectedSupplier.gstNumber,
        previousDue: selectedSupplier.openingDue.toString()
      }))
    }
  }

  const handleItemSelect = (itemName) => {
    const selectedItem = items.find(item => item.name === itemName)
    if (selectedItem) {
      setFormData(prev => ({
        ...prev,
        searchItem: itemName,
        total: selectedItem.purchasePrice.toString(),
        GST: selectedItem.taxPercent.toString()
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
    const existingItemIndex = purchaseItems.findIndex(item => item.itemName === selectedItem.name)
    if (existingItemIndex !== -1) {
      const updatedItems = [...purchaseItems]
      updatedItems[existingItemIndex].qty += 1
      updatedItems[existingItemIndex].total = updatedItems[existingItemIndex].qty * updatedItems[existingItemIndex].rate
      setPurchaseItems(updatedItems)
    } else {
      const newItem = {
        id: Date.now(),
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        itemDescription: selectedItem.description || '',
        qty: 1,
        rate: selectedItem.purchasePrice,
        discount: parseFloat(formData.discount) || 0,
        discountAmount: parseFloat(formData.discount) || 0,
        GST: parseFloat(formData.GST) || selectedItem.taxPercent || 0,
        GSTAmount: parseFloat(formData.GST) || 0,
        total: parseFloat(formData.total) || 0
      }
      setPurchaseItems(prev => [...prev, newItem])
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
    setPurchaseItems(prev => prev.filter(item => item.id !== id))
  }

  const handleQuantityChange = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id)
      return
    }

    setPurchaseItems(prev => prev.map(item => {
      if (item.id === id) {
        const newTotal = item.rate * newQty
        return { ...item, qty: newQty, total: newTotal }
      }
      return item
    }))
  }

  const calculateTotals = () => {
    const cartSubTotal = purchaseItems.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0)
    }, 0)

    const transportCost = parseFloat(formData.transportCost) || 0
    const discount = parseFloat(formData.discount) || 0
    const GST = parseFloat(formData.GST) || 0

    const subTotal = cartSubTotal + transportCost
    const grandTotal = subTotal - discount + GST
    const paidAmount = parseFloat(formData.paidAmount) || 0
    const dueAmount = grandTotal - paidAmount

    setFormData(prev => ({
      ...prev,
      subTotal: subTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      dueAmount: dueAmount.toFixed(2)
    }))
  }

  const handleSave = async () => {
    if (purchaseItems.length === 0) {
      alert('Please add at least one item to the purchase')
      return
    }

    if (!formData.supplierName || !formData.supplierId) {
      alert('Please select a supplier')
      return
    }

    // Prepare purchase data for backend
    const purchaseData = {
      quotationId: formData.quotationId || null, // ✅ NEW
      quotationNo: formData.quotationNo || '', // ✅ NEW
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      shopCompanyName: formData.shopCompanyName,
      institutionName: formData.institutionName,
      contactNo: formData.contactNo,
      supplierAddress: formData.supplierAddress,
      supplierGST: formData.supplierGST, // ✅ NEW
      previousDue: parseFloat(formData.previousDue) || 0,
      entryDate: new Date(formatDateForInput(formData.entryDate)),
      items: purchaseItems.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemDescription: item.itemDescription || '', // ✅ NEW
        qty: item.qty,
        rate: item.rate,
        discount: item.discount,
        discountAmount: item.discountAmount || 0, // ✅ NEW
        GST: item.GST,
        GSTAmount: item.GSTAmount || 0, // ✅ NEW
        total: item.total
      })),
      discount: parseFloat(formData.discount) || 0,
      discountPercent: parseFloat(formData.discountPercent) || 0,
      GST: parseFloat(formData.GST) || 0,
      GSTPercent: parseFloat(formData.GSTPercent) || 0,
      transportCost: parseFloat(formData.transportCost) || 0,
      subTotal: parseFloat(formData.subTotal) || 0,
      grandTotal: parseFloat(formData.grandTotal) || 0,
      paidAmount: parseFloat(formData.paidAmount) || 0,
      dueAmount: parseFloat(formData.dueAmount) || 0,
      narration: formData.narration,
      discountGSTMethod: formData.discountGSTMethod,
      paymentMethod: formData.paymentMethod,
      purchaseOrderNo: formData.purchaseOrderNo || '', // ✅ NEW
      invoiceNo: formData.invoiceNo || '', // ✅ NEW
      status: parseFloat(formData.dueAmount) === 0 ? 'Paid' : 'Partial'
    }

    const success = await savePurchase(purchaseData)
    
    if (success) {
      handleReset()
      setIsEditMode(false)
      setEditingPurchaseId(null)
    }
  }

  const handleReset = () => {
    setPurchaseItems([])
    setFormData({
      searchItem: '',
      searchSupplier: '',
      selectedQuotation: '', // ✅ NEW
      supplierName: 'General Supplier',
      supplierId: '',
      shopCompanyName: '',
      institutionName: '',
      contactNo: '',
      supplierAddress: '',
      supplierGST: '',
      previousDue: '0',
      voucherNo: generateVoucherNo(),
      entryDate: getTodayFormatted(),
      discount: '0',
      discountPercent: '0',
      GST: '0',
      GSTPercent: '0',
      total: '',
      narration: '',
      discountGSTMethod: 'individual',
      transportCost: '0',
      subTotal: '0.00',
      grandTotal: '0.00',
      paidAmount: '0',
      dueAmount: '0',
      paymentMethod: 'Cash',
      purchaseOrderNo: '',
      invoiceNo: '',
      quotationNo: '', // ✅ NEW
      quotationId: '' // ✅ NEW
    })
    setIsEditMode(false)
    setEditingPurchaseId(null)
  }

  // Edit functionality
  const handleEdit = async (purchase) => {
    try {
      const purchaseDetails = await fetchPurchaseDetails(purchase.id)
      if (!purchaseDetails) return

      // Populate form with purchase data
      setFormData({
        searchItem: '',
        searchSupplier: purchaseDetails.supplierId,
        selectedQuotation: purchaseDetails.quotationId || '', // ✅ NEW
        supplierName: purchaseDetails.supplierName,
        supplierId: purchaseDetails.supplierId,
        shopCompanyName: purchaseDetails.shopCompanyName || '',
        institutionName: purchaseDetails.institutionName || '',
        contactNo: purchaseDetails.contactNo || '',
        supplierAddress: purchaseDetails.supplierAddress || '',
        supplierGST: purchaseDetails.supplierGST || '',
        previousDue: purchaseDetails.previousDue.toString(),
        voucherNo: purchaseDetails.voucherNo,
        entryDate: formatDateForDisplay(purchaseDetails.entryDate.split('T')[0]),
        discount: purchaseDetails.discount.toString(),
        discountPercent: purchaseDetails.discountPercent.toString(),
        GST: purchaseDetails.GST.toString(),
        GSTPercent: purchaseDetails.GSTPercent.toString(),
        total: '',
        narration: purchaseDetails.narration || '',
        discountGSTMethod: purchaseDetails.discountGSTMethod || 'individual',
        transportCost: purchaseDetails.transportCost.toString(),
        subTotal: purchaseDetails.subTotal.toString(),
        grandTotal: purchaseDetails.grandTotal.toString(),
        paidAmount: purchaseDetails.paidAmount.toString(),
        dueAmount: purchaseDetails.dueAmount.toString(),
        paymentMethod: purchaseDetails.paymentMethod || 'Cash',
        purchaseOrderNo: purchaseDetails.purchaseOrderNo || '',
        invoiceNo: purchaseDetails.invoiceNo || '',
        quotationNo: purchaseDetails.quotationNo || '', // ✅ NEW
        quotationId: purchaseDetails.quotationId || '' // ✅ NEW
      })

      // Populate cart with items
      const cartItems = purchaseDetails.items.map((item, index) => ({
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
      setPurchaseItems(cartItems)

      // Set edit mode
      setIsEditMode(true)
      setEditingPurchaseId(purchase.id)

      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('Error loading purchase for edit:', error)
      alert('Error loading purchase for editing. Please try again.')
    }
  }

  // View details functionality
  const handleViewDetails = async (purchase) => {
    try {
      const purchaseDetails = await fetchPurchaseDetails(purchase.id)
      if (purchaseDetails) {
        setSelectedPurchaseDetails(purchaseDetails)
        setShowPurchaseDetails(true)
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error)
      alert('Error fetching purchase details. Please try again.')
    }
  }

  // Status update functionality
  const handleStatusUpdate = (purchase, newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      updatePurchaseStatus(purchase.id, newStatus)
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(purchaseEntries)
    } else {
      const filtered = purchaseEntries.filter(entry =>
        entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) || // ✅ NEW
        entry.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
    setCurrentPage(1)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(purchaseEntries)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Purchase Entry List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0f766e; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            .company-details { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
            .report-title { font-size: 20px; color: #374151; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Purchase Management</div>
            <div class="report-title">Purchase Entry List</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredEntries.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Quotation No</th>
                <th>Supplier</th>
                <th>Entry Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Due Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.quotationNo}</td>
                  <td>${entry.supplier}</td>
                  <td>${entry.entryDate}</td>
                  <td>${entry.items}</td>
                  <td>${entry.totalAmount}</td>
                  <td>${entry.paidAmount}</td>
                  <td>${entry.dueAmount}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Purchase Report - Management System
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
      ['Purchase Entry List'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [],
      ['Voucher No', 'Quotation No', 'Supplier', 'Entry Date', 'Items', 'Total Amount', 'Paid Amount', 'Due Amount', 'Status'],
      ...filteredEntries.map(entry => [
        entry.voucherNo,
        entry.quotationNo,
        entry.supplier,
        entry.entryDate,
        entry.items,
        entry.totalAmount,
        entry.paidAmount,
        entry.dueAmount,
        entry.status
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `purchase_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Delete entry
  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this purchase entry? This action cannot be undone.')) {
      deletePurchase(id)
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
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">
            {isEditMode ? '✏️ Edit Purchase Entry' : '📦 Purchase Entry'}
            {isEditMode && (
              <span className="ml-2 text-sm bg-yellow-500 px-2 py-1 rounded">
                Editing: {formData.voucherNo}
              </span>
            )}
          </h2>
          <div className="text-right">
            <div className="text-sm font-semibold">Purchase Management</div>
            <div className="text-xs opacity-90">Inventory Control System</div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Edit Mode Actions */}
          {isEditMode && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800 font-medium">
                  🔄 Edit Mode: You are currently editing purchase {formData.voucherNo}
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

          {/* ✅ NEW: Quotation Selection Section */}
          <div className="mb-6">
            <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
              <h3 className="text-sm font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📋</span> Load from Quotation (Auto-fill Purchase Details)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-700 font-medium mb-2">
                    Select Quotation
                  </label>
                  <select
                    className="w-full border-2 border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                    value={formData.selectedQuotation || ''}
                    onChange={(e) => handleQuotationSelect(e.target.value)}
                    disabled={loadingQuotations}
                  >
                    <option value="">-- Select Quotation --</option>
                    {quotations.map(quotation => (
                      <option key={quotation.id} value={quotation.id}>
                        {quotation.quotationNo} - {quotation.customerName} - {quotation.serviceCategory || 'General'} (₹{quotation.grandTotal.toFixed(2)})
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Auto-fills supplier/customer, items, and details from quotation
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => fetchQuotations()}
                    disabled={loadingQuotations}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded font-semibold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loadingQuotations ? '⏳ Loading...' : '🔄 Refresh Quotations'}
                  </button>
                </div>
              </div>

              {formData.selectedQuotation && (
                <div className="mt-3 p-3 bg-white border border-purple-200 rounded">
                  <p className="text-xs text-purple-700 font-semibold">
                    ✅ Purchase details loaded from: {formData.quotationNo}
                  </p>
                </div>
              )}

              {!loadingQuotations && quotations.length === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-700">⚠️ No quotations found</p>
                </div>
              )}
            </div>
          </div>

          {/* Supplier Information Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Supplier, Item/Product Cart & Total Amounts Information</h3>
            
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
                  placeholder="Contact No"
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
                  placeholder="Supplier address"
                />
              </div>

              {/* Supplier GST */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Supplier GST</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.supplierGST}
                  onChange={(e) => handleInputChange('supplierGST', e.target.value)}
                  placeholder="GST Number"
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
                  placeholder="Institution Name"
                />
              </div>

              {/* Previous Due */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Previous Due</label>
                <input 
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.previousDue}
                  onChange={(e) => handleInputChange('previousDue', e.target.value)}
                />
              </div>

              {/* Voucher No */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Voucher No</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-100 font-bold"
                  value={formData.voucherNo}
                  onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                  disabled={isEditMode}
                />
              </div>

              {/* Quotation No (Read-only) */}
              {formData.quotationNo && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quotation No</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-purple-50 font-semibold"
                    value={formData.quotationNo}
                    readOnly
                  />
                </div>
              )}

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

              {/* Payment Method */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Payment Method</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit">Credit</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Purchase Order No */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">PO Number</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.purchaseOrderNo}
                  onChange={(e) => handleInputChange('purchaseOrderNo', e.target.value)}
                  placeholder="Purchase Order No"
                />
              </div>

              {/* Invoice No */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Invoice No</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.invoiceNo}
                  onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                  placeholder="Invoice Number"
                />
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
                placeholder="Press Enter Key to purchase Cart"
                onKeyDown={(e) => e.key === 'Enter' && handleAddToCart()}
              />
              <p className="text-xs text-gray-500 mt-1">Press Enter Key to purchase Cart</p>
            </div>
            
            <div className="flex items-end">
              <button 
                onClick={handleAddToCart}
                disabled={!formData.searchItem || !formData.total}
                className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-4 py-2 rounded font-semibold hover:from-teal-700 hover:to-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ➕ ADD TO CART
              </button>
            </div>
          </div>

          {/* Purchase Items Table */}
          {purchaseItems.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Purchase Cart ({purchaseItems.length} items)</h4>
              <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold">SL Item Name</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">QTY</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Rate (Per)</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Discount(%)</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">GST(%)</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold">Total</th>
                      <th className="px-3 py-2 text-center text-xs font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 text-xs">
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            {item.itemDescription && (
                              <p className="text-gray-500 text-xs">{item.itemDescription}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                            className="w-16 border border-gray-200 rounded px-2 py-1 text-xs"
                          />
                        </td>
                        <td className="px-3 py-2 text-xs">₹{item.rate.toFixed(2)}</td>
                        <td className="px-3 py-2 text-xs">{item.discount}%</td>
                        <td className="px-3 py-2 text-xs">{item.GST}%</td>
                        <td className="px-3 py-2 text-xs font-medium text-green-700">₹{item.total.toFixed(2)}</td>
                        <td className="px-3 py-2 text-center">
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
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {purchaseItems.length === 0 && (
            <div className="mb-6 p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="text-6xl mb-3">🛒</div>
              <p className="text-gray-600 font-medium">No items in cart</p>
              <p className="text-xs text-gray-500">Add items manually or load from quotation</p>
            </div>
          )}

          {/* Narration */}
          <div className="mb-6">
            <label className="block text-xs text-gray-600 mb-1">Narration...</label>
            <textarea 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows="3"
              placeholder="Enter purchase description or notes..."
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-semibold"
                value={`₹${formData.subTotal}`}
                readOnly
              />
            </div>

            {/* Grand Total */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Grand Total (Rs)</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-green-50 font-bold text-green-700 text-lg"
                value={`₹${formData.grandTotal}`}
                readOnly
              />
            </div>

            <div></div>

            {/* Paid Amount */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Paid Amount</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.paidAmount}
                onChange={(e) => handleInputChange('paidAmount', e.target.value)}
              />
            </div>

            {/* Due Amount */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Due Amount</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-red-50 font-bold text-red-700"
                value={`₹${formData.dueAmount}`}
                readOnly
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-6 py-2 rounded font-semibold hover:bg-gray-600 transition-colors"
              disabled={saving}
            >
              {isEditMode ? '✖️ CANCEL EDIT' : '🔄 RESET'}
            </button>
            <button 
              onClick={handleSave}
              disabled={purchaseItems.length === 0 || !formData.supplierId || saving}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-2 rounded font-semibold hover:from-teal-700 hover:to-cyan-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? 'UPDATING...' : 'SAVING...'}
                </>
              ) : (
                <>
                  {isEditMode ? '💾 UPDATE PURCHASE' : '💾 SAVE PURCHASE'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

     <div className="overflow-x-auto">
                 <table className="min-w-full">
                   <thead>
                     <tr className="border-b">
                       <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Voucher No</th>
                       <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Supplier</th>
                       <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Entry Date</th>
                       <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Items</th>
                       <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Total Amount</th>
                       <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Paid Amount</th>
                       <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Due Amount</th>
                       <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
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
                           <td className="py-3 px-2 text-xs">{entry.paidAmount}</td>
                           <td className="py-3 px-2 text-xs">{entry.dueAmount}</td>
                           <td className="py-3 px-2 text-center">
                             <div className="flex flex-col gap-1">
                               <span className={`px-2 py-1 rounded text-xs ${
                                 entry.status === 'Paid' 
                                   ? 'bg-green-100 text-green-800' 
                                   : entry.status === 'Partial'
                                   ? 'bg-yellow-100 text-yellow-800'
                                   : entry.status === 'Cancelled'
                                   ? 'bg-red-100 text-red-800'
                                   : 'bg-blue-100 text-blue-800'
                               }`}>
                                 {entry.status}
                               </span>
                               {(entry.status === 'Pending' || entry.status === 'Partial') && (
                                 <select
                                   className="text-xs border rounded px-1 py-1"
                                   onChange={(e) => handleStatusUpdate(entry, e.target.value)}
                                   defaultValue=""
                                 >
                                   <option value="">Change Status</option>
                                   <option value="Paid">Mark as Paid</option>
                                   <option value="Partial">Mark as Partial</option>
                                   <option value="Cancelled">Cancel</option>
                                 </select>
                               )}
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
                         <td colSpan="9" className="text-center py-8 text-gray-500">
                           {loading ? (
                             <div className="flex items-center justify-center gap-2">
                               <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                               Loading purchases...
                             </div>
                           ) : searchTerm ? (
                             'No matching records found'
                           ) : (
                             'No purchase entries found'
                           )}
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
     
        
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



          {/* Purchase Details Modal */}
                {showPurchaseDetails && selectedPurchaseDetails && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                      <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          Purchase Details - {selectedPurchaseDetails.voucherNo}
                        </h3>
                        <button
                          onClick={() => setShowPurchaseDetails(false)}
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
                              <p><strong>Name:</strong> {selectedPurchaseDetails.supplierName}</p>
                              <p><strong>Company:</strong> {selectedPurchaseDetails.shopCompanyName || 'N/A'}</p>
                              <p><strong>Contact:</strong> {selectedPurchaseDetails.contactNo || 'N/A'}</p>
                              <p><strong>Address:</strong> {selectedPurchaseDetails.supplierAddress || 'N/A'}</p>
                              <p><strong>Previous Due:</strong> ₹{selectedPurchaseDetails.previousDue.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="border rounded p-4">
                            <h4 className="font-semibold text-gray-700 mb-3">Purchase Information</h4>
                            <div className="space-y-2 text-sm">
                              <p><strong>Date:</strong> {formatDateForDisplay(selectedPurchaseDetails.entryDate.split('T')[0])}</p>
                              <p><strong>Payment Method:</strong> {selectedPurchaseDetails.paymentMethod || 'Cash'}</p>
                              <p><strong>Status:</strong> 
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                  selectedPurchaseDetails.status === 'Paid'
                                    ? 'bg-green-100 text-green-800'
                                    : selectedPurchaseDetails.status === 'Partial'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : selectedPurchaseDetails.status === 'Cancelled'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {selectedPurchaseDetails.status}
                                </span>
                              </p>
                              <p><strong>Method:</strong> {selectedPurchaseDetails.discountGSTMethod}</p>
                              {selectedPurchaseDetails.narration && (
                                <p><strong>Notes:</strong> {selectedPurchaseDetails.narration}</p>
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
                                {selectedPurchaseDetails.items.map((item, index) => (
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
                                <span>₹{selectedPurchaseDetails.subTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Transport Cost:</span>
                                <span>₹{selectedPurchaseDetails.transportCost.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Discount:</span>
                                <span>₹{selectedPurchaseDetails.discount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>GST:</span>
                                <span>₹{selectedPurchaseDetails.GST.toFixed(2)}</span>
                              </div>
                              <hr />
                              <div className="flex justify-between font-semibold">
                                <span>Grand Total:</span>
                                <span>₹{selectedPurchaseDetails.grandTotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-green-600">
                                <span>Paid Amount:</span>
                                <span>₹{selectedPurchaseDetails.paidAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-red-600 font-semibold">
                                <span>Due Amount:</span>
                                <span>₹{selectedPurchaseDetails.dueAmount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
          
                        {/* Action Buttons */}
                        <div className="flex justify-end gap-3 mt-6">
                          <button
                            onClick={() => setShowPurchaseDetails(false)}
                            className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                          >
                            Close
                          </button>
                          <button
                            onClick={() => {
                              setShowPurchaseDetails(false)
                              handleEdit({ id: selectedPurchaseDetails._id })
                            }}
                            className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
                          >
                            Edit Purchase
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

    </div>
  )
}
