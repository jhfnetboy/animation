// ---- Sacred White Elephant (Chang Phueak): Lanna cel lofting with trunk, twin tusks, giant ears & leaping limbs
const W_L = 48, W_R = 8.4, W_NS = 128, W_NR = 42;
const TRUNK_U = 0.26;
const W_PROFILE = [
  [0.00, 0.012],
  [0.02, 0.068],
  [0.06, 0.072],
  [0.13, 0.115],
  [0.20, 0.175],
  [0.25, 0.265],
  [0.28, 0.520],
  [0.33, 0.800],
  [0.38, 0.770],
  [0.42, 0.720], // subtle neck groove distinguishing head from shoulder
  [0.48, 0.960], // towering Lanna elephant shoulder ridge
  [0.59, 1.040], // broad rounded barrel torso
  [0.72, 0.940], // rounded hindquarters
  [0.83, 0.680],
  [0.89, 0.280],
  [0.92, 0.085], // slender tail root
  [0.97, 0.055],
  [0.988, 0.078], // tail hair tuft
  [1.00, 0.012],
];

function profile(u) {
  if (u <= 0) return W_PROFILE[0][1];
  for (let i = 1; i < W_PROFILE.length; i++) {
    if (u <= W_PROFILE[i][0]) {
      const [a, ra] = W_PROFILE[i - 1], [b, rb] = W_PROFILE[i];
      return lerp(ra, rb, smooth((u - a) / (b - a)));
    }
  }
  return 0.012;
}

// Closed-seam parametric grid: (nr + 1) columns per ring so UV.y is continuous (-1..+1) without wrap artifacts
function gridGeometry(ns, nr) {
  const stride = nr + 1;
  const g = new THREE.BufferGeometry();
  const pos = new Float32Array(ns * stride * 3);
  const uv = new Float32Array(ns * stride * 2);
  const idx = [];
  for (let i = 0; i < ns; i++) {
    const u = i / (ns - 1);
    for (let j = 0; j < stride; j++) {
      const k = i * stride + j;
      uv[k * 2] = u;
      uv[k * 2 + 1] = (j / nr) * 2 - 1;
    }
  }
  for (let i = 0; i < ns - 1; i++) {
    for (let j = 0; j < nr; j++) {
      const a = i * stride + j, b = a + 1, c = a + stride, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aUV', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

function weldSeamNormals(geo, ns, nr) {
  const nrm = geo.attributes.normal.array;
  const stride = nr + 1;
  for (let i = 0; i < ns; i++) {
    const k0 = i * stride * 3;
    const k1 = (i * stride + nr) * 3;
    const nx = nrm[k0] + nrm[k1];
    const ny = nrm[k0 + 1] + nrm[k1 + 1];
    const nz = nrm[k0 + 2] + nrm[k1 + 2];
    const l2 = nx * nx + ny * ny + nz * nz;
    if (l2 > 1e-10) {
      const inv = 1 / Math.sqrt(l2);
      nrm[k0] = nrm[k1] = nx * inv;
      nrm[k0 + 1] = nrm[k1 + 1] = ny * inv;
      nrm[k0 + 2] = nrm[k1 + 2] = nz * inv;
    }
  }
  geo.attributes.normal.needsUpdate = true;
}

function buildWhale(scene) {
  const root = new THREE.Group();
  scene.add(root);
  const uEmergence = { value: 0 };
  const mk = (part, id, ns, nr) => {
    const m = new THREE.Mesh(
      gridGeometry(ns, nr),
      shaderMat('whale_vs', 'whale_fs', { ...U, uPart: { value: part }, uId: { value: id }, uWet: { value: 1 }, uEmergence }, { side: THREE.DoubleSide })
    );
    m.frustumCulled = false;
    m.userData.ns = ns;
    m.userData.nr = nr;
    root.add(m);
    return m;
  };

  // Part 0 (id 1): Body, twin-domed head, dynamic S-curve trunk & tail
  const body = mk(0, 1, W_NS, W_NR);
  // Part 1 (id 2): Left & right giant fanning elephant ears
  const ears = [mk(1, 2, 28, 18), mk(1, 2, 28, 18)];
  // Part 3 (id 3): Golden-tipped twin ivory tusks
  const tusks = [mk(3, 3, 24, 14), mk(3, 3, 24, 14)];
  // Part 2 (ids 4..7): Four leaping elephant legs (front L/R, hind L/R)
  const legs = [mk(2, 4, 28, 18), mk(2, 5, 28, 18), mk(2, 6, 28, 18), mk(2, 7, 28, 18)];

  const P = new THREE.Vector3(), T = new THREE.Vector3(), N = new THREE.Vector3(), B = new THREE.Vector3();
  const P0 = new THREE.Vector3(), T0 = new THREE.Vector3(), N0 = new THREE.Vector3(), B0 = new THREE.Vector3();
  const _pA = new THREE.Vector3(), _pB = new THREE.Vector3();
  const f = new THREE.Vector3(), n = new THREE.Vector3(), tmp = new THREE.Vector3();
  const q = new THREE.Quaternion(), eul = new THREE.Euler();

  function setDir(pose) {
    q.setFromEuler(eul.set(pose.pitch, pose.yaw, pose.roll, 'YXZ'));
    f.set(0, 0, -1).applyQuaternion(q);
    n.set(0, 1, 0).applyQuaternion(q);
  }

  // Base body spine frame (u = 0.26..1.0); rigid elephant torso with tail droop/wag at u > 0.87
  function baseFrame(pose, u, outP, outT, outN, outB) {
    const s = u * W_L, k = pose.bend / W_L, a = k * s;
    if (Math.abs(k) < 1e-5) outP.copy(pose.head).addScaledVector(f, -s);
    else outP.copy(pose.head).addScaledVector(f, -Math.sin(a) / k).addScaledVector(n, (1 - Math.cos(a)) / k);
    outT.copy(f).multiplyScalar(Math.cos(a)).addScaledVector(n, -Math.sin(a));
    outN.copy(n).multiplyScalar(Math.cos(a)).addScaledVector(f, Math.sin(a));
    outB.crossVectors(outT, outN).normalize();
    if (u > 0.87) {
      const tw = (u - 0.87) / 0.13;
      const drop = -3.6 * tw * tw;
      const wag = Math.sin(pose.phase * 3.8 + tw * 2.5) * tw * 1.45;
      outP.addScaledVector(outN, drop).addScaledVector(outB, wag);
    }
  }

  // S-curved jubilant trunk centerline anchored at u = TRUNK_U -> tip u = 0
  function trunkPoint(pose, u, out) {
    const tr = clamp((TRUNK_U - u) / TRUNK_U);
    const L_TRUNK = 15.8;
    const sway = Math.sin(pose.phase * 2.2) * 0.14 + (pose.flap - 0.45) * 0.20;
    const dx = L_TRUNK * (0.28 * tr + 0.72 * Math.sin(tr * Math.PI * 0.66) - 0.17 * tr * tr * tr);
    const dy = -4.0 * Math.sin(tr * Math.PI * 0.84) + 12.8 * Math.pow(tr, 2.3) * (1 + sway);
    const dz = Math.sin(tr * Math.PI) * Math.sin(pose.phase * 1.7) * 0.65;
    out.copy(P0).addScaledVector(T0, dx).addScaledVector(N0, dy).addScaledVector(B0, dz);
  }

  function frame(pose, u) {
    if (u >= TRUNK_U) {
      baseFrame(pose, u, P, T, N, B);
      return;
    }
    baseFrame(pose, TRUNK_U, P0, T0, N0, B0);
    trunkPoint(pose, u, P);
    const eps = 0.004;
    trunkPoint(pose, Math.max(0, u - eps), _pA);
    trunkPoint(pose, Math.min(TRUNK_U, u + eps), _pB);
    T.subVectors(_pA, _pB).normalize();
    N.crossVectors(B0, T).normalize();
    B.crossVectors(T, N).normalize();
    // Smooth blend near trunk root so head-to-trunk normals transition seamlessly
    const tr = clamp((TRUNK_U - u) / TRUNK_U);
    const blend = smooth(tr / 0.14);
    if (blend < 1) {
      T.lerp(T0, 1 - blend).normalize();
      N.lerp(N0, 1 - blend).normalize();
      B.crossVectors(T, N).normalize();
    }
  }

  // Giant scalloped elephant ear lofting
  function loftEar(mesh, root0, dir, cdir, tdir, len, chordAt, thickAt, side) {
    const g = mesh.geometry, pa = g.attributes.position.array;
    const ns = mesh.userData.ns, nr = mesh.userData.nr, stride = nr + 1;
    for (let i = 0; i < ns; i++) {
      const v = i / (ns - 1);
      const c = chordAt(v), th = thickAt(v);
      const cup = -Math.sin(v * Math.PI * 0.85) * 1.15; // cupped forward-inward ear curve
      const sweep = -Math.pow(v, 1.6) * 1.6;
      for (let j = 0; j < nr; j++) {
        const ph = (j / nr) * Math.PI * 2;
        const x = Math.cos(ph) * c * 0.5 - c * 0.16;
        const y = Math.sin(ph) * th * (0.65 + 0.35 * Math.cos(ph));
        const rimWave = Math.sin(ph * 3.0) * 0.08 * smooth(invLerp(0.4, 0.95, v));
        tmp.copy(root0)
          .addScaledVector(dir, v * len)
          .addScaledVector(cdir, x + sweep + rimWave)
          .addScaledVector(tdir, y + cup * side);
        pa.set([tmp.x, tmp.y, tmp.z], (i * stride + j) * 3);
      }
      const k0 = i * stride * 3, kn = (i * stride + nr) * 3;
      pa[kn] = pa[k0]; pa[kn + 1] = pa[k0 + 1]; pa[kn + 2] = pa[k0 + 2];
    }
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
    weldSeamNormals(g, ns, nr);
  }

  // Generic cubic Bezier tubular limb lofting for tusks & four leaping elephant legs
  const _cP = new THREE.Vector3(), _cT = new THREE.Vector3(), _cN = new THREE.Vector3(), _cB = new THREE.Vector3(), _ref = new THREE.Vector3();
  function bezierPt(p0, p1, p2, p3, t, out) {
    const it = 1 - t, it2 = it * it, t2 = t * t;
    out.set(0, 0, 0)
      .addScaledVector(p0, it2 * it)
      .addScaledVector(p1, 3 * it2 * t)
      .addScaledVector(p2, 3 * it * t2)
      .addScaledVector(p3, t2 * t);
  }
  function bezierTan(p0, p1, p2, p3, t, out) {
    const it = 1 - t;
    out.set(0, 0, 0)
      .addScaledVector(p1, 3 * it * it).addScaledVector(p0, -3 * it * it)
      .addScaledVector(p2, 6 * it * t).addScaledVector(p1, -6 * it * t)
      .addScaledVector(p3, 3 * t * t).addScaledVector(p2, -3 * t * t);
    if (out.lengthSq() < 1e-8) out.subVectors(p3, p0);
    out.normalize();
  }

  function loftTubeLimb(mesh, p0, p1, p2, p3, refAxis, radiusAt, toeFlute = 0) {
    const g = mesh.geometry, pa = g.attributes.position.array;
    const ns = mesh.userData.ns, nr = mesh.userData.nr, stride = nr + 1;
    for (let i = 0; i < ns; i++) {
      const v = i / (ns - 1);
      bezierPt(p0, p1, p2, p3, v, _cP);
      bezierTan(p0, p1, p2, p3, v, _cT);
      _ref.copy(refAxis);
      if (Math.abs(_cT.dot(_ref)) > 0.94) _ref.copy(T);
      _cN.crossVectors(_ref, _cT).normalize();
      _cB.crossVectors(_cT, _cN).normalize();
      const rad = radiusAt(v);
      const toeW = toeFlute > 0 ? smooth(invLerp(0.84, 0.97, v)) * (1 - smooth(invLerp(0.97, 1.0, v))) * toeFlute : 0;
      for (let j = 0; j < nr; j++) {
        const ph = (j / nr) * Math.PI * 2;
        const flute = 1 + toeW * Math.abs(Math.sin(ph * 2.5));
        const r = rad * flute;
        tmp.copy(_cP).addScaledVector(_cN, Math.cos(ph) * r).addScaledVector(_cB, Math.sin(ph) * r);
        pa.set([tmp.x, tmp.y, tmp.z], (i * stride + j) * 3);
      }
      const k0 = i * stride * 3, kn = (i * stride + nr) * 3;
      pa[kn] = pa[k0]; pa[kn + 1] = pa[k0 + 1]; pa[kn + 2] = pa[k0 + 2];
    }
    g.attributes.position.needsUpdate = true;
    g.computeVertexNormals();
    weldSeamNormals(g, ns, nr);
  }

  const d = new THREE.Vector3(), cd = new THREE.Vector3(), td = new THREE.Vector3(), r0 = new THREE.Vector3();
  const q0 = new THREE.Vector3(), q1 = new THREE.Vector3(), q2 = new THREE.Vector3(), q3 = new THREE.Vector3();

  return {
    root,
    uEmergence,
    pose(pose, visible = true, emergence = 0) {
      root.visible = visible;
      uEmergence.value = emergence;
      if (!visible) return;
      setDir(pose);

      // 1. Body, twin-domed forehead, S-curved trunk & tail
      const pa = body.geometry.attributes.position.array;
      const stride = W_NR + 1;
      for (let i = 0; i < W_NS; i++) {
        const u = i / (W_NS - 1);
        frame(pose, u);
        const r = profile(u) * W_R;
        const trunkRing = u < TRUNK_U ? 1 + 0.036 * Math.sin(u * 310) * smooth(invLerp(0.015, 0.08, u)) : 1;
        const headDomeW = u > 0.25 && u < 0.39 ? Math.sin(invLerp(0.25, 0.39, u) * Math.PI) : 0;
        const shoulderW = u > 0.43 && u < 0.63 ? Math.sin(invLerp(0.43, 0.63, u) * Math.PI) : 0;
        const lipTip = u > 0.004 && u < 0.028 ? Math.sin(invLerp(0.004, 0.028, u) * Math.PI) : 0;

        for (let j = 0; j < W_NR; j++) {
          const th = (j / W_NR) * Math.PI * 2 - Math.PI;
          const c = Math.cos(th), s = Math.sin(th);

          // Cross-section aspect: round trunk, taller powerful elephant torso
          let rx = u < TRUNK_U ? r * 0.94 * trunkRing : r * 0.90;
          let ry = u < TRUNK_U ? r * 1.03 * trunkRing : (s > 0 ? r * 1.14 : r * 1.02);

          // Thai elephant twin cranial domes on forehead
          if (headDomeW > 0 && s > 0.12) {
            const lobe = Math.exp(-Math.pow((Math.abs(c) - 0.44) / 0.30, 2));
            const cleft = Math.exp(-Math.pow(c / 0.20, 2));
            ry *= 1 + headDomeW * Math.max(0, s - 0.12) * (0.28 * lobe - 0.07 * cleft);
          }
          // Cheek & lower jaw taper below forehead
          if (u > 0.25 && u < 0.35 && s < -0.15) {
            const jawTaper = Math.sin(invLerp(0.25, 0.35, u) * Math.PI);
            rx *= 1 - 0.18 * jawTaper * (-s);
          }
          // Elevated elephant shoulder ridge
          if (shoulderW > 0 && s > 0.35) {
            ry *= 1 + 0.14 * shoulderW * ((s - 0.35) / 0.65);
          }
          // Subtle trunk-tip upper lip finger flare
          if (lipTip > 0 && s > 0.2) {
            ry += lipTip * 0.22 * s;
          }

          tmp.copy(P).addScaledVector(B, c * rx).addScaledVector(N, s * ry);
          pa.set([tmp.x, tmp.y, tmp.z], (i * stride + j) * 3);
        }
        const k0 = i * stride * 3, kn = (i * stride + W_NR) * 3;
        pa[kn] = pa[k0]; pa[kn + 1] = pa[k0 + 1]; pa[kn + 2] = pa[k0 + 2];
      }
      body.geometry.attributes.position.needsUpdate = true;
      body.geometry.computeVertexNormals();
      weldSeamNormals(body.geometry, W_NS, W_NR);

      // 2. Giant fanning elephant ears at rear of head (u = 0.345)
      frame(pose, 0.345);
      const rHead = profile(0.345) * W_R;
      for (const side of [1, -1]) {
        const sp = side > 0 ? pose.flap : pose.flap * 0.92 + 0.06;
        const flare = smooth(invLerp(0.15, 0.85, sp));
        r0.copy(P).addScaledVector(B, side * rHead * 0.68).addScaledVector(N, rHead * 0.24);
        d.copy(B).multiplyScalar(side * lerp(0.55, 0.92, flare))
          .addScaledVector(T, lerp(-0.74, -0.44, flare))
          .addScaledVector(N, lerp(0.14, 0.32, flare))
          .normalize();
        cd.copy(N).addScaledVector(T, -0.22).addScaledVector(d, -N.dot(d)).normalize();
        td.crossVectors(d, cd).normalize().multiplyScalar(side);
        loftEar(
          ears[side > 0 ? 0 : 1], r0, d, cd, td, 9.4,
          (v) => {
            const env = Math.sin(Math.pow(v, 0.65) * Math.PI * 0.96);
            const lobe = v < 0.15 ? lerp(3.4, 7.6, v / 0.15) : 8.6 * env + 0.45;
            const scallop = 0.32 * Math.sin(v * 18.0) * smooth(invLerp(0.32, 0.92, v)) * (1 - v);
            return Math.max(0.18, lobe + scallop);
          },
          (v) => Math.max(0.06, 0.95 * Math.pow(1 - v, 0.65) + 0.06),
          side
        );
      }

      // 3. Symmetrical golden-tipped ivory tusks curving forward & upward from cheeks (u = 0.265)
      frame(pose, 0.265);
      const rMouth = profile(0.265) * W_R;
      for (const side of [1, -1]) {
        const idx = side > 0 ? 0 : 1;
        q0.copy(P).addScaledVector(B, side * rMouth * 0.50).addScaledVector(N, -rMouth * 0.42).addScaledVector(T, -0.6);
        q1.copy(q0).addScaledVector(T, 3.8).addScaledVector(N, -2.0).addScaledVector(B, side * 1.35);
        q2.copy(q0).addScaledVector(T, 7.8).addScaledVector(N, -0.6).addScaledVector(B, side * 1.75);
        q3.copy(q0).addScaledVector(T, 10.4).addScaledVector(N, 3.8).addScaledVector(B, side * 1.00);
        loftTubeLimb(
          tusks[idx], q0, q1, q2, q3, N,
          (v) => Math.max(0.015, 0.78 * Math.pow(1 - v * 0.94, 0.72) * (1 - smooth(invLerp(0.95, 1.0, v)) * 0.82))
        );
      }

      // 4. Four powerful leaping elephant legs (front pair kicking forward, hind pair thrusting back)
      const legSwing = Math.sin(pose.phase * 2.4) * 0.9 + (pose.flap - 0.42) * 1.6;
      const legRadius = (rTop, rAnkle, padBoost) => (v) => {
        const taper = lerp(rTop, rAnkle, smooth(invLerp(0.0, 0.76, v)));
        const footPad = smooth(invLerp(0.76, 0.93, v)) * padBoost;
        const cap = 1 - smooth(invLerp(0.955, 1.0, v)) * 0.96;
        return Math.max(0.04, (taper + footPad) * cap);
      };
      const frontR = legRadius(2.55, 1.52, 0.42);
      const hindR = legRadius(2.45, 1.45, 0.40);

      frame(pose, 0.47);
      const rSh = profile(0.47) * W_R;
      for (const side of [1, -1]) {
        const idx = side > 0 ? 0 : 1;
        const off = side * legSwing;
        q0.copy(P).addScaledVector(B, side * rSh * 0.56).addScaledVector(N, -rSh * 0.46);
        q1.copy(q0).addScaledVector(N, -4.1).addScaledVector(T, -1.0 + off * 0.3).addScaledVector(B, side * 0.55);
        q2.copy(q0).addScaledVector(N, -6.7).addScaledVector(T, 3.2 + off * 0.65).addScaledVector(B, side * 0.40);
        q3.copy(q0).addScaledVector(N, -9.5).addScaledVector(T, 2.2 + off * 0.85).addScaledVector(B, side * 0.30);
        loftTubeLimb(legs[idx], q0, q1, q2, q3, B, frontR, 0.075);
      }

      frame(pose, 0.77);
      const rHip = profile(0.77) * W_R;
      for (const side of [1, -1]) {
        const idx = side > 0 ? 2 : 3;
        const off = side * legSwing;
        q0.copy(P).addScaledVector(B, side * rHip * 0.52).addScaledVector(N, -rHip * 0.40);
        q1.copy(q0).addScaledVector(N, -4.3).addScaledVector(T, -2.0 - off * 0.25).addScaledVector(B, side * 0.48);
        q2.copy(q0).addScaledVector(N, -7.6).addScaledVector(T, -5.2 - off * 0.55).addScaledVector(B, side * 0.30);
        q3.copy(q0).addScaledVector(N, -9.7).addScaledVector(T, -8.3 - off * 0.75).addScaledVector(B, side * 0.22);
        loftTubeLimb(legs[idx], q0, q1, q2, q3, B, hindR, 0.075);
      }
    },
    spineAt(pose, u, out) {
      setDir(pose);
      frame(pose, u);
      return out.copy(P);
    },
  };
}
