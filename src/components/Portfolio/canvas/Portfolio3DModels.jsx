// Portfolio3DModelsAlt_transparent_clean.jsx
// Fondo 100% transparente + zoom limitado + sin etiquetas dentro de la escena
// Uso:
//   import Portfolio3DModelsAlt from './Portfolio3DModelsAlt_transparent_clean'
//   <Portfolio3DModelsAlt height={360} />

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, Environment, Line, Text } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";
import monitor1 from "../../../assets/monitor1.jpeg";

// ---------- Utilidades ----------
function useRotY(initialRotation = 0) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.rotation.y = initialRotation;
  }, [initialRotation]);
  return ref;
}

function createScreenTexture({ title, subtitle, accent = "#38bdf8", background = "#0f172a" }) {
  const canvas = document.createElement("canvas");
  const width = 1024;
  const height = 512;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, background);
  gradient.addColorStop(1, "#0b1120");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#111c32";
  ctx.fillRect(80, 80, width - 160, height - 160);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(120, height - 150);
  ctx.lineTo(width * 0.35, height - 220);
  ctx.lineTo(width * 0.65, height - 180);
  ctx.lineTo(width - 120, height - 210);
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accent;
  ctx.font = "bold 72px 'Poppins', sans-serif";
  ctx.fillText(title, width / 2, height / 2 - 40);

  ctx.fillStyle = "#e2e8f0";
  ctx.font = "normal 42px 'Poppins', sans-serif";
  ctx.fillText(subtitle, width / 2, height / 2 + 60);

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.encoding = THREE.sRGBEncoding;
  texture.needsUpdate = true;
  return texture;
}

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
      Exportar GLB
    </button>
  );
}

const sanitize = (s) => s.normalize('NFKD').replace(/[\/\\:*?"<>|]/g, '-').replace(/\s+/g, '_').toLowerCase();

// ---------- Escena 1: Laptop (Dev) ----------
function LaptopScene({ groupRef }) {
  const rot = useRotY(-0.45);
  const keys = useMemo(() => {
    const arr = [];
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 12; x++) {
        arr.push({ p: [x * 0.18 - 1.05, 0.07, y * 0.18 - 0.7] });
      }
    }
    return arr;
  }, []);

  return (
    <group ref={groupRef}>
      <group ref={rot}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[3.2, 0.12, 2.2]} />
          <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.3} />
        </mesh>
        <group position={[0, 1.2, -1.05]} rotation={[-Math.PI / 9, 0, 0]}>
          <mesh>
            <boxGeometry args={[3.0, 1.9, 0.08]} />
            <meshStandardMaterial color="#111827" metalness={0.4} roughness={0.35} />
          </mesh>
          {new Array(6).fill(0).map((_, i) => (
            <mesh key={i} position={[-1.2 + (i % 3) * 1.2, 0.55 - Math.floor(i / 3) * 0.5, 0.05]}>
              <boxGeometry args={[0.9, 0.02, 0.02]} />
              <meshStandardMaterial color={["#60a5fa", "#22d3ee", "#f472b6"][i % 3]} />
            </mesh>
          ))}
        </group>
        {keys.map((k, i) => (
          <mesh key={i} position={[k.p[0], k.p[1], k.p[2]]}>
            <boxGeometry args={[0.16, 0.03, 0.16]} />
            <meshStandardMaterial color="#374151" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ---------- Escena 2: Donut KPI (Data) ----------
function DonutScene({ groupRef, values = [30, 20, 15, 10, 25] }) {
  const rot = useRotY(-0.4);
  const total = values.reduce((a, b) => a + b, 0);
  const colors = ["#22d3ee", "#34d399", "#818cf8", "#f472b6", "#fbbf24"];
  let acc = 0;
  return (
    <group ref={groupRef}>
      <group ref={rot}>
        {values.map((v, i) => {
          const start = (acc / total) * Math.PI * 2; acc += v; const end = (acc / total) * Math.PI * 2;
          const arc = end - start;
          return (
            <Float key={i} speed={1} floatIntensity={0.6}>
              <mesh rotation={[Math.PI / 2, 0, start]}>
                <torusGeometry args={[2.0, 0.35, 24, 120, arc]} />
                <meshStandardMaterial color={colors[i % colors.length]} metalness={0.5} roughness={0.25} />
              </mesh>
            </Float>
          );
        })}
        <mesh>
          <torusGeometry args={[2.0, 0.36, 24, 120, Math.PI * 2]} />
          <meshStandardMaterial color="#0ea5e9" transparent opacity={0.08} />
        </mesh>
      </group>
    </group>
  );
}

// ---------- Escena 3: Scatter Clusters (ML) ----------
function ScatterScene({ groupRef, clusters = 4, pointsPerCluster = 80 }) {
  const rot = useRotY(-0.5);
  const { positions } = useMemo(() => {
    const pos = []; const palette = [new THREE.Color("#60a5fa"), new THREE.Color("#34d399"), new THREE.Color("#f59e0b"), new THREE.Color("#a78bfa")];
    const col = [];
    for (let c = 0; c < clusters; c++) {
      const center = new THREE.Vector3(THREE.MathUtils.randFloatSpread(2.5), THREE.MathUtils.randFloatSpread(2.0), THREE.MathUtils.randFloatSpread(2.5));
      for (let i = 0; i < pointsPerCluster; i++) {
        const p = new THREE.Vector3().copy(center).add(new THREE.Vector3(
          THREE.MathUtils.randFloatSpread(0.7),
          THREE.MathUtils.randFloatSpread(0.7),
          THREE.MathUtils.randFloatSpread(0.7)
        ));
        pos.push(p.x, p.y, p.z);
        const cc = palette[c % palette.length]; col.push(cc.r, cc.g, cc.b);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    return { positions: geo };
  }, [clusters, pointsPerCluster]);

  return (
    <group ref={groupRef}>
      <group ref={rot}>
        <points geometry={positions}>
          <pointsMaterial size={0.035} vertexColors sizeAttenuation depthWrite={false} />
        </points>
        {/* Marco */}
        {[-1.8, 1.8].map((x, i) => (
          <Line key={'x'+i} points={[[x,-1.4,-1.8],[x,-1.4,1.8],[x,1.4,1.8],[x,1.4,-1.8],[x,-1.4,-1.8]]} lineWidth={1} color="#94a3b8" />
        ))}
        {[-1.8, 1.8].map((z, i) => (
          <Line key={'z'+i} points={[[-1.8,-1.4,z],[1.8,-1.4,z],[1.8,1.4,z],[-1.8,1.4,z],[-1.8,-1.4,z]]} lineWidth={1} color="#94a3b8" />
        ))}
      </group>
    </group>
  );
}

// ---------- Escena 4: Logo Text (Brand) ----------
function LogoScene({ groupRef, text = "EDWIN • DEV • DATA" }) {
  const rot = useRotY(-0.2);
  return (
    <group ref={groupRef}>
      <group ref={rot}>
        <Float speed={1} rotationIntensity={0.6} floatIntensity={1}>
          <Text fontSize={0.6} letterSpacing={0.02} lineHeight={1} anchorX="center" anchorY="middle" outlineWidth={0.005} outlineColor="#000" color="#e5e7eb">
            {text}
          </Text>
        </Float>
        <mesh rotation={[Math.PI/2,0,0]}>
          <ringGeometry args={[1.8, 2.1, 72]} />
          <meshStandardMaterial color="#06b6d4" metalness={0.5} roughness={0.25} />
        </mesh>
      </group>
    </group>
  );
}

// ---------- Escena 5: Command Center (Dashboard Desk) ----------
function CommandCenterScene({ groupRef }) {
  const rot = useRotY(-0.5);
  const generatedTextures = useMemo(() => {
    const definitions = [
      { title: "Developer", subtitle: "UI builds & UX polish", accent: "#38bdf8" },
      { title: "Automation", subtitle: "QA & workflow bots", accent: "#f97316" },
      { title: "Data Dashboards", subtitle: "Analytics & insight", accent: "#a855f7" },
    ];
    return definitions.map((def) => createScreenTexture(def));
  }, []);

  const monitorImageTexture = useMemo(() => {
    const texture = new THREE.TextureLoader().load(monitor1);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, []);

  const screenTextures = useMemo(() => {
    const textures = generatedTextures.slice(0, 3);
    textures[0] = monitorImageTexture || textures[0];
    return textures;
  }, [generatedTextures, monitorImageTexture]);

  useEffect(() => {
    return () => {
      generatedTextures.forEach((texture) => texture.dispose());
      monitorImageTexture?.dispose();
    };
  }, [generatedTextures, monitorImageTexture]);
  const chartBars = useMemo(
    () => new Array(6).fill(0).map((_, i) => 0.3 + (i % 3) * 0.15 + Math.random() * 0.2),
    []
  );
  const linePoints = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      pts.push([-1.2 + (i / 5) * 2.4, 0.2 + Math.sin(i * 0.8) * 0.3, 0.06]);
    }
    return pts;
  }, []);

  const monitors = [
    { position: [0, 1.05, -0.8], rotation: [0, 0, 0], scale: [3.8, 2.1, 0.12] },
    { position: [-2.2, 1, 0.2], rotation: [0, 0.35, 0], scale: [2.6, 1.6, 0.1] },
    { position: [2.2, 1, 0.2], rotation: [0, -0.35, 0], scale: [2.6, 1.6, 0.1] },
  ];

  const accessories = [
    { position: [-1.8, 0.05, 0.9], scale: [0.7, 0.08, 0.4], color: "#f97316" },
    { position: [1.6, 0.08, 0.95], scale: [1.0, 0.04, 0.7], color: "#111827" },
  ];

  const keyboardKeys = useMemo(() => {
    const keys = [];
    for (let x = 0; x < 12; x++) {
      for (let z = 0; z < 3; z++) {
        keys.push([-1 + x * 0.18, 0.1, 0.4 + z * 0.12]);
      }
    }
    return keys;
  }, []);

  return (
    <group ref={groupRef}>
      <group ref={rot}>
        {/* Desk */}
        <mesh position={[0, -0.15, 0]}>
          <boxGeometry args={[6.5, 0.2, 3.5]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0} roughness={0.8} />
        </mesh>

        {/* Monitors */}
        {monitors.map((monitor, idx) => {
          const texture = screenTextures[idx % screenTextures.length];
          return (
          <group key={idx} position={monitor.position} rotation={monitor.rotation}>
            <mesh position={[0, -monitor.scale[1] / 2 - 0.2, 0]}>
              <cylinderGeometry args={[0.08, 0.25, 0.4, 16]} />
              <meshStandardMaterial color="#cbd5f5" metalness={0.3} roughness={0.4} />
            </mesh>
            <mesh>
              <boxGeometry args={monitor.scale} />
              <meshStandardMaterial color="#0f172a" />
            </mesh>
            <mesh position={[0, 0, 0.01]}>
              <planeGeometry args={[monitor.scale[0] * 0.92, monitor.scale[1] * 0.85]} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
            {/* Widget bars */}
            <group position={[-monitor.scale[0] * 0.35, 0.2, 0.02]}>
              {chartBars.map((h, i) => (
                <mesh key={i} position={[i * 0.25, -0.3 + h / 2, 0]}>
                  <boxGeometry args={[0.18, h, 0.05]} />
                  <meshStandardMaterial color={["#38bdf8", "#f97316", "#16a34a"][i % 3]} />
                </mesh>
              ))}
            </group>
            {/* Line graph */}
            <Line points={linePoints} color="#fbbf24" lineWidth={2} />
          </group>
        )})}

        {/* Keyboard */}
        <mesh position={[0, 0.05, 0.4]}>
          <boxGeometry args={[3, 0.08, 0.9]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        {keyboardKeys.map((pos, idx) => (
          <mesh key={idx} position={pos}>
            <boxGeometry args={[0.16, 0.04, 0.1]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        ))}

        {/* Mouse */}
        <group position={[1.8, 0.12, 0.55]}>
          <mesh>
            <cylinderGeometry args={[0.12, 0.12, 0.4, 24]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.12, 24, 16]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.12, 24, 16]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        </group>

        {/* Accessories */}
        {accessories.map((item, idx) => (
          <mesh key={idx} position={item.position}>
            <boxGeometry args={item.scale} />
            <meshStandardMaterial color={item.color} />
          </mesh>
        ))}

        {/* Coffee cup */}
        <group position={[0.6, 0.18, 1.1]}>
          <mesh>
            <cylinderGeometry args={[0.14, 0.12, 0.28, 24]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[0.18, 0, 0]}>
            <torusGeometry args={[0.12, 0.02, 16, 24]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ---------- Componente Principal (transparente + zoom limitado) ----------
export default function Portfolio3DModelsAlt({ height = 580, width = 700 }) {
  const sceneRef = useRef();
  const getExportObject = () => sceneRef.current;
  const computedWidth = typeof width === "number" ? `${width}px` : width;

  return (
    <div className="relative rounded-[32px] overflow-hidden" style={{ height, width: computedWidth }}>
      <div className="absolute top-4 right-4 z-10 pointer-events-auto">
        <ExportButton getObject={getExportObject} fileName={`${sanitize("Workspace Desk")}.glb`} />
      </div>

      <Canvas
        camera={{ position: [8.5, 4.8, 9.5], fov: 38 }}
        dpr={[1, 2]}
        gl={{ alpha: true, preserveDrawingBuffer: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        {/* Luces */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 7, 3]} intensity={1.1} />
        <directionalLight position={[-5, -2, -3]} intensity={0.3} />
        <Environment preset="city" />

        {/* Escena Workspace */}
        <group>
          <CommandCenterScene groupRef={sceneRef} />
        </group>

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minDistance={6}
          maxDistance={9}
          zoomSpeed={0.5}
          target={[0, 0.6, 0]}
        />
      </Canvas>
    </div>
  );
}
