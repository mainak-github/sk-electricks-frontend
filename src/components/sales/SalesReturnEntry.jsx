'use client'

import { useState, useEffect } from 'react'
import { Plus, Save, RotateCcw, ChevronDown, Calendar, Eye } from 'lucide-react'
import config from '../../../url'

// Invoice Print Modal Component for Sales Returns (Updated to show GST and descriptions)
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
              <div><strong>{salesReturnEntry.customerName || salesReturnEntry.customerId?.name}</strong></div>
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
                  <td><strong>Customer ID</strong></td>
                  <td>{salesReturnEntry.customerId?._id}</td>
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
                    <td>Discount (%):</td>
                    <td style={{ textAlign: 'right' }}>{parseFloat(salesReturnEntry.discountPercent || 0)}%</td>
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
            <div><strong>Customer: {salesReturnEntry.customerName || salesReturnEntry.customerId?.name}</strong></div>
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

export default function SalesReturnEntry() {
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

  // Get today's date in DD/MM/YYYY format
  const getTodayFormatted = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  const [formData, setFormData] = useState({
    searchItem: '',
    searchCustomer: '',
    saleInvoice: '',
    institutionName: '',
    contactNo: '',
    customerAddress: '',
    customerGST: '', // Added customer GST field
    voucherNo: '',
    entryDate: getTodayFormatted(),
    discountRs: '0',
    discountPercent: '0',
    GSTRs: '0',
    GSTPercent: '0',
    total: '0',
    narration: '',
    discountGSTMethod: 'Individual Item',
    salesReturnAcc: 'Sales Return',
    grandTotal: '0.00',
    subTotal: '0.00'
  })

  const [cartItems, setCartItems] = useState([])
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])
  const [salesReturnAccounts, setSalesReturnAccounts] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [loading, setLoading] = useState(false)

  // State for sales returns display
  const [salesReturns, setSalesReturns] = useState([])
  const [loadingSalesReturns, setLoadingSalesReturns] = useState(false)

  // Invoice Print States
  const [showInvoicePrint, setShowInvoicePrint] = useState(false)
  const [selectedSalesReturnEntry, setSelectedSalesReturnEntry] = useState(null)

  // API base URL
  const API_BASE_URL = config.API_URL

  // Fetch data on component mount
  useEffect(() => {
    fetchCustomers()
    fetchItems()
    fetchSalesReturnAccounts()
    fetchSalesReturns()
  }, [])

  // Recalculate totals when relevant fields change
  useEffect(() => {
    calculateTotals(cartItems)
  }, [cartItems, formData.discountRs, formData.discountPercent, formData.GSTRs, formData.GSTPercent, formData.discountGSTMethod])

  // Fetch sales returns from API
  const fetchSalesReturns = async () => {
    setLoadingSalesReturns(true)
    try {
      const response = await fetch(`${API_BASE_URL}/sales-return/sales-returns`)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      const result = await response.json()
      setSalesReturns(result.data || [])

    } catch (error) {
      console.error('Error fetching sales returns:', error)
      alert('Failed to fetch sales returns. Please check if the server is running.')
    } finally {
      setLoadingSalesReturns(false)
    }
  }

  // Fetch customers from API with GST field
  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const result = await response.json()
      setCustomers(result.customers || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  // Fetch items from API with description field
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/items`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const result = await response.json()
      setItems(result.data || [])
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  // Fetch sales return accounts
  const fetchSalesReturnAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-return/sales-returns/accounts`)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setSalesReturnAccounts(result.data)
      }
    } catch (error) {
      console.error('Error fetching sales return accounts:', error)
      // Fallback to default accounts
      setSalesReturnAccounts(['Sales Return', 'Return Account A', 'Return Account B', 'Damaged Goods Return', 'Warranty Return', 'Exchange Return'])
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Customer selection with auto-fill GST
  const handleCustomerSelect = (customerId) => {
    if (!customerId) {
      setSelectedCustomer(null)
      setFormData(prev => ({
        ...prev,
        searchCustomer: '',
        customerAddress: '',
        contactNo: '',
        institutionName: '',
        customerGST: '' // Reset GST
      }))
      return
    }

    const customer = customers.find(c => c._id === customerId)
    if (customer) {
      setSelectedCustomer(customer)
      setFormData(prev => ({
        ...prev,
        searchCustomer: customer.customerName || customer.name,
        customerAddress: customer.address || '',
        contactNo: customer.contactNo || customer.phone || '',
        institutionName: customer.institutionName || '',
        customerGST: customer.customerGST || '' // Auto-fill GST
      }))
    }
  }

  // Item selection with auto-fill description
  const handleItemSelect = (itemId) => {
    if (!itemId) {
      setSelectedItem(null)
      setFormData(prev => ({
        ...prev,
        searchItem: '',
        total: '0'
      }))
      return
    }

    const item = items.find(i => i._id === itemId)
    if (item) {
      setSelectedItem(item)
      setFormData(prev => ({
        ...prev,
        searchItem: item.name,
        total: item.rate?.toString() || '0',
        // Auto-fill GST percentage from item if available
        GSTPercent: item.taxPercent?.toString() || prev.GSTPercent
      }))
    }
  }

  const addToCart = () => {
    if (!selectedItem) {
      alert('Please select an item')
      return
    }

    // Check if item already exists in cart
    const existingItem = cartItems.find(cartItem => cartItem.itemId === selectedItem._id)
    if (existingItem) {
      alert('Item already added to cart')
      return
    }

    const newItem = {
      id: Date.now(),
      itemId: selectedItem._id,
      name: selectedItem.name,
      itemDescription: selectedItem.description || '', // Include description
      qty: selectedItem.stock || 0,
      returnQty: 1,
      rate: selectedItem.rate || 0,
      discountPercent: parseFloat(formData.discountPercent) || 0,
      GSTPercent: parseFloat(formData.GSTPercent) || 0,
      total: 0
    }

    // Calculate initial total for the new item
    const baseAmount = newItem.rate * newItem.returnQty
    const discountAmount = baseAmount * (newItem.discountPercent / 100)
    const afterDiscount = baseAmount - discountAmount
    const GSTAmount = afterDiscount * (newItem.GSTPercent / 100)
    newItem.total = afterDiscount + GSTAmount

    setCartItems(prev => [...prev, newItem])

    // Reset item selection
    setFormData(prev => ({ ...prev, searchItem: '', total: '0' }))
    setSelectedItem(null)
  }

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id)
    setCartItems(updatedCart)
  }

  const updateCartItem = (id, field, value) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: parseFloat(value) || 0 }

        // Validate return quantity doesn't exceed available quantity
        if (field === 'returnQty' && updatedItem.returnQty > updatedItem.qty) {
          alert(`Return quantity cannot exceed available stock (${updatedItem.qty})`)
          return item
        }

        // Recalculate total for this item
        const baseAmount = updatedItem.rate * updatedItem.returnQty
        const discountAmount = baseAmount * (updatedItem.discountPercent / 100)
        const afterDiscount = baseAmount - discountAmount
        const GSTAmount = afterDiscount * (updatedItem.GSTPercent / 100)
        updatedItem.total = afterDiscount + GSTAmount

        return updatedItem
      }
      return item
    })

    setCartItems(updatedCart)
  }

  const calculateTotals = (items) => {
    // Calculate subtotal from all cart items
    const subTotal = items.reduce((sum, item) => sum + (item.total || 0), 0)

    // Get discount and GST values
    const totalDiscountRs = parseFloat(formData.discountRs) || 0
    const totalDiscountPercent = parseFloat(formData.discountPercent) || 0
    const totalGSTRs = parseFloat(formData.GSTRs) || 0
    const totalGSTPercent = parseFloat(formData.GSTPercent) || 0

    let grandTotal = subTotal

    if (formData.discountGSTMethod === 'On Total') {
      // Apply percentage discount first
      let discountAmount = totalDiscountRs
      if (totalDiscountPercent > 0) {
        discountAmount += subTotal * (totalDiscountPercent / 100)
      }

      // Apply GST
      let gstAmount = totalGSTRs
      if (totalGSTPercent > 0) {
        gstAmount += (subTotal - discountAmount) * (totalGSTPercent / 100)
      }

      grandTotal = subTotal - discountAmount + gstAmount
    }

    // Ensure no negative totals
    grandTotal = Math.max(0, grandTotal)

    setFormData(prev => ({
      ...prev,
      subTotal: subTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }))
  }

  // Enhanced save functionality with auto-fill
  const handleSave = async () => {
    // Frontend validation to prevent API call with missing data
    if (!selectedCustomer || !selectedCustomer._id) {
      alert('Please select a customer.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Please add at least one item to the return.');
      return;
    }

    setLoading(true);

    try {
      const salesReturnData = {
        // Ensure all data is correctly typed and structured for the backend
        customerId: selectedCustomer._id,
        customerName: selectedCustomer.customerName || selectedCustomer.name,
        institutionName: formData.institutionName,
        contactNo: formData.contactNo,
        customerAddress: formData.customerAddress,
        customerGST: formData.customerGST, // Include customer GST
        saleInvoice: formData.saleInvoice,
        entryDate: formData.entryDate,
        items: cartItems.map(item => ({
          itemId: item.itemId,
          itemName: item.name,
          itemDescription: item.itemDescription, // Include item description
          qty: item.qty,
          returnQty: item.returnQty,
          rate: item.rate,
          discountPercent: item.discountPercent,
          GSTPercent: item.GSTPercent,
          total: item.total,
        })),
        discountRs: parseFloat(formData.discountRs),
        discountPercent: parseFloat(formData.discountPercent),
        GSTRs: parseFloat(formData.GSTRs),
        GSTPercent: parseFloat(formData.GSTPercent),
        discountGSTMethod: formData.discountGSTMethod,
        salesReturnAcc: formData.salesReturnAcc,
        subTotal: parseFloat(formData.subTotal),
        grandTotal: parseFloat(formData.grandTotal),
        narration: formData.narration,
      };

      console.log('Sending sales return data:', salesReturnData);

      const response = await fetch(`${API_BASE_URL}/sales-return/sales-returns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salesReturnData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Check content type before parsing JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      const result = await response.json();
      console.log('Server response:', result);

      alert('Sales return saved successfully!');
      handleReset();
      // Refresh the sales returns list
      fetchSalesReturns();
    } catch (error) {
      console.error('Error saving sales return:', error);
      alert(`Error saving sales return: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      searchItem: '',
      searchCustomer: '',
      saleInvoice: '',
      institutionName: '',
      contactNo: '',
      customerAddress: '',
      customerGST: '', // Reset GST
      voucherNo: '',
      entryDate: getTodayFormatted(),
      discountRs: '0',
      discountPercent: '0',
      GSTRs: '0',
      GSTPercent: '0',
      total: '0',
      narration: '',
      discountGSTMethod: 'Individual Item',
      salesReturnAcc: 'Sales Return',
      grandTotal: '0.00',
      subTotal: '0.00'
    });
    setCartItems([]);
    setSelectedCustomer(null);
    setSelectedItem(null);
  };

  // Invoice Print Handlers
  const handlePrintInvoice = (salesReturnEntry) => {
    setSelectedSalesReturnEntry(salesReturnEntry)
    setShowInvoicePrint(true)
  }

  const handleQuickPrint = (entry) => {
    const quickPrintContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
        <div style="text-align: center; border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0; color: #dc2626;">S.K. ELECTRICALS</h2>
          <div style="font-size: 12px;">Sales Return Receipt</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div><strong>Voucher:</strong> ${entry.voucherNo}</div>
          <div><strong>Date:</strong> ${new Date(entry.entryDate).toLocaleDateString('en-IN')}</div>
          <div><strong>Customer:</strong> ${entry.customerName || entry.customerId?.name}</div>
          <div><strong>GST:</strong> ${entry.customerGST || 'N/A'}</div>
          <div><strong>Original Invoice:</strong> ${entry.saleInvoice || 'N/A'}</div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Return Items:</strong></td>
            <td style="text-align: right; padding: 8px 0;"><strong>${entry.items?.length || 0}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Return Amount:</strong></td>
            <td style="text-align: right; padding: 8px 0; color: #dc2626;">
              <strong>₹${parseFloat(entry.grandTotal).toFixed(2)}</strong>
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
        <head><title>Sales Return Receipt - ${entry.voucherNo}</title></head>
        <body style="margin: 0;">${quickPrintContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Header */}
        <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">Sales Return Management</h2>
            <p className="text-sm opacity-90">Manage sales returns and view past transactions</p>
          </div>
        </div>

        {/* Main Content Area: Flex container for side-by-side layout */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Sales Return Entry Form */}
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Create New Sales Return</h3>
            
            {/* Search Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Left Section - Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Item</label>
                <div className="relative">
                  <select
                    className="w-full border border-gray-300 rounded-md px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent appearance-none"
                    value={selectedItem?._id || ''}
                    onChange={(e) => handleItemSelect(e.target.value)}
                  >
                    <option value="">Choose an item...</option>
                    {items.map(item => (
                      <option key={item._id} value={item._id}>
                        {item.name} - Rate: ₹{item.rate} (Stock: {item.stock})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  <p className="text-xs text-gray-500 mt-1">Select item to auto-fill details & description</p>
                </div>

                {/* Selected Item Details with Description */}
                {selectedItem && (
                  <div className="mt-4 bg-blue-50 p-3 rounded border">
                    <h5 className="text-sm font-semibold mb-2 text-blue-800">Selected Item Details</h5>
                    <div className="text-xs space-y-1">
                      <div><span className="font-medium">Name:</span> {selectedItem.name}</div>
                      <div><span className="font-medium">Code:</span> {selectedItem.code || 'N/A'}</div>
                      <div><span className="font-medium">Category:</span> {selectedItem.category || 'N/A'}</div>
                      <div><span className="font-medium">Stock:</span> {selectedItem.stock}</div>
                      {selectedItem.description && (
                        <div><span className="font-medium">Description:</span> {selectedItem.description}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Discount and GST Section */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Discount (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.discountRs}
                      onChange={(e) => handleInputChange('discountRs', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Discount %</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.discountPercent}
                      onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">GST (₹)</label>
                    <input
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.GSTRs}
                      onChange={(e) => handleInputChange('GSTRs', e.target.value)}
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">GST %</label>
                    <input
                      type="number"
                      className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.GSTPercent}
                      onChange={(e) => handleInputChange('GSTPercent', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs text-gray-600 mb-1">Total</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                    value={formData.total}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Press Enter Key to add to cart</p>
                </div>

                <button
                  onClick={addToCart}
                  className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!selectedItem}
                >
                  <Plus size={16} /> ADD TO CART
                </button>
              </div>

              {/* Right Section - Customer Information */}
              <div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-4">Customer, Item/ Product Cart & Total Amounts Information</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Search Customer</label>
                      <div className="relative">
                        <select
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 appearance-none"
                          value={selectedCustomer?._id || ''}
                          onChange={(e) => handleCustomerSelect(e.target.value)}
                        >
                          <option value="">Choose a customer...</option>
                          {customers.map(customer => (
                            <option key={customer._id} value={customer._id}>
                              {customer.customerName || customer.name} - {customer.institutionName || 'No Institution'}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3 h-3 w-3 text-gray-400 pointer-events-none" />
                        <p className="text-xs text-gray-500 mt-1">Select customer to auto-fill details & GST</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Sale Invoice</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={formData.saleInvoice}
                        onChange={(e) => handleInputChange('saleInvoice', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Institution Name</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={formData.institutionName}
                        onChange={(e) => handleInputChange('institutionName', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Contact No</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={formData.contactNo}
                        onChange={(e) => handleInputChange('contactNo', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Customer Address</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={formData.customerAddress}
                        onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Customer GST</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={formData.customerGST}
                        onChange={(e) => handleInputChange('customerGST', e.target.value)}
                        placeholder="Auto-filled when customer selected"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Voucher No</label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={formData.voucherNo}
                        onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                        placeholder="Auto-generated"
                      />
                    </div>
                  </div>

                  {/* Selected Customer Details */}
                  {selectedCustomer && (
                    <div className="mb-4 bg-gray-50 p-3 rounded border">
                      <h5 className="text-sm font-semibold mb-2">Selected Customer Details</h5>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-medium">Name:</span> {selectedCustomer.customerName || selectedCustomer.name}</div>
                        <div><span className="font-medium">Institution:</span> {selectedCustomer.institutionName || 'N/A'}</div>
                        <div><span className="font-medium">Contact:</span> {selectedCustomer.contactNo || 'N/A'}</div>
                        <div><span className="font-medium">GST:</span> {selectedCustomer.customerGST || 'N/A'}</div>
                      </div>
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-xs text-gray-600 mb-1">Entry Date</label>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={formData.entryDate}
                        onChange={(e) => handleInputChange('entryDate', e.target.value)}
                      />
                      <Calendar className="absolute right-3 top-3 h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Items Table with Description */}
            {cartItems.length > 0 && (
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-9 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                    <div>SL Item Name</div>
                    <div>Description</div>
                    <div>QTY</div>
                    <div>Return Qty</div>
                    <div>Rate (Per)</div>
                    <div>Discount %</div>
                    <div>GST %</div>
                    <div>Total</div>
                    <div>Actions</div>
                  </div>

                  {cartItems.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-9 gap-2 text-xs py-2 border-b">
                      <div className="font-medium">{item.name}</div>
                      <div className="truncate" title={item.itemDescription}>{item.itemDescription}</div>
                      <div>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={item.qty}
                          readOnly
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={item.returnQty}
                          onChange={(e) => updateCartItem(item.id, 'returnQty', e.target.value)}
                          max={item.qty}
                          min="1"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={item.rate}
                          onChange={(e) => updateCartItem(item.id, 'rate', e.target.value)}
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={item.discountPercent}
                          onChange={(e) => updateCartItem(item.id, 'discountPercent', e.target.value)}
                          max="100"
                          min="0"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          className="w-full border rounded px-2 py-1 text-xs"
                          value={item.GSTPercent}
                          onChange={(e) => updateCartItem(item.id, 'GSTPercent', e.target.value)}
                          min="0"
                        />
                      </div>
                      <div className="font-medium text-green-600">
                        ₹{item.total.toFixed(2)}
                      </div>
                      <div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                          title="Remove"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Narration */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Narration</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 h-20"
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
                placeholder="Enter any additional notes or comments..."
              />
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Discount and GST Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Discount and GST Method</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountGSTMethod"
                      value="On Total"
                      checked={formData.discountGSTMethod === 'On Total'}
                      onChange={(e) => handleInputChange('discountGSTMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">On Total</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="discountGSTMethod"
                      value="Individual Item"
                      checked={formData.discountGSTMethod === 'Individual Item'}
                      onChange={(e) => handleInputChange('discountGSTMethod', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">Individual Item</span>
                  </label>
                </div>
              </div>

              {/* Sales Return Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose a Sales Return Acc</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.salesReturnAcc}
                  onChange={(e) => handleInputChange('salesReturnAcc', e.target.value)}
                >
                  {salesReturnAccounts.map(acc => (
                    <option key={acc} value={acc}>{acc}</option>
                  ))}
                </select>
              </div>

              {/* Totals */}
              <div>
                <div className="bg-teal-50 p-4 rounded-lg">
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Sub Total (Rs)</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                      value={formData.subTotal}
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Grand Total (Rs)</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-medium"
                      value={formData.grandTotal}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={handleReset}
                className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700 transition-colors flex items-center gap-2"
                disabled={loading}
              >
                <RotateCcw size={16} />
                RESET
              </button>
              <button
                onClick={handleSave}
                className="bg-teal-600 text-white px-8 py-2 rounded hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={loading || cartItems.length === 0 || !selectedCustomer}
              >
                <Save size={16} />
                {loading ? 'SAVING...' : 'SAVE SALES RETURN'}
              </button>
            </div>
          </div>

          {/* Right Column - Sales Returns Display Section */}
          <div>
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h3 className="text-2xl font-bold text-gray-800">Sales Returns List</h3>
              <div className="text-sm text-gray-600">
                Total Returns: <span className="font-semibold">{salesReturns.length}</span>
              </div>
            </div>

            {loadingSalesReturns ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sales returns...</p>
              </div>
            ) : salesReturns.length > 0 ? (
              <div className="max-h-[800px] overflow-y-auto space-y-6">
                {salesReturns.map((salesReturn, index) => (
                  <div key={salesReturn._id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header Section with Key Info */}
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-lg font-semibold">Voucher: {salesReturn.voucherNo}</h4>
                          <p className="text-red-100">Return #{index + 1}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">₹{parseFloat(salesReturn.grandTotal).toLocaleString()}</div>
                          <div className="text-red-100 text-sm">Grand Total</div>
                        </div>
                      </div>

                      {/* Print Buttons */}
                      <div className="flex justify-end gap-2 mt-3">
                        <button
                          onClick={() => handlePrintInvoice(salesReturn)}
                          className="bg-red-800 text-white px-3 py-1 rounded text-xs hover:bg-red-900 transition-colors"
                          title="Print Professional Invoice"
                        >
                          🖨️ Print Invoice
                        </button>
                        <button
                          onClick={() => handleQuickPrint(salesReturn)}
                          className="bg-purple-600 text-white px-3 py-1 rounded text-xs hover:bg-purple-700 transition-colors"
                          title="Quick Print Receipt"
                        >
                          📄 Quick Print
                        </button>
                      </div>
                    </div>

                    {/* Customer Information */}
                    <div className="p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Customer:</span>
                          <p className="text-gray-800 font-semibold">{salesReturn.customerName || salesReturn.customerId?.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Institution:</span>
                          <p className="text-gray-800">{salesReturn.institutionName || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">GST:</span>
                          <p className="text-gray-800">{salesReturn.customerGST || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Return Details */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Entry Date:</span>
                          <p className="text-gray-800">{new Date(salesReturn.entryDate).toLocaleDateString('en-IN')}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Original Sale Invoice:</span>
                          <p className="text-gray-800">{salesReturn.saleInvoice || 'N/A'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Return Account:</span>
                          <p className="text-gray-800">{salesReturn.salesReturnAcc}</p>
                        </div>
                      </div>

                      {/* Items Display with Description */}
                      {salesReturn.items && salesReturn.items.length > 0 && (
                        <div className="mb-4">
                          <h5 className="font-medium text-gray-700 mb-2">Returned Items:</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs border border-gray-200 rounded">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="border border-gray-200 px-2 py-1 text-left">Item Name</th>
                                  <th className="border border-gray-200 px-2 py-1 text-left">Description</th>
                                  <th className="border border-gray-200 px-2 py-1 text-center">Return Qty</th>
                                  <th className="border border-gray-200 px-2 py-1 text-right">Rate</th>
                                  <th className="border border-gray-200 px-2 py-1 text-right">Discount %</th>
                                  <th className="border border-gray-200 px-2 py-1 text-right">GST %</th>
                                  <th className="border border-gray-200 px-2 py-1 text-right">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {salesReturn.items.map((item, itemIndex) => (
                                  <tr key={itemIndex} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 px-2 py-1">{item.itemName}</td>
                                    <td className="border border-gray-200 px-2 py-1">{item.itemDescription || 'N/A'}</td>
                                    <td className="border border-gray-200 px-2 py-1 text-center font-medium text-red-600">
                                      {item.returnQty}
                                    </td>
                                    <td className="border border-gray-200 px-2 py-1 text-right">₹{item.rate.toFixed(2)}</td>
                                    <td className="border border-gray-200 px-2 py-1 text-right">{item.discountPercent}%</td>
                                    <td className="border border-gray-200 px-2 py-1 text-right">{item.GSTPercent}%</td>
                                    <td className="border border-gray-200 px-2 py-1 text-right font-medium">
                                      ₹{item.total.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Narration */}
                      {salesReturn.narration && (
                        <div className="mb-4">
                          <span className="font-medium text-gray-600">Return Reason:</span>
                          <p className="text-gray-800 italic mt-1">"{salesReturn.narration}"</p>
                        </div>
                      )}

                      {/* Financial Summary */}
                      <div className="bg-red-50 p-3 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Sub Total:</span>
                            <p className="text-gray-800 font-semibold">₹{parseFloat(salesReturn.subTotal).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Discount:</span>
                            <p className="text-gray-800">₹{parseFloat(salesReturn.discountRs || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">GST:</span>
                            <p className="text-gray-800">₹{parseFloat(salesReturn.GSTRs || 0).toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Method:</span>
                            <p className="text-gray-800 text-xs">{salesReturn.discountGSTMethod}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                      <div className="text-xs text-gray-600">
                        Return processed on {new Date(salesReturn.entryDate).toLocaleString('en-IN')}
                      </div>
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1">
                          <Eye size={12} />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-600">No Sales Returns Found</h3>
                <p className="text-gray-500 mt-2">Create your first sales return using the form on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Print Modal */}
      <SalesReturnInvoicePrintModal
        isVisible={showInvoicePrint}
        onClose={() => setShowInvoicePrint(false)}
        salesReturnEntry={selectedSalesReturnEntry}
        companyInfo={companyInfo}
      />
    </div>
  )
}
