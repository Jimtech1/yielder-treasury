import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { addTransaction, TBillPosition } from '@/lib/appState';
import TreasuryPositions from '@/components/treasury/TreasuryPositions';

/**
 * Treasury – T-Bill Tenures (purchased with NYLD)
 * NYLD is tokenized 1:1 with NGN. Users mint NYLD from NGN, then use NYLD to buy T-Bills.
 * In production, replace with Etherfuse tokenized bond purchases on Stellar/Soroban.
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
  const [mintAmount, setMintAmount] = useState('');
  const [showMint, setShowMint] = useState(false);

  /** Mint NYLD from NGN at 1:1 ratio */
  const handleMint = () => {
    const val = parseFloat(mintAmount);
    if (!val || val <= 0 || state.fiatBalances.ngn < val) return;
    updateState(prev => {
      let updated = {
        ...prev,
        fiatBalances: { ...prev.fiatBalances, ngn: prev.fiatBalances.ngn - val },
        nyldBalance: prev.nyldBalance + val,
      };
      return addTransaction(updated, 'swap', `Minted ${val.toLocaleString()} NYLD from NGN (1:1)`, val, 'NYLD');
    });
    setMintAmount('');
    setShowMint(false);
  };

  /** Buy T-Bill with NYLD */
  const handlePurchase = () => {
    const nyldAmount = parseFloat(amount);
    if (!nyldAmount || nyldAmount < 10000 || state.nyldBalance < nyldAmount || !selectedTenure) return;

    const now = Date.now();
    const position: TBillPosition = {
      id: crypto.randomUUID(),
      amountUSDC: nyldAmount / state.usdcToNgn, // track USD equivalent
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
        nyldBalance: prev.nyldBalance - nyldAmount,
        tBillPositions: [...prev.tBillPositions, position],
      };
      return addTransaction(updated, 'tbill_buy', `Bought ${selectedTenure.days}d T-Bill (₦${nyldAmount.toLocaleString()} NYLD)`, nyldAmount, 'NYLD');
    });
    setAmount('');
    setSelectedTenure(null);
  };

  const handleRedeem = (posId: string) => {
    const pos = state.tBillPositions.find(p => p.id === posId);
    if (!pos) return;
    const isEarly = Date.now() < pos.maturityDate;
    const yieldAmount = isEarly ? pos.accruedYield * 0.5 : pos.accruedYield;
    const totalNYLD = pos.amountNYLD + yieldAmount;

    updateState(prev => {
      let updated = {
        ...prev,
        nyldBalance: prev.nyldBalance + totalNYLD,
        tBillPositions: prev.tBillPositions.filter(p => p.id !== posId),
      };
      return addTransaction(updated, 'tbill_redeem', `Redeemed ${pos.tenureDays}d T-Bill${isEarly ? ' (early)' : ''}`, totalNYLD, 'NYLD');
    });
    setRedeemId(null);
  };

  return (
    <div className="space-y-4 overflow-y-auto">
      <h2 className="text-xl font-bold text-foreground">Treasury – T-Bills</h2>

      {/* Mint NYLD Banner */}
      <div className="glass-card p-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">NYLD Balance</div>
          <div className="text-lg font-bold text-[hsl(var(--yielder-gold))]">₦{state.nyldBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <Button size="sm" onClick={() => setShowMint(true)} className="gradient-gold text-foreground text-xs">
          Mint NYLD
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">1 NYLD = 1 NGN · Tokenized 1:1. Buy T-Bills with NYLD tokens.</p>

      {/* Product Cards */}
      <div className="grid grid-cols-2 gap-3">
        {TENURES.map(t => {
          const estYield = (10000 * t.apy / 100 * t.days / 365);
          return (
            <button
              key={t.days}
              onClick={() => { setSelectedTenure(t); setAmount(''); }}
              className="glass-card p-4 rounded-2xl text-left hover:scale-[1.03] transition-all border-2 border-transparent hover:border-[hsl(var(--yielder-gold)/0.5)] group"
            >
              <div className="text-xs text-muted-foreground">📅 {t.days} Days</div>
              <div className="text-3xl font-bold text-gradient mt-1">{t.apy}%</div>
              <div className="text-[10px] text-muted-foreground mt-1">APY</div>
              <div className="text-[10px] text-muted-foreground mt-2">Min ₦10k · ~₦{estYield.toFixed(0)}/₦10k</div>
            </button>
          );
        })}
      </div>

      <TreasuryPositions positions={state.tBillPositions} onRedeem={setRedeemId} />

      {/* Mint NYLD Modal */}
      <Dialog open={showMint} onOpenChange={setShowMint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mint NYLD Tokens</DialogTitle>
            <DialogDescription>Convert NGN to NYLD at 1:1 ratio. NYLD is tokenized Naira for T-Bill purchases.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground">Amount (NGN → NYLD)</label>
              <input
                type="number"
                value={mintAmount}
                onChange={e => setMintAmount(e.target.value)}
                placeholder="100000"
                className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Available: ₦{state.fiatBalances.ngn.toLocaleString()} NGN
              </div>
            </div>
            {mintAmount && parseFloat(mintAmount) > 0 && (
              <div className="text-sm text-muted-foreground">
                You'll receive: <span className="font-semibold text-[hsl(var(--yielder-gold))]">₦{parseFloat(mintAmount).toLocaleString()} NYLD</span>
              </div>
            )}
            <Button onClick={handleMint} disabled={!mintAmount || parseFloat(mintAmount) <= 0 || state.fiatBalances.ngn < parseFloat(mintAmount || '0')} className="w-full gradient-gold text-foreground">
              Mint NYLD
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Modal */}
      <Dialog open={!!selectedTenure} onOpenChange={(v) => !v && setSelectedTenure(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {selectedTenure?.days}-Day T-Bill</DialogTitle>
            <DialogDescription>{selectedTenure?.apy}% APY · Backed by Nigerian Treasury Bills · Pay with NYLD</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground">Amount (NYLD) — min ₦10,000</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100000"
                min={10000}
                className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1"
              />
              <div className="text-xs text-muted-foreground mt-2">
                Available: ₦{state.nyldBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} NYLD
              </div>
            </div>
            {amount && parseFloat(amount) >= 10000 && selectedTenure && (
              <div className="text-sm text-muted-foreground space-y-1">
                <div>NYLD locked: ₦{parseFloat(amount).toLocaleString()}</div>
                <div>Est. yield at maturity: ₦{(parseFloat(amount) * selectedTenure.apy / 100 * selectedTenure.days / 365).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div>Maturity: {new Date(Date.now() + selectedTenure.days * 86400000).toLocaleDateString()}</div>
              </div>
            )}
            <Button onClick={handlePurchase} disabled={!amount || parseFloat(amount) < 10000 || state.nyldBalance < parseFloat(amount || '0')} className="w-full gradient-accent text-primary-foreground">
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
                  ? `⚠️ Early redemption — 50% yield penalty. You'll receive ₦${(pos.amountNYLD + yieldAmt).toLocaleString(undefined, { maximumFractionDigits: 0 })} NYLD`
                  : `Matured! You'll receive ₦${(pos.amountNYLD + yieldAmt).toLocaleString(undefined, { maximumFractionDigits: 0 })} NYLD`;
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
