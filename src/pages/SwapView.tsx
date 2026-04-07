import React, { useState, useMemo } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { addTransaction } from '@/lib/appState';

/**
 * Swap Module
 * In production, replace with Stellar DEX path payment or Soroban AMM contract.
 * Rates would come from on-chain orderbook or oracle.
 */
const ASSETS = ['USDC', 'NYLD', 'NGN', 'USD', 'EUR'] as const;

export default function SwapView() {
  const { state, updateState } = useYielder();
  const [fromAsset, setFromAsset] = useState('USDC');
  const [toAsset, setToAsset] = useState('NYLD');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const rate = useMemo(() => {
    const rates: Record<string, number> = {
      'USDC-NGN': 1550, 'NGN-USDC': 1/1550,
      'USDC-NYLD': 1550, 'NYLD-USDC': 1/1550,
      'USDC-USD': 1, 'USD-USDC': 1,
      'USDC-EUR': 0.92, 'EUR-USDC': 1/0.92,
      'NGN-NYLD': 1, 'NYLD-NGN': 1,
      'USD-NGN': 1550, 'NGN-USD': 1/1550,
      'EUR-NGN': 1700, 'NGN-EUR': 1/1700,
      'USD-NYLD': 1550, 'NYLD-USD': 1/1550,
      'EUR-NYLD': 1700, 'NYLD-EUR': 1/1700,
      'USD-EUR': 0.92, 'EUR-USD': 1/0.92,
    };
    return rates[`${fromAsset}-${toAsset}`] || 1;
  }, [fromAsset, toAsset]);

  const outputAmount = parseFloat(amount || '0') * rate;

  const getBalance = (asset: string): number => {
    switch (asset) {
      case 'USDC': return state.usdcBalance;
      case 'NYLD': return state.nyldBalance;
      case 'NGN': return state.fiatBalances.ngn;
      case 'USD': return state.fiatBalances.usd;
      case 'EUR': return state.fiatBalances.eur;
      default: return 0;
    }
  };

  const handleSwap = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0 || getBalance(fromAsset) < val) return;
    setProcessing(true);
    setTimeout(() => {
      updateState(prev => {
        let updated = { ...prev };
        // Deduct from
        switch (fromAsset) {
          case 'USDC': updated.usdcBalance -= val; updated.stellarUsdc -= val; break;
          case 'NYLD': updated.nyldBalance -= val; break;
          case 'NGN': updated.fiatBalances = { ...prev.fiatBalances, ngn: prev.fiatBalances.ngn - val }; break;
          case 'USD': updated.fiatBalances = { ...prev.fiatBalances, usd: prev.fiatBalances.usd - val }; break;
          case 'EUR': updated.fiatBalances = { ...prev.fiatBalances, eur: prev.fiatBalances.eur - val }; break;
        }
        // Add to
        const out = val * rate;
        switch (toAsset) {
          case 'USDC': updated.usdcBalance += out; updated.stellarUsdc += out; break;
          case 'NYLD': updated.nyldBalance += out; break;
          case 'NGN': updated.fiatBalances = { ...updated.fiatBalances, ngn: (updated.fiatBalances.ngn || 0) + out }; break;
          case 'USD': updated.fiatBalances = { ...updated.fiatBalances, usd: (updated.fiatBalances.usd || 0) + out }; break;
          case 'EUR': updated.fiatBalances = { ...updated.fiatBalances, eur: (updated.fiatBalances.eur || 0) + out }; break;
        }
        return addTransaction(updated, 'swap', `Swapped ${val} ${fromAsset} → ${out.toFixed(2)} ${toAsset}`, val, fromAsset);
      });
      setAmount('');
      setProcessing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Swap</h2>

      {/* From */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">From</span>
          <span className="text-xs text-muted-foreground">Balance: {getBalance(fromAsset).toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 bg-transparent text-2xl font-bold text-foreground outline-none"
          />
          <select
            value={fromAsset}
            onChange={e => setFromAsset(e.target.value)}
            className="bg-muted rounded-lg px-3 py-2 text-sm font-medium text-foreground outline-none"
          >
            {ASSETS.filter(a => a !== toAsset).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Swap icon */}
      <div className="flex justify-center">
        <button
          onClick={() => { setFromAsset(toAsset); setToAsset(fromAsset); }}
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
        >
          ↕
        </button>
      </div>

      {/* To */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">To</span>
          <span className="text-xs text-muted-foreground">Balance: {getBalance(toAsset).toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 text-2xl font-bold text-foreground">{outputAmount.toFixed(2)}</div>
          <select
            value={toAsset}
            onChange={e => setToAsset(e.target.value)}
            className="bg-muted rounded-lg px-3 py-2 text-sm font-medium text-foreground outline-none"
          >
            {ASSETS.filter(a => a !== fromAsset).map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Rate */}
      <div className="text-xs text-muted-foreground text-center">
        1 {fromAsset} = {rate.toFixed(rate < 1 ? 6 : 2)} {toAsset}
      </div>

      <Button onClick={handleSwap} disabled={processing || !amount} className="w-full gradient-accent text-primary-foreground">
        {processing ? 'Swapping...' : 'Swap'}
      </Button>
    </div>
  );
}
