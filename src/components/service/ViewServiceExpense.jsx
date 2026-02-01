'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function ViewServiceExpense() {
  const [selectedVoucher, setSelectedVoucher] = useState('')
  const [availableVouchers, setAvailableVouchers] = useState([])
  const [voucherData, setVoucherData] = useState(null)
  const [loadingVouchers, setLoadingVouchers] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState(null)

  // 1. Fetch the list of all available expense vouchers on component mount
  useEffect(() => {
    const fetchAvailableVouchers = async () => {
      setLoadingVouchers(true)
      try {
        const response = await fetch(`${config.API_URL}/service-expense-entries`)
        if (!response.ok) {
          throw new Error('Failed to fetch available vouchers.')
        }
        const result = await response.json()
        setAvailableVouchers(result.data.map(item => ({
          value: item.voucherNo,
          label: `${item.voucherNo} - ${item.supplierName}`
        })))
        if (result.data.length > 0) {
          setSelectedVoucher(result.data[0].voucherNo)
        }
      } catch (err) {
        console.error('Fetch vouchers error:', err)
        setError('Could not load available vouchers.')
      } finally {
        setLoadingVouchers(false)
      }
    }
    fetchAvailableVouchers()
  }, [])

  // 2. Fetch the specific voucher data whenever the selectedVoucher changes
  useEffect(() => {
    const fetchVoucherData = async (voucherNo) => {
      if (!voucherNo) return
      setLoadingData(true)
      setError(null)
      try {
        const response = await fetch(`${config.API_URL}/service-expense-entries/servicesExpensesEntries/${voucherNo}`)
        if (!response.ok) {
          throw new Error('Failed to fetch voucher data.')
        }
        const result = await response.json()
        // Correctly access the first item in the data array
        setVoucherData(result.data[0]) 
      } catch (err) {
        console.error('Fetch data error:', err)
        setError('Could not load voucher data.')
        setVoucherData(null)
      } finally {
        setLoadingData(false)
      }
    }
    fetchVoucherData(selectedVoucher)
  }, [selectedVoucher])

  const handleVoucherChange = (e) => {
    setSelectedVoucher(e.target.value)
  }

  const handlePrint = () => {
    // Corrected property name to serviceExpenseItems
    if (!voucherData || !voucherData.serviceExpenseItems) {
      alert('No voucher data to print.')
      return
    }

    const printContent = `
      <html>
        <head>
          <title>Service Expense Voucher - ${voucherData.voucherNo}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px;
              font-size: 12px;
            }
            .voucher-header {
              text-align: center;
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .supplier-info {
              margin-bottom: 20px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 15px;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold;
              text-align: center;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .total-section {
              margin-top: 10px;
            }
            .total-row {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="voucher-header">SERVICE EXPENSE VOUCHER</div>
          
          <div class="supplier-info">
            <strong>Supplier/Creditor Code:</strong> ${voucherData.supplierId ? voucherData.supplierId.displayName : '' || 'N/A'}<br>
            <strong>Name:</strong> ${voucherData.supplierName || 'N/A'}<br>
            <strong>Institution:</strong> ${voucherData.institutionName || 'N/A'}<br>
            <strong>Address:</strong> ${voucherData.supplierAddress || 'N/A'}<br>
            <strong>Contact No:</strong> ${voucherData.contactNo || 'N/A'}
          </div>

          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Item Name</th>
                <th>Rate</th>
                <th>Per</th>
                <th>QTY</th>
                <th>Discount%</th>
                <th>GST%</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${voucherData.serviceExpenseItems.map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${item.itemName}</td>
                  <td class="text-right">${item.rate}</td>
                  <td class="text-center">Pcs</td>
                  <td class="text-center">${item.qty}</td>
                  <td class="text-center">${item.discountPercent}</td>
                  <td class="text-center">${item.GSTPercent}</td>
                  <td class="text-right">${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row"><strong>Sub Total:</strong> ${voucherData.subTotal}</div>
            <div class="total-row"><strong>Transport Cost:</strong> ${voucherData.transportCost || '0.00'}</div>
            <div class="total-row"><strong>Grand Total: ₹ </strong> ${voucherData.grandTotal}</div>
            <div class="total-row"><strong>Due: ₹ </strong> ${voucherData.dueAmount}</div>
            <div class="total-row"><strong>Paid: ₹ </strong> ${voucherData.paidAmount}</div>
          </div>

          <div style="margin-top: 20px;">
            <strong>In Word of Grand Total:</strong> ${voucherData.grandTotalInWords || 'Not available'}
          </div>

          ${voucherData.notes ? `
            <div style="margin-top: 15px;">
              <strong>Narration:</strong> ${voucherData.notes}
            </div>
          ` : ''}
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // Conditional Rendering based on state (loading, error, data)
  if (loadingVouchers) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-500">Loading vouchers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 min-h-screen">
        <p className="text-xl">Error: {error}</p>
        <p>Please check your network connection or try again later.</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header with Search and AUTO PAD Button */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                AUTO PAD ?
              </button>
              <button 
                onClick={handlePrint}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Print Voucher"
              >
                🖨️
              </button>
            </div>
            <div>
              <select 
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-60"
                value={selectedVoucher}
                onChange={handleVoucherChange}
              >
                <option value="">SEARCH VOUCHER NO</option>
                {availableVouchers.map(voucher => (
                  <option key={voucher.value} value={voucher.value}>
                    {voucher.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Voucher Content */}
        {loadingData ? (
          <div className="p-6 flex justify-center items-center">
            <p className="text-gray-500">Loading data for voucher {selectedVoucher}...</p>
          </div>
        ) : voucherData ? (
          <div className="p-6">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold border-b-2 border-gray-800 pb-2 inline-block px-8">
                SERVICE EXPENSE VOUCHER
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Supplier/ Creditor Code :</span> {voucherData.supplierId ? voucherData.supplierId.displayName : 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Name :</span> {voucherData.supplierName}
                </div>
                <div>
                  <span className="font-semibold">Institution :</span> {voucherData.institutionName}
                </div>
                <div>
                  <span className="font-semibold">Address :</span> {voucherData.supplierAddress}
                </div>
                <div>
                  <span className="font-semibold">Contact No :</span> {voucherData.contactNo}
                </div>
              </div>
              
              <div className="space-y-2 text-right">
                <div>
                  <span className="font-semibold">Voucher No :</span> {voucherData.voucherNo}
                </div>
                <div>
                  <span className="font-semibold">Expense Date :</span> {new Date(voucherData.entryDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold">Expense By :</span> {voucherData.expenseBy || 'N/A'}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-800">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-800 px-3 py-2 text-center font-semibold">SL</th>
                    <th className="border border-gray-800 px-3 py-2 text-center font-semibold">Item Name</th>
                    <th className="border border-gray-800 px-3 py-2 text-center font-semibold">Rate</th>
                    <th className="border border-gray-800 px-3 py-2 text-center font-semibold">Per</th>
                    <th className="border border-gray-800 px-3 py-2 text-center font-semibold">QTY</th>
                    <th className="border border-gray-800 px-3 py-2 text-center font-semibold">Discount%</th>
                    <th className="border border-gray-800 px-3 py-2 text-center font-semibold">GST%</th>
                    <th className="border border-gray-800 px-3 py-2 text-center font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Corrected property name to serviceExpenseItems */}
                  {voucherData.serviceExpenseItems.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-800 px-3 py-2 text-center">{index + 1}</td>
                      <td className="border border-gray-800 px-3 py-2">{item.itemName}</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">{item.rate}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">Pcs</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.qty}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.discountPercent}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.GSTPercent}</td>
                      <td className="border border-gray-800 px-3 py-2 text-right font-semibold">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2 text-right mb-6">
              <div className="flex justify-end">
                <div className="grid grid-cols-2 gap-4 text-right min-w-80">
                  <div className="font-semibold">Sub Total :</div>
                  <div className="font-semibold">{voucherData.subTotal}</div>
                  
                  <div className="font-semibold">Transport Cost :</div>
                  <div className="font-semibold">{voucherData.transportCost || '0.00'}</div>
                  
                  <div className="font-semibold">Grand Total : ₹</div>
                  <div className="font-semibold">{voucherData.grandTotal}</div>
                  
                  <div className="font-semibold">Due : ₹</div>
                  <div className="font-semibold">{voucherData.dueAmount}</div>
                  
                  <div className="font-semibold">Paid : ₹</div>
                  <div className="font-semibold">{voucherData.paidAmount}</div>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <span className="font-semibold">In Word of Grand Total : </span>
              {voucherData.grandTotalInWords || 'Not available'}
            </div>

            <div>
              <div className="font-semibold mb-2">Narration :</div>
              <div className="min-h-12 border-b border-gray-300 pb-2">
                {/* Corrected property name to notes */}
                {voucherData.notes || 'N/A'}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p className="text-lg">Select a voucher from the dropdown to view its details.</p>
          </div>
        )}
      </div>
    </div>
  )
}