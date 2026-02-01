'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

// Professional Sales Return Invoice Print Modal Component
const SalesReturnInvoicePrintModal = ({ isVisible, onClose, salesReturnEntry, companyInfo }) => {
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

  // Standard Professional Sales Return Invoice Template
  const StandardInvoiceTemplate = () => {
    if (!salesReturnEntry) return null
    
    const calculateTaxBreakdown = (items) => {
      let subtotal = 0
      let totalDiscount = 0
      let totalTax = 0
      
      items.forEach(item => {
        const itemSubtotal = item.returnQty * item.rate
        const itemDiscount = (itemSubtotal * item.discountPercent) / 100
        const itemTax = ((itemSubtotal - itemDiscount) * item.GSTPercent) / 100
        
        subtotal += itemSubtotal
        totalDiscount += itemDiscount
        totalTax += itemTax
      })
      
      return { subtotal, totalDiscount, totalTax }
    }

    const { subtotal, totalDiscount, totalTax } = calculateTaxBreakdown(salesReturnEntry.items || [])
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
          borderBottom: '2px solid #dc2626',
          paddingBottom: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#dc2626',
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
              color: '#dc2626'
            }}>
              SALES RETURN INVOICE
            </div>
          </div>
        </div>

        {/* E-Invoice Details */}
        <div style={{
          backgroundColor: '#fef2f2',
          padding: '10px',
          marginBottom: '20px',
          border: '1px solid #fecaca',
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
              <strong>Ack Date:</strong> {formatDate(salesReturnEntry.entryDate)}
            </div>
          </div>
        </div>

        {/* Customer and Return Details */}
        <div style={{ display: 'flex', marginBottom: '20px', gap: '20px' }}>
          {/* Customer Details */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 'bold' }}>
              Customer (Return From)
            </h3>
            <div style={{ fontSize: '11px', lineHeight: '1.4' }}>
              <div><strong>{salesReturnEntry.customerName}</strong></div>
              {salesReturnEntry.institutionName && <div>{salesReturnEntry.institutionName}</div>}
              <div>{salesReturnEntry.customerAddress}</div>
              <div>Contact: {salesReturnEntry.contactNo}</div>
              <div>GSTIN/UIN: {salesReturnEntry.customerGST || 'N/A'}</div>
              <div>State Name: West Bengal, Code: 19</div>
            </div>
          </div>

          {/* Return Details */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <table style={{ width: '100%', fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td><strong>Return Voucher No.</strong></td>
                  <td>{salesReturnEntry.voucherNo}</td>
                </tr>
                <tr>
                  <td><strong>Date</strong></td>
                  <td>dt. {formatDate(salesReturnEntry.entryDate)}</td>
                </tr>
                <tr>
                  <td><strong>Original Sale Invoice</strong></td>
                  <td>{salesReturnEntry.saleInvoice || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Return Account</strong></td>
                  <td>{salesReturnEntry.salesReturnAcc}</td>
                </tr>
                <tr>
                  <td><strong>Return Method</strong></td>
                  <td>{salesReturnEntry.discountGSTMethod}</td>
                </tr>
                <tr>
                  <td><strong>Status</strong></td>
                  <td>{salesReturnEntry.status}</td>
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
            <tr style={{ backgroundColor: '#fef2f2' }}>
              <th style={tableHeaderStyle}>Sl No.</th>
              <th style={tableHeaderStyle}>Description of Goods</th>
              <th style={tableHeaderStyle}>HSN/SAC</th>
              <th style={tableHeaderStyle}>Sold Qty</th>
              <th style={tableHeaderStyle}>Return Qty</th>
              <th style={tableHeaderStyle}>Unit</th>
              <th style={tableHeaderStyle}>Rate</th>
              <th style={tableHeaderStyle}>Disc. %</th>
              <th style={tableHeaderStyle}>GST Rate</th>
              <th style={tableHeaderStyle}>Return Amount</th>
            </tr>
          </thead>
          <tbody>
            {(salesReturnEntry.items || []).map((item, index) => (
              <tr key={index}>
                <td style={tableCellStyle}>{index + 1}</td>
                <td style={tableCellStyle}>
                  <div><strong>{item.itemName}</strong></div>
                  {item.itemDescription && <div style={{fontSize: '9px', color: '#666'}}>{item.itemDescription}</div>}
                </td>
                <td style={tableCellStyle}>85258090</td>
                <td style={tableCellStyle}>{item.qty}</td>
                <td style={tableCellStyle}><strong style={{color: '#dc2626'}}>{item.returnQty}</strong></td>
                <td style={tableCellStyle}>pcs</td>
                <td style={tableCellStyle}>{item.rate.toFixed(2)}</td>
                <td style={tableCellStyle}>{item.discountPercent.toFixed(2)}</td>
                <td style={tableCellStyle}>{item.GSTPercent} %</td>
                <td style={tableCellStyle}><strong>{item.total.toFixed(2)}</strong></td>
              </tr>
            ))}
            
            {/* Tax Breakdown */}
            <tr style={{ backgroundColor: '#fef2f2' }}>
              <td colSpan="8" style={tableCellStyle}></td>
              <td style={tableCellStyle}><strong>CGST</strong></td>
              <td style={tableCellStyle}><strong>{cgst.toFixed(2)}</strong></td>
            </tr>
            <tr style={{ backgroundColor: '#fef2f2' }}>
              <td colSpan="8" style={tableCellStyle}></td>
              <td style={tableCellStyle}><strong>SGST</strong></td>
              <td style={tableCellStyle}><strong>{sgst.toFixed(2)}</strong></td>
            </tr>
            <tr style={{ backgroundColor: '#fee2e2', fontWeight: 'bold' }}>
              <td colSpan="8" style={tableCellStyle}></td>
              <td style={tableCellStyle}><strong>Total Return</strong></td>
              <td style={tableCellStyle}><strong>₹ {parseFloat(salesReturnEntry.grandTotal).toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td colSpan="10" style={tableCellStyle}>
                <strong>Total Return Items: </strong>{(salesReturnEntry.items || []).reduce((sum, item) => sum + item.returnQty, 0)} pcs
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '10px' }}>
          <strong>Return Amount Chargeable (in words):</strong><br/>
          <strong>INR {numberToWords(salesReturnEntry.grandTotal)}</strong>
        </div>

        {/* Terms and Payment Details */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          {/* Return Terms and Conditions */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Return Policy & Terms</h4>
            <div style={{ fontSize: '10px', lineHeight: '1.3' }}>
              <div>1. Items returned must be in original condition and packaging.</div>
              <div>2. Return period is subject to company policy terms.</div>
              <div>3. Refunds will be processed as per original payment method.</div>
              <div>4. Damaged or used items may be subject to restocking fees.</div>
              <div>5. Subject to Durgapur Jurisdiction Only.</div>
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
            
            {/* Return Summary */}
            <div style={{ marginTop: '15px', borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
              <table style={{ width: '100%', fontSize: '10px' }}>
                <tbody>
                  <tr>
                    <td>Sub Total:</td>
                    <td style={{ textAlign: 'right' }}>₹ {parseFloat(salesReturnEntry.subTotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Discount (Rs):</td>
                    <td style={{ textAlign: 'right' }}>₹ {parseFloat(salesReturnEntry.discountRs || 0).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>GST Amount:</td>
                    <td style={{ textAlign: 'right' }}>₹ {parseFloat(salesReturnEntry.GSTRs || 0).toFixed(2)}</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid #dee2e6' }}>
                    <td>Return Amount:</td>
                    <td style={{ textAlign: 'right', color: '#dc2626' }}>
                      ₹ {parseFloat(salesReturnEntry.grandTotal).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Narration */}
        {salesReturnEntry.narration && (
          <div style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '10px', backgroundColor: '#f9fafb' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Return Reason/Notes</h4>
            <div style={{ fontSize: '10px', fontStyle: 'italic' }}>
              "{salesReturnEntry.narration}"
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
            <div>This is a Computer Generated Sales Return Invoice</div>
            <div>{companyInfo.website}</div>
            <div>Contact: {companyInfo.phone}</div>
          </div>
        </div>
      </div>
    )
  }

  // Compact Receipt Template
  const CompactInvoiceTemplate = () => {
    if (!salesReturnEntry) return null
    
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
        <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px solid #dc2626' }}>
          <h2 style={{ margin: '0', fontSize: '16px', color: '#dc2626' }}>{companyInfo.name}</h2>
          <div style={{ fontSize: '9px' }}>{companyInfo.address}</div>
          <div style={{ fontSize: '9px' }}>Phone: {companyInfo.phone} | Website: {companyInfo.website}</div>
          <div style={{ fontSize: '9px' }}>GSTIN: {companyInfo.gstin}</div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#dc2626', marginTop: '5px' }}>SALES RETURN RECEIPT</div>
        </div>

        {/* Return Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <div><strong>Voucher: {salesReturnEntry.voucherNo}</strong></div>
            <div>Date: {formatDate(salesReturnEntry.entryDate)}</div>
            <div>Original Invoice: {salesReturnEntry.saleInvoice || 'N/A'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Customer: {salesReturnEntry.customerName}</strong></div>
            <div>Contact: {salesReturnEntry.contactNo}</div>
            <div>GST: {salesReturnEntry.customerGST || 'N/A'}</div>
            {salesReturnEntry.institutionName && <div>Inst: {salesReturnEntry.institutionName}</div>}
          </div>
        </div>

        {/* Compact Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '10px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #dc2626' }}>
              <th style={{ textAlign: 'left', padding: '3px' }}>Item</th>
              <th style={{ textAlign: 'center', padding: '3px' }}>Ret.Qty</th>
              <th style={{ textAlign: 'right', padding: '3px' }}>Rate</th>
              <th style={{ textAlign: 'right', padding: '3px' }}>Disc%</th>
              <th style={{ textAlign: 'right', padding: '3px' }}>GST%</th>
              <th style={{ textAlign: 'right', padding: '3px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {(salesReturnEntry.items || []).map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '3px' }}>
                  <div>{item.itemName}</div>
                  {item.itemDescription && <div style={{fontSize: '8px', color: '#666'}}>{item.itemDescription}</div>}
                </td>
                <td style={{ textAlign: 'center', padding: '3px', color: '#dc2626', fontWeight: 'bold' }}>{item.returnQty}</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>₹{item.rate}</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>{item.discountPercent}%</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>{item.GSTPercent}%</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Section */}
        <div style={{ borderTop: '1px solid #dc2626', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Sub Total:</span>
            <span>₹{parseFloat(salesReturnEntry.subTotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Discount (Rs):</span>
            <span>₹{parseFloat(salesReturnEntry.discountRs || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>GST Amount:</span>
            <span>₹{parseFloat(salesReturnEntry.GSTRs || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#dc2626' }}>
            <span>Return Amount:</span>
            <span>₹{parseFloat(salesReturnEntry.grandTotal).toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '8px', color: '#666' }}>
          <div>Return processed successfully!</div>
          <div>{companyInfo.website}</div>
          <div>Printed on: {new Date().toLocaleString()}</div>
        </div>
      </div>
    )
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    const printContent = document.getElementById('sales-return-print-content').innerHTML
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Return Invoice - ${salesReturnEntry?.voucherNo}</title>
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
    
    alert('Sales Return Invoice sent to printer!')
  }

  const handleDownloadPDF = () => {
    alert('PDF download functionality can be integrated with jsPDF library')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-red-600 text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Print Sales Return Invoice</h2>
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
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
              >
                <option value="standard">Standard Professional (A4)</option>
                <option value="compact">Compact Receipt (A5)</option>
              </select>
            </div>
          </div>

          {/* Invoice Preview */}
          <div 
            id="sales-return-print-content" 
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
              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ViewSalesReturn() {
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
  const [availableVouchers, setAvailableVouchers] = useState([
    { value: '', label: 'SEARCH VOUCHER NO' }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Invoice Print States
  const [showInvoicePrint, setShowInvoicePrint] = useState(false)
  const [selectedSalesReturnEntry, setSelectedSalesReturnEntry] = useState(null)

  // Fetch the list of available vouchers on initial component load
  useEffect(() => {
    fetchVouchers()
  }, [])

  const fetchVouchers = async () => {
    try {
      const response = await fetch(`${config.API_URL}/sales-return/sales-returns`)
      const result = await response.json()
      
      if (result.success && result.data) {
        const vouchers = result.data.map(salesReturn => ({
          value: salesReturn.voucherNo,
          label: `${salesReturn.voucherNo} - ${salesReturn.customerName} (${new Date(salesReturn.entryDate).toLocaleDateString('en-IN')})`
        }))
        setAvailableVouchers([{ value: '', label: 'SEARCH VOUCHER NO' }, ...vouchers])
      }
    } catch (error) {
      console.error('Failed to fetch voucher list:', error)
      setError('Failed to load vouchers. Please try again.')
    }
  }

  const handleVoucherChange = async (voucherNo) => {
    setSelectedVoucher(voucherNo)
    setError(null)

    if (!voucherNo) {
      setVoucherData(null)
      return
    }

    setLoading(true)
    try {
      // Fetch sales return by voucher number
      const response = await fetch(`${config.API_URL}/sales-return/${voucherNo}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch voucher data')
      }
      
      const result = await response.json()
      
      if (result.success && result.data) {
        setVoucherData(result.data)
      } else {
        throw new Error(result.message || 'Voucher not found')
      }
    } catch (error) {
      console.error('Error fetching voucher data:', error)
      setError(`Error fetching voucher: ${error.message}`)
      setVoucherData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleQuickPrint = () => {
    if (!voucherData) {
      alert('Please select a voucher first')
      return
    }

    const quickPrintContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
        <div style="text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0; color: #dc2626;">S.K. ELECTRICALS</h2>
          <div style="font-size: 12px;">Sales Return Receipt</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div><strong>Voucher:</strong> ${voucherData.voucherNo}</div>
          <div><strong>Date:</strong> ${new Date(voucherData.entryDate).toLocaleDateString('en-IN')}</div>
          <div><strong>Customer:</strong> ${voucherData.customerName}</div>
          <div><strong>GST:</strong> ${voucherData.customerGST || 'N/A'}</div>
          <div><strong>Original Invoice:</strong> ${voucherData.saleInvoice || 'N/A'}</div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Return Items:</strong></td>
            <td style="text-align: right; padding: 8px 0;"><strong>${voucherData.items?.length || 0}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Return Amount:</strong></td>
            <td style="text-align: right; padding: 8px 0; color: #dc2626;">
              <strong>₹${parseFloat(voucherData.grandTotal).toFixed(2)}</strong>
            </td>
          </tr>
        </table>
        
        <div style="text-align: center; font-size: 10px; color: #666; margin-top: 20px;">
          Return processed successfully!<br/>
          ${new Date().toLocaleString()}
        </div>
      </div>
    `
    
    const printWindow = window.open('', '_blank', 'width=400,height=600')
    printWindow.document.write(`
      <html>
        <head><title>Sales Return Receipt - ${voucherData.voucherNo}</title></head>
        <body style="margin: 0;">${quickPrintContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const handleProfessionalPrint = () => {
    if (!voucherData) {
      alert('Please select a voucher first')
      return
    }
    
    setSelectedSalesReturnEntry(voucherData)
    setShowInvoicePrint(true)
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
        <div className="bg-red-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">View Sales Return</h2>
            <p className="text-sm opacity-90">Search and view sales return vouchers</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold">S.K. ELECTRICALS</div>
            <div className="text-xs opacity-90">Sales Return Management</div>
          </div>
        </div>

        {/* Search and Print Controls */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleQuickPrint}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors flex items-center gap-2"
                title="Quick Print Receipt"
                disabled={!voucherData}
              >
                📄 Quick Print
              </button>
              <button 
                onClick={handleProfessionalPrint}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors flex items-center gap-2"
                title="Professional Invoice Print"
                disabled={!voucherData}
              >
                🖨️ Print Invoice
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Select Voucher:</label>
              <select 
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 min-w-80"
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
              {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {/* Voucher Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading voucher data...</p>
            </div>
          ) : voucherData ? (
            <>
              {/* Voucher Header */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold border-b-2 border-red-600 pb-2 inline-block px-8 text-red-600">
                  SALES RETURN VOUCHER
                </h1>
              </div>

              {/* Customer and Return Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                {/* Left Side - Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Customer Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-600">Customer Name:</span> <span className="font-semibold">{voucherData.customerName}</span></div>
                    <div><span className="font-medium text-gray-600">Institution:</span> {voucherData.institutionName || 'N/A'}</div>
                    <div><span className="font-medium text-gray-600">Address:</span> {voucherData.customerAddress || 'N/A'}</div>
                    <div><span className="font-medium text-gray-600">Contact No:</span> {voucherData.contactNo || 'N/A'}</div>
                    <div><span className="font-medium text-gray-600">GST Number:</span> {voucherData.customerGST || 'N/A'}</div>
                  </div>
                </div>

                {/* Right Side - Return Info */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2">Return Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium text-gray-600">Voucher No:</span> <span className="font-semibold text-red-600">{voucherData.voucherNo}</span></div>
                    <div><span className="font-medium text-gray-600">Return Date:</span> {formatDate(voucherData.entryDate)}</div>
                    <div><span className="font-medium text-gray-600">Original Sale Invoice:</span> {voucherData.saleInvoice || 'N/A'}</div>
                    <div><span className="font-medium text-gray-600">Return Account:</span> {voucherData.salesReturnAcc}</div>
                    <div><span className="font-medium text-gray-600">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        voucherData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {voucherData.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Returned Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-red-100">
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-xs">SL</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-xs">Item Name</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-xs">Description</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">Sold Qty</th>
                        <th className="border border-gray-300 px-3 py-2 text-center font-semibold text-xs">Return Qty</th>
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
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">{index + 1}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs font-medium">{item.itemName}</td>
                            <td className="border border-gray-300 px-3 py-2 text-xs text-gray-600">{item.itemDescription || 'N/A'}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">{item.qty}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">
                              <span className="font-bold text-red-600">{item.returnQty}</span>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs">₹{item.rate.toFixed(2)}</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">{item.discountPercent}%</td>
                            <td className="border border-gray-300 px-3 py-2 text-center text-xs">{item.GSTPercent}%</td>
                            <td className="border border-gray-300 px-3 py-2 text-right text-xs font-semibold">₹{item.total.toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="9" className="border border-gray-300 px-3 py-8 text-center text-gray-500">
                            No items found for this voucher.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left - Calculation Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Calculation Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Sub Total:</span>
                      <span className="font-medium">₹{parseFloat(voucherData.subTotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount (Rs):</span>
                      <span className="font-medium">₹{parseFloat(voucherData.discountRs || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount (%):</span>
                      <span className="font-medium">{parseFloat(voucherData.discountPercent || 0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST Amount:</span>
                      <span className="font-medium">₹{parseFloat(voucherData.GSTRs || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (%):</span>
                      <span className="font-medium">{parseFloat(voucherData.GSTPercent || 0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Right - Grand Total */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Return Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-lg font-semibold">Grand Total:</span>
                      <span className="text-2xl font-bold text-red-600">₹{parseFloat(voucherData.grandTotal).toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Discount Method:</span>
                      <div className="text-sm mt-1 px-2 py-1 bg-gray-200 rounded">{voucherData.discountGSTMethod}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Total Return Items:</span>
                      <div className="text-sm mt-1 font-semibold text-red-600">
                        {(voucherData.items || []).reduce((sum, item) => sum + item.returnQty, 0)} items
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grand Total in Words */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                  <span className="font-semibold text-gray-800 whitespace-nowrap">Amount in Words:</span>
                  <span className="font-medium text-blue-800">
                    {/* You can integrate a number-to-words library here */}
                    {`Rupees ${Math.floor(parseFloat(voucherData.grandTotal))} Only`}
                  </span>
                </div>
              </div>

              {/* Narration */}
              {voucherData.narration && (
                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Return Reason/Notes:</h4>
                  <div className="text-gray-700 italic">
                    "{voucherData.narration}"
                  </div>
                </div>
              )}

              {/* Footer Information */}
              <div className="text-center text-xs text-gray-500 border-t pt-4">
                <p>This sales return voucher was processed on {formatDate(voucherData.entryDate)}</p>
                <p className="mt-1">S.K. ELECTRICALS - Sales Return Management System</p>
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
              <p className="text-gray-500 mt-2">Please select a voucher number from the dropdown above to view details.</p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Invoice Print Modal */}
      <SalesReturnInvoicePrintModal
        isVisible={showInvoicePrint}
        onClose={() => setShowInvoicePrint(false)}
        salesReturnEntry={selectedSalesReturnEntry}
        companyInfo={companyInfo}
      />
    </div>
  )
}
