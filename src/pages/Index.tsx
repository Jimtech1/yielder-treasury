import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import LandingPage from './LandingPage';
import DashboardView from './DashboardView';
import RampView from './RampView';
import SwapView from './SwapView';
import BridgeView from './BridgeView';
import TreasuryView from './TreasuryView';
import PortfolioView from './PortfolioView';
import KYCView from './KYCView';
import SettingsView from './SettingsView';
import TransactionsView from './TransactionsView';
import BottomNav, { TabId } from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import WalletModal from '@/components/WalletModal';

function AppShell() {
  const { state } = useYielder();
  const [showLanding, setShowLanding] = useState(!state.walletConnected);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
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
      case 'bridge': return <BridgeView />;
      case 'treasury': return <TreasuryView />;
      case 'portfolio': return <PortfolioView />;
      case 'kyc': return <KYCView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <TopBar onWalletClick={() => setWalletModalOpen(true)} onLogoClick={() => setShowLanding(true)} />
      <WalletModal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
      <main className="flex-1 overflow-y-auto pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto py-4">
          {renderTab()}
        </div>
      </main>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default function Index() {
  return <AppShell />;
}
