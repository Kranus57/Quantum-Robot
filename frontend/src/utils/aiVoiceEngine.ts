/**
 * AI Voice Tutor Speech Engine
 * Uses Web Speech API (speechSynthesis) to dynamically narrate quantum platform
 * guidance, step instructions, and physics consequences aloud.
 */
class AIVoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private currentLanguage: string = 'en';
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

    if (!this.voice) {
      // Default preference to natural English voices, or first available system voice
      const preferred = voices.find(
        v => v.lang.startsWith(this.currentLanguage) && (
          v.name.includes('Google') || 
          v.name.includes('Natural') || 
          v.name.includes('Samantha') || 
          v.name.includes('Zira') ||
          v.name.includes('Daniel')
        )
      );
      this.voice = preferred || voices.find(v => v.lang.startsWith(this.currentLanguage)) || voices[0];
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
    return this.synth ? this.synth.getVoices() : [];
  }

  public setVoice(voice: SpeechSynthesisVoice) {
    this.voice = voice;
    if (voice && voice.lang) {
      const prefix = voice.lang.split('-')[0].split('_')[0].toLowerCase();
      this.currentLanguage = prefix;
    }
  }

  public setLanguage(langCode: string) {
    this.currentLanguage = langCode.toLowerCase();
    const voices = this.getVoices();
    const match = voices.find(v => (v.lang || '').toLowerCase().startsWith(this.currentLanguage));
    if (match) {
      this.voice = match;
    }
  }

  public getLanguage(): string {
    return this.currentLanguage;
  }

  public getSelectedVoice(): SpeechSynthesisVoice | null {
    return this.voice;
  }

  public speak(text: string, onEnd?: () => void, lang?: string) {
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
    const activeLang = lang || (this.voice ? this.voice.lang : this.currentLanguage);
    utterance.lang = activeLang;

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
