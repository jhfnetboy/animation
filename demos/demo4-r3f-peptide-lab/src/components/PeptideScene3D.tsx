import { Suspense, useMemo, useRef, type ComponentRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { Html } from './HtmlOverlay';
import * as THREE from 'three';
import type { BeatSpec, CourseMode, Lang, RepMode, SceneObjectSpec } from '../types';
import { BioStage } from './BioVisuals';

type OrbitControlsHandle = ComponentRef<typeof OrbitControls>;

export interface PeptideScene3DProps {
  mode: CourseMode;
  currentTime: number;
  activeBeat: BeatSpec;
  repMode: RepMode;
  showLabels: boolean;
  autoCamera: boolean;
  lang: Lang;
  aiObjects: SceneObjectSpec[];
  onUserOrbitStart?: () => void;
}

const SCENE_CAMERAS: Record<0 | 1 | 2 | 3, { pos: [number, number, number]; target: [number, number, number] }> = {
  0: { pos: [-0.4, 2.3, 12.6], target: [-0.85, 0.1, 0] },
  1: { pos: [-0.4, 2.7, 13.8], target: [-0.75, -0.1, 0] },
  2: { pos: [-0.2, 2.5, 13.4], target: [-0.6, 0.1, 0] },
  3: { pos: [-0.2, 3.0, 14.0], target: [-0.7, -0.3, 0] },
};

function AmbientBioParticles() {
  const count = 90;
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const a = i * 2.39996;
      const r = 4 + ((i * 7) % 13);
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = ((i * 17) % 12) - 5.5;
      arr[i * 3 + 2] = Math.sin(a) * r - 2;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.025;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#67e8f9" size={0.075} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

function AutoDirector({
  sceneIdx,
  localT,
  autoCamera,
  hasAiObjects,
  controlsRef,
}: {
  sceneIdx: 0 | 1 | 2 | 3;
  localT: number;
  autoCamera: boolean;
  hasAiObjects: boolean;
  controlsRef: React.RefObject<OrbitControlsHandle | null>;
}) {
  const desiredPos = useRef(new THREE.Vector3(0, 2.5, 11.5));
  const desiredTarget = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(({ camera, clock }, delta) => {
    if (!autoCamera) return;
    if (hasAiObjects) {
      desiredPos.current.set(-0.3 + Math.sin(clock.getElapsedTime() * 0.35) * 1.4, 2.1, 10.8);
      desiredTarget.current.set(-0.5, 0.1, 0);
    } else {
      const base = SCENE_CAMERAS[sceneIdx];
      const sweep = Math.sin(localT * Math.PI * 1.4) * 1.15;
      const lift = Math.cos(localT * Math.PI) * 0.4;

      desiredPos.current.set(base.pos[0] + sweep, base.pos[1] + lift, base.pos[2]);
      desiredTarget.current.set(base.target[0], base.target[1], base.target[2]);
    }

    const damp = 1 - Math.exp(-delta * 2.8);
    camera.position.lerp(desiredPos.current, damp);
    if (controlsRef.current) {
      controlsRef.current.target.lerp(desiredTarget.current, damp);
      controlsRef.current.update();
    }
  });

  return null;
}

function AiObjectMesh({ spec, showLabels }: { spec: SceneObjectSpec; showLabels: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const pos: [number, number, number] = spec.position || [0, 0.5, 0];
  const rot: [number, number, number] = spec.rotation || [0, 0, 0];
  const args = spec.args && spec.args.length > 0 ? spec.args : [0.6, 24, 24];

  const isEndpointBond = spec.type === 'bond' && args.length >= 4;

  const bondGeom = useMemo(() => {
    if (!isEndpointBond) return null;
    const start = new THREE.Vector3(pos[0], pos[1], pos[2]);
    const end = new THREE.Vector3(args[0], args[1], args[2]);
    const mid = start.clone().add(end).multiplyScalar(0.5);
    const dir = end.clone().sub(start);
    const len = Math.max(0.02, dir.length());
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );
    return {
      mid: [mid.x, mid.y, mid.z] as [number, number, number],
      len,
      radius: args[3] ?? 0.055,
      quat,
    };
  }, [isEndpointBond, pos, args]);

  const helixCurve = useMemo(() => {
    if (spec.type !== 'helix') return null;
    const radius = args[0] ?? 0.7;
    const height = args[1] ?? 3.6;
    const turns = args[2] ?? 3;
    const pts: THREE.Vector3[] = [];
    const steps = 64;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const ang = u * turns * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(ang) * radius, (u - 0.5) * height, Math.sin(ang) * radius));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [spec.type, args]);

  const groupOrigin: [number, number, number] = bondGeom ? bondGeom.mid : pos;

  const r0 = args[0] ?? 0.9;
  const r1 = args[1] ?? 0.12;
  const ringMajor = r1 > r0 ? (r0 + r1) * 0.5 : r0;
  const ringTube = r1 > r0 ? Math.max(0.045, Math.min(0.14, (r1 - r0) * 0.5)) : Math.min(0.2, r1);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.position.y = groupOrigin[1] + Math.sin(clock.getElapsedTime() * 1.6 + groupOrigin[0]) * 0.08;
    }
  });

  const labelY = bondGeom
    ? 0.35
    : spec.type === 'ring'
      ? 0.45
      : (args[0] ?? 0.6) + 0.55;

  return (
    <group ref={meshRef} position={groupOrigin} rotation={bondGeom ? [0, 0, 0] : rot}>
      <mesh castShadow receiveShadow quaternion={bondGeom ? bondGeom.quat : undefined}>
        {spec.type === 'box' && <boxGeometry args={[args[0] ?? 1, args[1] ?? 1, args[2] ?? 1]} />}
        {spec.type === 'sphere' && <sphereGeometry args={[args[0] ?? 0.6, args[1] ?? 28, args[2] ?? 28]} />}
        {spec.type === 'cylinder' && (
          <cylinderGeometry args={[args[0] ?? 0.14, args[1] ?? args[0] ?? 0.14, args[2] ?? 1.8, 24]} />
        )}
        {spec.type === 'bond' &&
          (bondGeom ? (
            <cylinderGeometry args={[bondGeom.radius, bondGeom.radius, bondGeom.len, 18]} />
          ) : (
            <cylinderGeometry args={[args[0] ?? 0.08, args[1] ?? args[0] ?? 0.08, args[2] ?? 1.4, 18]} />
          ))}
        {spec.type === 'cone' && <coneGeometry args={[args[0] ?? 0.6, args[1] ?? 1.4, args[2] ?? 24]} />}
        {spec.type === 'ring' && <torusGeometry args={[ringMajor, ringTube, 20, 56]} />}
        {spec.type === 'helix' && helixCurve && <tubeGeometry args={[helixCurve, 72, args[3] ?? 0.14, 12, false]} />}

        <meshPhysicalMaterial
          color={spec.color || '#38bdf8'}
          emissive={spec.emissive || '#000000'}
          emissiveIntensity={spec.emissive ? 0.55 : 0.12}
          roughness={spec.roughness ?? 0.22}
          metalness={spec.metalness ?? 0.15}
          clearcoat={0.85}
          clearcoatRoughness={0.14}
        />
      </mesh>
      {showLabels && spec.label && (
        <Html zIndexRange={[8, 0]} position={[0, labelY, 0]} center distanceFactor={11}>
          <div className="mol-label-3d" style={{ borderColor: spec.color || '#38bdf8' }}>
            {spec.label}
          </div>
        </Html>
      )}
    </group>
  );
}

export function PeptideScene3D({
  mode,
  currentTime,
  activeBeat,
  repMode,
  showLabels,
  autoCamera,
  lang,
  aiObjects,
  onUserOrbitStart,
}: PeptideScene3DProps) {
  const controlsRef = useRef<OrbitControlsHandle | null>(null);
  const duration = Math.max(0.01, activeBeat.end - activeBeat.start);
  const localT = Math.max(0, Math.min(1, (currentTime - activeBeat.start) / duration));

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0.4, 2.5, 11.8], fov: 44, near: 0.1, far: 160 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.12 }}
    >
      <color attach="background" args={['#040916']} />
      <fog attach="fog" args={['#040916', 18, 42]} />

      <ambientLight intensity={0.42} color="#b8d4ff" />
      <directionalLight position={[9, 12, 8]} intensity={2.2} color="#ffffff" castShadow />
      <directionalLight position={[-10, 4, -7]} intensity={0.95} color="#38bdf8" />
      <pointLight position={[0, -5, 5]} intensity={1.1} color="#2dd4bf" distance={22} />

      <Suspense fallback={null}>
        {/* Pure local Lightformer studio reflection environment — zero external HDR CDN requests */}
        <Environment resolution={256} frames={1}>
          <group rotation={[-Math.PI / 3, 0, 1]}>
            <Lightformer form="circle" intensity={2.4} position={[0, 5, -9]} scale={10} color="#e0f2fe" />
            <Lightformer form="rect" intensity={1.8} position={[-6, 2, 4]} scale={[12, 4, 1]} color="#7dd3fc" />
            <Lightformer form="rect" intensity={1.4} position={[6, -1, 5]} scale={[10, 4, 1]} color="#fde68a" />
            <Lightformer form="ring" intensity={0.9} position={[0, -5, 0]} scale={16} color="#14b8a6" />
          </group>
        </Environment>

        <AmbientBioParticles />

        {aiObjects.length === 0 ? (
          <BioStage
            mode={mode}
            currentTime={currentTime}
            activeBeat={activeBeat}
            repMode={repMode}
            showLabels={showLabels}
            lang={lang}
          />
        ) : (
          <group position={[0.35, 0.15, 0]}>
            {aiObjects.map((obj) => (
              <AiObjectMesh key={obj.id} spec={obj} showLabels={showLabels} />
            ))}
          </group>
        )}
      </Suspense>

      <AutoDirector
        sceneIdx={activeBeat.sceneIdx}
        localT={localT}
        autoCamera={autoCamera}
        hasAiObjects={aiObjects.length > 0}
        controlsRef={controlsRef}
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.07}
        minDistance={4}
        maxDistance={26}
        onStart={onUserOrbitStart}
      />
    </Canvas>
  );
}

export default PeptideScene3D;
