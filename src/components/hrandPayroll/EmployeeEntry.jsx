'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function EmployeeEntry() {
  const [formData, setFormData] = useState({
    employeeType: '',
    contractorName: '', // ✅ NEW
    employeeName: '',
    salary: '',
    salaryUpdateYear: '2025',
    salaryUpdateMonth: 'September',
    updatedSalary: '',
    bankAccNumber: '',
    bankAccName: '',
    bankBranch: '',
    ifscCode: '',
    zipCode: '',
    presentAddress: '',
    permanentAddress: '',
    contactNo: '',
    alternateMobile: '',
    emailAddress: '',
    adhaarNumber: '',
    bloodGroup: '',
    fatherName: '',
    motherName: '',
    joiningDate: '2025-09-13',
    selectDepartment: '',
    selectDesignation: '',
    leaveDays: '0',
    targetAmount: '',
    commissionPercent: '',
    gender: '',
    maritalStatus: '',
    pf: '',
    esi: '',
    wc: '',
    paymentType: '',
    employeePicture: null,
    bankDocument: null,
    adhaarCardImage: null
  })

  // ✅ Add file preview states
  const [filePreviews, setFilePreviews] = useState({
    employeePicture: null,
    adhaarCardImage: null,
    bankDocument: null
  })

  const [employeeList, setEmployeeList] = useState([])
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEmployees, setFilteredEmployees] = useState([])
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [viewingEmployee, setViewingEmployee] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [filterType, setFilterType] = useState('All')
  const [departmentFilter, setDepartmentFilter] = useState('All')
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('All')
  const [contractorFilter, setContractorFilter] = useState('All') // ✅ NEW

  // ✅ NEW: Dynamic dropdown states
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [contractors, setContractors] = useState([]) // ✅ NEW
  const [loadingDropdowns, setLoadingDropdowns] = useState(false)
  const [loadingContractors, setLoadingContractors] = useState(false) // ✅ NEW

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

  // ✅ Helper function to check if employee is Contract type
  const isContractEmployee = (employeeType) => {
    return employeeType === 'Contract'
  }

  // ✅ IMPROVED: Helper function to get full image URL with better checking
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === 'null' || imagePath === 'undefined') {
      return null
    }
    
    // If it's already a full URL or base64, return as is
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath
    }
    
    // If it's a relative path, construct full URL
    const baseUrl = config.API_URL.replace(/\/+$/, '') // Remove trailing slashes
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
    return `${baseUrl}${cleanPath}`
  }

  // ✅ Helper function to check if image exists and is valid
  const hasValidImage = (imagePath) => {
    return imagePath && 
           imagePath !== 'null' && 
           imagePath !== 'undefined' && 
           imagePath.trim() !== '' &&
           imagePath !== 'N/A'
  }

  // ✅ NEW: Fetch Departments from API
  const fetchDepartments = async () => {
    try {
      setLoadingDropdowns(true)
      const response = await fetch(`${config.API_URL}/depertment?limit=100&isActive=true`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setDepartments(data.data)
        } else {
          console.warn('No departments found or API returned empty data')
          setDepartments([])
        }
      } else {
        console.error('Failed to fetch departments:', response.status)
        setDepartments([])
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
      setDepartments([])
    } finally {
      setLoadingDropdowns(false)
    }
  }

  // ✅ NEW: Fetch Designations from API
  const fetchDesignations = async () => {
    try {
      const response = await fetch(`${config.API_URL}/designations`)
      const data = await response.json()
      setDesignations(data.data)
    } catch (error) {
      console.error('Error fetching designations:', error)
      // Fallback to static designations
      setDesignations([
        { _id: '1', designationName: 'Cashier' },
        { _id: '2', designationName: 'Junior Accountant' },
        { _id: '3', designationName: 'Senior Accountant' },
        { _id: '4', designationName: 'Manager' },
        { _id: '5', designationName: 'Executive' },
        { _id: '6', designationName: 'Supervisor' },
        { _id: '7', designationName: 'Assistant' },
        { _id: '8', designationName: 'HR Manager' },
        { _id: '9', designationName: 'Sales Executive' },
        { _id: '10', designationName: 'Marketing Manager' },
        { _id: '11', designationName: 'Production Supervisor' },
        { _id: '12', designationName: 'Quality Controller' },
        { _id: '13', designationName: 'Team Lead' },
        { _id: '14', designationName: 'Officer' }
      ])
    }
  }

  // ✅ NEW: Fetch contractors function
// ✅ UPDATED: Fetch contractors function
const fetchContractors = async () => {
  try {
    setLoadingContractors(true)
    const response = await fetch(`${config.API_URL}/employees/contractors`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        // ✅ FIXED: Ensure we're extracting contractor names properly
        const contractorNames = data.data.map(item => {
          // Handle different possible response formats
          if (typeof item === 'string') {
            return item
          } else if (item.contractorName) {
            return item.contractorName
          } else if (item.contractor) {
            return item.contractor
          } else if (item.name) {
            return item.name
          }
          return item
        }).filter(name => name && name.trim() !== '') // Remove empty names
        
        setContractors([...new Set(contractorNames)]) // Remove duplicates
      } else {
        console.warn('No contractors found or API returned empty data')
        setContractors([])
      }
    } else {
      console.error('Failed to fetch contractors:', response.status)
      setContractors([])
    }
  } catch (error) {
    console.error('Error fetching contractors:', error)
    setContractors([])
  } finally {
    setLoadingContractors(false)
  }
}


  // ✅ Enhanced validation for different employee types
  const validateFormData = () => {
    // Basic validation for all employee types
    if (!formData.employeeName.trim()) {
      alert('Please enter employee name')
      return false
    }

    if (!formData.employeeType.trim()) {
      alert('Please select employee type')
      return false
    }

    if (!formData.salary || formData.salary <= 0) {
      alert('Please enter a valid salary')
      return false
    }

    if (!formData.contactNo || formData.contactNo.trim().length < 10) {
      alert('Please enter a valid contact number (minimum 10 digits)')
      return false
    }

    if (!formData.paymentType) {
      alert('Please select payment type')
      return false
    }

    // ✅ NEW: Contract employee validation
    if (formData.employeeType === 'Contract') {
      if (!formData.contractorName.trim()) {
        alert('Please select or enter contractor name for Contract employees')
        return false
      }
    }

    // ✅ Extended validation for non-Contract employees
    if (!isContractEmployee(formData.employeeType)) {
      if (!formData.emailAddress || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.emailAddress)) {
        alert('Please enter a valid email address for non-contract employees')
        return false
      }

      if (!formData.adhaarNumber || !/^\d{4}-?\d{4}-?\d{4}$/.test(formData.adhaarNumber)) {
        alert('Please enter a valid Adhaar number (XXXX-XXXX-XXXX format) for non-contract employees')
        return false
      }

      if (!formData.bloodGroup) {
        alert('Please select blood group for non-contract employees')
        return false
      }

      if (!formData.gender) {
        alert('Please select gender for non-contract employees')
        return false
      }

      if (!formData.selectDepartment) {
        alert('Please select department for non-contract employees')
        return false
      }

      if (!formData.selectDesignation) {
        alert('Please select designation for non-contract employees')
        return false
      }
    }

    return true
  }

  // ✅ UPDATED: Fetch employees from backend API with contractor filtering
  const fetchEmployees = async (pg = 1, srch = '', empType = 'All', dept = 'All', payment = 'All', contractor = 'All') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pg,
        limit,
        ...(srch && { search: srch }),
        ...(empType !== 'All' && { filterType: empType }),
        ...(dept !== 'All' && { department: dept }),
        ...(payment !== 'All' && { paymentType: payment }),
        ...(contractor !== 'All' && { contractorName: contractor }) // ✅ NEW
      })

      const response = await fetch(`${config.API_URL}/employees?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch employees')
      }

      const data = await response.json()
      
      // Map backend data to frontend format
      const formattedEmployees = data.employees.map((employee, index) => ({
        id: employee._id,
        _id: employee._id,
        sl: ((pg - 1) * limit) + index + 1,
        employeeType: employee.employeeType,
        contractorName: employee.contractorName, // ✅ NEW
        employeeName: employee.employeeName,
        salary: employee.salary,
        updatedSalary: employee.updatedSalary || 0,
        contactNo: employee.contactNo,
        alternateMobile: employee.alternateMobile,
        joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }) : '',
        targetAmount: employee.targetAmount || 0,
        commissionPercent: employee.commissionPercent || 0,
        department: employee.selectDepartment,
        designation: employee.selectDesignation,
        selectDepartment: employee.selectDepartment,
        selectDesignation: employee.selectDesignation,
        bankAccNumber: employee.bankAccNumber,
        bankAccName: employee.bankAccName,
        bankBranch: employee.bankBranch,
        ifscCode: employee.ifscCode,
        zipCode: employee.zipCode,
        presentAddress: employee.presentAddress,
        permanentAddress: employee.permanentAddress,
        emailAddress: employee.emailAddress,
        adhaarNumber: employee.adhaarNumber,
        bloodGroup: employee.bloodGroup,
        fatherName: employee.fatherName,
        motherName: employee.motherName,
        leaveDays: employee.leaveDays || 0,
        gender: employee.gender,
        genderType: employee.gender,
        maritalStatus: employee.maritalStatus,
        maritalType: employee.maritalStatus,
        salaryUpdateYear: employee.salaryUpdateYear,
        salaryUpdateMonth: employee.salaryUpdateMonth,
        pf: employee.pf || 0,
        esi: employee.esi || 0,
        wc: employee.wc || 0,
        paymentType: employee.paymentType,
        employeePicture: employee.employeePicture,
        bankDocument: employee.bankDocument,
        adhaarCardImage: employee.adhaarCardImage,
        employeeCode: employee.employeeCode,
        isActive: employee.isActive,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        // Store raw date for editing
        rawJoiningDate: employee.joiningDate
      }))

      setEmployeeList(formattedEmployees)
      setFilteredEmployees(formattedEmployees)
      setTotal(data.total)
      setPage(data.page)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching employees:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ NEW: Initialize dropdowns and employees on component mount
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        fetchDepartments(),
        fetchDesignations(),
        fetchContractors(), // ✅ NEW
        fetchEmployees()
      ])
    }
    
    initializeData()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // ✅ Updated file upload handler
  const handleFileUpload = (field, file) => {
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }))

      const previewUrl = URL.createObjectURL(file)
      setFilePreviews(prev => ({
        ...prev,
        [field]: previewUrl
      }))
    }
  }

  // ✅ Enhanced save function with validation and contractor support
  const handleSave = async () => {
    if (!validateFormData()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()

      // ✅ Add fields based on employee type
      if (isContractEmployee(formData.employeeType)) {
        // Only basic fields for Contract employees + contractor name
        const contractFields = ['employeeType', 'contractorName', 'employeeName', 'contactNo', 'salary', 'paymentType', 'joiningDate']
        contractFields.forEach(field => {
          if (formData[field] !== null && formData[field] !== '') {
            formDataToSend.append(field, formData[field])
          }
        })
      } else {
        // All fields for other employee types
        Object.keys(formData).forEach(key => {
          if (key !== 'employeePicture' && key !== 'adhaarCardImage' && key !== 'bankDocument' && key !== 'contractorName') {
            if (formData[key] !== null && formData[key] !== '') {
              formDataToSend.append(key, formData[key])
            }
          }
        })
      }

      // Add file fields (not required for Contract employees)
      if (!isContractEmployee(formData.employeeType)) {
        if (formData.employeePicture && formData.employeePicture instanceof File) {
          formDataToSend.append('employeePicture', formData.employeePicture)
        }
        
        if (formData.adhaarCardImage && formData.adhaarCardImage instanceof File) {
          formDataToSend.append('adhaarCardImage', formData.adhaarCardImage)
        }
        
        if (formData.bankDocument && formData.bankDocument instanceof File) {
          formDataToSend.append('bankDocument', formData.bankDocument)
        }
      }

      const response = await fetch(`${config.API_URL}/employees`, {
        method: 'POST',
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save employee')
      }

      await fetchEmployees(page, searchTerm, filterType, departmentFilter, paymentTypeFilter, contractorFilter)

      // Reset form
      setFormData({
        employeeType: '',
        contractorName: '', // ✅ NEW
        employeeName: '',
        salary: '',
        salaryUpdateYear: '2025',
        salaryUpdateMonth: 'September',
        updatedSalary: '',
        bankAccNumber: '',
        bankAccName: '',
        bankBranch: '',
        ifscCode: '',
        zipCode: '',
        presentAddress: '',
        permanentAddress: '',
        contactNo: '',
        alternateMobile: '',
        emailAddress: '',
        adhaarNumber: '',
        bloodGroup: '',
        fatherName: '',
        motherName: '',
        joiningDate: '2025-09-13',
        selectDepartment: '',
        selectDesignation: '',
        leaveDays: '0',
        targetAmount: '',
        commissionPercent: '',
        gender: '',
        maritalStatus: '',
        pf: '',
        esi: '',
        wc: '',
        paymentType: '',
        employeePicture: null,
        bankDocument: null,
        adhaarCardImage: null
      })

      Object.values(filePreviews).forEach(url => {
        if (url) URL.revokeObjectURL(url)
      })
      setFilePreviews({
        employeePicture: null,
        adhaarCardImage: null,
        bankDocument: null
      })

      alert('Employee saved successfully!')
    } catch (err) {
      setError(err.message)
      alert(`Error saving employee: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ✅ UPDATED: Search functionality with contractor support
  const handleSearch = () => {
    fetchEmployees(1, searchTerm, filterType, departmentFilter, paymentTypeFilter, contractorFilter)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setShowSearch(false)
    fetchEmployees(1, '', filterType, departmentFilter, paymentTypeFilter, contractorFilter)
  }

  // ✅ UPDATED: Filter handlers with contractor support
  const handleFilterChange = (newFilterType) => {
    setFilterType(newFilterType)
    // Reset contractor filter when changing employee type
    const newContractorFilter = newFilterType === 'Contract' ? contractorFilter : 'All'
    setContractorFilter(newContractorFilter)
    fetchEmployees(1, searchTerm, newFilterType, departmentFilter, paymentTypeFilter, newContractorFilter)
  }

  const handleDepartmentFilterChange = (newDept) => {
    setDepartmentFilter(newDept)
    fetchEmployees(1, searchTerm, filterType, newDept, paymentTypeFilter, contractorFilter)
  }

  const handlePaymentFilterChange = (newPayment) => {
    setPaymentTypeFilter(newPayment)
    fetchEmployees(1, searchTerm, filterType, departmentFilter, newPayment, contractorFilter)
  }

  // ✅ NEW: Contractor filter handler
  const handleContractorFilterChange = (newContractor) => {
    setContractorFilter(newContractor)
    fetchEmployees(1, searchTerm, filterType, departmentFilter, paymentTypeFilter, newContractor)
  }

  // Delete employee (soft delete via backend)
  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${config.API_URL}/employees/${employeeId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete employee')
      }

      await fetchEmployees(page, searchTerm, filterType, departmentFilter, paymentTypeFilter, contractorFilter)
      alert('Employee deleted successfully!')
    } catch (err) {
      setError(err.message)
      alert(`Error deleting employee: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // ✅ UPDATED: Edit employee with contractor support
  const handleEditEmployee = (employee) => {
    const editData = {
      ...employee,
      gender: employee.gender || employee.genderType,
      maritalStatus: employee.maritalStatus || employee.maritalType,
      joiningDate: (() => {
        if (!employee.rawJoiningDate && !employee.joiningDate) return '';
        const dateToFormat = employee.rawJoiningDate || employee.joiningDate;
        const date = new Date(dateToFormat);
        return isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
      })()
    }
    setEditingEmployee(editData)
    setShowEditModal(true)
  }

  // Update function to use FormData
  const handleUpdateEmployee = async () => {
    if (!editingEmployee.employeeName.trim()) {
      alert('Please enter employee name')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()

      // Add all fields except files and frontend-only fields
      Object.keys(editingEmployee).forEach(key => {
        if (!['id', 'sl', 'department', 'designation', 'genderType', 'maritalType', 'employeePicture', 'adhaarCardImage', 'bankDocument', 'rawJoiningDate'].includes(key)) {
          if (editingEmployee[key] !== null && editingEmployee[key] !== '') {
            formDataToSend.append(key, editingEmployee[key])
          }
        }
      })

      const response = await fetch(`${config.API_URL}/employees/${editingEmployee._id}`, {
        method: 'PUT',
        body: formDataToSend
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update employee')
      }

      await fetchEmployees(page, searchTerm, filterType, departmentFilter, paymentTypeFilter, contractorFilter)
      
      setShowEditModal(false)
      setEditingEmployee(null)
      alert('Employee updated successfully!')
    } catch (err) {
      setError(err.message)
      alert(`Error updating employee: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // View employee
  const handleViewEmployee = (employee) => {
    console.log('Viewing employee:', employee) // Debug log
    setViewingEmployee(employee)
    setShowViewModal(true)
  }

  // ✅ UPDATED: Pagination handlers with contractor support
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(total / limit)) {
      fetchEmployees(newPage, searchTerm, filterType, departmentFilter, paymentTypeFilter, contractorFilter)
    }
  }

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Employee List Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            .report-title { font-size: 18px; margin-bottom: 20px; }
            .filters { margin-bottom: 20px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .text-center { text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Fayullah Factory</div>
            <div class="report-title">Employee List Report</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
          </div>
          
          <div class="filters">
            <p><strong>Applied Filters:</strong></p>
            <ul>
              <li>Employee Type: ${filterType}</li>
              <li>Department: ${departmentFilter}</li>
              <li>Payment Type: ${paymentTypeFilter}</li>
              ${contractorFilter !== 'All' ? `<li>Contractor: ${contractorFilter}</li>` : ''}
              ${searchTerm ? `<li>Search: "${searchTerm}"</li>` : ''}
            </ul>
            <p><strong>Total Employees:</strong> ${total}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Employee Code</th>
                <th>Type</th>
                ${filterType === 'Contract' ? '<th>Contractor</th>' : ''}
                <th>Employee Name</th>
                <th>Salary</th>
                <th>Contact No</th>
                <th>Joining Date</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Blood Group</th>
                <th>Payment Type</th>
                <th>Adhaar Number</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEmployees.map(emp => `
                <tr>
                  <td>${emp.sl}</td>
                  <td>${emp.employeeCode || 'N/A'}</td>
                  <td>${emp.employeeType || ''}</td>
                  ${filterType === 'Contract' ? `<td>${emp.contractorName || 'N/A'}</td>` : ''}
                  <td>${emp.employeeName}</td>
                  <td>₹${emp.salary}</td>
                  <td>${emp.contactNo || 'N/A'}</td>
                  <td>${emp.joiningDate}</td>
                  <td>${emp.department || 'N/A'}</td>
                  <td>${emp.designation || 'N/A'}</td>
                  <td>${emp.bloodGroup || 'N/A'}</td>
                  <td>${emp.paymentType || 'N/A'}</td>
                  <td>${emp.adhaarNumber || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    const printWindow = window.open('', '_blank')
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const handleExport = () => {
    const csvHeaders = ['SL', 'Employee Code', 'Type']
    if (filterType === 'Contract') csvHeaders.push('Contractor')
    csvHeaders.push('Employee Name', 'Salary', 'Contact No', 'Alternate Mobile', 'Joining Date', 'Department', 'Designation', 'Blood Group', 'Payment Type', 'Adhaar Number', 'Email', 'Father Name', 'Mother Name')

    const csvContent = [
      csvHeaders,
      ...filteredEmployees.map(emp => {
        const row = [
          emp.sl,
          emp.employeeCode || '',
          emp.employeeType || ''
        ]
        if (filterType === 'Contract') row.push(emp.contractorName || '')
        row.push(
          emp.employeeName,
          emp.salary,
          emp.contactNo || '',
          emp.alternateMobile || '',
          emp.joiningDate,
          emp.department || '',
          emp.designation || '',
          emp.bloodGroup || '',
          emp.paymentType || '',
          emp.adhaarNumber || '',
          emp.emailAddress || '',
          emp.fatherName || '',
          emp.motherName || ''
        )
        return row
      })
    ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `employee_list_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // ✅ ENHANCED PRINT EMPLOYEE FUNCTION WITH CONTRACTOR INFO
  const handlePrintEmployee = () => {
    if (!viewingEmployee) return
    
    // Get image URLs with proper validation
    const employeePhotoUrl = hasValidImage(viewingEmployee.employeePicture) ? getImageUrl(viewingEmployee.employeePicture) : null
    const adhaarCardUrl = hasValidImage(viewingEmployee.adhaarCardImage) ? getImageUrl(viewingEmployee.adhaarCardImage) : null
    const bankDocumentUrl = hasValidImage(viewingEmployee.bankDocument) ? getImageUrl(viewingEmployee.bankDocument) : null
    
    const printContent = `
      <html>
        <head>
          <title>Employee Details - ${viewingEmployee.employeeName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #0f766e; padding-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            .employee-name { font-size: 20px; margin-bottom: 10px; }
            .section { margin-bottom: 25px; page-break-inside: avoid; }
            .section-title { font-size: 18px; font-weight: bold; color: #0f766e; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 15px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px; }
            .info-item { margin-bottom: 8px; }
            .label { font-weight: bold; color: #555; }
            .value { margin-left: 10px; }
            .employee-photo { text-align: center; margin: 20px 0; page-break-inside: avoid; }
            .employee-photo img { max-width: 200px; max-height: 250px; border: 2px solid #ddd; border-radius: 8px; }
            .document-image { text-align: center; margin: 15px 0; page-break-inside: avoid; }
            .document-image img { max-width: 300px; max-height: 200px; border: 1px solid #ccc; border-radius: 4px; }
            .document-title { font-weight: bold; margin-bottom: 10px; color: #0f766e; }
            .images-section { page-break-before: always; }
            @media print { 
              body { margin: 0; }
              .page-break { page-break-before: always; }
              img { max-width: 100% !important; height: auto !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Fayullah Factory</div>
            <div class="employee-name">Employee Details Report</div>
            <div>Employee Code: ${viewingEmployee.employeeCode || 'N/A'}</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
          </div>
          
          ${employeePhotoUrl ? `
            <div class="employee-photo">
              <div class="document-title">Employee Photo</div>
              <img src="${employeePhotoUrl}" alt="Employee Photo" onerror="this.style.display='none';" />
            </div>
          ` : ''}
          
          <div class="section">
            <div class="section-title">Basic Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Employee Type:</span><span class="value">${viewingEmployee.employeeType || 'N/A'}</span></div>
              ${viewingEmployee.employeeType === 'Contract' ? `<div class="info-item"><span class="label">Contractor:</span><span class="value">${viewingEmployee.contractorName || 'N/A'}</span></div>` : ''}
              <div class="info-item"><span class="label">Name:</span><span class="value">${viewingEmployee.employeeName}</span></div>
              <div class="info-item"><span class="label">Primary Contact:</span><span class="value">${viewingEmployee.contactNo || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Alternate Mobile:</span><span class="value">${viewingEmployee.alternateMobile || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Email:</span><span class="value">${viewingEmployee.emailAddress || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Joining Date:</span><span class="value">${viewingEmployee.joiningDate}</span></div>
              <div class="info-item"><span class="label">Gender:</span><span class="value">${viewingEmployee.gender || viewingEmployee.genderType || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Blood Group:</span><span class="value">${viewingEmployee.bloodGroup || 'N/A'}</span></div>
            </div>
          </div>
          
          ${!isContractEmployee(viewingEmployee.employeeType) ? `
          <div class="section">
            <div class="section-title">Work Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Department:</span><span class="value">${viewingEmployee.department || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Designation:</span><span class="value">${viewingEmployee.designation || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Salary:</span><span class="value">₹${viewingEmployee.salary}</span></div>
              <div class="info-item"><span class="label">Updated Salary:</span><span class="value">${viewingEmployee.updatedSalary === 0 || viewingEmployee.updatedSalary === '0' ? 'N/A' : `₹${viewingEmployee.updatedSalary}`}</span></div>
              <div class="info-item"><span class="label">PF:</span><span class="value">₹${viewingEmployee.pf || '0'}</span></div>
              <div class="info-item"><span class="label">ESI:</span><span class="value">₹${viewingEmployee.esi || '0'}</span></div>
              <div class="info-item"><span class="label">WC:</span><span class="value">₹${viewingEmployee.wc || '0'}</span></div>
              <div class="info-item"><span class="label">Target Amount:</span><span class="value">${viewingEmployee.targetAmount === 0 || viewingEmployee.targetAmount === '0' ? 'N/A' : `₹${viewingEmployee.targetAmount}`}</span></div>
              <div class="info-item"><span class="label">Commission:</span><span class="value">${viewingEmployee.commissionPercent === 0 || viewingEmployee.commissionPercent === '0' ? 'N/A' : `${viewingEmployee.commissionPercent}%`}</span></div>
              <div class="info-item"><span class="label">Payment Type:</span><span class="value">${viewingEmployee.paymentType || 'N/A'}</span></div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Personal Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Father's Name:</span><span class="value">${viewingEmployee.fatherName || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Mother's Name:</span><span class="value">${viewingEmployee.motherName || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Adhaar Number:</span><span class="value">${viewingEmployee.adhaarNumber || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Marital Status:</span><span class="value">${viewingEmployee.maritalStatus || viewingEmployee.maritalType || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Present Address:</span><span class="value">${viewingEmployee.presentAddress || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Permanent Address:</span><span class="value">${viewingEmployee.permanentAddress || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Zip Code:</span><span class="value">${viewingEmployee.zipCode || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Leave Days:</span><span class="value">${viewingEmployee.leaveDays || '0'}</span></div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Bank Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Account Number:</span><span class="value">${viewingEmployee.bankAccNumber || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Account Name:</span><span class="value">${viewingEmployee.bankAccName || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Bank Branch:</span><span class="value">${viewingEmployee.bankBranch || 'N/A'}</span></div>
              <div class="info-item"><span class="label">IFSC Code:</span><span class="value">${viewingEmployee.ifscCode || 'N/A'}</span></div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">Salary Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Salary Update Year:</span><span class="value">${viewingEmployee.salaryUpdateYear || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Salary Update Month:</span><span class="value">${viewingEmployee.salaryUpdateMonth || 'N/A'}</span></div>
            </div>
          </div>
          ` : `
          <div class="section">
            <div class="section-title">Contract Information</div>
            <div class="info-grid">
              <div class="info-item"><span class="label">Contractor Name:</span><span class="value">${viewingEmployee.contractorName || 'N/A'}</span></div>
              <div class="info-item"><span class="label">Salary:</span><span class="value">₹${viewingEmployee.salary}</span></div>
              <div class="info-item"><span class="label">Payment Type:</span><span class="value">${viewingEmployee.paymentType || 'N/A'}</span></div>
            </div>
          </div>
          `}

          ${adhaarCardUrl || bankDocumentUrl ? `
            <div class="images-section page-break">
              <div class="section-title">Document Images</div>
              
              ${adhaarCardUrl ? `
                <div class="document-image">
                  <div class="document-title">Adhaar Card</div>
                  <img src="${adhaarCardUrl}" alt="Adhaar Card" onerror="this.style.display='none';" />
                </div>
              ` : ''}
              
              ${bankDocumentUrl ? `
                <div class="document-image">
                  <div class="document-title">Bank Document</div>
                  <img src="${bankDocumentUrl}" alt="Bank Document" onerror="this.style.display='none';" />
                </div>
              ` : ''}
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

  // ✅ Enhanced employee statistics with contractor info
  const getEmployeeStats = () => {
    const stats = {
      total: total,
      permanent: filteredEmployees.filter(emp => emp.employeeType === 'Permanent Employee').length,
      subContract: filteredEmployees.filter(emp => emp.employeeType === 'Sub Contract').length,
      contract: filteredEmployees.filter(emp => emp.employeeType === 'Contract').length,
      temporary: filteredEmployees.filter(emp => emp.employeeType === 'Temporary').length,
      totalSalary: filteredEmployees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0),
      avgSalary: filteredEmployees.length > 0 ? 
        (filteredEmployees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0) / filteredEmployees.length).toFixed(0) : 0
    }
    return stats
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Employee Entry Form */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">Employee Entry</h2>
          <div className="text-right">
            <div className="text-sm font-semibold">Fayullah Factory</div>
            <div className="text-xs opacity-90">Employee Management System</div>
          </div>
        </div>
        
        <div className="p-6">
          {/* ✅ EMPLOYEE TYPE SELECTION WITH CONDITIONAL RENDERING */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Employee Type *</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.employeeType}
                  onChange={(e) => handleInputChange('employeeType', e.target.value)}
                  required
                >
                  <option value="">Select Employee Type</option>
                  <option value="Permanent Employee">Permanent Employee</option>
                  <option value="Sub Contract">Sub Contract</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                </select>
              </div>

              {/* ✅ NEW: Contractor Selection - Only for Contract employees */}
              {formData.employeeType === 'Contract' && (
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Contractor Name *</label>
                  <div className="relative">
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.contractorName}
                      onChange={(e) => handleInputChange('contractorName', e.target.value)}
                      required
                      disabled={loadingContractors}
                    >
                      <option value="">Select/Enter Contractor</option>
                      {contractors.map((contractor, index) => (
                        <option key={index} value={contractor}>
                          {contractor}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Allow custom contractor name */}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="Or enter new contractor name"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.contractorName}
                      onChange={(e) => handleInputChange('contractorName', e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Select from existing contractors or enter a new contractor name
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs text-gray-600 mb-1">Employee Name *</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.employeeName}
                  onChange={(e) => handleInputChange('employeeName', e.target.value)}
                  placeholder="Enter employee name"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Contact Number *</label>
                <input 
                  type="tel"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.contactNo}
                  onChange={(e) => handleInputChange('contactNo', e.target.value)}
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Salary *</label>
                <input 
                  type="number"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.salary}
                  onChange={(e) => handleInputChange('salary', e.target.value)}
                  placeholder="Enter salary amount"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Payment Type *</label>
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.paymentType}
                  onChange={(e) => handleInputChange('paymentType', e.target.value)}
                  required
                >
                  <option value="">Select Payment Type</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Joining Date *</label>
                <input 
                  type="date"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.joiningDate}
                  onChange={(e) => handleInputChange('joiningDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* ✅ CONTRACT EMPLOYEE NOTIFICATION */}
          {isContractEmployee(formData.employeeType) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="text-blue-600 text-lg mr-3">ℹ️</div>
                <div>
                  <h4 className="text-blue-800 font-semibold">Contract Employee - Simplified Entry</h4>
                  <p className="text-blue-700 text-sm">
                    Only basic details are required for Contract employees. Extended information 
                    like bank details, addresses, and documents are optional.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ CONDITIONAL RENDERING: Extended fields only for non-Contract employees */}
          {formData.employeeType && !isContractEmployee(formData.employeeType) && (
            <>
              {/* Personal Details Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Personal Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Alternate Mobile Number</label>
                    <input 
                      type="tel"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.alternateMobile}
                      onChange={(e) => handleInputChange('alternateMobile', e.target.value)}
                      placeholder="Enter alternate mobile"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email Address *</label>
                    <input 
                      type="email"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.emailAddress}
                      onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Adhaar Number *</label>
                    <input 
                      type="text"
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.adhaarNumber}
                      onChange={(e) => handleInputChange('adhaarNumber', e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Blood Group *</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.bloodGroup}
                      onChange={(e) => handleInputChange('bloodGroup', e.target.value)}
                      required
                    >
                      <option value="">Select Blood Group</option>
                      {bloodGroups.map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Father's Name</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.fatherName}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      placeholder="Enter father's name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Mother's Name</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.motherName}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      placeholder="Enter mother's name"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-xs text-gray-600 mb-1">Gender Type *</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="gender"
                          value="Male"
                          checked={formData.gender === 'Male'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2"
                          required
                        />
                        Male
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="gender"
                          value="Female"
                          checked={formData.gender === 'Female'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2"
                        />
                        Female
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="gender"
                          value="Others"
                          checked={formData.gender === 'Others'}
                          onChange={(e) => handleInputChange('gender', e.target.value)}
                          className="mr-2"
                        />
                        Others
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="block text-xs text-gray-600 mb-1">Marital Status</label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="Single"
                          checked={formData.maritalStatus === 'Single'}
                          onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                          className="mr-2"
                        />
                        Single
                      </label>
                      <label className="flex items-center text-sm">
                        <input
                          type="radio"
                          name="maritalStatus"
                          value="Married"
                          checked={formData.maritalStatus === 'Married'}
                          onChange={(e) => handleInputChange('maritalStatus', e.target.value)}
                          className="mr-2"
                        />
                        Married
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Zip Code</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      placeholder="Enter zip code"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Present Address</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.presentAddress}
                      onChange={(e) => handleInputChange('presentAddress', e.target.value)}
                      placeholder="Enter present address"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Permanent Address</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.permanentAddress}
                      onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                      placeholder="Enter permanent address"
                    />
                  </div>
                </div>

                {/* Photo and Document Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Employee Picture</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('employeePicture', e.target.files[0])}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    {filePreviews.employeePicture && (
                      <div className="mt-2">
                        <img 
                          src={filePreviews.employeePicture} 
                          alt="Employee Preview" 
                          className="w-20 h-24 object-cover border rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Adhaar Card Picture</label>
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('adhaarCardImage', e.target.files[0])}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    {filePreviews.adhaarCardImage && (
                      <div className="mt-2">
                        <img 
                          src={filePreviews.adhaarCardImage} 
                          alt="Adhaar Card Preview" 
                          className="w-20 h-12 object-cover border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Details Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Work Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Salary Update Year</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.salaryUpdateYear}
                      onChange={(e) => handleInputChange('salaryUpdateYear', e.target.value)}
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Salary Update Month</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.salaryUpdateMonth}
                      onChange={(e) => handleInputChange('salaryUpdateMonth', e.target.value)}
                    >
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Updated Salary</label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.updatedSalary}
                      onChange={(e) => handleInputChange('updatedSalary', e.target.value)}
                      placeholder="Enter updated salary"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Leave Days</label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.leaveDays}
                      onChange={(e) => handleInputChange('leaveDays', e.target.value)}
                      placeholder="Enter leave days"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* ✅ DYNAMIC DEPARTMENT DROPDOWN */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Select Department * 
                      {loadingDropdowns && <span className="text-xs text-gray-400 ml-1">(Loading...)</span>}
                    </label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.selectDepartment}
                      onChange={(e) => handleInputChange('selectDepartment', e.target.value)}
                      required
                      disabled={loadingDropdowns}
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept.departmentName}>
                          {dept.departmentName}
                        </option>
                      ))}
                    </select>
                    {departments.length === 0 && !loadingDropdowns && (
                      <p className="text-xs text-red-500 mt-1">No departments found. Please add departments first.</p>
                    )}
                  </div>

                  {/* ✅ DYNAMIC DESIGNATION DROPDOWN */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Select Designation *</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.selectDesignation}
                      onChange={(e) => handleInputChange('selectDesignation', e.target.value)}
                      required
                    >
                      <option value="">Select Designation</option>
                      {designations.map((designation) => (
                        <option key={designation._id} value={designation.designationName}>
                          {designation.designationName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Target Amount</label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.targetAmount}
                      onChange={(e) => handleInputChange('targetAmount', e.target.value)}
                      placeholder="Enter target amount"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Commission %</label>
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.commissionPercent}
                      onChange={(e) => handleInputChange('commissionPercent', e.target.value)}
                      placeholder="Enter commission %"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                {/* PF, ESI, WC Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">PF (Provident Fund)</label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.pf}
                      onChange={(e) => handleInputChange('pf', e.target.value)}
                      placeholder="Enter PF amount"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">ESI (Employee State Insurance)</label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.esi}
                      onChange={(e) => handleInputChange('esi', e.target.value)}
                      placeholder="Enter ESI amount"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">WC (Workmen's Compensation)</label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.wc}
                      onChange={(e) => handleInputChange('wc', e.target.value)}
                      placeholder="Enter WC amount"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Bank Details Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Bank Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bank Account Number</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.bankAccNumber}
                      onChange={(e) => handleInputChange('bankAccNumber', e.target.value)}
                      placeholder="Enter account number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bank Account Name</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.bankAccName}
                      onChange={(e) => handleInputChange('bankAccName', e.target.value)}
                      placeholder="Enter account name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bank Branch</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.bankBranch}
                      onChange={(e) => handleInputChange('bankBranch', e.target.value)}
                      placeholder="Enter bank branch"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">IFSC Code</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={formData.ifscCode}
                      onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>

                {/* Bank Document Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Bank Passbook / Cancelled Check</label>
                    <input 
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload('bankDocument', e.target.files[0])}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                    {filePreviews.bankDocument && (
                      <div className="mt-2">
                        <img 
                          src={filePreviews.bankDocument} 
                          alt="Bank Document Preview" 
                          className="w-20 h-16 object-cover border rounded"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className="flex justify-end space-x-3">
            <button 
              onClick={() => {
                setFormData({
                  employeeType: '',
                  contractorName: '', // ✅ NEW
                  employeeName: '',
                  salary: '',
                  salaryUpdateYear: '2025',
                  salaryUpdateMonth: 'September',
                  updatedSalary: '',
                  bankAccNumber: '',
                  bankAccName: '',
                  bankBranch: '',
                  ifscCode: '',
                  zipCode: '',
                  presentAddress: '',
                  permanentAddress: '',
                  contactNo: '',
                  alternateMobile: '',
                  emailAddress: '',
                  adhaarNumber: '',
                  bloodGroup: '',
                  fatherName: '',
                  motherName: '',
                  joiningDate: '2025-09-13',
                  selectDepartment: '',
                  selectDesignation: '',
                  leaveDays: '0',
                  targetAmount: '',
                  commissionPercent: '',
                  gender: '',
                  maritalStatus: '',
                  pf: '',
                  esi: '',
                  wc: '',
                  paymentType: '',
                  employeePicture: null,
                  bankDocument: null,
                  adhaarCardImage: null
                })
                Object.values(filePreviews).forEach(url => {
                  if (url) URL.revokeObjectURL(url)
                })
                setFilePreviews({
                  employeePicture: null,
                  adhaarCardImage: null,
                  bankDocument: null
                })
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded text-sm hover:bg-gray-600 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              🔄 RESET
            </button>
            <button 
              onClick={handleSave}
              className="bg-cyan-500 text-white px-6 py-2 rounded text-sm hover:bg-cyan-600 transition-colors flex items-center gap-2"
              disabled={loading}
            >
              {loading ? '⏳ SAVING...' : '💾 SAVE'}
            </button>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          {/* Header and Controls */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-medium">Employee List</h3>
              {/* ✅ Enhanced Employee Statistics */}
              <div className="text-sm text-gray-600 mt-1">
                {(() => {
                  const stats = getEmployeeStats()
                  return (
                    <span>
                      Total: {stats.total} | Permanent: {stats.permanent} | Sub Contract: {stats.subContract} | 
                      Contract: {stats.contract} | Temporary: {stats.temporary} | Avg Salary: ₹{stats.avgSalary}
                    </span>
                  )
                })()}
              </div>
            </div>
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
                disabled={loading || filteredEmployees.length === 0}
              >
                📤
              </button>
              {/* <button 
                onClick={handlePrint}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Print"
                disabled={loading || filteredEmployees.length === 0}
              >
                🖨️
              </button> */}
              <button 
                onClick={() => fetchEmployees(page, searchTerm, filterType, departmentFilter, paymentTypeFilter, contractorFilter)}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Refresh"
                disabled={loading}
              >
                {loading ? '⏳' : '🔄'}
              </button>
            </div>
          </div>

          {/* ✅ Enhanced Filters with Contractor Filter */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Employee Type</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Permanent Employee">Permanent Employee</option>
                <option value="Sub Contract">Sub Contract</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>

            {/* ✅ NEW: Contractor Filter - Only show when Contract type is selected */}
            {filterType === 'Contract' && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Contractor</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={contractorFilter}
                  onChange={(e) => handleContractorFilterChange(e.target.value)}
                >
                  <option value="All">All Contractors</option>
                  {contractors.map((contractor, index) => (
                    <option key={index} value={contractor}>
                      {contractor}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-600 mb-1">Department</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={departmentFilter}
                onChange={(e) => handleDepartmentFilterChange(e.target.value)}
              >
                <option value="All">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.departmentName}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Payment Type</label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={paymentTypeFilter}
                onChange={(e) => handlePaymentFilterChange(e.target.value)}
              >
                <option value="All">All Payment Types</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by employee name, code, contact, email, or contractor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button 
                onClick={handleSearch}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
                disabled={loading}
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

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-gray-600">Loading employees...</p>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">SL</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Code</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Type</th>
                    {filterType === 'Contract' && (
                      <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Contractor</th>
                    )}
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Employee Name</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Salary</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Contact No</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Joining Date</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Department</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Designation</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Blood Group</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Payment Type</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={filterType === 'Contract' ? "13" : "12"} className="text-center py-8 text-gray-500">
                        {searchTerm || filterType !== 'All' || departmentFilter !== 'All' || paymentTypeFilter !== 'All' || contractorFilter !== 'All'
                          ? 'No employees found matching the current filters.' 
                          : 'No employees found. Add your first employee using the form above.'}
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr key={employee.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-2 text-sm">{employee.sl}</td>
                        <td className="py-3 px-2 text-sm font-mono text-xs">{employee.employeeCode || 'N/A'}</td>
                        <td className="py-3 px-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            employee.employeeType === 'Permanent Employee' 
                              ? 'bg-green-100 text-green-800' 
                              : employee.employeeType === 'Contract'
                              ? 'bg-orange-100 text-orange-800'
                              : employee.employeeType === 'Temporary'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {employee.employeeType}
                          </span>
                        </td>
                        {filterType === 'Contract' && (
                          <td className="py-3 px-2 text-sm">
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              {employee.contractorName || 'N/A'}
                            </span>
                          </td>
                        )}
                        <td className="py-3 px-2 text-sm font-medium text-teal-600">{employee.employeeName}</td>
                        <td className="py-3 px-2 text-sm">₹{Number(employee.salary).toLocaleString('en-IN')}</td>
                        <td className="py-3 px-2 text-sm">{employee.contactNo || '-'}</td>
                        <td className="py-3 px-2 text-sm">{employee.joiningDate}</td>
                        <td className="py-3 px-2 text-sm">{employee.department || '-'}</td>
                        <td className="py-3 px-2 text-sm">{employee.designation || '-'}</td>
                        <td className="py-3 px-2 text-sm">
                          {employee.bloodGroup && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                              {employee.bloodGroup}
                            </span>
                          ) || '-'}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            employee.paymentType === 'Daily' 
                              ? 'bg-orange-100 text-orange-800' 
                              : employee.paymentType === 'Weekly'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {employee.paymentType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm">
                          <div className="flex gap-1">
                            <button 
                              onClick={() => handleViewEmployee(employee)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Details"
                            >
                              👁️
                            </button>
                            <button 
                              onClick={() => handleEditEmployee(employee)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button 
                              onClick={() => handleDeleteEmployee(employee._id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && total > limit && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} employees
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1 || loading}
                  className="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm">
                  Page {page} of {Math.ceil(total / limit)}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(total / limit) || loading}
                  className="px-3 py-2 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Enhanced Edit Employee Modal with Contractor Support */}
      {showEditModal && editingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-y-auto m-4">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-medium">Edit Employee - {editingEmployee.employeeName}</h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {/* Basic Information Section */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Employee Type *</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={editingEmployee.employeeType || ''}
                      onChange={(e) => setEditingEmployee({...editingEmployee, employeeType: e.target.value})}
                    >
                      <option value="">Select Employee Type</option>
                      <option value="Permanent Employee">Permanent Employee</option>
                      <option value="Sub Contract">Sub Contract</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                    </select>
                  </div>

                  {/* ✅ NEW: Contractor field in edit modal */}
                  {editingEmployee.employeeType === 'Contract' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Contractor Name *</label>
                      <input 
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        value={editingEmployee.contractorName || ''}
                        onChange={(e) => setEditingEmployee({...editingEmployee, contractorName: e.target.value})}
                        placeholder="Enter contractor name"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Employee Name *</label>
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={editingEmployee.employeeName || ''}
                      onChange={(e) => setEditingEmployee({...editingEmployee, employeeName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Contact Number *</label>
                    <input 
                      type="tel"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={editingEmployee.contactNo || ''}
                      onChange={(e) => setEditingEmployee({...editingEmployee, contactNo: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Salary *</label>
                    <input 
                      type="number"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={editingEmployee.salary || ''}
                      onChange={(e) => setEditingEmployee({...editingEmployee, salary: e.target.value})}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Payment Type *</label>
                    <select 
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={editingEmployee.paymentType || ''}
                      onChange={(e) => setEditingEmployee({...editingEmployee, paymentType: e.target.value})}
                    >
                      <option value="">Select Payment Type</option>
                      <option value="Daily">Daily</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Joining Date *</label>
                    <input 
                      type="date"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                      value={editingEmployee.joiningDate || ''}
                      onChange={(e) => setEditingEmployee({...editingEmployee, joiningDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* ✅ CONTRACT EMPLOYEE NOTIFICATION FOR EDIT */}
              {isContractEmployee(editingEmployee.employeeType) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <div className="text-blue-600 text-lg mr-3">ℹ️</div>
                    <div>
                      <h4 className="text-blue-800 font-semibold">Contract Employee - Basic Information Only</h4>
                      <p className="text-blue-700 text-sm">
                        This is a Contract employee. Only basic information can be edited.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Extended fields only for non-Contract employees */}
              {editingEmployee.employeeType && !isContractEmployee(editingEmployee.employeeType) && (
                <>
                  {/* Personal Information Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Alternate Mobile</label>
                        <input 
                          type="tel"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.alternateMobile || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, alternateMobile: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Email Address</label>
                        <input 
                          type="email"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.emailAddress || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, emailAddress: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Adhaar Number</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.adhaarNumber || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, adhaarNumber: e.target.value})}
                          placeholder="XXXX-XXXX-XXXX"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Blood Group</label>
                        <select 
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.bloodGroup || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, bloodGroup: e.target.value})}
                        >
                          <option value="">Select Blood Group</option>
                          {bloodGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Father's Name</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.fatherName || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, fatherName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Mother's Name</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.motherName || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, motherName: e.target.value})}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="block text-xs text-gray-600 mb-1">Gender</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <label className="flex items-center text-sm">
                            <input
                              type="radio"
                              name="editGender"
                              value="Male"
                              checked={editingEmployee.gender === 'Male'}
                              onChange={(e) => setEditingEmployee({...editingEmployee, gender: e.target.value})}
                              className="mr-2"
                            />
                            Male
                          </label>
                          <label className="flex items-center text-sm">
                            <input
                              type="radio"
                              name="editGender"
                              value="Female"
                              checked={editingEmployee.gender === 'Female'}
                              onChange={(e) => setEditingEmployee({...editingEmployee, gender: e.target.value})}
                              className="mr-2"
                            />
                            Female
                          </label>
                          <label className="flex items-center text-sm">
                            <input
                              type="radio"
                              name="editGender"
                              value="Others"
                              checked={editingEmployee.gender === 'Others'}
                                                            onChange={(e) => setEditingEmployee({...editingEmployee, gender: e.target.value})}
                              className="mr-2"
                            />
                            Others
                          </label>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="block text-xs text-gray-600 mb-1">Marital Status</label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center text-sm">
                            <input
                              type="radio"
                              name="editMaritalStatus"
                              value="Single"
                              checked={editingEmployee.maritalStatus === 'Single'}
                              onChange={(e) => setEditingEmployee({...editingEmployee, maritalStatus: e.target.value})}
                              className="mr-2"
                            />
                            Single
                          </label>
                          <label className="flex items-center text-sm">
                            <input
                              type="radio"
                              name="editMaritalStatus"
                              value="Married"
                              checked={editingEmployee.maritalStatus === 'Married'}
                              onChange={(e) => setEditingEmployee({...editingEmployee, maritalStatus: e.target.value})}
                              className="mr-2"
                            />
                            Married
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Zip Code</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.zipCode || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, zipCode: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Present Address</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.presentAddress || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, presentAddress: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Permanent Address</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.permanentAddress || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, permanentAddress: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Details Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Work Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Updated Salary</label>
                        <input 
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.updatedSalary || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, updatedSalary: e.target.value})}
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Salary Update Year</label>
                        <select 
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.salaryUpdateYear || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, salaryUpdateYear: e.target.value})}
                        >
                          <option value="2025">2025</option>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                          <option value="2022">2022</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Salary Update Month</label>
                        <select 
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.salaryUpdateMonth || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, salaryUpdateMonth: e.target.value})}
                        >
                          <option value="January">January</option>
                          <option value="February">February</option>
                          <option value="March">March</option>
                          <option value="April">April</option>
                          <option value="May">May</option>
                          <option value="June">June</option>
                          <option value="July">July</option>
                          <option value="August">August</option>
                          <option value="September">September</option>
                          <option value="October">October</option>
                          <option value="November">November</option>
                          <option value="December">December</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Leave Days</label>
                        <input 
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.leaveDays || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, leaveDays: e.target.value})}
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Department</label>
                        <select 
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.selectDepartment || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, selectDepartment: e.target.value})}
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept._id} value={dept.departmentName}>
                              {dept.departmentName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Designation</label>
                        <select 
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.selectDesignation || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, selectDesignation: e.target.value})}
                        >
                          <option value="">Select Designation</option>
                          {designations.map((designation) => (
                            <option key={designation._id} value={designation.designationName}>
                              {designation.designationName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Target Amount</label>
                        <input 
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.targetAmount || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, targetAmount: e.target.value})}
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Commission %</label>
                        <input 
                          type="number"
                          step="0.01"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.commissionPercent || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, commissionPercent: e.target.value})}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">PF (Provident Fund)</label>
                        <input 
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.pf || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, pf: e.target.value})}
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">ESI (Employee State Insurance)</label>
                        <input 
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.esi || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, esi: e.target.value})}
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">WC (Workmen's Compensation)</label>
                        <input 
                          type="number"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.wc || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, wc: e.target.value})}
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Details Section */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Bank Details</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Bank Account Number</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.bankAccNumber || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, bankAccNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Bank Account Name</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.bankAccName || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, bankAccName: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Bank Branch</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.bankBranch || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, bankBranch: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">IFSC Code</label>
                        <input 
                          type="text"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          value={editingEmployee.ifscCode || ''}
                          onChange={(e) => setEditingEmployee({...editingEmployee, ifscCode: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                  disabled={loading}
                >
                  CANCEL
                </button>
                <button 
                  onClick={handleUpdateEmployee}
                  className="bg-cyan-500 text-white px-6 py-2 rounded text-sm hover:bg-cyan-600 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'UPDATING...' : 'UPDATE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Enhanced View Employee Modal with Contractor Support */}
      {showViewModal && viewingEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto m-4">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Employee Details</h3>
                <p className="text-sm opacity-90">{viewingEmployee.employeeCode || 'No Code'}</p>
              </div>
              <div className="flex gap-2">
                {/* <button 
                  onClick={handlePrintEmployee}
                  className="text-white hover:text-gray-200 px-3 py-1 rounded bg-teal-700 hover:bg-teal-800 text-sm"
                  title="Print Employee Details"
                >
                  🖨️ Print
                </button> */}
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-white hover:text-gray-200 text-xl ml-2"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Employee Photo */}
              {hasValidImage(viewingEmployee.employeePicture) && (
                <div className="flex justify-center mb-6">
                  <div className="text-center">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Employee Photo</h4>
                    <img 
                      src={getImageUrl(viewingEmployee.employeePicture)}
                      alt="Employee" 
                      className="w-32 h-40 object-cover border-2 border-teal-200 rounded-lg shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                    <div style={{display: 'none'}} className="w-32 h-40 bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                      No Image
                    </div>
                  </div>
                </div>
              )}

              {/* Basic Information */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Employee Type</p>
                    <p className="font-medium text-gray-800">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        viewingEmployee.employeeType === 'Permanent Employee' 
                          ? 'bg-green-100 text-green-800' 
                          : viewingEmployee.employeeType === 'Contract'
                          ? 'bg-orange-100 text-orange-800'
                          : viewingEmployee.employeeType === 'Temporary'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {viewingEmployee.employeeType || 'N/A'}
                      </span>
                    </p>
                  </div>
                  
                  {/* ✅ NEW: Show contractor for Contract employees */}
                  {viewingEmployee.employeeType === 'Contract' && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-xs text-gray-600 uppercase tracking-wide">Contractor Name</p>
                      <p className="font-medium text-gray-800">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {viewingEmployee.contractorName || 'N/A'}
                        </span>
                      </p>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Employee Name</p>
                    <p className="font-medium text-gray-800">{viewingEmployee.employeeName}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Contact Number</p>
                    <p className="font-medium text-gray-800">{viewingEmployee.contactNo || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Alternate Mobile</p>
                    <p className="font-medium text-gray-800">{viewingEmployee.alternateMobile || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Email</p>
                    <p className="font-medium text-gray-800">{viewingEmployee.emailAddress || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Joining Date</p>
                    <p className="font-medium text-gray-800">{viewingEmployee.joiningDate}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Gender</p>
                    <p className="font-medium text-gray-800">{viewingEmployee.gender || viewingEmployee.genderType || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Blood Group</p>
                    <p className="font-medium text-gray-800">
                      {viewingEmployee.bloodGroup ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          {viewingEmployee.bloodGroup}
                        </span>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ✅ Show extended information only for non-Contract employees */}
              {!isContractEmployee(viewingEmployee.employeeType) && (
                <>
                  {/* Work Information */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Work Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Department</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.department || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Designation</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.designation || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Salary</p>
                        <p className="font-medium text-gray-800">₹{Number(viewingEmployee.salary).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Updated Salary</p>
                        <p className="font-medium text-gray-800">
                          {viewingEmployee.updatedSalary === 0 || viewingEmployee.updatedSalary === '0' 
                            ? 'N/A' 
                            : `₹${Number(viewingEmployee.updatedSalary).toLocaleString('en-IN')}`
                          }
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">PF</p>
                        <p className="font-medium text-gray-800">₹{Number(viewingEmployee.pf || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">ESI</p>
                        <p className="font-medium text-gray-800">₹{Number(viewingEmployee.esi || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">WC</p>
                        <p className="font-medium text-gray-800">₹{Number(viewingEmployee.wc || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Target Amount</p>
                        <p className="font-medium text-gray-800">
                          {viewingEmployee.targetAmount === 0 || viewingEmployee.targetAmount === '0' 
                            ? 'N/A' 
                            : `₹${Number(viewingEmployee.targetAmount).toLocaleString('en-IN')}`
                          }
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Commission</p>
                        <p className="font-medium text-gray-800">
                          {viewingEmployee.commissionPercent === 0 || viewingEmployee.commissionPercent === '0' 
                            ? 'N/A' 
                            : `${viewingEmployee.commissionPercent}%`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Information */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Payment Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Payment Type</p>
                        <p className="font-medium text-gray-800">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            viewingEmployee.paymentType === 'Daily' 
                              ? 'bg-orange-100 text-orange-800' 
                              : viewingEmployee.paymentType === 'Weekly'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {viewingEmployee.paymentType || 'N/A'}
                          </span>
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Salary Update Year</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.salaryUpdateYear || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Salary Update Month</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.salaryUpdateMonth || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Information */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Personal Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Father's Name</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.fatherName || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Mother's Name</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.motherName || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Adhaar Number</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.adhaarNumber || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Marital Status</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.maritalStatus || viewingEmployee.maritalType || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Present Address</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.presentAddress || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Permanent Address</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.permanentAddress || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Zip Code</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.zipCode || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Leave Days</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.leaveDays || '0'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Information */}
                  <div className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Bank Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Account Number</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.bankAccNumber || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Account Name</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.bankAccName || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">Bank Branch</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.bankBranch || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-xs text-gray-600 uppercase tracking-wide">IFSC Code</p>
                        <p className="font-medium text-gray-800">{viewingEmployee.ifscCode || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  {(hasValidImage(viewingEmployee.adhaarCardImage) || hasValidImage(viewingEmployee.bankDocument)) && (
                    <div className="mb-8">
                      <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Documents</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hasValidImage(viewingEmployee.adhaarCardImage) && (
                          <div className="text-center">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Adhaar Card</h5>
                            <img 
                              src={getImageUrl(viewingEmployee.adhaarCardImage)}
                              alt="Adhaar Card" 
                              className="w-full max-w-sm mx-auto border-2 border-gray-300 rounded-lg shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'block'
                              }}
                            />
                            <div style={{display: 'none'}} className="w-full max-w-sm mx-auto bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm py-8">
                              Document not available
                            </div>
                          </div>
                        )}
                        
                        {hasValidImage(viewingEmployee.bankDocument) && (
                          <div className="text-center">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2">Bank Document</h5>
                            <img 
                              src={getImageUrl(viewingEmployee.bankDocument)}
                              alt="Bank Document" 
                              className="w-full max-w-sm mx-auto border-2 border-gray-300 rounded-lg shadow-sm"
                              onError={(e) => {
                                e.target.style.display = 'none'
                                e.target.nextSibling.style.display = 'block'
                              }}
                            />
                            <div style={{display: 'none'}} className="w-full max-w-sm mx-auto bg-gray-200 border-2 border-gray-300 rounded-lg flex items-center justify-center text-gray-500 text-sm py-8">
                              Document not available
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* ✅ Contract Employee Specific Info */}
              {isContractEmployee(viewingEmployee.employeeType) && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">Contract Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-600 uppercase tracking-wide">Contractor Name</p>
                      <p className="font-medium text-yellow-800">{viewingEmployee.contractorName || 'N/A'}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-600 uppercase tracking-wide">Salary</p>
                      <p className="font-medium text-yellow-800">₹{Number(viewingEmployee.salary).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <p className="text-xs text-yellow-600 uppercase tracking-wide">Payment Type</p>
                      <p className="font-medium text-yellow-800">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          viewingEmployee.paymentType === 'Daily' 
                            ? 'bg-orange-100 text-orange-800' 
                            : viewingEmployee.paymentType === 'Weekly'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {viewingEmployee.paymentType || 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      <strong>Note:</strong> This is a Contract employee under {viewingEmployee.contractorName}. 
                      Extended information like bank details, documents, and department assignments are not 
                      required for this employee type.
                    </p>
                  </div>
                </div>
              )}

              {/* System Information */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b-2 border-teal-200 pb-2 mb-4">System Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Employee Code</p>
                    <p className="font-medium text-gray-800 font-mono">{viewingEmployee.employeeCode || 'Auto Generated'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Status</p>
                    <p className="font-medium text-gray-800">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        {viewingEmployee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-xs text-gray-600 uppercase tracking-wide">Record Created</p>
                    <p className="font-medium text-gray-800">
                      {viewingEmployee.createdAt ? new Date(viewingEmployee.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
