const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  createUser, 
  getUser, 
  updateUserAvatar, 
  getAllUsers,
  getUserFriends,
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  removeFriend,
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUserCallHistory 
} = require('../database/db');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const messageFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/messages');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${uniqueSuffix}-${cleanName}`);
  }
});

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const uploadMessageFile = multer({
  storage: messageFileStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for message files
  },
  fileFilter: (req, file, cb) => {
    // Allow images, videos, documents, and other common file types
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('File type not supported'));
    }
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    getUser('email', email, async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      getUser('username', username, async (err, existingUsername) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (existingUsername) {
          return res.status(400).json({ error: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        createUser({ username, email, password: hashedPassword }, (err, user) => {
          if (err) {
            return res.status(500).json({ error: 'Error creating user' });
          }

          const token = generateToken(user);
          res.status(201).json({
            message: 'User registered successfully',
            user: { 
              id: user.id, 
              username: user.username, 
              email: user.email,
              avatar: null
            },
            token
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    getUser('email', email, async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      res.json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        },
        token
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/upload-avatar', authenticateToken, uploadAvatar.single('avatar'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;
    
    updateUserAvatar(req.user.userId, avatarPath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating avatar' });
      }

      res.json({
        message: 'Avatar updated successfully',
        avatar: avatarPath
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users', authenticateToken, (req, res) => {
  getAllUsers(req.user.userId, (err, users) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(users);
  });
});

router.get('/friends', authenticateToken, (req, res) => {
  getUserFriends(req.user.userId, (err, friends) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(friends);
  });
});

router.post('/friend-request', authenticateToken, (req, res) => {
  const { receiverId } = req.body;
  
  if (!receiverId) {
    return res.status(400).json({ error: 'Receiver ID is required' });
  }

  if (receiverId === req.user.userId) {
    return res.status(400).json({ error: 'Cannot send friend request to yourself' });
  }

  sendFriendRequest(req.user.userId, receiverId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error sending friend request' });
    }
    res.json({ message: 'Friend request sent successfully' });
  });
});

router.get('/friend-requests', authenticateToken, (req, res) => {
  const type = req.query.type || 'received';
  
  getFriendRequests(req.user.userId, type, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(requests);
  });
});

router.post('/friend-request/:requestId/respond', authenticateToken, (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;
  
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  respondToFriendRequest(requestId, status, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error responding to friend request' });
    }
    res.json({ message: `Friend request ${status} successfully` });
  });
});

router.delete('/friends/:friendId', authenticateToken, (req, res) => {
  const { friendId } = req.params;
  
  removeFriend(req.user.userId, friendId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error removing friend' });
    }
    res.json({ message: 'Friend removed successfully' });
  });
});

router.get('/messages/:friendId', authenticateToken, (req, res) => {
  const { friendId } = req.params;
  const limit = parseInt(req.query.limit) || 50;
  
  getMessages(req.user.userId, friendId, limit, (err, messages) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(messages);
  });
});

router.post('/messages', authenticateToken, (req, res) => {
  const { receiverId, message, messageType = 'text' } = req.body;
  
  if (!receiverId || !message) {
    return res.status(400).json({ error: 'Receiver ID and message are required' });
  }

  sendMessage(req.user.userId, receiverId, message, messageType, (err, newMessage) => {
    if (err) {
      return res.status(500).json({ error: 'Error sending message' });
    }
    res.json(newMessage);
  });
});

router.post('/upload-message-file', authenticateToken, uploadMessageFile.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { receiverId } = req.body;
    if (!receiverId) {
      return res.status(400).json({ error: 'Receiver ID is required' });
    }

    const filePath = `/uploads/messages/${req.file.filename}`;
    const fileInfo = {
      originalName: req.file.originalname,
      fileName: req.file.filename,
      filePath: filePath,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    };

    // Determine message type based on file type
    let messageType = 'file';
    if (req.file.mimetype.startsWith('image/')) {
      messageType = 'image';
    } else if (req.file.mimetype.startsWith('video/')) {
      messageType = 'video';
    }

    // Store file info as JSON string in message
    const messageContent = JSON.stringify(fileInfo);
    
    sendMessage(req.user.userId, receiverId, messageContent, messageType, (err, newMessage) => {
      if (err) {
        return res.status(500).json({ error: 'Error sending file message' });
      }
      
      // Parse the message back to include file info
      newMessage.fileInfo = fileInfo;
      newMessage.message = messageContent;
      
      res.json(newMessage);
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Server error during file upload' });
  }
});

router.post('/messages/:senderId/mark-read', authenticateToken, (req, res) => {
  const { senderId } = req.params;
  
  markMessagesAsRead(req.user.userId, senderId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error marking messages as read' });
    }
    res.json({ message: 'Messages marked as read' });
  });
});

router.get('/call-history', authenticateToken, (req, res) => {
  getUserCallHistory(req.user.userId, (err, history) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(history);
  });
});

router.get('/profile', authenticateToken, (req, res) => {
  getUser('id', req.user.userId, (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      status: user.status
    });
  });
});

module.exports = router;