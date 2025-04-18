const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/payment', require('./paymentRoutes'));
router.use('/dashboard' , require("./userDashboardRoutes"))


module.exports = router;
