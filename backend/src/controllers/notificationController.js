const { Notification } = require('../models');

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const notif = await Notification.findOne({ where: { id, userId } });
    if (!notif) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    notif.isRead = true;
    await notif.save();

    res.json(notif);
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await Notification.update(
      { isRead: true },
      { where: { userId, isRead: false } }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
