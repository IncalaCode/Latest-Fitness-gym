const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/payinit', protect, paymentController.initializePayment);
router.get('/verify', paymentController.verifyPayment);
router.post('/incash/:paymentId/confirm', protect, authorize('admin'), paymentController.confirmInCashPayment);
router.post('/incash/:paymentId/cancel', protect, authorize('admin'), paymentController.cancelInCashPayment);
router.get('/status/:paymentId', protect, paymentController.getPaymentStatus);
router.get('/user', protect, paymentController.getUserPayments);
router.post('/refresh-qr/:paymentId', protect, paymentController.refreshQRCode);

module.exports = router;    
