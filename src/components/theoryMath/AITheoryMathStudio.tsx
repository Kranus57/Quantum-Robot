import React, { useState, useEffect, useRef } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { AI_TEACHING_AGENTS, THEORY_TOPICS, AIAgent, TheoryTopic } from '../../data/theoryMathData';
import { 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  Send, 
  Bot, 
  GraduationCap, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Sliders, 
  Maximize2, 
  RotateCcw, 
  Play, 
  Cpu, 
  Globe, 
  Sigma, 
  Brackets,
  User,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | AIAgent['id'];
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  equations?: string[];
}

export const AITheoryMathStudio: React.FC = () => {
  const { userBackground, setActiveView } = useQuantum();

  const [activeTopic, setActiveTopic] = useState<TheoryTopic>(THEORY_TOPICS[0]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(AI_TEACHING_AGENTS[0]);
  const [theta, setTheta] = useState<number>(THEORY_TOPICS[0].initialTheta);
  const [phi, setPhi] = useState<number>(THEORY_TOPICS[0].initialPhi);
  
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isAgentThinking, setIsAgentThinking] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize initial agent welcome message when topic or agent changes
  useEffect(() => {
    setTheta(activeTopic.initialTheta);
    setPhi(activeTopic.initialPhi);

    const initialMsg: ChatMessage = {
      id: 'msg_welcome_' + Date.now(),
      sender: selectedAgent.id,
      senderName: selectedAgent.name,
      senderRole: selectedAgent.role,
      text: `### ${selectedAgent.name} • ${activeTopic.title}\n\n${selectedAgent.greeting}\n\n**Topic Overview**: ${activeTopic.summary}\n\n**Dirac Notation**: $${activeTopic.diracForm}$\n\nHow can I help you master the mathematics or physical intuition of this concept today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      equations: activeTopic.presetEquations
    };

    setChatMessages([initialMsg]);
  }, [activeTopic.id, selectedAgent.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAgentThinking]);

  // Derived mathematical values
  const thetaRad = (theta * Math.PI) / 180;
  const phiRad = (phi * Math.PI) / 180;

  const alphaReal = Math.cos(thetaRad / 2);
  const alphaImag = 0;
  const betaReal = Math.sin(thetaRad / 2) * Math.cos(phiRad);
  const betaImag = Math.sin(thetaRad / 2) * Math.sin(phiRad);

  const prob0 = Math.pow(alphaReal, 2) + Math.pow(alphaImag, 2);
  const prob1 = Math.pow(betaReal, 2) + Math.pow(betaImag, 2);

  const rho00 = prob0;
  const rho11 = prob1;
  const rho01Real = alphaReal * betaReal + alphaImag * betaImag;
  const rho01Imag = alphaImag * betaReal - alphaReal * betaImag;

  // Render Argand Complex Vector Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.35;

    ctx.clearRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    // Concentric Unit Circles
    ctx.beginPath();
    ctx.arc(cx, cy, scale, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, scale * 0.5, 0, 2 * Math.PI);
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Axes
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - scale - 20, cy);
    ctx.lineTo(cx + scale + 20, cy);
    ctx.moveTo(cx, cy - scale - 20);
    ctx.lineTo(cx, cy + scale + 20);
    ctx.stroke();

    // Axis Labels
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.fillText('Re(β)', cx + scale + 5, cy - 5);
    ctx.fillText('Im(β)', cx + 5, cy - scale - 8);

    // Alpha vector (Real component along Re axis)
    const alphaX = cx + alphaReal * scale;
    const alphaY = cy;

    ctx.strokeStyle = '#2563eb'; // Blue
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(alphaX, alphaY);
    ctx.stroke();

    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(alphaX, alphaY, 5, 0, 2 * Math.PI);
    ctx.fill();

    // Beta vector (Complex amplitude β = e^(iφ) sin(θ/2))
    const betaX = cx + betaReal * scale;
    const betaY = cy - betaImag * scale; // Y inverted in canvas

    ctx.strokeStyle = '#8b5cf6'; // Purple
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(betaX, betaY);
    ctx.stroke();

    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(betaX, betaY, 6, 0, 2 * Math.PI);
    ctx.fill();

    // Phase Arc
    if (Math.abs(betaReal) > 0.01 || Math.abs(betaImag) > 0.01) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 0.25, 0, -phiRad, true);
      ctx.stroke();
    }

  }, [theta, phi, alphaReal, betaReal, betaImag]);

  const handleSendMessage = (textToSend?: string) => {
    const prompt = textToSend || inputPrompt;
    if (!prompt.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg_user_' + Date.now(),
      sender: 'user',
      senderName: 'You',
      senderRole: 'Learner',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputPrompt('');
    setIsAgentThinking(true);

    setTimeout(() => {
      let replyText = '';
      let eqList: string[] = [];

      if (selectedAgent.id === 'dr_vector') {
        replyText = `### 🎓 Dr. Q. Vector's Physical Intuition\n\nWhen we adjust $\\theta = ${theta}^\\circ$ and $\\phi = ${phi}^\\circ$, we are rotating the state vector on the Bloch sphere!\n\n- **Superposition Ratio**: The probability of measuring $|0\\rangle$ is $P(0) = |\\alpha|^2 = ${(prob0 * 100).toFixed(1)}\\%$.\n- **Quantum Interference Phase**: Relative phase $\\phi = ${phi}^\\circ$ creates non-classical interference patterns when passed through Hadamard logic gates.\n\nThink of this like tuning a radio frequency: $\\theta$ sets the signal balance between channel 0 and 1, while $\\phi$ aligns the phase wave timing!`;
        eqList = [`P(0) = cos²(${theta/2}°) = ${(prob0).toFixed(3)}`, `P(1) = sin²(${theta/2}°) = ${(prob1).toFixed(3)}`];
      } else if (selectedAgent.id === 'agent_hilbert') {
        replyText = `### 📐 Agent Hilbert's Formal Derivation\n\nLet us compute the formal inner product and density matrix representation for current state $|\\psi\\rangle$:\n\n1. **Bra Vector**: $\\langle\\psi| = [${alphaReal.toFixed(3)}, ${betaReal.toFixed(3)} - ${betaImag.toFixed(3)}i]$\n2. **Normalization Proof**: $\\langle\\psi|\\psi\\rangle = |\\alpha|^2 + |\\beta|^2 = ${(prob0).toFixed(3)} + ${(prob1).toFixed(3)} = 1.000$\n3. **Density Matrix $\\rho = |\\psi\\rangle\\langle\\psi|$**:\n\n$$\\rho = \\begin{pmatrix} ${(rho00).toFixed(3)} & ${(rho01Real).toFixed(3)} - ${(rho01Imag).toFixed(3)}i \\\\ ${(rho01Real).toFixed(3)} + ${(rho01Imag).toFixed(3)}i & ${(rho11).toFixed(3)} \\end{pmatrix}$$\n\nNotice that $\\text{Tr}(\\rho) = 1.000$ and $\\rho = \\rho^\\dagger$ (Hermitian), confirming a valid pure state!`;
        eqList = [`Tr(ρ) = 1.00`, `Tr(ρ²) = 1.00 (Pure State)`];
      } else if (selectedAgent.id === 'agent_spectrum') {
        replyText = `### 🎨 Agent Spectrum's Geometric Breakdown\n\nInspect the live Argand canvas on the right panel:\n\n- The blue vector represents the real amplitude $\\alpha = ${alphaReal.toFixed(3)}$ along $|0\\rangle$.\n- The purple vector represents complex amplitude $\\beta = ${betaReal.toFixed(3)} + ${betaImag.toFixed(3)}i$ at phase angle $\\phi = ${phi}^\\circ$.\n- Cartesian Bloch sphere coordinates: $x = ${(Math.sin(thetaRad)*Math.cos(phiRad)).toFixed(3)}$, $y = ${(Math.sin(thetaRad)*Math.sin(phiRad)).toFixed(3)}$, $z = ${(Math.cos(thetaRad)).toFixed(3)}$.`;
        eqList = [`Bloch (x, y, z) = (${(Math.sin(thetaRad)*Math.cos(phiRad)).toFixed(2)}, ${(Math.sin(thetaRad)*Math.sin(phiRad)).toFixed(2)}, ${(Math.cos(thetaRad)).toFixed(2)})`];
      } else {
        // Socratic Agent
        replyText = `### 🧠 Agent Socratic's Guided Quiz Challenge\n\nGreat question! Let me challenge your understanding:\n\nIf we apply a **Hadamard (H) Gate** to current state $|\\psi\\rangle$ with $\\theta = ${theta}^\\circ$:\n\n> **Question**: What will be the new coefficient along $|0\\rangle$ if $\\theta = 90^\\circ$ and $\\phi = 0^\\circ$? \n\n*Hint: Use $H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$. Try calculating $H |+\\rangle$!*`;
        eqList = ['H |+⟩ = |0⟩', 'H |-⟩ = |1⟩'];
      }

      const agentMsg: ChatMessage = {
        id: 'msg_agent_' + Date.now(),
        sender: selectedAgent.id,
        senderName: selectedAgent.name,
        senderRole: selectedAgent.role,
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        equations: eqList
      };

      setChatMessages(prev => [...prev, agentMsg]);
      setIsAgentThinking(false);
    }, 700);
  };

  const applyPresetState = (presetName: string) => {
    if (presetName === '|0>') {
      setTheta(0);
      setPhi(0);
    } else if (presetName === '|1>') {
      setTheta(180);
      setPhi(0);
    } else if (presetName === '|+>') {
      setTheta(90);
      setPhi(0);
    } else if (presetName === '|->') {
      setTheta(90);
      setPhi(180);
    } else if (presetName === '|i+>') {
      setTheta(90);
      setPhi(90);
    } else if (presetName === '|i->') {
      setTheta(90);
      setPhi(270);
    }
  };

  return (
    <div className="h-full bg-slate-50 flex flex-col overflow-hidden select-none">
      {/* Top Header: Topic Selector & Agent Studio Status */}
      <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between flex-shrink-0 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20">
            <BrainCircuit className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-tight text-white uppercase font-mono">
                AI THEORY & ABSTRACT MATH STUDIO
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 font-bold">
                MULTI-AGENT LAB
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Dirac Bra-Ket Algebra, Complex Vectors & Interactive Visualizer
            </p>
          </div>
        </div>

        {/* Topic Selector */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
            <select
              value={activeTopic.id}
              onChange={(e) => {
                const found = THEORY_TOPICS.find(t => t.id === e.target.value);
                if (found) setActiveTopic(found);
              }}
              className="bg-transparent text-xs text-white rounded-lg px-2 py-1 focus:outline-none font-semibold cursor-pointer"
            >
              {THEORY_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id} className="bg-slate-900 text-white">
                  {topic.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setActiveView('workspace')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <span>Lab Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: AI Multi-Agent Workshop Chat Stream */}
        <div className="w-[520px] border-r border-slate-200 bg-white flex flex-col overflow-hidden">
          {/* Agent Team Switcher Tabs */}
          <div className="p-2.5 bg-slate-50 border-b border-slate-200">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>Active AI Teaching Agent:</span>
              <span className="text-[10px] text-blue-600 font-mono">4 Specialized Agents</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              {AI_TEACHING_AGENTS.map((agent) => {
                const isActive = selectedAgent.id === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`p-2 rounded-xl border text-left transition-all flex items-center space-x-2 ${
                      isActive
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg ${agent.avatarBg} text-white flex items-center justify-center flex-shrink-0 font-bold text-xs shadow-sm`}>
                      {agent.id === 'dr_vector' ? '🎓' : agent.id === 'agent_hilbert' ? '📐' : agent.id === 'agent_spectrum' ? '🎨' : '🧠'}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold truncate leading-tight">{agent.name}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                        {agent.role.split(' ')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Stream Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm ${
                    isUser ? 'bg-slate-800' : selectedAgent.avatarBg
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between border-b border-slate-200/40 pb-1.5">
                      <span className="font-bold text-[11px]">{msg.senderName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                    </div>

                    <div className="space-y-2 whitespace-pre-line text-xs">
                      {msg.text.split('\n\n').map((paragraph, pIdx) => {
                        if (paragraph.startsWith('### ')) {
                          return <h4 key={pIdx} className="font-bold text-sm text-blue-700">{paragraph.replace('### ', '')}</h4>;
                        }
                        if (paragraph.includes('$$')) {
                          const formula = paragraph.replace(/\$\$/g, '');
                          return (
                            <div key={pIdx} className="my-2 p-2.5 rounded-lg bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800 text-center shadow-inner">
                              {formula}
                            </div>
                          );
                        }
                        return <p key={pIdx}>{paragraph}</p>;
                      })}
                    </div>

                    {msg.equations && msg.equations.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1">
                        {msg.equations.map((eq, eqIdx) => (
                          <span key={eqIdx} className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono">
                            {eq}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isAgentThinking && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 p-2 bg-white rounded-xl border border-slate-200 max-w-[200px] shadow-sm">
                <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
                <span>{selectedAgent.name} is deriving math...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Prompt Suggestions Bar */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 space-y-1.5">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Suggested Agent Prompts:</div>
            <div className="flex space-x-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => handleSendMessage(`Explain physical intuition for ${activeTopic.title}`)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all shadow-sm"
              >
                🎓 Physical Intuition
              </button>
              <button
                onClick={() => handleSendMessage(`Derive the mathematical proof for ${activeTopic.title}`)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-indigo-50 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all shadow-sm"
              >
                📐 Formal Proof Derivation
              </button>
              <button
                onClick={() => handleSendMessage(`Give me a Socratic Quiz question on ${activeTopic.title}`)}
                className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 text-slate-700 text-[11px] font-semibold transition-all shadow-sm"
              >
                🧠 Socratic Quiz Question
              </button>
            </div>

            {/* Input Box */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Ask ${selectedAgent.name} about math or theory...`}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500 font-medium shadow-sm"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Abstract Mathematical Visualizer Canvas & Live Equation Inspector */}
        <div className="flex-1 bg-slate-50 p-6 flex flex-col overflow-y-auto space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center space-x-2">
                <Sigma className="w-4 h-4 text-indigo-600" />
                <span className="font-extrabold text-sm text-slate-900">ABSTRACT GEOMETRIC & MATH INSPECTOR</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time 2D Argand complex plane canvas, polar phase parameters, and density matrices
              </p>
            </div>

            {/* Presets Quick Action Bar */}
            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase px-2 font-mono">Basis Presets:</span>
              {(['|0>', '|1>', '|+>', '|->', '|i+>', '|i->'] as string[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPresetState(preset)}
                  className="px-2 py-1 rounded bg-white hover:bg-slate-200 border border-slate-200 text-[11px] font-mono font-bold text-blue-700 shadow-sm transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Argand Canvas & Interactive Math Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Argand Complex Vector Plane Canvas Card */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-purple-600" />
                  <span>2D Argand Complex Vector Plane ℂ</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  β = e^(iφ) sin(θ/2)
                </span>
              </div>

              <div className="relative border border-slate-200 rounded-2xl bg-slate-900 p-2 shadow-inner">
                <canvas 
                  ref={canvasRef} 
                  width={280} 
                  height={280} 
                  className="rounded-xl" 
                />
              </div>

              <div className="w-full grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="text-[10px] text-blue-600 font-bold uppercase">Alpha Amplitudes |0⟩</div>
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    α = {alphaReal.toFixed(3)}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                  <div className="text-[10px] text-purple-600 font-bold uppercase">Beta Amplitudes |1⟩</div>
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    β = {betaReal.toFixed(3)} + {betaImag.toFixed(3)}i
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Parameter Sliders & Live Equation Inspector */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
              <div className="border-b border-slate-200 pb-3">
                <span className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span>Interactive Parameter Controls</span>
                </span>
              </div>

              {/* Theta Angle Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center space-x-1">
                    <span>Polar Angle θ (Superposition Ratio):</span>
                  </span>
                  <span className="font-mono font-bold text-blue-600">{theta}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="180"
                  value={theta}
                  onChange={(e) => setTheta(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0° (|0⟩ State)</span>
                  <span>90° (50/50 Superposition)</span>
                  <span>180° (|1⟩ State)</span>
                </div>
              </div>

              {/* Phi Angle Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 flex items-center space-x-1">
                    <span>Relative Phase Angle φ:</span>
                  </span>
                  <span className="font-mono font-bold text-purple-600">{phi}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={phi}
                  onChange={(e) => setPhi(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0° (+ Phase)</span>
                  <span>90° (+i Phase)</span>
                  <span>180° (- Phase)</span>
                  <span>360°</span>
                </div>
              </div>

              {/* Real-time Probability Distributions */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="text-xs font-bold text-slate-800">Born Rule Probability Distribution:</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span>P(0) = |α|²</span>
                      <span className="font-bold text-blue-600">{(prob0 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${prob0 * 100}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span>P(1) = |β|²</span>
                      <span className="font-bold text-purple-600">{(prob1 * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${prob1 * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formatted Dirac Matrix & Math Proof Inspector Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
                <Brackets className="w-4 h-4 text-indigo-600" />
                <span>Live Dirac Bra-Ket & Density Matrix Formalism</span>
              </span>
              <span className="text-xs font-mono font-bold text-indigo-600">
                Norm ⟨ψ|ψ⟩ = 1.000
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* State Ket Vector */}
              <div className="p-4 rounded-xl bg-slate-900 text-cyan-300 space-y-2 border border-slate-800 shadow-inner">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">State Ket Vector |ψ⟩</div>
                <div className="text-sm font-bold text-white">
                  |ψ⟩ = {alphaReal.toFixed(3)} |0⟩ + ({betaReal.toFixed(3)} + {betaImag.toFixed(3)}i) |1⟩
                </div>
              </div>

              {/* Density Matrix ρ */}
              <div className="p-4 rounded-xl bg-slate-900 text-indigo-300 space-y-2 border border-slate-800 shadow-inner">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Density Matrix ρ = |ψ⟩⟨ψ|</div>
                <div className="text-xs font-bold text-white whitespace-pre">
                  ρ = [ {(rho00).toFixed(3)}  ,  {(rho01Real).toFixed(3)} - {(rho01Imag).toFixed(3)}i ]
                      [ {(rho01Real).toFixed(3)} + {(rho01Imag).toFixed(3)}i  ,  {(rho11).toFixed(3)} ]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
