import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

function createPlusTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, 256, 256)
    ctx.strokeStyle = 'rgba(0, 229, 199, 0.08)' // Lower opacity for subtle etched glass
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let x = 32; x < 256; x += 64) {
      for (let y = 32; y < 256; y += 64) {
        ctx.moveTo(x, y - 8)
        ctx.lineTo(x, y + 8)
        ctx.moveTo(x - 8, y)
        ctx.lineTo(x + 8, y)
      }
    }
    ctx.stroke()
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2, 2)
  return texture
}

const topGeo = new THREE.CircleGeometry(1, 3)
topGeo.rotateZ(Math.PI / 2)
topGeo.scale(0.85, 1.6, 1)

const bottomGeo = new THREE.CircleGeometry(1, 3)
bottomGeo.rotateZ(-Math.PI / 2)
bottomGeo.scale(0.85, 1.6, 1)

const topEdges = new THREE.EdgesGeometry(topGeo)
const bottomEdges = new THREE.EdgesGeometry(bottomGeo)

function Petal({ up, isMobile, plusTexture }: { up: boolean, isMobile: boolean, plusTexture: THREE.Texture }) {
  const geo = up ? topGeo : bottomGeo
  const edges = up ? topEdges : bottomEdges
  const edgeColor = up ? "#00E5C7" : "#F5B82E"

  return (
    <mesh geometry={geo}>
      {isMobile ? (
        <meshStandardMaterial 
          color="#0a2e1a"
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0.3}
          map={plusTexture}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshPhysicalMaterial 
          color="#0a2e1a" // dark olive/teal base
          transmission={0.6}
          thickness={1}
          roughness={0.15}
          metalness={0.3}
          map={plusTexture}
          side={THREE.DoubleSide}
          // Removed transparent and opacity to allow proper physical transmission rendering
        />
      )}
      <lineSegments geometry={edges}>
        {/* Soft glowing rim effect */}
        <lineBasicMaterial color={edgeColor} transparent opacity={0.6} linewidth={1} />
      </lineSegments>
    </mesh>
  )
}

function DoubleCone({ isMobile }: { isMobile: boolean }) {
  const topGroup = useRef<THREE.Group>(null!)
  const bottomGroup = useRef<THREE.Group>(null!)
  const [plusTexture] = useState(() => createPlusTexture())

  const animState = useRef({ progress: 0, time: 0 })

  useFrame((state, delta) => {
    if (animState.current.progress < 1) {
      animState.current.time += delta
      let p = animState.current.time / 2.5
      if (p > 1) p = 1
      animState.current.progress = 1 - Math.pow(1 - p, 3) // easeOutCubic
    }

    const p = animState.current.progress

    const targetRadius = isMobile ? 1.0 : 1.4
    const startRadius = 5
    const radius = THREE.MathUtils.lerp(startRadius, targetRadius, p)

    const targetY = isMobile ? 1.0 : 1.4
    const startY = 4
    const yOffset = THREE.MathUtils.lerp(startY, targetY, p)

    const targetScale = isMobile ? 0.9 : 1.25
    const startScale = 2.5
    const scale = THREE.MathUtils.lerp(startScale, targetScale, p)

    const targetCamZ = isMobile ? 8.5 : 6.5
    const startCamZ = 15
    state.camera.position.z = THREE.MathUtils.lerp(startCamZ, targetCamZ, p)

    const topGroupRot = state.clock.elapsedTime * 0.3
    const botGroupRot = -state.clock.elapsedTime * 0.3

    if (topGroup.current) {
      topGroup.current.children.forEach((child, i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4 + topGroupRot
        child.position.set(Math.cos(angle) * radius, yOffset, Math.sin(angle) * radius)
        child.scale.setScalar(scale)
        child.lookAt(0, 0, 0)
      })
    }

    if (bottomGroup.current) {
      bottomGroup.current.children.forEach((child, i) => {
        const angle = (i / 4) * Math.PI * 2 + Math.PI / 4 + botGroupRot
        child.position.set(Math.cos(angle) * radius, -yOffset, Math.sin(angle) * radius)
        child.scale.setScalar(scale)
        child.lookAt(0, 0, 0)
      })
    }
  })

  return (
    <>
      <group ref={topGroup}>
        {[0, 1, 2, 3].map(i => <Petal key={`top-${i}`} up={true} isMobile={isMobile} plusTexture={plusTexture} />)}
      </group>
      <group ref={bottomGroup}>
        {[0, 1, 2, 3].map(i => <Petal key={`bot-${i}`} up={false} isMobile={isMobile} plusTexture={plusTexture} />)}
      </group>
    </>
  )
}

function Core() {
  const meshRef = useRef<THREE.Mesh>(null!)
  
  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.75, 32, 32]} />
      <meshPhysicalMaterial 
        color="#00E5C7"
        emissive="#003328" // Dark teal emissive to allow shading
        emissiveIntensity={1.5}
        metalness={0.6}
        roughness={0.2}
      />
    </mesh>
  )
}

function Scene() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 768)
  }, [])

  return (
    <>
      <ambientLight intensity={0.2} /> {/* Softer ambient */}
      {/* Softer point lights to highlight edges and core volume */}
      <pointLight position={[5, 5, 5]} color="#00E5C7" intensity={1.2} />
      <pointLight position={[-5, -5, -5]} color="#F5B82E" intensity={0.8} />
      
      <Core />
      <DoubleCone isMobile={isMobile} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
      />
    </>
  )
}

export default function ScoreOrb3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 400 }}>
      <Suspense fallback={
        <div style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            border: '3px solid rgba(0,229,199,0.15)',
            borderTopColor: '#00E5C7',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      }>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 50 }}
          style={{ background: 'transparent' }}
          dpr={[1, 1.5]}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}
