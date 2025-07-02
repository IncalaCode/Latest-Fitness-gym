const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User , Payment, Package } = require('../models');
const { Trainer } = require('../models');
const { Op } = require('sequelize');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../utils/emailService');
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// const { sequelize } = require('../config/database');
const { sequelize } = require('../models');

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
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    // Use provided password or default to "123456"
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
      emergencyContact : ""
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
    const replacements = {
      search: `%${search}%`,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // --- Scalable sorting by package name (membership) ---
    if (sortBy === 'membership') {
      // Build WHERE clause for search
      let whereClause = '';
      if (search) {
        whereClause = `WHERE u.fullName LIKE :search OR u.email LIKE :search`;
      }

      // Add packageId filter
      let havingClause = '';
      if (packageId) {
        havingClause = `HAVING membershipProductId = :packageId`;
        replacements.packageId = packageId;
      }

      // Add expirationStatus filter
      let statusHaving = '';
      if (expirationStatus) {
        if (havingClause) statusHaving += ' AND ';
        else statusHaving += 'HAVING ';
        if (expirationStatus === 'active') {
          statusHaving += 'membershipStatus = "active" AND (isFrozen IS NULL OR isFrozen = 0)';
        } else if (expirationStatus === 'frozen') {
          statusHaving += 'membershipStatus = "active" AND isFrozen = 1';
        } else if (expirationStatus === 'inactive') {
          statusHaving += 'membershipStatus = "inactive"';
        }
      }

      // Compose the SQL
      // ... inside getAllUsers, in the raw SQL block:
let orderBy = '';
if (sortBy === 'membership') {
  orderBy = `ORDER BY membership ${sortOrder.toUpperCase()}, u.fullName ASC`;
} else if (sortBy === 'createdAt') {
  orderBy = `ORDER BY u.createdAt ${sortOrder.toUpperCase()}`;
} else {
  orderBy = `ORDER BY u.fullName ASC`;
}

const sql = `
  SELECT 
    u.*, 
    p.planTitle AS membership, 
    IF(p.id IS NOT NULL, 'active', 'inactive') AS membershipStatus,
    p.expiryDate AS membershipExpiry,
    p.qrCodeData AS qrcodeData,
    p.id AS paymentId,
    p.isFrozen AS isFrozen,
    p.freezeStartDate AS freezeStartDate,
    p.freezeEndDate AS freezeEndDate,
    p.originalExpiryDate AS originalExpiryDate,
    p.productId AS membershipProductId,
    p.totalPasses AS totalPasses,
    t.id AS trainerId,
    t.name AS trainerName,
    t.email AS trainerEmail,
    t.phone AS trainerPhone
  FROM Users u
  LEFT JOIN (
    SELECT p1.* FROM Payments p1
    INNER JOIN (
      SELECT userId, MAX(expiryDate) AS maxExpiry
      FROM Payments
      WHERE paymentstatus = 'completed' AND expiryDate > NOW()
      GROUP BY userId
    ) p2 ON p1.userId = p2.userId AND p1.expiryDate = p2.maxExpiry
  ) p ON p.userId = u.id
  LEFT JOIN Trainers t ON u.trainerId = t.id
  ${whereClause}
  ${havingClause}
  ${statusHaving}
  ${orderBy}
  LIMIT :limit OFFSET :offset
`;

      const users = await sequelize.query(sql, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });

      // Get total count for pagination
      const countSql = `
        SELECT COUNT(DISTINCT u.id) as total
        FROM Users u
        LEFT JOIN (
          SELECT p1.* FROM Payments p1
          INNER JOIN (
            SELECT userId, MAX(expiryDate) AS maxExpiry
            FROM Payments
            WHERE paymentstatus = 'completed' AND expiryDate > NOW()
            GROUP BY userId
          ) p2 ON p1.userId = p2.userId AND p1.expiryDate = p2.maxExpiry
        ) p ON p.userId = u.id
        ${whereClause}
        ${havingClause}
        ${statusHaving}
      `;
      const countResult = await sequelize.query(countSql, {
        replacements,
        type: sequelize.QueryTypes.SELECT
      });
      const totalUsers = countResult[0].total;
      const totalPages = Math.ceil(totalUsers / limit);

      res.status(200).json({
        success: true,
        count: users.length,
        totalCount: totalUsers,
        currentPage: parseInt(page),
        totalPages,
        data: users,
        filters: {
          search,
          packageId,
          expirationStatus,
          sortBy,
          sortOrder
        }
      });
      return;
    }

    // --- Default: Use existing logic for other sort fields ---
    const userWhereClause = {};
    if (search) {
      userWhereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get users with trainer information
    const users = await User.findAll({
      where: userWhereClause,
      attributes: { 
        include: ['trainerId'], 
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
      limit: parseInt(limit),
      order: [[sortBy, sortOrder.toUpperCase()]],
      offset: parseInt(offset)
    });

    // Get all active payments for filtering
    const activePayments = await Payment.findAll({
      where: {
        paymentstatus: 'completed',
        expiryDate: {
          [Op.gt]: new Date()
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
        'originalExpiryDate',
        'productId',
        'totalPasses'
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
      const filteredPayments = activePayments.filter(payment => 
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
      users.sort((a, b) => {
        const aValue = a[sortBy] || '';
        const bValue = b[sortBy] || '';
        if (sortOrder === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
      const sortedUserIds = users.map(user => user.id);
      const userMap = {};
      usersWithMembership.forEach(user => {
        userMap[user.id] = user;
      });
      usersWithMembership = sortedUserIds.map(id => userMap[id]).filter(Boolean);
    }

    // Get total count for pagination (without limit/offset)
    const totalUsers = await User.count({ where: userWhereClause });
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

// exports.getAllUsers = async (req, res) => {
//   try {
//     // Extract query parameters
//     const {
//       search = '',
//       packageId = '',
//       expirationStatus = '',
//       sortBy = 'fullName',
//       sortOrder = 'asc',
//       page = 1,
//       limit = 10
//     } = req.query;

//     const offset = (page - 1) * limit;
//     const replacements = {
//       search: `%${search}%`,
//       limit: parseInt(limit),
//       offset: parseInt(offset)
//     };

//     // If sorting by membership/package name, use raw SQL for scalable sorting
//     if (sortBy === 'membership') {
//       // Build WHERE clause for search
//       let whereClause = '';
//       if (search) {
//         whereClause = `WHERE u.fullName LIKE :search OR u.email LIKE :search`;
//       }

//       // Add packageId filter
//       let havingClause = '';
//       if (packageId) {
//         havingClause = `HAVING membershipProductId = :packageId`;
//         replacements.packageId = packageId;
//       }

//       // Add expirationStatus filter
//       let statusHaving = '';
//       if (expirationStatus) {
//         if (havingClause) statusHaving += ' AND ';
//         else statusHaving += 'HAVING ';
//         if (expirationStatus === 'active') {
//           statusHaving += 'membershipStatus = "active" AND (isFrozen IS NULL OR isFrozen = 0)';
//         } else if (expirationStatus === 'frozen') {
//           statusHaving += 'membershipStatus = "active" AND isFrozen = 1';
//         } else if (expirationStatus === 'inactive') {
//           statusHaving += 'membershipStatus = "inactive"';
//         }
//       }

//       // Compose the SQL
//       const sql = `
//         SELECT 
//           u.*, 
//           p.planTitle AS membership, 
//           IF(p.id IS NOT NULL, 'active', 'inactive') AS membershipStatus,
//           p.expiryDate AS membershipExpiry,
//           p.qrCodeData AS qrcodeData,
//           p.id AS paymentId,
//           p.isFrozen AS isFrozen,
//           p.freezeStartDate AS freezeStartDate,
//           p.freezeEndDate AS freezeEndDate,
//           p.originalExpiryDate AS originalExpiryDate,
//           p.productId AS membershipProductId,
//           p.totalPasses AS totalPasses,
//           t.id AS trainerId,
//           t.name AS trainerName,
//           t.email AS trainerEmail,
//           t.phone AS trainerPhone
//         FROM Users u
//         LEFT JOIN (
//           SELECT p1.* FROM Payments p1
//           INNER JOIN (
//             SELECT userId, MAX(expiryDate) AS maxExpiry
//             FROM Payments
//             WHERE paymentstatus = 'completed' AND expiryDate > NOW()
//             GROUP BY userId
//           ) p2 ON p1.userId = p2.userId AND p1.expiryDate = p2.maxExpiry
//         ) p ON p.userId = u.id
//         LEFT JOIN Trainers t ON u.trainerId = t.id
//         ${whereClause}
//         ${havingClause}
//         ${statusHaving}
//         ORDER BY membership ${sortOrder.toUpperCase()}, u.fullName ASC
//         LIMIT :limit OFFSET :offset
//       `;

//       const users = await sequelize.query(sql, {
//         replacements,
//         type: sequelize.QueryTypes.SELECT
//       });

//       // Get total count for pagination
//       const countSql = `
//         SELECT COUNT(DISTINCT u.id) as total
//         FROM Users u
//         LEFT JOIN (
//           SELECT p1.* FROM Payments p1
//           INNER JOIN (
//             SELECT userId, MAX(expiryDate) AS maxExpiry
//             FROM Payments
//             WHERE paymentstatus = 'completed' AND expiryDate > NOW()
//             GROUP BY userId
//           ) p2 ON p1.userId = p2.userId AND p1.expiryDate = p2.maxExpiry
//         ) p ON p.userId = u.id
//         ${whereClause}
//         ${havingClause}
//         ${statusHaving}
//       `;
//       const countResult = await sequelize.query(countSql, {
//         replacements,
//         type: sequelize.QueryTypes.SELECT
//       });
//       const totalUsers = countResult[0].total;
//       const totalPages = Math.ceil(totalUsers / limit);

//       res.status(200).json({
//         success: true,
//         count: users.length,
//         totalCount: totalUsers,
//         currentPage: parseInt(page),
//         totalPages,
//         data: users,
//         filters: {
//           search,
//           packageId,
//           expirationStatus,
//           sortBy,
//           sortOrder
//         }
//       });
//       return;
//     }

//     // --- Default: Use existing logic for other sort fields ---
//     // Build where clause for User model
//     const userWhereClause = {};
//     if (search) {
//       userWhereClause[Op.or] = [
//         { fullName: { [Op.like]: `%${search}%` } },
//         { email: { [Op.like]: `%${search}%` } }
//       ];
//     }

//     // Get users with trainer information
//     const users = await User.findAll({
//       where: userWhereClause,
//       attributes: { 
//         include: ['trainerId'], 
//         exclude: ['password', 'forgetPasswordToken', 'forgetPasswordExpires'] 
//       },
//       include: [
//         {
//           model: Trainer,
//           as: 'trainer',
//           attributes: ['id', 'name', 'email', 'phone'],
//           required: false
//         }
//       ],
//       limit: parseInt(limit),
//       order: [[sortBy, sortOrder.toUpperCase()]],
//       offset: parseInt(offset)
//     });

//     // Get all active payments for filtering
//     const activePayments = await Payment.findAll({
//       where: {
//         paymentstatus: 'completed',
//         expiryDate: {
//           [Op.gt]: new Date()
//         }
//       },
//       attributes: [
//         'userId',
//         'planTitle',
//         'expiryDate',
//         'qrCodeData',
//         'id',
//         'isFrozen',
//         'freezeStartDate',
//         'freezeEndDate',
//         'originalExpiryDate',
//         'productId',
//         'totalPasses'
//       ]
//     });

//     const userPaymentMap = {};
//     activePayments.forEach(payment => {
//       const paymentData = payment.get({ plain: true });
//       if (!userPaymentMap[paymentData.userId] ||
//           new Date(paymentData.expiryDate) > new Date(userPaymentMap[paymentData.userId].expiryDate)) {
//         userPaymentMap[paymentData.userId] = paymentData;
//       }
//     });

//     // Process users and apply membership data
//     let usersWithMembership = users.map(user => {
//       const userData = user.get({ plain: true });
//       const userPayment = userPaymentMap[userData.id];

//       if (userPayment) {
//         userData.membership = userPayment.planTitle;
//         userData.membershipStatus = 'active';
//         userData.membershipExpiry = userPayment.expiryDate;
//         userData.qrcodeData = userPayment.qrCodeData;
//         userData.paymentId = userPayment.id;
//         userData.isFrozen = userPayment.isFrozen || false;
//         userData.freezeStartDate = userPayment.freezeStartDate;
//         userData.freezeEndDate = userPayment.freezeEndDate;
//         userData.originalExpiryDate = userPayment.originalExpiryDate;
//         userData.totalPasses = userPayment.totalPasses || 0;
//       } else {
//         userData.membership = 'None';
//         userData.membershipStatus = 'inactive';
//         userData.isFrozen = false;
//         userData.totalPasses = 0;
//       }

//       return userData;
//     });

//     // Apply package type filter
//     if (packageId) {
//       // Filter by package ID from payments
//       const filteredPayments = activePayments.filter(payment => 
//         payment.productId === packageId
//       );
//       const filteredUserIds = filteredPayments.map(payment => payment.userId);
//       usersWithMembership = usersWithMembership.filter(user => 
//         filteredUserIds.includes(user.id)
//       );
//     }

//     // Apply expiration status filter
//     if (expirationStatus) {
//       switch (expirationStatus) {
//         case 'active':
//           usersWithMembership = usersWithMembership.filter(user => 
//             user.membershipStatus === 'active' && !user.isFrozen
//           );
//           break;
//         case 'frozen':
//           usersWithMembership = usersWithMembership.filter(user => 
//             user.membershipStatus === 'active' && user.isFrozen
//           );
//           break;
//         case 'inactive':
//           usersWithMembership = usersWithMembership.filter(user => 
//             user.membershipStatus === 'inactive'
//           );
//           break;
//       }
//     }

//     // Apply sorting after processing membership data
//     if (sortBy === 'membershipExpiry') {
//       usersWithMembership.sort((a, b) => {
//         const dateA = a.membershipExpiry ? new Date(a.membershipExpiry) : new Date('9999-12-31');
//         const dateB = b.membershipExpiry ? new Date(b.membershipExpiry) : new Date('9999-12-31');
//         if (sortOrder === 'asc') {
//           return dateA - dateB;
//         } else {
//           return dateB - dateA;
//         }
//       });
//     } else {
//       // For other sort fields, sort the original users array
//       users.sort((a, b) => {
//         const aValue = a[sortBy] || '';
//         const bValue = b[sortBy] || '';
//         if (sortOrder === 'asc') {
//           return aValue.localeCompare(bValue);
//         } else {
//           return bValue.localeCompare(aValue);
//         }
//       });
//       // Re-map the sorted users to include membership data
//       const sortedUserIds = users.map(user => user.id);
//       const userMap = {};
//       usersWithMembership.forEach(user => {
//         userMap[user.id] = user;
//       });
//       usersWithMembership = sortedUserIds.map(id => userMap[id]).filter(Boolean);
//     }

//     // Get total count for pagination (without limit/offset)
//     const totalUsers = await User.count({ where: userWhereClause });
//     const totalPages = Math.ceil(totalUsers / limit);

//     res.status(200).json({
//       success: true,
//       count: usersWithMembership.length,
//       totalCount: totalUsers,
//       currentPage: parseInt(page),
//       totalPages,
//       data: usersWithMembership,
//       filters: {
//         search,
//         packageId,
//         expirationStatus,
//         sortBy,
//         sortOrder
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching users with membership:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     });
//   }
// };


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
