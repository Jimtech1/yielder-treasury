import { useState, useEffect, useCallback } from 'react';
import { AppState, loadState, saveState, accrueYield, accrueUtilityYield } from './appState';

export function useAppState() {
  const [state, setState] = useState<AppState>(loadState);

  // Persist on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Yield accrual timer (T-Bill interest + utility yield)
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        let updated = accrueYield(prev);
        updated = accrueUtilityYield(updated);
        return updated;
      });
    }, 60000);
    // Initial accrual
    setState(prev => {
      let updated = accrueYield(prev);
      updated = accrueUtilityYield(updated);
      return updated;
    });
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
