'use client'

import { useState } from 'react'
import { useNavigation } from '../../app/contexts/NavigationContext'
import PurchaseEntry from './PurchaseEntry'
import SupplierEntry from './SupplierEntry'
import PurchaseReturnEntry from './PurchaseReturnEntry'
import ViewPurchaseVouchers from './ViewPurchaseVouchers'
import ViewPurchaseReturnVouchers from './ViewPurchaseReturnVouchers'
import PurchaseRecord from './PurchaseRecord'
import PurchaseReturnRecord from './PurchaseReturnRecord'

export default function PurchaseModuleContent() {
  const [selectedModule, setSelectedModule] = useState(null)
  const { activeSubPage } = useNavigation()

  const purchaseModules = [
    {
      id: 'purchase-entry',
      name: 'Purchase Entry',
      icon: '📝',
      description: 'Record new purchase transactions',
      component: PurchaseEntry
    },
    {
      id: 'supplier-entry',
      name: 'Supplier Entry',
      icon: '🏭',
      description: 'Add and manage supplier information',
      component: SupplierEntry
    },
    {
      id: 'purchase-return-entry',
      name: 'Purchase Return Entry',
      icon: '↩️',
      description: 'Process purchase returns and refunds',
      component: PurchaseReturnEntry
    },
    {
      id: 'view-purchase-vouchers',
      name: 'View Purchase Vouchers',
      icon: '👁️',
      description: 'View and manage purchase vouchers',
      component: ViewPurchaseVouchers
    },
    {
      id: 'view-purchase-return-vouchers',
      name: 'View Purchase Return Vouchers',
      icon: '📋',
      description: 'View purchase return vouchers',
      component: ViewPurchaseReturnVouchers
    },
    // {
    //   id: 'purchase-record',
    //   name: 'Purchase Record',
    //   icon: '📊',
    //   description: 'View complete purchase records',
    //   component: PurchaseRecord
    // },
    // {
    //   id: 'purchase-return-record',
    //   name: 'Purchase Return Record',
    //   icon: '📈',
    //   description: 'View purchase return records',
    //   component: PurchaseReturnRecord
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

  // Check if we should show a specific component directly from sidebar
  if (activeSubPage === 'PurchaseEntry') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <PurchaseEntry />
      </div>
    )
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
            ← Back to Purchase Module
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* Purchase Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {purchaseModules.map((module, index) => (
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