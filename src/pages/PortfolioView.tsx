import React from 'react';
import { useYielder } from '@/lib/AppContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PortfolioView() {
  const { state } = useYielder();

  const usdcVal = state.usdcBalance;
  const nyldVal = state.nyldBalance / state.usdcToNgn;
  const fiatVal = (state.fiatBalances.ngn / state.usdcToNgn) + state.fiatBalances.usd + (state.fiatBalances.eur / 0.92);
  const cpVal = state.commercialPaperTokens.reduce((s, cp) => s + cp.amountUSDC, 0);
  const otherVal = state.otherProducts.reduce((s, p) => s + p.amountUSDC, 0);
  const total = usdcVal + nyldVal + fiatVal + cpVal + otherVal;

  const pieData = {
    labels: ['USDC', 'NYLD', 'Fiat', 'Commercial Paper', 'Other Products'],
    datasets: [{
      data: [usdcVal, nyldVal, fiatVal, cpVal, otherVal],
      backgroundColor: [
        'hsl(250, 60%, 55%)',
        'hsl(43, 96%, 56%)',
        'hsl(175, 60%, 45%)',
        'hsl(210, 70%, 50%)',
        'hsl(330, 60%, 55%)',
      ],
      borderWidth: 0,
    }],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">Portfolio</h2>

      <div className="glass-card p-6 rounded-2xl text-center">
        <div className="text-sm text-muted-foreground">Total Value (USD)</div>
        <div className="text-3xl font-bold text-foreground mt-1">${total.toFixed(2)}</div>
      </div>

      <div className="glass-card p-4 rounded-2xl">
        <div className="max-w-[200px] mx-auto">
          <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { color: 'hsl(220,10%,46%)', font: { size: 10 } } } } }} />
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Assets</h3>
        {[
          { name: 'USDC', display: `$${state.usdcBalance.toFixed(2)}`, icon: '💵' },
          { name: 'NYLD', display: `₦${state.nyldBalance.toFixed(0)}`, icon: '🇳🇬' },
          { name: 'NGN', display: `₦${state.fiatBalances.ngn.toFixed(2)}`, icon: '💱' },
          { name: 'USD', display: `$${state.fiatBalances.usd.toFixed(2)}`, icon: '🏦' },
          { name: 'EUR', display: `€${state.fiatBalances.eur.toFixed(2)}`, icon: '🏦' },
        ].map(a => (
          <div key={a.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <span className="text-lg">{a.icon}</span>
              <span className="text-sm font-medium text-foreground">{a.name}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">{a.display}</span>
          </div>
        ))}
      </div>

      {/* T-Bill Positions */}
      {state.tBillPositions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">T-Bill Positions</h3>
          {state.tBillPositions.map(pos => {
            const daysLeft = Math.max(0, Math.ceil((pos.maturityDate - Date.now()) / 86400000));
            return (
              <div key={pos.id} className="glass-card p-3 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-foreground">{pos.tenureDays}d T-Bill</span>
                  <span className="text-sm font-semibold text-foreground">₦{pos.amountNYLD.toFixed(0)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{pos.apy}% APY · {daysLeft}d left · +₦{pos.accruedYield.toFixed(2)}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* CP Holdings */}
      {state.commercialPaperTokens.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Commercial Paper</h3>
          {state.commercialPaperTokens.map(cp => {
            const daysLeft = Math.max(0, Math.ceil((cp.maturityDate - Date.now()) / 86400000));
            return (
              <div key={cp.id} className="glass-card p-3 rounded-xl">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-foreground">{cp.issuer}</span>
                  <span className="text-sm font-semibold text-foreground">${cp.amountUSDC.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{cp.apy}% · {cp.tenureDays}d · {daysLeft}d left</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Other Products */}
      {state.otherProducts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Other Investments</h3>
          {state.otherProducts.map(p => (
            <div key={p.id} className="glass-card p-3 rounded-xl">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-foreground">{p.name}</span>
                <span className="text-sm font-semibold text-foreground">${p.amountUSDC.toFixed(2)}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{p.type} · {p.apy}%</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
