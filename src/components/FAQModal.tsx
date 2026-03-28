import { X, HelpCircle, Shield, Cpu, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FAQModal({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel"
        style={{ width: '100%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', background: 'var(--background)', padding: '2rem', position: 'relative' }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--surface-2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--foreground)' }}
        >
          <X size={16} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <HelpCircle size={24} color="var(--primary)" />
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ background: 'var(--surface-1)', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Cpu size={16} color="var(--accent)" />
              How does the Reasoning Engine work?
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.5 }}>
              VIQA extracts frames from your uploaded video and runs them through a vision encoder (CLIP) to create mathematical embeddings. These are stored locally in ChromaDB. When you ask a question, the engine finds the most visually relevant frame and feeds it to a multimodal LLM (BLIP/FLAN-T5) to generate a precise answer.
            </p>
          </div>

          <div style={{ background: 'var(--surface-1)', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} color="var(--success)" />
              Are my videos sent to the cloud?
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.5 }}>
              By default, all video processing, frame extraction, and database indexing happen completely locally on your hardware. If you do not configure an External API Key in the settings, the entire pipeline is 100% offline and secure.
            </p>
          </div>

          <div style={{ background: 'var(--surface-1)', padding: '1.25rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={16} color="var(--primary)" />
              Why can't I ask a question right away?
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--secondary)', lineHeight: 1.5 }}>
              The AI requires visual context to reason about your queries. You must either upload a video to establish a static memory cache, or press "Start Recording" in the Live Capture dashboard to establish a real-time stream.
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
