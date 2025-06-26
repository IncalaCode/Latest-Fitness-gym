const express = require('express');
const router = express.Router();
const userDashboardController = require('../controllers/userDashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, userDashboardController.getDashboardData);

module.exports = router;