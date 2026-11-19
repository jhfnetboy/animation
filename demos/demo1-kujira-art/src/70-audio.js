// ---- soundtrack: offline synthesized 16s stereo (48 kHz) Lanna River of Mind score, synced to RAIN_DROPS & CUES
async function renderSoundtrack() {
  const SR = 48000, ac = new OfflineAudioContext(2, SR * DURATION, SR);
  const rng = new Rng(11);

  const NOISE = ac.createBuffer(2, SR * DURATION, SR);
  for (let c = 0; c < 2; c++) {
    const d = NOISE.getChannelData(c);
    for (let i = 0; i < d.length; i++) d[i] = rng.next() * 2 - 1;
  }

  // Warm Chiang Mai temple & Ping River evening reverb impulse
  const ir = ac.createBuffer(2, SR * 3, SR);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    let y = 0;
    for (let i = 0; i < d.length; i++) {
      y += ((rng.next() * 2 - 1) - y) * 0.18;
      d[i] = y * Math.exp(-i / (SR * 0.92));
    }
  }

  const master = ac.createGain();
  master.gain.value = 0.72;
  const comp = ac.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 12; comp.ratio.value = 2.6;
  comp.attack.value = 0.025; comp.release.value = 0.38;
  master.connect(comp);
  comp.connect(ac.destination);

  const verb = ac.createConvolver();
  verb.buffer = ir;
  const vg = ac.createGain();
  vg.gain.value = 0.54;
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
  const rawOsc = (type, f, t0, t1, detune = 0) => {
    const a = clamp(t0, 0, DURATION - 0.01), b = clamp(t1, a + 0.01, DURATION);
    const o = ac.createOscillator();
    o.type = type; o.frequency.value = f; o.detune.value = detune;
    o.start(a); o.stop(b);
    return o;
  };
  const osc = (type, f, t0, t1, out, detune = 0) => {
    const o = rawOsc(type, f, t0, t1, detune);
    o.connect(out);
    return o;
  };
  const env = (g, pts) => {
    g.gain.setValueAtTime(pts[0][1], clamp(pts[0][0], 0, DURATION));
    for (const [t, v] of pts.slice(1)) g.gain.linearRampToValueAtTime(v, clamp(t, 0, DURATION));
  };
  const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);

  // ---- Lanna Instruments Synthesizers ----
  // 1) Ranat Ek (Thai bamboo/hardwood xylophone): crisp mallet transient + warm wooden resonator
  const ranatEk = (f, t0, amp, len = 0.58) => {
    const end = Math.min(DURATION, t0 + len);
    if (end <= t0 + 0.02) return;
    const g = gain(0, 0.62);
    const bp = filt('bandpass', clamp(f * 1.15, 220, 4200), 1.35);
    const lp = filt('lowpass', 3800, 0.6);
    bp.connect(lp); lp.connect(g);

    // Hardwood fundamental + characteristic xylophone overtone (2.756x)
    const g1 = ac.createGain(); g1.gain.value = 1.0; g1.connect(lp);
    osc('sine', f, t0, end, g1);

    const g2 = ac.createGain();
    g2.gain.setValueAtTime(0.42, t0);
    g2.gain.exponentialRampToValueAtTime(0.005, Math.min(end, t0 + 0.095));
    g2.connect(lp);
    osc('sine', f * 2.756, t0, Math.min(end, t0 + 0.11), g2);

    // Mallet wood click transient
    const gn = ac.createGain();
    gn.gain.setValueAtTime(0.28, t0);
    gn.gain.exponentialRampToValueAtTime(0.001, Math.min(end, t0 + 0.016));
    gn.connect(bp);
    noise(t0, t0 + 0.02, gn);

    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(amp, t0 + 0.004);
    g.gain.exponentialRampToValueAtTime(amp * 0.008, end);
  };

  // 2) Ching (Thai small temple finger cymbals): alternating open "Ching" and damped "Chap"
  const ching = (t0, open = true, amp = 0.016) => {
    const len = open ? 0.52 : 0.085;
    const end = Math.min(DURATION, t0 + len);
    if (end <= t0 + 0.02) return;
    const g = gain(0, open ? 0.55 : 0.25);
    const hp = filt('highpass', 2200, 0.7);
    hp.connect(g);
    const partials = open ? [[2640, 0.45], [4180, 0.35], [6220, 0.25], [8260, 0.14]]
                          : [[2720, 0.40], [4310, 0.35], [6480, 0.28]];
    for (const [pf, w] of partials) {
      const pg = ac.createGain(); pg.gain.value = w; pg.connect(hp);
      osc('sine', pf, t0, end, pg);
    }
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(amp, t0 + 0.002);
    g.gain.exponentialRampToValueAtTime(amp * 0.01, end);
  };

  // 3) Khong Wong (Thai circular bronze gong chimes): warm mellow bronze bell harmony
  const khongWong = (f, t0, amp, len = 1.65) => {
    const end = Math.min(DURATION, t0 + len);
    if (end <= t0 + 0.03) return;
    const g = gain(0, 0.78);
    const lp = filt('lowpass', 1750, 0.55);
    lp.connect(g);
    for (const [m, w, det] of [[1, 1.0, 0], [2, 0.32, 3], [2.98, 0.12, -4]]) {
      const pg = ac.createGain(); pg.gain.value = w; pg.connect(lp);
      osc('sine', f * m, t0, end, pg, det);
    }
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(amp, t0 + 0.018);
    g.gain.exponentialRampToValueAtTime(amp * 0.012, end);
  };

  // 4) Temple Gong (Lanna large bronze gong): deep resonant bloom for Act 4 emergence
  const templeGong = (t0, f0 = 110, amp = 0.075, len = 3.5) => {
    const end = Math.min(DURATION, t0 + len);
    if (end <= t0 + 0.05) return;
    const g = gain(0, 0.92);
    const lp = filt('lowpass', 920, 0.6);
    lp.connect(g);
    for (const [m, w, det] of [[0.5, 0.85, 0], [1.0, 1.0, -3], [1.0, 0.8, 4], [1.49, 0.42, 0], [2.14, 0.24, -5], [2.95, 0.12, 6]]) {
      const pg = ac.createGain(); pg.gain.value = w; pg.connect(lp);
      osc('sine', f0 * m, t0, end, pg, det);
    }
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(amp, t0 + 0.07);
    g.gain.exponentialRampToValueAtTime(amp * 0.015, end);
  };

  // 5) Khlui (Lanna bamboo flute): warm expressive melody with gentle vibrato & breath air
  const khlui = (fFrom, fTo, t0, amp, len = 1.1) => {
    const end = Math.min(DURATION, t0 + len);
    if (end <= t0 + 0.04) return;
    const g = gain(0, 0.82);
    const lp = filt('lowpass', 2400, 0.6);
    lp.connect(g);

    const o1 = osc('sine', fFrom, t0, end, lp);
    const g2 = ac.createGain(); g2.gain.value = 0.18; g2.connect(lp);
    const o2 = osc('triangle', fFrom, t0, end, g2);

    for (const o of [o1, o2]) {
      o.frequency.setValueAtTime(fFrom, t0);
      o.frequency.exponentialRampToValueAtTime(fTo, Math.min(end, t0 + 0.14));
    }
    // Gentle 5.2 Hz vibrato
    const vib = rawOsc('sine', 5.2, t0, end);
    const vg2 = ac.createGain(); vg2.gain.value = 16;
    vib.connect(vg2); vg2.connect(o1.detune); vg2.connect(o2.detune);

    // Soft breath air puff
    const airG = ac.createGain(); airG.gain.value = 0.08;
    const airBp = filt('bandpass', fTo * 1.8, 1.8);
    airBp.connect(airG); airG.connect(lp);
    noise(t0, Math.min(end, t0 + 0.28), airBp);

    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(amp, t0 + 0.11);
    g.gain.setValueAtTime(amp * 0.88, Math.max(t0 + 0.12, end - 0.28));
    g.gain.exponentialRampToValueAtTime(amp * 0.015, end);
  };

  // ---- 1. Continuous gentle Ping River current & Chiang Mai evening breeze
  {
    const g = gain(0, 0.28), f = filt('lowpass', 430);
    f.connect(g); noise(0, DURATION, f);
    env(g, [[0, 0.0], [0.6, 0.05], [3.0, 0.044], [6.0, 0.052], [9.0, 0.068], [12.5, 0.058], [15.0, 0.048], [16.0, 0.018]]);
  }
  {
    const g = gain(0.0055), f = filt('highpass', 3600);
    f.connect(g); noise(0, DURATION, f);
  }

  // ---- 2. Act 1 (0-3s): Ranat Ek Krathong sparks + water-drop ripples synced to RAIN_DROPS
  const LANNA_PENTA = [76, 78, 81, 83, 85, 88, 90, 93]; // A major Lanna pentatonic (E5-A6)
  RAIN_DROPS.forEach((d, idx) => {
    const fr = NOTE(LANNA_PENTA[(idx * 3 + d.shapeType) % LANNA_PENTA.length]);
    // Crisp wooden Ranat Ek drop chime
    ranatEk(fr, d.tHit, 0.022, 0.45);
    // Subtle water-surface bubble shimmer on krathong touch
    const g = gain(0, 0.65);
    const o = osc('sine', fr * 0.5, d.tHit, d.tHit + 0.36, g);
    o.frequency.setValueAtTime(fr * 0.46, d.tHit);
    o.frequency.exponentialRampToValueAtTime(fr * 0.52, d.tHit + 0.035);
    g.gain.setValueAtTime(0, d.tHit);
    g.gain.linearRampToValueAtTime(0.014, d.tHit + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0004, clamp(d.tHit + 0.34, 0, DURATION));
  });

  // ---- 3. Ching temple cymbal pulse across Acts 1-3 & Act 5
  const CHING_BEATS = [
    [0.50, true], [1.25, false], [2.00, true], [2.75, false],
    [3.35, true], [4.10, false], [4.85, true], [5.60, false],
    [6.25, true], [6.95, false], [7.65, true], [8.35, false],
    [13.40, true], [14.20, false], [15.00, true],
  ];
  for (const [bt, open] of CHING_BEATS) ching(bt, open, open ? 0.013 : 0.011);

  // ---- 4. Lanna Pentatonic Melody: Ranat Ek (Acts 1-2) + Khong Wong (Act 3) + Heroic Resolution (Acts 4-5)
  const MELODY_RANAT = [
    // Act 1: Krathong Word Sparks (Lanna pentatonic phrase in A: E-C#-B-C#-E)
    [0.38, 76, 0.034], [0.92, 73, 0.030], [1.45, 71, 0.030], [1.98, 73, 0.032], [2.52, 76, 0.035],
    // Act 2: Yi Peng Star Clusters ascending lantern arpeggio (A-B-C#-E-F#-A-F#)
    [3.08, 69, 0.036], [3.50, 71, 0.035], [3.92, 73, 0.038], [4.36, 76, 0.040], [4.80, 78, 0.042], [5.25, 81, 0.044], [5.68, 78, 0.036],
  ];
  for (const [t0, n, a] of MELODY_RANAT) ranatEk(NOTE(n), t0, a, 0.72);

  // Act 3 (6-9s): Khong Wong warm bronze melody + shimmering lotus searchlight sweeps
  const MELODY_KHONG = [
    [6.10, 76, 0.036], [6.48, 81, 0.040], [6.85, 78, 0.038], [7.22, 76, 0.036],
    [7.60, 81, 0.042], [8.00, 83, 0.044], [8.42, 85, 0.046], [8.78, 88, 0.044],
  ];
  for (const [t0, n, a] of MELODY_KHONG) khongWong(NOTE(n), t0, a, 1.5);

  // Act 4-5 melodic bells & Khong Wong bass support (A major pentatonic)
  const MELODY_BELL = [
    [9.45, 81, 0.042], [9.95, 85, 0.046], [10.45, 88, 0.050], [11.05, 85, 0.044], [11.65, 81, 0.040], [12.35, 78, 0.038],
    [13.10, 76, 0.040], [13.70, 78, 0.038], [14.30, 81, 0.044], [15.00, 85, 0.040],
  ];
  for (const [t0, n, a] of MELODY_BELL) khongWong(NOTE(n), t0, a, 1.9);

  // Warm bronze bass notes (Khong Wong lower octaves)
  const BASS = [
    [0.38, [57, 64]], [2.40, [52, 59]],
    [3.08, [54, 61]], [4.80, [50, 57]],
    [6.10, [52, 59, 64]], [7.60, [57, 64, 69]],
    [9.10, [45, 57, 64]], [10.80, [50, 57, 62]], [12.00, [52, 59, 64]],
    [13.00, [45, 57, 64]], [14.50, [45, 57, 69]],
  ];
  for (const [t0, notes] of BASS) for (const n of notes) khongWong(NOTE(n), t0, 0.020, 2.3);

  // ---- 5. Warm evolving Lanna pentatonic string pad across all 5 acts
  {
    const g = gain(0, 0.88), f = filt('lowpass', 860, 0.45);
    f.connect(g);
    const chords = [
      [0.2, 3.0, [57, 64, 69, 73]],
      [3.0, 6.0, [54, 61, 66, 69]],
      [6.0, 9.2, [52, 59, 64, 69]],
      [9.2, 12.8, [50, 57, 62, 69, 73]],
      [12.8, 16.0, [45, 57, 64, 69, 73]],
    ];
    for (const [t0, t1, notes] of chords) {
      for (const n of notes) for (const dt of [-4, 4]) osc('sawtooth', NOTE(n), t0, Math.min(DURATION, t1 + 0.35), f, dt);
    }
    f.frequency.setValueAtTime(600, 0.2);
    f.frequency.linearRampToValueAtTime(1020, 6.5);
    f.frequency.linearRampToValueAtTime(1450, 10.8);
    f.frequency.linearRampToValueAtTime(1080, 15.8);
    env(g, [[0.2, 0], [1.4, 0.005], [3.5, 0.007], [6.5, 0.009], [9.6, 0.012], [11.2, 0.013], [13.5, 0.011], [15.5, 0.007], [16.0, 0]]);
  }

  // ---- 6. Act 3 Golden Lotus Searchlight harmonic shimmer & Khong Wong resonance (6.05s - 9.2s)
  {
    const g = gain(0, 0.85), bp = filt('bandpass', 1320, 2.2);
    bp.connect(g);
    osc('triangle', NOTE(81), CUES.beamStart, 9.3, bp);
    osc('sine', NOTE(88), CUES.beamLock, 9.3, bp);
    env(g, [[CUES.beamStart, 0], [CUES.beamLock, 0.015], [8.5, 0.022], [9.3, 0]]);
    // Lotus beam lock shimmer chimes
    for (const [ts, nn] of [[6.75, 88], [7.35, 90], [8.10, 93]]) {
      khongWong(NOTE(nn), ts, 0.018, 1.2);
    }
  }

  // ---- 7. Act 4 Sacred White Elephant: Lanna Temple Gong + Elephant Trumpet + Breach & Crash Water FX
  // Deep Lanna temple gong on emergence bulge
  templeGong(CUES.bulge, 110, 0.072, 3.6);

  // Sacred White Elephant Trumpet (bright rising brassy horn with vibrato flutter & majestic descent)
  {
    const tc = CUES.call;
    const end = Math.min(DURATION, tc + 2.05);
    const g = gain(0, 0.85);
    const fForm = filt('bandpass', 1450, 1.05);
    const fLp = filt('lowpass', 2500, 0.65);
    fForm.connect(fLp);
    fLp.connect(g);

    // Formant sweep mirrors elephant trunk resonance opening up at apex
    fForm.frequency.setValueAtTime(750, tc);
    fForm.frequency.exponentialRampToValueAtTime(1950, tc + 0.52);
    fForm.frequency.exponentialRampToValueAtTime(1250, end);

    // Rich harmonic trumpet reed (sawtooth + triangle) + chest sub-harmonic
    const o1 = osc('sawtooth', 295, tc, end, fForm);
    const o2 = osc('triangle', 295, tc, end, fForm, 7);
    const gSub = ac.createGain(); gSub.gain.value = 0.45; gSub.connect(fLp);
    const oSub = osc('triangle', 147.5, tc, end, gSub);

    for (const [oo, k] of [[o1, 1], [o2, 1], [oSub, 0.5]]) {
      oo.frequency.setValueAtTime(295 * k, tc);
      oo.frequency.exponentialRampToValueAtTime(760 * k, tc + 0.48);
      oo.frequency.linearRampToValueAtTime(720 * k, tc + 0.88);
      oo.frequency.exponentialRampToValueAtTime(430 * k, end);
    }

    // Nasal trunk flutter vibrato (24 Hz modulation)
    const flut = rawOsc('sine', 24, tc, end);
    const fg = ac.createGain(); fg.gain.value = 34;
    flut.connect(fg); fg.connect(o1.detune); fg.connect(o2.detune);

    env(g, [
      [tc, 0],
      [tc + 0.14, 0.048],
      [tc + 0.52, 0.068],
      [tc + 1.05, 0.052],
      [tc + 1.65, 0.022],
      [end, 0],
    ]);
  }

  // Water breach surge, airborne droplets, and heavy river crash splash
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

  // ---- 8. Distant Chiang Mai evening birds in Act 1 & Act 4/5
  for (const [t0, f0] of [[0.65, 1520], [1.45, 1380], [10.45, 1640], [11.15, 1480], [13.75, 1580], [14.35, 1420]]) {
    const g = gain(0, 0.6), o = osc('triangle', f0, t0, t0 + 0.32, g);
    o.frequency.setValueAtTime(f0, t0);
    o.frequency.exponentialRampToValueAtTime(f0 * 0.66, t0 + 0.25);
    env(g, [[t0, 0], [t0 + 0.03, 0.012], [t0 + 0.24, 0.006], [t0 + 0.31, 0]]);
  }

  // ---- 9. Act 5 (13-16s): Doi Suthep Morning Temple Bell & Lanna Khlui Bamboo Flute Finale
  // Warm Khlui pentatonic phrases steering toward Doi Suthep
  khlui(NOTE(76), NOTE(78), 13.08, 0.030, 0.95);
  khlui(NOTE(78), NOTE(81), 13.85, 0.034, 1.05);
  khlui(NOTE(81), NOTE(85), 14.65, 0.036, 1.25);

  // Doi Suthep sacred morning temple bell chimes (13.4s & soft harmonic echo at 14.7s)
  for (const [bt, fr, a] of [[13.4, NOTE(81), 0.030], [13.4, NOTE(93), 0.012], [13.4, NOTE(88), 0.010], [14.7, NOTE(81), 0.016]]) {
    const g = gain(0, 0.92);
    osc('sine', fr, bt, 16.0, g);
    g.gain.setValueAtTime(0, bt);
    g.gain.linearRampToValueAtTime(a, bt + 0.035);
    g.gain.exponentialRampToValueAtTime(a * 0.035, 15.96);
  }

  return ac.startRendering();
}
