import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';

async function updatePasswords() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const adminPassword = await bcrypt.hash('dmin789', 10);
    const employeePassword = await bcrypt.hash('ypoee987', 10);

    const adminUpdate = await User.findOneAndUpdate(
      { username: 'admin' },
      { password: adminPassword },
      { new: true }
    );
    console.log('Admin password updated:', !!adminUpdate);

    const employeeUpdate = await User.findOneAndUpdate(
      { username: 'employee' },
      { password: employeePassword },
      { new: true }
    );
    console.log('Employee password updated:', !!employeeUpdate);

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error updating passwords:', error);
  }
}

updatePasswords();
