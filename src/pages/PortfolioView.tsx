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
  const total = usdcVal + nyldVal + fiatVal;

  const pieData = {
    labels: ['USDC', 'NYLD (T-Bills)', 'Fiat'],
    datasets: [{
      data: [usdcVal, nyldVal, fiatVal],
      backgroundColor: [
        'hsl(250, 60%, 55%)',
        'hsl(43, 96%, 56%)',
        'hsl(175, 60%, 45%)',
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

      {/* Pie Chart */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="max-w-[200px] mx-auto">
          <Pie data={pieData} options={{ plugins: { legend: { position: 'bottom', labels: { color: 'hsl(220,10%,46%)', font: { size: 11 } } } } }} />
        </div>
      </div>

      {/* Asset Breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Assets</h3>
        {[
          { name: 'USDC', value: state.usdcBalance, display: `$${state.usdcBalance.toFixed(2)}`, icon: '💵' },
          { name: 'NYLD (Total)', value: state.nyldBalance, display: `₦${state.nyldBalance.toFixed(2)}`, icon: '🇳🇬' },
          { name: 'NGN', value: state.fiatBalances.ngn, display: `₦${state.fiatBalances.ngn.toFixed(2)}`, icon: '💱' },
          { name: 'USD', value: state.fiatBalances.usd, display: `$${state.fiatBalances.usd.toFixed(2)}`, icon: '🏦' },
          { name: 'EUR', value: state.fiatBalances.eur, display: `€${state.fiatBalances.eur.toFixed(2)}`, icon: '🏦' },
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
                  <span className="text-sm font-semibold text-foreground">${pos.amountUSDC.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {pos.apy}% APY · {daysLeft}d left · Yield: ₦{pos.accruedYield.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
