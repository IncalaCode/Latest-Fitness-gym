const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

exports.sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: `"Latest Fitness" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Welcome to Latest Fitness',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.WEBSITE_URL}/logo.png" alt="Latest Fitness Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #e53e3e; text-align: center;">Welcome to Latest Fitness!</h2>
          <p>Hello ${user.fullName},</p>
          <p>Thank you for joining Latest Fitness! We're excited to have you as a member of our fitness community.</p>
          <p>Your account has been successfully created and you can now access all our services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.WEBSITE_URL}/login" style="background-color: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
          </div>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <p>Best regards,<br>The Latest Fitness Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

exports.sendPasswordResetEmail = async (user, token) => {
  try {
    const resetUrl = `${process.env.WEBSITE_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"Latest Fitness" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.WEBSITE_URL}/logo.png" alt="Latest Fitness Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #e53e3e; text-align: center;">Password Reset Request</h2>
          <p>Hello ${user.fullName},</p>
          <p>You are receiving this email because you (or someone else) has requested the reset of your password.</p>
          <p>Please click on the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
          <p>Best regards,<br>The Latest Fitness Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};