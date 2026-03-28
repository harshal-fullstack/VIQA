import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Video, Play, FastForward, Loader2, Database, Sparkles, Send, Bot, User } from 'lucide-react';
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

export default function Workspace() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const { addHistoryItem, activeHistoryItem, clearActiveHistoryItem } = useHistory();
  const [showAuth, setShowAuth] = useState(false);
  const [step, setStep] = useState(0); // 0: upload, 1: processing, 2: ready
  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeFrame, setActiveFrame] = useState<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'system', content: 'Welcome to VIQA Workspace. Please upload a video file to begin localized indexing and analysis.' }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSearching]);

  useEffect(() => {
    if (user) setShowAuth(false);
  }, [user]);

  useEffect(() => {
    if (activeHistoryItem) {
      setStep(2);
      setActiveFrame(activeHistoryItem.frameUrl);
      setMessages([
        { id: Date.now().toString() + '_sys', role: 'system', content: 'Video analysis restored from local history.' },
        { id: Date.now().toString() + '_u', role: 'user', content: activeHistoryItem.query },
        { 
          id: Date.now().toString() + '_ai', 
          role: 'ai', 
          content: activeHistoryItem.answer, 
          time: activeHistoryItem.timestamp, 
          frame: activeHistoryItem.frameUrl 
        }
      ]);
      clearActiveHistoryItem();
    }
  }, [activeHistoryItem]);

  const handleUpload = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      setStep(1);
      setProgress(0);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Initializing vector pipeline for ${file.name}...` }]);

      const intv = setInterval(() => {
        setProgress(p => (p < 90 ? p + 2 : p));
      }, 500);

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${settings.modelUri}/api/upload`, {
          method: "POST",
          body: formData
        });
        clearInterval(intv);
        setProgress(100);

        if (res.ok) {
          const data = await res.json();
          setTimeout(() => {
            setStep(2);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              role: 'system',
              content: `Processing complete! Automatically extracted and vectorized ${data.frames} frames into ChromaDB. You can now ask questions about the video content.`
            }]);
          }, 800);
        } else {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Error processing video on backend.` }]);
          setStep(0);
        }
      } catch (err) {
        clearInterval(intv);
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Failed to connect to backend engine. Ensure Uvicorn is running.` }]);
        setStep(0);
      }
    };
    input.click();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || step !== 2) return;

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
        setActiveFrame(data.frame);
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
          timestamp: data.timestamp
        });
      } else {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Query failed. The backend might not have found a relevant frame.` }]);
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

      {/* LEFT COLUMN: VISUAL WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Dynamic Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: step === 2 ? 'var(--success)' : (step === 1 ? 'var(--warning)' : 'var(--primary)'), boxShadow: `0 0 10px ${step === 2 ? 'var(--success)' : 'var(--primary)'}` }} />
            {step === 0 ? "Project Setup" : (step === 1 ? "Extracting Intelligence" : "Visual Reference")}
          </h2>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="button-secondary" style={{ padding: '0.4rem 1rem' }} onClick={() => { setStep(0); setActiveFrame(null); setMessages([{ id: '1', role: 'system', content: 'Reset successful. Upload new video.' }]); }}>
              Reset Workspace
            </button>
          </div>
        </div>

        {/* Video Player / Presentation Area */}
        <div className="glass-panel" style={{ flex: 1, borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', background: '#000' }}>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{ textAlign: 'center', zIndex: 2 }}
              >
                <div
                  onClick={handleUpload}
                  style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '5rem 8rem', borderRadius: 'var(--radius-xl)', cursor: 'pointer', background: 'var(--surface-1)', transition: 'all 0.3s ease' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'var(--surface-1)'; }}
                >
                  <div style={{ width: '80px', height: '80px', background: 'var(--surface-2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                    <Upload size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>Select Video File</h3>
                  <p style={{ color: 'var(--secondary)', fontSize: '0.875rem' }}>MP4, WebM formats supported</p>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ width: '100%', maxWidth: '500px', zIndex: 2 }}
              >
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                  <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', margin: '0 auto 1.5rem' }} />
                  <h3 style={{ fontSize: '1.5rem', color: 'var(--foreground)' }}>Vectorizing Sequence</h3>
                </div>

                <div style={{ background: 'var(--surface-2)', padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                    <span>{progress < 40 ? 'Frame Extraction (OpenCV)' : (progress < 80 ? 'Vision Embedding (CLIP)' : 'Database Indexing')}</span>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{progress}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--surface-1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <motion.div
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))', boxShadow: '0 0 10px var(--primary-glow)' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: progress > 10 ? 'var(--success)' : '#475569' }}>
                      <Video size={20} /> <span style={{ fontSize: '0.75rem' }}>Extract</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: progress > 50 ? 'var(--success)' : '#475569' }}>
                      <FastForward size={20} /> <span style={{ fontSize: '0.75rem' }}>Encode</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: progress > 90 ? 'var(--success)' : '#475569' }}>
                      <Database size={20} /> <span style={{ fontSize: '0.75rem' }}>Index</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="player"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              >
                {activeFrame ? (
                  <div style={{ width: '100%', height: '100%', backgroundImage: `url("${activeFrame}")`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 20%)' }} />
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                    <Sparkles size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Ask a question to locate a specific frame.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT COLUMN: AI ASSISTANT PANEL */}
      <div className="glass-panel" style={{ width: '400px', borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>

        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Sparkles size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)' }}>Query Assistant</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>Powered by BLIP + FLAN-T5</p>
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

                {msg.time && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--accent)', cursor: 'pointer' }}>
                    <Play size={12} /> Matched at {msg.time}
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
                <Loader2 size={14} className="animate-spin" color="var(--primary)" /> Analyzing visual intent...
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
              placeholder={step === 2 ? "Ask about the video..." : "Upload a video first..."}
              disabled={step !== 2 || isSearching}
              style={{ width: '100%', background: 'var(--surface-3)', border: '1px solid var(--border)', padding: '0.875rem 3rem 0.875rem 1rem', borderRadius: 'var(--radius-xl)', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', transition: 'all 0.2s', opacity: step !== 2 ? 0.5 : 1 }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              type="submit"
              disabled={!query.trim() || step !== 2 || isSearching}
              style={{ position: 'absolute', right: '0.5rem', width: '32px', height: '32px', background: query.trim() ? 'var(--primary)' : 'transparent', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: query.trim() ? 'white' : '#64748b', transition: 'all 0.2s', opacity: (step !== 2 || isSearching) ? 0.5 : 1 }}
            >
              <Send size={14} style={{ marginLeft: query.trim() ? '2px' : '0' }} />
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: '#475569' }}>
            Responses generated via localized VQA pipeline
          </div>
        </div>

      </div>
    </div>
  );
}
