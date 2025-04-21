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
            <img src="${process.env.FRONTEND_URL}/logo.png" alt="Latest Fitness Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: #e53e3e; text-align: center;">Welcome to Latest Fitness!</h2>
          <p>Hello ${user.fullName},</p>
          <p>Thank you for joining Latest Fitness! We're excited to have you as a member of our fitness community.</p>
          <p>Your account has been successfully created and you can now access all our services.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" style="background-color: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Your Account</a>
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
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"Latest Fitness" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.FRONTEND_URL}/logo.png" alt="Latest Fitness Logo" style="max-width: 150px;">
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

exports.sendMembershipExpirationReminder = async (user, membership, daysRemaining) => {
  try {
    const endDate = new Date(membership.endDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let urgencyColor = '#e53e3e'; 
    let urgencyText = 'Urgent: ';
    
    if (daysRemaining > 7) {
      urgencyColor = '#3182ce'; 
      urgencyText = '';
    } else if (daysRemaining > 3) {
      urgencyColor = '#dd6b20'; 
      urgencyText = 'Important: ';
    }

    const renewUrl = `${process.env.FRONTEND_URL}/package`;
    
    const mailOptions = {
      from: `"Latest Fitness" <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: `${urgencyText}Your Membership Expires in ${daysRemaining} Days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${process.env.FRONTEND_URL}/logo.png" alt="Latest Fitness Logo" style="max-width: 150px;">
          </div>
          <h2 style="color: ${urgencyColor}; text-align: center;">Your Membership is Expiring Soon</h2>
          <p>Hello ${user.fullName},</p>
          <p>This is a friendly reminder that your <strong>${membership.type} Membership</strong> will expire in <strong>${daysRemaining} days</strong> on <strong>${endDate}</strong>.</p>
          <p>To continue enjoying our facilities and services without interruption, please renew your membership before it expires.</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #2d3748;">Membership Details:</h3>
            <ul style="padding-left: 20px;">
              <li><strong>Type:</strong> ${membership.type}</li>
              <li><strong>Expiration Date:</strong> ${endDate}</li>
              <li><strong>Days Remaining:</strong> ${daysRemaining}</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${renewUrl}" style="background-color: ${urgencyColor}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Renew Your Membership</a>
          </div>
          
          <p>If you have any questions about your membership or need assistance with the renewal process, please contact our support team at <a href="mailto:support@latestfitness.com">support@latestfitness.com</a> or call us at (555) 123-4567.</p>
          
          <p>Thank you for being a valued member of Latest Fitness!</p>
          
          <p>Best regards,<br>The Latest Fitness Team</p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending membership expiration reminder:', error);
    throw error;
  }
};
