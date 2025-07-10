const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Payment, Package } = require('../models');
const { Trainer } = require('../models');
const { Op } = require('sequelize');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sequelize } = require('../models');

// Multer setup for profile photo uploads
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

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter
});

exports.uploadProfilePhoto = upload.single('photo');

// User registration
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
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
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const userPassword = password || "123456";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

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
      agreeToTerms,
      emergencyContact: ""
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
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour
    user.forgetPasswordToken = resetToken;
    user.forgetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // await sendPasswordResetEmail(user, resetToken);
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Reset password
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
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    user.forgetPasswordToken = null;
    user.forgetPasswordExpires = null;
    await user.save();

    res.status(200).json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// Get all users with filtering, sorting, and pagination
exports.getAllUsers = async (req, res) => {
  try {
    const {
      search = '',
      packageId = '',
      expirationStatus = '',
      sortBy = 'fullName',
      sortOrder = 'asc',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    const userWhereClause = {};
    if (search) {
      userWhereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    let users;
    let totalUsers;
    // For sortBy membership, membershipExpiry, or createdAt, fetch all users and sort in JS
    if (sortBy === 'membership' || sortBy === 'membershipExpiry' || sortBy === 'createdAt') {
      users = await User.findAll({
        where: userWhereClause,
        attributes: {
          include: ['trainerId',"trainerDescription"],
          exclude: ['password', 'forgetPasswordToken', 'forgetPasswordExpires']
        },
        include: [
          {
            model: Trainer,
            as: 'trainer',
            attributes: ['id', 'name', 'email', 'phone'],
            required: false
          }
        ]
      });
      totalUsers = users.length;
    } else {
      users = await User.findAll({
      where: userWhereClause,
      attributes: { 
        include: ['trainerId','trainerDescription'], 
        exclude: ['password', 'forgetPasswordToken', 'forgetPasswordExpires'] 
      },
      include: [
        {
          model: Trainer,
          as: 'trainer',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false
        }
      ],
      // limit: parseInt(limit),
      order: [[sortBy, sortOrder.toUpperCase()]],
      offset: parseInt(offset)
    });
      totalUsers = await User.count({ where: userWhereClause });
    }

    // Get payments for filtering
    let payments;
    if (expirationStatus === 'frozen') {
      // Fetch all completed, frozen payments (even expired)
      payments = await Payment.findAll({
        where: {
          paymentstatus: 'completed',
          isFrozen: 1
        },
        attributes: [
          'userId', 'planTitle', 'expiryDate', 'qrCodeData', 'id', 'isFrozen',
          'freezeStartDate', 'freezeEndDate', 'originalExpiryDate', 'productId', 'totalPasses'
        ]
      });
    } else {
      // Default: only active (not expired) payments
      payments = await Payment.findAll({
        where: {
          paymentstatus: 'completed',
          expiryDate: { [Op.gt]: new Date() }
        },
        attributes: [
          'userId', 'planTitle', 'expiryDate', 'qrCodeData', 'id', 'isFrozen',
          'freezeStartDate', 'freezeEndDate', 'originalExpiryDate', 'productId', 'totalPasses'
        ]
      });
    }

    const userPaymentMap = {};
    payments.forEach(payment => {
      const paymentData = payment.get({ plain: true });
      if (!userPaymentMap[paymentData.userId] ||
          new Date(paymentData.expiryDate) > new Date(userPaymentMap[paymentData.userId].expiryDate)) {
        userPaymentMap[paymentData.userId] = paymentData;
      }
    });

    // Process users and apply membership data
    let usersWithMembership = users.map(user => {
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
        userData.totalPasses = userPayment.totalPasses || 0;
      } else {
        userData.membership = 'None';
        userData.membershipStatus = 'inactive';
        userData.isFrozen = false;
        userData.totalPasses = 0;
      }

      return userData;
    });

    // Apply package type filter
    if (packageId) {
      const filteredPayments = payments.filter(payment => 
        payment.productId === packageId
      );
      const filteredUserIds = filteredPayments.map(payment => payment.userId);
      usersWithMembership = usersWithMembership.filter(user => 
        filteredUserIds.includes(user.id)
      );
    }

    // Apply expiration status filter
    if (expirationStatus) {
      switch (expirationStatus) {
        case 'active':
          usersWithMembership = usersWithMembership.filter(user => 
            user.membershipStatus === 'active' && !user.isFrozen
          );
          break;
        case 'frozen':
          usersWithMembership = usersWithMembership.filter(user => 
            user.membershipStatus === 'active' && user.isFrozen
          );
          break;
        case 'inactive':
          usersWithMembership = usersWithMembership.filter(user => 
            user.membershipStatus === 'inactive'
          );
          break;
        default:
          // Unknown or empty filter: do not filter, show all
          break;
      }
    }

    // Apply sorting after processing membership data
    if (sortBy === 'membershipExpiry') {
      usersWithMembership.sort((a, b) => {
        const dateA = a.membershipExpiry ? new Date(a.membershipExpiry) : new Date('9999-12-31');
        const dateB = b.membershipExpiry ? new Date(b.membershipExpiry) : new Date('9999-12-31');
        if (sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    } else if (sortBy === 'membership') {
      usersWithMembership.sort((a, b) => {
        const aValue = a.membership || '';
        const bValue = b.membership || '';
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    } else if (sortBy === 'createdAt') {
      usersWithMembership.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        if (sortOrder === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      });
    } else {
      usersWithMembership.sort((a, b) => {
        const aValue = a[sortBy] || '';
        const bValue = b[sortBy] || '';
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    // Set total count BEFORE slicing for pagination (for all cases)
    totalUsers = usersWithMembership.length;
    // Paginate after sorting and filtering
    const offsetVal = (page - 1) * limit;
    usersWithMembership = usersWithMembership.slice(offsetVal, offsetVal + parseInt(limit));

    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      count: usersWithMembership.length,
      totalCount: totalUsers,
      currentPage: parseInt(page),
      totalPages,
      data: usersWithMembership,
      filters: {
        search,
        packageId,
        expirationStatus,
        sortBy,
        sortOrder
      }
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

// Get user by ID
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

// Update user
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle password update with current password verification
    if (req.body.newPassword) {
      // Check if current password is provided
      if (!req.body.currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to update password'
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(req.body.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.newPassword, salt);
      
      // Remove the newPassword and currentPassword from req.body
      delete req.body.newPassword;
      delete req.body.currentPassword;
    }

    // Handle profile photo upload
    if (req.file) {
      if (user.photoUrl) {
        const oldPhotoPath = path.join(__dirname, '..', user.photoUrl.replace(/^\//, ''));
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      req.body.photoUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    }

    // Update user with all fields including emergency contact fields
    await user.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        emergencyContactName: user.emergencyContactName,
        emergencyContactPhone: user.emergencyContactPhone,
        emergencyContactRelationship: user.emergencyContactRelationship,
        dateOfBirth: user.dateOfBirth,
        address: user.address,
        fitnessGoals: user.fitnessGoals,
        medicalConditions: user.medicalConditions,
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

// Delete user
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

// Get filter options
exports.getFilterOptions = async (req, res) => {
  try {
    // Get all active packages
    const packages = await Package.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'price'],
      order: [['name', 'ASC']]
    });

    // Get all active trainers
    const trainers = await Trainer.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'email'],
      order: [['name', 'ASC']]
    });

    // Get unique package types from active payments
    const activePayments = await Payment.findAll({
      where: {
        paymentstatus: 'completed',
        expiryDate: {
          [Op.gt]: new Date()
        }
      },
      attributes: ['planTitle'],
      group: ['planTitle']
    });

    const packageTypes = activePayments.map(payment => payment.planTitle).filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        packages: packages.map(pkg => ({
          id: pkg.id,
          name: pkg.name,
          price: pkg.price
        })),
        trainers: trainers.map(trainer => ({
          id: trainer.id,
          name: trainer.name,
          email: trainer.email
        })),
        packageTypes: [...new Set(packageTypes)].map(type => ({
          value: type,
          label: type
        })),
        expirationStatuses: [
          { value: 'active', label: 'Active' },
          { value: 'frozen', label: 'Frozen' },
          { value: 'inactive', label: 'Inactive' }
        ],
        sortOptions: [
          { value: 'fullName', label: 'Name (A-Z)' },
          { value: 'createdAt', label: 'Recently Registered' },
          { value: 'membershipExpiry', label: 'Expiry Date' }
        ]
      }
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
