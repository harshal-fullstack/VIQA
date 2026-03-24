import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Video, Play, FastForward, Loader2, Search, Image as ImageIcon, MessageSquare, Database } from 'lucide-react';

export default function UIMockup() {
  const [step, setStep] = useState(0); // 0: upload, 1: processing, 2: q&a
  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{ time: string, answer: string, frame: string } | null>(null);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      
      setStep(1);
      setProgress(0);
      // Simulate progress bar moving up to 90% while waiting for the backend
      const intv = setInterval(() => {
        setProgress(p => (p < 90 ? p + 2 : p));
      }, 500);
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch("http://127.0.0.1:8000/api/upload", {
          method: "POST",
          body: formData
        });
        clearInterval(intv);
        setProgress(100);
        
        if (res.ok) {
          setTimeout(() => setStep(2), 500);
        } else {
          alert("Error processing video on backend.");
          setStep(0);
        }
      } catch (err) {
        clearInterval(intv);
        alert("Failed to connect to backend (http://localhost:8000). Is it running?");
        setStep(0);
      }
    };
    input.click();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setResults(null);
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query })
      });
      
      if (res.ok) {
        const data = await res.json();
        setResults({
          time: data.timestamp,
          answer: data.answer,
          frame: data.frame
        });
      } else {
        alert("Query failed. Backend might not have found a relevant frame.");
      }
    } catch (err) {
      alert("Failed to connect to backend for Q&A.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section id="mockup" className="section layout-container">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Interactive UI Concept</h2>
        <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>Experience the VIQA flow firsthand. Try our simulated interface below.</p>
      </div>

      <div className="glass-panel" style={{ maxWidth: '900px', margin: '0 auto', overflow: 'hidden', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
        {/* Mockup Header */}
        <div style={{ borderBottom: '1px solid var(--border)', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface-2)' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
          </div>
          <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#a1a1aa', marginLeft: '1rem' }}>VIQA Workspace</div>
        </div>

        {/* Mockup Body */}
        <div style={{ flex: 1, padding: '3rem', position: 'relative' }}>
          <AnimatePresence mode="wait">
            
            {/* Step 0: Upload */}
            {step === 0 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
              >
                <div 
                  style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius-xl)', padding: '4rem', textAlign: 'center', width: '100%', maxWidth: '500px', cursor: 'pointer', transition: 'all 0.2s ease', background: 'var(--surface-1)' }}
                  onClick={handleUpload}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
                    <Upload size={32} />
                  </div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Upload Video</h3>
                  <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginBottom: '2rem' }}>Drag and drop MP4, WebM, or click to browse</p>
                  <button className="button-primary" onClick={(e) => { e.stopPropagation(); handleUpload(); }}>
                    Select File
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 1: Processing */}
            {step === 1 && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '500px', margin: '0 auto' }}
              >
                <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '2rem' }} />
                <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Processing Video...</h3>
                
                <div style={{ width: '100%', marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#a1a1aa', marginBottom: '0.5rem' }}>
                    <span>{progress < 50 ? 'Extracting frames...' : 'Generating embeddings...'}</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <motion.div 
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '2rem', color: '#a1a1aa' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: progress > 10 ? 'var(--success)' : '' }}><Video size={16} /> OpenCV</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: progress > 50 ? 'var(--success)' : '' }}><FastForward size={16} /> CLIP Model</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: progress > 90 ? 'var(--success)' : '' }}><Database size={16} /> ChromaDB</div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Q&A */}
            {step === 2 && (
              <motion.div
                key="qa"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', height: '100%' }}>
                  {/* Video Player Mockup */}
                  <div style={{ background: '#000', borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                    {results && !isSearching ? (
                      <div style={{ position: 'absolute', inset: 0, backgroundImage: `url("${results.frame}")`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                        <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: 'bold' }}>
                          Timestamp: {results.time}
                        </div>
                      </div>
                    ) : (
                      <ImageIcon size={48} color="#3f3f46" />
                    )}
                  </div>

                  {/* Chat/Q&A Section */}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.875rem', color: '#a1a1aa', textAlign: 'center', marginBottom: '1rem' }}>Video indexed successfully. State your query below.</div>
                      
                      {query && isSearching && (
                        <div style={{ alignSelf: 'flex-end', background: 'var(--primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 var(--radius-lg)', maxWidth: '80%' }}>
                          {query}
                        </div>
                      )}
                      
                      {isSearching && (
                        <div style={{ alignSelf: 'flex-start', background: 'var(--surface-2)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 0', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <Loader2 size={16} className="animate-spin" /> Retrieving frames & analyzing with BLIP...
                        </div>
                      )}

                      {results && !isSearching && (
                        <>
                          <div style={{ alignSelf: 'flex-end', background: 'var(--primary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 var(--radius-lg)', maxWidth: '80%' }}>
                            {query}
                          </div>
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ alignSelf: 'flex-start', background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-lg) var(--radius-lg) var(--radius-lg) 0', maxWidth: '90%' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--success)' }}>
                              <MessageSquare size={16} /> BLIP Answer
                            </div>
                            <p style={{ margin: 0 }}>{results.answer}</p>
                            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Play size={14} /> Jump to {results.time}
                            </div>
                          </motion.div>
                        </>
                      )}
                    </div>

                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., What color is the cat?"
                        style={{ flex: 1, background: 'var(--surface-1)', border: '1px solid var(--border)', padding: '1rem', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }}
                        disabled={isSearching}
                      />
                      <button type="submit" className="button-primary" disabled={isSearching || !query.trim()} style={{ opacity: isSearching || !query.trim() ? 0.5 : 1 }}>
                        <Search size={20} />
                      </button>
                    </form>
                    
                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                      <button onClick={() => { setStep(0); setQuery(''); setResults(null); }} className="button-secondary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                        Reset Demo
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
