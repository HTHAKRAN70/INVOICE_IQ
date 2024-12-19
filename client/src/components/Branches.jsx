import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Branches.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const INITIAL_FORM_STATE = {
  name: '',
  location: '',
  isActive: true
};

const Branches = () => {
  const [branches, setBranches] = useState([]);
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
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/branches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBranches(response.data);
    } catch (error) {
      setError('Failed to fetch branches');
      console.error('Error:', error);
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

  const resetForm = () => {
    setForm(INITIAL_FORM_STATE);
    setEditId(null);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      if (!form.name || !form.location) {
        setError('Name and location are required');
        return;
      }

      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (editId) {
        await axios.put(`${API_URL}/branches/${editId}`, form, config);
      } else {
        await axios.post(`${API_URL}/branches`, form, config);
      }

      await fetchBranches();
      setIsPopupOpen(false);
      resetForm();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save branch');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setForm({
      name: branch.name,
      location: branch.location,
      isActive: branch.isActive
    });
    setEditId(branch._id);
    setIsPopupOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/branches/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchBranches();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete branch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`branches ${sidebarOpen ? 'sidebar-open' : ''}`}>
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

        <div className="branches-content">
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading">Loading...</div>}

          <button className="add-branch-button" onClick={() => setIsPopupOpen(true)}>
            Add Branch
          </button>

          {isPopupOpen && (
            <div className="popup">
              <div className="popup-content">
                <button className="close-button" onClick={() => setIsPopupOpen(false)}>&times;</button>
                <h2>{editId ? 'Edit Branch' : 'Add New Branch'}</h2>
                <div className="form-grid">
                  <input
                    type="text"
                    name="name"
                    placeholder="Branch Name"
                    value={form.name}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="location"
                    placeholder="Location"
                    value={form.location}
                    onChange={handleInputChange}
                    required
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
                    {editId ? 'Update Branch' : 'Add Branch'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="branch-list">
            <h2>Branch List</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(branches) && branches.map(branch => (
                  <tr key={branch._id}>
                    <td>{branch.name || ''}</td>
                    <td>{branch.location || ''}</td>
                    <td>
                      <span className={`status-badge ${branch.isActive ? 'active' : 'inactive'}`}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="edit-button" onClick={() => handleEdit(branch)}>Edit</button>
                      <button className="delete-button" onClick={() => handleDelete(branch._id)}>Delete</button>
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

export default Branches; 