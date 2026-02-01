'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function ServiceEntry() {
  // Company Information
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

  // API Configuration - Updated to use new routes
  const API_BASE_URL = `${config.API_URL}/services-entries`
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
    const prefix = 'SV'
    const timestamp = Date.now().toString().slice(-4)
    return `${prefix}${timestamp}`
  }

  const [formData, setFormData] = useState({
    searchItem: '',
    searchCustomer: '',
    customerName: 'General Customer',
    customerId: '',
    customerCode: '',
    customerGST: '',
    customerEmail: '',
    institutionName: '',
    contactNo: '',
    customerAddress: '',
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
    servicesAccount: 'General Services',
    grandTotal: '0.00',
    paidAmount: '0',
    dueAmount: '0',
    serviceType: 'One-time',
    priority: 'Medium',
    assignedTechnician: '',
    estimatedCompletionDate: '',
    serviceNotes: '',
    workDescription: '',
    serviceLocation: 'On-site',
    warrantyPeriod: '0',
    // ✅ NEW: Project-based fields
    projectPhase: 'Initiation',
    estimatedHours: '0',
    actualHours: '0'
  })

  const [serviceCart, setServiceCart] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [serviceEntries, setServiceEntries] = useState([])
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])

  // ✅ NEW: Progress tracking states
  const [progressMilestones, setProgressMilestones] = useState([])
  const [showMilestoneModal, setShowMilestoneModal] = useState(false)
  const [currentMilestone, setCurrentMilestone] = useState({
    milestoneName: '',
    description: '',
    targetDate: '',
    assignedTo: '',
    progress: 0,
    status: 'Not Started'
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [showServiceDetails, setShowServiceDetails] = useState(false)
  const [selectedServiceDetails, setSelectedServiceDetails] = useState(null)

  // ✅ NEW: Team members state
  const [teamMembers, setTeamMembers] = useState([])
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [currentTeamMember, setCurrentTeamMember] = useState({
    name: '',
    role: '',
    email: ''
  })

  // API Functions
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
          brand: item.brand || '',
          isServiceItem: item.isServiceItem || false
        }))
        setItems(formattedItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      alert('Error fetching items. Please try again.')
    }
  }

  const fetchCustomers = async (search = '') => {
    try {
      const response = await fetch(`${INTEGRATION_API_URL}/customers?search=${search}&limit=100`)
      const data = await response.json()
      
      let customersData = []
      if (data.data && Array.isArray(data.data)) {
        customersData = data.data
      } else if (data.customers && Array.isArray(data.customers)) {
        customersData = data.customers
      } else if (Array.isArray(data)) {
        customersData = data
      }

      if (customersData.length > 0) {
        const formattedCustomers = customersData.map(customer => ({
          id: customer._id,
          customerName: customer.customerName,
          customerCode: customer.customerCode || customer.debtorCode || '',
          gstNumber: customer.gstNumber || customer.customerGST || '',
          institutionName: customer.institutionName || customer.shopCompanyName || '',
          contactNo: customer.contactNo || '',
          address: customer.address || '',
          emailAddress: customer.emailAddress || '',
          openingDue: customer.openingDue || 0,
          isActive: customer.isActive
        }))
        setCustomers(formattedCustomers)
        console.log('Customers loaded:', formattedCustomers.length)
      } else {
        console.log('No customers found')
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      alert('Error fetching customers. Please try again.')
    }
  }

  const fetchServiceEntries = async (page = 1, limit = rowsPerPage, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}&search=${search}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedEntries = data.data.map(service => ({
          id: service._id,
          voucherNo: service.voucherNo,
          customer: service.customerName,
          entryDate: formatDateForDisplay(service.entryDate.split('T')[0]),
          serviceStatus: service.serviceStatus,
          paymentStatus: service.paymentStatus,
          priority: service.priority,
          grandTotal: `₹ ${(service.grandTotal || 0).toFixed(2)}`,
          paidAmount: `₹ ${(service.paidAmount || 0).toFixed(2)}`,
          dueAmount: `₹ ${(service.dueAmount || 0).toFixed(2)}`,
          assignedTechnician: service.assignedTechnician || 'Unassigned',
          overallProgress: service.overallProgress || 0,
          projectPhase: service.projectPhase || 'Initiation',
          createdAt: new Date(service.createdAt).getTime(),
          rawData: service
        }))
        setServiceEntries(formattedEntries)
        setFilteredEntries(formattedEntries)
      }
    } catch (error) {
      console.error('Error fetching service entries:', error)
      alert('Error fetching service entries. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchServiceDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to fetch service details')
      }
    } catch (error) {
      console.error('Error fetching service details:', error)
      alert('Error fetching service details. Please try again.')
      return null
    }
  }

  // ✅ NEW: Save with progress milestones
  const saveServiceEntry = async (serviceData) => {
    try {
      setSaving(true)
      const url = isEditMode 
        ? `${API_BASE_URL}/${editingServiceId}` 
        : `${API_BASE_URL}`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const action = isEditMode ? 'updated' : 'saved'
        alert(`✅ Service Entry ${data.data.voucherNo} ${action} successfully!`)
        await fetchServiceEntries()
        return true
      } else {
        alert(data.message || `Error ${isEditMode ? 'updating' : 'saving'} service entry`)
        return false
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} service entry:`, error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} service entry. Please try again.`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const deleteServiceEntry = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Service entry deleted successfully!')
        await fetchServiceEntries()
      } else {
        alert(data.message || 'Error deleting service entry')
      }
    } catch (error) {
      console.error('Error deleting service entry:', error)
      alert('Error deleting service entry. Please try again.')
    }
  }

  const updateServiceStatus = async (id, serviceStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/service-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Service status updated to ${serviceStatus} successfully!`)
        await fetchServiceEntries()
      } else {
        alert(data.message || 'Error updating service status')
      }
    } catch (error) {
      console.error('Error updating service status:', error)
      alert('Error updating service status. Please try again.')
    }
  }

  // Load initial data
  useEffect(() => {
    fetchItems()
    fetchCustomers()
    fetchServiceEntries()
  }, [])

  useEffect(() => {
    handleSearch()
  }, [serviceEntries])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCustomerSelect = (customerId) => {
    const selectedCustomer = customers.find(customer => customer.id === customerId)
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.customerName,
        customerCode: selectedCustomer.customerCode,
        customerGST: selectedCustomer.gstNumber,
        customerEmail: selectedCustomer.emailAddress,
        institutionName: selectedCustomer.institutionName,
        contactNo: selectedCustomer.contactNo,
        customerAddress: selectedCustomer.address
      }))
    }
  }

  const handleItemSelect = (itemName) => {
    const selectedItem = items.find(item => item.name === itemName)
    if (selectedItem) {
      setSelectedService(selectedItem)
      setFormData(prev => ({
        ...prev,
        searchItem: itemName,
        ratePerItem: selectedItem.serviceRate.toString(),
        GSTPercent: selectedItem.taxPercent.toString(),
        itemDescription: selectedItem.description
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

  const handleAddToCart = () => {
    if (!selectedService || !formData.ratePerItem || !formData.qty) {
      alert('Please select a service item and enter rate and quantity')
      return
    }

    const qty = parseFloat(formData.qty) || 1
    const rate = parseFloat(formData.ratePerItem) || 0
    const discount = parseFloat(formData.discount) || 0
    const discountPercent = parseFloat(formData.discountPercent) || 0
    const GST = parseFloat(formData.GST) || 0
    const GSTPercent = parseFloat(formData.GSTPercent) || 0

    const baseAmount = qty * rate
    const discountAmount = discount + (baseAmount * discountPercent / 100)
    const taxableAmount = baseAmount - discountAmount
    const gstAmount = GST + (taxableAmount * GSTPercent / 100)
    const total = taxableAmount + gstAmount

    const newServiceItem = {
      id: Date.now(),
      itemId: selectedService.id,
      itemName: selectedService.name,
      itemCode: selectedService.code,
      itemDescription: formData.itemDescription || selectedService.description,
      description: formData.workDescription || '',
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

    setServiceCart(prev => [...prev, newServiceItem])
    
    setSelectedService(null)
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
      workDescription: ''
    }))
  }

  const removeFromCart = (id) => {
    setServiceCart(prev => prev.filter(item => item.id !== id))
  }

  const calculateSubTotal = () => {
    return serviceCart.reduce((sum, item) => sum + item.total, 0).toFixed(2)
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
  }, [serviceCart, formData.paidAmount, formData.qty, formData.ratePerItem, formData.discount, formData.GST])

  // ✅ NEW: Milestone management functions
  const handleAddMilestone = () => {
    if (!currentMilestone.milestoneName) {
      alert('Please enter milestone name')
      return
    }

    setProgressMilestones(prev => [...prev, {
      ...currentMilestone,
      id: Date.now()
    }])

    setCurrentMilestone({
      milestoneName: '',
      description: '',
      targetDate: '',
      assignedTo: '',
      progress: 0,
      status: 'Not Started'
    })
    setShowMilestoneModal(false)
  }

  const handleRemoveMilestone = (id) => {
    setProgressMilestones(prev => prev.filter(m => m.id !== id))
  }

  // ✅ NEW: Team member management
  const handleAddTeamMember = () => {
    if (!currentTeamMember.name || !currentTeamMember.role) {
      alert('Please enter team member name and role')
      return
    }

    setTeamMembers(prev => [...prev, currentTeamMember])
    setCurrentTeamMember({ name: '', role: '', email: '' })
    setShowTeamModal(false)
  }

  const handleRemoveTeamMember = (index) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== index))
  }

  // ✅ UPDATED: Save with progress tracking
  const handleSave = async () => {
    if (serviceCart.length === 0) {
      alert('Please add at least one service item to the cart')
      return
    }

    if (!formData.customerName || !formData.customerId) {
      alert('Please select a customer')
      return
    }

    const serviceData = {
      customerId: formData.customerId,
      customerName: formData.customerName,
      customerCode: formData.customerCode,
      customerGST: formData.customerGST,
      customerEmail: formData.customerEmail,
      institutionName: formData.institutionName,
      contactNo: formData.contactNo,
      customerAddress: formData.customerAddress,
      entryDate: new Date(formData.entryDate),
      serviceItems: serviceCart.map(item => ({
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
      servicesAccount: formData.servicesAccount,
      serviceType: formData.serviceType,
      priority: formData.priority,
      assignedTechnician: formData.assignedTechnician,
      estimatedCompletionDate: formData.estimatedCompletionDate ? new Date(formData.estimatedCompletionDate) : null,
      serviceNotes: formData.serviceNotes,
      workDescription: formData.workDescription,
      serviceLocation: formData.serviceLocation,
      warrantyPeriod: parseFloat(formData.warrantyPeriod) || 0,
      voucherNo: formData.voucherNo,
      // ✅ NEW: Project-based fields
      projectPhase: formData.projectPhase,
      estimatedHours: parseFloat(formData.estimatedHours) || 0,
      actualHours: parseFloat(formData.actualHours) || 0,
      progressMilestones: progressMilestones,
      assignedTeam: teamMembers
    }

    const success = await saveServiceEntry(serviceData)
    
    if (success) {
      handleReset()
      setIsEditMode(false)
      setEditingServiceId(null)
    }
  }

  const handleReset = () => {
    setServiceCart([])
    setSelectedService(null)
    setProgressMilestones([])
    setTeamMembers([])
    setFormData({
      searchItem: '',
      searchCustomer: '',
      customerName: 'General Customer',
      customerId: '',
      customerCode: '',
      customerGST: '',
      customerEmail: '',
      institutionName: '',
      contactNo: '',
      customerAddress: '',
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
      servicesAccount: 'General Services',
      grandTotal: '0.00',
      paidAmount: '0',
      dueAmount: '0',
      serviceType: 'One-time',
      priority: 'Medium',
      assignedTechnician: '',
      estimatedCompletionDate: '',
      serviceNotes: '',
      workDescription: '',
      serviceLocation: 'On-site',
      warrantyPeriod: '0',
      projectPhase: 'Initiation',
      estimatedHours: '0',
      actualHours: '0'
    })
    setIsEditMode(false)
    setEditingServiceId(null)
  }

 const handleEdit = async (service) => {
    try {
      const serviceDetails = await fetchServiceDetails(service.id)
      if (!serviceDetails) return

      setFormData({
        searchItem: '',
        searchCustomer: serviceDetails.customerId,
        customerName: serviceDetails.customerName,
        customerId: serviceDetails.customerId,
        customerCode: serviceDetails.customerCode || '',
        customerGST: serviceDetails.customerGST || '',
        customerEmail: serviceDetails.customerEmail || '',
        institutionName: serviceDetails.institutionName || '',
        contactNo: serviceDetails.contactNo || '',
        customerAddress: serviceDetails.customerAddress || '',
        voucherNo: serviceDetails.voucherNo,
        entryDate: serviceDetails.entryDate.split('T')[0],
        discount: '0',
        discountPercent: '0',
        GST: '0',
        GSTPercent: '0',
        total: '',
        qty: '1',
        ratePerItem: '',
        itemDescription: '',
        subTotal: serviceDetails.subTotal.toString(),
        discountGSTMethod: serviceDetails.discountMethod || 'individual',
        servicesAccount: serviceDetails.servicesAccount || 'General Services',
        grandTotal: serviceDetails.grandTotal.toString(),
        paidAmount: serviceDetails.paidAmount.toString(),
        dueAmount: serviceDetails.dueAmount.toString(),
        serviceType: serviceDetails.serviceType || 'One-time',
        priority: serviceDetails.priority || 'Medium',
        assignedTechnician: serviceDetails.assignedTechnician || '',
        estimatedCompletionDate: serviceDetails.estimatedCompletionDate ? serviceDetails.estimatedCompletionDate.split('T')[0] : '',
        serviceNotes: serviceDetails.serviceNotes || '',
        workDescription: serviceDetails.workDescription || '',
        serviceLocation: serviceDetails.serviceLocation || 'On-site',
        warrantyPeriod: (serviceDetails.warrantyPeriod || 0).toString(),
        projectPhase: serviceDetails.projectPhase || 'Initiation',
        estimatedHours: (serviceDetails.estimatedHours || 0).toString(),
        actualHours: (serviceDetails.actualHours || 0).toString()
      })

      const cartItems = serviceDetails.serviceItems.map((item, index) => ({
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
      setServiceCart(cartItems)

      // ✅ NEW: Load progress milestones and team
      if (serviceDetails.progressMilestones) {
        setProgressMilestones(serviceDetails.progressMilestones.map((m, i) => ({
          ...m,
          id: Date.now() + i + 1000
        })))
      }

      if (serviceDetails.assignedTeam) {
        setTeamMembers(serviceDetails.assignedTeam)
      }

      setIsEditMode(true)
      setEditingServiceId(service.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('Error loading service for edit:', error)
      alert('Error loading service for editing. Please try again.')
    }
  }

  const handleViewDetails = async (service) => {
    try {
      const serviceDetails = await fetchServiceDetails(service.id)
      if (serviceDetails) {
        setSelectedServiceDetails(serviceDetails)
        setShowServiceDetails(true)
      }
    } catch (error) {
      console.error('Error fetching service details:', error)
      alert('Error fetching service details. Please try again.')
    }
  }

  const handleStatusUpdate = (service, newStatus) => {
    if (window.confirm(`Are you sure you want to change service status to ${newStatus}?`)) {
      updateServiceStatus(service.id, newStatus)
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(serviceEntries)
    } else {
      const filtered = serviceEntries.filter(entry =>
        entry.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.serviceStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.assignedTechnician.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(serviceEntries)
    setShowSearch(false)
    setCurrentPage(1)
  }

  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this service entry? This action cannot be undone.')) {
      deleteServiceEntry(id)
    }
  }

  const handleExport = () => {
    const csvContent = [
      [`${companyInfo.name} - Service Entry List`],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [],
      ['Voucher No', 'Customer', 'Entry Date', 'Service Status', 'Payment Status', 'Progress %', 'Grand Total', 'Due Amount', 'Technician'],
      ...filteredEntries.map(entry => [
        entry.voucherNo,
        entry.customer,
        entry.entryDate,
        entry.serviceStatus,
        entry.paymentStatus,
        entry.overallProgress || 0,
        entry.grandTotal,
        entry.dueAmount,
        entry.assignedTechnician
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `service_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Service Entry List</title>
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
            <div class="company-name">${companyInfo.name}</div>
            <div class="company-details">
              ${companyInfo.address}<br>
              GSTIN: ${companyInfo.gstin} | Phone: ${companyInfo.phone}
            </div>
            <div class="report-title">Service Entry List</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredEntries.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Customer</th>
                <th>Entry Date</th>
                <th>Service Status</th>
                <th>Progress</th>
                <th>Payment Status</th>
                <th>Grand Total</th>
                <th>Due Amount</th>
                <th>Technician</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.voucherNo}</td>
                  <td>${entry.customer}</td>
                  <td>${entry.entryDate}</td>
                  <td>${entry.serviceStatus}</td>
                  <td>${entry.overallProgress || 0}%</td>
                  <td>${entry.paymentStatus}</td>
                  <td>${entry.grandTotal}</td>
                  <td>${entry.dueAmount}</td>
                  <td>${entry.assignedTechnician}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Service Report - ${companyInfo.name} Management System
          </div>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

   // ... (Previous code continues from Part 1)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">🛠️</span>
            Service Entry Management
            {isEditMode && (
              <span className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-full">
                Edit Mode
              </span>
            )}
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            Project-based service management with progress tracking
          </p>
        </div>

        {/* Company Info Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-bold text-gray-700">{companyInfo.name}</span>
              <p className="text-gray-600 text-xs">{companyInfo.address}</p>
            </div>
            <div className="text-gray-600">
              <p className="text-xs">GSTIN: <span className="font-semibold">{companyInfo.gstin}</span></p>
              <p className="text-xs">Phone: <span className="font-semibold">{companyInfo.phone}</span></p>
            </div>
            <div className="text-gray-600">
              <p className="text-xs">Bank: <span className="font-semibold">{companyInfo.bankName}</span></p>
              <p className="text-xs">A/C: <span className="font-semibold">{companyInfo.accountNo}</span></p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Customer & Service Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Selection */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">👤</span> Customer Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Customer *
                    </label>
                    <input
                      type="text"
                      list="customers"
                      value={formData.searchCustomer}
                      onChange={(e) => {
                        handleInputChange('searchCustomer', e.target.value)
                        const selected = customers.find(c => c.customerName === e.target.value)
                        if (selected) handleCustomerSelect(selected.id)
                      }}
                      onFocus={() => fetchCustomers()}
                      placeholder="Type to search customer..."
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <datalist id="customers">
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.customerName}>
                          {customer.customerCode} - {customer.institutionName}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={formData.customerName}
                      readOnly
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 font-semibold text-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Name
                    </label>
                    <input
                      type="text"
                      value={formData.institutionName}
                      onChange={(e) => handleInputChange('institutionName', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact No
                    </label>
                    <input
                      type="text"
                      value={formData.contactNo}
                      onChange={(e) => handleInputChange('contactNo', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={formData.customerAddress}
                      onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                      rows={2}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Service Item Selection */}
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">🔧</span> Service Item Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Search Service Item *
                    </label>
                    <input
                      type="text"
                      list="items"
                      value={formData.searchItem}
                      onChange={(e) => {
                        handleInputChange('searchItem', e.target.value)
                        handleItemSelect(e.target.value)
                      }}
                      onFocus={() => fetchItems()}
                      placeholder="Type to search service..."
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <datalist id="items">
                      {items.map(item => (
                        <option key={item.id} value={item.name}>
                          {item.code} - ₹{item.serviceRate}/{item.unit}
                        </option>
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.qty}
                      onChange={(e) => handleInputChange('qty', e.target.value)}
                      min="1"
                      step="1"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rate per Item (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.ratePerItem}
                      onChange={(e) => handleInputChange('ratePerItem', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => handleInputChange('discount', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.GST}
                      onChange={(e) => handleInputChange('GST', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total (₹)
                    </label>
                    <input
                      type="text"
                      value={formData.total}
                      readOnly
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 font-bold text-green-700 text-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Description
                    </label>
                    <textarea
                      value={formData.workDescription}
                      onChange={(e) => handleInputChange('workDescription', e.target.value)}
                      placeholder="Describe the work to be done..."
                      rows={2}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      onClick={handleAddToCart}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <span className="text-xl">➕</span>
                      ADD TO SERVICE CART
                    </button>
                  </div>
                </div>
              </div>

              {/* Service Cart Table */}
              <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b-2 border-gray-300">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">🛒</span> Service Cart
                    {serviceCart.length > 0 && (
                      <span className="bg-teal-600 text-white text-sm px-3 py-1 rounded-full">
                        {serviceCart.length} items
                      </span>
                    )}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Item Name</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Qty</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Rate</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Discount</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">GST</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceCart.length > 0 ? (
                        serviceCart.map((item) => (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-gray-900">{item.itemName}</p>
                                <p className="text-xs text-gray-500">{item.itemCode}</p>
                                {item.description && (
                                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold">{item.qty}</td>
                            <td className="px-4 py-3 text-right">₹{item.rate.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-red-600">₹{item.discountAmount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right text-blue-600">₹{item.GSTAmount.toFixed(2)}</td>
                            <td className="px-4 py-3 text-right font-bold text-green-700">₹{item.total.toFixed(2)}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Remove"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center gap-3">
                              <span className="text-6xl">🛒</span>
                              <p className="text-lg font-medium">No items in cart</p>
                              <p className="text-sm">Add service items to get started</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ✅ NEW: Progress Milestones Section */}
              {/* <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                    <span className="text-2xl">🎯</span> Progress Milestones
                  </h3>
                  <button
                    onClick={() => setShowMilestoneModal(true)}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
                  >
                    ➕ Add Milestone
                  </button>
                </div>

                {progressMilestones.length > 0 ? (
                  <div className="space-y-3">
                    {progressMilestones.map((milestone) => (
                      <div key={milestone.id} className="bg-white border border-purple-200 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-semibold text-gray-800">{milestone.milestoneName}</h4>
                              <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                milestone.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                milestone.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                milestone.status === 'Delayed' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {milestone.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              {milestone.targetDate && (
                                <span>📅 Target: {formatDateForDisplay(milestone.targetDate)}</span>
                              )}
                              {milestone.assignedTo && (
                                <span>👤 {milestone.assignedTo}</span>
                              )}
                              <span className="font-semibold text-purple-600">Progress: {milestone.progress}%</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveMilestone(milestone.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                          >
                            ✖️
                          </button>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full transition-all"
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl">🎯</span>
                    <p className="mt-2">No milestones added yet</p>
                  </div>
                )}
              </div> */}

              {/* ✅ NEW: Team Assignment Section */}
              {/* <div className="bg-indigo-50 border-2 border-indigo-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-indigo-900 flex items-center gap-2">
                    <span className="text-2xl">👥</span> Team Assignment
                  </h3>
                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    ➕ Add Member
                  </button>
                </div>

                {teamMembers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="bg-white border border-indigo-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          {member.email && (
                            <p className="text-xs text-gray-500">{member.email}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveTeamMember(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          ✖️
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-4xl">👥</span>
                    <p className="mt-2">No team members assigned yet</p>
                  </div>
                )}
              </div> */}
            </div>

            {/* Right Column - Service Details & Summary */}
            <div className="space-y-6">
              {/* Service Entry Details */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">📄</span> Service Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Voucher No
                    </label>
                    <input
                      type="text"
                      value={formData.voucherNo}
                      readOnly
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-100 font-bold text-orange-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entry Date
                    </label>
                    <input
                      type="date"
                      value={formData.entryDate}
                      onChange={(e) => handleInputChange('entryDate', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Type
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => handleInputChange('serviceType', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="One-time">One-time</option>
                      <option value="Recurring">Recurring</option>
                      <option value="Contract">Contract</option>
                      <option value="Emergency">Emergency</option>
                      <option value="Project-Based">Project-Based</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority Level
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  {/* ✅ NEW: Project Phase */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Phase
                    </label>
                    <select
                      value={formData.projectPhase}
                      onChange={(e) => handleInputChange('projectPhase', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="Initiation">Initiation</option>
                      <option value="Planning">Planning</option>
                      <option value="Execution">Execution</option>
                      <option value="Monitoring">Monitoring</option>
                      <option value="Closure">Closure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Location
                    </label>
                    <select
                      value={formData.serviceLocation}
                      onChange={(e) => handleInputChange('serviceLocation', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="On-site">On-site</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Remote">Remote</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Technician
                    </label>
                    <input
                      type="text"
                      value={formData.assignedTechnician}
                      onChange={(e) => handleInputChange('assignedTechnician', e.target.value)}
                      placeholder="Enter technician name..."
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Completion Date
                    </label>
                    <input
                      type="date"
                      value={formData.estimatedCompletionDate}
                      onChange={(e) => handleInputChange('estimatedCompletionDate', e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* ✅ NEW: Time Tracking */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Est. Hours
                      </label>
                      <input
                        type="number"
                        value={formData.estimatedHours}
                        onChange={(e) => handleInputChange('estimatedHours', e.target.value)}
                        min="0"
                        step="0.5"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Actual Hours
                      </label>
                      <input
                        type="number"
                        value={formData.actualHours}
                        onChange={(e) => handleInputChange('actualHours', e.target.value)}
                        min="0"
                        step="0.5"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Period (months)
                    </label>
                    <input
                      type="number"
                      value={formData.warrantyPeriod}
                      onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                      min="0"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Notes
                    </label>
                    <textarea
                      value={formData.serviceNotes}
                      onChange={(e) => handleInputChange('serviceNotes', e.target.value)}
                      placeholder="Additional notes..."
                      rows={3}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-teal-50 border-2 border-teal-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span> Payment Summary
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-teal-200">
                    <span className="text-gray-700 font-medium">Sub Total:</span>
                    <span className="text-lg font-bold text-gray-900">₹ {formData.subTotal}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 border-b-2 border-teal-400">
                    <span className="text-gray-700 font-bold text-lg">Grand Total:</span>
                    <span className="text-2xl font-bold text-teal-700">₹ {formData.grandTotal}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paid Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={formData.paidAmount}
                      onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="flex justify-between items-center py-3 bg-red-100 rounded-lg px-4">
                    <span className="text-red-700 font-bold">Due Amount:</span>
                    <span className="text-2xl font-bold text-red-700">₹ {formData.dueAmount}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleSave}
                  disabled={saving || serviceCart.length === 0}
                  className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      SAVING...
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">{isEditMode ? '✏️' : '💾'}</span>
                      {isEditMode ? 'UPDATE SERVICE' : 'SAVE SERVICE'}
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-lg font-bold hover:from-gray-600 hover:to-gray-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                >
                  🔄 RESET
                </button>

                {isEditMode && (
                  <button
                    onClick={() => {
                      setIsEditMode(false)
                      setEditingServiceId(null)
                      handleReset()
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-bold hover:from-orange-600 hover:to-red-600 transition-all"
                  >
                    ✖️ CANCEL EDIT
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Entries List */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">📋</span> Service Entry Records
          </h2>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              All Services ({filteredEntries.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Search"
              >
                🔍
              </button>
              <button
                onClick={handleExport}
                className="p-2 border-2 border-gray-300 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
                title="Export to CSV"
              >
                📤
              </button>
              <button
                onClick={handlePrint}
                className="p-2 border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                title="Print"
              >
                🖨️
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by customer, voucher, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleSearch}
                className="bg-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-700"
              >
                Search
              </button>
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          )}

          <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-700 to-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Voucher</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Progress</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Payment</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Due</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        <p className="text-gray-600 font-medium">Loading services...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentEntries.length > 0 ? (
                  currentEntries.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-blue-600">{service.voucherNo}</td>
                      <td className="px-4 py-3">{service.customer}</td>
                      <td className="px-4 py-3 text-sm">{service.entryDate}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-semibold text-purple-600">
                            {service.overallProgress}%
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-purple-600 h-2 rounded-full"
                              style={{ width: `${service.overallProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          service.serviceStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                          service.serviceStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          service.serviceStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          service.serviceStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {service.serviceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          service.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                          service.paymentStatus === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                          service.paymentStatus === 'Overdue' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {service.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{service.grandTotal}</td>
                      <td className="px-4 py-3 text-right font-semibold text-red-700">{service.dueAmount}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(service)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-2 rounded-lg"
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-orange-600 hover:text-orange-800 hover:bg-orange-50 p-2 rounded-lg"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(service.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg"
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
                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-6xl">📋</span>
                        <p className="text-lg font-medium">No service entries found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border-2 border-gray-300 rounded-lg px-3 py-1"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {filteredEntries.length === 0
                  ? '0-0 of 0'
                  : `${startIndex + 1}-${Math.min(endIndex, filteredEntries.length)} of ${filteredEntries.length}`
                }
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  ⏮
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  ◀
                </button>
                <span className="px-4 py-1 bg-teal-50 border-2 border-teal-300 rounded-lg font-semibold">
                  {currentPage} / {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  ▶
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  ⏭
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold">Add Progress Milestone</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Milestone Name *
                </label>
                <input
                  type="text"
                  value={currentMilestone.milestoneName}
                  onChange={(e) => setCurrentMilestone({...currentMilestone, milestoneName: e.target.value})}
                  placeholder="e.g., Design Phase Complete"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={currentMilestone.description}
                  onChange={(e) => setCurrentMilestone({...currentMilestone, description: e.target.value})}
                  placeholder="Describe this milestone..."
                  rows={3}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={currentMilestone.targetDate}
                    onChange={(e) => setCurrentMilestone({...currentMilestone, targetDate: e.target.value})}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assigned To
                  </label>
                  <input
                    type="text"
                    value={currentMilestone.assignedTo}
                    onChange={(e) => setCurrentMilestone({...currentMilestone, assignedTo: e.target.value})}
                    placeholder="Person/Team name"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={currentMilestone.status}
                    onChange={(e) => setCurrentMilestone({...currentMilestone, status: e.target.value})}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress (%)
                  </label>
                  <input
                    type="number"
                    value={currentMilestone.progress}
                    onChange={(e) => setCurrentMilestone({...currentMilestone, progress: Math.min(100, Math.max(0, Number(e.target.value)))})}
                    min="0"
                    max="100"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddMilestone}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700"
                >
                  ✅ Add Milestone
                </button>
                <button
                  onClick={() => {
                    setShowMilestoneModal(false)
                    setCurrentMilestone({
                      milestoneName: '',
                      description: '',
                      targetDate: '',
                      assignedTo: '',
                      progress: 0,
                      status: 'Not Started'
                    })
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full">
            <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold">Add Team Member</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Member Name *
                </label>
                <input
                  type="text"
                  value={currentTeamMember.name}
                  onChange={(e) => setCurrentTeamMember({...currentTeamMember, name: e.target.value})}
                  placeholder="Enter name"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <input
                  type="text"
                  value={currentTeamMember.role}
                  onChange={(e) => setCurrentTeamMember({...currentTeamMember, role: e.target.value})}
                  placeholder="e.g., Lead Technician, Assistant"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={currentTeamMember.email}
                  onChange={(e) => setCurrentTeamMember({...currentTeamMember, email: e.target.value})}
                  placeholder="email@example.com"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddTeamMember}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  ✅ Add Member
                </button>
                <button
                  onClick={() => {
                    setShowTeamModal(false)
                    setCurrentTeamMember({ name: '', role: '', email: '' })
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Details Modal */}
      {showServiceDetails && selectedServiceDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-2xl font-bold">Service Details - {selectedServiceDetails.voucherNo}</h3>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-bold text-blue-900 mb-3 text-lg">👤 Customer Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="font-semibold">Name:</span> {selectedServiceDetails.customerName}</div>
                  <div><span className="font-semibold">Code:</span> {selectedServiceDetails.customerCode}</div>
                  <div><span className="font-semibold">Contact:</span> {selectedServiceDetails.contactNo}</div>
                  <div><span className="font-semibold">Email:</span> {selectedServiceDetails.customerEmail}</div>
                  <div className="col-span-2"><span className="font-semibold">Address:</span> {selectedServiceDetails.customerAddress}</div>
                </div>
              </div>

              {/* Service Info */}
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-bold text-green-900 mb-3 text-lg">🔧 Service Information</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="font-semibold">Type:</span> {selectedServiceDetails.serviceType}</div>
                  <div><span className="font-semibold">Priority:</span> {selectedServiceDetails.priority}</div>
                  <div><span className="font-semibold">Status:</span> {selectedServiceDetails.serviceStatus}</div>
                  <div><span className="font-semibold">Phase:</span> {selectedServiceDetails.projectPhase}</div>
                  <div><span className="font-semibold">Progress:</span> {selectedServiceDetails.overallProgress}%</div>
                  <div><span className="font-semibold">Location:</span> {selectedServiceDetails.serviceLocation}</div>
                  <div><span className="font-semibold">Technician:</span> {selectedServiceDetails.assignedTechnician || 'Unassigned'}</div>
                  <div><span className="font-semibold">Est. Hours:</span> {selectedServiceDetails.estimatedHours}h</div>
                </div>
              </div>

              {/* Service Items */}
              <div>
                <h4 className="font-bold text-gray-900 mb-3 text-lg">📦 Service Items</h4>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 text-left">Item</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Rate</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedServiceDetails.serviceItems?.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-3 py-2">{item.itemName}</td>
                          <td className="px-3 py-2 text-center">{item.qty}</td>
                          <td className="px-3 py-2 text-right">₹{item.rate}</td>
                          <td className="px-3 py-2 text-right font-semibold">₹{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Progress Milestones */}
              {selectedServiceDetails.progressMilestones?.length > 0 && (
                <div>
                  <h4 className="font-bold text-purple-900 mb-3 text-lg">🎯 Progress Milestones</h4>
                  <div className="space-y-2">
                    {selectedServiceDetails.progressMilestones.map((milestone, index) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{milestone.milestoneName}</span>
                          <span className="text-sm bg-purple-200 px-2 py-1 rounded">{milestone.status}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${milestone.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          Progress: {milestone.progress}% | {milestone.assignedTo}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className="bg-teal-50 rounded-lg p-4">
                <h4 className="font-bold text-teal-900 mb-3 text-lg">💰 Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sub Total:</span>
                    <span className="font-semibold">₹{selectedServiceDetails.subTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-teal-300 pt-2">
                    <span>Grand Total:</span>
                    <span className="text-teal-700">₹{selectedServiceDetails.grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700">
                    <span>Paid Amount:</span>
                    <span className="font-semibold">₹{selectedServiceDetails.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-red-700 font-bold">
                    <span>Due Amount:</span>
                    <span>₹{selectedServiceDetails.dueAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowServiceDetails(false)
                  setSelectedServiceDetails(null)
                }}
                className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

