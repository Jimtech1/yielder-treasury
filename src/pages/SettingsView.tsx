import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { resetState } from '@/lib/appState';
import KYCView from './KYCView';

export default function SettingsView() {
  const { state, updateState } = useYielder();
  const [showKyc, setShowKyc] = useState(false);

  if (showKyc) {
    return (
      <div className="space-y-4">
        <button onClick={() => setShowKyc(false)} className="text-sm text-primary flex items-center gap-1">← Back to Settings</button>
        <KYCView />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Settings</h2>

      {/* Profile */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Profile</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wallet Type</span>
            <span className="text-foreground font-medium">{state.walletType === 'privy' ? 'Privy (Social)' : 'Stellar Wallet'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Address</span>
            <span className="text-foreground font-mono text-xs">{state.walletAddress.slice(0, 10)}...{state.walletAddress.slice(-6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">KYC Status</span>
            <span className={`font-medium ${state.kycStatus === 'verified' ? 'text-[hsl(var(--yielder-teal))]' : 'text-muted-foreground'}`}>
              {state.kycStatus === 'verified' ? '✅ Verified' : state.kycStatus === 'pending' ? '⏳ Pending' : '❌ Not Started'}
            </span>
          </div>
        </div>
      </div>

      {/* KYC Verification */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">KYC Verification</h3>
            <p className="text-xs text-muted-foreground">Verify your identity to unlock all features</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowKyc(true)}>
            {state.kycStatus === 'verified' ? 'View' : 'Start'}
          </Button>
        </div>
      </div>

      {/* Appearance */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Appearance</h3>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Dark Mode</span>
          <button
            onClick={() => updateState({ theme: state.theme === 'dark' ? 'light' : 'dark' })}
            className={`w-12 h-6 rounded-full relative transition-colors ${state.theme === 'dark' ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 transition-transform ${state.theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Currency */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Default Currency</h3>
        <div className="flex gap-2">
          {['USD', 'NGN', 'EUR'].map(c => (
            <button
              key={c}
              onClick={() => updateState({ defaultCurrency: c })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                state.defaultCurrency === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
            <p className="text-xs text-muted-foreground">Yield updates, maturity alerts</p>
          </div>
          <button
            onClick={() => updateState({ notifications: !state.notifications })}
            className={`w-12 h-6 rounded-full relative transition-colors ${state.notifications ? 'bg-primary' : 'bg-muted'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-primary-foreground absolute top-0.5 transition-transform ${state.notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Wallet */}
      <div className="glass-card rounded-2xl p-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Wallet</h3>
        <Button
          variant="outline"
          onClick={() => updateState({ walletConnected: false, walletType: null, walletAddress: '' })}
          className="w-full"
        >
          Disconnect Wallet
        </Button>
        <Button
          variant="destructive"
          onClick={() => {
            const fresh = resetState();
            updateState(() => fresh);
          }}
          className="w-full"
        >
          Reset All Data
        </Button>
      </div>
    </div>
  );
}
