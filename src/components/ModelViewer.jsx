import { useRef, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

/**
 * Inner mesh component that loads STL geometry from ArrayBuffer
 */
function STLMesh({ geometryBuffer }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    if (!geometryBuffer) return null;
    const loader = new STLLoader();
    const buffer = geometryBuffer instanceof ArrayBuffer
      ? geometryBuffer
      : geometryBuffer.buffer || geometryBuffer;
    const geom = loader.parse(buffer);
    geom.center();
    geom.computeVertexNormals();
    return geom;
  }, [geometryBuffer]);

  if (!geometry) return null;

  return (
    <Center>
      <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color="#818cf8"
          roughness={0.35}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.25}
        />
      </mesh>
    </Center>
  );
}

/**
 * Camera auto-fit on geometry change
 */
function AutoFit({ geometryBuffer }) {
  const { camera } = useThree();

  useEffect(() => {
    if (geometryBuffer) {
      camera.position.set(60, 40, 60);
      camera.lookAt(0, 0, 0);
    }
  }, [geometryBuffer, camera]);

  return null;
}

/**
 * 3D Model Viewer component using Three.js
 */
export default function ModelViewer({ geometry, isCompiling, error }) {
  return (
    <div className="relative w-full h-full" id="model-viewer">
      {/* Three.js Canvas */}
      <Canvas
        shadows
        camera={{ position: [60, 40, 60], fov: 45, near: 0.1, far: 2000 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0a0a0f' }}
      >
        <color attach="background" args={['#0a0a0f']} />

        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[50, 80, 50]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-30, 40, -30]} intensity={0.4} />
        <pointLight position={[0, 60, 0]} intensity={0.3} />

        {/* Grid */}
        <Grid
          args={[200, 200]}
          cellSize={5}
          cellThickness={0.5}
          cellColor="#1a1a26"
          sectionSize={25}
          sectionThickness={1}
          sectionColor="#232333"
          fadeDistance={150}
          position={[0, -0.5, 0]}
        />

        {/* Model */}
        <Suspense fallback={null}>
          {geometry && <STLMesh geometryBuffer={geometry} />}
          <AutoFit geometryBuffer={geometry} />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.8}
          zoomSpeed={1.2}
          minDistance={10}
          maxDistance={300}
        />
      </Canvas>

      {/* Compilation overlay */}
      {isCompiling && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-sm text-indigo-300 font-medium loading-pulse">
              Compiling model...
            </span>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {error && !isCompiling && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-red-900/80 backdrop-blur-sm border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-200">
            <span className="font-medium text-red-300">Compile Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!geometry && !isCompiling && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <svg className="w-16 h-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-sm">Initialising OpenSCAD engine...</span>
          </div>
        </div>
      )}
    </div>
  );
}
