const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const dotenv = require('dotenv');
const crypto = require('crypto');
const db = require('../models');
const Payment = db.Payment;
const User = db.User;

dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;
const CHAPA_API_URL = 'https://api.chapa.co/v1/transaction/initialize';
const CALLBACK_URL = process.env.PAYMENT_CALLBACK_URL || 'https://yourgymwebsite.com/payment/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const QR_SECRET_KEY = process.env.QR_SECRET_KEY || 'gym-membership-qr-secret-key';

const getDailySalt = () => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  return crypto.createHmac('sha256', QR_SECRET_KEY).update(dateString).digest('hex');
};

const generateQRData = (payment, user, isTemporary = false) => {
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

const calculateExpiryDate = (paymentDate = new Date()) => {
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
          status: 'pending',
          paymentMethod: 'incash',
          isTemporary: true
        }
      });

      let payment;

      if (existingPayment) {
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
          status: 'pending',
          paymentMethod: 'incash',
          isTemporary: true
        });
      }

      const qrData = generateQRData(payment, user, true);
      
      payment.qrCodeData = JSON.stringify(qrData);
      await payment.save();

      return res.status(200).json({
        status: 'success',
        message: 'In-cash payment recorded successfully',
        paymentId: payment.id,
        redirectUrl:  `${FRONTEND_URL}/user-dashboard`,
        qrCodeData: qrData
      });
    }
    
    const chapaPayload = {
      amount: planPrice,
      currency,
      tx_ref: txRef,
      email: user.email,
      first_name: user.fullName.split(' ')[0] || 'Gym',
      last_name: user.fullName.split(' ').slice(1).join(' ') || 'Member',
      callback_url: CALLBACK_URL,
      return_url: `${FRONTEND_URL}/user-dashboard`,
      customization: {
        title: 'Gym-Payment',
        description: `Payment for ${planTitle} plan`,
        logo: 'https://yourgymwebsite.com/logo.png',
        first_name: user.fullName.split(' ')[0] || 'Gym',
        last_name: user.fullName.split(' ').slice(1).join(' ') || 'Member',
      }
    };

    const response = await axios.post(CHAPA_API_URL, chapaPayload, {
      headers: {
        'Authorization': `Bearer ${CHAPA_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.status === 'success') {
      const payment = await Payment.create({
        userId,
        planTitle,
        amount: planPrice,
        currency,
        txRef,
        status: 'pending',
        paymentMethod: 'online',
        redirectUrl: response.data.data.checkout_url,
        checkoutUrl: response.data.data.checkout_url
      });

      return res.status(200).json({
        status: 'success',
        message: 'Payment initialized successfully',
        paymentId: payment.id,
        redirectUrl: response.data.data.checkout_url
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Failed to initialize payment with Chapa'
      });
    }
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while initializing payment, invalied email',
      error: error.message
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { tx_ref, transaction_id, status } = req.query;

    if (!tx_ref) {
      return res.status(400).json({ message: 'Transaction reference is required' });
    }

    const payment = await Payment.findOne({ where: { txRef: tx_ref } });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (status === 'success') {
      const paymentDate = new Date();
      const expiryDate = calculateExpiryDate(paymentDate);
      
      const user = await User.findByPk(payment.userId);
      const qrData = generateQRData(payment, user, false);
      
      payment.status = 'completed';
      payment.chapaTransactionId = transaction_id;
      payment.paymentDate = paymentDate;
      payment.expiryDate = expiryDate;
      payment.qrCodeData = JSON.stringify(qrData);
      payment.isTemporary = false;
      
      await payment.save();

      return res.status(200).json({
        status: 'success',
        message: 'Payment verified successfully',
        payment,
        qrCodeData: qrData
      });
    } else {
      payment.status = 'failed';
      await payment.save();

      return res.status(400).json({
        status: 'error',
        message: 'Payment verification failed',
        payment
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while verifying payment',
      error: error.message
    });
  }
};

exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.status === 'completed' && !payment.isTemporary) {
      const user = await User.findByPk(payment.userId);
      const qrData = generateQRData(payment, user, false);
      payment.qrCodeData = JSON.stringify(qrData);
      await payment.save();
    }

    return res.status(200).json({
      status: 'success',
      payment
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while getting payment status',
      error: error.message
    });
  }
};

exports.getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;

    const payments = await Payment.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    for (const payment of payments) {
      if (payment.status === 'completed' && !payment.isTemporary) {
        const user = await User.findByPk(payment.userId);
        const qrData = generateQRData(payment, user, false);
        payment.qrCodeData = JSON.stringify(qrData);
        await payment.save();
      }
    }

    return res.status(200).json({
      status: 'success',
      payments
    });
  } catch (error) {
    console.error('Get user payments error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while getting user payments',
      error: error.message
    });
  }
};

exports.confirmInCashPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { adminId } = req.body;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.paymentMethod !== 'incash') {
      return res.status(400).json({ message: 'This is not an in-cash payment' });
    }

    const paymentDate = new Date();
    const expiryDate = calculateExpiryDate(paymentDate);
    
    const user = await User.findByPk(payment.userId);
    const qrData = generateQRData(payment, user, false);
    
    payment.status = 'completed';
    payment.paymentDate = paymentDate;
    payment.expiryDate = expiryDate;
    payment.qrCodeData = JSON.stringify(qrData);
    payment.isTemporary = false;
    
    await payment.save();

    return res.status(200).json({
      status: 'success',
      message: 'In-cash payment confirmed successfully',
      payment,
      qrCodeData: qrData
    });
  } catch (error) {
    console.error('In-cash payment confirmation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while confirming in-cash payment',
      error: error.message
    });
  }
};

exports.cancelInCashPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (payment.paymentMethod !== 'incash') {
      return res.status(400).json({ message: 'This is not an in-cash payment' });
    }

    payment.status = 'cancelled';
    await payment.save();

    return res.status(200).json({
      status: 'success',
      message: 'In-cash payment cancelled successfully',
      payment
    });
  } catch (error) {
    console.error('In-cash payment cancellation error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while cancelling in-cash payment',
      error: error.message
    });
  }
};

exports.refreshQRCode = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await Payment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    if (payment.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed payments can have QR codes refreshed' });
    }
    
    const user = await User.findByPk(payment.userId);
    const qrData = generateQRData(payment, user, false);
    
    payment.qrCodeData = JSON.stringify(qrData);
    await payment.save();
    
    return res.status(200).json({
      status: 'success',
      message: 'QR code refreshed successfully',
      qrCodeData: qrData
    });
  } catch (error) {
    console.error('QR code refresh error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while refreshing QR code',
      error: error.message
    });
  }
};
