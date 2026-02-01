import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Package, Upload, X, Save, Folder, Loader } from 'lucide-react';
import config from '../../../url';

const ItemsManagement = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // Form state with HSN Code
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    barcode: '',
    hsnCode: '',  // Added HSN/SAC Code field
    description: '',
    category: '',
    categoryName: '',
    subcategory: '',
    brand: '',
    purchasePrice: '',
    rate: '',
    taxPercent: 0,
    taxIncluded: false,
    discountPercent: 0,
    unit: 'pcs',
    stock: 0,
    minStock: 0,
    maxStock: '',
    reorderLevel: 0,
    rackNo: '',
    isActive: true,
    notes: ''
  });

  const units = ['pcs', 'box', 'kg', 'liter', 'meter', 'dozen'];

  const API_BASE = `${config.API_URL}/items`;
  const CATEGORIES_API = `${config.API_URL}/categories`;

  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [currentPage, searchTerm, selectedCategory]);

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      console.log('Fetching categories from:', `${CATEGORIES_API}`);
      
      const response = await fetch(`${CATEGORIES_API}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Categories result:', result);
      
      if (result.success) {
        const processedCategories = (result.data || []).map((cat, index) => ({
          ...cat,
          id: cat.id || cat._id || `cat-${index}`,
          value: cat.value || cat.id || cat._id,
          label: cat.label || cat.name
        }));
        setCategories(processedCategories);
      } else {
        console.error('Failed to fetch categories:', result.message);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      const fallbackCategories = [
        { id: 'electronics', label: 'Electronics', value: 'electronics' },
        { id: 'clothing', label: 'Clothing', value: 'clothing' },
        { id: 'food', label: 'Food', value: 'food' },
        { id: 'books', label: 'Books', value: 'books' },
        { id: 'home-garden', label: 'Home & Garden', value: 'home-garden' },
        { id: 'sports', label: 'Sports', value: 'sports' },
        { id: 'toys', label: 'Toys', value: 'toys' }
      ];
      setCategories(fallbackCategories);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory })
      });

      console.log('Fetching from:', `${API_BASE}?${params}`);
      const response = await fetch(`${API_BASE}?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned non-JSON response');
      }
      
      const result = await response.json();
      console.log('Fetch result:', result);
      
      setItems(result.data || []);
      setTotalItems(result.pagination?.totalCount || result.total || 0);
    } catch (error) {
      console.error('Error fetching items:', error);
      alert(`Error fetching items: ${error.message}`);
      setItems([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'category') {
      const selectedCat = categories.find(cat => cat.value === value);
      setFormData(prev => ({
        ...prev,
        category: value,
        categoryName: selectedCat ? selectedCat.label : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const removeImage = (index) => {
    const newFiles = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setSelectedImages(newFiles);
    setImagePreview(newPreviews);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      barcode: '',
      hsnCode: '',  // Reset HSN code
      description: '',
      category: '',
      categoryName: '',
      subcategory: '',
      brand: '',
      purchasePrice: '',
      rate: '',
      taxPercent: 0,
      taxIncluded: false,
      discountPercent: 0,
      unit: 'pcs',
      stock: 0,
      minStock: 0,
      maxStock: '',
      reorderLevel: 0,
      rackNo: '',
      isActive: true,
      notes: ''
    });
    setSelectedImages([]);
    setImagePreview([]);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && key !== 'categoryName') {
          submitData.append(key, formData[key]);
        }
      });
      
      selectedImages.forEach(file => {
        submitData.append('images', file);
      });

      const url = editingItem ? `${API_BASE}/${editingItem._id}` : API_BASE;
      const method = editingItem ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: submitData
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await response.json();
          throw new Error(error.error || error.message || `HTTP ${response.status}`);
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }
      
      const result = await response.json();
      console.log('Submit success:', result);
      
      resetForm();
      fetchItems();
      alert(editingItem ? 'Item updated successfully!' : 'Item created successfully!');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleEdit = (item) => {
    const categoryObj = categories.find(cat => cat.value === item.category);
    
    setFormData({
      name: item.name || '',
      code: item.code || '',
      barcode: item.barcode || '',
      hsnCode: item.hsnCode || '',  // Load HSN code
      description: item.description || '',
      category: item.category || '',
      categoryName: categoryObj ? categoryObj.label : (item.category || ''),
      subcategory: item.subcategory || '',
      brand: item.brand || '',
      purchasePrice: item.purchasePrice || '',
      rate: item.rate || '',
      taxPercent: item.taxPercent || 0,
      taxIncluded: item.taxIncluded || false,
      discountPercent: item.discountPercent || 0,
      unit: item.unit || 'pcs',
      stock: item.stock || 0,
      minStock: item.minStock || 0,
      maxStock: item.maxStock || '',
      reorderLevel: item.reorderLevel || 0,
      rackNo: item.rackNo || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
      notes: item.notes || ''
    });
    setEditingItem(item);
    setSelectedImages([]);
    setImagePreview([]);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          fetchItems();
          alert('Item deleted successfully');
        } else {
          const error = await response.json();
          alert(`Error: ${error.error || error.message || 'Failed to delete item'}`);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Error deleting item');
      }
    }
  };

  const getCategoryName = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const totalPages = Math.ceil(totalItems / 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <Package className="h-8 w-8" />
                  Items Management System
                </h1>
                <p className="text-purple-100">Manage your inventory with HSN/SAC codes for GST compliance</p>
                <div className="flex items-center gap-4 mt-3 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">👤 SuperAdmin</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">📦 Inventory Manager</span>
                  <span className="bg-white/20 px-3 py-1 rounded-full">📅 {new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">🏭 Fayullah Factory</div>
                <div className="text-purple-200">Smart Manufacturing Unit</div>
                <div className="text-xs opacity-80 mt-2">GST Compliant System</div>
              </div>
            </div>
          </div>

          {/* Categories Status */}
          <div className="px-8 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-800">Categories Status:</span>
              </div>
              {categoriesLoading ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Loading categories...</span>
                </div>
              ) : (
                <span className="text-sm text-green-600 font-medium">
                  ✅ {categories.length} categories loaded
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Form */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              {editingItem ? <Edit2 className="h-5 w-5 text-blue-600" /> : <Plus className="h-5 w-5 text-green-600" />}
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Category *
                  </label>
                  {categoriesLoading ? (
                    <div className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-50 flex items-center gap-2">
                      <Loader className="h-4 w-4 animate-spin text-blue-600" />
                      <span className="text-gray-500">Loading categories...</span>
                    </div>
                  ) : (
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.value}>
                          {cat.label} {cat.code && `(${cat.code})`}
                        </option>
                      ))}
                    </select>
                  )}
                  {categories.length === 0 && !categoriesLoading && (
                    <p className="text-xs text-red-600 mt-1">
                      ⚠️ No categories available. Please add categories first.
                    </p>
                  )}
                </div>
              </div>

              {/* Code & HSN/SAC Code Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Item Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="SKU/PLU"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Barcode
                  </label>
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Barcode"
                  />
                </div>

                {/* HSN/SAC Code Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    HSN/SAC Code 📋
                  </label>
                  <input
                    type="text"
                    name="hsnCode"
                    value={formData.hsnCode}
                    onChange={handleInputChange}
                    maxLength="8"
                    pattern="[0-9]{4,8}"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="4-8 digits"
                    title="Enter 4, 6, or 8 digit HSN/SAC code"
                  />
                  <p className="text-xs text-gray-500 mt-1">For GST compliance</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Item description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Subcategory (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    placeholder="Brand name"
                  />
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  💰 Pricing Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Purchase Price *
                    </label>
                    <input
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Sale Price *
                    </label>
                    <input
                      type="number"
                      name="rate"
                      value={formData.rate}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tax %
                    </label>
                    <input
                      type="number"
                      name="taxPercent"
                      value={formData.taxPercent}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Discount %
                    </label>
                    <input
                      type="number"
                      name="discountPercent"
                      value={formData.discountPercent}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Unit
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                    >
                      {units.map(unit => (
                        <option key={`unit-${unit}`} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Stock Management */}
              <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                  📦 Stock Management
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Current Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Min Stock
                    </label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Max Stock
                    </label>
                    <input
                      type="number"
                      name="maxStock"
                      value={formData.maxStock}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Reorder Level
                    </label>
                    <input
                      type="number"
                      name="reorderLevel"
                      value={formData.reorderLevel}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Rack No.
                    </label>
                    <input
                      type="text"
                      name="rackNo"
                      value={formData.rackNo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      placeholder="Storage location"
                    />
                  </div>
                </div>
              </div>

              {/* Images Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Product Images
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <Upload className="h-12 w-12 mb-3" />
                    <span className="text-lg font-medium">Click to upload images</span>
                    <span className="text-sm">PNG, JPG up to 10MB each</span>
                  </label>
                </div>
                
                {imagePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {imagePreview.map((preview, index) => (
                      <div key={`preview-${index}`} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="taxIncluded"
                    checked={formData.taxIncluded}
                    onChange={handleInputChange}
                    id="tax-included"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="tax-included" className="ml-3 text-sm font-medium text-gray-700">
                    Tax Included in Price
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    id="is-active"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is-active" className="ml-3 text-sm font-medium text-gray-700">
                    Active Item
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all shadow-lg font-bold flex items-center justify-center gap-2"
                >
                  <Save className="h-5 w-5" />
                  {editingItem ? 'Update Item' : 'Add Item'}
                </button>
                
                {editingItem && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-bold"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Side - Items Display */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">📦 Items List</h2>
              
              {/* Search and Filter */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={`filter-${cat.id}`} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Items Grid */}
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                <p className="mt-4 text-gray-600 font-medium text-lg">Loading items...</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-xl font-medium">No items found</p>
                      <p className="mt-2">Add your first item to get started</p>
                    </div>
                  ) : (
                    items.map(item => (
                      <div key={item._id} className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                            <p className="text-sm text-blue-600 font-medium">
                              {getCategoryName(item.category)}
                            </p>
                            {/* Display HSN Code */}
                            {item.hsnCode && (
                              <p className="text-xs text-purple-600 font-semibold mt-1 bg-purple-50 inline-block px-2 py-1 rounded">
                                HSN: {item.hsnCode}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          
                          <div className="flex gap-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Stock:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                              item.stock <= item.minStock 
                                ? 'bg-red-100 text-red-800 border border-red-200' 
                                : 'bg-green-100 text-green-800 border border-green-200'
                            }`}>
                              {item.stock} {item.unit}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Price:</span>
                            <span className="text-green-600 font-bold ml-2">₹{item.rate}</span>
                          </div>
                          {item.code && (
                            <div>
                              <span className="font-medium text-gray-700">Code:</span>
                              <span className="text-gray-600 ml-2">{item.code}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium text-gray-700">Tax:</span>
                            <span className="text-gray-600 ml-2">{item.taxPercent}%</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                              item.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                        
                        {item.images && item.images.length > 0 && (
                          <div className="mt-4 flex gap-2">
                            {item.images.slice(0, 3).map((image, index) => (
                              <div key={`item-${item._id}-image-${index}`} className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
                                <img
                                  src={`${API_BASE.replace('/api/items', '')}/uploads/${image}`}
                                  alt={`${item.name} ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkgyNFYyNEgxNlYxNloiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+';
                                  }}
                                />
                              </div>
                            ))}
                            {item.images.length > 3 && (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                +{item.images.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                    >
                      ◀ Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = Math.max(1, currentPage - 2) + i;
                        if (page > totalPages) return null;
                        
                        return (
                          <button
                            key={`page-${page}`}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded-lg transition-all ${
                              currentPage === page
                                ? 'bg-blue-500 text-white font-bold'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                    >
                      Next ▶
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsManagement;
