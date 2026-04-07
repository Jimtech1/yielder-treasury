import React from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';

interface TopBarProps {
  onWalletClick: () => void;
}

export default function TopBar({ onWalletClick }: TopBarProps) {
  const { state, updateState } = useYielder();

  const toggleTheme = () => {
    updateState({ theme: state.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
      <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground">Y</div>
          <span className="font-bold text-foreground text-sm">Yielder</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-foreground">${state.usdcBalance.toFixed(2)}</span>
          <button onClick={toggleTheme} className="text-muted-foreground hover:text-foreground text-lg">
            {state.theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={onWalletClick} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
            {state.walletConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[hsl(var(--yielder-teal))]" />
                {state.walletAddress.slice(0, 6)}...
              </>
            ) : (
              'Connect'
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
