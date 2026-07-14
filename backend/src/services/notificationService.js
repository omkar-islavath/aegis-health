const { Notification, SymptomLog } = require('../models');
const { Op } = require('sequelize');

const createNotification = async (userId, type, title, message) => {
  return await Notification.create({
    userId,
    type,
    title,
    message,
    isRead: false
  });
};

const sendLoggingReminder = async (userId) => {
  // Check if user logged today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  
  const todayLog = await SymptomLog.findOne({
    where: {
      userId,
      loggedAt: {
        [Op.gte]: todayStart
      }
    }
  });

  if (!todayLog) {
    return await createNotification(
      userId,
      'reminder',
      'Daily Symptom Log Reminder',
      "You haven't logged your symptoms today. Keeping a consistent daily log helps track your recovery journey!"
    );
  }
  return null;
};

module.exports = {
  createNotification,
  sendLoggingReminder
};
