const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./config/db');

// Import routes
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const bloodRoutes = require('./modules/blood/blood.routes');
const fundRoutes = require('./modules/fund/fund.routes');
const missingRoutes = require('./modules/missing/missing.routes');
const reportRoutes = require('./modules/report/report.routes');

const app = express();

// MIDDLEWARE

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
});

app.use('/api/', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});

app.use('/api/auth/', authLimiter);

// Static files (uploads directory)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));


// ROUTES

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'SAHYOG API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// Module routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/fund', fundRoutes);
app.use('/api/missing', missingRoutes);
app.use('/api/report', reportRoutes);

// ERROR HANDLING

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
});

// SERVER STARTUP

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Initialize database schema
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`SAHYOG API Server Running.     
        Port:        ${PORT}                        
        Environment: ${process.env.NODE_ENV}
        API:         http://localhost:${PORT}/api   
      `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;