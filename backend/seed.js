import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Item from './models/Item.js';
import Request from './models/Request.js';
import Notification from './models/Notification.js';
import AuditLog from './models/AuditLog.js';
import Feedback from './models/Feedback.js';

dotenv.config();

const MONGO_URI = 'mongodb://127.0.0.1:27017/resource-manager';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await Promise.all([
      User.deleteMany(),
      Item.deleteMany(),
      Request.deleteMany(),
      Notification.deleteMany(),
      AuditLog.deleteMany(),
      Feedback.deleteMany()
    ]);
    console.log('🧹 Database cleared');
  } catch (err) {
    console.error('Error clearing database:', err);
  }
};

const createUsers = async () => {
  const roles = ['user', 'technician', 'admin', 'manager'];
  const departments = ['Engineering', 'Marketing', 'Operations', 'HR'];
  
  const users = [];
  
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  users.push({
    name: 'Admin User',
    email: 'admin@example.com',
    password: adminPassword,
    role: 'admin',
    department: 'Operations'
  });
  
  // Create other users
  for (let i = 1; i <= 15; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const password = await bcrypt.hash(`user${i}123`, 10);
    
    users.push({
      name: `User ${i} ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `user${i}@example.com`,
      password,
      role,
      department: departments[Math.floor(Math.random() * departments.length)]
    });
  }
  
  return User.insertMany(users);
};

const createItems = async () => {
  const assets = [
    { name: 'Projector HD-1000', category: 'asset', description: 'High-definition projector', location: 'Storage Room A', serialNumber: 'ASSET-001', condition: 'excellent' },
    { name: 'Laptop Dell XPS', category: 'asset', description: '16GB RAM, 1TB SSD', location: 'IT Department', serialNumber: 'ASSET-002', condition: 'good' },
    { name: 'Camera Canon EOS', category: 'asset', description: 'DSLR camera with lenses', location: 'Media Room', serialNumber: 'ASSET-003', condition: 'good' },
    { name: 'VR Headset', category: 'asset', description: 'Virtual reality headset', location: 'Lab', serialNumber: 'ASSET-004', condition: 'fair' }
  ];
  
  const venues = [
    { name: 'Conference Room A', category: 'venue', description: 'Main conference room', location: 'Floor 3', capacity: 20, timeSlots: [{ start: '09:00', end: '17:00', days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] }] },
    { name: 'Training Room B', category: 'venue', description: 'Training facility', location: 'Floor 2', capacity: 15, timeSlots: [{ start: '08:00', end: '20:00', days: ['monday', 'wednesday', 'friday'] }] },
    { name: 'Executive Boardroom', category: 'venue', description: 'Executive meeting room', location: 'Floor 5', capacity: 10, timeSlots: [{ start: '10:00', end: '16:00', days: ['tuesday', 'thursday'] }] }
  ];
  
  const consumables = [
    { name: 'Printer Paper', category: 'consumable', description: 'A4 printer paper', location: 'Supply Room', stockLevel: 150, minStockLevel: 50, unit: 'reams' },
    { name: 'Pens', category: 'consumable', description: 'Ballpoint pens', location: 'Supply Room', stockLevel: 200, minStockLevel: 100, unit: 'pieces' },
    { name: 'Staples', category: 'consumable', description: 'Box of staples', location: 'Supply Room', stockLevel: 30, minStockLevel: 10, unit: 'boxes' },
    { name: 'Coffee Pods', category: 'consumable', description: 'Coffee pods for break room', location: 'Kitchen', stockLevel: 80, minStockLevel: 20, unit: 'pods' }
  ];
  
  return Item.insertMany([...assets, ...venues, ...consumables]);
};

const createRequests = async (users, items) => {
  const requests = [];
  const statuses = ['pending', 'manager-approved', 'admin-approved', 'technician-approved', 'approved', 'rejected'];
  
  // Get references to specific users
  const regularUsers = users.filter(u => u.role === 'user');
  const managers = users.filter(u => u.role === 'manager');
  const admins = users.filter(u => u.role === 'admin');
  const technicians = users.filter(u => u.role === 'technician');
  
  // Create requests with different statuses
  for (let i = 0; i < 30; i++) {
    const requester = regularUsers[Math.floor(Math.random() * regularUsers.length)];
    const item = items[Math.floor(Math.random() * items.length)];
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 30));
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + (Math.floor(Math.random() * 8) + 1));
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const quantity = item.category === 'consumable' ? Math.floor(Math.random() * 10) + 1 : 1;
    
    const approvals = [
      { role: 'manager', approved: status !== 'pending' },
      { role: 'admin', approved: ['admin-approved', 'technician-approved', 'approved'].includes(status) },
      { role: 'technician', approved: ['technician-approved', 'approved'].includes(status) }
    ];
    
    const currentApprovalLevel = status === 'pending' ? 'manager' : 
                                status === 'manager-approved' ? 'admin' : 
                                status === 'admin-approved' ? 'technician' : null;
    
    requests.push({
      item: item._id,
      requester: requester._id,
      startTime: startDate,
      endTime: endDate,
      reason: `Need for ${i % 2 === 0 ? 'team meeting' : 'project work'}`,
      approvals,
      currentApprovalLevel,
      status,
      quantity,
      isRejected: status === 'rejected',
      ...(status === 'rejected' && { 
        rejectionReason: 'Not available at requested time' 
      })
    });
  }
  
  return Request.insertMany(requests);
};

const createNotifications = async (users, requests) => {
  const notifications = [];
  
  requests.forEach(request => {
    if (request.status === 'pending') {
      // Notify managers about pending requests
      const managers = users.filter(u => u.role === 'manager');
      managers.forEach(manager => {
        notifications.push({
          user: manager._id,
          message: `New request ${request._id} needs your approval`,
          link: `/requests/${request._id}`,
          read: Math.random() > 0.7
        });
      });
    } else if (request.status === 'approved') {
      // Notify requester about approval
      notifications.push({
        user: request.requester,
        message: `Your request ${request._id} has been approved`,
        link: `/requests/${request._id}`,
        read: false
      });
    } else if (request.status === 'rejected') {
      // Notify requester about rejection
      notifications.push({
        user: request.requester,
        message: `Your request ${request._id} was rejected`,
        link: `/requests/${request._id}`,
        read: false
      });
    }
  });
  
  return Notification.insertMany(notifications);
};

const createAuditLogs = async (users, requests) => {
  const actions = ['create', 'update', 'approve', 'reject'];
  const auditLogs = [];
  
  requests.forEach(request => {
    // Log creation
    auditLogs.push({
      action: 'create',
      performedBy: request.requester,
      targetRequest: request._id,
      details: { role: 'requester' }
    });
    
    // Log approvals
    request.approvals.forEach(approval => {
      if (approval.approved) {
        const approver = users.find(u => u.role === approval.role);
        if (approver) {
          auditLogs.push({
            action: 'approve',
            performedBy: approver._id,
            targetRequest: request._id,
            details: { role: approval.role }
          });
        }
      }
    });
    
    // Log rejection if applicable
    if (request.status === 'rejected') {
      const rejector = users.find(u => 
        request.approvals.some(a => a.role === u.role && !a.approved)
      );
      if (rejector) {
        auditLogs.push({
          action: 'reject',
          performedBy: rejector._id,
          targetRequest: request._id,
          details: { role: rejector.role, reason: request.rejectionReason }
        });
      }
    }
  });
  
  return AuditLog.insertMany(auditLogs);
};

const createFeedback = async (users, requests) => {
  const feedbackEntries = [];
  
  requests.forEach(request => {
    if (request.status === 'approved' || request.status === 'rejected') {
      feedbackEntries.push({
        request: request._id,
        user: request.requester,
        message: request.status === 'approved' 
          ? 'The resource worked perfectly for our needs' 
          : 'Disappointed with the rejection, could you reconsider?',
        roleAtTime: 'user'
      });
      
      // Add feedback from approvers
      request.approvals.forEach(approval => {
        if (approval.approved) {
          const approver = users.find(u => u.role === approval.role);
          if (approver) {
            feedbackEntries.push({
              request: request._id,
              user: approver._id,
              message: `Approved this request as ${approval.role}`,
              roleAtTime: approval.role
            });
          }
        }
      });
    }
  });
  
  return Feedback.insertMany(feedbackEntries);
};

const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();
    
    console.log('👥 Creating users...');
    const users = await createUsers();
    
    console.log('📦 Creating resources...');
    const items = await createItems();
    
    console.log('📝 Creating requests...');
    const requests = await createRequests(users, items);
    
    console.log('🔔 Creating notifications...');
    await createNotifications(users, requests);
    
    console.log('📋 Creating audit logs...');
    await createAuditLogs(users, requests);
    
    console.log('💬 Creating feedback...');
    await createFeedback(users, requests);
    
    console.log('🌱 Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();