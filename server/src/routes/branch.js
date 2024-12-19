const express = require('express');
const { 
    getAllBranches,
    getBranchById,
    createBranch,
    updateBranch,
    deleteBranch,
    getActiveBranches
} = require('../controllers/branch');
const { auth } = require('../middleware/auth');
const router = express.Router();

router.get('/branches', auth, getAllBranches);
router.get('/branches/active', auth, getActiveBranches);
router.get('/branches/:id', auth, getBranchById);
router.post('/branches', auth, createBranch);
router.put('/branches/:id', auth, updateBranch);
router.delete('/branches/:id', auth, deleteBranch);

module.exports = router; 