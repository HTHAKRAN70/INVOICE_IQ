const Product = require('../models/product');

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ createdBy: req.user._id })
      .populate('category', 'name')
      .populate('branch', 'name location');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, createdBy: req.user._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      createdBy: req.user._id
    });
    const savedProduct = await (await newProduct.save())
      .populate('category', 'name')
      .populate('branch', 'name location');
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    .populate('category', 'name')
    .populate('branch', 'name location');
    
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    console.log('Deleting product:', req.params.id);
    await Product.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query, category, status, branch } = req.query;

    let searchCriteria = {
      createdBy: req.user._id
    };

    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if (category) {
      searchCriteria.category = category;
    }

    if (status) {
      searchCriteria.status = status;
    }

    if (branch) {
      searchCriteria.branch = branch;
    }

    const products = await Product.find(searchCriteria)
      .populate('category', 'name')
      .populate('branch', 'name location');

    res.json(products);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      message: 'Error searching products',
      error: error.message
    });
  }
};

exports.updateProductStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ message: 'Error updating product status', error: error.message });
  }
};