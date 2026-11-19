import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from './HtmlOverlay';
import * as THREE from 'three';
import type { CourseMode, Lang, RepMode } from '../types';

interface Scene3Props {
  localT: number;
  mode: CourseMode;
  repMode: RepMode;
  showLabels: boolean;
  lang: Lang;
}

interface Scene3Labels {
  ligandKey: string;
  ligandDocked: string;
  bilayer: string;
  gpcrIdle: string;
  gpcrActivated: string;
  gsCamp: string;
  organHypothalamus: string;
  organPancreas: string;
  organHeart: string;
  organDermal: string;
  dermal3MinNote: string;
  valueChainNote: string;
}

const LABELS: Record<Lang, Scene3Labels> = {
  en: {
    ligandKey: 'Peptide Agonist Key (GLP-1 / Semaglutide)',
    ligandDocked: 'Orthosteric Clasp Locked (PDB 5VAI)',
    bilayer: 'Phospholipid Bilayer (~4 nm Fluid Mosaic)',
    gpcrIdle: 'GLP-1R 7-TM Bundle (TM1–TM7)',
    gpcrActivated: 'TM6 +22° Outward Swing (5VAI Active)',
    gsCamp: 'Gs Trimer (Gα·Gβ·Gγ) → cAMP Surge',
    organHypothalamus: 'Hypothalamus · Satiety & Appetite',
    organPancreas: 'Pancreatic β-Cell · Glucose-Dependent Insulin',
    organHeart: 'Heart & Vessels · Cardioprotection',
    organDermal: 'Dermal Matrix · Collagen & ~500 Da Contrast',
    dermal3MinNote: '2025 Am. J. Med. (23 RCTs): Topical vs Systemic',
    valueChainNote: 'SPPS Resin API → RP-HPLC → Autoinjector Pen',
  },
  zh: {
    ligandKey: '多肽分子钥匙（GLP-1 / 司美格鲁肽）',
    ligandDocked: '胞外正构口袋钳夹锁定（PDB 5VAI）',
    bilayer: '磷脂双分子层细胞膜（流动镶嵌波动）',
    gpcrIdle: 'GLP-1R 7次跨膜螺旋（TM1–TM7）',
    gpcrActivated: 'TM6 向外摆动约 22° 张开（5VAI 激活态）',
    gsCamp: 'Gs 三聚体 (Gα·Gβ·Gγ) → 爆发 cAMP',
    organHypothalamus: '下丘脑 · 饱腹与食欲调控中枢',
    organPancreas: '胰腺 β 细胞 · 葡萄糖依赖性胰岛素释放',
    organHeart: '心血管系统 · 心肌与内皮代谢保护',
    organDermal: '真皮胶原基质 · 胶原蛋白合成对比科普',
    dermal3MinNote: '2025 Am. J. Med. 23项RCT · 500 Da 经皮屏障对比',
    valueChainNote: 'SPPS 固相原料药 → 纯化灌装 → 精密注射笔全链闭环',
  },
  th: {
    ligandKey: 'กุญแจโมเลกุลเพปไทด์ (GLP-1 / Semaglutide)',
    ligandDocked: 'ล็อกเข้าสู่ช่องรับ Orthosteric (PDB 5VAI)',
    bilayer: 'เยื่อหุ้มเซลล์ฟอสโฟลิพิดสองชั้น (Fluid Mosaic)',
    gpcrIdle: 'ตัวรับ GLP-1R 7 เกลียว (TM1–TM7)',
    gpcrActivated: 'TM6 กางออกด้านนอก ~22° (PDB 5VAI)',
    gsCamp: 'โปรตีน Gs (Gα·Gβ·Gγ) → พุ่งสัญญาณ cAMP',
    organHypothalamus: 'ไฮโปทาลามัส · ศูนย์ควบคุมความอิ่ม',
    organPancreas: 'เบต้าเซลล์ตับอ่อน · หลั่งอินซูลินตามกลูโคส',
    organHeart: 'หัวใจและหลอดเลือด · การปกป้องเมตาบอลิซึม',
    organDermal: 'เมทริกซ์ชั้นหนังแท้ · เปรียบเทียบคอลลาเจน & ~500 Da',
    dermal3MinNote: '2025 Am. J. Med. (23 RCTs) · กำแพงผิว ~500 Da',
    valueChainNote: 'SPPS เรซิน API → RP-HPLC → ปากกาฉีดยาอัตโนมัติ',
  },
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const UP_AXIS = new THREE.Vector3(0, 1, 0);

function useDisposableTube(
  points: THREE.Vector3[],
  radius: number,
  tubularSegments = 64,
  radialSegments = 10
): THREE.TubeGeometry {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
  }, [points, radius, tubularSegments, radialSegments]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  return geometry;
}

interface LipidSeed {
  x: number;
  z: number;
  leaflet: 1 | -1;
  phase: number;
}

/**
 * Fluid-mosaic Phospholipid Bilayer (~76 upper + ~76 lower = 152 heads, 304 swaying acyl tails)
 * leaving a central circular pore (r >= 1.38) for the 7-TM GLP-1R bundle.
 */
function PhospholipidBilayer({ repMode }: { repMode: RepMode }) {
  const lipidSeeds = useMemo<LipidSeed[]>(() => {
    const seeds: LipidSeed[] = [];
    const ringRadii = [1.46, 1.92, 2.38, 2.86, 3.34, 3.82];
    const basePoints: { x: number; z: number; phase: number }[] = [];

    ringRadii.forEach((r, ringIdx) => {
      const countInRing = Math.round(8 + ringIdx * 4.5);
      for (let i = 0; i < countInRing; i++) {
        const theta = (i / countInRing) * Math.PI * 2 + ringIdx * 0.21;
        const x = Math.cos(theta) * r * 1.18;
        const z = Math.sin(theta) * r * 0.62;
        // Trim far Z corners to keep front/back silhouette clean for camera view
        if (Math.abs(x) <= 4.35 && Math.abs(z) <= 2.35) {
          basePoints.push({ x, z, phase: x * 0.72 + z * 0.88 + ringIdx });
        }
      }
    });

    for (const pt of basePoints) {
      seeds.push({ x: pt.x, z: pt.z, leaflet: 1, phase: pt.phase });
      seeds.push({ x: pt.x, z: pt.z, leaflet: -1, phase: pt.phase + 0.6 });
    }
    return seeds;
  }, []);

  const count = lipidSeeds.length;
  const headMeshRef = useRef<THREE.InstancedMesh>(null);
  const tailMeshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const heads = headMeshRef.current;
    const tails = tailMeshRef.current;
    if (!heads || !tails) return;

    const t = clock.elapsedTime;
    const midY = 0.22;
    const halfThickness = 0.48;
    const headScale = repMode === 'surface' ? 0.145 : repMode === 'ribbon' ? 0.118 : 0.108;
    const tailThickness = repMode === 'surface' ? 0.036 : 0.025;

    for (let i = 0; i < count; i++) {
      const s = lipidSeeds[i];
      const wave = Math.sin(t * 1.45 + s.phase) * 0.052;
      const headY = midY + s.leaflet * halfThickness + wave;

      // Hydrophilic phosphate head
      dummy.position.set(s.x, headY, s.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(headScale);
      dummy.updateMatrix();
      heads.setMatrixAt(i, dummy.matrix);

      // Paired hydrophobic fatty acyl tails pointing inward toward membrane midplane
      const swayZ = Math.sin(t * 2.25 + s.phase) * 0.11;
      const swayX = Math.cos(t * 1.9 + s.phase) * 0.08;
      const tailOffsetY = -s.leaflet * 0.21;

      // Tail A
      dummy.position.set(s.x - 0.035, headY + tailOffsetY, s.z + 0.02);
      dummy.rotation.set(swayX, 0, swayZ);
      dummy.scale.set(tailThickness, 0.36, tailThickness);
      dummy.updateMatrix();
      tails.setMatrixAt(i * 2, dummy.matrix);

      // Tail B
      dummy.position.set(s.x + 0.035, headY + tailOffsetY, s.z - 0.02);
      dummy.rotation.set(-swayX * 0.8, 0, -swayZ * 0.9);
      dummy.scale.set(tailThickness, 0.36, tailThickness);
      dummy.updateMatrix();
      tails.setMatrixAt(i * 2 + 1, dummy.matrix);
    }

    heads.instanceMatrix.needsUpdate = true;
    tails.instanceMatrix.needsUpdate = true;
  });

  // Translucent bilayer slab ring for 'surface' and 'ribbon' cues
  const bilayerCoreRing = useMemo(() => {
    const outer = new THREE.Shape();
    outer.absellipse(0, 0, 4.45, 2.38, 0, Math.PI * 2, false, 0);
    const hole = new THREE.Path();
    hole.absellipse(0, 0, 1.32, 1.05, 0, Math.PI * 2, true, 0);
    outer.holes.push(hole);
    return new THREE.ExtrudeGeometry(outer, {
      depth: 0.72,
      bevelEnabled: true,
      bevelSize: 0.04,
      bevelThickness: 0.04,
      curveSegments: 36,
    });
  }, []);

  useEffect(() => {
    return () => {
      bilayerCoreRing.dispose();
    };
  }, [bilayerCoreRing]);

  return (
    <group>
      {/* Glossy cyan-blue hydrophilic head spheres */}
      <instancedMesh ref={headMeshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshPhysicalMaterial
          color="#38bdf8"
          emissive="#0284c7"
          emissiveIntensity={0.25}
          roughness={0.18}
          metalness={0.22}
          clearcoat={0.85}
          clearcoatRoughness={0.15}
        />
      </instancedMesh>

      {/* Paired swaying pale-gold hydrophobic fatty-acid tails */}
      <instancedMesh ref={tailMeshRef} args={[undefined, undefined, count * 2]}>
        <cylinderGeometry args={[1, 0.75, 1, 7]} />
        <meshStandardMaterial
          color="#fde68a"
          emissive="#d97706"
          emissiveIntensity={0.16}
          roughness={0.45}
          transparent
          opacity={repMode === 'surface' ? 0.72 : 0.88}
        />
      </instancedMesh>

      {/* Subtle hydrophobic core slab in surface/ribbon mode */}
      {repMode !== 'ball-stick' && (
        <mesh
          geometry={bilayerCoreRing}
          position={[0, 0.58, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <meshPhysicalMaterial
            color="#0ea5e9"
            emissive="#0369a1"
            emissiveIntensity={0.12}
            roughness={0.35}
            transparent
            opacity={repMode === 'surface' ? 0.16 : 0.07}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

interface HelixSpec {
  id: string;
  x: number;
  z: number;
  tiltX: number;
  tiltZ: number;
  height: number;
  color: string;
  emissive: string;
}

/**
 * Single metallic α-helix column supporting ball-stick, ribbon coil, and cryo-EM surface modes.
 */
function TransmembraneHelix({
  height,
  color,
  emissive,
  emissiveIntensity,
  repMode,
  radius = 0.145,
}: {
  height: number;
  color: string;
  emissive: string;
  emissiveIntensity: number;
  repMode: RepMode;
  radius?: number;
}) {
  const coilPoints = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = 26;
    const turns = 3.2;
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const y = -height * 0.5 + f * height;
      const ang = f * Math.PI * 2 * turns;
      pts.push(new THREE.Vector3(Math.cos(ang) * radius * 0.82, y, Math.sin(ang) * radius * 0.82));
    }
    return pts;
  }, [height, radius]);

  const coilTube = useDisposableTube(coilPoints, 0.044, 48, 8);

  return (
    <group>
      {/* Core metallic transmembrane cylinder */}
      <mesh>
        <cylinderGeometry
          args={[
            repMode === 'ribbon' ? radius * 0.42 : radius,
            repMode === 'ribbon' ? radius * 0.42 : radius,
            height,
            18,
          ]}
        />
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          metalness={0.55}
          roughness={0.22}
          clearcoat={0.65}
          transparent={repMode === 'surface'}
          opacity={repMode === 'surface' ? 0.78 : 0.96}
        />
      </mesh>

      {/* Helical ribbon coil */}
      {repMode === 'ribbon' && (
        <mesh geometry={coilTube}>
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity + 0.25}
            metalness={0.45}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Ball-and-stick residue beads spiraling along helix */}
      {repMode === 'ball-stick' &&
        coilPoints
          .filter((_, idx) => idx % 3 === 0)
          .map((pt, idx) => (
            <mesh key={`tm-bead-${idx}`} position={pt}>
              <sphereGeometry args={[0.068, 12, 12]} />
              <meshStandardMaterial
                color="#e0e7ff"
                emissive={emissive}
                emissiveIntensity={emissiveIntensity + 0.35}
                roughness={0.22}
              />
            </mesh>
          ))}

      {/* Cryo-EM density envelope in surface mode */}
      {repMode === 'surface' && (
        <mesh>
          <capsuleGeometry args={[radius * 1.48, height * 0.86, 8, 16]} />
          <meshPhysicalMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={emissiveIntensity * 0.5}
            roughness={0.3}
            transparent
            opacity={0.32}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * 7-Transmembrane GLP-1R GPCR Receptor (Zhang et al. 2017 Nature, PDB 5VAI)
 * featuring a true geometric 22° outward radial swing of TM6 when ligand docks (localT > 0.25).
 */
function Glp1rSevenTmReceptor({
  tm6SwingRad,
  dockGlow,
  repMode,
}: {
  tm6SwingRad: number;
  dockGlow: number;
  repMode: RepMode;
}) {
  const staticHelices = useMemo<HelixSpec[]>(
    () => [
      { id: 'TM1', x: -0.92, z: 0.3, tiltX: 0.08, tiltZ: 0.1, height: 1.48, color: '#4f46e5', emissive: '#312e81' },
      { id: 'TM2', x: -0.52, z: 0.72, tiltX: -0.09, tiltZ: 0.06, height: 1.46, color: '#6366f1', emissive: '#3730a3' },
      { id: 'TM3', x: 0.14, z: 0.68, tiltX: -0.06, tiltZ: -0.04, height: 1.54, color: '#0ea5e9', emissive: '#0369a1' },
      { id: 'TM4', x: -0.74, z: -0.44, tiltX: 0.1, tiltZ: -0.08, height: 1.44, color: '#4338ca', emissive: '#312e81' },
      { id: 'TM5', x: -0.06, z: -0.74, tiltX: 0.11, tiltZ: 0.04, height: 1.5, color: '#0284c7', emissive: '#075985' },
      { id: 'TM7', x: 0.74, z: 0.34, tiltX: -0.08, tiltZ: -0.09, height: 1.48, color: '#06b6d4', emissive: '#0e7490' },
    ],
    []
  );

  // TM6 coordinates & pure radial outward pivot axis at conserved PxxG mid-helix kink (y = 0.42)
  const tm6X = 0.66;
  const tm6Z = -0.4;
  const tm6PivotQuat = useMemo(() => {
    const radial = new THREE.Vector3(tm6X, 0, tm6Z).normalize();
    const tangentAxis = new THREE.Vector3().crossVectors(radial, UP_AXIS).normalize();
    return new THREE.Quaternion().setFromAxisAngle(tangentAxis, tm6SwingRad);
  }, [tm6SwingRad]);

  // NTD (Extracellular N-terminal domain) crescent clasp curve
  const ntdLoopPts = useMemo(
    () => [
      new THREE.Vector3(-0.88, 0.92, 0.25),
      new THREE.Vector3(-0.82, 1.38, 0.15),
      new THREE.Vector3(-0.35, 1.48, -0.25),
      new THREE.Vector3(0.18, 1.24, -0.42),
    ],
    []
  );
  const ntdTube = useDisposableTube(ntdLoopPts, 0.085, 32, 10);

  return (
    <group position={[0, 0.22, 0]}>
      {/* TM1–TM5 & TM7 */}
      {staticHelices.map((h) => (
        <group
          key={h.id}
          position={[h.x, 0, h.z]}
          rotation={[h.tiltX, 0, h.tiltZ]}
        >
          <TransmembraneHelix
            height={h.height}
            color={h.color}
            emissive={h.emissive}
            emissiveIntensity={0.3 + dockGlow * 0.22}
            repMode={repMode}
          />
        </group>
      ))}

      {/* Articulated TM6: Upper extracellular segment + PxxG kink hinge + 22° outward-swinging intracellular segment */}
      <group position={[tm6X, 0.42, tm6Z]}>
        {/* Upper extracellular helix segment */}
        <group position={[0, 0.22, 0]}>
          <TransmembraneHelix
            height={0.56}
            color="#a855f7"
            emissive="#7e22ce"
            emissiveIntensity={0.45 + dockGlow * 0.65}
            repMode={repMode}
            radius={0.155}
          />
        </group>

        {/* Conserved PxxG mid-membrane kink hinge */}
        <mesh>
          <sphereGeometry args={[0.175, 16, 16]} />
          <meshStandardMaterial
            color={dockGlow > 0.2 ? '#fbbf24' : '#c084fc'}
            emissive={dockGlow > 0.2 ? '#f59e0b' : '#9333ea'}
            emissiveIntensity={0.6 + dockGlow * 1.1}
          />
        </mesh>

        {/* Intracellular TM6 segment swinging radially outward by 22° (0.384 rad) */}
        <group quaternion={tm6PivotQuat}>
          <group position={[0, -0.58, 0]}>
            <TransmembraneHelix
              height={1.14}
              color={dockGlow > 0.2 ? '#ec4899' : '#a855f7'}
              emissive={dockGlow > 0.2 ? '#f59e0b' : '#7e22ce'}
              emissiveIntensity={0.45 + dockGlow * 0.9}
              repMode={repMode}
              radius={0.16}
            />
          </group>
        </group>

        {/* Visual 22° activation swing arc indicator */}
        {tm6SwingRad > 0.06 && (
          <mesh position={[0.12, -0.78, -0.06]} rotation={[0, 0.54, 0]}>
            <ringGeometry args={[0.35, 0.41, 20, 1, -Math.PI * 0.5, tm6SwingRad]} />
            <meshBasicMaterial
              color="#fbbf24"
              side={THREE.DoubleSide}
              transparent
              opacity={0.85}
            />
          </mesh>
        )}
      </group>

      {/* Extracellular NTD (ECD) Clasp cradling peptide ligand */}
      <group>
        <mesh geometry={ntdTube}>
          <meshPhysicalMaterial
            color="#818cf8"
            emissive="#4f46e5"
            emissiveIntensity={0.32 + dockGlow * 0.35}
            roughness={0.28}
            metalness={0.25}
            transparent
            opacity={repMode === 'surface' ? 0.65 : 0.9}
          />
        </mesh>
        <mesh position={[-0.64, 1.28, 0.04]} scale={[1.25, 0.85, 0.95]}>
          <sphereGeometry args={[0.34, 20, 20]} />
          <meshPhysicalMaterial
            color="#6366f1"
            emissive="#4f46e5"
            emissiveIntensity={0.22 + dockGlow * 0.3}
            roughness={0.32}
            clearcoat={0.5}
            transparent
            opacity={repMode === 'surface' ? 0.52 : 0.3}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Glowing orthosteric binding collar */}
      {dockGlow > 0.08 && (
        <mesh position={[0.02, 0.92, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.56, 0.03, 12, 32]} />
          <meshBasicMaterial
            color="#22d3ee"
            transparent
            opacity={dockGlow * 0.78}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Descending Glowing Cyan-Gold Peptide Molecular Key (GLP-1 / Semaglutide agonist).
 */
function PeptideMolecularKey({
  dockProgress,
  repMode,
}: {
  dockProgress: number;
  repMode: RepMode;
}) {
  const helixPts = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const steps = 22;
    for (let i = 0; i <= steps; i++) {
      const f = i / steps;
      const y = lerp(0.85, -0.58, f);
      const ang = f * Math.PI * 2 * 3.4;
      pts.push(new THREE.Vector3(Math.cos(ang) * 0.19, y, Math.sin(ang) * 0.19));
    }
    return pts;
  }, []);

  const tubeGeom = useDisposableTube(helixPts, repMode === 'surface' ? 0.095 : 0.058, 48, 10);

  const keyY = lerp(2.55, 1.32, dockProgress);
  const keyX = lerp(-0.18, -0.02, dockProgress);
  const tiltZ = lerp(-0.22, -0.14, dockProgress);

  return (
    <group position={[keyX, keyY, 0.02]} rotation={[0.08, 0, tiltZ]}>
      <mesh geometry={tubeGeom}>
        <meshPhysicalMaterial
          color="#22d3ee"
          emissive="#fbbf24"
          emissiveIntensity={0.45 + dockProgress * 0.55}
          metalness={0.35}
          roughness={0.18}
          clearcoat={0.7}
        />
      </mesh>
      {/* N-terminal pharmacophore activation head (His7-Aib8/Ala8) inserting deepest into TM core */}
      <mesh position={[0, -0.62, 0]}>
        <sphereGeometry args={[0.14, 18, 18]} />
        <meshStandardMaterial
          color="#fde047"
          emissive="#f59e0b"
          emissiveIntensity={0.95 + dockProgress * 0.8}
          roughness={0.15}
        />
      </mesh>
      {repMode === 'ball-stick' &&
        helixPts
          .filter((_, idx) => idx % 2 === 0)
          .map((pt, idx) => (
            <mesh key={`key-atom-${idx}`} position={pt}>
              <sphereGeometry args={[0.072, 12, 12]} />
              <meshStandardMaterial
                color={idx % 2 === 0 ? '#67e8f9' : '#fcd34d'}
                emissive="#0ea5e9"
                emissiveIntensity={0.55}
              />
            </mesh>
          ))}
    </group>
  );
}

/**
 * Intracellular Gs Heterotrimer (Gαs + Gβ + Gγ) docking into the opened TM6 cavity
 * and triggering subunit separation & illumination.
 */
function GsProteinTrimer({
  dockProgress,
  activateSplit,
  repMode,
}: {
  dockProgress: number;
  activateSplit: number;
  repMode: RepMode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.6) * 0.025;
    }
  });

  // Gαs rises into opened TM6 cavity
  const gaPos: [number, number, number] = [
    lerp(0.1, 0.28, dockProgress) + activateSplit * 0.14,
    lerp(-1.12, -0.68, dockProgress),
    lerp(0.08, -0.1, dockProgress),
  ];

  // Gβ and Gγ separate downward-left upon GTP exchange
  const gbgPos: [number, number, number] = [
    lerp(-0.28, -0.45, dockProgress) - activateSplit * 0.36,
    lerp(-1.26, -1.04, dockProgress) - activateSplit * 0.18,
    lerp(0.18, 0.24, dockProgress),
  ];

  const glowBoost = 0.3 + dockProgress * 0.45 + activateSplit * 0.85;
  const opacity = repMode === 'surface' ? 0.78 : 0.96;

  return (
    <group ref={groupRef}>
      {/* Gαs Subunit + α5 Helix inserting into TM6 cavity */}
      <group position={gaPos}>
        <mesh scale={[1.15, 0.9, 1.0]}>
          <sphereGeometry args={[0.32, 22, 22]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={glowBoost}
            roughness={0.22}
            clearcoat={0.6}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
        {/* α5 C-terminal docking helix pointing into TM6 pocket */}
        <mesh position={[0.12, 0.36, -0.06]} rotation={[0.12, 0, -0.28]}>
          <cylinderGeometry args={[0.085, 0.095, 0.52, 14]} />
          <meshStandardMaterial
            color="#7dd3fc"
            emissive="#38bdf8"
            emissiveIntensity={glowBoost + 0.35}
            roughness={0.2}
          />
        </mesh>
      </group>

      {/* Gβ (violet propeller) & Gγ (emerald subunit) */}
      <group position={gbgPos}>
        <mesh scale={[1.1, 0.85, 1.1]}>
          <sphereGeometry args={[0.29, 20, 20]} />
          <meshPhysicalMaterial
            color="#a855f7"
            emissive="#7e22ce"
            emissiveIntensity={glowBoost}
            roughness={0.24}
            clearcoat={0.55}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
        <mesh position={[-0.24, -0.1, 0.12]} rotation={[0.4, 0.2, 0.6]}>
          <capsuleGeometry args={[0.1, 0.28, 8, 14]} />
          <meshPhysicalMaterial
            color="#34d399"
            emissive="#059669"
            emissiveIntensity={glowBoost + 0.15}
            roughness={0.25}
            transparent={opacity < 1}
            opacity={opacity}
          />
        </mesh>
      </group>
    </group>
  );
}

const ORGAN_TARGETS: readonly [number, number, number][] = [
  [-3.35, -2.05, 0.55], // 1. Hypothalamus
  [-1.12, -2.15, 0.35], // 2. Pancreas β-cell
  [1.12, -2.15, 0.35], // 3. Heart & Vessels
  [3.35, -2.05, 0.55], // 4. Dermal Matrix
];

/**
 * 42 high-speed pulsing golden cAMP second-messenger orbs radiating from activated Gs
 * down to the 4 target organ holograms.
 */
function CampSecondMessengerBurst({ activeLevel }: { activeLevel: number }) {
  const count = 42;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        targetIdx: i % 4,
        phase: (i / count) * 1.0,
        speed: 0.72 + (i % 5) * 0.14,
        arcLift: 0.25 + (i % 3) * 0.18,
        jitterX: ((i * 7) % 5 - 2) * 0.08,
        jitterZ: ((i * 3) % 5 - 2) * 0.07,
      })),
    []
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const originX = 0.25;
    const originY = -0.82;
    const originZ = 0.05;

    for (let i = 0; i < count; i++) {
      if (activeLevel <= 0.02) {
        dummy.scale.setScalar(0.0001);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        continue;
      }

      const s = seeds[i];
      const prog = ((t * s.speed + s.phase) % 1 + 1) % 1;
      const target = ORGAN_TARGETS[s.targetIdx];

      const px = lerp(originX, target[0], prog) + Math.sin(prog * Math.PI) * s.jitterX;
      const py =
        lerp(originY, target[1] + 0.25, prog * prog * 0.75 + prog * 0.25) +
        Math.sin(prog * Math.PI) * s.arcLift;
      const pz = lerp(originZ, target[2], prog) + Math.sin(prog * Math.PI) * s.jitterZ;

      const pulse = (0.055 + 0.028 * Math.sin(t * 10 + i)) * activeLevel;
      dummy.position.set(px, py, pz);
      dummy.scale.setScalar(pulse);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshStandardMaterial
        color="#fde047"
        emissive="#f59e0b"
        emissiveIntensity={1.65}
        toneMapped={false}
      />
    </instancedMesh>
  );
}

/**
 * Reusable holographic projection pedestal + sculpted biological hologram totem
 * for each of the 4 human target organs.
 */
function OrganHologramPod({
  position,
  color,
  lit,
  kind,
}: {
  position: [number, number, number];
  color: string;
  lit: number;
  kind: 'hypothalamus' | 'pancreas' | 'heart' | 'dermal';
}) {
  const totemRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (totemRef.current) {
      totemRef.current.rotation.y = t * 0.55;
      const pulse = kind === 'heart' ? 1 + Math.pow(Math.max(0, Math.sin(t * 4.2)), 4) * 0.14 * lit : 1;
      totemRef.current.scale.setScalar(0.88 + lit * 0.18 * pulse);
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.8;
    }
  });

  const emissiveStrength = 0.22 + lit * 1.15;
  const holoOpacity = 0.34 + lit * 0.56;

  return (
    <group position={position}>
      {/* Holographic projector disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.32, 0]}>
        <ringGeometry args={[0.38, 0.52, 28]} />
        <meshBasicMaterial
          color={color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.25 + lit * 0.6}
        />
      </mesh>
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.31, 0]}>
        <ringGeometry args={[0.24, 0.29, 6]} />
        <meshBasicMaterial
          color="#fde047"
          side={THREE.DoubleSide}
          transparent
          opacity={0.18 + lit * 0.72}
        />
      </mesh>

      {/* Organ-specific 3D holographic sculpture */}
      <group ref={totemRef} position={[0, 0.05, 0]}>
        {kind === 'hypothalamus' && (
          <group>
            {/* Cerebral / Hypothalamic twin lobes + satiety core */}
            <mesh position={[-0.14, 0.06, 0]} scale={[1.15, 0.9, 1.0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveStrength}
                transparent
                opacity={holoOpacity}
              />
            </mesh>
            <mesh position={[0.14, 0.06, 0]} scale={[1.15, 0.9, 1.0]}>
              <sphereGeometry args={[0.22, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveStrength}
                transparent
                opacity={holoOpacity}
              />
            </mesh>
            {/* Arcuate nucleus glowing center */}
            <mesh position={[0, -0.08, 0.05]}>
              <octahedronGeometry args={[0.11, 0]} />
              <meshStandardMaterial
                color="#fde047"
                emissive="#f59e0b"
                emissiveIntensity={0.4 + lit * 1.4}
              />
            </mesh>
          </group>
        )}

        {kind === 'pancreas' && (
          <group>
            {/* Pancreatic β-cell islet cluster + insulin granules */}
            {[
              [0, 0.05, 0, 0.18],
              [-0.2, -0.02, 0.08, 0.13],
              [0.2, 0.02, -0.06, 0.14],
              [0.04, 0.2, 0.09, 0.12],
              [-0.08, -0.14, -0.08, 0.12],
            ].map(([x, y, z, r], idx) => (
              <mesh key={`islet-${idx}`} position={[x, y, z]}>
                <sphereGeometry args={[r, 14, 14]} />
                <meshStandardMaterial
                  color={idx === 0 ? '#5eead4' : color}
                  emissive={color}
                  emissiveIntensity={emissiveStrength}
                  transparent
                  opacity={holoOpacity}
                />
              </mesh>
            ))}
            <mesh rotation={[0.5, 0.4, 0]}>
              <torusGeometry args={[0.31, 0.02, 8, 24]} />
              <meshBasicMaterial color="#fde047" transparent opacity={0.25 + lit * 0.65} />
            </mesh>
          </group>
        )}

        {kind === 'heart' && (
          <group>
            {/* Stylized dual-chamber heart + aortic vessel arch */}
            <mesh position={[-0.1, 0.06, 0]}>
              <sphereGeometry args={[0.17, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveStrength}
                transparent
                opacity={holoOpacity}
              />
            </mesh>
            <mesh position={[0.1, 0.06, 0]}>
              <sphereGeometry args={[0.17, 16, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveStrength}
                transparent
                opacity={holoOpacity}
              />
            </mesh>
            <mesh position={[0, -0.1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.24, 0.34, 16]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={emissiveStrength}
                transparent
                opacity={holoOpacity}
              />
            </mesh>
            {/* Aortic arch ring */}
            <mesh position={[0.02, 0.22, 0]} rotation={[0, 0, 0.3]}>
              <torusGeometry args={[0.14, 0.032, 8, 18, Math.PI]} />
              <meshStandardMaterial
                color="#fda4af"
                emissive="#f43f5e"
                emissiveIntensity={emissiveStrength}
              />
            </mesh>
          </group>
        )}

        {kind === 'dermal' && (
          <group>
            {/* Dermal collagen triple strands + ~500 Da stratum corneum barrier plane */}
            {[-0.12, 0, 0.12].map((dx, idx) => (
              <mesh key={`col-${idx}`} position={[dx, 0.02, (idx - 1) * 0.06]} rotation={[0, 0, 0.18 * (idx - 1)]}>
                <cylinderGeometry args={[0.038, 0.038, 0.52, 10]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={emissiveStrength}
                  transparent
                  opacity={holoOpacity}
                />
              </mesh>
            ))}
            {/* ~500 Da barrier grid plate */}
            <mesh position={[0, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.025, 6]} />
              <meshBasicMaterial
                color="#fef08a"
                wireframe
                transparent
                opacity={0.35 + lit * 0.55}
              />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
}

export function Scene3GpcrOrgans({
  localT,
  mode,
  repMode,
  showLabels,
  lang,
}: Scene3Props) {
  const t = clamp01(localT);
  const text = LABELS[lang];

  // Phase timings aligned strictly with prompt specification:
  // Ligand descends & docks in [0.00 -> 0.25], then TM6 swings 22° outward for localT > 0.25
  const ligandDock = smoothstep(0.02, 0.25, t);
  const tm6Activation = smoothstep(0.25, 0.48, t);
  const tm6SwingRad = tm6Activation * ((22 * Math.PI) / 180);

  const gsDock = smoothstep(0.30, 0.52, t);
  const gsSplit = smoothstep(0.45, 0.66, t);
  const campBurst = smoothstep(0.44, 0.62, t);

  // Sequential illumination of the 4 target organ holograms
  const litHypothalamus = smoothstep(0.54, 0.68, t);
  const litPancreas = smoothstep(0.62, 0.76, t);
  const litHeart = smoothstep(0.70, 0.84, t);
  const litDermal = smoothstep(0.78, 0.92, t);

  return (
    <group>
      {/* Atmospheric bioluminescent lighting */}
      <pointLight position={[0, 2.8, 2.6]} intensity={1.35} color="#38bdf8" distance={10} />
      <pointLight position={[0.8, 0.2, 2.2]} intensity={1.1 + tm6Activation * 0.9} color="#c084fc" distance={8} />
      <pointLight position={[0, -1.8, 2.4]} intensity={0.9 + campBurst * 1.2} color="#fbbf24" distance={9} />

      {/* 1. Fluid-mosaic Phospholipid Bilayer Cell Membrane */}
      <PhospholipidBilayer repMode={repMode} />

      {/* 2. 7-TM GLP-1R GPCR Receptor (PDB 5VAI) with 22° TM6 Outward Swing */}
      <Glp1rSevenTmReceptor
        tm6SwingRad={tm6SwingRad}
        dockGlow={ligandDock}
        repMode={repMode}
      />

      {/* 3. Descending Glowing Cyan-Gold Peptide Molecular Key */}
      <PeptideMolecularKey dockProgress={ligandDock} repMode={repMode} />

      {/* 4. Intracellular Gs Heterotrimer + cAMP Second Messenger Burst */}
      <GsProteinTrimer
        dockProgress={gsDock}
        activateSplit={gsSplit}
        repMode={repMode}
      />
      <CampSecondMessengerBurst activeLevel={campBurst} />

      {/* 5. Four Human Target Organ Holographic Totems */}
      <OrganHologramPod
        position={ORGAN_TARGETS[0]}
        color="#818cf8"
        lit={litHypothalamus}
        kind="hypothalamus"
      />
      <OrganHologramPod
        position={ORGAN_TARGETS[1]}
        color="#2dd4bf"
        lit={litPancreas}
        kind="pancreas"
      />
      <OrganHologramPod
        position={ORGAN_TARGETS[2]}
        color="#fb7185"
        lit={litHeart}
        kind="heart"
      />
      <OrganHologramPod
        position={ORGAN_TARGETS[3]}
        color="#fbbf24"
        lit={litDermal}
        kind="dermal"
      />

      {/* 6. Trilingual <Html> Annotations (controlled by showLabels) */}
      {showLabels && (
        <>
          <Html
            position={[0.05, lerp(2.95, 1.88, ligandDock), 0.15]}
            center
            distanceFactor={12}
          >
            <div className="mol-label-3d" style={{ borderColor: '#22d3ee' }}>
              {t > 0.24 ? text.ligandDocked : text.ligandKey}
            </div>
          </Html>

          <Html zIndexRange={[8, 0]} position={[-3.15, 0.95, 0.2]} center distanceFactor={12}>
            <div className="mol-label-3d" style={{ borderColor: '#38bdf8' }}>
              {text.bilayer}
            </div>
          </Html>

          <Html zIndexRange={[8, 0]} position={[1.45, 0.45, -0.35]} center distanceFactor={12}>
            <div
              className="mol-label-3d"
              style={{ borderColor: tm6Activation > 0.25 ? '#f59e0b' : '#a855f7' }}
            >
              {tm6Activation > 0.25 ? text.gpcrActivated : text.gpcrIdle}
            </div>
          </Html>

          {gsDock > 0.2 && (
            <Html zIndexRange={[8, 0]} position={[0.05, -1.32, 0.25]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#fde047' }}>
                {text.gsCamp}
              </div>
            </Html>
          )}

          {litHypothalamus > 0.15 && (
            <Html
              position={[ORGAN_TARGETS[0][0], ORGAN_TARGETS[0][1] - 0.56, ORGAN_TARGETS[0][2]]}
              center
              distanceFactor={12}
            >
              <div className="mol-label-3d" style={{ borderColor: '#818cf8' }}>
                {text.organHypothalamus}
              </div>
            </Html>
          )}
          {litPancreas > 0.15 && (
            <Html
              position={[ORGAN_TARGETS[1][0], ORGAN_TARGETS[1][1] - 0.56, ORGAN_TARGETS[1][2]]}
              center
              distanceFactor={12}
            >
              <div className="mol-label-3d" style={{ borderColor: '#2dd4bf' }}>
                {text.organPancreas}
              </div>
            </Html>
          )}
          {litHeart > 0.15 && (
            <Html
              position={[ORGAN_TARGETS[2][0], ORGAN_TARGETS[2][1] - 0.56, ORGAN_TARGETS[2][2]]}
              center
              distanceFactor={12}
            >
              <div className="mol-label-3d" style={{ borderColor: '#fb7185' }}>
                {text.organHeart}
              </div>
            </Html>
          )}
          {litDermal > 0.15 && (
            <Html
              position={[ORGAN_TARGETS[3][0], ORGAN_TARGETS[3][1] - 0.56, ORGAN_TARGETS[3][2]]}
              center
              distanceFactor={12}
            >
              <div className="mol-label-3d" style={{ borderColor: '#fbbf24' }}>
                {text.organDermal}
              </div>
            </Html>
          )}

          {mode === '3min' && litDermal > 0.45 && (
            <Html zIndexRange={[8, 0]} position={[3.15, -1.25, 0.45]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#fbbf24' }}>
                {text.dermal3MinNote}
              </div>
            </Html>
          )}

          {mode === '3min' && t > 0.85 && (
            <Html zIndexRange={[8, 0]} position={[0, -2.52, 0.5]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#2dd4bf' }}>
                {text.valueChainNote}
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}
