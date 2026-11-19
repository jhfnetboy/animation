type WebkitWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

interface ToneOptions {
  freq: number;
  endFreq?: number;
  duration: number;
  gain?: number;
  delay?: number;
  type?: OscillatorType;
  filterCutoff?: number;
}

const SCENE_CHORD_FREQS: Record<number, number[]> = {
  0: [523.25, 659.25], // C5 + E5 (Planar peptide bond)
  1: [587.33, 880.0], // D5 + A5 (Alpha-helix pitch & 40-AA ruler)
  2: [659.25, 987.77], // E5 + B5 (DPP-4 armor & C18 albumin)
  3: [587.33, 783.99, 1174.66], // D5 + G5 + D6 (GPCR 5VAI & organ cascade)
};

export class BioAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private ambientNodes: AudioNode[] = [];
  private ambientOscillators: OscillatorNode[] = [];
  private muted = false;
  private ambientActive = false;

  private getAudioContextConstructor(): typeof AudioContext | null {
    if (typeof window === 'undefined') {
      return null;
    }
    const win = window as WebkitWindow;
    return window.AudioContext ?? win.webkitAudioContext ?? null;
  }

  private ensureContext(): AudioContext | null {
    if (this.ctx) {
      return this.ctx;
    }
    const AudioCtx = this.getAudioContextConstructor();
    if (!AudioCtx) {
      return null;
    }

    try {
      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.72;
      master.connect(ctx.destination);

      this.ctx = ctx;
      this.masterGain = master;
      return ctx;
    } catch {
      return null;
    }
  }

  public async unlock(): Promise<boolean> {
    const ctx = this.ensureContext();
    if (!ctx) {
      return false;
    }
    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch {
        return false;
      }
    }
    return ctx.state === 'running';
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.72, now, 0.04);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    if (!this.muted) {
      void this.unlock().then((ok) => {
        if (ok && !this.ambientActive) {
          this.startAmbient();
        }
      });
    }
    return this.muted;
  }

  public isAmbientRunning(): boolean {
    return this.ambientActive;
  }

  public startAmbient(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.ambientActive) {
      return;
    }

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }

    try {
      const now = ctx.currentTime;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, now);
      filter.Q.setValueAtTime(1.1, now);

      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.0001, now);
      padGain.gain.setTargetAtTime(0.055, now, 0.9);

      // Gentle breathing LFO modulating the low-pass filter cutoff
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.11, now);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(110, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      // Microscope warm harmonic pad (D3 + A3 + soft shimmer D4)
      const oscBase = ctx.createOscillator();
      oscBase.type = 'sine';
      oscBase.frequency.setValueAtTime(146.83, now);

      const oscFifth = ctx.createOscillator();
      oscFifth.type = 'triangle';
      oscFifth.frequency.setValueAtTime(220.0, now);
      oscFifth.detune.setValueAtTime(-5, now);

      const oscShimmer = ctx.createOscillator();
      oscShimmer.type = 'sine';
      oscShimmer.frequency.setValueAtTime(293.66, now);
      oscShimmer.detune.setValueAtTime(4, now);

      const baseGain = ctx.createGain();
      baseGain.gain.value = 0.55;
      const fifthGain = ctx.createGain();
      fifthGain.gain.value = 0.22;
      const shimmerGain = ctx.createGain();
      shimmerGain.gain.value = 0.14;

      oscBase.connect(baseGain);
      oscFifth.connect(fifthGain);
      oscShimmer.connect(shimmerGain);

      baseGain.connect(filter);
      fifthGain.connect(filter);
      shimmerGain.connect(filter);

      filter.connect(padGain);
      padGain.connect(this.masterGain);

      lfo.start(now);
      oscBase.start(now);
      oscFifth.start(now);
      oscShimmer.start(now);

      this.ambientGain = padGain;
      this.ambientOscillators = [lfo, oscBase, oscFifth, oscShimmer];
      this.ambientNodes = [filter, padGain, lfoGain, baseGain, fifthGain, shimmerGain];
      this.ambientActive = true;
    } catch {
      this.ambientActive = false;
    }
  }

  public stopAmbient(): void {
    if (!this.ambientActive || !this.ctx) {
      return;
    }
    const now = this.ctx.currentTime;
    try {
      if (this.ambientGain) {
        this.ambientGain.gain.setTargetAtTime(0.0001, now, 0.15);
      }
      const oscs = this.ambientOscillators;
      const nodes = this.ambientNodes;
      window.setTimeout(() => {
        for (const osc of oscs) {
          try {
            osc.stop();
            osc.disconnect();
          } catch {
            // Ignore already stopped oscillators
          }
        }
        for (const node of nodes) {
          try {
            node.disconnect();
          } catch {
            // Ignore cleanup errors
          }
        }
      }, 380);
    } catch {
      // Ignore cleanup errors
    } finally {
      this.ambientGain = null;
      this.ambientOscillators = [];
      this.ambientNodes = [];
      this.ambientActive = false;
    }
  }

  private scheduleTone(opts: ToneOptions): void {
    if (this.muted) {
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) {
      return;
    }
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }

    try {
      const startTime = ctx.currentTime + (opts.delay ?? 0);
      const duration = Math.max(0.05, opts.duration);
      const peakGain = opts.gain ?? 0.08;

      const osc = ctx.createOscillator();
      osc.type = opts.type ?? 'sine';
      osc.frequency.setValueAtTime(opts.freq, startTime);
      if (opts.endFreq !== undefined) {
        osc.frequency.exponentialRampToValueAtTime(
          Math.max(20, opts.endFreq),
          startTime + duration
        );
      }

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(opts.filterCutoff ?? 2800, startTime);

      const env = ctx.createGain();
      env.gain.setValueAtTime(0.0001, startTime);
      env.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.018);
      env.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(env);
      env.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.03);
      osc.onended = () => {
        try {
          osc.disconnect();
          filter.disconnect();
          env.disconnect();
        } catch {
          // Ignore disconnect errors
        }
      };
    } catch {
      // Safe no-op in constrained audio environments
    }
  }

  public playBeatTransition(sceneIdx = 0): void {
    const chord = SCENE_CHORD_FREQS[sceneIdx] ?? SCENE_CHORD_FREQS[0];
    chord.forEach((freq, idx) => {
      this.scheduleTone({
        freq,
        duration: 0.55,
        gain: 0.055,
        delay: idx * 0.065,
        type: 'sine',
        filterCutoff: 3200,
      });
    });
  }

  public playDehydrationSnap(): void {
    // Planar peptide lock click + water droplet harmonic release
    this.scheduleTone({
      freq: 440,
      endFreq: 660,
      duration: 0.22,
      gain: 0.075,
      type: 'triangle',
      filterCutoff: 2400,
    });
    this.scheduleTone({
      freq: 1046.5,
      endFreq: 1318.5,
      duration: 0.36,
      gain: 0.05,
      delay: 0.07,
      type: 'sine',
      filterCutoff: 3600,
    });
  }

  public playHydrogenBond(): void {
    // Crystalline i -> i+4 hydrogen-bond shimmer
    this.scheduleTone({
      freq: 783.99,
      duration: 0.42,
      gain: 0.055,
      type: 'sine',
      filterCutoff: 3400,
    });
    this.scheduleTone({
      freq: 1174.66,
      duration: 0.48,
      gain: 0.04,
      delay: 0.05,
      type: 'sine',
      filterCutoff: 4000,
    });
  }

  public playCampBurst(): void {
    // Ascending pentatonic arpeggio representing Gs activation & cAMP burst
    const notes = [523.25, 587.33, 783.99, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      this.scheduleTone({
        freq,
        duration: 0.35,
        gain: 0.05,
        delay: idx * 0.055,
        type: 'sine',
        filterCutoff: 3800,
      });
    });
  }

  public playAiSpawn(): void {
    // Crisp crystalline feedback when [3D_OBJECT] nodes render
    this.scheduleTone({
      freq: 587.33,
      endFreq: 880.0,
      duration: 0.28,
      gain: 0.065,
      type: 'sine',
      filterCutoff: 3400,
    });
    this.scheduleTone({
      freq: 1174.66,
      duration: 0.42,
      gain: 0.045,
      delay: 0.08,
      type: 'triangle',
      filterCutoff: 3200,
    });
  }

  public dispose(): void {
    this.stopAmbient();
    if (this.ctx) {
      const ctx = this.ctx;
      this.ctx = null;
      this.masterGain = null;
      void ctx.close().catch(() => undefined);
    }
  }
}

export const bioAudio = new BioAudioEngine();
