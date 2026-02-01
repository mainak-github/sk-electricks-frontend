// components/common/Header.js
'use client'

import {
  LayoutDashboard,
  ShoppingCart,
  Monitor,
  FileText,
  Package,
  Wrench,
  ShoppingBag,
  Building,
  Archive,
  Calculator,
  Users,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { useState } from 'react'
import { useNavigation } from '../../app/contexts/NavigationContext'
import { useAuth } from '../../app/contexts/AuthContext'

export default function Header() {
  const { activeTab, setActiveTab } = useNavigation()
  const { user, logout, hasModuleAccess, isAdmin } = useAuth()
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // All available navigation items
  const allNavigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'sales', label: 'Sales', icon: ShoppingCart, path: '/sales' },
    { id: 'quotation', label: 'Quotation', icon: FileText, path: '/quotation' },
    { id: 'order', label: 'Order', icon: Package, path: '/order' },
    { id: 'service', label: 'Service', icon: Wrench, path: '/service' },
    { id: 'purchase', label: 'Purchase', icon: ShoppingBag, path: '/purchase' },
    { id: 'manufacturing', label: 'Manufacturing', icon: Building, path: '/manufacturing' },
    { id: 'inventory', label: 'Inventory', icon: Archive, path: '/inventory' },
    { id: 'accounts', label: 'Accounts', icon: Calculator, path: '/accounts' },
    { id: 'hr-payroll', label: 'HR&Payroll', icon: Users, path: '/hr-payroll' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports' },
    { id: 'crm', label: 'CRM', icon: UserCog, path: '/crm' }
  ]

  // Filter navigation items based on user's module access
  const allowedNavigationItems = allNavigationItems.filter(item => 
    hasModuleAccess(item.id)
  )

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  const handleTabClick = (itemId) => {
    if (hasModuleAccess(itemId)) {
      setActiveTab(itemId)
    } else {
      alert(`Access denied to ${itemId} module. Contact admin for access.`)
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex">
        {/* Logo Section */}
        <div className="flex items-center px-8 py-3 border-r border-gray-200 bg-gray-50 min-w-[200px]">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SK</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-800">SK Electrics</h1>
              <p className="text-xs text-gray-500">ERP System</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Only show allowed modules */}
        <nav className="flex overflow-x-auto flex-1">
          {allowedNavigationItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`
                  flex flex-col items-center justify-center min-w-[90px] px-4 py-3 border-b-2 transition-all duration-200
                  ${isActive
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-transparent hover:border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                  }
                `}
                title={`Access ${item.label} module`}
              >
                <IconComponent size={20} className="mb-1" />
                <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
              </button>
            )
          })}

          {/* Admin Panel Tab - Only visible to admin */}
          {isAdmin() && (
            <button
              onClick={() => setActiveTab('user-management')}
              className={`
                flex flex-col items-center justify-center min-w-[90px] px-4 py-3 border-b-2 transition-all duration-200 bg-red-50
                ${activeTab === 'user-management'
                  ? 'border-red-500 bg-red-100 text-red-600'
                  : 'border-transparent hover:border-red-300 hover:bg-red-100 text-red-600 hover:text-red-800'
                }
              `}
              title="Admin Panel - User Management"
            >
              <Settings size={20} className="mb-1" />
              <span className="text-xs font-medium whitespace-nowrap">Admin</span>
            </button>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="flex items-center border-l border-gray-200 bg-gray-50">
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-3 px-6 py-3 text-gray-700 hover:bg-gray-100 focus:outline-none"
              title="User Menu"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="py-2">
                  {/* User Info Header */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {user?.role?.replace('_', ' ')}
                      </span>
                      {isAdmin() && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Module Access Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Module Access:</p>
                    <div className="flex flex-wrap gap-1">
                      {user?.allowedModules?.slice(0, 4).map((module) => (
                        <span
                          key={module}
                          className="inline-flex px-2 py-1 text-xs rounded bg-gray-100 text-gray-600"
                        >
                          {module}
                        </span>
                      ))}
                      {user?.allowedModules?.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{user?.allowedModules?.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserDropdown(false)
                        // Handle profile navigation
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <User size={16} className="mr-3" />
                      Profile Settings
                    </button>

                    {isAdmin() && (
                      <button
                        onClick={() => {
                          setShowUserDropdown(false)
                          setActiveTab('user-management')
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Settings size={16} className="mr-3" />
                        Manage Users
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setShowUserDropdown(false)
                        handleLogout()
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Indicator Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-8 py-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <span>Welcome, <strong>{user?.username}</strong></span>
            <span>•</span>
            <span>Branch: <strong>{user?.branch || 'Main Branch'}</strong></span>
            <span>•</span>
            <span>Access Level: <strong>{allowedNavigationItems.length} / 12 Modules</strong></span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Current Time: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
