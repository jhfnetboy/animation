// ---- colorful sea birds: gliding in Acts 1-3, soaring & circling on breach in Act 4, leading toward lighthouse in Act 5
function buildGulls(scene) {
  const rng = new Rng(31), N = 9;
  const birds = [];
  const white = celMat('#fbfaf5', 70, { gloss: 0 });
  const grey = celMat('#d3dae6', 73, { gloss: 0 });
  const tipPalette = ['#2d6bc4', '#f28b3c', '#3bb8c7', '#e55b69', '#3b3f4a'].map((c, idx) => celMat(c, 71 + idx, { gloss: 0 }));
  const beakMat = celMat('#f2b33d', 77);

  const plan = (pts, depth) => {
    const s = new THREE.Shape(); s.moveTo(...pts[0]);
    for (let i = 1; i < pts.length; i++) pts[i].length === 4 ? s.quadraticCurveTo(...pts[i]) : s.lineTo(...pts[i]);
    const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 8 });
    g.translate(0, 0, -depth / 2); g.rotateX(Math.PI / 2); return g;
  };
  const mirror = (g) => { const m = g.clone(); m.scale(-1, 1, 1); return m; };
  const innerG = plan([[0, -0.13], [0.5, -0.11], [0.5, 0.1], [0.25, 0.16, 0, 0.13]], 0.025);
  const outerG = plan([[0, -0.11], [0.28, -0.09, 0.55, 0.13], [0.3, 0.12], [0, 0.1]], 0.02);
  const tipG = plan([[0.3, -0.05], [0.42, -0.02, 0.555, 0.135], [0.3, 0.125]], 0.026);
  const tailG = plan([[-0.06, 0], [0.06, 0], [0.1, 0.2, 0, 0.22], [-0.1, 0.2, -0.06, 0]], 0.02);
  const bodyG = new THREE.SphereGeometry(0.12, 14, 10); bodyG.scale(0.9, 0.85, 2.3);

  for (let i = 0; i < N; i++) {
    const root = new THREE.Group(); scene.add(root);
    root.add(new THREE.Mesh(bodyG, white));
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 12, 10), white); head.position.set(0, 0.06, -0.3); root.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.13, 8), beakMat); beak.rotation.x = -Math.PI / 2; beak.position.set(0, 0.04, -0.43); root.add(beak);
    const tail = new THREE.Mesh(tailG, white); tail.position.set(0, 0.0, 0.2); root.add(tail);
    const tipMat = tipPalette[i % tipPalette.length];
    const wings = [-1, 1].map((s) => {
      const sh = new THREE.Group(); sh.position.set(s * 0.08, 0.04, -0.05); root.add(sh);
      const pick = (g) => (s > 0 ? g : mirror(g));
      sh.add(new THREE.Mesh(pick(innerG), grey));
      const wr = new THREE.Group(); wr.position.x = s * 0.5; sh.add(wr);
      wr.add(new THREE.Mesh(pick(outerG), grey));
      const end = new THREE.Mesh(pick(tipG), tipMat); end.position.y = 0.001; wr.add(end);
      return { s, sh, wr };
    });
    root.scale.setScalar(1.55);
    birds.push({
      root, wings,
      a0: rng.range(0, Math.PI * 2),
      r: rng.range(10, 20),
      w: rng.range(0.28, 0.45) * (rng.next() < 0.5 ? -1 : 1),
      h: rng.range(9, 17),
      cx: rng.range(-12, 8),
      cz: rng.range(-64, -42),
      ph: rng.next(),
      circlingHeight: rng.range(18, 34),
    });
  }

  const P = new THREE.Vector3(), Q = new THREE.Vector3();
  const place = (b, t, out) => {
    const soar = smooth(invLerp(CUES.breach - 0.15, CUES.breach + 1.2, t)) * (1 - smooth(invLerp(13.0, 14.5, t)));
    const steer = smooth(invLerp(12.8, 16.0, t));
    // Base circling over the mid-ground sea
    const a = b.a0 + b.w * t * (1 + soar * 1.4);
    const rad = b.r * (1 + soar * 0.9);
    const y = lerp(b.h, b.circlingHeight, soar) + Math.sin(t * 1.3 + b.ph * 6) * 0.8;
    out.set(
      lerp(b.cx, WHALE_AT.x, soar) + Math.cos(a) * rad,
      y,
      lerp(b.cz, WHALE_AT.y, soar) + Math.sin(a) * rad * 0.65
    );
    if (steer > 0.01) {
      // In Act 5, birds glide gracefully ahead of the sailing boat toward the distant lighthouse
      const dest = new THREE.Vector3(
        lerp(out.x, LIGHTHOUSE_AT.x * 0.5 + Math.cos(b.a0) * 18, steer),
        lerp(out.y, 13 + b.ph * 8, steer),
        lerp(out.z, LIGHTHOUSE_AT.y * 0.52 + Math.sin(b.a0) * 12, steer)
      );
      out.copy(dest);
    }
    return out;
  };

  return {
    update(st) {
      const t = onTwos(st.t);
      for (const b of birds) {
        place(b, t, P); place(b, t + 0.05, Q);
        b.root.position.copy(P);
        b.root.lookAt(Q.sub(P).negate().add(P));
        const alarm = smooth(invLerp(CUES.breach - 0.2, CUES.breach + 0.4, t)) * (1 - smooth(invLerp(12.6, 13.8, t)));
        const glide = Math.sin(t * 0.7 + b.ph * 6) > 0.35 && alarm < 0.4;
        const beat = glide ? 0.12 : Math.sin(t * (5.5 + 5 * alarm) * Math.PI + b.ph * 6);
        for (const w of b.wings) {
          w.sh.rotation.z = w.s * (0.15 + 0.55 * beat);
          w.wr.rotation.z = w.s * (-0.25 - 0.35 * beat);
        }
        b.root.visible = P.y < 120;
      }
    },
  };
}
