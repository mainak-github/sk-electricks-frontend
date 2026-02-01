'use client'

import { useState } from 'react'
import { useNavigation } from '../../app/contexts/NavigationContext'
import CustomerDueBalance from './CustomerDueBalance'
import SupplierDueBalance from './SupplierDueBalance'
import CustomerLedger from './CustomerLedger'
import SupplierLedger from './SupplierLedger'
import SalesCollectionRecord from './SalesCollectionRecord'
import CustomerReceiptRecord from './CustomerReceiptRecord'
import CashBankAccounts from './CashBankAccounts'
import CashBankAccountLedger from './CashBankAccountLedger'
import ExpenseBalanceReport from './ExpenseBalanceReport'
import ExpenseRecord from './ExpenseRecord'
import DailyLedger from './DailyLedger'
import DailyStatement from './DailyStatement'
import ItemStockReport from './ItemStockReport'
import ProfitLoss from './ProfitLoss'
import ProductWiseProfitLoss from './ProductWiseProfitLoss'
import BillWiseProfitLoss from './BillWiseProfitLoss'
import LoanAccountsBalance from './LoanAccountsBalance'
import BalanceSheet from './BalanceSheet'
import TrialBalance from './TrialBalance'
import BranchTransactionPendingList from './BranchTransactionPendingList'
import BranchTransactionReceivedList from './BranchTransactionReceivedList'
import BranchTransactionTransferList from './BranchTransactionTransferList'
import AdvanceCustomerBalance from './AdvanceCustomerBalance'
import AdvanceSupplierBalance from './AdvanceSupplierBalance'
import IndirectIncomeAccountsBalance from './IndirectIncomeAccountsBalance'
import FixedAssetAccountsBalance from './FixedAssetAccountsBalance'
import CapitalAccountsBalance from './CapitalAccountsBalance'
import BranchBalanceReport from './BranchBalanceReport'
import IndirectExpenseAccountLedger from './IndirectExpenseAccountLedger'
import FixedAssetAccountLedger from './FixedAssetAccountLedger'
import LoanAccountLedger from './LoanAccountLedger'
import IndirectIncomeAccountLedger from './IndirectIncomeAccountLedger'
import CapitalAccountLedger from './CapitalAccountLedger'
import BranchLedger from './BranchLedger'
import SalesAccountLedger from './SalesAccountLedger'
import PurchaseAccountLedger from './PurchaseAccountLedger'
import ServiceExpenseAccountLedger from './ServiceExpenseAccountLedger'
import ServiceAccountLedger from './ServiceAccountLedger'
import SalesReturnAccountLedger from './SalesReturnAccountLedger'
import PurchaseReturnAccountLedger from './PurchaseReturnAccountLedger'
import TaxAccountLedger from './TaxAccountLedger'
import SupplierPaymentRecord from './SupplierPaymentRecord'
import ExpenseRecognitionRecord from './ExpenseRecognitionRecord'
import IncomeRecord from './IncomeRecord'
import JournalRecord from './JournalRecord'
import ContraRecord from './ContraRecord'
import SalesRecord from './SalesRecord'
import SalesReturnRecord from './SalesReturnRecord'
import PurchaseRecord from './PurchaseRecord'
import PurchaseReturnRecord from './PurchaseReturnRecord'
import ManufacturingRecord from './ManufacturingRecord'
import SalaryPaymentReport from './SalaryPaymentReport'
import DirectExpenseBalance from './DirectExpenseBalance'
import DirectExpenseAccountLedger from './DirectExpenseAccountLedger'
import DirectIncomeAccountBalance from './DirectIncomeAccountBalance'
import DirectIncomeAccountLedger from './DirectIncomeAccountLedger'
import MonthlySalaryReport from './MonthlySalaryReport'

export default function ReportsContent() {
  const [selectedModule, setSelectedModule] = useState(null)
  const { activeSubPage } = useNavigation()

  const reportsModules = [
    // Row 1
    {
      id: 'customer-due-balance',
      name: 'Customer Due Balance',
      icon: '📊',
      description: 'View customer due balances',
      component: CustomerDueBalance
    },
    {
      id: 'supplier-due-balance',
      name: 'Supplier Due Balance',
      icon: '📊',
      description: 'View supplier due balances',
      component: SupplierDueBalance
    },
    {
      id: 'customer-ledger',
      name: 'Customer Ledger',
      icon: '📊',
      description: 'Customer ledger reports',
      component: CustomerLedger
    },
    {
      id: 'supplier-ledger',
      name: 'Supplier Ledger',
      icon: '📊',
      description: 'Supplier ledger reports',
      component: SupplierLedger
    },
    {
      id: 'sales-collection-record',
      name: 'Sales & Previous Collection',
      icon: '📊',
      description: 'Sales and collection records',
      component: SalesCollectionRecord
    },
    // Row 2
    {
      id: 'customer-receipt-record',
      name: 'Customer Receipt Record',
      icon: '📊',
      description: 'Customer receipt records',
      component: CustomerReceiptRecord
    },
    {
      id: 'cash-bank-accounts',
      name: 'Cash & Bank Accounts',
      icon: '📊',
      description: 'Cash and bank account reports',
      component: CashBankAccounts
    },
    {
      id: 'cash-bank-account-ledger',
      name: 'Cash & Bank Account Ledger',
      icon: '📊',
      description: 'Cash and bank ledger reports',
      component: CashBankAccountLedger
    },
    {
      id: 'expense-balance-report',
      name: 'Expense Balance Report',
      icon: '📊',
      description: 'Expense balance reports',
      component: ExpenseBalanceReport
    },
    {
      id: 'expense-record',
      name: 'Expense Record',
      icon: '📊',
      description: 'Expense record reports',
      component: ExpenseRecord
    },
    // Row 3
    {
      id: 'daily-ledger',
      name: 'Daily Ledger',
      icon: '📊',
      description: 'Daily ledger reports',
      component: DailyLedger
    },
    {
      id: 'daily-statement',
      name: 'Daily Statement',
      icon: '📊',
      description: 'Daily statement reports',
      component: DailyStatement
    },
    {
      id: 'item-stock-report',
      name: 'Item Stock Report',
      icon: '📊',
      description: 'Item stock reports',
      component: ItemStockReport
    },
    {
      id: 'profit-loss',
      name: 'Profit Loss',
      icon: '📊',
      description: 'Profit and loss reports',
      component: ProfitLoss
    },
    {
      id: 'product-wise-profit-loss',
      name: 'Product Wise Profit/ Loss',
      icon: '📊',
      description: 'Product-wise profit/loss reports',
      component: ProductWiseProfitLoss
    },
    // Row 4
    {
      id: 'bill-wise-profit-loss',
      name: 'Bill Wise Profit/ Loss',
      icon: '📊',
      description: 'Bill-wise profit/loss reports',
      component: BillWiseProfitLoss
    },
    {
      id: 'loan-accounts-balance',
      name: 'Loan Accounts Balance',
      icon: '📊',
      description: 'Loan accounts balance reports',
      component: LoanAccountsBalance
    },
    {
      id: 'balance-sheet',
      name: 'Balance Sheet',
      icon: '📊',
      description: 'Balance sheet reports',
      component: BalanceSheet
    },
    {
      id: 'trial-balance',
      name: 'Trial Balance',
      icon: '📊',
      description: 'Trial balance reports',
      component: TrialBalance
    },
    {
      id: 'branch-transaction-pending-list',
      name: 'Branch tarnsaction pending list',
      icon: '📊',
      description: 'Branch transaction pending list',
      component: BranchTransactionPendingList
    },
    // Row 5
    {
      id: 'branch-transaction-received-list',
      name: 'Branch tarnsaction received list',
      icon: '📊',
      description: 'Branch transaction received list',
      component: BranchTransactionReceivedList
    },
    {
      id: 'branch-transaction-transfer-list',
      name: 'Branch tarnsaction transfer list',
      icon: '📊',
      description: 'Branch transaction transfer list',
      component: BranchTransactionTransferList
    },
    {
      id: 'advance-customer-balance',
      name: 'Advance Customer Balance',
      icon: '📊',
      description: 'Advance customer balance reports',
      component: AdvanceCustomerBalance
    },
    {
      id: 'advance-supplier-balance',
      name: 'Advance Supplier Balance',
      icon: '📊',
      description: 'Advance supplier balance reports',
      component: AdvanceSupplierBalance
    },
    {
      id: 'indirect-income-accounts-balance',
      name: 'Indirect Income Accounts Balance',
      icon: '📊',
      description: 'Indirect income accounts balance',
      component: IndirectIncomeAccountsBalance
    },
    // Row 6
    {
      id: 'fixed-asset-accounts-balance',
      name: 'Fixed Asset Accounts Balance',
      icon: '📊',
      description: 'Fixed asset accounts balance',
      component: FixedAssetAccountsBalance
    },
    {
      id: 'capital-accounts-balance',
      name: 'Capital Accounts Balance',
      icon: '📊',
      description: 'Capital accounts balance reports',
      component: CapitalAccountsBalance
    },
    {
      id: 'branch-balance-report',
      name: 'Branch Balance Report',
      icon: '📊',
      description: 'Branch balance reports',
      component: BranchBalanceReport
    },
    {
      id: 'indirect-expense-account-ledger',
      name: 'Indirect Expense Account Ledger',
      icon: '📊',
      description: 'Indirect expense account ledger',
      component: IndirectExpenseAccountLedger
    },
    {
      id: 'fixed-asset-account-ledger',
      name: 'Fixed Asset Account Ledger',
      icon: '📊',
      description: 'Fixed asset account ledger',
      component: FixedAssetAccountLedger
    },
    // Row 7
    {
      id: 'loan-account-ledger',
      name: 'Loan Account Ledger',
      icon: '📊',
      description: 'Loan account ledger reports',
      component: LoanAccountLedger
    },
    {
      id: 'indirect-income-account-ledger',
      name: 'Indirect Income Account Ledger',
      icon: '📊',
      description: 'Indirect income account ledger',
      component: IndirectIncomeAccountLedger
    },
    {
      id: 'capital-account-ledger',
      name: 'Capital Account Ledger',
      icon: '📊',
      description: 'Capital account ledger reports',
      component: CapitalAccountLedger
    },
    {
      id: 'branch-ledger',
      name: 'Branch Ledger',
      icon: '📊',
      description: 'Branch ledger reports',
      component: BranchLedger
    },
    {
      id: 'sales-account-ledger',
      name: 'Sales Account Ledger',
      icon: '📊',
      description: 'Sales account ledger reports',
      component: SalesAccountLedger
    },
    // Row 8
    {
      id: 'purchase-account-ledger',
      name: 'Purchase Account Ledger',
      icon: '📊',
      description: 'Purchase account ledger reports',
      component: PurchaseAccountLedger
    },
    {
      id: 'service-expense-account-ledger',
      name: 'Service Expense Account Ledger',
      icon: '📊',
      description: 'Service expense account ledger',
      component: ServiceExpenseAccountLedger
    },
    {
      id: 'service-account-ledger',
      name: 'Service Account Ledger',
      icon: '📊',
      description: 'Service account ledger reports',
      component: ServiceAccountLedger
    },
    {
      id: 'sales-return-account-ledger',
      name: 'Sales Return Account Ledger',
      icon: '📊',
      description: 'Sales return account ledger',
      component: SalesReturnAccountLedger
    },
    {
      id: 'purchase-return-account-ledger',
      name: 'purchase Return Account Ledger',
      icon: '📊',
      description: 'Purchase return account ledger',
      component: PurchaseReturnAccountLedger
    },
    // Row 9
    {
      id: 'tax-account-ledger',
      name: 'Tax Account Ledger',
      icon: '📊',
      description: 'Tax account ledger reports',
      component: TaxAccountLedger
    },
    {
      id: 'supplier-payment-record',
      name: 'Supplier Payment Record',
      icon: '📊',
      description: 'Supplier payment records',
      component: SupplierPaymentRecord
    },
    {
      id: 'expense-recognition-record',
      name: 'Expense Recognition Record',
      icon: '📊',
      description: 'Expense recognition records',
      component: ExpenseRecognitionRecord
    },
    {
      id: 'income-record',
      name: 'Income Record',
      icon: '📊',
      description: 'Income record reports',
      component: IncomeRecord
    },
    // Row 10
    {
      id: 'journal-record',
      name: 'Journal Record',
      icon: '📊',
      description: 'Journal record reports',
      component: JournalRecord
    },
    {
      id: 'contra-record',
      name: 'Contra Record',
      icon: '📊',
      description: 'Contra record reports',
      component: ContraRecord
    },
    {
      id: 'sales-record',
      name: 'Sales Record',
      icon: '📊',
      description: 'Sales record reports',
      component: SalesRecord
    },
    {
      id: 'sales-return-record',
      name: 'Sales Return Record',
      icon: '📊',
      description: 'Sales return record reports',
      component: SalesReturnRecord
    },
    {
      id: 'purchase-record',
      name: 'Purchase Record',
      icon: '📊',
      description: 'Purchase record reports',
      component: PurchaseRecord
    },
    // Row 11
    {
      id: 'purchase-return-record',
      name: 'Purchase Return Record',
      icon: '📊',
      description: 'Purchase return record reports',
      component: PurchaseReturnRecord
    },
    {
      id: 'manufacturing-record',
      name: 'Manufacturing Record',
      icon: '📊',
      description: 'Manufacturing record reports',
      component: ManufacturingRecord
    },
    {
      id: 'salary-payment-report',
      name: 'Salary Payment Report',
      icon: '📊',
      description: 'Salary payment reports',
      component: SalaryPaymentReport
    },
    {
      id: 'direct-expense-balance',
      name: 'Direct Expense Balance',
      icon: '📊',
      description: 'Direct expense balance reports',
      component: DirectExpenseBalance
    },
    {
      id: 'direct-expense-account-ledger',
      name: 'Direct Expense Account Ledger',
      icon: '📊',
      description: 'Direct expense account ledger',
      component: DirectExpenseAccountLedger
    },
    // Row 12
    {
      id: 'direct-income-account-balance',
      name: 'Direct Income Account Balance',
      icon: '📊',
      description: 'Direct income account balance',
      component: DirectIncomeAccountBalance
    },
    {
      id: 'direct-income-account-ledger',
      name: 'Direct Income Account Ledger',
      icon: '📊',
      description: 'Direct income account ledger',
      component: DirectIncomeAccountLedger
    },
    {
      id: 'monthly-salary-report',
      name: 'Monthly Salary Report',
      icon: '📊',
      description: 'Monthly salary reports',
      component: MonthlySalaryReport
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

  // Check if we should show a specific component directly from sidebar
  if (activeSubPage === 'ItemStockReport') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <ItemStockReport />
      </div>
    )
  }
  if (activeSubPage === 'SupplierDueBalance') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <SupplierDueBalance />
      </div>
    )
  }
  if (activeSubPage === 'CustomerLedger') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <CustomerLedger />
      </div>
    )
  }
  if (activeSubPage === 'SupplierLedger') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <SupplierLedger />
      </div>
    )
  }
  if (activeSubPage === 'CashBankAccountLedger') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <CashBankAccountLedger />
      </div>
    )
  }
  if (activeSubPage === 'CashBankAccounts') {
    return (
      <div className="bg-gray-50 min-h-screen text-sm">
        <CashBankAccounts />
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
            ← Back to Reports Module
          </button>
        </div>

        {/* Render the specific component */}
        <SelectedComponent />
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen text-sm p-4">
      {/* Reports Module Grid - Matching the 2x4 layout from screenshot */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {reportsModules.map((module, index) => (
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