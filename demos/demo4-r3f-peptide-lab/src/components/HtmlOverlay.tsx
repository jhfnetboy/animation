import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

export interface HtmlOverlayProps {
  position?: [number, number, number];
  center?: boolean;
  distanceFactor?: number;
  zIndexRange?: [number, number];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const _worldPos = new THREE.Vector3();
const _projPos = new THREE.Vector3();
const _camPos = new THREE.Vector3();
const _camDir = new THREE.Vector3();
const _delta = new THREE.Vector3();

function computeProjectionScale(
  camera: THREE.Camera,
  dist: number,
  distanceFactor?: number
): number {
  if (!distanceFactor || distanceFactor <= 0) return 1;
  if (camera instanceof THREE.PerspectiveCamera) {
    const vFov = (camera.fov * Math.PI) / 180;
    const scaleFov = 2 * Math.tan(vFov / 2) * Math.max(0.5, dist);
    const raw = (1 / scaleFov) * distanceFactor;
    return Math.max(0.65, Math.min(1.15, raw));
  }
  return 1;
}

/**
 * Lightweight React 19-safe replacement for @react-three/drei <Html>.
 * Creates a fresh container div + createRoot per effect lifecycle and defers
 * root.unmount via queueMicrotask to avoid React 19 StrictMode removeChild mismatches.
 */
export function Html({
  position = [0, 0, 0],
  center = false,
  distanceFactor,
  zIndexRange = [8, 0],
  className,
  style,
  children,
}: HtmlOverlayProps) {
  const { gl, camera, size } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const hostElRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<Root | null>(null);

  useLayoutEffect(() => {
    const container = gl.domElement.parentElement;
    if (!container) return;

    const hostEl = document.createElement('div');
    const root = createRoot(hostEl);
    const maxZ = Math.min(8, zIndexRange[0] ?? 8);
    hostEl.style.cssText = `position:absolute;top:0;left:0;pointer-events:none;z-index:${maxZ};transform-origin:0 0;`;
    container.appendChild(hostEl);

    hostElRef.current = hostEl;
    rootRef.current = root;

    return () => {
      hostElRef.current = null;
      rootRef.current = null;
      if (hostEl.parentNode) {
        hostEl.parentNode.removeChild(hostEl);
      }
      queueMicrotask(() => {
        root.unmount();
      });
    };
  }, [gl]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.render(
      <div
        className={className}
        style={{
          position: 'absolute',
          transform: center ? 'translate3d(-50%, -50%, 0)' : 'none',
          pointerEvents: 'none',
          ...style,
        }}
      >
        {children}
      </div>
    );
  }, [children, className, style, center]);

  useFrame(() => {
    const group = groupRef.current;
    const hostEl = hostElRef.current;
    if (!group || !hostEl) return;

    group.updateWorldMatrix(true, false);
    camera.updateMatrixWorld();

    _worldPos.setFromMatrixPosition(group.matrixWorld);
    _camPos.setFromMatrixPosition(camera.matrixWorld);
    camera.getWorldDirection(_camDir);
    _delta.copy(_worldPos).sub(_camPos);

    const isBehind = _delta.lengthSq() > 1e-6 && _delta.angleTo(_camDir) > Math.PI / 2;
    if (isBehind) {
      hostEl.style.display = 'none';
      return;
    }

    _projPos.copy(_worldPos).project(camera);
    const x = (_projPos.x * 0.5 + 0.5) * size.width;
    const y = (-_projPos.y * 0.5 + 0.5) * size.height;
    const dist = _camPos.distanceTo(_worldPos);
    const scale = computeProjectionScale(camera, dist, distanceFactor);
    const maxZ = Math.min(8, zIndexRange[0] ?? 8);

    hostEl.style.display = 'block';
    hostEl.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
    hostEl.style.zIndex = String(maxZ);
  });

  return <group ref={groupRef} position={position} />;
}

export default Html;
