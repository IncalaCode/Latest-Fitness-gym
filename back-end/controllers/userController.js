const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User , Payment } = require('../models');
const { Op } = require('sequelize');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = 'uploads/profile';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'profile-' + uniqueSuffix + ext);
  }
});


const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: fileFilter
});

exports.uploadProfilePhoto = upload.single('photo');

exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      dateOfBirth,
      address,
      fitnessGoals,
      medicalConditions,
      photoUrl,
      agreeToTerms
    } = req.body;

    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    const password = "123456"
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      dateOfBirth,
      address,
      fitnessGoals,
      medicalConditions,
      photoUrl,
      agreeToTerms
    });

    // await sendWelcomeEmail(user);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.forgetPasswordToken = resetToken;
    user.forgetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      where: {
        forgetPasswordToken: token,
        forgetPasswordExpires: { $gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.forgetPasswordToken = null;
    user.forgetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: { include: ['trainerId'], exclude: ['password', 'forgetPasswordToken', 'forgetPasswordExpires'] }
      });

      const activePayments = await Payment.findAll({
        where: {
          paymentstatus: 'completed',
          expiryDate: {
            [Op.gt]: new Date() // Only include active memberships (not expired)
          }
        },
        attributes: [
          'userId',
          'planTitle',
          'expiryDate',
          'qrCodeData',
          'id',
          'isFrozen',
          'freezeStartDate',
          'freezeEndDate',
          'originalExpiryDate'
        ]
      });

      const userPaymentMap = {};
      activePayments.forEach(payment => {
        const paymentData = payment.get({ plain: true });
        if (!userPaymentMap[paymentData.userId] ||
            new Date(paymentData.expiryDate) > new Date(userPaymentMap[paymentData.userId].expiryDate)) {
          userPaymentMap[paymentData.userId] = paymentData;
        }
      });

      const usersWithMembership = users.map(user => {
        const userData = user.get({ plain: true });
        const userPayment = userPaymentMap[userData.id];

        if (userPayment) {
          userData.membership = userPayment.planTitle;
          userData.membershipStatus = 'active';
          userData.membershipExpiry = userPayment.expiryDate;
          userData.qrcodeData = userPayment.qrCodeData;
          userData.paymentId = userPayment.id;
          userData.isFrozen = userPayment.isFrozen || false;
          userData.freezeStartDate = userPayment.freezeStartDate;
          userData.freezeEndDate = userPayment.freezeEndDate;
          userData.originalExpiryDate = userPayment.originalExpiryDate;
        } else {
          userData.membership = 'None';
          userData.membershipStatus = 'inactive';
          userData.isFrozen = false;
        }

        return userData;
      });

      res.status(200).json({
        success: true,
        count: usersWithMembership.length,
        data: usersWithMembership
      });
    } catch (error) {
      console.error('Error fetching users with membership:', error);
      res.status(500).json({
        success: false,
        message: 'Server Error',
        error: error.message
      });
    }
  };


exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password', 'forgetPasswordToken', 'forgetPasswordExpires'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    if (req.file) {
      if (user.photoUrl) {
        const oldPhotoPath = path.join(__dirname, '..', user.photoUrl.replace(/^\//, ''));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      req.body.photoUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    await user.update(req.body);

    res.status(200).json({
      success: true,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        photoUrl: user.photoUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
