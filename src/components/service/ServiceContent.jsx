'use client'

import { useState } from 'react'
import ServiceEntry from './ServiceEntry'
import ServiceExpenseEntry from './ServiceExpenseEntry'
import ViewServiceVouchers from './ViewServiceVouchers'
import ViewServiceExpense from './ViewServiceExpense'
import ServiceRecord from './ServiceRecord'
import ServiceExpenseRecord from './ServiceExpenseRecord'
import ServiceProgressReport from './ServicePeogress'

export default function ServiceContent() {
  const [selectedModule, setSelectedModule] = useState(null)

  const serviceModules = [
    {
      id: 'service-entry',
      name: 'Service Entry',
      icon: '📝',
      description: 'Create new service entries',
      component: ServiceEntry
    },
       {
      id: 'service-progress-entry',
      name: 'Service Progress Entry',
      icon: '📝',
      description: 'Create new service progress entries',
      component: ServiceProgressReport
    },
    {
      id: 'service-expense-entry',
      name: 'Service Expense Entry',
      icon: '💰',
      description: 'Create service expense entries',
      component: ServiceExpenseEntry
    },
    {
      id: 'view-service-vouchers',
      name: 'View Service Vouchers',
      icon: '📋',
      description: 'View service vouchers',
      component: ViewServiceVouchers
    },
    {
      id: 'view-service-expense',
      name: 'View Service Expense Vouchers',
      icon: '📊',
      description: 'View service expense vouchers',
      component: ViewServiceExpense
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
            ← Back to Service Module
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* Service Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {serviceModules.map((module, index) => (
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