import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useQuantum } from '../../context/QuantumContext';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Mic, 
  Activity, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Sliders, 
  Zap, 
  CheckCircle,
  HelpCircle,
  Radio,
  Share2
} from 'lucide-react';

interface VoiceStep {
  title: string;
  gate: string;
  theta: number; // degrees 0-180
  phi: number;   // degrees 0-360
  prob0: number; // 0-100
  prob1: number; // 0-100
  explanation: string;
  math: string;
}

interface DemoTopic {
  id: string;
  name: string;
  badge: string;
  description: string;
  steps: VoiceStep[];
}

const DEMO_TOPICS: DemoTopic[] = [
  {
    id: 'superposition',
    name: '1. Quantum Superposition (Hadamard H Gate)',
    badge: 'Fundamental',
    description: 'Learn how a qubit exists in multiple states simultaneously before measurement.',
    steps: [
      {
        title: 'Initial State |0⟩ (North Pole)',
        gate: 'INIT',
        theta: 0,
        phi: 0,
        prob0: 100,
        prob1: 0,
        explanation: 'We begin with a qubit initialized to the ground state |0⟩. On the 3D Bloch sphere, this state points straight up at the North Pole with 100% probability of measuring zero.',
        math: '|Ψ⟩ = 1|0⟩ + 0|1⟩'
      },
      {
        title: 'Hadamard Gate (H) Applied',
        gate: 'H',
        theta: 90,
        phi: 0,
        prob0: 50,
        prob1: 50,
        explanation: 'Applying the Hadamard gate rotates the state vector 90 degrees to the equator! The qubit is now in equal superposition of |0⟩ and |1⟩, meaning it is simultaneously 0 and 1.',
        math: '|Ψ⟩ = 1/√2 |0⟩ + 1/√2 |1⟩ = |+⟩'
      },
      {
        title: 'Quantum Measurement & Wavefunction Collapse',
        gate: 'MEASURE',
        theta: 0,
        phi: 0,
        prob0: 100,
        prob1: 0,
        explanation: 'When we measure the qubit, the superposition instantly collapses to a single definite state (|0⟩ or |1⟩) based on probability amplitudes.',
        math: 'P(|0⟩) = |α|² = 50%,  P(|1⟩) = |β|² = 50%'
      }
    ]
  },
  {
    id: 'entanglement',
    name: '2. Quantum Entanglement (Bell State |Φ+⟩)',
    badge: 'Multi-Qubit',
    description: 'See how two qubits become intrinsically bound so measuring one instantly dictates the other.',
    steps: [
      {
        title: 'Initial Independent State |00⟩',
        gate: 'INIT',
        theta: 0,
        phi: 0,
        prob0: 100,
        prob1: 0,
        explanation: 'Both Qubit 0 and Qubit 1 start in independent zero states |00⟩. There is no entanglement yet.',
        math: '|Ψ⟩ = |0⟩ ⊗ |0⟩ = |00⟩'
      },
      {
        title: 'Superposition on Qubit 0 (H Gate)',
        gate: 'H',
        theta: 90,
        phi: 0,
        prob0: 50,
        prob1: 50,
        explanation: 'We apply a Hadamard gate to Qubit 0, putting it into superposition while Qubit 1 remains in zero.',
        math: '|Ψ⟩ = 1/√2 (|00⟩ + |10⟩)'
      },
      {
        title: 'CNOT Gate (Entanglement Activated!)',
        gate: 'CNOT',
        theta: 90,
        phi: 45,
        prob0: 50,
        prob1: 50,
        explanation: 'Applying a Controlled-NOT gate flips Qubit 1 whenever Qubit 0 is one! The qubits are now entangled in the Bell state |Φ+⟩. Measuring Qubit 0 as zero immediately guarantees Qubit 1 is zero.',
        math: '|Φ+⟩ = 1/√2 (|00⟩ + |11⟩)'
      }
    ]
  },
  {
    id: 'bitflip',
    name: '3. Quantum Bit Flip (Pauli-X Gate)',
    badge: 'Single Qubit',
    description: 'Understand the quantum NOT gate that flips state |0⟩ to |1⟩.',
    steps: [
      {
        title: 'State |0⟩ (Ground State)',
        gate: 'INIT',
        theta: 0,
        phi: 0,
        prob0: 100,
        prob1: 0,
        explanation: 'The qubit starts at state zero (pointing straight up at the North Pole).',
        math: '|Ψ⟩ = |0⟩'
      },
      {
        title: 'Pauli-X Gate Execution (180° Rotation)',
        gate: 'X',
        theta: 180,
        phi: 0,
        prob0: 0,
        prob1: 100,
        explanation: 'Executing the Pauli-X gate rotates the state vector 180 degrees around the X-axis from the North Pole to the South Pole! The state is flipped to |1⟩ with 100% probability.',
        math: 'X|0⟩ = |1⟩'
      }
    ]
  },
  {
    id: 'phase',
    name: '4. Phase Rotation (Z, S, T Gates)',
    badge: 'Advanced',
    description: 'Explore relative phase changes along the equatorial plane of the Bloch sphere.',
    steps: [
      {
        title: 'Equatorial Superposition |+⟩',
        gate: 'H',
        theta: 90,
        phi: 0,
        prob0: 50,
        prob1: 50,
        explanation: 'The qubit is placed on the equator of the Bloch sphere with equal 50/50 probability amplitudes.',
        math: 'θ = 90°, φ = 0° (|X+⟩)'
      },
      {
        title: 'Phase S Gate (90° Rotation around Z-axis)',
        gate: 'S',
        theta: 90,
        phi: 90,
        prob0: 50,
        prob1: 50,
        explanation: 'Applying an S gate rotates the phase angle phi by 90 degrees around the Z-axis. Notice that measurement probabilities stay 50/50, but the complex phase has changed!',
        math: 'S|+⟩ = 1/√2 (|0⟩ + i|1⟩)'
      },
      {
        title: 'Phase T Gate (45° Rotation)',
        gate: 'T',
        theta: 90,
        phi: 135,
        prob0: 50,
        prob1: 50,
        explanation: 'The T gate rotates the phase by another 45 degrees, pointing the vector into the second quadrant of the equatorial plane.',
        math: 'T|Ψ⟩ = 1/√2 (|0⟩ + e^(iπ/4)|1⟩)'
      }
    ]
  }
];

export const InteractiveVoiceAnimationModal: React.FC = () => {
  const { 
    isVoiceAnimationModalOpen, 
    setIsVoiceAnimationModalOpen, 
    gates,
    qubitCount 
  } = useQuantum();

  const [activeTopicId, setActiveTopicId] = useState<string>('superposition');
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [voiceVolume, setVoiceVolume] = useState<number>(1.0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [subtitleText, setSubtitleText] = useState<string>('');
  const [highlightedWordIdx, setHighlightedWordIdx] = useState<number>(-1);
  const [manualTheta, setManualTheta] = useState<number>(90);
  const [manualPhi, setManualPhi] = useState<number>(0);
  const [isManualControl, setIsManualControl] = useState<boolean>(false);

  const mountRef = useRef<HTMLDivElement>(null);
  const audioCanvasRef = useRef<HTMLCanvasElement>(null);
  const vectorArrowRef = useRef<THREE.ArrowHelper | null>(null);
  const currentThetaRef = useRef<number>(0);
  const currentPhiRef = useRef<number>(0);
  const targetThetaRef = useRef<number>(0);
  const targetPhiRef = useRef<number>(0);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Active topic steps
  const activeTopic = DEMO_TOPICS.find(t => t.id === activeTopicId) || DEMO_TOPICS[0];
  const activeStep = activeTopic.steps[currentStepIdx] || activeTopic.steps[0];

  // Initialize Speech Synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        // Default to first English voice if found
        const engIdx = voices.findIndex(v => v.lang.startsWith('en'));
        if (engIdx !== -1) setSelectedVoiceIndex(engIdx);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Update target angles when step or manual sliders change
  useEffect(() => {
    if (isManualControl) {
      targetThetaRef.current = manualTheta;
      targetPhiRef.current = manualPhi;
    } else if (activeStep) {
      targetThetaRef.current = activeStep.theta;
      targetPhiRef.current = activeStep.phi;
    }
  }, [activeStep, manualTheta, manualPhi, isManualControl]);

  // Voice Narration handler
  const speakStepExplanation = useCallback((textToSpeak: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel(); // Stop current speech
    setSubtitleText(textToSpeak);
    setHighlightedWordIdx(-1);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    if (availableVoices.length > 0 && availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }
    utterance.rate = speechRate;
    utterance.volume = voiceVolume;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onpause = () => {
      setIsPaused(true);
    };

    utterance.onresume = () => {
      setIsPaused(false);
    };

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        const words = textToSpeak.slice(0, event.charIndex).trim().split(/\s+/);
        setHighlightedWordIdx(words.length - 1);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setHighlightedWordIdx(-1);

      if (autoAdvance && currentStepIdx < activeTopic.steps.length - 1) {
        setTimeout(() => {
          setCurrentStepIdx(prev => prev + 1);
        }, 1200);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
  }, [availableVoices, selectedVoiceIndex, speechRate, voiceVolume, autoAdvance, currentStepIdx, activeTopic.steps.length]);

  // Trigger speech when step changes
  useEffect(() => {
    if (isVoiceAnimationModalOpen && activeStep) {
      speakStepExplanation(activeStep.explanation);
    }
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [currentStepIdx, activeTopicId, isVoiceAnimationModalOpen, speakStepExplanation]);

  // Audio Equalizer Canvas Animation
  useEffect(() => {
    const canvas = audioCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let eqFrameId: number;
    const barCount = 24;

    const renderEq = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = width / barCount - 2;

      for (let i = 0; i < barCount; i++) {
        const barHeight = isSpeaking && !isPaused
          ? Math.random() * (height * 0.8) + (height * 0.15)
          : 4;

        const x = i * (barWidth + 2);
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, '#2563eb');
        gradient.addColorStop(1, '#06b6d4');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      eqFrameId = requestAnimationFrame(renderEq);
    };

    renderEq();
    return () => cancelAnimationFrame(eqFrameId);
  }, [isSpeaking, isPaused]);

  // 3D Three.js Bloch Sphere Scene Setup
  useEffect(() => {
    if (!mountRef.current || !isVoiceAnimationModalOpen) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.4, 1.8, 2.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // 1. Transparent Wireframe Sphere
    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphereMesh);

    // 2. Equatorial & Meridian Rings
    const ringGeo = new THREE.RingGeometry(0.99, 1.01, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });

    const equator = new THREE.Mesh(ringGeo, ringMat);
    equator.rotation.x = Math.PI / 2;
    scene.add(equator);

    const meridian = new THREE.Mesh(ringGeo, ringMat);
    scene.add(meridian);

    // 3. Axes
    const axesHelper = new THREE.AxesHelper(1.3);
    scene.add(axesHelper);

    // 4. Glowing State Vector Arrow
    const dir = new THREE.Vector3(0, 1, 0);
    const origin = new THREE.Vector3(0, 0, 0);
    const arrowHelper = new THREE.ArrowHelper(dir, origin, 1.0, 0x2563eb, 0.2, 0.1);
    scene.add(arrowHelper);
    vectorArrowRef.current = arrowHelper;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Animation Loop with smooth lerp interpolation
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Lerp theta & phi towards target
      const lerpFactor = 0.08;
      currentThetaRef.current += (targetThetaRef.current - currentThetaRef.current) * lerpFactor;
      currentPhiRef.current += (targetPhiRef.current - currentPhiRef.current) * lerpFactor;

      const thetaRad = (currentThetaRef.current * Math.PI) / 180;
      const phiRad = (currentPhiRef.current * Math.PI) / 180;

      // Spherical coordinates conversion to Cartesian (Bloch convention)
      const x = Math.sin(thetaRad) * Math.cos(phiRad);
      const y = Math.sin(thetaRad) * Math.sin(phiRad);
      const z = Math.cos(thetaRad);

      if (vectorArrowRef.current) {
        const newDir = new THREE.Vector3(x, z, y).normalize();
        vectorArrowRef.current.setDirection(newDir);
      }

      sphereMesh.rotation.y += 0.003;
      renderer.render(scene, camera);
    };

    animate();

    const domElement = mountRef.current;
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (domElement && domElement.contains(renderer.domElement)) {
        domElement.removeChild(renderer.domElement);
      }
    };
  }, [isVoiceAnimationModalOpen]);

  if (!isVoiceAnimationModalOpen) return null;

  const handlePlayPause = () => {
    if (!synthRef.current) return;

    if (isSpeaking && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    } else if (isSpeaking && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    } else {
      speakStepExplanation(activeStep.explanation);
    }
  };

  const handleRestart = () => {
    speakStepExplanation(activeStep.explanation);
  };

  const wordsList = subtitleText.split(/\s+/);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-slate-900 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Mic className="w-5 h-5 text-blue-600 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-bold text-base tracking-tight text-slate-900">Interactive Quantum Voice & 3D Animation Studio</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 font-mono">
                  LIVE AI VOICE & BLOCH SPHERE
                </span>
              </div>
              <p className="text-xs text-slate-500">Real-Time Text-to-Speech Physics Narration with 3D State Vector Rotations</p>
            </div>
          </div>

          <button
            onClick={() => {
              if (synthRef.current) synthRef.current.cancel();
              setIsVoiceAnimationModalOpen(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Grid Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Control & Topic Selector Sidebar */}
          <div className="w-[320px] bg-slate-50 border-r border-slate-200 p-4 flex flex-col space-y-4 overflow-y-auto">
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Select Demonstration Topic
              </label>
              <div className="space-y-1.5">
                {DEMO_TOPICS.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setActiveTopicId(topic.id);
                      setCurrentStepIdx(0);
                      setIsManualControl(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all ${
                      activeTopicId === topic.id
                        ? 'bg-blue-600 text-white border-blue-700 shadow-md font-bold'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold truncate">{topic.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        activeTopicId === topic.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-blue-600'
                      }`}>
                        {topic.badge}
                      </span>
                    </div>
                    <p className={`text-[11px] line-clamp-2 ${activeTopicId === topic.id ? 'text-blue-100' : 'text-slate-500'}`}>
                      {topic.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Voice Settings Box */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-3 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Volume2 className="w-4 h-4 text-blue-600" />
                  <span>Speech Voice & Audio Settings</span>
                </span>
              </div>

              {/* Voice Selector */}
              <div>
                <label className="text-[11px] text-slate-600 font-semibold block mb-1">Voice Selection</label>
                <select
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {availableVoices.length === 0 && <option value={0}>System Default Voice</option>}
                  {availableVoices.map((voice, idx) => (
                    <option key={idx} value={idx}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speech Speed Rate Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                  <span>Narration Speed</span>
                  <span className="text-blue-600 font-mono font-bold">{speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.75"
                  max="1.5"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Auto Advance Step Toggle */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-medium">Auto-Play Next Step</span>
                <input
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Manual Vector Manipulation Controls */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <span>Manual Vector Drag Mode</span>
                </span>
                <input
                  type="checkbox"
                  checked={isManualControl}
                  onChange={(e) => setIsManualControl(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {isManualControl && (
                <div className="space-y-2 text-[11px] text-slate-600 font-mono pt-1">
                  <div>
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Theta (θ) Polar Angle:</span>
                      <span className="text-blue-600">{manualTheta}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={manualTheta}
                      onChange={(e) => setManualTheta(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>Phi (φ) Azimuthal Angle:</span>
                      <span className="text-indigo-600">{manualPhi}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={manualPhi}
                      onChange={(e) => setManualPhi(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Main Center Panel: 3D Sphere & Voice Equalizer */}
          <div className="flex-1 flex flex-col bg-slate-900 text-white overflow-hidden relative">
            
            {/* Step Banner Header */}
            <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10 backdrop-blur-md">
              <div>
                <div className="text-[11px] text-cyan-400 font-mono font-bold uppercase tracking-wider">
                  Step {currentStepIdx + 1} of {activeTopic.steps.length}: {activeStep.gate} Gate
                </div>
                <h3 className="text-sm font-bold text-white tracking-tight">{activeStep.title}</h3>
              </div>

              {/* Step Navigation Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                  disabled={currentStepIdx === 0}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 text-xs font-semibold flex items-center space-x-1 border border-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Prev</span>
                </button>

                <button
                  onClick={() => setCurrentStepIdx(prev => Math.min(activeTopic.steps.length - 1, prev + 1))}
                  disabled={currentStepIdx === activeTopic.steps.length - 1}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 text-xs font-bold flex items-center space-x-1 shadow-md"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3D Bloch Sphere Viewport */}
            <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
              <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

              {/* Live Quantum Physics Math Badge Overlay */}
              <div className="absolute top-4 left-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md font-mono text-xs space-y-1">
                <div className="text-cyan-400 font-bold text-sm">{activeStep.math}</div>
                <div className="text-slate-300 text-[11px]">
                  State Vector Angles: θ = <span className="text-blue-400 font-bold">{targetThetaRef.current.toFixed(1)}°</span>, φ = <span className="text-indigo-400 font-bold">{targetPhiRef.current.toFixed(1)}°</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] pt-1">
                  <span className="text-emerald-400">P(|0⟩): {activeStep.prob0}%</span>
                  <span className="text-amber-400">P(|1⟩): {activeStep.prob1}%</span>
                </div>
              </div>

              {/* Animated Equalizer Visualizer Overlay */}
              <div className="absolute top-4 right-4 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 shadow-xl backdrop-blur-md flex flex-col items-center">
                <span className="text-[10px] font-mono text-slate-400 mb-1 flex items-center space-x-1">
                  <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>{isSpeaking ? 'Voice Active' : 'Voice Idle'}</span>
                </span>
                <canvas ref={audioCanvasRef} width={100} height={30} className="rounded" />
              </div>
            </div>

            {/* Subtitles & Dynamic Voice Transcript Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Radio className={`w-4 h-4 ${isSpeaking ? 'text-cyan-400 animate-ping' : 'text-slate-500'}`} />
                  <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Live AI Voice Subtitles</span>
                </div>

                {/* Audio Play/Pause/Restart Controls */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleRestart}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                    title="Replay Voice Narration"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold text-xs flex items-center space-x-1.5 shadow-md active:scale-95"
                  >
                    {isSpeaking && !isPaused ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span>{isSpeaking && !isPaused ? 'Pause Voice' : 'Play Voice Narration'}</span>
                  </button>
                </div>
              </div>

              {/* Subtitle Words Box with Real-Time Word Highlighting */}
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-sm leading-relaxed min-h-[60px] flex items-center">
                <p className="text-slate-300">
                  {wordsList.map((word, idx) => (
                    <span
                      key={idx}
                      className={`transition-all duration-150 rounded px-1 py-0.5 inline-block ${
                        idx === highlightedWordIdx
                          ? 'bg-cyan-500 text-slate-950 font-bold scale-105 shadow-sm'
                          : idx < highlightedWordIdx
                          ? 'text-white font-medium'
                          : 'text-slate-400'
                      }`}
                    >
                      {word}{' '}
                    </span>
                  ))}
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
