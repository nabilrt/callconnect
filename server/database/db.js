const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'calling_app.db');
const db = new sqlite3.Database(dbPath);

const runMigrations = () => {
  // Check if messages table exists and has video support
  db.get("PRAGMA table_info(messages)", (err, row) => {
    if (err) {
      console.log('Error checking table info:', err);
      return;
    }
    
    // Check current constraint by trying to insert a video message
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='messages'", (err, result) => {
      if (err) {
        console.log('Error getting table schema:', err);
        return;
      }
      
      if (result && result.sql && !result.sql.includes("'video'")) {
        console.log('Migrating messages table to support video message type...');
        
        // SQLite doesn't support ALTER TABLE with CHECK constraints directly
        // We need to recreate the table
        db.serialize(() => {
          // Create backup table
          db.run(`CREATE TABLE messages_backup AS SELECT * FROM messages`);
          
          // Drop original table
          db.run(`DROP TABLE messages`);
          
          // Create new table with video support
          db.run(`CREATE TABLE messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            sender_id INTEGER NOT NULL,
            receiver_id INTEGER NOT NULL,
            message TEXT NOT NULL,
            message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'video', 'file')),
            read_status BOOLEAN DEFAULT FALSE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
          )`);
          
          // Restore data
          db.run(`INSERT INTO messages SELECT * FROM messages_backup`);
          
          // Drop backup table
          db.run(`DROP TABLE messages_backup`);
          
          console.log('Messages table migration completed.');
        });
      }
    });
  });

  // Check if call_history table exists and has the correct schema
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='call_history'", (err, table) => {
    if (err) {
      console.log('Error checking call_history table:', err);
      return;
    }
    
    if (!table) {
      console.log('📞 Creating call_history table...');
      db.run(`CREATE TABLE call_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        caller_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        call_type TEXT NOT NULL CHECK(call_type IN ('audio', 'video')),
        direction TEXT NOT NULL CHECK(direction IN ('incoming', 'outgoing')),
        status TEXT NOT NULL CHECK(status IN ('completed', 'missed', 'rejected')),
        duration INTEGER DEFAULT 0,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ended_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )`, (err) => {
        if (err) {
          console.error('❌ Error creating call_history table:', err);
        } else {
          console.log('✅ Call history table created successfully.');
        }
      });
    } else {
      // Check if existing table has correct structure
      console.log('✅ Call history table already exists. Checking schema...');
      db.get("PRAGMA table_info(call_history)", (err, result) => {
        if (err) {
          console.log('Error checking call_history table schema:', err);
          return;
        }
        
        // Get all columns in the table
        db.all("PRAGMA table_info(call_history)", (err, columns) => {
          if (err) {
            console.log('Error getting call_history columns:', err);
            return;
          }
          
          const columnNames = columns.map(col => col.name);
          console.log('📞 Current call_history columns:', columnNames);
          
          // Check if we need to migrate the table
          const hasReceiverIdColumn = columnNames.includes('receiver_id');
          const hasDirectionColumn = columnNames.includes('direction');
          const hasCreatedAtColumn = columnNames.includes('created_at');
          const hasCalleeIdColumn = columnNames.includes('callee_id');
          
          if (!hasReceiverIdColumn || !hasDirectionColumn || !hasCreatedAtColumn || hasCalleeIdColumn) {
            console.log('🔧 Call history table needs migration...');
            
            // Backup existing data
            db.run(`CREATE TABLE call_history_backup AS SELECT * FROM call_history`, (backupErr) => {
              if (backupErr) {
                console.error('❌ Error creating backup:', backupErr);
                return;
              }
              
              // Drop the old table
              db.run(`DROP TABLE call_history`, (dropErr) => {
                if (dropErr) {
                  console.error('❌ Error dropping old table:', dropErr);
                  return;
                }
                
                // Create new table with correct schema
                db.run(`CREATE TABLE call_history (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  caller_id INTEGER NOT NULL,
                  receiver_id INTEGER NOT NULL,
                  call_type TEXT NOT NULL CHECK(call_type IN ('audio', 'video')),
                  direction TEXT NOT NULL CHECK(direction IN ('incoming', 'outgoing')),
                  status TEXT NOT NULL CHECK(status IN ('completed', 'missed', 'rejected')),
                  duration INTEGER DEFAULT 0,
                  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  ended_at DATETIME DEFAULT NULL,
                  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
                  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
                )`, (createErr) => {
                  if (createErr) {
                    console.error('❌ Error creating new call_history table:', createErr);
                    return;
                  }
                  
                  // Migrate existing data if any
                  db.get("SELECT COUNT(*) as count FROM call_history_backup", (countErr, countResult) => {
                    if (countErr || !countResult || countResult.count === 0) {
                      // No data to migrate, just clean up
                      db.run(`DROP TABLE call_history_backup`);
                      console.log('✅ Call history table migrated successfully (no data to migrate).');
                      return;
                    }
                    
                    // Migrate data from backup table
                    console.log(`🔧 Migrating ${countResult.count} call history records...`);
                    const migrateQuery = hasCalleeIdColumn ? 
                      `INSERT INTO call_history (caller_id, receiver_id, call_type, direction, status, duration, started_at, ended_at, created_at)
                       SELECT caller_id, callee_id, call_type, 'outgoing', status, duration, started_at, ended_at, started_at FROM call_history_backup` :
                      `INSERT INTO call_history (caller_id, receiver_id, call_type, direction, status, duration, started_at, ended_at, created_at)
                       SELECT caller_id, receiver_id, call_type, COALESCE(direction, 'outgoing'), status, duration, started_at, ended_at, COALESCE(created_at, started_at) FROM call_history_backup`;
                    
                    db.run(migrateQuery, (migrateErr) => {
                      if (migrateErr) {
                        console.error('❌ Error migrating data:', migrateErr);
                      } else {
                        console.log('✅ Call history data migrated successfully.');
                      }
                      
                      // Clean up backup table
                      db.run(`DROP TABLE call_history_backup`);
                      console.log('✅ Call history table migration completed.');
                    });
                  });
                });
              });
            });
          } else {
            console.log('✅ Call history table schema is correct.');
          }
        });
      });
    }
  });
};

const initializeDatabase = () => {
  db.serialize(() => {
    // Run migrations first
    runMigrations();
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
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'video', 'file')),
      read_status BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('message', 'friend_request', 'friend_accepted', 'friend_rejected', 'post_like', 'post_comment', 'group_invite', 'group_join')),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT, -- JSON data for additional info
      read_status BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Posts table for social media posts
    db.run(`CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      image TEXT DEFAULT NULL,
      video TEXT DEFAULT NULL,
      post_type TEXT DEFAULT 'text' CHECK(post_type IN ('text', 'image', 'video', 'shared')),
      shared_post_id INTEGER DEFAULT NULL,
      privacy TEXT DEFAULT 'friends' CHECK(privacy IN ('public', 'friends', 'private')),
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (shared_post_id) REFERENCES posts(id) ON DELETE CASCADE
    )`);

    // Post likes table
    db.run(`CREATE TABLE IF NOT EXISTS post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(post_id, user_id)
    )`);

    // Post comments table
    db.run(`CREATE TABLE IF NOT EXISTS post_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      likes_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Comment likes table
    db.run(`CREATE TABLE IF NOT EXISTS comment_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      comment_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (comment_id) REFERENCES post_comments(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(comment_id, user_id)
    )`);

    // Groups table
    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT NULL,
      image TEXT DEFAULT NULL,
      created_by INTEGER NOT NULL,
      privacy TEXT DEFAULT 'public' CHECK(privacy IN ('public', 'private')),
      members_count INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Group members table
    db.run(`CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member' CHECK(role IN ('admin', 'moderator', 'member')),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(group_id, user_id)
    )`);

    // Group messages table for group chat
    db.run(`CREATE TABLE IF NOT EXISTS group_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      sender_id INTEGER NOT NULL,
      message TEXT NOT NULL,
      message_type TEXT DEFAULT 'text' CHECK(message_type IN ('text', 'image', 'file')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Group posts table (posts within groups)
    db.run(`CREATE TABLE IF NOT EXISTS group_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      image TEXT DEFAULT NULL,
      video TEXT DEFAULT NULL,
      post_type TEXT DEFAULT 'text' CHECK(post_type IN ('text', 'image', 'video')),
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Stories table
    db.run(`CREATE TABLE IF NOT EXISTS stories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      content TEXT DEFAULT NULL,
      image TEXT DEFAULT NULL,
      video TEXT DEFAULT NULL,
      story_type TEXT DEFAULT 'image' CHECK(story_type IN ('text', 'image', 'video')),
      background_color TEXT DEFAULT NULL,
      text_color TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Story views table
    db.run(`CREATE TABLE IF NOT EXISTS story_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id INTEGER NOT NULL,
      viewer_id INTEGER NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE,
      FOREIGN KEY (viewer_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(story_id, viewer_id)
    )`);


    // Group post likes table
    db.run(`CREATE TABLE IF NOT EXISTS group_post_likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES group_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(post_id, user_id)
    )`);

    // Group post comments table
    db.run(`CREATE TABLE IF NOT EXISTS group_post_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      comment TEXT NOT NULL,
      likes_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES group_posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);


    // Update users table to include social media profile fields
    // Check and add columns only if they don't exist
    db.get("PRAGMA table_info(users)", (err, result) => {
      if (!err) {
        db.all("PRAGMA table_info(users)", (err, columns) => {
          if (!err) {
            const columnNames = columns.map(col => col.name);
            
            if (!columnNames.includes('bio')) {
              db.run(`ALTER TABLE users ADD COLUMN bio TEXT DEFAULT NULL`);
            }
            if (!columnNames.includes('cover_photo')) {
              db.run(`ALTER TABLE users ADD COLUMN cover_photo TEXT DEFAULT NULL`);
            }
            if (!columnNames.includes('location')) {
              db.run(`ALTER TABLE users ADD COLUMN location TEXT DEFAULT NULL`);
            }
            if (!columnNames.includes('website')) {
              db.run(`ALTER TABLE users ADD COLUMN website TEXT DEFAULT NULL`);
            }
            if (!columnNames.includes('birth_date')) {
              db.run(`ALTER TABLE users ADD COLUMN birth_date DATE DEFAULT NULL`);
            }
            if (!columnNames.includes('privacy_setting')) {
              db.run(`ALTER TABLE users ADD COLUMN privacy_setting TEXT DEFAULT 'public' CHECK(privacy_setting IN ('public', 'friends', 'private'))`);
            }
          }
        });
      }
    });

    // Dynamic content tables for admin panel management
    db.run(`CREATE TABLE IF NOT EXISTS content_sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('hero', 'features', 'testimonials', 'cta', 'about', 'pricing', 'stats', 'how_it_works', 'security')),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      button_text TEXT DEFAULT NULL,
      button_link TEXT DEFAULT NULL,
      image_url TEXT DEFAULT NULL,
      background_color TEXT DEFAULT NULL,
      text_color TEXT DEFAULT NULL,
      enabled BOOLEAN DEFAULT TRUE,
      section_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS content_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL,
      icon TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      feature_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_id) REFERENCES content_sections(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS content_testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      avatar_url TEXT DEFAULT NULL,
      company TEXT DEFAULT NULL,
      rating INTEGER DEFAULT 5,
      testimonial_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_id) REFERENCES content_sections(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS content_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_id INTEGER NOT NULL,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      icon TEXT DEFAULT NULL,
      stat_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (section_id) REFERENCES content_sections(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS app_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      description TEXT DEFAULT NULL,
      category TEXT DEFAULT 'general',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    console.log('Database initialized successfully');
    
    // Seed default content if none exists
    seedDefaultContent();
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
  console.log('🔄 Database: Attempting to insert friend request');
  console.log('🔄 Database: Sender ID:', senderId, 'Receiver ID:', receiverId);
  
  // First, delete any existing friend requests between these users
  const deleteQuery = `DELETE FROM friend_requests WHERE 
    (sender_id = ? AND receiver_id = ?) OR 
    (sender_id = ? AND receiver_id = ?)`;
    
  db.run(deleteQuery, [senderId, receiverId, receiverId, senderId], function(deleteErr) {
    if (deleteErr) {
      console.error('❌ Database: Error deleting existing requests:', deleteErr);
      return callback(deleteErr);
    }
    
    console.log('🔄 Database: Deleted existing requests, changes:', this.changes);
    
    // Now insert the new friend request
    const insertQuery = `INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 'pending')`;
    db.run(insertQuery, [senderId, receiverId], function(insertErr) {
      if (insertErr) {
        console.error('❌ Database: Error inserting friend request:', insertErr);
      } else {
        console.log('✅ Database: Friend request inserted, changes:', this.changes, 'lastID:', this.lastID);
      }
      callback(insertErr);
    });
  });
};

const getFriendRequests = (userId, type = 'received', callback) => {
  console.log('🔄 Database: Getting friend requests');
  console.log('🔄 Database: User ID:', userId, 'Type:', type);
  
  // First, let's check if there are any friend requests at all for debugging
  db.all('SELECT * FROM friend_requests WHERE receiver_id = ? OR sender_id = ?', [userId, userId], (debugErr, debugRows) => {
    console.log('🔍 Database: All friend requests for user', userId, ':', debugRows);
  });
  
  let query;
  if (type === 'received') {
    query = `
      SELECT fr.id as request_id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at, fr.updated_at,
             u.id as user_id, u.username, u.email, u.avatar 
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND (fr.status = 'pending' OR fr.status IS NULL)
      ORDER BY fr.created_at DESC
    `;
  } else {
    query = `
      SELECT fr.id as request_id, fr.sender_id, fr.receiver_id, fr.status, fr.created_at, fr.updated_at,
             u.id as user_id, u.username, u.email, u.avatar 
      FROM friend_requests fr
      JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ? AND (fr.status = 'pending' OR fr.status IS NULL)
      ORDER BY fr.created_at DESC
    `;
  }
  
  console.log('🔄 Database: Executing query:', query);
  console.log('🔄 Database: Query params:', [userId]);
  
  db.all(query, [userId], function(err, rows) {
    if (err) {
      console.error('❌ Database: Error executing query:', err);
    } else {
      console.log('✅ Database: Query executed, found rows:', rows.length);
      console.log('✅ Database: Rows data:', rows);
    }
    callback(err, rows);
  });
};

const respondToFriendRequest = (requestId, status, callback) => {
  console.log('🔄 Database: Responding to friend request:', requestId, 'with status:', status);
  
  db.serialize(() => {
    db.get(`SELECT * FROM friend_requests WHERE id = ?`, [requestId], (err, request) => {
      if (err || !request) {
        console.error('❌ Database: Request not found:', err);
        return callback(err || new Error('Request not found'));
      }

      console.log('🔄 Database: Found request:', request);

      if (status === 'accepted') {
        const user1Id = Math.min(request.sender_id, request.receiver_id);
        const user2Id = Math.max(request.sender_id, request.receiver_id);
        
        console.log('🔄 Database: Creating friendship between:', user1Id, 'and', user2Id);
        
        db.run(
          `INSERT OR IGNORE INTO friendships (user1_id, user2_id) VALUES (?, ?)`,
          [user1Id, user2Id],
          function(friendshipErr) {
            if (friendshipErr) {
              console.error('❌ Database: Error creating friendship:', friendshipErr);
              return callback(friendshipErr);
            }
            
            console.log('✅ Database: Friendship created, changes:', this.changes);
            
            // Delete the friend request after accepting
            db.run(`DELETE FROM friend_requests WHERE id = ?`, [requestId], function(deleteErr) {
              if (deleteErr) {
                console.error('❌ Database: Error deleting accepted request:', deleteErr);
              } else {
                console.log('✅ Database: Deleted accepted friend request, changes:', this.changes);
              }
              callback(deleteErr);
            });
          }
        );
      } else {
        // For rejected requests, just delete the request
        console.log('🔄 Database: Deleting rejected friend request');
        db.run(`DELETE FROM friend_requests WHERE id = ?`, [requestId], function(deleteErr) {
          if (deleteErr) {
            console.error('❌ Database: Error deleting rejected request:', deleteErr);
          } else {
            console.log('✅ Database: Deleted rejected friend request, changes:', this.changes);
          }
          callback(deleteErr);
        });
      }
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

// ==================== SOCIAL MEDIA FUNCTIONS ====================

// POST FUNCTIONS
const createPost = (postData, callback) => {
  const { user_id, content, image, video, post_type, privacy, shared_post_id } = postData;
  const now = new Date().toISOString();
  const query = `INSERT INTO posts (user_id, content, image, video, post_type, privacy, shared_post_id, created_at, updated_at) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(query, [user_id, content, image, video, post_type, privacy, shared_post_id, now, now], function(err) {
    if (callback) {
      callback(err, { 
        id: this.lastID, 
        user_id, 
        content, 
        image, 
        video, 
        post_type, 
        privacy,
        likes_count: 0,
        comments_count: 0,
        created_at: now
      });
    }
  });
};

const getPosts = (userId, limit = 20, callback) => {
  const query = `
    SELECT p.*, u.username, u.avatar, u.id as author_id,
           p.likes_count,
           (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_liked,
           sp.id as shared_id, sp.content as shared_content, sp.image as shared_image, 
           sp.video as shared_video, sp.post_type as shared_post_type,
           su.username as shared_username, su.avatar as shared_avatar, su.id as shared_user_id
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN posts sp ON p.shared_post_id = sp.id
    LEFT JOIN users su ON sp.user_id = su.id
    LEFT JOIN friendships f ON (
      (f.user1_id = ? AND f.user2_id = p.user_id) OR 
      (f.user2_id = ? AND f.user1_id = p.user_id)
    )
    WHERE (p.privacy = 'public' OR p.user_id = ? OR f.id IS NOT NULL)
    ORDER BY p.created_at DESC
    LIMIT ?
  `;
  db.all(query, [userId, userId, userId, userId, limit], callback);
};

const getUserPosts = (userId, viewerId, callback) => {
  const query = `
    SELECT p.*, u.username, u.avatar, u.id as author_id, u.privacy_setting,
           p.likes_count,
           (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_liked,
           sp.id as shared_id, sp.content as shared_content, sp.image as shared_image, 
           sp.video as shared_video, sp.post_type as shared_post_type,
           su.username as shared_username, su.avatar as shared_avatar, su.id as shared_user_id
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN posts sp ON p.shared_post_id = sp.id
    LEFT JOIN users su ON sp.user_id = su.id
    WHERE p.user_id = ? AND p.privacy != 'private'
    ORDER BY p.created_at DESC
  `;
  db.all(query, [viewerId, userId], callback);
};

const getPost = (postId, userId, callback) => {
  const query = `
    SELECT p.*, u.username, u.avatar, u.id as author_id,
           p.likes_count,
           (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id AND pl.user_id = ?) as user_liked,
           sp.id as shared_id, sp.content as shared_content, sp.image as shared_image, 
           sp.video as shared_video, sp.post_type as shared_post_type,
           su.username as shared_username, su.avatar as shared_avatar, su.id as shared_user_id
    FROM posts p
    JOIN users u ON p.user_id = u.id
    LEFT JOIN posts sp ON p.shared_post_id = sp.id
    LEFT JOIN users su ON sp.user_id = su.id
    WHERE p.id = ?
  `;
  db.get(query, [userId, postId], callback);
};

const deletePost = (postId, userId, callback) => {
  const query = `DELETE FROM posts WHERE id = ? AND user_id = ?`;
  db.run(query, [postId, userId], callback);
};

// LIKE FUNCTIONS
const togglePostLike = (postId, userId, callback) => {
  db.serialize(() => {
    // Check if like exists
    db.get(`SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?`, [postId, userId], (err, existingLike) => {
      if (err) return callback(err);

      const now = new Date().toISOString();
      
      if (existingLike) {
        // Remove like
        db.run(`DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`, [postId, userId], (deleteErr) => {
          if (deleteErr) return callback(deleteErr);
          
          // Decrement likes count
          db.run(`UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?`, [postId], (updateErr) => {
            callback(updateErr, { action: 'unliked', liked: false });
          });
        });
      } else {
        // Add like
        db.run(`INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)`, 
          [postId, userId, now], (insertErr) => {
          if (insertErr) return callback(insertErr);
          
          // Increment likes count
          db.run(`UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?`, [postId], (updateErr) => {
            callback(updateErr, { action: 'liked', liked: true });
          });
        });
      }
    });
  });
};

const getPostLikes = (postId, callback) => {
  const query = `
    SELECT pl.*, u.username, u.avatar 
    FROM post_likes pl
    JOIN users u ON pl.user_id = u.id
    WHERE pl.post_id = ?
    ORDER BY pl.created_at DESC
  `;
  db.all(query, [postId], callback);
};

// COMMENT FUNCTIONS
const createComment = (commentData, callback) => {
  const { post_id, user_id, comment } = commentData;
  const now = new Date().toISOString();
  
  db.serialize(() => {
    // Insert comment
    db.run(`INSERT INTO post_comments (post_id, user_id, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`, 
      [post_id, user_id, comment, now, now], function(err) {
      if (err) return callback(err);
      
      const commentId = this.lastID;
      
      // Increment comments count
      db.run(`UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?`, [post_id], (updateErr) => {
        if (updateErr) return callback(updateErr);
        
        // Get the comment with user info
        db.get(`
          SELECT pc.*, u.username, u.avatar 
          FROM post_comments pc
          JOIN users u ON pc.user_id = u.id
          WHERE pc.id = ?
        `, [commentId], callback);
      });
    });
  });
};

const getComments = (postId, callback) => {
  const query = `
    SELECT pc.*, u.username, u.avatar 
    FROM post_comments pc
    JOIN users u ON pc.user_id = u.id
    WHERE pc.post_id = ?
    ORDER BY pc.created_at ASC
  `;
  db.all(query, [postId], callback);
};

const deleteComment = (commentId, userId, callback) => {
  db.serialize(() => {
    // Get comment to find post_id
    db.get(`SELECT post_id FROM post_comments WHERE id = ? AND user_id = ?`, [commentId, userId], (err, comment) => {
      if (err || !comment) return callback(err || new Error('Comment not found'));
      
      // Delete comment
      db.run(`DELETE FROM post_comments WHERE id = ? AND user_id = ?`, [commentId, userId], (deleteErr) => {
        if (deleteErr) return callback(deleteErr);
        
        // Decrement comments count
        db.run(`UPDATE posts SET comments_count = comments_count - 1 WHERE id = ?`, [comment.post_id], callback);
      });
    });
  });
};

// GROUP FUNCTIONS
const createGroup = (groupData, callback) => {
  const { name, description, image, created_by, privacy } = groupData;
  const now = new Date().toISOString();
  
  db.serialize(() => {
    // Create group
    db.run(`INSERT INTO groups (name, description, image, created_by, privacy, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, 
      [name, description, image, created_by, privacy, now, now], function(err) {
      if (err) return callback(err);
      
      const groupId = this.lastID;
      
      // Add creator as admin
      db.run(`INSERT INTO group_members (group_id, user_id, role, joined_at) VALUES (?, ?, 'admin', ?)`,
        [groupId, created_by, now], (memberErr) => {
        callback(memberErr, { 
          id: groupId, 
          name, 
          description, 
          image, 
          created_by, 
          privacy,
          members_count: 1,
          created_at: now
        });
      });
    });
  });
};

const getUserGroups = (userId, callback) => {
  const query = `
    SELECT g.*, gm.role, gm.joined_at, u.username as creator_name
    FROM groups g
    JOIN group_members gm ON g.id = gm.group_id
    LEFT JOIN users u ON g.created_by = u.id
    WHERE gm.user_id = ?
    ORDER BY g.created_at DESC
  `;
  db.all(query, [userId], callback);
};

const getAllGroups = (userId, callback) => {
  const query = `
    SELECT g.*, 
           u.username as creator_name,
           gm.role as user_role,
           gm.joined_at,
           (SELECT COUNT(*) FROM group_members WHERE group_id = g.id) as members_count
    FROM groups g
    LEFT JOIN users u ON g.created_by = u.id
    LEFT JOIN group_members gm ON (g.id = gm.group_id AND gm.user_id = ?)
    ORDER BY g.created_at DESC
  `;
  db.all(query, [userId], callback);
};

const getGroup = (groupId, userId, callback) => {
  const query = `
    SELECT g.*, u.username as creator_name, u.avatar as creator_avatar,
           gm.role as user_role
    FROM groups g
    LEFT JOIN users u ON g.created_by = u.id
    LEFT JOIN group_members gm ON (g.id = gm.group_id AND gm.user_id = ?)
    WHERE g.id = ?
  `;
  db.get(query, [userId, groupId], callback);
};

const joinGroup = (groupId, userId, callback) => {
  const now = new Date().toISOString();
  
  db.serialize(() => {
    // Add user to group
    db.run(`INSERT OR IGNORE INTO group_members (group_id, user_id, joined_at) VALUES (?, ?, ?)`,
      [groupId, userId, now], (err) => {
      if (err) return callback(err);
      
      // Increment members count
      db.run(`UPDATE groups SET members_count = members_count + 1 WHERE id = ?`, [groupId], callback);
    });
  });
};

const leaveGroup = (groupId, userId, callback) => {
  db.serialize(() => {
    // Remove user from group
    db.run(`DELETE FROM group_members WHERE group_id = ? AND user_id = ?`, [groupId, userId], (err) => {
      if (err) return callback(err);
      
      // Decrement members count
      db.run(`UPDATE groups SET members_count = members_count - 1 WHERE id = ?`, [groupId], callback);
    });
  });
};

const getGroupMembers = (groupId, callback) => {
  const query = `
    SELECT gm.*, u.username, u.avatar, u.email
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = ?
    ORDER BY gm.joined_at ASC
  `;
  db.all(query, [groupId], callback);
};

// GROUP MESSAGES FUNCTIONS
const sendGroupMessage = (groupId, senderId, message, messageType = 'text', callback) => {
  const now = new Date().toISOString();
  const query = `INSERT INTO group_messages (group_id, sender_id, message, message_type, created_at) VALUES (?, ?, ?, ?, ?)`;
  
  db.run(query, [groupId, senderId, message, messageType, now], function(err) {
    if (callback) {
      callback(err, { 
        id: this.lastID, 
        group_id: groupId,
        sender_id: senderId, 
        message, 
        message_type: messageType,
        created_at: now
      });
    }
  });
};

const getGroupMessages = (groupId, limit = 50, callback) => {
  const query = `
    SELECT gm.*, u.username, u.avatar
    FROM group_messages gm
    JOIN users u ON gm.sender_id = u.id
    WHERE gm.group_id = ?
    ORDER BY gm.created_at DESC
    LIMIT ?
  `;
  db.all(query, [groupId, limit], (err, messages) => {
    if (callback) {
      callback(err, messages ? messages.reverse() : []);
    }
  });
};

// PROFILE FUNCTIONS
const updateUserProfile = (userId, profileData, callback) => {
  const { bio, location, website, birth_date } = profileData;
  const now = new Date().toISOString();
  const query = `UPDATE users SET bio = ?, location = ?, website = ?, birth_date = ?, updated_at = ? WHERE id = ?`;
  db.run(query, [bio, location, website, birth_date, now, userId], callback);
};

const updateUserCoverPhoto = (userId, coverPhotoPath, callback) => {
  const now = new Date().toISOString();
  const query = `UPDATE users SET cover_photo = ?, updated_at = ? WHERE id = ?`;
  db.run(query, [coverPhotoPath, now, userId], callback);
};

// ==================== STORIES FUNCTIONS ====================

const createStory = (storyData, callback) => {
  const { user_id, content, image, video, story_type, background_color, text_color } = storyData;
  
  // Stories expire after 24 hours
  const now = new Date();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);
  
  const query = `
    INSERT INTO stories (user_id, content, image, video, story_type, background_color, text_color, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [user_id, content, image, video, story_type, background_color, text_color, now.toISOString(), expiresAt.toISOString()], function(err) {
    if (err) {
      callback(err);
      return;
    }
    
    // Get the created story with user info
    getStory(this.lastID, user_id, callback);
  });
};

const getStory = (storyId, viewerId, callback) => {
  const query = `
    SELECT s.*, 
           u.username, 
           u.avatar,
           (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as view_count,
           (SELECT COUNT(*) FROM story_views WHERE story_id = s.id AND viewer_id = ?) as user_viewed
    FROM stories s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = ? AND s.expires_at > datetime('now')
  `;
  
  db.get(query, [viewerId, storyId], callback);
};

const getFriendsStories = (userId, callback) => {
  const query = `
    SELECT s.*, 
           u.username, 
           u.avatar,
           (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as view_count,
           (SELECT COUNT(*) FROM story_views WHERE story_id = s.id AND viewer_id = ?) as user_viewed
    FROM stories s
    JOIN users u ON s.user_id = u.id
    WHERE s.expires_at > datetime('now') AND (
      s.user_id = ? OR
      s.user_id IN (
        SELECT CASE 
          WHEN f.user1_id = ? THEN f.user2_id
          ELSE f.user1_id
        END
        FROM friendships f 
        WHERE f.user1_id = ? OR f.user2_id = ?
      )
    )
    ORDER BY CASE WHEN s.user_id = ? THEN 0 ELSE 1 END, s.created_at DESC
  `;
  
  db.all(query, [userId, userId, userId, userId, userId, userId], (err, stories) => {
    if (err) {
      callback(err);
      return;
    }
    
    // Group stories by user
    const groupedStories = {};
    stories.forEach(story => {
      if (!groupedStories[story.user_id]) {
        groupedStories[story.user_id] = {
          user_id: story.user_id,
          username: story.username,
          avatar: story.avatar,
          stories: [],
          has_unseen: false
        };
      }
      
      groupedStories[story.user_id].stories.push(story);
      // For own stories, always show as "viewed", for others check if user has viewed
      if (story.user_id !== userId && story.user_viewed === 0) {
        groupedStories[story.user_id].has_unseen = true;
      }
    });
    
    // Sort stories within each group by created_at DESC to ensure latest first
    Object.values(groupedStories).forEach(group => {
      group.stories.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    });
    
    callback(null, Object.values(groupedStories));
  });
};

const getUserStories = (userId, viewerId, callback) => {
  const query = `
    SELECT s.*, 
           u.username, 
           u.avatar,
           (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as view_count,
           (SELECT COUNT(*) FROM story_views WHERE story_id = s.id AND viewer_id = ?) as user_viewed
    FROM stories s
    JOIN users u ON s.user_id = u.id
    WHERE s.user_id = ? AND s.expires_at > datetime('now')
    ORDER BY s.created_at ASC
  `;
  
  db.all(query, [viewerId, userId], callback);
};

const viewStory = (storyId, viewerId, callback) => {
  // Insert or ignore (in case already viewed)
  const query = `
    INSERT OR IGNORE INTO story_views (story_id, viewer_id)
    VALUES (?, ?)
  `;
  
  db.run(query, [storyId, viewerId], callback);
};

const deleteStory = (storyId, userId, callback) => {
  const query = `DELETE FROM stories WHERE id = ? AND user_id = ?`;
  db.run(query, [storyId, userId], callback);
};

const getStoryViews = (storyId, ownerId, callback) => {
  // Only allow story owner to see views
  const query = `
    SELECT sv.viewed_at, u.username, u.avatar
    FROM story_views sv
    JOIN users u ON sv.viewer_id = u.id
    JOIN stories s ON sv.story_id = s.id
    WHERE sv.story_id = ? AND s.user_id = ?
    ORDER BY sv.viewed_at DESC
  `;
  
  db.all(query, [storyId, ownerId], callback);
};

// Clean up expired stories (call this periodically)
const cleanupExpiredStories = (callback) => {
  const query = `DELETE FROM stories WHERE expires_at <= datetime('now')`;
  db.run(query, callback);
};

// ==================== GROUP POSTS FUNCTIONS ====================

const createGroupPost = (postData, callback) => {
  const { group_id, user_id, content, image, video, post_type } = postData;
  const now = new Date().toISOString();
  
  const query = `
    INSERT INTO group_posts (group_id, user_id, content, image, video, post_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [group_id, user_id, content, image, video, post_type, now, now], function(err) {
    if (err) {
      callback(err);
      return;
    }
    
    // Get the created post with user info
    getGroupPost(this.lastID, user_id, callback);
  });
};

const getGroupPost = (postId, viewerId, callback) => {
  const query = `
    SELECT gp.*, 
           u.username, 
           u.avatar,
           (SELECT COUNT(*) FROM group_post_likes WHERE post_id = gp.id) as likes_count,
           (SELECT COUNT(*) FROM group_post_likes WHERE post_id = gp.id AND user_id = ?) as user_liked,
           (SELECT COUNT(*) FROM group_post_comments WHERE post_id = gp.id) as comments_count
    FROM group_posts gp
    JOIN users u ON gp.user_id = u.id
    WHERE gp.id = ?
  `;
  
  db.get(query, [viewerId, postId], callback);
};

const getGroupPosts = (groupId, userId, callback) => {
  const query = `
    SELECT gp.*, 
           u.username, 
           u.avatar,
           (SELECT COUNT(*) FROM group_post_likes WHERE post_id = gp.id) as likes_count,
           (SELECT COUNT(*) FROM group_post_likes WHERE post_id = gp.id AND user_id = ?) as user_liked,
           (SELECT COUNT(*) FROM group_post_comments WHERE post_id = gp.id) as comments_count
    FROM group_posts gp
    JOIN users u ON gp.user_id = u.id
    WHERE gp.group_id = ?
    ORDER BY gp.created_at DESC
    LIMIT 50
  `;
  
  db.all(query, [userId, groupId], callback);
};

const deleteGroupPost = (postId, userId, callback) => {
  // First check if user owns the post or is group admin
  const checkQuery = `
    SELECT gp.user_id, gm.role
    FROM group_posts gp
    JOIN group_members gm ON gp.group_id = gm.group_id AND gm.user_id = ?
    WHERE gp.id = ?
  `;
  
  db.get(checkQuery, [userId, postId], (err, result) => {
    if (err) {
      callback(err);
      return;
    }
    
    if (!result) {
      callback(new Error('Post not found or access denied'));
      return;
    }
    
    // Allow deletion if user owns the post or is admin/moderator
    if (result.user_id === userId || result.role === 'admin' || result.role === 'moderator') {
      const deleteQuery = `DELETE FROM group_posts WHERE id = ?`;
      db.run(deleteQuery, [postId], callback);
    } else {
      callback(new Error('Permission denied'));
    }
  });
};

// ==================== GROUP POST LIKES FUNCTIONS ====================

const toggleGroupPostLike = (postId, userId, callback) => {
  db.serialize(() => {
    // Check if like exists
    db.get(`SELECT id FROM group_post_likes WHERE post_id = ? AND user_id = ?`, [postId, userId], (err, existingLike) => {
      if (err) return callback(err);

      const now = new Date().toISOString();
      
      if (existingLike) {
        // Remove like
        db.run(`DELETE FROM group_post_likes WHERE post_id = ? AND user_id = ?`, [postId, userId], (deleteErr) => {
          if (deleteErr) return callback(deleteErr);
          
          // Decrement likes count
          db.run(`UPDATE group_posts SET likes_count = likes_count - 1 WHERE id = ?`, [postId], (updateErr) => {
            callback(updateErr, { action: 'unliked', liked: false });
          });
        });
      } else {
        // Add like
        db.run(`INSERT INTO group_post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)`, 
          [postId, userId, now], (insertErr) => {
          if (insertErr) return callback(insertErr);
          
          // Increment likes count
          db.run(`UPDATE group_posts SET likes_count = likes_count + 1 WHERE id = ?`, [postId], (updateErr) => {
            callback(updateErr, { action: 'liked', liked: true });
          });
        });
      }
    });
  });
};

// ==================== GROUP POST COMMENTS FUNCTIONS ====================

const createGroupPostComment = (commentData, callback) => {
  const { post_id, user_id, content } = commentData;
  const now = new Date().toISOString();

  db.serialize(() => {
    db.run(
      `INSERT INTO group_post_comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)`,
      [post_id, user_id, content, now],
      function(err) {
        if (err) return callback(err);
        
        const commentId = this.lastID;
        
        // Increment comments count
        db.run(`UPDATE group_posts SET comments_count = comments_count + 1 WHERE id = ?`, [post_id], (updateErr) => {
          if (updateErr) return callback(updateErr);
          
          // Get the created comment with user info
          db.get(`
            SELECT c.*, u.username, u.avatar 
            FROM group_post_comments c
            JOIN users u ON c.user_id = u.id 
            WHERE c.id = ?
          `, [commentId], (selectErr, comment) => {
            callback(selectErr, comment);
          });
        });
      }
    );
  });
};

const getGroupPostComments = (postId, callback) => {
  const query = `
    SELECT c.*, u.username, u.avatar
    FROM group_post_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `;
  db.all(query, [postId], callback);
};

const deleteGroupPostComment = (commentId, userId, callback) => {
  db.serialize(() => {
    // First get comment info to check ownership and get post_id
    db.get(`SELECT user_id, post_id FROM group_post_comments WHERE id = ?`, [commentId], (err, comment) => {
      if (err) return callback(err);
      if (!comment) return callback(new Error('Comment not found'));
      
      // Check if user owns the comment
      if (comment.user_id !== userId) {
        return callback(new Error('Permission denied'));
      }
      
      // Delete comment
      db.run(`DELETE FROM group_post_comments WHERE id = ?`, [commentId], (deleteErr) => {
        if (deleteErr) return callback(deleteErr);
        
        // Decrement comments count
        db.run(`UPDATE group_posts SET comments_count = comments_count - 1 WHERE id = ?`, [comment.post_id], callback);
      });
    });
  });
};

// ==================== CALL HISTORY FUNCTIONS ====================

const createCallHistory = (callData, callback) => {
  const { caller_id, receiver_id, call_type, direction, status, duration, started_at, ended_at } = callData;
  const now = new Date().toISOString();
  
  function proceedWithCallHistory() {
      // Only check for duplicates of missed calls (to prevent spam missed calls)
      // Allow multiple calls with different statuses (missed, completed, rejected)
      if (status === 'missed') {
        const recentMissedCallCheck = `
          SELECT id FROM call_history 
          WHERE caller_id = ? AND receiver_id = ? AND call_type = ? AND status = 'missed'
          AND datetime(created_at) > datetime('now', '-10 seconds')
          LIMIT 1
        `;
        
        db.get(recentMissedCallCheck, [caller_id, receiver_id, call_type], (err, existingCall) => {
          if (err) {
            console.error('Error checking for duplicate missed calls:', err);
            return callback(err);
          }
          
          if (existingCall) {
            console.log('📞 Duplicate missed call detected, skipping...');
            return callback(null, { id: existingCall.id, duplicate: true });
          }
          
          // No duplicate missed call found, create the call
          insertCallHistory();
        });
      } else {
        // For completed/rejected calls, always create the record
        insertCallHistory();
      }
    }
    
    function insertCallHistory() {
      const query = `
        INSERT INTO call_history (caller_id, receiver_id, call_type, direction, status, duration, started_at, ended_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(query, [caller_id, receiver_id, call_type, direction, status, duration, started_at, ended_at, now], function(err) {
        if (callback) {
          callback(err, {
            id: this.lastID,
            caller_id,
            receiver_id,
            call_type,
            direction,
            status,
            duration,
            started_at,
            ended_at,
            created_at: now
          });
        }
      });
    }
  
  // Ensure call_history table exists before proceeding
  db.run(`CREATE TABLE IF NOT EXISTS call_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    call_type TEXT NOT NULL CHECK(call_type IN ('audio', 'video')),
    direction TEXT NOT NULL CHECK(direction IN ('incoming', 'outgoing')),
    status TEXT NOT NULL CHECK(status IN ('completed', 'missed', 'rejected')),
    duration INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (tableErr) => {
    if (tableErr) {
      console.error('Error ensuring call_history table exists:', tableErr);
      return callback(tableErr);
    }
    
    // Table exists, now proceed with the function
    proceedWithCallHistory();
  });
};

const getUserCallHistory = (userId, limit = 100, callback) => {
  // Ensure call_history table exists before querying
  db.run(`CREATE TABLE IF NOT EXISTS call_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    caller_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    call_type TEXT NOT NULL CHECK(call_type IN ('audio', 'video')),
    direction TEXT NOT NULL CHECK(direction IN ('incoming', 'outgoing')),
    status TEXT NOT NULL CHECK(status IN ('completed', 'missed', 'rejected')),
    duration INTEGER DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (caller_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
  )`, (tableErr) => {
    if (tableErr) {
      console.error('Error ensuring call_history table exists:', tableErr);
      return callback(tableErr);
    }
    
    const query = `
      SELECT ch.*,
             c.username as caller_username, c.avatar as caller_avatar,
             r.username as receiver_username, r.avatar as receiver_avatar
      FROM call_history ch
      JOIN users c ON ch.caller_id = c.id
      JOIN users r ON ch.receiver_id = r.id
      WHERE ch.caller_id = ? OR ch.receiver_id = ?
      ORDER BY ch.created_at DESC
      LIMIT ?
    `;
    
    db.all(query, [userId, userId, limit], (err, calls) => {
      if (callback) {
        // Transform the data to match frontend expectations
        const transformedCalls = calls ? calls.map(call => ({
          timestamp: new Date(call.created_at).getTime(),
          duration: call.duration,
          callType: call.call_type,
          direction: call.caller_id === userId ? 'outgoing' : 'incoming',
          status: call.status,
          callerId: call.caller_id,
          callerUsername: call.caller_username,
          receiverId: call.receiver_id,
          receiverUsername: call.receiver_username,
          startedAt: call.started_at,
          endedAt: call.ended_at
        })) : [];
        
        callback(err, transformedCalls);
      }
    });
  });
};

const deleteCallHistory = (callId, userId, callback) => {
  // Only allow deletion if user was part of the call
  const query = `DELETE FROM call_history WHERE id = ? AND (caller_id = ? OR receiver_id = ?)`;
  db.run(query, [callId, userId, userId], callback);
};

const clearUserCallHistory = (userId, callback) => {
  const query = `DELETE FROM call_history WHERE caller_id = ? OR receiver_id = ?`;
  db.run(query, [userId, userId], callback);
};

const cleanupDuplicateCallHistory = (callback) => {
  // Only remove duplicate missed calls that are within the same minute
  // Keep completed and rejected calls as they represent different attempts
  const query = `
    DELETE FROM call_history 
    WHERE status = 'missed' AND id NOT IN (
      SELECT MIN(id) 
      FROM call_history 
      WHERE status = 'missed'
      GROUP BY caller_id, receiver_id, call_type, datetime(created_at, 'start of minute')
    )
  `;
  
  db.run(query, (err) => {
    if (err) {
      console.error('Error cleaning up duplicate missed calls:', err);
    } else {
      console.log('✅ Cleaned up duplicate missed call entries');
    }
    if (callback) callback(err);
  });
};

// ==================== CONTENT MANAGEMENT FUNCTIONS ====================

// Content Sections
const createContentSection = (sectionData, callback) => {
  const { type, title, content, button_text, button_link, image_url, background_color, text_color, enabled, section_order } = sectionData;
  const now = new Date().toISOString();
  
  const query = `
    INSERT INTO content_sections (type, title, content, button_text, button_link, image_url, background_color, text_color, enabled, section_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [type, title, content, button_text, button_link, image_url, background_color, text_color, enabled, section_order, now, now], function(err) {
    callback(err, { id: this.lastID, ...sectionData, created_at: now, updated_at: now });
  });
};

const getContentSections = (callback) => {
  const query = `SELECT * FROM content_sections ORDER BY section_order ASC, id ASC`;
  db.all(query, [], callback);
};

const updateContentSection = (sectionId, updates, callback) => {
  const now = new Date().toISOString();
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE content_sections SET ${setClause}, updated_at = ? WHERE id = ?`;
  
  db.run(query, [...values, now, sectionId], callback);
};

const deleteContentSection = (sectionId, callback) => {
  const query = `DELETE FROM content_sections WHERE id = ?`;
  db.run(query, [sectionId], callback);
};

// Content Features
const createContentFeature = (featureData, callback) => {
  const { section_id, icon, title, description, feature_order } = featureData;
  const now = new Date().toISOString();
  
  const query = `
    INSERT INTO content_features (section_id, icon, title, description, feature_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [section_id, icon, title, description, feature_order || 0, now], function(err) {
    callback(err, { id: this.lastID, ...featureData, created_at: now });
  });
};

const getContentFeatures = (sectionId, callback) => {
  const query = `SELECT * FROM content_features WHERE section_id = ? ORDER BY feature_order ASC, id ASC`;
  db.all(query, [sectionId], callback);
};

const updateContentFeature = (featureId, updates, callback) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE content_features SET ${setClause} WHERE id = ?`;
  
  db.run(query, [...values, featureId], callback);
};

const deleteContentFeature = (featureId, callback) => {
  const query = `DELETE FROM content_features WHERE id = ?`;
  db.run(query, [featureId], callback);
};

// Content Testimonials
const createContentTestimonial = (testimonialData, callback) => {
  const { section_id, name, role, content, avatar_url, company, rating, testimonial_order } = testimonialData;
  const now = new Date().toISOString();
  
  const query = `
    INSERT INTO content_testimonials (section_id, name, role, content, avatar_url, company, rating, testimonial_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [section_id, name, role, content, avatar_url, company, rating || 5, testimonial_order || 0, now], function(err) {
    callback(err, { id: this.lastID, ...testimonialData, created_at: now });
  });
};

const getContentTestimonials = (sectionId, callback) => {
  const query = `SELECT * FROM content_testimonials WHERE section_id = ? ORDER BY testimonial_order ASC, id ASC`;
  db.all(query, [sectionId], callback);
};

const updateContentTestimonial = (testimonialId, updates, callback) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE content_testimonials SET ${setClause} WHERE id = ?`;
  
  db.run(query, [...values, testimonialId], callback);
};

const deleteContentTestimonial = (testimonialId, callback) => {
  const query = `DELETE FROM content_testimonials WHERE id = ?`;
  db.run(query, [testimonialId], callback);
};

// Content Stats
const createContentStat = (statData, callback) => {
  const { section_id, label, value, icon, stat_order } = statData;
  const now = new Date().toISOString();
  
  const query = `
    INSERT INTO content_stats (section_id, label, value, icon, stat_order, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [section_id, label, value, icon, stat_order || 0, now], function(err) {
    callback(err, { id: this.lastID, ...statData, created_at: now });
  });
};

const getContentStats = (sectionId, callback) => {
  const query = `SELECT * FROM content_stats WHERE section_id = ? ORDER BY stat_order ASC, id ASC`;
  db.all(query, [sectionId], callback);
};

const updateContentStat = (statId, updates, callback) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE content_stats SET ${setClause} WHERE id = ?`;
  
  db.run(query, [...values, statId], callback);
};

const deleteContentStat = (statId, callback) => {
  const query = `DELETE FROM content_stats WHERE id = ?`;
  db.run(query, [statId], callback);
};

// App Settings
const getAppSettings = (category = null, callback) => {
  let query = `SELECT * FROM app_settings`;
  let params = [];
  
  if (category) {
    query += ` WHERE category = ?`;
    params.push(category);
  }
  
  query += ` ORDER BY category ASC, key ASC`;
  db.all(query, params, callback);
};

const updateAppSetting = (key, value, description = null, category = 'general', callback) => {
  const now = new Date().toISOString();
  
  const query = `
    INSERT OR REPLACE INTO app_settings (key, value, description, category, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.run(query, [key, value, description, category, now], callback);
};

// Seed Default Content
const seedDefaultContent = (callback) => {
  db.serialize(() => {
    db.get('SELECT COUNT(*) as count FROM content_sections', (err, result) => {
      if (err || result.count > 0) {
        if (callback) callback(err);
        return;
      }
      
      console.log('🌱 Seeding default content...');
      
      // Hero Section
      createContentSection({
        type: 'hero',
        title: 'Share, Call & Connect All in One Place',
        content: 'Make HD voice and video calls, chat in real-time, share posts with photos and videos, track your call history, and build meaningful connections. Everything you need for authentic social interactions in one beautifully designed platform.',
        button_text: 'Join SocialHub Free',
        button_link: '/signup',
        enabled: true,
        section_order: 1
      }, () => {});
      
      // Features Section
      createContentSection({
        type: 'features',
        title: 'Complete Communication Suite',
        content: 'Voice calls, video calls, messaging, social posts, and detailed call tracking - all in one platform',
        enabled: true,
        section_order: 2
      }, (err, section) => {
        if (!err && section) {
          const features = [
            { icon: '📞', title: 'HD Voice & Video Calls', description: 'Make crystal-clear audio and video calls to any friend instantly with one-click calling from chat or contacts.' },
            { icon: '⏰', title: 'Call History & Analytics', description: 'Track all your calls with detailed history, duration tracking, and call analytics. Never miss important call details.' },
            { icon: '💬', title: 'Real-time Messaging', description: 'Chat instantly with friends and family with our lightning-fast messaging system and rich media sharing.' },
            { icon: '📸', title: 'Share Your Moments', description: 'Post photos, videos, and updates to keep your network engaged with likes, comments, and reactions.' },
            { icon: '👥', title: 'Groups & Communities', description: 'Create and join groups, share in group chats, and build communities around your interests and hobbies.' },
            { icon: '📖', title: 'Stories & Updates', description: 'Share temporary stories that disappear after 24 hours. Express yourself with photos, videos, and quick moments.' }
          ];
          
          features.forEach((feature, index) => {
            createContentFeature({
              section_id: section.id,
              icon: feature.icon,
              title: feature.title,
              description: feature.description,
              feature_order: index + 1
            }, () => {});
          });
        }
      });
      
      // Stats Section
      createContentSection({
        type: 'stats',
        title: 'Trusted by Users Worldwide',
        content: 'Join thousands of satisfied users who choose SocialHub for their communication needs',
        enabled: true,
        section_order: 3
      }, (err, section) => {
        if (!err && section) {
          const stats = [
            { label: 'Active Users', value: '25K+', icon: '👥' },
            { label: 'Calls Made', value: '1M+', icon: '📞' },
            { label: 'Call Quality', value: '99.9%', icon: '⭐' }
          ];
          
          stats.forEach((stat, index) => {
            createContentStat({
              section_id: section.id,
              label: stat.label,
              value: stat.value,
              icon: stat.icon,
              stat_order: index + 1
            }, () => {});
          });
        }
      });
      
      // How It Works Section
      createContentSection({
        type: 'how_it_works',
        title: 'How SocialHub Works',
        content: 'Get started in three simple steps',
        enabled: true,
        section_order: 4
      }, () => {});
      
      // Testimonials Section
      createContentSection({
        type: 'testimonials',
        title: 'What Our Users Say',
        content: 'Join thousands of satisfied users worldwide',
        enabled: true,
        section_order: 5
      }, (err, section) => {
        if (!err && section) {
          const testimonials = [
            { name: 'Sarah Johnson', role: 'Product Manager', content: 'SocialHub has completely transformed how I connect with my friends. The HD voice calls, messaging, and call history tracking make it easy to stay in touch with everyone.', rating: 5 },
            { name: 'Michael Chen', role: 'Designer', content: 'I love the video calling feature and creating posts with photos! The call history helps me track important conversations. The groups feature keeps me connected with my hobbies.', rating: 5 },
            { name: 'Emily Rodriguez', role: 'Marketing Director', content: 'The stories feature and one-click calling are amazing! My call history shows all my important conversations. Love how everything is integrated in one beautiful interface!', rating: 5 }
          ];
          
          testimonials.forEach((testimonial, index) => {
            createContentTestimonial({
              section_id: section.id,
              name: testimonial.name,
              role: testimonial.role,
              content: testimonial.content,
              rating: testimonial.rating,
              testimonial_order: index + 1
            }, () => {});
          });
        }
      });
      
      // Security Section
      createContentSection({
        type: 'security',
        title: 'Your Privacy & Security Matter',
        content: 'At SocialHub, we prioritize your privacy and security above all else. Our platform uses industry-leading encryption and security measures to protect your calls, conversations, and personal data.',
        enabled: true,
        section_order: 6
      }, () => {});
      
      // CTA Section
      createContentSection({
        type: 'cta',
        title: 'Ready to join the conversation?',
        content: 'Create your account today and start connecting with friends instantly.',
        button_text: 'Get Started Now',
        button_link: '/signup',
        enabled: true,
        section_order: 7
      }, () => {});
      
      // Seed app settings
      updateAppSetting('site_title', 'SocialHub', 'The title of the application', 'general', () => {});
      updateAppSetting('site_description', 'Share, Call & Connect All in One Place', 'Site description for SEO', 'general', () => {});
      updateAppSetting('brand_color', '#4F46E5', 'Primary brand color', 'appearance', () => {});
      updateAppSetting('footer_text', '© 2024 SocialHub. All rights reserved. Made with ❤️ for meaningful connections.', 'Footer copyright text', 'general', () => {});
      
      console.log('✅ Default content seeded successfully');
      if (callback) callback(null);
    });
  });
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
  markAllNotificationsAsRead,
  
  // Social Media Functions
  createPost,
  getPosts,
  getUserPosts,
  getPost,
  deletePost,
  togglePostLike,
  getPostLikes,
  createComment,
  getComments,
  deleteComment,
  createGroup,
  getUserGroups,
  getAllGroups,
  getGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  sendGroupMessage,
  getGroupMessages,
  updateUserProfile,
  updateUserCoverPhoto,
  
  // Stories Functions
  createStory,
  getStory,
  getFriendsStories,
  getUserStories,
  viewStory,
  deleteStory,
  getStoryViews,
  cleanupExpiredStories,
  
  // Group Posts Functions
  createGroupPost,
  getGroupPost,
  getGroupPosts,
  deleteGroupPost,
  toggleGroupPostLike,
  createGroupPostComment,
  getGroupPostComments,
  deleteGroupPostComment,
  
  // Call History Functions
  createCallHistory,
  getUserCallHistory,
  deleteCallHistory,
  clearUserCallHistory,
  cleanupDuplicateCallHistory,
  
  // Content Management Functions
  createContentSection,
  getContentSections,
  updateContentSection,
  deleteContentSection,
  createContentFeature,
  getContentFeatures,
  updateContentFeature,
  deleteContentFeature,
  createContentTestimonial,
  getContentTestimonials,
  updateContentTestimonial,
  deleteContentTestimonial,
  createContentStat,
  getContentStats,
  updateContentStat,
  deleteContentStat,
  getAppSettings,
  updateAppSetting,
  seedDefaultContent
};