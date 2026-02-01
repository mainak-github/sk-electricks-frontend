'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

// Company Information
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

// Multi-Select Component (Enhanced for better UX)
const MultiSelectDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  displayKey = 'name',
  valueKey = 'id',
  searchKey = 'name',
  maxDisplayTags = 3,
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const filteredOptions = options.filter(option =>
    option[searchKey].toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const selectedItems = options.filter(option => value.includes(option[valueKey]))
  
  const handleToggle = (option) => {
    const optionValue = option[valueKey]
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange(newValue)
  }
  
  const handleSelectAll = () => {
    if (selectedItems.length === options.length) {
      onChange([])
    } else {
      onChange(options.map(option => option[valueKey]))
    }
  }
  
  const removeItem = (optionValue) => {
    onChange(value.filter(v => v !== optionValue))
  }
  
  return (
    <div className="relative">
      {/* Selected Items Display */}
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer min-h-[38px] flex flex-wrap gap-1 items-center ${disabled ? 'bg-gray-100' : 'bg-white'}`}
      >
        {selectedItems.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : selectedItems.length <= maxDisplayTags ? (
          selectedItems.map(item => (
            <span 
              key={item[valueKey]} 
              className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
            >
              {item[displayKey]}
              {!disabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeItem(item[valueKey])
                  }}
                  className="text-teal-600 hover:text-teal-800"
                >
                  ×
                </button>
              )}
            </span>
          ))
        ) : (
          <span className="text-sm text-gray-700">
            {selectedItems.length} items selected
          </span>
        )}
        <span className="ml-auto text-gray-400">▼</span>
      </div>
      
      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-500"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          
          {/* Select All / Deselect All */}
          <div className="p-2 border-b">
            <button
              onClick={handleSelectAll}
              className="w-full text-left px-2 py-1 text-sm text-teal-600 hover:bg-teal-50 rounded"
            >
              {selectedItems.length === options.length ? '✓ Deselect All' : '☐ Select All'}
            </button>
          </div>
          
          {/* Options List */}
          <div className="max-h-40 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-gray-500 text-sm text-center">No options found</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option[valueKey]}
                  onClick={() => handleToggle(option)}
                  className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={value.includes(option[valueKey])}
                    onChange={() => handleToggle(option)}
                    className="mr-2"
                  />
                  <span className="text-sm flex-1">{option[displayKey]}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

// Enhanced Invoice Modal Component with GST and Description support
const InvoiceModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null

  const handlePrintInvoice = () => {
    const printContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sales Order ${order.orderNo}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body { 
            font-family: Arial, sans-serif; 
            font-size: 12px; 
            line-height: 1.4; 
            color: #333;
            background: white;
            padding: 20px;
          }
          
          .invoice-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white;
          }
          
          .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
          }
          
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb;
            margin-bottom: 5px;
          }
          
          .company-details { 
            font-size: 11px; 
            color: #666;
            margin-bottom: 10px;
            line-height: 1.3;
          }
          
          .to-section { 
            margin-bottom: 20px;
          }
          
          .to-label { 
            font-weight: bold; 
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .customer-info { 
            background: #f8f9fa;
            padding: 10px;
            border-left: 4px solid #2563eb;
            margin-bottom: 15px;
          }
          
          .order-details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            font-size: 11px;
          }
          
          .detail-item {
            flex: 1;
            text-align: center;
            padding: 5px;
          }
          
          .detail-label {
            font-weight: bold;
            color: #555;
            display: block;
            margin-bottom: 2px;
          }
          
          .items-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 20px;
            border: 1px solid #ddd;
          }
          
          .items-table th { 
            background: #f8f9fa; 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
            font-weight: bold;
            font-size: 11px;
          }
          
          .items-table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            font-size: 11px;
          }
          
          .item-description {
            font-size: 10px;
            color: #666;
            font-style: italic;
          }
          
          .amount-col { 
            text-align: right; 
            font-weight: bold;
          }
          
          .totals-section { 
            float: right; 
            width: 300px; 
            margin-bottom: 30px;
          }
          
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 5px 10px; 
            border-bottom: 1px solid #eee;
          }
          
          .total-row.final { 
            border: 2px solid #000; 
            font-weight: bold; 
            font-size: 14px;
            background: #f8f9fa;
          }
          
          .gst-info {
            margin-top: 20px;
            font-size: 10px;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #ddd;
          }
          
          @media print {
            body { margin: 0; padding: 15px; }
            .no-print { display: none !important; }
            .invoice-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <div class="company-name">${companyInfo.name}</div>
            <div class="company-details">
              ${companyInfo.address}<br>
              GSTIN: ${companyInfo.gstin} | State: ${companyInfo.state}<br>
              Phone: ${companyInfo.phone} | Website: ${companyInfo.website}
            </div>
          </div>
          
          <!-- To Section -->
          <div class="to-section">
            <div class="to-label">To</div>
            <div class="customer-info">
              M/S : ${order.customerName?.toUpperCase() || ''}<br>
              ${order.institutionName ? order.institutionName + '<br>' : ''}
              ${order.customerAddress || ''}<br>
              ${order.contactNo ? 'Phone: ' + order.contactNo : ''}
              ${order.rawData?.customerGST ? '<br>GSTIN: ' + order.rawData.customerGST : ''}
            </div>
            <strong>Sub : Sales Order for Electrical Products/Services</strong>
          </div>
          
          <!-- Order Details -->
          <div class="order-details">
            <div class="detail-item">
              <span class="detail-label">Order No :</span>
              ${order.orderNo}
            </div>
            <div class="detail-item">
              <span class="detail-label">Date :</span>
              ${order.date}
            </div>
            <div class="detail-item">
              <span class="detail-label">Status :</span>
              ${order.status}
            </div>
            <div class="detail-item">
              <span class="detail-label">Priority :</span>
              ${order.priority}
            </div>
          </div>
          
          <!-- Items Table with Descriptions -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40px;">S.L.No</th>
                <th style="width: 45%;">ITEMS / SERVICES</th>
                <th style="width: 60px;">Quantity</th>
                <th style="width: 50px;">UOM</th>
                <th style="width: 80px;">RATE</th>
                <th style="width: 60px;">Discount %</th>
                <th style="width: 100px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${(order.rawData?.items || []).map((item, index) => `
                <tr>
                  <td style="text-align: center;">${index + 1}</td>
                  <td>
                    <strong>${item.itemName}</strong>
                    <div class="item-description">
                      ${item.itemDescription || 'Professional grade electrical ' + item.itemName?.toLowerCase() + ' with standard specifications'}
                    </div>
                  </td>
                  <td style="text-align: center;">${item.qty?.toFixed(2) || '0.00'}</td>
                  <td style="text-align: center;">PCS</td>
                  <td style="text-align: right;">₹${item.rate?.toFixed(2) || '0.00'}</td>
                  <td style="text-align: center;">${item.discount || 0}%</td>
                  <td class="amount-col">₹${item.total?.toFixed(2) || '0.00'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Totals Section -->
          <div class="totals-section">
            <div class="total-row">
              <span>Sub Total</span>
              <span>₹${order.rawData?.subTotal?.toFixed(2) || '0.00'}</span>
            </div>
            ${(order.rawData?.transportCost || 0) > 0 ? `
              <div class="total-row">
                <span>Transport Cost</span>
                <span>₹${order.rawData?.transportCost?.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row">
              <span>GST</span>
              <span>₹${order.rawData?.GSTRs?.toFixed(2) || '0.00'}</span>
            </div>
            ${(order.rawData?.discountRs || 0) > 0 ? `
              <div class="total-row">
                <span>Discount</span>
                <span>-₹${order.rawData?.discountRs?.toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="total-row final">
              <span>Grand Total</span>
              <span>₹${order.rawData?.grandTotal?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          <!-- GST Information -->
          <div class="gst-info">
            <strong>GST Details:</strong><br>
            Customer GSTIN: ${order.rawData?.customerGST || 'N/A'}<br>
            Company GSTIN: ${companyInfo.gstin}<br>
            State: ${companyInfo.state} | Jurisdiction: ${companyInfo.jurisdiction}
          </div>
          
          <!-- Bank Details -->
          <div style="clear: both; margin-top: 40px; font-size: 10px; padding: 10px; background: #f8f9fa; border: 1px solid #ddd;">
            <strong>Bank Details:</strong><br>
            Bank Name: ${companyInfo.bankName}<br>
            Account No: ${companyInfo.accountNo}<br>
            Branch: ${companyInfo.branchCode}<br>
            Jurisdiction: ${companyInfo.jurisdiction}
          </div>
          
          <!-- Terms & Conditions -->
          <div style="margin-top: 20px; font-size: 11px;">
            <div style="font-weight: bold; margin-bottom: 10px; text-decoration: underline;">Terms & Conditions :</div>
            <div style="margin-bottom: 5px; padding-left: 15px;">* Delivery will be made as per agreed schedule.</div>
            <div style="margin-bottom: 5px; padding-left: 15px;">* All electrical work will comply with ISI standards and local regulations.</div>
            <div style="margin-bottom: 5px; padding-left: 15px;">* Payment Terms: As per agreed terms and conditions.</div>
            <div style="margin-bottom: 5px; padding-left: 15px;">* Any changes to this order must be confirmed in writing.</div>
            <div style="margin-bottom: 5px; padding-left: 15px;">* All materials provided carry manufacturer's warranty.</div>
          </div>
          
          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
            <strong>${companyInfo.name}</strong> - Professional Electrical Solutions<br>
            This is a computer generated sales order and does not require signature.
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

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
            <h2 className="text-xl font-semibold text-gray-800">
              Sales Order Invoice - {order.orderNo}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrintInvoice}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={onClose}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Invoice Content Preview with GST and Description */}
          <div className="p-6">
            <div className="bg-white border rounded-lg p-8">
              {/* Header */}
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                <h1 className="text-3xl font-bold text-blue-600 mb-2">{companyInfo.name}</h1>
                <div className="text-sm text-gray-600">
                  {companyInfo.address}<br/>
                  GSTIN: {companyInfo.gstin} | State: {companyInfo.state}<br/>
                  Phone: {companyInfo.phone} | Website: {companyInfo.website}
                </div>
              </div>

              {/* Customer Info with GST */}
              <div className="mb-6">
                <div className="text-sm font-semibold mb-2">To</div>
                <div className="bg-gray-50 p-3 border-l-4 border-blue-600">
                  <div className="font-semibold">M/S : {order.customerName?.toUpperCase() || ''}</div>
                  {order.institutionName && <div>{order.institutionName}</div>}
                  {order.customerAddress && <div>{order.customerAddress}</div>}
                  {order.contactNo && <div>Phone: {order.contactNo}</div>}
                  {order.rawData?.customerGST && <div className="font-medium">GSTIN: {order.rawData.customerGST}</div>}
                </div>
                <div className="mt-3 font-semibold">
                  Sub : Sales Order for Electrical Products/Services
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-4 gap-4 mb-6 text-sm">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-600">Order No :</div>
                  <div>{order.orderNo}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-600">Date :</div>
                  <div>{order.date}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-600">Status :</div>
                  <div>{order.status}</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="font-semibold text-gray-600">Priority :</div>
                  <div>{order.priority}</div>
                </div>
              </div>

              {/* Items Table with Descriptions */}
              <div className="mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-xs font-semibold text-left w-12">S.L.No</th>
                      <th className="border border-gray-300 p-2 text-xs font-semibold text-left">ITEMS / SERVICES</th>
                      <th className="border border-gray-300 p-2 text-xs font-semibold text-center w-20">Quantity</th>
                      <th className="border border-gray-300 p-2 text-xs font-semibold text-center w-16">UOM</th>
                      <th className="border border-gray-300 p-2 text-xs font-semibold text-center w-20">RATE</th>
                      <th className="border border-gray-300 p-2 text-xs font-semibold text-center w-20">Discount %</th>
                      <th className="border border-gray-300 p-2 text-xs font-semibold text-center w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(order.rawData?.items || []).map((item, index) => (
                      <tr key={index}>
                        <td className="border border-gray-300 p-2 text-xs text-center">{index + 1}</td>
                        <td className="border border-gray-300 p-2 text-xs">
                          <div className="font-medium">{item.itemName}</div>
                          <div className="text-gray-500 text-xs italic mt-1">
                            {item.itemDescription || `Professional grade electrical ${item.itemName?.toLowerCase()} with standard specifications`}
                          </div>
                        </td>
                        <td className="border border-gray-300 p-2 text-xs text-center">{item.qty?.toFixed(2) || '0.00'}</td>
                        <td className="border border-gray-300 p-2 text-xs text-center">PCS</td>
                        <td className="border border-gray-300 p-2 text-xs text-right">₹{item.rate?.toFixed(2) || '0.00'}</td>
                        <td className="border border-gray-300 p-2 text-xs text-center">{item.discount || 0}%</td>
                        <td className="border border-gray-300 p-2 text-xs text-right font-medium">₹{item.total?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* GST Information Box */}
              <div className="mb-6 p-4 bg-gray-50 border border-gray-300 rounded">
                <h3 className="font-semibold mb-2 text-sm">GST Details:</h3>
                <div className="text-xs space-y-1">
                  <div><strong>Customer GSTIN:</strong> {order.rawData?.customerGST || 'N/A'}</div>
                  <div><strong>Company GSTIN:</strong> {companyInfo.gstin}</div>
                  <div><strong>State:</strong> {companyInfo.state} | <strong>Jurisdiction:</strong> {companyInfo.jurisdiction}</div>
                </div>
              </div>

              {/* Totals with GST breakdown */}
              <div className="flex justify-end mb-6">
                <div className="w-72">
                  <div className="flex justify-between py-1 px-3 border-b border-gray-200">
                    <span className="text-sm">Sub Total</span>
                    <span className="text-sm font-medium">₹{order.rawData?.subTotal?.toFixed(2) || '0.00'}</span>
                  </div>
                  {(order.rawData?.transportCost || 0) > 0 && (
                    <div className="flex justify-between py-1 px-3 border-b border-gray-200">
                      <span className="text-sm">Transport Cost</span>
                      <span className="text-sm font-medium">₹{order.rawData?.transportCost?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 px-3 border-b border-gray-200">
                    <span className="text-sm">GST</span>
                    <span className="text-sm font-medium">₹{order.rawData?.GSTRs?.toFixed(2) || '0.00'}</span>
                  </div>
                  {(order.rawData?.discountRs || 0) > 0 && (
                    <div className="flex justify-between py-1 px-3 border-b border-gray-200">
                      <span className="text-sm">Discount</span>
                      <span className="text-sm font-medium text-red-600">-₹{order.rawData?.discountRs?.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 px-3 bg-gray-100 border-2 border-gray-800 font-bold">
                    <span>Grand Total</span>
                    <span>₹{order.rawData?.grandTotal?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default function SalesOrderEntry() {
  // API Configuration
  const API_BASE_URL = config.API_URL
  const INTEGRATION_API_URL = config.API_URL

  // Date utility functions with proper parsing
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

  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return new Date().toISOString();
    
    if (dateStr.includes('-')) {
      return new Date(dateStr).toISOString();
    }
    
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`).toISOString();
    }
    
    return new Date(dateStr).toISOString();
  };

  // Generate order number
  const generateOrderNo = () => {
    const prefix = 'SO'
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}${timestamp}`
  }

  const [formData, setFormData] = useState({
    selectedItems: [],
    searchItem: '',
    searchCustomer: '',
    customerName: 'General Customer',
    customerId: '',
    institutionName: '',
    contactNo: '',
    customerAddress: '',
    customerGST: '', // Added customer GST field
    orderNo: generateOrderNo(),
    entryDate: getTodayFormatted(),
    deliveryDate: '',
    discountRs: '0',
    discountPercent: '0',
    GSTRs: '0',
    GSTPercent: '0',
    total: '',
    narration: '',
    discountGSTMethod: 'Individual Item',
    transportCost: '0',
    subTotal: '0.00',
    grandTotal: '0.00',
    priority: 'Medium'
  })

  const [salesCart, setSalesCart] = useState([])
  const [salesOrderEntries, setSalesOrderEntries] = useState([])
  const [customers, setCustomers] = useState([])
  const [items, setItems] = useState([])

  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [filteredEntries, setFilteredEntries] = useState([])
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Edit mode states
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingOrderId, setEditingOrderId] = useState(null)
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null)
  const [stockWarnings, setStockWarnings] = useState([])

  // Invoice modal states
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)

  // API Functions with GST and description support
  const fetchItems = async (search = '') => {
    try {
      const response = await fetch(`${INTEGRATION_API_URL}/items?search=${search}&limit=100`)
      const data = await response.json()
      if (data.data) {
        const formattedItems = data.data.map(item => ({
          id: item._id,
          name: item.name,
          code: item.code,
          rate: item.rate,
          taxPercent: item.taxPercent || 0,
          unit: item.unit,
          stock: item.stock,
          minStock: item.minStock,
          maxStock: item.maxStock,
          category: item.category,
          brand: item.brand,
          description: item.description || '', // Include description
          available: item.stock > 0,
          lowStock: item.stock <= (item.minStock || 5),
          displayName: `${item.name} - ${item.code} (₹${item.rate}) - Stock: ${item.stock} ${item.description ? '- ' + item.description : ''}` // Enhanced display with description
        }))
        setItems(formattedItems)
      }
    } catch (error) {
      console.error('Error fetching items:', error)
      alert('Error fetching items. Please try again.')
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
          address: customer.address || '',
          contactNo: customer.contactNo || '',
          emailAddress: customer.emailAddress || '',
          customerGST: customer.customerGST || '', // Include customer GST
          partyType: customer.partyType,
          locationArea: customer.locationArea,
          status: customer.status,
          displayName: `${customer.customerName}${customer.institutionName ? ` - ${customer.institutionName}` : ''}${customer.contactNo ? ` (${customer.contactNo})` : ''} ${customer.customerGST ? `[GST: ${customer.customerGST}]` : ''}` // Enhanced display with GST
        }))
        setCustomers(formattedCustomers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
      alert('Error fetching customers. Please try again.')
    }
  }

  const fetchSalesOrders = async (page = 1, limit = rowsPerPage, search = '') => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/sales-orders?page=${page}&limit=${limit}&search=${search}`)
      const data = await response.json()
      
      if (data.success) {
        const formattedEntries = data.data.map(order => ({
          id: order._id,
          orderNo: order.orderNo,
          customer: order.customerName,
          customerName: order.customerName,
          institutionName: order.institutionName,
          contactNo: order.contactNo,
          customerAddress: order.customerAddress,
          customerGST: order.customerGST, // Include customer GST
          date: formatDateForDisplay(order.entryDate.split('T')[0]),
          items: order.items.length,
          totalAmount: `₹ ${order.grandTotal.toFixed(2)}`,
          status: order.status,
          priority: order.priority,
          createdAt: new Date(order.createdAt).getTime(),
          rawData: order
        }))
        setSalesOrderEntries(formattedEntries)
        setFilteredEntries(formattedEntries)
      }
    } catch (error) {
      console.error('Error fetching sales orders:', error)
      alert('Error fetching sales orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    fetchItems()
    fetchCustomers()
    fetchSalesOrders()
  }, [])

  // Calculate totals whenever cart changes
  useEffect(() => {
    calculateTotals()
  }, [salesCart, formData.transportCost, formData.discountRs, formData.GSTRs])

  // Update filtered entries when sales order entries change
  useEffect(() => {
    handleSearch()
  }, [salesOrderEntries])

  const handleInputChange = (field, value) => {
    if (field === 'entryDate' && value.includes('-')) {
      const formattedDate = formatDateForDisplay(value)
      setFormData(prev => ({
        ...prev,
        entryDate: formattedDate
      }))
    } else if (field === 'deliveryDate' && value.includes('-')) {
      const formattedDate = formatDateForDisplay(value)
      setFormData(prev => ({
        ...prev,
        deliveryDate: formattedDate
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  // Handle multiple item selection
  const handleMultipleItemSelect = (selectedIds) => {
    setFormData(prev => ({
      ...prev,
      selectedItems: selectedIds
    }))
  }

  // Handle single customer selection with GST auto-fill
  const handleCustomerSelect = (customerId) => {
    const selectedCustomer = customers.find(customer => customer.id === customerId)
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        searchCustomer: customerId,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.customerName,
        institutionName: selectedCustomer.institutionName,
        contactNo: selectedCustomer.contactNo,
        customerAddress: selectedCustomer.address,
        customerGST: selectedCustomer.customerGST // Auto-fill GST
      }))
    }
  }

  // Add selected items to cart with descriptions
  const handleAddSelectedItemsToCart = async () => {
    if (formData.selectedItems.length === 0) {
      alert('Please select at least one item')
      return
    }

    const selectedItems = items.filter(item => formData.selectedItems.includes(item.id))
    const newCartItems = []

    for (const item of selectedItems) {
      // Check stock availability
      if (!item.available) {
        if (!window.confirm(`${item.name} is currently out of stock! Do you want to add it anyway?`)) {
          continue
        }
      }
      
      if (item.lowStock) {
        if (!window.confirm(`${item.name} has low stock (${item.stock} remaining). Do you want to continue?`)) {
          continue
        }
      }

      // Check if item already exists in cart
      const existingItemIndex = salesCart.findIndex(cartItem => cartItem.itemName === item.name)
      if (existingItemIndex !== -1) {
        // Update existing item quantity
        setSalesCart(prev => prev.map((cartItem, index) => 
          index === existingItemIndex 
            ? { ...cartItem, qty: cartItem.qty + 1, total: cartItem.rate * (cartItem.qty + 1) }
            : cartItem
        ))
      } else {
        // Add new item to cart with description
        const newCartItem = {
          id: Date.now() + Math.random(),
          itemId: item.id,
          itemName: item.name,
          itemDescription: item.description || '', // Include item description
          qty: 1,
          rate: item.rate,
          discount: 0,
          GST: item.taxPercent || 0,
          total: item.rate,
          available: item.available,
          stock: item.stock
        }
        newCartItems.push(newCartItem)
      }
    }

    if (newCartItems.length > 0) {
      setSalesCart(prev => [...prev, ...newCartItems])
    }

    // Clear selected items
    setFormData(prev => ({
      ...prev,
      selectedItems: [],
      total: ''
    }))
  }

  const handleItemSelect = async (itemName) => {
    const selectedItem = items.find(item => item.name === itemName)
    if (selectedItem) {
      // Check stock availability
      if (!selectedItem.available) {
        alert(`${selectedItem.name} is currently out of stock!`)
        return
      }
      
      if (selectedItem.lowStock) {
        if (!window.confirm(`${selectedItem.name} has low stock (${selectedItem.stock} remaining). Do you want to continue?`)) {
          return
        }
      }

      setFormData(prev => ({
        ...prev,
        searchItem: itemName,
        total: selectedItem.rate.toString()
      }))
    }
  }

  const handleAddToCart = async () => {
    if (!formData.total || !formData.searchItem) {
      alert('Please select an item and enter total amount')
      return
    }

    const selectedItem = items.find(item => item.name === formData.searchItem)
    if (!selectedItem) {
      alert('Please select a valid item')
      return
    }

    // Check if item already exists in cart
    const existingItemIndex = salesCart.findIndex(item => item.itemName === selectedItem.name)
    if (existingItemIndex !== -1) {
      const updatedCart = [...salesCart]
      updatedCart[existingItemIndex].qty += 1
      updatedCart[existingItemIndex].total += parseFloat(formData.total) || 0
      setSalesCart(updatedCart)
    } else {
      const newCartItem = {
        id: Date.now(),
        itemId: selectedItem.id,
        itemName: selectedItem.name,
        itemDescription: selectedItem.description || '', // Include item description
        qty: 1,
        rate: selectedItem.rate,
        discount: 0,
        GST: selectedItem.taxPercent || 0,
        total: parseFloat(formData.total) || 0,
        available: selectedItem.available,
        stock: selectedItem.stock
      }

      setSalesCart(prev => [...prev, newCartItem])
    }
   
    // Clear item and total
    setFormData(prev => ({
      ...prev,
      searchItem: '',
      total: ''
    }))
  }

  const handleRemoveFromCart = (id) => {
    setSalesCart(prev => prev.filter(item => item.id !== id))
  }

  const handleQuantityChange = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id)
      return
    }

    setSalesCart(prev => prev.map(item => {
      if (item.id === id) {
        const newTotal = item.rate * newQty
        return { ...item, qty: newQty, total: newTotal }
      }
      return item
    }))
  }

  const calculateTotals = () => {
    const cartSubTotal = salesCart.reduce((total, item) => {
      return total + (parseFloat(item.total) || 0)
    }, 0)

    const transportCost = parseFloat(formData.transportCost) || 0
    const discount = parseFloat(formData.discountRs) || 0
    const GST = parseFloat(formData.GSTRs) || 0

    const subTotal = cartSubTotal + transportCost
    const grandTotal = subTotal - discount + GST

    setFormData(prev => ({
      ...prev,
      subTotal: subTotal.toFixed(2),
      grandTotal: grandTotal.toFixed(2)
    }))
  }

  const handleSave = async () => {
    if (salesCart.length === 0) {
      alert('Please add at least one item to the sales order')
      return
    }

    if (!formData.customerName || !formData.customerId) {
      alert('Please select a customer')
      return
    }

    // Prepare order data for backend with GST and descriptions
    const orderData = {
      orderNo: formData.orderNo,
      customerId: formData.customerId,
      customerName: formData.customerName,
      institutionName: formData.institutionName,
      contactNo: formData.contactNo,
      customerAddress: formData.customerAddress,
      customerGST: formData.customerGST, // Include customer GST
      entryDate: formatDateForAPI(formData.entryDate),
      deliveryDate: formData.deliveryDate ? formatDateForAPI(formData.deliveryDate) : null,
      items: salesCart.map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        itemDescription: item.itemDescription, // Include item description
        qty: item.qty,
        rate: item.rate,
        discount: item.discount,
        GST: item.GST,
        total: item.total
      })),
      discountRs: parseFloat(formData.discountRs) || 0,
      discountPercent: parseFloat(formData.discountPercent) || 0,
      GSTRs: parseFloat(formData.GSTRs) || 0,
      GSTPercent: parseFloat(formData.GSTPercent) || 0,
      transportCost: parseFloat(formData.transportCost) || 0,
      subTotal: parseFloat(formData.subTotal) || 0,
      grandTotal: parseFloat(formData.grandTotal) || 0,
      narration: formData.narration,
      discountGSTMethod: formData.discountGSTMethod,
      priority: formData.priority,
      status: 'Pending'
    }

    const success = await saveSalesOrder(orderData)
    
    if (success) {
      handleReset()
      setIsEditMode(false)
      setEditingOrderId(null)
    }
  }

  const saveSalesOrder = async (orderData) => {
    try {
      setSaving(true)
      const url = isEditMode 
        ? `${API_BASE_URL}/sales-orders/${editingOrderId}` 
        : `${API_BASE_URL}/sales-orders`
      
      const method = isEditMode ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        const action = isEditMode ? 'updated' : 'saved'
        alert(`Sales Order ${data.data.orderNo || formData.orderNo} ${action} successfully!`)
        await fetchSalesOrders()
        return true
      } else {
        alert(data.message || `Error ${isEditMode ? 'updating' : 'saving'} sales order`)
        return false
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'saving'} sales order:`, error)
      alert(`Error ${isEditMode ? 'updating' : 'saving'} sales order. Please try again.`)
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSalesCart([])
    setStockWarnings([])
    setFormData({
      selectedItems: [],
      searchItem: '',
      searchCustomer: '',
      customerName: 'General Customer',
      customerId: '',
      institutionName: '',
      contactNo: '',
      customerAddress: '',
      customerGST: '', // Reset GST
      orderNo: generateOrderNo(),
      entryDate: getTodayFormatted(),
      deliveryDate: '',
      discountRs: '0',
      discountPercent: '0',
      GSTRs: '0',
      GSTPercent: '0',
      total: '',
      narration: '',
      discountGSTMethod: 'Individual Item',
      transportCost: '0',
      subTotal: '0.00',
      grandTotal: '0.00',
      priority: 'Medium'
    })
    setIsEditMode(false)
    setEditingOrderId(null)
  }

  // Enhanced Edit Order Function with GST support
 
  // Enhanced Edit Order Function with GST support
  const handleEdit = async (order) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/sales-orders/${order.id}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const orderDetails = data.data
        
        // Populate form with order data including GST
        setFormData({
          selectedItems: [],
          searchItem: '',
          searchCustomer: orderDetails.customerId,
          customerName: orderDetails.customerName,
          customerId: orderDetails.customerId,
          institutionName: orderDetails.institutionName || '',
          contactNo: orderDetails.contactNo || '',
          customerAddress: orderDetails.customerAddress || '',
          customerGST: orderDetails.customerGST || '', // Include customer GST
          orderNo: orderDetails.orderNo,
          entryDate: formatDateForDisplay(orderDetails.entryDate.split('T')[0]),
          deliveryDate: orderDetails.deliveryDate ? formatDateForDisplay(orderDetails.deliveryDate.split('T')[0]) : '',
          discountRs: orderDetails.discountRs?.toString() || '0',
          discountPercent: orderDetails.discountPercent?.toString() || '0',
          GSTRs: orderDetails.GSTRs?.toString() || '0',
          GSTPercent: orderDetails.GSTPercent?.toString() || '0',
          total: '',
          narration: orderDetails.narration || '',
          discountGSTMethod: orderDetails.discountGSTMethod || 'Individual Item',
          transportCost: orderDetails.transportCost?.toString() || '0',
          subTotal: orderDetails.subTotal?.toFixed(2) || '0.00',
          grandTotal: orderDetails.grandTotal?.toFixed(2) || '0.00',
          priority: orderDetails.priority || 'Medium'
        })
        
        // Populate cart with order items including descriptions
        const cartItems = orderDetails.items.map(item => ({
          id: Date.now() + Math.random(),
          itemId: item.itemId,
          itemName: item.itemName,
          itemDescription: item.itemDescription || '', // Include item description
          qty: item.qty,
          rate: item.rate,
          discount: item.discount || 0,
          GST: item.GST || 0,
          total: item.total,
          available: true,
          stock: 999
        }))
        setSalesCart(cartItems)
        
        setIsEditMode(true)
        setEditingOrderId(order.id)
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' })
        
        alert('Sales Order loaded for editing successfully!')
      }
    } catch (error) {
      console.error('Error editing order:', error)
      alert('Error loading order for editing')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (order) => {
    if (!window.confirm(`Are you sure you want to delete Sales Order ${order.orderNo}? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/sales-orders/${order.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert('Sales Order deleted successfully!')
        await fetchSalesOrders()
      } else {
        alert(data.message || 'Error deleting sales order')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Error deleting sales order')
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Status updated to ${newStatus} successfully!`)
        await fetchSalesOrders()
      } else {
        alert(data.message || 'Error updating status')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Error updating status')
    }
  }

  const handleUpdatePriority = async (orderId, newPriority) => {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-orders/${orderId}/priority`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`Priority updated to ${newPriority} successfully!`)
        await fetchSalesOrders()
      } else {
        alert(data.message || 'Error updating priority')
      }
    } catch (error) {
      console.error('Error updating priority:', error)
      alert('Error updating priority')
    }
  }

  // Search functionality
  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredEntries(salesOrderEntries)
    } else {
      const filtered = salesOrderEntries.filter(entry =>
        entry.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.customerGST && entry.customerGST.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredEntries(filtered)
    }
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredEntries(salesOrderEntries)
    setShowSearch(false)
    setCurrentPage(1)
  }

  // Invoice functions
  const handleViewInvoice = (entry) => {
    setSelectedOrderForInvoice(entry)
    setShowInvoiceModal(true)
  }

  const handleCloseInvoice = () => {
    setShowInvoiceModal(false)
    setSelectedOrderForInvoice(null)
  }

  // Print and Export functions
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Sales Order List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${companyInfo.name}</div>
            <div class="report-title">Sales Order List</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
            <div>Total Records: ${filteredEntries.length}</div>
          </div>
         
          <table>
            <thead>
              <tr>
                <th>Order No</th>
                <th>Customer</th>
                <th>Customer GST</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEntries.map(entry => `
                <tr>
                  <td>${entry.orderNo}</td>
                  <td>${entry.customer}</td>
                  <td>${entry.customerGST || 'N/A'}</td>
                  <td>${entry.date}</td>
                  <td>${entry.items}</td>
                  <td>${entry.totalAmount}</td>
                  <td>${entry.status}</td>
                  <td>${entry.priority}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
         
          <div class="footer">
            Sales Order Report - ${companyInfo.name} Management System
          </div>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const handleExport = () => {
    const csvContent = [
      [`${companyInfo.name} - Sales Order List`],
      [`Generated on: ${new Date().toLocaleString()}`],
      [`Total Records: ${filteredEntries.length}`],
      [],
      ['Order No', 'Customer', 'Customer GST', 'Date', 'Items', 'Total Amount', 'Status', 'Priority'],
      ...filteredEntries.map(entry => [
        entry.orderNo,
        entry.customer,
        entry.customerGST || 'N/A',
        entry.date,
        entry.items,
        entry.totalAmount,
        entry.status,
        entry.priority
      ])
    ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sales_orders_${formData.entryDate.replace(/\//g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const currentEntries = filteredEntries.slice(startIndex, endIndex)

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Main Form */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">
            {isEditMode ? 'Edit Sales Order' : 'Sales Order Entry'}
            {isEditMode && (
              <span className="ml-2 text-sm bg-yellow-500 px-2 py-1 rounded">
                Editing: {formData.orderNo}
              </span>
            )}
          </h2>
          <div className="text-right">
            <div className="text-sm font-semibold">{companyInfo.name}</div>
            <div className="text-xs opacity-90">Electrical Sales Management</div>
          </div>
        </div>
       
        <div className="p-6">
          {/* Edit Mode Actions */}
          {isEditMode && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex justify-between items-center">
                <span className="text-yellow-800 font-medium">
                  🔄 Edit Mode: You are currently editing order {formData.orderNo}
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

          {/* Multiple Items Selection */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Multiple Item Selection</h3>
           
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Multi-Select Items */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Select Multiple Items</label>
                <MultiSelectDropdown
                  options={items.map(item => ({
                    ...item,
                    displayName: `${item.name} - ${item.code} (₹${item.rate}) - Stock: ${item.stock} ${item.description ? '- ' + item.description : ''}`
                  }))}
                  value={formData.selectedItems}
                  onChange={handleMultipleItemSelect}
                  placeholder="Select electrical items..."
                  displayKey="displayName"
                  valueKey="id"
                  searchKey="displayName"
                  maxDisplayTags={2}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Selected: {formData.selectedItems.length} item(s) - Auto-fills descriptions & stock info
                </div>
              </div>

              {/* Add Selected Items Button */}
              <div className="flex items-end">
                <button
                  onClick={handleAddSelectedItemsToCart}
                  disabled={formData.selectedItems.length === 0}
                  className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ADD SELECTED ITEMS TO CART ({formData.selectedItems.length})
                </button>
              </div>
            </div>
          </div>

          {/* Customer and Order Information */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer and Order Information</h3>
           
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
              {/* Customer Selection */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Select Customer</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.searchCustomer}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Name (Auto-filled) */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Customer Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                  value={formData.customerName}
                  readOnly
                />
              </div>

              {/* Customer GST (Auto-filled) */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Customer GST</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                  value={formData.customerGST}
                  readOnly
                  placeholder="Auto-filled from customer"
                />
              </div>

              {/* Institution Name */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Institution Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                  value={formData.institutionName}
                  readOnly
                />
              </div>

              {/* Contact No */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Contact No</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                  value={formData.contactNo}
                  readOnly
                />
              </div>

              {/* Customer Address */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Customer Address</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                  value={formData.customerAddress}
                  readOnly
                />
              </div>

              {/* Order No */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Order No</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.orderNo}
                  onChange={(e) => handleInputChange('orderNo', e.target.value)}
                  disabled={isEditMode}
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

              {/* Delivery Date */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Delivery Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.deliveryDate ? formatDateForInput(formData.deliveryDate) : ''}
                  onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs text-gray-600 mb-1">Priority</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sales Cart with Description Display */}
          {salesCart.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Sales Order Cart ({salesCart.length} items)</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Item Name</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Description</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">QTY</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Rate (Per)</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Stock</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Discount %</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">GST %</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-left text-xs font-semibold text-gray-700">Total</th>
                      <th className="border-b border-gray-300 px-3 py-2 text-center text-xs font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesCart.map((item) => (
                      <tr key={item.id} className={`hover:bg-gray-50 ${!item.available ? 'bg-red-50' : item.stock <= 5 ? 'bg-yellow-50' : ''}`}>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium">{item.itemName}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs text-gray-600">
                          {item.itemDescription || 'N/A'}
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">
                          <input
                            type="number"
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-xs"
                            value={item.qty}
                            min="1"
                            max={item.stock || 999}
                            onChange={(e) => {
                              const newQty = parseInt(e.target.value) || 1
                              if (newQty > item.stock && item.stock > 0) {
                                alert(`Only ${item.stock} units available in stock!`)
                                return
                              }
                              handleQuantityChange(item.id, newQty)
                            }}
                          />
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">₹{item.rate.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">
                          <span className={item.stock <= 5 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {item.stock || 'N/A'}
                          </span>
                        </td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.discount}%</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs">{item.GST}%</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-xs font-medium">₹{item.total.toFixed(2)}</td>
                        <td className="border-b border-gray-300 px-3 py-2 text-center">
                          <button
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                            title="Remove from cart"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Additional Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {/* Discount (Rs) */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discount (Rs)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.discountRs}
                onChange={(e) => handleInputChange('discountRs', e.target.value)}
              />
            </div>

            {/* Discount % */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Discount %</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.discountPercent}
                onChange={(e) => handleInputChange('discountPercent', e.target.value)}
              />
            </div>

            {/* GST (Rs) */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">GST (Rs)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.GSTRs}
                onChange={(e) => handleInputChange('GSTRs', e.target.value)}
              />
            </div>

            {/* Transport Cost */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Transport Cost (Rs)</label>
              <input
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.transportCost}
                onChange={(e) => handleInputChange('transportCost', e.target.value)}
              />
            </div>
          </div>

          {/* Narration and Totals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Narration</label>
              <textarea
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                rows="4"
                placeholder="Enter order description or special instructions..."
                value={formData.narration}
                onChange={(e) => handleInputChange('narration', e.target.value)}
              />
            </div>

            {/* Discount and GST Method & Totals */}
            <div>
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">Discount and GST Method</label>
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
                    <span className="text-xs">On Total</span>
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
                    <span className="text-xs">Individual Item</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Sub Total */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sub Total (Rs)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                    value={`₹${formData.subTotal}`}
                    readOnly
                  />
                </div>

                {/* Grand Total */}
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Grand Total (Rs)</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50 font-medium text-lg"
                    value={`₹${formData.grandTotal}`}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="bg-gray-500 text-white px-6 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              disabled={saving}
            >
              {isEditMode ? 'CANCEL EDIT' : 'RESET'}
            </button>
            <button
              onClick={handleSave}
              disabled={salesCart.length === 0 || !formData.customerName || saving}
              className="bg-teal-600 text-white px-6 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? 'UPDATING...' : 'SAVING...'}
                </>
              ) : (
                <>
                  {isEditMode ? '💾 UPDATE ORDER' : '🔒 SAVE ORDER'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sales Order List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Sales Order List ({filteredEntries.length} records)
              {loading && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
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
                onClick={handlePrint}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Print List"
              >
                🖨️
              </button>
              <button
                onClick={() => fetchSalesOrders()}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Refresh"
              >
                🔄
              </button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by order number, customer, GST, status, or priority..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                onClick={handleSearch}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
              >
                Search
              </button>
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Table with GST Column */}
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Order No</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Customer</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Customer GST</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Total Amount</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Status</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Priority</th>
                  <th className="text-center py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentEntries.length > 0 ? (
                  currentEntries.map((entry) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-xs font-medium text-teal-600">{entry.orderNo}</td>
                      <td className="py-3 px-2 text-xs">{entry.customer}</td>
                      <td className="py-3 px-2 text-xs font-mono text-gray-600">{entry.customerGST || 'N/A'}</td>
                      <td className="py-3 px-2 text-xs">{entry.date}</td>
                      <td className="py-3 px-2 text-xs">{entry.items}</td>
                      <td className="py-3 px-2 text-xs font-medium">{entry.totalAmount}</td>
                      <td className="py-3 px-2 text-center">
                        <select
                          className={`px-2 py-1 rounded text-xs border-0 cursor-pointer ${
                            entry.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                            entry.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            entry.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                            entry.status === 'Confirmed' ? 'bg-teal-100 text-teal-800' :
                            entry.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                          value={entry.status}
                          onChange={(e) => handleUpdateStatus(entry.id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <select
                          className={`px-2 py-1 rounded text-xs border-0 cursor-pointer ${
                            entry.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                            entry.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                            entry.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                          value={entry.priority}
                          onChange={(e) => handleUpdatePriority(entry.id, e.target.value)}
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Urgent">Urgent</option>
                        </select>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          <button
                            onClick={() => handleViewInvoice(entry)}
                            className="text-blue-600 hover:text-blue-800 text-xs p-1 bg-blue-50 rounded border border-blue-200 hover:bg-blue-100 transition-colors"
                            title="View Invoice"
                            disabled={loading}
                          >
                            📄 Invoice
                          </button>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="text-green-600 hover:text-green-800 text-xs p-1 bg-green-50 rounded border border-green-200 hover:bg-green-100 transition-colors"
                            title="Edit Order"
                            disabled={loading || saving}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(entry)}
                            className="text-red-600 hover:text-red-800 text-xs p-1 bg-red-50 rounded border border-red-200 hover:bg-red-100 transition-colors"
                            title="Delete Order"
                            disabled={loading || saving}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                          Loading sales orders...
                        </div>
                      ) : searchTerm ? (
                        'No matching records found'
                      ) : (
                        'No sales orders found'
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="border rounded px-2 py-1"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span>
                {filteredEntries.length === 0
                  ? '0-0 of 0'
                  : `${startIndex + 1}-${Math.min(endIndex, filteredEntries.length)} of ${filteredEntries.length}`
                }
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹ Prev
                </button>
                <span className="flex items-center px-3 text-sm">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Invoice Modal with GST and Description support */}
      <InvoiceModal
        order={selectedOrderForInvoice}
        isOpen={showInvoiceModal}
        onClose={handleCloseInvoice}
      />
    </div>
  )
}
