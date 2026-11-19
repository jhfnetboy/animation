import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Html } from './HtmlOverlay';
import * as THREE from 'three';
import type { Lang, RepMode } from '../types';

export interface Scene0Props {
  localT: number;
  repMode: RepMode;
  showLabels: boolean;
  lang: Lang;
}

const CPK = {
  C: '#94a3b8',
  N: '#3b82f6',
  O: '#ef4444',
  H: '#f8fafc',
  R1: '#2dd4bf',
  R2: '#f59e0b',
  bond: '#64748b',
  peptide: '#f59e0b',
};

const LABELS = {
  en: {
    nTerm: 'N-Terminus (-NH₂)',
    cTerm: 'C-Terminus (-COOH)',
    peptideBond: 'Planar Peptide Bond (-CO-NH-, ω≈180°)',
    water: 'H₂O Released (Dehydration)',
    side1: 'R₁ Side Chain',
    side2: 'R₂ Side Chain',
  },
  zh: {
    nTerm: '氨基端 (-NH₂)',
    cTerm: '羧基端 (-COOH)',
    peptideBond: '刚性平面肽键 (-CO-NH-, ω≈180°)',
    water: '脱去水分子 H₂O（脱水缩合）',
    side1: 'R₁ 侧链（亲水）',
    side2: 'R₂ 侧链（疏水）',
  },
  th: {
    nTerm: 'ปลายอะมิโน (-NH₂)',
    cTerm: 'ปลายคาร์บอกซิล (-COOH)',
    peptideBond: 'พันธะเพปไทด์ระนาบแข็ง (-CO-NH-, ω≈180°)',
    water: 'ปล่อยโมเลกุลน้ำ H₂O',
    side1: 'สายข้าง R₁',
    side2: 'สายข้าง R₂',
  },
};

function BondCylinder({
  a,
  b,
  radius = 0.085,
  color = CPK.bond,
  emissive = '#000000',
  emissiveIntensity = 0,
}: {
  a: [number, number, number];
  b: [number, number, number];
  radius?: number;
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  const { pos, quat, len } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = new THREE.Vector3().subVectors(vb, va);
    const length = Math.max(0.01, dir.length());
    const mid = new THREE.Vector3().addVectors(va, vb).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return { pos: [mid.x, mid.y, mid.z] as [number, number, number], quat: q, len: length };
  }, [a, b]);

  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <cylinderGeometry args={[radius, radius, len, 18]} />
      <meshPhysicalMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={emissiveIntensity}
        roughness={0.22}
        metalness={0.18}
        clearcoat={0.75}
      />
    </mesh>
  );
}

function AtomSphere({
  position,
  radius,
  color,
  emissive = '#000000',
  emissiveIntensity = 0,
  surfaceMode = false,
}: {
  position: [number, number, number];
  radius: number;
  color: string;
  emissive?: string;
  emissiveIntensity?: number;
  surfaceMode?: boolean;
}) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[radius, 28, 28]} />
        <meshPhysicalMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          roughness={0.16}
          metalness={0.1}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
        />
      </mesh>
      {surfaceMode && (
        <mesh>
          <sphereGeometry args={[radius * 2.15, 24, 24]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.22}
            roughness={0.12}
            transmission={0.28}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

export function Scene0Dehydration({ localT, repMode, showLabels, lang }: Scene0Props) {
  const rootRef = useRef<THREE.Group>(null);
  const waterRef = useRef<THREE.Group>(null);

  const smooth = (x: number) => {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  };

  // Reaction timeline inside Scene 0
  const approach = smooth(localT / 0.48);
  const snap = smooth((localT - 0.44) / 0.28);
  const waterLift = smooth((localT - 0.50) / 0.48);

  const gap = THREE.MathUtils.lerp(2.25, 0.0, approach);
  const isSurface = repMode === 'surface';
  const isRibbon = repMode === 'ribbon';
  const lbl = LABELS[lang];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (rootRef.current) {
      rootRef.current.rotation.y = Math.sin(t * 0.45) * 0.14;
    }
    if (waterRef.current) {
      waterRef.current.rotation.z = t * 0.8;
    }
  });

  // Left Amino Acid anchor shifted left by -gap
  const lx = -gap;
  const rx = gap;

  // Key atom positions (Left Amino Acid 1)
  const lN: [number, number, number] = [lx - 2.65, -0.1, 0.2];
  const lCa: [number, number, number] = [lx - 1.55, 0.15, 0];
  const lR: [number, number, number] = [lx - 1.55, 1.52, 0.32];
  const lC: [number, number, number] = [lx - 0.48, -0.05, 0];
  const lO1: [number, number, number] = [lx - 0.35, 1.08, 0.12]; // =O carbonyl
  const lOH: [number, number, number] = [lx + 0.12, -0.82 - waterLift * 0.15, -0.1]; // leaving -OH before release

  // Key atom positions (Right Amino Acid 2)
  const rN: [number, number, number] = [rx + 0.52, 0.02, 0];
  const rH: [number, number, number] = [rx + 0.32, 0.88, -0.18];
  const rCa: [number, number, number] = [rx + 1.65, -0.15, 0];
  const rR: [number, number, number] = [rx + 1.72, 1.38, -0.25];
  const rC: [number, number, number] = [rx + 2.78, 0.12, 0.15];
  const rO1: [number, number, number] = [rx + 3.45, 0.92, 0.25];
  const rO2: [number, number, number] = [rx + 3.42, -0.78, -0.15];

  const ribbonCurve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(...lN),
      new THREE.Vector3(...lCa),
      new THREE.Vector3(...lC),
      new THREE.Vector3(...rN),
      new THREE.Vector3(...rCa),
      new THREE.Vector3(...rC),
    ]);
  }, [lx, rx]);

  return (
    <group ref={rootRef} position={[0, 0.1, 0]}>
      {/* Left Amino Acid (AA1) */}
      <group>
        <AtomSphere position={lN} radius={0.38} color={CPK.N} surfaceMode={isSurface} />
        <AtomSphere position={[lN[0] - 0.55, lN[1] + 0.42, lN[2] + 0.22]} radius={0.21} color={CPK.H} />
        <AtomSphere position={[lN[0] - 0.52, lN[1] - 0.45, lN[2] - 0.22]} radius={0.21} color={CPK.H} />
        <BondCylinder a={lN} b={[lN[0] - 0.55, lN[1] + 0.42, lN[2] + 0.22]} radius={0.055} />
        <BondCylinder a={lN} b={[lN[0] - 0.52, lN[1] - 0.45, lN[2] - 0.22]} radius={0.055} />

        <AtomSphere position={lCa} radius={0.42} color={CPK.C} surfaceMode={isSurface} />
        <BondCylinder a={lN} b={lCa} />

        <AtomSphere position={lR} radius={0.46} color={CPK.R1} emissive="#0d9488" emissiveIntensity={0.25} surfaceMode={isSurface} />
        <BondCylinder a={lCa} b={lR} color={CPK.R1} />

        <AtomSphere position={lC} radius={0.41} color={CPK.C} surfaceMode={isSurface} />
        <BondCylinder a={lCa} b={lC} />

        {/* Carbonyl =O */}
        <AtomSphere position={lO1} radius={0.38} color={CPK.O} surfaceMode={isSurface} />
        <BondCylinder a={lC} b={lO1} radius={0.095} />

        {/* Leaving -OH before snap */}
        {snap < 0.7 && (
          <group>
            <AtomSphere position={lOH} radius={0.34} color={CPK.O} />
            <AtomSphere position={[lOH[0] + 0.42, lOH[1] - 0.24, lOH[2]]} radius={0.2} color={CPK.H} />
            <BondCylinder a={lC} b={lOH} radius={0.06} />
          </group>
        )}
      </group>

      {/* Right Amino Acid (AA2) */}
      <group>
        <AtomSphere position={rN} radius={0.39} color={CPK.N} surfaceMode={isSurface} />
        <AtomSphere position={rH} radius={0.21} color={CPK.H} />
        <BondCylinder a={rN} b={rH} radius={0.055} />

        <AtomSphere position={rCa} radius={0.42} color={CPK.C} surfaceMode={isSurface} />
        <BondCylinder a={rN} b={rCa} />

        <AtomSphere position={rR} radius={0.46} color={CPK.R2} emissive="#b45309" emissiveIntensity={0.22} surfaceMode={isSurface} />
        <BondCylinder a={rCa} b={rR} color={CPK.R2} />

        <AtomSphere position={rC} radius={0.41} color={CPK.C} surfaceMode={isSurface} />
        <BondCylinder a={rCa} b={rC} />

        <AtomSphere position={rO1} radius={0.36} color={CPK.O} surfaceMode={isSurface} />
        <AtomSphere position={rO2} radius={0.36} color={CPK.O} surfaceMode={isSurface} />
        <BondCylinder a={rC} b={rO1} />
        <BondCylinder a={rC} b={rO2} />
      </group>

      {/* Newly Formed Planar Peptide Bond (-CO-NH-) */}
      {snap > 0.05 && (
        <group>
          <BondCylinder
            a={lC}
            b={rN}
            radius={0.12 * snap}
            color={CPK.peptide}
            emissive="#f59e0b"
            emissiveIntensity={0.75 * snap}
          />
          {/* Amide Resonance Plane Visual (ω ≈ 180° planar peptide plane) */}
          <mesh position={[(lC[0] + rN[0]) * 0.5, 0.25, 0.02]} rotation={[0.1, 0, -0.04]} scale={[snap, snap, 1]}>
            <boxGeometry args={[1.65, 1.38, 0.04]} />
            <meshPhysicalMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.32}
              transparent
              opacity={0.24 * snap}
              roughness={0.15}
              metalness={0.1}
            />
          </mesh>
        </group>
      )}

      {/* Optional Ribbon Backbone Overlay */}
      {isRibbon && (
        <mesh>
          <tubeGeometry args={[ribbonCurve, 48, 0.18, 14, false]} />
          <meshPhysicalMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.28}
            roughness={0.2}
            clearcoat={0.9}
          />
        </mesh>
      )}

      {/* Leaving Water Molecule H2O */}
      {waterLift > 0.02 && (
        <group
          ref={waterRef}
          position={[0.05, -0.6 + waterLift * 3.6, 0.8 + waterLift * 0.5]}
          scale={Math.max(0.1, (1 - Math.max(0, waterLift - 0.72) * 2.5) * 0.95)}
        >
          <AtomSphere position={[0, 0, 0]} radius={0.34} color={CPK.O} emissive="#ef4444" emissiveIntensity={0.2} />
          <AtomSphere position={[-0.36, -0.22, 0.1]} radius={0.2} color={CPK.H} />
          <AtomSphere position={[0.36, -0.22, -0.1]} radius={0.2} color={CPK.H} />
          <BondCylinder a={[0, 0, 0]} b={[-0.36, -0.22, 0.1]} radius={0.055} />
          <BondCylinder a={[0, 0, 0]} b={[0.36, -0.22, -0.1]} radius={0.055} />
          <mesh>
            <sphereGeometry args={[0.65, 24, 24]} />
            <meshPhysicalMaterial
              color="#7dd3fc"
              transparent
              opacity={0.26}
              roughness={0.08}
              transmission={0.42}
              clearcoat={0.95}
            />
          </mesh>
          {showLabels && (
            <Html zIndexRange={[8, 0]} position={[0, 0.82, 0]} center distanceFactor={11}>
              <div className="mol-label-3d" style={{ borderColor: '#38bdf8' }}>
                {lbl.water}
              </div>
            </Html>
          )}
        </group>
      )}

      {/* Dashed attraction cue before peptide bond snaps */}
      {approach > 0.1 && snap < 0.8 && (
        <Line
          points={[lC, rN]}
          color="#fbbf24"
          lineWidth={2}
          dashed
          dashSize={0.18}
          gapSize={0.12}
        />
      )}

      {/* 3D Educational Annotations */}
      {showLabels && (
        <>
          <Html zIndexRange={[8, 0]} position={[lN[0], lN[1] - 0.9, lN[2]]} center distanceFactor={11}>
            <div className="mol-label-3d" style={{ borderColor: '#3b82f6' }}>{lbl.nTerm}</div>
          </Html>
          <Html zIndexRange={[8, 0]} position={[lR[0], lR[1] + 0.65, lR[2]]} center distanceFactor={11}>
            <div className="mol-label-3d" style={{ borderColor: '#2dd4bf' }}>{lbl.side1}</div>
          </Html>
          <Html zIndexRange={[8, 0]} position={[rR[0], rR[1] + 0.65, rR[2]]} center distanceFactor={11}>
            <div className="mol-label-3d" style={{ borderColor: '#f59e0b' }}>{lbl.side2}</div>
          </Html>
          <Html zIndexRange={[8, 0]} position={[rC[0], rC[1] - 1.1, rC[2]]} center distanceFactor={11}>
            <div className="mol-label-3d" style={{ borderColor: '#ef4444' }}>{lbl.cTerm}</div>
          </Html>
          {snap > 0.45 && (
            <Html zIndexRange={[8, 0]} position={[(lC[0] + rN[0]) * 0.5, -1.25, 0.2]} center distanceFactor={11}>
              <div className="mol-label-3d" style={{ borderColor: '#fbbf24', color: '#fef3c7' }}>
                {lbl.peptideBond}
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}
