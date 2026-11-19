// ---- distant destination: Chiang Mai Doi Suthep lush mountains, Golden Lanna Chedi & Tiered Vihara Pavilions
function buildLighthouse(scene) {
  const root = new THREE.Group();
  root.position.set(LIGHTHOUSE_AT.x, 0, LIGHTHOUSE_AT.y);
  root.rotation.y = 0.28; // face sea bay & camera gracefully
  scene.add(root);

  const hillDeepMat = celMat('#2a5b4f', 40, { gloss: 0.0, mode: 5 });
  const hillMidMat = celMat('#366e59', 40, { gloss: 0.0, mode: 5 });
  const hillBrightMat = celMat('#407c5e', 40, { gloss: 0.0, mode: 5 });
  const cliffMat = celMat('#626c74', 41, { gloss: 0.0 });
  const whiteBaseMat = celMat('#f6f2e8', 42, { gloss: 0.18, mode: 3 }); // Lanna ivory-gold molding in cel_fs
  const wallMat = celMat('#f2ede0', 43, { gloss: 0.05 });
  const goldMat = celMat('#f4c542', 44, { gloss: 0.92, glow: '#ffbf38', glowAmt: 0.22 });
  const deepGoldMat = celMat('#d4981e', 46, { gloss: 0.85, glow: '#ffa826', glowAmt: 0.10 });
  const roofMat = celMat('#9b2226', 45, { gloss: 0.45 });
  const doorGlowMat = celMat('#ffdf8a', 126, { gloss: 0.2, glow: '#ffb84d', glowAmt: 0.75 });
  const orbMat = celMat('#fff8cf', 125, { gloss: 1.0, glow: '#ffd966', glowAmt: 1.8 });

  const add = (geo, mat, x = 0, y = 0, z = 0, parent = root) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    parent.add(m);
    return m;
  };

  // ---- 1. Lush overlapping Doi Suthep mountain hills
  function makeLushHill(rx, h, rz, seed) {
    const g = new THREE.SphereGeometry(1, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const vx = pa.getX(i), vy = pa.getY(i), vz = pa.getZ(i);
      const ridge = 1 + 0.14 * noise1(vx * 3.2 + vz * 2.7, seed) + 0.07 * noise1(vx * 6.5 - vz * 5.0, seed + 7);
      const slope = vy * (0.85 + 0.20 * Math.pow(vy, 0.7));
      pa.setXYZ(i, vx * rx * ridge, slope * h * ridge, vz * rz * ridge);
    }
    g.computeVertexNormals();
    return g;
  }

  add(makeLushHill(35, 8.0, 23, 1), hillBrightMat, 0, -0.4, -2);
  add(makeLushHill(36, 16.0, 25, 2), hillDeepMat, -28, -0.4, -14);
  add(makeLushHill(30, 12.2, 22, 3), hillMidMat, 29, -0.4, -8);
  add(makeLushHill(22, 7.2, 16, 4), hillDeepMat, -47, -0.4, 5);
  add(makeLushHill(20, 6.4, 15, 5), hillMidMat, 45, -0.4, 6);

  // Temple rocky promontory & octagonal white sanctuary terrace
  add(new THREE.CylinderGeometry(13.5, 17.5, 5.8, 10), cliffMat, 0, 2.7, 0);
  add(new THREE.CylinderGeometry(11.6, 12.8, 1.25, 8), whiteBaseMat, 0, 6.22, 0);

  // Naga staircase descending the front slope toward the sea
  const stair = add(new THREE.BoxGeometry(2.3, 0.45, 11.2), wallMat, 0, 3.8, 13.6);
  stair.rotation.x = 0.47;
  for (const s of [-1, 1]) {
    const rail = add(new THREE.BoxGeometry(0.24, 0.52, 11.2), goldMat, s * 1.15, 4.15, 13.6);
    rail.rotation.x = 0.47;
    add(new THREE.SphereGeometry(0.32, 10, 8), goldMat, s * 1.15, 1.9, 18.6);
  }

  // ---- 2. Central Golden Lanna Chedi (Pagoda) on top of terrace (y = 6.85)
  const chedi = new THREE.Group();
  chedi.position.set(0, 6.85, 0);
  root.add(chedi);

  // Three-tiered octagonal white Lanna lotus base (local y = 0..2.40)
  add(new THREE.CylinderGeometry(4.65, 5.15, 0.85, 8), whiteBaseMat, 0, 0.42, 0, chedi);
  add(new THREE.CylinderGeometry(3.95, 4.35, 0.85, 8), whiteBaseMat, 0, 1.26, 0, chedi);
  add(new THREE.CylinderGeometry(3.35, 3.65, 0.72, 8), whiteBaseMat, 0, 2.04, 0, chedi);

  // Four corner miniature golden satellite stupas guarding the main Chedi
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const cx = sx * 2.95, cz = sz * 2.95;
      add(new THREE.CylinderGeometry(0.45, 0.58, 0.65, 8), whiteBaseMat, cx, 1.15, cz, chedi);
      add(new THREE.ConeGeometry(0.42, 1.35, 8), goldMat, cx, 2.15, cz, chedi);
      add(new THREE.SphereGeometry(0.12, 8, 6), orbMat, cx, 2.90, cz, chedi);
    }
  }

  // Multi-stepped golden indented plinth (local y = 2.40..4.50)
  add(new THREE.CylinderGeometry(2.95, 3.15, 0.62, 8), goldMat, 0, 2.71, 0, chedi);
  add(new THREE.CylinderGeometry(2.68, 2.78, 0.16, 8), deepGoldMat, 0, 3.10, 0, chedi);
  add(new THREE.CylinderGeometry(2.42, 2.60, 0.60, 8), goldMat, 0, 3.48, 0, chedi);
  add(new THREE.CylinderGeometry(2.15, 2.25, 0.16, 8), deepGoldMat, 0, 3.86, 0, chedi);
  add(new THREE.CylinderGeometry(1.98, 2.12, 0.56, 8), goldMat, 0, 4.22, 0, chedi);

  // Bell-shaped Golden Lanna Anda via LatheGeometry (local y = 4.50..8.50)
  const bellPts = [
    [0.0, 0.0], [1.94, 0.0], [2.08, 0.25], [1.86, 0.65],
    [1.98, 1.32], [1.74, 2.15], [1.26, 3.00], [0.84, 3.55],
    [0.98, 3.74], [0.74, 4.00], [0.0, 4.00],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const bellGeo = new THREE.LatheGeometry(bellPts, 24);
  add(bellGeo, goldMat, 0, 4.50, 0, chedi);
  add(new THREE.CylinderGeometry(1.06, 1.06, 0.18, 8), deepGoldMat, 0, 8.20, 0, chedi);

  // Nine-tiered golden Chatra umbrella spire (local y = 8.50..12.35)
  add(new THREE.CylinderGeometry(0.09, 0.26, 3.85, 12), goldMat, 0, 10.42, 0, chedi);
  for (let i = 0; i < 9; i++) {
    const k = i / 8;
    const rad = lerp(1.12, 0.26, k);
    const ty = 8.70 + i * 0.41;
    add(new THREE.CylinderGeometry(rad * 0.78, rad, 0.16, 16), i % 2 === 0 ? goldMat : deepGoldMat, 0, ty, 0, chedi);
  }

  // Radiant golden crystal orb at y_world = 6.85 + 12.80 = 19.65 (aligns with Act 5 beam origin y = 19.5)
  add(new THREE.CylinderGeometry(0.28, 0.16, 0.22, 12), goldMat, 0, 12.38, 0, chedi);
  add(new THREE.SphereGeometry(0.62, 16, 12), orbMat, 0, 12.80, 0, chedi);
  add(new THREE.ConeGeometry(0.14, 0.82, 10), goldMat, 0, 13.68, 0, chedi);

  // ---- 3. Two classic Lanna Tiered Vihara Pavilions (crimson tiled roofs & golden Chofah finials)
  function gableRoofGeo(halfW, h, length) {
    const sh = new THREE.Shape();
    sh.moveTo(-halfW, 0);
    sh.lineTo(0, h);
    sh.lineTo(halfW, 0);
    sh.lineTo(halfW - 0.16, -0.14);
    sh.lineTo(0, h - 0.22);
    sh.lineTo(-halfW + 0.16, -0.14);
    sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: length, bevelEnabled: false });
    g.translate(0, 0, -length * 0.5);
    return g;
  }

  function addVihara(x, z, rotY, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, 6.85, z);
    g.rotation.y = rotY;
    g.scale.setScalar(scale);
    root.add(g);

    // Base & white hall walls with warm glowing sanctuary doorway
    add(new THREE.BoxGeometry(3.8, 0.6, 5.2), whiteBaseMat, 0, 0.3, 0, g);
    add(new THREE.BoxGeometry(2.9, 2.0, 4.2), wallMat, 0, 1.5, 0, g);
    add(new THREE.BoxGeometry(1.1, 1.4, 0.14), doorGlowMat, 0, 1.35, 2.12, g);

    // Three cascading Lanna gable roof tiers
    const tiers = [
      { y: 2.30, w: 2.35, h: 1.45, l: 5.0 },
      { y: 2.95, w: 1.85, h: 1.35, l: 4.3 },
      { y: 3.55, w: 1.32, h: 1.15, l: 3.5 },
    ];
    for (let i = 0; i < tiers.length; i++) {
      const tr = tiers[i];
      add(gableRoofGeo(tr.w, tr.h, tr.l), roofMat, 0, tr.y, 0, g);
      // Golden ridge crest & front/back Chofah horn finials
      add(new THREE.BoxGeometry(0.14, 0.16, tr.l + 0.12), goldMat, 0, tr.y + tr.h + 0.04, 0, g);
      for (const end of [-1, 1]) {
        const ch = add(new THREE.ConeGeometry(0.11, 0.92, 6), goldMat, 0, tr.y + tr.h + 0.36, end * (tr.l * 0.5 + 0.1), g);
        ch.rotation.x = end * 0.38;
      }
    }
  }

  addVihara(-7.8, 1.2, 0.32, 0.95);
  addVihara(7.9, 1.0, -0.32, 0.95);

  // ---- 4. Four golden ceremonial 7-tier Chatra umbrellas along front courtyard rim
  for (const [ux, uz] of [[-4.8, 7.2], [4.8, 7.2], [-6.8, 5.4], [6.8, 5.4]]) {
    add(new THREE.CylinderGeometry(0.05, 0.07, 2.6, 8), goldMat, ux, 8.15, uz);
    for (let t = 0; t < 5; t++) {
      const r = lerp(0.46, 0.16, t / 4);
      add(new THREE.CylinderGeometry(r * 0.7, r, 0.10, 10), goldMat, ux, 8.45 + t * 0.24, uz);
    }
  }

  return {
    root,
    update(st) {
      const act5 = smooth(invLerp(12.6, 13.8, st.t));
      const wave = Math.sin(st.t * 2.2);
      const pulse = 0.25 + act5 * (1.8 + 0.45 * wave);
      orbMat.uniforms.uGlowAmt.value = pulse;
      goldMat.uniforms.uGlowAmt.value = 0.14 + act5 * (0.36 + 0.12 * wave);
      doorGlowMat.uniforms.uGlowAmt.value = 0.35 + act5 * 0.75;
    },
  };
}
