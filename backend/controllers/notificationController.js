import Notification from '../models/Notification.js';

// GET /api/notifications
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 });
  res.json(notifications);
};

// PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  const notif = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notif) return res.status(404).json({ message: 'Not found' });

  notif.read = true;
  await notif.save();
  res.json({ message: 'Marked as read' });
};
