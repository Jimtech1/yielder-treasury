import React from 'react';

const TABS = [
  { id: 'dashboard', icon: '📊', label: 'Home' },
  { id: 'ramp', icon: '💳', label: 'Ramp' },
  { id: 'swap', icon: '🔄', label: 'Swap' },
  { id: 'market', icon: '📈', label: 'Market' },
  { id: 'treasury', icon: '🏦', label: 'Treasury' },
  { id: 'portfolio', icon: '💼', label: 'Portfolio' },
] as const;

export type TabId = typeof TABS[number]['id'];

interface BottomNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t safe-area-bottom">
      <div className="flex justify-around items-center py-1 px-1 max-w-lg mx-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center py-2 px-1.5 min-w-0 flex-1 rounded-lg transition-all text-xs ${
              activeTab === tab.id
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="text-base mb-0.5">{tab.icon}</span>
            <span className="text-[9px] font-medium leading-tight truncate">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export { TABS };
