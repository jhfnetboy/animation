// ---- distant horizon destination: New Continent island silhouette + striped lighthouse & glowing lantern
function buildLighthouse(scene) {
  const root = new THREE.Group();
  root.position.set(LIGHTHOUSE_AT.x, 0, LIGHTHOUSE_AT.y);
  scene.add(root);

  const islandMat = celMat('#396c6b', 40, { gloss: 0.0 });
  const cliffMat = celMat('#58626e', 41, { gloss: 0.0 });
  const towerMat = celMat('#f4f2ec', 42, { gloss: 0.2, mode: 3 }); // red/white stripes in cel_fs
  const roofMat = celMat('#26447a', 43, { gloss: 0.5 });
  const lanternMat = celMat('#fff6c2', 125, { gloss: 1.0, glow: '#ffd97a', glowAmt: 1.8 });

  // Hand-crafted stepped rocky island hills
  const hill1 = new THREE.Mesh(new THREE.ConeGeometry(28, 12, 9), islandMat);
  hill1.scale.set(1.6, 1.0, 0.9);
  hill1.position.set(-14, 4.2, -4);
  root.add(hill1);

  const hill2 = new THREE.Mesh(new THREE.ConeGeometry(20, 9.5, 8), islandMat);
  hill2.scale.set(1.4, 1.0, 1.0);
  hill2.position.set(14, 3.2, 2);
  root.add(hill2);

  const prom = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 11.5, 7.0, 10), cliffMat);
  prom.position.set(0, 3.0, 0);
  root.add(prom);

  // Lighthouse tower on top of promontory
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.5, 13.5, 12), towerMat);
  tower.position.set(0, 12.8, 0);
  root.add(tower);

  // Gallery ring & roof cap
  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.0, 0.6, 12), roofMat);
  gallery.position.set(0, 19.3, 0);
  root.add(gallery);

  const lantern = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 1.7, 12), lanternMat);
  lantern.position.set(0, 20.3, 0);
  root.add(lantern);

  const cap = new THREE.Mesh(new THREE.ConeGeometry(1.75, 1.8, 12), roofMat);
  cap.position.set(0, 21.9, 0);
  root.add(cap);

  return {
    root,
    update(st) {
      const act5 = smooth(invLerp(12.6, 13.8, st.t));
      const pulse = 0.25 + act5 * (1.8 + 0.45 * Math.sin(st.t * 2.2));
      lanternMat.uniforms.uGlowAmt.value = pulse;
    },
  };
}
