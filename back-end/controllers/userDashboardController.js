const db = require('../models');
const User = db.User;
const Payment = db.Payment;
const CheckIn = db.CheckIn;
const crypto = require('crypto');
const { Op } = require('sequelize');

const QR_SECRET_KEY = process.env.QR_SECRET_KEY || 'gym-membership-qr-secret-key';

const getDailySalt = () => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  return crypto.createHmac('sha256', QR_SECRET_KEY).update(dateString).digest('hex');
};

const generateQRData = (payment, user, isTemporary = false) => {
  const dailySalt = getDailySalt();
  
  const baseData = {
    paymentId: payment.id,
    userId: payment.userId,
    userName: user ? user.fullName : 'Gym Member',
    planTitle: payment.planTitle,
    membershipType: payment.planTitle,
    isTemporary
  };
  
  if (isTemporary) {
    baseData.status = 'pending';
    baseData.message = 'Payment pending approval. Please show this to the staff.';
  } else {
    baseData.status = 'active';
    
    if (payment.expiryDate) {
      baseData.expiryDate = payment.expiryDate;
    }
  }
  
  const signature = crypto
    .createHmac('sha256', QR_SECRET_KEY)
    .update(`${payment.id}-${dailySalt}`)
    .digest('hex');
  
  return {
    ...baseData,
    dailyCode: signature.substring(0, 8),
    signature,
    generatedOn: new Date().toISOString(),
    validForDate: new Date().toISOString().split('T')[0]
  };
};

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const now = new Date();
    
    const activePayment = await Payment.findOne({
      where: {
        userId,
        paymentstatus: 'completed',
        expiryDate: {
          [Op.gt]: now
        }
      },
      order: [['expiryDate', 'DESC']]
    });
    
    const checkIns = await CheckIn.findAll({
      where: { userId },
      order: [['checkInTime', 'DESC']],
      limit: 5
    });
    
    let membershipStatus = 'Inactive';
    let expirationDate = null;
    let qrCodeData = null;
    let pendingInCashPayment = null;
    
    if (activePayment) {
      membershipStatus = 'Active';
      expirationDate = activePayment.expiryDate;
      
      if (activePayment.qrCodeData) {
        try {
          const existingQrData = JSON.parse(activePayment.qrCodeData);
          const today = new Date().toISOString().split('T')[0];
          
          if (existingQrData.validForDate === today) {
            qrCodeData = existingQrData;
          } else {
            qrCodeData = generateQRData(activePayment, user, false);
            activePayment.qrCodeData = JSON.stringify(qrCodeData);
            await activePayment.save();
          }
        } catch (e) {
          qrCodeData = generateQRData(activePayment, user, false);
          activePayment.qrCodeData = JSON.stringify(qrCodeData);
          await activePayment.save();
        }
      } else {
        qrCodeData = generateQRData(activePayment, user, false);
        activePayment.qrCodeData = JSON.stringify(qrCodeData);
        await activePayment.save();
      }
    } else {
      const completedPaymentsCount = await Payment.count({
        where: {
          userId,
          paymentstatus: 'completed'
        }
      });
      
      if (completedPaymentsCount === 0) {

        pendingInCashPayment = await Payment.findOne({
          where: {
            userId,
            isTemporary: true,
            [db.Sequelize.Op.or]: [
              {
                paymentstatus: 'approvalPending',
                paymentMethod: 'online'
              },
              {
                paymentstatus: 'pending',
                paymentMethod: 'incash'
              }
            ]
          },
          order: [['createdAt', 'DESC']]
        });

        
        if (pendingInCashPayment) {
          membershipStatus = 'Pending Approval';
          qrCodeData = generateQRData(pendingInCashPayment, user, true);
          pendingInCashPayment.qrCodeData = JSON.stringify(qrCodeData);
          await pendingInCashPayment.save();
        }
      }
      
      // If no pending payment for new user or user has previous payments
      if (!pendingInCashPayment) {
        const expiredPayment = await Payment.findOne({
          where: {
            userId,
            paymentstatus: 'completed'
          },
          order: [['expiryDate', 'DESC']]
        });
        
        if (expiredPayment) {
          membershipStatus = 'Expired';
          expirationDate = expiredPayment.expiryDate;
        }
      }
    }
    
    const userData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      photoUrl: user.photoUrl,
      emergencyContact : user.emergencyContact,
      phone : user.phone,
      address : user.address,
      fitnessGoals : user.fitnessGoals,
      medicalConditions : user.medicalConditions,
      membershipType: activePayment ? activePayment.planTitle : 
                      pendingInCashPayment ? `${pendingInCashPayment.planTitle} (Pending)` : 'None',
      membershipStatus: membershipStatus,
      expirationDate: expirationDate ? new Date(expirationDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'N/A'
    };
    
    const formattedCheckIns = checkIns.map(checkIn => {
      const checkInTime = new Date(checkIn.checkInTime);
      const checkOutTime = checkIn.checkOutTime ? new Date(checkIn.checkOutTime) : null;
      
      let duration = 'N/A';
      if (checkOutTime) {
        const durationMs = checkOutTime - checkInTime;
        const durationMinutes = Math.floor(durationMs / 60000);
        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;
        duration = `${hours}h ${minutes}m`;
      }
      
      return {
        id: checkIn.id,
        date: checkInTime.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: checkInTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        duration,
        area: checkIn.area || 'Main Gym'
      };
    });
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const checkInsThisMonth = await CheckIn.count({
      where: {
        userId,
        checkInTime: {
          [Op.and]: [
            db.sequelize.where(db.sequelize.fn('MONTH', db.sequelize.col('checkInTime')), currentMonth + 1),
            db.sequelize.where(db.sequelize.fn('YEAR', db.sequelize.col('checkInTime')), currentYear)
          ]
        }
      }
    });
    
    const totalCheckIns = await CheckIn.count({
      where: { userId }
    });
    
    const averageDurationQuery = await CheckIn.findAll({
      where: {
        userId,
        checkOutTime: {
          [Op.ne]: null
        }
      },
      attributes: [
        [db.sequelize.fn('AVG', 
          db.sequelize.literal('TIMESTAMPDIFF(MINUTE, checkInTime, checkOutTime)')), 
        'avgDuration']
      ],
      raw: true
    });
    
    let averageDuration = '0h 0m';
    if (averageDurationQuery && averageDurationQuery[0] && averageDurationQuery[0].avgDuration) {
      const avgMinutes = Math.round(averageDurationQuery[0].avgDuration);
      const hours = Math.floor(avgMinutes / 60);
      const minutes = avgMinutes % 60;
      averageDuration = `${hours}h ${minutes}m`;
    }
    
    const stats = {
      totalCheckIns,
      checkInsThisMonth,
      averageDuration
    };
    
    return res.status(200).json({
      status: 'success',
      data: {
        userData,
        qrCodeData,
        stats,
        checkIns: formattedCheckIns,
        hasPendingInCashPayment: !!pendingInCashPayment
      }
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while fetching dashboard data',
      error: error.message
    });
  }
};
