const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const dotenv = require('dotenv');
const db = require('../models');
const Payment = db.Payment;
const User = db.User;

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL
const QR_SECRET_KEY = process.env.QR_SECRET_KEY

const getDailySalt = () => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  return crypto.createHmac('sha256', QR_SECRET_KEY).update(dateString).digest('hex');
};

exports.generateQRData = (payment, user, isTemporary = false) => {
  const dailySalt = getDailySalt();
  
  const baseData = {
    paymentId: payment.id,
    userId: payment.userId,
    userName: user ? user.fullName : 'Gym Member',
    planTitle: payment.planTitle,
    membershipType: payment.planTitle,
    isTemporary
  };
  
  if (isTemporary) {
    baseData.status = 'pending';
    baseData.message = 'Payment pending approval. Please show this to the staff.';
  } else {
    baseData.status = 'active';
    
    if (payment.expiryDate) {
      baseData.expiryDate = payment.expiryDate;
    }
  }
  
  const signature = crypto
    .createHmac('sha256', QR_SECRET_KEY)
    .update(`${payment.id}-${dailySalt}`)
    .digest('hex');
  
  return {
    ...baseData,
    dailyCode: signature.substring(0, 8),
    signature,
    generatedOn: new Date().toISOString(),
    validForDate: new Date().toISOString().split('T')[0]
  };
};

exports.calculateExpiryDate = (paymentDate = new Date()) => {
  const expiryDate = new Date(paymentDate);
  expiryDate.setDate(expiryDate.getDate() + 30);
  return expiryDate;
};

exports.initializePayment = async (req, res) => {
  try {
    const { planTitle, planPrice, currency = 'ETB', paymentMethod = 'online' } = req.body;
    const userId = req.user.id;

    if (!planTitle || !planPrice) {
      return res.status(400).json({ message: 'Plan title and price are required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const txRef = `GYM-${uuidv4()}`;
    
    if (paymentMethod === 'incash') {
      const existingPayment = await Payment.findOne({
        where: {
          userId,
          paymentstatus: 'pending',
          paymentMethod: 'incash',
          isTemporary: true
        }
      });

      let payment;

      if (existingPayment) {
        existingPayment.planTitle = planTitle;
        existingPayment.amount = planPrice;
        existingPayment.currency = currency;
        existingPayment.txRef = txRef;
        await existingPayment.save();
        payment = existingPayment;
      } else {
        payment = await Payment.create({
          userId,
          planTitle,
          amount: planPrice, 
          currency,
          txRef,
          paymentstatus: 'pending',
          paymentMethod: 'incash',
          isTemporary: true
        });
      }

      const qrData = this.generateQRData(payment, user, true);
      
      payment.qrCodeData = JSON.stringify(qrData);
      await payment.save();

      return res.status(200).json({
        status: 'success',
        message: 'In-cash payment recorded successfully',
        paymentId: payment.id,
        redirectUrl: `${FRONTEND_URL}/user-dashboard`,
        qrCodeData: qrData
      });
    } else if (paymentMethod === 'online') {
      const existingPayment = await Payment.findOne({
        where: {
          userId,
          paymentstatus: 'pending',
          paymentMethod: 'online',
          isTemporary: true
        }
      });

      let payment;

      if (existingPayment) {
        existingPayment.planTitle = planTitle;
        existingPayment.amount = planPrice;
        existingPayment.currency = currency;
        existingPayment.txRef = txRef;
        await existingPayment.save();
        payment = existingPayment;
      } else {
        payment = await Payment.create({
          userId,
          planTitle,
          amount: planPrice,
          currency,
          txRef,
          paymentstatus: 'pending',
          paymentMethod: 'online',
          isTemporary: true
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Online payment initialized successfully. Please upload your payment receipt.',
        paymentId: payment.id,
        redirectUrl: `${FRONTEND_URL}/payment/upload-receipt/${payment.id}`
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payment method'
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while initializing payment',
      error: error.message
    });
  }
};

exports.uploadPaymentReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error',
        message: 'Receipt image is required' 
      });
    }

    const receiptImageUrl = req.file.path.replace(/\\/g, '/');

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({
        status: 'error',
        message: 'Payment not found'
      });
    }

    if (payment.userId !== req.user.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You are not authorized to update this payment'
      });
    }

    if (payment.paymentMethod !== 'online') {
      return res.status(400).json({
        status: 'error',
        message: 'This is not an online payment'
      });
    }

    payment.paymentimage = receiptImageUrl;
    payment.paymentstatus = 'approvalPending';
    await payment.save();

    const user = await User.findByPk(payment.userId);
    const qrData = this.generateQRData(payment, user, true);
    
    payment.qrCodeData = JSON.stringify(qrData);
    await payment.save();

    return res.status(200).json({
      status: 'success',
      message: 'Payment receipt uploaded successfully. Waiting for approval.',
      payment,
      qrCodeData: qrData,
      redirectUrl: `${FRONTEND_URL}/user-dashboard`
    });
  } catch (error) {
    console.error('Receipt upload error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while uploading payment receipt',
      error: error.message
    });
  }
};
