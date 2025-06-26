const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');
const authMiddleware = require('../middleware/authMiddleware');

// Admin-only routes
router.post('/', authMiddleware.protect, authMiddleware.authorize("admin"), packageController.createPackage);
router.get('/', packageController.getAllPackages);
router.get('/:id', packageController.getPackageById);
router.put('/:id', authMiddleware.protect, authMiddleware.authorize("admin"), packageController.updatePackage);
router.delete('/:id', authMiddleware.protect, authMiddleware.authorize("admin"), packageController.deletePackage);

module.exports = router;