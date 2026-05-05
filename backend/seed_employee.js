const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    const existing = await usersCollection.findOne({ username: 'employee' });
    if (existing) {
      console.log('Employee user already exists. Overwriting password to 1234...');
      const hashedPassword = await bcrypt.hash('1234', 10);
      await usersCollection.updateOne({ username: 'employee' }, { $set: { password: hashedPassword, role: 'employee' } });
      console.log('Updated employee password to 1234.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('1234', 10);
    await usersCollection.insertOne({
      username: 'employee',
      password: hashedPassword,
      role: 'employee',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('Successfully added employee user with password 1234.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error connecting to db', err);
    process.exit(1);
  });
