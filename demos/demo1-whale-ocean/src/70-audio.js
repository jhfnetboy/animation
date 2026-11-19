// ---- soundtrack: offline synthesized 16s stereo (48 kHz), tightly synced to RAIN_DROPS & CUES
async function renderSoundtrack() {
  const SR = 48000, ac = new OfflineAudioContext(2, SR * DURATION, SR);
  const rng = new Rng(11);

  const NOISE = ac.createBuffer(2, SR * DURATION, SR);
  for (let c = 0; c < 2; c++) {
    const d = NOISE.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = rng.next() * 2 - 1;
  }

  // Warm concert reverb impulse
  const ir = ac.createBuffer(2, SR * 3, SR);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    let y = 0;
    for (let i = 0; i < d.length; i++) {
      y += ((rng.next() * 2 - 1) - y) * 0.2;
      d[i] = y * Math.exp(-i / (SR * 0.85));
    }
  }

  const master = ac.createGain();
  master.gain.value = 0.72;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 2.5;
  comp.attack.value = 0.03; comp.release.value = 0.4;
  master.connect(comp);
  comp.connect(ac.destination);

  const verb = ac.createConvolver();
  verb.buffer = ir;
  const vg = ac.createGain();
  vg.gain.value = 0.52;
  verb.connect(vg);
  vg.connect(master);

  master.gain.setValueAtTime(0.0, 0);
  master.gain.linearRampToValueAtTime(0.72, 0.35);
  master.gain.setValueAtTime(0.72, 15.3);
  master.gain.linearRampToValueAtTime(0.0, DURATION);

  const gain = (v, wet = 0) => {
    const g = ac.createGain();
    g.gain.value = v;
    g.connect(master);
    if (wet) { const s = ac.createGain(); s.gain.value = wet; g.connect(s); s.connect(verb); }
    return g;
  };
  const filt = (type, f, q = 0.7) => {
    const b = ac.createBiquadFilter();
    b.type = type; b.frequency.value = f; b.Q.value = q;
    return b;
  };
  const noise = (t0, t1, out) => {
    const a = clamp(t0, 0, DURATION - 0.01), b = clamp(t1, a + 0.01, DURATION);
    const s = ac.createBufferSource();
    s.buffer = NOISE; s.connect(out); s.start(a, a); s.stop(b);
    return s;
  };
  const osc = (type, f, t0, t1, out, detune = 0) => {
    const a = clamp(t0, 0, DURATION - 0.01), b = clamp(t1, a + 0.01, DURATION);
    const o = ac.createOscillator();
    o.type = type; o.frequency.value = f; o.detune.value = detune;
    o.connect(out); o.start(a); o.stop(b);
    return o;
  };
  const env = (g, pts) => {
    g.gain.setValueAtTime(pts[0][1], clamp(pts[0][0], 0, DURATION));
    for (const [t, v] of pts.slice(1)) g.gain.linearRampToValueAtTime(v, clamp(t, 0, DURATION));
  };
  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // ---- 1. Continuous gentle ocean swell & sea breeze
  {
    const g = gain(0, 0.25), f = filt('lowpass', 480);
    f.connect(g); noise(0, DURATION, f);
    env(g, [[0, 0.0], [0.6, 0.055], [3.0, 0.045], [6.0, 0.055], [9.0, 0.07], [12.5, 0.06], [15.0, 0.05], [16.0, 0.02]]);
  }
  {
    const g = gain(0.006), f = filt('highpass', 3800);
    f.connect(g); noise(0, DURATION, f);
  }

  // ---- 2. Act 1 (0-3s): Crystal water-drop chimes synced to RAIN_DROPS impacts
  const PENTA = [76, 78, 81, 83, 85, 88, 90, 93]; // A major pentatonic high notes
  RAIN_DROPS.forEach((d, idx) => {
    const fr = NOTE(PENTA[(idx * 3 + d.shapeType) % PENTA.length]);
    const g = gain(0, 0.75);
    const o = osc('sine', fr, d.tHit, d.tHit + 0.65, g);
    // Subtle bubble pitch bend upward on hit
    o.frequency.setValueAtTime(fr * 0.94, d.tHit);
    o.frequency.exponentialRampToValueAtTime(fr, d.tHit + 0.03);
    g.gain.setValueAtTime(0, d.tHit);
    g.gain.linearRampToValueAtTime(0.028, d.tHit + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0004, clamp(d.tHit + 0.6, 0, DURATION));
  });

  // ---- 3. Soft felt piano melody across all 5 acts (A major)
  const piano = (f, t0, a, len = 2.0) => {
    const end = Math.min(DURATION, t0 + len);
    if (end <= t0 + 0.02) return;
    const g = gain(0, 0.62), lp = filt('lowpass', 2200);
    lp.connect(g);
    for (const [m, w] of [[1, 1], [2, 0.28], [3, 0.07]]) {
      const gg = ac.createGain();
      gg.gain.value = w; gg.connect(lp);
      osc('sine', f * m, t0, end, gg);
    }
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(a, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(a * 0.01, end);
  };

  const MELODY = [
    // Act 1 gentle curiosity
    [0.4, 76, 0.036], [1.1, 73, 0.032], [1.8, 71, 0.032], [2.4, 73, 0.034],
    // Act 2 semantic clustering arpeggio
    [3.1, 69, 0.038], [3.55, 73, 0.038], [4.0, 76, 0.04], [4.45, 78, 0.04], [4.9, 81, 0.044], [5.4, 78, 0.038],
    // Act 3 attention beam sweep & lock
    [6.1, 76, 0.042], [6.45, 81, 0.045], [6.8, 80, 0.045], [7.2, 76, 0.04], [7.6, 81, 0.048], [8.05, 83, 0.048], [8.5, 85, 0.05],
    // Act 4 whale emergence soar & splash resolve
    [9.4, 81, 0.052], [9.8, 85, 0.054], [10.3, 88, 0.058], [10.8, 85, 0.052], [11.3, 83, 0.048], [11.8, 81, 0.048], [12.35, 78, 0.045],
    // Act 5 horizon steering home
    [13.0, 76, 0.048], [13.5, 78, 0.046], [14.0, 81, 0.05], [14.6, 85, 0.048], [15.15, 81, 0.042],
  ];
  for (const [t0, n, a] of MELODY) piano(NOTE(n), t0, a, 2.2);

  // Bass / harmony piano chords
  const BASS = [
    [0.4, [57, 64]], [2.4, [52, 59]],
    [3.1, [54, 61]], [4.9, [50, 57]],
    [6.1, [52, 59, 64]], [7.6, [57, 64, 69]],
    [9.4, [45, 57, 64]], [10.8, [50, 57, 62]], [12.0, [52, 59, 64]],
    [13.0, [45, 57, 64]], [14.6, [45, 57, 69]],
  ];
  for (const [t0, notes] of BASS) for (const n of notes) piano(NOTE(n), t0, 0.026, 2.5);

  // ---- 4. Warm evolving string pad across the 5 acts
  {
    const g = gain(0, 0.88), f = filt('lowpass', 850, 0.45);
    f.connect(g);
    const chords = [
      [0.2, 3.0, [57, 64, 69, 73]],
      [3.0, 6.0, [54, 61, 66, 69]],
      [6.0, 9.2, [52, 59, 64, 68]],
      [9.2, 12.8, [50, 57, 62, 66, 73]],
      [12.8, 16.0, [45, 57, 64, 69, 73]],
    ];
    for (const [t0, t1, notes] of chords) {
      for (const n of notes) for (const dt of [-4, 4]) osc('sawtooth', NOTE(n), t0, Math.min(DURATION, t1 + 0.35), f, dt);
    }
    f.frequency.setValueAtTime(620, 0.2);
    f.frequency.linearRampToValueAtTime(1050, 6.5);
    f.frequency.linearRampToValueAtTime(1450, 10.8);
    f.frequency.linearRampToValueAtTime(1100, 15.8);
    env(g, [[0.2, 0], [1.4, 0.005], [3.5, 0.007], [6.5, 0.009], [9.6, 0.012], [11.2, 0.013], [13.5, 0.011], [15.5, 0.007], [16.0, 0]]);
  }

  // ---- 5. Act 3 Searchlight harmonic shimmer (6.05s - 9.2s)
  {
    const g = gain(0, 0.85), bp = filt('bandpass', 1200, 2.5);
    bp.connect(g);
    osc('triangle', NOTE(81), CUES.beamStart, 9.3, bp);
    osc('sine', NOTE(88), CUES.beamLock, 9.3, bp);
    env(g, [[CUES.beamStart, 0], [CUES.beamLock, 0.014], [8.5, 0.02], [9.3, 0]]);
  }

  // ---- 6. Act 4 Whale Call, Breach Swell, Water Patter & Crash Whoosh
  {
    const g = gain(0, 1.0), f = filt('lowpass', 900);
    f.connect(g);
    const tc = CUES.call;
    const o = osc('sine', 175, tc, tc + 1.8, f), o2 = osc('sine', 87.5, tc, tc + 1.8, f);
    for (const [oo, k] of [[o, 1], [o2, 0.5]]) {
      oo.frequency.setValueAtTime(175 * k, tc);
      oo.frequency.linearRampToValueAtTime(265 * k, tc + 0.75);
      oo.frequency.linearRampToValueAtTime(215 * k, tc + 1.7);
    }
    env(g, [[tc, 0], [tc + 0.4, 0.05], [tc + 1.1, 0.045], [tc + 1.75, 0.0]]);
  }

  const B = CUES.breach, C = CUES.crash;
  {
    const g = gain(0, 0.45), f = filt('bandpass', 500, 0.7);
    f.connect(g); noise(B - 0.3, C, f);
    f.frequency.setValueAtTime(420, B - 0.3);
    f.frequency.linearRampToValueAtTime(1150, B + 0.75);
    f.frequency.linearRampToValueAtTime(800, C);
    env(g, [[B - 0.3, 0], [B + 0.25, 0.11], [B + 1.1, 0.08], [C - 0.1, 0.04], [C, 0.02]]);
  }
  for (let i = 0; i < 28; i++) {
    const t0 = B + 0.5 + rng.next() * 1.6, g = gain(0, 0.4), f = filt('bandpass', 1800 + rng.next() * 1600, 2);
    f.connect(g); noise(t0, t0 + 0.08, f);
    env(g, [[t0, 0], [t0 + 0.006, 0.02 + rng.next() * 0.02], [t0 + 0.08, 0]]);
  }
  {
    const g = gain(0, 0.5), f = filt('lowpass', 720, 0.5);
    f.connect(g); noise(C - 0.05, C + 1.9, f);
    f.frequency.setValueAtTime(720, C);
    f.frequency.linearRampToValueAtTime(360, C + 1.3);
    env(g, [[C - 0.05, 0], [C + 0.18, 0.13], [C + 0.7, 0.09], [C + 1.5, 0.025], [C + 1.9, 0]]);
  }
  {
    const g = gain(0), o = osc('sine', 82, C, C + 1.2, g);
    o.frequency.linearRampToValueAtTime(60, C + 1.0);
    env(g, [[C, 0], [C + 0.15, 0.05], [C + 1.15, 0]]);
  }

  // ---- 7. Distant sea birds in Act 1 & Act 4/5
  for (const [t0, f0] of [[0.6, 1520], [1.4, 1380], [10.4, 1640], [11.1, 1480], [13.7, 1580], [14.3, 1420]]) {
    const g = gain(0, 0.6), o = osc('triangle', f0, t0, t0 + 0.32, g);
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.66, t0 + 0.25);
    env(g, [[t0, 0], [t0 + 0.03, 0.013], [t0 + 0.24, 0.007], [t0 + 0.31, 0]]);
  }

  // ---- 8. Act 5 gentle beacon bell note
  for (const [fr, a] of [[NOTE(81), 0.028], [NOTE(93), 0.012]]) {
    const g = gain(0, 0.9);
    osc('sine', fr, 13.4, 16.0, g);
    g.gain.setValueAtTime(0, 13.4);
    g.gain.linearRampToValueAtTime(a, 13.44);
    g.gain.exponentialRampToValueAtTime(a * 0.04, 15.95);
  }

  return ac.startRendering();
}
