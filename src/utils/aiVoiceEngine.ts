/**
 * AI Voice Tutor Speech Engine
 * Uses Web Speech API (speechSynthesis) to dynamically narrate quantum platform
 * guidance, step instructions, and physics consequences aloud.
 */
class AIVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private muted: boolean = false;
  private pitch: number = 1.0;
  private rate: number = 0.98;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.initVoice();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.initVoice();
      }
    }
  }

  private initVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    // Prefer high-quality natural English voices
    const preferred = voices.find(
      v => v.lang.startsWith('en') && (
        v.name.includes('Google') || 
        v.name.includes('Natural') || 
        v.name.includes('Samantha') || 
        v.name.includes('Zira') ||
        v.name.includes('Daniel')
      )
    );
    this.voice = preferred || voices.find(v => v.lang.startsWith('en')) || voices[0];
  }

  public speak(text: string, onEnd?: () => void) {
    if (this.muted || !this.synth) return;

    // Cancel any ongoing speech for immediate dynamic response
    this.synth.cancel();

    // Clean text of markdown characters for natural speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\|(\d+)\⟩/g, 'state $1')
      .replace(/\|0\⟩/g, 'state zero')
      .replace(/\|1\⟩/g, 'state one');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.pitch = this.pitch;
    utterance.rate = this.rate;

    if (onEnd) {
      utterance.onend = onEnd;
    }

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.muted) {
      this.stop();
    }
    return this.muted;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }
}

export const aiVoiceEngine = new AIVoiceEngine();
