'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function SalesOrderVouchers() {
  // ✅ NEW: Company Information
  const companyInfo = {
    name: "S.K. ELECTRICALS",
    address: "Faridpur, DURGAPUR, Bardhaman, West Bengal, 713213",
    gstin: "19BRUPM7238Q2ZG",
    state: "West Bengal",
    phone: "+91 8448449093",
    website: "www.skelectrics.com",
    bankName: "BANDHAN BANK",
    accountNo: "10160007406316",
    branchCode: "CITY CENTER",
    jurisdiction: "Durgapur"
  }

  const [selectedVoucher, setSelectedVoucher] = useState('')
  const [voucherData, setVoucherData] = useState({
    orderNo: '',
    customerName: '',
    debtorCode: '',
    institution: '',
    address: '',
    contactNo: '',
    orderDate: '',
    orderBy: '',
    items: [],
    quantityTotal: '',
    subTotal: '',
    transportCost: '',
    grandTotal: '',
    due: '',
    paid: '',
    grandTotalInWords: '',
    narration: '',
    // ✅ NEW: Additional fields for enhanced display
    customerEmail: '',
    customerGST: '',
    paymentTerms: '',
    status: ''
  })

  const [availableVouchers, setAvailableVouchers] = useState([
    { value: '', label: 'SEARCH VOUCHER NO' }
  ])

  // ✅ NEW: Loading state
  const [loading, setLoading] = useState(false)

  // Fetch the list of available vouchers on initial component load
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${config.API_URL}/sales-orders`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          const vouchers = result.data.map(salesOrder => ({
            value: salesOrder.orderNo,
            label: `${salesOrder.orderNo} - ${salesOrder.customerName || 'Unknown Customer'}`,
            status: salesOrder.status || 'Draft',
            date: salesOrder.orderDate,
            total: salesOrder.grandTotal
          }));
          setAvailableVouchers([{ value: '', label: 'SEARCH VOUCHER NO' }, ...vouchers]);
        }
      } catch (error) {
        console.error('Failed to fetch voucher list:', error);
      } finally {
        setLoading(false)
      }
    };
    fetchVouchers();
  }, []);

  const handleVoucherChange = async (orderNo) => {
    setSelectedVoucher(orderNo)

    if (!orderNo) {
      setVoucherData({
        orderNo: '',
        customerName: '',
        debtorCode: '',
        institution: '',
        address: '',
        contactNo: '',
        orderDate: '',
        orderBy: '',
        items: [],
        quantityTotal: '',
        subTotal: '',
        transportCost: '',
        grandTotal: '',
        due: '',
        paid: '',
        grandTotalInWords: '',
        narration: '',
        customerEmail: '',
        customerGST: '',
        paymentTerms: '',
        status: ''
      });
      return;
    }

    try {
      setLoading(true)
      const response = await fetch(`${config.API_URL}/sales-orders/sales-orders/${orderNo}`);
      if (!response.ok) {
        throw new Error('Failed to fetch voucher data');
      }
      const result = await response.json();
      
      if (result.success && result.data) {
        // ✅ ENHANCED: Better data mapping
        const fetchedData = {
          ...result.data,
          customerName: result.data.customerId?.customerName || result.data.customerName || '',
          debtorCode: result.data.customerId?.debtorCode || result.data.customerId?.customerCode || '',
          institution: result.data.customerId?.institutionName || result.data.customerId?.shopCompanyName || '',
          address: result.data.customerId?.address || '',
          contactNo: result.data.customerId?.contactNo || '',
          customerEmail: result.data.customerId?.emailAddress || '',
          customerGST: result.data.customerId?.gstNumber || '',
          orderDate: new Date(result.data.orderDate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          // ✅ ENHANCED: Items mapping with better data handling
          items: result.data.items.map((item, index) => ({
            sl: index + 1,
            itemName: item.itemName,
            itemCode: item.itemCode || '',
            itemDescription: item.itemDescription || '',
            rate: parseFloat(item.rate || 0).toFixed(2),
            per: item.per || item.unit || 'PCS',
            qty: item.qty,
            discount: item.discount ? `${item.discount}%` : '0%',
            discountAmount: item.discountAmount || 0,
            GST: item.GST ? `${item.GST}%` : '0%',
            gstAmount: item.GSTAmount || 0,
            total: parseFloat(item.total || 0).toFixed(2)
          })),
          // ✅ ENHANCED: Calculate quantity total
          quantityTotal: result.data.items.reduce((sum, item) => sum + (item.qty || 0), 0),
          paymentTerms: result.data.paymentTerms || 'Cash',
          status: result.data.status || 'Draft'
        };
        setVoucherData(fetchedData);
      } else {
        console.error('Voucher not found:', orderNo);
        alert('Voucher not found. Please check the voucher number.');
        resetVoucherData();
      }
    } catch (error) {
      console.error('Error fetching voucher data:', error);
      alert('Error loading voucher data. Please try again.');
      resetVoucherData();
    } finally {
      setLoading(false)
    }
  };

  const resetVoucherData = () => {
    setVoucherData({
      orderNo: '',
      customerName: '',
      debtorCode: '',
      institution: '',
      address: '',
      contactNo: '',
      orderDate: '',
      orderBy: '',
      items: [],
      quantityTotal: '',
      subTotal: '',
      transportCost: '',
      grandTotal: '',
      due: '',
      paid: '',
      grandTotalInWords: '',
      narration: '',
      customerEmail: '',
      customerGST: '',
      paymentTerms: '',
      status: ''
    });
  };

  // ✅ ENHANCED: Professional print function with company branding
  const handlePrint = () => {
    if (!voucherData.orderNo) {
      alert('Please select a voucher to print.');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Sales Order Invoice - ${voucherData.orderNo}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0;
              padding: 15px;
              font-size: 11px;
              line-height: 1.4;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              border: 2px solid #0f766e;
              border-radius: 8px;
              overflow: hidden;
            }
            .company-header {
              background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
              color: white;
              padding: 20px;
              text-align: center;
            }
            .company-name {
              font-size: 26px;
              font-weight: bold;
              margin-bottom: 5px;
              letter-spacing: 1px;
            }
            .company-details {
              font-size: 10px;
              opacity: 0.9;
              line-height: 1.3;
            }
            .invoice-title {
              background-color: #f0f9ff;
              text-align: center;
              padding: 12px;
              border-bottom: 2px solid #0f766e;
            }
            .invoice-title h1 {
              margin: 0;
              font-size: 22px;
              color: #0f766e;
              font-weight: bold;
            }
            .content {
              padding: 20px;
            }
            .info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 25px;
            }
            .info-box {
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 15px;
              background-color: #f9fafb;
            }
            .info-box h3 {
              margin: 0 0 10px 0;
              color: #0f766e;
              font-size: 14px;
              font-weight: bold;
              border-bottom: 1px solid #d1d5db;
              padding-bottom: 5px;
            }
            .info-row {
              display: flex;
              margin-bottom: 6px;
            }
            .info-label {
              font-weight: bold;
              width: 120px;
              color: #4b5563;
            }
            .info-value {
              flex: 1;
              color: #111827;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-approved { background: #dcfce7; color: #166534; }
            .status-pending { background: #fef3c7; color: #92400e; }
            .status-draft { background: #f3f4f6; color: #6b7280; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              border: 1px solid #0f766e;
            }
            th { 
              background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
              color: white;
              padding: 12px 8px;
              text-align: center;
              font-weight: bold;
              font-size: 10px;
              border: 1px solid #0c6c5b;
            }
            td { 
              border: 1px solid #d1d5db; 
              padding: 10px 8px; 
              font-size: 10px;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .item-row:nth-child(even) {
              background-color: #f9fafb;
            }
            .item-desc {
              font-size: 9px;
              color: #6b7280;
              margin-top: 2px;
              font-style: italic;
            }
            .totals-section {
              margin-top: 30px;
              display: grid;
              grid-template-columns: 1fr 350px;
              gap: 30px;
            }
            .totals-box {
              border: 2px solid #0f766e;
              border-radius: 8px;
              padding: 20px;
              background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
            }
            .totals-box h3 {
              margin: 0 0 15px 0;
              color: #0f766e;
              font-size: 16px;
              text-align: center;
              border-bottom: 1px solid #0f766e;
              padding-bottom: 8px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .total-label {
              font-weight: 600;
              color: #374151;
            }
            .total-value {
              font-weight: bold;
              color: #111827;
            }
            .grand-total {
              border-top: 2px solid #0f766e;
              padding-top: 10px;
              margin-top: 10px;
              font-size: 14px;
              color: #0f766e;
            }
            .words-section {
              margin-top: 25px;
              padding: 15px;
              background-color: #f0f9ff;
              border-left: 4px solid #0f766e;
              border-radius: 4px;
            }
            .words-section strong {
              color: #0f766e;
            }
            .narration-section {
              margin-top: 20px;
              padding: 15px;
              background-color: #fffbeb;
              border-left: 4px solid #f59e0b;
              border-radius: 4px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              padding: 20px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
              font-size: 9px;
              color: #6b7280;
            }
            .bank-details {
              background-color: #f0f9ff;
              padding: 12px;
              border-radius: 6px;
              margin-top: 15px;
              border: 1px solid #bfdbfe;
            }
            .bank-details h4 {
              margin: 0 0 8px 0;
              color: #1e40af;
              font-size: 12px;
            }
            @media print {
              body { margin: 0; padding: 10px; }
              .invoice-container { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Company Header -->
            <div class="company-header">
              <div class="company-name">${companyInfo.name}</div>
              <div class="company-details">
                ${companyInfo.address}<br>
                GSTIN: ${companyInfo.gstin} | Phone: ${companyInfo.phone}<br>
                Website: ${companyInfo.website} | State: ${companyInfo.state}
              </div>
            </div>
            
            <!-- Invoice Title -->
            <div class="invoice-title">
              <h1>SALES ORDER INVOICE</h1>
            </div>
            
            <div class="content">
              <!-- Info Section -->
              <div class="info-section">
                <!-- Customer Info -->
                <div class="info-box">
                  <h3>👤 Customer Information</h3>
                  <div class="info-row">
                    <span class="info-label">Debtor Code:</span>
                    <span class="info-value">${voucherData.debtorCode || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Name:</span>
                    <span class="info-value">${voucherData.customerName || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Institution:</span>
                    <span class="info-value">${voucherData.institution || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Address:</span>
                    <span class="info-value">${voucherData.address || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Contact:</span>
                    <span class="info-value">${voucherData.contactNo || 'N/A'}</span>
                  </div>
                  ${voucherData.customerEmail ? `
                  <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${voucherData.customerEmail}</span>
                  </div>
                  ` : ''}
                  ${voucherData.customerGST ? `
                  <div class="info-row">
                    <span class="info-label">GST No:</span>
                    <span class="info-value">${voucherData.customerGST}</span>
                  </div>
                  ` : ''}
                </div>
                
                <!-- Order Info -->
                <div class="info-box">
                  <h3>📋 Order Information</h3>
                  <div class="info-row">
                    <span class="info-label">Order No:</span>
                    <span class="info-value">${voucherData.orderNo}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Order Date:</span>
                    <span class="info-value">${voucherData.orderDate}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Order By:</span>
                    <span class="info-value">${voucherData.orderBy || 'N/A'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Payment Terms:</span>
                    <span class="info-value">${voucherData.paymentTerms || 'Cash'}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Status:</span>
                    <span class="info-value">
                      <span class="status-badge status-${voucherData.status.toLowerCase()}">${voucherData.status}</span>
                    </span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Generated:</span>
                    <span class="info-value">${new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <!-- Items Table -->
              <table>
                <thead>
                  <tr>
                    <th style="width: 5%;">SL</th>
                    <th style="width: 25%;">Item Details</th>
                    <th style="width: 10%;">Rate</th>
                    <th style="width: 8%;">Per</th>
                    <th style="width: 10%;">Order Qty</th>
                    <th style="width: 8%;">Disc %</th>
                    <th style="width: 10%;">Disc Amt</th>
                    <th style="width: 8%;">GST %</th>
                    <th style="width: 10%;">GST Amt</th>
                    <th style="width: 12%;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${voucherData.items && voucherData.items.length > 0 ? (
                    voucherData.items.map((item, index) => `
                      <tr class="item-row">
                        <td class="text-center">${item.sl}</td>
                        <td class="text-left">
                          <strong>${item.itemName}</strong>
                          ${item.itemCode ? `<br><small>Code: ${item.itemCode}</small>` : ''}
                          ${item.itemDescription ? `<div class="item-desc">${item.itemDescription}</div>` : ''}
                        </td>
                        <td class="text-right">₹${item.rate}</td>
                        <td class="text-center">${item.per}</td>
                        <td class="text-center">${item.qty}</td>
                        <td class="text-center">${item.discount}</td>
                        <td class="text-right">₹${parseFloat(item.discountAmount || 0).toFixed(2)}</td>
                        <td class="text-center">${item.GST}</td>
                        <td class="text-right">₹${parseFloat(item.gstAmount || 0).toFixed(2)}</td>
                        <td class="text-right"><strong>₹${item.total}</strong></td>
                      </tr>
                    `).join('')
                  ) : `
                      <tr>
                        <td colspan="10" class="text-center" style="padding: 20px; color: #6b7280;">No items found for this voucher.</td>
                      </tr>
                  `}
                  ${voucherData.items && voucherData.items.length > 0 ? `
                    <!-- Summary Row -->
                    <tr style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); font-weight: bold;">
                      <td colspan="4" class="text-right" style="color: #0f766e;">TOTALS:</td>
                      <td class="text-center" style="color: #0f766e;">${voucherData.items.reduce((sum, item) => sum + parseInt(item.qty || 0), 0)}</td>
                      <td class="text-center">-</td>
                      <td class="text-right" style="color: #dc2626;">₹${voucherData.items.reduce((sum, item) => sum + parseFloat(item.discountAmount || 0), 0).toFixed(2)}</td>
                      <td class="text-center">-</td>
                      <td class="text-right" style="color: #2563eb;">₹${voucherData.items.reduce((sum, item) => sum + parseFloat(item.gstAmount || 0), 0).toFixed(2)}</td>
                      <td class="text-right" style="color: #059669;">₹${voucherData.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)}</td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>

              <!-- Totals Section -->
              <div class="totals-section">
                <!-- Bank Details -->
                <div>
                  <div class="bank-details">
                    <h4>🏦 Bank Details</h4>
                    <strong>Bank:</strong> ${companyInfo.bankName}<br>
                    <strong>Account No:</strong> ${companyInfo.accountNo}<br>
                    <strong>Branch:</strong> ${companyInfo.branchCode}
                  </div>
                </div>
                
                <!-- Financial Summary -->
                <div class="totals-box">
                  <h3>💰 Order Summary</h3>
                  <div class="total-row">
                    <span class="total-label">Quantity Total:</span>
                    <span class="total-value">${voucherData.quantityTotal} items</span>
                  </div>
                  <div class="total-row">
                    <span class="total-label">Sub Total:</span>
                    <span class="total-value">₹${parseFloat(voucherData.subTotal || 0).toFixed(2)}</span>
                  </div>
                  <div class="total-row">
                    <span class="total-label">Transport Cost:</span>
                    <span class="total-value">₹${parseFloat(voucherData.transportCost || 0).toFixed(2)}</span>
                  </div>
                  <div class="total-row grand-total">
                    <span class="total-label">Grand Total:</span>
                    <span class="total-value">₹${parseFloat(voucherData.grandTotal || 0).toFixed(2)}</span>
                  </div>
                  ${voucherData.due ? `
                    <div class="total-row" style="color: #dc2626;">
                      <span class="total-label">Due Amount:</span>
                      <span class="total-value">₹${parseFloat(voucherData.due).toFixed(2)}</span>
                    </div>
                  ` : ''}
                  ${voucherData.paid ? `
                    <div class="total-row" style="color: #059669;">
                      <span class="total-label">Paid Amount:</span>
                      <span class="total-value">₹${parseFloat(voucherData.paid).toFixed(2)}</span>
                    </div>
                  ` : ''}
                </div>
              </div>

              <!-- Amount in Words -->
              ${voucherData.grandTotalInWords ? `
                <div class="words-section">
                  <strong>Amount in Words:</strong> ${voucherData.grandTotalInWords}
                </div>
              ` : ''}

              <!-- Narration -->
              ${voucherData.narration ? `
                <div class="narration-section">
                  <strong>📝 Notes:</strong> ${voucherData.narration}
                </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div class="footer">
              <strong>${companyInfo.name}</strong> - Sales Order Management System<br>
              This invoice is generated electronically and contains confidential business information.<br>
              For any queries, contact us at ${companyInfo.phone} or visit ${companyInfo.website}
            </div>
          </div>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  // ✅ NEW: Export to PDF function
  const handleExport = () => {
    if (!voucherData.orderNo) {
      alert('Please select a voucher to export.');
      return;
    }

    const csvContent = [
      [`${companyInfo.name} - Sales Order Invoice`],
      [`Order No: ${voucherData.orderNo}`],
      [`Customer: ${voucherData.customerName}`],
      [`Date: ${voucherData.orderDate}`],
      [`Generated: ${new Date().toLocaleString()}`],
      [],
      ['SL', 'Item Name', 'Rate', 'Per', 'Qty', 'Discount%', 'GST%', 'Total'],
      ...voucherData.items.map(item => [
        item.sl,
        item.itemName,
        item.rate,
        item.per,
        item.qty,
        item.discount,
        item.GST,
        item.total
      ]),
      [],
      ['Summary'],
      [`Sub Total: ₹${voucherData.subTotal}`],
      [`Transport: ₹${voucherData.transportCost}`],
      [`Grand Total: ₹${voucherData.grandTotal}`]
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales_order_${voucherData.orderNo}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* ✅ ENHANCED: Header with company branding */}
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">Sales Order Vouchers</h2>
          <div className="text-right">
            <div className="text-sm font-semibold">{companyInfo.name}</div>
            <div className="text-xs opacity-90">Sales Order Management</div>
          </div>
        </div>

        {/* ✅ ENHANCED: Controls section */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrint}
                disabled={!voucherData.orderNo}
                className="p-2 border rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Print Professional Invoice"
              >
                🖨️ Print
              </button>
              <button 
                onClick={handleExport}
                disabled={!voucherData.orderNo}
                className="p-2 border rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export to CSV"
              >
                📤 Export
              </button>
              <select 
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-80"
                value={selectedVoucher}
                onChange={(e) => handleVoucherChange(e.target.value)}
                disabled={loading}
              >
                {availableVouchers.map(voucher => (
                  <option key={voucher.value} value={voucher.value}>
                    {voucher.label}
                  </option>
                ))}
              </select>
              {loading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              )}
            </div>
            
            {/* ✅ NEW: Voucher summary info */}
            {voucherData.orderNo && (
              <div className="text-sm text-gray-600">
                <span className={`px-2 py-1 rounded text-xs ${
                  voucherData.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  voucherData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {voucherData.status}
                </span>
                <span className="ml-2">
                  Total: ₹{parseFloat(voucherData.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ✅ ENHANCED: Invoice Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading voucher data...</p>
            </div>
          ) : voucherData.orderNo ? (
            <>
              {/* ✅ ENHANCED: Professional Invoice Header */}
              <div className="text-center mb-8 border-2 border-teal-600 rounded-lg p-6 bg-gradient-to-br from-teal-50 to-blue-50">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-teal-600 mb-2">{companyInfo.name}</h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{companyInfo.address}</p>
                    <p><strong>GSTIN:</strong> {companyInfo.gstin} | <strong>Phone:</strong> {companyInfo.phone}</p>
                    <p><strong>Website:</strong> {companyInfo.website}</p>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-800 border-t-2 border-teal-200 pt-4">
                  SALES ORDER INVOICE
                </h2>
              </div>

              {/* ✅ ENHANCED: Customer and Order Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Customer Information */}
                <div className="border rounded-lg p-6 bg-gray-50 border-l-4 border-l-teal-500">
                  <h3 className="font-semibold text-teal-600 mb-4 text-lg flex items-center">
                    👤 Customer Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Debtor Code:</span>
                      <span className="text-gray-900">{voucherData.debtorCode || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Name:</span>
                      <span className="text-gray-900">{voucherData.customerName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Institution:</span>
                      <span className="text-gray-900">{voucherData.institution || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Address:</span>
                      <span className="text-gray-900">{voucherData.address || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Contact:</span>
                      <span className="text-gray-900">{voucherData.contactNo || 'N/A'}</span>
                    </div>
                    {voucherData.customerEmail && (
                      <div className="flex">
                        <span className="font-semibold w-32 text-gray-700">Email:</span>
                        <span className="text-gray-900">{voucherData.customerEmail}</span>
                      </div>
                    )}
                    {voucherData.customerGST && (
                      <div className="flex">
                        <span className="font-semibold w-32 text-gray-700">GST No:</span>
                        <span className="text-gray-900">{voucherData.customerGST}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Information */}
                <div className="border rounded-lg p-6 bg-blue-50 border-l-4 border-l-blue-500">
                  <h3 className="font-semibold text-blue-600 mb-4 text-lg flex items-center">
                    📋 Order Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Order No:</span>
                      <span className="text-gray-900 font-mono">{voucherData.orderNo}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Order Date:</span>
                      <span className="text-gray-900">{voucherData.orderDate}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Order By:</span>
                      <span className="text-gray-900">{voucherData.orderBy || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Payment Terms:</span>
                      <span className="text-gray-900">{voucherData.paymentTerms}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Status:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        voucherData.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        voucherData.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {voucherData.status}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-32 text-gray-700">Generated:</span>
                      <span className="text-gray-900 text-xs">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ ENHANCED: Items Table */}
              <div className="mb-8">
                <h3 className="font-semibold text-teal-600 mb-4 text-lg">📦 Order Items</h3>
                <div className="overflow-x-auto border-2 border-teal-100 rounded-lg">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-teal-500 to-blue-500 text-white">
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">SL</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">Item Details</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">Rate</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">Per</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">Order Qty</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">Disc %</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">Disc Amt</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">GST %</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">GST Amt</th>
                        <th className="border border-teal-400 px-3 py-3 text-center font-bold text-sm">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voucherData.items && voucherData.items.length > 0 ? (
                        voucherData.items.map((item, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-3 py-3 text-center font-medium">{item.sl}</td>
                            <td className="border border-gray-300 px-3 py-3">
                              <div>
                                <p className="font-semibold text-gray-800">{item.itemName}</p>
                                {item.itemCode && (
                                  <p className="text-xs text-gray-600">Code: {item.itemCode}</p>
                                )}
                                {item.itemDescription && (
                                  <p className="text-xs text-gray-500 italic mt-1">{item.itemDescription}</p>
                                )}
                              </div>
                            </td>
                            <td className="border border-gray-300 px-3 py-3 text-right">₹{item.rate}</td>
                            <td className="border border-gray-300 px-3 py-3 text-center">{item.per}</td>
                            <td className="border border-gray-300 px-3 py-3 text-center font-medium">{item.qty}</td>
                            <td className="border border-gray-300 px-3 py-3 text-center">{item.discount}</td>
                            <td className="border border-gray-300 px-3 py-3 text-right text-red-600">₹{parseFloat(item.discountAmount || 0).toFixed(2)}</td>
                            <td className="border border-gray-300 px-3 py-3 text-center">{item.GST}</td>
                            <td className="border border-gray-300 px-3 py-3 text-right text-blue-600">₹{parseFloat(item.gstAmount || 0).toFixed(2)}</td>
                            <td className="border border-gray-300 px-3 py-3 text-right font-bold text-green-600">₹{item.total}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="10" className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                            <div className="flex items-center justify-center">
                              <span>📋 No items found for this voucher</span>
                            </div>
                          </td>
                        </tr>
                      )}
                      
                      {/* ✅ NEW: Summary Row */}
                      {voucherData.items && voucherData.items.length > 0 && (
                        <tr className="bg-gradient-to-r from-teal-50 to-blue-50 font-bold border-t-2 border-teal-200">
                          <td colSpan="4" className="border border-gray-300 px-3 py-3 text-right text-teal-600">
                            TOTALS:
                          </td>
                          <td className="border border-gray-300 px-3 py-3 text-center text-teal-600">
                            {voucherData.items.reduce((sum, item) => sum + parseInt(item.qty || 0), 0)}
                          </td>
                          <td className="border border-gray-300 px-3 py-3 text-center">-</td>
                          <td className="border border-gray-300 px-3 py-3 text-right text-red-600">
                            ₹{voucherData.items.reduce((sum, item) => sum + parseFloat(item.discountAmount || 0), 0).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-3 text-center">-</td>
                          <td className="border border-gray-300 px-3 py-3 text-right text-blue-600">
                            ₹{voucherData.items.reduce((sum, item) => sum + parseFloat(item.gstAmount || 0), 0).toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-3 py-3 text-right text-green-600">
                            ₹{voucherData.items.reduce((sum, item) => sum + parseFloat(item.total || 0), 0).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ✅ ENHANCED: Financial Summary Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* Bank Details */}
                <div className="border rounded-lg p-6 bg-green-50 border-l-4 border-l-green-500">
                  <h3 className="font-semibold text-green-600 mb-4 text-lg flex items-center">
                    🏦 Bank Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="font-semibold w-20 text-gray-700">Bank:</span>
                      <span className="text-gray-900">{companyInfo.bankName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-20 text-gray-700">Account:</span>
                      <span className="text-gray-900">{companyInfo.accountNo}</span>
                    </div>
                    <div className="flex">
                      <span className="font-semibold w-20 text-gray-700">Branch:</span>
                      <span className="text-gray-900">{companyInfo.branchCode}</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="border-2 border-teal-500 rounded-lg p-6 bg-gradient-to-br from-teal-50 to-blue-50">
                  <h3 className="font-bold text-teal-600 mb-4 text-xl flex items-center">
                    💰 Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">Quantity Total:</span>
                      <span className="font-bold text-gray-900">{voucherData.quantityTotal} items</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">Sub Total:</span>
                      <span className="font-bold text-gray-900">₹{parseFloat(voucherData.subTotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-gray-700">Transport Cost:</span>
                      <span className="font-bold text-gray-900">₹{parseFloat(voucherData.transportCost || 0).toFixed(2)}</span>
                    </div>
                    <hr className="border-teal-300" />
                    <div className="flex justify-between text-lg font-bold text-teal-700 bg-white p-3 rounded border">
                      <span>Grand Total:</span>
                      <span>₹{parseFloat(voucherData.grandTotal || 0).toFixed(2)}</span>
                    </div>
                    
                    {/* Due and Paid amounts */}
                    {(voucherData.due || voucherData.paid) && (
                      <>
                        <hr className="border-teal-300" />
                        {voucherData.due && (
                          <div className="flex justify-between text-sm text-red-600">
                            <span className="font-semibold">Due Amount:</span>
                            <span className="font-bold">₹{parseFloat(voucherData.due).toFixed(2)}</span>
                          </div>
                        )}
                        {voucherData.paid && (
                          <div className="flex justify-between text-sm text-green-600">
                            <span className="font-semibold">Paid Amount:</span>
                            <span className="font-bold">₹{parseFloat(voucherData.paid).toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ ENHANCED: Amount in Words */}
              {voucherData.grandTotalInWords && (
                <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <h4 className="font-semibold text-blue-600 mb-2 flex items-center">
                    💬 Amount in Words
                  </h4>
                  <p className="text-gray-800 font-medium italic">{voucherData.grandTotalInWords}</p>
                </div>
              )}

              {/* ✅ ENHANCED: Narration */}
              {voucherData.narration && (
                <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                  <h4 className="font-semibold text-yellow-600 mb-2 flex items-center">
                    📝 Notes & Comments
                  </h4>
                  <p className="text-gray-800">{voucherData.narration}</p>
                </div>
              )}

              {/* ✅ NEW: Footer */}
              <div className="mt-8 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-600">
                <p className="font-medium">Thank you for your business!</p>
                <p>For any queries, contact us at {companyInfo.phone} | Visit: {companyInfo.website}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Voucher Selected</h3>
              <p className="text-gray-500">Please select a voucher from the dropdown above to view the invoice details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
