const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database/db');
const authRoutes = require('./routes/auth');
const socialRoutes = require('./routes/social');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add io to requests for social routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/social', authenticateToken, socialRoutes);

initializeDatabase();

const users = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  const jwt = require('jsonwebtoken');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    socket.userId = parseInt(decoded.userId); // Ensure it's a number
    socket.username = decoded.username;
    console.log('Socket authenticated:', socket.userId, socket.username, typeof socket.userId);
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User ${socket.username} (ID: ${socket.userId}) connected`);
  
  users.set(socket.userId, {
    socketId: socket.id,
    username: socket.username,
    status: 'online'
  });

  console.log('Current online users:', Array.from(users.keys()));

  // Send all online users to everyone (including the new user)
  const onlineUsersList = [];
  users.forEach((userInfo, userId) => {
    onlineUsersList.push({
      userId: userId,
      ...userInfo
    });
  });
  
  // Send updated user list to all connected clients
  io.emit('online_users', onlineUsersList);
  console.log('Sent online users to all clients:', onlineUsersList.map(u => u.userId));


  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  // Join group room for group chat
  socket.on('join_group', (groupId) => {
    socket.join(`group_${groupId}`);
    console.log(`User ${socket.username} joined group ${groupId}`);
  });

  // Leave group room
  socket.on('leave_group', (groupId) => {
    socket.leave(`group_${groupId}`);
    console.log(`User ${socket.username} left group ${groupId}`);
  });

  socket.on('send_message', (data) => {
    const { receiverId, message, messageType = 'text', id } = data;
    const receiverUser = users.get(receiverId);
    const senderUser = users.get(socket.userId);
    
    const messageData = {
      id: id || Date.now(), // Use the real message ID from API if provided
      sender_id: socket.userId,
      receiver_id: receiverId,
      message,
      message_type: messageType,
      sender_username: socket.username,
      created_at: new Date().toISOString()
    };
    
    // Send to receiver
    if (receiverUser) {
      io.to(receiverUser.socketId).emit('new_message', messageData);
    }
    
    // Also send back to sender so their UI updates across all components
    if (senderUser) {
      io.to(senderUser.socketId).emit('new_message', messageData);
    }
  });

  socket.on('friend_request_sent', (data) => {
    const { receiverId } = data;
    const receiverUser = users.get(receiverId);
    
    if (receiverUser) {
      io.to(receiverUser.socketId).emit('new_friend_request', {
        sender_id: socket.userId,
        sender_username: socket.username,
        created_at: new Date().toISOString()
      });
    }
  });

  socket.on('friend_request_response', (data) => {
    const { senderId, status } = data;
    const senderUser = users.get(senderId);
    
    if (senderUser) {
      io.to(senderUser.socketId).emit('friend_request_responded', {
        responder_id: socket.userId,
        responder_username: socket.username,
        status,
        created_at: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User ${socket.username} (ID: ${socket.userId}) disconnected`);
    users.delete(socket.userId);
    console.log('Remaining online users:', Array.from(users.keys()));
    
    // Send updated user list to all remaining connected clients
    const onlineUsersList = [];
    users.forEach((userInfo, userId) => {
      onlineUsersList.push({
        userId: userId,
        ...userInfo
      });
    });
    
    io.emit('online_users', onlineUsersList);
    console.log('Sent updated online users to all clients:', onlineUsersList.map(u => u.userId));
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});