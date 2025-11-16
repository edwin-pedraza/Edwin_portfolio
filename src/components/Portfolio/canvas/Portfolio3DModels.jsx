import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

const DESK_MODEL_URL = "/Desktop/desk portfolio2.glb";
const MAX_SCENE_SIZE = 7;
const DESK_BASE_ROTATION = Math.PI/-2; // rotate monitors to face the camera

function ExportButton({ getObject, fileName = "model.glb", className = "" }) {
  const onExport = () => {
    const obj = getObject?.();
    if (!obj) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      obj,
      (res) => {
        const blob = new Blob([res], { type: "model/gltf-binary" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
      },
      console.error,
      { binary: true }
    );
  };
  return (
    <button
      onClick={onExport}
      className={`px-4 py-2 rounded-2xl text-sm font-semibold border border-white/10 bg-black/60 text-white hover:bg-black/80 transition-colors ${className}`}
    >
      Export GLB
    </button>
  );
}

const sanitize = (s) => s.normalize("NFKD").replace(/[\/\\:*?"<>|]/g, "-").replace(/\s+/g, "_").toLowerCase();

function BlenderDeskScene({ groupRef, onHoverChange, scaleMultiplier = 1 }) {
  const { scene } = useGLTF(DESK_MODEL_URL);
  const [isHovered, setIsHovered] = useState(false);
  const hoverProgress = useRef(0);

  const preparedScene = useMemo(() => {
    if (!scene) return null;

    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    clone.position.set(-center.x, -center.y + size.y / 2, -center.z);

    const maxAxis = Math.max(size.x, size.y, size.z);
    const fitScale = maxAxis > MAX_SCENE_SIZE ? MAX_SCENE_SIZE / maxAxis : 1;
    clone.scale.setScalar(fitScale * scaleMultiplier);

    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        materials.forEach((material) => {
          if (material?.map) {
            material.map.encoding = THREE.sRGBEncoding;
            material.map.anisotropy = 8;
          }
        });
      }
    });

    return clone;
  }, [scene, scaleMultiplier]);

  useFrame((state) => {
    if (!groupRef.current) return;
    hoverProgress.current = THREE.MathUtils.lerp(
      hoverProgress.current,
      isHovered ? 1 : 0,
      0.12
    );
    const bob = Math.sin(state.clock.getElapsedTime() * 2.4) * 0.05 * hoverProgress.current;
    groupRef.current.position.y = -0.35 + hoverProgress.current * 0.18;
    groupRef.current.rotation.y = DESK_BASE_ROTATION + bob;
  });

  if (!preparedScene) return null;

  const handlePointerOver = () => {
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handlePointerOut = () => {
    setIsHovered(false);
    onHoverChange?.(false);
  };

  return (
    <group
      ref={groupRef}
      position={[0, -0.35, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={preparedScene} dispose={null} />
    </group>
  );
}

useGLTF.preload(DESK_MODEL_URL);

export default function Portfolio3DModels({ height = 580, width = 700, modelScale = 1 }) {
  const sceneRef = useRef();
  const [isDeskHovered, setIsDeskHovered] = useState(false);
  const getExportObject = () => sceneRef.current;
  const computedWidth = typeof width === "number" ? `${width}px` : width;

  return (
    <div className="relative rounded-[32px] overflow-hidden" style={{ height, width: computedWidth }}>
      <div className="absolute top-4 right-4 z-10 pointer-events-auto">
        <ExportButton getObject={getExportObject} fileName={`${sanitize("blender desk")}.glb`} />
      </div>

      <div
        className={`pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 text-sm font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full transition-opacity duration-200 ${
          isDeskHovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {isDeskHovered ? "Blender desk ready for work!" : "Hover the desk to see a tip"}
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 3.2, 6.8], fov: 35 }}
        dpr={[1, 4]}
        gl={{ alpha: true, preserveDrawingBuffer: true }}
        style={{ background: "transparent", width: "100%", height: "100%" }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 7, 3]} intensity={1.1} />
        <directionalLight position={[-5, 2, -3]} intensity={0.4} />
        <Environment preset="city" />

        <Suspense fallback={null}>
          <BlenderDeskScene
            groupRef={sceneRef}
            onHoverChange={setIsDeskHovered}
            scaleMultiplier={modelScale}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.2}
          rotateSpeed={0.7}
          enablePan={false}
          minAzimuthAngle={-Math.PI / 8}
          maxAzimuthAngle={Math.PI / 8}
          minDistance={4}
          maxDistance={8}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI / 2.15}
          zoomSpeed={0.45}
          target={[0, 0.2, 0]}
        />
      </Canvas>
    </div>
  );
}
