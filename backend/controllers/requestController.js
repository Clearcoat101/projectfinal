import Request from '../models/Request.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';
import Item from '../models/Item.js';

const checkItemAvailability = async (itemId, startTime, endTime, quantity = 1) => {
  const item = await Item.findById(itemId);
  if (!item || !item.availability) return false;

  // Consumables: check stock level
  if (item.category === 'consumable') {
    return item.stockLevel >= quantity;
  }

  // Venues/Assets: check time conflicts
  const overlappingRequests = await Request.find({
    item: itemId,
    status: { $in: ['pending', 'approved', 'manager-approved', 'admin-approved'] },
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
    ]
  });

  return overlappingRequests.length === 0;
};

export const createRequest = async (req, res) => {
  const { item, startTime, endTime, reason } = req.body;

  try {
    // Validate input
    if (!item || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (new Date(startTime) >= new Date(endTime)) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    // Check item availability
    const available = await checkItemAvailability(item, startTime, endTime);
    if (!available) {
      return res.status(400).json({ message: 'Item is not available for the selected time' });
    }

    const newRequest = await Request.create({
      item,
      requester: req.user._id,
      startTime,
      endTime,
      reason,
      approvals: [
        { role: 'manager' },
        { role: 'admin' },
        { role: 'technician' }
      ],
      currentApprovalLevel: 'manager',
      status: 'pending'
    });

    // Notify managers
    const managers = await User.find({ role: 'manager' });
    await Notification.insertMany(
      managers.map(manager => ({
        user: manager._id,
        message: `New request ${newRequest._id} needs your approval.`,
        link: `/requests/${newRequest._id}`
      }))
    );

    res.status(201).json(newRequest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Request creation failed', error: err.message });
  }
};

export const getRequests = async (req, res) => {
  const { role, _id: userId } = req.user;

  let filter = {};
  if (role === 'user') {
    filter.requester = userId;
  } else if (role === 'technician') {
    filter.currentApprovalLevel = 'technician';
  } else if (role === 'admin') {
    filter.currentApprovalLevel = 'admin';
  } else if (role === 'manager') {
    // managers see everything
  }

  const requests = await Request.find(filter)
    .populate('requester', 'name email')
    .populate('item', 'name category')
    .sort({ createdAt: -1 });

  res.json(requests);
};

export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requester', 'name email role')
      .populate('item')
      .lean();

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ 
      message: 'Error fetching request',
      error: err.message 
    });
  }
};

export const approveRequest = async (req, res) => {
  const { role, _id: userId } = req.user;
  const reqDoc = await Request.findById(req.params.id);
  
  if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
  if (reqDoc.currentApprovalLevel !== role) {
    return res.status(403).json({ message: 'Not your approval stage' });
  }

  // mark approval
  const approval = reqDoc.approvals.find(a => a.role === role);
  approval.approved = true;
  approval.approvedAt = new Date();
  approval.approver = userId;

  // advance stage
  const order = ['manager','admin','technician'];
  const idx = order.indexOf(role);
  
  if (idx < order.length - 1) {
    reqDoc.currentApprovalLevel = order[idx + 1];
    reqDoc.status = `${role}-approved`;
    
    // Notify next approvers
    const nextApprovers = await User.find({ role: reqDoc.currentApprovalLevel });
    await Notification.insertMany(
      nextApprovers.map(user => ({
        user: user._id,
        message: `Request ${reqDoc._id} needs your approval.`,
        link: `/requests/${reqDoc._id}`
      }))
    );
  } else {
    // final approval
    reqDoc.status = 'approved';
    reqDoc.currentApprovalLevel = null;
    
    // notify requester
    await Notification.create({
      user: reqDoc.requester,
      message: `Your request ${reqDoc._id} has been fully approved.`,
      link: `/requests/${reqDoc._id}`
    });
  }

  await reqDoc.save();
  await AuditLog.create({
    action: 'approve',
    performedBy: userId,
    targetRequest: reqDoc._id,
    details: { role }
  });

  res.json({ message: 'Approved', request: reqDoc });
};

export const rejectRequest = async (req, res) => {
  const { role, _id: userId } = req.user;
  const { reason } = req.body;
  const reqDoc = await Request.findById(req.params.id);
  if (!reqDoc) return res.status(404).json({ message: 'Request not found' });
  if (reqDoc.currentApprovalLevel !== role)
    return res.status(403).json({ message: 'Not your approval stage' });

  reqDoc.status = 'rejected';
  reqDoc.isRejected = true;
  await reqDoc.save();

  // notify requester
  await Notification.create({
    user: reqDoc.requester,
    message: `Your request ${reqDoc._id} was rejected by ${role}.`,
    link: `/requests/${reqDoc._id}`
  });

  await AuditLog.create({
    action: 'reject',
    performedBy: userId,
    targetRequest: reqDoc._id,
    details: { role, reason }
  });

  res.json({ message: 'Request rejected', request: reqDoc });
};

// Explicitly export all controller functions
export default {
  createRequest,
  getRequests,
  getRequestById,
  approveRequest,
  rejectRequest
};