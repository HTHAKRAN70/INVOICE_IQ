const Invoice = require('../models/invoice');

const generateInvoiceNumber = async (branchId) => {
  try {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2); 
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 

    const lastInvoice = await Invoice.findOne({ branch: branchId })
      .sort({ createdAt: -1 })
      .select('invoiceNumber');

    let sequenceNumber = 1;

    if (lastInvoice && lastInvoice.invoiceNumber) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.slice(-4));
      sequenceNumber = lastSequence + 1;
    }

    const invoiceNumber = `INV-${year}-${month}-${branchId.toString().slice(-4)}-${sequenceNumber.toString().padStart(4, '0')}`;

    return invoiceNumber;
  } catch (error) {
    console.error('Error generating invoice number:', error);
    throw new Error('Failed to generate invoice number');
  }
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const calculateDueDate = (issueDate, paymentTerms) => {
  const date = new Date(issueDate);
  switch (paymentTerms) {
    case 'Net 7':
      date.setDate(date.getDate() + 7);
      break;
    case 'Net 15':
      date.setDate(date.getDate() + 15);
      break;
    case 'Net 30':
      date.setDate(date.getDate() + 30);
      break;
    case 'Due on Receipt':
      break;
    default:
      date.setDate(date.getDate() + 30); 
  }
  return date;
};

const isInvoiceOverdue = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return today > due;
};

const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

module.exports = {
  generateInvoiceNumber,
  validateEmail,
  formatCurrency,
  calculateDueDate,
  isInvoiceOverdue,
  generateRandomString,
  formatDate
};