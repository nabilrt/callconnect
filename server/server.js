const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database/db');
const authRoutes = require('./routes/auth');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);

initializeDatabase();

const users = new Map();
const activeRooms = new Map();

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

  socket.on('call_user', (data) => {
    const { targetUserId, offer, callType } = data;
    const targetUser = users.get(targetUserId);
    
    if (targetUser) {
      const roomId = `${socket.userId}-${targetUserId}-${Date.now()}`;
      activeRooms.set(roomId, {
        caller: socket.userId,
        callee: targetUserId,
        callType,
        status: 'calling'
      });

      io.to(targetUser.socketId).emit('incoming_call', {
        from: socket.userId,
        fromUsername: socket.username,
        offer,
        callType,
        roomId
      });

      socket.emit('call_initiated', { roomId, targetUserId });
    } else {
      socket.emit('user_unavailable', { targetUserId });
    }
  });

  socket.on('answer_call', (data) => {
    const { roomId, answer, accepted } = data;
    const room = activeRooms.get(roomId);
    
    if (room) {
      const callerUser = users.get(room.caller);
      if (accepted) {
        room.status = 'connected';
        socket.join(roomId);
        if (callerUser) {
          io.to(callerUser.socketId).emit('call_answered', {
            answer,
            roomId,
            accepted: true
          });
          users.get(room.caller).status = 'in-call';
          users.get(room.callee).status = 'in-call';
        }
      } else {
        activeRooms.delete(roomId);
        if (callerUser) {
          io.to(callerUser.socketId).emit('call_rejected', { roomId });
        }
      }
    }
  });

  socket.on('ice_candidate', (data) => {
    const { roomId, candidate } = data;
    socket.to(roomId).emit('ice_candidate', { candidate, from: socket.userId });
  });

  socket.on('end_call', (data) => {
    const { roomId } = data;
    const room = activeRooms.get(roomId);
    
    if (room) {
      socket.to(roomId).emit('call_ended', { roomId });
      activeRooms.delete(roomId);
      
      if (users.has(room.caller)) {
        users.get(room.caller).status = 'online';
      }
      if (users.has(room.callee)) {
        users.get(room.callee).status = 'online';
      }
      
      socket.leave(roomId);
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
  });

  socket.on('send_message', (data) => {
    const { receiverId, message, messageType = 'text' } = data;
    const receiverUser = users.get(receiverId);
    
    if (receiverUser) {
      io.to(receiverUser.socketId).emit('new_message', {
        id: Date.now(),
        sender_id: socket.userId,
        receiver_id: receiverId,
        message,
        message_type: messageType,
        sender_username: socket.username,
        created_at: new Date().toISOString()
      });
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
    
    for (const [roomId, room] of activeRooms.entries()) {
      if (room.caller === socket.userId || room.callee === socket.userId) {
        socket.to(roomId).emit('call_ended', { roomId });
        activeRooms.delete(roomId);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});