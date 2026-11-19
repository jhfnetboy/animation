// ---- water FX: Act 1 rain splashes + Act 4 whale breach/crash curtains, teardrops & spray clouds
const GRAV = -9.8 * 1.6;

function buildFx(scene, whale, rainDrops) {
  const curtains = [];
  const curtain = (id) => {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(1, 1, 1, 140, 20, true),
      shaderMat('splash_vs', 'splash_fs', { ...U, uShape: { value: new THREE.Vector4() }, uAnim: { value: new THREE.Vector4() }, uId: { value: id } }, { side: THREE.DoubleSide })
    );
    m.frustumCulled = false;
    m.visible = false;
    scene.add(m);
    curtains.push(m);
    return m;
  };

  const X0 = WHALE_AT.x, Z0 = WHALE_AT.y;
  const B = CUES.breach, C = CUES.crash;
  const CURT = [
    [B - 0.05, B + 1.5, X0 + 13, Z0, 8, 8, 22, 1.0, -0.4],
    [B + 0.1, B + 1.9, X0 + 13, Z0, 12, 12, 12, 2.0, 0.2],
    [C, C + 1.8, CRASH_AT.x, CRASH_AT.z, 18, 22, 34, 3.0, 0.0],
    [C + 0.12, C + 2.0, CRASH_AT.x - 12, CRASH_AT.z + 5, 6, 10, 68, 4.0, 0.3],
    [C + 0.05, C + 2.0, CRASH_AT.x + 14, CRASH_AT.z - 2, 5, 9, 58, 5.0, -0.3],
    [C + 0.25, C + 2.1, CRASH_AT.x, CRASH_AT.z, 30, 24, 14, 6.0, 0.0],
  ];
  CURT.forEach((c, i) => curtain(60 + (i % 3)));

  const rng = new Rng(7);
  const drops = [];
  // Act 1 raindrop splash micro-droplets
  for (const rd of rainDrops) {
    for (let k = 0; k < 4; k++) {
      const a = rng.range(0, Math.PI * 2);
      const sp = rng.range(4, 9);
      drops.push({
        tb: rd.tHit,
        life: 0.85,
        o: [rd.x, 0.1, rd.z],
        v: [Math.cos(a) * sp * 0.45, sp * rng.range(0.9, 1.3), Math.sin(a) * sp * 0.45],
        s: rng.range(0.10, 0.22),
        body: -1,
      });
    }
  }

  const BREACH_N = 620, CRASH_N = 1250, CLOUD_N = 100;
  const dropSize = (lo, hi) => {
    const k = rng.next();
    return k < 0.6 ? rng.range(0.04, 0.11) : k < 0.94 ? rng.range(lo * 0.7, hi * 0.5) : rng.range(hi * 0.5, hi * 0.85);
  };
  for (let i = 0; i < BREACH_N; i++) {
    const tb = B + rng.range(-0.05, 1.3) * rng.range(0.3, 1), a = rng.range(0, Math.PI * 2), r = rng.range(6, 14);
    const sp = rng.range(10, 30);
    drops.push({
      tb,
      life: 2.5,
      o: [X0 + 13 + Math.cos(a) * r, 0, Z0 + Math.sin(a) * r],
      v: [Math.cos(a) * sp * 0.35, sp * rng.range(0.9, 1.6), Math.sin(a) * sp * 0.35],
      s: dropSize(0.15, 0.5),
      body: rng.next() < 0.35 ? rng.range(0.15, 0.85) : -1,
    });
  }
  for (let i = 0; i < CRASH_N; i++) {
    const tb = C + rng.range(0, 0.6) * rng.next(), a = rng.range(0, Math.PI * 2), r = rng.range(8, 34);
    const sp = rng.range(16, 44);
    drops.push({
      tb,
      life: 2.5,
      o: [CRASH_AT.x + Math.cos(a) * r, 0, CRASH_AT.z + Math.sin(a) * r * 0.6],
      v: [Math.cos(a) * sp * 0.45, sp * rng.range(0.8, 1.5), Math.sin(a) * sp * 0.45 + 4],
      s: dropSize(0.2, 0.85),
      body: -1,
    });
  }

  const blobs = (n, kind, id, seeds) => {
    const g = new THREE.PlaneGeometry(2, 2);
    g.setAttribute('aVel', new THREE.InstancedBufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute('aSeed', new THREE.InstancedBufferAttribute(new Float32Array(seeds), 2));
    const m = new THREE.InstancedMesh(g, shaderMat('blob_vs', 'blob_fs', { ...U, uKind: { value: kind }, uId: { value: id } }, { side: THREE.DoubleSide }), n);
    m.frustumCulled = false;
    scene.add(m);
    return m;
  };

  const dropMesh = blobs(drops.length, 0, 103, drops.flatMap((d) => [rng.next(), d.s > 0.3 ? rng.range(0.4, 1) : rng.range(0, 0.3)]));
  const dropVel = dropMesh.geometry.attributes.aVel;

  const clouds = [];
  for (let i = 0; i < CLOUD_N; i++) {
    const a = rng.range(0, Math.PI * 2), r = rng.range(5, 40);
    clouds.push({
      tb: C + rng.range(0.05, 0.5),
      o: [CRASH_AT.x + Math.cos(a) * r, rng.range(0, 6), CRASH_AT.z + Math.sin(a) * r * 0.6],
      v: [Math.cos(a) * rng.range(3, 12), rng.range(6, 22), Math.sin(a) * rng.range(3, 10) + 6],
      s: rng.range(4, 10),
    });
  }
  const cloudMesh = blobs(CLOUD_N, 1, 104, clouds.flatMap(() => [rng.next(), 0]));

  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Sv = new THREE.Vector3(), Pv = new THREE.Vector3(), tmp = new THREE.Vector3();
  const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

  return {
    update(st) {
      const t = onThrees(st.t);
      CURT.forEach((c, i) => {
        const [t0, t1, x, z, r0, fl, hp, seed, lean] = c, m = curtains[i];
        const k = invLerp(t0, t1, t);
        m.visible = t >= t0 && t < t1;
        if (!m.visible) return;
        const h = hp * easeOut(Math.min(1, k * 2.4), 2) * (1 - easeIn(invLerp(0.45, 1, k), 2) * 0.85);
        m.material.uniforms.uShape.value.set(x, z, r0 + k * fl * 0.35, fl * (0.4 + k));
        m.material.uniforms.uAnim.value.set(h, smooth(invLerp(0.2, 1, k)), seed, lean);
      });

      drops.forEach((d, i) => {
        const tau = t - d.tb;
        if (tau < 0 || tau > d.life) { dropMesh.setMatrixAt(i, ZERO); return; }
        if (d.body >= 0) {
          whale.spineAt(poseAt(d.tb), d.body, tmp);
          Pv.set(tmp.x + d.v[0] * 0.2, tmp.y + 3, tmp.z + d.v[2] * 0.2).addScaledVector(new THREE.Vector3(d.v[0], 2, d.v[2]), tau * 0.25);
          Pv.y += 0.5 * GRAV * tau * tau;
        } else {
          Pv.set(d.o[0] + d.v[0] * tau, d.o[1] + d.v[1] * tau + 0.5 * GRAV * tau * tau, d.o[2] + d.v[2] * tau);
        }
        const s = d.s * (1 - smooth(invLerp(d.life * 0.55, d.life, tau))) * (Pv.y < -0.5 ? 0 : 1);
        const vy = d.v[1] + GRAV * tau;
        const k = d.body >= 0 ? 0.25 : 1;
        dropVel.setXYZ(i, d.v[0] * k, vy, d.v[2] * k);
        Q.identity(); Sv.setScalar(s);
        M.compose(Pv, Q, Sv); dropMesh.setMatrixAt(i, M);
      });
      dropMesh.instanceMatrix.needsUpdate = true;
      dropVel.needsUpdate = true;

      clouds.forEach((c, i) => {
        const tau = t - c.tb;
        if (tau < 0 || tau > 2.4) { cloudMesh.setMatrixAt(i, ZERO); return; }
        const drag = (1 - Math.exp(-tau * 1.4)) / 1.4;
        Pv.set(c.o[0] + c.v[0] * drag, c.o[1] + c.v[1] * drag, c.o[2] + c.v[2] * drag);
        const fadeOut = 1 - smooth(invLerp(1.2, 2.4, tau));
        const s = c.s * (0.4 + easeOut(Math.min(1, tau * 1.2))) * fadeOut;
        Q.identity(); Sv.set(s, s * 0.85, s);
        M.compose(Pv, Q, Sv); cloudMesh.setMatrixAt(i, M);
      });
      cloudMesh.instanceMatrix.needsUpdate = true;
    },
  };
}
