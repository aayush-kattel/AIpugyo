import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const existing = await User.findOne({ email: 'admin@aipugyo.com' });
if (existing) {
  console.log('Admin already exists');
  process.exit(0);
}

const hashed = await bcrypt.hash('admin123', 10);
await User.create({
  name: 'Admin',
  email: 'admin@aipugyo.com',
  password: hashed,
  isAdmin: true,
});

console.log('Admin created — email: admin@aipugyo.com, password: admin123');
process.exit(0);