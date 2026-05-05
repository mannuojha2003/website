const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const existing = await usersCollection.findOne({ username: 'admin' });
    if (existing) {
      console.log('Admin user already exists.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await usersCollection.insertOne({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Successfully added admin user with password admin123.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to db', err);
    process.exit(1);
  });
