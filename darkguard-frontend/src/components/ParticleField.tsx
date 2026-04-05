import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Particles({ count = 300 }: { count?: number }) {
  const mesh = useRef<THREE.Points>(null)
  const light = useRef<THREE.PointLight>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20

      // Purple to cyan gradient
      const t = Math.random()
      colors[i * 3] = 0.49 * (1 - t) + 0.0 * t
      colors[i * 3 + 1] = 0.42 * (1 - t) + 0.9 * t
      colors[i * 3 + 2] = 1.0 * (1 - t) + 1.0 * t

      sizes[i] = Math.random() * 3 + 0.5
    }

    return { positions, colors, sizes }
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    const time = state.clock.elapsedTime

    mesh.current.rotation.y = time * 0.03
    mesh.current.rotation.x = Math.sin(time * 0.02) * 0.1

    const positions = mesh.current.geometry.attributes.position.array as Float32Array
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3 + 1] += Math.sin(time + i * 0.1) * 0.002
    }
    mesh.current.geometry.attributes.position.needsUpdate = true

    if (light.current) {
      light.current.position.x = Math.sin(time * 0.5) * 5
      light.current.position.z = Math.cos(time * 0.5) * 5
    }
  })

  return (
    <>
      <pointLight ref={light} color="#7c6aff" intensity={2} distance={20} />
      <pointLight position={[5, 5, -5]} color="#00e5ff" intensity={1} distance={15} />
      <points ref={mesh}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={particles.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={particles.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </>
  )
}

function FloatingShield() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.elapsedTime
    groupRef.current.rotation.y = time * 0.3
    groupRef.current.position.y = Math.sin(time * 0.8) * 0.3
  })

  return (
    <group ref={groupRef}>
      {/* Shield shape — icosahedron with wireframe */}
      <mesh>
        <icosahedronGeometry args={[1.5, 1]} />
        <meshPhongMaterial
          color="#7c6aff"
          emissive="#7c6aff"
          emissiveIntensity={0.3}
          wireframe
          transparent
          opacity={0.4}
        />
      </mesh>
      {/* Inner glow sphere */}
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhongMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={0.5}
          transparent
          opacity={0.15}
        />
      </mesh>
      {/* Outer ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.02, 16, 100]} />
        <meshPhongMaterial
          color="#7c6aff"
          emissive="#7c6aff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Second ring */}
      <mesh rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[2.3, 0.015, 16, 100]} />
        <meshPhongMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={0.8}
          transparent
          opacity={0.4}
        />
      </mesh>
    </group>
  )
}

export default function ParticleField() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
    }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.2} />
        <Particles count={400} />
        <FloatingShield />
      </Canvas>
    </div>
  )
}
