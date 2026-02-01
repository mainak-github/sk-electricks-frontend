// contexts/AuthContext.js
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// Backend API base URL - update this to match your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(null)
  const [isClient, setIsClient] = useState(false)

  // Enhanced API helper function
  const apiCall = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    }

    // Add auth token if available
    if (token && !endpoint.includes('/login')) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`)
      const response = await fetch(url, config)
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`Server returned non-JSON response: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      console.log(`API Success: ${endpoint}`, data.success ? '✅' : '❌')
      return data
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // Safe localStorage helper functions
  const getFromStorage = (key) => {
    if (typeof window !== 'undefined') {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error)
        return null
      }
    }
    return null
  }

  const setToStorage = (key, value) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (error) {
        console.error(`Error writing to localStorage for key ${key}:`, error)
        return false
      }
    }
    return false
  }

  const removeFromStorage = (key) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key)
        return true
      } catch (error) {
        console.error(`Error removing from localStorage for key ${key}:`, error)
        return false
      }
    }
    return false
  }

  // Set client-side flag
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Check auth status on client load
  useEffect(() => {
    if (isClient) {
      checkAuthStatus()
    }
  }, [isClient])

  const checkAuthStatus = async () => {
    try {
      const storedToken = getFromStorage('auth_token')
      const storedUser = getFromStorage('user_data')
      
      if (storedToken && storedUser) {
        // Just set stored data without verification to avoid initial API calls
        setToken(storedToken)
        setUser(storedUser)
        console.log('Auth restored from storage')
      }
    } catch (error) {
      console.error('Auth status check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      console.log('🔐 Login attempt for:', email)
      
      // Try your existing login endpoint first
      const response = await apiCall('/admin/user/access/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      })

      if (response.success) {
        const { user: userData, token: userToken } = response
        
        setUser(userData)
        setToken(userToken)
        setToStorage('auth_token', userToken)
        setToStorage('user_data', userData)
        
        console.log('✅ Login successful:', userData.email)
        return { success: true, user: userData }
      }

      return { success: false, message: response.message || 'Login failed' }
      
    } catch (error) {
      console.error('❌ Login error:', error)
      return { 
        success: false, 
        message: error.message || 'Login failed. Please check your connection and try again.' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (token) {
        // Try to call logout endpoint, but don't fail if it doesn't exist
        try {
          await apiCall('/admin/user/access/logout', {
            method: 'POST'
          })
        } catch (error) {
          console.warn('Logout endpoint not available:', error.message)
        }
      }
    } catch (error) {
      console.error('Logout API call failed:', error)
    }

    setUser(null)
    setToken(null)
    removeFromStorage('auth_token')
    removeFromStorage('user_data')
    
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  const hasModuleAccess = (module) => {
    if (!user || !user.allowedModules) return false
    return user.allowedModules.includes(module)
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  // User Management Functions - Updated for your endpoints
  const getAllUsers = async () => {
    try {
      if (!token || !isAdmin()) return { success: false, users: [] }
      
      console.log('📋 Fetching users...')
      const response = await apiCall('/admin/user/access/all')
      
      console.log('✅ Users loaded:', response.users?.length || 0)
      return { success: true, users: response.users || [] }
    } catch (error) {
      console.error('❌ Get users error:', error)
      return { success: false, users: [], message: error.message }
    }
  }

  const createUser = async (newUserData) => {
    try {
      if (!token || !isAdmin()) return { success: false, message: 'Admin access required' }

      console.log('👤 Creating user...', newUserData.email)
      const response = await apiCall('/admin/user/access/create', {
        method: 'POST',
        body: JSON.stringify(newUserData)
      })

      console.log('✅ User created successfully')
      return { success: true, user: response.user }
    } catch (error) {
      console.error('❌ Create user error:', error)
      return { 
        success: false, 
        message: error.message || 'Failed to create user' 
      }
    }
  }

  const updateUser = async (userId, updateData) => {
    try {
      if (!token) return { success: false, message: 'No authentication token' }

      console.log('📝 Updating user...', userId)
      const response = await apiCall(`/admin/user/access/update/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      })

      // If updating current user, update local state
      if (user && (user.id === userId || user._id === userId)) {
        const updatedUser = { ...user, ...response.user }
        setUser(updatedUser)
        setToStorage('user_data', updatedUser)
      }

      console.log('✅ User updated successfully')
      return { success: true, user: response.user }
    } catch (error) {
      console.error('❌ Update user error:', error)
      return { 
        success: false, 
        message: error.message || 'Failed to update user' 
      }
    }
  }

  const deleteUser = async (userId) => {
    try {
      if (!token || !isAdmin()) return { success: false, message: 'Admin access required' }

      console.log('🗑️ Deleting user...', userId)
      await apiCall(`/admin/user/access/delete/${userId}`, {
        method: 'DELETE'
      })

      console.log('✅ User deleted successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Delete user error:', error)
      return { 
        success: false, 
        message: error.message || 'Failed to delete user' 
      }
    }
  }

  const toggleUserStatus = async (userId) => {
    try {
      if (!token || !isAdmin()) return { success: false, message: 'Admin access required' }

      console.log('🔄 Toggling user status...', userId)
      const response = await apiCall(`/admin/user/access/toggle/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: 'toggle' })
      })

      console.log('✅ User status toggled successfully')
      return { success: true, user: response.user }
    } catch (error) {
      console.error('❌ Toggle user status error:', error)
      return { 
        success: false, 
        message: error.message || 'Failed to update user status' 
      }
    }
  }

  const getAvailableRoles = async () => {
    try {
      if (!token || !isAdmin()) return { success: false, roles: [] }

      console.log('🎭 Fetching roles...')
      const response = await apiCall('/admin/user/access/roles')

      console.log('✅ Roles loaded:', response.roles?.length || 0)
      return { success: true, roles: response.roles || [] }
    } catch (error) {
      console.error('❌ Get roles error:', error)
      return { success: false, roles: [], message: error.message }
    }
  }

  // Module API access function - Updated to match your routes
  const accessModuleData = async (module) => {
    try {
      if (!token) return { success: false, message: 'No authentication token' }

      console.log(`🔗 Accessing ${module} module...`)
      
      // Try the user modules endpoint first
      try {
        const response = await apiCall(`/admin/user/modules/${module}/data`)
        console.log(`✅ Module ${module} accessed via user modules`)
        return { success: true, data: response }
      } catch (error) {
        // If that fails, return a mock success for now
        console.warn(`Module ${module} endpoint not found, returning mock data`)
        return { 
          success: true, 
          data: {
            summary: `Welcome to ${module} module`,
            module: module,
            timestamp: new Date().toISOString(),
            message: `${module} module accessed successfully`
          }
        }
      }
    } catch (error) {
      console.error(`❌ ${module} module access error:`, error)
      return { 
        success: false, 
        message: error.message || `Failed to access ${module} module` 
      }
    }
  }

  // Get admin statistics
  const getAdminStatistics = async () => {
    try {
      if (!token || !isAdmin()) return { success: false, statistics: null }

      console.log('📊 Fetching admin statistics...')
      
      try {
        const response = await apiCall('/admin/statistics')
        console.log('✅ Admin statistics loaded')
        return { success: true, statistics: response.statistics }
      } catch (error) {
        // Return mock statistics if endpoint doesn't exist
        console.warn('Statistics endpoint not found, returning mock data')
        return {
          success: true,
          statistics: {
            users: { total: 1, active: 1, inactive: 0 },
            system: { uptime: Date.now(), timestamp: new Date().toISOString() }
          }
        }
      }
    } catch (error) {
      console.error('❌ Get admin statistics error:', error)
      return { 
        success: false, 
        message: error.message || 'Failed to fetch statistics' 
      }
    }
  }

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          token: null,
          loading: true,
          login: () => Promise.resolve({ success: false, message: 'Loading...' }),
          logout: () => {},
          hasModuleAccess: () => false,
          isAdmin: () => false,
          checkAuthStatus: () => {},
          getAllUsers: () => Promise.resolve({ success: false, users: [] }),
          createUser: () => Promise.resolve({ success: false, message: 'Loading...' }),
          updateUser: () => Promise.resolve({ success: false, message: 'Loading...' }),
          deleteUser: () => Promise.resolve({ success: false, message: 'Loading...' }),
          toggleUserStatus: () => Promise.resolve({ success: false, message: 'Loading...' }),
          getAvailableRoles: () => Promise.resolve({ success: false, roles: [] }),
          accessModuleData: () => Promise.resolve({ success: false, message: 'Loading...' }),
          getAdminStatistics: () => Promise.resolve({ success: false, message: 'Loading...' })
        }}
      >
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasModuleAccess,
        isAdmin,
        checkAuthStatus,
        // User management functions
        getAllUsers,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        getAvailableRoles,
        // Module access function
        accessModuleData,
        // Admin functions
        getAdminStatistics,
        // Utility
        apiCall
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
