const Invoice = require('../models/invoice');
const Product = require('../models/product');
const { generateInvoiceNumber } = require('../utils/index');

exports.getAllInvoices = async (req, res) => {
  try {
    const { branch, status } = req.query;
    const query = { createdBy: req.user._id };
    
    if (branch) query.branch = branch;
    if (status) query.status = status;

    const invoices = await Invoice.find(query)
      .populate('branch', 'name location')
      .populate('items.product', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    console.error('Fetch invoices error:', error);
    res.status(500).json({ 
      message: 'Error fetching invoices', 
      error: error.message 
    });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    })
    .populate('branch', 'name location')
    .populate('items.product', 'name')
    .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Fetch invoice error:', error);
    res.status(500).json({ 
      message: 'Error fetching invoice', 
      error: error.message 
    });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const {
      branch,
      client,
      items,
      paymentTerms,
      dueDate,
      issueDate
    } = req.body;

    if (!branch || !client || !items || items.length === 0) {
      return res.status(400).json({ 
        message: 'Missing required fields' 
      });
    }

    let totalAmount = 0;
    for (const item of items) {
      if (!item.product || !item.quantity || !item.price) {
        return res.status(400).json({ 
          message: 'Invalid item data' 
        });
      }
      
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ 
          message: `Product not found: ${item.product}` 
        });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient quantity for product: ${product.name}` 
        });
      }

      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: -item.quantity }
      });

      totalAmount += item.quantity * item.price;
    }

    const invoiceNumber = await generateInvoiceNumber(branch);

    const newInvoice = new Invoice({
      invoiceNumber,
      branch,
      client: {
        name: client.name,
        email: client.email
      },
      items: items.map(item => ({
        product: item.product,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        amount: item.quantity * item.price
      })),
      totalAmount,
      paymentTerms,
      dueDate: new Date(dueDate),
      issueDate: new Date(issueDate),
      createdBy: req.user._id,
      status: 'Pending'
    });

    const savedInvoice = await newInvoice.save();
    
    const populatedInvoice = await Invoice.findById(savedInvoice._id)
      .populate('branch', 'name location')
      .populate('items.product', 'name')
      .populate('createdBy', 'name email');

    res.status(201).json(populatedInvoice);
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(400).json({ 
      message: 'Error creating invoice', 
      error: error.message 
    });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['Pending', 'Paid', 'Overdue'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status value' 
      });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { 
        _id: req.params.id, 
        createdBy: req.user._id 
      },
      { status },
      { 
        new: true, 
        runValidators: true 
      }
    )
    .populate('branch', 'name location')
    .populate('items.product', 'name')
    .populate('createdBy', 'name email');

    if (!invoice) {
      return res.status(404).json({ 
        message: 'Invoice not found' 
      });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Update invoice status error:', error);
    res.status(400).json({ 
      message: 'Error updating invoice status', 
      error: error.message 
    });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!invoice) {
      return res.status(404).json({ 
        message: 'Invoice not found' 
      });
    }

    for (const item of invoice.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { quantity: item.quantity }
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ 
      message: 'Error deleting invoice', 
      error: error.message 
    });
  }
};

exports.getInvoiceStats = async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error('Invoice stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching invoice statistics', 
      error: error.message 
    });
  }
};
