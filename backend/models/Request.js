import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  role: { type: String, enum: ['manager', 'admin', 'technician'], required: true },
  approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved: { type: Boolean, default: false },
  approvedAt: { type: Date }
}, { _id: false });

const requestSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true, index: true },
    reason: { type: String },
    status: {
      type: String,
      enum: [
        'pending',
        'manager-approved',
        'admin-approved',
        'technician-approved',
        'rejected',
        'approved'
      ],
      default: 'pending',
      index: true
    },
    approvals: [approvalSchema],
    currentApprovalLevel: {
      type: String,
      enum: ['manager', 'admin', 'technician'],
      default: 'manager'
    },
    isRejected: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Compound indexes for better query performance
requestSchema.index({ requester: 1, status: 1 });
requestSchema.index({ item: 1, startTime: 1, endTime: 1 });

export default mongoose.model('Request', requestSchema);