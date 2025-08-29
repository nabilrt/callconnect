const API_BASE_URL = 'http://localhost:3001/api';

class CallHistoryService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  updateToken() {
    this.token = localStorage.getItem('token');
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token || ''}`
    };
  }

  async createCallHistory(callData) {
    try {
      this.updateToken();
      const response = await fetch(`${API_BASE_URL}/calls/history`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(callData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.call;
    } catch (error) {
      console.error('Error saving call history to database:', error);
      // Fallback to localStorage
      this.saveToLocalStorage(callData);
      throw error;
    }
  }

  async getUserCallHistory(limit = 100) {
    try {
      this.updateToken();
      const response = await fetch(`${API_BASE_URL}/calls/history?limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.calls;
    } catch (error) {
      console.error('Error loading call history from database:', error);
      // Fallback to localStorage
      return this.getFromLocalStorage();
    }
  }

  async deleteCallHistory(callId) {
    try {
      this.updateToken();
      const response = await fetch(`${API_BASE_URL}/calls/history/${callId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📞 Call history deleted from database');
      return result;
    } catch (error) {
      console.error('🚨 Error deleting call history from database:', error);
      throw error;
    }
  }

  async clearAllCallHistory() {
    try {
      this.updateToken();
      const response = await fetch(`${API_BASE_URL}/calls/history`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('📞 All call history cleared from database');
      // Also clear localStorage
      localStorage.removeItem('callHistory');
      return result;
    } catch (error) {
      console.error('🚨 Error clearing call history from database:', error);
      throw error;
    }
  }

  // Fallback methods for localStorage
  saveToLocalStorage(callData) {
    try {
      const existingHistory = JSON.parse(localStorage.getItem('callHistory') || '[]');
      
      // Transform database format to localStorage format
      const localStorageFormat = {
        timestamp: Date.now(),
        duration: callData.duration || 0,
        callType: callData.call_type,
        direction: callData.direction,
        status: callData.status,
        callerId: callData.caller_id,
        callerUsername: callData.callerUsername || 'Unknown',
        receiverId: callData.receiver_id,
        receiverUsername: callData.receiverUsername || 'Unknown'
      };
      
      existingHistory.unshift(localStorageFormat);
      
      // Keep only last 100 calls
      if (existingHistory.length > 100) {
        existingHistory.splice(100);
      }
      
      localStorage.setItem('callHistory', JSON.stringify(existingHistory));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getFromLocalStorage() {
    try {
      const history = JSON.parse(localStorage.getItem('callHistory') || '[]');
      console.log('📞 Call history loaded from localStorage fallback:', history.length, 'calls');
      return history;
    } catch (error) {
      console.error('🚨 Error loading from localStorage:', error);
      return [];
    }
  }

  // Transform call data from frontend format to database format
  transformToDbFormat(callData, userId) {
    const isReceiver = callData.isReceiver;
    const caller_id = isReceiver ? callData.callerId : userId;
    const receiver_id = isReceiver ? userId : callData.receiverId;
    
    return {
      caller_id,
      receiver_id,
      call_type: callData.callType,
      direction: callData.isReceiver ? 'incoming' : 'outgoing',
      status: callData.status || 'completed',
      duration: callData.duration || 0,
      started_at: callData.startedAt || new Date().toISOString(),
      ended_at: callData.endedAt || new Date().toISOString(),
      // Include usernames for fallback
      callerUsername: isReceiver ? callData.callerUsername : callData.receiverUsername,
      receiverUsername: isReceiver ? callData.receiverUsername : callData.callerUsername
    };
  }
}

// Export singleton instance
export default new CallHistoryService();