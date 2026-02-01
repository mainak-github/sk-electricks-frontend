// contexts/NavigationContext.js
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const NavigationContext = createContext()

export function NavigationProvider({ children }) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeSubPage, setActiveSubPage] = useState(null)
  const { user, hasModuleAccess, isAdmin } = useAuth()

  // All available modules configuration
  const allModules = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'sales', label: 'Sales' },
    { key: 'quotation', label: 'Quotation' },
    { key: 'order', label: 'Order' },
    { key: 'service', label: 'Service' },
    { key: 'purchase', label: 'Purchase' },
    { key: 'manufacturing', label: 'Manufacturing' },
    { key: 'inventory', label: 'Inventory' },
    { key: 'accounts', label: 'Accounts' },
    { key: 'hr-payroll', label: 'HR&Payroll' },
    { key: 'reports', label: 'Reports' },
    { key: 'crm', label: 'CRM' }
  ]

  // Filter modules based on user access
  const availableModules = allModules.filter(module => 
    hasModuleAccess && hasModuleAccess(module.key)
  )

  // Auto-redirect to first available module if current tab is not accessible
  useEffect(() => {
    if (user && availableModules.length > 0) {
      // Check if current active tab is accessible
      const currentTabAccessible = hasModuleAccess(activeTab) || 
                                   activeTab === 'user-management' ||
                                   activeTab === 'role-management' ||
                                   activeTab === 'system-settings' ||
                                   activeTab === 'settings'

      // If current tab is not accessible, switch to first available module
      if (!currentTabAccessible) {
        setActiveTab(availableModules[0]?.key || 'dashboard')
        setActiveSubPage(null)
      }
    }
  }, [user, availableModules, activeTab, hasModuleAccess])

  const handleSetActiveTab = (tab, subPage = null) => {
    // Admin-only tabs
    const adminTabs = ['user-management', 'role-management', 'system-settings']
    
    // Settings tab - accessible to all users
    if (tab === 'settings') {
      setActiveTab(tab)
      setActiveSubPage(subPage)
      return
    }

    // Admin tabs - only accessible to admin
    if (adminTabs.includes(tab)) {
      if (isAdmin && isAdmin()) {
        setActiveTab(tab)
        setActiveSubPage(subPage)
      } else {
        console.warn(`Access denied to admin tab: ${tab}`)
        alert('Admin privileges required to access this section.')
      }
      return
    }

    // Regular module tabs - check module access
    if (hasModuleAccess && hasModuleAccess(tab)) {
      setActiveTab(tab)
      setActiveSubPage(subPage)
    } else {
      console.warn(`Access denied to module: ${tab}`)
      alert(`You don't have permission to access the ${tab} module. Contact your administrator.`)
    }
  }

  // Helper function to check if a tab is accessible
  const isTabAccessible = (tab) => {
    if (!hasModuleAccess) return false
    
    const adminTabs = ['user-management', 'role-management', 'system-settings']
    
    if (adminTabs.includes(tab)) {
      return isAdmin && isAdmin()
    }
    
    if (tab === 'settings') {
      return true // Settings accessible to all
    }
    
    return hasModuleAccess(tab)
  }

  // Get user's accessible modules count
  const getAccessibleModulesCount = () => {
    return availableModules.length
  }

  // Get all accessible tabs (including admin tabs if applicable)
  const getAllAccessibleTabs = () => {
    let accessibleTabs = [...availableModules.map(m => m.key)]
    
    // Add settings for all users
    accessibleTabs.push('settings')
    
    // Add admin tabs for admin users
    if (isAdmin && isAdmin()) {
      accessibleTabs.push('user-management', 'role-management', 'system-settings')
    }
    
    return accessibleTabs
  }

  return (
    <NavigationContext.Provider 
      value={{ 
        activeTab, 
        activeSubPage,
        setActiveTab: handleSetActiveTab,
        allModules,
        availableModules,
        isTabAccessible,
        getAccessibleModulesCount,
        getAllAccessibleTabs
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
