import { useState, useEffect } from 'react'
import config from '../../../url'

// Invoice Print Modal Component (with updated templates to show GST and descriptions)
const InvoicePrintModal = ({ isVisible, onClose, posEntry, companyInfo }) => {
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
    if (!posEntry) return null
    
    const calculateTaxBreakdown = (items) => {
      let subtotal = 0
      let totalDiscount = 0
      let totalTax = 0
      
      items.forEach(item => {
        const itemSubtotal = item.qty * item.rate
        const itemDiscount = (itemSubtotal * item.discountPercent) / 100
        const itemTax = ((itemSubtotal - itemDiscount) * item.GSTPercent) / 100
        
        subtotal += itemSubtotal
        totalDiscount += itemDiscount
        totalTax += itemTax
      })
      
      return { subtotal, totalDiscount, totalTax }
    }

    const { subtotal, totalDiscount, totalTax } = calculateTaxBreakdown(posEntry.items || [])
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
              <strong>Ack Date:</strong> {formatDate(posEntry.entryDate)}
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
              <div><strong>{posEntry.customerName}</strong></div>
              {posEntry.institutionName && <div>{posEntry.institutionName}</div>}
              <div>{posEntry.customerAddress}</div>
              <div>Contact: {posEntry.contactNo}</div>
              <div>GSTIN/UIN: {posEntry.customerGST || 'N/A'}</div>
              <div>State Name: West Bengal, Code: 19</div>
            </div>
          </div>

          {/* Invoice Details */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <table style={{ width: '100%', fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td><strong>Voucher No.</strong></td>
                  <td>{posEntry.voucherNo}</td>
                </tr>
                <tr>
                  <td><strong>Date</strong></td>
                  <td>dt. {formatDate(posEntry.entryDate)}</td>
                </tr>
                <tr>
                  <td><strong>Payment Method</strong></td>
                  <td>{posEntry.paymentMethod || 'Cash'}</td>
                </tr>
                <tr>
                  <td><strong>Transport Cost</strong></td>
                  <td>₹ {parseFloat(posEntry.transportCost || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Previous Due</strong></td>
                  <td>₹ {parseFloat(posEntry.previousDue || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Destination</strong></td>
                  <td>{posEntry.customerAddress}</td>
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
            {(posEntry.items || []).map((item, index) => (
              <tr key={index}>
                <td style={tableCellStyle}>{index + 1}</td>
                <td style={tableCellStyle}>
                  <div><strong>{item.itemName}</strong></div>
                  {item.itemDescription && <div style={{fontSize: '9px', color: '#666'}}>{item.itemDescription}</div>}
                </td>
                <td style={tableCellStyle}>85258090</td>
                <td style={tableCellStyle}>{item.qty}</td>
                <td style={tableCellStyle}>pcs</td>
                <td style={tableCellStyle}>{item.rate.toFixed(2)}</td>
                <td style={tableCellStyle}>pcs</td>
                <td style={tableCellStyle}>{(item.rate + (item.rate * item.GSTPercent / 100)).toFixed(2)}</td>
                <td style={tableCellStyle}>{item.discountPercent.toFixed(2)}</td>
                <td style={tableCellStyle}>{item.GSTPercent} %</td>
                <td style={tableCellStyle}>{item.total.toFixed(2)}</td>
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
              <td style={tableCellStyle}><strong>₹ {parseFloat(posEntry.grandTotal).toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td colSpan="11" style={tableCellStyle}>
                <strong>Total Items: </strong>{(posEntry.items || []).reduce((sum, item) => sum + item.qty, 0)} pcs
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '10px' }}>
          <strong>Amount Chargeable (in words):</strong><br/>
          <strong>INR {numberToWords(posEntry.grandTotal)}</strong>
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
                    <td style={{ textAlign: 'right' }}>₹ {parseFloat(posEntry.grandTotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Paid Amount:</td>
                    <td style={{ textAlign: 'right' }}>₹ {parseFloat(posEntry.paidAmount || 0).toFixed(2)}</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid #dee2e6' }}>
                    <td>Due Amount:</td>
                    <td style={{ textAlign: 'right', color: parseFloat(posEntry.dueAmount) > 0 ? '#dc3545' : '#28a745' }}>
                      ₹ {parseFloat(posEntry.dueAmount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

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
    if (!posEntry) return null
    
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
            <div><strong>Voucher: {posEntry.voucherNo}</strong></div>
            <div>Date: {formatDate(posEntry.entryDate)}</div>
            <div>Payment: {posEntry.paymentMethod || 'Cash'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Customer: {posEntry.customerName}</strong></div>
            <div>Contact: {posEntry.contactNo}</div>
            <div>GST: {posEntry.customerGST || 'N/A'}</div>
            {posEntry.institutionName && <div>Inst: {posEntry.institutionName}</div>}
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
            {(posEntry.items || []).map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '3px' }}>
                  <div>{item.itemName}</div>
                  {item.itemDescription && <div style={{fontSize: '8px', color: '#666'}}>{item.itemDescription}</div>}
                </td>
                <td style={{ textAlign: 'center', padding: '3px' }}>{item.qty}</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>₹{item.rate}</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>{item.discountPercent}%</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>{item.GSTPercent}%</td>
                <td style={{ textAlign: 'right', padding: '3px' }}>₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Section */}
        <div style={{ borderTop: '1px solid #000', paddingTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Transport Cost:</span>
            <span>₹{parseFloat(posEntry.transportCost || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Previous Due:</span>
            <span>₹{parseFloat(posEntry.previousDue || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>Total Amount:</span>
            <span>₹{parseFloat(posEntry.grandTotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Paid Amount:</span>
            <span>₹{parseFloat(posEntry.paidAmount || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: parseFloat(posEntry.dueAmount) > 0 ? '#dc3545' : '#28a745' }}>
            <span>Due Amount:</span>
            <span>₹{parseFloat(posEntry.dueAmount).toFixed(2)}</span>
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
    const printContent = document.getElementById('invoice-print-content').innerHTML
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>POS Invoice - ${posEntry?.voucherNo}</title>
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
            id="invoice-print-content" 
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

export default function POSEntry() {
  // API Configuration
  const API_BASE_URL = config.API_URL
  const INTEGRATION_API_URL = config.API_URL

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

  // Date utility functions
  const getTodayFormatted = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateForInput = (dateStr) => {
    const [day, month, year] = dateStr.split('/')
    return `${year}-${month}-${day}`
  }

  const formatDateForDisplay = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  // Generate voucher number
  const generateVoucherNumber = () => {
    const prefix = 'INV'
    const timestamp = Date.now().toString().slice(-3)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${prefix}-${timestamp}${random}`
  }

  const [formData, setFormData] = useState({
    customerName: 'General Customer',
    customerId: '',
    institutionName: '',
    contactNo: '',
    customerAddress: '',
    customerGST: '', // Added customer GST field
    voucherNo: generateVoucherNumber(),
    previousDue: '0',
    entryDate: getTodayFormatted(),
    transportCost: '0',
    paidAmount: '0',
    dueAmount: '0',
    grandTotal: '0.00',
    isEMIPayment: false,
    smsToMobile: true,
    narration: '',
    discountMethod: 'Individual Item',
    paymentMethod: 'Cash'
  })

  const [cartItems, setCartItems] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [productDetails, setProductDetails] = useState({
    qty: '1',
    rate: '',
    discount: '0',
    discountPercent: '0',
    GST: '0',
    GSTPercent: '0',
    itemDescription: '' // Added item description field
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [salesEntries, setSalesEntries] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  
  const [filteredSalesEntries, setFilteredSalesEntries] = useState([])
  const [salesSearchTerm, setSalesSearchTerm] = useState('')
  const [showSalesSearch, setShowSalesSearch] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingSaleId, setEditingSaleId] = useState(null)
  const [showSaleDetails, setShowSaleDetails] = useState(false)
  const [selectedSaleDetails, setSelectedSaleDetails] = useState(null)

  // Invoice Print States
  const [showInvoicePrint, setShowInvoicePrint] = useState(false)
  const [selectedPOSEntry, setSelectedPOSEntry] = useState(null)

  // API Functions
  const fetchProducts = async (search = '') => {
    try {
      const response = await fetch(`${INTEGRATION_API_URL}/items?search=${search}&limit=100`)
      const data = await response.json()
      if (data.data) {
        const formattedProducts = data.data.map(item => ({
          id: item._id,
          name: item.name,
          code: item.code,
          price: item.rate.toString(),
          taxPercent: item.taxPercent || 0,
          unit: item.unit,
          stock: item.stock,
          category: item.category,
          brand: item.brand,
          description: item.description || '', // Include description
          image: item.image || ''
        }))
        setProducts(formattedProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      alert('Error fetching products. Please try again.')
    }
  }

  const fetchCustomers = async (search = '') => {
    try {
      const response = await fetch(`${INTEGRATION_API_URL}/customers?search=${search}&limit=100`)
      const data = await response.json()
     
      if (data.customers) {
        const formattedCustomers = data.customers.map(customer => ({
          id: customer._id,
          customerName: customer.customerName,
          institutionName: customer.institutionName || '',
          contactNo: customer.contactNo || '',
          address: customer.address || '',
          emailAddress: customer.emailAddress || '',
          customerGST: customer.customerGST || '', // Include GST field
          openingDue: customer.openingDue || 0,
          isActive: customer.isActive
        }))
        setCustomers(formattedCustomers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      alert('Error fetching customers. Please try again.')
    }
  }

  const fetchSalesEntries = async (page = 1, limit = rowsPerPage, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/pos?page=${page}&limit=${limit}&search=${search}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedEntries = data.data.map(sale => ({
          id: sale._id,
          voucherNo: sale.voucherNo,
          customer: sale.customerName,
          saleDate: formatDateForDisplay(sale.entryDate.split('T')[0]),
          grandTotal: `₹ ${sale.grandTotal.toFixed(2)}`,
          paidAmount: `₹ ${sale.paidAmount.toFixed(2)}`,
          dueAmount: `₹ ${sale.dueAmount.toFixed(2)}`,
          status: sale.status,
          createdAt: new Date(sale.createdAt).getTime(),
          rawData: sale
        }))
        setSalesEntries(formattedEntries)
        setFilteredSalesEntries(formattedEntries)
      }
    } catch (error) {
      console.error('Error fetching sales entries:', error)
      alert('Error fetching sales entries. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fetchSaleDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pos/${id}`)
      const data = await response.json()
      
      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || 'Failed to fetch sale details')
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
      alert('Error fetching sale details. Please try again.')
      return null
    }
  }

  const savePOSSale = async (saleData) => {
    try {
      setSaving(true)
      const url = isEditMode 
        ? `${API_BASE_URL}/pos/${editingSaleId}` 
        : `${API_BASE_URL}/pos`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const action = isEditMode ? 'updated' : 'saved'
        alert(`POS Sale ${data.data.voucherNo} ${action} successfully!`)
        await fetchSalesEntries()
        return true
      } else {
        alert(data.message || `Error ${isEditMode ? 'updating' : 'saving'} POS sale`)
        return false
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} POS sale:`, error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} POS sale. Please try again.`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const deletePOSSale = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pos/${id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('POS sale deleted successfully!')
        await fetchSalesEntries()
      } else {
        alert(data.message || 'Error deleting POS sale')
      }
    } catch (error) {
      console.error('Error deleting POS sale:', error)
      alert('Error deleting POS sale. Please try again.')
    }
  }

  const updateSaleStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pos/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`POS sale status updated to ${status} successfully!`)
        await fetchSalesEntries()
      } else {
        alert(data.message || 'Error updating POS sale status')
      }
    } catch (error) {
      console.error('Error updating POS sale status:', error)
      alert('Error updating POS sale status. Please try again.')
    }
  }

  // Invoice Print Handlers
  const handlePrintInvoice = async (entry) => {
    try {
      const saleDetails = await fetchSaleDetails(entry.id)
      if (saleDetails) {
        setSelectedPOSEntry(saleDetails)
        setShowInvoicePrint(true)
      }
    } catch (error) {
      console.error('Error fetching POS entry details for print:', error)
      alert('Error fetching invoice details. Please try again.')
    }
  }

  const handleQuickPrint = (entry) => {
    const quickPrintContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
        <div style="text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0; color: #0f766e;">S.K. ELECTRICALS</h2>
          <div style="font-size: 12px;">Quick POS Receipt</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div><strong>Voucher:</strong> ${entry.voucherNo}</div>
          <div><strong>Date:</strong> ${entry.saleDate}</div>
          <div><strong>Customer:</strong> ${entry.customer}</div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
            <td style="text-align: right; padding: 8px 0;"><strong>${entry.grandTotal}</strong></td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;">Paid Amount:</td>
            <td style="text-align: right; padding: 8px 0;">${entry.paidAmount}</td>
          </tr>
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;">Due Amount:</td>
            <td style="text-align: right; padding: 8px 0; color: ${parseFloat(entry.dueAmount.replace('₹ ', '')) > 0 ? '#dc2626' : '#059669'};">
              <strong>${entry.dueAmount}</strong>
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
        <head><title>Quick Receipt - ${entry.voucherNo}</title></head>
        <body style="margin: 0;">${quickPrintContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  // Load initial data
  useEffect(() => {
    fetchProducts()
    fetchCustomers()
    fetchSalesEntries()
  }, [])

  // Update filtered products based on search
  const filteredProducts = searchTerm 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products

  // Update filtered sales entries when search term changes
  useEffect(() => {
    handleSalesSearch()
  }, [salesEntries])

  const handleInputChange = (field, value) => {
    if (field === 'entryDate' && value.includes('-')) {
      const formattedDate = formatDateForDisplay(value)
      setFormData(prev => ({ ...prev, entryDate: formattedDate }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  // Customer selection with auto-fill GST
  const handleCustomerSelect = (customerId) => {
    const selectedCustomer = customers.find(customer => customer.id === customerId)
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.customerName,
        institutionName: selectedCustomer.institutionName,
        contactNo: selectedCustomer.contactNo,
        customerAddress: selectedCustomer.address,
        customerGST: selectedCustomer.customerGST || '', // Auto-fill GST
        previousDue: selectedCustomer.openingDue.toString()
      }))
    }
  }

  const handleProductDetailChange = (field, value) => {
    setProductDetails(prev => {
      const updated = { ...prev, [field]: value }
      
      if (field === 'discountPercent' && selectedProduct) {
        const rate = parseFloat(updated.rate) || 0
        const discountPercent = parseFloat(value) || 0
        updated.discount = ((rate * discountPercent) / 100).toFixed(2)
      }
      
      if (field === 'discount' && selectedProduct) {
        const rate = parseFloat(updated.rate) || 0
        const discount = parseFloat(value) || 0
        updated.discountPercent = rate > 0 ? ((discount / rate) * 100).toFixed(2) : '0'
      }
      
      if (field === 'GSTPercent' && selectedProduct) {
        const rate = parseFloat(updated.rate) || 0
        const discount = parseFloat(updated.discount) || 0
        const GSTPercent = parseFloat(value) || 0
        const discountedAmount = rate - discount
        updated.GST = ((discountedAmount * GSTPercent) / 100).toFixed(2)
      }
      
      if (field === 'GST' && selectedProduct) {
        const rate = parseFloat(updated.rate) || 0
        const discount = parseFloat(updated.discount) || 0
        const GST = parseFloat(value) || 0
        const discountedAmount = rate - discount
        updated.GSTPercent = discountedAmount > 0 ? ((GST / discountedAmount) * 100).toFixed(2) : '0'
      }
      
      return updated
    })
  }

  // Product selection with auto-fill description
  const selectProduct = (product) => {
    setSelectedProduct(product)
    setProductDetails({
      qty: '1',
      rate: product.price,
      discount: '0',
      discountPercent: '0',
      GST: '0',
      GSTPercent: product.taxPercent.toString(),
      itemDescription: product.description || '' // Auto-fill description
    })
  }

  const calculateItemTotal = () => {
    if (!selectedProduct) return '0.00'
    
    const qty = parseFloat(productDetails.qty) || 0
    const rate = parseFloat(productDetails.rate) || 0
    const discount = parseFloat(productDetails.discount) || 0
    const GST = parseFloat(productDetails.GST) || 0
    
    const subtotal = (qty * rate) - (qty * discount) + (qty * GST)
    return subtotal.toFixed(2)
  }

  // Add to cart with description
  const addToCart = () => {
    if (!selectedProduct) {
      alert('Please select a product')
      return
    }

    const newItem = {
      id: Date.now(),
      productId: selectedProduct.id,
      itemName: selectedProduct.name,
      itemDescription: productDetails.itemDescription, // Include description
      qty: parseFloat(productDetails.qty) || 0,
      rate: parseFloat(productDetails.rate) || 0,
      discount: parseFloat(productDetails.discount) || 0,
      discountPercent: parseFloat(productDetails.discountPercent) || 0,
      GST: parseFloat(productDetails.GST) || 0,
      GSTPercent: parseFloat(productDetails.GSTPercent) || 0,
      total: parseFloat(calculateItemTotal())
    }

    setCartItems(prev => [...prev, newItem])
    
    // Reset product selection
    setSelectedProduct(null)
    setProductDetails({
      qty: '1',
      rate: '',
      discount: '0',
      discountPercent: '0',
      GST: '0',
      GSTPercent: '0',
      itemDescription: '' // Reset description
    })
  }

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const calculateSubTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)
  }

  const calculateGrandTotal = () => {
    const subTotal = parseFloat(calculateSubTotal())
    const transport = parseFloat(formData.transportCost) || 0
    const previousDue = parseFloat(formData.previousDue) || 0
    return (subTotal + transport + previousDue).toFixed(2)
  }

  const calculateDueAmount = () => {
    const grandTotal = parseFloat(calculateGrandTotal())
    const paidAmount = parseFloat(formData.paidAmount) || 0
    return (grandTotal - paidAmount).toFixed(2)
  }

  // Update totals when cart or form changes
  useEffect(() => {
    const grandTotal = calculateGrandTotal()
    const dueAmount = calculateDueAmount()
    
    setFormData(prev => ({
      ...prev,
      grandTotal,
      dueAmount
    }))
  }, [cartItems, formData.transportCost, formData.previousDue, formData.paidAmount])

  const handleSave = async () => {
    if (cartItems.length === 0) {
      alert('Please add at least one item to the cart')
      return
    }

    if (!formData.customerName || !formData.customerId) {
      alert('Please select a customer')
      return
    }

    // Prepare sale data for backend
    const saleData = {
      customerId: formData.customerId,
      customerName: formData.customerName,
      institutionName: formData.institutionName,
      contactNo: formData.contactNo,
      customerAddress: formData.customerAddress,
      customerGST: formData.customerGST, // Include customer GST
      previousDue: parseFloat(formData.previousDue) || 0,
      entryDate: new Date(formatDateForInput(formData.entryDate)),
      items: cartItems.map(item => ({
        productId: item.productId,
        itemName: item.itemName,
        itemDescription: item.itemDescription, // Include item description
        qty: item.qty,
        rate: item.rate,
        discount: item.discount,
        discountPercent: item.discountPercent,
        GST: item.GST,
        GSTPercent: item.GSTPercent,
        total: item.total
      })),
      discountMethod: formData.discountMethod,
      transportCost: parseFloat(formData.transportCost) || 0,
      subTotal: parseFloat(calculateSubTotal()) || 0,
      grandTotal: parseFloat(calculateGrandTotal()) || 0,
      paidAmount: parseFloat(formData.paidAmount) || 0,
      dueAmount: parseFloat(calculateDueAmount()) || 0,
      narration: formData.narration,
      isEMIPayment: formData.isEMIPayment,
      smsToMobile: formData.smsToMobile,
      paymentMethod: formData.paymentMethod,
      voucherNo: formData.voucherNo
    }

    const success = await savePOSSale(saleData)
    
    if (success) {
      handleReset()
      setIsEditMode(false)
      setEditingSaleId(null)
    }
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form?')) {
      setCartItems([])
      setSelectedProduct(null)
      setProductDetails({
        qty: '1',
        rate: '',
        discount: '0',
        discountPercent: '0',
        GST: '0',
        GSTPercent: '0',
        itemDescription: '' // Reset description
      })
      setFormData({
        customerName: 'General Customer',
        customerId: '',
        institutionName: '',
        contactNo: '',
        customerAddress: '',
        customerGST: '', // Reset GST
        voucherNo: generateVoucherNumber(),
        previousDue: '0',
        entryDate: getTodayFormatted(),
        transportCost: '0',
        paidAmount: '0',
        dueAmount: '0',
        grandTotal: '0.00',
        isEMIPayment: false,
        smsToMobile: true,
        narration: '',
        discountMethod: 'Individual Item',
        paymentMethod: 'Cash'
      })
      setIsEditMode(false)
      setEditingSaleId(null)
    }
  }

  // Edit functionality
  const handleEdit = async (sale) => {
    try {
      const saleDetails = await fetchSaleDetails(sale.id)
      if (!saleDetails) return

      // Populate form with sale data
      setFormData({
        customerName: saleDetails.customerName,
        customerId: saleDetails.customerId,
        institutionName: saleDetails.institutionName || '',
        contactNo: saleDetails.contactNo || '',
        customerAddress: saleDetails.customerAddress || '',
        customerGST: saleDetails.customerGST || '', // Include customer GST
        voucherNo: saleDetails.voucherNo,
        previousDue: saleDetails.previousDue.toString(),
        entryDate: formatDateForDisplay(saleDetails.entryDate.split('T')[0]),
        transportCost: saleDetails.transportCost.toString(),
        paidAmount: saleDetails.paidAmount.toString(),
        dueAmount: saleDetails.dueAmount.toString(),
        grandTotal: saleDetails.grandTotal.toString(),
        isEMIPayment: saleDetails.isEMIPayment,
        smsToMobile: saleDetails.smsToMobile,
        narration: saleDetails.narration || '',
        discountMethod: saleDetails.discountMethod || 'Individual Item',
        paymentMethod: saleDetails.paymentMethod || 'Cash'
      })

      // Populate cart with items including descriptions
      const cartItems = saleDetails.items.map((item, index) => ({
        id: Date.now() + index,
        productId: item.productId,
        itemName: item.itemName,
        itemDescription: item.itemDescription || '', // Include item description
        qty: item.qty,
        rate: item.rate,
        discount: item.discount || 0,
        discountPercent: item.discountPercent || 0,
        GST: item.GST || 0,
        GSTPercent: item.GSTPercent || 0,
        total: item.total
      }))
      setCartItems(cartItems)

      // Set edit mode
      setIsEditMode(true)
      setEditingSaleId(sale.id)

      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' })

    } catch (error) {
      console.error('Error loading sale for edit:', error)
      alert('Error loading sale for editing. Please try again.')
    }
  }

  // View details functionality
  const handleViewDetails = async (sale) => {
    try {
      const saleDetails = await fetchSaleDetails(sale.id)
      if (saleDetails) {
        setSelectedSaleDetails(saleDetails)
        setShowSaleDetails(true)
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
      alert('Error fetching sale details. Please try again.')
    }
  }

  // Status update functionality
  const handleStatusUpdate = (sale, newStatus) => {
    if (window.confirm(`Are you sure you want to change status to ${newStatus}?`)) {
      updateSaleStatus(sale.id, newStatus)
    }
  }

  // Sales search functionality
  const handleSalesSearch = () => {
    if (salesSearchTerm.trim() === '') {
      setFilteredSalesEntries(salesEntries)
    } else {
      const filtered = salesEntries.filter(entry =>
        entry.customer.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        entry.voucherNo.toLowerCase().includes(salesSearchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(salesSearchTerm.toLowerCase())
      )
      setFilteredSalesEntries(filtered)
    }
    setCurrentPage(1)
  }

  const handleClearSalesSearch = () => {
    setSalesSearchTerm('')
    setFilteredSalesEntries(salesEntries)
    setShowSalesSearch(false)
    setCurrentPage(1)
  }

  const handleDeleteSalesEntry = (id) => {
    if (window.confirm('Are you sure you want to delete this POS sales entry? This action cannot be undone.')) {
      deletePOSSale(id)
    }
  }

  // Export functionality
  const handleExportSales = () => {
    const csvContent = [
      ['S.K. ELECTRICALS - POS Sales Entry List'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredSalesEntries.length}`],
      [],
      ['Voucher No', 'Customer', 'Sale Date', 'Grand Total', 'Paid Amount', 'Due Amount', 'Status'],
      ...filteredSalesEntries.map(entry => [
        entry.voucherNo,
        entry.customer,
        entry.saleDate,
        entry.grandTotal,
        entry.paidAmount,
        entry.dueAmount,
        entry.status
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pos_sales_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Enhanced Print functionality
  const handlePrintSales = () => {
    const printContent = `
      <html>
        <head>
          <title>POS Sales Entry List</title>
          <style>
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              color: #333;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #0f766e;
              padding-bottom: 20px;
            }
            .company-name { 
              font-size: 28px; 
              font-weight: bold; 
              color: #0f766e; 
              margin-bottom: 5px; 
            }
            .report-title {
              font-size: 18px;
              color: #555;
              margin-bottom: 10px;
            }
            .report-meta {
              font-size: 12px;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px; 
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            th { 
              background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
              color: white;
              border: 1px solid #0a5d56; 
              padding: 12px 8px; 
              text-align: left; 
              font-size: 11px; 
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            td { 
              border: 1px solid #e2e8f0; 
              padding: 10px 8px; 
              text-align: left; 
              font-size: 10px;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            tr:hover {
              background-color: #f1f5f9;
            }
            .amount {
              font-weight: bold;
              color: #059669;
            }
            .due-amount {
              color: #dc2626;
              font-weight: bold;
            }
            .footer { 
              margin-top: 40px; 
              text-align: center; 
              font-size: 10px; 
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
            }
            .summary-stats {
              display: flex;
              justify-content: space-around;
              margin: 20px 0;
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }
            .stat-item {
              text-align: center;
            }
            .stat-value {
              font-size: 18px;
              font-weight: bold;
              color: #0f766e;
            }
            .stat-label {
              font-size: 11px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            @media print {
              body { margin: 0; }
              @page { margin: 0.5in; size: A4; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">S.K. ELECTRICALS</div>
            <div class="report-title">POS Sales Entry List</div>
            <div class="report-meta">
              <div>Generated on: ${new Date().toLocaleString()}</div>
              <div>Total Records: ${filteredSalesEntries.length}</div>
            </div>
          </div>

          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-value">${filteredSalesEntries.length}</div>
              <div class="stat-label">Total Sales</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">₹${filteredSalesEntries.reduce((sum, entry) => sum + parseFloat(entry.grandTotal.replace('₹ ', '')), 0).toFixed(2)}</div>
              <div class="stat-label">Total Amount</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">₹${filteredSalesEntries.reduce((sum, entry) => sum + parseFloat(entry.paidAmount.replace('₹ ', '')), 0).toFixed(2)}</div>
              <div class="stat-label">Total Collected</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">₹${filteredSalesEntries.reduce((sum, entry) => sum + parseFloat(entry.dueAmount.replace('₹ ', '')), 0).toFixed(2)}</div>
              <div class="stat-label">Total Due</div>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Voucher No</th>
                <th>Customer</th>
                <th>Sale Date</th>
                <th>Grand Total</th>
                <th>Paid Amount</th>
                <th>Due Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSalesEntries.map(entry => `
                <tr>
                  <td><strong>${entry.voucherNo}</strong></td>
                  <td>${entry.customer}</td>
                  <td>${entry.saleDate}</td>
                  <td class="amount">${entry.grandTotal}</td>
                  <td class="amount">${entry.paidAmount}</td>
                  <td class="${parseFloat(entry.dueAmount.replace('₹ ', '')) > 0 ? 'due-amount' : 'amount'}">${entry.dueAmount}</td>
                  <td>${entry.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            <div><strong>S.K. ELECTRICALS Management System</strong></div>
            <div>POS Sales Report - Confidential Document</div>
            <div>Printed by: Admin | Date: ${new Date().toLocaleString()}</div>
          </div>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  // Pagination for sales entries
  const totalPages = Math.ceil(filteredSalesEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentSalesEntries = filteredSalesEntries.slice(startIndex, endIndex)

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">
            {isEditMode ? 'Edit POS Entry' : 'POS Entry'}
            {isEditMode && (
              <span className="ml-2 text-sm bg-yellow-500 px-2 py-1 rounded">
                Editing: {formData.voucherNo}
              </span>
            )}
          </h2>
          <div className="text-right">
            <div className="text-sm font-semibold">S.K. ELECTRICALS</div>
            <div className="text-xs opacity-90">Sales Management System</div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Edit Mode Actions */}
          {isEditMode && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800 font-medium">
                  🔄 Edit Mode: You are currently editing sale {formData.voucherNo}
                </span>
                <button
                  onClick={handleReset}
                  className="text-yellow-600 hover:text-yellow-800 underline text-sm"
                >
                  Cancel Edit
                </button>
              </div>
            </div>
          )}

          <div className="text-sm text-red-600 font-medium mb-4">
            Customer & Product cart Information &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; SET MANUAL CART
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {/* Customer Name */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Customer Name</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.customerId}
                onChange={(e) => handleCustomerSelect(e.target.value)}
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customerName} {customer.institutionName && `- ${customer.institutionName}`}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Select customer to auto-fill details & GST</p>
            </div>

            {/* Institution Name */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Institution Name</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.institutionName}
                onChange={(e) => handleInputChange('institutionName', e.target.value)}
              />
            </div>

            {/* Contact No */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Contact No</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.contactNo}
                onChange={(e) => handleInputChange('contactNo', e.target.value)}
              />
            </div>

            {/* Customer GST */}
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

            {/* Entry Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Entry Date</label>
              <input 
                type="date"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formatDateForInput(formData.entryDate)}
                onChange={(e) => handleInputChange('entryDate', e.target.value)}
              />
            </div>

            {/* Customer Address */}
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Customer Address</label>
              <input 
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.customerAddress}
                onChange={(e) => handleInputChange('customerAddress', e.target.value)}
              />
            </div>

            {/* Voucher No */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Voucher No</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.voucherNo}
                  onChange={(e) => handleInputChange('voucherNo', e.target.value)}
                  disabled={isEditMode}
                />
                {!isEditMode && (
                  <button 
                    onClick={() => handleInputChange('voucherNo', generateVoucherNumber())}
                    className="bg-gray-200 text-gray-700 px-2 py-2 rounded text-xs hover:bg-gray-300 transition-colors"
                    title="Generate New Voucher"
                  >
                    🔄
                  </button>
                )}
              </div>
            </div>

            {/* Previous Due */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Previous Due</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.previousDue}
                onChange={(e) => handleInputChange('previousDue', e.target.value)}
              />
            </div>
          </div>

          {/* Selected Customer Details */}
          {formData.customerId && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
              <h4 className="text-sm font-semibold mb-3">Selected Customer Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div><span className="font-medium">Name:</span> {formData.customerName}</div>
                <div><span className="font-medium">Institution:</span> {formData.institutionName || 'N/A'}</div>
                <div><span className="font-medium">Contact:</span> {formData.contactNo || 'N/A'}</div>
                <div><span className="font-medium">GST:</span> {formData.customerGST || 'N/A'}</div>
              </div>
            </div>
          )}

          {/* Product Selection and Cart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Side - Product Selection */}
            <div>
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">Product or Code/ Scan Barcode</label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Select product to auto-fill details & description</p>
              </div>

                            {/* Product Details */}
              {selectedProduct && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                  <h5 className="text-sm font-semibold mb-3 text-blue-800">Selected Product</h5>
                  <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                    <div><span className="font-medium">Name:</span> {selectedProduct.name}</div>
                    <div><span className="font-medium">Code:</span> {selectedProduct.code || 'N/A'}</div>
                    <div><span className="font-medium">Category:</span> {selectedProduct.category}</div>
                    <div><span className="font-medium">Stock:</span> {selectedProduct.stock}</div>
                  </div>
                  
                  {/* Product Description Field */}
                  <div className="mb-3">
                    <label className="block text-xs text-gray-600 mb-1">Product Description</label>
                    <textarea
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows="2"
                      value={productDetails.itemDescription}
                      onChange={(e) => handleProductDetailChange('itemDescription', e.target.value)}
                      placeholder="Auto-filled when product selected"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Qty</label>
                      <input 
                        type="number"
                        min="1"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={productDetails.qty}
                        onChange={(e) => handleProductDetailChange('qty', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Rate</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={productDetails.rate}
                        onChange={(e) => handleProductDetailChange('rate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Total</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs bg-gray-50 font-semibold"
                        value={`₹ ${calculateItemTotal()}`}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Disc %</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={productDetails.discountPercent}
                        onChange={(e) => handleProductDetailChange('discountPercent', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">GST %</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={productDetails.GSTPercent}
                        onChange={(e) => handleProductDetailChange('GSTPercent', e.target.value)}
                      />
                    </div>
                  </div>

                  <button 
                    onClick={addToCart}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    ADD TO CART
                  </button>
                </div>
              )}

              {/* Product Search Results */}
              <div className="max-h-80 overflow-y-auto border border-gray-200 rounded">
                {filteredProducts.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    {searchTerm ? 'No products found matching your search.' : 'Loading products...'}
                  </div>
                ) : (
                  filteredProducts.map(product => (
                    <div 
                      key={product.id} 
                      className={`p-3 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedProduct?.id === product.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => selectProduct(product)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h6 className="text-sm font-medium text-gray-900">{product.name}</h6>
                          {product.description && (
                            <p className="text-xs text-gray-600 mt-1">{product.description}</p>
                          )}
                          <div className="flex gap-4 mt-1 text-xs text-gray-500">
                            <span>Code: {product.code || 'N/A'}</span>
                            <span>Category: {product.category}</span>
                            <span>Stock: {product.stock}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">₹{product.price}</div>
                          <div className="text-xs text-gray-500">GST: {product.taxPercent}%</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Side - Shopping Cart */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Shopping Cart ({cartItems.length} items)</h4>
              
              <div className="border border-gray-200 rounded max-h-80 overflow-y-auto">
                {/* Cart Header */}
                <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 grid grid-cols-8 gap-1 border-b sticky top-0">
                  <div>Item</div>
                  <div>Desc</div>
                  <div>Qty</div>
                  <div>Rate</div>
                  <div>Disc%</div>
                  <div>GST%</div>
                  <div>Total</div>
                  <div>Action</div>
                </div>

                {/* Cart Items */}
                {cartItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    Cart is empty. Select products to add items.
                  </div>
                ) : (
                  cartItems.map((item, index) => (
                    <div key={item.id} className="px-3 py-2 text-xs border-b grid grid-cols-8 gap-1 items-center hover:bg-gray-50">
                      <div className="truncate" title={item.itemName}>
                        <div className="font-medium">{item.itemName}</div>
                      </div>
                      <div className="truncate" title={item.itemDescription}>
                        {item.itemDescription}
                      </div>
                      <div className="font-medium">{item.qty}</div>
                      <div>₹{item.rate}</div>
                      <div>{item.discountPercent}%</div>
                      <div>{item.GSTPercent}%</div>
                      <div className="font-semibold text-green-600">₹{item.total.toFixed(2)}</div>
                      <div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove item"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Summary */}
              {cartItems.length > 0 && (
                <div className="mt-4 bg-gray-50 p-3 rounded border">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <span>Sub Total:</span>
                        <span className="font-semibold">₹{calculateSubTotal()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span>Items:</span>
                        <span className="font-semibold">{cartItems.length}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment and Additional Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Transport Cost */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Transport Cost</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.transportCost}
                onChange={(e) => handleInputChange('transportCost', e.target.value)}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment Method</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="UPI">UPI</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit">Credit</option>
                <option value="EMI">EMI</option>
              </select>
            </div>

            {/* Paid Amount */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Paid Amount</label>
              <input 
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.paidAmount}
                onChange={(e) => handleInputChange('paidAmount', e.target.value)}
              />
            </div>

            {/* Discount Method */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discount Method</label>
              <select 
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.discountMethod}
                onChange={(e) => handleInputChange('discountMethod', e.target.value)}
              >
                <option value="Individual Item">Individual Item</option>
                <option value="On Total">On Total</option>
              </select>
            </div>
          </div>

          {/* Narration and Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Narration */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Narration</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows="2"
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
                placeholder="Add any notes or remarks..."
              />
            </div>

            {/* Checkboxes and Totals */}
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.isEMIPayment}
                    onChange={(e) => handleInputChange('isEMIPayment', e.target.checked)}
                    className="mr-2"
                  />
                  EMI Payment
                </label>
                <label className="flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.smsToMobile}
                    onChange={(e) => handleInputChange('smsToMobile', e.target.checked)}
                    className="mr-2"
                  />
                  SMS to Mobile
                </label>
              </div>

              {/* Totals Display */}
              <div className="bg-gray-50 p-3 rounded border">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>Grand Total:</span>
                    <span className="font-bold text-green-600">₹{formData.grandTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Due Amount:</span>
                    <span className={`font-bold ${parseFloat(formData.dueAmount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ₹{formData.dueAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <button 
              onClick={handleSave}
              className="bg-teal-600 text-white px-8 py-3 rounded text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? 'UPDATING...' : 'SAVING...'}
                </>
              ) : (
                isEditMode ? 'UPDATE SALE' : 'SAVE SALE'
              )}
            </button>
            
            <button 
              onClick={handleReset}
              className="bg-gray-500 text-white px-8 py-3 rounded text-sm font-medium hover:bg-gray-600 transition-colors"
            >
              RESET
            </button>
          </div>
        </div>
      </div>

      {/* POS Sales Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              POS Sales Entry List ({filteredSalesEntries.length} records)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSalesSearch(!showSalesSearch)}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Search"
              >
                🔍
              </button>
              <button
                onClick={handleExportSales}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Export to CSV"
              >
                📤
              </button>
              <button
                onClick={handlePrintSales}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Print Report"
              >
                🖨️
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSalesSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by voucher number, customer name, or status..."
                value={salesSearchTerm}
                onChange={(e) => setSalesSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                onKeyPress={(e) => { if (e.key === 'Enter') handleSalesSearch() }}
              />
              <button
                onClick={handleSalesSearch}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
              >
                Search
              </button>
              <button
                onClick={handleClearSalesSearch}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Sales Entry Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Voucher No</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Sale Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Grand Total</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Paid Amount</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Due Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-2"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : currentSalesEntries.length > 0 ? (
                  currentSalesEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs font-medium text-teal-600">{entry.voucherNo}</td>
                      <td className="py-3 px-2 text-xs">{entry.customer}</td>
                      <td className="py-3 px-2 text-xs">{entry.saleDate}</td>
                      <td className="py-3 px-2 text-xs font-medium">{entry.grandTotal}</td>
                      <td className="py-3 px-2 text-xs text-green-600">{entry.paidAmount}</td>
                      <td className="py-3 px-2 text-xs text-red-600">{entry.dueAmount}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : entry.status === 'Partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : entry.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handlePrintInvoice(entry)}
                            className="text-green-600 hover:text-green-800 text-xs p-1"
                            title="Print Professional Invoice"
                          >
                            🖨️
                          </button>
                          <button
                            onClick={() => handleQuickPrint(entry)}
                            className="text-purple-600 hover:text-purple-800 text-xs p-1"
                            title="Quick Print Receipt"
                          >
                            📄
                          </button>
                          <button
                            onClick={() => handleViewDetails(entry)}
                            className="text-blue-600 hover:text-blue-800 text-xs p-1"
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-orange-600 hover:text-orange-800 text-xs p-1"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteSalesEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 text-xs p-1"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-8 text-gray-500">
                      No POS sales entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredSalesEntries.length)} of {filteredSalesEntries.length} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sale Details Modal */}
      {showSaleDetails && selectedSaleDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-teal-600 text-white px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">POS Sale Details - {selectedSaleDetails.voucherNo}</h2>
              <button
                onClick={() => setShowSaleDetails(false)}
                className="text-white hover:text-gray-200 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                  <div><strong>Name:</strong> {selectedSaleDetails.customerName}</div>
                  <div><strong>Institution:</strong> {selectedSaleDetails.institutionName || 'N/A'}</div>
                  <div><strong>Contact:</strong> {selectedSaleDetails.contactNo || 'N/A'}</div>
                  <div><strong>GST:</strong> {selectedSaleDetails.customerGST || 'N/A'}</div>
                  <div><strong>Address:</strong> {selectedSaleDetails.customerAddress || 'N/A'}</div>
                  <div><strong>Previous Due:</strong> ₹{selectedSaleDetails.previousDue.toFixed(2)}</div>
                </div>
              </div>

              {/* Sale Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Sale Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded">
                  <div><strong>Voucher No:</strong> {selectedSaleDetails.voucherNo}</div>
                  <div><strong>Date:</strong> {formatDateForDisplay(selectedSaleDetails.entryDate.split('T')[0])}</div>
                  <div><strong>Payment Method:</strong> {selectedSaleDetails.paymentMethod}</div>
                  <div><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      selectedSaleDetails.status === 'Paid'
                        ? 'bg-green-100 text-green-800'
                        : selectedSaleDetails.status === 'Partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : selectedSaleDetails.status === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedSaleDetails.status}
                    </span>
                  </div>
                  <div><strong>Transport Cost:</strong> ₹{selectedSaleDetails.transportCost.toFixed(2)}</div>
                  <div><strong>EMI Payment:</strong> {selectedSaleDetails.isEMIPayment ? 'Yes' : 'No'}</div>
                </div>
              </div>

              {/* Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Items ({selectedSaleDetails.items.length})</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 rounded">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-b">Item Name</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-b">Description</th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 border-b">Qty</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 border-b">Rate</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 border-b">Disc%</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 border-b">GST%</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-gray-700 border-b">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSaleDetails.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2 px-3 text-xs">{item.itemName}</td>
                          <td className="py-2 px-3 text-xs">{item.itemDescription || 'N/A'}</td>
                          <td className="py-2 px-3 text-xs text-center">{item.qty}</td>
                          <td className="py-2 px-3 text-xs text-right">₹{item.rate.toFixed(2)}</td>
                          <td className="py-2 px-3 text-xs text-right">{item.discountPercent}%</td>
                          <td className="py-2 px-3 text-xs text-right">{item.GSTPercent}%</td>
                          <td className="py-2 px-3 text-xs text-right font-semibold">₹{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Payment Summary</h3>
                <div className="bg-gray-50 p-4 rounded">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Sub Total:</span>
                        <span className="font-semibold">₹{selectedSaleDetails.subTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Transport Cost:</span>
                        <span>₹{selectedSaleDetails.transportCost.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Previous Due:</span>
                        <span>₹{selectedSaleDetails.previousDue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Grand Total:</span>
                        <span className="font-bold text-green-600">₹{selectedSaleDetails.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Paid Amount:</span>
                        <span className="font-semibold text-green-600">₹{selectedSaleDetails.paidAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Due Amount:</span>
                        <span className={`font-bold ${selectedSaleDetails.dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ₹{selectedSaleDetails.dueAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount Method:</span>
                        <span>{selectedSaleDetails.discountMethod}</span>
                      </div>
                    </div>
                  </div>

                  {selectedSaleDetails.narration && (
                    <div className="mt-4 border-t pt-4">
                      <div><strong>Narration:</strong></div>
                      <div className="mt-1 text-sm text-gray-700 bg-white p-3 rounded border">
                        {selectedSaleDetails.narration}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  onClick={() => handlePrintInvoice({ id: selectedSaleDetails._id, rawData: selectedSaleDetails })}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Print Invoice
                </button>
                <button
                  onClick={() => handleEdit({ id: selectedSaleDetails._id, rawData: selectedSaleDetails })}
                  className="bg-orange-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-700 transition-colors"
                >
                  Edit Sale
                </button>
                <button
                  onClick={() => setShowSaleDetails(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        isVisible={showInvoicePrint}
        onClose={() => setShowInvoicePrint(false)}
        posEntry={selectedPOSEntry}
        companyInfo={companyInfo}
      />
    </div>
  )
}

