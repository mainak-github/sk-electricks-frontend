'use client'

import { useState } from 'react'
import { useNavigation } from '../../app/contexts/NavigationContext'
import SalesEntry from './SalesEntry'
import POSEntry from './POSEntry'
import CustomerEntry from './CustomerEntry'
import SalesReturnEntry from './SalesReturnEntry'
import ReplaceEntry from './ReplaceEntry'
import ViewSalesVouchers from './ViewSalesVouchers'
import ViewSalesReturn from './ViewSalesReturn'
import SalesRecord from './SalesRecord'
import SalesReturnRecord from './SalesReturnRecord'
import ReplaceRecord from './ReplaceRecord'

export default function SalesModuleContent() {
  const { activeSubPage } = useNavigation()
  const [selectedModule, setSelectedModule] = useState(null)

  const salesModules = [
    {
      id: 'sales-entry',
      name: 'Sales Entry',
      icon: '📝',
      description: 'Record new sales transactions',
      component: SalesEntry
    },
    {
      id: 'pos-entry',
      name: 'POS Entry',
      icon: '💳',
      description: 'Point of sale transactions',
      component: POSEntry
    },
    // {
    //   id: 'customer-entry',
    //   name: 'Customer Entry',
    //   icon: '👤',
    //   description: 'Add and manage customer information',
    //   component: CustomerEntry
    // },
    {
      id: 'sales-return-entry',
      name: 'Sales Return Entry',
      icon: '↩️',
      description: 'Process sales returns and refunds',
      component: SalesReturnEntry
    },
    // {
    //   id: 'replace-entry',
    //   name: 'Replace Entry',
    //   icon: '🔄',
    //   description: 'Process product replacements',
    //   component: ReplaceEntry
    // },
    {
      id: 'view-sales-vouchers',
      name: 'View Sales Vouchers',
      icon: '👁️',
      description: 'View and manage sales vouchers',
      component: ViewSalesVouchers
    },
    {
      id: 'view-sales-return',
      name: 'View Sales Return Voucher',
      icon: '📋',
      description: 'View sales return vouchers',
      component: ViewSalesReturn
    },
    // {
    //   id: 'sales-record',
    //   name: 'Sales Record',
    //   icon: '📊',
    //   description: 'View complete sales records',
    //   component: SalesRecord
    // },
    // {
    //   id: 'sales-return-record',
    //   name: 'Sales Return Record',
    //   icon: '📈',
    //   description: 'View sales return records',
    //   component: SalesReturnRecord
    // },
    // {
    //   id: 'replace-record',
    //   name: 'Replace Record',
    //   icon: '📋',
    //   description: 'View replacement records',
    //   component: ReplaceRecord
    // }
  ]

  const handleModuleClick = (module) => {
    setSelectedModule(module)
    console.log(`Navigating to ${module.name}`)
  }

  const handleBackClick = () => {
    setSelectedModule(null)
  }

  // Check if we should show a specific component directly from sidebar
  if (activeSubPage === 'SalesEntry') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <SalesEntry />
      </div>
    )
  }

  if (activeSubPage === 'POSEntry') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <POSEntry />
      </div>
    )
  }

  // If a module is selected from the grid
  if (selectedModule) {
    const SelectedComponent = selectedModule.component
    
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        {/* Back Navigation */}
        <div className="p-4 pb-0">
          <button 
            onClick={handleBackClick}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-700 transition-colors"
          >
            ← Back to Sales Module
          </button>
        </div>
        
        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  // Default: Show the sales module grid
  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* Sales Module Grid - Matching the 2x5 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {salesModules.map((module, index) => (
          <div
            key={index}
            onClick={() => handleModuleClick(module)}
            className="bg-teal-600 text-white p-4 rounded-lg shadow hover:shadow-md hover:bg-teal-700 transition-all cursor-pointer transform hover:scale-105"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{module.icon}</div>
              <div className="text-xs font-medium leading-tight h-8 flex items-center justify-center">
                {module.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}