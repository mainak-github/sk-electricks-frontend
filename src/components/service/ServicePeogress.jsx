'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function ServiceProgressReport() {
  const API_BASE_URL = `${config.API_URL}/services-entries`

  const [services, setServices] = useState([])
  const [filteredServices, setFilteredServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    phase: 'All',
    priority: 'All',
    progressMin: 0,
    progressMax: 100,
    dateFrom: '',
    dateTo: ''
  })

  // Selected service for progress update
  const [selectedService, setSelectedService] = useState(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [showMilestoneUpdateModal, setShowMilestoneUpdateModal] = useState(false)
  const [selectedMilestone, setSelectedMilestone] = useState(null)

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    avgProgress: 0,
    onTrack: 0,
    delayed: 0
  })

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Status options
  const statusOptions = [
    'All',
    'Pending',
    'In Progress',
    'Completed',
    'Cancelled',
    'On Hold',
    'Under Review'
  ]

  const phaseOptions = [
    'All',
    'Initiation',
    'Planning',
    'Execution',
    'Monitoring',
    'Closure'
  ]

  const priorityOptions = [
    'All',
    'Low',
    'Medium',
    'High',
    'Urgent',
    'Critical'
  ]

  // Fetch services
  const fetchServices = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        limit: 1000,
        sortBy: 'entryDate',
        sortOrder: 'desc'
      })

      if (filters.status !== 'All') params.append('serviceStatus', filters.status)
      if (filters.phase !== 'All') params.append('projectPhase', filters.phase)
      if (filters.priority !== 'All') params.append('priority', filters.priority)
      if (filters.search) params.append('search', filters.search)
      if (filters.dateFrom) params.append('startDate', filters.dateFrom)
      if (filters.dateTo) params.append('endDate', filters.dateTo)
      if (filters.progressMin > 0) params.append('progressMin', filters.progressMin)
      if (filters.progressMax < 100) params.append('progressMax', filters.progressMax)

      const response = await fetch(`${API_BASE_URL}?${params}`)
      const data = await response.json()

      if (data.success) {
        setServices(data.data)
        setFilteredServices(data.data)
        calculateStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
      alert('Error loading services. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate statistics
  const calculateStats = (servicesData) => {
    const total = servicesData.length
    const completed = servicesData.filter(s => s.serviceStatus === 'Completed').length
    const inProgress = servicesData.filter(s => s.serviceStatus === 'In Progress').length
    const pending = servicesData.filter(s => s.serviceStatus === 'Pending').length
    
    const avgProgress = servicesData.reduce((sum, s) => sum + (s.overallProgress || 0), 0) / (total || 1)
    
    // Check if services are on track (compare estimated vs actual completion)
    const today = new Date()
    const onTrack = servicesData.filter(s => {
      if (s.serviceStatus === 'Completed') return true
      if (!s.estimatedCompletionDate) return true
      const estDate = new Date(s.estimatedCompletionDate)
      return estDate >= today
    }).length
    
    const delayed = total - onTrack

    setStats({
      total,
      completed,
      inProgress,
      pending,
      avgProgress: avgProgress.toFixed(1),
      onTrack,
      delayed
    })
  }

  // Update service status and progress
  const updateServiceProgress = async (serviceId, updateData) => {
    try {
      setSaving(true)
      
      const response = await fetch(`${API_BASE_URL}/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...updateData,
          updatedBy: 'Admin' // You can replace with actual user
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Progress updated successfully!')
        await fetchServices()
        setShowProgressModal(false)
        setSelectedService(null)
      } else {
        alert(data.message || 'Error updating progress')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      alert('Error updating progress. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Update milestone
  const updateMilestone = async (serviceId, milestoneId, milestoneData) => {
    try {
      setSaving(true)
      
      const response = await fetch(`${API_BASE_URL}/${serviceId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...milestoneData,
          updatedBy: 'Admin'
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Milestone updated successfully!')
        await fetchServices()
        setShowMilestoneUpdateModal(false)
        setSelectedMilestone(null)
      } else {
        alert(data.message || 'Error updating milestone')
      }
    } catch (error) {
      console.error('Error updating milestone:', error)
      alert('Error updating milestone. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const applyFilters = () => {
    fetchServices()
  }

  const resetFilters = () => {
    setFilters({
      search: '',
      status: 'All',
      phase: 'All',
      priority: 'All',
      progressMin: 0,
      progressMax: 100,
      dateFrom: '',
      dateTo: ''
    })
    fetchServices()
  }

  // Export to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Voucher No', 'Customer', 'Service Status', 'Project Phase', 'Priority', 'Progress %', 'Milestones', 'Technician', 'Est. Completion', 'Grand Total'],
      ...filteredServices.map(service => [
        service.voucherNo,
        service.customerName,
        service.serviceStatus,
        service.projectPhase,
        service.priority,
        service.overallProgress || 0,
        service.progressMilestones?.length || 0,
        service.assignedTechnician || 'Unassigned',
        service.estimatedCompletionDate ? new Date(service.estimatedCompletionDate).toLocaleDateString() : 'N/A',
        service.grandTotal
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `service_progress_report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Print report
  const printReport = () => {
    const printContent = `
      <html>
        <head>
          <title>Service Progress Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #0f766e; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0f766e; }
            .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .stat-box { border: 2px solid #ddd; padding: 15px; text-align: center; border-radius: 8px; }
            .stat-value { font-size: 24px; font-weight: bold; color: #0f766e; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #0f766e; color: white; font-weight: bold; }
            .progress-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; }
            .progress-fill { height: 100%; background: #0f766e; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Service Progress Report</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div>Total Services</div>
              <div class="stat-value">${stats.total}</div>
            </div>
            <div class="stat-box">
              <div>Completed</div>
              <div class="stat-value">${stats.completed}</div>
            </div>
            <div class="stat-box">
              <div>In Progress</div>
              <div class="stat-value">${stats.inProgress}</div>
            </div>
            <div class="stat-box">
              <div>Avg Progress</div>
              <div class="stat-value">${stats.avgProgress}%</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Voucher</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Phase</th>
                <th>Progress</th>
                <th>Priority</th>
                <th>Technician</th>
              </tr>
            </thead>
            <tbody>
              ${filteredServices.map(service => `
                <tr>
                  <td>${service.voucherNo}</td>
                  <td>${service.customerName}</td>
                  <td>${service.serviceStatus}</td>
                  <td>${service.projectPhase}</td>
                  <td>
                    <div class="progress-bar">
                      <div class="progress-fill" style="width: ${service.overallProgress || 0}%"></div>
                    </div>
                    ${service.overallProgress || 0}%
                  </td>
                  <td>${service.priority}</td>
                  <td>${service.assignedTechnician || 'Unassigned'}</td>
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

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredServices.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg mb-6">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📊</span>
            Service Progress Report & Update
          </h1>
          <p className="text-sm text-purple-100 mt-1">
            Monitor and update project progress, milestones, and service status
          </p>
        </div>

        {/* Statistics Dashboard */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">📈 Progress Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium mb-1">Total Services</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <p className="text-xs text-green-600 font-medium mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-700">{stats.completed}</p>
            </div>
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
              <p className="text-xs text-orange-600 font-medium mb-1">In Progress</p>
              <p className="text-3xl font-bold text-orange-700">{stats.inProgress}</p>
            </div>
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-xs text-yellow-600 font-medium mb-1">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <p className="text-xs text-purple-600 font-medium mb-1">Avg Progress</p>
              <p className="text-3xl font-bold text-purple-700">{stats.avgProgress}%</p>
            </div>
            <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
              <p className="text-xs text-teal-600 font-medium mb-1">On Track</p>
              <p className="text-3xl font-bold text-teal-700">{stats.onTrack}</p>
            </div>
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-xs text-red-600 font-medium mb-1">Delayed</p>
              <p className="text-3xl font-bold text-red-700">{stats.delayed}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">🔍 Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search by customer, voucher..."
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phase
              </label>
              <select
                value={filters.phase}
                onChange={(e) => handleFilterChange('phase', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              >
                {phaseOptions.map(phase => (
                  <option key={phase} value={phase}>{phase}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              >
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Min %
              </label>
              <input
                type="number"
                value={filters.progressMin}
                onChange={(e) => handleFilterChange('progressMin', e.target.value)}
                min="0"
                max="100"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Progress Max %
              </label>
              <input
                type="number"
                value={filters.progressMax}
                onChange={(e) => handleFilterChange('progressMax', e.target.value)}
                min="0"
                max="100"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={applyFilters}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700"
            >
              🔍 Apply Filters
            </button>
            <button
              onClick={resetFilters}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600"
            >
              🔄 Reset
            </button>
            <button
              onClick={exportToCSV}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              📤 Export CSV
            </button>
            <button
              onClick={printReport}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              🖨️ Print
            </button>
          </div>
        </div>
      </div>

      {/* Services Progress Table */}
      <div className="bg-white rounded-lg shadow-lg">
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white px-6 py-4">
          <h2 className="text-xl font-bold">📋 Service Progress List ({filteredServices.length})</h2>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto border-2 border-gray-300 rounded-lg">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Voucher</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Customer</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Status</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Phase</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Priority</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Overall Progress</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Milestones</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Technician</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="text-gray-600 font-medium">Loading services...</p>
                      </div>
                    </td>
                  </tr>
                ) : currentEntries.length > 0 ? (
                  currentEntries.map((service) => (
                    <tr key={service._id} className="border-b hover:bg-purple-50">
                      <td className="px-4 py-3 font-bold text-blue-600">{service.voucherNo}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold">{service.customerName}</p>
                          <p className="text-xs text-gray-500">{service.institutionName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          service.serviceStatus === 'Completed' ? 'bg-green-100 text-green-700' :
                          service.serviceStatus === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                          service.serviceStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          service.serviceStatus === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          service.serviceStatus === 'On Hold' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {service.serviceStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {service.projectPhase}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          service.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                          service.priority === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                          service.priority === 'High' ? 'bg-yellow-100 text-yellow-700' :
                          service.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {service.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-lg font-bold text-purple-600">
                            {service.overallProgress || 0}%
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                (service.overallProgress || 0) >= 75 ? 'bg-green-500' :
                                (service.overallProgress || 0) >= 50 ? 'bg-blue-500' :
                                (service.overallProgress || 0) >= 25 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${service.overallProgress || 0}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-purple-600">
                            {service.progressMilestones?.length || 0}
                          </span>
                          <span className="text-xs text-gray-500">milestones</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{service.assignedTechnician || 'Unassigned'}</p>
                        {service.assignedTeam && service.assignedTeam.length > 0 && (
                          <p className="text-xs text-gray-500">+{service.assignedTeam.length} team members</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => {
                              setSelectedService(service)
                              setShowProgressModal(true)
                            }}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:from-purple-700 hover:to-indigo-700 whitespace-nowrap"
                          >
                            📝 Update Progress
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <span className="text-6xl">📊</span>
                        <p className="text-lg font-medium">No services found</p>
                        <p className="text-sm">Try adjusting your filters</p>
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
                {filteredServices.length === 0
                  ? '0-0 of 0'
                  : `${startIndex + 1}-${Math.min(endIndex, filteredServices.length)} of ${filteredServices.length}`
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
                <span className="px-4 py-1 bg-purple-50 border-2 border-purple-300 rounded-lg font-semibold">
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

      {/* Progress Update Modal */}
       {/* Progress Update Modal - ENHANCED WITH PROGRESS % */}
      {showProgressModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-2xl font-bold">
                📝 Update Progress - {selectedService.voucherNo}
              </h3>
              <p className="text-sm text-purple-100 mt-1">{selectedService.customerName}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Current Progress Overview */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                <h4 className="font-bold text-purple-900 mb-3">📊 Current Status</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-bold text-purple-700">{selectedService.serviceStatus}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Phase:</span>
                    <p className="font-bold text-purple-700">{selectedService.projectPhase}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Progress:</span>
                    <p className="font-bold text-purple-700 text-2xl">{selectedService.overallProgress || 0}%</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <p className="font-bold text-purple-700">{selectedService.priority}</p>
                  </div>
                </div>
              </div>

              {/* Update Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const updateData = {
                    serviceStatus: formData.get('serviceStatus'),
                    projectPhase: formData.get('projectPhase'),
                    priority: formData.get('priority'),
                    overallProgress: parseInt(formData.get('overallProgress')),
                    assignedTechnician: formData.get('assignedTechnician'),
                    actualHours: parseFloat(formData.get('actualHours')) || 0,
                    serviceNotes: formData.get('serviceNotes')
                  }
                  
                  // Auto-complete if progress is 100%
                  if (updateData.overallProgress === 100 && updateData.serviceStatus !== 'Completed') {
                    if (confirm('Progress is 100%. Mark service as Completed?')) {
                      updateData.serviceStatus = 'Completed'
                      updateData.actualCompletionDate = new Date().toISOString()
                    }
                  }
                  
                  updateServiceProgress(selectedService._id, updateData)
                }}
              >
                {/* ✅ NEW: Overall Progress Percentage Field */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 mb-4">
                  <label className="block text-sm font-bold text-green-900 mb-3">
                    🎯 Overall Project Progress (%)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      name="overallProgress"
                      defaultValue={selectedService.overallProgress || 0}
                      min="0"
                      max="100"
                      step="5"
                      className="flex-1 h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                      onInput={(e) => {
                        const value = e.target.value
                        e.target.nextElementSibling.textContent = `${value}%`
                        const progressFill = e.target.parentElement.nextElementSibling.querySelector('.progress-fill')
                        progressFill.style.width = `${value}%`
                        
                        // Update color based on progress
                        if (value >= 75) {
                          progressFill.className = 'progress-fill h-4 rounded-full bg-green-500 transition-all'
                        } else if (value >= 50) {
                          progressFill.className = 'progress-fill h-4 rounded-full bg-blue-500 transition-all'
                        } else if (value >= 25) {
                          progressFill.className = 'progress-fill h-4 rounded-full bg-yellow-500 transition-all'
                        } else {
                          progressFill.className = 'progress-fill h-4 rounded-full bg-red-500 transition-all'
                        }
                      }}
                      required
                    />
                    <span className="text-3xl font-bold text-green-700 w-20 text-center">
                      {selectedService.overallProgress || 0}%
                    </span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`progress-fill h-4 rounded-full transition-all ${
                        (selectedService.overallProgress || 0) >= 75 ? 'bg-green-500' :
                        (selectedService.overallProgress || 0) >= 50 ? 'bg-blue-500' :
                        (selectedService.overallProgress || 0) >= 25 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${selectedService.overallProgress || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>0% - Not Started</span>
                    <span>25% - Initial</span>
                    <span>50% - In Progress</span>
                    <span>75% - Near Complete</span>
                    <span>100% - Completed</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Status *
                    </label>
                    <select
                      name="serviceStatus"
                      defaultValue={selectedService.serviceStatus}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Under Review">Under Review</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Phase *
                    </label>
                    <select
                      name="projectPhase"
                      defaultValue={selectedService.projectPhase}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                      required
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
                      Priority Level
                    </label>
                    <select
                      name="priority"
                      defaultValue={selectedService.priority}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assigned Technician
                    </label>
                    <input
                      type="text"
                      name="assignedTechnician"
                      defaultValue={selectedService.assignedTechnician}
                      placeholder="Enter technician name"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Hours Worked
                    </label>
                    <input
                      type="number"
                      name="actualHours"
                      defaultValue={selectedService.actualHours || 0}
                      min="0"
                      step="0.5"
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Est. Hours vs Actual
                    </label>
                    <div className="border-2 border-gray-300 rounded-lg px-4 py-2 bg-gray-50">
                      <span className="text-sm">
                        Est: <strong>{selectedService.estimatedHours || 0}h</strong> | 
                        Actual: <strong>{selectedService.actualHours || 0}h</strong>
                        {selectedService.estimatedHours > 0 && (
                          <span className={`ml-2 font-semibold ${
                            (selectedService.actualHours || 0) > selectedService.estimatedHours 
                              ? 'text-red-600' 
                              : 'text-green-600'
                          }`}>
                            ({selectedService.actualHours > selectedService.estimatedHours ? 'Over' : 'Within'} estimate)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress Notes / Updates
                    </label>
                    <textarea
                      name="serviceNotes"
                      defaultValue={selectedService.serviceNotes}
                      placeholder="Add notes about progress, issues, or updates..."
                      rows={4}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Quick Progress Buttons */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">⚡ Quick Progress Update:</p>
                  <div className="grid grid-cols-5 gap-2">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={(e) => {
                          const rangeInput = e.target.closest('form').querySelector('input[name="overallProgress"]')
                          rangeInput.value = value
                          rangeInput.dispatchEvent(new Event('input', { bubbles: true }))
                        }}
                        className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                          value === 0 ? 'bg-red-100 hover:bg-red-200 text-red-700' :
                          value === 25 ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' :
                          value === 50 ? 'bg-blue-100 hover:bg-blue-200 text-blue-700' :
                          value === 75 ? 'bg-purple-100 hover:bg-purple-200 text-purple-700' :
                          'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Milestones Section */}
                {selectedService.progressMilestones && selectedService.progressMilestones.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-lg flex items-center gap-2">
                      🎯 Progress Milestones
                      <span className="text-sm font-normal text-gray-500">
                        ({selectedService.progressMilestones.filter(m => m.status === 'Completed').length} / {selectedService.progressMilestones.length} completed)
                      </span>
                    </h4>
                    <div className="space-y-3">
                      {selectedService.progressMilestones.map((milestone, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold text-gray-800">{milestone.milestoneName}</h5>
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
                                <span>📊 Progress: <strong className="text-purple-600">{milestone.progress}%</strong></span>
                                {milestone.assignedTo && <span>👤 {milestone.assignedTo}</span>}
                                {milestone.targetDate && (
                                  <span>📅 Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedMilestone({ ...milestone, serviceId: selectedService._id })
                                setShowMilestoneUpdateModal(true)
                              }}
                              className="bg-purple-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-purple-700 transition-colors"
                            >
                              ✏️ Update
                            </button>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                milestone.progress >= 75 ? 'bg-green-500' :
                                milestone.progress >= 50 ? 'bg-blue-500' :
                                milestone.progress >= 25 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Updating Progress...
                      </>
                    ) : (
                      <>
                        ✅ Save Progress Update
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProgressModal(false)
                      setSelectedService(null)
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600 transition-colors"
                  >
                    ✖️ Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Milestone Update Modal */}
      {showMilestoneUpdateModal && selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full">
            <div className="bg-purple-600 text-white px-6 py-4 rounded-t-lg">
              <h3 className="text-xl font-bold">🎯 Update Milestone</h3>
              <p className="text-sm text-purple-100">{selectedMilestone.milestoneName}</p>
            </div>

            <div className="p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const formData = new FormData(e.target)
                  const milestoneData = {
                    progress: parseInt(formData.get('progress')),
                    status: formData.get('status'),
                    notes: formData.get('notes'),
                    completedDate: formData.get('status') === 'Completed' ? new Date().toISOString() : null
                  }
                  updateMilestone(selectedMilestone.serviceId, selectedMilestone._id, milestoneData)
                }}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress (%)
                    </label>
                    <input
                      type="number"
                      name="progress"
                      defaultValue={selectedMilestone.progress}
                      min="0"
                      max="100"
                      required
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      defaultValue={selectedMilestone.status}
                      required
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
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      defaultValue={selectedMilestone.notes}
                      placeholder="Add notes about this milestone..."
                      rows={3}
                      className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : '✅ Update Milestone'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMilestoneUpdateModal(false)
                      setSelectedMilestone(null)
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
