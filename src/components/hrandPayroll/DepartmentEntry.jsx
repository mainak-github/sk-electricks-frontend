'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

const API_BASE_URL = `${config.API_URL}/depertment`

const departmentAPI = {
  createDepartment: async (data) => {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  getDepartments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`${API_BASE_URL}?${queryString}`)
    return response.json()
  },

  updateDepartment: async (id, data) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  deleteDepartment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: 'DELETE' })
    return response.json()
  },

  getDepartmentStats: async () => {
    const response = await fetch(`${API_BASE_URL}/stats`)
    return response.json()
  },

  exportDepartments: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const response = await fetch(`${API_BASE_URL}/export/csv?${queryString}`)
    return response
  },

  restoreDepartment: async (id) => {
    const response = await fetch(`${API_BASE_URL}/${id}/restore`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    })
    return response.json()
  },

  bulkDelete: async (ids) => {
    const response = await fetch(`${API_BASE_URL}/bulk-delete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    })
    return response.json()
  }
}

export default function DepartmentEntry() {
  const [formData, setFormData] = useState({ departmentName: '', description: '' })
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [showInactive, setShowInactive] = useState(false)
  const [selectedDepts, setSelectedDepts] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [stats, setStats] = useState({})
  const [sortBy, setSortBy] = useState('departmentName')
  const [sortOrder, setSortOrder] = useState('asc')
  const itemsPerPage = 10

  useEffect(() => {
    fetchDepartments()
    fetchStats()
  }, [currentPage, searchTerm, showInactive, sortBy, sortOrder])

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  async function fetchDepartments() {
    try {
      setLoading(true)
      setError(null)
      
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        isActive: showInactive ? 'all' : 'true',
        sortBy,
        sortOrder,
        ...(searchTerm.trim() && { search: searchTerm.trim() })
      }
      
      console.log('Fetching with params:', params) // Debug log
      
      const result = await departmentAPI.getDepartments(params)
      console.log('API Response:', result) // Debug log
      
      if (result.success) {
        setDepartments(result.data || [])
        if (result.pagination) {
          setTotalPages(result.pagination.totalPages || 0)
          setTotalCount(result.pagination.totalCount || 0)
        }
      } else {
        setError(result.message || 'Failed to load departments')
        setDepartments([])
      }
    } catch (err) {
      console.error('Fetch error:', err)
      setError('Failed to connect to server. Please check your connection.')
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchStats() {
    try {
      const result = await departmentAPI.getDepartmentStats()
      if (result.success) {
        setStats(result.data || {})
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  function showSuccessMessage(message) {
    setSuccess(message)
    setError(null)
  }

  function showErrorMessage(message) {
    setError(message)
    setSuccess(null)
  }

  async function saveDepartment() {
    if (!formData.departmentName.trim()) {
      showErrorMessage('Department name is required')
      return
    }

    try {
      setLoading(true)
      const result = await departmentAPI.createDepartment({
        departmentName: formData.departmentName.trim(),
        description: formData.description.trim() || undefined
      })
      
      if (result.success) {
        setFormData({ departmentName: '', description: '' })
        setCurrentPage(1)
        fetchDepartments()
        fetchStats()
        showSuccessMessage('Department created successfully!')
      } else {
        showErrorMessage(result.message || 'Error creating department')
      }
    } catch (err) {
      showErrorMessage('Error creating department. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function startEdit(dept) {
    setEditingDept({ ...dept })
  }

  function handleEditChange(e) {
    const { name, value } = e.target
    setEditingDept(prev => ({ ...prev, [name]: value }))
  }

  async function updateDepartment() {
    if (!editingDept.departmentName.trim()) {
      showErrorMessage('Department name is required')
      return
    }

    try {
      setLoading(true)
      const result = await departmentAPI.updateDepartment(editingDept._id, {
        departmentName: editingDept.departmentName.trim(),
        description: editingDept.description?.trim() || undefined
      })
      
      if (result.success) {
        setEditingDept(null)
        fetchDepartments()
        fetchStats()
        showSuccessMessage('Department updated successfully!')
      } else {
        showErrorMessage(result.message || 'Error updating department')
      }
    } catch (err) {
      showErrorMessage('Error updating department. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function deleteDepartment(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}" department?`)) return

    try {
      setLoading(true)
      const result = await departmentAPI.deleteDepartment(id)
      
      if (result.success) {
        fetchDepartments()
        fetchStats()
        showSuccessMessage('Department deleted successfully')
      } else {
        showErrorMessage(result.message || 'Error deleting department')
      }
    } catch (err) {
      showErrorMessage('Error deleting department. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function restoreDepartment(id, name) {
    if (!window.confirm(`Are you sure you want to restore "${name}" department?`)) return

    try {
      setLoading(true)
      const result = await departmentAPI.restoreDepartment(id)
      
      if (result.success) {
        fetchDepartments()
        fetchStats()
        showSuccessMessage('Department restored successfully')
      } else {
        showErrorMessage(result.message || 'Error restoring department')
      }
    } catch (err) {
      showErrorMessage('Error restoring department. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleBulkDelete() {
    if (selectedDepts.length === 0) {
      showErrorMessage('Please select departments to delete')
      return
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedDepts.length} selected department(s)?`)) return

    try {
      setLoading(true)
      const result = await departmentAPI.bulkDelete(selectedDepts)
      
      if (result.success) {
        setSelectedDepts([])
        setShowBulkActions(false)
        fetchDepartments()
        fetchStats()
        showSuccessMessage(`${result.data.modifiedCount} department(s) deleted successfully`)
      } else {
        showErrorMessage(result.message || 'Error deleting departments')
      }
    } catch (err) {
      showErrorMessage('Error deleting departments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function exportDepartments() {
    try {
      setLoading(true)
      const response = await departmentAPI.exportDepartments({ 
        isActive: showInactive ? 'all' : 'true' 
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `departments_${new Date().getTime()}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        showSuccessMessage('Departments exported successfully!')
      } else {
        showErrorMessage('Error exporting departments')
      }
    } catch (err) {
      showErrorMessage('Error exporting departments. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function changePage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page)
    }
  }

  function handleSort(column) {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  function toggleSelectAll() {
    if (selectedDepts.length === departments.length) {
      setSelectedDepts([])
    } else {
      setSelectedDepts(departments.map(d => d._id))
    }
  }

  function toggleSelectDept(id) {
    setSelectedDepts(prev => 
      prev.includes(id) 
        ? prev.filter(dId => dId !== id)
        : [...prev, id]
    )
  }

  // Helper function to get page numbers for pagination
  function getPageNumbers() {
    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    
    return pages
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Department Management</h1>
          <p className="text-gray-600">Manage your organization's departments</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Departments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDepartments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDepartments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <div className="w-6 h-6 bg-red-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inactiveDepartments || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEmployeeCount || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✓</span>
              {success}
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-600 hover:text-green-800">✕</button>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠</span>
              {error}
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Add New Department</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    name="departmentName"
                    placeholder="e.g., Human Resources"
                    value={formData.departmentName}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Brief description of the department..."
                    value={formData.description}
                    onChange={handleChange}
                    disabled={loading}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <button
                  onClick={saveDepartment}
                  disabled={loading || !formData.departmentName.trim()}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">+</span>
                      Create Department
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Department List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* List Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <h3 className="text-lg font-semibold text-gray-900">Departments</h3>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Search Toggle */}
                    <button 
                      onClick={() => setShowSearch(!showSearch)}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                    >
                      <span className="mr-1">🔍</span>
                      Search
                    </button>
                    
                    {/* Show Inactive Toggle */}
                    <button 
                      onClick={() => {
                        setShowInactive(!showInactive)
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1 border rounded-md flex items-center ${
                        showInactive 
                          ? 'bg-red-100 border-red-300 text-red-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-1">{showInactive ? '👁️' : '👁️‍🗨️'}</span>
                      {showInactive ? 'All' : 'Active Only'}
                    </button>
                    
                    {/* Export Button */}
                    <button 
                      onClick={exportDepartments}
                      disabled={loading}
                      className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 flex items-center"
                    >
                      <span className="mr-1">📥</span>
                      Export CSV
                    </button>
                    
                    {/* Bulk Actions Toggle */}
                    <button 
                      onClick={() => setShowBulkActions(!showBulkActions)}
                      className={`px-3 py-1 border rounded-md flex items-center ${
                        showBulkActions 
                          ? 'bg-orange-100 border-orange-300 text-orange-700' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-1">⚡</span>
                      Bulk Actions
                    </button>
                  </div>
                </div>
                
                {/* Search Bar */}
                {showSearch && (
                  <div className="mt-4 flex gap-2">
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && fetchDepartments()}
                      placeholder="Search by name or description..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button 
                      onClick={() => {
                        setSearchTerm('')
                        setCurrentPage(1)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Clear
                    </button>
                  </div>
                )}
                
                {/* Bulk Actions Bar */}
                {showBulkActions && (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedDepts.length === departments.length && departments.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-orange-700">
                          {selectedDepts.length} selected
                        </span>
                      </div>
                      <button 
                        onClick={handleBulkDelete}
                        disabled={selectedDepts.length === 0 || loading}
                        className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Delete Selected
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {showBulkActions && (
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedDepts.length === departments.length && departments.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-gray-300"
                          />
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SL
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('departmentName')}
                      >
                        <div className="flex items-center">
                          Department Name
                          {sortBy === 'departmentName' && (
                            <span className="ml-1">
                              {sortOrder === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading && (
                      <tr>
                        <td colSpan={showBulkActions ? "6" : "5"} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                            Loading departments...
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {!loading && departments.length === 0 && (
                      <tr>
                        <td colSpan={showBulkActions ? "6" : "5"} className="px-6 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <div className="text-4xl mb-2">📂</div>
                            <div className="text-lg font-medium mb-1">No departments found</div>
                            <div className="text-sm">
                              {searchTerm ? 'Try adjusting your search criteria' : 'Create your first department to get started'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    
                    {!loading && departments.map((dept) => (
                      <tr key={dept._id} className="hover:bg-gray-50">
                        {showBulkActions && (
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedDepts.includes(dept._id)}
                              onChange={() => toggleSelectDept(dept._id)}
                              className="rounded border-gray-300"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {dept.sl}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{dept.departmentName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {dept.description ? (
                              <span title={dept.description}>
                                {dept.description.length > 50 
                                  ? `${dept.description.substring(0, 50)}...`
                                  : dept.description
                                }
                              </span>
                            ) : (
                              <span className="text-gray-400 italic">No description</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            dept.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {dept.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => startEdit(dept)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit department"
                            >
                              ✏️
                            </button>
                            
                            {dept.isActive ? (
                              <button 
                                onClick={() => deleteDepartment(dept._id, dept.departmentName)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete department"
                              >
                                🗑️
                              </button>
                            ) : (
                              <button 
                                onClick={() => restoreDepartment(dept._id, dept.departmentName)}
                                className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                title="Restore department"
                              >
                                🔄
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => changePage(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {getPageNumbers().map(page => (
                        <button
                          key={page}
                          onClick={() => changePage(page)}
                          className={`px-3 py-2 border text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button 
                        onClick={() => changePage(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingDept && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit Department</h3>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department Name *
                  </label>
                  <input
                    name="departmentName"
                    value={editingDept.departmentName}
                    onChange={handleEditChange}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={editingDept.description || ''}
                    onChange={handleEditChange}
                    disabled={loading}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button 
                  onClick={() => setEditingDept(null)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={updateDepartment}
                  disabled={loading || !editingDept.departmentName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Department'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
