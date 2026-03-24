import { motion } from 'framer-motion';
import { Server, LayoutDashboard, Terminal } from 'lucide-react';

const StackCard = ({ icon, title, tech, color }: { icon: any, title: string, tech: string[], color: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    className="glass-panel"
    style={{ padding: '2rem', position: 'relative', overflow: 'hidden' }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color }}></div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
      <div style={{ color }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{title}</h3>
    </div>
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {tech.map((item, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#e4e4e7' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, opacity: 0.5 }}></div>
          {item}
        </li>
      ))}
    </ul>
  </motion.div>
);

export default function TechStack() {
  return (
    <section id="tech-stack" className="section layout-container">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Technology Stack</h2>
        <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>Curated cutting-edge tools to deliver seamless and accurate video intelligence.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <StackCard 
          icon={<LayoutDashboard size={28} />}
          title="Frontend & UI"
          tech={['React', 'Vite', 'Framer Motion', 'Lucide Icons']}
          color="var(--primary)"
        />
        <StackCard 
          icon={<Server size={28} />}
          title="Backend & Data"
          tech={['Python (FastAPI / Flask)', 'Node.js', 'ChromaDB (Vector Database)']}
          color="var(--secondary)"
        />
        <StackCard 
          icon={<Terminal size={28} />}
          title="AI & Processing"
          tech={['OpenCV (Frame Extraction)', 'CLIP (Embeddings)', 'BLIP (Visual Q&A)']}
          color="var(--accent)"
        />
      </div>
    </section>
  );
}
