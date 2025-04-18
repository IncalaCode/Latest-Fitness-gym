const { User, CheckIn } = require("../models");
const { Op } = require("sequelize");

exports.getDashboardStats = async (req, res) => {
  try {
    // Total active members
    const totalMembers = await User.count({
      where: { isActive: true },
    });

    // Members who checked in today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const checkInsToday = await CheckIn.count({
      where: {
        checkInTime: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        activeToday: checkInsToday,
      },
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
