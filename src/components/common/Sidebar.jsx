// components/common/Sidebar.js
'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, LogOut, Shield, Lock } from 'lucide-react'
import { useNavigation } from '../../app/contexts/NavigationContext'
import { useAuth } from '../../app/contexts/AuthContext'

export default function Sidebar() {
  const { setActiveTab } = useNavigation()
  const { user, logout, hasModuleAccess, isAdmin } = useAuth()
  
  const [expandedSections, setExpandedSections] = useState({
    entries: true,
    records: false,
    reports: false,
    accounts: false,
    banking: false,
    admin: false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
    }
  }

  // Define menu items with required module access
  const menuItems = [
    {
      id: 'entries',
      title: 'Data Entry',
      icon: '📝',
      items: [
        { 
          name: 'Sales Entry', 
          tab: 'sales', 
          subPage: 'SalesEntry',
          requiredModule: 'sales',
          description: 'Create new sales records'
        },
        { 
          name: 'POS Entry', 
          tab: 'sales', 
          subPage: 'POSEntry',
          requiredModule: 'sales',
          description: 'Point of sale transactions'
        },
        { 
          name: 'Purchase Entry', 
          tab: 'purchase', 
          subPage: 'PurchaseEntry',
          requiredModule: 'purchase',
          description: 'Record purchase transactions'
        },
        { 
          name: 'Receipt Entry', 
          tab: 'accounts', 
          subPage: 'ReceiptEntry',
          requiredModule: 'accounts',
          description: 'Customer payment receipts'
        },
        { 
          name: 'Payment Entry', 
          tab: 'accounts', 
          subPage: 'PaymentEntry',
          requiredModule: 'accounts',
          description: 'Supplier payments'
        },
        { 
          name: 'Expense Entry', 
          tab: 'accounts', 
          subPage: 'ExpenseEntry',
          requiredModule: 'accounts',
          description: 'Business expense records'
        },
        { 
          name: 'Product Entry', 
          tab: 'inventory', 
          subPage: 'ProductEntry',
          requiredModule: 'inventory',
          description: 'Add new products'
        }
      ]
    },
    {
      id: 'records',
      title: 'Records',
      icon: '📊',
      items: [
        { 
          name: 'Sales Record', 
          tab: 'sales',
          requiredModule: 'sales',
          description: 'View sales history'
        },
        { 
          name: 'Purchase Record', 
          tab: 'purchase',
          requiredModule: 'purchase',
          description: 'View purchase history'
        },
        { 
          name: 'Quotation Record', 
          tab: 'quotation',
          requiredModule: 'quotation',
          description: 'View quotations'
        },
        { 
          name: 'Order Record', 
          tab: 'order',
          requiredModule: 'order',
          description: 'View order history'
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      icon: '📈',
      items: [
        { 
          name: 'Stock Report', 
          tab: 'reports',
          requiredModule: 'reports',
          description: 'Inventory stock levels'
        },
        { 
          name: 'Sales Report', 
          tab: 'reports',
          requiredModule: 'reports',
          description: 'Sales performance'
        },
        { 
          name: 'Financial Report', 
          tab: 'reports',
          requiredModule: 'reports',
          description: 'Financial statements'
        }
      ]
    },
    {
      id: 'accounts',
      title: 'Accounts',
      icon: '💰',
      items: [
        { 
          name: 'Customer Due Balance', 
          tab: 'accounts',
          requiredModule: 'accounts',
          description: 'Outstanding customer payments'
        },
        { 
          name: 'Supplier Due Balance', 
          tab: 'accounts',
          requiredModule: 'accounts',
          description: 'Outstanding supplier payments'
        },
        { 
          name: 'Customer Ledger', 
          tab: 'accounts',
          requiredModule: 'accounts',
          description: 'Customer transaction history'
        },
        { 
          name: 'Supplier Ledger', 
          tab: 'accounts',
          requiredModule: 'accounts',
          description: 'Supplier transaction history'
        }
      ]
    },
    {
      id: 'banking',
      title: 'Banking',
      icon: '🏦',
      items: [
        { 
          name: 'Cash & Bank Balance', 
          tab: 'accounts',
          requiredModule: 'accounts',
          description: 'Current cash and bank balances'
        },
        { 
          name: 'Cash & Bank Ledger', 
          tab: 'accounts',
          requiredModule: 'accounts',
          description: 'Cash and bank transaction history'
        }
      ]
    }
  ]

  // Filter menu items based on user's module access
  const getFilteredMenuItems = () => {
    return menuItems.map(section => ({
      ...section,
      items: section.items.filter(item => hasModuleAccess(item.requiredModule))
    })).filter(section => section.items.length > 0) // Remove sections with no accessible items
  }

  const filteredMenuItems = getFilteredMenuItems()

  // Check if user has access to any item in a section
  const sectionHasAccess = (section) => {
    return section.items.some(item => hasModuleAccess(item.requiredModule))
  }

  const handleMenuItemClick = (item) => {
    if (hasModuleAccess(item.requiredModule)) {
      setActiveTab(item.tab, item.subPage)
    } else {
      alert(`Access denied to ${item.requiredModule} module. Contact admin for access.`)
    }
  }

  return (
    <div className="w-60 bg-gray-50 border-r border-gray-200 h-screen overflow-y-auto">
      <div className="p-4">
        {/* Header Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Menu</h2>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500">
              Role: <span className="font-medium text-gray-700 capitalize">
                {user?.role?.replace('_', ' ')}
              </span>
            </span>
            {isAdmin() && (
              <div className="flex items-center text-xs text-green-600">
                <Shield size={12} className="mr-1" />
                <span>Admin</span>
              </div>
            )}
          </div>
        </div>
        
        <nav className="space-y-2">
          {filteredMenuItems.map((section) => (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title={`${section.items.length} items available`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{section.icon}</span>
                  <span>{section.title}</span>
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {section.items.length}
                  </span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {/* Section Items */}
              {expandedSections[section.id] && (
                <div className="ml-4 space-y-1">
                  {section.items.map((item) => {
                    const hasAccess = hasModuleAccess(item.requiredModule)
                    
                    return (
                      <div key={item.name} className="relative">
                        <button
                          onClick={() => handleMenuItemClick(item)}
                          disabled={!hasAccess}
                          className={`
                            block w-full text-left px-3 py-2 text-sm rounded-md transition-colors group
                            ${hasAccess 
                              ? 'text-gray-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer' 
                              : 'text-gray-400 cursor-not-allowed bg-gray-100'
                            }
                          `}
                          title={hasAccess ? item.description : `Access denied - requires ${item.requiredModule} module`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="flex-1">{item.name}</span>
                            {!hasAccess && (
                              <Lock size={12} className="text-gray-400 ml-2" />
                            )}
                          </div>
                          {item.description && hasAccess && (
                            <div className="text-xs text-gray-400 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.description}
                            </div>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Admin Section - Only visible to admin */}
          {isAdmin() && (
            <div className="space-y-1 border-t border-gray-300 pt-4 mt-4">
              <button
                onClick={() => toggleSection('admin')}
                className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <span className="mr-2">⚙️</span>
                  <span>Admin Panel</span>
                </div>
                {expandedSections.admin ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}
              </button>

              {expandedSections.admin && (
                <div className="ml-4 space-y-1">
                  <button
                    onClick={() => setActiveTab('user-management')}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    👥 User Management
                  </button>
                  {/* <button
                    onClick={() => setActiveTab('role-management')}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    🔐 Role Management
                  </button> */}
                  {/* <button
                    onClick={() => setActiveTab('system-settings')}
                    className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    ⚙️ System Settings
                  </button> */}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Access Summary */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-700 mb-2">
            <strong>Your Access Level</strong>
          </div>
          <div className="text-xs text-blue-600">
            <div className="flex justify-between mb-1">
              <span>Allowed Modules:</span>
              <span className="font-medium">{user?.allowedModules?.length || 0}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Available Menu Items:</span>
              <span className="font-medium">
                {filteredMenuItems.reduce((total, section) => total + section.items.length, 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Current Role:</span>
              <span className="font-medium capitalize">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        {/* Settings and Logout at bottom */}
        <div className="mt-6 pt-4 border-t border-gray-200 space-y-1">
          <button
            onClick={() => setActiveTab('settings')}
            className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            ⚙️ Settings
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center w-full text-left px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center text-xs text-gray-400">
            <p>SK Electrics ERP</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}
