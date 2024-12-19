import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, LineElement, PointElement, Filler } from 'chart.js';
import axios from 'axios';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, 
  Tooltip, Legend, ArcElement, LineElement, 
  PointElement, Filler
);

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [invoiceStats, setInvoiceStats] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const config = { headers: { 'Authorization': `Bearer ${token}` } };

        const [productsRes, invoiceStatsRes] = await Promise.all([
          axios.get(`${API_URL}/products`, config),
          axios.get(`${API_URL}/invoices/stats`, config)
        ]);

        setProducts(productsRes.data);
        setInvoiceStats(invoiceStatsRes.data);
        setUserName(localStorage.getItem('userName') || 'User');
      } catch (err) {
        setError('Failed to fetch dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const productStats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.quantity < 10).length,
    outOfStock: products.filter(p => p.quantity === 0).length,
    activeProducts: products.filter(p => p.status === 'active').length
  };

  const categoryData = {
    labels: ['Active', 'Low Stock', 'Out of Stock'],
    datasets: [{
      data: [productStats.activeProducts, productStats.lowStock, productStats.outOfStock],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
    }]
  };

  const invoiceStatusData = {
    labels: invoiceStats.map(stat => stat._id),
    datasets: [{
      data: invoiceStats.map(stat => stat.count),
      backgroundColor: ['#2196F3', '#4CAF50', '#F44336']
    }]
  };

  const revenueData = {
    labels: invoiceStats.map(stat => stat._id),
    datasets: [{
      label: 'Revenue by Status',
      data: invoiceStats.map(stat => stat.totalAmount),
      backgroundColor: '#42A5F5'
    }]
  };

  const topProducts = {
    labels: products.slice(0, 5).map(p => p.name),
    datasets: [{
      label: 'Top Products by Stock',
      data: products.slice(0, 5).map(p => p.quantity),
      backgroundColor: '#4CAF50'
    }]
  };

  const commonOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#333' }
      }
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-buttons">
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
      </div>
      <div className="main-content">
        <div className="top-bar">
          <h1>Welcome, {userName}</h1>
        </div>

        <div className="stats-summary">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{productStats.totalProducts}</p>
          </div>
          <div className="stat-card warning">
            <h3>Low Stock</h3>
            <p>{productStats.lowStock}</p>
          </div>
          <div className="stat-card danger">
            <h3>Out of Stock</h3>
            <p>{productStats.outOfStock}</p>
          </div>
          <div className="stat-card success">
            <h3>Active Products</h3>
            <p>{productStats.activeProducts}</p>
          </div>
        </div>

        <div className="charts">
          <div className="chart-container">
            <h3>Product Status Overview</h3>
            <Pie data={categoryData} options={commonOptions} />
          </div>
          <div className="chart-container">
            <h3>Invoice Status Distribution</h3>
            <Doughnut data={invoiceStatusData} options={commonOptions} />
          </div>
          <div className="chart-container">
            <h3>Revenue by Invoice Status</h3>
            <Bar data={revenueData} options={commonOptions} />
          </div>
          <div className="chart-container">
            <h3>Top Products by Stock</h3>
            <Bar data={topProducts} options={commonOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
