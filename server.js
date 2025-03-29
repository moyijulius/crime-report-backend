const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');


const testimonialRoutes = require('./routes/testimonialRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const cors = require('cors');
app.use(cors({ origin: 'https://crime-report-fronted.vercel.app/' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', testimonialRoutes);
// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});