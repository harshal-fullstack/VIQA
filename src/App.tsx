import Hero from './components/Hero';
import UIMockup from './components/UIMockup';

function App() {
  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <div className="grid-bg"></div>
      
      {/* Navigation */}
      <nav style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '1.5rem 2rem', zIndex: 50, backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)', background: 'var(--surface-1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </div>
          VIQA
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 500 }}>
          <a href="#mockup" style={{ color: 'var(--primary)' }}>Live Demo</a>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Hero />
        {/* <Features />
        <Workflow />
        <TechStack /> */}
        <UIMockup />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 2rem', textAlign: 'center', color: '#a1a1aa' }}>
        <p>© 2026 VIQA - Video Intelligence Q&A. Powered by AI.</p>
      </footer>
    </div>
  );
}

export default App;
