const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'calling_app.db');
const db = new sqlite3.Database(dbPath);

const initializeDatabase = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT NULL,
      status TEXT DEFAULT 'offline',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS friend_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(sender_id, receiver_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS friendships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user1_id, user2_id),
      CHECK(user1_id < user2_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'file')),
      read_status BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('message', 'friend_request', 'friend_accepted', 'friend_rejected')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT, -- JSON data for additional info
      read_status BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);


    console.log('Database initialized successfully');
  });
};

const getUser = (field, value, callback) => {
  const query = `SELECT * FROM users WHERE ${field} = ?`;
  db.get(query, [value], callback);
};

const createUser = (userData, callback) => {
  const { username, email, password } = userData;
  const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
  db.run(query, [username, email, password], function(err) {
    if (callback) {
      callback(err, { id: this.lastID, username, email });
    }
  });
};

const updateUserAvatar = (userId, avatarPath, callback) => {
  const now = new Date().toISOString();
  const query = `UPDATE users SET avatar = ?, updated_at = ? WHERE id = ?`;
  db.run(query, [avatarPath, now, userId], callback);
};

const updateUserStatus = (userId, status, callback) => {
  const now = new Date().toISOString();
  const query = `UPDATE users SET status = ?, updated_at = ? WHERE id = ?`;
  db.run(query, [status, now, userId], callback);
};

const getAllUsers = (excludeUserId, callback) => {
  const query = `SELECT id, username, email, avatar, status, created_at FROM users WHERE id != ?`;
  db.all(query, [excludeUserId], callback);
};

const getUserFriends = (userId, callback) => {
  const query = `
    SELECT u.id, u.username, u.email, u.avatar, u.status 
    FROM users u 
    INNER JOIN friendships f ON (
      (f.user1_id = ? AND f.user2_id = u.id) OR 
      (f.user2_id = ? AND f.user1_id = u.id)
    )
    WHERE u.id != ?
  `;
  db.all(query, [userId, userId, userId], callback);
};

const sendFriendRequest = (senderId, receiverId, callback) => {
  const query = `INSERT OR IGNORE INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)`;
  db.run(query, [senderId, receiverId], callback);
};

const getFriendRequests = (userId, type = 'received', callback) => {
  let query;
  if (type === 'received') {
    query = `
      SELECT fr.id as request_id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at, fr.updated_at,
             u.id as user_id, u.username, u.email, u.avatar 
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `;
  } else {
    query = `
      SELECT fr.id as request_id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at, fr.updated_at,
             u.id as user_id, u.username, u.email, u.avatar 
      FROM friend_requests fr
      JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ? AND fr.status = 'pending'
      ORDER BY fr.created_at DESC
    `;
  }
  db.all(query, [userId], callback);
};

const respondToFriendRequest = (requestId, status, callback) => {
  db.serialize(() => {
    db.get(`SELECT * FROM friend_requests WHERE id = ?`, [requestId], (err, request) => {
      if (err || !request) {
        return callback(err || new Error('Request not found'));
      }

      const now = new Date().toISOString();
      db.run(
        `UPDATE friend_requests SET status = ?, updated_at = ? WHERE id = ?`,
        [status, now, requestId],
        function(updateErr) {
          if (updateErr) {
            return callback(updateErr);
          }

          if (status === 'accepted') {
            const user1Id = Math.min(request.sender_id, request.receiver_id);
            const user2Id = Math.max(request.sender_id, request.receiver_id);
            
            db.run(
              `INSERT OR IGNORE INTO friendships (user1_id, user2_id) VALUES (?, ?)`,
              [user1Id, user2Id],
              callback
            );
          } else {
            callback(null);
          }
        }
      );
    });
  });
};

const removeFriend = (userId, friendId, callback) => {
  const user1Id = Math.min(userId, friendId);
  const user2Id = Math.max(userId, friendId);
  
  db.run(
    `DELETE FROM friendships WHERE user1_id = ? AND user2_id = ?`,
    [user1Id, user2Id],
    callback
  );
};

const sendMessage = (senderId, receiverId, message, messageType = 'text', callback) => {
  const now = new Date().toISOString();
  const query = `INSERT INTO messages (sender_id, receiver_id, message, message_type, created_at) VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [senderId, receiverId, message, messageType, now], function(err) {
    if (callback) {
      callback(err, { 
        id: this.lastID, 
        sender_id: senderId, 
        receiver_id: receiverId, 
        message, 
        message_type: messageType,
        created_at: now
      });
    }
  });
};

const getMessages = (userId, friendId, limit = 50, callback) => {
  const query = `
    SELECT m.*, 
           s.username as sender_username, s.avatar as sender_avatar,
           r.username as receiver_username, r.avatar as receiver_avatar
    FROM messages m
    JOIN users s ON m.sender_id = s.id
    JOIN users r ON m.receiver_id = r.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at DESC
    LIMIT ?
  `;
  db.all(query, [userId, friendId, friendId, userId, limit], (err, messages) => {
    if (callback) {
      callback(err, messages ? messages.reverse() : []);
    }
  });
};

const markMessagesAsRead = (userId, senderId, callback) => {
  const query = `UPDATE messages SET read_status = TRUE WHERE sender_id = ? AND receiver_id = ? AND read_status = FALSE`;
  db.run(query, [senderId, userId], callback);
};

const getUnreadMessageCount = (userId, callback) => {
  const query = `SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read_status = FALSE`;
  db.get(query, [userId], callback);
};

const createNotification = (notificationData, callback) => {
  const { user_id, type, title, message, data } = notificationData;
  const now = new Date().toISOString();
  const query = `INSERT INTO notifications (user_id, type, title, message, data, created_at) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [user_id, type, title, message, JSON.stringify(data), now], callback);
};

const getNotifications = (userId, callback) => {
  const query = `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`;
  db.all(query, [userId], callback);
};

const getUnreadNotificationsCount = (userId, callback) => {
  const query = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = FALSE`;
  db.get(query, [userId], callback);
};

const markNotificationAsRead = (notificationId, callback) => {
  const query = `UPDATE notifications SET read_status = TRUE WHERE id = ?`;
  db.run(query, [notificationId], callback);
};

const markAllNotificationsAsRead = (userId, callback) => {
  const query = `UPDATE notifications SET read_status = TRUE WHERE user_id = ?`;
  db.run(query, [userId], callback);
};


module.exports = {
  db,
  initializeDatabase,
  getUser,
  createUser,
  updateUserAvatar,
  updateUserStatus,
  getAllUsers,
  getUserFriends,
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  removeFriend,
  sendMessage,
  getMessages,
  markMessagesAsRead,
  getUnreadMessageCount,
  createNotification,
  getNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
  markAllNotificationsAsRead
};