// ---- exploration boat: hull, wheelhouse, searchlight turret, young helmsman silhouette & deployable main sail
const celMat = (color, id, extra = {}) => shaderMat('cel_vs', 'cel_fs', {
  ...U,
  uColor: { value: new THREE.Color(color) },
  uGlow: { value: new THREE.Color(extra.glow || '#000000') },
  uGlowAmt: { value: extra.glowAmt ?? 0 },
  uId: { value: id },
  uGloss: { value: extra.gloss ?? 0.6 },
  uMode: { value: extra.mode ?? 0 },
}, { side: THREE.DoubleSide });

const HULL_X0 = -5.6, HULL_X1 = 6.4, BEAM = 1.75, BULWARK = 0.38, BW_T = 0.07;
const hullU = (x) => clamp((x - HULL_X0) / (HULL_X1 - HULL_X0));
const halfBeam = (u) => u < 0.4 ? BEAM * lerp(0.84, 1, smooth(u / 0.4)) : BEAM * Math.pow(Math.max(0, 1 - ((u - 0.4) / 0.6) ** 2), 0.55);
const sheerY = (u) => u < 0.35 ? 1.05 + 0.1 * (1 - u / 0.35) ** 2 : 1.05 + 0.85 * ((u - 0.35) / 0.65) ** 2;
const keelY = (u) => u > 0.7 ? lerp(-0.85, 0.95, Math.pow((u - 0.7) / 0.3, 1.6)) : u < 0.12 ? lerp(-0.6, -0.85, smooth(u / 0.12)) : -0.85;
const deckY = (x) => sheerY(hullU(x)) - BULWARK;
const rakeX = (u, y) => 0.42 * (y - keelY(u)) * smooth(invLerp(0.72, 1, u));

function halfSection(u) {
  const b = halfBeam(u), k = keelY(u), sh = sheerY(u), d = sh - BULWARK, ti = Math.max(0, b - BW_T), pts = [];
  for (let i = 0; i <= 12; i++) { const s = i / 12; pts.push([b * (1 - Math.pow(1 - s, 2.4)), lerp(k, sh, s), 0, s]); }
  pts.push([b, sh, 1, 1], [ti, sh, 1, 1], [ti, Math.max(d, k), 1, 1], [ti, Math.max(d, k), 2, 1], [0, Math.max(d, k) + 0.06, 2, 1]);
  return pts;
}

function hullGeometry() {
  const NS = 56, half = halfSection(0).length, NR = half * 2;
  const pos = [], hull = [], idx = [];
  for (let i = 0; i < NS; i++) {
    const u = 1 - Math.pow(1 - i / (NS - 1), 1.35);
    const x = lerp(HULL_X0, HULL_X1, u), h = halfSection(u);
    const ring = [...h, ...h.slice().reverse().map(([z, y, r, s]) => [-z, y, r, s])];
    for (const [z, y, r, s] of ring) { pos.push(x + rakeX(u, y), y, z); hull.push(r, s); }
  }
  for (let i = 0; i < NS - 1; i++) for (let j = 0; j < NR; j++) {
    const a = i * NR + j, b = i * NR + ((j + 1) % NR), c = a + NR, d = b + NR;
    idx.push(a, b, c, b, d, c);
  }
  const c0 = pos.length / 3, h0 = halfSection(0);
  const cy = h0.reduce((s, p) => s + p[1], 0) / h0.length;
  pos.push(HULL_X0, cy, 0); hull.push(0, 0.5);
  for (let j = 0; j < NR; j++) { pos.push(pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]); hull.push(hull[j * 2], hull[j * 2 + 1]); }
  for (let j = 0; j < NR; j++) idx.push(c0, c0 + 1 + j, c0 + 1 + ((j + 1) % NR));
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aHull', new THREE.Float32BufferAttribute(hull, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
}

function roundedBlock(x0, x1, hz, r, h, bevel = 0.05) {
  const s = new THREE.Shape();
  s.moveTo(x0 + r, -hz); s.lineTo(x1 - r, -hz); s.quadraticCurveTo(x1, -hz, x1, -hz + r); s.lineTo(x1, hz - r); s.quadraticCurveTo(x1, hz, x1 - r, hz);
  s.lineTo(x0 + r, hz); s.quadraticCurveTo(x0, hz, x0, hz - r); s.lineTo(x0, -hz + r); s.quadraticCurveTo(x0, -hz, x0 + r, -hz);
  const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 10 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function buildBoat(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const mats = {};
  const mat = (color, id, extra) => (mats[color + id + (extra ? JSON.stringify(extra) : '')] ??= celMat(color, id, extra));
  const add = (geo, m, x = 0, y = 0, z = 0, parent = root) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); parent.add(o); return o; };
  const _a = new THREE.Vector3(), _b = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  const rod = (a, b, r, m, parent = root) => {
    _a.set(...a); _b.set(...b);
    const len = _a.distanceTo(_b), o = add(new THREE.CylinderGeometry(r, r, len, 6, 1), m, 0, 0, 0, parent);
    o.position.copy(_a).add(_b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(UP, _b.sub(_a).normalize());
    return o;
  };
  const tube = (pts, r, m, closed = false) => add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed), pts.length * 8, r, 6, closed), m);

  const hullMat = shaderMat('hull_vs', 'hull_fs', { ...U, uId: { value: 10 } }, { side: THREE.DoubleSide });
  add(hullGeometry(), hullMat);

  const white = mat('#f4f2ec', 11), navy = mat('#25324f', 12), blue = mat('#2f6fc4', 13), steel = mat('#d9d8d2', 14, { gloss: 0.9 });
  const glass = mat('#1d2c4a', 15, { mode: 2 }), black = mat('#2a2c33', 16, { gloss: 0.3 }), orange = mat('#ff7a2a', 17, { gloss: 1.0 });
  const red = mat('#d8423a', 18), rope = mat('#d9c9a0', 19, { gloss: 0 }), lamp = mat('#fff3c8', 120, { gloss: 0 });
  const brass = mat('#e8ba54', 28, { gloss: 0.95 });

  // bow rail
  const railPts = (side) => { const p = []; for (let x = -0.4; x <= 6.05; x += 0.5) { const u = hullU(x); p.push([x + rakeX(u, sheerY(u)), sheerY(u) + 0.48, side * Math.max(0.04, halfBeam(u) - 0.06)]); } return p; };
  const rp = railPts(1), rs = railPts(-1);
  const STEM = [HULL_X1 + rakeX(1, sheerY(1)) - 0.15, sheerY(1) + 0.5, 0];
  tube([...rs, STEM, ...rp.slice().reverse()], 0.035, steel);
  for (const pts of [rp, rs]) for (let i = 0; i < pts.length; i += 2) { const [x, y, z] = pts[i]; rod([x, y, z], [x, y - 0.5, z], 0.025, steel); }

  // wheelhouse
  const WX0 = -3.7, WX1 = -0.8, WHZ = 1.15, WY = deckY(-2.2), WH = 2.15;
  add(roundedBlock(WX0, WX1, WHZ, 0.35, WH), white, 0, WY, 0);
  add(roundedBlock(WX0 - 0.05, WX1 + 0.05, WHZ + 0.05, 0.4, 0.22, 0.03), navy, 0, WY + 0.02, 0);
  const roofY = WY + WH + 0.05;
  add(roundedBlock(WX0 - 0.2, WX1 + 0.35, WHZ + 0.22, 0.45, 0.16, 0.04), blue, 0, roofY, 0);
  const pane = (w, h) => new THREE.BoxGeometry(0.05, h, w);
  for (const z of [-0.56, 0, 0.56]) add(pane(0.5, 0.62), glass, WX1 + 0.06, WY + 1.55, z).rotation.z = -0.12;
  for (const s of [-1, 1]) for (const x of [-1.45, -3.05]) add(pane(0.72, 0.5), glass, x, WY + 1.6, s * (WHZ + 0.06)).rotation.y = Math.PI / 2;
  for (let k = 0; k < 4; k++) { const q = add(new THREE.TorusGeometry(0.3, 0.075, 8, 18, Math.PI / 2), k % 2 ? white : red, -2.25, WY + 0.95, WHZ + 0.14); q.rotation.z = (k * Math.PI) / 2; }

  // roof gear & Attention Searchlight Turret (center-front of wheelhouse roof)
  const ry = roofY + 0.2;
  const rr = [[WX0 - 0.05, ry + 0.38, -WHZ - 0.05], [WX1 + 0.15, ry + 0.38, -WHZ - 0.05], [WX1 + 0.15, ry + 0.38, WHZ + 0.05], [WX0 - 0.05, ry + 0.38, WHZ + 0.05]];
  for (let i = 0; i < 4; i++) { rod(rr[i], rr[(i + 1) % 4], 0.025, steel); rod(rr[i], [rr[i][0], ry, rr[i][2]], 0.025, steel); }
  add(new THREE.CylinderGeometry(0.12, 0.16, 0.45, 10), white, -1.25, ry + 0.22, 0);
  const radar = new THREE.Group(); radar.position.set(-1.25, ry + 0.52, 0); root.add(radar);
  add(new THREE.BoxGeometry(0.16, 0.12, 1.5), steel, 0, 0, 0, radar);

  // Searchlight turret on front roof edge
  const turret = new THREE.Group();
  turret.position.set(WX1 - 0.15, ry + 0.25, 0.45);
  root.add(turret);
  add(new THREE.CylinderGeometry(0.14, 0.18, 0.28, 10), navy, 0, -0.1, 0, turret);
  const lampHead = new THREE.Group();
  turret.add(lampHead);
  const lampBarrel = add(new THREE.CylinderGeometry(0.22, 0.18, 0.46, 12), brass, 0.1, 0.08, 0, lampHead);
  lampBarrel.rotation.z = -Math.PI / 2;
  const lampLensMat = celMat('#fff6cc', 123, { gloss: 1.0, glow: '#ffd670', glowAmt: 0.1 });
  const lampLens = add(new THREE.SphereGeometry(0.20, 12, 10), lampLensMat, 0.32, 0.08, 0, lampHead);
  const lampEmitter = new THREE.Object3D();
  lampEmitter.position.set(0.45, 0.08, 0);
  lampHead.add(lampEmitter);

  rod([-3.4, ry, 0.9], [-3.55, ry + 2.6, 1.0], 0.022, white);
  rod([-3.4, ry, -0.9], [-3.6, ry + 2.1, -1.05], 0.022, white);

  // tall main mast + deployable main sail (Act 5) mounted on wheelhouse roof
  const MX = -2.15, mBase = ry, mTop = ry + 6.4;
  add(new THREE.CylinderGeometry(0.06, 0.11, mTop - mBase, 10), white, MX, (mBase + mTop) / 2, 0);
  rod([MX, mTop - 1.2, -1.1], [MX, mTop - 1.2, 1.1], 0.04, white);
  add(new THREE.SphereGeometry(0.1, 10, 8), mat('#e8483a', 121, { gloss: 0 }), MX, mTop - 1.05, -1.1);
  add(new THREE.SphereGeometry(0.1, 10, 8), mat('#3fd08a', 122, { gloss: 0 }), MX, mTop - 1.05, 1.1);
  add(new THREE.SphereGeometry(0.13, 10, 8), lamp, MX, mTop + 0.08, 0);
  const flag = add(new THREE.PlaneGeometry(1.3, 0.72, 8, 3), mat('#ff8a1e', 20), MX - 0.7, mTop - 0.4, 0);

  // Deployable main sail mounted on a yard along the mast (8x8 grid deformed in update)
  const SAIL_NX = 8, SAIL_NY = 8;
  const sailGeo = new THREE.PlaneGeometry(1, 1, SAIL_NX, SAIL_NY);
  const sailMat = celMat('#fbf2db', 27, { gloss: 0.0, glow: '#ffdc9e', glowAmt: 0.0 });
  const mainSail = new THREE.Mesh(sailGeo, sailMat);
  mainSail.frustumCulled = false;
  root.add(mainSail);
  const yardBar = add(new THREE.CylinderGeometry(0.045, 0.045, 3.6, 8), navy, MX, mTop - 1.45, 0);
  yardBar.rotation.x = Math.PI / 2;

  // stays
  rod([MX, mTop - 0.1, 0], STEM, 0.016, rope);
  rod([MX, mTop - 0.1, 0], [HULL_X0 + 0.3, sheerY(0) + 2.9, 0], 0.016, rope);
  for (const s of [-1, 1]) rod([MX, mTop - 1.2, s * 1.1], [MX + 0.3, sheerY(hullU(MX)), s * halfBeam(hullU(MX)) * 0.97], 0.014, rope);

  // stern steadying sail, exhaust, net, floats
  const SX = HULL_X0 + 0.3, sb = deckY(SX);
  add(new THREE.CylinderGeometry(0.05, 0.07, 3.4, 8), white, SX, sb + 1.7, 0);
  const sternSail = new THREE.Shape(); sternSail.moveTo(0, 0.5); sternSail.lineTo(0, 3.25); sternSail.quadraticCurveTo(-0.6, 1.6, -1.55, 0.55); sternSail.lineTo(0, 0.5);
  add(new THREE.ShapeGeometry(sternSail, 8), mat('#efe4cc', 21, { gloss: 0 }), SX, sb, 0);
  add(new THREE.CylinderGeometry(0.15, 0.17, 3.0, 12), white, WX0 + 0.25, WY + 1.5 + 0.9, -0.55);
  add(new THREE.CylinderGeometry(0.155, 0.155, 0.3, 12), black, WX0 + 0.25, WY + 3.75, -0.55);

  const net = new THREE.IcosahedronGeometry(0.7, 3), np = net.attributes.position;
  for (let i = 0; i < np.count; i++) { _a.fromBufferAttribute(np, i); const k = 1 + 0.18 * noise1(_a.x * 4 + _a.z * 3, 2) + 0.1 * noise1(_a.y * 7, 4); np.setXYZ(i, _a.x * k * 1.25, Math.max(-0.05, _a.y * k * 0.55), _a.z * k * 1.15); }
  net.computeVertexNormals();
  add(net, mat('#3f7f72', 22, { gloss: 0.1 }), -4.75, deckY(-4.75) + 0.05, -0.35);
  const fl = new Rng(41);
  for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.2, 14, 10), orange, -4.55 + fl.range(-0.35, 0.35), deckY(-4.6) + 0.2 + (i > 3 ? 0.3 : 0), 0.75 + fl.range(-0.3, 0.3));
  rod([-4.0, deckY(-4.0), 1.05], [-4.05, deckY(-4.0) + 3.6, 1.1], 0.03, mat('#e9d9a8', 23, { gloss: 0 }));
  add(new THREE.PlaneGeometry(0.5, 0.32), mat('#e8483a', 24, { gloss: 0 }), -4.3, deckY(-4.0) + 3.4, 1.1);
  add(new THREE.SphereGeometry(0.28, 14, 10), orange, -4.0, deckY(-4.0) + 0.28, 1.05);

  // ---- Young Helmsman silhouette & Ship's Brass Wheel on a raised open fore-deck helm platform
  const HX = 2.1, HY = deckY(HX) + 0.36;
  const helmGroup = new THREE.Group();
  helmGroup.position.set(HX, HY, 0);
  root.add(helmGroup);
  add(roundedBlock(-0.55, 0.75, 0.75, 0.18, 0.36, 0.03), navy, 0, -0.36, 0, helmGroup);

  // Pedestal & ship steering wheel
  add(new THREE.CylinderGeometry(0.08, 0.12, 1.05, 8), navy, 0.48, 0.52, 0, helmGroup);
  const wheel = new THREE.Group();
  wheel.position.set(0.42, 1.08, 0);
  wheel.rotation.z = 0.25;
  helmGroup.add(wheel);
  add(new THREE.TorusGeometry(0.32, 0.035, 8, 18), brass, 0, 0, 0, wheel).rotation.y = Math.PI / 2;
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const sp = add(new THREE.CylinderGeometry(0.018, 0.018, 0.78, 6), brass, 0, 0, 0, wheel);
    sp.rotation.x = a;
  }

  // Young Captain silhouette: sailor coat, warm skin, cap, billowing orange-coral scarf/cape
  const coatMat = mat('#1d2a44', 30, { gloss: 0.1 });
  const skinMat = mat('#f3c7a2', 31, { gloss: 0 });
  const scarfMat = mat('#ff7438', 32, { gloss: 0.0 });
  // Boots & legs
  add(new THREE.CylinderGeometry(0.075, 0.09, 0.72, 8), coatMat, -0.05, 0.36, -0.14, helmGroup);
  add(new THREE.CylinderGeometry(0.075, 0.09, 0.72, 8), coatMat, -0.05, 0.36, 0.14, helmGroup);
  // Torso
  add(new THREE.CylinderGeometry(0.18, 0.16, 0.78, 10), coatMat, -0.04, 1.05, 0, helmGroup);
  // Arms reaching forward to wheel
  rod([-0.02, 1.32, -0.18], [0.36, 1.12, -0.22], 0.055, coatMat, helmGroup);
  rod([-0.02, 1.32, 0.18], [0.36, 1.12, 0.22], 0.055, coatMat, helmGroup);
  // Head & Sailor Captain Cap
  add(new THREE.SphereGeometry(0.175, 12, 10), skinMat, 0.02, 1.62, 0, helmGroup);
  add(new THREE.CylinderGeometry(0.18, 0.17, 0.10, 12), navy, 0.02, 1.75, 0, helmGroup);
  add(new THREE.CylinderGeometry(0.22, 0.18, 0.05, 12), white, 0.02, 1.81, 0, helmGroup);
  add(new THREE.BoxGeometry(0.16, 0.03, 0.24), navy, 0.16, 1.71, 0, helmGroup); // cap visor

  // Flowing scarf/cape behind shoulders
  const capeGeo = new THREE.PlaneGeometry(0.95, 0.42, 6, 3);
  const capeMesh = add(capeGeo, scarfMat, -0.45, 1.40, 0, helmGroup);

  // foredeck cargo boxes & bollards (placed ahead/aside of helmsman)
  const fy = (x) => deckY(x);
  const boxes = [[3.1, 0, -0.42, 0], [3.1, 1, -0.42, 1], [3.8, 0, 0.38, 0]];
  for (const [x, lvl, z, c] of boxes) {
    const b = add(new THREE.BoxGeometry(0.68, 0.28, 0.48), c ? mat('#3a7cc4', 25) : mat('#f2efe6', 26), x, fy(x) + 0.14 + lvl * 0.29, z);
    b.rotation.y = noise1(x * 3 + z * 7 + lvl, 6) * 0.12;
  }
  for (const [x, z] of [[4.8, 0.52], [4.8, -0.52], [-5.0, 1.15], [-5.0, -1.15]]) add(new THREE.CylinderGeometry(0.09, 0.11, 0.3, 10), black, x, fy(x) + 0.15, z);
  for (const x of [-1.4, 1.6]) {
    const u = hullU(x);
    add(new THREE.TorusGeometry(0.2, 0.085, 8, 16), black, x, sheerY(u) - 0.42, halfBeam(u) + 0.1).rotation.y = 0.12;
    rod([x, sheerY(u) - 0.24, halfBeam(u) + 0.1], [x, sheerY(u), halfBeam(u) - 0.02], 0.012, rope);
  }

  const _lampW = new THREE.Vector3();
  const sailPos = sailGeo.attributes.position;

  return {
    root,
    getLampWorldPos() {
      lampEmitter.getWorldPosition(_lampW);
      return _lampW;
    },
    update(st, ring) {
      const t = onTwos(st.t);
      const { pos, heading, speed } = st.boat;
      const cx = Math.cos(heading), sx = Math.sin(heading);
      const h = (l, b) => swellAt(pos.x + cx * l + sx * b, pos.y - sx * l + cx * b, t, ring);
      const bow = h(4.5, 0), stern = h(-4.5, 0), stbd = h(0, 1.6), port = h(0, -1.6);
      const y = (bow + stern + stbd + port) / 4;

      root.position.set(pos.x, y - 0.12, pos.y);
      root.rotation.set(
        -Math.atan((stbd - port) / 3.2) * 0.7 + noise1(t * 1.3, 3) * 0.02,
        heading,
        Math.atan((bow - stern) / 9) * 0.7 + noise1(t * 1.1, 5) * 0.015 + speed * 0.015,
        'YXZ'
      );

      radar.rotation.y = t * 4.2;

      // Flag ripple
      const fp = flag.geometry.attributes.position;
      for (let i = 0; i < fp.count; i++) {
        const x = 1 - (i % 9) / 8;
        fp.setZ(i, Math.sin(x * 4.5 - t * (8 + speed * 4)) * (0.14 + speed * 0.06) * x);
      }
      fp.needsUpdate = true;

      // Helmsman scarf wind animation & wheel turn in Act 5
      const cp = capeGeo.attributes.position;
      for (let i = 0; i < cp.count; i++) {
        const u = 1 - (i % 7) / 6;
        const v = Math.floor(i / 7) / 3;
        cp.setZ(i, Math.sin(u * 5.0 - t * (7 + speed * 5) + v) * (0.12 + speed * 0.08) * u);
        cp.setY(i, (0.5 - v) * 0.4 + Math.sin(u * 3 - t * 6) * 0.06 * u);
      }
      cp.needsUpdate = true;
      wheel.rotation.x = Math.sin(t * 1.2) * 0.25 + smooth(invLerp(12.8, 14.5, st.t)) * -1.4;

      // Searchlight glow & aim during Act 3
      const attnGlow = smooth(invLerp(CUES.beamStart - 0.2, CUES.beamStart + 0.4, st.t)) * (1 - smooth(invLerp(9.0, 9.7, st.t)));
      lampLensMat.uniforms.uGlowAmt.value = 0.1 + attnGlow * 1.9;
      turret.rotation.y = Math.sin(st.t * 4.0) * 0.25 * (1 - smooth(invLerp(CUES.beamStart, CUES.beamLock, st.t)));
      lampHead.rotation.z = -0.15 * attnGlow;

      // Deployable Main Sail (furled at top of yard until Act 5, then drops & billows out gracefully)
      const sailOpen = smooth(invLerp(CUES.sailRaise, CUES.sailFull, st.t));
      const sailHeight = lerp(0.32, 4.4, sailOpen);
      const sailWidth = lerp(2.6, 4.4, sailOpen);
      const billow = lerp(0.1, 1.35, sailOpen);
      const yardY = mTop - 1.45;
      for (let iy = 0; iy <= SAIL_NY; iy++) {
        const v = iy / SAIL_NY; // 0 = top at yard, 1 = bottom foot
        for (let ix = 0; ix <= SAIL_NX; ix++) {
          const u = ix / SAIL_NX - 0.5; // -0.5..0.5 across beam
          const idx = iy * (SAIL_NX + 1) + ix;
          const arch = Math.sin(v * Math.PI) * Math.cos(u * Math.PI);
          const lx = MX + 0.15 + arch * billow + Math.sin(t * 7 + v * 3) * 0.04 * sailOpen;
          const ly = yardY - v * sailHeight + (1 - Math.cos(u * Math.PI)) * 0.15 * v;
          const lz = u * sailWidth * (0.85 + 0.25 * v);
          sailPos.setXYZ(idx, lx, ly, lz);
        }
      }
      sailPos.needsUpdate = true;
      sailGeo.computeVertexNormals();
      sailMat.uniforms.uGlowAmt.value = sailOpen * 0.12;
    },
  };
}
