"use client";

import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

// The holographic scene (after my-jarvis), reacting to the live voice link.
export const HOME_POSITION = [0, 0, 8];
export const MIN_DISTANCE = 5;
export const MAX_DISTANCE = 15;
const FONT = "/fonts/Orbitron.ttf";

/**
 * Smoothed reaction values shared by every element, updated once per frame by <ReactionDriver>.
 * level: voice energy 0..1 (Jarvis speaking or the operator talking); spin: rotation multiplier;
 * glow: inner glow strength; dim: 1 when offline (scene fades back a little).
 */
function useReaction() {
  return useRef({ level: 0, spin: 1, glow: 0, dim: 0, time: 0 });
}

function ReactionDriver({ reaction, getStatus, getAudioEnergy }) {
  useFrame((_, delta) => {
    const r = reaction.current;
    const status = getStatus();
    const energy = Math.min(1, Math.max(0, getAudioEnergy?.() || 0));
    const active = status === "SPEAKING" || status === "LISTENING";
    const thinking = status === "THINKING" || status === "CONNECTING";
    const offline = status === "DISCONNECTED";
    const ease = 1 - Math.exp(-delta * 8);
    r.time += delta;
    r.level += ((active ? energy : 0) - r.level) * ease;
    r.spin += ((thinking ? 3 : status === "SPEAKING" ? 1.6 : 1) - r.spin) * ease;
    const thinkingPulse = thinking ? 0.25 + 0.2 * Math.sin(r.time * 4) : 0;
    r.glow += (Math.max(r.level, thinkingPulse) - r.glow) * ease;
    r.dim += ((offline ? 1 : 0) - r.dim) * ease;
  });
  return null;
}

/** Dense particle sphere (10,000 teal points) that swells with the voice. */
function ParticleSphere({ reaction, radius = 2.5, count = 10000 }) {
  const pointsRef = useRef(null);
  const materialRef = useRef(null);
  const spinRef = useRef(0);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const a = new THREE.Color("#00E5B0");
    const b = new THREE.Color("#00CC99");
    const mixed = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (0.85 + Math.random() * 0.3);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      mixed.copy(a).lerp(b, Math.random());
      col[i * 3] = mixed.r;
      col[i * 3 + 1] = mixed.g;
      col[i * 3 + 2] = mixed.b;
    }
    return { positions: pos, colors: col };
  }, [count, radius]);

  useFrame((state, delta) => {
    const r = reaction.current;
    spinRef.current += delta * 0.1 * r.spin;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = spinRef.current;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.1;
      pointsRef.current.scale.setScalar(1 + r.level * 0.14);
    }
    if (materialRef.current) {
      materialRef.current.size = 0.04 + r.level * 0.025;
      materialRef.current.opacity = 0.9 - r.dim * 0.35;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.04}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Faint inner sphere that brightens while Jarvis speaks or thinks. */
function InnerGlow({ reaction, radius = 2.2 }) {
  const materialRef = useRef(null);
  useFrame(() => {
    if (materialRef.current) materialRef.current.opacity = 0.15 + reaction.current.glow * 0.3;
  });
  return (
    <mesh>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshBasicMaterial ref={materialRef} color="#005544" transparent opacity={0.15} side={THREE.BackSide} />
    </mesh>
  );
}

/** A thin orbit ring with a red planet travelling along it. */
function OrbitalRing({ radius, color, speed, tilt }) {
  const orbitRef = useRef(null);
  useFrame((state) => {
    if (orbitRef.current) orbitRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5;
  });
  return (
    <group rotation={[tilt, 0, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.015, 16, 120]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <group ref={orbitRef}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshBasicMaterial color="#FF4444" />
        </mesh>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.2, 24, 24]} />
          <meshBasicMaterial color="#FF4444" transparent opacity={0.3} />
        </mesh>
      </group>
    </group>
  );
}

/** The grey planet with its spiral trail. */
function SpiralOrbit() {
  const line = useMemo(() => {
    const points = [];
    for (let i = 0; i < 100; i++) {
      const t = i / 100;
      const angle = t * Math.PI * 4;
      const radius = 0.3 + t * 0.5;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, (t - 0.5) * 2, Math.sin(angle) * radius));
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: "#AAAAAA", transparent: true, opacity: 0.6 });
    return new THREE.Line(geometry, material);
  }, []);
  useEffect(
    () => () => {
      line.geometry.dispose();
      line.material.dispose();
    },
    [line]
  );
  return (
    <group position={[4, 0.5, 0]}>
      <mesh>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshBasicMaterial color="#333333" />
      </mesh>
      <primitive object={line} />
    </group>
  );
}

/** "J.A.R.V.I.S." and "STARK INDUSTRIES" turning slowly inside the sphere. */
function SphereText() {
  const groupRef = useRef(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        <Text font={FONT} fontSize={0.42} letterSpacing={0.08} color="#FFFFFF" anchorX="center" anchorY="middle" position={[0, 0.2, 0]} fillOpacity={0.95}>
          J.A.R.V.I.S.
        </Text>
        <Text font={FONT} fontSize={0.16} letterSpacing={0.12} color="#00CC99" anchorX="center" anchorY="middle" position={[0, -0.3, 0]} fillOpacity={0.8}>
          STARK INDUSTRIES
        </Text>
      </group>
    </Float>
  );
}

function FloatingLabel({ text, position, color = "#00AA88" }) {
  return (
    <Float speed={1.5} rotationIntensity={0} floatIntensity={0.5}>
      <Text font={FONT} position={position} fontSize={0.15} letterSpacing={0.06} color={color} anchorX="center" anchorY="middle" fillOpacity={0.7}>
        {text}
      </Text>
    </Float>
  );
}

/**
 * Camera API for the zoom buttons and the + / - / R keys: zoomBy(factor) multiplies the distance
 * (below 1 zooms in), resetView() returns home.
 */
function CameraRig({ apiRef }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls);

  useEffect(() => {
    if (!controls) return undefined;
    const offset = new THREE.Vector3();
    const home = new THREE.Vector3(...HOME_POSITION);
    apiRef.current = {
      zoomBy(factor) {
        offset.copy(camera.position).sub(controls.target);
        offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, MIN_DISTANCE, MAX_DISTANCE));
        camera.position.copy(controls.target).add(offset);
        controls.update();
      },
      zoomIn() {
        this.zoomBy(0.8);
      },
      zoomOut() {
        this.zoomBy(1.25);
      },
      resetView() {
        controls.target.set(0, 0, 0);
        camera.position.copy(home);
        controls.update();
      },
    };
    return () => {
      apiRef.current = null;
    };
  }, [camera, controls, apiRef]);

  return null;
}

/**
 * The whole holographic scene: particle sphere, glow, text, two orbit rings with red planets, the
 * spiral planet, and the four floating labels, auto-rotating under OrbitControls.
 */
export function HoloScene({ apiRef, getStatus, getAudioEnergy, particleCount = 10000 }) {
  const reaction = useReaction();
  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ReactionDriver reaction={reaction} getStatus={getStatus} getAudioEnergy={getAudioEnergy} />
      <ParticleSphere reaction={reaction} radius={2.5} count={particleCount} />
      <InnerGlow reaction={reaction} radius={2.2} />
      <SphereText />
      <OrbitalRing radius={3.5} color="#FFFFFF" speed={0.8} tilt={0.3} />
      <OrbitalRing radius={4} color="#AAAAAA" speed={-0.5} tilt={-0.5} />
      <SpiralOrbit />
      <FloatingLabel text="AI CORE" position={[-3.5, 2, 0]} />
      <FloatingLabel text="NEURAL NET" position={[3.5, 1.5, 0]} />
      <FloatingLabel text="VOICE SYNC" position={[-3, -1.5, 0]} color="#AA8800" />
      <FloatingLabel text="ANALYSIS" position={[3, -2, 0]} />
      <OrbitControls makeDefault enablePan={false} autoRotate autoRotateSpeed={0.3} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} />
      <CameraRig apiRef={apiRef} />
    </>
  );
}

export default HoloScene;
