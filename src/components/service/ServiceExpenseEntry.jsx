'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function ServiceExpenseEntry() {
  // ✅ Company Information
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
    return today.toISOString().split('T')[0]
  }

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  // Generate voucher number
  const generateVoucherNo = () => {
    const prefix = 'SE'
    const timestamp = Date.now().toString().slice(-4)
    return `${prefix}${timestamp}`
  }

  const [formData, setFormData] = useState({
    searchItem: '',
    searchSupplier: '',
    supplierName: 'General Supplier',
    supplierId: '',
    supplierCode: '',
    // ✅ REMOVED: supplierGST field completely removed
    supplierEmail: '',
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
    qty: '1',
    ratePerItem: '',
    itemDescription: '',
    subTotal: '0.00',
    discountGSTMethod: 'individual',
    serviceExpenseAccount: 'General Service Expenses',
    grandTotal: '0.00',
    paidAmount: '0',
    dueAmount: '0',
    expenseType: 'One-time',
    priority: 'Medium',
    notes: '',
    attachment: '',
    expenseCategory: 'Operational',
    departmentBudget: ''
  })

  const [expenseCart, setExpenseCart] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [expenseEntries, setExpenseEntries] = useState([])
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
  const [editingExpenseId, setEditingExpenseId] = useState(null)
  const [showExpenseDetails, setShowExpenseDetails] = useState(false)
  const [selectedExpenseDetails, setSelectedExpenseDetails] = useState(null)

  // Helper function for currency formatting
  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0
    return `₹ ${numAmount.toFixed(2)}`
  }

  // ✅ ENHANCED: API Functions with better item and supplier handling
  const fetchItems = async (search = '') => {
    try {
      const response = await fetch(`${INTEGRATION_API_URL}/items?search=${search}&limit=100`)
      const data = await response.json()
      if (data.data) {
        const formattedItems = data.data.map(item => ({
          id: item._id,
          name: item.name,
          code: item.code || '',
          description: item.description || '',
          rate: item.rate,
          serviceRate: item.serviceRate || item.rate,
          taxPercent: item.taxPercent || 0,
          unit: item.unit || 'PCS',
          category: item.category || '',
          brand: item.brand || ''
        }))
        setItems(formattedItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      alert('Error fetching items. Please try again.')
    }
  }

  // ✅ UPDATED: Supplier API call without GST handling
  const fetchSuppliers = async (search = '') => {
    try {
      const response = await fetch(`${INTEGRATION_API_URL}/suppliers?search=${search}&limit=100`)
      const data = await response.json()
      
      let suppliersData = [];
      if (data.data && Array.isArray(data.data)) {
        suppliersData = data.data;
      } else if (data.suppliers && Array.isArray(data.suppliers)) {
        suppliersData = data.suppliers;
      } else if (Array.isArray(data)) {
        suppliersData = data;
      }

      if (suppliersData.length > 0) {
        const formattedSuppliers = suppliersData.map(supplier => ({
          id: supplier._id,
          supplierName: supplier.supplierName,
          supplierCode: supplier.supplierCode || supplier.creditorCode || '',
          // ✅ REMOVED: gstNumber field completely removed
          institutionName: supplier.institutionName || supplier.shopCompanyName || '',
          contactNo: supplier.contactNo || '',
          address: supplier.address || '',
          emailAddress: supplier.emailAddress || '',
          isActive: supplier.isActive
        }))
        setSuppliers(formattedSuppliers)
        console.log('Suppliers loaded:', formattedSuppliers.length)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
      alert('Error fetching suppliers. Please try again.')
    }
  }

  const fetchExpenseEntries = async (page = 1, limit = rowsPerPage, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/service-expense-entries?page=${page}&limit=${limit}&search=${search}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedEntries = data.data.map(expense => ({
          id: expense._id,
          voucherNo: expense.voucherNo,
          supplier: expense.supplierName,
          entryDate: formatDateForDisplay(expense.entryDate.split('T')[0]),
          approvalStatus: expense.approvalStatus,
          paymentStatus: expense.paymentStatus,
          priority: expense.priority,
          grandTotal: formatCurrency(expense.grandTotal),
          paidAmount: formatCurrency(expense.paidAmount),
          dueAmount: formatCurrency(expense.dueAmount),
          serviceExpenseAccount: expense.serviceExpenseAccount,
          createdAt: new Date(expense.createdAt).getTime(),
          rawData: expense
        }))
        setExpenseEntries(formattedEntries)
        setFilteredEntries(formattedEntries)
      }
    } catch (error) {
      console.error('Error fetching expense entries:', error)
      alert('Error fetching expense entries. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchExpenseDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-expense-entries/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to fetch expense details')
      }
    } catch (error) {
      console.error('Error fetching expense details:', error)
      alert('Error fetching expense details. Please try again.')
      return null
    }
  }

  const saveExpenseEntry = async (expenseData) => {
    try {
      setSaving(true)
      const url = isEditMode 
        ? `${API_BASE_URL}/service-expense-entries/${editingExpenseId}` 
        : `${API_BASE_URL}/service-expense-entries`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const action = isEditMode ? 'updated' : 'saved'
        alert(`Service Expense Entry ${data.data.voucherNo} ${action} successfully!`)
        await fetchExpenseEntries()
        return true
      } else {
        alert(data.message || `Error ${isEditMode ? 'updating' : 'saving'} expense entry`)
        return false
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} expense entry:`, error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} expense entry. Please try again.`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const deleteExpenseEntry = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-expense-entries/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Service expense entry deleted successfully!')
        await fetchExpenseEntries()
      } else {
        alert(data.message || 'Error deleting expense entry')
      }
    } catch (error) {
      console.error('Error deleting expense entry:', error)
      alert('Error deleting expense entry. Please try again.')
    }
  }

  const updateApprovalStatus = async (id, approvalStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service-expense-entries/${id}/approval-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ approvalStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Approval status updated to ${approvalStatus} successfully!`)
        await fetchExpenseEntries()
      } else {
        alert(data.message || 'Error updating approval status')
      }
    } catch (error) {
      console.error('Error updating approval status:', error)
      alert('Error updating approval status. Please try again.')
    }
  }

  // Load initial data
  useEffect(() => {
    fetchItems()
    fetchSuppliers()
    fetchExpenseEntries()
  }, [])

  // Update filtered entries when expense entries change
  useEffect(() => {
    handleSearch()
  }, [expenseEntries])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // ✅ UPDATED: Supplier selection without GST
  const handleSupplierSelect = (supplierId) => {
    const selectedSupplier = suppliers.find(supplier => supplier.id === supplierId)
    if (selectedSupplier) {
      setFormData(prev => ({
        ...prev,
        supplierId: selectedSupplier.id,
        supplierName: selectedSupplier.supplierName,
        supplierCode: selectedSupplier.supplierCode,
        // ✅ REMOVED: supplierGST handling completely removed
        supplierEmail: selectedSupplier.emailAddress,
        institutionName: selectedSupplier.institutionName,
        contactNo: selectedSupplier.contactNo,
        supplierAddress: selectedSupplier.address
      }))
    }
  }

  // ✅ ENHANCED: Item selection with description
  const handleItemSelect = (itemName) => {
    const selectedItemData = items.find(item => item.name === itemName)
    if (selectedItemData) {
      setSelectedItem(selectedItemData)
      setFormData(prev => ({
        ...prev,
        searchItem: itemName,
        ratePerItem: selectedItemData.serviceRate.toString(),
        GSTPercent: selectedItemData.taxPercent.toString(),
        itemDescription: selectedItemData.description
      }))
    }
  }

  const calculateItemTotal = () => {
    const qty = parseFloat(formData.qty) || 0
    const rate = parseFloat(formData.ratePerItem) || 0
    const discount = parseFloat(formData.discount) || 0
    const GST = parseFloat(formData.GST) || 0
    
    const subtotal = (qty * rate) - discount + GST
    return subtotal.toFixed(2)
  }

  // ✅ ENHANCED: Add to cart with proper calculations and descriptions
  const handleAddToCart = () => {
    if (!selectedItem || !formData.ratePerItem || !formData.qty) {
      alert('Please select an item and enter rate and quantity')
      return
    }

    const qty = parseFloat(formData.qty) || 1
    const rate = parseFloat(formData.ratePerItem) || 0
    const discount = parseFloat(formData.discount) || 0
    const discountPercent = parseFloat(formData.discountPercent) || 0
    const GST = parseFloat(formData.GST) || 0
    const GSTPercent = parseFloat(formData.GSTPercent) || 0

    // Calculate amounts properly
    const baseAmount = qty * rate
    const discountAmount = discount + (baseAmount * discountPercent / 100)
    const taxableAmount = baseAmount - discountAmount
    const gstAmount = GST + (taxableAmount * GSTPercent / 100)
    const total = taxableAmount + gstAmount

    const newExpenseItem = {
      id: Date.now(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemCode: selectedItem.code,
      itemDescription: formData.itemDescription || selectedItem.description,
      description: formData.notes || '',
      qty: qty,
      rate: rate,
      discount: discount,
      discountPercent: discountPercent,
      discountAmount: discountAmount,
      GST: GST,
      GSTPercent: GSTPercent,
      GSTAmount: gstAmount,
      total: total
    }

    setExpenseCart(prev => [...prev, newExpenseItem])
    
    // Reset item selection
    setSelectedItem(null)
    setFormData(prev => ({
      ...prev,
      searchItem: '',
      ratePerItem: '',
      qty: '1',
      discount: '0',
      discountPercent: '0',
      GST: '0',
      GSTPercent: '0',
      total: '',
      itemDescription: '',
      notes: ''
    }))
  }

  const removeFromCart = (id) => {
    setExpenseCart(prev => prev.filter(item => item.id !== id))
  }

  const calculateSubTotal = () => {
    return expenseCart.reduce((sum, item) => sum + item.total, 0).toFixed(2)
  }

  const calculateGrandTotal = () => {
    const subTotal = parseFloat(calculateSubTotal())
    return subTotal.toFixed(2)
  }

  const calculateDueAmount = () => {
    const grandTotal = parseFloat(calculateGrandTotal())
    const paidAmount = parseFloat(formData.paidAmount) || 0
    return (grandTotal - paidAmount).toFixed(2)
  }

  // Update totals when cart or form changes
  useEffect(() => {
    const subTotal = calculateSubTotal()
    const grandTotal = calculateGrandTotal()
    const dueAmount = calculateDueAmount()
    
    setFormData(prev => ({
      ...prev,
      subTotal,
      grandTotal,
      dueAmount,
      total: calculateItemTotal()
    }))
  }, [expenseCart, formData.paidAmount, formData.qty, formData.ratePerItem, formData.discount, formData.GST])

  // ✅ UPDATED: Save function without supplierGST
  const handleSaveServiceExpense = async () => {
    if (expenseCart.length === 0) {
      alert('Please add at least one expense item to the cart')
      return
    }

    if (!formData.supplierName || !formData.supplierId) {
      alert('Please select a supplier')
      return
    }

    // Prepare expense data for backend (removed supplierGST)
    const expenseData = {
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      supplierCode: formData.supplierCode,
      // ✅ REMOVED: supplierGST field completely removed
      supplierEmail: formData.supplierEmail,
      institutionName: formData.institutionName,
      contactNo: formData.contactNo,
      supplierAddress: formData.supplierAddress,
      entryDate: new Date(formData.entryDate),
      serviceExpenseItems: expenseCart.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        description: item.description,
        qty: item.qty,
        rate: item.rate,
        discount: item.discount,
        discountPercent: item.discountPercent,
        discountAmount: item.discountAmount,
        GST: item.GST,
        GSTPercent: item.GSTPercent,
        GSTAmount: item.GSTAmount,
        total: item.total
      })),
      discountMethod: formData.discountGSTMethod,
      subTotal: parseFloat(formData.subTotal) || 0,
      grandTotal: parseFloat(formData.grandTotal) || 0,
      paidAmount: parseFloat(formData.paidAmount) || 0,
      dueAmount: parseFloat(formData.dueAmount) || 0,
      serviceExpenseAccount: formData.serviceExpenseAccount,
      expenseType: formData.expenseType,
      priority: formData.priority,
      notes: formData.notes,
      attachment: formData.attachment,
      expenseCategory: formData.expenseCategory,
      departmentBudget: formData.departmentBudget,
      voucherNo: formData.voucherNo
    }

    const success = await saveExpenseEntry(expenseData)
    
    if (success) {
      handleReset()
      setIsEditMode(false)
      setEditingExpenseId(null)
    }
  }

  const handleReset = () => {
    setExpenseCart([])
    setSelectedItem(null)
    setFormData({
      searchItem: '',
      searchSupplier: '',
      supplierName: 'General Supplier',
      supplierId: '',
      supplierCode: '',
      // ✅ REMOVED: supplierGST field completely removed
      supplierEmail: '',
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
      qty: '1',
      ratePerItem: '',
      itemDescription: '',
      subTotal: '0.00',
      discountGSTMethod: 'individual',
      serviceExpenseAccount: 'General Service Expenses',
      grandTotal: '0.00',
      paidAmount: '0',
      dueAmount: '0',
      expenseType: 'One-time',
      priority: 'Medium',
      notes: '',
      attachment: '',
      expenseCategory: 'Operational',
      departmentBudget: ''
    })
    setIsEditMode(false)
    setEditingExpenseId(null)
  }

  // ✅ UPDATED: Edit function without supplierGST
  const handleEdit = async (expense) => {
    try {
      const expenseDetails = await fetchExpenseDetails(expense.id)
      if (!expenseDetails) return

      // Populate form with expense data (removed supplierGST)
      setFormData({
        searchItem: '',
        searchSupplier: expenseDetails.supplierId,
        supplierName: expenseDetails.supplierName,
        supplierId: expenseDetails.supplierId,
        supplierCode: expenseDetails.supplierCode || '',
        // ✅ REMOVED: supplierGST field completely removed
        supplierEmail: expenseDetails.supplierEmail || '',
        institutionName: expenseDetails.institutionName || '',
        contactNo: expenseDetails.contactNo || '',
        supplierAddress: expenseDetails.supplierAddress || '',
        voucherNo: expenseDetails.voucherNo,
        entryDate: expenseDetails.entryDate.split('T')[0],
        discount: '0',
        discountPercent: '0',
        GST: '0',
        GSTPercent: '0',
        total: '',
        qty: '1',
        ratePerItem: '',
        itemDescription: '',
        subTotal: expenseDetails.subTotal.toString(),
        discountGSTMethod: expenseDetails.discountMethod || 'individual',
        serviceExpenseAccount: expenseDetails.serviceExpenseAccount || 'General Service Expenses',
        grandTotal: expenseDetails.grandTotal.toString(),
        paidAmount: expenseDetails.paidAmount.toString(),
        dueAmount: expenseDetails.dueAmount.toString(),
        expenseType: expenseDetails.expenseType || 'One-time',
        priority: expenseDetails.priority || 'Medium',
        notes: expenseDetails.notes || '',
        attachment: expenseDetails.attachment || '',
        expenseCategory: expenseDetails.expenseCategory || 'Operational',
        departmentBudget: expenseDetails.departmentBudget || ''
      })

      // ✅ ENHANCED: Populate cart with enhanced item data
      const cartItems = expenseDetails.serviceExpenseItems.map((item, index) => ({
        id: Date.now() + index,
        itemId: item.itemId,
        itemName: item.itemName,
        itemCode: item.itemCode || '',
        itemDescription: item.itemDescription || '',
        description: item.description || '',
        qty: item.qty,
        rate: item.rate,
        discount: item.discount || 0,
        discountPercent: item.discountPercent || 0,
        discountAmount: item.discountAmount || 0,
        GST: item.GST || 0,
        GSTPercent: item.GSTPercent || 0,
        GSTAmount: item.GSTAmount || 0,
        total: item.total
      }))
      setExpenseCart(cartItems)

      // Set edit mode
      setIsEditMode(true)
      setEditingExpenseId(expense.id)

      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('Error loading expense for edit:', error)
      alert('Error loading expense for editing. Please try again.')
    }
  }

  // View details functionality
  const handleViewDetails = async (expense) => {
    try {
      const expenseDetails = await fetchExpenseDetails(expense.id)
      if (expenseDetails) {
        setSelectedExpenseDetails(expenseDetails)
        setShowExpenseDetails(true)
      }
    } catch (error) {
      console.error('Error fetching expense details:', error)
      alert('Error fetching expense details. Please try again.')
    }
  }

  // Status update functionality
  const handleStatusUpdate = (expense, newStatus) => {
    if (window.confirm(`Are you sure you want to change approval status to ${newStatus}?`)) {
      updateApprovalStatus(expense.id, newStatus)
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(expenseEntries)
    } else {
      const filtered = expenseEntries.filter(entry =>
        entry.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.approvalStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.serviceExpenseAccount.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(expenseEntries)
    setShowSearch(false)
    setCurrentPage(1)
  }

  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this expense entry? This action cannot be undone.')) {
      deleteExpenseEntry(id)
    }
  }

  // ✅ ENHANCED: Export with company branding
  const handleExport = () => {
    const csvContent = [
      [`${companyInfo.name} - Service Expense Entry List`],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [],
      ['Voucher No', 'Supplier', 'Entry Date', 'Approval Status', 'Payment Status', 'Grand Total', 'Due Amount', 'Account'],
      ...filteredEntries.map(entry => [
        entry.voucherNo,
        entry.supplier,
        entry.entryDate,
        entry.approvalStatus,
        entry.paymentStatus,
        entry.grandTotal,
        entry.dueAmount,
        entry.serviceExpenseAccount
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `service_expense_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // ✅ ENHANCED: Print with company branding
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Service Expense Entry List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #ea580c; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #ea580c; margin-bottom: 10px; }
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
            <div class="company-name">${companyInfo.name}</div>
            <div class="company-details">
              ${companyInfo.address}<br>
              GSTIN: ${companyInfo.gstin} | Phone: ${companyInfo.phone}
            </div>
            <div class="report-title">Service Expense Entry List</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredEntries.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Supplier</th>
                <th>Entry Date</th>
                <th>Approval Status</th>
                <th>Payment Status</th>
                <th>Grand Total</th>
                <th>Due Amount</th>
                <th>Account</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.supplier}</td>
                  <td>${entry.entryDate}</td>
                  <td>${entry.approvalStatus}</td>
                  <td>${entry.paymentStatus}</td>
                  <td>${entry.grandTotal}</td>
                  <td>${entry.dueAmount}</td>
                  <td>${entry.serviceExpenseAccount}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Service Expense Report - ${companyInfo.name} Management System
          </div>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* ✅ ENHANCED: Header with company branding */}
        <div className="bg-orange-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">
            {isEditMode ? 'Edit Service Expense Entry' : 'Service Expense Entry'}
            {isEditMode && (
              <span className="ml-2 text-sm bg-yellow-500 px-2 py-1 rounded">
                Editing: {formData.voucherNo}
              </span>
            )}
          </h2>
          <div className="text-right">
            <div className="text-sm font-semibold">{companyInfo.name}</div>
            <div className="text-xs opacity-90">Expense Management System</div>
          </div>
        </div>

        <div className="p-6">
          {/* Edit Mode Actions */}
          {isEditMode && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800 font-medium">
                  🔄 Edit Mode: You are currently editing expense {formData.voucherNo}
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

          {/* Item cart / Product cart Information Section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Item cart / Product cart Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Search Item */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search Item</label>
                <select
                  value={formData.searchItem}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Expense Item</option>
                  {items.map(item => (
                    <option key={item.id} value={item.name}>
                      {item.name} - {item.code} (₹{item.serviceRate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Supplier */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Search Supplier</label>
                <select
                  value={formData.supplierId}
                  onChange={(e) => handleSupplierSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName} {supplier.institutionName && `- ${supplier.institutionName}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ✅ NEW: Item Description */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Item Description</label>
              <textarea
                value={formData.itemDescription}
                onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                rows="2"
                placeholder="Describe the expense item details..."
              />
            </div>

            {/* Item Details */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">QTY</label>
                <input
                  type="number"
                  min="1"
                  value={formData.qty}
                  onChange={(e) => handleInputChange('qty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rate (Per Item)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.ratePerItem}
                  onChange={(e) => handleInputChange('ratePerItem', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* ✅ ENHANCED: Discount and GST Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discount (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discount}
                  onChange={(e) => handleInputChange('discount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Discount %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.discountPercent}
                  onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">GST (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.GST}
                  onChange={(e) => handleInputChange('GST', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">GST %</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.GSTPercent}
                  onChange={(e) => handleInputChange('GSTPercent', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Total and Add to Cart */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1">Total</label>
                <input
                  type="text"
                  value={`₹${formData.total}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
                  readOnly
                />
                <div className="text-xs text-gray-500 mt-1">Press Enter Key to expense Cart</div>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!selectedItem || !formData.ratePerItem}
                className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ADD TO CART
              </button>
            </div>
          </div>

          {/* ✅ UPDATED: Supplier Information Section without GST field */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Creditor/ Supplier, Item/ Product Cart & Total Amounts Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={formData.supplierName}
                  onChange={(e) => handleInputChange('supplierName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier Code</label>
                <input
                  type="text"
                  value={formData.supplierCode}
                  onChange={(e) => handleInputChange('supplierCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              {/* ✅ COMPLETELY REMOVED: Supplier GST field */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Institution Name</label>
                <input
                  type="text"
                  value={formData.institutionName}
                  onChange={(e) => handleInputChange('institutionName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Voucher No</label>
                  <input
                    type="text"
                    value={formData.voucherNo}
                    onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    disabled={isEditMode}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Entry Date</label>
                  <input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => handleInputChange('entryDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Selected: {formatDateForDisplay(formData.entryDate)}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier Email</label>
                <input
                  type="email"
                  value={formData.supplierEmail}
                  onChange={(e) => handleInputChange('supplierEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contact No</label>
                <input
                  type="text"
                  value={formData.contactNo}
                  onChange={(e) => handleInputChange('contactNo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Supplier Address</label>
                <input
                  type="text"
                  value={formData.supplierAddress}
                  onChange={(e) => handleInputChange('supplierAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* ✅ ENHANCED: Additional Expense Information */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Expense Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expense Type</label>
                <select
                  value={formData.expenseType}
                  onChange={(e) => handleInputChange('expenseType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="One-time">One-time</option>
                  <option value="Recurring">Recurring</option>
                  <option value="Contract">Contract</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Expense Category</label>
                <select
                  value={formData.expenseCategory}
                  onChange={(e) => handleInputChange('expenseCategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Operational">Operational</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Project-based">Project-based</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Department Budget</label>
                <input
                  type="text"
                  value={formData.departmentBudget}
                  onChange={(e) => handleInputChange('departmentBudget', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Department/Budget code"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="2"
                  placeholder="Additional notes about the expense..."
                />
              </div>
            </div>
          </div>

          {/* ✅ ENHANCED: Expense Items Table */}
          {expenseCart.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Expense Cart ({expenseCart.length} items)</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">Item Details</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">QTY</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">Rate (Per)</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">Disc %</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">Disc Amt</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">GST %</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">GST Amt</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">Total</th>
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenseCart.map((item) => (
                      <tr key={item.id}>
                        <td className="border border-gray-300 px-3 py-2 text-xs">
                          <div className="font-medium">{item.itemName}</div>
                          {item.itemCode && (
                            <div className="text-gray-600 text-xs">Code: {item.itemCode}</div>
                          )}
                          {item.itemDescription && (
                            <div className="text-gray-600 text-xs mt-1">{item.itemDescription}</div>
                          )}
                          {item.description && (
                            <div className="text-gray-500 text-xs mt-1 italic">{item.description}</div>
                          )}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">{item.qty}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">₹{item.rate.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">{item.discountPercent.toFixed(2)}%</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs text-red-600">₹{item.discountAmount.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">{item.GSTPercent.toFixed(2)}%</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs text-blue-600">₹{item.GSTAmount.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs font-medium">₹{item.total.toFixed(2)}</td>
                        <td className="border border-gray-300 px-3 py-2 text-xs">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
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

          {/* Right Side Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div></div> {/* Empty space for left column */}
            
            <div className="space-y-4">
              {/* Discount and GST Method */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Discount and GST Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountGSTMethod"
                      value="total"
                      checked={formData.discountGSTMethod === 'total'}
                      onChange={(e) => handleInputChange('discountGSTMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">On Total</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountGSTMethod"
                      value="individual"
                      checked={formData.discountGSTMethod === 'individual'}
                      onChange={(e) => handleInputChange('discountGSTMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Individual Item</span>
                  </label>
                </div>
              </div>

              {/* Sub Total */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sub Total (Rs)</label>
                <input
                  type="text"
                  value={`₹${formData.subTotal}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
                  readOnly
                />
              </div>

              {/* Service Expense Account */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Service Expense Account</label>
                <select
                  value={formData.serviceExpenseAccount}
                  onChange={(e) => handleInputChange('serviceExpenseAccount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="General Service Expenses">General Service Expenses</option>
                  <option value="Repair & Maintenance">Repair & Maintenance</option>
                  <option value="Professional Services">Professional Services</option>
                  <option value="Consultation Fees">Consultation Fees</option>
                  <option value="Technical Services">Technical Services</option>
                  <option value="Outsourced Services">Outsourced Services</option>
                  <option value="Contract Services">Contract Services</option>
                  <option value="Other Service Expenses">Other Service Expenses</option>
                </select>
              </div>

              {/* Grand Total */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Grand Total (Rs)</label>
                <input
                  type="text"
                  value={`₹${formData.grandTotal}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100 font-medium text-lg"
                  readOnly
                />
              </div>

              {/* Paid and Due Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Paid Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.paidAmount}
                    onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Due Amount</label>
                  <input
                    type="text"
                    value={`₹${formData.dueAmount}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-100"
                    readOnly
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveServiceExpense}
                  disabled={expenseCart.length === 0 || !formData.supplierId || saving}
                  className="bg-orange-600 text-white px-6 py-2 rounded text-sm hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {isEditMode ? 'UPDATING...' : 'SAVING...'}
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      {isEditMode ? 'UPDATE SERVICE EXPENSE' : 'SAVE SERVICE EXPENSE'}
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="bg-orange-600 text-white px-6 py-2 rounded text-sm hover:bg-orange-700 transition-colors"
                >
                  {isEditMode ? 'CANCEL EDIT' : 'RESET'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Expense Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Service Expense Entry List ({filteredEntries.length} records)
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
                onClick={() => fetchExpenseEntries()}
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
                placeholder="Search by voucher number, supplier, status, or account..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <button 
                onClick={handleSearch}
                className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors"
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
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Approval Status</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Payment Status</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Grand Total</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Due Amount</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Account</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs font-medium text-orange-600">{entry.voucherNo}</td>
                      <td className="py-3 px-2 text-xs">{entry.supplier}</td>
                      <td className="py-3 px-2 text-xs">{entry.entryDate}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs ${
                            entry.approvalStatus === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : entry.approvalStatus === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {entry.approvalStatus}
                          </span>
                          {entry.approvalStatus === 'Pending' && (
                            <select
                              className="text-xs border rounded px-1 py-1"
                              onChange={(e) => handleStatusUpdate(entry, e.target.value)}
                              defaultValue=""
                            >
                              <option value="">Change Status</option>
                              <option value="Approved">Approve</option>
                              <option value="Rejected">Reject</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : entry.paymentStatus === 'Partial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : entry.paymentStatus === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
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
                      </td>
                      <td className="py-3 px-2 text-xs font-medium">{entry.grandTotal}</td>
                      <td className="py-3 px-2 text-xs">{entry.dueAmount}</td>
                      <td className="py-3 px-2 text-xs">{entry.serviceExpenseAccount}</td>
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
                    <td colSpan="10" className="text-center py-8 text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                          Loading expense entries...
                        </div>
                      ) : searchTerm ? (
                        'No matching records found'
                      ) : (
                        'No expense entries found'
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

      {/* ✅ UPDATED: Expense Details Modal without GST field */}
      {showExpenseDetails && selectedExpenseDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-orange-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Service Expense Details - {selectedExpenseDetails.voucherNo}
              </h3>
              <button
                onClick={() => setShowExpenseDetails(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              {/* Company Header */}
              <div className="text-center mb-6 border-b pb-4">
                <h2 className="text-xl font-bold text-orange-600">{companyInfo.name}</h2>
                <p className="text-sm text-gray-600">{companyInfo.address}</p>
                <p className="text-sm text-gray-600">GSTIN: {companyInfo.gstin} | Phone: {companyInfo.phone}</p>
              </div>

              {/* ✅ UPDATED: Supplier & Expense Info without GST field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Supplier Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedExpenseDetails.supplierName}</p>
                    <p><strong>Code:</strong> {selectedExpenseDetails.supplierCode || 'N/A'}</p>
                    {/* ✅ COMPLETELY REMOVED: GST field */}
                    <p><strong>Institution:</strong> {selectedExpenseDetails.institutionName || 'N/A'}</p>
                    <p><strong>Contact:</strong> {selectedExpenseDetails.contactNo || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedExpenseDetails.supplierEmail || 'N/A'}</p>
                    <p><strong>Address:</strong> {selectedExpenseDetails.supplierAddress || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Expense Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Entry Date:</strong> {formatDateForDisplay(selectedExpenseDetails.entryDate.split('T')[0])}</p>
                    <p><strong>Expense Type:</strong> {selectedExpenseDetails.expenseType}</p>
                    <p><strong>Expense Category:</strong> {selectedExpenseDetails.expenseCategory || 'N/A'}</p>
                    <p><strong>Priority:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedExpenseDetails.priority === 'Urgent'
                          ? 'bg-red-100 text-red-800'
                          : selectedExpenseDetails.priority === 'High'
                          ? 'bg-orange-100 text-orange-800'
                          : selectedExpenseDetails.priority === 'Medium'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedExpenseDetails.priority}
                      </span>
                    </p>
                    <p><strong>Approval Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs ${
                        selectedExpenseDetails.approvalStatus === 'Approved'
                          ? 'bg-green-100 text-green-800'
                          : selectedExpenseDetails.approvalStatus === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedExpenseDetails.approvalStatus}
                      </span>
                    </p>
                    {selectedExpenseDetails.approvedBy && (
                      <p><strong>Approved By:</strong> {selectedExpenseDetails.approvedBy}</p>
                    )}
                    {selectedExpenseDetails.approvalDate && (
                      <p><strong>Approval Date:</strong> {formatDateForDisplay(selectedExpenseDetails.approvalDate.split('T')[0])}</p>
                    )}
                    {selectedExpenseDetails.departmentBudget && (
                      <p><strong>Department Budget:</strong> {selectedExpenseDetails.departmentBudget}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Expense Items Table */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-700 mb-3">Expense Items</h4>
                <div className="overflow-x-auto border rounded">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Expense Item</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Qty</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Rate</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Disc %</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Disc Amt</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">GST %</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">GST Amt</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExpenseDetails.serviceExpenseItems.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-2 text-xs">
                            <div className="font-medium">{item.itemName}</div>
                            {item.itemCode && (
                              <div className="text-gray-600 text-xs">Code: {item.itemCode}</div>
                            )}
                            {item.itemDescription && (
                              <div className="text-gray-600 text-xs mt-1">{item.itemDescription}</div>
                            )}
                            {item.description && (
                              <div className="text-gray-500 text-xs mt-1 italic">{item.description}</div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-xs">{item.qty}</td>
                          <td className="px-3 py-2 text-xs">₹{item.rate.toFixed(2)}</td>
                          <td className="px-3 py-2 text-xs">{(item.discountPercent || 0).toFixed(2)}%</td>
                          <td className="px-3 py-2 text-xs text-red-600">₹{(item.discountAmount || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-xs">{(item.GSTPercent || 0).toFixed(2)}%</td>
                          <td className="px-3 py-2 text-xs text-blue-600">₹{(item.GSTAmount || 0).toFixed(2)}</td>
                          <td className="px-3 py-2 text-xs font-medium">₹{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedExpenseDetails.notes && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Notes</h4>
                  <div className="border rounded p-3">
                    <p className="text-sm text-gray-600">{selectedExpenseDetails.notes}</p>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bank Details */}
                <div className="border rounded p-4 bg-green-50">
                  <h4 className="font-semibold text-gray-700 mb-3">🏦 Bank Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Bank:</span>
                      <span>{companyInfo.bankName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Account:</span>
                      <span>{companyInfo.accountNo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Branch:</span>
                      <span>{companyInfo.branchCode}</span>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded p-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Expense Account:</span>
                      <span>{selectedExpenseDetails.serviceExpenseAccount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span>₹{selectedExpenseDetails.subTotal.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold">
                      <span>Grand Total:</span>
                      <span>₹{selectedExpenseDetails.grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Paid Amount:</span>
                      <span>₹{selectedExpenseDetails.paidAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>Due Amount:</span>
                      <span>₹{selectedExpenseDetails.dueAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedExpenseDetails.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : selectedExpenseDetails.paymentStatus === 'Partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedExpenseDetails.paymentStatus === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedExpenseDetails.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowExpenseDetails(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowExpenseDetails(false)
                    handleEdit({ id: selectedExpenseDetails._id })
                  }}
                  className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors"
                >
                  Edit Expense
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
