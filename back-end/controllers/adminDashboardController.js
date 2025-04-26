const { User, Payment, CheckIn, Admin, sequelize } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total members count
    const totalMembers = await User.count({
      where: {
        role: 'Member',
        isActive: true
      }
    });

    // Get members active today (checked in today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const activeToday = await CheckIn.count({
      where: {
        checkInTime: {
          [Op.gte]: today
        }
      },
      distinct: true,
      col: 'userId'
    });

    // Get monthly revenue
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = await Payment.sum('amount', {
      where: {
        paymentstatus: 'completed',
        createdAt: {
          [Op.gte]: firstDayOfMonth
        }
      }
    }) || 0;

    // Get total bookings this week
    const firstDayOfWeek = new Date();
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);
    
    const weeklyBookings = await CheckIn.count({
      where: {
        checkInTime: {
          [Op.gte]: firstDayOfWeek
        }
      }
    });

    // Calculate percentage changes (placeholder logic - replace with actual calculations)
    const memberChange = await calculatePercentageChange('User', 'Member');
    const activeChange = await calculateActiveChange();
    const revenueChange = await calculateRevenueChange();
    const bookingsChange = await calculateBookingsChange();

    return res.status(200).json({
      success: true,
      data: {
        totalMembers,
        activeToday,
        monthlyRevenue,
        weeklyBookings,
        memberChange,
        activeChange,
        revenueChange,
        bookingsChange
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

// Helper function to calculate percentage change
async function calculatePercentageChange(model, role) {
  try {
    // Current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    // Previous month
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    let currentCount, previousCount;
    
    if (model === 'User') {
      currentCount = await User.count({
        where: {
          role: role,
          createdAt: {
            [Op.gte]: currentMonth
          }
        }
      });
      
      previousCount = await User.count({
        where: {
          role: role,
          createdAt: {
            [Op.gte]: previousMonth,
            [Op.lt]: currentMonth
          }
        }
      });
    }
    
    if (previousCount === 0) return '+100%';
    
    const percentageChange = ((currentCount - previousCount) / previousCount) * 100;
    return percentageChange > 0 ? `+${percentageChange.toFixed(0)}%` : `${percentageChange.toFixed(0)}%`;
  } catch (error) {
    console.error('Error calculating percentage change:', error);
    return '0%';
  }
}

// Calculate active members change
async function calculateActiveChange() {
  try {
    // Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayActive = await CheckIn.count({
      where: {
        checkInTime: {
          [Op.gte]: today
        }
      },
      distinct: true,
      col: 'userId'
    });
    
    const yesterdayActive = await CheckIn.count({
      where: {
        checkInTime: {
          [Op.gte]: yesterday,
          [Op.lt]: today
        }
      },
      distinct: true,
      col: 'userId'
    });
    
    if (yesterdayActive === 0) return '+100%';
    
    const percentageChange = ((todayActive - yesterdayActive) / yesterdayActive) * 100;
    return percentageChange > 0 ? `+${percentageChange.toFixed(0)}%` : `${percentageChange.toFixed(0)}%`;
  } catch (error) {
    console.error('Error calculating active change:', error);
    return '0%';
  }
}

// Calculate revenue change
async function calculateRevenueChange() {
  try {
    // Current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    // Previous month
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    
    const previousMonthStart = new Date(previousMonth);
    
    const currentRevenue = await Payment.sum('amount', {
      where: {
        paymentstatus: 'completed',
        createdAt: {
          [Op.gte]: currentMonth
        }
      }
    }) || 0;
    
    const previousRevenue = await Payment.sum('amount', {
      where: {
        paymentstatus: 'completed',
        createdAt: {
          [Op.gte]: previousMonthStart,
          [Op.lt]: currentMonth
        }
      }
    }) || 0;
    
    if (previousRevenue === 0) return '+100%';
    
    const percentageChange = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
    return percentageChange > 0 ? `+${percentageChange.toFixed(0)}%` : `${percentageChange.toFixed(0)}%`;
  } catch (error) {
    console.error('Error calculating revenue change:', error);
    return '0%';
  }
}

// Calculate bookings change
async function calculateBookingsChange() {
  try {
    // Current week
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    currentWeekStart.setHours(0, 0, 0, 0);
    
    // Previous week
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    
    const currentBookings = await CheckIn.count({
      where: {
        checkInTime: {
          [Op.gte]: currentWeekStart
        }
      }
    });
    
    const previousBookings = await CheckIn.count({
      where: {
        checkInTime: {
          [Op.gte]: previousWeekStart,
          [Op.lt]: currentWeekStart
        }
      }
    });
    
    if (previousBookings === 0) return '+100%';
    
    const percentageChange = ((currentBookings - previousBookings) / previousBookings) * 100;
    return percentageChange > 0 ? `+${percentageChange.toFixed(0)}%` : `${percentageChange.toFixed(0)}%`;
  } catch (error) {
    console.error('Error calculating bookings change:', error);
    return '0%';
  }
}
exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user.id; 
    const { firstName, lastName, password, currentPassword } = req.body;

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
