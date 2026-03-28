import { useState } from 'react';
import { Save, Database, Monitor, Moon, BellRing, Loader2, User } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '../contexts/HistoryContext';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const { user } = useAuth();
  const { clearAllHistory } = useHistory();

  const [modelUri] = useState(settings.modelUri);
  const [apiKey] = useState(settings.apiKey);
  const [useLocalBlip] = useState(settings.useLocalBlip);
  const [notifications, setNotifications] = useState(settings.notifications);
  const [darkTheme, setDarkTheme] = useState(settings.darkTheme);

  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    updateSettings({ modelUri, apiKey, useLocalBlip, notifications, darkTheme });
    setTimeout(() => {
      setIsSaving(false);
      if (notifications) {
        alert("Settings saved successfully!");
      }
    }, 600);
  };

  const handleClearCache = async () => {
    if (!window.confirm("Are you sure you want to completely wipe the Vector DB cache?")) return;

    setIsClearing(true);
    try {
      const res = await fetch(`${modelUri}/api/clear_db`, { method: "POST" });
      if (res.ok) {
        clearAllHistory();
        alert("ChromaDB vector cache and Recent Queries History cleared successfully.");
      } else {
        alert("Failed to clear cache. Server returned an error.");
      }
    } catch (e) {
      console.error(e);
      alert("Network error: Could not reach the backend to clear the cache.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div style={{ padding: '2rem 3rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--foreground)', marginBottom: '0.5rem' }}>Preferences</h2>
          <p style={{ color: 'var(--secondary)', fontSize: '1rem' }}>Manage your account settings, models and backend configurations.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* User Account / Profile */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', background: 'var(--surface-1)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--foreground)', fontWeight: 500 }}>
              <User size={20} style={{ color: 'var(--accent)' }} />
              Account Profile
            </h3>
            
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'var(--surface-2)', padding: '1.5rem', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', fontWeight: 600, boxShadow: '0 4px 12px var(--primary-glow)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--foreground)' }}>{user.name}</div>
                  <div style={{ color: 'var(--secondary)' }}>{user.email}</div>
                  <div style={{ marginTop: '0.5rem', display: 'inline-block', padding: '0.25rem 0.5rem', background: 'rgba(52, 211, 153, 0.1)', color: 'var(--success)', fontSize: '0.75rem', borderRadius: 'var(--radius-sm)', fontWeight: 500 }}>Active Session</div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border)', color: 'var(--secondary)' }}>
                You are currently browsing as a guest. Please log in from the upload or capture screens.
              </div>
            )}
          </div>

          {/* General Appearance */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', background: 'var(--surface-1)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--foreground)', fontWeight: 500 }}>
              <Monitor size={20} style={{ color: 'var(--primary)' }} />
              Appearance & Alerts
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Moon size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ color: 'var(--foreground)', fontWeight: 500, marginBottom: '0.25rem', fontSize: '1rem' }}>Dark Theme</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Always use dark mode for the dashboard</div>
                  </div>
                </div>
                <div
                  onClick={() => setDarkTheme(!darkTheme)}
                  style={{ width: '44px', height: '24px', borderRadius: '12px', background: darkTheme ? 'var(--primary)' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: darkTheme ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--surface-2)', borderRadius: 'var(--radius-xl)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BellRing size={18} color="var(--success)" />
                  </div>
                  <div>
                    <div style={{ color: 'var(--foreground)', fontWeight: 500, marginBottom: '0.25rem', fontSize: '1rem' }}>System Notifications</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--secondary)' }}>Receive alerts when indexing finishes</div>
                  </div>
                </div>
                <div
                  onClick={() => setNotifications(!notifications)}
                  style={{ width: '44px', height: '24px', borderRadius: '12px', background: notifications ? 'var(--primary)' : 'var(--surface-3)', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}
                >
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: notifications ? '22px' : '2px', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
            </div>
          </div>



          {/* Database Settings */}
          <div className="glass-panel" style={{ padding: '2rem', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border)', background: 'var(--surface-1)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--foreground)', fontWeight: 500 }}>
              <Database size={20} style={{ color: 'var(--accent)' }} />
              ChromaDB Management
            </h3>
            <p style={{ color: 'var(--secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              Clear completely vectorized frames and embeddings. This action cannot be undone and will require re-encoding any videos you wish to query.
            </p>
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              className="button-secondary"
              style={{ width: 'auto', padding: '0.75rem 2rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)', opacity: isClearing ? 0.7 : 1 }}
            >
              {isClearing ? <Loader2 size={16} className="animate-spin" /> : "Clear Vector Cache"}
            </button>
          </div>

          {/* Save Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingBottom: '3rem' }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="button-primary"
              style={{ padding: '0.875rem 2.5rem', fontSize: '1rem', fontWeight: 500, opacity: isSaving ? 0.8 : 1 }}
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Save Preferences</>}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
