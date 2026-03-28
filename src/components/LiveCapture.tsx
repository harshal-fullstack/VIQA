import React, { useState, useRef, useEffect } from 'react';
import { Camera, Square, Play, Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';
import Auth from './Auth';

type Message = {
  id: string;
  role: 'system' | 'user' | 'ai';
  content: string;
  time?: string;
  frame?: string;
};

export default function LiveCapture() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { addHistoryItem } = useHistory();
  const [showAuth, setShowAuth] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [messages, setMessages] = useState<Message[]>([
    { id: 'cam-sys', role: 'system', content: 'Live Camera Capture Mode. Start recording to stream frames to the VIQA reasoning engine in real-time.' }
  ]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<any>(null);
  const uploadIntervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSearching]);

  useEffect(() => {
    if (user) setShowAuth(false);
  }, [user]);

  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    try {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: 'Wiping prior vectorized memory cache...' }]);
      await fetch(`${settings.modelUri}/api/clear_db`, { method: "POST" });

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsRecording(true);
      setElapsedTime(0);
      startTimeRef.current = Date.now();

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: 'Recording started! Capturing and embedding context into ChromaDB every 2 seconds.' }]);

      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      uploadIntervalRef.current = setInterval(() => {
        captureAndUploadFrame();
      }, 2000);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: 'Hardware Error: Failed to access webcam.' }]);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (uploadIntervalRef.current) clearInterval(uploadIntervalRef.current);

    if (isRecording) {
      setIsRecording(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Recording finalized.` }]);
    }
  };

  const captureAndUploadFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    const currentElapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const timeStr = formatTime(currentElapsedSeconds);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      formData.append('timestamp', timeStr);

      try {
        await fetch(`${settings.modelUri}/api/upload_frame`, {
          method: "POST",
          body: formData
        });
      } catch (e) {
        console.error("Frame drop:", e);
      }
    }, 'image/jpeg', 0.8);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userQ = query;
    setQuery('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: userQ }]);
    setIsSearching(true);

    try {
      const res = await fetch(`${settings.modelUri}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQ })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'ai',
          content: data.answer,
          time: data.timestamp,
          frame: data.frame
        }]);

        // Save to History
        addHistoryItem({
          query: userQ,
          answer: data.answer,
          frameUrl: data.frame,
          timestamp: 'Live broadcast session'
        });
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Query failed. Not enough context yet.` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Failed to execute visual query.` }]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100%', width: '100%', padding: '1.5rem', gap: '1.5rem', position: 'relative' }}>

      {showAuth && <Auth onCancel={() => setShowAuth(false)} />}
      
      {/* Hidden Canvas for Frame Capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* LEFT COLUMN: VISUAL CAPTURE WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Dynamic Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: isRecording ? 'var(--error)' : 'var(--surface-3)',
              boxShadow: isRecording ? '0 0 10px var(--error)' : 'none',
              animation: isRecording ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }} />
            Live Capture
          </h2>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isRecording && <span style={{ fontFamily: 'monospace', color: 'var(--error)' }}>{formatTime(elapsedTime)}</span>}

            {!isRecording ? (
              <button className="button-primary" onClick={startRecording}>
                <Camera size={16} /> Start Recording
              </button>
            ) : (
              <button className="button-secondary" style={{ color: 'var(--error)', borderColor: 'rgba(248, 113, 113, 0.2)' }} onClick={stopRecording}>
                <Square size={16} /> Stop
              </button>
            )}
          </div>
        </div>

        {/* Video Player Area */}
        <div className="glass-panel" style={{ flex: 1, borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#000' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isRecording ? 1 : 0, transition: 'opacity 0.5s' }}
          />
          {!isRecording && (
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#475569' }}>
              <Camera size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p>Camera is offline. Press Start Recording.</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: AI ASSISTANT PANEL */}
      <div className="glass-panel" style={{ width: '400px', borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>

        {/* Panel Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Live LiveAssistant</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Ask anything about the broadcast</p>
          </div>
        </div>

        {/* Chat Log */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: '0.75rem' }}>

              {msg.role !== 'system' && (
                <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: msg.role === 'ai' ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {msg.role === 'ai' ? <Bot size={14} color="white" /> : <User size={14} color="#cbd5e1" />}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: msg.role === 'system' ? '100%' : '85%' }}>
                <div style={{
                  background: msg.role === 'user' ? 'var(--primary)' : (msg.role === 'system' ? 'transparent' : 'var(--surface-2)'),
                  color: msg.role === 'system' ? 'var(--secondary)' : (msg.role === 'user' ? '#ffffff' : 'var(--foreground)'),
                  padding: msg.role === 'system' ? '0' : '0.75rem 1rem',
                  borderRadius: msg.role === 'user' ? 'var(--radius-lg) var(--radius-lg) 0 var(--radius-lg)' : 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 0',
                  fontSize: msg.role === 'system' ? '0.75rem' : '0.875rem',
                  border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                  textAlign: msg.role === 'system' ? 'center' : 'left',
                  width: msg.role === 'system' ? '100%' : 'auto'
                }}>
                  {msg.content}
                </div>

                {msg.frame && (
                  <div style={{ marginTop: '0.5rem', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', width: '100%', maxWidth: '200px' }}>
                    <img src={msg.frame} alt="Reference sequence" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
                {msg.time && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent)' }}>
                    <Play size={12} /> Frame match: {msg.time}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isSearching && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ flexShrink: 0, width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={14} color="white" />
              </div>
              <div style={{ background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.875rem', border: '1px solid var(--border)' }}>
                <Loader2 size={14} className="animate-spin" color="var(--primary)" /> Analyzing the realtime stream...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--surface-1)' }}>
          <form onSubmit={handleSearch} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={(isRecording || elapsedTime > 0) ? "Ask about the broadcast..." : "Start camera first..."}
              disabled={(!isRecording && elapsedTime === 0) || isSearching}
              style={{ width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', padding: '0.875rem 3rem 0.875rem 1rem', borderRadius: 'var(--radius-xl)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s', opacity: (!isRecording && elapsedTime === 0) ? 0.5 : 1 }}
            />
            <button
              type="submit"
              disabled={!query.trim() || (!isRecording && elapsedTime === 0) || isSearching}
              style={{ position: 'absolute', right: '0.5rem', width: '32px', height: '32px', background: query.trim() ? 'var(--primary)' : 'transparent', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: query.trim() ? 'white' : '#64748b', transition: 'all 0.2s', opacity: (!isRecording && elapsedTime === 0 || isSearching) ? 0.5 : 1 }}
            >
              <Send size={14} style={{ marginLeft: query.trim() ? '2px' : '0' }} />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
