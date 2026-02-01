'use client'

import { useState } from 'react'
import CustomerReceiptEntry from './CustomerReceiptEntry'
import SupplierPaymentEntry from './SupplierPaymentEntry'
import ExpenseEntry from './ExpenseEntry'
import ExpenseRecognition from './ExpenseRecognition'
import IncomeEntry from './IncomeEntry'
import ContraSingleEntry from './ContraSingleEntry'
import AdvanceTransaction from './AdvanceTransaction'
import JournalDoubleEntry from './JournalDoubleEntry'
import BranchTransaction from './BranchTransaction'
import AccountEntry from './AccountEntry'
import LocationEntry from './LocationEntry'

export default function AccountsContent() {
  const [selectedModule, setSelectedModule] = useState(null)

  const accountsModules = [
    {
      id: 'customer-receipt-entry',
      name: 'Customer Receipt Entry',
      icon: '📝',
      description: 'Manage customer receipt entries',
      component: CustomerReceiptEntry
    },
    {
      id: 'supplier-payment-entry',
      name: 'Supplier Payment Entry',
      icon: '💳',
      description: 'Handle supplier payment entries',
      component: SupplierPaymentEntry
    },
    {
      id: 'expense-entry',
      name: 'Expense Entry',
      icon: '💰',
      description: 'Record expense entries',
      component: ExpenseEntry
    },
    {
      id: 'expense-recognition',
      name: 'Expense Recognition',
      icon: '🔍',
      description: 'Manage expense recognition',
      component: ExpenseRecognition
    },
    {
      id: 'income-entry',
      name: 'Income Entry',
      icon: '💵',
      description: 'Record income entries',
      component: IncomeEntry
    },
    {
      id: 'contra-single-entry',
      name: 'Contra/ Single Entry',
      icon: '📊',
      description: 'Handle contra and single entries',
      component: ContraSingleEntry
    },
    {
      id: 'advance-transaction',
      name: 'Advance Transaction',
      icon: '⏭️',
      description: 'Manage advance transactions',
      component: AdvanceTransaction
    },
    {
      id: 'journal-double-entry',
      name: 'Journal/ Double Entry',
      icon: '📚',
      description: 'Handle journal and double entries',
      component: JournalDoubleEntry
    },
    {
      id: 'branch-transaction',
      name: 'Branch Transaction',
      icon: '🏢',
      description: 'Manage branch transactions',
      component: BranchTransaction
    },
    {
      id: 'account-entry',
      name: 'Account Entry',
      icon: '📋',
      description: 'General account entries',
      component: AccountEntry
    },
    {
      id: 'location-entry',
      name: 'Location Entry',
      icon: '📍',
      description: 'Manage location entries',
      component: LocationEntry
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
            ← Back to Accounts Module
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* Accounts Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {accountsModules.map((module, index) => (
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