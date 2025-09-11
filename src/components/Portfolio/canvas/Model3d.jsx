import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import CanvasLoader from "../Loader";

// Use absolute path so it works under nested routes like /react/blog/...
const AVATAR_URL = "/planet/scene.gltf";

const Avatar = ({ isMobile }) => {
  const avatar = useGLTF(AVATAR_URL);
  
  return (
    <mesh >
      <hemisphereLight intensity={10} groundColor='black' />
      {/* <spotLight
        position={[0, 40, 10]}
        angle={0.60}
        penumbra={1}
        intensity={50}
        castShadow
        shadow-mapSize={1024}
      /> */}
      {/* <pointLight intensity={3} /> */}
      <primitive
        object={avatar.scene}
        scale={isMobile ? 4.5 : 6.5}
        position={isMobile ? [0, -3, 0] : [0, -7.5, 0]}
        // rotation={[0, 0, 0]}
      />
    </mesh>
  );
};

const ModelCanvas = () => {

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Add a listener for changes to the screen size
    const mediaQuery = window.matchMedia("(max-width: 900px)");

    // Set the initial value of the `isMobile` state variable
    setIsMobile(mediaQuery.matches);

    // Define a callback function to handle changes to the media query
    const handleMediaQueryChange = (event) => {
      setIsMobile(event.matches);
    };

    // Add the callback function as a listener for changes to the media query
    mediaQuery.addEventListener("change", handleMediaQueryChange);

    // Remove the listener when the component is unmounted
    return () => {
      mediaQuery.removeEventListener("change", handleMediaQueryChange);
    };
  }, []);


  return (
    <Canvas className={" sm:basis-1/3 sm:cursor-pointer sm:block h-1 "}
      frameloop='demand'
      dpr={[1, 2]}
      gl={{ preserveDrawingBuffer: true }}

      shadows
      camera={{ position: [20, 10, 10], fov: 25 }}
      
    >
    <Suspense fallback={<CanvasLoader />}>
      <OrbitControls
        enableZoom={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}

      />
      <Avatar isMobile={isMobile} />
      </Suspense>
      <Preload all />
      </Canvas>
  );
};

useGLTF.preload(AVATAR_URL);

export default ModelCanvas;
