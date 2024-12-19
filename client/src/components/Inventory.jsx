import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './Inventory.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const INITIAL_FORM_STATE = {
  name: '',
  category: '',
  branch: '',
  quantity: '',
  price: '',
  description: '',
  status: 'In Stock'
};

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const [productsRes, categoriesRes, branchesRes] = await Promise.all([
        axios.get(`${API_URL}/products`, config),
        axios.get(`${API_URL}/categories/active`, config),
        axios.get(`${API_URL}/branches/active`, config)
      ]);

      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      setError('Failed to fetch data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setEditId(null);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      const requiredFields = {
        name: 'Product Name',
        category: 'Category',
        branch: 'Branch',
        quantity: 'Quantity',
        price: 'Price'
      };

      const emptyFields = Object.entries(requiredFields)
        .filter(([key]) => !form[key])
        .map(([, label]) => label);

      if (emptyFields.length > 0) {
        setError(`Please fill in the following required fields: ${emptyFields.join(', ')}`);
        return;
      }

      if (isNaN(form.quantity) || form.quantity < 0) {
        setError('Quantity must be a valid positive number');
        return;
      }

      if (isNaN(form.price) || form.price <= 0) {
        setError('Price must be a valid positive number');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      const productData = {
        ...form,
        quantity: Number(form.quantity),
        price: Number(form.price)
      };

      if (editId) {
        await axios.put(`${API_URL}/products/${editId}`, productData, config);
      } else {
        await axios.post(`${API_URL}/products`, productData, config);
      }

      await fetchData();
      setIsPopupOpen(false);
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name || '',
      category: product.category?._id || '',
      branch: product.branch?._id || '',
      quantity: product.quantity || '',
      price: product.price || '',
      description: product.description || '',
      status: product.status || 'In Stock'
    });
    setEditId(product._id);
    setIsPopupOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchData();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete product');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category._id === categoryFilter;
    const matchesStatus = !statusFilter || product.status === statusFilter;
    const matchesBranch = !branchFilter || product.branch?._id === branchFilter;

    return matchesSearch && matchesCategory && matchesStatus && matchesBranch;
  });

  return (
    <div className={`inventory ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-buttons">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className={window.location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard
          </button>
          <button
            onClick={() => window.location.href = '/inventory'}
            className={window.location.pathname === '/inventory' ? 'active' : ''}>
            Inventory
          </button>
          <button
            onClick={() => window.location.href = '/invoice'}
            className={window.location.pathname === '/invoice' ? 'active' : ''}>
            Invoice
          </button>
          <button
            onClick={() => window.location.href = '/branches'}
            className={window.location.pathname === '/branches' ? 'active' : ''}>
            Branches
          </button>
          <button
            onClick={() => window.location.href = '/categories'}
            className={window.location.pathname === '/categories' ? 'active' : ''}>
            Categories
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-content">
            <div className="account-info">
              <span className="account-name">{userName}</span>
            </div>
          </div>
          <div className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <span className="menu-icon">&#9776;</span>
          </div>
        </div>

        <div className="inventory-content">
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading">Loading...</div>}

          <div className="filters">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) && categories.map(category => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Branches</option>
              {Array.isArray(branches) && branches.map(branch => (
                <option key={branch._id} value={branch._id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          <button className="add-product-button" onClick={() => setIsPopupOpen(true)}>
            Add Product
          </button>

          {isPopupOpen && (
            <div className="popup">
              <div className="popup-content">
                <button className="close-button" onClick={() => setIsPopupOpen(false)}>&times;</button>
                <h2>{editId ? 'Edit Product' : 'Add New Product'}</h2>
                <div className="form-grid">
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      placeholder="Product Name *"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      className={!form.name ? 'invalid' : ''}
                    />
                    {!form.name && <span className="error-text">Product name is required</span>}
                  </div>

                  <div className="form-group">
                    <select
                      name="category"
                      value={form.category}
                      onChange={handleInputChange}
                      required
                      className={!form.category ? 'invalid' : ''}
                    >
                      <option value="">Select Category *</option>
                      {Array.isArray(categories) && categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {!form.category && <span className="error-text">Category is required</span>}
                  </div>

                  <div className="form-group">
                    <select
                      name="branch"
                      value={form.branch}
                      onChange={handleInputChange}
                      required
                      className={!form.branch ? 'invalid' : ''}
                    >
                      <option value="">Select Branch *</option>
                      {Array.isArray(branches) && branches.map(branch => (
                        <option key={branch._id} value={branch._id}>
                          {branch.name}
                        </option>
                      ))}
                    </select>
                    {!form.branch && <span className="error-text">Branch is required</span>}
                  </div>

                  <div className="form-group">
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Quantity *"
                      value={form.quantity}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className={!form.quantity || form.quantity < 0 ? 'invalid' : ''}
                    />
                    {(!form.quantity || form.quantity < 0) &&
                      <span className="error-text">Valid quantity is required</span>}
                  </div>

                  <div className="form-group">
                    <input
                      type="number"
                      name="price"
                      placeholder="Price *"
                      value={form.price}
                      onChange={handleInputChange}
                      required
                      min="0.01"
                      step="0.01"
                      className={!form.price || form.price <= 0 ? 'invalid' : ''}
                    />
                    {(!form.price || form.price <= 0) &&
                      <span className="error-text">Valid price is required</span>}
                  </div>

                  <div className="form-group">
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={form.description}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>

                  <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (editId ? 'Update Product' : 'Add Product')}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="product-list">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Branch</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filteredProducts) && filteredProducts.map(product => (
                  <tr key={product._id}>
                    <td>{product.name}</td>
                    <td>{product.category?.name || 'N/A'}</td>
                    <td>{product.branch?.name || 'N/A'}</td>
                    <td>{product.quantity}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${product.status.toLowerCase().replace(' ', '-')}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="description-cell">{product.description}</td>
                    <td>
                      <button className="edit-button" onClick={() => handleEdit(product)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(product._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;