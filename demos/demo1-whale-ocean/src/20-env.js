// ---- world: sky dome + sea with multi-act atmospheric mood, token ripples, emergence vortex & sailing wake
const WHALE_AT = new THREE.Vector2(-8, -70);
const LIGHTHOUSE_AT = new THREE.Vector2(-64, -270);
const SUN = new THREE.Vector3(-0.42, 0.42, -0.80).normalize();
const KEY = new THREE.Vector3(-0.55, 0.55, 0.62).normalize();
const U = {
  uKey: { value: KEY },
  uShade: { value: new THREE.Color('#a7acd6') },
  uSun: { value: SUN },
  uTime: { value: 0 },
  uDraw: { value: 0 },
};

function swellAt(x, z, t, ring) {
  let h = 0.26 * Math.sin(x * 0.050 + z * 0.021 + t * 1.1)
        + 0.18 * Math.sin(-x * 0.031 + z * 0.067 + t * 1.5)
        + 0.08 * Math.sin(x * 0.13 - z * 0.09 + t * 2.3);
  if (ring && ring.w > 0) {
    const rr = Math.hypot(x - ring.x, z - ring.y);
    h += ring.w * Math.exp(-(((rr - ring.z) / 7) ** 2)) - ring.w * 0.5 * Math.exp(-(((rr - ring.z + 16) / 9) ** 2));
  }
  return h;
}

function buildEnv(scene) {
  const skyU = {
    uSun: U.uSun,
    uDeep: { value: 0 },
    uWarmth: { value: 0 },
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(4000, 48, 24),
    shaderMat('sky_vs', 'sky_fs', skyU, { side: THREE.BackSide, depthWrite: false })
  );
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);

  const ripplesArr = Array.from({ length: 10 }, () => new THREE.Vector4(0, 0, 0, 0));
  const g = new THREE.PlaneGeometry(2, 2, 360, 360);
  const seaU = {
    ...U,
    uDeep: skyU.uDeep,
    uWarmth: skyU.uWarmth,
    uReveal: { value: 0 },
    uBulge: { value: new THREE.Vector4(WHALE_AT.x, WHALE_AT.y, 20, 0) },
    uRing: { value: new THREE.Vector4(WHALE_AT.x, WHALE_AT.y, 0, 0) },
    uCenter: { value: WHALE_AT.clone() },
    uFoam: { value: new THREE.Vector4(WHALE_AT.x, WHALE_AT.y, 0, 0) },
    uShadow: { value: new THREE.Vector4(WHALE_AT.x, WHALE_AT.y, 30, 0) },
    uShadowDir: { value: new THREE.Vector2(1, 0) },
    uBoat: { value: new THREE.Vector4(0, 0, 0, 0) },
    uWake: { value: new THREE.Vector4(0, 0, 0, 0) },
    uVortex: { value: new THREE.Vector4(WHALE_AT.x, WHALE_AT.y, 18, 0) },
    uRipples: { value: ripplesArr },
  };
  const sea = new THREE.Mesh(g, shaderMat('sea_vs', 'sea_fs', seaU, { side: THREE.DoubleSide }));
  sea.frustumCulled = false;
  scene.add(sea);

  return {
    seaU,
    skyU,
    update(st, cam, activeRipples) {
      sky.position.copy(cam.position);
      const t = st.t, c = CUES;

      // Act atmosphere curves
      const deep = smooth(invLerp(2.7, 3.6, t)) * (1 - smooth(invLerp(8.8, 9.8, t)));
      const warmth = smooth(invLerp(12.6, 13.7, t));
      skyU.uDeep.value = deep * 0.85;
      skyU.uWarmth.value = warmth;
      seaU.uReveal.value = deep;

      // Update Act 1 token drop ripples (max 10 slots)
      for (let i = 0; i < 10; i++) {
        if (activeRipples && i < activeRipples.length) {
          const rp = activeRipples[i];
          ripplesArr[i].set(rp.x, rp.z, rp.radius, rp.alpha);
        } else {
          ripplesArr[i].set(0, 0, 0, 0);
        }
      }

      // Act 3->4 emergence vortex on the sea surface
      const vortIn = smooth(invLerp(c.vortexStart, c.breach, t));
      const vortOut = 1 - smooth(invLerp(c.breach, c.breach + 0.65, t));
      const vortStr = vortIn * vortOut;
      seaU.uVortex.value.set(WHALE_AT.x + 8, WHALE_AT.y, lerp(28, 10, vortIn), vortStr);

      // Whale underwater shadow (Act 3 approach + Act 4 pre-breach + Act 5 escort)
      const preShadow = smooth(invLerp(7.4, c.breach, t)) * (1 - smooth(invLerp(c.breach, c.breach + 0.3, t)));
      const escortShadow = smooth(invLerp(13.2, 14.0, t)) * 0.65;
      if (escortShadow > 0.01) {
        const ex = lerp(CRASH_AT.x, st.boat.pos.x - 16, smooth(invLerp(13.2, 16.0, t)));
        const ez = lerp(CRASH_AT.z, st.boat.pos.y - 12, smooth(invLerp(13.2, 16.0, t)));
        seaU.uShadow.value.set(ex, ez, 24, escortShadow);
        seaU.uShadowDir.value.set(-0.45, -0.89).normalize();
      } else {
        seaU.uShadow.value.set(WHALE_AT.x + 16, WHALE_AT.y, lerp(18, 34, smooth(invLerp(7.4, c.breach, t))), 0.78 * preShadow);
        seaU.uShadowDir.value.set(0.94, 0.34).normalize();
      }

      // Bulge over rising whale
      const bulge = smooth(invLerp(c.bulge, c.breach, t)) * (1 - smooth(invLerp(c.breach, c.breach + 0.25, t)));
      seaU.uBulge.value.set(WHALE_AT.x + 12, WHALE_AT.y, 26, 2.8 * bulge);

      // White water foam around breach and crash (cleanly fades out by Act 5 so ship wake shines)
      const fb = smooth(invLerp(c.bulge + 0.1, c.breach, t)) * (1 - 0.55 * smooth(invLerp(c.apex, c.crash, t)));
      const fc = t > c.crash ? Math.max(0, 1 - smooth(invLerp(12.9, 14.1, t))) : 0;
      const foamX = t > c.crash ? CRASH_AT.x : WHALE_AT.x + 12;
      const foamZ = t > c.crash ? CRASH_AT.z : WHALE_AT.y;
      const foamR = t > c.crash
        ? lerp(28, 44, smooth(invLerp(c.crash, 13.8, t)))
        : lerp(8, 26, smooth(invLerp(c.bulge + 0.1, c.breach + 0.6, t)));
      seaU.uFoam.value.set(foamX, foamZ, foamR, Math.max(fb, fc));

      const rk = t - c.crash;
      if (rk > 0 && rk < 2.2) seaU.uRing.value.set(CRASH_AT.x, CRASH_AT.z, 26 + rk * 26, 2.8 * Math.exp(-rk * 1.1));
      else seaU.uRing.value.set(0, 0, 0, 0);

      // Center sea grid around active focus (boat in Act 5, WHALE_AT otherwise)
      seaU.uCenter.value.set(
        lerp(WHALE_AT.x, st.boat.pos.x - 12, smooth(invLerp(13.0, 15.5, t))),
        lerp(WHALE_AT.y, st.boat.pos.y - 24, smooth(invLerp(13.0, 15.5, t)))
      );
    },
  };
}
