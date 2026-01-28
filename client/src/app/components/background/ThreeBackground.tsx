"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef, useMemo } from 'react';
import { Mesh, Vector3 } from 'three';
import { useTheme } from 'next-themes';
import * as THREE from 'three';

function FloatingGeometry({ position, scale, rotationSpeed }: { position: [number, number, number]; scale: number; rotationSpeed: number }) {
  const meshRef = useRef<Mesh>(null);
  const { theme } = useTheme();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += rotationSpeed * 0.01;
      meshRef.current.rotation.y += rotationSpeed * 0.015;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.3;
    }
  });

  const isDark = theme === 'dark';
  
  const color = useMemo(() => {
    return isDark ? '#a855f7' : '#fb923c';
  }, [isDark]);

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color={color}
        metalness={0.8}
        roughness={0.2}
        transparent
        opacity={0.15}
        emissive={color}
        emissiveIntensity={isDark ? 0.3 : 0.2}
      />
    </mesh>
  );
}

function AnimatedSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<Mesh>(null);
  const { theme } = useTheme();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const isDark = theme === 'dark';
  
  const color = useMemo(() => {
    return isDark ? '#8b5cf6' : '#f97316';
  }, [isDark]);

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={0.12}
        emissive={color}
        emissiveIntensity={isDark ? 0.25 : 0.18}
      />
    </mesh>
  );
}

function Scene() {
  const { theme } = useTheme();
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const mouseX = (state.mouse.x * 0.5);
      const mouseY = (state.mouse.y * 0.5);
      groupRef.current.rotation.x = mouseY * 0.1;
      groupRef.current.rotation.y = mouseX * 0.1;
    }
  });

  const isDark = theme === 'dark';
  const ambientIntensity = isDark ? 0.5 : 0.7;
  const pointIntensity = isDark ? 1.2 : 1.6;
  const pointColor1 = isDark ? '#a855f7' : '#fb923c';
  const pointColor2 = isDark ? '#8b5cf6' : '#f97316';
  const pointColor3 = isDark ? '#7c3aed' : '#fdba74';

  return (
    <group ref={groupRef}>
      <ambientLight intensity={ambientIntensity} />
      <pointLight 
        position={[10, 10, 10]} 
        intensity={pointIntensity} 
        color={pointColor1}
        distance={35}
        decay={1.8}
      />
      <pointLight 
        position={[-10, -10, -10]} 
        intensity={pointIntensity * 0.7} 
        color={pointColor2}
        distance={30}
        decay={1.8}
      />
      <pointLight 
        position={[0, 15, -5]} 
        intensity={pointIntensity * 0.5} 
        color={pointColor3}
        distance={25}
        decay={1.8}
      />
      <pointLight 
        position={[8, -8, 5]} 
        intensity={pointIntensity * 0.4} 
        color={pointColor1}
        distance={20}
        decay={2}
      />
      
      <FloatingGeometry position={[-4, 2, -5]} scale={1.2} rotationSpeed={0.5} />
      <FloatingGeometry position={[5, -2, -8]} scale={0.8} rotationSpeed={-0.3} />
      <FloatingGeometry position={[3, 3, -6]} scale={1} rotationSpeed={0.4} />
      <FloatingGeometry position={[-3, -3, -7]} scale={0.9} rotationSpeed={-0.6} />
      
      <AnimatedSphere position={[0, 0, -10]} />
      <AnimatedSphere position={[-6, 1, -12]} />
      <AnimatedSphere position={[6, -1, -11]} />
    </group>
  );
}

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

