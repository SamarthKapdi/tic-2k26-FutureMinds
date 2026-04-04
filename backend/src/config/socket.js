const { Server } = require('socket.io');
const { verifyUserToken } = require('../utils/jwt');

let io = null;

/**
 * Initialize Socket.io server
 */
const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Auth middleware for socket connections
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const decoded = verifyUserToken(token);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.userId}`);

    // Join user-specific room for targeted notifications
    socket.join(`user:${socket.userId}`);

    // Join global room for broadcasts
    socket.join('global');

    socket.on('disconnect', () => {
      console.log(`⚡ Socket disconnected: ${socket.userId}`);
    });
  });

  console.log('⚡ Socket.io initialized');
  return io;
};

/**
 * Get the Socket.io instance
 */
const getIO = () => {
  if (!io) {
    console.warn('Socket.io not initialized yet');
    return null;
  }
  return io;
};

/**
 * Emit event to a specific user
 */
const emitToUser = (userId, event, data) => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit event to all connected users
 */
const emitToAll = (event, data) => {
  const socketIO = getIO();
  if (socketIO) {
    socketIO.to('global').emit(event, data);
  }
};

/**
 * Emit to multiple specific users
 */
const emitToUsers = (userIds, event, data) => {
  const socketIO = getIO();
  if (socketIO) {
    userIds.forEach((uid) => {
      socketIO.to(`user:${uid}`).emit(event, data);
    });
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToAll,
  emitToUsers,
};
