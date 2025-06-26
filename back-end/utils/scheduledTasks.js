const cron = require('node-cron');
const axios = require('axios');
const { Membership, User, Payment } = require('../models');
const { Op } = require('sequelize');
const { sendMembershipExpirationReminder } = require('./emailService');
const { checkAndUnfreezePayments } = require('../controllers/paymentFreezeController');

/**
 * Send reminders for memberships expiring in the specified number of days
 * @param {Number} days - Number of days before expiration to send reminders
 */
const sendMembershipReminders = async (days) => {
  console.log(`Running scheduled task: Sending reminders for memberships expiring in ${days} days`);

  try {
    // Calculate the target date
    const today = new Date();
    const targetDate = new Date();
    targetDate.setDate(today.getDate() + days);

    // Format dates to match database format (YYYY-MM-DD)
    const formattedTargetDate = targetDate.toISOString().split('T')[0];

    // Find memberships expiring on the target date
    const expiringMemberships = await Membership.findAll({
      where: {
        // Find memberships where the end date is exactly the target date
        endDate: {
          [Op.between]: [
            `${formattedTargetDate} 00:00:00`,
            `${formattedTargetDate} 23:59:59`
          ]
        },
        status: 'active'
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'fullName', 'email']
        }
      ]
    });

    console.log(`Found ${expiringMemberships.length} memberships expiring in ${days} days`);

    // Send reminders to each member
    const reminderResults = await Promise.all(
      expiringMemberships.map(async (membership) => {
        // Skip if user is not found or has no email
        if (!membership.user || !membership.user.email) {
          console.log(`Skipping membership ${membership.id}: User not found or has no email`);
          return {
            membershipId: membership.id,
            success: false,
            message: 'User not found or has no email'
          };
        }

        try {
          // Send the email reminder
          await sendMembershipExpirationReminder(
            membership.user,
            membership,
            days
          );

          console.log(`Successfully sent reminder to ${membership.user.email} for membership ${membership.id}`);
          return {
            membershipId: membership.id,
            userId: membership.user.id,
            email: membership.user.email,
            success: true
          };
        } catch (error) {
          console.error(`Error sending reminder for membership ${membership.id}:`, error);
          return {
            membershipId: membership.id,
            userId: membership.user.id,
            email: membership.user.email,
            success: false,
            message: error.message
          };
        }
      })
    );

    // Count successful reminders
    const successfulReminders = reminderResults.filter(result => result.success);
    console.log(`Successfully sent ${successfulReminders.length} out of ${expiringMemberships.length} reminders`);

    return {
      count: expiringMemberships.length,
      successCount: successfulReminders.length,
      results: reminderResults
    };
  } catch (error) {
    console.error('Error in scheduled membership reminders task:', error);
    throw error;
  }
};

/**
 * Initialize scheduled tasks
 */
const initScheduledTasks = () => {
  // Send reminders for memberships expiring in 30 days - Run at 9:00 AM every day
  cron.schedule('0 9 * * *', async () => {
    try {
      await sendMembershipReminders(30);
    } catch (error) {
      console.error('Failed to send 30-day reminders:', error);
    }
  });

  // Send reminders for memberships expiring in 7 days - Run at 9:30 AM every day
  cron.schedule('30 9 * * *', async () => {
    try {
      await sendMembershipReminders(7);
    } catch (error) {
      console.error('Failed to send 7-day reminders:', error);
    }
  });

  // Send reminders for memberships expiring in 3 days - Run at 10:00 AM every day
  cron.schedule('0 10 * * *', async () => {
    try {
      await sendMembershipReminders(3);
    } catch (error) {
      console.error('Failed to send 3-day reminders:', error);
    }
  });

  // Send reminders for memberships expiring in 1 day - Run at 10:30 AM every day
  cron.schedule('30 10 * * *', async () => {
    try {
      await sendMembershipReminders(1);
    } catch (error) {
      console.error('Failed to send 1-day reminders:', error);
    }
  });

  // Check for payments that need to be unfrozen - Run at midnight every day
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running scheduled task: Checking for payments to unfreeze');
      const result = await checkAndUnfreezePayments();
      console.log(`Unfroze ${result.successCount} out of ${result.count} payments`);
    } catch (error) {
      console.error('Failed to unfreeze payments:', error);
    }
  });

  console.log('Scheduled tasks initialized');
};

module.exports = {
  initScheduledTasks,
  sendMembershipReminders,
  checkAndUnfreezePayments
};