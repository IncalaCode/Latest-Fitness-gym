const { Payment, User } = require('../models');
const { Op } = require('sequelize');
const { sendMembershipExpirationReminder } = require('../utils/emailService');
const { generateQRData } = require('./paymentController');

exports.getExpiringMemberships = async (req, res) => {
  try {
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    const today = new Date();
    const expiringMemberships = await Payment.findAll({
      where: {
        paymentstatus: 'completed',
        expiryDate: {
          [Op.and]: {
            [Op.gte]: today,
            [Op.lte]: fiveDaysFromNow
          }
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'phone']
        }
      ],
      order: [['expiryDate', 'ASC']]
    });

    const formattedMemberships = expiringMemberships.map(membership => {
      const expiryDate = new Date(membership.expiryDate);
      const today = new Date();
      
      // Calculate days remaining
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      return {
        id: membership.id,
        name: membership.user.fullName,
        phone: membership.user.phone,
        membershipType: membership.planTitle,
        expirationDate: membership.expiryDate.toISOString().split('T')[0],
        daysRemaining: daysRemaining
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedMemberships.length,
      data: formattedMemberships
    });
  } catch (error) {
    console.error('Error fetching expiring memberships:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching expiring memberships',
      error: error.message
    });
  }
};


exports.sendMembershipReminder = async (req, res) => {
  try {
    const { membershipId } = req.params;
    
    // Find the membership
    const membership = await Payment.findOne({
      where: { id: membershipId },
      include: [{ model: User, as: 'user' }]
    });
    
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }
    
    // Calculate days remaining until expiration
    const expiryDate = new Date(membership.expiryDate);
    const today = new Date();
    const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    
    try {
      // Send the email reminder
      await sendMembershipExpirationReminder(
        membership.user,
        membership,
        daysRemaining
      );
      
      return res.status(200).json({
        success: true,
        message: `Reminder sent to ${membership.user.fullName}`,
        daysRemaining
      });
    } catch (emailError) {
      console.error('Error sending email reminder:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Error sending email reminder',
        error: emailError.message
      });
    }
  } catch (error) {
    console.error('Error sending membership reminder:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending reminder',
      error: error.message
    });
  }
};

exports.sendExpirationReminders = async (req, res) => {
  try {
    const { days = 7 } = req.body;
    
    // Calculate the date range for expiring memberships
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + parseInt(days));
    
    // Find memberships expiring in the specified number of days
    const expiringMemberships = await Payment.findAll({
      where: {
        paymentstatus: 'completed',
        expiryDate: {
          [Op.gte]: today, // Greater than or equal to today
          [Op.lte]: targetDate // Less than or equal to target date
        }
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', "fullName", 'email', 'phone']
        }
      ]
    });
    
    if (expiringMemberships.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No memberships expiring in the specified time frame',
        count: 0
      });
    }
    
    // Send reminders to each member
    const reminderResults = await Promise.all(
      expiringMemberships.map(async (membership) => {
        // Skip if user is not found or has no email
        if (!membership.user || !membership.user.email) {
          return {
            membershipId: membership.id,
            success: false,
            message: 'User not found or has no email'
          };
        }
        
        // Calculate days remaining until expiration
        const expiryDate = new Date(membership.expiryDate);
        const daysRemaining = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        try {
          // Send the email reminder
          await sendMembershipExpirationReminder(
            membership.user,
            membership,
            daysRemaining
          );
          
          return {
            membershipId: membership.id,
            userId: membership.user.id,
            email: membership.user.email,
            daysRemaining,
            success: true
          };
        } catch (error) {
          console.error(`Error sending reminder for membership ${membership.id}:`, error);
          return {
            membershipId: membership.id,
            userId: membership.user.id,
            email: membership.user.email,
            success: false,
            message: error.message
          };
        }
      })
    );
    
    // Count successful reminders
    const successfulReminders = reminderResults.filter(result => result.success);
    
    res.status(200).json({
      success: true,
      message: `Successfully sent ${successfulReminders.length} out of ${expiringMemberships.length} reminders`,
      count: expiringMemberships.length,
      successCount: successfulReminders.length,
      results: reminderResults
    });
  } catch (error) {
    console.error('Error sending expiration reminders:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Reassign or remove trainer for a member
exports.reassignOrRemoveTrainer = async (req, res) => {
  try {
    const { memberId, trainerId, trainerDescription } = req.body;
    if (!memberId) {
      return res.status(400).json({
        success: false,
        message: 'memberId is required'
      });
    }
    const member = await User.findByPk(memberId);
    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    if (trainerId) {
      member.trainerId = trainerId.selectedTrainer;
      member.trainerDescription = trainerId.description;
      
      await member.save();
      return res.status(200).json({
        success: true,
        message: 'Trainer reassigned successfully',
        memberId,
        trainerId
      });
    } else {
      // Remove trainer
      member.trainerId = null;
      await member.save();
      return res.status(200).json({
        success: true,
        message: 'Trainer removed successfully',
        memberId
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Upgrade a member's package (admin action)
exports.upgradeMembership = async (req, res) => {
  try {
    const { memberId, newPackageId, price, duration } = req.body;
    if (!memberId || !newPackageId) {
      return res.status(400).json({
        success: false,
        message: 'memberId and newPackageId are required'
      });
    }
    const user = await User.findByPk(memberId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }
    const pkg = await require('../models').Package.findByPk(newPackageId);
    if (!pkg) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }
    // Expire current active payment
    const now = new Date();
    // Find current active payment
    const currentPayment = await require('../models').Payment.findOne({
      where: {
        userId: memberId,
        paymentstatus: 'completed',
        expiryDate: { [Op.gt]: now },
        isFrozen: false
      },
      order: [['expiryDate', 'DESC']]
    });
    let daysUsed = 0;
    if (currentPayment) {
      const paymentStart = currentPayment.paymentDate ? new Date(currentPayment.paymentDate) : null;
      const paymentEnd = currentPayment.expiryDate ? new Date(currentPayment.expiryDate) : null;
      if (paymentStart && paymentEnd) {
        const msUsed = now - paymentStart;
        daysUsed = Math.floor(msUsed / (1000 * 60 * 60 * 24));
        if (daysUsed < 0) daysUsed = 0;
      }
      // Expire the current payment
      await currentPayment.update({ expiryDate: now });
    } else {
      // No current payment, nothing to expire
    }
    // Calculate new expiry date
    let newDuration = duration ? parseInt(duration) : pkg.duration;
    let effectiveDuration = newDuration;
    if (daysUsed > 0 && newDuration > daysUsed) {
      effectiveDuration = newDuration - daysUsed;
    }
    const paymentDate = now;
    const expiryDate = new Date(now.getTime() + effectiveDuration * 24 * 60 * 60 * 1000);
    const txRef = `UPGRADE-${Date.now()}-${Math.floor(Math.random()*10000)}`;
    const newPayment = await require('../models').Payment.create({
      userId: memberId,
      planTitle: `UPGRADE -${pkg.name} - ${pkg.duration} days`,
      amount: price || pkg.price,
      currency: 'ETB',
      txRef,
      paymentstatus: 'completed',
      paymentMethod: 'admin-upgrade',
      paymentDate,
      expiryDate,
      isTemporary: false,
      isFrozen: false,
      productId: newPackageId,
      totalPasses: pkg.numberOfPasses || 0
    });
    // Generate and save QR code data
    const qrData = generateQRData(newPayment, user, false);
    newPayment.qrCodeData = JSON.stringify(qrData);
    await newPayment.save();
    return res.status(200).json({
      success: true,
      message: 'Membership upgraded successfully',
      data: newPayment
    });
  } catch (error) {
    console.error('Error upgrading membership:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while upgrading membership',
      error: error.message
    });
  }
};
