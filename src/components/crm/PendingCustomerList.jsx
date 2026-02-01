'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function PendingCustomerList() {
  const [showTable, setShowTable] = useState(false)
  const [filterType, setFilterType] = useState('All')
  const [pendingCustomers, setPendingCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  })

  // Fetch pending customers from API with partyType filter
  const fetchPendingCustomers = async (page = 1, search = '', filter = filterType) => {
    setLoading(true)
    setError(null)
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(filter && filter !== 'All' && { filterType: filter })
      })

      const response = await fetch(`${config.API_URL}/customers/pending?${queryParams}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Map API response to component format
      const formattedCustomers = data.customers.map((customer, index) => ({
        id: customer._id,
        sl: ((page - 1) * pagination.limit) + index + 1,
        customerName: customer.customerName || '',
        contactNo: customer.contactNo || '',
        profession: customer.profession || '',
        address: customer.address || '',
        area: customer.locationArea || customer.area || '',
        expectationPercent: customer.expectationPercent || '',
        emailAddress: customer.emailAddress || customer.email || '',
        partyType: customer.partyType || '',
        date: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short', 
          year: 'numeric'
        }) : 'Invalid date',
        conversation: customer.conversation || '',
        status: customer.status || 'pending'
      }))

      setPendingCustomers(formattedCustomers)
      setPagination(prev => ({
        ...prev,
        page: data.page,
        total: data.total
      }))
      
    } catch (err) {
      setError(err.message)
      console.error('Error fetching pending customers:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle filter type change
  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType)
    if (showTable) {
      // Re-fetch data with new filter
      fetchPendingCustomers(1, '', newFilterType)
    }
  }

  const handleGetList = () => {
    setShowTable(true)
    fetchPendingCustomers(1, '', filterType)
  }

  // Handle status updates (Approve/Reject)
  const handleStatusUpdate = async (customerId, customerName, newStatus, rejectionReason = '') => {
    try {
      setLoading(true)
      
      const response = await fetch(`${config.API_URL}/customers/${customerId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'rejected' && rejectionReason && { rejectionReason })
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      alert(`Customer "${customerName}" has been ${newStatus}`)
      
      // Refresh the list after status update with current filter
      fetchPendingCustomers(pagination.page, '', filterType)
      
    } catch (err) {
      alert(`Error updating customer status: ${err.message}`)
      console.error('Error updating status:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = (action, customerId, customerName) => {
    if (action === 'Approve') {
      if (confirm(`Are you sure you want to approve "${customerName}"?`)) {
        handleStatusUpdate(customerId, customerName, 'approved')
      }
    } else if (action === 'Reject') {
      const reason = prompt(`Enter rejection reason for "${customerName}":`)
      if (reason !== null) { // User didn't cancel
        handleStatusUpdate(customerId, customerName, 'rejected', reason)
      }
    } else {
      // For Add/View conversation actions
      alert(`${action} action clicked for customer: ${customerName}`)
    }
  }

  // Pagination handlers
  const handlePageChange = (newPage) => {
    fetchPendingCustomers(newPage, '', filterType)
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Pending Customer List</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
          </style>
        </head>
        <body>
          <h1>Pending Customer List</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Filter Type: ${filterType}</p>
          <p>Total Customers: ${pagination.total}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Customer Name</th>
                <th>Contact No</th>
                <th>Profession</th>
                <th>Party Type</th>
                <th>Address</th>
                <th>Area</th>
                <th>Expectation %</th>
                <th>E-mail Address</th>
                <th>Date</th>
                <th>Conversation</th>
              </tr>
            </thead>
            <tbody>
              ${pendingCustomers.map((customer) => `
                <tr>
                  <td>${customer.sl}</td>
                  <td>${customer.customerName}</td>
                  <td>${customer.contactNo}</td>
                  <td>${customer.profession}</td>
                  <td>${customer.partyType}</td>
                  <td>${customer.address}</td>
                  <td>${customer.area}</td>
                  <td>${customer.expectationPercent}${customer.expectationPercent ? '%' : ''}</td>
                  <td>${customer.emailAddress}</td>
                  <td>${customer.date}</td>
                  <td>${customer.conversation}</td>
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

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">Pending Customer List</h2>
          <span className="text-sm bg-teal-700 px-3 py-1 rounded">Fatullah Factory</span>
        </div>
        
        <div className="p-6">
          {/* Filter and Get List Section */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter Type</label>
              <select 
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-32"
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Corporate">Corporate</option>
                <option value="Retailer">Retailer</option>
                <option value="WholeSaler">WholeSaler</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            
            <button 
              onClick={handleGetList}
              disabled={loading}
              className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳' : '🔍'} {loading ? 'LOADING...' : 'GET LIST'}
            </button>

            <button 
              onClick={handlePrint}
              disabled={!showTable || pendingCustomers.length === 0}
              className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Print"
            >
              🖨️
            </button>
          </div>

          {/* Active Filter Display */}
          {showTable && filterType !== 'All' && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <span className="text-sm text-blue-700">
                <strong>Active Filter:</strong> {filterType} customers
                <button 
                  onClick={() => handleFilterChange('All')}
                  className="ml-2 text-blue-600 underline hover:text-blue-800"
                >
                  Clear Filter
                </button>
              </span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-gray-600">Loading pending customers...</p>
            </div>
          )}

          {/* Table Section */}
          {showTable && !loading && !error && (
            <>
              {pendingCustomers.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No pending customers found{filterType !== 'All' ? ` for ${filterType}` : ''}.</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="mb-4 text-sm text-gray-600">
                    Showing {pendingCustomers.length} of {pagination.total} pending customers
                    {filterType !== 'All' && ` (${filterType} only)`}
                  </div>

                  <div className="overflow-x-auto max-w-full">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">SL</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Customer Name</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Contact No</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Profession</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Party Type</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Address</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Area</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Expectation %</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">E-mail Address</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Date</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Conversation Add/View</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Approve</th>
                          <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Reject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingCustomers.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 text-xs">{customer.sl}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs font-medium">{customer.customerName}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">{customer.contactNo}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">{customer.profession}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                customer.partyType === 'Corporate' ? 'bg-blue-100 text-blue-800' :
                                customer.partyType === 'Retailer' ? 'bg-green-100 text-green-800' :
                                customer.partyType === 'WholeSaler' ? 'bg-purple-100 text-purple-800' :
                                customer.partyType === 'Distributor' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {customer.partyType}
                              </span>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">{customer.address}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">{customer.area}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              {customer.expectationPercent ? `${customer.expectationPercent}%` : ''}
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">{customer.emailAddress}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">{customer.date}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleAction('Add', customer.id, customer.customerName)}
                                  className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors"
                                >
                                  Add
                                </button>
                                <button 
                                  onClick={() => handleAction('View', customer.id, customer.customerName)}
                                  className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                                >
                                  View
                                </button>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              <button 
                                onClick={() => handleAction('Approve', customer.id, customer.customerName)}
                                disabled={loading}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Approve
                              </button>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-xs">
                              <button 
                                onClick={() => handleAction('Reject', customer.id, customer.customerName)}
                                disabled={loading}
                                className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {pagination.total > pagination.limit && (
                    <div className="mt-6 flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page <= 1 || loading}
                          className="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit) || loading}
                          className="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {!showTable && !loading && (
            <div className="text-center py-12 text-gray-500">
              <p>Click "GET LIST" to display pending customers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
