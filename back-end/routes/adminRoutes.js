const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminDashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const qr = require("../controllers/qrVerificationController")

router.get("/stats", authMiddleware.protect, authMiddleware.authorize("admin"), adminController.getDashboardStats);
router.put("/update", authMiddleware.protect, authMiddleware.authorize("admin"), adminController.updateAdminProfile);
router.put("/verify", authMiddleware.protect, authMiddleware.authorize("admin"), qr.verifyQRCode);


module.exports = router;
