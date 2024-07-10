// src/components/Experience.jsx
import { OrbitControls } from '@react-three/drei';
import { Avatar } from './Avatar';
import { Canvas } from '@react-three/fiber';

export const Experience = () => {
  return (
    <Canvas camera={{ position: [0, 1, 5], fov: 30 }}>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
      />
      <group position-y={-1.5} position-x={-0.2}>
        <Avatar />
      </group>
      <ambientLight intensity={2} />
    </Canvas>
  );
};
