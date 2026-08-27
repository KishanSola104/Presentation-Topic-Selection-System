const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/presentations', require('./routes/presentationRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/selections', require('./routes/selectionRoutes'));
app.use('/api/student', require('./routes/studentRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Endpoint not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong. Please try again.'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
