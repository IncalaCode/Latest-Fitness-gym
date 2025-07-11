const { Op, where } = require('sequelize');
const { User, Payment, CheckIn , Package} = require('../models');

/**
 * Verify QR code and process accordingly
 * Handles both payment verification and check-in registration in a single function
 */
exports.verifyQRCode = async (req, res) => {
  try {
    const qrData = JSON.parse(req.body.qrData);
    qrData.scanned = true;

    // Now only paymentId is expected from qrData
    if (!qrData || !qrData.paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code data: paymentId required'
      });
    }

    // Fetch the payment using paymentId
    const payment = await Payment.findOne({
      where: { id: qrData.paymentId }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Extract userId, isTemporary, and status from payment
    const userId = payment.userId;
    const isTemporary = payment.isTemporary;
    const status = payment.status || payment.paymentstatus; // fallback to paymentstatus if status is not present

    // Fetch the user
    const user = await User.findOne({
      where: { id: userId },
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

    // Compose qrData for downstream logic
    qrData.userId = userId;
    qrData.isTemporary = isTemporary;
    qrData.status = status;

    // Process based on QR code type
    if (isTemporary && status === 'pending') {
      // HANDLE PENDING PAYMENT
      if (payment.paymentstatus !== 'pending' && payment.paymentstatus !== 'approvalPending') {
        if (payment.paymentstatus === 'completed') {
          return await handleCheckIn(req, res, user, payment, qrData);
        }
        return res.status(400).json({
          success: false,
          message: `Payment is already ${payment.paymentstatus}`,
          qrData: qrData
        });
      }
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
    } else if (!isTemporary && status === 'completed') {
      // HANDLE CHECK-IN FOR ACTIVE MEMBERSHIP
      return await handleCheckIn(req, res, user, payment, qrData);
    } else {
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

  // Check if membership is frozen
  if (payment.isFrozen) {
    return res.status(400).json({
      success: false,
      message: 'Membership is currently frozen',
      isFrozen: true,
      freezeEndDate: payment.freezeEndDate,
      paymentId: payment.id,
      qrData: qrData
    });
  }

  
const package = await Package.findOne({
  where: {
      id: payment.productId,
  }})

if (!package) {
  return res.status(400).json({
    success: false,
    message: 'Package not found'
  });
}

// Check access level restrictions if not full access
if (package.accessLevel !== 'full') {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();
  
  // Convert package times to comparable format
  const [startHour, startMin] = package.startTime.split(':').map(Number);
  const [endHour, endMin] = package.endTime.split(':').map(Number);
  
  // Add 2-hour buffer to start time (earlier access) and end time (later access)
  const bufferStartHour = (startHour - 2 + 24) % 24; // Handle negative hours
  const bufferEndHour = (endHour + 2) % 24; // Handle hours > 23
  
  // Check if current time is within allowed window (with 2-hour buffer)
  if (currentHour < bufferStartHour ||
      (currentHour === bufferStartHour && currentMinutes < startMin) ||
      currentHour > bufferEndHour ||
      (currentHour === bufferEndHour && currentMinutes > endMin)) {
    return res.status(400).json({
      success: false,
      message: `Access not allowed at this time. Package access hours: ${package.startTime} - ${package.endTime} (with 24 hour )`,
      currentTime: now.toTimeString().slice(0,5),
      allowedHours: `${package.startTime} - ${package.endTime}`,
      bufferHours: `${bufferStartHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')} - ${bufferEndHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`
    });
  }
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
  // Check number of passes
  if (typeof payment.totalPasses === 'number' && payment.totalPasses !== null) {
    if (payment.totalPasses <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No remaining passes for this membership',
        qrData: qrData
      });
    }
    // Decrement totalPasses
    payment.totalPasses -= 1;
    await payment.save();
  }
  // Create new check-in record
  const newCheckIn = await CheckIn.create({
    userId: payment.userId,
    checkInTime: new Date(),
    verificationMethod: 'qr_code',
    area: 'Main Gym', // Default area
    notes: `Check-in via QR code for ${payment.planTitle} membership`
  });

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
