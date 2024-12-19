const Branch = require('../models/branch');

exports.getAllBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ createdBy: req.user._id });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branches', error: error.message });
  }
};

exports.getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching branch', error: error.message });
  }
};

exports.createBranch = async (req, res) => {
  try {
    const { name, location } = req.body;

    const existingBranch = await Branch.findOne({ 
      name: name.trim(),
      createdBy: req.user._id 
    });

    if (existingBranch) {
      return res.status(400).json({ message: 'Branch with this name already exists' });
    }

    const newBranch = new Branch({
      name: name.trim(),
      location: location.trim(),
      createdBy: req.user._id
    });

    const savedBranch = await newBranch.save();
    res.status(201).json(savedBranch);
  } catch (error) {
    res.status(400).json({ message: 'Error creating branch', error: error.message });
  }
};

exports.updateBranch = async (req, res) => {
  try {
    const { name, location, isActive } = req.body;
    
    const updatedBranch = await Branch.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { name, location, isActive, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json(updatedBranch);
  } catch (error) {
    res.status(400).json({ message: 'Error updating branch', error: error.message });
  }
};

exports.deleteBranch = async (req, res) => {
  try {
    const productsUsingBranch = await Product.findOne({ branch: req.params.id });
    if (productsUsingBranch) {
      return res.status(400).json({ 
        message: 'Cannot delete branch as it is being used by products' 
      });
    }

    const deletedBranch = await Branch.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });

    if (!deletedBranch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting branch', error: error.message });
  }
};

exports.getActiveBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ 
      createdBy: req.user._id,
      isActive: true 
    });
    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active branches', error: error.message });
  }
}; 