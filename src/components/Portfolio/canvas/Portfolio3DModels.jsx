import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Line } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

const DESK_MODEL_URL = "/Desktop/desk portfolio2.glb";
const MAX_SCENE_SIZE = 7;
const DESK_BASE_ROTATION = Math.PI / -2; // rotate monitors to face the camera
const SCREEN_KEYWORDS = ["plane004_1", "plane002_1", "plane002_2", "plane006_1", "plane006_2"];
const HOVER_EMPHASIS = 1.12;

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
  const screenScalesRef = useRef(new Map());
  const screenGlowRef = useRef(null);
  const screenCenterRef = useRef(new THREE.Vector3());
  const outlineRef = useRef(null);
  const outlineSizeRef = useRef({ width: 5, depth: 2.5 });

  const isScreenMesh = (object) => {
    const name = object?.name?.replace(/\./g, "").toLowerCase() || "";
    return SCREEN_KEYWORDS.some((keyword) => {
      const normalizedKeyword = keyword.toLowerCase();
      return name === normalizedKeyword || name.includes(normalizedKeyword);
    });
  };

  const preparedScene = useMemo(() => {
    if (!scene) return null;

    const clone = scene.clone(true);
    screenScalesRef.current = new Map();
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    clone.position.set(-center.x, -center.y + size.y / 2, -center.z);

    const maxAxis = Math.max(size.x, size.y, size.z);
    const fitScale = maxAxis > MAX_SCENE_SIZE ? MAX_SCENE_SIZE / maxAxis : 1;
    clone.scale.setScalar(fitScale * scaleMultiplier);
    outlineSizeRef.current = {
      width: size.x * 1.18,
      depth: size.z * 1.2,
    };

    const centerAccumulator = new THREE.Vector3();
    let screenCount = 0;

    clone.traverse((child) => {
      if (child.isMesh) {
        screenScalesRef.current.set(child.uuid, child.scale.clone());
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

      if (isScreenMesh(child)) {
        const worldPos = new THREE.Vector3();
        child.getWorldPosition(worldPos);
        centerAccumulator.add(worldPos);
        screenCount += 1;
      }
    });

    if (screenCount > 0) {
      screenCenterRef.current.copy(centerAccumulator.divideScalar(screenCount));
    } else {
      screenCenterRef.current.set(0, 0.9, 0);
    }

    return clone;
  }, [scene, scaleMultiplier]);

  useFrame((state) => {
    if (!groupRef.current) return;
    hoverProgress.current = THREE.MathUtils.lerp(
      hoverProgress.current,
      isHovered ? 1 : 0,
      0.08
    );
    const bob = Math.sin(state.clock.getElapsedTime() * 1.8) * 0.04 * hoverProgress.current;
    groupRef.current.position.y = -0.35 + hoverProgress.current * 0.15;
    groupRef.current.rotation.y = DESK_BASE_ROTATION + bob;

    if (screenGlowRef.current) {
      screenGlowRef.current.intensity = THREE.MathUtils.lerp(
        screenGlowRef.current.intensity,
        isHovered ? 1.8 : 0,
        0.1
      );
    }

    if (outlineRef.current) {
      outlineRef.current.material.opacity = THREE.MathUtils.lerp(
        outlineRef.current.material.opacity,
        isHovered ? 0.9 : 0,
        0.12
      );
      const scale = 1 + hoverProgress.current * 0.04;
      outlineRef.current.scale.setScalar(scale);
    }
  });

  if (!preparedScene) return null;

  const emphasizeMesh = (object, emphasize) => {
    const originalScale = screenScalesRef.current.get(object.uuid);
    if (!originalScale) return;
    if (emphasize) {
      object.scale.copy(originalScale).multiplyScalar(HOVER_EMPHASIS);
    } else {
      object.scale.copy(originalScale);
    }
  };

  const handlePointerOver = (event) => {
    const name = event.object?.name || "(sin nombre)";
    console.log("[Desk Hover] pointer over:", name);
    if (!isScreenMesh(event.object)) return;
    emphasizeMesh(event.object, true);
    setIsHovered(true);
    onHoverChange?.(true);
  };

  const handlePointerOut = (event) => {
    const name = event.object?.name || "(sin nombre)";
    console.log("[Desk Hover] pointer out:", name);
    if (!isScreenMesh(event.object)) return;
    emphasizeMesh(event.object, false);
    setIsHovered(false);
    onHoverChange?.(false);
  };

  const outlinePoints = useMemo(() => {
    const { width, depth } = outlineSizeRef.current;
    const halfW = width / 2;
    const halfD = depth / 2;
    return [
      [-halfW, -0.02, -halfD],
      [-halfW, -0.02, halfD],
      [halfW, -0.02, halfD],
      [halfW, -0.02, -halfD],
      [-halfW, -0.02, -halfD],
    ];
  }, [preparedScene]);

  return (
    <group ref={groupRef} position={[0, -0.35, 0]}>
      <pointLight
        ref={screenGlowRef}
        position={screenCenterRef.current}
        color="#3bc9ff"
        distance={4.8}
        intensity={0}
        decay={2}
      />
      <Line
        ref={outlineRef}
        points={outlinePoints}
        color="#38bdf8"
        lineWidth={2}
        transparent
        opacity={0}
        dashed={false}
      />
      <primitive
        object={preparedScene}
        dispose={null}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      />
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
