import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Preload, useGLTF, Environment } from '@react-three/drei'
import CanvasLoader from '../Loader'

function Model({ url }) {
  const gltf = useGLTF(url)
  return (
    <primitive object={gltf.scene} />
  )
}

export default function ModelPreview({ url, className = '' }) {
  if (!url) return null
  return (
    <Canvas className={className} frameloop='demand' dpr={[1, 2]} gl={{ preserveDrawingBuffer: true }} camera={{ position: [3, 2, 4], fov: 40 }}>
      <Suspense fallback={<CanvasLoader />}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5,5,2]} intensity={1.2} />
        <Environment preset="city" />
        <Model url={url} />
        <OrbitControls enableZoom={false} />
      </Suspense>
      <Preload all />
    </Canvas>
  )
}

