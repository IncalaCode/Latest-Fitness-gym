const { Payment, User } = require('../models');
const { Op } = require('sequelize');
const { sendMembershipExpirationReminder } = require('../utils/emailService');

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

    // Format the response data
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
    const { days = 7 } = req.body; // Default to 7 days if not specified
    
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
