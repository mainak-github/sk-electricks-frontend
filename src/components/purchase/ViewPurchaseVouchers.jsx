// ViewPurchaseVouchers.js

'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function ViewPurchaseVouchers() {
  const [selectedVoucher, setSelectedVoucher] = useState('')
  const [voucherData, setVoucherData] = useState({
    voucherNo: '',
    supplierName: '',
    institution: '',
    code: '',
    address: '',
    contactNo: '',
    purchaseDate: '',
    purchaseBy: '',
    items: [],
    quantityTotal: '',
    subTotal: '',
    transportCost: '',
    grandTotal: '',
    due: '',
    paid: '',
    grandTotalInWords: '',
    narration: ''
  })
  
  const [availableVouchers, setAvailableVouchers] = useState([
    { value: '', label: 'SEARCH VOUCHER NO' }
  ])

  // Optional: Fetch the list of available vouchers on component load
  // This is a more robust approach than using a static list
  useEffect(() => {
    const fetchVouchers = async () => {
        try {
            // Replace with your actual endpoint for getting all vouchers or a list of them
            const response = await fetch(`${config.API_URL}/purchase-entries`); 
            const result = await response.json();
            if (result.success) {
                const vouchers = result.data.map(purchase => ({
                    value: purchase.voucherNo,
                    label: `${purchase.voucherNo} - ${purchase.supplierName}`
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
    setSelectedVoucher(voucherNo);

    if (!voucherNo) {
        setVoucherData({
          voucherNo: '',
          supplierName: '',
          institution: '',
          code: '',
          address: '',
          contactNo: '',
          purchaseDate: '',
          purchaseBy: '',
          items: [],
          quantityTotal: '',
          subTotal: '',
          transportCost: '',
          grandTotal: '',
          due: '',
          paid: '',
          grandTotalInWords: '',
          narration: ''
        });
        return;
    }

    try {
      const response = await fetch(`${config.API_URL}/purchase-entries/${voucherNo}`);
      if (!response.ok) {
        throw new Error('Failed to fetch voucher data');
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        // Map the supplierId to the required supplierName and other details
        const fetchedData = {
          ...result.data,
          supplierName: result.data.supplierId.supplierName,
          institution: result.data.supplierId.shopCompanyName,
          contactNo: result.data.supplierId.contactNo,
          address: result.data.supplierId.address,
          purchaseDate: new Date(result.data.purchaseDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        };
        setVoucherData(fetchedData);
      } else {
        console.error('Voucher not found:', voucherNo);
        // Reset state on not found
        setVoucherData({
          voucherNo: '',
          supplierName: '',
          institution: '',
          code: '',
          address: '',
          contactNo: '',
          purchaseDate: '',
          purchaseBy: '',
          items: [],
          quantityTotal: '',
          subTotal: '',
          transportCost: '',
          grandTotal: '',
          due: '',
          paid: '',
          grandTotalInWords: '',
          narration: ''
        });
      }

    } catch (error) {
      console.error('Error fetching voucher data:', error);
      // Reset state on error
      setVoucherData({
          voucherNo: '',
          supplierName: '',
          institution: '',
          code: '',
          address: '',
          contactNo: '',
          purchaseDate: '',
          purchaseBy: '',
          items: [],
          quantityTotal: '',
          subTotal: '',
          transportCost: '',
          grandTotal: '',
          due: '',
          paid: '',
          grandTotalInWords: '',
          narration: ''
      });
    }
  };

  const handlePrint = () => {
    // ... (Your existing handlePrint function, no changes needed here)
  };

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

        {/* Invoice Content */}
        <div className="p-6">
          {/* Invoice Header */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold border-b-2 border-gray-800 pb-2 inline-block px-8">
              PURCHASE INVOICE
            </h1>
          </div>

          {/* Supplier and Voucher Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Left Side - Supplier Info */}
            <div className="space-y-2">
              <div><span className="font-semibold">Name :</span> {voucherData.supplierName}</div>
              <div><span className="font-semibold">Institution :</span> {voucherData.institution}</div>
              <div><span className="font-semibold">Code :</span> {voucherData.code}</div>
              <div><span className="font-semibold">Address :</span> {voucherData.address}</div>
              <div><span className="font-semibold">Contact No :</span> {voucherData.contactNo}</div>
            </div>

            {/* Right Side - Voucher Info */}
            <div className="space-y-2 text-right">
              <div><span className="font-semibold">Voucher No :</span> {voucherData.voucherNo}</div>
              <div><span className="font-semibold">Purchase Date :</span> {voucherData.purchaseDate}</div>
              <div><span className="font-semibold">Purchase By :</span> {voucherData.purchaseBy}</div>
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
            <div className="font-semibold">
              Quantity Total : ({voucherData.quantityTotal})
            </div>
            <div className="flex justify-end">
              <div className="grid grid-cols-2 gap-4 text-right min-w-80">
                <div className="font-semibold">Sub Total :</div>
                <div className="font-semibold">{voucherData.subTotal}</div>
                
                <div className="font-semibold">Transport Cost :</div>
                <div className="font-semibold">{voucherData.transportCost}</div>
                
                <div className="font-semibold">Grand Total :₹</div>
                <div className="font-semibold">{voucherData.grandTotal}</div>
                
                <div className="font-semibold">Due :₹</div>
                <div className="font-semibold">{voucherData.due}</div>
                
                <div className="font-semibold">Paid :₹</div>
                <div className="font-semibold">{voucherData.paid}</div>
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
  );
}