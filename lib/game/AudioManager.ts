// =====================================================
// DISCOVERY — Retro WebAudio Manager
// Pure chiptune / 32-bit console style sounds
// No external assets — all generated via AudioContext
// =====================================================

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted = false;

  private init() {
    if (this.audioContext) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.65;
      this.masterGain.connect(this.audioContext.destination);
    } catch (e) {
      console.warn('WebAudio not available');
    }
  }

  private getContext(): AudioContext | null {
    if (!this.audioContext) this.init();
    return this.audioContext;
  }

  playFootstep() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = 85 + Math.random() * 25;

    filter.type = 'lowpass';
    filter.frequency.value = 420;

    gain.gain.value = 0.18;

    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.12;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 180;
    noiseFilter.Q.value = 1.8;

    const t = ctx.currentTime;

    // Short envelope for retro footstep
    gain.gain.setValueAtTime(0.18, t);
    gain.gain.linearRampToValueAtTime(0.001, t + 0.18);

    noiseGain.gain.setValueAtTime(0.12, t);
    noiseGain.gain.linearRampToValueAtTime(0.001, t + 0.16);

    const merger = ctx.createGain();
    osc.connect(filter);
    filter.connect(gain);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    gain.connect(merger);
    noiseGain.connect(merger);
    merger.connect(this.masterGain!);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.25);
    noise.stop(t + 0.25);
  }

  playBlip(type: 'ui' | 'interact' | 'power' = 'ui') {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    const t = ctx.currentTime;

    if (type === 'ui') {
      osc.type = 'square';
      osc.frequency.value = 880;
      filter.frequency.value = 1200;
      gain.gain.value = 0.22;
      gain.gain.linearRampToValueAtTime(0.001, t + 0.09);
    } else if (type === 'interact') {
      osc.type = 'sawtooth';
      osc.frequency.value = 620;
      filter.frequency.value = 900;
      gain.gain.value = 0.25;
      gain.gain.linearRampToValueAtTime(0.001, t + 0.22);
    } else {
      // power / attune
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.linearRampToValueAtTime(780, t + 0.35);
      filter.frequency.value = 1600;
      gain.gain.value = 0.3;
      gain.gain.linearRampToValueAtTime(0.001, t + 0.6);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(t);
    osc.stop(t + 0.8);
  }

  startAmbient() {
    const ctx = this.getContext();
    if (!ctx || this.ambientOsc || this.isMuted) return;

    this.ambientOsc = ctx.createOscillator();
    this.ambientGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 38;

    filter.type = 'lowpass';
    filter.frequency.value = 180;

    this.ambientGain.gain.value = 0.035;

    this.ambientOsc.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain!);

    this.ambientOsc.start();
  }

  stopAmbient() {
    if (this.ambientOsc) {
      this.ambientOsc.stop();
      this.ambientOsc = null;
    }
    this.ambientGain = null;
  }

  playPowerUp() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const t = ctx.currentTime;

    // Rising chord feel (two oscillators)
    [520, 680, 920].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i === 2 ? 'square' : 'sawtooth';
      osc.frequency.value = freq;

      filter.type = 'lowpass';
      filter.frequency.value = 1400;

      gain.gain.value = 0.12 - i * 0.025;

      const endTime = t + 0.7 + i * 0.1;

      gain.gain.setValueAtTime(gain.gain.value, t);
      gain.gain.linearRampToValueAtTime(0.001, endTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(t + i * 0.04);
      osc.stop(endTime);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0.001 : 0.65;
    }
    if (this.isMuted) {
      this.stopAmbient();
    } else {
      // Restart ambient if we're unmuting
      if (!this.ambientOsc) this.startAmbient();
    }
    return this.isMuted;
  }

  isCurrentlyMuted() {
    return this.isMuted;
  }
}

// Singleton
export const audio = new AudioManager();
