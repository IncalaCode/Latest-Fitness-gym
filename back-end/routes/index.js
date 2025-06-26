const express = require("express");
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/payment', require('./paymentRoutes'));
router.use('/dashboard', require("./userDashboardRoutes"));
router.use('/approvals', require('./pendingApprovalsRoutes'));
router.use('/memberships', require('./membershipRoutes'));
router.use('/packages', require('./packageRoutes'));
router.use('/trainers', require('./trainerRoutes'));
router.use("/admin", require("./adminRoutes"));

module.exports = router;
