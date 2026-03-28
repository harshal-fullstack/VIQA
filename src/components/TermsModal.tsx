import { X, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TermsModal({ onClose }: { onClose: () => void }) {
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
          <FileText size={24} color="var(--primary)" />
          Terms & Conditions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', color: 'var(--secondary)' }}>
          
          <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(234, 179, 8, 0.2)', display: 'flex', gap: '1rem' }}>
            <AlertCircle size={24} color="var(--warning)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.875rem', color: 'var(--foreground)', lineHeight: 1.5 }}>
              <strong>Experimental Software:</strong> VIQA is currently in active development. Generative AI models can occasionally produce inaccurate or hallucinated responses (known as "false positives"). Always verify critical information.
            </p>
          </div>

          <section>
            <h4 style={{ color: 'var(--foreground)', fontSize: '1rem', marginBottom: '0.5rem' }}>1. Usage of System Resources</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              By enabling local inference mode, you acknowledge that VIQA will utilize significant GPU and CPU resources to compute video embeddings via CLIP and generate text responses via the designated LLM. Ensure your hardware meets the minimum required specifications.
            </p>
          </section>

          <section>
            <h4 style={{ color: 'var(--foreground)', fontSize: '1rem', marginBottom: '0.5rem' }}>2. Storage & Privacy</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              Uploaded videos are stored temporarily in the <code>/temp_uploads</code> and <code>/temp_frames</code> directories to facilitate analysis. It is your responsibility to click "Clear Vector Cache" if you process sensitive imagery, to manually flush the session vectors from the internal local ChromaDB.
            </p>
          </section>

          <section>
            <h4 style={{ color: 'var(--foreground)', fontSize: '1rem', marginBottom: '0.5rem' }}>3. User Accounts</h4>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              Authentication is handled locally via SQLite. The credentials you submit are cryptographically hashed and salted; however, no email verification is actively enforced in this build.
            </p>
          </section>

        </div>
      </motion.div>
    </div>
  );
}
