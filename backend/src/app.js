const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
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
const server = http.createServer(app);

// ═══════════════════════════════════════════
// SOCKET.IO SETUP
// ═══════════════════════════════════════════
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Socket.IO JWT authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`⚡ Socket connected: ${socket.userId}`);
  socket.join(`user:${socket.userId}`);

  socket.on('disconnect', () => {
    console.log(`⚡ Socket disconnected: ${socket.userId}`);
  });
});

// Make io accessible in routes/controllers via req.app
app.set('io', io);

// ═══════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});
app.use('/api/auth/', authLimiter);

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ═══════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SAHYOG API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blood', bloodRoutes);
app.use('/api/fund', fundRoutes);
app.use('/api/missing', missingRoutes);
app.use('/api/report', reportRoutes);

// ═══════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// ═══════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await initializeDatabase();

    server.listen(PORT, () => {
      console.log(`SAHYOG API Server Running :-     
                    Port:        ${PORT}                        
                    Environment: ${process.env.NODE_ENV}
                    API:         http://localhost:${PORT}/api
                    Socket.IO:   Enabled ⚡
                `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };