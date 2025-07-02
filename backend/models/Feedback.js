import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    roleAtTime: {
      type: String,
      enum: ['manager', 'admin', 'technician', 'user'],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);
