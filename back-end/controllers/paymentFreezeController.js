const { Payment, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Freeze a payment plan
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.freezePayment = async (req, res) => {
  try {
    const { paymentId, freezeEndDate } = req.body;

    if (!paymentId || !freezeEndDate) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID and freeze end date are required'
      });
    }

    // Validate the freeze end date is in the future
    const endDate = new Date(freezeEndDate);
    const now = new Date();
    
    if (isNaN(endDate.getTime()) || endDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Freeze end date must be a valid date in the future'
      });
    }

    // Find the payment
    const payment = await Payment.findOne({
      where: {
        id: paymentId,
        paymentstatus: 'completed',
        isFrozen: false,
        expiryDate: {
          [Op.gt]: now // Only allow freezing active memberships
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Active payment not found or already frozen'
      });
    }

    // Calculate the remaining time on the membership
    const currentExpiryDate = new Date(payment.expiryDate);
    const remainingTime = currentExpiryDate - now;

    // Store the original expiry date
    await payment.update({
      isFrozen: true,
      freezeStartDate: now,
      freezeEndDate: endDate,
      originalExpiryDate: currentExpiryDate
    });

    return res.status(200).json({
      success: true,
      message: 'Payment plan frozen successfully',
      data: {
        paymentId: payment.id,
        freezeStartDate: payment.freezeStartDate,
        freezeEndDate: payment.freezeEndDate,
        originalExpiryDate: payment.originalExpiryDate
      }
    });
  } catch (error) {
    console.error('Error freezing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * Manually unfreeze a payment plan
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.unfreezePayment = async (req, res) => {
  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    // Find the payment
    const payment = await Payment.findOne({
      where: {
        id: paymentId,
        isFrozen: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Frozen payment not found'
      });
    }

    // Calculate the new expiry date
    const now = new Date();
    const freezeStartDate = new Date(payment.freezeStartDate);
    const originalExpiryDate = new Date(payment.originalExpiryDate);
    
    // Calculate how long the payment was frozen
    const frozenDuration = now - freezeStartDate;
    
    // Add the frozen duration to the original expiry date
    const newExpiryDate = new Date(originalExpiryDate.getTime() + frozenDuration);

    // Update the payment
    await payment.update({
      isFrozen: false,
      expiryDate: newExpiryDate,
      freezeStartDate: null,
      freezeEndDate: null,
      originalExpiryDate: null
    });

    return res.status(200).json({
      success: true,
      message: 'Payment plan unfrozen successfully',
      data: {
        paymentId: payment.id,
        newExpiryDate: payment.expiryDate
      }
    });
  } catch (error) {
    console.error('Error unfreezing payment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

/**
 * Check for payments that need to be unfrozen based on the end date
 * This function will be called by a scheduled task
 */
exports.checkAndUnfreezePayments = async () => {
  try {
    const now = new Date();
    
    // Find all frozen payments where the freeze end date has passed
    const paymentsToUnfreeze = await Payment.findAll({
      where: {
        isFrozen: true,
        freezeEndDate: {
          [Op.lte]: now // Less than or equal to now
        }
      }
    });
    
    console.log(`Found ${paymentsToUnfreeze.length} payments to unfreeze`);
    
    // Process each payment
    const results = await Promise.all(
      paymentsToUnfreeze.map(async (payment) => {
        try {
          // Calculate the new expiry date
          const freezeStartDate = new Date(payment.freezeStartDate);
          const freezeEndDate = new Date(payment.freezeEndDate);
          const originalExpiryDate = new Date(payment.originalExpiryDate);
          
          // Calculate how long the payment was frozen
          const frozenDuration = freezeEndDate - freezeStartDate;
          
          // Add the frozen duration to the original expiry date
          const newExpiryDate = new Date(originalExpiryDate.getTime() + frozenDuration);
          
          // Update the payment
          await payment.update({
            isFrozen: false,
            expiryDate: newExpiryDate,
            freezeStartDate: null,
            freezeEndDate: null,
            originalExpiryDate: null
          });
          
          return {
            paymentId: payment.id,
            userId: payment.userId,
            success: true,
            newExpiryDate
          };
        } catch (error) {
          console.error(`Error unfreezing payment ${payment.id}:`, error);
          return {
            paymentId: payment.id,
            userId: payment.userId,
            success: false,
            error: error.message
          };
        }
      })
    );
    
    // Count successful unfreeze operations
    const successfulUnfreezes = results.filter(result => result.success);
    console.log(`Successfully unfroze ${successfulUnfreezes.length} out of ${paymentsToUnfreeze.length} payments`);
    
    return {
      count: paymentsToUnfreeze.length,
      successCount: successfulUnfreezes.length,
      results
    };
  } catch (error) {
    console.error('Error in scheduled payment unfreeze task:', error);
    throw error;
  }
};
