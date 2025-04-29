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
const calculateExpiryDate = (durationString, startDate = new Date()) => {
  const expiryDate = new Date(startDate);
  
  // If no duration provided, default to 30 days
  if (!durationString) {
    expiryDate.setDate(expiryDate.getDate() + 30);
    return expiryDate;
  }
  
  // Handle decimal notation (e.g., "1.5y")
  if (/^\d+\.\d+[ymwdh]$/.test(durationString)) {
    const unit = durationString.slice(-1);
    const value = parseFloat(durationString.slice(0, -1));
    
    switch (unit) {
      case 'h':
        expiryDate.setTime(expiryDate.getTime() + value * 60 * 60 * 1000);
        break;
      case 'd':
        expiryDate.setTime(expiryDate.getTime() + value * 24 * 60 * 60 * 1000);
        break;
      case 'w':
        expiryDate.setTime(expiryDate.getTime() + value * 7 * 24 * 60 * 60 * 1000);
        break;
      case 'm':
        // For partial months, calculate days (assuming 30 days per month)
        const fullMonths = Math.floor(value);
        const remainingDays = Math.round((value - fullMonths) * 30);
        expiryDate.setMonth(expiryDate.getMonth() + fullMonths);
        expiryDate.setDate(expiryDate.getDate() + remainingDays);
        break;
      case 'y':
        // For partial years, calculate months and days
        const fullYears = Math.floor(value);
        const remainingMonths = Math.floor((value - fullYears) * 12);
        const extraDays = Math.round(((value - fullYears) * 12 - remainingMonths) * 30);
        expiryDate.setFullYear(expiryDate.getFullYear() + fullYears);
        expiryDate.setMonth(expiryDate.getMonth() + remainingMonths);
        expiryDate.setDate(expiryDate.getDate() + extraDays);
        break;
    }
    
    return expiryDate;
  }
  
  // Handle combined format (e.g., "1y3m2w")
  const regex = /(\d+)([ymwdh])/g;
  let match;
  
  while ((match = regex.exec(durationString)) !== null) {
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h':
        expiryDate.setTime(expiryDate.getTime() + value * 60 * 60 * 1000);
        break;
      case 'd':
        expiryDate.setDate(expiryDate.getDate() + value);
        break;
      case 'w':
        expiryDate.setDate(expiryDate.getDate() + (value * 7));
        break;
      case 'm':
        expiryDate.setMonth(expiryDate.getMonth() + value);
        break;
      case 'y':
        expiryDate.setFullYear(expiryDate.getFullYear() + value);
        break;
    }
  }
  
  return expiryDate;
};

/**
 * Create a payment directly from admin panel
 * This creates a completed payment with a permanent QR code
 */
exports.createAdminPayment = async (req, res) => {
  try {
    const { userId, planTitle, amount, gender, duration } = req.body;

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

    // Generate transaction reference
    const txRef = `GYM-ADMIN-${uuidv4()}`;
    
    // Calculate payment and expiry dates
    const paymentDate = new Date();
    const expiryDate = calculateExpiryDate(duration, paymentDate);

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
