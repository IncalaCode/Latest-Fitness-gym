const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');


router.get('/expiring', membershipController.getExpiringMemberships);
router.post('/reminder/:membershipId', membershipController.sendMembershipReminder);

module.exports = router;