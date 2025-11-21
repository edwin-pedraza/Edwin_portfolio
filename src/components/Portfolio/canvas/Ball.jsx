import PropTypes from "prop-types";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Decal,
  Float,
  OrbitControls,
  Preload,
  useTexture,
} from "@react-three/drei";

import CanvasLoader from "../Loader";

// 1x1 transparent PNG to avoid texture load errors when URL is missing
const TRANSPARENT_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/ah3oXkAAAAASUVORK5CYII=";

const Ball = ({ imgUrl }) => {
  const safeUrl = imgUrl || TRANSPARENT_PNG;
  const [decal] = useTexture([safeUrl]);

  return (
    <Float speed={1.5} rotationIntensity={0.9} floatIntensity={1.8}>
      <hemisphereLight intensity={0.8} groundColor={'#0b1220'} />
      <directionalLight position={[2, 3, 2]} intensity={1.6} />
      <directionalLight position={[-2, -1, -2]} intensity={0.6} color={'#60a5fa'} />
      <mesh castShadow receiveShadow scale={1.75}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color={'#334155'}
          metalness={0.25}
          roughness={0.35}
          polygonOffset
          polygonOffsetFactor={-5}
          flatShading
        />
        {imgUrl && (
          <Decal
            position={[0, 0, 1]}
            rotation={[2 * Math.PI, 0, 6.25]}
            scale={1}
            map={decal}
            flatShading
          />
        )}
      </mesh>
    </Float>
  );
};

const BallCanvas = ({ icon }) => (
  <Canvas
    frameloop='demand'
    dpr={[1, 2]}
    gl={{ alpha: true, antialias: true }}
    style={{ width: '100%', height: '100%' }}
  >
    <Suspense fallback={<CanvasLoader />}>
      <OrbitControls enableZoom={false} />
      <Ball imgUrl={icon} />
    </Suspense>

    <Preload all />
  </Canvas>
);

export default BallCanvas;

Ball.propTypes = {
  imgUrl: PropTypes.string,
};

BallCanvas.propTypes = {
  icon: PropTypes.string,
};
