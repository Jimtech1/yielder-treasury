import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { addTransaction, TBillPosition, CommercialPaperToken, OtherProduct, claimUtilityRewards } from '@/lib/appState';
import TreasuryPositions from '@/components/treasury/TreasuryPositions';
import { toast } from 'sonner';

/**
 * Treasury – T-Bill Tenures, Commercial Paper, and Other Investment Products
 * In production, replace with Etherfuse tokenized bond purchases on Stellar/Soroban.
 */
const TENURES = [
  { days: 90, apy: 15.0 },
  { days: 180, apy: 17.5 },
  { days: 240, apy: 19.0 },
  { days: 365, apy: 23.0 },
];

const CP_PRODUCTS = [
  { issuer: 'First Bank of Nigeria', tenures: [30, 60, 90], apy: 12.5, minInvest: 100 },
  { issuer: 'Dangote Industries', tenures: [60, 90, 120], apy: 14.0, minInvest: 200 },
  { issuer: 'MTN Nigeria', tenures: [30, 90], apy: 13.5, minInvest: 100 },
  { issuer: 'Zenith Bank', tenures: [60, 120], apy: 15.0, minInvest: 150 },
];

const OTHER_PRODUCTS = [
  { name: 'Lagos State Green Bond 2028', type: 'Green Bond', tenure: 730, apy: 14.0, minInvest: 500, active: true },
  { name: 'Zenith Bank Corporate Bond', type: 'Corporate Bond', tenure: 365, apy: 16.5, minInvest: 300, active: true },
  { name: 'FGN Savings Bond', type: 'Savings Bond', tenure: 730, apy: 12.0, minInvest: 100, active: false },
  { name: 'Access Bank Real Estate Token', type: 'Real Estate', tenure: 1095, apy: 18.0, minInvest: 1000, active: false },
];

export default function TreasuryView() {
  const { state, updateState } = useYielder();
  const [selectedTenure, setSelectedTenure] = useState<typeof TENURES[0] | null>(null);
  const [amount, setAmount] = useState('');
  const [redeemId, setRedeemId] = useState<string | null>(null);
  const [mintAmount, setMintAmount] = useState('');
  const [showMint, setShowMint] = useState(false);
  // CP modal
  const [selectedCp, setSelectedCp] = useState<typeof CP_PRODUCTS[0] | null>(null);
  const [cpTenure, setCpTenure] = useState(30);
  const [cpAmount, setCpAmount] = useState('');
  // Other product modal
  const [selectedOther, setSelectedOther] = useState<typeof OTHER_PRODUCTS[0] | null>(null);
  const [otherAmount, setOtherAmount] = useState('');

  const handleMint = () => {
    const val = parseFloat(mintAmount);
    if (!val || val <= 0 || state.fiatBalances.ngn < val) return;
    updateState(prev => {
      let updated = { ...prev, fiatBalances: { ...prev.fiatBalances, ngn: prev.fiatBalances.ngn - val }, nyldBalance: prev.nyldBalance + val };
      return addTransaction(updated, 'swap', `Minted ${val.toLocaleString()} NYLD from NGN (1:1)`, val, 'NYLD');
    });
    setMintAmount('');
    setShowMint(false);
  };

  const handlePurchase = () => {
    const nyldAmount = parseFloat(amount);
    if (!nyldAmount || nyldAmount < 10000 || state.nyldBalance < nyldAmount || !selectedTenure) return;
    const now = Date.now();
    const position: TBillPosition = {
      id: crypto.randomUUID(), amountUSDC: nyldAmount / state.usdcToNgn, amountNYLD: nyldAmount,
      tenureDays: selectedTenure.days, apy: selectedTenure.apy, purchaseDate: now,
      maturityDate: now + selectedTenure.days * 86400000, accruedYield: 0,
    };
    updateState(prev => {
      let updated = { ...prev, nyldBalance: prev.nyldBalance - nyldAmount, tBillPositions: [...prev.tBillPositions, position] };
      return addTransaction(updated, 'tbill_buy', `Bought ${selectedTenure.days}d T-Bill (₦${nyldAmount.toLocaleString()} NYLD)`, nyldAmount, 'NYLD');
    });
    setAmount(''); setSelectedTenure(null);
  };

  const handleRedeem = (posId: string) => {
    const pos = state.tBillPositions.find(p => p.id === posId);
    if (!pos) return;
    const isEarly = Date.now() < pos.maturityDate;
    const yieldAmount = isEarly ? pos.accruedYield * 0.5 : pos.accruedYield;
    const totalNYLD = pos.amountNYLD + yieldAmount;
    updateState(prev => {
      let updated = { ...prev, nyldBalance: prev.nyldBalance + totalNYLD, tBillPositions: prev.tBillPositions.filter(p => p.id !== posId) };
      return addTransaction(updated, 'tbill_redeem', `Redeemed ${pos.tenureDays}d T-Bill${isEarly ? ' (early)' : ''}`, totalNYLD, 'NYLD');
    });
    setRedeemId(null);
  };

  const handleClaimRewards = () => updateState(prev => claimUtilityRewards(prev));

  const handleBuyCp = () => {
    const val = parseFloat(cpAmount);
    if (!selectedCp || !val || val < selectedCp.minInvest || state.usdcBalance < val) return;
    const now = Date.now();
    const token: CommercialPaperToken = {
      id: crypto.randomUUID(), issuer: selectedCp.issuer, tenureDays: cpTenure,
      apy: selectedCp.apy, amountUSDC: val, purchaseDate: now,
      maturityDate: now + cpTenure * 86400000, accruedYield: 0,
    };
    updateState(prev => {
      let updated = { ...prev, usdcBalance: prev.usdcBalance - val, stellarUsdc: prev.stellarUsdc - val, commercialPaperTokens: [...prev.commercialPaperTokens, token] };
      return addTransaction(updated, 'cp_buy', `Bought ${selectedCp.issuer} CP (${cpTenure}d, $${val})`, val, 'USDC');
    });
    setCpAmount(''); setSelectedCp(null);
    toast.success('Commercial Paper purchased!');
  };

  const handleBuyOther = () => {
    const val = parseFloat(otherAmount);
    if (!selectedOther || !val || val < selectedOther.minInvest || state.usdcBalance < val) return;
    const now = Date.now();
    const product: OtherProduct = {
      id: crypto.randomUUID(), name: selectedOther.name, type: selectedOther.type,
      tenureDays: selectedOther.tenure, apy: selectedOther.apy, amountUSDC: val,
      purchaseDate: now, maturityDate: now + selectedOther.tenure * 86400000, accruedYield: 0,
    };
    updateState(prev => {
      let updated = { ...prev, usdcBalance: prev.usdcBalance - val, stellarUsdc: prev.stellarUsdc - val, otherProducts: [...prev.otherProducts, product] };
      return addTransaction(updated, 'product_buy', `Invested in ${selectedOther.name} ($${val})`, val, 'USDC');
    });
    setOtherAmount(''); setSelectedOther(null);
    toast.success('Investment purchased!');
  };

  const estimatedUtilityApy = 3.0;
  const avgBaseApy = Object.values(state.apys).reduce((a, b) => a + b, 0) / Object.values(state.apys).length;
  const totalEstApy = avgBaseApy + estimatedUtilityApy;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Treasury</h2>

      {/* Dual Yield */}
      <div className="glass-card p-3 rounded-xl">
        <h3 className="text-xs font-semibold text-foreground mb-2">🔥 Dual Yield on NYLD</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">{avgBaseApy.toFixed(1)}%</div>
            <div className="text-[9px] text-muted-foreground">T-Bill APY</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[hsl(var(--yielder-gold))]">+{estimatedUtilityApy.toFixed(1)}%</div>
            <div className="text-[9px] text-muted-foreground">Utility</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gradient">{totalEstApy.toFixed(1)}%</div>
            <div className="text-[9px] text-muted-foreground">Total</div>
          </div>
        </div>
      </div>

      {/* Utility Rewards */}
      <div className="glass-card p-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground">Unclaimed Rewards</div>
          <div className="text-sm font-bold text-foreground">${state.utilityRewards.toFixed(4)} USDC</div>
        </div>
        <Button size="sm" onClick={handleClaimRewards} disabled={state.utilityRewards <= 0} className="gradient-accent text-primary-foreground text-xs">Claim</Button>
      </div>

      {/* NYLD Mint Banner */}
      <div className="glass-card p-3 rounded-xl flex items-center justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground">NYLD Balance</div>
          <div className="text-sm font-bold text-[hsl(var(--yielder-gold))]">₦{state.nyldBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
        </div>
        <Button size="sm" onClick={() => setShowMint(true)} className="gradient-gold text-foreground text-xs">Mint NYLD</Button>
      </div>

      {/* Product Tabs */}
      <Tabs defaultValue="tbills" className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="tbills" className="text-xs">Treasury Bills</TabsTrigger>
          <TabsTrigger value="cp" className="text-xs">Commercial Paper</TabsTrigger>
          <TabsTrigger value="other" className="text-xs">Other Products</TabsTrigger>
        </TabsList>

        <TabsContent value="tbills" className="space-y-3 mt-3">
          <div className="grid grid-cols-2 gap-2">
            {TENURES.map(t => (
              <button key={t.days} onClick={() => { setSelectedTenure(t); setAmount(''); }}
                className="glass-card p-3 rounded-xl text-left hover:scale-[1.02] transition-all border border-transparent hover:border-[hsl(var(--yielder-gold)/0.5)]">
                <div className="text-[10px] text-muted-foreground">📅 {t.days} Days</div>
                <div className="text-2xl font-bold text-gradient">{t.apy}%</div>
                <div className="text-[9px] text-muted-foreground">Min ₦10k</div>
              </button>
            ))}
          </div>
          <TreasuryPositions positions={state.tBillPositions} onRedeem={setRedeemId} />
        </TabsContent>

        <TabsContent value="cp" className="space-y-3 mt-3">
          {CP_PRODUCTS.map(cp => (
            <button key={cp.issuer} onClick={() => { setSelectedCp(cp); setCpTenure(cp.tenures[0]); setCpAmount(''); }}
              className="w-full glass-card p-3 rounded-xl text-left hover:scale-[1.01] transition-all border border-transparent hover:border-primary/30">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-semibold text-foreground">{cp.issuer}</div>
                  <div className="text-[10px] text-muted-foreground">{cp.tenures.join('/')}d · Min ${cp.minInvest}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gradient">{cp.apy}%</div>
                  <div className="text-[9px] text-muted-foreground">APY</div>
                </div>
              </div>
            </button>
          ))}
          {state.commercialPaperTokens.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground">Your CP Holdings</h3>
              {state.commercialPaperTokens.map(cp => (
                <div key={cp.id} className="flex justify-between p-2 rounded-lg bg-muted/50 text-xs">
                  <div>
                    <div className="text-foreground font-medium">{cp.issuer}</div>
                    <div className="text-muted-foreground">{cp.tenureDays}d · {cp.apy}%</div>
                  </div>
                  <div className="text-right text-foreground font-semibold">${cp.amountUSDC.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="other" className="space-y-3 mt-3">
          {OTHER_PRODUCTS.map(p => (
            <button key={p.name} onClick={() => p.active ? (setSelectedOther(p), setOtherAmount('')) : null}
              className={`w-full glass-card p-3 rounded-xl text-left transition-all border border-transparent ${p.active ? 'hover:scale-[1.01] hover:border-primary/30' : 'opacity-60'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-semibold text-foreground">{p.name}</span>
                    {!p.active && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">Coming Soon</span>}
                  </div>
                  <div className="text-[10px] text-muted-foreground">{p.type} · {Math.round(p.tenure / 365)}yr · Min ${p.minInvest}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gradient">{p.apy}%</div>
                  <div className="text-[9px] text-muted-foreground">APY</div>
                </div>
              </div>
            </button>
          ))}
          {state.otherProducts.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-foreground">Your Holdings</h3>
              {state.otherProducts.map(p => (
                <div key={p.id} className="flex justify-between p-2 rounded-lg bg-muted/50 text-xs">
                  <div>
                    <div className="text-foreground font-medium">{p.name}</div>
                    <div className="text-muted-foreground">{p.type} · {p.apy}%</div>
                  </div>
                  <div className="text-right text-foreground font-semibold">${p.amountUSDC.toFixed(2)}</div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mint NYLD Modal */}
      <Dialog open={showMint} onOpenChange={setShowMint}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mint NYLD Tokens</DialogTitle>
            <DialogDescription>Convert NGN to NYLD at 1:1 ratio.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground">Amount (NGN → NYLD)</label>
              <input type="number" value={mintAmount} onChange={e => setMintAmount(e.target.value)} placeholder="100000"
                className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1" />
              <div className="text-xs text-muted-foreground mt-2">Available: ₦{state.fiatBalances.ngn.toLocaleString()}</div>
            </div>
            <Button onClick={handleMint} disabled={!mintAmount || parseFloat(mintAmount) <= 0 || state.fiatBalances.ngn < parseFloat(mintAmount || '0')} className="w-full gradient-gold text-foreground">Mint NYLD</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* T-Bill Purchase Modal */}
      <Dialog open={!!selectedTenure} onOpenChange={(v) => !v && setSelectedTenure(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buy {selectedTenure?.days}-Day T-Bill</DialogTitle>
            <DialogDescription>{selectedTenure?.apy}% APY · Pay with NYLD</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground">Amount (NYLD) — min ₦10,000</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100000" min={10000}
                className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1" />
              <div className="text-xs text-muted-foreground mt-2">Available: ₦{state.nyldBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
            {amount && parseFloat(amount) >= 10000 && selectedTenure && (
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Est. yield: ₦{(parseFloat(amount) * selectedTenure.apy / 100 * selectedTenure.days / 365).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                <div>Maturity: {new Date(Date.now() + selectedTenure.days * 86400000).toLocaleDateString()}</div>
              </div>
            )}
            <Button onClick={handlePurchase} disabled={!amount || parseFloat(amount) < 10000 || state.nyldBalance < parseFloat(amount || '0')} className="w-full gradient-accent text-primary-foreground">Confirm Purchase</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Redeem Modal */}
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
                  ? `⚠️ Early redemption — 50% penalty. You'll receive ₦${(pos.amountNYLD + yieldAmt).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : `Matured! You'll receive ₦${(pos.amountNYLD + yieldAmt).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setRedeemId(null)} className="flex-1">Cancel</Button>
            <Button onClick={() => redeemId && handleRedeem(redeemId)} className="flex-1 gradient-accent text-primary-foreground">Redeem</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* CP Purchase Modal */}
      <Dialog open={!!selectedCp} onOpenChange={(v) => !v && setSelectedCp(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCp?.issuer} Commercial Paper</DialogTitle>
            <DialogDescription>{selectedCp?.apy}% APY · Min ${selectedCp?.minInvest} USDC</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-xs text-muted-foreground">Tenure</label>
              <select value={cpTenure} onChange={e => setCpTenure(Number(e.target.value))}
                className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none mt-1">
                {selectedCp?.tenures.map(t => <option key={t} value={t}>{t} Days</option>)}
              </select>
            </div>
            <div className="glass-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground">Amount (USDC)</label>
              <input type="number" value={cpAmount} onChange={e => setCpAmount(e.target.value)} placeholder={String(selectedCp?.minInvest || 100)}
                className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1" />
              <div className="text-xs text-muted-foreground mt-2">Available: ${state.usdcBalance.toFixed(2)}</div>
            </div>
            <Button onClick={handleBuyCp} disabled={!cpAmount || parseFloat(cpAmount) < (selectedCp?.minInvest || 0) || state.usdcBalance < parseFloat(cpAmount || '0')} className="w-full gradient-accent text-primary-foreground">Buy Commercial Paper</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Other Product Modal */}
      <Dialog open={!!selectedOther} onOpenChange={(v) => !v && setSelectedOther(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedOther?.name}</DialogTitle>
            <DialogDescription>{selectedOther?.type} · {selectedOther?.apy}% APY · Min ${selectedOther?.minInvest}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground">Amount (USDC)</label>
              <input type="number" value={otherAmount} onChange={e => setOtherAmount(e.target.value)} placeholder={String(selectedOther?.minInvest || 100)}
                className="w-full bg-transparent text-2xl font-bold text-foreground outline-none mt-1" />
              <div className="text-xs text-muted-foreground mt-2">Available: ${state.usdcBalance.toFixed(2)}</div>
            </div>
            <Button onClick={handleBuyOther} disabled={!otherAmount || parseFloat(otherAmount) < (selectedOther?.minInvest || 0) || state.usdcBalance < parseFloat(otherAmount || '0')} className="w-full gradient-accent text-primary-foreground">Invest</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
