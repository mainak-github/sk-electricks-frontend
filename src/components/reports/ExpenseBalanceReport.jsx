'use client'

import { useState, useMemo, useEffect } from 'react'
import url from '../../../url'

// API Functions
const fetchExpenseBalanceReport = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    
    const response = await fetch(`${url.API_URL}/expense-entries/reports/balance?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching expense balance report:', error);
    return { success: false, data: [] };
  }
};

const getExpenseAccounts = async () => {
  try {
    const response = await fetch(`${url.API_URL}/expense-entries/utils/expense-heads`);
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (error) {
    console.error('Error fetching expense accounts:', error);
    return [];
  }
};

export default function ExpenseBalanceReport() {
  const [filterType, setFilterType] = useState('Date Wise')
  const [selectedAccount, setSelectedAccount] = useState('')
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0])
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0])
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showReport, setShowReport] = useState(false)
  
  // Dynamic States
  const [expenseData, setExpenseData] = useState([])
  const [availableAccounts, setAvailableAccounts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Filter Type options
  const filterTypeOptions = [
    'Date Wise',
    'Account Wise',
    'Category Wise',
    'Monthly',
    'Yearly'
  ]

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const accountData = await getExpenseAccounts();
        const accountOptions = [
          { value: '', label: 'All Accounts' },
          ...accountData.map(account => ({
            value: account,
            label: account
          }))
        ];
        setAvailableAccounts(accountOptions);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load account data');
      }
    };

    loadInitialData();
  }, []);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    let filtered = expenseData;
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(entry =>
        entry.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.expenseHead?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedAccount) {
      filtered = filtered.filter(entry => 
        entry.accountName === selectedAccount || entry.expenseHead === selectedAccount
      );
    }
    
    return filtered;
  }, [expenseData, searchTerm, selectedAccount]);

  const handleGetReport = async () => {
    console.log('Generating expense balance report:', {
      filterType,
      selectedAccount,
      fromDate,
      toDate
    });

    setLoading(true);
    setError('');
    
    try {
      const reportParams = {
        filterType: filterType.toLowerCase().replace(' ', '_'),
        account: selectedAccount,
        startDate: fromDate,
        endDate: toDate
      };

      const result = await fetchExpenseBalanceReport(reportParams);
      
      if (result.success) {
        setExpenseData(result.data || []);
        setShowReport(true);
        setCurrentPage(1);
        setSearchTerm('');
        setShowSearch(false);
      } else {
        setError(result.message || 'Failed to generate report');
        setExpenseData([]);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError('Failed to generate report');
      setExpenseData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
  }

  // Calculate totals
  const totals = useMemo(() => {
    return filteredData.reduce((acc, entry) => {
      acc.totalOpening += parseFloat(entry.openingBalance) || 0
      acc.totalDebit += parseFloat(entry.debitAmount) || 0
      acc.totalCredit += parseFloat(entry.creditAmount) || 0
      acc.totalExpense += parseFloat(entry.expenseAmount) || parseFloat(entry.totalAmount) || 0
      return acc
    }, {
      totalOpening: 0,
      totalDebit: 0,
      totalCredit: 0,
      totalExpense: 0,
      count: filteredData.length
    })
  }, [filteredData])

  // Print functionality
  const handlePrint = () => {
    if (filteredData.length === 0) {
      alert('No data to print');
      return;
    }

    const selectedAccountName = availableAccounts.find(opt => opt.value === selectedAccount)?.label || 'All Accounts'
    const printContent = `
      <html>
        <head>
          <title>Expense Balance Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #0d9488; margin-bottom: 10px; }
            .amount { text-align: right; }
            .header-info { margin: 20px 0; }
            .totals { background-color: #f9f9f9; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Expense Balance Report</h1>
          <div class="header-info">
            <p><strong>Filter Type:</strong> ${filterType}</p>
            <p><strong>Account:</strong> ${selectedAccountName}</p>
            <p><strong>Period:</strong> ${fromDate} to ${toDate}</p>
            <p><strong>Generated on:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Total Records:</strong> ${filteredData.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Account/Expense Head</th>
                <th>Opening Balance</th>
                <th>Debit Amount</th>
                <th>Credit Amount</th>
                <th>Total Expense</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.expenseHead || entry.accountName || 'N/A'}</td>
                  <td class="amount">₹ ${(parseFloat(entry.openingBalance) || 0).toFixed(2)}</td>
                  <td class="amount">₹ ${(parseFloat(entry.debitAmount) || 0).toFixed(2)}</td>
                  <td class="amount">₹ ${(parseFloat(entry.creditAmount) || 0).toFixed(2)}</td>
                  <td class="amount">₹ ${(parseFloat(entry.expenseAmount) || parseFloat(entry.totalAmount) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
              <tr class="totals">
                <td colspan="2"><strong>Grand Total:</strong></td>
                <td class="amount"><strong>₹ ${totals.totalOpening.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹ ${totals.totalDebit.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹ ${totals.totalCredit.toFixed(2)}</strong></td>
                <td class="amount"><strong>₹ ${totals.totalExpense.toFixed(2)}</strong></td>
              </tr>
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

  // Export functionality
  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['SL', 'Account/Expense Head', 'Opening Balance', 'Debit Amount', 'Credit Amount', 'Total Expense'],
      ...filteredData.map((entry, index) => [
        index + 1,
        entry.expenseHead || entry.accountName || 'N/A',
        (parseFloat(entry.openingBalance) || 0).toFixed(2),
        (parseFloat(entry.debitAmount) || 0).toFixed(2),
        (parseFloat(entry.creditAmount) || 0).toFixed(2),
        (parseFloat(entry.expenseAmount) || parseFloat(entry.totalAmount) || 0).toFixed(2)
      ]),
      ['', 'Grand Total:', totals.totalOpening.toFixed(2), totals.totalDebit.toFixed(2), totals.totalCredit.toFixed(2), totals.totalExpense.toFixed(2)]
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `expense_balance_report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredData.slice(startIndex, endIndex)

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="text-red-700 font-bold text-lg hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">Expense Balance Report</h2>
        </div>
        
        <div className="p-6">
          {/* Filter Section */}
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
              <select 
                className="w-36 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                {filterTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Account</label>
              <select 
                className="w-48 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {availableAccounts.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            
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
                disabled={loading}
                className="bg-teal-500 text-white px-6 py-2 mt-7 rounded text-sm hover:bg-teal-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    🔍 GET REPORT
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Results */}
      {showReport && (
        <div className="bg-white rounded-lg shadow-sm border mt-6">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">Expense Balance Report</h3>
                <p className="text-sm text-gray-600">
                  {filteredData.length} records found | Total Expenses: ₹ {totals.totalExpense.toFixed(2)}
                </p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors"
                  title="Search"
                >
                  🔍
                </button>
                <button 
                  onClick={handleExport}
                  disabled={filteredData.length === 0}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Export to CSV"
                >
                  📤
                </button>
                <button 
                  onClick={handlePrint}
                  disabled={filteredData.length === 0}
                  className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Print"
                >
                  🖨️
                </button>
              </div>
            </div>

            {/* Search Bar */}
            {showSearch && (
              <div className="mb-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by account name or expense head..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
                <button 
                  onClick={handleClearSearch}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading report data...</p>
              </div>
            ) : filteredData.length > 0 ? (
              <>
                {/* Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 border-r">SL</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 border-r">Account/Expense Head</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 border-r">Opening Balance</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 border-r">Debit Amount</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700 border-r">Credit Amount</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-700">Total Expense</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentEntries.map((entry, index) => (
                          <tr key={entry.id || index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-xs border-r">{startIndex + index + 1}</td>
                            <td className="py-3 px-4 text-xs font-medium border-r">
                              {entry.expenseHead || entry.accountName || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-xs text-right border-r">
                              ₹ {(parseFloat(entry.openingBalance) || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-xs text-right border-r">
                              ₹ {(parseFloat(entry.debitAmount) || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-xs text-right border-r">
                              ₹ {(parseFloat(entry.creditAmount) || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-xs text-right font-medium text-teal-600">
                              ₹ {(parseFloat(entry.expenseAmount) || parseFloat(entry.totalAmount) || 0).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-teal-50 font-bold border-t-2 border-teal-200">
                          <td className="py-3 px-4 text-xs border-r" colSpan="2">
                            <strong>Grand Total ({filteredData.length} records):</strong>
                          </td>
                          <td className="py-3 px-4 text-xs text-right border-r">
                            <strong>₹ {totals.totalOpening.toFixed(2)}</strong>
                          </td>
                          <td className="py-3 px-4 text-xs text-right border-r">
                            <strong>₹ {totals.totalDebit.toFixed(2)}</strong>
                          </td>
                          <td className="py-3 px-4 text-xs text-right border-r">
                            <strong>₹ {totals.totalCredit.toFixed(2)}</strong>
                          </td>
                          <td className="py-3 px-4 text-xs text-right font-bold text-teal-600">
                            <strong>₹ {totals.totalExpense.toFixed(2)}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span>Rows per page:</span>
                      <select 
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="border rounded px-2 py-1"
                      >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>
                        {startIndex + 1}-{Math.min(endIndex, filteredData.length)} of {filteredData.length}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ‹
                        </button>
                        <button 
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          ›
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium mb-2">No Expense Data Found</h3>
                <p>Try adjusting your filter criteria or date range to see results.</p>
                <button 
                  onClick={handleGetReport}
                  className="mt-4 bg-teal-500 text-white px-6 py-2 rounded text-sm hover:bg-teal-600 transition-colors"
                >
                  Refresh Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
