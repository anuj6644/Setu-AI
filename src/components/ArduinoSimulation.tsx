import React, { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

// Define the sensor data type matching Arduino JSON format
interface ArduinoSensorData {
  infrastructure_id: string;
  location: string;
  timestamp: number;
  status: 'normal' | 'warning' | 'critical';
  sensors: {
    strain: number;
    vibration: number;
    temperature: number;
    accelerometer: {
      x: number;
      y: number;
      z: number;
    };
  };
  system: {
    uptime: number;
    free_memory: number;
    battery_level: number;
  };
}

// Simple fallback bridge component using basic geometries
function FallbackBridge({ sensorData }: { sensorData: ArduinoSensorData }) {
  const groupRef = useRef<THREE.Group>(null!);

  // Animate vibration
  useFrame((state) => {
    if (groupRef.current) {
      // Simple vibration animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * sensorData.sensors.vibration * 0.05;
      
      // Slight rotation based on strain
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * (sensorData.sensors.strain / 5000) * 0.1;
    }
  });

  // Determine color based on strain
  const getColor = (): string => {
    if (sensorData.sensors.strain < 1000) return "#00ff00"; // Green
    if (sensorData.sensors.strain < 2000) return "#ffff00"; // Yellow
    return "#ff0000"; // Red
  };

  return (
    <group ref={groupRef}>
      {/* Bridge deck */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[6, 0.3, 1.5]} />
        <meshStandardMaterial color={getColor()} />
      </mesh>
      
      {/* Bridge supports */}
      <mesh position={[-2.5, -1.5, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      <mesh position={[2.5, -1.5, 0]}>
        <boxGeometry args={[0.3, 3, 0.3]} />
        <meshStandardMaterial color="#666666" />
      </mesh>
      
      {/* Bridge cables */}
      {[-1.5, -0.5, 0.5, 1.5].map((x, i) => (
        <mesh key={i} position={[x, 0.8, 0]} rotation={[0, 0, x * 0.1]}>
          <cylinderGeometry args={[0.01, 0.01, 1.6]} />
          <meshStandardMaterial color="#444444" />
        </mesh>
      ))}
      
      {/* Base platform */}
      <mesh position={[0, -3.2, 0]}>
        <boxGeometry args={[8, 0.4, 2]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  );
}

// CAD Model Bridge Component
function CADModelBridge({ sensorData }: { sensorData: ArduinoSensorData }) {
  const groupRef = useRef<THREE.Group>(null!);
  const [error, setError] = useState<string | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);

  // Load the GLB model
  let gltf;
  try {
    gltf = useGLTF("/bridge.glb");
  } catch (err) {
    console.error("Error loading GLB model:", err);
  }

  // Clone the scene to avoid modifying the original
  const [clonedScene, setClonedScene] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (gltf?.scene) {
      try {
        const cloned = gltf.scene.clone();
        setClonedScene(cloned);
        setModelLoaded(true);
        console.log("CAD model loaded successfully");
      } catch (err) {
        console.error("Error cloning model:", err);
        setError("Failed to process CAD model");
      }
    }
  }, [gltf]);

  // Animate vibration
  useFrame((state) => {
    if (groupRef.current) {
      // Vibration animation based on real sensor data
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * sensorData.sensors.vibration * 0.02;
      
      // Slight rotation based on strain (more subtle for CAD models)
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * (sensorData.sensors.strain / 8000) * 0.05;
      
      // Add accelerometer-based movement if available
      if (sensorData.sensors.accelerometer.x !== 0 || sensorData.sensors.accelerometer.y !== 0) {
        groupRef.current.rotation.x = sensorData.sensors.accelerometer.x * 0.01;
        groupRef.current.rotation.y = sensorData.sensors.accelerometer.y * 0.01;
      }
    }
  });

  // Update material colors based on strain
  useEffect(() => {
    if (!clonedScene) return;

    let color: THREE.Color;
    if (sensorData.sensors.strain < 1000) {
      color = new THREE.Color(0x00ff00); // Green
    } else if (sensorData.sensors.strain < 2000) {
      color = new THREE.Color(0xffff00); // Yellow
    } else {
      color = new THREE.Color(0xff0000); // Red
    }

    clonedScene.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Handle both single materials and material arrays
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        
        materials.forEach((material: any) => {
          if (material.emissive) {
            material.emissive.copy(color);
            material.emissiveIntensity = 0.1;
          }
          // Also tint the main color slightly
          if (material.color) {
            const originalColor = material.userData.originalColor || material.color.clone();
            if (!material.userData.originalColor) {
              material.userData.originalColor = originalColor.clone();
            }
            material.color.copy(originalColor).lerp(color, 0.2);
          }
        });
      }
    });
  }, [sensorData.sensors.strain, clonedScene]);

  // Show fallback if model failed to load
  if (error || !gltf || !clonedScene) {
    return <FallbackBridge sensorData={sensorData} />;
  }

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={0.1} position={[0, -2, 0]} />
    </group>
  );
}

// Model Loader with error boundaries
function ModelWithFallback({ sensorData }: { sensorData: ArduinoSensorData }) {
  const [useCAD, setUseCAD] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const handleError = () => {
    console.log("Switching to fallback bridge due to model loading error");
    setLoadError(true);
    setUseCAD(false);
  };

  if (loadError || !useCAD) {
    return <FallbackBridge sensorData={sensorData} />;
  }

  return (
    <Suspense fallback={<FallbackBridge sensorData={sensorData} />}>
      <ErrorBoundary onError={handleError}>
        <CADModelBridge sensorData={sensorData} />
      </ErrorBoundary>
    </Suspense>
  );
}

// Simple Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Model loading error:", error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // Will show fallback
    }

    return this.props.children;
  }
}

// Loading component
function LoadingSpinner() {
  return (
    <div style={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "white",
      fontSize: "18px",
      textAlign: "center" as const
    }}>
      <div style={{
        width: "40px",
        height: "40px",
        border: "4px solid rgba(255,255,255,0.3)",
        borderTop: "4px solid white",
        borderRadius: "50%",
        animation: "spin 1s linear infinite",
        margin: "0 auto 10px"
      }} />
      Loading Real Sensor Data...
    </div>
  );
}

// Main Arduino Simulation Component
const ArduinoSimulation: React.FC = () => {
  const [sensorData, setSensorData] = useState<ArduinoSensorData>({
    infrastructure_id: "BRIDGE_001",
    location: "Connecting to Node...",
    timestamp: Date.now(),
    status: "normal",
    sensors: {
      strain: 236,
      vibration: 122,
      temperature: 32,
      accelerometer: { x: 0, y: 0, z: 0 }
    },
    system: {
      uptime: 0,
      free_memory: 1500,
      battery_level: 95
    }
  });

  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [dataHistory, setDataHistory] = useState<ArduinoSensorData[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection to backend
  const initWebSocket = () => {
    try {
      const ws = new WebSocket('ws://localhost:8080');
      
      ws.onopen = () => {
        console.log('Connected to Arduino data stream');
        setConnectionStatus('connected');
        setError(null);
        
        // Clear polling fallback
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: ArduinoSensorData = JSON.parse(event.data);
          setSensorData(data);
          
          // Add to history (keep last 50 readings)
          setDataHistory(prev => {
            const newHistory = [...prev, data].slice(-50);
            return newHistory;
          });
          
          console.log('📊 Arduino Data:', {
            strain: data.sensors.strain,
            vibration: data.sensors.vibration,
            temperature: data.sensors.temperature,
            status: data.status
          });
          
        } catch (err) {
          console.error('Error parsing WebSocket data:', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected - attempting to reconnect...');
        setConnectionStatus('disconnected');
        
        // Start polling fallback
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(fetchData, 5000);
        }
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (wsRef.current?.readyState !== WebSocket.OPEN) {
            initWebSocket();
          }
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        
        // Start polling fallback
        if (!pollingIntervalRef.current) {
          pollingIntervalRef.current = setInterval(fetchData, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setError('Failed to connect to sensor data stream');
      setConnectionStatus('disconnected');
      
      // Start polling fallback
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(fetchData, 5000);
      }
    }
  };

  // Polling fallback for when WebSocket fails
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sensor-data');
      if (response.ok) {
        const data: ArduinoSensorData = await response.json();
        setSensorData(data);
        setConnectionStatus('connected');
        setError(null);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      setError('Unable to fetch sensor data');
      setConnectionStatus('disconnected');
    }
  };

  // Arduino control functions
  const sendArduinoCommand = async (command: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/arduino/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      });
      const result = await response.json();
      console.log('Arduino command result:', result);
      return result.success;
    } catch (error) {
      console.error('Error sending Arduino command:', error);
      return false;
    }
  };

  const calibrateStrainGauge = async () => {
    const success = await sendArduinoCommand('TARE');
    if (success) {
      alert('Strain gauge calibrated successfully!');
    } else {
      alert('Failed to calibrate strain gauge. Check Arduino connection.');
    }
  };

  // Initialize connection
  useEffect(() => {
    initWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Get status info
  const getStatusInfo = () => {
    const status = sensorData.status;
    if (status === "normal") return { text: "✅ Normal", color: "#00ff00" };
    if (status === "warning") return { text: "⚠️ Warning", color: "#ffff00" };
    return { text: "🚨 Critical", color: "#ff0000" };
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: "linear-gradient(135deg, #0f04f, #1a1a2f)",
      display: "flex",
      position: "relative" as const,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      {/* CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Connection Status */}
      <div style={{
        position: "absolute" as const,
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: connectionStatus === 'connected' ? "rgba(34, 197, 94, 0.8)" : 
                   connectionStatus === 'connecting' ? "rgba(245, 158, 11, 0.8)" : "rgba(239, 68, 68, 0.8)",
        color: "white",
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "12px",
        zIndex: 1000
      }}>
        🔗 IOT Node: {connectionStatus === 'connected' ? 'Connected' :
                   connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          position: "absolute" as const,
          top: "60px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 0, 0, 0.8)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          zIndex: 1000
        }}>
          {error}
        </div>
      )}

      {/* Arduino Controls */}
      {/* <div style={{
        position: "absolute" as const,
        top: "20px",
        right: "20px",
        zIndex: 1000,
        display: "flex",
        gap: "10px",
        flexWrap: "wrap" as const
      }}> */}
        {/* <button
          onClick={calibrateStrainGauge}
          style={{
            background: "#8B5CF6",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          📏 Calibrate
        </button>
        <button
          onClick={() => sendArduinoCommand('STATUS')}
          style={{
            background: "#06B6D4",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          📊 Status
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#F59E0B",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
          }}
        >
          🔄 Refresh
        </button>
      </div> */}

      {/* 3D Bridge Visualization */}
      <div style={{ width: "100%", height: "100%", position: "relative" as const }}>
        <Suspense fallback={<LoadingSpinner />}>
          <Canvas 
            camera={{ position: [10, 6, 10], fov: 50 }}
            gl={{ antialias: true, alpha: true }}
          >
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 10, 5]} intensity={1} />
            <directionalLight position={[-10, -10, -5]} intensity={0.3} />
            <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffffff" />
            
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              maxPolarAngle={Math.PI / 1.8}
              minDistance={3}
              maxDistance={25}
            />
            
            <ModelWithFallback sensorData={sensorData} />
            
            {/* No ground plane or grid - completely removed */}
          </Canvas>
        </Suspense>

        {/* HUD Overlay - Real Arduino Data */}
        <div style={{
          position: "absolute" as const,
          bottom: 20,
          left: 20,
          padding: "15px 20px",
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(10px)",
          borderRadius: "12px",
          color: "white",
          fontFamily: "monospace",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          minWidth: "320px"
        }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "16px", color: "#4CAF50" }}>
            🤖 Predictive Real Time Sensor Data
          </h3>
          <div style={{ fontSize: "12px", color: "#888", marginBottom: "10px" }}>
            {sensorData.location} • ID: {sensorData.infrastructure_id}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#aaa", fontSize: "12px" }}>Strain</p>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                {sensorData.sensors.strain.toFixed(1)} µε
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#aaa", fontSize: "12px" }}>Vibration</p>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                {sensorData.sensors.vibration.toFixed(2)} Hz
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#aaa", fontSize: "12px" }}>Temperature</p>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
                {sensorData.sensors.temperature.toFixed(1)} °C
              </p>
            </div>
            <div>
              <p style={{ margin: "0 0 4px 0", color: "#aaa", fontSize: "12px" }}>Status</p>
              <p style={{ margin: 0, fontSize: "14px", fontWeight: "bold", color: statusInfo.color }}>
                {statusInfo.text}
              </p>
            </div>
          </div>
          
          {/* System Info */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px", fontSize: "11px", color: "#888" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              {/* <span>Uptime: {Math.floor(sensorData.system.uptime / 60)}m</span>
              <span>Memory: {sensorData.system.free_memory}B</span> */}
              <span>Battery: {sensorData.system.battery_level}%</span>
            </div>
            <div style={{ marginTop: "5px" }}>
              Last Update: {new Date(sensorData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Data History Chart */}
        {/* {dataHistory.length > 5 && (
          <div style={{
            position: "absolute" as const,
            bottom: 20,
            right: 20,
            padding: "15px 20px",
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            color: "white",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            width: "300px"
          }}>
            <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#2196F3" }}>
              Live Data History
            </h4>
            <div style={{
              height: "60px",
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "4px",
              position: "relative",
              overflow: "hidden"
            }}>
              <svg width="100%" height="100%" style={{ position: "absolute" }}>
                <polyline
                  points={dataHistory.slice(-20).map((data, index) => 
                    `${(index / 19) * 100},${100 - (data.sensors.strain / 3000) * 100}`
                  ).join(" ")}
                  fill="none"
                  stroke={statusInfo.color}
                  strokeWidth="2"
                />
              </svg>
            </div>
            <p style={{ margin: "8px 0 0 0", fontSize: "11px", color: "#aaa" }}>
              Last 20 readings • Real-time updates
            </p>
          </div>
        )} */}

        {/* Title */}
        <div style={{
          position: "absolute" as const,
          top: 20,
          left: 20,
          color: "white",
          zIndex: 100
        }}>
          <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "300", letterSpacing: "1px" }}>
            🤖 BIM Simulation
          </h1>
          <p style={{ margin: "5px 0 0 0", fontSize: "14px", color: "#aaa" }}>
            Real-time data from integrated sensors
          </p>
        </div>
      </div>
    </div>
  );
};

// Preload the GLTF model
useGLTF.preload("/bridge.glb");

export default ArduinoSimulation;