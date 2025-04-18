const { Payment, User } = require('../models');
const { Op } = require('sequelize');

exports.getExpiringMemberships = async (req, res) => {
  try {
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);
    const today = new Date();
    const expiringMemberships = await Payment.findAll({
      where: {
        status: 'completed',
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
          attributes: ['id', 'firstName', 'lastName', 'phoneNumber']
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
        name: `${membership.user.firstName} ${membership.user.lastName}`,
        phone: membership.user.phoneNumber,
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
    
    // Here you would implement the actual reminder sending logic
    // This could be an SMS, email, or notification
    
    // For now, we'll just return a success response
    return res.status(200).json({
      success: true,
      message: `Reminder sent to ${membership.user.firstName} ${membership.user.lastName}`
    });
  } catch (error) {
    console.error('Error sending membership reminder:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while sending reminder',
      error: error.message
    });
  }
};