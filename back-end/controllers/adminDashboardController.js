const { User, Payment, CheckIn, Admin, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const { getTotalRevenue } = require('./adminPaymentController');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total Active Members: not expired, not frozen
    const now = new Date();
    // Find users with an active, not-frozen, not-expired membership
    const activeMembers = await User.count({
      where: {
        role: 'Member',
        isActive: true
      },
      include: [{
        model: Payment,
        as: 'payments',
        required: true,
        where: {
          paymentstatus: 'completed',
          expiryDate: { [Op.gt]: now },
          isFrozen: false
        }
      }]
    });

    // Total Check-Ins Today (unique QR scans)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkInsToday = await CheckIn.count({
      where: {
        checkInTime: { [Op.gte]: today },
        verificationMethod: 'qr_code'
      },
      distinct: true,
      col: 'userId'
    });

    // Total Frozen Members (currently paused)
    // Members with at least one currently frozen, not expired, completed payment
    const frozenMembers = await User.count({
      where: {
        role: 'Member',
        isActive: true
      },
      include: [{
        model: Payment,
        as: 'payments',
        required: true,
      where: {
        paymentstatus: 'completed',
          expiryDate: { [Op.gt]: now },
          isFrozen: true
        }
      }]
    });

    // Total Trainers (registered trainers, filter: active/inactive)
    const totalTrainers = await sequelize.models.Trainer.count();
    const activeTrainers = await sequelize.models.Trainer.count({ where: { isActive: true } });
    const inactiveTrainers = await sequelize.models.Trainer.count({ where: { isActive: false } });

    // Fetch total revenue
    const totalRevenue = await getTotalRevenue();

    return res.status(200).json({
      success: true,
      data: {
        totalActiveMembers: activeMembers,
        totalCheckInsToday: checkInsToday,
        totalFrozenMembers: frozenMembers,
        totalTrainers,
        activeTrainers,
        inactiveTrainers,
        totalRevenue
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: error.message
    });
  }
};

exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { firstName, lastName, password } = req.body;

    // Find the admin by ID
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }


    const updateFields = {};

    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;

    if (password) {
      const salt = await bcrypt.genSalt(2);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    // If no fields to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    // Update the admin record using the instance method
    await admin.update(updateFields);

    // Return updated admin data (excluding password)
    const adminData = {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      role: admin.role
    };

    return res.status(200).json({
      success: true,
      message: 'Admin profile updated successfully',
      data: adminData
    });
  } catch (error) {
    console.error('Error updating admin profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update admin profile',
      error: error.message
    });
  }
};
