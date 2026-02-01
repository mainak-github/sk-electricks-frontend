// app/page.js
'use client'

import { useState, useEffect } from 'react'
import { useNavigation } from './contexts/NavigationContext'
import { useAuth } from './contexts/AuthContext'
import Header from '../components/common/Header'
import Sidebar from '../components/common/Sidebar'
import DashboardContent from '../components/dashboard/DashboardContent'
import HRPayrollContent from '../components/hrandPayroll/HRPayrollContent'
import PurchaseModuleContent from '../components/purchase/PurchaseModuleContent'
import SalesModuleContent from '../components/sales/SalesModuleContent'
import QuotationContent from '@/components/quotation/QuotationContent'
import OrdersContent from '@/components/orders/OrdersContent'
import InventoryContent from '@/components/inventory/InventoryContent'
import ServiceContent from '@/components/service/ServiceContent'
import ManufacturingContent from '@/components/manufacturing/ManufacturingContent'
import AccountsContent from '@/components/accounts/AccountsContent'
import CRMContent from '@/components/crm/CRMcontent'
import ReportsContent from '@/components/reports/ReportsContent'

// Backend API URL - Updated to work with your MVC architecture
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sk-electricks-backend.onrender.com/api'

// Access Control Wrapper Component with Backend API Integration
function AccessControlWrapper({ moduleId, children, fallback = null }) {
  const { hasModuleAccess, user, accessModuleData } = useAuth()
  const [moduleData, setModuleData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (hasModuleAccess(moduleId)) {
      loadModuleData()
    } else {
      setLoading(false)
    }
  }, [moduleId, hasModuleAccess])

  const loadModuleData = async () => {
    try {
      setLoading(true)
      const result = await accessModuleData(moduleId)
      if (result.success) {
        setModuleData(result.data)
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to load module data')
    } finally {
      setLoading(false)
    }
  }
  
  if (!hasModuleAccess(moduleId)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mx-4">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Access Restricted</h3>
          <p className="text-gray-500 mb-4">
            You do not have permission to access the <strong>{moduleId}</strong> module.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-700">
              Your current role: <strong className="capitalize">{user?.role?.replace('_', ' ')}</strong>
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Contact your administrator to request access to this module.
            </p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Refresh Access
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading {moduleId} module...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-red-50 rounded-lg border border-red-200 mx-4">
        <div className="text-center p-6">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-700 mb-2">Module Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadModuleData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="relative">
      {/* Module Access Badge */}
      <div className="absolute top-0 right-0 z-10">
   
      </div>
      {children}
    </div>
  )
}

// MVC Backend-Integrated User Management Component
function UserManagement() {
  const { 
    user, 
    isAdmin, 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser, 
    toggleUserStatus, 
    getAvailableRoles 
  } = useAuth()
  
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedUsers, setSelectedUsers] = useState([])
  
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'dashboard_user',
    branch: ''
  })

  useEffect(() => {
    if (isAdmin()) {
      loadInitialData()
    }
  }, [])

  const loadInitialData = async () => {
    setPageLoading(true)
    await Promise.all([loadUsers(), loadRoles()])
    setPageLoading(false)
  }

  const loadUsers = async () => {
    try {
      const result = await getAllUsers()
      if (result.success) {
        setUsers(result.users || [])
      } else {
        setError(result.message || 'Failed to load users')
      }
    } catch (error) {
      setError('Failed to load users from database')
      console.error('Load users error:', error)
    }
  }

  const loadRoles = async () => {
    try {
      const result = await getAvailableRoles()
      if (result.success) {
        setRoles(result.roles || [])
      } else {
        console.error('Failed to load roles:', result.message)
      }
    } catch (error) {
      console.error('Load roles error:', error)
    }
  }

  // Enhanced filter with multiple criteria
  const filteredUsers = users.filter(userItem => {
    const matchesSearch = userItem.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.branch?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || userItem.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Enhanced validation
    if (!newUser.username?.trim() || !newUser.email?.trim() || !newUser.password?.trim()) {
      setError('Username, email, and password are required')
      setLoading(false)
      return
    }

    if (newUser.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUser.email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      const result = await createUser({
        ...newUser,
        username: newUser.username.trim(),
        email: newUser.email.trim().toLowerCase(),
        branch: newUser.branch?.trim() || 'Main Branch'
      })
      
      if (result.success) {
        setNewUser({ username: '', email: '', password: '', role: 'dashboard_user', branch: '' })
        setShowCreateForm(false)
        await loadUsers()
        
        // Success notification
        showSuccessNotification(`User "${newUser.username}" created successfully!`)
      } else {
        setError(result.message || 'Failed to create user')
      }
    } catch (error) {
      setError('Network error. Please check your connection.')
    }
    
    setLoading(false)
  }

  const handleEditUser = (userItem) => {
    setEditingUser({
      id: userItem.id,
      username: userItem.username,
      email: userItem.email,
      role: userItem.role,
      branch: userItem.branch || ''
    })
    setShowEditForm(true)
    setError('')
  }

  const handleUpdateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await updateUser(editingUser.id, {
        username: editingUser.username.trim(),
        role: editingUser.role,
        branch: editingUser.branch?.trim() || 'Main Branch'
      })

      if (result.success) {
        setShowEditForm(false)
        setEditingUser(null)
        await loadUsers()
        
        showSuccessNotification(`User "${editingUser.username}" updated successfully!`)
      } else {
        setError(result.message || 'Failed to update user')
      }
    } catch (error) {
      setError('Network error. Please check your connection.')
    }

    setLoading(false)
  }

  const handleToggleStatus = async (userId) => {
    try {
      const result = await toggleUserStatus(userId)
      if (result.success) {
        await loadUsers()
        showSuccessNotification('User status updated successfully!')
      } else {
        alert(result.message || 'Failed to update user status')
      }
    } catch (error) {
      alert('Network error. Please check your connection.')
    }
  }

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return
    }

    try {
      const result = await deleteUser(userId)
      if (result.success) {
        await loadUsers()
        showSuccessNotification(`User "${username}" deleted successfully!`)
      } else {
        alert(result.message || 'Failed to delete user')
      }
    } catch (error) {
      alert('Network error. Please check your connection.')
    }
  }

  const showSuccessNotification = (message) => {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    notification.textContent = message
    document.body.appendChild(notification)
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  const getRoleInfo = (roleValue) => {
    const role = roles.find(r => r.value === roleValue)
    return role || { 
      value: roleValue, 
      label: roleValue?.replace('_', ' ')?.replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown Role',
      color: 'bg-gray-100 text-gray-800',
      modules: []
    }
  }

  if (!isAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Admin Access Required</h2>
          <p className="text-gray-500 mb-4">You need admin privileges to access user management.</p>
          <p className="text-sm text-gray-400">Current role: <span className="capitalize font-medium">{user?.role?.replace('_', ' ')}</span></p>
        </div>
      </div>
    )
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading User Management...</p>
          <p className="text-sm text-gray-500 mt-2">Connecting to MVC backend...</p>
        </div>
      </div>
    )
  }

  const activeUsers = users.filter(u => u.isActive).length + 1 // +1 for current admin
  const inactiveUsers = users.filter(u => !u.isActive).length

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Enhanced Header Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600 mb-2">Create and manage user accounts with role-based access control</p>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-green-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              MVC Architecture
            </div>
            <div className="flex items-center text-blue-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              MongoDB Database
            </div>
            <div className="text-gray-500">
              Controllers & Models
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New User
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
          <button 
            onClick={() => setError('')}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{users.length + 1}</p>
              <p className="text-xs text-gray-500 mt-1">Stored in MongoDB</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Can access system</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Roles</p>
              <p className="text-3xl font-bold text-purple-600">{roles.length}</p>
              <p className="text-xs text-gray-500 mt-1">From role config</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Backend Status</p>
              <p className="text-lg font-bold text-green-600">Connected</p>
              <p className="text-xs text-gray-500 mt-1">MVC Architecture</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users by name, email, or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="lg:w-64">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles ({users.length})</option>
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label} ({users.filter(u => u.role === role.value).length})
                </option>
              ))}
            </select>
          </div>
          <div className="lg:w-48">
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterRole('all')
              }}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
        
        {searchTerm && (
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredUsers.length} users matching <b>{searchTerm}</b>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setError('')
                  setNewUser({ username: '', email: '', password: '', role: 'dashboard_user', branch: '' })
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleCreateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                  placeholder="user@company.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={6}
                  placeholder="Minimum 6 characters"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {roles.find(r => r.value === newUser.role) && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs">
                    <div className="font-semibold text-blue-800 mb-1">Access includes:</div>
                    <div className="text-blue-700">
                      {roles.find(r => r.value === newUser.role)?.modules?.join(', ') || 'Basic dashboard access'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                <input
                  type="text"
                  value={newUser.branch}
                  onChange={(e) => setNewUser({...newUser, branch: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Main Branch"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving to Database...
                    </div>
                  ) : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setError('')
                    setNewUser({ username: '', email: '', password: '', role: 'dashboard_user', branch: '' })
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enhanced Users Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              User Directory ({filteredUsers.length} users from database)
            </h3>
            {/* <div className="text-xs text-gray-500">
              Powered by MongoDB & MVC Controllers
            </div> */}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modules</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-xl font-medium text-gray-500 mb-2">No users found</p>
                    <p className="text-gray-400">
                      {searchTerm || filterRole !== 'all' 
                        ? 'Try adjusting your search or filter criteria' 
                        : 'Create your first user to get started'
                      }
                    </p>
                    {(!searchTerm && filterRole === 'all') && (
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create First User
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((userItem) => {
                  const roleInfo = getRoleInfo(userItem.role)
                  return (
                    <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4 shadow-lg">
                            {userItem.username?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{userItem.username}</div>
                            <div className="text-sm text-gray-500">{userItem.email}</div>
                            <div className="text-xs text-gray-400 flex items-center mt-1">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {userItem.branch || 'Main Branch'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${roleInfo.color || 'bg-gray-100 text-gray-800'}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {userItem.allowedModules?.slice(0, 3).map((module) => (
                              <span key={module} className="inline-flex px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-medium">
                                {module}
                              </span>
                            ))}
                            {userItem.allowedModules?.length > 3 && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                                +{userItem.allowedModules.length - 3} more
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            <strong>Total:</strong> {userItem.allowedModules?.length || 0} modules
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          userItem.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userItem.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {userItem.createdAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            Created: {new Date(userItem.createdAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditUser(userItem)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition-colors"
                            title="Edit User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(userItem.id)}
                            className={`p-2 rounded-full transition-colors ${
                              userItem.isActive 
                                ? 'text-red-600 hover:text-red-900 hover:bg-red-50' 
                                : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                            }`}
                            title={userItem.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {userItem.isActive ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem.id, userItem.username)}
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                            title="Delete User"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Footer */}
      {filteredUsers.length > 0 && (
        <div className="mt-6 flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {filteredUsers.length} of {users.length} users from MongoDB database
          </div>
          <div>
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit User</h3>
              <button
                onClick={() => {
                  setShowEditForm(false)
                  setEditingUser(null)
                  setError('')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {roles.find(r => r.value === editingUser.role) && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs">
                    <div className="font-semibold text-blue-800 mb-1">New access includes:</div>
                    <div className="text-blue-700">
                      {roles.find(r => r.value === editingUser.role)?.modules?.join(', ') || 'Basic dashboard access'}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                <input
                  type="text"
                  value={editingUser.branch}
                  onChange={(e) => setEditingUser({...editingUser, branch: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating Database...
                    </div>
                  ) : 'Update User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingUser(null)
                    setError('')
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Settings Component with MVC Backend Integration
function SettingsContent() {
  const { user, updateUser, accessModuleData } = useAuth()
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: user?.username || '',
    branch: user?.branch || ''
  })
  const [loading, setLoading] = useState(false)
  const [systemInfo, setSystemInfo] = useState(null)

  useEffect(() => {
    loadSystemInfo()
  }, [])

  const loadSystemInfo = async () => {
    try {
      const result = await accessModuleData('dashboard')
      if (result.success) {
        setSystemInfo(result.data)
      }
    } catch (error) {
      console.error('Failed to load system info:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateUser(user.id, editData)
      if (result.success) {
        setEditing(false)
        
        // Success notification
        const notification = document.createElement('div')
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
        notification.textContent = 'Profile updated successfully in database!'
        document.body.appendChild(notification)
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
        }, 3000)
      } else {
        alert('Failed to update profile: ' + result.message)
      }
    } catch (error) {
      alert('Network error. Please check your connection.')
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings & Profile</h1>
        <p className="text-gray-600 mb-2">Manage your account settings</p>
        
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Profile Settings */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Profile Settings</h3>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              disabled={loading}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                editing 
                  ? 'bg-green-600 text-white hover:bg-green-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              } disabled:opacity-50`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving to DB...
                </div>
              ) : editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{user?.username}</h4>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <p className="text-xs text-blue-600 capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={editing ? editData.username : user?.username || ''}
                onChange={(e) => setEditData({...editData, username: e.target.value})}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors ${
                  editing 
                    ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
                disabled={!editing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Email address cannot be changed for security reasons</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <input
                type="text"
                value={user?.role?.replace('_', ' ') || ''}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 capitalize cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Role is managed by your administrator in the database</p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
              <input
                type="text"
                value={editing ? editData.branch : user?.branch || 'Main Branch'}
                onChange={(e) => setEditData({...editData, branch: e.target.value})}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg transition-colors ${
                  editing 
                    ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent' 
                    : 'bg-gray-50 cursor-not-allowed'
                }`}
                disabled={!editing}
              />
            </div>
          </div>
          
          {editing && (
            <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => {
                  setEditing(false)
                  setEditData({
                    username: user?.username || '',
                    branch: user?.branch || ''
                  })
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel Changes
              </button>
            </div>
          )}
        </div>

        {/* Enhanced System Info */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">System Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Version</div>
                <div className="text-lg font-semibold text-gray-900">2.0.0</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600">Architecture</div>
                <div className="text-lg font-semibold text-gray-900">MVC</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Branch:</span>
                <span className="text-sm font-semibold text-gray-900">{user?.branch || 'Main Branch'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Company:</span>
                <span className="text-sm font-semibold text-gray-900">{user?.company || 'SK Electrics'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Module Access:</span>
                <span className="text-sm font-semibold text-green-600">{user?.allowedModules?.length || 0}/12</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Database:</span>
                <span className="text-sm font-semibold text-blue-600">MongoDB</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Backend:</span>
                <span className="text-sm font-semibold text-purple-600">Controllers & Models</span>
              </div>
            </div>
          </div>

          {/* Backend Connection Status */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
          
            </div>
          </div>
        </div>

        {/* Enhanced Module Access */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 lg:col-span-2">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Your Module Access (From Database)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {user?.allowedModules?.map((module) => (
              <div key={module} className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-green-800 capitalize">{module.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
          
          {user?.allowedModules?.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-gray-500">No modules accessible</p>
              <p className="text-sm text-gray-400">Contact your administrator for access</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Enhanced Login Component with MVC Backend Integration
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const { login } = useAuth()

  useEffect(() => {
    checkBackendConnection()
  }, [])

  const checkBackendConnection = async () => {
    try {
      // Check backend health using MVC health endpoint
      const response = await fetch(`${API_BASE_URL}/health`)
      if (response.ok) {
        const data = await response.json()
        setConnectionStatus('connected')
        console.log('MVC Backend connected:', data)
      } else {
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      setConnectionStatus('disconnected')
      console.error('Backend connection error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const result = await login(email, password)
    
    if (!result.success) {
      setError(result.message)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">SK Electrics ERP</h2>
            {/* <p className="mt-2 text-sm text-gray-600">MVC Architecture • Controllers & Models</p> */}
            
            {/* Connection Status */}
            <div className={`mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'connected' 
                ? 'bg-green-100 text-green-800' 
                : connectionStatus === 'disconnected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-2 ${
                connectionStatus === 'connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'disconnected'
                  ? 'bg-red-500'
                  : 'bg-yellow-500'
              }`}></div>
              {connectionStatus === 'connected' ? 'Online' : 
               connectionStatus === 'disconnected' ? 'Offline' : 'Checking Connection...'}
            </div>

            {/* Server URL Display */}
            {/* <div className="mt-2 text-xs text-gray-500">
              Controllers • Models • MongoDB
            </div> */}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
                disabled={isLoading || connectionStatus === 'disconnected'}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
                disabled={isLoading || connectionStatus === 'disconnected'}
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading || connectionStatus === 'disconnected'}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating via MVC...
                </div>
              ) : connectionStatus === 'disconnected' ? (
                'Offline'
              ) : (
                'Sign In to ERP System'
              )}
            </button>
          </form>

         
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { activeTab, activeSubPage } = useNavigation()
  const { user, loading } = useAuth()

  // Enhanced loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading ERP System</h3>
          <p className="text-sm text-gray-500">Connecting...</p>
          <div className="mt-4 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  // If not logged in, show login form
  if (!user) {
    return <LoginForm />
  }

  // Component rendering function with enhanced access control
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <AccessControlWrapper moduleId="dashboard">
            <DashboardContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'sales':
        return (
          <AccessControlWrapper moduleId="sales">
            <SalesModuleContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'quotation':
        return (
          <AccessControlWrapper moduleId="quotation">
            <QuotationContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'order':
        return (
          <AccessControlWrapper moduleId="order">
            <OrdersContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'service':
        return (
          <AccessControlWrapper moduleId="service">
            <ServiceContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'purchase':
        return (
          <AccessControlWrapper moduleId="purchase">
            <PurchaseModuleContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'manufacturing':
        return (
          <AccessControlWrapper moduleId="manufacturing">
            <ManufacturingContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'inventory':
        return (
          <AccessControlWrapper moduleId="inventory">
            <InventoryContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'accounts':
        return (
          <AccessControlWrapper moduleId="accounts">
            <AccountsContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'hr-payroll':
        return (
          <AccessControlWrapper moduleId="hr-payroll">
            <HRPayrollContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'reports':
        return (
          <AccessControlWrapper moduleId="reports">
            <ReportsContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      case 'crm':
        return (
          <AccessControlWrapper moduleId="crm">
            <CRMContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
      
      // Admin-only sections
      case 'user-management':
        return <UserManagement />
      
      case 'role-management':
        return user?.role === 'admin' ? (
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Role Management</h1>
              <p className="text-gray-600 mb-4">Advanced role configuration stored in database</p>
              <p className="text-gray-500">Enhanced role management features coming in the next update...</p>
            </div>
          </div>
        ) : (
          <AccessControlWrapper moduleId="admin">
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-2">Admin Access Required</h2>
              <p className="text-gray-500">You need admin privileges to access role management.</p>
            </div>
          </AccessControlWrapper>
        )
      
      case 'system-settings':
        return user?.role === 'admin' ? (
          <div className="p-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            
            </div>
          </div>
        ) : (
          <AccessControlWrapper moduleId="admin">
            <div className="text-center p-6">
              <h2 className="text-xl font-bold text-gray-700 mb-2">Admin Access Required</h2>
              <p className="text-gray-500">You need admin privileges to access system settings.</p>
            </div>
          </AccessControlWrapper>
        )
      
      case 'settings':
        return <SettingsContent />
      
      default:
        return (
          <AccessControlWrapper moduleId="dashboard">
            <DashboardContent activeSubPage={activeSubPage} />
          </AccessControlWrapper>
        )
    }
  }

  // Enhanced ERP layout with MVC integration
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 bg-gray-100 min-h-screen">
          {/* Enhanced User Info Bar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Welcome back, {user?.username}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium capitalize text-blue-600">
                        {user?.role?.replace('_', ' ')}
                      </span>
                    </span>
                    {user?.branch && (
                      <>
                        <span>•</span>
                        <span className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="font-medium">{user.branch}</span>
                        </span>
                      </>
                    )}
                    <span>•</span>
                    <span className="flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                      </svg>
                     
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm text-gray-500">Current Module</p>
                <p className="text-lg font-semibold text-gray-800 capitalize">
                  {activeTab.replace('-', ' ')}
                  {activeSubPage && (
                    <span className="text-sm text-gray-500 ml-2">
                      › {activeSubPage}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Content */}
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
