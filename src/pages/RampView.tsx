import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { addTransaction } from '@/lib/appState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';

/**
 * On/Off Ramp Module
 * Paydots Microfinance Bank integration for NGN deposits/withdrawals.
 * In production, replace with SEP-24 anchor integration or Paydots API.
 */
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
  const [paydotsAction, setPaydotsAction] = useState<'deposit' | 'withdraw'>('deposit');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleDeposit = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    // For NGN, route through Paydots
    if (currency === 'NGN') {
      setPaydotsAction('deposit');
      setShowPaydots(true);
      return;
    }

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
        return addTransaction(updated, 'deposit', `Deposited ${val.toLocaleString()} ${currency}`, val, currency);
      });
      setAmount('');
      setProcessing(false);
      toast.success(`${currency} deposit successful!`);
    }, 1500);
  };

  const handleWithdraw = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    // For NGN, route through Paydots
    if (currency === 'NGN') {
      setPaydotsAction('withdraw');
      setShowPaydots(true);
      return;
    }

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
        return addTransaction(updated, 'withdraw', `Withdrew ${val.toLocaleString()} ${currency}`, val, currency);
      });
      setAmount('');
      setProcessing(false);
      toast.success(`${currency} withdrawal successful!`);
    }, 1500);
  };

  const handlePaydotsConfirm = () => {
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    if (paydotsAction === 'withdraw' && state.fiatBalances.ngn < val) {
      toast.error('Insufficient NGN balance');
      return;
    }

    if (paydotsAction === 'withdraw' && (!bankName || !accountNumber)) {
      toast.error('Please enter your bank details');
      return;
    }

    setProcessing(true);
    setShowPaydots(false);

    setTimeout(() => {
      updateState(prev => {
        let updated = { ...prev };
        if (paydotsAction === 'deposit') {
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
      toast.success(paydotsAction === 'deposit' ? 'NGN deposit confirmed via Paydots!' : 'NGN withdrawal initiated via Paydots!');
    }, 2000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">On/Off Ramp</h2>

      {/* Paydots Banner */}
      <div className="glass-card p-3 rounded-xl border border-[hsl(var(--yielder-gold))]/30">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-[hsl(var(--yielder-gold))]/20 flex items-center justify-center text-xs">🏦</div>
          <span className="text-xs font-semibold text-foreground">Paydots Microfinance Bank</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Instant NGN deposits & withdrawals to Nigerian bank accounts</p>
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

            {/* NGN via Paydots indicator */}
            {currency === 'NGN' && (
              <div className="flex items-center gap-1.5 text-[10px] text-[hsl(var(--yielder-gold))]">
                <span>🏦</span>
                <span>Powered by Paydots Microfinance Bank</span>
              </div>
            )}

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
              {currency === 'NGN' && tab === 'withdraw' && (
                <div className="text-[10px] text-muted-foreground mt-1">Available: ₦{state.fiatBalances.ngn.toLocaleString()}</div>
              )}
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
              {paydotsAction === 'deposit' ? 'Deposit NGN via Paydots' : 'Withdraw NGN via Paydots'}
            </DialogTitle>
            <DialogDescription>
              {paydotsAction === 'deposit'
                ? 'Transfer Naira to the Paydots account below to fund your wallet.'
                : 'Enter your Nigerian bank account details for withdrawal.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-foreground">₦{parseFloat(amount || '0').toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">{paydotsAction === 'deposit' ? 'Amount to deposit' : 'Amount to withdraw'}</div>
            </div>

            {paydotsAction === 'deposit' ? (
              <div className="glass-card rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-foreground">Transfer to:</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="text-foreground font-medium">{PAYDOTS_BANK_DETAILS.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="text-foreground font-medium">{PAYDOTS_BANK_DETAILS.accountName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account No.</span>
                    <span className="text-foreground font-mono font-bold">{PAYDOTS_BANK_DETAILS.accountNumber}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">After transferring, click confirm below. Funds will reflect within minutes.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Your Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={e => setBankName(e.target.value)}
                    placeholder="e.g. GTBank, First Bank"
                    className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="0123456789"
                    maxLength={10}
                    className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none mt-1"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">Withdrawals are processed via Paydots MFB. Funds arrive in 1-5 minutes.</p>
              </div>
            )}

            <Button
              onClick={handlePaydotsConfirm}
              disabled={processing}
              className="w-full gradient-accent text-primary-foreground"
            >
              {processing ? 'Processing...' : paydotsAction === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
