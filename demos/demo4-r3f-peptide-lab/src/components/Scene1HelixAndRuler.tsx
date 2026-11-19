import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Html } from './HtmlOverlay';
import * as THREE from 'three';
import type { CourseMode, Lang, RepMode } from '../types';

export interface Scene1Props {
  localT: number;
  mode: CourseMode;
  repMode: RepMode;
  showLabels: boolean;
  lang: Lang;
}

const LABELS = {
  en: {
    helix: 'Right-Handed α-Helix (3.6 AA/turn · 5.4 Å pitch)',
    hbonds: 'i → i+4 Hydrogen Bonds',
    collagen: '3 AA Collagen Tripeptide',
    sema: '31 AA Semaglutide (NDA ≤40 AA)',
    boundary: 'FDA 40-AA Boundary (85 FR 10057)',
    insulin: '51 AA Insulin A+B + 3 Disulfide S-S (BLA >40 AA)',
    spps: 'SPPS Merrifield Resin Bead',
  },
  zh: {
    helix: '右手 α-螺旋（3.6 残基/圈 · 5.4 Å 螺距）',
    hbonds: 'i → i+4 氢键网络',
    collagen: '3 AA 胶原三肽（短肽）',
    sema: '31 AA 司美格鲁肽（NDA 药物 ≤40）',
    boundary: 'FDA 40 氨基酸法定边界 (85 FR 10057)',
    insulin: '51 AA 胰岛素双链 + 3 对二硫键 S-S (BLA >40)',
    spps: 'SPPS 固相合成树脂微球',
  },
  th: {
    helix: 'เกลียว α-Helix (3.6 กรดอะมิโน/รอบ · 5.4 Å)',
    hbonds: 'พันธะไฮโดรเจน i → i+4',
    collagen: 'คอลลาเจนไตรเพปไทด์ 3 AA',
    sema: 'Semaglutide 31 AA (ยา NDA ≤40 AA)',
    boundary: 'เส้นแบ่ง FDA 40 กรดอะมิโน (85 FR 10057)',
    insulin: 'อินซูลิน 51 AA + พันธะไดซัลไฟด์ S-S (ชีววัตถุ BLA)',
    spps: 'เม็ดเรซินสังเคราะห์ SPPS',
  },
};

export function Scene1HelixAndRuler({ localT, mode, repMode, showLabels, lang }: Scene1Props) {
  const helixGroupRef = useRef<THREE.Group>(null);
  const smooth = (x: number) => {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  };

  // Folding progress from extended polypeptide chain to Pauling-Corey α-helix (3.6 AA/turn)
  const foldT = smooth(localT / 0.58);
  const sppsGrowth = Math.max(2, Math.floor(smooth((localT - 0.15) / 0.7) * 10));
  const lbl = LABELS[lang];

  const { residues, hBonds, ribbonCurve } = useMemo(() => {
    const N = 22;
    const pts: THREE.Vector3[] = [];
    const res: { pos: [number, number, number]; color: string }[] = [];
    const palette = ['#38bdf8', '#2dd4bf', '#60a5fa', '#818cf8', '#f59e0b'];

    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      // Extended chain coordinates
      const linX = (u - 0.5) * 8.2;
      const linY = Math.sin(i * 1.1) * 0.35 + 1.35;
      const linZ = Math.cos(i * 0.7) * 0.25;

      // Pauling-Corey α-helix (3.6 residues per turn -> 100° = 1.745 rad per step)
      const angle = i * ((Math.PI * 2) / 3.6);
      const radius = 0.88;
      const hx = (u - 0.5) * 6.4;
      const hy = Math.sin(angle) * radius + 1.35;
      const hz = Math.cos(angle) * radius;

      const x = THREE.MathUtils.lerp(linX, hx, foldT);
      const y = THREE.MathUtils.lerp(linY, hy, foldT);
      const z = THREE.MathUtils.lerp(linZ, hz, foldT);

      const v = new THREE.Vector3(x, y, z);
      pts.push(v);
      res.push({ pos: [x, y, z], color: palette[i % palette.length] });
    }

    const bonds: Array<[[number, number, number], [number, number, number]]> = [];
    if (foldT > 0.35) {
      for (let i = 0; i < N - 4; i++) {
        bonds.push([res[i].pos, res[i + 4].pos]);
      }
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    return { residues: res, hBonds: bonds, ribbonCurve: curve };
  }, [foldT]);

  // 51 AA Insulin A+B chains geometry
  const insulinBPoints = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 30; i++) {
      const x = -2.8 + (i / 29) * 5.6;
      const y = Math.sin(i * 0.75) * 0.22;
      const z = Math.cos(i * 0.75) * 0.16;
      arr.push([x, y, z]);
    }
    return arr;
  }, []);

  const insulinAPoints = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 21; i++) {
      const x = -1.9 + (i / 20) * 3.8;
      const y = 0.45 + Math.cos(i * 0.85) * 0.16;
      const z = Math.sin(i * 0.85) * 0.16;
      arr.push([x, y, z]);
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (helixGroupRef.current) {
      helixGroupRef.current.rotation.x = clock.getElapsedTime() * 0.22;
    }
  });

  const isSurface = repMode === 'surface';
  const isRibbon = repMode === 'ribbon';

  return (
    <group position={[0, 0.15, 0]}>
      {/* Main Folding α-Helix */}
      <group ref={helixGroupRef}>
        <mesh castShadow>
          <tubeGeometry args={[ribbonCurve, 96, isRibbon ? 0.21 : 0.08, 14, false]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.22}
            roughness={0.18}
            metalness={0.14}
            clearcoat={0.9}
          />
        </mesh>

        {(repMode === 'ball-stick' || isSurface) &&
          residues.map((r, idx) => (
            <group key={idx} position={r.pos}>
              <mesh castShadow>
                <sphereGeometry args={[isSurface ? 0.48 : 0.2, 20, 20]} />
                <meshPhysicalMaterial
                  color={r.color}
                  roughness={0.18}
                  clearcoat={0.85}
                  transparent={isSurface}
                  opacity={isSurface ? 0.52 : 1}
                />
              </mesh>
            </group>
          ))}

        {/* Pauling-Corey i -> i+4 Hydrogen Bonds */}
        {foldT > 0.35 &&
          hBonds.map(([a, b], idx) => (
            <Line
              key={idx}
              points={[a, b]}
              color="#67e8f9"
              lineWidth={1.6}
              dashed
              dashSize={0.14}
              gapSize={0.09}
              transparent
              opacity={Math.min(0.9, (foldT - 0.35) * 1.6)}
            />
          ))}
      </group>

      {/* Left SPPS Solid-Phase Resin Bead (Merrifield 1963 / WuXi TIDES CDMO) */}
      <group position={[-4.6, 0.5, -0.5]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.72, 2]} />
          <meshPhysicalMaterial
            color="#eab308"
            emissive="#a16207"
            emissiveIntensity={0.25}
            roughness={0.32}
            clearcoat={0.65}
          />
        </mesh>
        {Array.from({ length: sppsGrowth }).map((_, i) => (
          <mesh key={i} position={[Math.sin(i * 0.9) * 0.18, -0.95 - i * 0.28, Math.cos(i * 0.9) * 0.15]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshPhysicalMaterial
              color={i % 2 === 0 ? '#2dd4bf' : '#38bdf8'}
              roughness={0.2}
              clearcoat={0.8}
            />
          </mesh>
        ))}
        {showLabels && (
          <Html zIndexRange={[8, 0]} position={[0, 1.1, 0]} center distanceFactor={12}>
            <div className="mol-label-3d" style={{ borderColor: '#eab308' }}>{lbl.spps}</div>
          </Html>
        )}
      </group>

      {/* Foreground FDA 40-AA Regulatory Comparison Ruler */}
      <group position={[0, -2.05, 0.4]}>
        {/* Base Track */}
        <mesh position={[0, -0.35, 0]}>
          <boxGeometry args={[10.5, 0.06, 1.8]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* 1) 3 AA Collagen Tripeptide */}
        <group position={[-3.6, 0.1, 0.35]}>
          {[0, 0.28, 0.56].map((x, idx) => (
            <mesh key={idx} position={[x, 0, 0]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshPhysicalMaterial color="#2dd4bf" clearcoat={0.8} />
            </mesh>
          ))}
          {showLabels && (
            <Html zIndexRange={[8, 0]} position={[0.28, -0.55, 0]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#2dd4bf' }}>{lbl.collagen}</div>
            </Html>
          )}
        </group>

        {/* 2) 31 AA Semaglutide (Under 40 AA NDA) */}
        <group position={[-1.0, 0.15, -0.1]}>
          {Array.from({ length: 16 }).map((_, i) => (
            <mesh key={i} position={[-1.4 + i * 0.18, Math.sin(i * 0.9) * 0.12, Math.cos(i * 0.9) * 0.12]}>
              <sphereGeometry args={[0.11, 14, 14]} />
              <meshPhysicalMaterial color="#38bdf8" clearcoat={0.8} />
            </mesh>
          ))}
          {showLabels && (
            <Html zIndexRange={[8, 0]} position={[0, 0.6, 0]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#38bdf8' }}>{lbl.sema}</div>
            </Html>
          )}
        </group>

        {/* 3) FDA 40 AA Regulatory Boundary Marker */}
        <group position={[1.15, 0.3, 0]}>
          <mesh>
            <boxGeometry args={[0.07, 1.45, 1.9]} />
            <meshPhysicalMaterial
              color="#f43f5e"
              emissive="#e11d48"
              emissiveIntensity={0.75}
              transparent
              opacity={0.78}
            />
          </mesh>
          {showLabels && (
            <Html zIndexRange={[8, 0]} position={[0, 0.95, 0]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#f43f5e', color: '#ffe4e6' }}>
                {lbl.boundary}
              </div>
            </Html>
          )}
        </group>

        {/* 4) 51 AA Human Insulin (A + B chains + 3 Disulfide Bridges, >40 AA BLA) */}
        <group position={[3.3, 0.05, 0]} scale={0.55}>
          {insulinBPoints.map((pt, idx) => (
            <mesh key={`b-${idx}`} position={pt}>
              <sphereGeometry args={[0.14, 14, 14]} />
              <meshPhysicalMaterial color="#818cf8" clearcoat={0.8} />
            </mesh>
          ))}
          {insulinAPoints.map((pt, idx) => (
            <mesh key={`a-${idx}`} position={pt}>
              <sphereGeometry args={[0.14, 14, 14]} />
              <meshPhysicalMaterial color="#a855f7" clearcoat={0.8} />
            </mesh>
          ))}
          {/* 3 Disulfide S-S Bridges */}
          {[-1.2, 0.1, 1.3].map((bx, i) => (
            <mesh key={`ss-${i}`} position={[bx, 0.24, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 0.52, 12]} />
              <meshPhysicalMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.6} />
            </mesh>
          ))}
          {showLabels && (
            <Html zIndexRange={[8, 0]} position={[0, -0.95, 0]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#a855f7' }}>{lbl.insulin}</div>
            </Html>
          )}
        </group>
      </group>

      {showLabels && (
        <>
          <Html zIndexRange={[8, 0]} position={[0, 2.85, 0]} center distanceFactor={12}>
            <div className="mol-label-3d" style={{ borderColor: '#38bdf8' }}>{lbl.helix}</div>
          </Html>
          {foldT > 0.45 && (
            <Html zIndexRange={[8, 0]} position={[2.8, 1.95, 0.6]} center distanceFactor={12}>
              <div className="mol-label-3d" style={{ borderColor: '#67e8f9' }}>{lbl.hbonds}</div>
            </Html>
          )}
        </>
      )}

      {/* Subtle course mode detail cue */}
      {mode === '3min' && (
        <mesh position={[-4.6, -2.0, -0.5]}>
          <ringGeometry args={[0.7, 0.82, 32]} />
          <meshBasicMaterial color="#eab308" side={THREE.DoubleSide} transparent opacity={0.4} />
        </mesh>
      )}
    </group>
  );
}
