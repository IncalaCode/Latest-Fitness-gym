const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/expiring', protect, authorize('admin'), membershipController.getExpiringMemberships);
router.post('/reminder/:membershipId', protect, authorize('admin'), membershipController.sendMembershipReminder);

module.exports = router;