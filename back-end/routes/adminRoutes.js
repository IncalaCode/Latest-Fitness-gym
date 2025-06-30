const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminDashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const qr = require("../controllers/qrVerificationController");
const paymentFreezeController = require("../controllers/paymentFreezeController");

router.get("/stats", authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), adminController.getDashboardStats);
router.put("/update", authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), adminController.updateAdminProfile);
router.put("/verify", authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), qr.verifyQRCode);

// Payment freeze/unfreeze routes
router.post("/payment/freeze", authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), paymentFreezeController.freezePayment);
router.post("/payment/unfreeze", authMiddleware.protect, authMiddleware.authorize("admin","receptionist"), paymentFreezeController.unfreezePayment);

module.exports = router;
