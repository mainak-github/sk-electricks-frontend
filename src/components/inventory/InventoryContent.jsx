'use client'

import { useState } from 'react'
import ItemStockReport from './ItemStockReport'
import ItemLedger from './ItemLedger'
import ItemReOrderList from './ItemReOrderList'
import TransferEntry from './TransferEntry'
import ItemAdjustmentEntry from './ItemAdjustmentEntry'
import AdjustmentRecord from './AdjustmentRecord'
import TransferRecord from './TransferRecord'
import TransferPendingRecord from './TransferPendingRecord'
import TransferReceiveRecord from './TransferReceiveRecord'
import ItemsPage from './Itementries'
import CategoriesManagement from './ItemsCategories'

export default function InventoryContent() {
  const [selectedModule, setSelectedModule] = useState(null)

  const inventoryModules = [

    
    {
      id: 'item-Entries-report',
      name: 'Item Entries Report',
      icon: '📦',
      description: 'View item Entries reports',
      component: ItemsPage
    },

     {
      id: 'item-categories-Entries-report',
      name: 'Item Categories Entries Report',
      icon: '📦',
      description: 'View item Categories Entries reports',
      component: CategoriesManagement
    },

    {
      id: 'item-stock-report',
      name: 'Item Stock Report',
      icon: '📦',
      description: 'View item stock reports',
      component: ItemStockReport
    },
    // {
    //   id: 'item-ledger',
    //   name: 'Item Ledger',
    //   icon: '📦',
    //   description: 'Track item ledger entries',
    //   component: ItemLedger
    // },
    // {
    //   id: 'item-reorder-list',
    //   name: 'Item Re Order List',
    //   icon: '📦',
    //   description: 'Manage item reorder list',
    //   component: ItemReOrderList
    // },
    // {
    //   id: 'transfer-entry',
    //   name: 'Transfer Entry',
    //   icon: '📝',
    //   description: 'Create transfer entries',
    //   component: TransferEntry
    // },
    {
      id: 'item-adjustment-entry',
      name: 'Item Adjustment Entry',
      icon: '📝',
      description: 'Create item adjustment entries',
      component: ItemAdjustmentEntry
    },
    {
      id: 'adjustment-record',
      name: 'Adjustment Record',
      icon: '📦',
      description: 'View adjustment records',
      component: AdjustmentRecord
    },
    // {
    //   id: 'transfer-record',
    //   name: 'Transfer Record',
    //   icon: '📦',
    //   description: 'View transfer records',
    //   component: TransferRecord
    // },
    // {
    //   id: 'transfer-pending-record',
    //   name: 'Transfer Pending Record',
    //   icon: '📦',
    //   description: 'View transfer pending records',
    //   component: TransferPendingRecord
    // },
    // {
    //   id: 'transfer-receive-record',
    //   name: 'Transfer Receive Record',
    //   icon: '📊',
    //   description: 'View transfer receive records',
    //   component: TransferReceiveRecord
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
            ← Back to Inventory Module
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* Inventory Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {inventoryModules.map((module, index) => (
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