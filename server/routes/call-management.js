const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../database/db');

// All call management routes require authentication
router.use((req, res, next) => {
  console.log('📞 Call Management route accessed:', req.path);
  
  // Disable caching for all call management endpoints
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  
  authenticateToken(req, res, next);
});

// Get call statistics and overview
router.get('/stats', (req, res) => {
  console.log('📊 Fetching call management statistics');
  
  const queries = [
    // Total calls
    `SELECT COUNT(*) as total_calls FROM call_history`,
    
    // Calls by status
    `SELECT status, COUNT(*) as count FROM call_history GROUP BY status`,
    
    // Calls by type
    `SELECT call_type, COUNT(*) as count FROM call_history GROUP BY call_type`,
    
    // Recent calls (last 7 days)
    `SELECT COUNT(*) as recent_calls FROM call_history 
     WHERE datetime(created_at) >= datetime('now', '-7 days')`,
     
    // Average call duration
    `SELECT AVG(duration) as avg_duration FROM call_history WHERE status = 'completed'`,
    
    // Peak hours (calls by hour)
    `SELECT strftime('%H', created_at) as hour, COUNT(*) as count 
     FROM call_history 
     GROUP BY strftime('%H', created_at) 
     ORDER BY count DESC`,
     
    // Calls per day (last 30 days)
    `SELECT DATE(created_at) as date, COUNT(*) as count 
     FROM call_history 
     WHERE datetime(created_at) >= datetime('now', '-30 days')
     GROUP BY DATE(created_at) 
     ORDER BY date DESC`
  ];

  const results = {};
  let completed = 0;

  queries.forEach((query, index) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`❌ Error executing query ${index}:`, err);
        results[`query_${index}`] = [];
      } else {
        results[`query_${index}`] = rows;
      }
      
      completed++;
      if (completed === queries.length) {
        // Process results
        const stats = {
          totalCalls: results.query_0[0]?.total_calls || 0,
          recentCalls: results.query_3[0]?.recent_calls || 0,
          averageDuration: Math.round(results.query_4[0]?.avg_duration || 0),
          callsByStatus: results.query_1 || [],
          callsByType: results.query_2 || [],
          peakHours: results.query_5 || [],
          dailyCalls: results.query_6 || []
        };
        
        console.log('✅ Call management statistics fetched successfully');
        res.json(stats);
      }
    });
  });
});

// Get recent call history with user details
router.get('/recent', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  console.log(`📞 Fetching recent ${limit} calls`);
  
  const query = `
    SELECT 
      ch.*,
      c.username as caller_username,
      c.email as caller_email,
      c.avatar as caller_avatar,
      r.username as receiver_username,
      r.email as receiver_email,
      r.avatar as receiver_avatar
    FROM call_history ch
    LEFT JOIN users c ON ch.caller_id = c.id
    LEFT JOIN users r ON ch.receiver_id = r.id
    ORDER BY ch.created_at DESC
    LIMIT ?
  `;
  
  db.all(query, [limit], (err, calls) => {
    if (err) {
      console.error('❌ Error fetching recent calls:', err);
      return res.status(500).json({ error: 'Failed to fetch recent calls' });
    }
    
    console.log(`✅ Fetched ${calls.length} recent calls`);
    res.json(calls);
  });
});

// Get call analytics by user
router.get('/users', (req, res) => {
  console.log('👥 Fetching call analytics by user');
  
  const query = `
    SELECT 
      u.id,
      u.username,
      u.email,
      u.avatar,
      COUNT(CASE WHEN ch.caller_id = u.id THEN 1 END) as outgoing_calls,
      COUNT(CASE WHEN ch.receiver_id = u.id THEN 1 END) as incoming_calls,
      COUNT(ch.id) as total_calls,
      AVG(CASE WHEN ch.status = 'completed' THEN ch.duration END) as avg_duration,
      COUNT(CASE WHEN ch.status = 'completed' THEN 1 END) as completed_calls,
      COUNT(CASE WHEN ch.status = 'missed' THEN 1 END) as missed_calls,
      COUNT(CASE WHEN ch.status = 'rejected' THEN 1 END) as rejected_calls,
      MAX(ch.created_at) as last_call_at
    FROM users u
    LEFT JOIN call_history ch ON (ch.caller_id = u.id OR ch.receiver_id = u.id)
    GROUP BY u.id, u.username, u.email, u.avatar
    HAVING total_calls > 0
    ORDER BY total_calls DESC
  `;
  
  db.all(query, [], (err, users) => {
    if (err) {
      console.error('❌ Error fetching user call analytics:', err);
      return res.status(500).json({ error: 'Failed to fetch user call analytics' });
    }
    
    // Format the results
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      stats: {
        outgoingCalls: user.outgoing_calls || 0,
        incomingCalls: user.incoming_calls || 0,
        totalCalls: user.total_calls || 0,
        averageDuration: Math.round(user.avg_duration || 0),
        completedCalls: user.completed_calls || 0,
        missedCalls: user.missed_calls || 0,
        rejectedCalls: user.rejected_calls || 0,
        lastCallAt: user.last_call_at
      }
    }));
    
    console.log(`✅ Fetched call analytics for ${formattedUsers.length} users`);
    res.json(formattedUsers);
  });
});

// Get call quality metrics
router.get('/quality', (req, res) => {
  console.log('📊 Fetching call quality metrics');
  
  const queries = [
    // Success rate (completed vs total)
    `SELECT 
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(CASE WHEN status = 'missed' THEN 1 END) as missed,
      COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected,
      COUNT(*) as total
     FROM call_history`,
     
    // Duration distribution
    `SELECT 
      COUNT(CASE WHEN duration < 30 THEN 1 END) as short_calls,
      COUNT(CASE WHEN duration BETWEEN 30 AND 300 THEN 1 END) as medium_calls,
      COUNT(CASE WHEN duration > 300 THEN 1 END) as long_calls
     FROM call_history WHERE status = 'completed'`,
     
    // Call type distribution over time
    `SELECT 
      DATE(created_at) as date,
      call_type,
      COUNT(*) as count
     FROM call_history 
     WHERE datetime(created_at) >= datetime('now', '-7 days')
     GROUP BY DATE(created_at), call_type
     ORDER BY date DESC`
  ];

  const results = {};
  let completed = 0;

  queries.forEach((query, index) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`❌ Error executing quality query ${index}:`, err);
        results[`query_${index}`] = [];
      } else {
        results[`query_${index}`] = rows;
      }
      
      completed++;
      if (completed === queries.length) {
        const qualityData = results.query_0[0] || {};
        const durationData = results.query_1[0] || {};
        const typeOverTime = results.query_2 || [];
        
        const quality = {
          successRate: qualityData.total > 0 ? 
            Math.round((qualityData.completed / qualityData.total) * 100) : 0,
          callOutcomes: {
            completed: qualityData.completed || 0,
            missed: qualityData.missed || 0,
            rejected: qualityData.rejected || 0
          },
          durationDistribution: {
            short: durationData.short_calls || 0,
            medium: durationData.medium_calls || 0,
            long: durationData.long_calls || 0
          },
          typeOverTime
        };
        
        console.log('✅ Call quality metrics fetched successfully');
        res.json(quality);
      }
    });
  });
});

// Delete call record
router.delete('/:callId', (req, res) => {
  const callId = parseInt(req.params.callId);
  console.log(`🗑️ Deleting call record ${callId}`);
  
  db.run('DELETE FROM call_history WHERE id = ?', [callId], function(err) {
    if (err) {
      console.error('❌ Error deleting call record:', err);
      return res.status(500).json({ error: 'Failed to delete call record' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Call record not found' });
    }
    
    console.log(`✅ Deleted call record ${callId}`);
    res.json({ success: true, message: 'Call record deleted successfully' });
  });
});

// Bulk delete call records
router.post('/bulk-delete', (req, res) => {
  const { callIds, filters } = req.body;
  
  if (callIds && callIds.length > 0) {
    // Delete specific call IDs
    console.log(`🗑️ Bulk deleting ${callIds.length} call records`);
    const placeholders = callIds.map(() => '?').join(',');
    
    db.run(`DELETE FROM call_history WHERE id IN (${placeholders})`, callIds, function(err) {
      if (err) {
        console.error('❌ Error bulk deleting call records:', err);
        return res.status(500).json({ error: 'Failed to delete call records' });
      }
      
      console.log(`✅ Bulk deleted ${this.changes} call records`);
      res.json({ success: true, deleted: this.changes });
    });
  } else if (filters) {
    // Delete based on filters
    let query = 'DELETE FROM call_history WHERE 1=1';
    const params = [];
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters.call_type) {
      query += ' AND call_type = ?';
      params.push(filters.call_type);
    }
    
    if (filters.older_than_days) {
      query += ' AND datetime(created_at) < datetime("now", "-" || ? || " days")';
      params.push(filters.older_than_days);
    }
    
    db.run(query, params, function(err) {
      if (err) {
        console.error('❌ Error bulk deleting call records with filters:', err);
        return res.status(500).json({ error: 'Failed to delete call records' });
      }
      
      console.log(`✅ Bulk deleted ${this.changes} call records with filters`);
      res.json({ success: true, deleted: this.changes });
    });
  } else {
    res.status(400).json({ error: 'No call IDs or filters provided' });
  }
});

// Get live/active calls (simulated from recent data)
router.get('/live', (req, res) => {
  console.log('📞 Fetching live calls');
  
  const query = `
    SELECT 
      ch.*,
      c.username as caller_username,
      c.email as caller_email,
      r.username as receiver_username,
      r.email as receiver_email
    FROM call_history ch
    LEFT JOIN users c ON ch.caller_id = c.id
    LEFT JOIN users r ON ch.receiver_id = r.id
    WHERE datetime(ch.created_at) >= datetime('now', '-1 hour')
    AND ch.status IN ('completed', 'missed')
    ORDER BY ch.created_at DESC
    LIMIT 5
  `;
  
  db.all(query, [], (err, calls) => {
    if (err) {
      console.error('❌ Error fetching live calls:', err);
      return res.status(500).json({ error: 'Failed to fetch live calls' });
    }
    
    // Transform recent calls to simulate live calls
    const liveCalls = calls.slice(0, 3).map((call, index) => ({
      id: call.id,
      caller: call.caller_username || 'Unknown',
      receiver: call.receiver_username || 'Unknown',
      callerEmail: call.caller_email || '',
      receiverEmail: call.receiver_email || '',
      type: call.call_type || 'audio',
      status: index === 0 ? 'active' : (index === 1 ? 'ringing' : 'connecting'),
      duration: index === 0 ? Math.floor((Date.now() - new Date(call.created_at).getTime()) / 1000) : 0,
      quality: ['excellent', 'good', 'fair'][index % 3],
      startTime: call.created_at,
      bandwidth: call.call_type === 'video' ? '850 kbps' : '320 kbps',
      muted: false
    }));
    
    console.log(`✅ Fetched ${liveCalls.length} live calls`);
    res.json(liveCalls);
  });
});

// Get call queue (simulated from missed/rejected calls)
router.get('/queue', (req, res) => {
  console.log('⏳ Fetching call queue');
  
  const query = `
    SELECT 
      ch.*,
      c.username as caller_username,
      c.email as caller_email
    FROM call_history ch
    LEFT JOIN users c ON ch.caller_id = c.id
    WHERE ch.status IN ('missed', 'rejected')
    AND datetime(ch.created_at) >= datetime('now', '-24 hours')
    ORDER BY ch.created_at DESC
    LIMIT 10
  `;
  
  db.all(query, [], (err, calls) => {
    if (err) {
      console.error('❌ Error fetching call queue:', err);
      return res.status(500).json({ error: 'Failed to fetch call queue' });
    }
    
    // Transform missed/rejected calls to queue format
    const queueData = calls.slice(0, 3).map((call, index) => ({
      id: call.id,
      caller: call.caller_username || 'Unknown',
      callerEmail: call.caller_email || '',
      callType: call.call_type || 'audio',
      waitTime: Math.floor((Date.now() - new Date(call.created_at).getTime()) / 1000),
      priority: index < 2 ? 'high' : 'normal',
      reason: call.status === 'missed' ? 'Missed Call Retry' : 'Rejected Call Retry',
      originalCallTime: call.created_at
    }));
    
    console.log(`✅ Fetched ${queueData.length} queued calls`);
    res.json(queueData);
  });
});

// Get system health metrics
router.get('/system-health', (req, res) => {
  console.log('🏥 Fetching system health metrics');
  
  const queries = [
    // Active connections (based on recent activity)
    `SELECT COUNT(DISTINCT caller_id) + COUNT(DISTINCT receiver_id) as active_connections
     FROM call_history 
     WHERE datetime(created_at) >= datetime('now', '-5 minutes')`,
     
    // Call success rate (last 24 hours)
    `SELECT 
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
      COUNT(*) as total
     FROM call_history 
     WHERE datetime(created_at) >= datetime('now', '-24 hours')`,
     
    // Average call duration (last hour)
    `SELECT AVG(duration) as avg_duration
     FROM call_history 
     WHERE status = 'completed' 
     AND datetime(created_at) >= datetime('now', '-1 hour')`
  ];

  const results = {};
  let completed = 0;

  queries.forEach((query, index) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error(`❌ Error executing health query ${index}:`, err);
        results[`query_${index}`] = [{}];
      } else {
        results[`query_${index}`] = rows;
      }
      
      completed++;
      if (completed === queries.length) {
        const connections = results.query_0[0]?.active_connections || 0;
        const callStats = results.query_1[0] || {};
        const avgDuration = results.query_2[0]?.avg_duration || 0;
        
        const successRate = callStats.total > 0 ? 
          Math.round((callStats.completed / callStats.total) * 100) : 95;
        
        const healthData = {
          serverStatus: 'healthy',
          activeConnections: connections,
          callSuccess: successRate,
          averageLatency: Math.floor(Math.random() * 30) + 20, // 20-50ms simulated
          bandwidthUsage: Math.min(connections * 15 + Math.random() * 20, 95), // Simulated based on connections
          cpuUsage: Math.min(connections * 5 + Math.random() * 20, 90), // Simulated
          memoryUsage: Math.min(50 + Math.random() * 30, 85), // Simulated
          avgCallDuration: Math.round(avgDuration)
        };
        
        console.log('✅ System health metrics fetched successfully');
        res.json(healthData);
      }
    });
  });
});

module.exports = router;