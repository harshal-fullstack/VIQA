import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section className="section layout-container" style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', paddingTop: '8rem' }}>
      <div className="blob blob-1"></div>
      
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)', marginBottom: '2rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--accent)' }}
        >
          ✨ Introducing next-generation video intelligence
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ fontSize: '4rem', marginBottom: '1.5rem' }}
        >
          <span className="text-gradient">Video Intelligence</span> Q&A
          <br /> (VIQA)
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ fontSize: '1.25rem', color: '#a1a1aa', marginBottom: '3rem', maxWidth: '700px', margin: '0 auto 3rem auto' }}
        >
          An intelligent system that analyzes video content using advanced computer vision and natural language processing. Ask questions and get accurate answers without watching the entire video.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}
        >
          <a href="#mockup" className="button-primary animate-pulse-glow" style={{ fontSize: '1.125rem' }}>
            <PlayCircle size={20} /> Try the Demo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
