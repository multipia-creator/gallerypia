/** L5-2: Voice Search - Web Speech API */
class VoiceSearch {
  constructor() { 
    this.recognition = null;
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
      this.recognition.lang = 'ko-KR';
    }
    console.log('Voice Search initialized'); 
  }
  startListening() { if (this.recognition) this.recognition.start(); }
  stopListening() { if (this.recognition) this.recognition.stop(); }
}
window.voiceSearch = new VoiceSearch();
