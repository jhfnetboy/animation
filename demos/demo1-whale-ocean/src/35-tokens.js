// ---- AI metaphors: Act 1 Token Raindrops, Act 2 Semantic Constellations, Act 3 Attention Searchlights & Energy Web, Act 5 Lighthouse Beam

// Deterministic Act 1 raindrop schedule (also shared with 70-audio.js so sound chimes align with water hits!)
const RAIN_COUNT = 28;
const RAIN_PALETTE = [
  '#ff8a4c', // coral orange
  '#45d0f5', // sky cyan
  '#ffd15c', // amber gold
  '#6ee7b7', // mint teal
  '#f472b6', // blossom pink
  '#93c5fd', // periwinkle blue
];

const RAIN_DROPS = (() => {
  const rng = new Rng(101);
  const arr = [];
  for (let i = 0; i < RAIN_COUNT; i++) {
    const tHit = lerp(0.32, 2.68, i / (RAIN_COUNT - 1)) + rng.range(-0.04, 0.04);
    const x = rng.range(-19, 9);
    const z = rng.range(-74, -44);
    const speed = rng.range(18, 25);
    const scale = rng.range(0.52, 0.92);
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

function buildTokensAndBeams(scene, overlay, post) {
  // ---- 1. Act 1 Main-scene inked cel token blocks (Octahedron / Box / Prism packed via InstancedMesh)
  const blockGeo = new THREE.OctahedronGeometry(0.65, 0);
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

  // ---- 2. Act 2-4 Overlay Semantic Stardust & Underwater Token Fish (72 nodes in 4 semantic clusters)
  const STAR_COUNT = 72;
  const CLUSTERS = [
    { center: new THREE.Vector3(-9.5, 3.6, -56.0), radius: 7.2, color: new THREE.Color('#ffd166'), selected: true, weight: 1.0 },   // C0: warm gold (above/near water)
    { center: new THREE.Vector3(-21.0, -3.2, -65.0), radius: 7.8, color: new THREE.Color('#4be8e0'), selected: true, weight: 0.9 },  // C1: underwater cyan constellation
    { center: new THREE.Vector3(2.5, 2.4, -56.0), radius: 6.2, color: new THREE.Color('#ff8e6e'), selected: true, weight: 0.72 },   // C2: coral amber
    { center: new THREE.Vector3(-28.0, 8.2, -88.0), radius: 7.0, color: new THREE.Color('#8ab8ff'), selected: false, weight: 0.15 }, // C3: distant unfocused cluster
  ];

  const starRng = new Rng(207);
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    const cid = Math.floor(i / 18);
    const cl = CLUSTERS[cid];
    const idxInCl = i % 18;
    // Scatter positions across the sea and low sky
    const scatterPos = new THREE.Vector3(
      starRng.range(-34, 12),
      starRng.range(-6.5, 11.5),
      starRng.range(-90, -40)
    );
    // Clean geometric constellation layout (inner hexagon + outer star ring)
    const ring = idxInCl < 6 ? 0.45 : 1.0;
    const ang = (idxInCl < 6 ? idxInCl / 6 : (idxInCl - 6) / 12) * Math.PI * 2 + cid * 0.4;
    const elev = Math.sin(ang * 2 + cid) * 1.8 + (idxInCl === 0 ? 1.5 : 0);
    const clusterPos = new THREE.Vector3(
      cl.center.x + Math.cos(ang) * cl.radius * ring,
      cl.center.y + elev * ring,
      cl.center.z + Math.sin(ang) * cl.radius * 0.7 * ring
    );
    stars.push({
      cid,
      idxInCl,
      scatterPos,
      clusterPos,
      baseColor: cl.color.clone().lerp(new THREE.Color('#ffffff'), starRng.range(0, 0.22)),
      size: starRng.range(0.40, 0.72),
      phase: starRng.range(0, Math.PI * 2),
      shape: i % 3,
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
    starMeta[i * 3 + 1] = 0.3;
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

  // ---- 3. Dynamic Ribbon Geometry builder for Constellation Links, Searchlights & Lighthouse Beam
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
          // v0: a - w0, v1: a + w0, v2: b - w1, v3: b + w1
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

  // Constellation links + cross-cluster attention energy web (mode 1)
  const linkRibbon = createRibbonSystem(140, '#49e4f5', '#ffd166', 1.0);
  // Boat attention searchlights (mode 0)
  const beamRibbon = createRibbonSystem(8, '#ffe082', '#4ae3ff', 0.0);
  // Lighthouse rotating beam in Act 5 (mode 0)
  const lighthouseBeamRibbon = createRibbonSystem(2, '#fff0b3', '#ffae52', 0.0);

  // Constellation edges (deterministic ring + inner spokes per cluster)
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

      // Update shared texture handle in case Post resized
      starMat.uniforms.tData.value = post.dataTexture;
      linkRibbon.mat.uniforms.tData.value = post.dataTexture;
      beamRibbon.mat.uniforms.tData.value = post.dataTexture;
      lighthouseBeamRibbon.mat.uniforms.tData.value = post.dataTexture;

      // ---- A. Act 1 Token Raindrops & Active Ripples
      const activeRipples = [];
      const rainVis = t < 3.6;
      blockMesh.visible = rainVis;
      if (rainVis) {
        const boostAttr = blockGeo.attributes.aBoost;
        for (let i = 0; i < RAIN_COUNT; i++) {
          const d = RAIN_DROPS[i];
          const dt = d.tHit - t;
          if (dt > 0 && dt < 1.8) {
            const y = dt * d.speed + 0.35;
            const sw = Math.sin(td * 3.0 + d.seed * 6.28) * 0.25;
            Pv.set(d.x + sw, y, d.z);
            Eul.set(td * d.spin[0], td * d.spin[1], td * d.spin[2]);
            Q.setFromEuler(Eul);
            const sx = d.shapeType === 1 ? d.scale * 1.45 : d.scale;
            const sy = d.shapeType === 2 ? d.scale * 1.55 : d.scale;
            Sv.set(sx, sy, d.scale);
            M.compose(Pv, Q, Sv);
            blockMesh.setMatrixAt(i, M);
            boostAttr.setX(i, smooth(invLerp(1.6, 0.0, dt)) * 0.65);
          } else {
            blockMesh.setMatrixAt(i, ZERO);
          }
          // Water ripple after hit
          const age = t - d.tHit;
          if (age >= 0 && age < 1.55) {
            const rad = 0.5 + age * 4.8;
            const alpha = (1 - smooth(invLerp(0.45, 1.55, age))) * 0.95;
            activeRipples.push({ x: d.x, z: d.z, radius: rad, alpha, age });
          }
        }
        blockMesh.instanceMatrix.needsUpdate = true;
        boostAttr.needsUpdate = true;
        // Keep newest 10 active ripples
        activeRipples.sort((a, b) => a.age - b.age);
        if (activeRipples.length > 10) activeRipples.length = 10;
      }

      // ---- B. Act 2-4 Semantic Stardust & Constellations
      const starIn = smooth(invLerp(2.75, 3.35, t));
      const starOut = 1 - smooth(invLerp(10.6, 12.2, t));
      const starOp = starIn * starOut;
      starMesh.visible = starOp > 0.01;
      starMat.uniforms.uOpacity.value = starOp;

      if (starOp > 0.01) {
        const pull = smooth(invLerp(CUES.clusterPull, 5.45, t));
        const attn = smooth(invLerp(CUES.beamLock - 0.2, CUES.beamLock + 0.5, t));
        const collapse = smooth(invLerp(8.7, 9.6, t));
        const embers = smooth(invLerp(9.6, 10.4, t));
        const colAttr = starGeo.attributes.aColor;
        const metaAttr = starGeo.attributes.aMeta;

        for (let i = 0; i < STAR_COUNT; i++) {
          const s = stars[i];
          const cl = CLUSTERS[s.cid];
          // Swimming motion in scatter phase, gentle orbiting in constellation phase
          const swimX = Math.sin(t * 1.4 + s.phase) * (1 - pull) * 2.2 + Math.cos(t * 0.9 + s.phase) * 0.45;
          const swimY = Math.cos(t * 1.6 + s.phase * 1.3) * (1 - pull) * 1.2 + Math.sin(t * 1.1 + s.phase) * 0.3;
          const swimZ = Math.sin(t * 1.2 - s.phase) * (1 - pull) * 2.0;

          Pv.lerpVectors(s.scatterPos, s.clusterPos, pull);
          Pv.x += swimX; Pv.y += swimY; Pv.z += swimZ;

          if (collapse > 0.001) {
            if (cl.selected) {
              // Spiral inward toward whale emergence center, then burst into golden embers
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
              Pv.y -= collapse * 6.0;
            }
          }
          s.curPos.copy(Pv);

          // Attention selection brightening vs unfocused dimming
          const selBoost = cl.selected ? attn * (0.45 + 0.2 * Math.sin(t * 6.0 + s.phase)) : -attn * 0.65;
          const sz = s.size * (0.65 + 0.35 * pull) * (cl.selected ? 1 + 0.25 * attn : 1 - 0.45 * attn) * (1 - embers * 0.65);
          if (sz <= 0.02) {
            starMesh.setMatrixAt(i, ZERO);
          } else {
            Q.identity();
            Sv.setScalar(sz);
            M.compose(Pv, Q, Sv);
            starMesh.setMatrixAt(i, M);
          }

          // Color shift toward blazing gold when attended in Act 3
          const c = s.baseColor.clone();
          if (cl.selected && attn > 0.01) {
            c.lerp(new THREE.Color('#ffcf5c'), attn * 0.65);
          } else if (!cl.selected && attn > 0.01) {
            c.multiplyScalar(1 - attn * 0.75);
          }
          colAttr.setXYZ(i, c.r, c.g, c.b);
          metaAttr.setY(i, clamp(0.20 + pull * 0.30 + selBoost, 0.0, 1.0));
        }
        starMesh.instanceMatrix.needsUpdate = true;
        colAttr.needsUpdate = true;
        metaAttr.needsUpdate = true;

        // ---- C. Constellation links & Attention Energy Web
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
          // Cross-cluster golden attention energy network in Act 3
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
            // Flowing convergence threads down into WHALE_AT center
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

      // ---- D. Act 3 Searchlight Beams from Boat Lamp to Selected Clusters
      _beamSegs.length = 0;
      const beamIn = smooth(invLerp(CUES.beamStart, CUES.beamStart + 0.55, t));
      const beamOut = 1 - smooth(invLerp(8.9, 9.65, t));
      const beamOp = beamIn * beamOut;
      if (beamOp > 0.01 && boatLampWorldPos) {
        _lampPos.copy(boatLampWorldPos);
        // First 0.6s sweep gently before locking onto C0, C1, C2 and deep emergence point
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
