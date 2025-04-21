const { Op } = require('sequelize');
const { User, Payment, CheckIn } = require('../models');
const crypto = require('crypto');

/**
 * Verify QR code and process accordingly
 * Handles both payment verification and check-in registration in a single function
 */
exports.verifyQRCode = async (req, res) => {
  try {
    const qrData = JSON.parse(req.body.qrData);
    
    // Basic validation
    if (!qrData || !qrData.paymentId || !qrData.userId || !qrData.signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data'
      });
    }

    // Verify the user exists
    const user = await User.findOne({
      where: { id: qrData.userId },
      attributes: {
        exclude: ['password', 'forgetPasswordToken', 'forgetPasswordExpires']
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify the payment exists
    const payment = await Payment.findOne({
      where: { 
        id: qrData.paymentId,
        userId: qrData.userId
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Verify QR code signature
    const verifySignature = (data, signature) => {
      // Create a string from the data to hash
      const dataString = `${data.paymentId}${data.userId}${data.dailyCode}${data.validForDate}`;
      // Create hash
      const hash = crypto.createHash('sha256').update(dataString).digest('hex');
      // Compare with provided signature
      return hash === signature;
    };

    if (!verifySignature(qrData, qrData.signature)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code signature'
      });
    }

    // Verify QR code is not expired (valid only for the current date)
    const today = new Date().toISOString().split('T')[0];
    if (qrData.validForDate !== today) {
      return res.status(400).json({
        success: false,
        message: 'QR code has expired',
        validForDate: qrData.validForDate,
        currentDate: today
      });
    }

    // Process based on QR code type
    if (qrData.isTemporary && qrData.status === 'pending') {
      // HANDLE PENDING PAYMENT
      
      // Verify payment is still pending
      if (payment.paymentstatus !== 'pending' && payment.paymentstatus !== 'approvalPending') {
        return res.status(400).json({
          success: false,
          message: `Payment is already ${payment.paymentstatus}`
        });
      }

      // Verify payment is temporary
      if (!payment.isTemporary) {
        return res.status(400).json({
          success: false,
          message: 'Payment is not marked as temporary'
        });
      }

      // Verify QR data matches payment record
      if (payment.planTitle !== qrData.planTitle) {
        return res.status(400).json({
          success: false,
          message: 'QR code data does not match payment record'
        });
      }

      // Return payment details for staff to approve
      return res.status(200).json({
        success: true,
        message: 'Payment pending approval',
        data: {
          payment: {
            id: payment.id,
            planTitle: payment.planTitle,
            amount: payment.amount,
            paymentstatus: payment.paymentstatus,
            paymentMethod: payment.paymentMethod,
            createdAt: payment.createdAt
          },
          user: user
        }
      });
      
    } else if (!qrData.isTemporary && qrData.status === 'active') {
      // HANDLE CHECK-IN FOR ACTIVE MEMBERSHIP
      
      // Verify payment is completed
      if (payment.paymentstatus !== 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Membership is not active',
          status: payment.paymentstatus
        });
      }

      // Check if membership has expired
      if (payment.expiryDate && new Date(payment.expiryDate) < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Membership has expired',
          expiryDate: payment.expiryDate
        });
      }

      // Check if user has already checked in today
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const todayCheckIn = await CheckIn.findOne({
        where: {
          userId: payment.userId,
          checkInTime: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      });

      if (todayCheckIn) {
        return res.status(400).json({
          success: false,
          message: 'User has already checked in today',
          data: {
            checkIn: todayCheckIn,
            checkInTime: todayCheckIn.checkInTime
          }
        });
      }

      // Create new check-in record
      const newCheckIn = await CheckIn.create({
        userId: payment.userId,
        checkInTime: new Date(),
        verificationMethod: 'qr_code',
        area: 'Main Gym', // Default area
        notes: `Check-in via QR code for ${payment.planTitle} membership`
      });

      return res.status(201).json({
        success: true,
        message: 'Check-in successful',
        data: {
          checkIn: newCheckIn,
          user: user,
          membership: {
            planTitle: payment.planTitle,
            expiryDate: payment.expiryDate
          }
        }
      });
    } else {
      // If QR code doesn't match expected types
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code type'
      });
    }
    
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};