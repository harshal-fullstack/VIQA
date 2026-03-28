import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type HistoryItem = {
  id: string;
  query: string;
  answer: string;
  frameUrl: string;
  timestamp: string; // Video occurrence 
  date: number; // Wall-clock time of query
};

type HistoryContextType = {
  historyItems: HistoryItem[];
  activeHistoryItem: HistoryItem | null;
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'date'>) => void;
  restoreHistoryItem: (item: HistoryItem) => void;
  clearActiveHistoryItem: () => void;
  clearAllHistory: () => void;
};

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [activeHistoryItem, setActiveHistoryItem] = useState<HistoryItem | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // If there is no active logged-in user, hide history from UI to protect privacy
    if (!user) {
      setHistoryItems([]);
      setActiveHistoryItem(null);
      return;
    }

    const saved = localStorage.getItem(`viqa_history_${user.email}`);
    if (saved) {
      try {
        setHistoryItems(JSON.parse(saved));
      } catch(e) { /* ignore */ }
    } else {
      setHistoryItems([]); // Ensure we clear state if a new user has no history
    }
  }, [user]);

  const saveToStorage = (items: HistoryItem[]) => {
    setHistoryItems(items);
    if (user) {
      localStorage.setItem(`viqa_history_${user.email}`, JSON.stringify(items));
    }
  };

  const addHistoryItem = (itemData: Omit<HistoryItem, 'id' | 'date'>) => {
    const newItem: HistoryItem = {
      ...itemData,
      id: Date.now().toString(),
      date: Date.now()
    };
    // Keep max 50 items
    saveToStorage([newItem, ...historyItems].slice(0, 50));
  };

  const restoreHistoryItem = (item: HistoryItem) => {
    setActiveHistoryItem(item);
  };

  const clearActiveHistoryItem = () => {
    setActiveHistoryItem(null);
  };

  const clearAllHistory = () => {
    saveToStorage([]);
  };

  return (
    <HistoryContext.Provider value={{
      historyItems,
      activeHistoryItem,
      addHistoryItem,
      restoreHistoryItem,
      clearActiveHistoryItem,
      clearAllHistory
    }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (!context) throw new Error('useHistory must be used within a HistoryProvider');
  return context;
}
