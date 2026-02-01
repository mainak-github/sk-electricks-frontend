'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function CustomerEntry() {
  const [formData, setFormData] = useState({
    customerName: '',
    profession: '',
    institutionName: '',
    address: '',
    contactNo: '',
    locationArea: '',
    expectation: '',
    emailAddress: '',
    initialConversation: '',
    partyType: '',
    employee: 'SOFT TASK',
    status: 'Pending',
    customerGST: '' // New field added
  })

  const [customerEntries, setCustomerEntries] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalEntries, setTotalEntries] = useState(0)
  const [editingId, setEditingId] = useState(null)

  // Fetch customers from backend
  const fetchCustomers = async (search = '', page = 1, limit = rowsPerPage) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      })
      
      const response = await fetch(`${config.API_URL}/customers?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setCustomerEntries(data.customers || [])
        setTotalEntries(data.total || 0)
      } else {
        console.error('Error fetching customers:', data.error)
        alert('Error fetching customers: ' + data.error)
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error: Unable to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers()
  }, [])

  // Refetch when page or search changes
  useEffect(() => {
    fetchCustomers(searchTerm, currentPage, rowsPerPage)
  }, [currentPage, rowsPerPage])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveCustomer = async () => {
    if (!formData.customerName.trim()) {
      alert('Please enter customer name')
      return
    }

    if (!formData.contactNo.trim()) {
      alert('Please enter contact number')
      return
    }

    setLoading(true)
    try {
      const url = editingId 
        ? `${config.API_URL}/customers/${editingId}` 
        : `${config.API_URL}/customers`
      
      const method = editingId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        alert(editingId ? 'Customer updated successfully!' : 'Customer created successfully!')
        handleReset()
        setEditingId(null)
        // Refresh the customer list
        fetchCustomers(searchTerm, currentPage, rowsPerPage)
      } else {
        alert('Error saving customer: ' + data.error)
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error: Unable to save customer')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      customerName: '',
      profession: '',
      institutionName: '',
      address: '',
      contactNo: '',
      locationArea: '',
      expectation: '',
      emailAddress: '',
      initialConversation: '',
      partyType: '',
      employee: 'SOFT TASK',
      status: 'Pending',
      customerGST: '' // Reset new field
    })
    setEditingId(null)
  }

  // Search functionality
  const handleSearch = () => {
    setCurrentPage(1) // Reset to first page when searching
    fetchCustomers(searchTerm, 1, rowsPerPage)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
    setCurrentPage(1)
    fetchCustomers('', 1, rowsPerPage)
  }

  // Edit customer
  const handleEditCustomer = async (id) => {
    try {
      const response = await fetch(`${config.API_URL}/customers/${id}`)
      const data = await response.json()
      
      if (response.ok) {
        setFormData({
          customerName: data.customerName || '',
          profession: data.profession || '',
          institutionName: data.institutionName || '',
          address: data.address || '',
          contactNo: data.contactNo || '',
          locationArea: data.locationArea || '',
          expectation: data.expectation || '',
          emailAddress: data.emailAddress || '',
          initialConversation: data.initialConversation || '',
          partyType: data.partyType || '',
          employee: data.employee || 'SOFT TASK',
          status: data.status || 'Pending',
          customerGST: data.customerGST || '' // Load new field
        })
        setEditingId(id)
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        alert('Error loading customer data: ' + data.error)
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error: Unable to load customer data')
    }
  }

  // Delete customer
  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${config.API_URL}/customers/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (response.ok) {
        alert('Customer deleted successfully!')
        // Refresh the customer list
        fetchCustomers(searchTerm, currentPage, rowsPerPage)
      } else {
        alert('Error deleting customer: ' + data.error)
      }
    } catch (error) {
      console.error('Network error:', error)
      alert('Network error: Unable to delete customer')
    } finally {
      setLoading(false)
    }
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Customer List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
          </style>
        </head>
        <body>
          <h1>Customer List</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Profession</th>
                <th>Contact No</th>
                <th>Address</th>
                <th>Location Area</th>
                <th>Customer GST</th>
                <th>Employee</th>
                <th>Initial Conversation</th>
                <th>Expectation %</th>
                <th>Status</th>
                <th>Party Type</th>
                <th>Email</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              ${customerEntries.map((entry) => `
                <tr>
                  <td>${entry.customerName || ''}</td>
                  <td>${entry.profession || ''}</td>
                  <td>${entry.contactNo || ''}</td>
                  <td>${entry.address || ''}</td>
                  <td>${entry.locationArea || ''}</td>
                  <td>${entry.customerGST || ''}</td>
                  <td>${entry.employee || ''}</td>
                  <td>${entry.initialConversation || ''}</td>
                  <td>${entry.expectation || ''}${entry.expectation ? '%' : ''}</td>
                  <td>${entry.status || ''}</td>
                  <td>${entry.partyType || ''}</td>
                  <td>${entry.emailAddress || ''}</td>
                  <td>${new Date(entry.createdAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
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
      ['Customer Name', 'Profession', 'Contact No', 'Address', 'Location Area', 'Customer GST', 'Employee', 'Initial Conversation', 'Expectation %', 'Status', 'Party Type', 'Email', 'Created Date'],
      ...customerEntries.map((entry) => [
        entry.customerName || '',
        entry.profession || '',
        entry.contactNo || '',
        entry.address || '',
        entry.locationArea || '',
        entry.customerGST || '',
        entry.employee || '',
        entry.initialConversation || '',
        entry.expectation ? `${entry.expectation}%` : '',
        entry.status || '',
        entry.partyType || '',
        entry.emailAddress || '',
        new Date(entry.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'customer_entries.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Pagination calculations
  const totalPages = Math.ceil(totalEntries / rowsPerPage)

  return (
    <div className="p-4">
      {/* Customer Entry Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">
            {editingId ? 'Edit Customer' : 'Customer Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* First Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Customer Name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.profession}
                onChange={(e) => handleInputChange('profession', e.target.value)}
                placeholder="Profession"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution Name</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.institutionName}
                onChange={(e) => handleInputChange('institutionName', e.target.value)}
                placeholder="Institution Name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Address"
              />
            </div>

            {/* Second Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact No *</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.contactNo}
                onChange={(e) => handleInputChange('contactNo', e.target.value)}
                placeholder="Contact No"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location/Area</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.locationArea}
                onChange={(e) => handleInputChange('locationArea', e.target.value)}
              >
                <option value="">Select Location/Area</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Pune">Pune</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Durgapur">Durgapur</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer GST</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.customerGST}
                onChange={(e) => handleInputChange('customerGST', e.target.value)}
                placeholder="Customer GST Number"
                maxLength="15"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expectation %</label>
              <input 
                type="number"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.expectation}
                onChange={(e) => handleInputChange('expectation', e.target.value)}
                placeholder="Expectation %"
                min="0"
                max="100"
              />
            </div>

            {/* Third Row */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail Address</label>
              <input 
                type="email"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                placeholder="E-mail Address"
              />
            </div>
          </div>

          {/* Fourth Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Initial Conversation</label>
              <textarea 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows="3"
                value={formData.initialConversation}
                onChange={(e) => handleInputChange('initialConversation', e.target.value)}
                placeholder="Initial Conversation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          {/* Party Type Radio Buttons */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Party Type</label>
            <div className="flex gap-6">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="partyType" 
                  value="Corporate"
                  checked={formData.partyType === 'Corporate'}
                  onChange={(e) => handleInputChange('partyType', e.target.value)}
                  className="mr-2"
                />
                Corporate
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="partyType" 
                  value="Retailer"
                  checked={formData.partyType === 'Retailer'}
                  onChange={(e) => handleInputChange('partyType', e.target.value)}
                  className="mr-2"
                />
                Retailer
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="partyType" 
                  value="WholeSaler"
                  checked={formData.partyType === 'WholeSaler'}
                  onChange={(e) => handleInputChange('partyType', e.target.value)}
                  className="mr-2"
                />
                WholeSaler
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="partyType" 
                  value="Distributor"
                  checked={formData.partyType === 'Distributor'}
                  onChange={(e) => handleInputChange('partyType', e.target.value)}
                  className="mr-2"
                />
                Distributor
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSaveCustomer}
              disabled={loading}
              className="bg-teal-600 text-white px-8 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              💾 {loading ? 'SAVING...' : (editingId ? 'UPDATE' : 'SAVE')}
            </button>
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-8 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
            >
              {editingId ? 'CANCEL' : 'RESET'}
            </button>
          </div>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Customer List ({totalEntries} total)</h3>
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
                onClick={() => fetchCustomers(searchTerm, currentPage, rowsPerPage)}
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
                placeholder="Search by customer name, profession, contact, GST, or area..."
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

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          )}

          {/* Table - Scrollable */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Customer Name</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Profession</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Contact No</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Address</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Area</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Customer GST</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Employee</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Expectation %</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Party Type</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Created Date</th>
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customerEntries.length > 0 ? (
                  customerEntries.map((entry) => (
                    <tr key={entry._id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 text-xs font-medium">{entry.customerName}</td>
                      <td className="py-2 px-2 text-xs">{entry.profession || '-'}</td>
                      <td className="py-2 px-2 text-xs">{entry.contactNo}</td>
                      <td className="py-2 px-2 text-xs">{entry.address || '-'}</td>
                      <td className="py-2 px-2 text-xs">{entry.locationArea || '-'}</td>
                      <td className="py-2 px-2 text-xs font-medium">{entry.customerGST || '-'}</td>
                      <td className="py-2 px-2 text-xs">{entry.employee}</td>
                      <td className="py-2 px-2 text-xs font-medium">
                        {entry.expectation ? `${entry.expectation}%` : '-'}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.status === 'Approved' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs">{entry.partyType || '-'}</td>
                      <td className="py-2 px-2 text-xs">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleEditCustomer(entry._id)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(entry._id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  !loading && (
                    <tr>
                      <td colSpan="12" className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No matching records found' : 'No customers available'}
                      </td>
                    </tr>
                  )
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
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>
                Page {currentPage} of {totalPages || 1} ({totalEntries} total)
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
