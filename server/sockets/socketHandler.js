import { handleGroupEvents } from './groupSocketHandlers.js';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

export const handleSocketConnection = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      const token = cookieHeader
      .split('; ')
      .find(c => c.startsWith('token='))
      ?.split('=')[1];
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id;
      socket.username = user.name;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.username} (${socket.id})`);

    handleGroupEvents(io, socket);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.username} (${socket.id})`);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};
