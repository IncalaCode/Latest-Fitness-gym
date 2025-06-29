const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const dotenv = require('dotenv');
const db = require('../models');
const Payment = db.Payment;
const User = db.User;

dotenv.config();

const QR_SECRET_KEY = process.env.QR_SECRET_KEY;

// Helper function to generate permanent QR data
const generatePermanentQRData = (payment, user) => {
  // Create a permanent signature that won't change daily
  const permanentSignature = crypto
    .createHmac('sha256', QR_SECRET_KEY)
    .update(`${payment.id}-${user.id}-permanent`)
    .digest('hex');
  
  return {
    productId: payment.productId,
    paymentId: payment.id,
    userId: payment.userId,
    userName: user ? user.fullName : 'Gym Member',
    planTitle: payment.planTitle,
    membershipType: payment.planTitle,
    status: 'active',
    expiryDate: payment.expiryDate,
    permanentCode: permanentSignature.substring(0, 8),
    signature: permanentSignature,
    generatedOn: new Date().toISOString(),
    isPermanent: true
  };
};

/**
 * Parse duration string and calculate expiry date
 * Supports formats like:
 * - "1h" (1 hour)
 * - "1d" (1 day)
 * - "1w" (1 week)
 * - "1m" (1 month)
 * - "1y" (1 year)
 * - "1y3m" (1 year and 3 months)
 * - "1.5y" (1.5 years)
 */
const calculateExpiryDate = (durationString) => {
  const regex = /(\d+)([ymwdh])/g;
  let match = regex.exec(durationString)
  return  parseInt(match[1]) ;
};

/**
 * Create a payment directly from admin panel
 * This creates a completed payment with a permanent QR code
 */
exports.createAdminPayment = async (req, res) => {
  try {
    const { userId, planTitle, amount, gender, duration, packageId } = req.body;

    // Validate required fields
    if (!userId || !planTitle || !amount) {
      return res.status(400).json({ 
        status: 'error',
        message: 'User ID, plan title, and amount are required' 
      });
    }

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 'error',
        message: 'User not found' 
      });
    }

    // If packageId is provided, fetch package for productId and totalPasses
    let productId = null;
    let totalPasses = 0;
    if (packageId) {
      const pkg = await db.Package.findByPk(packageId);
      if (pkg) {
        productId = pkg.id;
        totalPasses = pkg.numberOfPasses || 0;
      }
    }

    // Generate transaction reference
    const txRef = `GYM-ADMIN-${uuidv4()}`;
    
    // Calculate payment and expiry dates
    const paymentDate = new Date();
    const expiryDate =  new Date(paymentDate.getTime() + calculateExpiryDate(duration) * 24 * 60 * 60 * 1000);

    // Create the payment record
    const payment = await Payment.create({
      userId,
      planTitle,
      amount,
      currency: 'ETB',
      txRef,
      gender,
      paymentstatus: 'completed',
      paymentMethod: 'admin',
      paymentDate,
      expiryDate,
      isTemporary: false,
      productId: productId || packageId || null,
      totalPasses
    });

    // Generate permanent QR code data
    const qrData = generatePermanentQRData(payment, user);
    
    // Save QR data to payment record
    payment.qrCodeData = JSON.stringify(qrData);
    await payment.save();

    return res.status(201).json({
      status: 'success',
      message: 'Payment created successfully by admin',
      payment,
      qrCodeData: qrData
    });
  } catch (error) {
    console.error('Admin payment creation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while creating the payment',
      error: error.message
    });
  }
};
