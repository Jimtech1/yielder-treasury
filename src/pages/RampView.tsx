import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { addTransaction } from '@/lib/appState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

const CURRENCIES = ['NGN', 'USD', 'EUR', 'USDC'] as const;

const PAYDOTS_BANK_DETAILS = {
  bankName: 'Paydots Microfinance Bank',
  accountName: 'Yielder Technologies Ltd',
  accountNumber: '8012345678',
  sortCode: '090-XXX',
};

export default function RampView() {
  const { state, updateState } = useYielder();
  const [currency, setCurrency] = useState<string>('NGN');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showPaydots, setShowPaydots] = useState(false);
  const [showAnchor, setShowAnchor] = useState(false);
  const [anchorStep, setAnchorStep] = useState(0);
  const [rampAction, setRampAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const isNGN = currency === 'NGN';
  const isStellarAnchor = !isNGN;

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setRampAction('deposit');

    if (isNGN) {
      setShowPaydots(true);
    } else {
      setAnchorStep(0);
      setShowAnchor(true);
    }
  };

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setRampAction('withdraw');

    if (isNGN) {
      setShowPaydots(true);
    } else {
      setAnchorStep(0);
      setShowAnchor(true);
    }
  };

  const handlePaydotsConfirm = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    if (rampAction === 'withdraw' && state.fiatBalances.ngn < val) {
      toast.error('Insufficient NGN balance');
      return;
    }
    if (rampAction === 'withdraw' && (!bankName || !accountNumber)) {
      toast.error('Please enter your bank details');
      return;
    }
    setProcessing(true);
    setShowPaydots(false);
    setTimeout(() => {
      updateState(prev => {
        let updated = { ...prev };
        if (rampAction === 'deposit') {
          updated.fiatBalances = { ...prev.fiatBalances, ngn: prev.fiatBalances.ngn + val };
          return addTransaction(updated, 'deposit', `Deposited ₦${val.toLocaleString()} via Paydots`, val, 'NGN');
        } else {
          updated.fiatBalances = { ...prev.fiatBalances, ngn: prev.fiatBalances.ngn - val };
          return addTransaction(updated, 'withdraw', `Withdrew ₦${val.toLocaleString()} via Paydots → ${bankName}`, val, 'NGN');
        }
      });
      setAmount('');
      setBankName('');
      setAccountNumber('');
      setProcessing(false);
      toast.success(rampAction === 'deposit' ? 'NGN deposit confirmed via Paydots!' : 'NGN withdrawal initiated via Paydots!');
    }, 2000);
  };

  const handleAnchorConfirm = () => {
    if (anchorStep < 2) {
      setAnchorStep(s => s + 1);
      return;
    }
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    if (rampAction === 'withdraw') {
      if (currency === 'USDC' && state.usdcBalance < val) { toast.error('Insufficient USDC'); return; }
      const key = currency.toLowerCase() as 'usd' | 'eur';
      if (currency !== 'USDC' && state.fiatBalances[key] < val) { toast.error(`Insufficient ${currency}`); return; }
    }

    setProcessing(true);
    setShowAnchor(false);
    setTimeout(() => {
      updateState(prev => {
        let updated = { ...prev };
        if (currency === 'USDC') {
          if (rampAction === 'deposit') {
            updated.usdcBalance += val;
            updated.stellarUsdc += val;
          } else {
            updated.usdcBalance -= val;
            updated.stellarUsdc = Math.max(0, prev.stellarUsdc - val);
          }
        } else {
          const key = currency.toLowerCase() as 'usd' | 'eur';
          if (rampAction === 'deposit') {
            updated.fiatBalances = { ...prev.fiatBalances, [key]: prev.fiatBalances[key] + val };
          } else {
            updated.fiatBalances = { ...prev.fiatBalances, [key]: prev.fiatBalances[key] - val };
          }
        }
        const label = rampAction === 'deposit' ? 'Deposited' : 'Withdrew';
        return addTransaction(updated, rampAction, `${label} ${val.toLocaleString()} ${currency} via Stellar Anchor`, val, currency);
      });
      setAmount('');
      setProcessing(false);
      setAnchorStep(0);
      toast.success(`${currency} ${rampAction} successful via Stellar Anchor!`);
    }, 2000);
  };

  const anchorSteps = [
    { title: 'Connect to Anchor', desc: 'Initiating SEP-24 interactive session with Stellar Anchor...' },
    { title: 'Verify Identity', desc: 'Anchor KYC verification in progress. This is handled by the anchor.' },
    { title: 'Confirm Transfer', desc: `Confirm ${rampAction === 'deposit' ? 'deposit' : 'withdrawal'} of ${parseFloat(amount || '0').toLocaleString()} ${currency} via Stellar network.` },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">On/Off Ramp</h2>

      {/* Provider banners */}
      <div className="grid grid-cols-1 gap-2">
        <div className={`glass-card p-3 rounded-xl border ${isNGN ? 'border-[hsl(var(--yielder-gold))]/30' : 'border-border'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[hsl(var(--yielder-gold))]/20 flex items-center justify-center text-xs">🏦</div>
            <span className="text-xs font-semibold text-foreground">Paydots MFB</span>
            {isNGN && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--yielder-gold))]/20 text-[hsl(var(--yielder-gold))]">Active</span>}
          </div>
          <p className="text-[10px] text-muted-foreground">NGN deposits & withdrawals</p>
        </div>
        <div className={`glass-card p-3 rounded-xl border ${isStellarAnchor ? 'border-[hsl(var(--yielder-teal))]/30' : 'border-border'}`}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-[hsl(var(--yielder-teal))]/20 flex items-center justify-center text-xs">⭐</div>
            <span className="text-xs font-semibold text-foreground">Stellar Anchor</span>
            {isStellarAnchor && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--yielder-teal))]/20 text-[hsl(var(--yielder-teal))]">Active</span>}
          </div>
          <p className="text-[10px] text-muted-foreground">USDC, USD & EUR via SEP-24</p>
        </div>
      </div>

      {/* Balances */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-3 rounded-xl">
          <div className="text-[10px] text-muted-foreground">USDC</div>
          <div className="text-base font-bold text-foreground">${state.usdcBalance.toFixed(2)}</div>
        </div>
        <div className="glass-card p-3 rounded-xl">
          <div className="text-[10px] text-muted-foreground">NGN</div>
          <div className="text-base font-bold text-foreground">₦{state.fiatBalances.ngn.toLocaleString()}</div>
        </div>
        <div className="glass-card p-3 rounded-xl">
          <div className="text-[10px] text-muted-foreground">USD</div>
          <div className="text-base font-bold text-foreground">${state.fiatBalances.usd.toFixed(2)}</div>
        </div>
        <div className="glass-card p-3 rounded-xl">
          <div className="text-[10px] text-muted-foreground">EUR</div>
          <div className="text-base font-bold text-foreground">€{state.fiatBalances.eur.toFixed(2)}</div>
        </div>
      </div>

      <Tabs defaultValue="deposit">
        <TabsList className="w-full">
          <TabsTrigger value="deposit" className="flex-1 text-xs">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw" className="flex-1 text-xs">Withdraw</TabsTrigger>
        </TabsList>

        {['deposit', 'withdraw'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-3 mt-3">
            <div className="flex gap-2 flex-wrap">
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

            <div className="flex items-center gap-1.5 text-[10px]">
              {isNGN ? (
                <span className="text-[hsl(var(--yielder-gold))]">🏦 Powered by Paydots Microfinance Bank</span>
              ) : (
                <span className="text-[hsl(var(--yielder-teal))]">⭐ Powered by Stellar Anchor (SEP-24)</span>
              )}
            </div>

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
              {processing ? 'Processing...' : tab === 'deposit' ? `Deposit ${currency}` : `Withdraw ${currency}`}
            </Button>
          </TabsContent>
        ))}
      </Tabs>

      {/* Paydots Modal */}
      <Dialog open={showPaydots} onOpenChange={setShowPaydots}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>🏦</span>
              {rampAction === 'deposit' ? 'Deposit NGN via Paydots' : 'Withdraw NGN via Paydots'}
            </DialogTitle>
            <DialogDescription>
              {rampAction === 'deposit'
                ? 'Transfer Naira to the Paydots account below.'
                : 'Enter your bank details for withdrawal.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">₦{parseFloat(amount || '0').toLocaleString()}</div>
            </div>
            {rampAction === 'deposit' ? (
              <div className="glass-card rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-foreground">Transfer to:</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Bank</span><span className="text-foreground font-medium text-right text-xs">{PAYDOTS_BANK_DETAILS.bankName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Account</span><span className="text-foreground font-mono font-bold">{PAYDOTS_BANK_DETAILS.accountNumber}</span></div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Bank Name</label>
                  <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="e.g. GTBank" className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none mt-1" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Account Number</label>
                  <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} placeholder="0123456789" maxLength={10} className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none mt-1" />
                </div>
              </div>
            )}
            <Button onClick={handlePaydotsConfirm} disabled={processing} className="w-full gradient-accent text-primary-foreground">
              {processing ? 'Processing...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stellar Anchor SEP-24 Modal */}
      <Dialog open={showAnchor} onOpenChange={setShowAnchor}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>⭐</span>
              Stellar Anchor · {currency} {rampAction === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </DialogTitle>
            <DialogDescription>SEP-24 Interactive Flow</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {/* Steps */}
            <div className="flex gap-1">
              {anchorSteps.map((_, i) => (
                <div key={i} className={`flex-1 h-1 rounded-full ${i <= anchorStep ? 'bg-[hsl(var(--yielder-teal))]' : 'bg-muted'}`} />
              ))}
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-lg font-bold text-foreground mb-1">{anchorSteps[anchorStep]?.title}</div>
              <p className="text-xs text-muted-foreground">{anchorSteps[anchorStep]?.desc}</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-foreground">{parseFloat(amount || '0').toLocaleString()} {currency}</div>
              <div className="text-[10px] text-muted-foreground mt-1">via Stellar Network</div>
            </div>
            <Button onClick={handleAnchorConfirm} disabled={processing} className="w-full gradient-accent text-primary-foreground">
              {processing ? 'Processing...' : anchorStep < 2 ? 'Continue' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
