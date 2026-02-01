'use client'

import { useState } from 'react'
import CustomerEntry from './CustomerEntry'
import PendingCustomerList from './PendingCustomerList'
import ApprovedCustomerList from './ApprovedCustomerList'
import RejectedCustomerList from './RejectedCustomerList'
import EmployeeWiseCustomer from './EmployeeWiseCustomer'

export default function CRMContent() {
  const [selectedModule, setSelectedModule] = useState(null)

  const crmModules = [
    {
      id: 'customer-entry',
      name: 'Customer Entry',
      icon: '👤',
      description: 'Add new customer entries',
      component: CustomerEntry
    },
    {
      id: 'pending-customer-list',
      name: 'Pending Customer List',
      icon: '⏳',
      description: 'View pending customer list',
      component: PendingCustomerList
    },
    {
      id: 'approved-customer-list',
      name: 'Approved Customer List',
      icon: '✅',
      description: 'View approved customer list',
      component: ApprovedCustomerList
    },
    {
      id: 'rejected-customer-list',
      name: 'Rejected Customer List',
      icon: '❌',
      description: 'View rejected customer list',
      component: RejectedCustomerList
    },
    // {
    //   id: 'employee-wise-customer',
    //   name: 'Employee Wise Customer',
    //   icon: '👥',
    //   description: 'View employee wise customer data',
    //   component: EmployeeWiseCustomer
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
            ← Back to CRM Module
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* CRM Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {crmModules.map((module, index) => (
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