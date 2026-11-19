// ---- Thai Longtail Boat (เรือหางยาว): teak hull, 7-color ribbons & marigold garland, Lanna Sala canopy, golden lotus lantern, longtail shaft, Chiang Mai helmsman & silk sail
const celMat = (color, id, extra = {}) => shaderMat('cel_vs', 'cel_fs', {
  ...U,
  uColor: { value: new THREE.Color(color) },
  uGlow: { value: new THREE.Color(extra.glow || '#000000') },
  uGlowAmt: { value: extra.glowAmt ?? 0 },
  uId: { value: id },
  uGloss: { value: extra.gloss ?? 0.6 },
  uMode: { value: extra.mode ?? 0 },
}, { side: THREE.DoubleSide });

const HULL_X0 = -5.8, HULL_X1 = 6.8, BEAM = 1.38, BULWARK = 0.34, BW_T = 0.06;
const hullU = (x) => clamp((x - HULL_X0) / (HULL_X1 - HULL_X0));
const halfBeam = (u) => {
  if (u < 0.42) return BEAM * lerp(0.66, 1.0, smooth(u / 0.42));
  return BEAM * Math.pow(Math.max(0, 1 - ((u - 0.42) / 0.58) ** 2), 0.66);
};
const sheerY = (u) => {
  if (u < 0.4) return 1.0 + 0.32 * (1 - u / 0.4) ** 2;
  return 1.0 + 1.55 * ((u - 0.4) / 0.6) ** 2.15;
};
const keelY = (u) => {
  if (u > 0.66) return lerp(-0.80, 1.85, Math.pow((u - 0.66) / 0.34, 1.55));
  if (u < 0.14) return lerp(-0.50, -0.80, smooth(u / 0.14));
  return -0.80;
};
const deckY = (x) => sheerY(hullU(x)) - BULWARK;
const rakeX = (u, y) => 0.58 * (y - keelY(u)) * smooth(invLerp(0.68, 1, u));

function halfSection(u) {
  const b = halfBeam(u), k = keelY(u), sh = sheerY(u), d = sh - BULWARK, ti = Math.max(0, b - BW_T), pts = [];
  for (let i = 0; i <= 12; i++) {
    const s = i / 12;
    pts.push([b * (1 - Math.pow(1 - s, 2.3)), lerp(k, sh, s), 0, s]);
  }
  pts.push([b, sh, 1, 1], [ti, sh, 1, 1], [ti, Math.max(d, k), 1, 1], [ti, Math.max(d, k), 2, 1], [0, Math.max(d, k) + 0.05, 2, 1]);
  return pts;
}

function hullGeometry() {
  const NS = 58, half = halfSection(0).length, NR = half * 2;
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

// Sculpted cupped lotus petal geometry for the Golden Lotus Attention Lantern
function lotusPetalGeo(w = 0.14, h = 0.42) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.quadraticCurveTo(w, h * 0.35, w * 0.65, h * 0.72);
  s.quadraticCurveTo(w * 0.25, h * 0.94, 0, h);
  s.quadraticCurveTo(-w * 0.25, h * 0.94, -w * 0.65, h * 0.72);
  s.quadraticCurveTo(-w, h * 0.35, 0, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.022, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 2, curveSegments: 8 });
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const px = p.getX(i), py = p.getY(i), pz = p.getZ(i);
    const t = clamp(py / h);
    const cup = -Math.sin(t * Math.PI) * 0.065 + (px * px) * 1.4;
    p.setZ(i, pz + cup);
  }
  g.computeVertexNormals();
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
    const len = _a.distanceTo(_b), o = add(new THREE.CylinderGeometry(r, r, len, 7, 1), m, 0, 0, 0, parent);
    o.position.copy(_a).add(_b).multiplyScalar(0.5);
    o.quaternion.setFromUnitVectors(UP, _b.sub(_a).normalize());
    return o;
  };
  const tube = (pts, r, m, closed = false, parent = root) =>
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)), closed), pts.length * 8, r, 7, closed), m, 0, 0, 0, parent);

  // Teak hand-painted hull
  const hullMat = shaderMat('hull_vs', 'hull_fs', {
    ...U,
    uId: { value: 10 },
    uGlow: { value: new THREE.Color('#000000') },
    uGlowAmt: { value: 0 },
  }, { side: THREE.DoubleSide });
  add(hullGeometry(), hullMat);

  // Thai Lanna palette materials
  const teak = mat('#633419', 11, { gloss: 0.25 });
  const teakDark = mat('#3f2010', 12, { gloss: 0.2 });
  const bamboo = mat('#b68949', 13, { gloss: 0.15 });
  const lacquerRed = mat('#9e1f19', 14, { gloss: 0.5 });
  const roofTile = mat('#6a221b', 15, { gloss: 0.22 });
  const gold = mat('#eab334', 16, { gloss: 0.95 });
  const warmGold = mat('#ffd256', 17, { gloss: 0.85, glow: '#ffbb38', glowAmt: 0.08 });
  const emerald = mat('#226d54', 18, { gloss: 0.35 });
  const steel = mat('#cfd2d4', 19, { gloss: 0.9 });
  const iron = mat('#2a2d34', 20, { gloss: 0.4 });
  const rope = mat('#d6c090', 21, { gloss: 0 });
  const brass = mat('#e3aa3c', 28, { gloss: 0.95 });

  // Inner teak cross-thwarts (wooden benches along open hull)
  for (const x of [-4.0, 0.0, 1.8, 4.4]) {
    const u = hullU(x), w = Math.max(0.25, halfBeam(u) * 1.65);
    add(new THREE.BoxGeometry(0.32, 0.08, w), teak, x, deckY(x) + 0.18, 0);
  }

  // ---- 1. High Curved Thai Bow Stempost (Hua Ruea) + Phuang Malai Garland + 7-Color Fluttering Ribbons
  const bowPts = [[6.75, 1.82, 0], [7.20, 2.58, 0], [7.56, 3.65, 0], [7.80, 4.65, 0], [7.92, 5.18, 0]];
  tube(bowPts, 0.072, teakDark);
  const finial = add(new THREE.ConeGeometry(0.11, 0.42, 10), gold, 7.95, 5.34, 0);
  finial.rotation.z = -0.18;
  for (const [rx, ry, rr] of [[7.86, 4.92, 0.085], [7.72, 4.35, 0.088]]) {
    const ring = add(new THREE.TorusGeometry(rr, 0.025, 7, 14), gold, rx, ry, 0);
    ring.rotation.y = Math.PI / 2;
    ring.rotation.x = 0.2;
  }

  // Phuang Malai (Marigold + Jasmine flower garland around the stempost)
  const garlandGroup = new THREE.Group();
  garlandGroup.position.set(7.68, 4.22, 0);
  garlandGroup.rotation.z = -0.22;
  root.add(garlandGroup);
  const marigoldGold = mat('#ffc72c', 33, { gloss: 0.1 });
  const marigoldOrg = mat('#ff7b1c', 34, { gloss: 0.1 });
  const jasmineMat = mat('#faf5e8', 35, { gloss: 0.05 });
  const roseMat = mat('#e53935', 36, { gloss: 0.1 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    add(new THREE.SphereGeometry(0.068, 8, 7), i % 2 ? marigoldGold : marigoldOrg, Math.cos(a) * 0.14, 0, Math.sin(a) * 0.14, garlandGroup);
  }
  for (const s of [-1, 1]) {
    for (let k = 0; k < 4; k++) {
      add(new THREE.SphereGeometry(0.042, 7, 6), k === 3 ? roseMat : jasmineMat, -0.05, -0.12 - k * 0.095, s * 0.12, garlandGroup);
    }
  }

  // 7-Color Fluttering Thai Blessing Ribbons (ผูกผ้าเจ็ดสี)
  const RIBBON_COLS = ['#e63946', '#ff7b24', '#ffd23f', '#2ec476', '#38b6ff', '#4361ee', '#d946ef'];
  const ribbons = [];
  RIBBON_COLS.forEach((col, i) => {
    const len = 2.6 + (i % 3) * 0.28;
    const g = new THREE.PlaneGeometry(len, 0.105, 10, 1);
    const m = celMat(col, 37, { gloss: 0.05 });
    const mesh = new THREE.Mesh(g, m);
    mesh.frustumCulled = false;
    mesh.position.set(7.66, 4.18 - i * 0.02, 0);
    root.add(mesh);
    ribbons.push({
      mesh,
      geo: g,
      len,
      zSpread: (i - 3) * 0.16,
      yDrop: 0.35 + (i % 3) * 0.18,
      phase: i * 0.92,
    });
  });

  // ---- 2. Lanna Two-Tiered Sala Bamboo & Lacquer Wood Canopy (mid-aft open pavilion)
  const WX0 = -3.65, WX1 = -0.35, WHZ = 1.04;
  const WY = deckY(-2.0);
  // Low teak/lacquer gunwale rail & side bamboo benches inside Sala
  for (const s of [-1, 1]) {
    add(new THREE.BoxGeometry(WX1 - WX0, 0.42, 0.06), lacquerRed, (WX0 + WX1) * 0.5, WY + 0.22, s * (WHZ - 0.02));
    add(new THREE.BoxGeometry(WX1 - WX0 - 0.2, 0.07, 0.34), bamboo, (WX0 + WX1) * 0.5, WY + 0.32, s * (WHZ - 0.24));
  }
  // 6 open bamboo-wood pillars
  const roofBaseY = WY + 2.02;
  for (const s of [-1, 1]) {
    for (const px of [-3.50, -2.00, -0.50]) {
      rod([px, deckY(px) - 0.04, s * 0.96], [px, roofBaseY + 0.06, s * 0.96], 0.052, bamboo);
    }
    rod([-3.75, roofBaseY, s * 0.96], [-0.25, roofBaseY, s * 0.96], 0.048, lacquerRed);
  }
  rod([-3.50, roofBaseY, -0.96], [-3.50, roofBaseY, 0.96], 0.045, lacquerRed);
  rod([-0.50, roofBaseY, -0.96], [-0.50, roofBaseY, 0.96], 0.045, lacquerRed);

  // Helper to build symmetric dual-pitched Thai roof slopes cleanly
  const roofSlope = (x0, x1, zIn, zOut, yIn, yOut, thick, matObj) => {
    const cx = (x0 + x1) * 0.5, len = x1 - x0;
    const dz = zOut - zIn, dy = yIn - yOut;
    const span = Math.hypot(dz, dy), tilt = Math.atan2(dy, dz);
    for (const s of [-1, 1]) {
      const m = add(new THREE.BoxGeometry(len, thick, span), matObj, cx, (yIn + yOut) * 0.5, s * (zIn + zOut) * 0.5);
      m.rotation.x = s * tilt;
    }
  };
  // Lower wide Lanna eaves with gentle upturned outer wings
  roofSlope(-3.95, 0.0, 0.0, 1.02, roofBaseY + 0.84, roofBaseY + 0.16, 0.07, roofTile);
  roofSlope(-3.98, 0.03, 1.00, 1.44, roofBaseY + 0.16, roofBaseY + 0.07, 0.055, lacquerRed);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(4.04, 0.05, 0.05), gold, -1.975, roofBaseY + 0.07, s * 1.45);

  // Upper tiered Lanna roof
  const upperY = roofBaseY + 0.62;
  roofSlope(-3.18, -0.82, 0.0, 0.80, upperY + 0.68, upperY + 0.10, 0.065, roofTile);
  for (const s of [-1, 1]) add(new THREE.BoxGeometry(2.40, 0.045, 0.045), gold, -2.00, upperY + 0.10, s * 0.81);
  // Central golden ridge beam
  add(new THREE.BoxGeometry(2.48, 0.09, 0.10), gold, -2.00, upperY + 0.70, 0);

  // Triangular golden carved Lanna gables (front & back)
  const gableGeo = new THREE.ExtrudeGeometry((() => {
    const s = new THREE.Shape();
    s.moveTo(-0.96, 0); s.lineTo(0.96, 0); s.lineTo(0, 0.68); s.closePath();
    return s;
  })(), { depth: 0.06, bevelEnabled: false });
  for (const gx of [-3.65, -0.35]) {
    const gMesh = add(gableGeo, gold, gx, roofBaseY + 0.12, 0);
    gMesh.rotation.y = Math.PI / 2;
  }

  // Golden Lanna Chofah (ช่อฟ้า) roof-ridge finials at both ends + corner Hang Hong spurs
  for (const dir of [-1, 1]) {
    const rx = dir > 0 ? -0.80 : -3.20;
    const ryPeak = upperY + 0.72;
    tube([[rx, ryPeak - 0.05, 0], [rx + dir * 0.18, ryPeak + 0.25, 0], [rx + dir * 0.28, ryPeak + 0.56, 0], [rx + dir * 0.18, ryPeak + 0.74, 0]], 0.036, gold);
    add(new THREE.ConeGeometry(0.05, 0.24, 6), gold, rx + dir * 0.16, ryPeak + 0.80, 0).rotation.z = dir * 0.35;
    for (const s of [-1, 1]) {
      const ex = dir > 0 ? 0.02 : -3.96;
      add(new THREE.ConeGeometry(0.04, 0.18, 6), gold, ex, roofBaseY + 0.14, s * 1.45).rotation.x = s * 0.45;
    }
  }

  // Two small warm glowing Yi Peng hanging lanterns under Sala eaves
  const miniLanternMat = celMat('#ffcf68', 124, { gloss: 0.1, glow: '#ff8a2a', glowAmt: 0.75 });
  for (const [lx, lz] of [[-0.45, 1.15], [-0.45, -1.15]]) {
    rod([lx, roofBaseY + 0.08, lz], [lx, roofBaseY - 0.16, lz], 0.008, rope);
    add(new THREE.CylinderGeometry(0.09, 0.075, 0.22, 8), miniLanternMat, lx, roofBaseY - 0.28, lz);
  }

  // ---- 3. Fore-Deck Golden Lotus Attention Lantern (9-petal lotus with central lampEmitter)
  const LX = 3.25, LY = deckY(LX);
  const lotusPedestal = new THREE.Group();
  lotusPedestal.position.set(LX, LY, 0);
  root.add(lotusPedestal);

  // Octagonal vermilion & gold base column + emerald lotus leaf tray
  add(new THREE.CylinderGeometry(0.24, 0.30, 0.45, 8), lacquerRed, 0, 0.22, 0, lotusPedestal);
  add(new THREE.CylinderGeometry(0.28, 0.26, 0.08, 8), gold, 0, 0.48, 0, lotusPedestal);
  add(new THREE.CylinderGeometry(0.46, 0.28, 0.08, 12), emerald, 0, 0.56, 0, lotusPedestal);

  const turret = new THREE.Group();
  turret.position.set(0, 0.62, 0);
  lotusPedestal.add(turret);
  const lampHead = new THREE.Group();
  turret.add(lampHead);

  const petalG = lotusPetalGeo(0.155, 0.44);
  const petalOuterMat = celMat('#f4be41', 38, { gloss: 0.75, glow: '#ff9e2c', glowAmt: 0.12 });
  const petalInnerMat = celMat('#ffe07a', 39, { gloss: 0.65, glow: '#ffc748', glowAmt: 0.25 });
  const outerPetals = [], innerPetals = [];

  for (let i = 0; i < 5; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i / 5) * Math.PI * 2;
    const pPivot = new THREE.Group();
    pPivot.position.set(0, 0, 0.15);
    pPivot.rotation.x = 0.78;
    add(petalG, petalOuterMat, 0, 0, 0, pPivot);
    holder.add(pPivot);
    lampHead.add(holder);
    outerPetals.push(pPivot);
  }
  for (let i = 0; i < 4; i++) {
    const holder = new THREE.Group();
    holder.rotation.y = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const pPivot = new THREE.Group();
    pPivot.position.set(0, 0.02, 0.10);
    pPivot.rotation.x = 0.46;
    const pm = add(petalG, petalInnerMat, 0, 0, 0, pPivot);
    pm.scale.set(0.84, 0.88, 0.84);
    holder.add(pPivot);
    lampHead.add(holder);
    innerPetals.push(pPivot);
  }

  // Luminous golden lotus heart & lampEmitter (used by Act 3 Attention Beams)
  const lampLensMat = celMat('#fff6cc', 123, { gloss: 1.0, glow: '#ffc84d', glowAmt: 0.35 });
  add(new THREE.SphereGeometry(0.16, 12, 10), lampLensMat, 0, 0.21, 0, lampHead);
  const lampEmitter = new THREE.Object3D();
  lampEmitter.position.set(0, 0.24, 0);
  lampHead.add(lampEmitter);

  // ---- 4. Thai Longtail Engine & Slanted Stainless Propeller Shaft (Stern)
  const EX = -4.98, EY = deckY(EX) + 0.46;
  add(new THREE.CylinderGeometry(0.08, 0.11, 0.52, 8), iron, EX, EY - 0.24, 0); // transom swivel mount
  const engineGroup = new THREE.Group();
  engineGroup.position.set(EX, EY, 0);
  root.add(engineGroup);

  // Engine block, cooling fins, red fuel tank, brass flywheel & exhaust pipe
  add(new THREE.BoxGeometry(0.62, 0.42, 0.38), steel, 0, 0.14, 0, engineGroup);
  add(new THREE.BoxGeometry(0.34, 0.18, 0.28), lacquerRed, 0.08, 0.44, 0, engineGroup);
  const flywheel = add(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 14), brass, 0.12, 0.14, 0.22, engineGroup);
  flywheel.rotation.x = Math.PI / 2;
  tube([[0.05, 0.28, -0.18], [-0.32, 0.45, -0.24], [-0.62, 0.54, -0.20]], 0.038, iron, false, engineGroup);

  // Forward tiller control rods toward the helmsman
  rod([0.28, 0.22, 0.14], [0.68, 0.46, 0.18], 0.024, steel, engineGroup);
  rod([0.28, 0.22, -0.14], [0.68, 0.46, -0.18], 0.024, steel, engineGroup);

  // Iconic Longtail Propeller Shaft plunging backward into the Mae Ping River
  const shaftLen = 4.95;
  const shaftGroup = new THREE.Group();
  shaftGroup.position.set(-0.28, 0.06, 0);
  shaftGroup.rotation.z = 0.39; // slanted backward & down into the water
  engineGroup.add(shaftGroup);
  const shaftRod = add(new THREE.CylinderGeometry(0.032, 0.028, shaftLen, 8), steel, -shaftLen * 0.5, 0, 0, shaftGroup);
  shaftRod.rotation.z = Math.PI / 2;
  // Protective skeg fin & 2-blade brass propeller at shaft tip
  add(new THREE.BoxGeometry(0.28, 0.22, 0.025), steel, -shaftLen + 0.22, -0.12, 0, shaftGroup);
  const propeller = new THREE.Group();
  propeller.position.set(-shaftLen - 0.04, 0, 0);
  shaftGroup.add(propeller);
  for (const s of [-1, 1]) {
    const bl = add(new THREE.BoxGeometry(0.03, 0.26, 0.10), brass, 0, s * 0.13, 0, propeller);
    bl.rotation.y = s * 0.42;
  }

  // ---- 5. Chiang Mai Young Helmsman (Mo Hom indigo tunic & orange-gold Lanna scarf/headband)
  const HX = -4.10, HY = deckY(HX);
  const helmGroup = new THREE.Group();
  helmGroup.position.set(HX, HY, 0);
  root.add(helmGroup);

  const indigoMat = mat('#223a63', 30, { gloss: 0.05 });
  const indigoDark = mat('#1a2b49', 31, { gloss: 0.05 });
  const skinMat = mat('#e4ae82', 32, { gloss: 0 });
  const hairMat = mat('#1d1a1c', 41, { gloss: 0.1 });
  const sashMat = mat('#7a4526', 42, { gloss: 0 });
  const scarfMat = mat('#ff8b2b', 43, { gloss: 0.05 });
  const scarfGold = mat('#ffd24c', 44, { gloss: 0.1 });

  // Legs (Mo Hom loose trousers)
  add(new THREE.CylinderGeometry(0.075, 0.088, 0.72, 8), indigoDark, -0.02, 0.36, -0.14, helmGroup);
  add(new THREE.CylinderGeometry(0.075, 0.088, 0.72, 8), indigoDark, -0.02, 0.36, 0.14, helmGroup);
  // Mo Hom indigo shirt & waist sash
  add(new THREE.CylinderGeometry(0.175, 0.165, 0.76, 10), indigoMat, 0, 1.04, 0, helmGroup);
  add(new THREE.CylinderGeometry(0.172, 0.172, 0.12, 10), sashMat, 0, 0.72, 0, helmGroup);
  // Arms reaching back/side slightly to grip longtail tiller handles
  rod([-0.02, 1.28, -0.17], [-0.26, 1.00, -0.18], 0.052, indigoMat, helmGroup);
  rod([-0.02, 1.28, 0.17], [-0.26, 1.00, 0.18], 0.052, indigoMat, helmGroup);
  // Head, hair & orange-gold Lanna headband
  add(new THREE.SphereGeometry(0.17, 12, 10), skinMat, 0.03, 1.60, 0, helmGroup);
  add(new THREE.SphereGeometry(0.176, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.56), hairMat, 0.01, 1.62, 0, helmGroup);
  const headband = add(new THREE.CylinderGeometry(0.18, 0.18, 0.065, 12), scarfMat, 0.03, 1.66, 0, helmGroup);
  headband.rotation.z = 0.08;
  add(new THREE.TorusGeometry(0.178, 0.016, 6, 14), scarfGold, 0.03, 1.65, 0, helmGroup).rotation.x = Math.PI / 2;

  // Flowing orange-gold Lanna scarf behind shoulders
  const capeGeo = new THREE.PlaneGeometry(0.92, 0.36, 6, 3);
  add(capeGeo, scarfMat, -0.45, 1.38, 0, helmGroup);

  // ---- 6. Main Mast & Act 5 Deployable Lanna Silk Sail (warm ivory-gold with crimson-gold motif)
  const MX = 0.72, mBase = deckY(MX), mTop = mBase + 6.95;
  add(new THREE.CylinderGeometry(0.055, 0.095, mTop - mBase, 10), teak, MX, (mBase + mTop) * 0.5, 0);
  rod([MX, mTop - 1.15, -1.05], [MX, mTop - 1.15, 1.05], 0.036, teak);
  add(new THREE.SphereGeometry(0.11, 10, 8), warmGold, MX, mTop + 0.10, 0);
  // Tapered Lanna Tung banner flag at masthead
  const flag = add(new THREE.PlaneGeometry(1.35, 0.52, 8, 3), lacquerRed, MX - 0.72, mTop - 0.38, 0);

  const SAIL_NX = 8, SAIL_NY = 8;
  const sailGeo = new THREE.PlaneGeometry(1, 1, SAIL_NX, SAIL_NY);
  const sailHull = [];
  for (let iy = 0; iy <= SAIL_NY; iy++) {
    for (let ix = 0; ix <= SAIL_NX; ix++) {
      sailHull.push(3.0 + ix / SAIL_NX, iy / SAIL_NY);
    }
  }
  sailGeo.setAttribute('aHull', new THREE.Float32BufferAttribute(sailHull, 2));
  const sailMat = shaderMat('hull_vs', 'hull_fs', {
    ...U,
    uId: { value: 27 },
    uGlow: { value: new THREE.Color('#ffd884') },
    uGlowAmt: { value: 0 },
  }, { side: THREE.DoubleSide });
  const mainSail = new THREE.Mesh(sailGeo, sailMat);
  mainSail.frustumCulled = false;
  root.add(mainSail);
  const yardBar = add(new THREE.CylinderGeometry(0.042, 0.042, 3.5, 8), teakDark, MX, mTop - 1.35, 0);
  yardBar.rotation.x = Math.PI / 2;

  // Rigging stays & wooden bollards
  rod([MX, mTop - 0.12, 0], [7.20, 2.58, 0], 0.014, rope);
  rod([MX, mTop - 0.12, 0], [-3.65, roofBaseY + 0.65, 0], 0.014, rope);
  for (const s of [-1, 1]) {
    rod([MX, mTop - 1.15, s * 1.05], [MX + 0.25, sheerY(hullU(MX)), s * halfBeam(hullU(MX)) * 0.96], 0.013, rope);
  }
  for (const [x, z] of [[4.7, 0.42], [4.7, -0.42], [-5.2, 0.75], [-5.2, -0.75]]) {
    add(new THREE.CylinderGeometry(0.075, 0.09, 0.26, 8), teakDark, x, deckY(x) + 0.12, z);
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
      const bow = h(4.5, 0), stern = h(-4.5, 0), stbd = h(0, 1.3), port = h(0, -1.3);
      const y = (bow + stern + stbd + port) / 4;

      root.position.set(pos.x, y - 0.12, pos.y);
      root.rotation.set(
        -Math.atan((stbd - port) / 2.6) * 0.7 + noise1(t * 1.3, 3) * 0.02,
        heading,
        Math.atan((bow - stern) / 9) * 0.7 + noise1(t * 1.1, 5) * 0.015 + speed * 0.018,
        'YXZ'
      );

      // Fluttering 7-color Thai blessing ribbons at bow stempost
      for (const rb of ribbons) {
        const rp = rb.geo.attributes.position;
        for (let i = 0; i < rp.count; i++) {
          const u = i % 11 / 10;
          const v = i < 11 ? 0.5 : -0.5;
          const wave = Math.sin(u * 5.2 - t * (6.5 + speed * 5.5) + rb.phase) * (0.14 + speed * 0.10) * u;
          const lift = Math.cos(u * 3.8 - t * 4.5 + rb.phase) * 0.08 * u;
          const rx = -u * rb.len * (0.88 + speed * 0.10);
          const ry = -Math.pow(u, 1.2) * rb.yDrop * (1.0 - speed * 0.45) + lift + v * 0.105;
          const rz = u * rb.zSpread + wave;
          rp.setXYZ(i, rx, ry, rz);
        }
        rp.needsUpdate = true;
      }

      // Masthead Lanna Tung flag ripple
      const fp = flag.geometry.attributes.position;
      for (let i = 0; i < fp.count; i++) {
        const x = 1 - (i % 9) / 8;
        fp.setZ(i, Math.sin(x * 4.5 - t * (8 + speed * 4)) * (0.14 + speed * 0.06) * x);
      }
      fp.needsUpdate = true;

      // Helmsman scarf wind animation & subtle longtail tiller steering
      const cp = capeGeo.attributes.position;
      for (let i = 0; i < cp.count; i++) {
        const u = 1 - (i % 7) / 6;
        const v = Math.floor(i / 7) / 3;
        cp.setZ(i, Math.sin(u * 5.0 - t * (7 + speed * 5) + v) * (0.12 + speed * 0.08) * u);
        cp.setY(i, (0.5 - v) * 0.36 + Math.sin(u * 3 - t * 6) * 0.06 * u);
      }
      cp.needsUpdate = true;

      const steer = Math.sin(t * 1.4) * 0.08 + smooth(invLerp(12.8, 14.5, st.t)) * -0.16;
      engineGroup.rotation.y = steer;
      propeller.rotation.x = t * (4.0 + speed * 30.0);
      flywheel.rotation.y = t * (4.0 + speed * 24.0);

      // Golden Lotus Attention Lantern bloom & gentle blooming petals in Act 3
      const attnGlow = smooth(invLerp(CUES.beamStart - 0.2, CUES.beamStart + 0.4, st.t)) * (1 - smooth(invLerp(9.0, 9.7, st.t)));
      lampLensMat.uniforms.uGlowAmt.value = 0.35 + attnGlow * 2.1;
      petalInnerMat.uniforms.uGlowAmt.value = 0.20 + attnGlow * 0.85;
      petalOuterMat.uniforms.uGlowAmt.value = 0.10 + attnGlow * 0.50;
      for (const p of outerPetals) p.rotation.x = 0.78 + attnGlow * 0.24;
      for (const p of innerPetals) p.rotation.x = 0.46 + attnGlow * 0.18;
      turret.rotation.y = Math.sin(st.t * 3.2) * 0.20 * (1 - smooth(invLerp(CUES.beamStart, CUES.beamLock, st.t)));

      // Deployable Lanna Silk Main Sail (furled at yard until Act 5, then drops & billows)
      const sailOpen = smooth(invLerp(CUES.sailRaise, CUES.sailFull, st.t));
      const sailHeight = lerp(0.28, 4.35, sailOpen);
      const sailWidth = lerp(2.5, 4.25, sailOpen);
      const billow = lerp(0.08, 1.28, sailOpen);
      const yardY = mTop - 1.35;
      for (let iy = 0; iy <= SAIL_NY; iy++) {
        const v = iy / SAIL_NY;
        for (let ix = 0; ix <= SAIL_NX; ix++) {
          const u = ix / SAIL_NX - 0.5;
          const idx = iy * (SAIL_NX + 1) + ix;
          const arch = Math.sin(v * Math.PI) * Math.cos(u * Math.PI);
          const lx = MX + 0.14 + arch * billow + Math.sin(t * 7 + v * 3) * 0.04 * sailOpen;
          const ly = yardY - v * sailHeight + (1 - Math.cos(u * Math.PI)) * 0.15 * v;
          const lz = u * sailWidth * (0.85 + 0.24 * v);
          sailPos.setXYZ(idx, lx, ly, lz);
        }
      }
      sailPos.needsUpdate = true;
      sailGeo.computeVertexNormals();
      sailMat.uniforms.uGlowAmt.value = sailOpen * 0.14;
    },
  };
}
