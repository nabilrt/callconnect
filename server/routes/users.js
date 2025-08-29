const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { db, getAllUsers, getUserFriends, getUserCallHistory, getUserPosts } = require('../database/db');

// All user management routes require authentication
router.use((req, res, next) => {
  console.log('👥 Users route accessed:', req.path);
  
  // Disable caching for all user management endpoints
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  authenticateToken(req, res, next);
});

// Get all users for admin panel
router.get('/', (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.avatar,
      u.status,
      u.created_at,
      u.updated_at,
      COUNT(DISTINCT p.id) as posts_count,
      COUNT(DISTINCT f1.user2_id) + COUNT(DISTINCT f2.user1_id) as friends_count,
      COUNT(DISTINCT ch.id) as calls_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN friendships f1 ON u.id = f1.user1_id
    LEFT JOIN friendships f2 ON u.id = f2.user2_id
    LEFT JOIN call_history ch ON (u.id = ch.caller_id OR u.id = ch.receiver_id)
    GROUP BY u.id, u.username, u.email, u.avatar, u.status, u.created_at, u.updated_at
    ORDER BY u.created_at DESC
  `;
  
  db.all(query, [], (err, users) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    
    // Format user data for admin panel
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.username, // You might want to add a real name field to the database
      avatar: user.avatar,
      status: user.status || 'active',
      joinDate: user.created_at,
      lastActive: user.updated_at,
      postsCount: user.posts_count || 0,
      friendsCount: user.friends_count || 0,
      callsCount: user.calls_count || 0,
      role: user.id === 1 ? 'admin' : 'user', // Assuming user ID 1 is admin
      location: 'N/A',
      phone: 'N/A',
      subscription: user.id === 1 ? 'System Admin' : 'Free',
      storageUsed: '0GB',
      loginAttempts: 0,
      tags: user.id === 1 ? ['System', 'Super Admin', 'Protected'] : ['User'],
      notes: user.id === 1 ? 'Primary system administrator account - PROTECTED' : '',
      registrationIP: '127.0.0.1',
      lastLoginIP: '127.0.0.1',
      emailVerified: true,
      twoFactorEnabled: false,
      isProtected: user.id === 1
    }));
    
    res.json(formattedUsers);
  });
});

// Get user details by ID
router.get('/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  const query = `
    SELECT 
      u.*,
      COUNT(DISTINCT p.id) as posts_count,
      COUNT(DISTINCT f1.user2_id) + COUNT(DISTINCT f2.user1_id) as friends_count,
      COUNT(DISTINCT ch.id) as calls_count
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LEFT JOIN friendships f1 ON u.id = f1.user1_id
    LEFT JOIN friendships f2 ON u.id = f2.user2_id
    LEFT JOIN call_history ch ON (u.id = ch.caller_id OR u.id = ch.receiver_id)
    WHERE u.id = ?
    GROUP BY u.id
  `;
  
  db.get(query, [userId], (err, user) => {
    if (err) {
      console.error('Error fetching user:', err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Format user data
    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.username,
      avatar: user.avatar,
      status: user.status || 'active',
      joinDate: user.created_at,
      lastActive: user.updated_at,
      postsCount: user.posts_count || 0,
      friendsCount: user.friends_count || 0,
      callsCount: user.calls_count || 0,
      role: user.id === 1 ? 'admin' : 'user',
      location: user.location || 'N/A',
      phone: 'N/A',
      subscription: user.id === 1 ? 'System Admin' : 'Free',
      storageUsed: '0GB',
      loginAttempts: 0,
      tags: user.id === 1 ? ['System', 'Super Admin', 'Protected'] : ['User'],
      notes: user.id === 1 ? 'Primary system administrator account - PROTECTED' : '',
      registrationIP: '127.0.0.1',
      lastLoginIP: '127.0.0.1',
      emailVerified: true,
      twoFactorEnabled: false,
      isProtected: user.id === 1,
      bio: user.bio,
      website: user.website,
      cover_photo: user.cover_photo,
      birth_date: user.birth_date,
      privacy_setting: user.privacy_setting
    };
    
    res.json(formattedUser);
  });
});

// Update user status
router.patch('/:userId/status', (req, res) => {
  const userId = parseInt(req.params.userId);
  const { status } = req.body;
  
  // Don't allow status changes for admin user
  if (userId === 1) {
    return res.status(403).json({ error: 'Cannot modify admin user status' });
  }
  
  const validStatuses = ['active', 'inactive', 'banned'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  const query = `UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  db.run(query, [status, userId], function(err) {
    if (err) {
      console.error('Error updating user status:', err);
      return res.status(500).json({ error: 'Failed to update user status' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User status updated' });
  });
});

// Delete user (soft delete by setting status to 'deleted')
router.delete('/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  
  // Don't allow deletion of admin user
  if (userId === 1) {
    return res.status(403).json({ error: 'Cannot delete admin user' });
  }
  
  const query = `UPDATE users SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
  
  db.run(query, [userId], function(err) {
    if (err) {
      console.error('Error deleting user:', err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  });
});

// Bulk operations
router.post('/bulk', (req, res) => {
  const { action, userIds } = req.body;
  
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({ error: 'Invalid user IDs' });
  }
  
  // Filter out admin user (ID 1)
  const filteredUserIds = userIds.filter(id => id !== 1);
  
  if (filteredUserIds.length === 0) {
    return res.status(403).json({ error: 'Cannot perform bulk operations on protected accounts' });
  }
  
  let query;
  let params;
  
  switch (action) {
    case 'activate':
      query = `UPDATE users SET status = 'active', updated_at = CURRENT_TIMESTAMP WHERE id IN (${filteredUserIds.map(() => '?').join(',')})`;
      params = filteredUserIds;
      break;
    case 'deactivate':
      query = `UPDATE users SET status = 'inactive', updated_at = CURRENT_TIMESTAMP WHERE id IN (${filteredUserIds.map(() => '?').join(',')})`;
      params = filteredUserIds;
      break;
    case 'delete':
      query = `UPDATE users SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id IN (${filteredUserIds.map(() => '?').join(',')})`;
      params = filteredUserIds;
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
  
  db.run(query, params, function(err) {
    if (err) {
      console.error('Error performing bulk operation:', err);
      return res.status(500).json({ error: 'Failed to perform bulk operation' });
    }
    
    res.json({ 
      success: true, 
      message: `Bulk ${action} completed for ${this.changes} users`,
      affected: this.changes
    });
  });
});

module.exports = router;