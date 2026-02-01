'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function ViewPurchaseReturnVouchers() {
  const [selectedVoucher, setSelectedVoucher] = useState('')
  const [voucherData, setVoucherData] = useState({
    voucherNo: '',
    supplierCode: '',
    supplierName: '',
    institution: '',
    address: '',
    contactNo: '',
    returnDate: '',
    returnBy: '',
    items: [],
    subTotal: '',
    transportCost: '',
    grandTotal: '',
    grandTotalInWords: '',
    narration: ''
  })

  const [availableVouchers, setAvailableVouchers] = useState([
    { value: '', label: 'SEARCH VOUCHER NO' }
  ])

  // Fetch the list of available vouchers on initial component load
  useEffect(() => {
    const fetchVouchers = async () => {
        try {
            const response = await fetch(`${config.API_URL}/purchase-return-entries`);
            const result = await response.json();
            if (result.success && result.data) {
                const vouchers = result.data.map(purchaseReturn => ({
                    value: purchaseReturn.voucherNo,
                    label: `${purchaseReturn.voucherNo} - ${purchaseReturn.supplierName}`
                }));
                setAvailableVouchers([{ value: '', label: 'SEARCH VOUCHER NO' }, ...vouchers]);
            }
        } catch (error) {
            console.error('Failed to fetch voucher list:', error);
        }
    };
    fetchVouchers();
  }, []);

  const handleVoucherChange = async (voucherNo) => {
    setSelectedVoucher(voucherNo)

    if (!voucherNo) {
        setVoucherData({
            voucherNo: '',
            supplierCode: '',
            supplierName: '',
            institution: '',
            address: '',
            contactNo: '',
            returnDate: '',
            returnBy: '',
            items: [],
            subTotal: '',
            transportCost: '',
            grandTotal: '',
            grandTotalInWords: '',
            narration: ''
        });
        return;
    }

    try {
      // Dynamic API call to the new backend endpoint
      const response = await fetch(`${config.API_URL}/purchase-return-entries/${voucherNo}`);
      if (!response.ok) {
        throw new Error('Failed to fetch voucher data');
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        // Map the data from the API response to the component's state structure
        const fetchedData = {
          ...result.data,
          supplierName: result.data.supplierId?.supplierName || '',
          institution: result.data.supplierId?.shopCompanyName || '',
          address: result.data.supplierId?.address || '',
          contactNo: result.data.supplierId?.contactNo || '',
          returnDate: new Date(result.data.returnDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        };
        setVoucherData(fetchedData);
      } else {
        console.error('Voucher not found:', voucherNo);
        // Reset state if voucher is not found
        setVoucherData({
            voucherNo: '',
            supplierCode: '',
            supplierName: '',
            institution: '',
            address: '',
            contactNo: '',
            returnDate: '',
            returnBy: '',
            items: [],
            subTotal: '',
            transportCost: '',
            grandTotal: '',
            grandTotalInWords: '',
            narration: ''
        });
      }

    } catch (error) {
      console.error('Error fetching voucher data:', error);
      // Reset state on error
      setVoucherData({
            voucherNo: '',
            supplierCode: '',
            supplierName: '',
            institution: '',
            address: '',
            contactNo: '',
            returnDate: '',
            returnBy: '',
            items: [],
            subTotal: '',
            transportCost: '',
            grandTotal: '',
            grandTotalInWords: '',
            narration: ''
      });
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Purchase Return Voucher - ${voucherData.voucherNo}</title>
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
            .voucher-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .supplier-info, .return-info {
              width: 48%;
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
            .total-section {
              margin-top: 10px;
              text-align: right;
            }
            .total-row {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="voucher-header">PURCHASE RETURN VOUCHER</div>
          
          <div class="voucher-info">
            <div class="supplier-info">
              <strong>Supplier Code:</strong> ${voucherData.supplierCode}<br>
              <strong>Name:</strong> ${voucherData.supplierName}<br>
              <strong>Institution:</strong> ${voucherData.institution}<br>
              <strong>Address:</strong> ${voucherData.address}<br>
              <strong>Contact No:</strong> ${voucherData.contactNo}
            </div>
            <div class="return-info">
              <strong>Voucher No:</strong> ${voucherData.voucherNo}<br>
              <strong>Return Date:</strong> ${voucherData.returnDate}<br>
              <strong>Return By:</strong> ${voucherData.returnBy}
            </div>
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
              ${voucherData.items.map(item => `
                <tr>
                  <td style="text-align: center;">${item.sl}</td>
                  <td>${item.itemName}</td>
                  <td class="text-right">${item.rate}</td>
                  <td style="text-align: center;">${item.per}</td>
                  <td>${item.qty}</td>
                  <td style="text-align: center;">${item.discount}</td>
                  <td style="text-align: center;">${item.GST}</td>
                  <td class="text-right">${item.total}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row"><strong>Sub Total:</strong> ${voucherData.subTotal}</div>
            <div class="total-row"><strong>Transport Cost:</strong> ${voucherData.transportCost}</div>
            <div class="total-row"><strong>Grand Total: ₹</strong> ${voucherData.grandTotal}</div>
          </div>

          <div style="margin-top: 20px;">
            <strong>In Word of Grand Total:</strong> ${voucherData.grandTotalInWords}
          </div>

          ${voucherData.narration ? `
            <div style="margin-top: 15px;">
              <strong>Narration:</strong> ${voucherData.narration}
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

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header with Search */}
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrint}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Print Voucher"
              >
                🖨️
              </button>
              <select 
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-60"
                value={selectedVoucher}
                onChange={(e) => handleVoucherChange(e.target.value)}
              >
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
        <div className="p-6">
          {/* Voucher Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold border-b-2 border-gray-800 pb-2 inline-block px-8">
              PURCHASE RETURN VOUCHER
            </h1>
          </div>

          {/* Supplier and Voucher Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Left Side - Supplier Info */}
            <div className="space-y-2">
              <div><span className="font-semibold">Supplier Code :</span> {voucherData.supplierCode}</div>
              <div><span className="font-semibold">Name :</span> {voucherData.supplierName}</div>
              <div><span className="font-semibold">Institution :</span> {voucherData.institution}</div>
              <div><span className="font-semibold">Address :</span> {voucherData.address}</div>
              <div><span className="font-semibold">Contact No :</span> {voucherData.contactNo}</div>
            </div>

            {/* Right Side - Voucher Info */}
            <div className="space-y-2 text-right">
              <div><span className="font-semibold">Voucher No :</span> {voucherData.voucherNo}</div>
              <div><span className="font-semibold">Return Date :</span> {voucherData.returnDate}</div>
              <div><span className="font-semibold">Return By :</span> {voucherData.returnBy}</div>
            </div>
          </div>

          {/* Items Table */}
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
                {voucherData.items && voucherData.items.length > 0 ? (
                  voucherData.items.map((item, index) => (
                    <tr key={index}>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.sl}</td>
                      <td className="border border-gray-800 px-3 py-2">{item.itemName}</td>
                      <td className="border border-gray-800 px-3 py-2 text-right">{item.rate}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.per}</td>
                      <td className="border border-gray-800 px-3 py-2">{item.qty}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.discount}</td>
                      <td className="border border-gray-800 px-3 py-2 text-center">{item.GST}</td>
                      <td className="border border-gray-800 px-3 py-2 text-right font-semibold">{item.total}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="border border-gray-800 px-3 py-2 text-center text-gray-500">
                      No items found for this voucher.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="space-y-2 text-right mb-6">
            <div className="flex justify-end">
              <div className="grid grid-cols-2 gap-4 text-right min-w-80">
                <div className="font-semibold">Sub Total :</div>
                <div className="font-semibold">{voucherData.subTotal}</div>
                
                <div className="font-semibold">Transport Cost :</div>
                <div className="font-semibold">{voucherData.transportCost}</div>
                
                <div className="font-semibold">Grand Total : ₹</div>
                <div className="font-semibold">{voucherData.grandTotal}</div>
              </div>
            </div>
          </div>

          {/* Grand Total in Words */}
          <div className="mb-6">
            <span className="font-semibold">In Word of Grand Total : </span>
            {voucherData.grandTotalInWords}
          </div>

          {/* Narration */}
          <div>
            <div className="font-semibold mb-2">Narration :</div>
            <div className="min-h-12 border-b border-gray-300 pb-2">
              {voucherData.narration}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}