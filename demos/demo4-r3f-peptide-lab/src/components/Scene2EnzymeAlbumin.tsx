import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from './HtmlOverlay';
import * as THREE from 'three';
import type { CourseMode, Lang, RepMode } from '../types';

interface Scene2Props {
  localT: number;
  mode: CourseMode;
  repMode: RepMode;
  showLabels: boolean;
  lang: Lang;
}

interface LabelStrings {
  nativeIntact: string;
  nativeCleaved: string;
  dpp4Left: string;
  semaHelix: string;
  aib8Shield: string;
  dpp4Deflected: string;
  c18Chain: string;
  c18Docked: string;
  hsaPocket: string;
  modeNote: string;
}

const LABELS: Record<Lang, LabelStrings> = {
  en: {
    nativeIntact: 'Native GLP-1 · Ala8 Target',
    nativeCleaved: 'Cleaved His7–Ala8 · Inactive (t½ < 2 min)',
    dpp4Left: 'DPP-4 Protease · Ala8–Glu9 Shear',
    semaHelix: 'Semaglutide 31 AA · PDB 4ZGM',
    aib8Shield: 'Aib8 Crystal Armor · Blocks DPP-4',
    dpp4Deflected: 'DPP-4 Deflected by Steric Shield',
    c18Chain: 'Lys26 Linker + C18 Fatty Diacid',
    c18Docked: 'C18 Anchored · ~165 h (1×/wk)',
    hsaPocket: 'Human Serum Albumin (~66.5 kDa)',
    modeNote: '31 AA (4ZGM) vs Tirzepatide 39 AA · Thai FDA Special Control',
  },
  zh: {
    nativeIntact: '天然 GLP-1 · 第8位 Ala 易切点',
    nativeCleaved: '已切下 N端2残基 · 失活飘散 (t½ < 2 分钟)',
    dpp4Left: 'DPP-4 蛋白酶 · 咬合剪断 Ala8–Glu9',
    semaHelix: '司美格鲁肽 31 AA α-螺旋 · PDB 4ZGM',
    aib8Shield: 'Aib8 晶体六角护甲 · 弹开 DPP-4',
    dpp4Deflected: 'DPP-4 酶被空间位阻防盾弹开',
    c18Chain: 'Lys26 连接臂 + 18碳 C18 脂肪酸二酸',
    c18Docked: 'C18 精准锚定白蛋白 · ~165 小时/周',
    hsaPocket: '人血清白蛋白 HSA (~66.5 kDa)',
    modeNote: '对比：替尔泊肽 39 AA (C20) · 泰国 FDA 特殊控制处方药',
  },
  th: {
    nativeIntact: 'GLP-1 ธรรมชาติ · ตำแหน่ง Ala8',
    nativeCleaved: 'ถูกตัดปลาย N 2 ตัว · หมดฤทธิ์ (t½ < 2 นาที)',
    dpp4Left: 'เอนไซม์ DPP-4 · ตัดพันธะ Ala8–Glu9',
    semaHelix: 'Semaglutide 31 AA · PDB 4ZGM',
    aib8Shield: 'เกราะผลึก Aib8 · ป้องกัน DPP-4',
    dpp4Deflected: 'DPP-4 ถูกดีดกลับด้วยเกราะ Aib8',
    c18Chain: 'Lys26 Linker + กรดไขมัน C18 Diacid',
    c18Docked: 'C18 ยึดกับอัลบูมิน · ~165 ชม./สัปดาห์',
    hsaPocket: 'อัลบูมินในซีรัม HSA (~66.5 kDa)',
    modeNote: 'เทียบ Tirzepatide 39 AA (C20) · ยาควบคุมพิเศษ อย. ไทย',
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

function generateHelixBackbone(
  count: number,
  start: THREE.Vector3,
  end: THREE.Vector3,
  radius: number,
  radPerResidue = (Math.PI * 2) / 3.6
): THREE.Vector3[] {
  const axis = end.clone().sub(start);
  const length = axis.length();
  const dir = axis.clone().normalize();
  const upRef = Math.abs(dir.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
  const basisU = new THREE.Vector3().crossVectors(dir, upRef).normalize();
  const basisV = new THREE.Vector3().crossVectors(dir, basisU).normalize();

  const points: THREE.Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const frac = count > 1 ? i / (count - 1) : 0;
    const angle = i * radPerResidue;
    const pt = start
      .clone()
      .addScaledVector(dir, frac * length)
      .addScaledVector(basisU, Math.cos(angle) * radius)
      .addScaledVector(basisV, Math.sin(angle) * radius);
    points.push(pt);
  }
  return points;
}

function useDisposableTube(
  points: THREE.Vector3[],
  radius: number,
  tubularSegments = 96,
  radialSegments = 12
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

function BondCylinder({
  start,
  end,
  radius,
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  opacity = 1,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  radius: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
}) {
  const { mid, length, quaternion } = useMemo(() => {
    const diff = end.clone().sub(start);
    const len = Math.max(0.001, diff.length());
    const m = start.clone().addScaledVector(diff, 0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(UP_AXIS, diff.normalize());
    return { mid: m, length: len, quaternion: q };
  }, [start, end]);

  return (
    <mesh position={mid} quaternion={quaternion}>
      <cylinderGeometry args={[radius, radius, length, 10]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.35}
        metalness={0.25}
        transparent={opacity < 1}
        opacity={opacity}
      />
    </mesh>
  );
}

function PeptideSegment({
  points,
  repMode,
  baseColor,
  emissiveColor,
  emissiveIntensity,
  opacity = 1,
  highlightIndex = -1,
  highlightColor = '#f9a8d4',
  secondaryIndex = -1,
  secondaryColor = '#fbbf24',
  skipIndex = -1,
}: {
  points: THREE.Vector3[];
  repMode: RepMode;
  baseColor: string;
  emissiveColor: string;
  emissiveIntensity: number;
  opacity?: number;
  highlightIndex?: number;
  highlightColor?: string;
  secondaryIndex?: number;
  secondaryColor?: string;
  skipIndex?: number;
}) {
  const tubeGeom = useDisposableTube(
    points.length >= 2 ? points : [new THREE.Vector3(), new THREE.Vector3(0, 0.1, 0)],
    repMode === 'surface' ? 0.21 : 0.085,
    Math.max(24, points.length * 4),
    14
  );

  const axisCenter = useMemo(() => {
    const c = new THREE.Vector3();
    points.forEach((p) => c.add(p));
    return points.length > 0 ? c.divideScalar(points.length) : c;
  }, [points]);

  const sidePins = useMemo(() => {
    return points.map((pt, i) => {
      const radial = pt.clone().sub(axisCenter);
      radial.y *= 0.35;
      if (radial.lengthSq() < 0.0001) {
        radial.set(0.2, 0, 0.2);
      }
      radial.normalize();
      const tip = pt.clone().addScaledVector(radial, 0.17 + (i % 3) * 0.03);
      return { pt, tip };
    });
  }, [points, axisCenter]);

  return (
    <group>
      {(repMode === 'ribbon' || repMode === 'surface') && points.length >= 2 && (
        <mesh geometry={tubeGeom}>
          <meshPhysicalMaterial
            color={baseColor}
            emissive={emissiveColor}
            emissiveIntensity={emissiveIntensity}
            roughness={repMode === 'surface' ? 0.28 : 0.22}
            metalness={repMode === 'surface' ? 0.1 : 0.32}
            clearcoat={repMode === 'surface' ? 0.65 : 0.35}
            transparent
            opacity={repMode === 'surface' ? opacity * 0.62 : opacity}
            depthWrite={repMode !== 'surface'}
          />
        </mesh>
      )}

      {repMode === 'surface' &&
        points.map((pt, idx) => {
          if (idx === skipIndex) return null;
          const isHighlight = idx === highlightIndex;
          const isSecondary = idx === secondaryIndex;
          const col = isHighlight ? highlightColor : isSecondary ? secondaryColor : baseColor;
          return (
            <mesh key={`surf-${idx}`} position={pt}>
              <sphereGeometry args={[isHighlight ? 0.27 : 0.24, 18, 18]} />
              <meshPhysicalMaterial
                color={col}
                emissive={isHighlight ? col : emissiveColor}
                emissiveIntensity={isHighlight ? emissiveIntensity + 0.35 : emissiveIntensity * 0.7}
                roughness={0.28}
                clearcoat={0.55}
                transparent
                opacity={opacity * 0.52}
                depthWrite={false}
              />
            </mesh>
          );
        })}

      {repMode === 'ball-stick' && (
        <group>
          {points.map((pt, idx) => {
            const isHighlight = idx === highlightIndex;
            const isSecondary = idx === secondaryIndex;
            const atomColor = isHighlight
              ? highlightColor
              : isSecondary
                ? secondaryColor
                : idx % 3 === 0
                  ? baseColor
                  : '#67e8f9';
            const atomEmissive = isHighlight
              ? highlightColor
              : isSecondary
                ? secondaryColor
                : emissiveColor;

            return (
              <group key={`bs-${idx}`}>
                {idx !== skipIndex && (
                  <>
                    <mesh position={pt}>
                      <sphereGeometry args={[isHighlight ? 0.145 : 0.098, 16, 16]} />
                      <meshStandardMaterial
                        color={atomColor}
                        emissive={atomEmissive}
                        emissiveIntensity={
                          isHighlight || isSecondary ? emissiveIntensity + 0.45 : emissiveIntensity
                        }
                        roughness={0.22}
                        metalness={0.3}
                        transparent={opacity < 1}
                        opacity={opacity}
                      />
                    </mesh>
                    <BondCylinder
                      start={sidePins[idx].pt}
                      end={sidePins[idx].tip}
                      radius={0.025}
                      color={atomColor}
                      opacity={opacity * 0.9}
                    />
                    <mesh position={sidePins[idx].tip}>
                      <sphereGeometry args={[0.048, 10, 10]} />
                      <meshStandardMaterial
                        color={isHighlight ? highlightColor : '#bae6fd'}
                        emissive={atomEmissive}
                        emissiveIntensity={emissiveIntensity * 0.8}
                        roughness={0.3}
                        transparent={opacity < 1}
                        opacity={opacity}
                      />
                    </mesh>
                  </>
                )}
                {idx < points.length - 1 && (
                  <BondCylinder
                    start={pt}
                    end={points[idx + 1]}
                    radius={0.036}
                    color={baseColor}
                    emissive={emissiveColor}
                    emissiveIntensity={emissiveIntensity * 0.5}
                    opacity={opacity}
                  />
                )}
              </group>
            );
          })}
        </group>
      )}
    </group>
  );
}

/**
 * Dual-lobe red molecular scissor protease representing DPP-4 (CD26).
 */
function Dpp4ScissorProtease({
  position,
  rotation,
  jawAngle,
  repMode,
  flashIntensity = 0,
  scale = 1,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  jawAngle: number;
  repMode: RepMode;
  flashIntensity?: number;
  scale?: number;
}) {
  const lobeOpacity = repMode === 'surface' ? 0.68 : 0.9;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Catalytic hinge hub (Ser630-Asp708-His740 triad) */}
      <mesh>
        <sphereGeometry args={[0.19, 20, 20]} />
        <meshStandardMaterial
          color="#991b1b"
          emissive="#ef4444"
          emissiveIntensity={0.45 + flashIntensity * 1.1}
          metalness={0.45}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0.08, 0, 0.14]}>
        <sphereGeometry args={[0.075, 14, 14]} />
        <meshStandardMaterial
          color="#fda4af"
          emissive="#fb7185"
          emissiveIntensity={0.8 + flashIntensity * 1.5}
        />
      </mesh>

      {/* Upper catalytic lobe + upper scissor blade */}
      <group rotation={[0, 0, jawAngle]}>
        <mesh position={[0.34, 0.08, 0]} rotation={[0, 0, -0.18]}>
          <capsuleGeometry args={[0.095, 0.52, 8, 16]} />
          <meshPhysicalMaterial
            color="#ef4444"
            emissive="#dc2626"
            emissiveIntensity={0.35 + flashIntensity * 0.9}
            metalness={0.4}
            roughness={0.24}
            clearcoat={0.5}
            transparent={lobeOpacity < 1}
            opacity={lobeOpacity}
          />
        </mesh>
        <mesh position={[-0.24, 0.2, 0]} scale={[1.25, 0.85, 0.9]}>
          <sphereGeometry args={[0.24, 18, 18]} />
          <meshPhysicalMaterial
            color="#b91c1c"
            emissive="#ef4444"
            emissiveIntensity={0.22}
            roughness={0.35}
            transparent={repMode === 'surface'}
            opacity={repMode === 'surface' ? 0.62 : 0.92}
          />
        </mesh>
        {repMode === 'ball-stick' && (
          <mesh position={[-0.24, 0.2, 0]}>
            <icosahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial color="#fca5a5" wireframe transparent opacity={0.35} />
          </mesh>
        )}
      </group>

      {/* Lower catalytic lobe + lower scissor blade */}
      <group rotation={[0, 0, -jawAngle]}>
        <mesh position={[0.34, -0.08, 0]} rotation={[0, 0, 0.18]}>
          <capsuleGeometry args={[0.095, 0.52, 8, 16]} />
          <meshPhysicalMaterial
            color="#f43f5e"
            emissive="#e11d48"
            emissiveIntensity={0.35 + flashIntensity * 0.9}
            metalness={0.4}
            roughness={0.24}
            clearcoat={0.5}
            transparent={lobeOpacity < 1}
            opacity={lobeOpacity}
          />
        </mesh>
        <mesh position={[-0.24, -0.2, 0]} scale={[1.25, 0.85, 0.9]}>
          <sphereGeometry args={[0.24, 18, 18]} />
          <meshPhysicalMaterial
            color="#9f1239"
            emissive="#f43f5e"
            emissiveIntensity={0.22}
            roughness={0.35}
            transparent={repMode === 'surface'}
            opacity={repMode === 'surface' ? 0.62 : 0.92}
          />
        </mesh>
        {repMode === 'ball-stick' && (
          <mesh position={[-0.24, -0.2, 0]}>
            <icosahedronGeometry args={[0.26, 0]} />
            <meshStandardMaterial color="#fda4af" wireframe transparent opacity={0.35} />
          </mesh>
        )}
      </group>
    </group>
  );
}

/**
 * Faceted hexagonal blue crystal armor representing Aib8 (α-aminoisobutyric acid)
 * plus an animated reactive energy shield pulse upon DPP-4 impact.
 */
function Aib8CrystalArmor({
  position,
  shieldPulse,
  localT,
}: {
  position: THREE.Vector3;
  shieldPulse: number;
  localT: number;
}) {
  const crystalRef = useRef<THREE.Group>(null);
  const ringScale = 1 + shieldPulse * 1.45;

  useFrame(({ clock }) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y = clock.elapsedTime * 1.05 + localT * 4.0;
    }
  });

  return (
    <group position={position}>
      <group ref={crystalRef}>
        {/* Sparkling hexagonal sapphire crystal core */}
        <mesh rotation={[0.45, 0, 0.3]}>
          <cylinderGeometry args={[0.23, 0.23, 0.28, 6]} />
          <meshPhysicalMaterial
            color="#3b82f6"
            emissive="#60a5fa"
            emissiveIntensity={0.85 + shieldPulse * 1.5}
            metalness={0.45}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        {/* Gem wireframe armor cage */}
        <mesh rotation={[0.45, 0, 0.3]} scale={1.16}>
          <cylinderGeometry args={[0.24, 0.24, 0.3, 6]} />
          <meshBasicMaterial color="#bae6fd" wireframe transparent opacity={0.75} />
        </mesh>
      </group>

      {/* Twin α,α-dimethyl steric crystal prongs (distinctive Aib quaternary Cα bulk) */}
      <mesh position={[0.17, 0.14, 0.08]} rotation={[0.4, 0.2, -0.6]}>
        <octahedronGeometry args={[0.095, 0]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#3b82f6"
          emissiveIntensity={0.9 + shieldPulse}
          metalness={0.5}
          roughness={0.15}
        />
      </mesh>
      <mesh position={[-0.16, -0.12, 0.1]} rotation={[-0.3, 0.4, 0.5]}>
        <octahedronGeometry args={[0.095, 0]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive="#3b82f6"
          emissiveIntensity={0.9 + shieldPulse}
          metalness={0.5}
          roughness={0.15}
        />
      </mesh>

      {/* Energy shield dome & shockwave hexagonal ring when DPP-4 collides */}
      {shieldPulse > 0.02 && (
        <group>
          <mesh scale={0.42 + shieldPulse * 0.55}>
            <icosahedronGeometry args={[1, 1]} />
            <meshBasicMaterial
              color="#60a5fa"
              wireframe
              transparent
              opacity={shieldPulse * 0.72}
            />
          </mesh>
          <mesh rotation={[0.35, -0.45, 0]} scale={ringScale}>
            <ringGeometry args={[0.32, 0.4, 6]} />
            <meshBasicMaterial
              color="#93c5fd"
              side={THREE.DoubleSide}
              transparent
              opacity={shieldPulse * 0.85}
            />
          </mesh>
          <mesh rotation={[-0.5, 0.6, 0.2]} scale={ringScale * 1.18}>
            <torusGeometry args={[0.36, 0.022, 8, 6]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={shieldPulse * 0.9} />
          </mesh>
        </group>
      )}
    </group>
  );
}

/**
 * Lys26 γ-Glu-2xOEG Linker + 18-segment glowing gold-orange C18 fatty diacid chain
 * updated smoothly in useFrame without per-frame geometry allocation.
 */
function Lys26C18Chain({
  lysAnchor,
  pocketEntry,
  pocketDeep,
  insertProgress,
  localT,
  repMode,
}: {
  lysAnchor: THREE.Vector3;
  pocketEntry: THREE.Vector3;
  pocketDeep: THREE.Vector3;
  insertProgress: number;
  localT: number;
  repMode: RepMode;
}) {
  const carbonRefs = useRef<(THREE.Mesh | null)[]>([]);
  const bondRefs = useRef<(THREE.Mesh | null)[]>([]);
  const linkerBondRef = useRef<THREE.Mesh>(null);
  const linkerMidRef = useRef<THREE.Mesh>(null);
  const linkerEndRef = useRef<THREE.Mesh>(null);

  const scratchNodes = useMemo(
    () => Array.from({ length: 18 }, () => new THREE.Vector3()),
    []
  );
  const scratchLinkerEnd = useMemo(() => new THREE.Vector3(), []);
  const scratchFreeEnd = useMemo(() => new THREE.Vector3(), []);
  const scratchDockedEnd = useMemo(() => new THREE.Vector3(), []);
  const scratchFreePt = useMemo(() => new THREE.Vector3(), []);
  const scratchDockedPt = useMemo(() => new THREE.Vector3(), []);
  const scratchDiff = useMemo(() => new THREE.Vector3(), []);
  const scratchMid = useMemo(() => new THREE.Vector3(), []);
  const scratchQuat = useMemo(() => new THREE.Quaternion(), []);

  useFrame(({ clock }) => {
    const waveTime = clock.elapsedTime * 3.1 + localT * 6.0;
    const waveAmp = lerp(0.18, 0.024, insertProgress);

    scratchFreeEnd.copy(lysAnchor).add(new THREE.Vector3(0.56, -0.08, -0.05));
    scratchDockedEnd.copy(lysAnchor).lerp(pocketEntry, 0.48);
    scratchLinkerEnd.lerpVectors(scratchFreeEnd, scratchDockedEnd, insertProgress);

    // Update Lys26 -> Linker bond
    if (linkerBondRef.current) {
      scratchDiff.subVectors(scratchLinkerEnd, lysAnchor);
      const len = Math.max(0.001, scratchDiff.length());
      scratchMid.copy(lysAnchor).addScaledVector(scratchDiff, 0.5);
      scratchQuat.setFromUnitVectors(UP_AXIS, scratchDiff.normalize());
      linkerBondRef.current.position.copy(scratchMid);
      linkerBondRef.current.quaternion.copy(scratchQuat);
      linkerBondRef.current.scale.set(1, len, 1);
    }
    if (linkerMidRef.current) {
      linkerMidRef.current.position.lerpVectors(lysAnchor, scratchLinkerEnd, 0.5);
    }
    if (linkerEndRef.current) {
      linkerEndRef.current.position.copy(scratchLinkerEnd);
    }

    // Update 18 gold-orange carbon spheres along undulating or pocket-docked trajectory
    for (let i = 0; i < 18; i++) {
      const f = i / 17;
      scratchFreePt.set(
        scratchLinkerEnd.x + 0.1 + f * 1.45,
        scratchLinkerEnd.y + Math.sin(f * Math.PI * 2.2 + waveTime) * waveAmp - 0.12 * f,
        scratchLinkerEnd.z + Math.cos(f * Math.PI * 1.8 + waveTime * 0.85) * waveAmp * 0.85
      );
      scratchDockedPt.lerpVectors(scratchLinkerEnd, pocketDeep, 0.06 + f * 0.94);
      scratchDockedPt.y += Math.sin(f * Math.PI * 3.5 + waveTime * 0.55) * waveAmp * 0.7;
      scratchDockedPt.z += Math.cos(f * Math.PI * 2.8 + waveTime * 0.55) * waveAmp * 0.6;

      scratchNodes[i].lerpVectors(scratchFreePt, scratchDockedPt, insertProgress);

      const sphereMesh = carbonRefs.current[i];
      if (sphereMesh) {
        sphereMesh.position.copy(scratchNodes[i]);
        const pulse = 1 + 0.1 * Math.sin(waveTime * 1.3 - i * 0.35);
        sphereMesh.scale.setScalar(pulse);
      }
    }

    // Update 17 C–C connecting bond cylinders
    for (let i = 0; i < 17; i++) {
      const bondMesh = bondRefs.current[i];
      if (!bondMesh) continue;
      scratchDiff.subVectors(scratchNodes[i + 1], scratchNodes[i]);
      const len = Math.max(0.001, scratchDiff.length());
      scratchMid.copy(scratchNodes[i]).addScaledVector(scratchDiff, 0.5);
      scratchQuat.setFromUnitVectors(UP_AXIS, scratchDiff.normalize());
      bondMesh.position.copy(scratchMid);
      bondMesh.quaternion.copy(scratchQuat);
      bondMesh.scale.set(1, len, 1);
    }
  });

  const baseRadius = repMode === 'surface' ? 0.095 : repMode === 'ribbon' ? 0.084 : 0.072;

  return (
    <group>
      {/* Lys26 side chain + γ-Glu-2xOEG spacer linker */}
      <mesh ref={linkerBondRef}>
        <cylinderGeometry args={[0.035, 0.035, 1, 10]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#38bdf8" emissiveIntensity={0.28} />
      </mesh>
      <mesh ref={linkerMidRef}>
        <sphereGeometry args={[0.072, 14, 14]} />
        <meshStandardMaterial color="#a5f3fc" emissive="#22d3ee" emissiveIntensity={0.48} />
      </mesh>
      <mesh ref={linkerEndRef}>
        <sphereGeometry args={[0.078, 14, 14]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.55} />
      </mesh>

      {/* 18 glowing gold-orange carbon spheres */}
      {Array.from({ length: 18 }, (_, idx) => {
        const isTerminalDiacid = idx === 17;
        return (
          <mesh
            key={`c18-node-${idx}`}
            ref={(el) => {
              carbonRefs.current[idx] = el;
            }}
          >
            <sphereGeometry args={[isTerminalDiacid ? baseRadius * 1.24 : baseRadius, 14, 14]} />
            <meshStandardMaterial
              color={isTerminalDiacid ? '#fef08a' : idx % 2 === 0 ? '#f59e0b' : '#fb923c'}
              emissive={isTerminalDiacid ? '#facc15' : '#ea580c'}
              emissiveIntensity={0.65 + insertProgress * 0.5}
              roughness={0.2}
              metalness={0.25}
            />
          </mesh>
        );
      })}

      {/* 17 Hydrocarbon bond segments */}
      {Array.from({ length: 17 }, (_, idx) => (
        <mesh
          key={`c18-bond-${idx}`}
          ref={(el) => {
            bondRefs.current[idx] = el;
          }}
        >
          <cylinderGeometry
            args={[
              repMode === 'ribbon' ? 0.048 : 0.028,
              repMode === 'ribbon' ? 0.048 : 0.028,
              1,
              8,
            ]}
          />
          <meshStandardMaterial
            color="#fdba74"
            emissive="#f59e0b"
            emissiveIntensity={0.5}
            roughness={0.25}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Multi-domain ~66.5 kDa Human Serum Albumin (HSA) rendered as a frosted pearl-white
 * globular complex (Domains I, II, III) with a glowing hydrophobic pocket cavity.
 */
function HumanSerumAlbumin({
  center,
  pocketEntry,
  dockGlow,
  repMode,
}: {
  center: THREE.Vector3;
  pocketEntry: THREE.Vector3;
  dockGlow: number;
  repMode: RepMode;
}) {
  const domainClusters = useMemo(
    () => [
      { offset: [-0.52, 0.62, -0.15] as const, radius: 0.68, tone: '#f8fafc' },
      { offset: [-0.15, 0.88, 0.12] as const, radius: 0.56, tone: '#f1f5f9' },
      { offset: [-0.78, 0.35, 0.18] as const, radius: 0.46, tone: '#e2e8f0' },
      { offset: [0.35, 0.52, -0.25] as const, radius: 0.72, tone: '#f8fafc' },
      { offset: [0.68, 0.18, 0.16] as const, radius: 0.64, tone: '#f1f5f9' },
      { offset: [0.12, -0.08, -0.45] as const, radius: 0.66, tone: '#e2e8f0' },
      { offset: [-0.25, -0.68, -0.1] as const, radius: 0.65, tone: '#f8fafc' },
      { offset: [0.36, -0.62, 0.15] as const, radius: 0.62, tone: '#f1f5f9' },
      { offset: [0.75, -0.35, -0.2] as const, radius: 0.54, tone: '#e2e8f0' },
    ],
    []
  );

  const innerHelixLoops = useMemo(
    () => [
      [
        new THREE.Vector3(-0.6, 0.75, -0.1),
        new THREE.Vector3(-0.1, 0.9, 0.1),
        new THREE.Vector3(0.45, 0.5, -0.2),
      ],
      [
        new THREE.Vector3(0.55, 0.25, 0.1),
        new THREE.Vector3(0.2, -0.2, -0.35),
        new THREE.Vector3(-0.3, -0.7, -0.05),
      ],
      [
        new THREE.Vector3(-0.15, -0.65, 0.05),
        new THREE.Vector3(0.42, -0.58, 0.12),
        new THREE.Vector3(0.7, -0.28, -0.18),
      ],
    ],
    []
  );

  const loopTube0 = useDisposableTube(innerHelixLoops[0], 0.09, 32, 10);
  const loopTube1 = useDisposableTube(innerHelixLoops[1], 0.09, 32, 10);
  const loopTube2 = useDisposableTube(innerHelixLoops[2], 0.09, 32, 10);

  return (
    <group position={center}>
      {/* Frosted pearl-white multi-domain outer envelope */}
      {domainClusters.map((lobe, idx) => (
        <mesh
          key={`hsa-lobe-${idx}`}
          position={[lobe.offset[0], lobe.offset[1], lobe.offset[2]]}
        >
          <sphereGeometry args={[lobe.radius, 24, 24]} />
          <meshPhysicalMaterial
            color={lobe.tone}
            emissive="#cbd5e1"
            emissiveIntensity={0.08 + dockGlow * 0.16}
            roughness={repMode === 'surface' ? 0.32 : 0.42}
            metalness={0.06}
            clearcoat={0.65}
            clearcoatRoughness={0.28}
            transparent
            opacity={repMode === 'ball-stick' ? 0.34 : repMode === 'ribbon' ? 0.4 : 0.56}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* Internal structural scaffold visible inside frosted albumin */}
      {(repMode === 'ribbon' || repMode === 'ball-stick') && (
        <group>
          <mesh geometry={loopTube0}>
            <meshStandardMaterial
              color="#cbd5e1"
              emissive="#94a3b8"
              emissiveIntensity={0.22}
              roughness={0.35}
            />
          </mesh>
          <mesh geometry={loopTube1}>
            <meshStandardMaterial
              color="#e2e8f0"
              emissive="#94a3b8"
              emissiveIntensity={0.22}
              roughness={0.35}
            />
          </mesh>
          <mesh geometry={loopTube2}>
            <meshStandardMaterial
              color="#cbd5e1"
              emissive="#94a3b8"
              emissiveIntensity={0.22}
              roughness={0.35}
            />
          </mesh>
        </group>
      )}

      {/* Hydrophobic binding pocket collar (Sudlow / FA pocket) */}
      <group position={pocketEntry.clone().sub(center)} rotation={[0.15, 1.25, 0]}>
        <mesh>
          <torusGeometry args={[0.26, 0.036, 12, 28]} />
          <meshStandardMaterial
            color="#fbbf24"
            emissive="#f59e0b"
            emissiveIntensity={0.45 + dockGlow * 1.15}
            roughness={0.2}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.21, 16, 16]} />
          <meshBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.14 + dockGlow * 0.25}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Gentle bloodstream micro-flow particles drifting around the anchored complex
 * to illustrate calm ~165-hour vascular circulation.
 */
function BloodMicroStream({ activeStrength }: { activeStrength: number }) {
  const count = 28;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x0: -2 + (i / count) * 8.2,
        y: -1.6 + ((i * 7) % 11) * 0.34,
        z: -1.6 + ((i * 5) % 9) * 0.32,
        speed: 0.45 + (i % 5) * 0.14,
        size: 0.035 + (i % 3) * 0.014,
      })),
    []
  );

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;
    const scaleBoost = 0.55 + activeStrength * 0.65;
    for (let i = 0; i < count; i++) {
      const s = seeds[i];
      const px = ((((s.x0 + t * s.speed) + 2) % 8.4) + 8.4) % 8.4 - 2.0;
      const py = s.y + Math.sin(t * 1.4 + i) * 0.14;
      dummy.position.set(px, py, s.z);
      dummy.scale.setScalar(s.size * scaleBoost);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 10, 10]} />
      <meshBasicMaterial
        color="#38bdf8"
        transparent
        opacity={0.22 + activeStrength * 0.28}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export function Scene2EnzymeAlbumin({
  localT,
  mode,
  repMode,
  showLabels,
  lang,
}: Scene2Props) {
  const t = clamp01(localT);
  const text = LABELS[lang];

  const leftGroupRef = useRef<THREE.Group>(null);
  const rightComplexRef = useRef<THREE.Group>(null);

  // Left side timelines (Native GLP-1 cleavage)
  const leftApproach = smoothstep(0.02, 0.22, t);
  const leftCut = smoothstep(0.22, 0.34, t);
  const leftPostCut = smoothstep(0.34, 0.92, t);
  const isNativeCleaved = t >= 0.30;

  // Right side timelines (Semaglutide Aib8 shield + C18 HSA docking)
  const rightAttack = smoothstep(0.08, 0.35, t);
  const rightImpact = smoothstep(0.35, 0.44, t) * (1 - smoothstep(0.48, 0.72, t));
  const rightRecoil = smoothstep(0.40, 0.68, t);
  const c18Insert = smoothstep(0.42, 0.72, t);
  const cruisingPhase = smoothstep(0.68, 1.0, t);

  // Native GLP-1 static base geometry (transform wrappers move fragments cleanly at 0 GC cost)
  const nativeNFragBase = useMemo(
    () =>
      generateHelixBackbone(
        2,
        new THREE.Vector3(-3.75, 1.15, 0.35),
        new THREE.Vector3(-3.55, 0.96, 0.32),
        0.16
      ),
    []
  );
  const nativeBodyBase = useMemo(
    () =>
      generateHelixBackbone(
        14,
        new THREE.Vector3(-3.36, 0.76, 0.28),
        new THREE.Vector3(-1.88, -0.78, 0.08),
        0.22
      ),
    []
  );

  // Semaglutide 31-AA α-helix (residues 7..37: index 1 = Aib8, index 19 = Lys26)
  const semaBackbone = useMemo(
    () =>
      generateHelixBackbone(
        31,
        new THREE.Vector3(-0.35, 1.48, 0.42),
        new THREE.Vector3(1.12, -1.18, 0.14),
        0.27
      ),
    []
  );

  const aib8Pos = semaBackbone[1];
  const lys26Pos = semaBackbone[19];

  const hsaCenter = useMemo(() => new THREE.Vector3(3.48, -0.22, -0.45), []);
  const pocketEntry = useMemo(() => new THREE.Vector3(2.68, -0.26, -0.18), []);
  const pocketDeep = useMemo(() => new THREE.Vector3(3.26, -0.22, -0.38), []);

  const nativeOpacity = lerp(0.96, 0.24, leftPostCut);
  const nativeEmissive = lerp(0.32, 0.02, leftPostCut);

  // Left DPP-4 scissor pose
  const leftCutPoint = useMemo(
    () => nativeNFragBase[1].clone().lerp(nativeBodyBase[0], 0.5),
    [nativeNFragBase, nativeBodyBase]
  );
  const leftDpp4Pos: [number, number, number] = [
    lerp(-4.55, leftCutPoint.x - 0.15, leftApproach) - leftPostCut * 0.42,
    lerp(1.88, leftCutPoint.y + 0.08, leftApproach) + leftPostCut * 0.45,
    lerp(0.85, leftCutPoint.z + 0.25, leftApproach),
  ];
  const leftJawAngle =
    t < 0.22
      ? 0.46
      : t < 0.36
        ? lerp(0.46, 0.03, leftCut)
        : lerp(0.03, 0.32, smoothstep(0.36, 0.65, t));

  // Right DPP-4 scissor pose (strikes Aib8 crystal armor & rebounds)
  const rightDpp4Start = useMemo(() => new THREE.Vector3(-1.35, 1.92, 0.95), []);
  const rightDpp4Hit = useMemo(
    () => aib8Pos.clone().add(new THREE.Vector3(-0.36, 0.2, 0.32)),
    [aib8Pos]
  );
  const rightDpp4Bounce = useMemo(() => new THREE.Vector3(-1.12, 1.88, 1.05), []);

  const rightDpp4Pos: [number, number, number] = useMemo(() => {
    const v = new THREE.Vector3();
    if (t < 0.4) {
      v.lerpVectors(rightDpp4Start, rightDpp4Hit, rightAttack);
    } else {
      v.lerpVectors(rightDpp4Hit, rightDpp4Bounce, rightRecoil);
    }
    return [v.x, v.y, v.z];
  }, [t, rightAttack, rightRecoil, rightDpp4Start, rightDpp4Hit, rightDpp4Bounce]);

  const rightJawAngle =
    t < 0.34 ? 0.44 : lerp(0.44, 0.24, smoothstep(0.34, 0.42, t));
  const rightRecoilTilt = Math.sin(rightImpact * Math.PI * 5) * 0.28;

  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime;
    if (leftGroupRef.current) {
      leftGroupRef.current.position.y = Math.sin(elapsed * 1.1) * 0.04;
    }
    if (rightComplexRef.current) {
      const cruiseAmp = 0.035 + cruisingPhase * 0.075;
      rightComplexRef.current.position.y = Math.sin(elapsed * 0.95) * cruiseAmp;
      rightComplexRef.current.position.x = Math.cos(elapsed * 0.55) * (0.03 + cruisingPhase * 0.08);
      rightComplexRef.current.rotation.z = Math.sin(elapsed * 0.7) * 0.022;
    }
  });

  return (
    <group>
      {/* Scene lighting accents */}
      <pointLight position={[-3.0, 2.2, 2.4]} intensity={1.1} color="#fda4af" distance={8} />
      <pointLight position={[0.4, 2.0, 2.6]} intensity={1.35} color="#38bdf8" distance={9} />
      <pointLight position={[3.4, 0.6, 2.2]} intensity={1.2} color="#fde68a" distance={8} />

      {/* Bloodstream background particles */}
      <BloodMicroStream activeStrength={cruisingPhase} />

      {/* Center comparison divider */}
      <mesh position={[-1.45, 0.1, -0.9]}>
        <boxGeometry args={[0.015, 3.4, 0.015]} />
        <meshBasicMaterial color="#334155" transparent opacity={0.45} />
      </mesh>

      {/* ==================== LEFT GROUP: NATIVE GLP-1 + DPP-4 CLEAVAGE ==================== */}
      <group ref={leftGroupRef}>
        {/* N-terminal 2 residues (His7 - Ala8 pale pink atom), detaching upward-left */}
        <group
          position={[-0.82 * leftPostCut, 0.68 * leftPostCut, 0.32 * leftPostCut]}
          rotation={[leftPostCut * 0.4, leftPostCut * 0.3, leftPostCut * 0.55]}
        >
          <PeptideSegment
            points={nativeNFragBase}
            repMode={repMode}
            baseColor="#cbd5e1"
            emissiveColor="#f472b6"
            emissiveIntensity={nativeEmissive + 0.22}
            opacity={lerp(1, 0.42, leftPostCut)}
            highlightIndex={1}
            highlightColor="#f9a8d4"
          />
        </group>

        {/* Intact Ala8-Glu9 bond before cleavage */}
        {!isNativeCleaved && (
          <BondCylinder
            start={nativeNFragBase[1]}
            end={nativeBodyBase[0]}
            radius={0.04}
            color="#f43f5e"
            emissive="#fb7185"
            emissiveIntensity={0.65}
          />
        )}

        {/* Cleavage spark ring right as scissors snap shut */}
        {leftCut > 0.15 && leftPostCut < 0.4 && (
          <mesh position={leftCutPoint} scale={0.5 + leftCut * 1.1}>
            <torusGeometry args={[0.25, 0.025, 10, 24]} />
            <meshBasicMaterial
              color="#fb7185"
              transparent
              opacity={(1 - leftPostCut / 0.4) * 0.9}
            />
          </mesh>
        )}

        {/* Truncated Native GLP-1 body (dims and drifts downward) */}
        <group
          position={[-0.22 * leftPostCut, -0.88 * leftPostCut, -0.38 * leftPostCut]}
          rotation={[leftPostCut * 0.22, 0, -leftPostCut * 0.2]}
        >
          <PeptideSegment
            points={nativeBodyBase}
            repMode={repMode}
            baseColor={isNativeCleaved ? '#64748b' : '#94a3b8'}
            emissiveColor="#475569"
            emissiveIntensity={nativeEmissive}
            opacity={nativeOpacity}
          />
        </group>

        {/* First Red DPP-4 Protease Molecular Scissors */}
        <Dpp4ScissorProtease
          position={leftDpp4Pos}
          rotation={[0.15, 0.25, -0.58]}
          jawAngle={leftJawAngle}
          repMode={repMode}
          flashIntensity={leftCut * (1 - leftPostCut)}
          scale={0.95}
        />

        {showLabels && (
          <>
            <Html zIndexRange={[8, 0]} position={[-2.85, -1.38, 0.2]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#f472b6' }}>
                {isNativeCleaved ? text.nativeCleaved : text.nativeIntact}
              </div>
            </Html>
            <Html
              position={[leftDpp4Pos[0] - 0.12, leftDpp4Pos[1] + 0.58, leftDpp4Pos[2]]}
              center
              distanceFactor={12}
            >
              <div className="mol-label-3d" style={{ borderColor: '#ef4444' }}>
                {text.dpp4Left}
              </div>
            </Html>
          </>
        )}
      </group>

      {/* ==================== RIGHT HERO: SEMAGLUTIDE (4ZGM) + AIB8 + C18 + HSA ==================== */}
      <group ref={rightComplexRef}>
        {/* 31-AA Cyan α-Helix Backbone */}
        <PeptideSegment
          points={semaBackbone}
          repMode={repMode}
          baseColor="#06b6d4"
          emissiveColor="#0ea5e9"
          emissiveIntensity={0.34}
          opacity={0.96}
          skipIndex={1}
          secondaryIndex={19}
          secondaryColor="#fbbf24"
        />

        {/* Position 8: Sparkling Blue Crystal Hexagonal Armor Aib8 */}
        <Aib8CrystalArmor position={aib8Pos} shieldPulse={rightImpact} localT={t} />

        {/* Second Red DPP-4 Protease Scissors Deflected by Aib8 Shield */}
        <Dpp4ScissorProtease
          position={rightDpp4Pos}
          rotation={[0.18 + rightRecoilTilt * 0.4, 0.2, -0.62 + rightRecoilTilt]}
          jawAngle={rightJawAngle}
          repMode={repMode}
          flashIntensity={rightImpact}
          scale={0.92}
        />

        {/* Position 26 Lys26 Linker + 18-Segment Gold-Orange C18 Fatty Diacid Chain */}
        <Lys26C18Chain
          lysAnchor={lys26Pos}
          pocketEntry={pocketEntry}
          pocketDeep={pocketDeep}
          insertProgress={c18Insert}
          localT={t}
          repMode={repMode}
        />

        {/* Frosted Pearl-White Multi-Domain Human Serum Albumin (~66.5 kDa) */}
        <HumanSerumAlbumin
          center={hsaCenter}
          pocketEntry={pocketEntry}
          dockGlow={cruisingPhase}
          repMode={repMode}
        />

        {showLabels && (
          <>
            <Html zIndexRange={[8, 0]} position={[0.45, -1.55, 0.25]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#22d3ee' }}>
                {text.semaHelix}
              </div>
            </Html>
            <Html
              position={[aib8Pos.x + 0.15, aib8Pos.y + 0.65, aib8Pos.z]}
              center
              distanceFactor={12}
            >
              <div className="mol-label-3d" style={{ borderColor: '#60a5fa' }}>
                {text.aib8Shield}
              </div>
            </Html>
            {rightRecoil > 0.2 && (
              <Html
                position={[rightDpp4Pos[0] - 0.1, rightDpp4Pos[1] + 0.56, rightDpp4Pos[2]]}
                center
                distanceFactor={12}
              >
                <div className="mol-label-3d" style={{ borderColor: '#f43f5e' }}>
                  {text.dpp4Deflected}
                </div>
              </Html>
            )}
            <Html zIndexRange={[8, 0]} position={[1.85, -0.95, 0.15]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#f59e0b' }}>
                {c18Insert > 0.72 ? text.c18Docked : text.c18Chain}
              </div>
            </Html>
            <Html
              position={[hsaCenter.x, hsaCenter.y + 1.35, hsaCenter.z]}
              center
              distanceFactor={12}
            >
              <div className="mol-label-3d" style={{ borderColor: '#e2e8f0' }}>
                {text.hsaPocket}
              </div>
            </Html>
            {mode === '3min' && (
              <Html zIndexRange={[8, 0]} position={[1.55, 1.85, -0.2]} center distanceFactor={12}>
                <div className="mol-label-3d" style={{ borderColor: '#fbbf24' }}>
                  {text.modeNote}
                </div>
              </Html>
            )}
          </>
        )}
      </group>
    </group>
  );
}
