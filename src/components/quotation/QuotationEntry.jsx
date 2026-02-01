'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function QuotationEntry() {
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

  // API Configuration - Using quotations endpoints
  const API_BASE_URL = `${config.API_URL}/qoutations`
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

  // Generate quotation number
  const generateQuotationNo = () => {
    const prefix = 'QO'
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
    quotationNo: generateQuotationNo(),
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
    grandTotal: '0.00',
    transportCost: '0',
    // ✅ Service description fields
    serviceCategory: '',
    serviceDescription: '',
    projectDuration: '',
    scopeOfWork: [],
    compliance: 'ISI Standards',
    warrantyPeriod: '1 Year',
    paymentTerms: 'Payment terms as per agreement',
    deliveryTerms: '',
    specialInstructions: '',
    validUntil: '',
    // ✅ Service entry integration
    selectedServiceEntry: ''
  })

  const [quotationCart, setQuotationCart] = useState([])
  const [selectedItem, setSelectedItem] = useState(null)
  const [quotations, setQuotations] = useState([])
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])
  const [serviceEntries, setServiceEntries] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingQuotationId, setEditingQuotationId] = useState(null)
  const [showQuotationDetails, setShowQuotationDetails] = useState(false)
  const [selectedQuotationDetails, setSelectedQuotationDetails] = useState(null)

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
          emailAddress: customer.emailAddress || ''
        }))
        setCustomers(formattedCustomers)
        console.log('Customers loaded:', formattedCustomers.length)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      alert('Error fetching customers. Please try again.')
    }
  }

  const fetchQuotations = async (page = 1, limit = rowsPerPage, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}?page=${page}&limit=${limit}&search=${search}&sortBy=createdAt&sortOrder=desc`)
      const data = await response.json()
      
      if (data.success) {
        const formattedEntries = data.data.map(quotation => ({
          id: quotation._id,
          quotationNo: quotation.quotationNo,
          customer: quotation.customerName,
          entryDate: formatDateForDisplay(quotation.entryDate.split('T')[0]),
          status: quotation.status || 'Draft',
          serviceCategory: quotation.serviceCategory || 'General',
          grandTotal: `₹ ${(quotation.grandTotal || 0).toFixed(2)}`,
          validUntil: quotation.validUntil ? formatDateForDisplay(quotation.validUntil.split('T')[0]) : 'N/A',
          createdAt: new Date(quotation.createdAt).getTime(),
          rawData: quotation
        }))
        setQuotations(formattedEntries)
        setFilteredEntries(formattedEntries)
      }
    } catch (error) {
      console.error('Error fetching quotations:', error)
      alert('Error fetching quotations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ✅ Fetch service entries for auto-fill
  const fetchServiceEntries = async () => {
    try {
      setLoadingServices(true)
      const response = await fetch(`${INTEGRATION_API_URL}/services-entries?limit=1000&sortBy=createdAt&sortOrder=desc`)
      const data = await response.json()
      
      if (data.success) {
        const formattedServices = data.data.map(service => ({
          id: service._id,
          voucherNo: service.voucherNo,
          customerName: service.customerName,
          customerId: service.customerId,
          institutionName: service.institutionName || '',
          contactNo: service.contactNo || '',
          customerAddress: service.customerAddress || '',
          customerGST: service.customerGST || '',
          serviceCategory: service.serviceCategory || '',
          serviceDescription: service.serviceDescription || '',
          projectDuration: service.projectDuration || '',
          scopeOfWork: service.scopeOfWork || [],
          compliance: service.compliance || 'ISI Standards',
          warrantyPeriod: service.warrantyPeriod || '1 Year',
          serviceItems: service.serviceItems || [],
          assignedTechnician: service.assignedTechnician || '',
          estimatedHours: service.estimatedHours || 0,
          actualHours: service.actualHours || 0,
          workDescription: service.workDescription || ''
        }))
        setServiceEntries(formattedServices)
        console.log('Service entries loaded:', formattedServices.length)
      }
    } catch (error) {
      console.error('Error fetching service entries:', error)
    } finally {
      setLoadingServices(false)
    }
  }

  const fetchQuotationDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to fetch quotation details')
      }
    } catch (error) {
      console.error('Error fetching quotation details:', error)
      alert('Error fetching quotation details. Please try again.')
      return null
    }
  }

  // Save quotation
  const saveQuotation = async (quotationData) => {
    try {
      setSaving(true)
      const url = isEditMode 
        ? `${API_BASE_URL}/${editingQuotationId}` 
        : `${API_BASE_URL}`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quotationData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const action = isEditMode ? 'updated' : 'saved'
        alert(`✅ Quotation ${data.data.quotationNo} ${action} successfully!`)
        await fetchQuotations()
        return true
      } else {
        alert(data.message || `Error ${isEditMode ? 'updating' : 'saving'} quotation`)
        return false
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} quotation:`, error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} quotation. Please try again.`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const deleteQuotation = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Quotation deleted successfully!')
        await fetchQuotations()
      } else {
        alert(data.message || 'Error deleting quotation')
      }
    } catch (error) {
      console.error('Error deleting quotation:', error)
      alert('Error deleting quotation. Please try again.')
    }
  }

  // Load initial data
  useEffect(() => {
    fetchItems()
    fetchCustomers()
    fetchQuotations()
    fetchServiceEntries()
  }, [])

  useEffect(() => {
    handleSearch()
  }, [quotations])

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
      setSelectedItem(selectedItem)
      setFormData(prev => ({
        ...prev,
        searchItem: itemName,
        ratePerItem: selectedItem.rate.toString(),
        GSTPercent: selectedItem.taxPercent.toString(),
        itemDescription: selectedItem.description
      }))
    }
  }

  // ✅ Handle service entry selection for auto-fill
  const handleServiceEntrySelect = async (serviceId) => {
    if (!serviceId) {
      handleInputChange('selectedServiceEntry', '')
      return
    }

    try {
      const selectedService = serviceEntries.find(s => s.id === serviceId)
      
      if (!selectedService) {
        alert('Service entry not found')
        return
      }

      // Update selection
      handleInputChange('selectedServiceEntry', serviceId)
      
      // Auto-fill customer details
      if (selectedService.customerId) {
        handleInputChange('customerId', selectedService.customerId)
        handleInputChange('searchCustomer', selectedService.customerName)
      }
      handleInputChange('customerName', selectedService.customerName)
      handleInputChange('institutionName', selectedService.institutionName)
      handleInputChange('contactNo', selectedService.contactNo)
      handleInputChange('customerAddress', selectedService.customerAddress)
      handleInputChange('customerGST', selectedService.customerGST)
      
      // Auto-fill service description
      handleInputChange('serviceCategory', selectedService.serviceCategory)
      handleInputChange('serviceDescription', selectedService.serviceDescription)
      handleInputChange('projectDuration', selectedService.projectDuration)
      handleInputChange('scopeOfWork', selectedService.scopeOfWork)
      handleInputChange('compliance', selectedService.compliance)
      handleInputChange('warrantyPeriod', selectedService.warrantyPeriod)

      // Auto-fill narration
      let narration = ''
      if (selectedService.assignedTechnician) {
        narration = `Service by: ${selectedService.assignedTechnician}. `
      }
      if (selectedService.workDescription) {
        narration += selectedService.workDescription
      }
      handleInputChange('specialInstructions', narration)

      // Auto-add items to cart
      if (selectedService.serviceItems && selectedService.serviceItems.length > 0) {
        const cartItems = selectedService.serviceItems.map((item, index) => {
          const qty = item.qty || 1
          const rate = item.rate || 0
          const discount = item.discountAmount || 0
          const gst = item.GSTAmount || 0
          const subtotal = (qty * rate) - discount
          const total = subtotal + gst

          return {
            id: Date.now() + index,
            itemId: item.itemId || item._id,
            itemName: item.itemName,
            itemCode: item.itemCode || '',
            itemDescription: item.itemDescription || '',
            qty: qty,
            rate: rate,
            discount: discount,
            discountPercent: item.discountPercent || 0,
            discountAmount: discount,
            GST: gst,
            GSTPercent: item.GSTPercent || 0,
            GSTAmount: gst,
            total: total
          }
        })

        const existingItemIds = quotationCart.map(ci => ci.itemId)
        const newItems = cartItems.filter(item => !existingItemIds.includes(item.itemId))

        if (newItems.length > 0) {
          setQuotationCart(prev => [...prev, ...newItems])
          alert(`✅ Added ${newItems.length} items from service entry!`)
        }
      }

      alert('✅ Service details auto-filled successfully!')
    } catch (error) {
      console.error('Error loading service entry:', error)
      alert('Error loading service entry. Please try again.')
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

    const baseAmount = qty * rate
    const discountAmount = discount + (baseAmount * discountPercent / 100)
    const taxableAmount = baseAmount - discountAmount
    const gstAmount = GST + (taxableAmount * GSTPercent / 100)
    const total = taxableAmount + gstAmount

    const newItem = {
      id: Date.now(),
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemCode: selectedItem.code,
      itemDescription: formData.itemDescription || selectedItem.description,
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

    setQuotationCart(prev => [...prev, newItem])
    
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
      itemDescription: ''
    }))
  }

  const removeFromCart = (id) => {
    setQuotationCart(prev => prev.filter(item => item.id !== id))
  }

  const calculateSubTotal = () => {
    return quotationCart.reduce((sum, item) => sum + item.total, 0).toFixed(2)
  }

  const calculateGrandTotal = () => {
    const subTotal = parseFloat(calculateSubTotal())
    const transport = parseFloat(formData.transportCost) || 0
    return (subTotal + transport).toFixed(2)
  }

  useEffect(() => {
    const subTotal = calculateSubTotal()
    const grandTotal = calculateGrandTotal()
    
    setFormData(prev => ({
      ...prev,
      subTotal,
      grandTotal,
      total: calculateItemTotal()
    }))
  }, [quotationCart, formData.transportCost, formData.qty, formData.ratePerItem, formData.discount, formData.GST])

  const handleSave = async () => {
    if (quotationCart.length === 0) {
      alert('Please add at least one item to the quotation')
      return
    }

    if (!formData.customerName || !formData.customerId) {
      alert('Please select a customer')
      return
    }

    if (!formData.serviceCategory) {
      alert('Please select a service category')
      return
    }

    if (!formData.serviceDescription) {
      alert('Please provide service description')
      return
    }

    // Calculate valid until date (30 days from entry date)
    const entryDate = new Date(formData.entryDate)
    const validUntil = new Date(entryDate)
    validUntil.setDate(validUntil.getDate() + 30)

    const quotationData = {
      customerId: formData.customerId,
      customerName: formData.customerName,
      customerCode: formData.customerCode,
      customerGST: formData.customerGST,
      customerEmail: formData.customerEmail,
      institutionName: formData.institutionName,
      contactNo: formData.contactNo,
      customerAddress: formData.customerAddress,
      entryDate: new Date(formData.entryDate),
      items: quotationCart.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
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
      discountGSTMethod: formData.discountGSTMethod,
      subTotal: parseFloat(formData.subTotal) || 0,
      grandTotal: parseFloat(formData.grandTotal) || 0,
      transportCost: parseFloat(formData.transportCost) || 0,
      quotationNo: formData.quotationNo,
      validUntil: validUntil,
      // Service description fields
      serviceCategory: formData.serviceCategory,
      serviceDescription: formData.serviceDescription,
      projectDuration: formData.projectDuration,
      scopeOfWork: formData.scopeOfWork,
      compliance: formData.compliance,
      warrantyPeriod: formData.warrantyPeriod,
      paymentTerms: formData.paymentTerms,
      deliveryTerms: formData.deliveryTerms,
      specialInstructions: formData.specialInstructions,
      status: 'Draft'
    }

    const success = await saveQuotation(quotationData)
    
    if (success) {
      handleReset()
      setIsEditMode(false)
      setEditingQuotationId(null)
    }
  }

  const handleReset = () => {
    setQuotationCart([])
    setSelectedItem(null)
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
      quotationNo: generateQuotationNo(),
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
      grandTotal: '0.00',
      transportCost: '0',
      serviceCategory: '',
      serviceDescription: '',
      projectDuration: '',
      scopeOfWork: [],
      compliance: 'ISI Standards',
      warrantyPeriod: '1 Year',
      paymentTerms: 'Payment terms as per agreement',
      deliveryTerms: '',
      specialInstructions: '',
      validUntil: '',
      selectedServiceEntry: ''
    })
    setIsEditMode(false)
    setEditingQuotationId(null)
  }

  const handleEdit = async (quotation) => {
    try {
      const quotationDetails = await fetchQuotationDetails(quotation.id)
      if (!quotationDetails) return

      setFormData({
        searchItem: '',
        searchCustomer: quotationDetails.customerId,
        customerName: quotationDetails.customerName,
        customerId: quotationDetails.customerId,
        customerCode: quotationDetails.customerCode || '',
        customerGST: quotationDetails.customerGST || '',
        customerEmail: quotationDetails.customerEmail || '',
        institutionName: quotationDetails.institutionName || '',
        contactNo: quotationDetails.contactNo || '',
        customerAddress: quotationDetails.customerAddress || '',
        quotationNo: quotationDetails.quotationNo,
        entryDate: quotationDetails.entryDate.split('T')[0],
        discount: '0',
        discountPercent: '0',
        GST: '0',
        GSTPercent: '0',
        total: '',
        qty: '1',
        ratePerItem: '',
        itemDescription: '',
        subTotal: quotationDetails.subTotal.toString(),
        discountGSTMethod: quotationDetails.discountGSTMethod || 'individual',
        grandTotal: quotationDetails.grandTotal.toString(),
        transportCost: (quotationDetails.transportCost || 0).toString(),
        serviceCategory: quotationDetails.serviceCategory || '',
        serviceDescription: quotationDetails.serviceDescription || '',
        projectDuration: quotationDetails.projectDuration || '',
        scopeOfWork: quotationDetails.scopeOfWork || [],
        compliance: quotationDetails.compliance || 'ISI Standards',
        warrantyPeriod: quotationDetails.warrantyPeriod || '1 Year',
        paymentTerms: quotationDetails.paymentTerms || 'Payment terms as per agreement',
        deliveryTerms: quotationDetails.deliveryTerms || '',
        specialInstructions: quotationDetails.specialInstructions || '',
        validUntil: quotationDetails.validUntil ? quotationDetails.validUntil.split('T')[0] : '',
        selectedServiceEntry: ''
      })

      const cartItems = quotationDetails.items.map((item, index) => ({
        id: Date.now() + index,
        itemId: item.itemId,
        itemName: item.itemName,
        itemCode: item.itemCode || '',
        itemDescription: item.itemDescription || '',
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
      setQuotationCart(cartItems)

      setIsEditMode(true)
      setEditingQuotationId(quotation.id)
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('Error loading quotation for edit:', error)
      alert('Error loading quotation for editing. Please try again.')
    }
  }

  const handleViewDetails = async (quotation) => {
    try {
      const quotationDetails = await fetchQuotationDetails(quotation.id)
      if (quotationDetails) {
        setSelectedQuotationDetails(quotationDetails)
        setShowQuotationDetails(true)
      }
    } catch (error) {
      console.error('Error fetching quotation details:', error)
      alert('Error fetching quotation details. Please try again.')
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(quotations)
    } else {
      const filtered = quotations.filter(entry =>
        entry.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.quotationNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredEntries(filtered)
    }
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(quotations)
    setShowSearch(false)
    setCurrentPage(1)
  }

  const handleDeleteEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
      deleteQuotation(id)
    }
  }

  const handleExport = () => {
    const csvContent = [
      [`${companyInfo.name} - Quotation List`],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [],
      ['Quotation No', 'Customer', 'Entry Date', 'Service Category', 'Status', 'Valid Until', 'Grand Total'],
      ...filteredEntries.map(entry => [
        entry.quotationNo,
        entry.customer,
        entry.entryDate,
        entry.serviceCategory,
        entry.status,
        entry.validUntil,
        entry.grandTotal
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `quotations_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Quotation List</title>
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
            <div class="report-title">Quotation List</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredEntries.length}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Quotation No</th>
                <th>Customer</th>
                <th>Entry Date</th>
                <th>Service Category</th>
                <th>Status</th>
                <th>Valid Until</th>
                <th>Grand Total</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.quotationNo}</td>
                  <td>${entry.customer}</td>
                  <td>${entry.entryDate}</td>
                  <td>${entry.serviceCategory}</td>
                  <td>${entry.status}</td>
                  <td>${entry.validUntil}</td>
                  <td>${entry.grandTotal}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            Quotation Report - ${companyInfo.name} Management System
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📋</span>
            Quotation Entry Management
            {isEditMode && (
              <span className="text-sm bg-yellow-500 text-white px-3 py-1 rounded-full">
                Edit Mode
              </span>
            )}
          </h1>
          <p className="text-sm text-blue-50 mt-1">
            Professional quotation management with service descriptions
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

        {/* Main Form - Complete UI matching Service Entry structure */}
             {/* Main Form */}
        <div className="p-6">
          {/* Customer Selection */}
          <div className="mb-6">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Customer GST
                  </label>
                  <input
                    type="text"
                    value={formData.customerGST}
                    onChange={(e) => handleInputChange('customerGST', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
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
          </div>

          {/* Quotation Details */}
          <div className="mb-6">
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📄</span> Quotation Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quotation No
                  </label>
                  <input
                    type="text"
                    value={formData.quotationNo}
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
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => handleInputChange('validUntil', e.target.value)}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ✅ Service Entry Selection (Auto-fill) */}
          <div className="mb-6">
            <div className="border-2 border-purple-300 rounded-lg p-4 bg-purple-50">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔧</span> Load from Service Entry (Auto-fill)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Service Entry
                  </label>
                  <select
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    value={formData.selectedServiceEntry || ''}
                    onChange={(e) => handleServiceEntrySelect(e.target.value)}
                    disabled={loadingServices}
                  >
                    <option value="">-- Select Service Entry --</option>
                    {serviceEntries.map(service => (
                      <option key={service.id} value={service.id}>
                        {service.voucherNo} - {service.customerName} - {service.serviceCategory || 'General'} ({service.serviceItems?.length || 0} items)
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Auto-fills customer, service details, and items
                  </div>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => fetchServiceEntries()}
                    disabled={loadingServices}
                    className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {loadingServices ? '⏳ Loading...' : '🔄 Refresh Entries'}
                  </button>
                </div>
              </div>

              {formData.selectedServiceEntry && (
                <div className="mt-3 p-3 bg-white border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-700 font-semibold">
                    ✅ Details loaded from: {serviceEntries.find(s => s.id === formData.selectedServiceEntry)?.voucherNo}
                  </p>
                </div>
              )}

              {!loadingServices && serviceEntries.length === 0 && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">⚠️ No service entries found</p>
                </div>
              )}
            </div>
          </div>

          {/* Item Selection */}
          <div className="mb-6">
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔧</span> Add Service Item
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Item *
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
                    placeholder="Type to search item..."
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                  <datalist id="items">
                    {items.map(item => (
                      <option key={item.id} value={item.name}>
                        {item.code} - ₹{item.rate} - {item.description}
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
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                    min="0"
                    max="100"
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
                    GST (%)
                  </label>
                  <input
                    type="number"
                    value={formData.GSTPercent}
                    onChange={(e) => handleInputChange('GSTPercent', e.target.value)}
                    min="0"
                    max="100"
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

                <div className="lg:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Description
                  </label>
                  <textarea
                    value={formData.itemDescription}
                    onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                    placeholder="Describe the item or service..."
                    rows={2}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="lg:col-span-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <span className="text-xl">➕</span>
                    ADD TO QUOTATION CART
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quotation Cart Table */}
          <div className="mb-6">
            <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b-2 border-gray-300">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-2xl">🛒</span> Quotation Cart
                  {quotationCart.length > 0 && (
                    <span className="bg-teal-600 text-white text-sm px-3 py-1 rounded-full">
                      {quotationCart.length} items
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
                    {quotationCart.length > 0 ? (
                      quotationCart.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.itemName}</p>
                              <p className="text-xs text-gray-500">{item.itemCode}</p>
                              {item.itemDescription && (
                                <p className="text-xs text-gray-600 mt-1">{item.itemDescription}</p>
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
                            <p className="text-sm">Add items or load from service entry</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Service Description Section */}
          <div className="mb-6">
            <div className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span> Service Description & Scope of Work
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Category *
                  </label>
                  <select
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.serviceCategory || ''}
                    onChange={(e) => {
                      const category = e.target.value
                      handleInputChange('serviceCategory', category)
                      
                      const descriptions = {
                        'Electrical Installation': 'Complete electrical installation services including wiring, circuit breaker installation, electrical panel setup, lighting fixtures installation, switch and socket installation, and compliance with ISI electrical standards.',
                        'Maintenance & Repair': 'Comprehensive electrical maintenance and repair services including fault diagnosis, circuit repair, equipment servicing, preventive maintenance, emergency repairs, and electrical system optimization.',
                        'Industrial Solutions': 'Industrial electrical solutions including motor installation and maintenance, control panel fabrication, industrial wiring, power distribution, automation systems, and industrial equipment installation.',
                        'Commercial Projects': 'Commercial electrical projects including office electrical setup, retail store electrical systems, warehouse lighting, commercial HVAC electrical work, emergency lighting systems, and building management systems.',
                        'Residential Services': 'Residential electrical services including house wiring, home automation, ceiling fan installation, modular switch installation, lighting design, electrical safety inspection, and residential upgrades.',
                        'AMC & Contracts': 'Annual Maintenance Contract (AMC) services including scheduled preventive maintenance, emergency support, equipment inspection, spare parts supply, performance monitoring, and comprehensive electrical system care.',
                        'Solar & Renewable': 'Solar and renewable energy solutions including solar panel installation, solar inverter setup, grid-tied systems, off-grid systems, solar water heating, and renewable energy consulting.',
                        'Custom Solutions': 'Customized electrical solutions tailored to specific client requirements with detailed project planning, execution, and post-installation support.'
                      }
                      
                      if (descriptions[category] && !formData.serviceDescription) {
                        handleInputChange('serviceDescription', descriptions[category])
                      }
                    }}
                  >
                    <option value="">-- Select Service Category --</option>
                    <option value="Electrical Installation">⚡ Electrical Installation Services</option>
                    <option value="Maintenance & Repair">🔧 Maintenance & Repair Services</option>
                    <option value="Industrial Solutions">🏭 Industrial Electrical Solutions</option>
                    <option value="Commercial Projects">🏢 Commercial Projects</option>
                    <option value="Residential Services">🏠 Residential Services</option>
                    <option value="AMC & Contracts">📅 AMC & Service Contracts</option>
                    <option value="Solar & Renewable">☀️ Solar & Renewable Energy</option>
                    <option value="Custom Solutions">⚙️ Custom Solutions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Duration
                  </label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2-3 days, 1 week"
                    value={formData.projectDuration || ''}
                    onChange={(e) => handleInputChange('projectDuration', e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Service Description *
                </label>
                <textarea
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                  rows="6"
                  placeholder="Describe the electrical services to be provided..."
                  value={formData.serviceDescription || ''}
                  onChange={(e) => handleInputChange('serviceDescription', e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scope of Work:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    'Material Supply',
                    'Installation & Commissioning',
                    'Testing & Certification',
                    'Site Survey & Planning',
                    'Electrical Drawing/Layout',
                    'Wiring & Cable Laying',
                    'Panel Board Installation',
                    'Lighting Installation',
                    'Earthing & Safety Systems',
                    'Load Calculation',
                    'Quality Inspection',
                    'Post-Installation Support',
                    'Warranty Coverage',
                    'Training & Documentation',
                    'Compliance Certification',
                    'Emergency Support'
                  ].map(item => (
                    <label key={item} className="flex items-center text-sm hover:bg-blue-100 p-2 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.scopeOfWork?.includes(item) || false}
                        onChange={(e) => {
                          const currentScope = formData.scopeOfWork || []
                          const newScope = e.target.checked
                            ? [...currentScope, item]
                            : currentScope.filter(i => i !== item)
                          handleInputChange('scopeOfWork', newScope)
                        }}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compliance Standards
                  </label>
                  <select
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    value={formData.compliance || 'ISI Standards'}
                    onChange={(e) => handleInputChange('compliance', e.target.value)}
                  >
                    <option value="ISI Standards">ISI Standards Compliant</option>
                    <option value="IE Rules">As per IE Rules 1956</option>
                    <option value="National Electrical Code">National Electrical Code</option>
                    <option value="BIS Standards">BIS Standards</option>
                    <option value="Custom Standards">Custom Standards</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Warranty Period
                  </label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1 Year, 6 Months"
                    value={formData.warrantyPeriod || ''}
                    onChange={(e) => handleInputChange('warrantyPeriod', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Terms */}
          <div className="mb-6">
            <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Additional Terms & Conditions</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500"
                    value={formData.paymentTerms || ''}
                    onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                    placeholder="e.g., 50% advance, 50% on completion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Terms
                  </label>
                  <input
                    type="text"
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500"
                    value={formData.deliveryTerms || ''}
                    onChange={(e) => handleInputChange('deliveryTerms', e.target.value)}
                    placeholder="e.g., Within 7 days"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transport Cost (₹)
                </label>
                <input
                  type="number"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500"
                  value={formData.transportCost}
                  onChange={(e) => handleInputChange('transportCost', e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions / Notes
                </label>
                <textarea
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-500"
                  rows="3"
                  value={formData.specialInstructions || ''}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  placeholder="Any special instructions or additional notes..."
                />
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="mb-6">
            <div className="border-2 border-gray-300 rounded-lg p-6 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="grid grid-cols-2 gap-4 max-w-md ml-auto">
                <div className="text-right font-semibold text-gray-700">Sub Total:</div>
                <div className="text-right font-bold text-xl">₹{formData.subTotal}</div>
                
                <div className="text-right font-semibold text-gray-700">Transport Cost:</div>
                <div className="text-right font-semibold">₹{formData.transportCost}</div>
                
                <div className="text-right font-semibold text-lg text-gray-800 border-t-2 pt-2">GRAND TOTAL:</div>
                <div className="text-right font-bold text-3xl text-green-600 border-t-2 pt-2">₹{formData.grandTotal}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving || quotationCart.length === 0}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Saving...
                </span>
              ) : (
                <span>{isEditMode ? '✏️ UPDATE QUOTATION' : '💾 SAVE QUOTATION'}</span>
              )}
            </button>
            
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              🔄 RESET FORM
            </button>

            {isEditMode && (
              <button
                onClick={() => {
                  setIsEditMode(false)
                  setEditingQuotationId(null)
                  handleReset()
                }}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl transition-all"
              >
                ✖️ CANCEL EDIT
              </button>
            )}
          </div>
        </div>
      </div>

      
      {/* Quotation List Table */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">📊 Quotation Records</h2>
              <p className="text-sm text-gray-300 mt-1">
                Total: {filteredEntries.length} quotations
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                🔍 Search
              </button>
              <button
                onClick={handleExport}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                📤 Export
              </button>
              <button
                onClick={handlePrint}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search by quotation no, customer, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                Search
              </button>
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Table */}
          <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Quotation No</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Entry Date</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Service Category</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Valid Until</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Grand Total</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        <p className="text-gray-600 font-medium">Loading quotations...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-teal-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-blue-600">{entry.quotationNo}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-gray-900">{entry.customer}</p>
                          <p className="text-xs text-gray-500">{entry.rawData?.institutionName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">{entry.entryDate}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {entry.serviceCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          entry.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          entry.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                          entry.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          entry.status === 'Converted' ? 'bg-teal-100 text-teal-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm">{entry.validUntil}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-700">{entry.grandTotal}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(entry)}
                            className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                            title="View Details"
                          >
                            👁️ View
                          </button>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-orange-700 transition-colors"
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors"
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
                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-6xl">📋</span>
                        <p className="text-lg font-medium">No quotations found</p>
                        <p className="text-sm">Create your first quotation above</p>
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
                <option value="100">100</option>
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

      {/* Quotation Details Modal */}
      {showQuotationDetails && selectedQuotationDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold">📋 Quotation Details</h3>
                  <p className="text-sm text-teal-100 mt-1">
                    {selectedQuotationDetails.quotationNo} - {selectedQuotationDetails.customerName}
                  </p>
                </div>
                <button
                  onClick={() => setShowQuotationDetails(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold"
                >
                  ✖
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Company Header */}
              <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                <h2 className="text-3xl font-bold text-gray-800">{companyInfo.name}</h2>
                <p className="text-sm text-gray-600">{companyInfo.address}</p>
                <p className="text-sm text-gray-600">
                  GSTIN: {companyInfo.gstin} | Phone: {companyInfo.phone}
                </p>
              </div>

              {/* Quotation Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-gray-600">Quotation No</p>
                  <p className="font-bold text-blue-700">{selectedQuotationDetails.quotationNo}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Entry Date</p>
                  <p className="font-semibold">{formatDateForDisplay(selectedQuotationDetails.entryDate.split('T')[0])}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Valid Until</p>
                  <p className="font-semibold">{selectedQuotationDetails.validUntil ? formatDateForDisplay(selectedQuotationDetails.validUntil.split('T')[0]) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedQuotationDetails.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    selectedQuotationDetails.status === 'Sent' ? 'bg-blue-100 text-blue-700' :
                    selectedQuotationDetails.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {selectedQuotationDetails.status}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <h4 className="font-bold text-blue-900 mb-2">👤 Customer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 font-semibold">{selectedQuotationDetails.customerName}</span>
                  </div>
                  {selectedQuotationDetails.institutionName && (
                    <div>
                      <span className="text-gray-600">Institution:</span>
                      <span className="ml-2 font-semibold">{selectedQuotationDetails.institutionName}</span>
                    </div>
                  )}
                  {selectedQuotationDetails.contactNo && (
                    <div>
                      <span className="text-gray-600">Contact:</span>
                      <span className="ml-2 font-semibold">{selectedQuotationDetails.contactNo}</span>
                    </div>
                  )}
                  {selectedQuotationDetails.customerGST && (
                    <div>
                      <span className="text-gray-600">GSTIN:</span>
                      <span className="ml-2 font-semibold">{selectedQuotationDetails.customerGST}</span>
                    </div>
                  )}
                  {selectedQuotationDetails.customerAddress && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Address:</span>
                      <span className="ml-2 font-semibold">{selectedQuotationDetails.customerAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Description */}
              {selectedQuotationDetails.serviceCategory && (
                <div className="mb-6 p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                  <h4 className="font-bold text-purple-900 mb-2">📋 Service Description</h4>
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2 font-semibold">{selectedQuotationDetails.serviceCategory}</span>
                    </div>
                    {selectedQuotationDetails.projectDuration && (
                      <div>
                        <span className="text-gray-600">Duration:</span>
                        <span className="ml-2 font-semibold">{selectedQuotationDetails.projectDuration}</span>
                      </div>
                    )}
                    {selectedQuotationDetails.serviceDescription && (
                      <div>
                        <span className="text-gray-600">Description:</span>
                        <p className="mt-1 text-gray-700">{selectedQuotationDetails.serviceDescription}</p>
                      </div>
                    )}
                    {selectedQuotationDetails.scopeOfWork && selectedQuotationDetails.scopeOfWork.length > 0 && (
                      <div>
                        <span className="text-gray-600 font-semibold">Scope of Work:</span>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {selectedQuotationDetails.scopeOfWork.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs">
                              <span className="text-green-600">✓</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <span className="text-gray-600">Compliance:</span>
                        <span className="ml-2 font-semibold">{selectedQuotationDetails.compliance || 'ISI Standards'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Warranty:</span>
                        <span className="ml-2 font-semibold">{selectedQuotationDetails.warrantyPeriod || '1 Year'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-3">🔧 Service Items</h4>
                <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-gray-600 to-gray-800 text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Item Name</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Rate</th>
                        <th className="px-4 py-2 text-right">Discount</th>
                        <th className="px-4 py-2 text-right">GST</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedQuotationDetails.items.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium">{item.itemName}</p>
                              {item.itemDescription && (
                                <p className="text-xs text-gray-500">{item.itemDescription}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center font-semibold">{item.qty}</td>
                          <td className="px-4 py-2 text-right">₹{item.rate.toFixed(2)}</td>
                          <td className="px-4 py-2 text-right text-red-600">₹{item.discountAmount?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-2 text-right text-blue-600">₹{item.GSTAmount?.toFixed(2) || '0.00'}</td>
                          <td className="px-4 py-2 text-right font-bold text-green-700">₹{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-100 font-bold">
                      <tr>
                        <td colSpan="5" className="px-4 py-2 text-right">Sub Total:</td>
                        <td className="px-4 py-2 text-right text-lg">₹{selectedQuotationDetails.subTotal.toFixed(2)}</td>
                      </tr>
                      {selectedQuotationDetails.transportCost > 0 && (
                        <tr>
                          <td colSpan="5" className="px-4 py-2 text-right">Transport Cost:</td>
                          <td className="px-4 py-2 text-right">₹{selectedQuotationDetails.transportCost.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="bg-green-100">
                        <td colSpan="5" className="px-4 py-3 text-right text-lg">GRAND TOTAL:</td>
                        <td className="px-4 py-3 text-right text-2xl text-green-700">₹{selectedQuotationDetails.grandTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="mb-6 p-4 bg-gray-50 border rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3">📝 Terms & Conditions</h4>
                <div className="text-sm space-y-2 text-gray-700">
                  <p>1. {selectedQuotationDetails.paymentTerms || 'Payment terms as per agreement'}</p>
                  <p>2. This quotation is valid until {selectedQuotationDetails.validUntil ? formatDateForDisplay(selectedQuotationDetails.validUntil.split('T')[0]) : '30 days from date of issue'}</p>
                  <p>3. All prices are in Indian Rupees (₹)</p>
                  <p>4. Warranty: {selectedQuotationDetails.warrantyPeriod || '1 Year'}</p>
                  <p>5. Compliance: {selectedQuotationDetails.compliance || 'ISI Standards'}</p>
                  {selectedQuotationDetails.deliveryTerms && (
                    <p>6. Delivery: {selectedQuotationDetails.deliveryTerms}</p>
                  )}
                  {selectedQuotationDetails.specialInstructions && (
                    <p>7. Special Instructions: {selectedQuotationDetails.specialInstructions}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    const printContent = `
                      <html>
                        <head>
                          <title>Quotation - ${selectedQuotationDetails.quotationNo}</title>
                          <style>
                            body { font-family: Arial, sans-serif; margin: 20px; }
                            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
                            .company-name { font-size: 24px; font-weight: bold; }
                            .section { margin-bottom: 20px; }
                            .section-title { font-weight: bold; margin-bottom: 10px; background: #f0f0f0; padding: 5px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                            th { background-color: #f0f0f0; }
                            .text-right { text-align: right; }
                            .total-row { font-weight: bold; background-color: #f9f9f9; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div class="company-name">${companyInfo.name}</div>
                            <div>${companyInfo.address}</div>
                            <div>GSTIN: ${companyInfo.gstin} | Phone: ${companyInfo.phone}</div>
                          </div>

                          <div class="section">
                            <div class="section-title">QUOTATION</div>
                            <div>Quotation No: <strong>${selectedQuotationDetails.quotationNo}</strong></div>
                            <div>Date: <strong>${formatDateForDisplay(selectedQuotationDetails.entryDate.split('T')[0])}</strong></div>
                            <div>Valid Until: <strong>${selectedQuotationDetails.validUntil ? formatDateForDisplay(selectedQuotationDetails.validUntil.split('T')[0]) : 'N/A'}</strong></div>
                          </div>

                          <div class="section">
                            <div class="section-title">Customer Details</div>
                            <div><strong>${selectedQuotationDetails.customerName}</strong></div>
                            ${selectedQuotationDetails.institutionName ? `<div>${selectedQuotationDetails.institutionName}</div>` : ''}
                            ${selectedQuotationDetails.customerAddress ? `<div>${selectedQuotationDetails.customerAddress}</div>` : ''}
                            ${selectedQuotationDetails.contactNo ? `<div>Contact: ${selectedQuotationDetails.contactNo}</div>` : ''}
                            ${selectedQuotationDetails.customerGST ? `<div>GSTIN: ${selectedQuotationDetails.customerGST}</div>` : ''}
                          </div>

                          ${selectedQuotationDetails.serviceCategory ? `
                          <div class="section" style="background: #f8f9fa; padding: 15px; border-left: 4px solid #6366f1;">
                            <div style="font-weight: bold; margin-bottom: 10px;">SERVICE DESCRIPTION</div>
                            <div><strong>Category:</strong> ${selectedQuotationDetails.serviceCategory}</div>
                            ${selectedQuotationDetails.projectDuration ? `<div><strong>Duration:</strong> ${selectedQuotationDetails.projectDuration}</div>` : ''}
                            <div style="margin-top: 10px;">${selectedQuotationDetails.serviceDescription || ''}</div>
                            ${selectedQuotationDetails.scopeOfWork && selectedQuotationDetails.scopeOfWork.length > 0 ? `
                              <div style="margin-top: 10px;"><strong>Scope of Work:</strong>
                                <ul style="margin: 5px 0 0 20px;">
                                  ${selectedQuotationDetails.scopeOfWork.map(item => `<li>${item}</li>`).join('')}
                                </ul>
                              </div>
                            ` : ''}
                            <div style="margin-top: 10px;">
                              <strong>Compliance:</strong> ${selectedQuotationDetails.compliance || 'ISI Standards'} |
                              <strong>Warranty:</strong> ${selectedQuotationDetails.warrantyPeriod || '1 Year'}
                            </div>
                          </div>
                          ` : ''}

                          <div class="section">
                            <div class="section-title">Service Items</div>
                            <table>
                              <thead>
                                <tr>
                                  <th>Item Name</th>
                                  <th>Qty</th>
                                  <th class="text-right">Rate</th>
                                  <th class="text-right">Discount</th>
                                  <th class="text-right">GST</th>
                                  <th class="text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${selectedQuotationDetails.items.map(item => `
                                  <tr>
                                    <td>${item.itemName}</td>
                                    <td>${item.qty}</td>
                                    <td class="text-right">₹${item.rate.toFixed(2)}</td>
                                    <td class="text-right">₹${(item.discountAmount || 0).toFixed(2)}</td>
                                    <td class="text-right">₹${(item.GSTAmount || 0).toFixed(2)}</td>
                                    <td class="text-right">₹${item.total.toFixed(2)}</td>
                                  </tr>
                                `).join('')}
                                <tr class="total-row">
                                  <td colspan="5" class="text-right">Sub Total:</td>
                                  <td class="text-right">₹${selectedQuotationDetails.subTotal.toFixed(2)}</td>
                                </tr>
                                ${selectedQuotationDetails.transportCost > 0 ? `
                                  <tr>
                                    <td colspan="5" class="text-right">Transport:</td>
                                    <td class="text-right">₹${selectedQuotationDetails.transportCost.toFixed(2)}</td>
                                  </tr>
                                ` : ''}
                                <tr class="total-row">
                                  <td colspan="5" class="text-right">GRAND TOTAL:</td>
                                  <td class="text-right">₹${selectedQuotationDetails.grandTotal.toFixed(2)}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>

                          <div class="section">
                            <div class="section-title">Terms & Conditions</div>
                            <div>1. ${selectedQuotationDetails.paymentTerms || 'Payment terms as per agreement'}</div>
                            <div>2. This quotation is valid until ${selectedQuotationDetails.validUntil ? formatDateForDisplay(selectedQuotationDetails.validUntil.split('T')[0]) : '30 days from date'}</div>
                            <div>3. All prices are in Indian Rupees (₹)</div>
                            <div>4. Warranty: ${selectedQuotationDetails.warrantyPeriod || '1 Year'}</div>
                            <div>5. Compliance: ${selectedQuotationDetails.compliance || 'ISI Standards'}</div>
                          </div>

                          <div style="margin-top: 40px; text-align: right;">
                            <div style="margin-top: 50px;">
                              <div>Authorized Signatory</div>
                              <div style="font-weight: bold;">${companyInfo.name}</div>
                            </div>
                          </div>
                        </body>
                      </html>
                    `
                    const printWindow = window.open('', '_blank')
                    printWindow.document.write(printContent)
                    printWindow.document.close()
                    printWindow.print()
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-bold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg"
                >
                  🖨️ Print Quotation
                </button>
                <button
                  onClick={() => setShowQuotationDetails(false)}
                  className="flex-1 bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600 transition-all shadow-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

