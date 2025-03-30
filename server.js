require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // Make sure to install this: npm install cors
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Define allowed origins
const allowedOrigins = [
  'https://crime-report-fronted.vercel.app',
  /\.crime-report-fronted(-[\w]+)?\.vercel\.app$/,
  'http://localhost:5173'
];

// Use the cors package for more reliable CORS handling
const corsOptions = {
  origin: function (origin, callback) {
    // For requests without an origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    const allowed = allowedOrigins.some(pattern => 
      typeof pattern === 'string' ? origin === pattern : pattern.test(origin)
    );
    
    if (allowed) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// For debugging - log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'No origin'}`);
  next();
});

app.use(express.json());

// Basic Routes
app.get('/', (req, res) => {
  res.json({
    status: 'API Running',
    endpoints: {
      api: '/api',
      health: '/api/health',
      auth: '/api/auth',
      reports: '/api/reports',
      testimonials: '/api/testimonials'
    }
  });
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Test Route
app.get('/api', (req, res) => {
  res.json({ message: "API is working!" });
});
app.use('/api/testimonials', (req, res, next) => {
  console.log(`Testimonials route hit: ${req.method} ${req.url}`);
  next();
});

// Application Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/testimonials', testimonialRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});