'use client'

import { useState, useMemo } from 'react'

export default function DailyStatement() {
  const [fromDate, setFromDate] = useState('2025-08-20')
  const [toDate, setToDate] = useState('2025-08-20')
  const [showReport, setShowReport] = useState(false)

  // Sample data for different categories
  const [statementData] = useState({
    salesPaid: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Product Sales - Cash', vchNo: 'SAL001', vchType: 'Sale', amount: 25000.00 },
      { id: 2, sl: 2, date: '20/08/2025', particular: 'Service Sales', vchNo: 'SAL002', vchType: 'Sale', amount: 15000.00 }
    ],
    purchasesPayment: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Raw Materials Purchase', vchNo: 'PUR001', vchType: 'Purchase', amount: 18000.00 },
      { id: 2, sl: 2, date: '20/08/2025', particular: 'Office Supplies', vchNo: 'PUR002', vchType: 'Purchase', amount: 3500.00 }
    ],
    servicePaid: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Consulting Service', vchNo: 'SRV001', vchType: 'Service', amount: 8000.00 }
    ],
    serviceExpense: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Maintenance Service', vchNo: 'EXP001', vchType: 'Expense', amount: 2500.00 }
    ],
    customerReceipt: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Payment from Client A', vchNo: 'RCP001', vchType: 'Receipt', amount: 22000.00 },
      { id: 2, sl: 2, date: '20/08/2025', particular: 'Payment from Client B', vchNo: 'RCP002', vchType: 'Receipt', amount: 18500.00 }
    ],
    supplierPayment: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Payment to Supplier X', vchNo: 'PAY001', vchType: 'Payment', amount: 15000.00 }
    ],
    incomes: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Interest Income', vchNo: 'INC001', vchType: 'Income', amount: 5000.00 },
      { id: 2, sl: 2, date: '20/08/2025', particular: 'Rental Income', vchNo: 'INC002', vchType: 'Income', amount: 12000.00 }
    ],
    expenses: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Office Rent', vchNo: 'EXP002', vchType: 'Expense', amount: 15000.00 },
      { id: 2, sl: 2, date: '20/08/2025', particular: 'Utilities', vchNo: 'EXP003', vchType: 'Expense', amount: 3500.00 }
    ],
    receivedFromBranches: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Transfer from Branch A', vchNo: 'TRF001', vchType: 'Transfer', amount: 25000.00 }
    ],
    paymentToBranches: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Transfer to Branch B', vchNo: 'TRF002', vchType: 'Transfer', amount: 20000.00 }
    ],
    paymentToEmployees: [
      { id: 1, sl: 1, date: '20/08/2025', particular: 'Salary Payment', vchNo: 'SAL003', vchType: 'Salary', amount: 45000.00 },
      { id: 2, sl: 2, date: '20/08/2025', particular: 'Bonus Payment', vchNo: 'BON001', vchType: 'Bonus', amount: 10000.00 }
    ]
  })

  const handleGetReport = () => {
    console.log('Generating daily statement report:', {
      fromDate,
      toDate
    })
    setShowReport(true)
  }

  // Calculate totals
  const totals = useMemo(() => {
    const calculateCategoryTotal = (category) => {
      return category.reduce((sum, item) => sum + item.amount, 0)
    }

    const receivedTotal = 
      calculateCategoryTotal(statementData.salesPaid) +
      calculateCategoryTotal(statementData.servicePaid) +
      calculateCategoryTotal(statementData.customerReceipt) +
      calculateCategoryTotal(statementData.incomes) +
      calculateCategoryTotal(statementData.receivedFromBranches)

    const paymentTotal = 
      calculateCategoryTotal(statementData.purchasesPayment) +
      calculateCategoryTotal(statementData.serviceExpense) +
      calculateCategoryTotal(statementData.supplierPayment) +
      calculateCategoryTotal(statementData.expenses) +
      calculateCategoryTotal(statementData.paymentToBranches) +
      calculateCategoryTotal(statementData.paymentToEmployees)

    const openingBalance = 1512323225534287.50
    const closingBalance = openingBalance + receivedTotal - paymentTotal

    return {
      receivedTotal,
      paymentTotal,
      openingBalance,
      closingBalance,
      salesPaidTotal: calculateCategoryTotal(statementData.salesPaid),
      purchasesPaymentTotal: calculateCategoryTotal(statementData.purchasesPayment),
      servicePaidTotal: calculateCategoryTotal(statementData.servicePaid),
      serviceExpenseTotal: calculateCategoryTotal(statementData.serviceExpense),
      customerReceiptTotal: calculateCategoryTotal(statementData.customerReceipt),
      supplierPaymentTotal: calculateCategoryTotal(statementData.supplierPayment),
      incomesTotal: calculateCategoryTotal(statementData.incomes),
      expensesTotal: calculateCategoryTotal(statementData.expenses),
      receivedFromBranchesTotal: calculateCategoryTotal(statementData.receivedFromBranches),
      paymentToBranchesTotal: calculateCategoryTotal(statementData.paymentToBranches),
      paymentToEmployeesTotal: calculateCategoryTotal(statementData.paymentToEmployees)
    }
  }, [statementData])

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  // Print functionality
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Daily Statement Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; color: #0d9488; }
            .header-info { margin: 20px 0; text-align: center; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: bold; margin-bottom: 10px; background-color: #f3f4f6; padding: 8px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .amount { text-align: right; }
            .totals { background-color: #f9f9f9; font-weight: bold; }
            .grid { display: flex; flex-wrap: wrap; }
            .grid-item { flex: 0 0 50%; }
          </style>
        </head>
        <body>
          <h1>Daily Statement Report</h1>
          <div class="header-info">
            <p>Period: ${formatDateForDisplay(fromDate)} to ${formatDateForDisplay(toDate)}</p>
            <p>Opening Balance: ${totals.openingBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
          
          <div class="grid">
            <div class="grid-item">
              <div class="section">
                <div class="section-title">SALES PAID AMOUNT</div>
                <table>
                  <thead><tr><th>SL</th><th>Date</th><th>Particular</th><th>VCH No</th><th>VCH Type</th><th>Amount</th></tr></thead>
                  <tbody>
                    ${statementData.salesPaid.map(item => `
                      <tr>
                        <td>${item.sl}</td><td>${item.date}</td><td>${item.particular}</td>
                        <td>${item.vchNo}</td><td>${item.vchType}</td><td class="amount">${item.amount.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                    <tr class="totals"><td colspan="5">Grand Total:</td><td class="amount">${totals.salesPaidTotal.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div class="grid-item">
              <div class="section">
                <div class="section-title">PURCHASES PAYMENT AMOUNT</div>
                <table>
                  <thead><tr><th>SL</th><th>Date</th><th>Particular</th><th>VCH No</th><th>VCH Type</th><th>Amount</th></tr></thead>
                  <tbody>
                    ${statementData.purchasesPayment.map(item => `
                      <tr>
                        <td>${item.sl}</td><td>${item.date}</td><td>${item.particular}</td>
                        <td>${item.vchNo}</td><td>${item.vchType}</td><td class="amount">${item.amount.toFixed(2)}</td>
                      </tr>
                    `).join('')}
                    <tr class="totals"><td colspan="5">Grand Total:</td><td class="amount">${totals.purchasesPaymentTotal.toFixed(2)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
          <div class="header-info">
            <p>Received Total Amount: ${totals.receivedTotal.toFixed(2)}</p>
            <p>Payment Total Amount: ${totals.paymentTotal.toFixed(2)}</p>
            <p>Closing Balance: ${totals.closingBalance.toLocaleString('en-US', {minimumFractionDigits: 2})}</p>
          </div>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Table component for cleaner code
  const StatementTable = ({ title, data, total }) => (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h4 className="font-semibold text-sm text-gray-800"># {title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">SL</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">Date</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">Particular</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">VCH No</th>
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r">VCH Type</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3 text-xs border-r">{item.sl}</td>
                <td className="py-2 px-3 text-xs border-r">{item.date}</td>
                <td className="py-2 px-3 text-xs border-r">{item.particular}</td>
                <td className="py-2 px-3 text-xs border-r">{item.vchNo}</td>
                <td className="py-2 px-3 text-xs border-r">{item.vchType}</td>
                <td className="py-2 px-3 text-xs text-right">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 border-t">
              <td className="py-2 px-3 text-xs border-r" colSpan="5">Grand Total :</td>
              <td className="py-2 px-3 text-xs text-right">{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="p-4">
      <div className="bg-white">
        {/* Header */}
        <h2 className="text-xl font-medium text-gray-800 mb-6">Daily Statement</h2>
        
        {/* Filter Section with Print Button */}
        <div className="flex items-center gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input 
              type="date"
              className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input 
              type="date"
              className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          
          <div className="flex items-end">
            <button 
              onClick={handleGetReport}
              className="bg-teal-600 text-white px-6 py-2 mt-7 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2"
            >
              🔍 GET REPORT
            </button>
          </div>

          {/* Print button */}
          <div className="flex items-end">
            <button 
              onClick={handlePrint}
              className="p-2 border mt-6 rounded hover:bg-gray-50 transition-colors"
              title="Print"
            >
              🖨️
            </button>
          </div>
        </div>

        {/* Report Content - Only show when showReport is true */}
        {showReport && (
          <div className="space-y-6">
            {/* Opening Balance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-base font-medium text-blue-800">
                Opening Balance: {totals.openingBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h3>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <StatementTable 
                  title="SALES PAID AMOUNT" 
                  data={statementData.salesPaid} 
                  total={totals.salesPaidTotal}
                />
                
                <StatementTable 
                  title="SERVICE PAID AMOUNT" 
                  data={statementData.servicePaid} 
                  total={totals.servicePaidTotal}
                />
                
                <StatementTable 
                  title="CUSTOMER RECEIPT AMOUNT" 
                  data={statementData.customerReceipt} 
                  total={totals.customerReceiptTotal}
                />
                
                <StatementTable 
                  title="INCOMES AMOUNT" 
                  data={statementData.incomes} 
                  total={totals.incomesTotal}
                />
                
                <StatementTable 
                  title="RECEIVED FROM BRANCHES" 
                  data={statementData.receivedFromBranches} 
                  total={totals.receivedFromBranchesTotal}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <StatementTable 
                  title="PURCHASES PAYMENT AMOUNT" 
                  data={statementData.purchasesPayment} 
                  total={totals.purchasesPaymentTotal}
                />
                
                <StatementTable 
                  title="SERVICE EXPENSE AMOUNT" 
                  data={statementData.serviceExpense} 
                  total={totals.serviceExpenseTotal}
                />
                
                <StatementTable 
                  title="SUPPLIER PAYMENT AMOUNT" 
                  data={statementData.supplierPayment} 
                  total={totals.supplierPaymentTotal}
                />
                
                <StatementTable 
                  title="EXPENSE AMOUNT" 
                  data={statementData.expenses} 
                  total={totals.expensesTotal}
                />
                
                <StatementTable 
                  title="PAYMENT TO BRANCHES" 
                  data={statementData.paymentToBranches} 
                  total={totals.paymentToBranchesTotal}
                />
                
                <StatementTable 
                  title="PAYMENT TO EMPLOYEES" 
                  data={statementData.paymentToEmployees} 
                  total={totals.paymentToEmployeesTotal}
                />
              </div>
            </div>

            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">RECEIVED TOTAL AMOUNT</h4>
                <p className="text-xl font-semibold text-green-700">{totals.receivedTotal.toFixed(2)}</p>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-red-800 mb-2">PAYMENT TOTAL AMOUNT</h4>
                <p className="text-xl font-semibold text-red-700">{totals.paymentTotal.toFixed(2)}</p>
              </div>
            </div>

            {/* Closing Balance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-base font-medium text-blue-800">
                Closing Balance: {totals.closingBalance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}