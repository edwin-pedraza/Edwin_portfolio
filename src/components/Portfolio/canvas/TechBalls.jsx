import PropTypes from 'prop-types'
import { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload, Float, Decal, useTexture, Environment } from '@react-three/drei'
import CanvasLoader from '../Loader'

// Small ball mesh with an optional icon decal
function BallNode({ icon }) {
  const safe = icon || null
  const textures = useTexture(safe ? [safe] : [])
  const decal = textures?.[0]
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
      <ambientLight intensity={0.25} />
      <directionalLight position={[0, 0, 0.05]} />
      <mesh castShadow receiveShadow scale={1.75}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#1b7b9d" polygonOffset polygonOffsetFactor={-5} flatShading />
        {decal && (
          <Decal position={[0, 0, 1]} rotation={[2 * Math.PI, 0, 6.25]} scale={1} map={decal} flatShading />
        )}
      </mesh>
    </Float>
  )
}

// Renders all technologies in a grid within a single Canvas
export default function TechBalls({ items = [], columns = 6, cell = 3.2, heightPerRow = 140 }) {
  const { positions, rows } = useMemo(() => {
    const cols = Math.max(1, columns)
    const pos = items.map((_, i) => {
      const r = Math.floor(i / cols)
      const c = i % cols
      const x = (c - (cols - 1) / 2) * cell
      const y = (-(r) + 0.5) * cell
      return [x, y, 0]
    })
    const totalRows = Math.ceil(items.length / cols)
    return { positions: pos, rows: totalRows }
  }, [items, columns, cell])

  const canvasHeight = Math.max(240, rows * heightPerRow)

  return (
    <div className="w-full" style={{ height: canvasHeight }}>
      <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 18], fov: 45 }}>
        <Suspense fallback={<CanvasLoader />}> 
          <Environment preset="city" />
          {items.map((it, i) => (
            <group key={it.name || i} position={positions[i]}>
              <BallNode icon={it.icon} />
            </group>
          ))}
          <OrbitControls enableZoom={false} enablePan={false} />
        </Suspense>
        <Preload all />
      </Canvas>
    </div>
  )
}

BallNode.propTypes = {
  icon: PropTypes.string,
}

TechBalls.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      icon: PropTypes.string,
    })
  ),
  columns: PropTypes.number,
  cell: PropTypes.number,
  heightPerRow: PropTypes.number,
}
