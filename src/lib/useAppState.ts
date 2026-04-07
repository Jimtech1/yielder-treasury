import { useState, useEffect, useCallback } from 'react';
import { AppState, loadState, saveState, accrueYield } from './appState';

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Yield accrual timer
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => accrueYield(prev));
    }, 60000); // every 60 seconds
    // Initial accrual
    setState(prev => accrueYield(prev));
    return () => clearInterval(interval);
  }, []);

  // Theme sync
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  const updateState = useCallback((updates: Partial<AppState> | ((prev: AppState) => AppState)) => {
    setState(prev => {
      if (typeof updates === 'function') return updates(prev);
      return { ...prev, ...updates };
    });
  }, []);

  return { state, updateState };
}
