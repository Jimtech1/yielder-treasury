import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TABS, type TabId } from '@/components/BottomNav';

interface TopBarProps {
  onWalletClick: () => void;
  onLogoClick?: () => void;
  onTabChange?: (tab: string) => void;
}

const EXTRA_MENU_ITEMS = [
  { id: 'transactions', icon: '📋', label: 'Transaction History' },
  { id: 'bridge', icon: '🌉', label: 'Bridge (CCTP)' },
  { id: 'settings', icon: '⚙️', label: 'Settings' },
];

export default function TopBar({ onWalletClick, onLogoClick, onTabChange }: TopBarProps) {
  const { state, updateState } = useYielder();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <button onClick={() => setMenuOpen(true)} className="text-foreground text-lg mr-1">☰</button>
            <button onClick={onLogoClick} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground">Y</div>
              <span className="font-bold text-foreground text-sm">Yielder</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">${state.usdcBalance.toFixed(2)}</span>
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

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center text-xs font-bold text-primary-foreground">Y</div>
              Yielder
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col py-2">
            <button
              onClick={() => { setMenuOpen(false); onLogoClick?.(); }}
              className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <span className="text-lg">🏠</span>
              <span>Landing Page</span>
            </button>
            <div className="px-4 py-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">Main</span>
            </div>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setMenuOpen(false); onTabChange?.(tab.id); }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
            <div className="px-4 py-1 mt-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">More</span>
            </div>
            {EXTRA_MENU_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setMenuOpen(false); onTabChange?.(item.id); }}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
