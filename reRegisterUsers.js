const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust the path to your User model

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/ReportCrime', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Function to re-register the admin and officer users
const reRegisterUsers = async () => {
  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('secureAdmin123#', 10);
    const officerPassword = await bcrypt.hash('secureOfficer123#', 10);

    // Create the admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      phone: '1234567890',
      role: 'admin',
    });

    // Create the officer user
    const officerUser = new User({
      username: 'officer',
      email: 'officer@example.com',
      password: officerPassword,
      phone: '0987654321',
      role: 'officer',
    });

    // Save the admin user to the database
    await adminUser.save();
    console.log('Admin user re-registered successfully');

    // Save the officer user to the database
    await officerUser.save();
    console.log('Officer user re-registered successfully');
  } catch (error) {
    console.error('Error re-registering users:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
};

// Run the function
reRegisterUsers();