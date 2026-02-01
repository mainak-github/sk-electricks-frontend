'use client'

import { useState } from 'react'
import SalaryPayment from './SalaryPayment'
import AttendanceEntry from './AttendanceEntry'
import EmployeeEntry from './EmployeeEntry'
import DepartmentEntry from './DepartmentEntry'
import DesignationEntry from './DesignationEntry'
import SalaryPaymentReport from './SalaryPaymentReport'
import MonthlySalaryReport from './MonthlySalaryReport'
import EmployeeLedger from './EmployeeLedger'
import AttendanceReportPage from './AttendanceEntry'

export default function HRPayrollContent() {
  const [selectedModule, setSelectedModule] = useState(null)

  const hrModules = [
    { 
      id: 'salary-payment',
      name: 'Salary Payment Entry', 
      icon: '💰',
      description: 'Process monthly salary payments for employees',
      component: SalaryPayment
    },
    { 
      id: 'attendance-entry',
      name: 'Attendance Entry', 
      icon: '⏰',
      description: 'Record and manage employee attendance',
      component: AttendanceReportPage
    },
    { 
      id: 'employee-entry',
      name: 'Employee Entry', 
      icon: '👥',
      description: 'Add and manage employee information',
      component: EmployeeEntry
    },
    { 
      id: 'department-entry',
      name: 'Department Entry', 
      icon: '🏢',
      description: 'Create and manage department structure',
      component: DepartmentEntry
    },
    { 
      id: 'designation-entry',
      name: 'Designation Entry', 
      icon: '📋',
      description: 'Define employee roles and positions',
      component: DesignationEntry
    },
    { 
      id: 'salary-payment-report',
      name: 'Salary Payment Report', 
      icon: '📊',
      description: 'Generate salary payment reports',
      component: SalaryPaymentReport
    },
    { 
      id: 'monthly-salary-report',
      name: 'Monthly Salary Report', 
      icon: '📈',
      description: 'View monthly salary summaries',
      component: MonthlySalaryReport
    },
    // { 
    //   id: 'employee-ledger',
    //   name: 'Employee Ledger', 
    //   icon: '📖',
    //   description: 'Track individual employee transactions',
    //   component: EmployeeLedger
    // },

    // { 
    //   id: 'hr-entry',
    //   name: 'Hr Entry', 
    //   icon: '📖',
    //   description: 'Hr Entries',
    //   component: HRDashboard
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
            ← Back to HR & Payroll
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* HR Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {hrModules.map((module, index) => (
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