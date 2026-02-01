'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

// Professional Sales Invoice Print Modal Component
const SalesVoucherInvoicePrintModal = ({ isVisible, onClose, voucherData, companyInfo }) => {
  const [invoiceTemplate, setInvoiceTemplate] = useState('standard')

  if (!isVisible) return null

  // Generate IRN and Ack details (demo)
  const generateIRN = () => {
    const timestamp = Date.now().toString()
    return `b831b32dd01451b76bb1a73b11152ee95a595639dcdf${timestamp.slice(-12)}`
  }

  const getAckNumber = () => {
    return Math.floor(Math.random() * 999999999999999).toString()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB')
  }

  // Convert number to words (basic implementation)
  const numberToWords = (amount) => {
    const num = Math.floor(parseFloat(amount))
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
    
    if (num === 0) return 'Zero Rupees Only'
    if (num < 1000) return `${convertHundreds(num)} Rupees Only`
    if (num < 100000) return `${convertThousands(num)} Rupees Only`
    return `${Math.floor(num / 100000)} Lakh ${convertThousands(num % 100000)} Rupees Only`
    
    function convertHundreds(n) {
      if (n >= 100) {
        return ones[Math.floor(n / 100)] + ' Hundred ' + convertTens(n % 100)
      }
      return convertTens(n)
    }
    
    function convertTens(n) {
      if (n >= 20) {
        return tens[Math.floor(n / 10)] + ' ' + ones[n % 10]
      }
      if (n >= 10) {
        return teens[n - 10]
      }
      return ones[n]
    }
    
    function convertThousands(n) {
      if (n >= 1000) {
        return convertHundreds(Math.floor(n / 1000)) + ' Thousand ' + convertHundreds(n % 1000)
      }
      return convertHundreds(n)
    }
  }

  // Table styles
  const tableHeaderStyle = {
    border: '1px solid #dee2e6',
    padding: '8px 4px',
    backgroundColor: '#f8f9fa',
    fontSize: '10px',
    fontWeight: 'bold',
    textAlign: 'left'
  }

  const tableCellStyle = {
    border: '1px solid #dee2e6',
    padding: '6px 4px',
    fontSize: '10px',
    textAlign: 'left'
  }

  // Standard Professional Invoice Template
  const StandardInvoiceTemplate = () => {
    if (!voucherData) return null
    
    const calculateTaxBreakdown = (items) => {
      let subtotal = 0
      let totalDiscount = 0
      let totalTax = 0
      
      items.forEach(item => {
        const qty = parseFloat(item.qty.split(' ')[0]) || 0
        const rate = parseFloat(item.rate) || 0
        const discountPercent = parseFloat(item.discount.replace('%', '')) || 0
        const gstPercent = parseFloat(item.GST.replace('%', '')) || 0
        
        const itemSubtotal = qty * rate
        const itemDiscount = (itemSubtotal * discountPercent) / 100
        const itemTax = ((itemSubtotal - itemDiscount) * gstPercent) / 100
        
        subtotal += itemSubtotal
        totalDiscount += itemDiscount
        totalTax += itemTax
      })
      
      return { subtotal, totalDiscount, totalTax }
    }

    const { subtotal, totalDiscount, totalTax } = calculateTaxBreakdown(voucherData.items || [])
    const cgst = totalTax / 2
    const sgst = totalTax / 2
    
    return (
      <div className="invoice-template" style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '12px',
        lineHeight: '1.4',
        color: '#000',
        backgroundColor: '#fff',
        padding: '20px',
        maxWidth: '210mm',
        minHeight: '297mm'
      }}>
        {/* Header */}
        <div style={{
          borderBottom: '2px solid #0f766e',
          paddingBottom: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#0f766e',
                margin: '0 0 5px 0'
              }}>
                {companyInfo.name}
              </h1>
              <div style={{ fontSize: '11px', lineHeight: '1.3' }}>
                <div>{companyInfo.address}</div>
                <div>GSTIN/UIN: {companyInfo.gstin}</div>
                <div>State: {companyInfo.state}, Code: 19</div>
                <div>Phone: {companyInfo.phone}</div>
                <div>Website: {companyInfo.website}</div>
              </div>
            </div>
            
            <div style={{
              textAlign: 'right',
              fontSize: '18px',
              fontWeight: 'bold',
              color: '#0f766e'
            }}>
              TAX INVOICE
            </div>
          </div>
        </div>

        {/* E-Invoice Details */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '10px',
          marginBottom: '20px',
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
            <div>
              <strong>IRN:</strong> {generateIRN()}
            </div>
            <div>
              <strong>Ack No.:</strong> {getAckNumber()}
            </div>
            <div>
              <strong>Ack Date:</strong> {formatDate(voucherData.salesDate)}
            </div>
          </div>
        </div>

        {/* Buyer and Invoice Details */}
        <div style={{ display: 'flex', marginBottom: '20px', gap: '20px' }}>
          {/* Buyer Details */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>
              Buyer (Bill to)
            </h3>
            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <div><strong>{voucherData.customerName}</strong></div>
              {voucherData.institutionName && <div>{voucherData.institutionName}</div>}
              <div>{voucherData.address || 'N/A'}</div>
              <div>Contact: {voucherData.contactNo || 'N/A'}</div>
              <div>GSTIN/UIN: {voucherData.customerGST || 'N/A'}</div>
              <div>State Name: West Bengal, Code: 19</div>
            </div>
          </div>

          {/* Invoice Details */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <table style={{ width: '100%', fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td><strong>Invoice No.</strong></td>
                  <td>{voucherData.invoiceNo}</td>
                </tr>
                <tr>
                  <td><strong>Date</strong></td>
                  <td>dt. {formatDate(voucherData.salesDate)}</td>
                </tr>
                <tr>
                  <td><strong>Sales By</strong></td>
                  <td>{voucherData.salesBy}</td>
                </tr>
                <tr>
                  <td><strong>Transport Cost</strong></td>
                  <td>₹ {voucherData.transportCost}</td>
                </tr>
                <tr>
                  <td><strong>Previous Due</strong></td>
                  <td>₹ {voucherData.previousDue}</td>
                </tr>
                <tr>
                  <td><strong>Destination</strong></td>
                  <td>{voucherData.address || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Items Table */}
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={tableHeaderStyle}>Sl No.</th>
              <th style={tableHeaderStyle}>Description of Goods</th>
              <th style={tableHeaderStyle}>HSN/SAC</th>
              <th style={tableHeaderStyle}>Quantity</th>
              <th style={tableHeaderStyle}>Unit</th>
              <th style={tableHeaderStyle}>Rate</th>
              <th style={tableHeaderStyle}>per</th>
              <th style={tableHeaderStyle}>Rate (Incl. of Tax)</th>
              <th style={tableHeaderStyle}>Disc. %</th>
              <th style={tableHeaderStyle}>GST Rate</th>
              <th style={tableHeaderStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(voucherData.items || []).map((item, index) => (
              <tr key={index}>
                <td style={tableCellStyle}>{item.sl}</td>
                <td style={tableCellStyle}>
                  <div><strong>{item.itemName}</strong></div>
                  {item.itemDescription && <div style={{fontSize: '9px', color: '#666'}}>{item.itemDescription}</div>}
                </td>
                <td style={tableCellStyle}>85258090</td>
                <td style={tableCellStyle}>{item.qty.split(' ')[0]}</td>
                <td style={tableCellStyle}>{item.qty.split(' ')[1] || 'pcs'}</td>
                <td style={tableCellStyle}>{item.rate}</td>
                <td style={tableCellStyle}>{item.qty.split(' ')[1] || 'pcs'}</td>
                <td style={tableCellStyle}>
                  {(parseFloat(item.rate) + (parseFloat(item.rate) * parseFloat(item.GST.replace('%', '') || 0) / 100)).toFixed(2)}
                </td>
                <td style={tableCellStyle}>{item.discount}</td>
                <td style={tableCellStyle}>{item.GST}</td>
                <td style={tableCellStyle}>{item.total}</td>
              </tr>
            ))}
            
            {/* Tax Breakdown */}
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <td colSpan="9" style={tableCellStyle}></td>
              <td style={tableCellStyle}><strong>CGST</strong></td>
              <td style={tableCellStyle}><strong>{cgst.toFixed(2)}</strong></td>
            </tr>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <td colSpan="9" style={tableCellStyle}></td>
              <td style={tableCellStyle}><strong>SGST</strong></td>
              <td style={tableCellStyle}><strong>{sgst.toFixed(2)}</strong></td>
            </tr>
            <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold' }}>
              <td colSpan="9" style={tableCellStyle}></td>
              <td style={tableCellStyle}><strong>Total</strong></td>
              <td style={tableCellStyle}><strong>₹ {voucherData.grandTotal}</strong></td>
            </tr>
            <tr>
              <td colSpan="11" style={tableCellStyle}>
                <strong>Total Items: </strong>{voucherData.quantityTotal} {(voucherData.items || [])[0]?.qty.split(' ')[1] || 'pcs'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '10px' }}>
          <strong>Amount Chargeable (in words):</strong><br/>
          <strong>INR {voucherData.grandTotalInWords || numberToWords(voucherData.grandTotal)}</strong>
        </div>

        {/* Terms and Payment Details */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {/* Terms and Conditions */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Declaration</h4>
            <div style={{ fontSize: '10px', lineHeight: '1.3' }}>
              <div>1. Warranty of all items are covered by the Manufacturer or by their Authorised Service Centre.</div>
              <div>2. Replacement of Product sold under warranty will be done only after getting the Replacement from our Manufacturer.</div>
              <div>3. In case of cheque bouncing Rs. 300/- & 10% will be charged till date of realisation of the payment.</div>
              <div>4. Subject to Durgapur Jurisdiction Only.</div>
              <div style={{ marginTop: '10px' }}><strong>E. & O.E</strong></div>
            </div>
          </div>

          {/* Bank Details */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Company's Bank Details</h4>
            <div style={{ fontSize: '10px' }}>
              <div><strong>Bank Name:</strong> {companyInfo.bankName}</div>
              <div><strong>A/c No.:</strong> {companyInfo.accountNo}</div>
              <div><strong>Branch:</strong> {companyInfo.branchCode}</div>
            </div>
            
            {/* Payment Summary */}
            <div style={{ marginTop: '15px', borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
              <table style={{ width: '100%', fontSize: '10px' }}>
                <tbody>
                  <tr>
                    <td>Total Amount:</td>
                    <td style={{ textAlign: 'right' }}>₹ {voucherData.grandTotal}</td>
                  </tr>
                  <tr>
                    <td>Paid Amount:</td>
                    <td style={{ textAlign: 'right' }}>₹ {voucherData.paid}</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid #dee2e6' }}>
                    <td>Due Amount:</td>
                    <td style={{ textAlign: 'right', color: parseFloat(voucherData.due) > 0 ? '#dc3545' : '#28a745' }}>
                      ₹ {voucherData.due}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Narration */}
        {voucherData.narration && voucherData.narration !== 'N/A' && (
          <div style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '10px', backgroundColor: '#f9fafb' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Narration</h4>
            <div style={{ fontSize: '10px' }}>
              {voucherData.narration}
            </div>
          </div>
        )}

        {/* Challan Text */}
        {voucherData.challanText && voucherData.challanText !== 'N/A' && (
          <div style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '10px', backgroundColor: '#f9fafb' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Challan Text</h4>
            <div style={{ fontSize: '10px' }}>
              {voucherData.challanText}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          borderTop: '1px solid #dee2e6',
          paddingTop: '15px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ fontSize: '10px' }}>
            <div><strong>for {companyInfo.name.toUpperCase()}</strong></div>
            <div style={{ marginTop: '40px' }}>Authorised Signatory</div>
          </div>
          
          <div style={{ textAlign: 'right', fontSize: '10px' }}>
            <div>This is a Computer Generated Invoice</div>
            <div>{companyInfo.website}</div>
            <div>Contact: {companyInfo.phone}</div>
          </div>
        </div>
      </div>
    )
  }

  // Compact Receipt Template
  const CompactInvoiceTemplate = () => {
    if (!voucherData) return null
    
    return (
      <div className="invoice-template-compact" style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '11px',
        lineHeight: '1.3',
        color: '#000',
        backgroundColor: '#fff',
        padding: '15px',
        maxWidth: '148mm'
      }}>
        {/* Compact Header */}
        <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px solid #000' }}>
          <h2 style={{ margin: '0', fontSize: '16px', color: '#0f766e' }}>{companyInfo.name}</h2>
          <div style={{ fontSize: '9px' }}>{companyInfo.address}</div>
          <div style={{ fontSize: '9px' }}>Phone: {companyInfo.phone} | Website: {companyInfo.website}</div>
          <div style={{ fontSize: '9px' }}>GSTIN: {companyInfo.gstin}</div>
        </div>

        {/* Invoice Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <div><strong>Invoice: {voucherData.invoiceNo}</strong></div>
            <div>Date: {formatDate(voucherData.salesDate)}</div>
            <div>Sales By: {voucherData.salesBy}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Customer: {voucherData.customerName}</strong></div>
            <div>Contact: {voucherData.contactNo || 'N/A'}</div>
            <div>GST: {voucherData.customerGST || 'N/A'}</div>
          </div>
        </div>

        {/* Compact Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #000' }}>
              <th style={{ textAlign: 'left', padding: '3px' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '3px' }}>Qty</th>
              <th style={{ textAlign: 'right', padding: '3px' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '3px' }}>Disc%</th>
              <th style={{ textAlign: 'right', padding: '3px' }}>GST%</th>
              <th style={{ textAlign: 'right', padding: '3px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(voucherData.items || []).map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '3px' }}>
                  <div>{item.itemName}</div>
                  {item.itemDescription && <div style={{fontSize: '8px', color: '#666'}}>{item.itemDescription}</div>}
                </td>
                <td style={{ textAlign: 'center', padding: '3px' }}>{item.qty.split(' ')[0]}</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>₹{item.rate}</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>{item.discount}</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>{item.GST}</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>₹{item.total}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Section */}
        <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Transport Cost:</span>
            <span>₹{voucherData.transportCost}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>Total Amount:</span>
            <span>₹{voucherData.grandTotal}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Paid Amount:</span>
            <span>₹{voucherData.paid}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: parseFloat(voucherData.due) > 0 ? '#dc3545' : '#28a745' }}>
            <span>Due Amount:</span>
            <span>₹{voucherData.due}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '8px', color: '#666' }}>
          <div>Thank you for your business!</div>
          <div>{companyInfo.website}</div>
          <div>Printed on: {new Date().toLocaleString()}</div>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = document.getElementById('voucher-print-content').innerHTML
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Invoice - ${voucherData?.invoiceNo}</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Arial, sans-serif;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none !important; }
              @page { 
                margin: 0.5in; 
                size: ${invoiceTemplate === 'compact' ? 'A5' : 'A4'};
              }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
    
    alert('Invoice sent to printer!')
  }

  const handleDownloadPDF = () => {
    alert('PDF download functionality can be integrated with jsPDF library')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Print Professional Invoice</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Template Selection */}
          <div className="mb-4 flex gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">Invoice Template:</label>
              <select
                value={invoiceTemplate}
                onChange={(e) => setInvoiceTemplate(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="standard">Standard Professional (A4)</option>
                <option value="compact">Compact Receipt (A5)</option>
              </select>
            </div>
          </div>

          {/* Invoice Preview */}
          <div 
            id="voucher-print-content" 
            className="border border-gray-200 bg-white max-h-[60vh] overflow-auto"
            style={{ backgroundColor: '#fff' }}
          >
            {invoiceTemplate === 'standard' ? <StandardInvoiceTemplate /> : <CompactInvoiceTemplate />}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 transition-colors"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ViewSalesVouchers() {
  // Company Information for S.K. ELECTRICALS
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
  const [voucherData, setVoucherData] = useState(null)
  const [availableVouchers, setAvailableVouchers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Invoice Print States
  const [showInvoicePrint, setShowInvoicePrint] = useState(false)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  // Fetch available vouchers on component mount
  useEffect(() => {
    fetchAvailableVouchers()
  }, [])

  const fetchAvailableVouchers = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Build query parameters for filtering
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (dateRange.start) params.append('startDate', dateRange.start)
      if (dateRange.end) params.append('endDate', dateRange.end)
      params.append('limit', '100') // Get more entries for dropdown
      
      const response = await fetch(`${config.API_URL}/sales?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      console.log('Available vouchers response:', result)
      
      if (result.success && result.data) {
        const voucherOptions = result.data.map(entry => ({
          value: entry._id,
          label: `${entry.invoiceNo} - ${entry.customerName || 'General Customer'} - ₹${entry.grandTotal} (${new Date(entry.entryDate).toLocaleDateString('en-IN')})`,
          invoiceNo: entry.invoiceNo,
          customerName: entry.customerName,
          grandTotal: entry.grandTotal,
          entryDate: entry.entryDate,
          status: entry.status || 'Draft'
        }))
        setAvailableVouchers(voucherOptions)
      } else {
        setError('Failed to load vouchers: ' + (result.message || 'Unknown error'))
      }
    } catch (err) {
      console.error('Error fetching vouchers:', err)
      setError('Error loading vouchers: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchVoucherDetails = async (voucherId) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${config.API_URL}/sales/${voucherId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      console.log('Voucher details response:', result)
      
      if (result.success && result.data) {
        const entry = result.data
        console.log('Raw entry data:', entry)
        
        // Transform backend data to match the display format
        const transformedData = {
          invoiceNo: entry.invoiceNo || '',
          customerName: entry.customerName || 'General Customer',
          customerGST: entry.customerGST || '', // Include customer GST
          institutionName: entry.institutionName || '',
          address: entry.customerAddress || entry.address || '',
          contactNo: entry.contactNo || '',
          salesDate: entry.entryDate ? new Date(entry.entryDate).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          }) : new Date().toLocaleString(),
          salesBy: entry.employee || 'STAFF',
          
          // Items array with descriptions
          items: (entry.items || []).map((item, index) => ({
            sl: index + 1,
            itemName: item.itemName || 'Unknown Item',
            itemDescription: item.itemDescription || '', // Include item description
            rate: (item.rate || 0).toFixed(2),
            qty: `${item.quantity || 0} ${item.unit || 'Pcs'}`,
            discount: `${item.discountPercent || 0}%`,
            GST: `${item.GSTPercent || 0}%`,
            total: (item.total || 0).toFixed(2)
          })),
          
          // Calculate quantity total from items
          quantityTotal: (entry.items || []).reduce((sum, item) => 
            sum + (item.quantity || 0), 0).toString(),
          
          // Financial calculations
          amountSubTotal: (entry.subTotal || 0).toFixed(2),
          discount: (entry.discountAmount || 0).toFixed(2),
          discountPercent: (entry.discountPercent || 0).toString(),
          GST: (entry.GSTAmount || 0).toFixed(2),
          GSTPercent: (entry.GSTPercent || 0).toString(),
          transportCost: (entry.transportCost || 0).toFixed(2),
          grandTotal: (entry.grandTotal || 0).toFixed(2),
          paid: (entry.paidAmount || 0).toFixed(2),
          due: (entry.dueAmount || 0).toFixed(2),
          
          // Additional fields
          discountGSTMethod: entry.discountMethod || 'Individual Item',
          previousDue: (entry.previousDue || 0).toFixed(2),
          invoiceDue: (entry.grandTotal || 0).toFixed(2),
          currentDue: (entry.dueAmount || 0).toFixed(2),
          
          grandTotalInWords: entry.amountInWords || numberToWords(entry.grandTotal || 0),
          narration: entry.narration || '',
          challanText: entry.challanText || '',
          
          // Status and payment info
          status: entry.status || 'Draft',
          paymentMethod: entry.paymentMethod || 'Cash'
        }
        
        console.log('Transformed data:', transformedData)
        setVoucherData(transformedData)
      } else {
        setError('Failed to load voucher details: ' + (result.message || 'Voucher not found'))
        setVoucherData(null)
      }
    } catch (err) {
      console.error('Error loading voucher details:', err)
      setError('Error loading voucher details: ' + err.message)
      setVoucherData(null)
    } finally {
      setLoading(false)
    }
  }

  // Helper function for number to words conversion
  const numberToWords = (amount) => {
    const num = Math.floor(parseFloat(amount) || 0)
    if (num === 0) return 'Zero Rupees Only'
    return `Rupees ${num} Only`
  }

  const handleVoucherChange = (voucherId) => {
    console.log('Selected voucher ID:', voucherId)
    setSelectedVoucher(voucherId)
    if (voucherId) {
      fetchVoucherDetails(voucherId)
    } else {
      setVoucherData(null)
    }
  }

  const handleQuickPrint = () => {
    if (!voucherData) {
      alert('Please select a voucher first')
      return
    }
    
    const quickPrintContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
        <div style="text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0; color: #0f766e;">S.K. ELECTRICALS</h2>
          <div style="font-size: 12px;">Sales Invoice Receipt</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div><strong>Invoice:</strong> ${voucherData.invoiceNo}</div>
          <div><strong>Date:</strong> ${voucherData.salesDate}</div>
          <div><strong>Customer:</strong> ${voucherData.customerName}</div>
          <div><strong>GST:</strong> ${voucherData.customerGST || 'N/A'}</div>
          <div><strong>Sales By:</strong> ${voucherData.salesBy}</div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Items:</strong></td>
            <td style="text-align: right; padding: 8px 0;"><strong>${voucherData.items?.length || 0}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
            <td style="text-align: right; padding: 8px 0; color: #0f766e;">
              <strong>₹${voucherData.grandTotal}</strong>
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Paid:</strong></td>
            <td style="text-align: right; padding: 8px 0; color: #28a745;">
              <strong>₹${voucherData.paid}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;"><strong>Due:</strong></td>
            <td style="text-align: right; padding: 8px 0; color: ${parseFloat(voucherData.due) > 0 ? '#dc3545' : '#28a745'};">
              <strong>₹${voucherData.due}</strong>
            </td>
          </tr>
        </table>
        
        <div style="text-align: center; font-size: 10px; color: #666; margin-top: 20px;">
          Thank you for your business!<br/>
          ${new Date().toLocaleString()}
        </div>
      </div>
    `
    
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(`
      <html>
        <head><title>Sales Receipt - ${voucherData.invoiceNo}</title></head>
        <body style="margin: 0;">${quickPrintContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const handlePrintInvoice = () => {
    if (!voucherData) {
      alert('Please select a voucher first')
      return
    }
    setShowInvoicePrint(true)
  }

  const handleSearch = () => {
    fetchAvailableVouchers()
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setDateRange({ start: '', end: '' })
    fetchAvailableVouchers()
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">View Sales Vouchers</h2>
            <p className="text-sm opacity-90">Search and view sales invoice vouchers</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">S.K. ELECTRICALS</div>
            <div className="text-xs opacity-90">Sales Management System</div>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Search Term</label>
              <input
                type="text"
                placeholder="Invoice no, customer name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                onKeyPress={(e) => { if (e.key === 'Enter') handleSearch() }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleSearch}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'SEARCHING...' : 'SEARCH'}
              </button>
              <button 
                onClick={handleClearFilters}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                CLEAR FILTERS
              </button>
              <button 
                onClick={handleQuickPrint}
                className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Quick Print Receipt"
                disabled={!voucherData}
              >
                📄 Quick Print
              </button>
              <button 
                onClick={handlePrintInvoice}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Print Professional Invoice"
                disabled={!voucherData}
              >
                🖨️ Print Invoice
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Select Voucher:</label>
              <select 
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 min-w-80"
                value={selectedVoucher}
                onChange={(e) => handleVoucherChange(e.target.value)}
                disabled={loading}
              >
                <option value="">
                  {loading ? "Loading vouchers..." : "SEARCH VOUCHER NO"}
                </option>
                {availableVouchers.map(voucher => (
                  <option key={voucher.value} value={voucher.value}>
                    {voucher.label}
                  </option>
                ))}
              </select>
              {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>}
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Voucher Count */}
          {availableVouchers.length > 0 && (
            <div className="mt-4 text-sm text-gray-600">
              Found {availableVouchers.length} vouchers
            </div>
          )}
        </div>

        {/* Invoice Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading voucher data...</p>
            </div>
          ) : voucherData ? (
            <>
              {/* Invoice Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold border-b-2 border-teal-600 pb-2 inline-block px-8 text-teal-600">
                  INVOICE
                </h1>
              </div>

              {/* Customer and Invoice Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                {/* Left Side - Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-600">Customer Name:</span> <span className="font-semibold">{voucherData.customerName}</span></div>
                    <div><span className="font-medium text-gray-600">Institution:</span> {voucherData.institutionName || 'N/A'}</div>
                    <div><span className="font-medium text-gray-600">Address:</span> {voucherData.address || 'N/A'}</div>
                    <div><span className="font-medium text-gray-600">Contact No:</span> {voucherData.contactNo || 'N/A'}</div>
                    <div><span className="font-medium text-gray-600">GST Number:</span> {voucherData.customerGST || 'N/A'}</div>
                  </div>
                </div>

                {/* Right Side - Invoice Info */}
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Invoice Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-600">Invoice No:</span> <span className="font-semibold text-teal-600">{voucherData.invoiceNo}</span></div>
                    <div><span className="font-medium text-gray-600">Sales Date:</span> {voucherData.salesDate}</div>
                    <div><span className="font-medium text-gray-600">Sales By:</span> {voucherData.salesBy}</div>
                    <div><span className="font-medium text-gray-600">Payment Method:</span> {voucherData.paymentMethod}</div>
                    <div><span className="font-medium text-gray-600">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        voucherData.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        voucherData.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                        voucherData.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {voucherData.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Sold Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-teal-100">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-xs">SL</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-xs">Item Name</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-xs">Description</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">QTY</th>
                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-xs">Rate</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">Discount%</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">GST%</th>
                        <th className="border border-gray-300 px-3 py-2 text-right font-semibold text-xs">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voucherData.items && voucherData.items.length > 0 ? (
                        voucherData.items.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">{item.sl}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs font-medium">{item.itemName}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600">{item.itemDescription || 'N/A'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">{item.qty}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs">₹{item.rate}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">{item.discount}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">{item.GST}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">₹{item.total}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="8" className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Due Information Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Previous Due</h4>
                  <div className="text-xl font-bold text-blue-600">₹{voucherData.previousDue}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Invoice Amount</h4>
                  <div className="text-xl font-bold text-green-600">₹{voucherData.invoiceDue}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Current Due</h4>
                  <div className="text-xl font-bold text-red-600">₹{voucherData.currentDue}</div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left - Calculation Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Calculation Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Quantity Total:</span>
                      <span className="font-medium">({voucherData.quantityTotal})</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount Sub Total:</span>
                      <span className="font-medium">₹{voucherData.amountSubTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount ({voucherData.discountPercent}%):</span>
                      <span className="font-medium">₹{voucherData.discount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST ({voucherData.GSTPercent}%):</span>
                      <span className="font-medium">₹{voucherData.GST}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transport Cost:</span>
                      <span className="font-medium">₹{voucherData.transportCost}</span>
                    </div>
                  </div>
                </div>

                {/* Right - Payment Summary */}
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Payment Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-lg font-semibold">Grand Total:</span>
                      <span className="text-2xl font-bold text-teal-600">₹{voucherData.grandTotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Paid Amount:</span>
                      <span className="font-bold text-green-600">₹{voucherData.paid}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Due Amount:</span>
                      <span className={`font-bold ${parseFloat(voucherData.due) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{voucherData.due}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Discount Method:</span>
                      <div className="text-sm mt-1 px-2 py-1 bg-gray-200 rounded">{voucherData.discountGSTMethod}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grand Total in Words */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-gray-800 whitespace-nowrap">Grand Total in Words:</span>
                  <span className="font-medium text-blue-800">
                    {voucherData.grandTotalInWords}
                  </span>
                </div>
              </div>

              {/* Narration */}
              {voucherData.narration && voucherData.narration !== 'N/A' && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Narration:</h4>
                  <div className="text-gray-700">
                    {voucherData.narration}
                  </div>
                </div>
              )}

              {/* Challan Text */}
              {voucherData.challanText && voucherData.challanText !== 'N/A' && (
                <div className="bg-green-50 p-4 rounded-lg mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Challan Text:</h4>
                  <div className="text-gray-700">
                    {voucherData.challanText}
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Additional Details:</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Discount Method:</strong> {voucherData.discountGSTMethod}</div>
                  <div><strong>Total Items:</strong> {voucherData.items.length}</div>
                  <div><strong>Payment Method:</strong> {voucherData.paymentMethod}</div>
                  <div><strong>Status:</strong> {voucherData.status}</div>
                </div>
              </div>

              {/* Footer Information */}
              <div className="text-center text-xs text-gray-500 border-t pt-4 mt-6">
                <p>This sales invoice was generated on {voucherData.salesDate}</p>
                <p className="mt-1">S.K. ELECTRICALS - Sales Management System</p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-600">No Voucher Selected</h3>
              <p className="text-gray-500 mt-2">Please select a voucher from the dropdown above to view invoice details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Invoice Print Modal */}
      <SalesVoucherInvoicePrintModal
        isVisible={showInvoicePrint}
        onClose={() => setShowInvoicePrint(false)}
        voucherData={voucherData}
        companyInfo={companyInfo}
      />
    </div>
  )
}
