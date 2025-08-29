const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { initializeDatabase, cleanupExpiredStories, cleanupDuplicateCallHistory } = require('./database/db');
const authRoutes = require('./routes/auth');
const socialRoutes = require('./routes/social');
const callRoutes = require('./routes/calls');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Ensure all upload directories exist
const ensureUploadDirectories = () => {
  const uploadDirs = [
    'uploads',
    'uploads/posts',
    'uploads/profiles',
    'uploads/avatars',
    'uploads/groups',
    'uploads/stories',
    'uploads/messages'
  ];

  uploadDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created upload directory: ${fullPath}`);
    }
  });

  console.log('📁 Upload directories verified/created successfully');
};

// Initialize upload directories
ensureUploadDirectories();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add io to requests for social routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/social', authenticateToken, socialRoutes);
app.use('/api/calls', authenticateToken, callRoutes);

initializeDatabase();

const users = new Map();
const activeCalls = new Map(); // Track active calls: callId -> { callerId, receiverId, type, status }
const callTimeouts = new Map(); // Track call timeouts: callId -> timeoutId

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

  // WebRTC Signaling for Audio Calls with Screen Share
  socket.on('initiate_call', (data) => {
    const { receiverId, callType = 'audio' } = data;
    const receiverUser = users.get(receiverId);
    const callerUser = users.get(socket.userId);
    
    if (!receiverUser || !callerUser) {
      socket.emit('call_error', { message: 'User not found or offline' });
      return;
    }

    const callId = `${socket.userId}-${receiverId}-${Date.now()}`;
    
    // Store call in active calls
    activeCalls.set(callId, {
      callerId: socket.userId,
      callerUsername: socket.username,
      receiverId,
      receiverUsername: receiverUser.username,
      type: callType,
      status: 'ringing',
      startTime: Date.now()
    });

    // Send call offer to receiver
    io.to(receiverUser.socketId).emit('incoming_call', {
      callId,
      callerId: socket.userId,
      callerUsername: socket.username,
      callType
    });

    // Confirm to caller that call was initiated
    socket.emit('call_initiated', { callId, receiverId, callType });
    
    // Set a timeout for the call (30 seconds)
    const timeoutId = setTimeout(() => {
      const call = activeCalls.get(callId);
      if (call && call.status === 'ringing') {
        console.log(`⏰ Call ${callId} timed out - no answer`);
        
        // Remove from active calls
        activeCalls.delete(callId);
        callTimeouts.delete(callId);
        
        // Notify both participants
        const callerUser = users.get(call.callerId);
        const receiverUser = users.get(call.receiverId);
        
        if (callerUser) {
          io.to(callerUser.socketId).emit('call_timeout', { callId });
        }
        if (receiverUser) {
          io.to(receiverUser.socketId).emit('call_timeout', { callId });
        }
      }
    }, 30000); // 30 seconds
    
    callTimeouts.set(callId, timeoutId);
    
    console.log(`📞 Call initiated: ${socket.username} -> ${receiverUser.username} (${callType})`);
  });

  socket.on('accept_call', (data) => {
    const { callId } = data;
    const call = activeCalls.get(callId);
    
    if (!call || call.receiverId !== socket.userId) {
      socket.emit('call_error', { message: 'Invalid call' });
      return;
    }

    // Clear the timeout since call is accepted
    const timeoutId = callTimeouts.get(callId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      callTimeouts.delete(callId);
    }

    // Update call status
    call.status = 'accepted';
    activeCalls.set(callId, call);

    const callerUser = users.get(call.callerId);
    if (callerUser) {
      io.to(callerUser.socketId).emit('call_accepted', { callId });
    }
    
    console.log(`✅ Call accepted: ${call.callerUsername} <-> ${call.receiverUsername}`);
  });

  socket.on('reject_call', (data) => {
    const { callId } = data;
    const call = activeCalls.get(callId);
    
    if (!call || call.receiverId !== socket.userId) {
      socket.emit('call_error', { message: 'Invalid call' });
      return;
    }

    // Clear the timeout since call is rejected
    const timeoutId = callTimeouts.get(callId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      callTimeouts.delete(callId);
    }

    // Remove call from active calls
    activeCalls.delete(callId);

    const callerUser = users.get(call.callerId);
    if (callerUser) {
      io.to(callerUser.socketId).emit('call_rejected', { callId });
    }
    
    console.log(`❌ Call rejected: ${call.callerUsername} -> ${call.receiverUsername}`);
  });

  socket.on('end_call', (data) => {
    const { callId } = data;
    const call = activeCalls.get(callId);
    
    if (!call || (call.callerId !== socket.userId && call.receiverId !== socket.userId)) {
      return;
    }

    // Clear the timeout if it exists
    const timeoutId = callTimeouts.get(callId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      callTimeouts.delete(callId);
    }

    // Remove call from active calls
    activeCalls.delete(callId);

    // Notify the other participant
    const otherUserId = call.callerId === socket.userId ? call.receiverId : call.callerId;
    const otherUser = users.get(otherUserId);
    
    if (otherUser) {
      io.to(otherUser.socketId).emit('call_ended', { callId });
    }
    
    console.log(`📞 Call ended: ${call.callerUsername} <-> ${call.receiverUsername}`);
  });

  // WebRTC Signaling Events
  socket.on('webrtc_offer', (data) => {
    const { callId, offer } = data;
    const call = activeCalls.get(callId);
    
    if (!call || call.callerId !== socket.userId) {
      return;
    }

    const receiverUser = users.get(call.receiverId);
    if (receiverUser) {
      io.to(receiverUser.socketId).emit('webrtc_offer', { callId, offer });
    }
  });

  socket.on('webrtc_answer', (data) => {
    const { callId, answer } = data;
    const call = activeCalls.get(callId);
    
    if (!call || call.receiverId !== socket.userId) {
      return;
    }

    const callerUser = users.get(call.callerId);
    if (callerUser) {
      io.to(callerUser.socketId).emit('webrtc_answer', { callId, answer });
    }
  });

  socket.on('webrtc_ice_candidate', (data) => {
    const { callId, candidate } = data;
    const call = activeCalls.get(callId);
    
    if (!call || (call.callerId !== socket.userId && call.receiverId !== socket.userId)) {
      return;
    }

    // Forward ICE candidate to the other participant
    const otherUserId = call.callerId === socket.userId ? call.receiverId : call.callerId;
    const otherUser = users.get(otherUserId);
    
    if (otherUser) {
      io.to(otherUser.socketId).emit('webrtc_ice_candidate', { callId, candidate });
    }
  });


  socket.on('disconnect', () => {
    console.log(`User ${socket.username} (ID: ${socket.userId}) disconnected`);
    
    // Handle any active calls for this user
    const userActiveCalls = Array.from(activeCalls.entries())
      .filter(([callId, call]) => call.callerId === socket.userId || call.receiverId === socket.userId);
    
    userActiveCalls.forEach(([callId, call]) => {
      // Notify the other participant that the call was ended due to disconnect
      const otherUserId = call.callerId === socket.userId ? call.receiverId : call.callerId;
      const otherUser = users.get(otherUserId);
      
      if (otherUser) {
        io.to(otherUser.socketId).emit('call_ended', { 
          callId, 
          reason: 'user_disconnected',
          disconnectedUser: socket.username 
        });
      }
      
      // Remove the call from active calls
      activeCalls.delete(callId);
      console.log(`📞 Call ${callId} ended due to user disconnect`);
    });
    
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

// Clean up expired stories every hour
setInterval(() => {
  cleanupExpiredStories((err) => {
    if (err) {
      console.error('❌ Error cleaning up expired stories:', err);
    } else {
      console.log('🧹 Cleaned up expired stories');
    }
  });
}, 60 * 60 * 1000); // Run every hour

// Initial cleanup on server start
cleanupExpiredStories((err) => {
  if (err) {
    console.error('❌ Error during initial story cleanup:', err);
  } else {
    console.log('🧹 Initial expired stories cleanup completed');
  }
});

// Cleanup duplicate call history on server start
cleanupDuplicateCallHistory((err) => {
  if (err) {
    console.error('❌ Error during initial call history cleanup:', err);
  } else {
    console.log('🧹 Initial call history cleanup completed');
  }
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});