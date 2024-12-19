const Category = require('../models/category');
const Product = require('../models/product');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ createdBy: req.user._id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ 
      createdBy: req.user._id,
      isActive: true 
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const existingCategory = await Category.findOne({ 
      name: name.trim(),
      createdBy: req.user._id 
    });

    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = new Category({
      name: name.trim(),
      description: description?.trim(),
      createdBy: req.user._id
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: 'Error creating category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, description, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: 'Error updating category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const productsUsingCategory = await Product.findOne({ category: req.params.id });
    if (productsUsingCategory) {
      return res.status(400).json({ 
        message: 'Cannot delete category as it is being used by products' 
      });
    }

    const deletedCategory = await Category.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
}; 