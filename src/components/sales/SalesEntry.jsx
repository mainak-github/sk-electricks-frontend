'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

// API Configuration
const API_BASE_URL = config.API_URL

// API Service Functions
const salesAPI = {
  // Create sales entry
  createSalesEntry: async (salesData) => {
    try {
      const response = await fetch(`${config.API_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salesData)
      })
      return await response.json()
    } catch (error) {
      console.error('Error creating sales entry:', error)
      throw error
    }
  },

  // Get all sales entries
  getSalesEntries: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`${config.API_URL}/sales?${queryString}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to fetch sales entries')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching sales entries:', error)
      throw error
    }
  },

  // Update sales entry
  updateSalesEntry: async (id, salesData) => {
    try {
      const response = await fetch(`${config.API_URL}/sales/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(salesData)
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update sales entry')
      }
      return await response.json()
    } catch (error) {
      console.error('Error updating sales entry:', error)
      throw error
    }
  },

  // Delete sales entry
  deleteSalesEntry: async (id) => {
    try {
      const response = await fetch(`${config.API_URL}/sales/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete sales entry')
      }
      return await response.json()
    } catch (error) {
      console.error('Error deleting sales entry:', error)
      throw error
    }
  },

  // Get customers
  getCustomers: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`${config.API_URL}/customers?${queryString}`)
      if (!response.ok) {
        throw new Error('Failed to fetch customers')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading customers:', error)
      throw error
    }
  },

  // Get items
  getItems: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`${config.API_URL}/items?${queryString}`)
      if (!response.ok) {
        throw new Error('Failed to fetch items')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading items:', error)
      throw error
    }
  },

  // Get employees
  getEmployees: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString()
      const response = await fetch(`${API_BASE_URL}/employees?${queryString}`)
      console.log('Employee API Response:', response)
      
      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }
      return await response.json()
    } catch (error) {
      console.error('Error loading employees:', error)
      throw error
    }
  }
}

// Invoice Print Modal Component
const InvoicePrintModal = ({ isVisible, onClose, salesEntry, companyInfo }) => {
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
    if (!salesEntry) return null
    
    const calculateTaxBreakdown = (items) => {
      let subtotal = 0
      let totalDiscount = 0
      let totalTax = 0
      
      items.forEach(item => {
        const itemSubtotal = item.quantity * item.rate
        const itemDiscount = (itemSubtotal * item.discountPercent) / 100
        const itemTax = ((itemSubtotal - itemDiscount) * item.GSTPercent) / 100
        
        subtotal += itemSubtotal
        totalDiscount += itemDiscount
        totalTax += itemTax
      })
      
      return { subtotal, totalDiscount, totalTax }
    }

    const { subtotal, totalDiscount, totalTax } = calculateTaxBreakdown(salesEntry.items || [])
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
                <div>State: {companyInfo.state}</div>
                <div>Email: {companyInfo.email}</div>
                <div>Phone: {companyInfo.phone}</div>
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
              <strong>Ack Date:</strong> {formatDate(salesEntry.entryDate)}
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
              <div><strong>{salesEntry.customerName}</strong></div>
              {salesEntry.institutionName && <div>{salesEntry.institutionName}</div>}
              <div>{salesEntry.customerAddress}</div>
              <div>Contact: {salesEntry.contactNo}</div>
              <div>GSTIN/UIN: {salesEntry.customerGST || 'N/A'}</div>
              <div>State Name: West Bengal, Code: 19</div>
            </div>
          </div>

          {/* Invoice Details */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <table style={{ width: '100%', fontSize: '11px' }}>
              <tbody>
                <tr>
                  <td><strong>Invoice No.</strong></td>
                  <td>{salesEntry.invoiceNo}</td>
                </tr>
                <tr>
                  <td><strong>Date</strong></td>
                  <td>dt. {formatDate(salesEntry.entryDate)}</td>
                </tr>
                <tr>
                  <td><strong>Delivery Note</strong></td>
                  <td>{salesEntry.challanText || '-'}</td>
                </tr>
                <tr>
                  <td><strong>Transport Cost</strong></td>
                  <td>₹ {parseFloat(salesEntry.transportCost || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td><strong>Employee</strong></td>
                  <td>{salesEntry.employee?.name || 'Admin'}</td>
                </tr>
                <tr>
                  <td><strong>Destination</strong></td>
                  <td>{salesEntry.customerAddress}</td>
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
            {(salesEntry.items || []).map((item, index) => (
              <tr key={index}>
                <td style={tableCellStyle}>{index + 1}</td>
                <td style={tableCellStyle}>
                  <div><strong>{item.itemName}</strong></div>
                  {item.itemDescription && <div style={{fontSize: '9px', color: '#666'}}>{item.itemDescription}</div>}
                </td>
                <td style={tableCellStyle}>85258090</td>
                <td style={tableCellStyle}>{item.quantity}</td>
                <td style={tableCellStyle}>{item.unit || 'pcs'}</td>
                <td style={tableCellStyle}>{item.rate.toFixed(2)}</td>
                <td style={tableCellStyle}>{item.unit || 'pcs'}</td>
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
              <td style={tableCellStyle}><strong>₹ {parseFloat(salesEntry.grandTotal).toFixed(2)}</strong></td>
            </tr>
            <tr>
              <td colSpan="11" style={tableCellStyle}>
                <strong>Total Items: </strong>{(salesEntry.items || []).reduce((sum, item) => sum + item.quantity, 0)} {(salesEntry.items || [])[0]?.unit || 'pcs'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Amount in Words */}
        <div style={{ marginBottom: '20px', border: '1px solid #dee2e6', padding: '10px' }}>
          <strong>Amount Chargeable (in words):</strong><br/>
          <strong>INR {numberToWords(salesEntry.grandTotal)}</strong>
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
              <div>4. Subject to {companyInfo.jurisdiction || 'Local'} Jurisdiction Only.</div>
              <div style={{ marginTop: '10px' }}><strong>E. & O.E</strong></div>
            </div>
          </div>

          {/* Bank Details */}
          <div style={{ flex: 1, border: '1px solid #dee2e6', padding: '10px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Company's Bank Details</h4>
            <div style={{ fontSize: '10px' }}>
              <div><strong>Bank Name:</strong> {companyInfo.bankName || 'PUNJAB NATIONAL BANK 3121'}</div>
              <div><strong>A/c No.:</strong> {companyInfo.accountNo || '0158008700003121'}</div>
              <div><strong>Branch & IFS Code:</strong> {companyInfo.branchCode || 'BHIRINGEE, BENACHITY & PUNB0015800'}</div>
            </div>
            
            {/* Payment Summary */}
            <div style={{ marginTop: '15px', borderTop: '1px solid #dee2e6', paddingTop: '10px' }}>
              <table style={{ width: '100%', fontSize: '10px' }}>
                <tbody>
                  <tr>
                    <td>Total Amount:</td>
                    <td style={{ textAlign: 'right' }}>₹ {parseFloat(salesEntry.grandTotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>Paid Amount:</td>
                    <td style={{ textAlign: 'right' }}>₹ {parseFloat(salesEntry.paidAmount || 0).toFixed(2)}</td>
                  </tr>
                  <tr style={{ fontWeight: 'bold', borderTop: '1px solid #dee2e6' }}>
                    <td>Due Amount:</td>
                    <td style={{ textAlign: 'right', color: parseFloat(salesEntry.dueAmount) > 0 ? '#dc3545' : '#28a745' }}>
                      ₹ {parseFloat(salesEntry.dueAmount).toFixed(2)}
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
    if (!salesEntry) return null
    
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
          <div style={{ fontSize: '9px' }}>Phone: {companyInfo.phone} | Email: {companyInfo.email}</div>
          <div style={{ fontSize: '9px' }}>GSTIN: {companyInfo.gstin}</div>
        </div>

        {/* Invoice Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <div><strong>Invoice: {salesEntry.invoiceNo}</strong></div>
            <div>Date: {formatDate(salesEntry.entryDate)}</div>
            <div>Employee: {salesEntry.employee?.name || 'Admin'}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div><strong>Customer: {salesEntry.customerName}</strong></div>
            <div>Contact: {salesEntry.contactNo}</div>
            <div>GST: {salesEntry.customerGST || 'N/A'}</div>
            {salesEntry.institutionName && <div>Inst: {salesEntry.institutionName}</div>}
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
            {(salesEntry.items || []).map((item, index) => (
              <tr key={index}>
                <td style={{ padding: '3px' }}>
                  <div>{item.itemName}</div>
                  {item.itemDescription && <div style={{fontSize: '8px', color: '#666'}}>{item.itemDescription}</div>}
                </td>
                <td style={{ textAlign: 'center', padding: '3px' }}>{item.quantity}</td>
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
            <span>₹{parseFloat(salesEntry.transportCost || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 'bold' }}>
            <span>Total Amount:</span>
            <span>₹{parseFloat(salesEntry.grandTotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>Paid Amount:</span>
            <span>₹{parseFloat(salesEntry.paidAmount || 0).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: parseFloat(salesEntry.dueAmount) > 0 ? '#dc3545' : '#28a745' }}>
            <span>Due Amount:</span>
            <span>₹{parseFloat(salesEntry.dueAmount).toFixed(2)}</span>
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
          <title>Invoice - ${salesEntry?.invoiceNo}</title>
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

export default function SalesEntry() {
  // Date utility functions
  const getTodayFormatted = () => {
    const today = new Date()
    const day = today.getDate().toString().padStart(2, '0')
    const month = (today.getMonth() + 1).toString().padStart(2, '0')
    const year = today.getFullYear()
    return `${day}/${month}/${year}`
  }

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return ''
    const [day, month, year] = dateStr.split('/')
    if (!day || !month || !year) return ''
    return `${year}-${month}-${day}`
  }

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return null
    const [day, month, year] = dateStr.split('/')
    return new Date(`${year}-${month}-${day}T00:00:00Z`)
  }

  // Generate invoice number
  const generateInvoiceNo = () => {
    const prefix = 'INV'
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}${timestamp}`
  }

  const initialFormData = {
    // Item/Product cart information
    selectedItem: null,
    discount: '',
    discountPercent: '',
    GST: '',
    GSTPercent: '',

    // Customer information
    selectedCustomer: null,
    customerName: 'General Customer',
    institutionName: '',
    contactNo: '',
    customerAddress: '',
    customerGST: '', // Added customer GST field
    previousDue: '0',

    // Invoice information
    invoiceNo: generateInvoiceNo(),
    entryDate: getTodayFormatted(),

    // Item details for cart
    itemName: '',
    itemDescription: '', // Added item description field
    quantity: '1',
    ratePerUnit: '',
    discountPercentItem: '',
    GSTPercentItem: '',

    // Narration and Challan
    narration: '',
    challanText: '',

    // Discount and GST Method
    discountGSTMethod: 'individual', // 'total' or 'individual'

    // Payment information
    selectedEmployee: null,
    transportCost: '0',
    grandTotal: '0.00',
    paidAmount: '0',
    dueAmount: '0.00',

    // Checkboxes
    smgToMobile: false,
    isConditionSale: false,
    isPaymentEMI: false
  }

  // Company Information
  const companyInfo = {
    name: " S.K. ELECTRICALS",
    address: "Faridpur, DURGAPUR, Bardhaman, West Bengal, 713213",
    gstin: "19BRUPM7238Q2ZG",
    state: "West Bengal",
    phone: "+91 8448449093",
    website: "www.skelectrics.com",
    bankName: "BANDHAN BANK",
    accountNo: "10160007406316",
    branchCode: "CITY CENTER ",
  }

  const [formData, setFormData] = useState(initialFormData)
  const [salesCart, setSalesCart] = useState([])
  const [salesEntries, setSalesEntries] = useState([])
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])
  const [employees, setEmployees] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editingEntry, setEditingEntry] = useState(null)
  
  // Invoice Print States
  const [showInvoicePrint, setShowInvoicePrint] = useState(false)
  const [selectedInvoiceEntry, setSelectedInvoiceEntry] = useState(null)

  // Load initial data
  useEffect(() => {
    loadSalesEntries()
    loadCustomers()
    loadItems()
    loadEmployees()
  }, [currentPage, searchTerm])

  // Load sales entries from API
  const loadSalesEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
      }
      const result = await salesAPI.getSalesEntries(params)

      if (result.success) {
        const formattedEntries = result.data.map(entry => ({
          ...entry,
          id: entry._id,
          entryDate: new Date(entry.entryDate).toLocaleDateString('en-GB'),
          totalAmount: `₹ ${parseFloat(entry.grandTotal).toFixed(2)}`,
          paidAmount: `₹ ${parseFloat(entry.paidAmount).toFixed(2)}`,
          dueAmount: `₹ ${parseFloat(entry.dueAmount).toFixed(2)}`,
          employee: entry.employee?.name || entry.employee || 'Admin',
          customerName: entry.customerName || 'General Customer',
        }))
        setSalesEntries(formattedEntries)
        setTotalPages(result.pagination.totalPages)
        setTotalCount(result.pagination.totalCount)
      } else {
        setError(result.message || 'Failed to load sales entries')
      }
    } catch (error) {
      console.error('Error loading sales entries:', error)
      setError('Failed to connect to server. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Load customers from API with GST field
  const loadCustomers = async () => {
    try {
      const result = await salesAPI.getCustomers({ limit: 1000 })
      if (result.customers) {
        const formattedCustomers = result.customers.map(customer => ({
          id: customer._id,
          name: customer.customerName,
          phone: customer.contactNo,
          address: customer.address,
          gst: customer.customerGST || '', // Include GST field
          institutionName: customer.institutionName || '',
          profession: customer.profession || '',
          due: 0,
          locationArea: customer.locationArea || '',
          expectation: customer.expectation || 0,
          emailAddress: customer.emailAddress || '',
          initialConversation: customer.initialConversation || '',
          partyType: customer.partyType || ''
        }))

        const allCustomers = [
          { 
            id: 'general', 
            name: 'General Customer', 
            phone: '', 
            address: '', 
            gst: '', // Include GST for general customer
            institutionName: '', 
            profession: '', 
            due: 0 
          },
          ...formattedCustomers
        ]

        setCustomers(allCustomers)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
      const defaultCustomers = [{ 
        id: 'general', 
        name: 'General Customer', 
        phone: '', 
        address: '', 
        gst: '', 
        institutionName: '', 
        profession: '', 
        due: 0 
      }]
      setCustomers(defaultCustomers)
    }
  }

  // Load items from API with description field
  const loadItems = async () => {
    try {
      const result = await salesAPI.getItems({ limit: 1000 })
      if (result.data) {
        const formattedItems = result.data.map(item => ({
          id: item._id,
          name: item.name,
          code: item.code || '',
          category: item.category || '',
          brand: item.brand || '',
          description: item.description || '', // Include description field
          rate: item.rate,
          purchasePrice: item.purchasePrice || 0,
          stock: item.stock || 0,
          unit: item.unit || 'pcs',
          taxPercent: item.taxPercent || 0,
          discountPercent: item.discountPercent || 0
        }))
        setItems(formattedItems)
      }
    } catch (error) {
      console.error('Error loading items:', error)
      setItems([])
    }
  }

  // Load employees from API
  const loadEmployees = async () => {
    try {
      const result = await salesAPI.getEmployees({ limit: 1000 })

      if (result.employees) {
        const employees = result.employees
        const formattedEmployees = employees.map(emp => ({
          id: emp._id || emp.id,
          name: emp.employeeName,
          position: emp.selectDesignation || '',
          department: emp.selectDepartment || ''
        }))

        setEmployees(formattedEmployees)
      } else {
        setEmployees([])
        console.warn('API call was successful but no employee data was found.')
      }
    } catch (error) {
      console.error('Error loading employees:', error)
      setEmployees([])
    }
  }

  // Calculate totals when cart changes
  useEffect(() => {
    calculateTotals()
  }, [salesCart, formData.transportCost, formData.discount, formData.GST, formData.paidAmount])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Item selection from dropdown with auto-fill description
  const handleItemSelect = (itemId) => {
    const item = items.find(i => i.id === itemId)
    if (item) {
      setFormData(prev => ({
        ...prev,
        selectedItem: item,
        itemName: item.name,
        itemDescription: item.description || '', // Auto-fill description
        ratePerUnit: item.rate.toString(),
        discountPercentItem: item.discountPercent.toString(),
        GSTPercentItem: item.taxPercent.toString()
      }))
    }
  }

  // Customer selection from dropdown with auto-fill GST
  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setFormData(prev => ({
        ...prev,
        selectedCustomer: customer,
        customerName: customer.name,
        contactNo: customer.phone || '',
        customerAddress: customer.address || '',
        customerGST: customer.gst || '', // Auto-fill GST
        institutionName: customer.institutionName || '',
        previousDue: customer.due?.toString() || '0',
        profession: customer.profession || '',
        locationArea: customer.locationArea || '',
        emailAddress: customer.emailAddress || '',
        partyType: customer.partyType || ''
      }))
    }
  }

  // Employee selection from dropdown
  const handleEmployeeSelect = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (employee) {
      setFormData(prev => ({
        ...prev,
        selectedEmployee: employee
      }))
    }
  }

  const calculateItemTotal = () => {
    const quantity = parseFloat(formData.quantity) || 0
    const rate = parseFloat(formData.ratePerUnit) || 0
    const subtotal = quantity * rate

    let discount = 0
    if (formData.discountPercentItem) {
      discount = (subtotal * parseFloat(formData.discountPercentItem)) / 100
    }

    let GST = 0
    if (formData.GSTPercentItem) {
      GST = ((subtotal - discount) * parseFloat(formData.GSTPercentItem)) / 100
    }

    return subtotal - discount + GST
  }

  // Add to cart with description
  const handleAddToCart = () => {
    if (!formData.itemName || !formData.quantity || !formData.ratePerUnit) {
      alert('Please fill in item name, quantity, and rate.')
      return
    }

    const newCartItem = {
      id: Date.now(),
      itemId: formData.selectedItem?.id,
      itemName: formData.itemName,
      itemDescription: formData.itemDescription, // Include description
      quantity: parseFloat(formData.quantity),
      rate: parseFloat(formData.ratePerUnit),
      discountPercent: parseFloat(formData.discountPercentItem) || 0,
      GSTPercent: parseFloat(formData.GSTPercentItem) || 0,
      total: calculateItemTotal(),
      unit: formData.selectedItem?.unit || 'pcs'
    }

    setSalesCart(prev => [...prev, newCartItem])

    // Clear item fields
    setFormData(prev => ({
      ...prev,
      selectedItem: null,
      itemName: '',
      itemDescription: '', // Clear description
      quantity: '1',
      ratePerUnit: '',
      discountPercentItem: '',
      GSTPercentItem: ''
    }))
  }

  const handleRemoveFromCart = (id) => {
    setSalesCart(prev => prev.filter(item => item.id !== id))
  }

  const calculateTotals = () => {
    const subtotal = salesCart.reduce((total, item) => total + item.total, 0)
    const transportCost = parseFloat(formData.transportCost) || 0

    let totalDiscount = 0
    let totalGST = 0

    if (formData.discountGSTMethod === 'total') {
      const discountValue = parseFloat(formData.discount) || 0
      const discountPercentValue = parseFloat(formData.discountPercent) || 0
      totalDiscount = discountValue + (subtotal * discountPercentValue / 100)

      const gstValue = parseFloat(formData.GST) || 0
      const gstPercentValue = parseFloat(formData.GSTPercent) || 100
      totalGST = gstValue + ((subtotal - totalDiscount) * gstPercentValue / 100)
    }

    const grandTotal = subtotal + transportCost - totalDiscount + totalGST
    const paidAmount = parseFloat(formData.paidAmount) || 0
    const dueAmount = grandTotal - paidAmount

    setFormData(prev => ({
      ...prev,
      grandTotal: grandTotal.toFixed(2),
      dueAmount: dueAmount.toFixed(2)
    }))
  }

  const calculateSubTotal = () => {
    return salesCart.reduce((total, item) => total + (item.quantity * item.rate), 0).toFixed(2)
  }

  // Function to handle saving or updating a sales entry
  const handleSaveOrUpdateSales = async () => {
    if (salesCart.length === 0) {
      alert('Please add at least one item to the cart.')
      return
    }

    try {
      setSaving(true)
      const salesData = {
        invoiceNo: formData.invoiceNo,
        entryDate: formatDateForAPI(formData.entryDate),
        customer: formData.selectedCustomer?.id !== 'general' ? formData.selectedCustomer?.id : null,
        customerName: formData.customerName,
        institutionName: formData.institutionName,
        contactNo: formData.contactNo,
        customerAddress: formData.customerAddress,
        customerGST: formData.customerGST, // Include customer GST
        previousDue: parseFloat(formData.previousDue) || 0,
        items: salesCart.map(item => ({
          item: item.itemId,
          itemName: item.itemName,
          itemDescription: item.itemDescription, // Include item description
          quantity: item.quantity,
          rate: item.rate,
          unit: item.unit,
          discountPercent: item.discountPercent,
          GSTPercent: item.GSTPercent,
          total: item.total
        })),
        narration: formData.narration,
        challanText: formData.challanText,
        discount: parseFloat(formData.discount) || 0,
        discountPercent: parseFloat(formData.discountPercent) || 0,
        GST: parseFloat(formData.GST) || 0,
        GSTPercent: parseFloat(formData.GSTPercent) || 0,
        discountGSTMethod: formData.discountGSTMethod,
        transportCost: parseFloat(formData.transportCost) || 0,
        grandTotal: parseFloat(formData.grandTotal),
        paidAmount: parseFloat(formData.paidAmount) || 0,
        dueAmount: parseFloat(formData.dueAmount),
        employee: formData.selectedEmployee?.id,
        smgToMobile: formData.smgToMobile,
        isConditionSale: formData.isConditionSale,
        isPaymentEMI: formData.isPaymentEMI,
        status: parseFloat(formData.dueAmount) > 0 ? 'Partial' : 'Completed'
      }

      let result
      if (editingEntry) {
        result = await salesAPI.updateSalesEntry(editingEntry.id, salesData)
        if (result.success) {
          alert('Sales entry updated successfully!')
        }
      } else {
        result = await salesAPI.createSalesEntry(salesData)
        if (result.success) {
          alert('Sales entry saved successfully!')
        }
      }

      if (result.success) {
        handleReset()
        await loadSalesEntries()
      } else {
        setError(result.message || 'An unexpected error occurred.')
      }
    } catch (error) {
      console.error('Error saving/updating sales:', error)
      setError(`Error: ${error.message}. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSalesCart([])
    setFormData(initialFormData)
    setEditingEntry(null)
  }

  // Edit functionality
  const handleEditEntry = (entry) => {
    setEditingEntry(entry)
    const formattedDate = formatDateForDisplay(entry.entryDate)
    const entryItems = entry.items.map((item, index) => ({
      ...item,
      id: index,
      rate: item.rate,
      total: item.total
    }))

    setSalesCart(entryItems)

    const selectedEmployee = employees.find(emp => emp.id === entry.employeeId) || null
    const selectedCustomer = customers.find(cust => cust.id === entry.customerId) || null

    setFormData({
      ...initialFormData,
      invoiceNo: entry.invoiceNo,
      entryDate: formattedDate,
      selectedCustomer: selectedCustomer,
      customerName: entry.customerName,
      institutionName: entry.institutionName || '',
      contactNo: entry.contactNo || '',
      customerAddress: entry.customerAddress || '',
      customerGST: entry.customerGST || '', // Include customer GST
      previousDue: entry.previousDue?.toString() || '0',
      narration: entry.narration || '',
      challanText: entry.challanText || '',
      discount: entry.discount?.toString() || '',
      discountPercent: entry.discountPercent?.toString() || '',
      GST: entry.GST?.toString() || '',
      GSTPercent: entry.GSTPercent?.toString() || '',
      discountGSTMethod: entry.discountGSTMethod || 'individual',
      selectedEmployee: selectedEmployee,
      transportCost: entry.transportCost?.toString() || '0',
      paidAmount: entry.paidAmount?.toString() || '0',
      grandTotal: entry.grandTotal?.toFixed(2),
      dueAmount: entry.dueAmount?.toFixed(2),
      smgToMobile: entry.smgToMobile || false,
      isConditionSale: entry.isConditionSale || false,
      isPaymentEMI: entry.isPaymentEMI || false
    })

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) {
      return
    }

    try {
      setLoading(true)
      const result = await salesAPI.deleteSalesEntry(id)

      if (result.success) {
        await loadSalesEntries()
        alert('Sales entry deleted successfully!')
      } else {
        setError(result.message || 'Failed to delete sales entry.')
      }
    } catch (error) {
      console.error('Error deleting sales entry:', error)
      setError('Error deleting sales entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Invoice Print Handlers
  const handlePrintInvoice = (entry) => {
    setSelectedInvoiceEntry(entry)
    setShowInvoicePrint(true)
  }

  const handleQuickPrint = (entry) => {
    const quickPrintContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 400px;">
        <div style="text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin: 0; color: #0f766e;"> S.K. ELECTRICALS</h2>
          <div style="font-size: 12px;">Quick Invoice Receipt</div>
        </div>
        
        <div style="margin-bottom: 15px;">
          <div><strong>Invoice:</strong> ${entry.invoiceNo}</div>
          <div><strong>Date:</strong> ${entry.entryDate}</div>
          <div><strong>Customer:</strong> ${entry.customerName}</div>
          <div><strong>GST:</strong> ${entry.customerGST || 'N/A'}</div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px 0;"><strong>Total Amount:</strong></td>
            <td style="text-align: right; padding: 8px 0;"><strong>${entry.totalAmount}</strong></td>
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
        <head><title>Quick Receipt - ${entry.invoiceNo}</title></head>
        <body style="margin: 0;">${quickPrintContent}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const handleSearch = async () => {
    setCurrentPage(1)
    await loadSalesEntries()
  }

  const handleClearSearch = async () => {
    setSearchTerm('')
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Enhanced Print Report
  const handlePrintAdvanced = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Entry Report - ${new Date().toLocaleDateString()}</title>
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
            .status-completed {
              background-color: #dcfce7;
              color: #166534;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 9px;
              font-weight: bold;
            }
            .status-partial {
              background-color: #fef3c7;
              color: #92400e;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 9px;
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
            <div class="report-title">Sales Entry Report</div>
            <div class="report-meta">
              <div>Generated on: ${new Date().toLocaleString()}</div>
              <div>Total Records: ${totalCount}</div>
              <div>Report Period: ${searchTerm ? `Filtered by: ${searchTerm}` : 'All Records'}</div>
            </div>
          </div>

          <div class="summary-stats">
            <div class="stat-item">
              <div class="stat-value">${totalCount}</div>
              <div class="stat-label">Total Invoices</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">₹${salesEntries.reduce((sum, entry) => sum + parseFloat(entry.totalAmount.replace('₹ ', '')), 0).toFixed(2)}</div>
              <div class="stat-label">Total Sales</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">₹${salesEntries.reduce((sum, entry) => sum + parseFloat(entry.paidAmount.replace('₹ ', '')), 0).toFixed(2)}</div>
              <div class="stat-label">Total Collected</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">₹${salesEntries.reduce((sum, entry) => sum + parseFloat(entry.dueAmount.replace('₹ ', '')), 0).toFixed(2)}</div>
              <div class="stat-label">Total Due</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total Amount</th>
                <th>Paid Amount</th>
                <th>Due Amount</th>
                <th>Status</th>
                <th>Employee</th>
                <th>Narration</th>
              </tr>
            </thead>
            <tbody>
              ${salesEntries.map(entry => `
                <tr>
                  <td><strong>${entry.invoiceNo}</strong></td>
                  <td>${entry.customerName}</td>
                  <td>${entry.entryDate}</td>
                  <td class="amount">${entry.totalAmount}</td>
                  <td class="amount">${entry.paidAmount}</td>
                  <td class="${parseFloat(entry.dueAmount.replace('₹ ', '')) > 0 ? 'due-amount' : 'amount'}">${entry.dueAmount}</td>
                  <td><span class="status-${entry.status.toLowerCase()}">${entry.status}</span></td>
                  <td>${entry.employee}</td>
                  <td>${entry.narration || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div><strong>S.K. ELECTRICALS Management System</strong></div>
            <div>Sales Entry Report - Confidential Document</div>
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

  const handleExport = () => {
    const csvContent = [
      ['S.K. ELECTRICALS - Sales Entry List'],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${totalCount}`],
      [],
      ['Invoice No', 'Customer Name', 'Entry Date', 'Total Amount', 'Paid Amount', 'Due Amount', 'Status', 'Employee', 'Narration'],
      ...salesEntries.map(entry => [
        entry.invoiceNo,
        entry.customerName,
        entry.entryDate,
        entry.totalAmount.replace('₹ ', ''),
        entry.paidAmount.replace('₹ ', ''),
        entry.dueAmount.replace('₹ ', ''),
        entry.status,
        entry.employee,
        entry.narration || ''
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales_entries_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const renderPagination = () => {
    const pages = []
    const maxPagesToShow = 5
    const startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (startPage > 1) {
      pages.push(
        <button key="1" onClick={() => handlePageChange(1)} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">1</button>
      )
      if (startPage > 2) {
        pages.push(<span key="dots-start" className="px-2">...</span>)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 border rounded text-sm ${currentPage === i ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
        >
          {i}
        </button>
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots-end" className="px-2">...</span>)
      }
      pages.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="px-3 py-1 border rounded text-sm hover:bg-gray-100">{totalPages}</button>
      )
    }

    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-red-600 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">{editingEntry ? 'Edit Sales Entry' : 'Sales Entry'}</h2>
          <div className="text-right">
            <div className="text-sm font-semibold">S.K. ELECTRICALS</div>
            <div className="text-xs opacity-90">Sales Management System</div>
          </div>
        </div>

        <div className="p-6">
          {/* Main Form Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - Item/Product Cart Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Item cart / Product cart Information</h3>

              {/* Select Item Dropdown */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Select Item</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.selectedItem?.id || ''}
                  onChange={(e) => handleItemSelect(e.target.value)}
                  disabled={saving || loading}
                >
                  <option value="">Choose an item...</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.category} (₹{item.rate}) - Stock: {item.stock} {item.unit}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select item to auto-fill details & description</p>
              </div>

              {/* Item Description Field */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Item Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  rows="2"
                  value={formData.itemDescription}
                  onChange={(e) => handleInputChange('itemDescription', e.target.value)}
                  disabled={saving}
                  placeholder="Auto-filled when item selected"
                />
              </div>

              {/* Item Input Fields */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Item Name"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.itemName}
                    onChange={(e) => handleInputChange('itemName', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Qty"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Rate"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.ratePerUnit}
                    onChange={(e) => handleInputChange('ratePerUnit', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Discount %"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.discountPercentItem}
                    onChange={(e) => handleInputChange('discountPercentItem', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="GST %"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.GSTPercentItem}
                    onChange={(e) => handleInputChange('GSTPercentItem', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Total</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                    value={calculateItemTotal().toFixed(2)}
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Press Enter Key to sales Cart</p>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-gray-600 text-white py-2 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  disabled={saving || loading}
                >
                  {saving ? 'ADDING...' : 'ADD TO CART'}
                </button>
              </div>

              {/* Selected Item Details */}
              {formData.selectedItem && (
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium">Code:</span> {formData.selectedItem.code || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Brand:</span> {formData.selectedItem.brand || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Category:</span> {formData.selectedItem.category}
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span> {formData.selectedItem.stock} {formData.selectedItem.unit}
                    </div>
                  </div>
                  {formData.selectedItem.description && (
                    <div className="mt-2">
                      <span className="font-medium">Description:</span> {formData.selectedItem.description}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Middle Column - Customer & Cart */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Customer & Item/Product Cart Information</h3>
              {/* Select Customer Dropdown */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Select Customer</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.selectedCustomer?.id || ''}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  disabled={saving || loading}
                >
                  <option value="">Choose a customer...</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} {customer.phone && `- ${customer.phone}`} {customer.profession && `(${customer.profession})`}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Select customer to auto-fill details & GST</p>
              </div>

              {/* Selected Customer Details */}
              {formData.selectedCustomer && formData.selectedCustomer.id !== 'general' && (
                <div className="bg-gray-50 p-3 rounded text-xs">
                  <div className="space-y-1">
                    <div><span className="font-medium">Name:</span> {formData.selectedCustomer.name}</div>
                    <div><span className="font-medium">Phone:</span> {formData.selectedCustomer.phone || 'N/A'}</div>
                    <div><span className="font-medium">Address:</span> {formData.selectedCustomer.address || 'N/A'}</div>
                    <div><span className="font-medium">GST:</span> {formData.selectedCustomer.gst || 'N/A'}</div>
                    <div><span className="font-medium">Institution:</span> {formData.selectedCustomer.institutionName || 'N/A'}</div>
                    <div><span className="font-medium">Profession:</span> {formData.selectedCustomer.profession || 'N/A'}</div>
                  </div>
                </div>
              )}

              {/* Sales Items Table with Description */}
              <div className="border rounded">
                <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 grid grid-cols-9 gap-1">
                  <div>Item Name</div>
                  <div>Description</div>
                  <div>QTY</div>
                  <div>Unit</div>
                  <div>Rate</div>
                  <div>Disc%</div>
                  <div>GST%</div>
                  <div>Total</div>
                  <div>Action</div>
                </div>
                <div className="min-h-32 max-h-48 overflow-y-auto">
                  {salesCart.length > 0 ? (
                    salesCart.map((item) => (
                      <div key={item.id} className="px-3 py-2 text-xs border-b grid grid-cols-9 gap-1 items-center hover:bg-gray-50">
                        <div className="truncate" title={item.itemName}>{item.itemName}</div>
                        <div className="truncate" title={item.itemDescription}>{item.itemDescription}</div>
                        <div>{item.quantity}</div>
                        <div>{item.unit}</div>
                        <div>{item.rate.toFixed(2)}</div>
                        <div>{item.discountPercent}%</div>
                        <div>{item.GSTPercent}%</div>
                        <div>₹{item.total.toFixed(2)}</div>
                        <div>
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                            title="Remove"
                            disabled={saving}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-8 text-center text-gray-500 text-xs">
                      No items in cart
                    </div>
                  )}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sub Total (Rs)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-semibold"
                    value={`₹ ${calculateSubTotal()}`}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Grand Total (Rs)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-semibold text-green-700"
                    value={`₹ ${formData.grandTotal}`}
                    readOnly
                  />
                </div>
              </div>

            </div>

            {/* Right Column - Additional Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Additional Information</h3>
              {/* Customer Name & Institution Name */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Customer Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Institution Name</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.institutionName}
                    onChange={(e) => handleInputChange('institutionName', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Contact No & Customer GST */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Contact No</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.contactNo}
                    onChange={(e) => handleInputChange('contactNo', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Customer GST</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.customerGST}
                    onChange={(e) => handleInputChange('customerGST', e.target.value)}
                    disabled={saving}
                    placeholder="Auto-filled when customer selected"
                  />
                </div>
              </div>

              {/* Entry Date */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Entry Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formatDateForInput(formData.entryDate)}
                  onChange={(e) => handleInputChange('entryDate', formatDateForDisplay(e.target.value))}
                  disabled={saving}
                />
              </div>

              {/* Customer Address */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Customer Address</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  rows="2"
                  value={formData.customerAddress}
                  onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Narration */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Narration</label>
                <textarea
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  rows="2"
                  value={formData.narration}
                  onChange={(e) => handleInputChange('narration', e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Challan Text */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Challan Text</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.challanText}
                  onChange={(e) => handleInputChange('challanText', e.target.value)}
                  disabled={saving}
                />
              </div>

              {/* Discount/GST/Transport */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Discount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.discount}
                    onChange={(e) => handleInputChange('discount', e.target.value)}
                    placeholder="0"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">GST</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.GST}
                    onChange={(e) => handleInputChange('GST', e.target.value)}
                    placeholder="0"
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Transport Cost</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.transportCost}
                    onChange={(e) => handleInputChange('transportCost', e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>
              {/* Paid Amount & Due Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Paid Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.paidAmount}
                    onChange={(e) => handleInputChange('paidAmount', e.target.value)}
                    disabled={saving}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Due Amount</label>
                  <input
                    type="text"
                    className={`w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-semibold ${
                      parseFloat(formData.dueAmount) > 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                    value={`₹ ${formData.dueAmount}`}
                    readOnly
                  />
                </div>
              </div>
              {/* Employee & Checkboxes */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Choose Employee</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.selectedEmployee?.id || ''}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  disabled={saving || loading}
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} {emp.position && `- ${emp.position}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.smgToMobile}
                    onChange={(e) => handleInputChange('smgToMobile', e.target.checked)}
                    className="mr-2"
                    disabled={saving}
                  />
                  SMS to Mobile?
                </label>
                <label className="flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.isConditionSale}
                    onChange={(e) => handleInputChange('isConditionSale', e.target.checked)}
                    className="mr-2"
                    disabled={saving}
                  />
                  Is Condition Sale?
                </label>
                <label className="flex items-center text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={formData.isPaymentEMI}
                    onChange={(e) => handleInputChange('isPaymentEMI', e.target.checked)}
                    className="mr-2"
                    disabled={saving}
                  />
                  Is Payment EMI?
                </label>
              </div>
              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleSaveOrUpdateSales}
                  className="flex-1 bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editingEntry ? 'UPDATING...' : 'SAVING...'}
                    </>
                  ) : (
                    editingEntry ? 'UPDATE SALES' : 'SAVE SALES'
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  RESET
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Sales Entry List ({totalCount} records)
            </h3>
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
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Export to CSV"
              >
                📤
              </button>
              <button
                onClick={handlePrintAdvanced}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Print Report"
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
                placeholder="Search by invoice number, customer name, employee, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                onKeyPress={(e) => { if (e.key === 'Enter') handleSearch() }}
              />
              <button
                onClick={handleSearch}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Search
              </button>
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Clear
              </button>
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Invoice No</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Customer Name</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Entry Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Total Amount</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Paid Amount</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Due Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Employee</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Narration</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mr-2"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : salesEntries.length > 0 ? (
                  salesEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs font-medium text-teal-600">{entry.invoiceNo}</td>
                      <td className="py-3 px-2 text-xs">{entry.customerName}</td>
                      <td className="py-3 px-2 text-xs">{entry.entryDate}</td>
                      <td className="py-3 px-2 text-xs font-medium">{entry.totalAmount}</td>
                      <td className="py-3 px-2 text-xs text-green-600">{entry.paidAmount}</td>
                      <td className="py-3 px-2 text-xs text-red-600">{entry.dueAmount}</td>
                      <td className="py-3 px-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          entry.status === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : entry.status === 'Partial'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs">{entry.employee}</td>
                      <td className="py-3 px-2 text-xs max-w-32 truncate" title={entry.narration}>{entry.narration}</td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => handlePrintInvoice(entry)}
                            className="text-green-600 hover:text-green-800 text-xs p-1"
                            title="Print Professional Invoice"
                            disabled={loading}
                          >
                            🖨️
                          </button>
                          <button
                            onClick={() => handleQuickPrint(entry)}
                            className="text-purple-600 hover:text-purple-800 text-xs p-1"
                            title="Quick Print Receipt"
                            disabled={loading}
                          >
                            📄
                          </button>
                          <button
                            onClick={() => handleEditEntry(entry)}
                            className="text-blue-600 hover:text-blue-800 text-xs p-1"
                            title="Edit"
                            disabled={loading}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-600 hover:text-red-800 text-xs p-1"
                            title="Delete"
                            disabled={loading}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500">
                      No sales entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center text-sm text-gray-700">
              <div>
                Showing page {currentPage} of {totalPages} ({totalCount} entries)
              </div>
              {renderPagination()}
            </div>
          )}
        </div>
      </div>

      {/* Invoice Print Modal */}
      <InvoicePrintModal
        isVisible={showInvoicePrint}
        onClose={() => setShowInvoicePrint(false)}
        salesEntry={selectedInvoiceEntry}
        companyInfo={companyInfo}
      />
    </div>
  )
}
