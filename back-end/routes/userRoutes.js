const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', userController.register);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

router.get('/', protect, authorize('Admin',"receptionist"), userController.getAllUsers);
router.get('/filter-options', protect, authorize('Admin',"receptionist"), userController.getFilterOptions);
router.get('/:id', protect, userController.getUserById);
router.put('/:id', protect, userController.uploadProfilePhoto, userController.updateUser);
router.delete('/:id', protect, authorize('Admin',"receptionist"), userController.deleteUser);

module.exports = router;
