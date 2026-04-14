import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import LandingPage from './LandingPage';
import DashboardView from './DashboardView';
import RampView from './RampView';
import SwapView from './SwapView';
import SecondaryMarketView from './SecondaryMarketView';
import TreasuryView from './TreasuryView';
import PortfolioView from './PortfolioView';
import SettingsView from './SettingsView';
import TransactionsView from './TransactionsView';

import BottomNav, { TabId } from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import WalletModal from '@/components/WalletModal';

type AppTab = TabId | 'settings' | 'transactions';

function AppShell() {
  const { state } = useYielder();
  const [showLanding, setShowLanding] = useState(!state.walletConnected);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [walletModalOpen, setWalletModalOpen] = useState(false);

  if (showLanding) {
    return (
      <>
        <LandingPage onLaunch={() => {
          if (state.walletConnected) {
            setShowLanding(false);
          } else {
            setWalletModalOpen(true);
          }
        }} />
        <WalletModal open={walletModalOpen} onClose={() => {
          setWalletModalOpen(false);
          if (state.walletConnected) setShowLanding(false);
        }} />
      </>
    );
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'ramp': return <RampView />;
      case 'swap': return <SwapView />;
      case 'market': return <SecondaryMarketView />;
      case 'treasury': return <TreasuryView />;
      case 'portfolio': return <PortfolioView />;
      case 'transactions': return <TransactionsView />;
      case 'settings': return <SettingsView />;
      
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopBar onWalletClick={() => setWalletModalOpen(true)} onLogoClick={() => setShowLanding(true)} onTabChange={(tab) => setActiveTab(tab as AppTab)} />
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      <main className="flex-1 overflow-y-auto pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto py-4">
          {renderTab()}
        </div>
      </main>
      <BottomNav activeTab={['settings', 'transactions'].includes(activeTab) ? 'dashboard' : activeTab as TabId} onTabChange={setActiveTab} />
    </div>
  );
}

export default function Index() {
  return <AppShell />;
}
