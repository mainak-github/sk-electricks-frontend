'use client'

import { useState } from 'react'
import { Edit2, Trash2, Search, Download, Printer } from 'lucide-react'

export default function CustomerEntry() {
  const [formData, setFormData] = useState({
    code: '',
    customerName: '',
    openingDue: '0',
    institutionName: '',
    address: '',
    contactNo: '',
    location: '',
    emailAddress: '',
    creditLimit: '0',
    customerType: 'Retailer'
  })

  const [customers, setCustomers] = useState([
    {
      id: 1,
      code: 'CUS-181',
      customerName: 'New Navra',
      type: 'wholesaler',
      institution: '',
      address: '',
      contactNo: '',
      area: '',
      openingDue: '0',
      entryBy: 'SOFT TASK',
      creditLimit: '0'
    },
    {
      id: 2,
      code: 'CUS-178',
      customerName: 'MEGA TELaaa',
      type: 'retailer',
      institution: '',
      address: 'SYLHET',
      contactNo: '01715343714',
      area: '',
      openingDue: '0',
      entryBy: 'SOFT TASK',
      creditLimit: '50000'
    },
    {
      id: 3,
      code: 'CUS-172',
      customerName: 'Akash',
      type: 'retailer',
      institution: '',
      address: '',
      contactNo: '',
      area: 'baghdad',
      openingDue: '0',
      entryBy: 'SOFT TASK',
      creditLimit: '0'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState(customers)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingId, setEditingId] = useState(null)

  const customerTypes = ['Retailer', 'WholeSaler', 'Distributor', 'Corporate']

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = () => {
    if (!formData.customerName.trim()) {
      alert('Customer Name is required')
      return
    }

    if (editingId) {
      // Update existing customer
      const updatedCustomers = customers.map(customer => 
        customer.id === editingId 
          ? {
              ...customer,
              customerName: formData.customerName,
              type: formData.customerType.toLowerCase(),
              institution: formData.institutionName,
              address: formData.address,
              contactNo: formData.contactNo,
              area: formData.location,
              openingDue: formData.openingDue,
              creditLimit: formData.creditLimit
            }
          : customer
      )
      setCustomers(updatedCustomers)
      setFilteredCustomers(updatedCustomers)
      setEditingId(null)
      alert('Customer updated successfully!')
    } else {
      // Add new customer
      const newCustomer = {
        id: customers.length + 1,
        code: `CUS-${(180 + customers.length + 1).toString()}`,
        customerName: formData.customerName,
        type: formData.customerType.toLowerCase(),
        institution: formData.institutionName,
        address: formData.address,
        contactNo: formData.contactNo,
        area: formData.location,
        openingDue: formData.openingDue,
        entryBy: 'SOFT TASK',
        creditLimit: formData.creditLimit
      }

      const updatedCustomers = [...customers, newCustomer]
      setCustomers(updatedCustomers)
      setFilteredCustomers(updatedCustomers)
      alert('Customer saved successfully!')
    }

    // Reset form
    setFormData({
      code: '',
      customerName: '',
      openingDue: '0',
      institutionName: '',
      address: '',
      contactNo: '',
      location: '',
      emailAddress: '',
      creditLimit: '0',
      customerType: 'Retailer'
    })
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers)
    } else {
      const filtered = customers.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contactNo.includes(searchTerm) ||
        customer.area.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCustomers(filtered)
    }
    setCurrentPage(1)
  }

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredCustomers(customers)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Delete customer
  const handleDeleteCustomer = (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      const updatedCustomers = customers.filter(customer => customer.id !== id)
      setCustomers(updatedCustomers)
      setFilteredCustomers(updatedCustomers.filter(customer =>
        searchTerm.trim() === '' || 
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.institution.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.contactNo.includes(searchTerm) ||
        customer.area.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    }
  }

  // Edit customer
  const handleEditCustomer = (customer) => {
    setFormData({
      code: customer.code,
      customerName: customer.customerName,
      openingDue: customer.openingDue,
      institutionName: customer.institution,
      address: customer.address,
      contactNo: customer.contactNo,
      location: customer.area,
      emailAddress: '',
      creditLimit: customer.creditLimit,
      customerType: customer.type.charAt(0).toUpperCase() + customer.type.slice(1)
    })
    setEditingId(customer.id)
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null)
    setFormData({
      code: '',
      customerName: '',
      openingDue: '0',
      institutionName: '',
      address: '',
      contactNo: '',
      location: '',
      emailAddress: '',
      creditLimit: '0',
      customerType: 'Retailer'
    })
  }

  // Export to CSV
  const handleExport = () => {
    const headers = ['SL', 'Customer Name', 'Code', 'Type', 'Institution', 'Address', 'Contact No', 'Area', 'Opening Due', 'Entry By', 'Credit Limit']
    const csvData = filteredCustomers.map((customer, index) => [
      index + 1,
      customer.customerName,
      customer.code,
      customer.type,
      customer.institution,
      customer.address,
      customer.contactNo,
      customer.area,
      customer.openingDue,
      customer.entryBy,
      customer.creditLimit
    ])

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'customer_list.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Print functionality
  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Customer List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0d9488; }
            .print-info { text-align: center; margin-bottom: 20px; color: #666; }
          </style>
        </head>
        <body>
          <h1>Customer List</h1>
          <div class="print-info">Generated on ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Customer Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>Institution</th>
                <th>Address</th>
                <th>Contact No</th>
                <th>Area</th>
                <th>Opening Due</th>
                <th>Entry By</th>
                <th>Credit Limit</th>
              </tr>
            </thead>
            <tbody>
              ${filteredCustomers.map((customer, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${customer.customerName}</td>
                  <td>${customer.code}</td>
                  <td>${customer.type}</td>
                  <td>${customer.institution}</td>
                  <td>${customer.address}</td>
                  <td>${customer.contactNo}</td>
                  <td>${customer.area}</td>
                  <td>${customer.openingDue}</td>
                  <td>${customer.entryBy}</td>
                  <td>${customer.creditLimit}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex)

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Customer Entry Form */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">
            {editingId ? 'Edit Customer' : 'Customer Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Code</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                placeholder="Auto-generated"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Customer Name</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Opening Due</label>
              <input 
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.openingDue}
                onChange={(e) => handleInputChange('openingDue', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Institution Name</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.institutionName}
                onChange={(e) => handleInputChange('institutionName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Address</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Contact No</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.contactNo}
                onChange={(e) => handleInputChange('contactNo', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Location/ Area</label>
              <div className="relative">
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 text-lg">+</div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">E-mail Address</label>
              <input 
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Credit Limit</label>
              <input 
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.creditLimit}
                onChange={(e) => handleInputChange('creditLimit', e.target.value)}
              />
            </div>
          </div>

          {/* Customer Type */}
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-3">Customer Type</label>
            <div className="flex gap-6">
              {customerTypes.map(type => (
                <label key={type} className="flex items-center gap-2">
                  <input 
                    type="radio"
                    name="customerType"
                    value={type}
                    checked={formData.customerType === type}
                    onChange={(e) => handleInputChange('customerType', e.target.value)}
                    className="text-teal-600"
                  />
                  <span className="text-sm text-gray-700">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSave}
              className="bg-teal-600 text-white px-8 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              💾 {editingId ? 'UPDATE' : 'SAVE'}
            </button>
            {editingId && (
              <button 
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-8 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                CANCEL
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Customer List</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 border rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                title="Search"
              >
                <Search size={16} />
              </button>
              <button 
                onClick={handleExport}
                className="p-2 border rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                title="Export to CSV"
              >
                <Download size={16} />
              </button>
              <button 
                onClick={handlePrint}
                className="p-2 border rounded hover:bg-gray-50 transition-colors flex items-center gap-1"
                title="Print"
              >
                <Printer size={16} />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by name, code, type, institution, address, contact, or area..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
            <div className="min-w-full">
              <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>SL</div>
                <div>Customer Name</div>
                <div>Code</div>
                <div>Type</div>
                <div>Institution</div>
                <div>Address</div>
                <div>Contact No</div>
                <div>Area</div>
                <div>Opening Due</div>
                <div>Entry By</div>
                <div>Credit Limit</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {currentCustomers.length > 0 ? (
                currentCustomers.map((customer, index) => (
                  <div key={customer.id} className="grid grid-cols-12 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{startIndex + index + 1}</div>
                    <div className="font-medium">{customer.customerName}</div>
                    <div>{customer.code}</div>
                    <div>{customer.type}</div>
                    <div>{customer.institution}</div>
                    <div>{customer.address}</div>
                    <div>{customer.contactNo}</div>
                    <div>{customer.area}</div>
                    <div>{customer.openingDue}</div>
                    <div>{customer.entryBy}</div>
                    <div>{customer.creditLimit}</div>
                    <div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditCustomer(customer)}
                          className="text-teal-600 hover:text-teal-800 p-1 rounded hover:bg-teal-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No matching customers found' : 'No customers found'}
                </div>
              )}
            </div>
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
                {filteredCustomers.length === 0 
                  ? '0-0 of 0' 
                  : `${startIndex + 1}-${Math.min(endIndex, filteredCustomers.length)} of ${filteredCustomers.length}`
                }
              </span>
              <div className="flex gap-1">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}