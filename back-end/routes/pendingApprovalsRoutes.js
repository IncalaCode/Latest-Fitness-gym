const express = require('express');
const router = express.Router();
const { 
  getPendingApprovals, 
  approveUser, 
  rejectUser,
  getPendingApprovalDetails
} = require('../controllers/pendingApprovalsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));
router.get('/', getPendingApprovals);
router.get('/:id', getPendingApprovalDetails);
router.get('/:id/approve', approveUser);
router.get('/:id/reject', rejectUser);

module.exports = router;