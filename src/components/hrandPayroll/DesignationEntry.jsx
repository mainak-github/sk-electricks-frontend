'use client'

import { useState, useEffect } from 'react'
import config from '../../../url'

export default function DesignationEntry() {
  const [formData, setFormData] = useState({ designationName: '' })
  const [designationList, setDesignationList] = useState([])
  const [filteredDesignations, setFilteredDesignations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingDesignation, setEditingDesignation] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10 // Change as desired

  // Fetch designations from backend
  useEffect(() => {
    fetchDesignations()
  }, [])

  const fetchDesignations = async () => {
    setLoading(true)
    const res = await fetch(`${config.API_URL}/designations`)
    if (res.ok) {
      const { data } = await res.json()
      setDesignationList(data)
      setFilteredDesignations(data)
    }
    setLoading(false)
  }

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!formData.designationName.trim()) {
      alert('Please enter designation name')
      return
    }
    const res = await fetch(`${config.API_URL}/designations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designationName: formData.designationName })
    })
    if (res.ok) {
      await fetchDesignations()
      setFormData({ designationName: '' })
      alert('Designation saved successfully')
    } else {
      const { message } = await res.json()
      alert(message || 'Failed to save')
    }
  }

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      setFilteredDesignations(designationList)
    } else {
      const filtered = designationList.filter(designation =>
        designation.designationName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredDesignations(filtered)
    }
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setFilteredDesignations(designationList)
    setShowSearch(false)
    setCurrentPage(1)
  }

  const handleDeleteDesignation = async (id) => {
    if (window.confirm('Are you sure you want to delete this designation?')) {
      const res = await fetch(`${config.API_URL}/designations/${id}`, { method: 'DELETE' })
      if (res.ok) {
        await fetchDesignations()
      } else {
        alert('Delete failed')
      }
    }
  }

  const handleEditDesignation = (designation) => {
    setEditingDesignation({ ...designation })
    setShowEditModal(true)
  }

  const handleUpdateDesignation = async () => {
    if (!editingDesignation.designationName.trim()) {
      alert('Please enter designation name')
      return
    }
    const res = await fetch(`${config.API_URL}/designations/${editingDesignation._id || editingDesignation.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designationName: editingDesignation.designationName })
    })
    if (res.ok) {
      setShowEditModal(false)
      setEditingDesignation(null)
      await fetchDesignations()
      alert('Designation updated successfully')
    } else {
      alert('Failed to update')
    }
  }

  // Print handler
  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Designation List Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #0f766e; margin-bottom: 10px; }
            .report-title { font-size: 18px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Fayullah Factory</div>
            <div class="report-title">Designation List Report</div>
            <div>Generated on: ${new Date().toLocaleString()}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Designation Name</th>
              </tr>
            </thead>
            <tbody>
              ${
                filteredDesignations
                  .map(
                    (desig, idx) => `<tr>
                      <td>${typeof desig.sl === "number" ? desig.sl : idx + 1}</td>
                      <td>${desig.designationName}</td>
                    </tr>`
                  )
                  .join('')
              }
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

  // Export CSV handler
  const handleExport = () => {
    const csvContent = [
      ['SL', 'Designation Name'],
      ...filteredDesignations.map((desig, idx) => [
        typeof desig.sl === "number" ? desig.sl : idx + 1,
        desig.designationName
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'designation_list.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  // Pagination
  const totalPages = Math.ceil(filteredDesignations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentDesignations = filteredDesignations.slice(startIndex, endIndex)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const generatePageNumbers = () => {
    const pages = []
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <h2 className="font-medium text-lg">Designation Entry</h2>
          <div className="text-right">
            <div className="text-sm font-semibold">Fayullah Factory</div>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Designation Name *</label>
              <input
                type="text"
                placeholder="Designation Name"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                value={formData.designationName}
                onChange={e => handleInputChange('designationName', e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex justify-start">
            <button
              onClick={handleSave}
              className="bg-cyan-500 text-white px-6 py-2 rounded text-sm hover:bg-cyan-600 transition-colors flex items-center gap-2"
            >💾 SAVE</button>
          </div>
        </div>
      </div>

      {/* Designation List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Designation List</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Search"
              >🔍</button>
              <button
                onClick={handleExport}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Export to CSV"
              >📤</button>
              <button
                onClick={handlePrint}
                className="p-2 border rounded hover:bg-gray-50 transition-colors"
                title="Print"
              >🖨️</button>
            </div>
          </div>
          {/* Search Bar */}
          {showSearch && (
            <div className="mb-4 flex gap-2">
              <input
                type="text"
                placeholder="Search by designation name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <button
                onClick={handleSearch}
                className="bg-teal-600 text-white px-4 py-2 rounded text-sm hover:bg-teal-700 transition-colors"
              >Search</button>
              <button
                onClick={handleClearSearch}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
              >Clear</button>
            </div>
          )}
          {/* Table */}
          {loading ? (
            <div className="h-24 flex items-center justify-center">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">SL</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Designation Name</th>
                    <th className="text-left py-3 px-2 text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDesignations.map((designation, idx) => (
                    <tr key={designation._id || designation.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2 text-sm">{typeof designation.sl === "number" ? designation.sl : startIndex + idx + 1}</td>
                      <td className="py-3 px-2 text-sm font-medium">{designation.designationName}</td>
                      <td className="py-3 px-2 text-sm">
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditDesignation(designation)}
                            className="text-green-600 hover:text-green-800 p-1"
                            title="Edit"
                          >✏️</button>
                          <button
                            onClick={() => handleDeleteDesignation(designation._id || designation.id)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Delete"
                          >🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentDesignations.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-500 text-sm">No data found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredDesignations.length)} of {filteredDesignations.length} entries
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded text-sm disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
                >Previous</button>
                {generatePageNumbers().map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === page ? 'bg-teal-600 text-white border-teal-600' : 'hover:bg-gray-50'}`}
                  >{page}</button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded text-sm disabled:bg-gray-100 disabled:text-gray-400 hover:bg-gray-50"
                >Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      {showEditModal && editingDesignation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4">
            <div className="bg-teal-600 text-white px-6 py-4 rounded-t-lg flex justify-between items-center">
              <h3 className="text-lg font-medium">Edit Designation</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:text-gray-200"
              >✕</button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-1">Designation Name *</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={editingDesignation.designationName}
                  onChange={e => setEditingDesignation({ ...editingDesignation, designationName: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                >Cancel</button>
                <button
                  onClick={handleUpdateDesignation}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 transition-colors"
                >Update Designation</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
