const { Op } = require('sequelize');
const { User, Payment } = require('../models');
const {calculateExpiryDate , generateQRData } =  require("./paymentController")

exports.getPendingApprovals = async (req, res) => {
  try {
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const pendingUsers = await Payment.findAll({
      where: {
        isTemporary: true,
        paymentMethod: "incash",
        updatedAt: {
          [Op.gte]: oneDayAgo
        }
      },
      attributes: [
        'id',
        'planTitle',
        'amount',
        'status',
        'paymentMethod',
        'createdAt',
      ],
      include: [{
        model: User,
        as: 'user', 
        attributes: {
          exclude: ['password', 'forgetPasswordToken', 'forgetPasswordExpires']
        }
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};


exports.approveUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const paymentRecord = await Payment.findByPk(userId);
    const user = await User.findByPk(paymentRecord.userId);

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const paymentDate = new Date();
    const expiryDate = calculateExpiryDate(paymentDate);
    const qrData = generateQRData(paymentRecord, user, false);
    
    paymentRecord.paymentDate = paymentDate;
    paymentRecord.expiryDate = expiryDate;
    paymentRecord.qrCodeData = JSON.stringify(qrData);
    paymentRecord.status = "completed";
    paymentRecord.isTemporary = false;
    await paymentRecord.save();

    res.status(200).json({
      success: true,
      message: 'User approved successfully',
    });
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const paymentRecord = await Payment.findByPk(userId);

    if (!paymentRecord) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    await paymentRecord.destroy();

    res.status(200).json({
      success: true,
      message: 'User registration rejected',
      data: {
        id: userId
      }
    });
  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * @desc    Get details of a specific pending approval
 * @route   GET /api/admin/pending-approvals/:id
 * @access  Private/Admin
 */
exports.getPendingApprovalDetails = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user with all details
    const user = await User.findOne({
      where: { 
        id: userId,
        isActive: false
      },
      attributes: { 
        exclude: ['password', 'forgetPasswordToken', 'forgetPasswordExpires'] 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pending user not found'
      });
    }

    // Get payment information if available
    const payment = await Payment.findOne({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        payment: payment || null
      }
    });
  } catch (error) {
    console.error('Error fetching pending approval details:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};