'use client'

import { useState } from 'react'
import SalesOrderEntry from './SalesOrderEntry'
import PurchaseOrderEntry from './PurchaseOrderEntry'
import SalesOrderVouchers from './SalesOrderVouchers'
import PurchaseOrderVouchers from './PurchaseOrderVouchers'
import PurchaseOrderRecord from './PurchaseOrderRecord'
import SalesOrderRecord from './SalesOrderRecord'

export default function OrdersContent() {
  const [selectedModule, setSelectedModule] = useState(null)

  const orderModules = [
    {
      id: 'sales-order-entry',
      name: 'Sales Order Entry',
      icon: '📝',
      description: 'Create new sales order entries',
      component: SalesOrderEntry
    },
    {
      id: 'purchase-order-entry',
      name: 'Purchase Order Entry',
      icon: '📝',
      description: 'Create new purchase order entries',
      component: PurchaseOrderEntry
    },
    {
      id: 'sales-order-vouchers',
      name: 'Sales Order Vouchers',
      icon: '🧾',
      description: 'Manage sales order vouchers',
      component: SalesOrderVouchers
    },
    {
      id: 'purchase-order-vouchers',
      name: 'Purchase Order Vouchers',
      icon: '🧾',
      description: 'Manage purchase order vouchers',
      component: PurchaseOrderVouchers
    },
    // {
    //   id: 'purchase-order-record',
    //   name: 'Purchase Order Record',
    //   icon: '📊',
    //   description: 'View complete purchase order records',
    //   component: PurchaseOrderRecord
    // },
    // {
    //   id: 'sales-order-record',
    //   name: 'Sales Order Record',
    //   icon: '📊',
    //   description: 'View complete sales order records',
    //   component: SalesOrderRecord
    // }
  ]

  const handleModuleClick = (module) => {
    setSelectedModule(module)
    // In a real application, this would navigate to the specific module
    console.log(`Navigating to ${module.name}`)
  }

  const handleBackClick = () => {
    setSelectedModule(null)
  }

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
            ← Back to Order Module
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* Order Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {orderModules.map((module, index) => (
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