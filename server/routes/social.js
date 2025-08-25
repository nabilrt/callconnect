const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
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
  getGroup,
  joinGroup,
  leaveGroup,
  getGroupMembers,
  sendGroupMessage,
  getGroupMessages,
  updateUserProfile,
  updateUserCoverPhoto,
  getUser
} = require('../database/db');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/posts';
    if (req.baseUrl.includes('groups')) {
      uploadPath = 'uploads/groups';
    } else if (req.baseUrl.includes('profile')) {
      uploadPath = 'uploads/profiles';
    }
    cb(null, path.join(__dirname, '..', uploadPath));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'image') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for image field'), false);
    }
  } else if (file.fieldname === 'video') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for video field'), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// ==================== POST ROUTES ====================

// Create a new post
router.post('/posts', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), (req, res) => {
  const { content, privacy = 'friends' } = req.body;
  const user_id = req.user.userId;

  let post_type = 'text';
  let image = null;
  let video = null;

  if (req.files?.image) {
    post_type = 'image';
    image = `posts/${req.files.image[0].filename}`;
  } else if (req.files?.video) {
    post_type = 'video';
    video = `posts/${req.files.video[0].filename}`;
  }

  if (!content && !image && !video) {
    return res.status(400).json({ error: 'Post content, image, or video is required' });
  }

  createPost({
    user_id,
    content: content || '',
    image,
    video,
    post_type,
    privacy
  }, (err, post) => {
    if (err) {
      console.error('Error creating post:', err);
      return res.status(500).json({ error: 'Failed to create post' });
    }

    // Emit to all connected users
    req.io.emit('new_post', {
      ...post,
      username: req.user.username,
      avatar: req.user.avatar,
      author_id: user_id,
      user_liked: 0
    });

    res.status(201).json(post);
  });
});

// Get news feed posts
router.get('/posts', (req, res) => {
  const userId = req.user.userId;
  const limit = parseInt(req.query.limit) || 20;

  getPosts(userId, limit, (err, posts) => {
    if (err) {
      console.error('Error fetching posts:', err);
      return res.status(500).json({ error: 'Failed to fetch posts' });
    }
    res.json(posts);
  });
});

// Get user's posts
router.get('/posts/user/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);
  const viewerId = req.user.userId;

  getUserPosts(userId, viewerId, (err, posts) => {
    if (err) {
      console.error('Error fetching user posts:', err);
      return res.status(500).json({ error: 'Failed to fetch user posts' });
    }
    res.json(posts);
  });
});

// Get single post
router.get('/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const userId = req.user.userId;

  getPost(postId, userId, (err, post) => {
    if (err) {
      console.error('Error fetching post:', err);
      return res.status(500).json({ error: 'Failed to fetch post' });
    }
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  });
});

// Delete post
router.delete('/posts/:postId', (req, res) => {
  const postId = parseInt(req.params.postId);
  const userId = req.user.userId;

  deletePost(postId, userId, (err) => {
    if (err) {
      console.error('Error deleting post:', err);
      return res.status(500).json({ error: 'Failed to delete post' });
    }

    // Emit to all connected users
    req.io.emit('post_deleted', { postId });

    res.json({ message: 'Post deleted successfully' });
  });
});

// Toggle post like
router.post('/posts/:postId/like', (req, res) => {
  const postId = parseInt(req.params.postId);
  const userId = req.user.userId;

  togglePostLike(postId, userId, (err, result) => {
    if (err) {
      console.error('Error toggling like:', err);
      return res.status(500).json({ error: 'Failed to toggle like' });
    }

    // Emit to all connected users
    req.io.emit('post_like_toggle', {
      postId,
      userId,
      action: result.action,
      liked: result.liked
    });

    res.json(result);
  });
});

// Get post likes
router.get('/posts/:postId/likes', (req, res) => {
  const postId = parseInt(req.params.postId);

  getPostLikes(postId, (err, likes) => {
    if (err) {
      console.error('Error fetching post likes:', err);
      return res.status(500).json({ error: 'Failed to fetch likes' });
    }
    res.json(likes);
  });
});

// ==================== COMMENT ROUTES ====================

// Add comment to post
router.post('/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId);
  const userId = req.user.userId;
  const { comment } = req.body;

  if (!comment || !comment.trim()) {
    return res.status(400).json({ error: 'Comment content is required' });
  }

  createComment({
    post_id: postId,
    user_id: userId,
    comment: comment.trim()
  }, (err, newComment) => {
    if (err) {
      console.error('Error creating comment:', err);
      return res.status(500).json({ error: 'Failed to create comment' });
    }

    // Emit to all connected users
    req.io.emit('new_comment', {
      ...newComment,
      postId
    });

    res.status(201).json(newComment);
  });
});

// Get post comments
router.get('/posts/:postId/comments', (req, res) => {
  const postId = parseInt(req.params.postId);

  getComments(postId, (err, comments) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
    res.json(comments);
  });
});

// Delete comment
router.delete('/comments/:commentId', (req, res) => {
  const commentId = parseInt(req.params.commentId);
  const userId = req.user.userId;

  deleteComment(commentId, userId, (err) => {
    if (err) {
      console.error('Error deleting comment:', err);
      return res.status(500).json({ error: 'Failed to delete comment' });
    }

    // Emit to all connected users
    req.io.emit('comment_deleted', { commentId });

    res.json({ message: 'Comment deleted successfully' });
  });
});

// ==================== GROUP ROUTES ====================

// Create a new group
router.post('/groups', upload.single('image'), (req, res) => {
  const { name, description, privacy = 'public' } = req.body;
  const created_by = req.user.userId;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Group name is required' });
  }

  let image = null;
  if (req.file) {
    image = `groups/${req.file.filename}`;
  }

  createGroup({
    name: name.trim(),
    description: description?.trim(),
    image,
    created_by,
    privacy
  }, (err, group) => {
    if (err) {
      console.error('Error creating group:', err);
      return res.status(500).json({ error: 'Failed to create group' });
    }
    res.status(201).json(group);
  });
});

// Get user's groups
router.get('/groups', (req, res) => {
  const userId = req.user.userId;

  getUserGroups(userId, (err, groups) => {
    if (err) {
      console.error('Error fetching groups:', err);
      return res.status(500).json({ error: 'Failed to fetch groups' });
    }
    res.json(groups);
  });
});

// Get single group
router.get('/groups/:groupId', (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const userId = req.user.userId;

  getGroup(groupId, userId, (err, group) => {
    if (err) {
      console.error('Error fetching group:', err);
      return res.status(500).json({ error: 'Failed to fetch group' });
    }
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    res.json(group);
  });
});

// Join group
router.post('/groups/:groupId/join', (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const userId = req.user.userId;

  joinGroup(groupId, userId, (err) => {
    if (err) {
      console.error('Error joining group:', err);
      return res.status(500).json({ error: 'Failed to join group' });
    }

    // Emit to group members
    req.io.to(`group_${groupId}`).emit('user_joined_group', {
      groupId,
      userId,
      username: req.user.username
    });

    res.json({ message: 'Successfully joined group' });
  });
});

// Leave group
router.post('/groups/:groupId/leave', (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const userId = req.user.userId;

  leaveGroup(groupId, userId, (err) => {
    if (err) {
      console.error('Error leaving group:', err);
      return res.status(500).json({ error: 'Failed to leave group' });
    }

    // Emit to group members
    req.io.to(`group_${groupId}`).emit('user_left_group', {
      groupId,
      userId,
      username: req.user.username
    });

    res.json({ message: 'Successfully left group' });
  });
});

// Get group members
router.get('/groups/:groupId/members', (req, res) => {
  const groupId = parseInt(req.params.groupId);

  getGroupMembers(groupId, (err, members) => {
    if (err) {
      console.error('Error fetching group members:', err);
      return res.status(500).json({ error: 'Failed to fetch group members' });
    }
    res.json(members);
  });
});

// Get group messages
router.get('/groups/:groupId/messages', (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const limit = parseInt(req.query.limit) || 50;

  getGroupMessages(groupId, limit, (err, messages) => {
    if (err) {
      console.error('Error fetching group messages:', err);
      return res.status(500).json({ error: 'Failed to fetch group messages' });
    }
    res.json(messages);
  });
});

// Send group message
router.post('/groups/:groupId/messages', upload.single('file'), (req, res) => {
  const groupId = parseInt(req.params.groupId);
  const senderId = req.user.userId;
  const { message } = req.body;

  let messageType = 'text';
  let messageContent = message;

  if (req.file) {
    messageType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
    messageContent = `groups/${req.file.filename}`;
  }

  if (!messageContent) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  sendGroupMessage(groupId, senderId, messageContent, messageType, (err, newMessage) => {
    if (err) {
      console.error('Error sending group message:', err);
      return res.status(500).json({ error: 'Failed to send message' });
    }

    // Emit to group members
    req.io.to(`group_${groupId}`).emit('new_group_message', {
      ...newMessage,
      username: req.user.username,
      avatar: req.user.avatar
    });

    res.status(201).json(newMessage);
  });
});

// ==================== PROFILE ROUTES ====================

// Update user profile
router.put('/profile', (req, res) => {
  const userId = req.user.userId;
  const { bio, location, website, birth_date } = req.body;

  updateUserProfile(userId, {
    bio,
    location,
    website,
    birth_date
  }, (err) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    res.json({ message: 'Profile updated successfully' });
  });
});

// Update cover photo
router.post('/profile/cover', upload.single('cover'), (req, res) => {
  const userId = req.user.userId;

  if (!req.file) {
    return res.status(400).json({ error: 'Cover photo is required' });
  }

  const coverPhotoPath = `profiles/${req.file.filename}`;

  updateUserCoverPhoto(userId, coverPhotoPath, (err) => {
    if (err) {
      console.error('Error updating cover photo:', err);
      return res.status(500).json({ error: 'Failed to update cover photo' });
    }
    res.json({ 
      message: 'Cover photo updated successfully',
      cover_photo: coverPhotoPath
    });
  });
});

// Get user profile
router.get('/profile/:userId', (req, res) => {
  const userId = parseInt(req.params.userId);

  getUser('id', userId, (err, user) => {
    if (err) {
      console.error('Error fetching user profile:', err);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive information
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });
});

module.exports = router;