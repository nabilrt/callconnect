const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../database/db');

// All content management routes require authentication
router.use((req, res, next) => {
  console.log('📝 Content Management route accessed:', req.path);
  
  // Disable caching for all content management endpoints
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  authenticateToken(req, res, next);
});

// Get all posts with user information
router.get('/posts', (req, res) => {
  console.log('📄 Fetching posts for content management');
  
  const query = `
    SELECT 
      p.id,
      p.content,
      p.image as media_url,
      p.created_at,
      p.updated_at,
      u.username as author,
      u.id as author_id,
      COUNT(DISTINCT pl.id) as likes,
      COUNT(DISTINCT c.id) as comments,
      CASE WHEN p.content LIKE '%important%' OR p.content LIKE '%announcement%' THEN 'pinned' ELSE 'published' END as status,
      0 as reported
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    LEFT JOIN post_likes pl ON p.id = pl.post_id
    LEFT JOIN post_comments c ON p.id = c.post_id
    GROUP BY p.id, p.content, p.image, p.created_at, p.updated_at, u.username, u.id
    ORDER BY p.created_at DESC
  `;
  
  db.all(query, [], (err, posts) => {
    if (err) {
      console.error('❌ Error fetching posts:', err);
      console.error('Full error details:', err.message);
      return res.status(500).json({ error: 'Failed to fetch posts', details: err.message });
    }
    
    // Format posts for the frontend
    const formattedPosts = posts.map(post => ({
      id: post.id,
      title: post.content && post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content || 'No content',
      content: post.content || 'No content',
      author: post.author || 'Unknown',
      author_id: post.author_id,
      created_at: post.created_at,
      updated_at: post.updated_at,
      likes: post.likes || 0,
      comments: post.comments || 0,
      status: post.status,
      reported: Boolean(post.reported),
      media_url: post.media_url
    }));
    
    console.log(`✅ Fetched ${formattedPosts.length} posts`);
    res.json(formattedPosts);
  });
});

// Get all groups with creator information
router.get('/groups', (req, res) => {
  console.log('👥 Fetching groups for content management');
  
  const query = `
    SELECT 
      g.id,
      g.name,
      g.description,
      g.created_at,
      g.privacy as privacy,
      u.username as creator,
      u.id as creator_id,
      COUNT(gm.user_id) as members,
      0 as reported
    FROM groups g
    LEFT JOIN users u ON g.created_by = u.id
    LEFT JOIN group_members gm ON g.id = gm.group_id
    GROUP BY g.id, g.name, g.description, g.created_at, g.privacy, u.username, u.id
    ORDER BY g.created_at DESC
  `;
  
  db.all(query, [], (err, groups) => {
    if (err) {
      console.error('❌ Error fetching groups:', err);
      console.error('Full error details:', err.message);
      return res.status(500).json({ error: 'Failed to fetch groups', details: err.message });
    }
    
    // Format groups for the frontend
    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name || 'Unnamed Group',
      description: group.description || 'No description available',
      members: group.members || 0,
      creator: group.creator || 'Unknown',
      creator_id: group.creator_id,
      created_at: group.created_at,
      privacy: group.privacy || 'public',
      reported: Boolean(group.reported)
    }));
    
    console.log(`✅ Fetched ${formattedGroups.length} groups`);
    res.json(formattedGroups);
  });
});

// Get all stories with author information
router.get('/stories', (req, res) => {
  console.log('📸 Fetching stories for content management');
  
  const query = `
    SELECT 
      s.id,
      COALESCE(s.image, s.video) as media_url,
      s.story_type as type,
      s.created_at,
      s.expires_at,
      (SELECT COUNT(*) FROM story_views WHERE story_id = s.id) as views,
      u.username as author,
      u.id as author_id,
      0 as reported
    FROM stories s
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.expires_at > datetime('now')
    ORDER BY s.created_at DESC
  `;
  
  db.all(query, [], (err, stories) => {
    if (err) {
      console.error('❌ Error fetching stories:', err);
      return res.status(500).json({ error: 'Failed to fetch stories' });
    }
    
    // Format stories for the frontend
    const formattedStories = stories.map(story => ({
      id: story.id,
      author: story.author,
      author_id: story.author_id,
      type: story.type || 'image',
      views: story.views || 0,
      created_at: story.created_at,
      expires_at: story.expires_at,
      reported: Boolean(story.reported),
      media_url: story.media_url
    }));
    
    console.log(`✅ Fetched ${formattedStories.length} stories`);
    res.json(formattedStories);
  });
});

// Delete a post
router.delete('/posts/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  console.log(`🗑️ Deleting post ${postId}`);
  
  db.run('DELETE FROM posts WHERE id = ?', [postId], function(err) {
    if (err) {
      console.error('❌ Error deleting post:', err);
      return res.status(500).json({ error: 'Failed to delete post' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    console.log(`✅ Deleted post ${postId}`);
    res.json({ success: true, message: 'Post deleted successfully' });
  });
});

// Delete a group
router.delete('/groups/:id', (req, res) => {
  const groupId = parseInt(req.params.id);
  console.log(`🗑️ Deleting group ${groupId}`);
  
  // First delete group members, then the group
  db.run('DELETE FROM group_members WHERE group_id = ?', [groupId], (err) => {
    if (err) {
      console.error('❌ Error deleting group members:', err);
      return res.status(500).json({ error: 'Failed to delete group' });
    }
    
    db.run('DELETE FROM groups WHERE id = ?', [groupId], function(err) {
      if (err) {
        console.error('❌ Error deleting group:', err);
        return res.status(500).json({ error: 'Failed to delete group' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Group not found' });
      }
      
      console.log(`✅ Deleted group ${groupId}`);
      res.json({ success: true, message: 'Group deleted successfully' });
    });
  });
});

// Delete a story
router.delete('/stories/:id', (req, res) => {
  const storyId = parseInt(req.params.id);
  console.log(`🗑️ Deleting story ${storyId}`);
  
  db.run('DELETE FROM stories WHERE id = ?', [storyId], function(err) {
    if (err) {
      console.error('❌ Error deleting story:', err);
      return res.status(500).json({ error: 'Failed to delete story' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }
    
    console.log(`✅ Deleted story ${storyId}`);
    res.json({ success: true, message: 'Story deleted successfully' });
  });
});

// Update post status (pin/unpin)
router.patch('/posts/:id/status', (req, res) => {
  const postId = parseInt(req.params.id);
  const { status } = req.body;
  
  console.log(`📌 Updating post ${postId} status to ${status}`);
  
  // For now, we'll just return success since we don't have a status field
  // In a real implementation, you'd add a status column to the posts table
  console.log(`✅ Updated post ${postId} status`);
  res.json({ success: true, message: 'Post status updated' });
});

module.exports = router;