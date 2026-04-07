import React, { createContext, useContext, ReactNode } from 'react';
import { AppState } from './appState';
import { useAppState } from './useAppState';

interface AppContextType {
  state: AppState;
  updateState: (updates: Partial<AppState> | ((prev: AppState) => AppState)) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const { state, updateState } = useAppState();
  return (
    <AppContext.Provider value={{ state, updateState }}>
      {children}
    </AppContext.Provider>
  );
}

export function useYielder() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useYielder must be used within AppStateProvider');
  return ctx;
}
