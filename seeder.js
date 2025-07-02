// seed.js (in root folder)
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './backend/models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Optional: wipe existing users
    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = [
      {
        name: 'Admin User',
        email: 'admin@cut.ac.zw',
        password: hashedPassword,
        role: 'admin',
      },
      {
        name: 'Manager User',
        email: 'manager@cut.ac.zw',
        password: hashedPassword,
        role: 'manager',
      },
      {
        name: 'Technician User',
        email: 'technician@cut.ac.zw',
        password: hashedPassword,
        role: 'technician',
      },
      {
        name: 'Student User',
        email: 'user@cut.ac.zw',
        password: hashedPassword,
        role: 'user',
      },
    ];

    await User.insertMany(users);
    console.log('✅ Users seeded successfully');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
