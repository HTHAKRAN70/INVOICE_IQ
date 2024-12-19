const express = require('express');
const { 
    getAllProducts, 
    getProductById, 
    createProduct, 
    deleteProduct, 
    searchProducts, 
    updateProduct, 
    updateProductStatus
} = require('../controllers/products');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/products/search', auth, searchProducts); 
router.get('/products', auth, getAllProducts);
router.post('/products', auth, createProduct);
router.get('/products/:id', auth, getProductById);
router.put('/products/:id', auth, updateProduct);
router.put('/products/:id/status', auth, updateProductStatus);
router.delete('/products/:id', auth, deleteProduct);

module.exports = router;