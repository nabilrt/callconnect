const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createCallHistory, getUserCallHistory, deleteCallHistory, clearUserCallHistory } = require('../database/db');

// @route   POST /api/calls/history
// @desc    Create a new call history entry
// @access  Private
router.post('/history', authenticateToken, async (req, res) => {
  try {
    const { caller_id, receiver_id, call_type, direction, status, duration, started_at, ended_at } = req.body;
    
    // Validate required fields
    if (!caller_id || !receiver_id || !call_type || !direction || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate that the user is either the caller or receiver
    const userId = req.user.userId;
    if (userId !== caller_id && userId !== receiver_id) {
      return res.status(403).json({ message: 'Unauthorized to create this call history' });
    }
    
    // Validate call_type
    if (!['audio', 'video'].includes(call_type)) {
      return res.status(400).json({ message: 'Invalid call type' });
    }
    
    // Validate direction
    if (!['incoming', 'outgoing'].includes(direction)) {
      return res.status(400).json({ message: 'Invalid call direction' });
    }
    
    // Validate status
    if (!['completed', 'missed', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid call status' });
    }
    
    const callData = {
      caller_id,
      receiver_id,
      call_type,
      direction,
      status,
      duration: duration || 0,
      started_at: started_at || new Date().toISOString(),
      ended_at: ended_at
    };
    
    createCallHistory(callData, (err, call) => {
      if (err) {
        console.error('Error creating call history:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.status(201).json({
        message: 'Call history created successfully',
        call: call
      });
    });
    
  } catch (error) {
    console.error('Error creating call history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/calls/history
// @desc    Get user's call history
// @access  Private
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 100;
    
    getUserCallHistory(userId, limit, (err, calls) => {
      if (err) {
        console.error('Error fetching call history:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({
        message: 'Call history retrieved successfully',
        calls: calls || []
      });
    });
    
  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/calls/history/:callId
// @desc    Delete a specific call history entry
// @access  Private
router.delete('/history/:callId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const callId = parseInt(req.params.callId);
    
    if (!callId) {
      return res.status(400).json({ message: 'Invalid call ID' });
    }
    
    deleteCallHistory(callId, userId, (err) => {
      if (err) {
        console.error('Error deleting call history:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ message: 'Call history deleted successfully' });
    });
    
  } catch (error) {
    console.error('Error deleting call history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/calls/history
// @desc    Clear all call history for the user
// @access  Private
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    clearUserCallHistory(userId, (err) => {
      if (err) {
        console.error('Error clearing call history:', err);
        return res.status(500).json({ message: 'Server error' });
      }
      
      res.json({ message: 'Call history cleared successfully' });
    });
    
  } catch (error) {
    console.error('Error clearing call history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;