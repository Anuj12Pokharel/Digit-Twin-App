import { RTCPeerConnection, RTCSessionDescription, mediaDevices } from 'react-native-webrtc';
import api from '../api/api';

class RealtimeVoiceService {
  constructor() {
    this.pc = null;
    this.clientSecret = null;
    this.dc = null;
  }

  async startSession(onTranscript = () => {}, onAudioStream = () => {}) {
    try {
      // 1. Get ephemeral token from backend
      const res = await api.post('/auth/realtime-session');
      const { client_secret } = res.data;
      this.clientSecret = client_secret;

      // 2. Setup RTCPeerConnection
      this.pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Handle remote audio stream
      this.pc.ontrack = (e) => {
        if (e.streams && e.streams[0]) {
          onAudioStream(e.streams[0]);
        }
      };

      // 3. Setup Microphone
      const localStream = await mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      localStream.getTracks().forEach(track => this.pc.addTrack(track, localStream));

      // 4. Setup Data Channel for transcripts/events
      this.dc = this.pc.createDataChannel('oai-events');
      this.dc.onmessage = (e) => {
        const event = JSON.parse(e.data);
        if (event.type === 'response.audio_transcript.delta') {
          onTranscript(event.delta);
        }
      };

      // 5. SDP Handshake
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      const baseUrl = 'https://api.openai.com/v1/realtime';
      const model = 'gpt-4o-realtime-preview-2024-10-01';
      
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${this.clientSecret}`,
          'Content-Type': 'application/sdp'
        }
      });

      const answerSdp = await sdpResponse.text();
      await this.pc.setRemoteDescription(new RTCSessionDescription({
        type: 'answer',
        sdp: answerSdp
      }));

      console.log('Realtime Voice Session Established');
      return true;

    } catch (err) {
      console.error('Realtime Session Error:', err);
      return false;
    }
  }

  stopSession() {
    if (this.pc) {
      this.pc.close();
      this.pc = null;
    }
    if (this.dc) {
      this.dc.close();
      this.dc = null;
    }
  }
}

export default new RealtimeVoiceService();
