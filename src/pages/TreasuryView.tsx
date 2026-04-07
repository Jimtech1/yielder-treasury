import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { addTransaction, TBillPosition } from '@/lib/appState';

/**
 * Treasury – T-Bill Tenures
 * In production, replace with Etherfuse tokenized bond purchases on Stellar/Soroban.
 * NYLD tokens would be minted via smart contract on purchase.
 */
const TENURES = [
  { days: 90, apy: 15.0, color: 'from-blue-500 to-purple-500' },
  { days: 180, apy: 17.5, color: 'from-purple-500 to-pink-500' },
  { days: 240, apy: 19.0, color: 'from-pink-500 to-orange-500' },
  { days: 365, apy: 23.0, color: 'from-orange-500 to-yellow-500' },
];

export default function TreasuryView() {
  const { state, updateState } = useYielder();
  const [selectedTenure, setSelectedTenure] = useState<typeof TENURES[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [redeemId, setRedeemId] = useState<string | null>(null);

  const handlePurchase = () => {
    const usdcAmount = parseFloat(amount);
    if (!usdcAmount || usdcAmount < 10 || state.usdcBalance < usdcAmount || !selectedTenure) return;

    const nyldAmount = usdcAmount * state.usdcToNgn;
    const now = Date.now();
    const position: TBillPosition = {
      id: crypto.randomUUID(),
      amountUSDC: usdcAmount,
      amountNYLD: nyldAmount,
      tenureDays: selectedTenure.days,
      apy: selectedTenure.apy,
      purchaseDate: now,
      maturityDate: now + selectedTenure.days * 86400000,
      accruedYield: 0,
    };

    updateState(prev => {
      let updated = {
        ...prev,
        usdcBalance: prev.usdcBalance - usdcAmount,
        stellarUsdc: prev.stellarUsdc - usdcAmount,
        nyldBalance: prev.nyldBalance + nyldAmount,
        tBillPositions: [...prev.tBillPositions, position],
      };
      return addTransaction(updated, 'tbill_buy', `Bought ${selectedTenure.days}d T-Bill (${usdcAmount} USDC)`, usdcAmount, 'USDC');
    });
    setAmount('');
    setSelectedTenure(null);
  };

  const handleRedeem = (posId: string) => {
    const pos = state.tBillPositions.find(p => p.id === posId);
    if (!pos) return;
    const isEarly = Date.now() < pos.maturityDate;
    const yieldAmount = isEarly ? pos.accruedYield * 0.5 : pos.accruedYield; // 50% penalty if early
    const totalNYLD = pos.amountNYLD + yieldAmount;
    const usdcReturn = totalNYLD / state.usdcToNgn;

    updateState(prev => {
      let updated = {
        ...prev,
        usdcBalance: prev.usdcBalance + usdcReturn,
        stellarUsdc: prev.stellarUsdc + usdcReturn,
        nyldBalance: prev.nyldBalance - pos.amountNYLD,
        tBillPositions: prev.tBillPositions.filter(p => p.id !== posId),
      };
      return addTransaction(updated, 'tbill_redeem', `Redeemed ${pos.tenureDays}d T-Bill${isEarly ? ' (early)' : ''}`, usdcReturn, 'USDC');
    });
    setRedeemId(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Treasury – T-Bill Tenures</h2>
      <p className="text-sm text-muted-foreground">Tokenized Nigerian Government Treasury Bills, backed 1:1 by NGN.</p>

      {/* Product Cards */}
      <div className="grid grid-cols-2 gap-3">
        {TENURES.map(t => {
          const estYield = (100 * t.apy / 100 * t.days / 365);
          return (
            <button
              key={t.days}
              onClick={() => { setSelectedTenure(t); setAmount(''); }}
              className="glass-card p-4 rounded-2xl text-left hover:scale-[1.03] transition-all border-2 border-transparent hover:border-[hsl(var(--yielder-gold)/0.5)] group"
            >
              <div className="text-xs text-muted-foreground">📅 {t.days} Days</div>
              <div className="text-3xl font-bold text-gradient mt-1">{t.apy}%</div>
              <div className="text-[10px] text-muted-foreground mt-1">APY</div>
              <div className="text-[10px] text-muted-foreground mt-2">Min $10 · ~${estYield.toFixed(2)}/100</div>
            </button>
          );
        })}
      </div>

      {/* Active Positions */}
      {state.tBillPositions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Your Positions</h3>
          <div className="space-y-3">
            {state.tBillPositions.map(pos => {
              const daysLeft = Math.max(0, Math.ceil((pos.maturityDate - Date.now()) / 86400000));
              const isMatured = daysLeft === 0;
              const totalValue = pos.amountNYLD + pos.accruedYield;
              return (
                <div key={pos.id} className="glass-card p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-semibold text-foreground">{pos.tenureDays}-Day T-Bill</div>
                      <div className="text-xs text-muted-foreground">{pos.apy}% APY · {isMatured ? '✅ Matured' : `${daysLeft}d left`}</div>
                    </div>
                    <Button size="sm" variant={isMatured ? 'default' : 'outline'} onClick={() => setRedeemId(pos.id)}>
                      Redeem
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Principal</div>
                      <div className="font-semibold text-foreground">₦{pos.amountNYLD.toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Yield</div>
                      <div className="font-semibold text-[hsl(var(--yielder-gold))]">+₦{pos.accruedYield.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-semibold text-foreground">₦{totalValue.toFixed(2)}</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-accent rounded-full"
                      style={{ width: `${Math.min(100, ((pos.tenureDays - daysLeft) / pos.tenureDays) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      <Dialog open={!!selectedTenure} onOpenChange={(v) => !v && setSelectedTenure(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {selectedTenure?.days}-Day T-Bill</DialogTitle>
            <DialogDescription>{selectedTenure?.apy}% APY · Backed by Nigerian Treasury Bills</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground">Amount (USDC) — min $10</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100"
                min={10}
                className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Available: ${state.usdcBalance.toFixed(2)} USDC
              </div>
            </div>
            {amount && parseFloat(amount) >= 10 && selectedTenure && (
              <div className="text-sm text-muted-foreground space-y-1">
                <div>NYLD received: ₦{(parseFloat(amount) * state.usdcToNgn).toFixed(0)}</div>
                <div>Est. yield at maturity: ₦{(parseFloat(amount) * state.usdcToNgn * selectedTenure.apy / 100 * selectedTenure.days / 365).toFixed(2)}</div>
                <div>Maturity: {new Date(Date.now() + selectedTenure.days * 86400000).toLocaleDateString()}</div>
              </div>
            )}
            <Button onClick={handlePurchase} disabled={!amount || parseFloat(amount) < 10} className="w-full gradient-accent text-primary-foreground">
              Confirm Purchase
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redeem Confirmation */}
      <Dialog open={!!redeemId} onOpenChange={(v) => !v && setRedeemId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem T-Bill</DialogTitle>
            <DialogDescription>
              {redeemId && (() => {
                const pos = state.tBillPositions.find(p => p.id === redeemId);
                if (!pos) return '';
                const isEarly = Date.now() < pos.maturityDate;
                const yieldAmt = isEarly ? pos.accruedYield * 0.5 : pos.accruedYield;
                return isEarly
                  ? `⚠️ Early redemption — 50% yield penalty applies. You'll receive ₦${(pos.amountNYLD + yieldAmt).toFixed(2)}`
                  : `Matured! You'll receive ₦${(pos.amountNYLD + yieldAmt).toFixed(2)}`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setRedeemId(null)} className="flex-1">Cancel</Button>
            <Button onClick={() => redeemId && handleRedeem(redeemId)} className="flex-1 gradient-accent text-primary-foreground">Redeem</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
