import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { addTransaction } from '@/lib/appState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * On/Off Ramp Module
 * In production, replace with SEP-24 anchor integration (MoneyGram, Flutterwave, etc.)
 * See: https://developers.stellar.org/docs/anchoring-assets/setup-a-sep24-server
 */
const CURRENCIES = ['NGN', 'USD', 'EUR', 'USDC'] as const;

export default function RampView() {
  const { state, updateState } = useYielder();
  const [currency, setCurrency] = useState<string>('NGN');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setProcessing(true);
    setTimeout(() => {
      updateState(prev => {
        let updated = { ...prev };
        if (currency === 'USDC') {
          updated.usdcBalance += val;
          updated.stellarUsdc += val;
        } else {
          const key = currency.toLowerCase() as 'ngn' | 'usd' | 'eur';
          updated.fiatBalances = { ...prev.fiatBalances, [key]: prev.fiatBalances[key] + val };
        }
        return addTransaction(updated, 'deposit', `Deposited ${val} ${currency}`, val, currency);
      });
      setAmount('');
      setProcessing(false);
    }, 1500);
  };

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setProcessing(true);
    setTimeout(() => {
      updateState(prev => {
        let updated = { ...prev };
        if (currency === 'USDC') {
          if (prev.usdcBalance < val) return prev;
          updated.usdcBalance -= val;
          updated.stellarUsdc = Math.max(0, prev.stellarUsdc - val);
        } else {
          const key = currency.toLowerCase() as 'ngn' | 'usd' | 'eur';
          if (prev.fiatBalances[key] < val) return prev;
          updated.fiatBalances = { ...prev.fiatBalances, [key]: prev.fiatBalances[key] - val };
        }
        return addTransaction(updated, 'withdraw', `Withdrew ${val} ${currency}`, val, currency);
      });
      setAmount('');
      setProcessing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">On/Off Ramp</h2>
      
      {/* Balances */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card p-3 rounded-xl">
          <div className="text-xs text-muted-foreground">USDC</div>
          <div className="text-lg font-bold text-foreground">${state.usdcBalance.toFixed(2)}</div>
        </div>
        <div className="glass-card p-3 rounded-xl">
          <div className="text-xs text-muted-foreground">NGN</div>
          <div className="text-lg font-bold text-foreground">₦{state.fiatBalances.ngn.toFixed(2)}</div>
        </div>
      </div>

      <Tabs defaultValue="deposit">
        <TabsList className="w-full">
          <TabsTrigger value="deposit" className="flex-1">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw" className="flex-1">Withdraw</TabsTrigger>
        </TabsList>

        {['deposit', 'withdraw'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
            {/* Currency */}
            <div className="flex gap-2">
              {CURRENCIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    currency === c ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {/* Amount */}
            <div className="glass-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground">Amount ({currency})</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1"
              />
            </div>
            <Button
              onClick={tab === 'deposit' ? handleDeposit : handleWithdraw}
              disabled={processing || !amount}
              className="w-full gradient-accent text-primary-foreground"
            >
              {processing ? 'Processing...' : tab === 'deposit' ? 'Deposit' : 'Withdraw'}
            </Button>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
