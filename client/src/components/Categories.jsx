import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Categories.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const INITIAL_FORM_STATE = {
  name: '',
  description: '',
  isActive: true
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      setError('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value.trim()
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.name) {
        setError('Name is required');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (editId) {
        await axios.put(`${API_URL}/categories/${editId}`, form, config);
      } else {
        await axios.post(`${API_URL}/categories`, form, config);
      }

      await fetchCategories();
      setIsPopupOpen(false);
      setForm(INITIAL_FORM_STATE);
      setEditId(null);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setForm({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setEditId(category._id);
    setIsPopupOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/categories/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchCategories();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`categories ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-buttons">
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

        <div className="categories-content">
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading">Loading...</div>}

          <button className="add-category-button" onClick={() => setIsPopupOpen(true)}>
            Add Category
          </button>

          {isPopupOpen && (
            <div className="popup">
              <div className="popup-content">
                <button className="close-button" onClick={() => setIsPopupOpen(false)}>&times;</button>
                <h2>{editId ? 'Edit Category' : 'Add New Category'}</h2>
                <div className="form-grid">
                  <input
                    type="text"
                    name="name"
                    placeholder="Category Name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Description"
                    value={form.description}
                    onChange={handleInputChange}
                  />
                  <div className="checkbox-container">
                    <label>
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={form.isActive}
                        onChange={handleInputChange}
                      />
                      Active
                    </label>
                  </div>
                  <button className="submit-button" onClick={handleSubmit}>
                    {editId ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="category-list">
            <h2>Category List</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(categories) && categories.map(category => (
                  <tr key={category._id}>
                    <td>{category.name}</td>
                    <td>{category.description || '-'}</td>
                    <td>
                      <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="edit-button" onClick={() => handleEdit(category)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(category._id)}>Delete</button>
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

export default Categories; 