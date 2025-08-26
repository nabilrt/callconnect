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
    console.log('File filter check:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    // Allow images, videos, documents, and other common file types
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm|mkv|flv|wmv|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    
    if (extname) {
      console.log('File type allowed:', file.originalname);
      return cb(null, true);
    } else {
      console.log('File type not supported:', file.originalname, path.extname(file.originalname));
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

    // Create notification for the receiver
    const notificationData = {
      user_id: receiverId,
      type: 'friend_request',
      title: 'New Friend Request',
      message: `${req.user.username} sent you a friend request`,
      data: {
        sender_id: req.user.userId,
        sender_username: req.user.username
      }
    };

    createNotification(notificationData, (notifyErr) => {
      if (notifyErr) {
        console.error('Error creating notification:', notifyErr);
      }
    });

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

  // First get the friend request details
  getFriendRequests(req.user.userId, 'received', (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    const request = requests.find(r => r.id == requestId);
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    respondToFriendRequest(requestId, status, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error responding to friend request' });
      }

      // Create notification for the sender
      const notificationData = {
        user_id: request.sender_id,
        type: status === 'accepted' ? 'friend_accepted' : 'friend_rejected',
        title: status === 'accepted' ? 'Friend Request Accepted' : 'Friend Request Declined',
        message: `${req.user.username} ${status} your friend request`,
        data: {
          responder_id: req.user.userId,
          responder_username: req.user.username,
          status: status
        }
      };

      createNotification(notificationData, (notifyErr) => {
        if (notifyErr) {
          console.error('Error creating notification:', notifyErr);
        }
      });

      res.json({ message: `Friend request ${status} successfully` });
    });
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

router.get('/messages/unread-count', authenticateToken, (req, res) => {
  const db = require('../database/db').db;
  
  // Get total unread messages count
  db.get(`
    SELECT COUNT(*) as totalUnread
    FROM messages 
    WHERE receiver_id = ? AND read_status = 0
  `, [req.user.userId], (err, totalResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Get unread count by friend
    db.all(`
      SELECT sender_id as friend_id, COUNT(*) as unread_count
      FROM messages 
      WHERE receiver_id = ? AND read_status = 0
      GROUP BY sender_id
    `, [req.user.userId], (err, friendResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      res.json({
        totalUnread: totalResult.totalUnread,
        unreadByFriend: friendResults
      });
    });
  });
});

router.patch('/messages/:friendId/mark-read', authenticateToken, (req, res) => {
  const { friendId } = req.params;
  const db = require('../database/db').db;
  
  db.run(`
    UPDATE messages 
    SET read_status = 1 
    WHERE receiver_id = ? AND sender_id = ? AND read_status = 0
  `, [req.user.userId, friendId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Messages marked as read' });
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

router.post('/upload-message-file', authenticateToken, (req, res) => {
  uploadMessageFile.single('file')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
      }
      if (err.message === 'File type not supported') {
        return res.status(400).json({ error: 'File type not supported. Allowed: images, videos, documents.' });
      }
      return res.status(400).json({ error: err.message || 'File upload failed' });
    }
    
    // Continue with the original handler
  try {
    console.log('Upload route hit:', {
      file: req.file ? 'present' : 'missing',
      body: req.body,
      user: req.user.userId
    });

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('File details:', {
      originalname: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    const { receiverId } = req.body;
    if (!receiverId) {
      console.log('No receiverId in request body');
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

    console.log('Sending message with type:', messageType);

    // Store file info as JSON string in message
    const messageContent = JSON.stringify(fileInfo);
    
    sendMessage(req.user.userId, receiverId, messageContent, messageType, (err, newMessage) => {
      if (err) {
        console.error('Error in sendMessage:', err);
        return res.status(500).json({ error: 'Error sending file message' });
      }
      
      console.log('Message sent successfully:', newMessage);
      
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