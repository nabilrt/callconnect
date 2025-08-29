class WebRTCService {
  constructor() {
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null;
    this.socket = null;
    this.currentCallId = null;
    this.currentCallType = 'audio'; // 'audio' or 'video'
    this.isAudioMuted = false;
    this.isVideoMuted = false;
    this.pendingIceCandidates = []; // Queue for ICE candidates received before remote description
    
    // ICE servers configuration
    this.iceServers = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  setSocket(socket) {
    this.socket = socket;
    this.setupSocketListeners();
  }

  setupSocketListeners() {
    if (!this.socket) return;

    // WebRTC signaling events
    this.socket.on('webrtc_offer', this.handleOffer.bind(this));
    this.socket.on('webrtc_answer', this.handleAnswer.bind(this));
    this.socket.on('webrtc_ice_candidate', this.handleIceCandidate.bind(this));
    
    // Call management events
    this.socket.on('call_initiated', this.handleCallInitiated.bind(this));
    this.socket.on('call_accepted', this.handleCallAccepted.bind(this));
    this.socket.on('call_ended', this.handleCallEnded.bind(this));
  }

  async createPeerConnection(callId) {
    this.currentCallId = callId;
    this.peerConnection = new RTCPeerConnection(this.iceServers);

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.socket) {
        this.socket.emit('webrtc_ice_candidate', {
          callId: this.currentCallId,
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('📺 Received remote track:', event.track.kind, 'enabled:', event.track.enabled, 'readyState:', event.track.readyState);
      
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        
        const videoTracks = this.remoteStream.getVideoTracks();
        const audioTracks = this.remoteStream.getAudioTracks();
        const hasVideo = videoTracks.length > 0;
        
        console.log('📺 Remote stream details:', {
          hasVideo,
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length,
          videoEnabled: videoTracks[0]?.enabled,
          stream: this.remoteStream
        });
        
        // Dispatch custom event for UI to handle
        window.dispatchEvent(new CustomEvent('webrtc:remoteStream', {
          detail: { 
            stream: this.remoteStream,
            hasVideo: hasVideo
          }
        }));
      }
    };

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      console.log('📞 Connection state changed:', this.peerConnection.connectionState);
      
      window.dispatchEvent(new CustomEvent('webrtc:connectionState', {
        detail: { state: this.peerConnection.connectionState }
      }));
      
      // Auto-cleanup if connection fails
      if (this.peerConnection.connectionState === 'failed' || 
          this.peerConnection.connectionState === 'closed' ||
          this.peerConnection.connectionState === 'disconnected') {
        console.log('🚨 Connection failed/closed, initiating cleanup...');
        setTimeout(() => this.cleanup(), 1000);
      }
    };

    // Also listen to ICE connection state for more immediate feedback
    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('🧊 ICE connection state changed:', this.peerConnection.iceConnectionState);
      
      if (this.peerConnection.iceConnectionState === 'connected' || 
          this.peerConnection.iceConnectionState === 'completed') {
        // Connection is established
        window.dispatchEvent(new CustomEvent('webrtc:connectionState', {
          detail: { state: 'connected' }
        }));
      }
    };

    return this.peerConnection;
  }

  async startCall(receiverId, callType = 'audio') {
    try {
      this.currentCallType = callType;
      
      // Get user media
      await this.getUserMedia(callType);
      
      // Initiate call via socket
      this.socket.emit('initiate_call', { receiverId, callType });
      
      return true;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async acceptCall(callId, callType = 'audio') {
    try {
      this.currentCallType = callType;
      
      // Get user media
      await this.getUserMedia(callType);
      
      // Create peer connection
      await this.createPeerConnection(callId);
      
      // Add local stream to peer connection
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }
      
      // Accept call via socket
      this.socket.emit('accept_call', { callId });
      
      return true;
    } catch (error) {
      console.error('Error accepting call:', error);
      throw error;
    }
  }

  async getUserMedia(callType = 'audio') {
    try {
      const constraints = {
        audio: true,
        video: callType === 'video' ? {
          width: { ideal: 640, max: 1280 },
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 30, max: 30 }
        } : false
      };

      console.log('🎥 Getting user media for:', callType, 'constraints:', JSON.stringify(constraints, null, 2));
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      console.log('🎥 Stream created successfully:', this.localStream);
      
      const videoTracks = this.localStream.getVideoTracks();
      const audioTracks = this.localStream.getAudioTracks();
      const hasVideo = videoTracks.length > 0;
      
      console.log('🎥 Stream analysis - RAW VALUES:', {
        hasVideo: hasVideo,
        videoTracksCount: videoTracks.length,
        audioTracksCount: audioTracks.length,
        callType: this.currentCallType,
        videoTracksArray: videoTracks,
        audioTracksArray: audioTracks
      });
      
      console.log('🎥 Video track details:');
      videoTracks.forEach((track, index) => {
        console.log(`  Track ${index}:`, {
          id: track.id,
          kind: track.kind,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label
        });
      });
      
      // Dispatch event for UI to handle
      window.dispatchEvent(new CustomEvent('webrtc:localStream', {
        detail: { 
          stream: this.localStream,
          hasVideo: hasVideo,
          callType: this.currentCallType
        }
      }));
      
      console.log('📺 Dispatched local stream event:', { hasVideo, callType: this.currentCallType });
      
      return this.localStream;
    } catch (error) {
      console.error('🚨 Error getting user media:', error);
      console.error('🚨 Error details:', {
        name: error.name,
        message: error.message,
        constraint: error.constraint
      });
      throw error;
    }
  }

  handleCallInitiated(data) {
    this.currentCallId = data.callId;
    this.currentCallType = data.callType;
  }

  async handleCallAccepted({ callId }) {
    try {
      // Create peer connection and add local stream
      await this.createPeerConnection(callId);
      
      // Set initial connection state
      window.dispatchEvent(new CustomEvent('webrtc:connectionState', {
        detail: { state: 'connecting' }
      }));
      
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream);
        });
      }
      
      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      this.socket.emit('webrtc_offer', {
        callId: this.currentCallId,
        offer: offer
      });
      
    } catch (error) {
      console.error('Error handling call accepted:', error);
    }
  }

  async handleOffer({ offer }) {
    try {
      if (this.peerConnection) {
        console.log('🎯 Handling offer, current state:', this.peerConnection.signalingState);
        
        // Only process offer if we're in the right state (not already negotiated)
        if (this.peerConnection.signalingState === 'stable' && !this.peerConnection.remoteDescription) {
          // Set connection state to connecting for receiver too
          window.dispatchEvent(new CustomEvent('webrtc:connectionState', {
            detail: { state: 'connecting' }
          }));
          
          await this.peerConnection.setRemoteDescription(offer);
          console.log('✅ Remote offer description set successfully');
          
          // Process any queued ICE candidates
          await this.processQueuedIceCandidates();
          
          // Create answer
          const answer = await this.peerConnection.createAnswer();
          await this.peerConnection.setLocalDescription(answer);
          
          // Send answer
          this.socket.emit('webrtc_answer', {
            callId: this.currentCallId,
            answer: answer
          });
        } else {
          console.warn('🚨 Ignoring offer - peer connection in wrong state:', this.peerConnection.signalingState, 'or already has remote description');
        }
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer({ answer }) {
    try {
      if (this.peerConnection) {
        console.log('🎯 Handling answer, current state:', this.peerConnection.signalingState);
        
        // Only set remote description if we're in the right state
        if (this.peerConnection.signalingState === 'have-local-offer') {
          await this.peerConnection.setRemoteDescription(answer);
          console.log('✅ Remote description set successfully');
          
          // Process any queued ICE candidates
          await this.processQueuedIceCandidates();
        } else {
          console.warn('🚨 Ignoring answer - peer connection in wrong state:', this.peerConnection.signalingState);
        }
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate({ candidate }) {
    try {
      if (this.peerConnection) {
        // Check if remote description is set
        if (this.peerConnection.remoteDescription) {
          console.log('🧊 Adding ICE candidate directly');
          await this.peerConnection.addIceCandidate(candidate);
        } else {
          // Queue the ICE candidate for later processing
          console.log('🧊 Queuing ICE candidate - no remote description yet');
          this.pendingIceCandidates.push(candidate);
        }
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  async processQueuedIceCandidates() {
    try {
      console.log(`🧊 Processing ${this.pendingIceCandidates.length} queued ICE candidates`);
      
      while (this.pendingIceCandidates.length > 0) {
        const candidate = this.pendingIceCandidates.shift();
        await this.peerConnection.addIceCandidate(candidate);
        console.log('🧊 Added queued ICE candidate');
      }
    } catch (error) {
      console.error('Error processing queued ICE candidates:', error);
    }
  }

  endCall() {
    if (this.currentCallId) {
      this.socket.emit('end_call', { callId: this.currentCallId });
    }
    
    // Ensure immediate cleanup of media resources
    this.cleanup();
  }

  handleCallEnded({ callId, reason, disconnectedUser }) {
    console.log('Call ended:', reason || 'normal');
    this.cleanup();
    
    // Dispatch event for UI
    window.dispatchEvent(new CustomEvent('webrtc:callEnded', {
      detail: { reason, disconnectedUser }
    }));
  }


  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        this.isAudioMuted = !audioTrack.enabled;
        
        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('webrtc:audioToggled', {
          detail: { muted: this.isAudioMuted }
        }));
      }
    }
    return this.isAudioMuted;
  }

  toggleVideo() {
    if (this.localStream && this.currentCallType === 'video') {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        this.isVideoMuted = !videoTrack.enabled;
        
        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('webrtc:videoToggled', {
          detail: { muted: this.isVideoMuted }
        }));
      }
    }
    return this.isVideoMuted;
  }

  cleanup() {
    console.log('🧹 Cleaning up WebRTC resources...');
    
    // Stop all local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`🎵 Stopping ${track.kind} track, enabled: ${track.enabled}, readyState: ${track.readyState}`);
        track.stop();
      });
      this.localStream = null;
      console.log('✅ All local tracks stopped');
    }
    
    // Clear remote stream reference
    if (this.remoteStream) {
      this.remoteStream = null;
      console.log('🎵 Cleared remote stream reference');
    }
    
    // Close peer connection
    if (this.peerConnection) {
      // Remove all senders to ensure tracks are released
      const senders = this.peerConnection.getSenders();
      senders.forEach(sender => {
        if (sender.track) {
          console.log(`🎵 Removing ${sender.track.kind} track from peer connection`);
          this.peerConnection.removeTrack(sender);
        }
      });
      
      this.peerConnection.close();
      this.peerConnection = null;
      console.log('📞 Closed peer connection');
    }
    
    // Reset state
    this.currentCallId = null;
    this.remoteStream = null;
    this.currentCallType = 'audio';
    this.isAudioMuted = false;
    this.isVideoMuted = false;
    this.pendingIceCandidates = []; // Clear any queued ICE candidates
    
    // Dispatch cleanup event for UI
    window.dispatchEvent(new CustomEvent('webrtc:cleanup'));
    
    // Force garbage collection of media resources
    setTimeout(() => {
      console.log('🧹 Force cleanup - requesting media device release');
      // This helps ensure browser releases microphone/camera indicators
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices().catch(() => {
          // Ignore errors, this is just to trigger cleanup
        });
      }
    }, 100);
    
    console.log('✅ WebRTC cleanup completed');
  }

  // Get current call state
  getCallState() {
    return {
      isInCall: !!this.currentCallId,
      callType: this.currentCallType,
      isAudioMuted: this.isAudioMuted,
      isVideoMuted: this.isVideoMuted,
      callId: this.currentCallId,
      connectionState: this.peerConnection?.connectionState || 'closed'
    };
  }
}

// Export singleton instance
export default new WebRTCService();
// Force HMR update