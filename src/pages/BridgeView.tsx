import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { addTransaction, addPlatformFee } from '@/lib/appState';

/**
 * Bridge Module – Circle CCTP V2 Only
 * In production, integrate with @circle/cctp-sdk for real cross-chain USDC transfers.
 * See: https://developers.circle.com/stablecoins/transfer-usdc-on-testnet-from-ethereum-to-avalanche
 */
const CHAINS = ['Stellar', 'Ethereum', 'Solana'] as const;

export default function BridgeView() {
  const { state, updateState } = useYielder();
  const [sourceChain, setSourceChain] = useState('Stellar');
  const [destChain, setDestChain] = useState('Ethereum');
  const [amount, setAmount] = useState('');
  const [bridging, setBridging] = useState(false);
  const [progress, setProgress] = useState(0);

  const chainKey = (c: string) => `${c.toLowerCase()}Usdc` as 'stellarUsdc' | 'ethereumUsdc' | 'solanaUsdc';
  const fee = parseFloat(amount || '0') * 0.0005;

  const handleBridge = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || state[chainKey(sourceChain)] < val) return;
    setBridging(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 10;
      });
    }, 300);

    setTimeout(() => {
      updateState(prev => {
        const net = val - fee;
        // 20% of bridge fee goes to platform pool for NYLD utility yield
        const platformFeeContribution = fee * 0.2;
        let updated = {
          ...prev,
          [chainKey(sourceChain)]: prev[chainKey(sourceChain)] - val,
          [chainKey(destChain)]: prev[chainKey(destChain)] + net,
        };
        updated = addPlatformFee(updated, platformFeeContribution);
        return addTransaction(updated, 'bridge', `Bridged ${val} USDC: ${sourceChain} → ${destChain}`, val, 'USDC');
      });
      setBridging(false);
      setAmount('');
      setProgress(0);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Bridge (CCTP V2)</h2>
      <p className="text-sm text-muted-foreground">Move USDC across chains using Circle's Cross-Chain Transfer Protocol.</p>

      {/* Chain balances */}
      <div className="grid grid-cols-3 gap-3">
        {CHAINS.map(c => (
          <div key={c} className="glass-card p-3 rounded-xl text-center">
            <div className="text-xs text-muted-foreground">{c}</div>
            <div className="text-sm font-bold text-foreground">${state[chainKey(c)].toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Source */}
      <div className="glass-card rounded-xl p-4">
        <label className="text-xs text-muted-foreground">Source Chain</label>
        <select
          value={sourceChain}
          onChange={e => setSourceChain(e.target.value)}
          className="w-full bg-transparent text-foreground text-lg font-semibold outline-none mt-1"
        >
          {CHAINS.filter(c => c !== destChain).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => { setSourceChain(destChain); setDestChain(sourceChain); }}
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary"
        >↕</button>
      </div>

      {/* Dest */}
      <div className="glass-card rounded-xl p-4">
        <label className="text-xs text-muted-foreground">Destination Chain</label>
        <select
          value={destChain}
          onChange={e => setDestChain(e.target.value)}
          className="w-full bg-transparent text-foreground text-lg font-semibold outline-none mt-1"
        >
          {CHAINS.filter(c => c !== sourceChain).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Amount */}
      <div className="glass-card rounded-xl p-4">
        <label className="text-xs text-muted-foreground">Amount (USDC)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1"
        />
        <div className="text-xs text-muted-foreground mt-2">
          Fee: ${fee.toFixed(4)} (0.05%) · Est. time: ~30 seconds
        </div>
      </div>

      {bridging && (
        <div className="glass-card rounded-xl p-4">
          <div className="text-xs text-muted-foreground mb-2">Bridging in progress...</div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full gradient-accent transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <Button onClick={handleBridge} disabled={bridging || !amount} className="w-full gradient-accent text-primary-foreground">
        {bridging ? 'Bridging...' : 'Bridge USDC'}
      </Button>
    </div>
  );
}
