// Web Audio API Synthesizer for NAVSHAKTI 2026: THE CAMPUS SHOWDOWN
// Completely offline, zero external audio asset dependencies, instantaneous response

class NavshaktiSoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.masterVolume = 0.85;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // 1. Survey Answer Reveal: Pure, sparkling metallic dual-tone bell chime "DING!"
  playDing() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(this.masterVolume * 0.95, t);
    master.connect(this.ctx.destination);

    // Harmonic bell partials (C6 ~ 1046Hz, G6 ~ 1568Hz, C7 ~ 2093Hz, E7 ~ 2637Hz)
    const tones = [
      { freq: 1046.5, gain: 0.75, decay: 1.5 },
      { freq: 1567.9, gain: 0.5, decay: 1.2 },
      { freq: 2093.0, gain: 0.65, decay: 1.6 },
      { freq: 2637.0, gain: 0.35, decay: 0.9 },
      { freq: 4186.0, gain: 0.18, decay: 0.5 }
    ];

    tones.forEach(({ freq, gain, decay }) => {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.998, t + decay);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(gain, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(g);
      g.connect(master);

      osc.start(t);
      osc.stop(t + decay);
    });

    // High shimmer noise
    const bufferSize = this.ctx.sampleRate * 0.05;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(3600, t);
    filter.Q.setValueAtTime(3.0, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(master);

    whiteNoise.start(t);
    whiteNoise.stop(t + 0.06);
  }

  // 2. Strike Buzzer: Iconic harsh, detuned, low game show buzz ("EH-EHNNN!")
  playBuzzer(count = 1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const playSingleBuzz = (startTime, duration = 0.55) => {
      const master = this.ctx.createGain();
      master.gain.setValueAtTime(this.masterVolume * 0.9, startTime);
      master.connect(this.ctx.destination);

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc3.type = 'square';

      osc1.frequency.setValueAtTime(110, startTime);
      osc2.frequency.setValueAtTime(116.5, startTime);
      osc3.frequency.setValueAtTime(55, startTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1300, startTime);
      filter.Q.setValueAtTime(3.5, startTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(0.85, startTime + 0.015);
      gain.gain.setValueAtTime(0.8, startTime + duration - 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(master);

      osc1.start(startTime);
      osc2.start(startTime);
      osc3.start(startTime);
      osc1.stop(startTime + duration);
      osc2.stop(startTime + duration);
      osc3.stop(startTime + duration);
    };

    const now = this.ctx.currentTime;
    if (count >= 3) {
      playSingleBuzz(now, 0.4);
      playSingleBuzz(now + 0.45, 0.65);
    } else {
      playSingleBuzz(now, 0.55);
    }
  }

  // 3. Steal Opportunity Alert: Urgent, exciting brass / siren stinger
  playStealAlert() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(880, t + 0.25);
    osc.frequency.linearRampToValueAtTime(660, t + 0.5);

    g.gain.setValueAtTime(0.001, t);
    g.gain.linearRampToValueAtTime(this.masterVolume * 0.6, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(g);
    g.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  // 4. Mechanical 3D Slat Flip: Solari flap turnover & aerodynamic whoosh
  playTileFlip() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const master = this.ctx.createGain();
    master.gain.setValueAtTime(this.masterVolume * 0.45, t);
    master.connect(this.ctx.destination);

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(460, t);
    osc.frequency.exponentialRampToValueAtTime(75, t + 0.08);

    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(g);
    g.connect(master);
    osc.start(t);
    osc.stop(t + 0.08);

    const duration = 0.16;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1500, t);
    filter.Q.setValueAtTime(1.8, t);

    const ng = this.ctx.createGain();
    ng.gain.setValueAtTime(0.35, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(ng);
    ng.connect(master);

    noise.start(t);
    noise.stop(t + duration);
  }

  // 5. Points Tally Counter Tick
  playCountTick(pitchFactor = 1.0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880 * pitchFactor, t);
    osc.frequency.exponentialRampToValueAtTime(1174 * pitchFactor, t + 0.03);

    g.gain.setValueAtTime(this.masterVolume * 0.28, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(g);
    g.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.04);
  }

  // 6. Round Win Fanfare: Grand celebration with energetic Indian Garba Dhol rhythm & bells
  playWinFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    // Brass/Synth Arpeggio: C5 -> E5 -> G5 -> C6 -> E6
    const notes = [
      { f: 523.25, d: 0.15, delay: 0.0 },
      { f: 659.25, d: 0.15, delay: 0.14 },
      { f: 783.99, d: 0.15, delay: 0.28 },
      { f: 1046.50, d: 0.35, delay: 0.42 },
      { f: 1318.51, d: 0.65, delay: 0.65 }
    ];

    const now = this.ctx.currentTime;
    notes.forEach(({ f, d, delay }) => {
      const t = now + delay;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc2.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc2.frequency.setValueAtTime(f * 2, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(this.masterVolume * 0.35, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);

      osc.connect(g);
      osc2.connect(g);
      g.connect(this.ctx.destination);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + d);
      osc2.stop(t + d);
    });

    // Simulated Dhol beat punch (low resonant drum hit)
    const playDholHit = (time, pitch) => {
      const dholOsc = this.ctx.createOscillator();
      const dholGain = this.ctx.createGain();
      dholOsc.type = 'sine';
      dholOsc.frequency.setValueAtTime(pitch, time);
      dholOsc.frequency.exponentialRampToValueAtTime(45, time + 0.25);
      dholGain.gain.setValueAtTime(this.masterVolume * 0.7, time);
      dholGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
      dholOsc.connect(dholGain);
      dholGain.connect(this.ctx.destination);
      dholOsc.start(time);
      dholOsc.stop(time + 0.25);
    };

    playDholHit(now, 160);
    playDholHit(now + 0.28, 140);
    playDholHit(now + 0.42, 180);
    playDholHit(now + 0.65, 200);
  }

  // 7. Fast Timer Tick
  playTimerTick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(950, t);

    g.gain.setValueAtTime(this.masterVolume * 0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(g);
    g.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.035);
  }

  // 8. Grand Championship Finale Victory Fanfare
  playGrandWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const arpeggio = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98, 2093.0, 2637.0];
    const now = this.ctx.currentTime;
    arpeggio.forEach((f, idx) => {
      const t = now + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(this.masterVolume * 0.45, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + (idx === arpeggio.length - 1 ? 1.6 : 0.28));

      osc.connect(g);
      g.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + (idx === arpeggio.length - 1 ? 1.6 : 0.28));
    });
  }
}

export const soundEngine = new NavshaktiSoundEngine();
