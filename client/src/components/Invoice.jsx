import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';
import './Invoice.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const INITIAL_INVOICE_STATE = {
  customerName: '',
  customerEmail: '',
  invoiceNumber: '',
  date: new Date().toISOString().split('T')[0],
  dueDate: '',
  branch: '',
  paymentTerms: 'Net 30',
  items: [{ productId: '', description: '', quantity: '', price: '', amount: '0.00' }],
};

const Invoice = () => {
  const [invoiceData, setInvoiceData] = useState(INITIAL_INVOICE_STATE);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const name = localStorage.getItem('userName');
    if (name) setUserName(name);
    fetchBranches();
    fetchProducts();
  }, []);

  const fetchBranches = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/branches/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBranches(response.data);
    } catch (error) {
      setError('Failed to fetch branches');
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProducts(response.data);
    } catch (error) {
      setError('Failed to fetch products');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const newItems = [...invoiceData.items];

    if (name === 'productId') {
      const selectedProduct = products.find(p => p._id === value);
      if (selectedProduct) {
        newItems[index] = {
          ...newItems[index],
          productId: value,
          description: selectedProduct.name,
          price: selectedProduct.price.toString(),
          amount: (selectedProduct.price * (newItems[index].quantity || 1)).toFixed(2)
        };
      }
    } else {
      newItems[index] = {
        ...newItems[index],
        [name]: value,
        amount: name === 'quantity' || name === 'price'
          ? (parseFloat(value || 0) * parseFloat(newItems[index][name === 'quantity' ? 'price' : 'quantity'] || 0)).toFixed(2)
          : newItems[index].amount
      };
    }

    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: '', price: '', amount: '0.00' }]
    }));
  };

  const removeItem = (index) => {
    if (invoiceData.items.length === 1) {
      setError('Invoice must have at least one item');
      return;
    }
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((total, item) => {
      return total + parseFloat(item.amount || 0);
    }, 0).toFixed(2);
  };

  const validateInvoice = () => {
    if (!invoiceData.customerName) return 'Customer name is required';
    if (!invoiceData.customerEmail) return 'Customer email is required';
    if (!invoiceData.branch) return 'Branch is required';
    if (!invoiceData.date) return 'Invoice date is required';
    if (!invoiceData.dueDate) return 'Due date is required';

    const invalidItems = invoiceData.items.some(item =>
      !item.description || !item.quantity || !item.price ||
      isNaN(item.quantity) || isNaN(item.price) ||
      parseFloat(item.quantity) <= 0 || parseFloat(item.price) <= 0
    );

    if (invalidItems) return 'All items must have valid description, quantity, and price';
    return '';
  };

  const handleGenerateInvoice = async () => {
    const validationError = validateInvoice();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      const invoicePayload = {
        branch: invoiceData.branch,
        client: {
          name: invoiceData.customerName,
          email: invoiceData.customerEmail
        },
        items: invoiceData.items.map(item => ({
          product: item.productId,
          description: item.description,
          quantity: parseFloat(item.quantity),
          price: parseFloat(item.price),
          amount: parseFloat(item.amount)
        })),
        totalAmount: parseFloat(calculateTotal()),
        paymentTerms: invoiceData.paymentTerms,
        dueDate: invoiceData.dueDate,
        issueDate: invoiceData.date
      };

      const response = await axios.post(`${API_URL}/invoices`, invoicePayload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Generate PDF
      const doc = new jsPDF();

      // Add company logo/header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 105, 20, { align: 'center' });

      // Add invoice details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      // Left side info
      doc.text(`Invoice Number: ${response.data.invoiceNumber}`, 20, 40);
      doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, 20, 45);
      doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 20, 50);

      // Right side info
      doc.text(`To:`, 120, 40);
      doc.text(`${invoiceData.customerName}`, 120, 45);
      doc.text(`${invoiceData.customerEmail}`, 120, 50);

      // Add items table
      const tableColumn = ["Description", "Quantity", "Price", "Amount"];
      const tableRows = invoiceData.items.map(item => [
        item.description,
        item.quantity,
        `$${parseFloat(item.price).toFixed(2)}`,
        `$${item.amount}`
      ]);

      doc.autoTable({
        startY: 60,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [16, 18, 79], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        margin: { top: 60 }
      });

      // Add total
      const finalY = doc.lastAutoTable.finalY || 60;
      doc.text(`Total Amount: $${calculateTotal()}`, 150, finalY + 10);

      // Add payment terms
      doc.text(`Payment Terms: ${invoiceData.paymentTerms}`, 20, finalY + 20);

      // Save PDF
      doc.save(`invoice-${response.data.invoiceNumber}.pdf`);

      // Reset form
      setInvoiceData(INITIAL_INVOICE_STATE);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice">
      <div className="sidebar">
        <div className="sidebar-buttons">
          <button onClick={() => window.location.href = '/dashboard'}
            className={window.location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard
          </button>
          <button onClick={() => window.location.href = '/inventory'}
            className={window.location.pathname === '/inventory' ? 'active' : ''}>
            Inventory
          </button>
          <button onClick={() => window.location.href = '/invoice'}
            className={window.location.pathname === '/invoice' ? 'active' : ''}>
            Invoice
          </button>
          <button onClick={() => window.location.href = '/branches'}
            className={window.location.pathname === '/branches' ? 'active' : ''}>
            Branches
          </button>
          <button onClick={() => window.location.href = '/categories'}
            className={window.location.pathname === '/categories' ? 'active' : ''}>
            Categories
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="invoice-form">
          <h1>Generate Invoice</h1>
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <div className="input-container">
              <label htmlFor="customerName">Customer Name *</label>
              <input
                id="customerName"
                type="text"
                name="customerName"
                value={invoiceData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-container">
              <label htmlFor="customerEmail">Customer Email *</label>
              <input
                id="customerEmail"
                type="email"
                name="customerEmail"
                value={invoiceData.customerEmail}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-container">
              <label htmlFor="branch">Branch *</label>
              <select
                id="branch"
                name="branch"
                value={invoiceData.branch}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <div className="input-container">
              <label htmlFor="date">Invoice Date *</label>
              <input
                id="date"
                type="date"
                name="date"
                value={invoiceData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-container">
              <label htmlFor="dueDate">Due Date *</label>
              <input
                id="dueDate"
                type="date"
                name="dueDate"
                value={invoiceData.dueDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="input-container">
              <label htmlFor="paymentTerms">Payment Terms</label>
              <select
                id="paymentTerms"
                name="paymentTerms"
                value={invoiceData.paymentTerms}
                onChange={handleInputChange}
              >
                <option value="Net 30">Net 30</option>
                <option value="Net 15">Net 15</option>
                <option value="Net 7">Net 7</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
          </div>

          <div className="items-section">
            <h2>Items</h2>
            {invoiceData.items.map((item, index) => (
              <div className="item-row" key={index}>
                <div className="input-container">
                  <label htmlFor={`product-${index}`}>Product *</label>
                  <select
                    id={`product-${index}`}
                    name="productId"
                    value={item.productId}
                    onChange={(e) => handleItemChange(index, e)}
                    required
                    className="product-select"
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product._id} value={product._id}>
                        {product.name} - ${product.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-container">
                  <label htmlFor={`description-${index}`}>Description</label>
                  <input
                    id={`description-${index}`}
                    type="text"
                    name="description"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, e)}
                    readOnly
                  />
                </div>

                <div className="input-container">
                  <label htmlFor={`quantity-${index}`}>Quantity *</label>
                  <input
                    id={`quantity-${index}`}
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    min="1"
                    required
                  />
                </div>

                <div className="input-container">
                  <label htmlFor={`price-${index}`}>Price *</label>
                  <input
                    id={`price-${index}`}
                    type="number"
                    name="price"
                    value={item.price}
                    onChange={(e) => handleItemChange(index, e)}
                    readOnly
                  />
                </div>

                <div className="input-container">
                  <label>Amount</label>
                  <input
                    type="text"
                    value={`$${item.amount}`}
                    readOnly
                    className="amount-input"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="remove-item-btn"
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" onClick={addItem} className="add-item-btn">
              Add Item
            </button>
          </div>

          <div className="total-section">
            <h3>Total: ${calculateTotal()}</h3>
          </div>

          <button
            className="generate-btn"
            onClick={handleGenerateInvoice}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
