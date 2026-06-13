import React, { useRef, useState, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Lightformer, MeshDistortMaterial } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

function createPlusTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256)
    ctx.strokeStyle = 'rgba(0, 229, 199, 0.08)' 
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

const createRoundedTriangle = (r: number, cr: number, up = true) => {
  const sq3 = Math.sqrt(3)
  const x = r * sq3 / 2
  const y = r / 2

  let v1 = new THREE.Vector2(0, r)
  let v2 = new THREE.Vector2(x, -y)
  let v3 = new THREE.Vector2(-x, -y)

  if (!up) {
    v1 = new THREE.Vector2(0, -r)
    v2 = new THREE.Vector2(x, y)
    v3 = new THREE.Vector2(-x, y)
  }

  const d12 = new THREE.Vector2().subVectors(v2, v1).normalize()
  const d23 = new THREE.Vector2().subVectors(v3, v2).normalize()
  const d31 = new THREE.Vector2().subVectors(v1, v3).normalize()

  const td = cr * sq3

  const p1Start = new THREE.Vector2().copy(v1).addScaledVector(d31, -td)
  const p1End = new THREE.Vector2().copy(v1).addScaledVector(d12, td)

  const p2Start = new THREE.Vector2().copy(v2).addScaledVector(d12, -td)
  const p2End = new THREE.Vector2().copy(v2).addScaledVector(d23, td)

  const p3Start = new THREE.Vector2().copy(v3).addScaledVector(d23, -td)
  const p3End = new THREE.Vector2().copy(v3).addScaledVector(d31, td)

  const shape = new THREE.Shape()
  shape.moveTo(p1End.x, p1End.y)
  shape.lineTo(p2Start.x, p2Start.y)
  shape.quadraticCurveTo(v2.x, v2.y, p2End.x, p2End.y)
  shape.lineTo(p3Start.x, p3Start.y)
  shape.quadraticCurveTo(v3.x, v3.y, p3End.x, p3End.y)
  shape.lineTo(p1Start.x, p1Start.y)
  shape.quadraticCurveTo(v1.x, v1.y, p1End.x, p1End.y)

  return shape
}

const topShape = createRoundedTriangle(1, 0.15, true)
const bottomShape = createRoundedTriangle(1, 0.15, false)

const extrudeSettings = { 
  depth: 0.15, 
  bevelEnabled: true, 
  bevelThickness: 0.02, 
  bevelSize: 0.02, 
  bevelSegments: 3 
}

const topGeo = new THREE.ExtrudeGeometry(topShape, extrudeSettings)
topGeo.translate(0, 0, -0.075) // center the depth
topGeo.scale(0.85, 1.6, 1)

const bottomGeo = new THREE.ExtrudeGeometry(bottomShape, extrudeSettings)
bottomGeo.translate(0, 0, -0.075)
bottomGeo.scale(0.85, 1.6, 1)

// Use threshold angle to ignore bevel lines
const topEdges = new THREE.EdgesGeometry(topGeo, 15)
const bottomEdges = new THREE.EdgesGeometry(bottomGeo, 15)

function Petal({ up, isMobile, plusTexture }: { up: boolean, isMobile: boolean, plusTexture: THREE.Texture }) {
  const geo = up ? topGeo : bottomGeo
  const edges = up ? topEdges : bottomEdges
  const edgeColor = up ? "#00E5C7" : "#F5B82E"
  const petalColor = up ? "#0d1f1a" : "#1f1a0d"

  return (
    <mesh geometry={geo}>
      {isMobile ? (
        <meshStandardMaterial 
          color={petalColor}
          transparent
          opacity={0.85}
          roughness={0.15}
          metalness={0.3}
          map={plusTexture}
        />
      ) : (
        <meshPhysicalMaterial 
          color={petalColor} 
          transmission={0.65}
          thickness={0.5}
          roughness={0.1}
          metalness={0.2}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.5}
          map={plusTexture}
        />
      )}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={edgeColor} transparent opacity={0.5} linewidth={1} />
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
      let p = animState.current.time / 1.5
      if (p > 1) p = 1
      animState.current.progress = 1 - Math.pow(1 - p, 3)
    }

    const p = animState.current.progress

    const targetRadius = isMobile ? 1.0 : 1.4
    const startRadius = 2.0
    const radius = THREE.MathUtils.lerp(startRadius, targetRadius, p)

    const targetY = isMobile ? 1.0 : 1.4
    const startY = 2.5
    const yOffset = THREE.MathUtils.lerp(startY, targetY, p)

    const targetScale = isMobile ? 0.9 : 1.25
    const startScale = targetScale
    const scale = THREE.MathUtils.lerp(startScale, targetScale, p)

    const targetCamZ = isMobile ? 8.5 : 6.5
    const startCamZ = targetCamZ
    state.camera.position.z = THREE.MathUtils.lerp(startCamZ, targetCamZ, p)

    const spinIn = (1 - p) * Math.PI * 2 // Extra spin during entry
    const topGroupRot = state.clock.elapsedTime * 0.3 + spinIn
    const botGroupRot = -state.clock.elapsedTime * 0.3 - spinIn

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
      <sphereGeometry args={[0.75, 64, 64]} />
      <MeshDistortMaterial 
        color="#00E5C7"
        emissive="#00E5C7" 
        emissiveIntensity={1.2}
        roughness={0.15}
        metalness={0.3}
        clearcoat={0.8}
        distort={0.35}
        speed={2.5}
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
      <ambientLight intensity={0.2} /> 
      
      {/* Global highlights */}
      <pointLight position={[5, 5, 5]} color="#00E5C7" intensity={0.8} />
      <pointLight position={[-5, -5, -5]} color="#F5B82E" intensity={0.5} />
      
      {/* Close inner lights to give the core volume and gradient shading */}
      <pointLight position={[1.5, 1.5, 1.5]} color="#00E5C7" intensity={2} distance={6} />
      <pointLight position={[-1.5, -1.5, -1.5]} color="#F5B82E" intensity={2} distance={6} />
      
      <Core />
      <DoubleCone isMobile={isMobile} />
      
      {!isMobile && (
        <Environment resolution={128}>
          <group rotation={[-Math.PI / 4, -0.15, 0]}>
            <Lightformer form="rect" intensity={4} color="#00E5C7" position={[-5, 5, -5]} scale={[10, 10, 1]} />
            <Lightformer form="rect" intensity={2} color="#F5B82E" position={[5, 5, 5]} scale={[10, 10, 1]} />
            <Lightformer form="circle" intensity={1} color="#ffffff" position={[0, 5, 0]} scale={[5, 5, 1]} />
          </group>
        </Environment>
      )}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
      />
      
      {/* <EffectComposer disableNormalPass multisampling={4} alpha={true}>
        <Bloom 
          luminanceThreshold={0.3} 
          mipmapBlur 
          intensity={0.4} 
        />
      </EffectComposer> */}
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
          gl={{ alpha: true, antialias: false }}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  )
}
