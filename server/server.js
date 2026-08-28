const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ================================
// CORS Configuration
// ================================

const cors = require('cors');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://presentation-topic-selection-system.vercel.app',
    'https://presentation-topic-selection-git-52bb6e-kishansola104s-projects.vercel.app'
  ],
  credentials: true
}));


app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

// ================================
// Middlewares
// ================================

app.use(express.json());

// ================================
// Mount Routes
// ================================

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/presentations', require('./routes/presentationRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/selections', require('./routes/selectionRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));

// ================================
// Health Check
// ================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date()
  });
});

// ================================
// 404 Handler
// ================================

app.use((req, res, next) => {
  res.status(404).json({
    message: 'Endpoint not found.'
  });
});

// ================================
// Global Error Handler
// ================================

app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong. Please try again.'
  });
});

// ================================
// Start Server
// ================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});