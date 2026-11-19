// ---- performance & 5-act cameras: pure deterministic functions of time (t in 0..16s)
const X0 = WHALE_AT.x, Z0 = WHALE_AT.y;
const CRASH_AT = { t: CUES.crash, x: X0 - 10, z: Z0 + 2 };
const BOAT_BASE = new THREE.Vector2(20, -34);

// Sacred White Elephant (Chang Phueak) breach & dive (Act 4: 8.8s - 13.4s)
// Tuned for majestic tall silhouette (body + raised curled trunk + flaring ears + twin tusks + limbs)
const W_KEYS = {
  y: [[8.8, -42], [9.6, -5], [10.1, 18.5], [10.7, 30.0], [10.95, 31.5], [11.4, 26.0], [12.0, 9.0], [12.7, -11.0], [13.4, -32.0]],
  x: [[8.8, X0 + 16], [9.6, X0 + 13], [10.1, X0 + 6], [10.8, X0 - 4], [11.4, X0 - 13], [12.0, X0 - 22], [12.7, X0 - 30], [13.4, X0 - 38]],
  pitch: [[8.8, 66], [9.6, 62], [10.1, 52], [10.8, 34], [11.4, 8], [12.0, -22], [12.7, -28], [13.4, -32]],
  // Gentle heroic three-quarter tilt showcasing flaring ears, twin tusks, and raised trunk
  roll: [[9.6, 0.04], [10.1, -0.16], [10.8, -0.28], [11.4, -0.32], [12.0, -0.22], [12.7, -0.12], [13.4, -0.04]],
  bend: [[9.6, 0.08], [10.1, 0.14], [10.8, 0.24], [11.4, 0.26], [12.0, 0.16], [12.7, 0.10], [13.4, 0.06]],
  flap: [[9.6, 0.25], [10.3, 0.72], [10.8, 0.90], [11.5, 0.65], [12.2, 0.35], [13.4, 0.20]],
};

function poseAt(t) {
  const tt = onTwos(t);
  return {
    head: new THREE.Vector3(spline(W_KEYS.x, tt), spline(W_KEYS.y, tt), Z0),
    pitch: deg(spline(W_KEYS.pitch, tt)),
    yaw: deg(90),
    roll: spline(W_KEYS.roll, tt),
    bend: spline(W_KEYS.bend, tt),
    flap: spline(W_KEYS.flap, tt),
    stroke: 0.25 + 0.2 * smooth(invLerp(10.6, 11.4, tt)),
    phase: tt * 0.9,
  };
}

function boatStateAt(t) {
  const sail = smooth(invLerp(12.8, 16.0, t));
  const heading = lerp(deg(144), deg(114), smooth(invLerp(12.8, 14.8, t)));
  const dist = sail * 25.0;
  // Integrate smooth heading direction toward Doi Suthep golden chedi (LIGHTHOUSE_AT)
  const avgDir = lerp(deg(144), deg(116), sail * 0.5);
  const pos = new THREE.Vector2(
    BOAT_BASE.x + Math.cos(avgDir) * dist,
    BOAT_BASE.y - Math.sin(avgDir) * dist
  );
  const speed = smooth(invLerp(12.8, 13.8, t));
  return { pos, heading, speed };
}

function camAt(t) {
  const act = actAt(t);
  if (act.id === 'token') {
    const k = invLerp(0.0, 3.0, t);
    return {
      pos: [lerp(28, 25, smooth(k)), lerp(7.4, 6.6, smooth(k)), lerp(-15, -19, smooth(k))],
      look: [lerp(-3, -6, smooth(k)), lerp(3.0, 2.2, smooth(k)), lerp(-55, -58, smooth(k))],
      fov: 40,
    };
  }
  if (act.id === 'embed') {
    const k = invLerp(3.0, 6.0, t);
    return {
      pos: [lerp(25, 13, smooth(k)), lerp(6.6, 4.4, smooth(k)), lerp(-19, -29, smooth(k))],
      look: [lerp(-6, -11, smooth(k)), lerp(2.2, 1.0, smooth(k)), lerp(-58, -62, smooth(k))],
      fov: lerp(40, 43, smooth(k)),
    };
  }
  if (act.id === 'attn') {
    const k = invLerp(6.0, 9.0, t);
    return {
      pos: [lerp(13, 27, smooth(k)), lerp(4.4, 9.6, smooth(k)), lerp(-29, -24, smooth(k))],
      look: [lerp(-11, -7, smooth(k)), lerp(1.0, 0.2, smooth(k)), lerp(-62, -62, smooth(k))],
      fov: lerp(43, 45, smooth(k)),
    };
  }
  if (act.id === 'emerge') {
    const k = invLerp(9.0, 13.0, t);
    const breachShake = Math.exp(-Math.max(0, t - CUES.breach) * 2.4) * (t >= CUES.breach ? 0.32 : 0);
    const crashShake = Math.exp(-Math.max(0, t - CUES.crash) * 2.5) * (t >= CUES.crash ? 0.62 : 0);
    const shake = breachShake + crashShake;
    const look = spline([
      [0.0, [-5, 4.5, -68]],
      [0.18, [-6, 12.5, -70]],
      [0.43, [-9, 18.5, -70]],
      [0.68, [-13, 18.0, -70]],
      [0.85, [-16, 11.5, -68]],
      [1.0, [-14, 9.0, -72]],
    ], k);
    return {
      pos: [lerp(16, 21, smooth(k)) + noise1(t * 11, 1) * shake, 3.2 + noise1(t * 11, 2) * shake * 0.7, lerp(-4, -9, smooth(k))],
      look,
      fov: lerp(46.0, 49.5, smooth(invLerp(0.2, 0.95, k))),
    };
  }
  // Act 5: Sailing to Doi Suthep — right-quarter stern follow shot showing Lanna silk sail, helmsman, wake & golden chedi
  const k = invLerp(13.0, 16.0, t);
  const b = boatStateAt(t);
  return {
    pos: [b.pos.x + lerp(13.5, 11.5, smooth(k)), lerp(5.0, 6.2, smooth(k)), b.pos.y + lerp(8.5, 6.5, smooth(k))],
    look: [lerp(b.pos.x - 8, LIGHTHOUSE_AT.x * 0.36, smooth(k)), lerp(4.2, 6.0, smooth(k)), lerp(b.pos.y - 22, LIGHTHOUSE_AT.y * 0.42, smooth(k))],
    fov: lerp(46, 44, smooth(k)),
  };
}

function stateFor(frame) {
  const t = clamp(frame / FPS, 0, DURATION);
  const act = actAt(t);
  const st = { frame, t, act, lt: t - act.start, d: act.end - act.start };
  st.cam = camAt(t);
  st.pose = poseAt(t);
  st.boat = boatStateAt(t);
  st.whaleVisible = t >= 8.8 && t <= 13.45;
  st.whaleEmergence = smooth(invLerp(9.3, 9.9, t)) * (1 - smooth(invLerp(11.3, 12.2, t)));

  // Impact flashes & soft paper fade at film start/end
  st.flash = (t >= CUES.crash && t < CUES.crash + 2 / FPS ? 0.50 : 0)
           + (t >= CUES.breach && t < CUES.breach + 1 / FPS ? 0.25 : 0);
  const fadeIn = t < 0.28 ? 1 - smooth(t / 0.28) : 0;
  const fadeOut = t > 15.55 ? smooth(invLerp(15.55, 16.0, t)) * 0.55 : 0;
  st.fade = Math.max(fadeIn, fadeOut);
  return st;
}
