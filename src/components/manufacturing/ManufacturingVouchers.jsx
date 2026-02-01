'use client'

import { useState } from 'react'

export default function ViewManufacturingVouchers() {
  const [selectedVoucher, setSelectedVoucher] = useState('MF13')
  const [voucherData, setVoucherData] = useState({
    voucherNo: 'MF13',
    manufacturingDate: '18 Aug 2025',
    voucherBy: 'SOFT TASK',
    productionItems: [
      {
        sl: 1,
        itemName: 'Prohlad',
        serials: '',
        rate: '6.12',
        per: 'Nep',
        qty: '100 Nep',
        total: '612.17'
      }
    ],
    consumeItems: [
      {
        sl: 1,
        itemName: 'Prohlad',
        serials: '',
        rate: '1.00',
        per: 'Nep',
        qty: '2 Nep',
        total: '2.17'
      }
    ],
    labourCost: '500.00',
    othersCost: '110.00',
    grandTotalCost: '612.17',
    grandTotalInWords: 'Six Hundred Twelve Only (₹)',
    narration: ''
  })

  const [availableVouchers] = useState([
    { value: 'MF13', label: 'MF13 - Manufacturing Voucher' },
    { value: 'MF001', label: 'MF001 - Steel Processing' },
    { value: 'MF002', label: 'MF002 - Component Assembly' },
    { value: 'MF003', label: 'MF003 - Product Finishing' },
    { value: 'MF004', label: 'MF004 - Quality Control' }
  ])

  const handleVoucherChange = (voucherNo) => {
    setSelectedVoucher(voucherNo)
    // In a real app, this would fetch voucher data from backend
    // For demo purposes, we'll update with sample data based on selection
    if (voucherNo === 'MF001') {
      setVoucherData({
        voucherNo: 'MF001',
        manufacturingDate: '15 Aug 2025',
        voucherBy: 'ADMIN',
        productionItems: [
          {
            sl: 1,
            itemName: 'Steel Frame',
            serials: 'SF001-SF050',
            rate: '25.00',
            per: 'Pcs',
            qty: '50 Pcs',
            total: '1250.00'
          },
          {
            sl: 2,
            itemName: 'Welded Joint',
            serials: '',
            rate: '15.50',
            per: 'Pcs',
            qty: '100 Pcs',
            total: '1550.00'
          }
        ],
        consumeItems: [
          {
            sl: 1,
            itemName: 'Steel Rod',
            serials: '',
            rate: '200.00',
            per: 'Kg',
            qty: '10 Kg',
            total: '2000.00'
          },
          {
            sl: 2,
            itemName: 'Welding Wire',
            serials: '',
            rate: '350.00',
            per: 'Kg',
            qty: '2 Kg',
            total: '700.00'
          }
        ],
        labourCost: '1500.00',
        othersCost: '300.00',
        grandTotalCost: '2800.00',
        grandTotalInWords: 'Two Thousand Eight Hundred Only (₹)',
        narration: 'Steel frame manufacturing with welding operations'
      })
    } else if (voucherNo === 'MF002') {
      setVoucherData({
        voucherNo: 'MF002',
        manufacturingDate: '16 Aug 2025',
        voucherBy: 'PRODUCTION',
        productionItems: [
          {
            sl: 1,
            itemName: 'Component Assembly A',
            serials: 'CA001-CA025',
            rate: '45.00',
            per: 'Set',
            qty: '25 Set',
            total: '1125.00'
          }
        ],
        consumeItems: [
          {
            sl: 1,
            itemName: 'Aluminum Sheet',
            serials: '',
            rate: '150.00',
            per: 'Sq Ft',
            qty: '8 Sq Ft',
            total: '1200.00'
          },
          {
            sl: 2,
            itemName: 'Screws & Bolts',
            serials: '',
            rate: '5.00',
            per: 'Set',
            qty: '25 Set',
            total: '125.00'
          }
        ],
        labourCost: '800.00',
        othersCost: '200.00',
        grandTotalCost: '1125.00',
        grandTotalInWords: 'One Thousand One Hundred Twenty Five Only (₹)',
        narration: 'Assembly of components with precision fitting'
      })
    } else {
      // Reset to default data (MF13)
      setVoucherData({
        voucherNo: 'MF13',
        manufacturingDate: '18 Aug 2025',
        voucherBy: 'SOFT TASK',
        productionItems: [
          {
            sl: 1,
            itemName: 'Prohlad',
            serials: '',
            rate: '6.12',
            per: 'Nep',
            qty: '100 Nep',
            total: '612.17'
          }
        ],
        consumeItems: [
          {
            sl: 1,
            itemName: 'Prohlad',
            serials: '',
            rate: '1.00',
            per: 'Nep',
            qty: '2 Nep',
            total: '2.17'
          }
        ],
        labourCost: '500.00',
        othersCost: '110.00',
        grandTotalCost: '612.17',
        grandTotalInWords: 'Six Hundred Twelve Only (₹)',
        narration: ''
      })
    }
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Manufacturing Journal Voucher - ${voucherData.voucherNo}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 15px;
              font-size: 11px;
              line-height: 1.3;
            }
            .voucher-header {
              text-align: center;
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 15px;
              border-bottom: 1px solid #000;
              padding-bottom: 8px;
            }
            .voucher-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
            }
            .voucher-details {
              width: 100%;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-bottom: 12px;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 4px; 
              text-align: left;
              font-size: 10px;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
              text-align: center;
            }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .section-title {
              font-weight: bold;
              margin: 12px 0 8px 0;
              color: #333;
              font-size: 11px;
            }
            .cost-section {
              margin-top: 8px;
              font-size: 10px;
            }
            .cost-row {
              margin: 3px 0;
              text-align: right;
            }
            .production-section {
              color: #0d9488;
            }
            .consume-section {
              color: #dc2626;
            }
          </style>
        </head>
        <body>
          <div class="voucher-header">MANUFACTURING JOURNAL VOUCHER</div>
          
          <div class="voucher-info">
            <div class="voucher-details">
              <div style="display: flex; justify-content: space-between; font-size: 10px;">
                <div><strong>Voucher No :</strong> ${voucherData.voucherNo}</div>
                <div><strong>Voucher By :</strong> ${voucherData.voucherBy}</div>
              </div>
              <div style="font-size: 10px;"><strong>Manufacturing Date :</strong> ${voucherData.manufacturingDate}</div>
            </div>
          </div>

          <div class="section-title production-section">Production Items</div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Item Name</th>
                <th>Serials</th>
                <th>Rate</th>
                <th>Per</th>
                <th>QTY</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${voucherData.productionItems.map(item => `
                <tr>
                  <td class="text-center">${item.sl}</td>
                  <td>${item.itemName}</td>
                  <td>${item.serials}</td>
                  <td class="text-right">${item.rate}</td>
                  <td class="text-center">${item.per}</td>
                  <td>${item.qty}</td>
                  <td class="text-right"><strong>${item.total}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title consume-section">Consume Items</div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Item Name</th>
                <th>Serials</th>
                <th>Rate</th>
                <th>Per</th>
                <th>QTY</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${voucherData.consumeItems.map(item => `
                <tr>
                  <td class="text-center">${item.sl}</td>
                  <td>${item.itemName}</td>
                  <td>${item.serials}</td>
                  <td class="text-right">${item.rate}</td>
                  <td class="text-center">${item.per}</td>
                  <td>${item.qty}</td>
                  <td class="text-right"><strong>${item.total}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="cost-section">
            <div class="cost-row"><strong>Labour Cost :</strong> ${voucherData.labourCost}</div>
            <div class="cost-row"><strong>Others Cost :</strong> ${voucherData.othersCost}</div>
            <div class="cost-row"><strong>Grand Total Cost : ₹</strong> ${voucherData.grandTotalCost}</div>
          </div>

          <div style="margin-top: 15px; font-size: 10px;">
            <strong>In Word of Grand Total :</strong> ${voucherData.grandTotalInWords}
          </div>

          ${voucherData.narration ? `
            <div style="margin-top: 12px; font-size: 10px;">
              <strong>Narration :</strong> ${voucherData.narration}
            </div>
          ` : '<div style="margin-top: 12px; font-size: 10px;"><strong>Narration :</strong></div>'}

          <div style="margin-top: 25px; text-align: center; font-size: 9px; color: #666;">
            Manufacturing Journal Report - Fayullah Factory Management System
          </div>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="p-3 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header with Search and Print Button */}
        <div className="p-3 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="p-1.5 border rounded hover:bg-gray-50 transition-colors text-sm"
                title="Print Voucher"
              >
                🖨️
              </button>
            </div>
            <div>
              <select 
                className="border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-52"
                value={selectedVoucher}
                onChange={(e) => handleVoucherChange(e.target.value)}
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
        <div className="p-4">
          {/* Voucher Header */}
          <div className="text-center mb-5">
            <h1 className="text-sm font-bold border-b border-gray-800 pb-1.5 inline-block px-6">
              MANUFACTURING JOURNAL VOUCHER
            </h1>
          </div>

          {/* Voucher Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Left Side - Voucher Info */}
            <div className="space-y-1 text-xs">
              <div><span className="font-medium">Voucher No :</span> {voucherData.voucherNo}</div>
              <div><span className="font-medium">Manufacturing Date :</span> {voucherData.manufacturingDate}</div>
            </div>

            {/* Right Side - Additional Info */}
            <div className="space-y-1 text-xs text-right">
              <div><span className="font-medium">Voucher By :</span> {voucherData.voucherBy}</div>
            </div>
          </div>

          {/* Production Items Table */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-teal-700 mb-2">Production Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-800">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">SL</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Item Name</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Serials</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Rate</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Per</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">QTY</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {voucherData.productionItems.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-800 px-2 py-1.5 text-center text-xs">{item.sl}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-xs">{item.itemName}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-center text-xs">{item.serials}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-right text-xs">{item.rate}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-center text-xs">{item.per}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-xs">{item.qty}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-right font-medium text-xs">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Consume Items Table */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-red-700 mb-2">Consume Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-800">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">SL</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Item Name</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Serials</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Rate</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Per</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">QTY</th>
                    <th className="border border-gray-800 px-2 py-1.5 text-center font-medium text-xs">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {voucherData.consumeItems.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-800 px-2 py-1.5 text-center text-xs">{item.sl}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-xs">{item.itemName}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-center text-xs">{item.serials}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-right text-xs">{item.rate}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-center text-xs">{item.per}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-xs">{item.qty}</td>
                      <td className="border border-gray-800 px-2 py-1.5 text-right font-medium text-xs">{item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cost Summary Section */}
          <div className="mb-4">
            <div className="flex justify-end">
              <div className="grid grid-cols-2 gap-3 text-right min-w-64">
                <div className="font-medium text-xs">Labour Cost :</div>
                <div className="font-medium text-xs">{voucherData.labourCost}</div>
                
                <div className="font-medium text-xs">Others Cost :</div>
                <div className="font-medium text-xs">{voucherData.othersCost}</div>
                
                <div className="font-medium text-xs border-t pt-1.5">Grand Total Cost : ₹</div>
                <div className="font-medium text-xs border-t pt-1.5">{voucherData.grandTotalCost}</div>
              </div>
            </div>
          </div>

          {/* Grand Total in Words */}
          <div className="mb-4">
            <span className="font-medium text-xs">In Word of Grand Total : </span>
            <span className="text-xs">{voucherData.grandTotalInWords}</span>
          </div>

          {/* Narration */}
          <div>
            <div className="font-medium mb-1.5 text-xs">Narration :</div>
            <div className="min-h-8 border-b border-gray-300 pb-1.5 text-xs">
              {voucherData.narration}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}