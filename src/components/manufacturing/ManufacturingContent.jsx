'use client'

import { useState } from 'react'
import ManufacturingJournalEntry from './ManufacturingJournalEntry'
import ManufacturingVouchers from './ManufacturingVouchers'
import ManufacturingRecord from './ManufacturingRecord'

export default function ManufacturingContent() {
  const [selectedModule, setSelectedModule] = useState(null)

  const manufacturingModules = [
    {
      id: 'manufacturing-journal-entry',
      name: 'Manufacturing Journal Entry',
      icon: '📝',
      description: 'Create manufacturing journal entries',
      component: ManufacturingJournalEntry
    },
    {
      id: 'manufacturing-vouchers',
      name: 'Manufacturing Journal Vouchers',
      icon: '🧾',
      description: 'Manage manufacturing vouchers',
      component: ManufacturingVouchers
    },
    {
      id: 'manufacturing-record',
      name: 'Manufacturing Journal Record',
      icon: '📊',
      description: 'View manufacturing records',
      component: ManufacturingRecord
    }
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
            ← Back to Manufacturing Module
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* Manufacturing Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {manufacturingModules.map((module, index) => (
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