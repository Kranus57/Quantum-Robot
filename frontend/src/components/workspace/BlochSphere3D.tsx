import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useQuantum } from '../../context/QuantumContext';
import { calculateBlochVector } from '../../utils/quantumSimulator';
import { Globe } from 'lucide-react';

interface BlochSphere3DProps {
  className?: string;
}

export const BlochSphere3D: React.FC<BlochSphere3DProps> = ({ className = 'h-64' }) => {
  const { simulationResult, selectedQubit, setSelectedQubit, qubitCount } = useQuantum();
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const vectorArrowRef = useRef<THREE.ArrowHelper | null>(null);

  const stateVec = simulationResult?.stateVector || [{ real: 1, imag: 0 }];
  const bloch = calculateBlochVector(stateVec, selectedQubit, qubitCount);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 300;
    const height = mountRef.current.clientHeight || 250;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.4, 1.8, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    // 1. Light Sphere Mesh
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphereMesh);

    // 2. Equatorial & Polar Circles
    const ringGeo = new THREE.RingGeometry(0.99, 1.01, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, transparent: true, opacity: 0.5 });

    const equator = new THREE.Mesh(ringGeo, ringMat);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    const meridian = new THREE.Mesh(ringGeo, ringMat);
    scene.add(meridian);

    // 3. Axes
    const axesHelper = new THREE.AxesHelper(1.3);
    scene.add(axesHelper);

    // 4. State Vector Arrow |Ψ⟩ - Royal Blue/Indigo Arrow
    const dir = new THREE.Vector3(bloch.x, bloch.z, bloch.y).normalize();
    const origin = new THREE.Vector3(0, 0, 0);
    const length = 1.0;
    const hex = 0x2563eb;
    const arrowHelper = new THREE.ArrowHelper(dir, origin, length, hex, 0.2, 0.1);
    scene.add(arrowHelper);
    vectorArrowRef.current = arrowHelper;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      sphereMesh.rotation.y += deltaX * 0.01;
      sphereMesh.rotation.x += deltaY * 0.01;
      equator.rotation.y += deltaX * 0.01;
      meridian.rotation.y += deltaX * 0.01;
      if (vectorArrowRef.current) {
        vectorArrowRef.current.rotation.y += deltaX * 0.01;
      }

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElement = mountRef.current;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      sphereMesh.rotation.y += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (domElement.contains(renderer.domElement)) {
        domElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    if (vectorArrowRef.current) {
      const dir = new THREE.Vector3(bloch.x, bloch.z, bloch.y).normalize();
      vectorArrowRef.current.setDirection(dir);
    }
  }, [bloch.x, bloch.y, bloch.z]);

  return (
    <div className={`${className} flex flex-col bg-white border-b border-slate-200 overflow-hidden relative shadow-sm`}>
      {/* Header Bar */}
      <div className="p-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-600">
          <Globe className="w-4 h-4" />
          <span>3D Bloch Sphere Visualizer</span>
        </div>

        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-600">Target Qubit:</span>
          <select
            value={selectedQubit}
            onChange={(e) => setSelectedQubit(Number(e.target.value))}
            className="bg-white border border-slate-200 text-xs text-blue-600 font-mono font-bold rounded px-2 py-0.5 focus:outline-none shadow-sm"
          >
            {Array.from({ length: qubitCount }, (_, i) => (
              <option key={i} value={i}>q[{i}]</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 relative cursor-grab active:cursor-grabbing bg-slate-50/50">
        <div ref={mountRef} className="w-full h-full" />

        <div className="absolute top-2 left-3 pointer-events-none text-[10px] font-mono space-y-0.5 bg-white/90 p-2 rounded border border-slate-200 shadow-sm backdrop-blur-sm">
          <div className="text-blue-600 font-bold">|Ψ⟩ = α|0⟩ + β|1⟩</div>
          <div className="text-slate-700">X: {bloch.x}</div>
          <div className="text-slate-700">Y: {bloch.y}</div>
          <div className="text-slate-700">Z: {bloch.z}</div>
          <div className="text-indigo-600 font-bold">θ: {(bloch.theta * (180 / Math.PI)).toFixed(1)}°</div>
          <div className="text-indigo-600 font-bold">φ: {(bloch.phi * (180 / Math.PI)).toFixed(1)}°</div>
        </div>

        <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] font-mono flex space-x-2 bg-white/90 px-2 py-1 rounded border border-slate-200 shadow-sm">
          <span className="text-blue-600 font-bold">Top: |0⟩</span>
          <span className="text-indigo-600 font-bold">Bottom: |1⟩</span>
          <span className="text-purple-600 font-bold">Front: |+⟩</span>
        </div>
      </div>
    </div>
  );
};
