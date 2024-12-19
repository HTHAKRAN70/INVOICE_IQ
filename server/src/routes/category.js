const express = require('express');
const { 
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getActiveCategories
} = require('../controllers/category');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/categories', auth, getAllCategories);
router.get('/categories/active', auth, getActiveCategories);
router.post('/categories', auth, createCategory);
router.put('/categories/:id', auth, updateCategory);
router.delete('/categories/:id', auth, deleteCategory);

module.exports = router; 