// Portfolio3DModelsAlt_transparent_clean.jsx
// Fondo 100% transparente + zoom limitado + sin etiquetas dentro de la escena
// Uso:
//   import Portfolio3DModelsAlt from './Portfolio3DModelsAlt_transparent_clean'
//   <Portfolio3DModelsAlt height={360} />

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Float, Environment, Line, Text } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFExporter } from "three-stdlib";

// ---------- Utilidades ----------
function useRotY(speed = 0.2) {
  const ref = useRef();
  useFrame((_, dt) => ref.current && (ref.current.rotation.y += dt * speed));
  return ref;
}

function ExportButton({ getObject, fileName = "model.glb" }) {
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
    <button onClick={onExport} className="px-3 py-1 rounded-xl bg-black/70 text-white text-sm hover:bg-black/80 border border-white/10">
      Exportar GLB
    </button>
  );
}

const sanitize = (s) => s.normalize('NFKD').replace(/[\/\\:*?"<>|]/g, '-').replace(/\s+/g, '_').toLowerCase();

// ---------- Escena 1: Laptop (Dev) ----------
function LaptopScene({ groupRef }) {
  const rot = useRotY(0.15);
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
  const rot = useRotY(0.1);
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
  const rot = useRotY(0.06);
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
  const rot = useRotY(0.2);
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

// ---------- Componente Principal (transparente + zoom limitado) ----------
export default function Portfolio3DModelsAlt({ height = 420, initialMode = 'laptop', logoText }) {
  const [mode, setMode] = useState(initialMode); // laptop | donut | scatter | logo
  const currentGroup = useRef();
  const getExportObject = () => currentGroup.current;

  const title = {
    laptop: 'Laptop Dev',
    donut: 'Donut KPI',
    scatter: 'Scatter Clusters',
    logo: 'Logo Text'
  }[mode];

  return (
    <div className="w-full relative" style={{ height, background: 'transparent' }}>
      {/* Controles (si molestan, puedes ocultarlos con CSS externo) */}
      <div className="absolute top-3 left-3 z-10 flex gap-2 flex-wrap pointer-events-auto">
        <button onClick={() => setMode('laptop')} className={`px-3 py-1 rounded-xl text-sm border ${mode === 'laptop' ? 'bg-blue-500 text-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/15'}`}>Laptop</button>
        <button onClick={() => setMode('donut')} className={`px-3 py-1 rounded-xl text-sm border ${mode === 'donut' ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/15'}`}>Donut</button>
        <button onClick={() => setMode('scatter')} className={`px-3 py-1 rounded-xl text-sm border ${mode === 'scatter' ? 'bg-violet-500 text-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/15'}`}>Scatter</button>
        <button onClick={() => setMode('logo')} className={`px-3 py-1 rounded-xl text-sm border ${mode === 'logo' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white border-white/10 hover:bg-white/15'}`}>Logo</button>
        <ExportButton getObject={getExportObject} fileName={`${sanitize(title)}.glb`} />
      </div>

      <Canvas camera={{ position: [5, 3.8, 6], fov: 45 }} dpr={[1, 2]} gl={{ alpha: true }} style={{ background: 'transparent' }}>
        {/* Luces */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 7, 3]} intensity={1.1} />
        <directionalLight position={[-5, -2, -3]} intensity={0.3} />
        <Environment preset="city" />

        {/* Escena actual */}
        <group ref={currentGroup}>
          {mode === 'laptop' && <LaptopScene groupRef={currentGroup} />}
          {mode === 'donut' && <DonutScene groupRef={currentGroup} />}
          {mode === 'scatter' && <ScatterScene groupRef={currentGroup} />}
          {mode === 'logo' && <LogoScene groupRef={currentGroup} text={logoText} />}
        </group>

        {/* Zoom súper controlado + sin pan para evitar perder encuadre */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.08}
          enablePan={false}
          minDistance={5}
          maxDistance={7}
          zoomSpeed={0.5}
          target={[0, 0.8, 0]}
        />
      </Canvas>
    </div>
  );
}
