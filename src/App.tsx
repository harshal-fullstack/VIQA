import { useState } from 'react';
import UIMockup from './components/UIMockup';
import LiveCapture from './components/LiveCapture';
import SettingsView from './components/Settings';
import FAQModal from './components/FAQModal';
import TermsModal from './components/TermsModal';
import { LayoutDashboard, Settings, User, Search, Hexagon, Camera, LogOut, HelpCircle, FileText, History, Clock } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { useHistory } from './contexts/HistoryContext';
import { AnimatePresence, motion } from 'framer-motion';
function App() {
  const [navMode, setNavMode] = useState<'upload' | 'capture' | 'settings'>('upload');
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  
  const { user, logout } = useAuth();
  const { historyItems, restoreHistoryItem } = useHistory();

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--background)' }}>
      {/* Left Navigation Sidebar */}
      <aside style={{ width: '80px', borderRight: '1px solid var(--border)', background: 'var(--surface-1)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0', zIndex: 10 }}>

        {/* Brand Logo */}
        <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3rem', boxShadow: '0 4px 14px var(--primary-glow)' }}>
          <Hexagon size={24} color="white" fill="white" />
        </div>

        {/* Nav Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          <button
            className={`icon-button ${navMode === 'upload' ? 'active' : ''}`}
            title="Upload Video Dashboard"
            onClick={() => setNavMode('upload')}
          >
            <LayoutDashboard size={22} />
          </button>
          <button
            className={`icon-button ${navMode === 'capture' ? 'active' : ''}`}
            title="Live Stream Capture"
            onClick={() => setNavMode('capture')}
          >
            <Camera size={22} />
          </button>
          <button
            className={`icon-button ${navMode === 'settings' ? 'active' : ''}`}
            title="Settings"
            onClick={() => setNavMode('settings')}
          >
            <Settings size={22} />
          </button>
        </div>

        {/* User Profile */}
        <div 
          onClick={() => setShowProfile(!showProfile)}
          style={{ width: '36px', height: '36px', borderRadius: '50%', background: user ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface-3)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', color: user ? 'white' : 'var(--foreground)', fontWeight: 600 }}
        >
          {user ? user.name.charAt(0).toUpperCase() : <User size={20} color="var(--foreground)" />}
        </div>
        
        {/* Profile Popover */}
        <AnimatePresence>
          {showProfile && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="glass-panel"
              style={{ position: 'absolute', bottom: '1.5rem', left: '80px', width: '240px', padding: '1rem', borderRadius: 'var(--radius-xl)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              {user ? (
                <>
                  <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--foreground)' }}>{user.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{user.email}</div>
                  </div>
                  <button onClick={() => { setShowFaq(true); setShowProfile(false); }} className="button-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent' }}><HelpCircle size={16} /> FAQ</button>
                  <button onClick={() => { setShowTerms(true); setShowProfile(false); }} className="button-secondary" style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent' }}><FileText size={16} /> Terms & Conditions</button>
                  <button 
                    onClick={() => { logout(); setShowProfile(false); }}
                    className="button-secondary" 
                    style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', color: 'var(--error)' }}
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--secondary)' }}>
                  Not logged in
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </aside>

      {/* Main App Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top Header */}
        <header style={{ height: '72px', borderBottom: '1px solid var(--border)', background: 'var(--background)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', zIndex: 10 }}>
          <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--secondary)' }}>Workspace</span>
            <span style={{ color: 'var(--border-focus)' }}>/</span>
            <span className="text-gradient">
              {navMode === 'upload' && 'Video Q&A'}
              {navMode === 'capture' && 'Live Broadcast'}
              {navMode === 'settings' && 'Settings'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Search Bar */}
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '0.4rem 1rem', width: '280px' }}>
              <Search size={16} color="var(--secondary)" style={{ marginRight: '0.5rem' }} />
              <input type="text" placeholder="Search files..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--foreground)', width: '100%', fontSize: '0.875rem' }} />
            </div>

            {/* Notifications / History */}
            <div style={{ position: 'relative' }}>
              <button 
                className={`icon-button ${showHistory ? 'active' : ''}`} 
                style={{ borderRadius: '50%' }}
                onClick={() => setShowHistory(!showHistory)}
              >
                <History size={20} />
              </button>

              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="glass-panel"
                    style={{ position: 'absolute', top: '100%', right: '0', marginTop: '1rem', width: '320px', borderRadius: 'var(--radius-xl)', zIndex: 50, padding: '1rem', border: '1px solid var(--border)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                  >
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Clock size={16} color="var(--primary)" />
                      Recent Queries
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {historyItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--secondary)', fontSize: '0.875rem' }}>No history found</div>
                      ) : (
                        historyItems.map((item) => (
                          <div 
                            key={item.id}
                            onClick={() => {
                              restoreHistoryItem(item);
                              setNavMode('upload');
                              setShowHistory(false);
                            }}
                            style={{ padding: '0.75rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                          >
                            <div style={{ fontSize: '0.875rem', color: 'var(--foreground)', fontWeight: 500, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.query}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--secondary)', display: 'flex', justifyContent: 'space-between' }}>
                              <span>{new Date(item.date).toLocaleDateString()}</span>
                              {item.timestamp && <span style={{ color: 'var(--accent)' }}>{item.timestamp}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Dashboard Workspace */}
        <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Ambient background effects */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/40 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-orange-100/30 blur-[120px]" />
          </div>

          {navMode === 'upload' && <UIMockup />}
          {navMode === 'capture' && <LiveCapture />}
          {navMode === 'settings' && <SettingsView />}

          <AnimatePresence>
            {showFaq && <FAQModal onClose={() => setShowFaq(false)} />}
            {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
