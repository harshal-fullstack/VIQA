import { motion } from 'framer-motion';
import { Video, Cpu, MessageSquare, Database, Layout } from 'lucide-react';

const features = [
  {
    icon: <Video size={24} color="var(--primary)" />,
    title: "Video Upload & Frame Extraction",
    description: "Upload videos seamlessly. Extracts critical frames at 1 FPS using OpenCV for efficient processing."
  },
  {
    icon: <Cpu size={24} color="var(--secondary)" />,
    title: "Intelligent Embedding",
    description: "Frames and text queries are converted into high-dimensional vector embeddings using the CLIP model."
  },
  {
    icon: <Database size={24} color="var(--accent)" />,
    title: "Vector Similarity Search",
    description: "Stores embeddings in ChromaDB and performs lightning-fast search to find relevant frames with timestamps."
  },
  {
    icon: <MessageSquare size={24} color="var(--success)" />,
    title: "Visual Question Answering",
    description: "Leverages the powerful BLIP model to accurately answer user questions based on the retrieved video frame."
  },
  {
    icon: <Layout size={24} color="var(--warning)" />,
    title: "Interactive Dashboard",
    description: "User-friendly interface displaying search results, extracted answers, and precise video timestamps."
  }
];

export default function Features() {
  return (
    <section id="features" className="section layout-container">
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Key Features</h2>
        <p style={{ color: '#a1a1aa', maxWidth: '600px', margin: '0 auto' }}>Building the foundation for advanced video analysis and intuitive question answering.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="glass-panel"
            style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.3s ease' }}
            whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
          >
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.5rem' }}>
              {feature.icon}
            </div>
            <h3 style={{ fontSize: '1.25rem' }}>{feature.title}</h3>
            <p style={{ color: '#a1a1aa', fontSize: '0.95rem' }}>{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
