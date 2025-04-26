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
    qrData.scanned = true;
    
    // Basic validation
    if (!qrData || !qrData.paymentId || !qrData.userId) {
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


    // Process based on QR code type
    if (qrData.isTemporary && qrData.status === 'pending') {
      // HANDLE PENDING PAYMENT
      
      // Verify payment is still pending
      if (payment.paymentstatus !== 'pending' && payment.paymentstatus !== 'approvalPending') {
        // If payment is completed, proceed to check-in
        if (payment.paymentstatus === 'completed') {
          return await handleCheckIn(req, res, user, payment, qrData);
        }
        
        return res.status(400).json({
          success: false,
          message: `Payment is already ${payment.paymentstatus}`,
          qrData: qrData
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
        },
        qrData: qrData
      });
      
    } else if (!qrData.isTemporary && qrData.status === 'active') {
      // HANDLE CHECK-IN FOR ACTIVE MEMBERSHIP
      return await handleCheckIn(req, res, user, payment, qrData);
    } else {
      // If QR code doesn't match expected types
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code type',
        qrData: qrData
      });
    }
    
  } catch (error) {
    console.error('Error verifying QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'error verifying QR code',
      error: error.message
    });
  }
};


async function handleCheckIn(req, res, user, payment, qrData) {
  // Verify payment is completed
  if (payment.paymentstatus !== 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Membership is not active',
      status: payment.paymentstatus,
      qrData: qrData
    });
  }

  // Check if membership has expired
  if (payment.expiryDate && new Date(payment.expiryDate) < new Date()) {
    return res.status(400).json({
      success: false,
      message: 'Membership has expired',
      expiryDate: payment.expiryDate,
      qrData: qrData
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
      },
      qrData: qrData
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

  payment.qrCodeData = JSON.stringify(qrData) 
  await payment.save()

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
    },
    qrData: qrData
  });
}
