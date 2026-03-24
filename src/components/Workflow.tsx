import { motion } from 'framer-motion';

const steps = [
  { num: "01", title: "Upload Video", desc: "User uploads the target video." },
  { num: "02", title: "Extract Frames", desc: "OpenCV extracts video frames at 1 FPS." },
  { num: "03", title: "Generate Embeddings", desc: "Frames are converted to vector embeddings." },
  { num: "04", title: "Store Data", desc: "Embeddings + timestamps stored in ChromaDB." },
  { num: "05", title: "Enter Query", desc: "User types a natural language query (e.g. 'Find the cat')." },
  { num: "06", title: "Encode Query", desc: "CLIP encodes the query into a text vector." },
  { num: "07", title: "Similarity Search", desc: "Perform vector similarity search in the database." },
  { num: "08", title: "Retrieve Frames", desc: "System fetches the most relevant frames." },
  { num: "09", title: "Ask Question", desc: "User asks a specific question about the frame." },
  { num: "10", title: "Generate Answer", desc: "BLIP analyzes the frame and answers." },
  { num: "11", title: "Display Results", desc: "Show answer + timestamp in the interactive UI." },
];

export default function Workflow() {
  return (
    <section id="workflow" className="section layout-container">
      <div className="blob blob-2"></div>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>The VIQA Workflow</h2>
        <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>11 seamless steps from raw video to intelligent answers.</p>
      </div>

      <div style={{ position: 'relative', padding: '2rem 0' }}>
        {/* Connecting line */}
        <div style={{ position: 'absolute', top: '10%', bottom: '10%', left: '2rem', width: '2px', background: 'var(--surface-3)', zIndex: 0, borderRadius: '2px' }}></div>
        
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}
          >
            <div style={{ flexShrink: 0, width: '4rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--surface-1)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', boxShadow: '0 0 15px rgba(99, 102, 241, 0.2)' }}>
                {step.num}
              </div>
            </div>
            
            <div className="glass-panel" style={{ flexGrow: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: '#e4e4e7' }}>{step.title}</h3>
              <p style={{ color: '#a1a1aa', fontSize: '0.9rem', margin: 0 }}>{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
