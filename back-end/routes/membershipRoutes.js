const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { route } = require('./pendingApprovalsRoutes');

router.use(protect)
router.use(authorize('admin'))
router.get('/expiring', membershipController.getExpiringMemberships);
router.post('/reminder/:membershipId', membershipController.sendMembershipReminder);
router.post('/reassign-trainer', membershipController.reassignOrRemoveTrainer);
router.post('/upgrade', membershipController.upgradeMembership);

module.exports = router;