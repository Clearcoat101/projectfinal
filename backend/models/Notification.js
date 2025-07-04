import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    read: { type: Boolean, default: false },
    link: String // e.g. to the request detail
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
