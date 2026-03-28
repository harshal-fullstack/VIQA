import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SettingsProvider } from './contexts/SettingsContext'
import { AuthProvider } from './contexts/AuthContext'

import { HistoryProvider } from './contexts/HistoryContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <AuthProvider>
        <HistoryProvider>
          <App />
        </HistoryProvider>
      </AuthProvider>
    </SettingsProvider>
  </StrictMode>,
)
