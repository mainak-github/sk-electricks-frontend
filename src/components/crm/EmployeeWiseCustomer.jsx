'use client'

import { useState } from 'react'

export default function EmployeeWiseCustomer() {
  const [showTable, setShowTable] = useState(false)
  const [filterType, setFilterType] = useState('Date Wise')
  const [fromDate, setFromDate] = useState('19/08/2025')
  const [toDate, setToDate] = useState('19/08/2025')
  
  // Sample data matching the screenshot structure
  const employeeData = [
    {
      id: 1,
      sl: 1,
      employeeName: 'SOFT TASK',
      oldConversation: 0,
      newConversation: 0,
      pendingCustomer: 0,
      approvedCustomer: 0,
      rejectedCustomer: 0
    },
    {
      id: 2,
      sl: 2,
      employeeName: 'soft',
      oldConversation: 0,
      newConversation: 0,
      pendingCustomer: 0,
      approvedCustomer: 0,
      rejectedCustomer: 0
    },
    {
      id: 3,
      sl: 3,
      employeeName: 'Arshad',
      oldConversation: 0,
      newConversation: 0,
      pendingCustomer: 0,
      approvedCustomer: 0,
      rejectedCustomer: 0
    },
    {
      id: 4,
      sl: 4,
      employeeName: 'Abu',
      oldConversation: 0,
      newConversation: 0,
      pendingCustomer: 0,
      approvedCustomer: 0,
      rejectedCustomer: 0
    },
    {
      id: 5,
      sl: 5,
      employeeName: 'peyhun',
      oldConversation: 0,
      newConversation: 0,
      pendingCustomer: 0,
      approvedCustomer: 0,
      rejectedCustomer: 0
    }
  ]

  const handleGetList = () => {
    setShowTable(true)
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Employee Wise Customer Report</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Employee Wise Customer Report</h1>
            <p>Fatullah Factory</p>
          </div>
          <p><strong>Filter Type:</strong> ${filterType}</p>
          <p><strong>From Date:</strong> ${fromDate} | <strong>To Date:</strong> ${toDate}</p>
          <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Employee/ User Name</th>
                <th>Old Conversation</th>
                <th>New Conversation</th>
                <th>Pending Customer</th>
                <th>Approved Customer</th>
                <th>Rejected Customer</th>
              </tr>
            </thead>
            <tbody>
              ${employeeData.map((employee) => `
                <tr>
                  <td>${employee.sl}</td>
                  <td>${employee.employeeName}</td>
                  <td>${employee.oldConversation}</td>
                  <td>${employee.newConversation}</td>
                  <td>${employee.pendingCustomer}</td>
                  <td>${employee.approvedCustomer}</td>
                  <td>${employee.rejectedCustomer}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">Employee Wise Customer Report</h2>
          <span className="text-sm bg-teal-700 px-3 py-1 rounded">Fatullah Factory</span>
        </div>
        
        <div className="p-6">
          {/* Filter and Date Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">Filter Type</label>
              <select 
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="Date Wise">Date Wise</option>
                <option value="Month Wise">Month Wise</option>
                <option value="Year Wise">Year Wise</option>
              </select>
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input 
                type="text"
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input 
                type="text"
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={handleGetList}
              className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              🔍 GET LIST
            </button>

            <button 
              onClick={handlePrint}
              className="p-2 border rounded hover:bg-gray-50 transition-colors"
              title="Print"
            >
              🖨️
            </button>
          </div>

          {/* Table Section - Only shows when GET LIST is clicked */}
          {showTable && (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">SL</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Employee/ User Name</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Old Conversation</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">New Conversation</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Pending Customer</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Approved Customer</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Rejected Customer</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeData.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-3 py-2 text-xs text-center">{employee.sl}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs font-medium">{employee.employeeName}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs text-center">{employee.oldConversation}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs text-center">{employee.newConversation}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs text-center">{employee.pendingCustomer}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs text-center">{employee.approvedCustomer}</td>
                      <td className="border border-gray-300 px-3 py-2 text-xs text-center">{employee.rejectedCustomer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!showTable && (
            <div className="text-center py-12 text-gray-500">
              <p>Click "GET LIST" to display employee-wise customer data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}