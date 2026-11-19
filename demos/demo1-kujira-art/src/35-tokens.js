// ---- AI metaphors: Act 1 Lotus Krathong Sparks, Act 2-3 Yi Peng Khom Loi Constellations, Attention Beams & Act 5 Lighthouse Beam

// Deterministic Act 1 Krathong drop schedule (shared with 50-fx.js & 70-audio.js)
const RAIN_COUNT = 28;
const RAIN_PALETTE = [
  '#ff7eb6', // lotus pink (荷花粉)
  '#ffa938', // marigold orange (金盏菊橙)
  '#5eead4', // pandan leaf green (香兰叶绿)
  '#60c5ff', // sacred river blue (圣水天蓝)
  '#ffd452', // amber gold (琥珀金)
];

const RAIN_DROPS = (() => {
  const rng = new Rng(101);
  const arr = [];
  for (let i = 0; i < RAIN_COUNT; i++) {
    const tHit = lerp(0.32, 2.68, i / (RAIN_COUNT - 1)) + rng.range(-0.04, 0.04);
    const x = rng.range(-19, 9);
    const z = rng.range(-74, -44);
    const speed = rng.range(18, 25);
    const scale = rng.range(0.56, 0.96);
    const color = new THREE.Color(RAIN_PALETTE[i % RAIN_PALETTE.length]);
    const shapeType = i % 3;
    arr.push({
      tHit,
      x,
      z,
      speed,
      scale,
      color,
      shapeType,
      spin: [rng.range(-2, 2), rng.range(-2.5, 2.5), rng.range(-2, 2)],
      seed: rng.next(),
    });
  }
  return arr;
})();

// Faceted polyhedral Lotus Krathong geometry: serrated banana-leaf base, 2 tiers of lotus petals & central candle core
function krathongGeometry() {
  const pos = [];
  const nrm = [];
  const pushTri = (a, b, c) => {
    const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
    const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1;
    nx /= l; ny /= l; nz /= l;
    pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    nrm.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
  };

  // 1. Serrated banana-leaf disc base (16 alternating outer vertices)
  const N_BASE = 16;
  const bot = [0, -0.18, 0];
  const top = [0, 0.04, 0];
  const rim = [];
  for (let i = 0; i < N_BASE; i++) {
    const a = (i / N_BASE) * Math.PI * 2;
    const r = i % 2 === 0 ? 0.62 : 0.48;
    const y = i % 2 === 0 ? 0.01 : -0.04;
    rim.push([Math.cos(a) * r, y, Math.sin(a) * r]);
  }
  for (let i = 0; i < N_BASE; i++) {
    const p1 = rim[i], p2 = rim[(i + 1) % N_BASE];
    pushTri(bot, p1, p2);
    pushTri(top, p2, p1);
  }

  // 2. Lotus petal tiers (outer 8 blooming petals + inner 6 cupped petals)
  const addPetalRing = (count, rIn, rMid, rOut, yBase, yMid, yTip, wAng, phase) => {
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + phase;
      const p0 = [Math.cos(a) * rIn, yBase, Math.sin(a) * rIn];
      const pl = [Math.cos(a - wAng) * rMid, yMid, Math.sin(a - wAng) * rMid];
      const pr = [Math.cos(a + wAng) * rMid, yMid, Math.sin(a + wAng) * rMid];
      const pt = [Math.cos(a) * rOut, yTip, Math.sin(a) * rOut];
      pushTri(p0, pl, pt);
      pushTri(p0, pt, pr);
    }
  };
  addPetalRing(8, 0.22, 0.44, 0.56, 0.03, 0.22, 0.30, 0.26, 0.0);
  addPetalRing(6, 0.14, 0.27, 0.31, 0.07, 0.32, 0.44, 0.32, Math.PI / 6);

  // 3. Central hexagonal crystal candle flame / lotus heart
  const cMid = [];
  const N_CORE = 6;
  for (let i = 0; i < N_CORE; i++) {
    const a = (i / N_CORE) * Math.PI * 2;
    cMid.push([Math.cos(a) * 0.11, 0.31, Math.sin(a) * 0.11]);
  }
  const cBot = [0, 0.16, 0];
  const cTop = [0, 0.56, 0];
  for (let i = 0; i < N_CORE; i++) {
    const m1 = cMid[i], m2 = cMid[(i + 1) % N_CORE];
    pushTri(cBot, m1, m2);
    pushTri(cTop, m2, m1);
  }

  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  return g;
}

function buildTokensAndBeams(scene, overlay, post) {
  // ---- 1. Act 1 Main-scene inked cel Lotus Krathongs (instanced polyhedral floating water lanterns)
  const blockGeo = krathongGeometry();
  const blockCol = new Float32Array(RAIN_COUNT * 3);
  const blockBoost = new Float32Array(RAIN_COUNT);
  RAIN_DROPS.forEach((d, i) => {
    blockCol[i * 3] = d.color.r;
    blockCol[i * 3 + 1] = d.color.g;
    blockCol[i * 3 + 2] = d.color.b;
    blockBoost[i] = 0.25;
  });
  blockGeo.setAttribute('aColor', new THREE.InstancedBufferAttribute(blockCol, 3));
  blockGeo.setAttribute('aBoost', new THREE.InstancedBufferAttribute(blockBoost, 1));
  const blockMat = shaderMat('token_vs', 'token_fs', { ...U, uId: { value: 82 } }, { side: THREE.DoubleSide });
  const blockMesh = new THREE.InstancedMesh(blockGeo, blockMat, RAIN_COUNT);
  blockMesh.frustumCulled = false;
  scene.add(blockMesh);

  // ---- 2. Act 2-4 Overlay Yi Peng Sky Lanterns (Khom Loi) & Semantic Constellations (72 nodes in 4 clusters)
  const STAR_COUNT = 72;
  const CLUSTERS = [
    { center: new THREE.Vector3(-9.5, 4.4, -56.0), radius: 7.4, color: new THREE.Color('#ffcb57'), selected: true, weight: 1.0 },   // C0: warm amber gold (main lantern cluster)
    { center: new THREE.Vector3(-20.5, -1.6, -65.0), radius: 7.8, color: new THREE.Color('#4de6c2'), selected: true, weight: 0.9 },  // C1: emerald teal (water-reflection & low lanterns)
    { center: new THREE.Vector3(2.6, 3.2, -56.0), radius: 6.4, color: new THREE.Color('#ff7eb8'), selected: true, weight: 0.72 },    // C2: rose lotus pink lantern cluster
    { center: new THREE.Vector3(-28.0, 9.0, -88.0), radius: 7.0, color: new THREE.Color('#68b8ff'), selected: false, weight: 0.15 }, // C3: distant sacred blue unfocused cluster
  ];

  const starRng = new Rng(207);
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const cid = Math.floor(i / 18);
    const cl = CLUSTERS[cid];
    const idxInCl = i % 18;
    // Lower initial scatter positions so lanterns rise gracefully from river surface into sky
    const scatterPos = new THREE.Vector3(
      starRng.range(-34, 12),
      starRng.range(-5.0, 6.5),
      starRng.range(-90, -40)
    );
    const ring = idxInCl < 6 ? 0.45 : 1.0;
    const ang = (idxInCl < 6 ? idxInCl / 6 : (idxInCl - 6) / 12) * Math.PI * 2 + cid * 0.4;
    const elev = Math.sin(ang * 2 + cid) * 1.9 + (idxInCl === 0 ? 1.6 : 0);
    const clusterPos = new THREE.Vector3(
      cl.center.x + Math.cos(ang) * cl.radius * ring,
      cl.center.y + elev * ring,
      cl.center.z + Math.sin(ang) * cl.radius * 0.7 * ring
    );
    const shape = i % 5 === 1 ? 1 : (i % 5 === 3 ? 2 : 0); // 60% Khom Loi lantern, 20% lotus starburst, 20% round lantern
    stars.push({
      cid,
      idxInCl,
      scatterPos,
      clusterPos,
      baseColor: cl.color.clone().lerp(new THREE.Color('#fff2d6'), starRng.range(0, 0.22)),
      size: starRng.range(0.50, 0.85),
      phase: starRng.range(0, Math.PI * 2),
      shape,
      seed: starRng.next(),
      curPos: new THREE.Vector3(),
    });
  }

  const starGeo = new THREE.PlaneGeometry(2, 2);
  const starColors = new Float32Array(STAR_COUNT * 3);
  const starMeta = new Float32Array(STAR_COUNT * 3);
  stars.forEach((s, i) => {
    starColors[i * 3] = s.baseColor.r;
    starColors[i * 3 + 1] = s.baseColor.g;
    starColors[i * 3 + 2] = s.baseColor.b;
    starMeta[i * 3] = s.shape;
    starMeta[i * 3 + 1] = 0.35;
    starMeta[i * 3 + 2] = s.seed;
  });
  starGeo.setAttribute('aColor', new THREE.InstancedBufferAttribute(starColors, 3));
  starGeo.setAttribute('aMeta', new THREE.InstancedBufferAttribute(starMeta, 3));

  const starMat = shaderMat('stardust_vs', 'stardust_fs', {
    tData: { value: post.dataTexture },
    uRes: { value: post.resVec },
    uDraw: U.uDraw,
    uOpacity: { value: 0 },
  }, {
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const starMesh = new THREE.InstancedMesh(starGeo, starMat, STAR_COUNT);
  starMesh.frustumCulled = false;
  starMesh.renderOrder = 10;
  overlay.add(starMesh);

  // ---- 3. Dynamic Ribbon Geometry builder for Constellation Links, Golden Lotus Attention Beams & Lighthouse Beam
  function createRibbonSystem(maxSegs, colA, colB, mode) {
    const pos = new Float32Array(maxSegs * 4 * 3);
    const beam = new Float32Array(maxSegs * 4 * 4);
    const idx = [];
    for (let i = 0; i < maxSegs; i++) {
      const b = i * 4;
      idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aBeam', new THREE.BufferAttribute(beam, 4));
    geo.setIndex(idx);
    const mat = shaderMat('beam_vs', 'beam_fs', {
      tData: { value: post.dataTexture },
      uRes: { value: post.resVec },
      uColorA: { value: new THREE.Color(colA) },
      uColorB: { value: new THREE.Color(colB) },
      uTime: U.uTime,
      uDraw: U.uDraw,
      uOpacity: { value: 0 },
      uMode: { value: mode },
    }, {
      transparent: true,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = mode < 0.5 ? 12 : 11;
    overlay.add(mesh);

    const _dir = new THREE.Vector3(), _toCam = new THREE.Vector3(), _perp = new THREE.Vector3(), _mid = new THREE.Vector3();
    return {
      mesh,
      mat,
      write(segs, camPos) {
        const count = Math.min(segs.length, maxSegs);
        geo.setDrawRange(0, count * 6);
        if (count === 0) return;
        for (let i = 0; i < count; i++) {
          const { a, b, w0, w1, weight, phase } = segs[i];
          _dir.subVectors(b, a);
          _mid.copy(a).add(b).multiplyScalar(0.5);
          _toCam.subVectors(camPos, _mid);
          _perp.crossVectors(_dir, _toCam);
          if (_perp.lengthSq() < 1e-6) _perp.set(0, 1, 0);
          _perp.normalize();
          const vBase = i * 4;
          const pOff = vBase * 3;
          const bOff = vBase * 4;
          pos[pOff + 0] = a.x - _perp.x * w0; pos[pOff + 1] = a.y - _perp.y * w0; pos[pOff + 2] = a.z - _perp.z * w0;
          pos[pOff + 3] = a.x + _perp.x * w0; pos[pOff + 4] = a.y + _perp.y * w0; pos[pOff + 5] = a.z + _perp.z * w0;
          pos[pOff + 6] = b.x - _perp.x * w1; pos[pOff + 7] = b.y - _perp.y * w1; pos[pOff + 8] = b.z - _perp.z * w1;
          pos[pOff + 9] = b.x + _perp.x * w1; pos[pOff + 10] = b.y + _perp.y * w1; pos[pOff + 11] = b.z + _perp.z * w1;

          beam[bOff + 0] = 0; beam[bOff + 1] = -1; beam[bOff + 2] = weight; beam[bOff + 3] = phase;
          beam[bOff + 4] = 0; beam[bOff + 5] = 1;  beam[bOff + 6] = weight; beam[bOff + 7] = phase;
          beam[bOff + 8] = 1; beam[bOff + 9] = -1; beam[bOff + 10] = weight; beam[bOff + 11] = phase;
          beam[bOff + 12] = 1; beam[bOff + 13] = 1; beam[bOff + 14] = weight; beam[bOff + 15] = phase;
        }
        geo.attributes.position.needsUpdate = true;
        geo.attributes.aBeam.needsUpdate = true;
      },
    };
  }

  // Constellation links + cross-cluster warm golden attention energy web (mode 1)
  const linkRibbon = createRibbonSystem(140, '#ff9f59', '#ffe078', 1.0);
  // Warm golden lotus attention beams from boat bow (mode 0)
  const beamRibbon = createRibbonSystem(8, '#fff0a6', '#ff9b42', 0.0);
  // Lighthouse rotating beam in Act 5 (mode 0)
  const lighthouseBeamRibbon = createRibbonSystem(2, '#fff0b3', '#ffae52', 0.0);

  const intraEdges = [];
  for (let cid = 0; cid < 4; cid++) {
    const base = cid * 18;
    for (let j = 0; j < 6; j++) {
      intraEdges.push([base + j, base + ((j + 1) % 6), cid]);
      intraEdges.push([base + j, base + 6 + j * 2, cid]);
    }
    for (let j = 0; j < 12; j++) {
      intraEdges.push([base + 6 + j, base + 6 + ((j + 1) % 12), cid]);
    }
  }

  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Sv = new THREE.Vector3(), Pv = new THREE.Vector3(), Eul = new THREE.Euler();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);
  const _emergPos = new THREE.Vector3(WHALE_AT.x + 8, -3.5, WHALE_AT.y);
  const _segs = [], _beamSegs = [], _lhSegs = [];
  const _lampPos = new THREE.Vector3();
  const _lhOrigin = new THREE.Vector3(LIGHTHOUSE_AT.x, 19.5, LIGHTHOUSE_AT.y);
  const _lhTarget = new THREE.Vector3();

  return {
    CLUSTERS,
    update(st, cam, boatLampWorldPos) {
      const t = st.t;
      const td = onTwos(t);

      starMat.uniforms.tData.value = post.dataTexture;
      linkRibbon.mat.uniforms.tData.value = post.dataTexture;
      beamRibbon.mat.uniforms.tData.value = post.dataTexture;
      lighthouseBeamRibbon.mat.uniforms.tData.value = post.dataTexture;

      // ---- A. Act 1 Falling & Floating Lotus Krathongs + Watercolor Ripples
      const activeRipples = [];
      const floatLife = 1.65;
      const rainVis = t < 4.5;
      blockMesh.visible = rainVis;
      if (rainVis) {
        const boostAttr = blockGeo.attributes.aBoost;
        for (let i = 0; i < RAIN_COUNT; i++) {
          const d = RAIN_DROPS[i];
          const dt = d.tHit - t;
          const age = t - d.tHit;

          if (dt > 0 && dt < 1.85) {
            // Descending gently and leveling out before touching the river
            const y = dt * d.speed + 0.16;
            const sw = Math.sin(td * 3.0 + d.seed * 6.28) * 0.24;
            const tiltFade = smooth(invLerp(0.0, 0.55, dt));
            Pv.set(d.x + sw, y, d.z);
            Eul.set(td * d.spin[0] * tiltFade, td * d.spin[1], td * d.spin[2] * tiltFade);
            Q.setFromEuler(Eul);
            const s = d.scale * (0.86 + 0.14 * (1 - tiltFade));
            Sv.set(s, s, s);
            M.compose(Pv, Q, Sv);
            blockMesh.setMatrixAt(i, M);
            boostAttr.setX(i, smooth(invLerp(1.6, 0.0, dt)) * 0.72);
          } else if (age >= 0 && age < floatLife) {
            // Floating gently on the Mae Ping River swells, flickering & fading gracefully into Act 2
            const fx = d.x + Math.sin(td * 0.9 + d.seed * 6.28) * 0.22 + age * 0.32;
            const fz = d.z + Math.cos(td * 0.8 + d.seed * 4.5) * 0.16;
            const bob = Math.exp(-age * 6.5) * Math.sin(age * 16.0) * 0.10;
            const fy = swellAt(fx, fz, td, null) + 0.10 + bob;
            const fade = 1 - smooth(invLerp(0.95, floatLife, age));
            const flicker = 0.82 + 0.28 * Math.sin(t * 13.0 + d.seed * 25.0);
            const s = d.scale * fade;
            if (s > 0.02) {
              Pv.set(fx, fy, fz);
              Eul.set(
                Math.sin(td * 2.1 + d.seed * 6.28) * 0.09,
                td * 0.55 + d.seed * 6.28,
                Math.cos(td * 1.9 + d.seed * 4.1) * 0.09
              );
              Q.setFromEuler(Eul);
              Sv.set(s, s, s);
              M.compose(Pv, Q, Sv);
              blockMesh.setMatrixAt(i, M);
              boostAttr.setX(i, (0.65 + 0.45 * flicker) * fade);
            } else {
              blockMesh.setMatrixAt(i, ZERO);
            }
          } else {
            blockMesh.setMatrixAt(i, ZERO);
          }

          // Water ripple expanding around landed Krathong
          if (age >= 0 && age < floatLife) {
            const rad = 0.45 + age * 4.6;
            const alpha = (1 - smooth(invLerp(0.45, floatLife, age))) * 0.95;
            activeRipples.push({ x: d.x, z: d.z, radius: rad, alpha, age });
          }
        }
        blockMesh.instanceMatrix.needsUpdate = true;
        boostAttr.needsUpdate = true;
        activeRipples.sort((a, b) => a.age - b.age);
        if (activeRipples.length > 10) activeRipples.length = 10;
      }

      // ---- B. Act 2-4 Yi Peng Khom Loi Sky Lanterns & Semantic Constellations
      const starIn = smooth(invLerp(2.75, 3.35, t));
      const starOut = 1 - smooth(invLerp(10.6, 12.2, t));
      const starOp = starIn * starOut;
      starMesh.visible = starOp > 0.01;
      starMat.uniforms.uOpacity.value = starOp;

      if (starOp > 0.01) {
        const rise = smooth(invLerp(2.75, 5.45, t));
        const pull = smooth(invLerp(CUES.clusterPull, 5.45, t));
        const attn = smooth(invLerp(CUES.beamLock - 0.2, CUES.beamLock + 0.5, t));
        const collapse = smooth(invLerp(8.7, 9.6, t));
        const embers = smooth(invLerp(9.6, 10.4, t));
        const colAttr = starGeo.attributes.aColor;
        const metaAttr = starGeo.attributes.aMeta;

        for (let i = 0; i < STAR_COUNT; i++) {
          const s = stars[i];
          const cl = CLUSTERS[s.cid];
          const driftX = Math.sin(t * 1.3 + s.phase) * (1 - pull) * 2.0 + Math.cos(t * 0.8 + s.phase) * 0.45;
          const liftY = (1 - pull) * (rise * 2.2 - 1.0) + Math.sin(t * 1.2 + s.phase * 1.3) * 0.40;
          const driftZ = Math.sin(t * 1.1 - s.phase) * (1 - pull) * 1.8;

          Pv.lerpVectors(s.scatterPos, s.clusterPos, pull);
          Pv.x += driftX; Pv.y += liftY; Pv.z += driftZ;

          if (collapse > 0.001) {
            if (cl.selected) {
              const ang = collapse * Math.PI * 1.6 + s.phase;
              const swirlR = (1 - collapse) * 3.5;
              const target = _emergPos.clone().add(new THREE.Vector3(Math.cos(ang) * swirlR, Math.sin(collapse * Math.PI) * 6.0, Math.sin(ang) * swirlR));
              if (embers > 0.01) {
                target.y += embers * (12.0 + (i % 7) * 4.5);
                target.x += Math.cos(s.phase * 3) * embers * 14.0;
                target.z += Math.sin(s.phase * 3) * embers * 10.0;
              }
              Pv.lerp(target, Math.min(1, collapse * 1.05));
            } else {
              Pv.y -= collapse * 5.0;
            }
          }
          s.curPos.copy(Pv);

          const selBoost = cl.selected ? attn * (0.48 + 0.2 * Math.sin(t * 6.0 + s.phase)) : -attn * 0.65;
          const sz = s.size * (0.68 + 0.32 * pull) * (cl.selected ? 1 + 0.24 * attn : 1 - 0.45 * attn) * (1 - embers * 0.62);
          if (sz <= 0.02) {
            starMesh.setMatrixAt(i, ZERO);
          } else {
            Q.identity();
            Sv.setScalar(sz);
            M.compose(Pv, Q, Sv);
            starMesh.setMatrixAt(i, M);
          }

          const c = s.baseColor.clone();
          if (cl.selected && attn > 0.01) {
            c.lerp(new THREE.Color('#ffd364'), attn * 0.65);
          } else if (!cl.selected && attn > 0.01) {
            c.multiplyScalar(1 - attn * 0.72);
          }
          colAttr.setXYZ(i, c.r, c.g, c.b);
          metaAttr.setY(i, clamp(0.24 + pull * 0.32 + selBoost, 0.0, 1.0));
        }
        starMesh.instanceMatrix.needsUpdate = true;
        colAttr.needsUpdate = true;
        metaAttr.needsUpdate = true;

        // ---- C. Constellation links & Golden Attention Energy Web
        _segs.length = 0;
        const linkAppear = smooth(invLerp(3.9, 5.2, t)) * (1 - smooth(invLerp(9.6, 10.5, t)));
        if (linkAppear > 0.01) {
          for (const [ia, ib, cid] of intraEdges) {
            const cl = CLUSTERS[cid];
            const w = cl.selected ? (0.45 + 0.65 * attn) : (0.42 * (1 - attn * 0.85));
            _segs.push({
              a: stars[ia].curPos,
              b: stars[ib].curPos,
              w0: 0.14 + (cl.selected ? attn * 0.12 : 0),
              w1: 0.14 + (cl.selected ? attn * 0.12 : 0),
              weight: w,
              phase: (ia * 0.17) % 1,
            });
          }
          if (attn > 0.02) {
            const hubPairs = [
              [0, 18], [2, 22], [4, 24],
              [0, 36], [3, 39], [1, 41],
              [19, 37], [21, 40], [23, 42],
            ];
            for (let k = 0; k < hubPairs.length; k++) {
              const [ia, ib] = hubPairs[k];
              _segs.push({
                a: stars[ia].curPos,
                b: stars[ib].curPos,
                w0: 0.28 * attn,
                w1: 0.28 * attn,
                weight: 1.05 * attn,
                phase: k * 0.23,
              });
            }
            const conv = smooth(invLerp(7.4, 9.1, t));
            if (conv > 0.01) {
              for (const idxCenter of [0, 18, 36, 4, 22, 40]) {
                _segs.push({
                  a: stars[idxCenter].curPos,
                  b: _emergPos,
                  w0: 0.22 * conv,
                  w1: 0.52 * conv,
                  weight: 1.2 * conv,
                  phase: idxCenter * 0.11,
                });
              }
            }
          }
          linkRibbon.mat.uniforms.uOpacity.value = linkAppear;
          linkRibbon.write(_segs, cam.position);
        } else {
          linkRibbon.mat.uniforms.uOpacity.value = 0;
          linkRibbon.write([], cam.position);
        }
      } else {
        linkRibbon.mat.uniforms.uOpacity.value = 0;
        linkRibbon.write([], cam.position);
      }

      // ---- D. Act 3 Warm Golden Attention Beams from Bow Lotus Lantern to Khom Loi Constellations & River Vortex
      _beamSegs.length = 0;
      const beamIn = smooth(invLerp(CUES.beamStart, CUES.beamStart + 0.55, t));
      const beamOut = 1 - smooth(invLerp(8.9, 9.65, t));
      const beamOp = beamIn * beamOut;
      if (beamOp > 0.01 && boatLampWorldPos) {
        _lampPos.copy(boatLampWorldPos);
        const lock = smooth(invLerp(CUES.beamStart, CUES.beamLock + 0.25, t));
        const sweepX = Math.sin(t * 5.0) * (1 - lock) * 10.0;
        const targets = [
          { p: CLUSTERS[0].center.clone().add(new THREE.Vector3(sweepX, 0, 0)), w1: 3.1, weight: 0.95, ph: 0.0 },
          { p: CLUSTERS[1].center.clone().add(new THREE.Vector3(-sweepX * 0.7, 0, 0)), w1: 3.6, weight: 0.90, ph: 0.35 },
          { p: CLUSTERS[2].center.clone().add(new THREE.Vector3(sweepX * 0.5, 0, 0)), w1: 2.6, weight: 0.72, ph: 0.7 },
          { p: _emergPos.clone(), w1: 4.0, weight: smooth(invLerp(7.3, 8.6, t)) * 1.0, ph: 0.5 },
        ];
        for (const tg of targets) {
          if (tg.weight <= 0.02) continue;
          const endP = tg.p.clone().sub(_lampPos).multiplyScalar(1.16).add(_lampPos);
          _beamSegs.push({ a: _lampPos, b: endP, w0: 0.24, w1: tg.w1, weight: tg.weight, phase: tg.ph });
        }
        beamRibbon.mat.uniforms.uOpacity.value = beamOp;
        beamRibbon.write(_beamSegs, cam.position);
      } else {
        beamRibbon.mat.uniforms.uOpacity.value = 0;
        beamRibbon.write([], cam.position);
      }

      // ---- E. Act 5 Distant Lighthouse Guarding Beam
      _lhSegs.length = 0;
      const lhOp = smooth(invLerp(12.8, 14.0, t)) * 0.85;
      if (lhOp > 0.01) {
        const ang = -0.35 + Math.sin(t * 1.1) * 0.45;
        _lhTarget.set(
          _lhOrigin.x + Math.cos(ang) * 75,
          _lhOrigin.y - 6,
          _lhOrigin.z + Math.sin(ang) * 75
        );
        _lhSegs.push({ a: _lhOrigin, b: _lhTarget, w0: 0.45, w1: 8.5, weight: 0.95, phase: 0.2 });
        lighthouseBeamRibbon.mat.uniforms.uOpacity.value = lhOp;
        lighthouseBeamRibbon.write(_lhSegs, cam.position);
      } else {
        lighthouseBeamRibbon.mat.uniforms.uOpacity.value = 0;
        lighthouseBeamRibbon.write([], cam.position);
      }

      return { activeRipples, rainDrops: RAIN_DROPS };
    },
  };
}
