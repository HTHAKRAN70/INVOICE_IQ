const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getAllInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
  deleteInvoice,
  getInvoiceStats
} = require('../controllers/invoice');

router.get('/invoices', auth, getAllInvoices);
router.get('/invoices/stats', auth, getInvoiceStats);
router.get('/invoices/:id', auth, getInvoiceById);
router.post('/invoices', auth, createInvoice);
router.put('/invoices/:id/status', auth, updateInvoiceStatus);
router.delete('/invoices/:id', auth, deleteInvoice);

module.exports = router;