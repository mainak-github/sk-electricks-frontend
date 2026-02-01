'use client'

import { useState, useEffect } from 'react'
import url from '../../../url'

// API Functions
const fetchRecognitionEntries = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) queryParams.append(key, params[key]);
    });
    
    const response = await fetch(`${url.API_URL}/expense-recognization-entries?${queryParams}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching recognition entries:', error);
    return { success: false, data: [], pagination: {} };
  }
};

const createRecognitionEntry = async (recognitionData) => {
  try {
    const response = await fetch(`${url.API_URL}/expense-recognization-entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recognitionData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating recognition entry:', error);
    return { success: false, message: 'Failed to create recognition entry' };
  }
};

const updateRecognitionEntry = async (id, recognitionData) => {
  try {
    const response = await fetch(`${url.API_URL}/expense-recognization-entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(recognitionData)
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating recognition entry:', error);
    return { success: false, message: 'Failed to update recognition entry' };
  }
};

const deleteRecognitionEntry = async (id) => {
  try {
    const response = await fetch(`${url.API_URL}/expense-recognization-entries/${id}`, {
      method: 'DELETE'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting recognition entry:', error);
    return { success: false, message: 'Failed to delete recognition entry' };
  }
};

const getNextRecognitionCode = async () => {
  try {
    const response = await fetch(`${url.API_URL}/expense-recognization-entries/utils/next-code`);
    const data = await response.json();
    return data.data?.recognitionCode || 'REC-1';
  } catch (error) {
    console.error('Error getting next recognition code:', error);
    return 'REC-1';
  }
};

export default function ExpenseRecognitionEntry() {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    remark: '',
    recognitionDate: new Date().toISOString().split('T')[0],
    recognitionCode: 'REC-1',
    narration: ''
  });

  // States
  const [recognitionEntries, setRecognitionEntries] = useState([]);
  const [recognitionItems, setRecognitionItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const nextCode = await getNextRecognitionCode();
        setFormData(prev => ({ ...prev, recognitionCode: nextCode }));
        
        await loadRecognitionEntries();
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Load recognition entries
  const loadRecognitionEntries = async (params = {}) => {
    try {
      const result = await fetchRecognitionEntries({
        page: currentPage,
        limit: rowsPerPage,
        search: searchTerm,
        ...params
      });
      
      if (result.success) {
        setRecognitionEntries(result.data || []);
        setPagination(result.pagination || {});
      } else {
        setRecognitionEntries([]);
        setPagination({});
      }
    } catch (error) {
      console.error('Error loading recognition entries:', error);
      setRecognitionEntries([]);
      setPagination({});
    }
  };

  // Reload entries when page or search changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadRecognitionEntries();
    }, 300); // Debounce for search
    
    return () => clearTimeout(timeoutId);
  }, [currentPage, rowsPerPage, searchTerm]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddToRecognition = () => {
    if (!formData.description || !formData.amount) {
      setError('Description and amount are required');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    const newItem = {
      id: Date.now(),
      description: formData.description,
      recognitionAmount: parseFloat(formData.amount),
      remark: formData.remark || ''
    };
    
    setRecognitionItems(prev => [...prev, newItem]);
    
    // Clear form fields for adding more items
    setFormData(prev => ({
      ...prev,
      description: '',
      amount: '',
      remark: ''
    }));
    
    setError('');
  };

  const handleSaveRecognition = async () => {
    if (recognitionItems.length === 0) {
      setError('Please add at least one recognition item');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const recognitionData = {
        items: recognitionItems.map(item => ({
          description: item.description,
          recognitionAmount: item.recognitionAmount,
          remark: item.remark
        })),
        recognitionDate: formData.recognitionDate,
        recognitionCode: formData.recognitionCode,
        narration: formData.narration
      };

      let result;
      if (editingEntry) {
        result = await updateRecognitionEntry(editingEntry._id, recognitionData);
      } else {
        result = await createRecognitionEntry(recognitionData);
      }

      if (result.success) {
        await loadRecognitionEntries();
        await resetForm();
        setEditingEntry(null);
      } else {
        setError(result.message || 'Failed to save recognition entry');
      }
    } catch (error) {
      console.error('Error saving recognition:', error);
      setError('Failed to save recognition entry');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = async () => {
    const nextCode = await getNextRecognitionCode();
    setFormData({
      description: '',
      amount: '',
      remark: '',
      recognitionDate: new Date().toISOString().split('T')[0],
      recognitionCode: nextCode,
      narration: ''
    });
    setRecognitionItems([]);
    setEditingEntry(null);
    setError('');
  };

  const handleEditEntry = (entry) => {
    setFormData({
      description: '',
      amount: '',
      remark: '',
      recognitionDate: entry.recognitionDate ? new Date(entry.recognitionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      recognitionCode: entry.recognitionCode || '',
      narration: entry.narration || ''
    });
    setRecognitionItems(entry.items || []);
    setEditingEntry(entry);
    setError('');
  };

  const handleDeleteEntry = async (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    setLoading(true);
    try {
      const result = await deleteRecognitionEntry(id);
      if (result.success) {
        await loadRecognitionEntries();
      } else {
        setError(result.message || 'Failed to delete recognition entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      setError('Failed to delete recognition entry');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (id) => {
    setRecognitionItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadRecognitionEntries();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearch(false);
    setCurrentPage(1);
  };

  // Print functionality
  const handlePrint = () => {
    if (recognitionEntries.length === 0) {
      alert('No data to print');
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Recognition Entry List</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; font-weight: bold; }
            h1 { text-align: center; color: #7c3aed; margin-bottom: 10px; }
            .header-info { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>Recognition Entry List</h1>
          <div class="header-info">
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Records: ${recognitionEntries.length}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>SL</th>
                <th>Recognition Code</th>
                <th>Date</th>
                <th>Total</th>
                <th>Narration</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              ${recognitionEntries.map((entry, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${entry.recognitionCode || 'N/A'}</td>
                  <td>${entry.recognitionDate ? new Date(entry.recognitionDate).toLocaleDateString() : 'N/A'}</td>
                  <td>₹ ${entry.recognitionTotal?.toFixed(2) || '0.00'}</td>
                  <td>${entry.narration || '-'}</td>
                  <td>${entry.createdBy || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Export functionality
  const handleExport = () => {
    if (recognitionEntries.length === 0) {
      alert('No data to export');
      return;
    }

    const csvContent = [
      ['SL', 'Recognition Code', 'Recognition Date', 'Recognition Total', 'Narration', 'Created By'],
      ...recognitionEntries.map((entry, index) => [
        index + 1,
        entry.recognitionCode || 'N/A',
        entry.recognitionDate ? new Date(entry.recognitionDate).toLocaleDateString() : 'N/A',
        entry.recognitionTotal?.toFixed(2) || '0.00',
        entry.narration || '-',
        entry.createdBy || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recognition_entries_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && recognitionEntries.length === 0) {
    return (
      <div className="p-4 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={() => setError('')} 
              className="text-red-700 font-bold text-lg hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="bg-teal-600 text-white px-4 py-3 rounded-t-lg">
          <h2 className="font-medium text-lg">
            {editingEntry ? 'Edit Expense Recognition Entry' : 'Expense Recognition Entry'}
          </h2>
        </div>
        
        <div className="p-6">
          {/* Main Form Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="Amount"
                />
              </div>

              {/* Remark */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Remark</label>
                <input 
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                  value={formData.remark}
                  onChange={(e) => handleInputChange('remark', e.target.value)}
                  placeholder="Remark"
                />
              </div>

              {/* Add to Recognition Button */}
              <div>
                <button 
                  onClick={handleAddToRecognition}
                  className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors"
                >
                  ADD TO RECOGNITION
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Recognition Date and Code Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Recognition Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recognition Date</label>
                  <input 
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                    value={formData.recognitionDate}
                    onChange={(e) => handleInputChange('recognitionDate', e.target.value)}
                  />
                </div>

                {/* Recognition Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recognition Code</label>
                  <input 
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 bg-gray-50"
                    value={formData.recognitionCode}
                    onChange={(e) => handleInputChange('recognitionCode', e.target.value)}
                    readOnly={!editingEntry}
                  />
                </div>
              </div>

              {/* Recognition Table */}
              <div className="border rounded p-3">
                <div className="grid grid-cols-5 gap-2 text-xs font-semibold text-gray-700 mb-2">
                  <div>SL</div>
                  <div>Description</div>
                  <div>Amount</div>
                  <div>Remark</div>
                  <div>Actions</div>
                </div>
                
                {recognitionItems.length > 0 ? (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {recognitionItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-5 gap-2 text-xs py-1 border-t">
                        <div>{index + 1}</div>
                        <div className="truncate" title={item.description}>{item.description}</div>
                        <div>₹ {item.recognitionAmount.toFixed(2)}</div>
                        <div className="truncate" title={item.remark}>{item.remark || '-'}</div>
                        <div>
                          <button 
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                            title="Remove"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm border-t">
                    No items added yet
                  </div>
                )}
                
                {/* Total */}
                {recognitionItems.length > 0 && (
                  <div className="border-t mt-2 pt-2 text-sm font-semibold text-right">
                    Total: ₹ {recognitionItems.reduce((sum, item) => sum + item.recognitionAmount, 0).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Narration */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Narration</label>
            <textarea 
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
              rows="3"
              placeholder="Narration..."
              value={formData.narration}
              onChange={(e) => handleInputChange('narration', e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={handleSaveRecognition}
              disabled={loading}
              className="bg-teal-600 text-white px-8 py-2 rounded text-sm hover:bg-teal-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {editingEntry ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                <>
                  💾 {editingEntry ? 'UPDATE' : 'SAVE'}
                </>
              )}
            </button>
            <button 
              onClick={resetForm}
              disabled={loading}
              className="bg-gray-500 text-white px-8 py-2 rounded text-sm hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              {editingEntry ? 'CANCEL' : 'RESET'}
            </button>
          </div>
        </div>
      </div>

      {/* Recognition Entry List */}
      <div className="bg-white rounded-lg shadow-sm border mt-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">
              Recognition Entry List {pagination.totalRecords ? `(${pagination.totalRecords} total)` : ''}
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
                disabled={recognitionEntries.length === 0}
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Export to CSV"
              >
                📤
              </button>
              <button 
                onClick={handlePrint}
                disabled={recognitionEntries.length === 0}
                className="p-2 border rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                title="Print"
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
                placeholder="Search by narration, code, or item description..."
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

          {/* Table */}
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="grid grid-cols-7 gap-2 text-xs font-semibold text-gray-700 border-b pb-2 mb-4">
                <div>SL</div>
                <div>Recognition Code</div>
                <div>Recognition Date</div>
                <div>Items Count</div>
                <div>Recognition Total</div>
                <div>Narration</div>
                <div>Actions</div>
              </div>

              {/* Table Rows */}
              {loading && recognitionEntries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                  Loading recognition entries...
                </div>
              ) : recognitionEntries.length > 0 ? (
                recognitionEntries.map((entry, index) => (
                  <div key={entry._id} className="grid grid-cols-7 gap-2 text-xs py-2 border-b hover:bg-gray-50">
                    <div>{((currentPage - 1) * rowsPerPage) + index + 1}</div>
                    <div className="font-medium text-teal-600">{entry.recognitionCode || 'N/A'}</div>
                    <div>{entry.recognitionDate ? new Date(entry.recognitionDate).toLocaleDateString() : 'N/A'}</div>
                    <div>{entry.items?.length || 0} items</div>
                    <div className="font-medium">₹ {entry.recognitionTotal?.toFixed(2) || '0.00'}</div>
                    <div className="truncate max-w-20" title={entry.narration || 'No narration'}>
                      {entry.narration || '-'}
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleEditEntry(entry)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                        title="Edit"
                        disabled={loading}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDeleteEntry(entry._id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                        title="Delete"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No matching records found' : 'No recognition entries found. Create your first recognition entry above.'}
                </div>
              )}
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalRecords > 0 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span>Rows per page:</span>
                <select 
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-2 py-1"
                  disabled={loading}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span>
                  {pagination.totalRecords === 0 
                    ? '0-0 of 0' 
                    : `${((currentPage - 1) * rowsPerPage) + 1}-${Math.min(currentPage * rowsPerPage, pagination.totalRecords)} of ${pagination.totalRecords}`
                  }
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ‹
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages || 1, prev + 1))}
                    disabled={currentPage >= (pagination.totalPages || 1) || loading}
                    className="p-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
