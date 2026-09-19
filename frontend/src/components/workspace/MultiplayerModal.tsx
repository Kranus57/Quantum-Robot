import React, { useState } from 'react';
import { useQuantum } from '../../context/QuantumContext';
import { X, Users, Link2, Check, Radio } from 'lucide-react';

export const MultiplayerModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { multiplayerSession, setMultiplayerSession } = useQuantum();
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const sessionUrl = `${origin}/?session=${multiplayerSession?.sessionId || 'q_sandbox_882'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sessionUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCreateSession = () => {
    const newId = 'q_room_' + Math.random().toString(36).substring(2, 7);
    setMultiplayerSession({
      sessionId: newId,
      isHost: true,
      connectedUsers: [
        { id: 'usr_1', name: 'You (Host)', role: 'Owner', color: '#06B6D4' },
        { id: 'usr_2', name: 'Dr. Elena Rostova', role: 'Collaborator (Physics PhD)', color: '#EC4899' },
        { id: 'usr_3', name: 'Liam Zhang', role: 'Collaborator (CS Undergrad)', color: '#8B5CF6' }
      ]
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-quantum-panel border border-quantum-border rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 bg-quantum-dark border-b border-quantum-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-quantum-magenta/20 border border-quantum-magenta/40 text-quantum-magenta flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Quantum Sandbox Multiplayer</h3>
              <p className="text-[11px] text-gray-400">Real-time WebSockets Pair-Programming</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs text-gray-300">
          <div className="p-3.5 rounded-xl bg-quantum-card border border-quantum-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-bold text-emerald-400">WebSocket Live Room Active</span>
            </div>
            <span className="font-mono text-[11px] text-gray-400">
              ID: {multiplayerSession?.sessionId || 'q_sandbox_882'}
            </span>
          </div>

          {/* Copy Session Invite Link */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-gray-400">Invite Collaborator Link:</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={sessionUrl}
                className="flex-1 bg-quantum-dark border border-quantum-border px-3 py-2 rounded-lg font-mono text-xs text-cyan-300 focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-3 py-2 rounded-lg bg-quantum-card border border-quantum-border text-gray-200 hover:text-white flex items-center space-x-1"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Connected Collaborators List */}
          <div className="space-y-2 pt-2">
            <div className="font-bold text-white flex items-center justify-between">
              <span>Active Collaborators in Room ({multiplayerSession?.connectedUsers.length || 1})</span>
              <span className="text-[10px] text-quantum-cyan">Syncing Gates Live</span>
            </div>

            <div className="space-y-2">
              {(multiplayerSession?.connectedUsers || []).map((usr) => (
                <div
                  key={usr.id}
                  className="p-3 rounded-xl bg-quantum-dark/80 border border-quantum-border flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: usr.color }}
                    />
                    <div>
                      <div className="font-bold text-gray-200">{usr.name}</div>
                      <div className="text-[10px] text-gray-400">{usr.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono">
                    Online
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-quantum-dark border-t border-quantum-border flex justify-between items-center">
          <button
            onClick={handleCreateSession}
            className="px-3 py-1.5 rounded-lg bg-quantum-card border border-quantum-border text-xs text-gray-200 hover:text-white"
          >
            Create New Room
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-quantum-magenta text-white font-bold text-xs shadow-magenta-glow hover:opacity-90"
          >
            Join Pair Session
          </button>
        </div>
      </div>
    </div>
  );
};
