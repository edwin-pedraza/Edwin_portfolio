import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF, Line } from "@react-three/drei";
import { Suspense, useMemo, useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

const withBaseUrl = (path) => {
  const base = import.meta.env.BASE_URL || "/";
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

const DESK_MODEL_URL = withBaseUrl("/Desktop/desk portfolio2.glb");
const MAX_SCENE_SIZE = 7;
const DESK_BASE_ROTATION = Math.PI / -2; // rotate monitors to face the camera
const SCREEN_KEYWORDS = ["plane004_1", "plane002_1", "plane002_2", "plane006_1", "plane006_2"];
const HOVER_EMPHASIS = 1.12;

const normalizeMeshKey = (name) =>
  (name || "")
    .toString()
    .trim()
    .replace(/[\s._-]+/g, "")
    .replace(/\./g, "")
    .toLowerCase();

const fallbackLabelFromName = (name) =>
  (name || "")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

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
ExportButton.propTypes = {
  getObject: PropTypes.func,
  fileName: PropTypes.string,
  className: PropTypes.string,
};

// Create a file-safe slug for downloads
const sanitize = (s) =>
  s
    .normalize("NFKD")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s+/g, "_")
    .toLowerCase();

function BlenderDeskScene({ groupRef, onHoverChange, onDebugChange, scaleMultiplier = 1, getMeshLabel, hasCustomLabels }) {
  const { scene } = useGLTF(DESK_MODEL_URL);
  const [isHovered, setIsHovered] = useState(false);
  const hoverProgress = useRef(0);
  const screenScalesRef = useRef(new Map());
  const screenGlowRef = useRef(null);
  const screenCenterRef = useRef(new THREE.Vector3());
  const outlineRef = useRef(null);
  const outlineSizeRef = useRef({ width: 5, depth: 2.5 });
  const invalidMeshesRef = useRef([]);

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
    invalidMeshesRef.current = [];
    const box = new THREE.Box3().setFromObject(clone);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Fallbacks in case a bad geometry yields non-finite values
    const safeSizeX = Number.isFinite(size.x) ? size.x : 5;
    const safeSizeY = Number.isFinite(size.y) ? size.y : 2;
    const safeSizeZ = Number.isFinite(size.z) ? size.z : 3;
    const safeCenterX = Number.isFinite(center.x) ? center.x : 0;
    const safeCenterY = Number.isFinite(center.y) ? center.y : 0;
    const safeCenterZ = Number.isFinite(center.z) ? center.z : 0;

    clone.position.set(-safeCenterX, -safeCenterY + safeSizeY / 2, -safeCenterZ);

    const maxAxis = Math.max(safeSizeX, safeSizeY, safeSizeZ);
    const fitScale = maxAxis > MAX_SCENE_SIZE ? MAX_SCENE_SIZE / maxAxis : 1;
    clone.scale.setScalar(fitScale * scaleMultiplier);
    outlineSizeRef.current = {
      width: safeSizeX * 1.18,
      depth: safeSizeZ * 1.2,
    };

    const centerAccumulator = new THREE.Vector3();
    let screenCount = 0;

    const isFiniteGeometry = (geom) => {
      try {
        if (!geom || !geom.attributes || !geom.attributes.position) return true;
        const arr = geom.attributes.position.array;
        // Sometimes position is not a Float32Array; coerce to a view we can iterate
        const len = arr?.length || 0;
        for (let i = 0; i < len; i++) {
          const v = arr[i];
          if (!Number.isFinite(v)) return false;
        }
        // Attempt a boundingSphere to force three.js to compute internals
        geom.computeBoundingSphere();
        return Number.isFinite(geom.boundingSphere?.radius);
      } catch (_) {
        return false;
      }
    };

    clone.traverse((child) => {
      if (child.isMesh) {
        // Validate mesh geometry; hide if invalid to prevent NaN radius errors
        const geom = child.geometry;
        if (!isFiniteGeometry(geom)) {
          const name = child.name || child.uuid;
          console.warn('[Desk GLTF] Replacing invalid mesh with placeholder:', name);
          invalidMeshesRef.current.push(name);
          // Swap with a visible placeholder cube so the scene stays valid
          const size = 0.15;
          child.geometry = new THREE.BoxGeometry(size, size, size);
          child.material = new THREE.MeshStandardMaterial({ color: '#ff6b6b', emissive: '#803333', roughness: 0.5, metalness: 0.1 });
        }

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

  // Publish debug info when the prepared scene changes
  useEffect(() => {
    onDebugChange?.(invalidMeshesRef.current.slice());
  }, [preparedScene, onDebugChange]);

  useFrame((state) => {
    if (!groupRef.current) return;
    hoverProgress.current = THREE.MathUtils.lerp(
      hoverProgress.current,
      isHovered ? 1 : 0,
      0.06
    );
    const bob = Math.sin(state.clock.getElapsedTime() * 1.8) * 0.04 * hoverProgress.current;
    groupRef.current.position.y = -0.35 + hoverProgress.current * 0.15;
    groupRef.current.rotation.y = DESK_BASE_ROTATION + bob;

    if (screenGlowRef.current) {
      screenGlowRef.current.intensity = THREE.MathUtils.lerp(
        screenGlowRef.current.intensity,
        isHovered ? 1.8 : 0,
        0.08
      );
    }

    if (outlineRef.current) {
      outlineRef.current.material.opacity = THREE.MathUtils.lerp(
        outlineRef.current.material.opacity,
        isHovered ? 0.9 : 0,
        0.08
      );
      const scale = 1 + hoverProgress.current * 0.04;
      outlineRef.current.scale.setScalar(scale);
    }
  });
  // Derived outline path points (ensure hook is always called before any return)
  // Calculate static outline points based on the last measured outline size.
  // preparedScene isn't required here; we recompute only when BlenderDeskScene
  // updates outlineSizeRef during preparation.
  const outlinePoints = useMemo(() => {
    const { width, depth } = outlineSizeRef.current;
    const w = Number.isFinite(width) ? width : 5;
    const d = Number.isFinite(depth) ? depth : 2.5;
    const halfW = w / 2;
    const halfD = d / 2;
    return [
      [-halfW, -0.02, -halfD],
      [-halfW, -0.02, halfD],
      [halfW, -0.02, halfD],
      [halfW, -0.02, -halfD],
      [-halfW, -0.02, -halfD],
    ];
  }, []);

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
    const customLabel = getMeshLabel?.(name);
    const label = customLabel || (!hasCustomLabels ? fallbackLabelFromName(name) : "");
    onHoverChange?.(label);
  };

  const handlePointerOut = (event) => {
    const name = event.object?.name || "(sin nombre)";
    console.log("[Desk Hover] pointer out:", name);
    if (!isScreenMesh(event.object)) return;
    emphasizeMesh(event.object, false);
    setIsHovered(false);
    onHoverChange?.("");
  };

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
    /* eslint-enable react/no-unknown-property */
  );
}
BlenderDeskScene.propTypes = {
  groupRef: PropTypes.shape({ current: PropTypes.any }),
  onHoverChange: PropTypes.func,
  onDebugChange: PropTypes.func,
  scaleMultiplier: PropTypes.number,
  getMeshLabel: PropTypes.func,
  hasCustomLabels: PropTypes.bool,
};

useGLTF.preload(DESK_MODEL_URL);

export default function Portfolio3DModels({ height = 580, width = 700, modelScale = 1, deskLabels = [] }) {
  const sceneRef = useRef();
  const [overlayLabel, setOverlayLabel] = useState("");
  const [invalidMeshes, setInvalidMeshes] = useState([]);
  const getExportObject = () => sceneRef.current;
  const computedWidth = typeof width === "number" ? `${width}px` : width;
  const labelMap = useMemo(() => {
    const entries = Array.isArray(deskLabels) ? deskLabels : [];
    return entries.reduce((map, item) => {
      const meshKey = normalizeMeshKey(item?.mesh);
      const labelText = typeof item?.label === "string" ? item.label.trim() : "";
      if (meshKey && labelText && !map.has(meshKey)) {
        map.set(meshKey, labelText);
      }
      return map;
    }, new Map());
  }, [deskLabels]);
  const getMeshLabel = useCallback(
    (rawName) => {
      const key = normalizeMeshKey(rawName);
      if (!key) return undefined;
      const direct = labelMap.get(key);
      if (direct) return direct;
      for (const [meshKey, label] of labelMap.entries()) {
        if (!meshKey) continue;
        if (key.includes(meshKey) || meshKey.includes(key)) {
          return label;
        }
      }
      return undefined;
    },
    [labelMap]
  );
  const hasCustomLabels = labelMap.size > 0;

  return (
    <div className="relative rounded-[32px] overflow-hidden" style={{ height, width: computedWidth }}>
      <div className="absolute top-4 right-4 z-10 pointer-events-auto">
        <ExportButton getObject={getExportObject} fileName={`${sanitize("blender desk")}.glb`} />
      </div>

      {/* Top-center hover label aligned to the camera */}
      <div
        className={`pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 text-sm font-semibold text-white/90 bg-black/70 px-4 py-2 rounded-2xl shadow-lg leading-snug text-left max-w-[90%] sm:max-w-[70%] transition-opacity duration-200 ${
          overlayLabel ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {overlayLabel}
      </div>

      {/* Debug panel for invalid meshes */}
      {invalidMeshes.length > 0 && (
        <div className="absolute top-4 left-4 z-10 max-w-[280px] rounded-2xl border border-orange-300/50 bg-orange-50/90 px-3 py-2 text-xs text-orange-800 shadow">
          <div className="font-semibold">GLTF issues</div>
          <div className="mt-1">Replaced invalid meshes:</div>
          <ul className="mt-1 list-disc pl-4">
            {invalidMeshes.slice(0, 6).map((n) => (
              <li key={n} className="truncate" title={n}>{n}</li>
            ))}
          </ul>
          {invalidMeshes.length > 6 && <div className="mt-1">…and {invalidMeshes.length - 6} more</div>}
        </div>
      )}

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
            onHoverChange={setOverlayLabel}
            onDebugChange={setInvalidMeshes}
            scaleMultiplier={modelScale}
            getMeshLabel={getMeshLabel}
            hasCustomLabels={hasCustomLabels}
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
        {/* eslint-enable react/no-unknown-property */}
      </Canvas>
    </div>
  );
}
Portfolio3DModels.propTypes = {
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  modelScale: PropTypes.number,
  deskLabels: PropTypes.arrayOf(
    PropTypes.shape({
      mesh: PropTypes.string,
      label: PropTypes.string,
    })
  ),
};
