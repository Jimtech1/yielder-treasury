import React from 'react';
import { useYielder } from '@/lib/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

export default function DashboardView() {
  const { state } = useYielder();

  const totalNYLDValue = state.nyldBalance / state.usdcToNgn;
  const portfolioValue = state.usdcBalance + totalNYLDValue;
  const activePositions = state.tBillPositions.length;
  const bestApy = Math.max(...Object.values(state.apys));

  // Mock 7-day chart data
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const baseVal = portfolioValue * 0.95;
  const chartData = {
    labels,
    datasets: [{
      data: labels.map((_, i) => baseVal + (portfolioValue - baseVal) * (i / 6) + Math.random() * 20 - 10),
      borderColor: 'hsl(260, 60%, 60%)',
      backgroundColor: 'hsla(260, 60%, 60%, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
    }],
  };

  // Estimated dual yield APY
  const avgBaseApy = Object.values(state.apys).reduce((a, b) => a + b, 0) / Object.values(state.apys).length;
  const utilityApy = state.platformFeePool > 0 && state.totalNyldSupply > 0
    ? ((state.platformFeePool * 0.10 * 365) / state.totalNyldSupply) * 100 * state.usdcToNgn
    : 2.3;
  const totalDualApy = avgBaseApy + utilityApy;

  const cards = [
    { label: 'USDC Balance', value: `$${state.usdcBalance.toFixed(2)}`, color: 'gradient-accent' },
    { label: 'NYLD Balance', value: `₦${state.nyldBalance.toFixed(2)}`, color: 'gradient-gold' },
    { label: 'Yield Earned', value: `₦${state.totalYieldEarned.toFixed(2)}`, color: 'gradient-primary' },
    { label: 'NYLD Total APY', value: `${totalDualApy.toFixed(1)}%`, color: 'gradient-accent' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2">
        {cards.map(c => (
          <div key={c.label} className={`${c.color} rounded-2xl p-3`}>
            <div className="text-[10px] text-primary-foreground/70">{c.label}</div>
            <div className="text-base font-bold text-primary-foreground mt-0.5 truncate">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Portfolio (7 Days)</h3>
        <Line data={chartData} options={{
          responsive: true,
          plugins: { tooltip: { enabled: true } },
          scales: {
            x: { display: true, grid: { display: false }, ticks: { color: 'hsl(220,10%,46%)', font: { size: 10 } } },
            y: { display: false },
          },
        }} />
      </div>

      {/* Active Positions */}
      {activePositions > 0 && (
        <div className="glass-card rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Active T-Bill Positions</h3>
          <div className="space-y-2">
            {state.tBillPositions.slice(0, 3).map(pos => {
              const daysLeft = Math.max(0, Math.ceil((pos.maturityDate - Date.now()) / 86400000));
              return (
                <div key={pos.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div>
                    <div className="text-sm font-medium text-foreground">{pos.tenureDays}d T-Bill</div>
                    <div className="text-xs text-muted-foreground">{daysLeft} days left · {pos.apy}% APY</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">₦{pos.amountNYLD.toFixed(0)}</div>
                    <div className="text-xs text-[hsl(var(--yielder-gold))]">+₦{pos.accruedYield.toFixed(2)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Recent Activity</h3>
        {state.transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {state.transactions.slice(0, 3).map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <div>
                  <div className="text-sm font-medium text-foreground">{tx.description}</div>
                  <div className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleDateString()}</div>
                </div>
                <div className="text-sm font-semibold text-foreground">{tx.amount.toFixed(2)} {tx.asset}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
