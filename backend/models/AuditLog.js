import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: String,
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
    timestamp: { type: Date, default: Date.now },
    details: Object
  },
  { timestamps: true }
);

export default mongoose.model('AuditLog', auditLogSchema);
