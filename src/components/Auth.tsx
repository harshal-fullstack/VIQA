import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, User as UserIcon, Hexagon, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Auth({ onCancel }: { onCancel?: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let success = false;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await signup(email, name, password);
    }

    if (!success) {
      setError(isLogin ? "Invalid email or password" : "Email already exists or invalid input");
    }
    setLoading(false);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(235, 210, 167, 0.4)', backdropFilter: 'blur(25px)' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? 'login' : 'signup'}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="glass-panel"
          style={{ width: '100%', maxWidth: '420px', padding: '3rem 2.5rem', borderRadius: 'var(--radius-2xl)', display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
          {onCancel && (
            <button 
              onClick={onCancel} 
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'var(--secondary)', fontSize: '0.875rem' }}
            >
              Cancel
            </button>
          )}

          <div style={{ width: '48px', height: '48px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', boxShadow: '0 8px 24px var(--primary-glow)' }}>
            <Hexagon size={28} color="white" fill="white" />
          </div>

          <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.5rem', color: 'var(--primary)' }}>
            {isLogin ? "Welcome back" : "Create an account"}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '2.5rem' }}>
            {isLogin ? "Enter your credentials to access the workspace" : "Join VIQA for localized visual intelligence"}
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--error)', fontSize: '0.875rem', textAlign: 'center' }}>
                {error}
              </div>
            )}

            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-2)', outline: 'none', transition: 'all 0.2s' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
              <input
                type="email"
                required
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-2)', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)' }} />
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', background: 'var(--surface-2)', outline: 'none', transition: 'all 0.2s' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>

            <button type="submit" disabled={loading} className="button-primary" style={{ marginTop: '0.5rem', padding: '0.875rem' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isLogin ? "Sign In" : "Sign Up")}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--secondary)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
