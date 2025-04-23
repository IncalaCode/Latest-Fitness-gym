const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const db = require('../models');
const { Admin, User } = db;


const verifyPassword = (password, hashedPassword, salt) => {
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  
  return hash === hashedPassword;
};


exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required' });
    }

    let user = null;
    let role = null;

    user = await Admin.findOne({ where: { email: identifier, isActive: true } });
    if (user) role = user.role;

    if (!user) {
      user = await User.findOne({ where: { email: identifier, isActive: true } });
      if (user) role = user.role;
    }

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }
    

    const isPasswordValid = await verifyPassword(password, user.password , "10");
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }
    
    

    return sendLoginResponse(res, user, role);
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

const sendLoginResponse = (res, user, role) => {
  const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION  });

  const responseData = {
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      fullName: role === 'Admin' ? `${user.firstName} ${user.lastName}` : user.fullName,
      email: user.email,
      role,
      photoUrl: user.photoUrl
    },
    token
  };

  return res.status(200).json(responseData);
};

exports.token_refresh = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({ success: false, message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

    let user = null;
    switch (decoded.role) {
      case "admin":
        user = await Admin.findOne({ where: { id: decoded.id, isActive: true } });
        break;
      case "member":
        user = await User.findOne({ where: { id: decoded.id, isActive: true } });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid role in token" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found or inactive" });
    }

    if (decoded.exp * 1000 > Date.now()) {
      return res.status(200).json({
        success: true,
        message: "Token is still valid",
        token,
      });
    }

    const newToken = jwt.sign({ id: user.id, role: decoded.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};