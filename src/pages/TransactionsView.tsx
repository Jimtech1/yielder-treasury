import React from 'react';
import { useYielder } from '@/lib/AppContext';

export default function TransactionsView() {
  const { state } = useYielder();
  const [filter, setFilter] = React.useState('all');

  const filtered = filter === 'all'
    ? state.transactions
    : state.transactions.filter(tx => tx.type === filter);

  const typeColors: Record<string, string> = {
    deposit: 'bg-[hsl(var(--yielder-teal)/0.15)] text-[hsl(var(--yielder-teal))]',
    withdraw: 'bg-destructive/15 text-destructive',
    swap: 'bg-primary/15 text-primary',
    bridge: 'bg-[hsl(var(--yielder-purple)/0.15)] text-[hsl(var(--yielder-purple))]',
    tbill_buy: 'bg-[hsl(var(--yielder-gold)/0.15)] text-[hsl(var(--yielder-gold))]',
    tbill_redeem: 'bg-[hsl(var(--yielder-gold)/0.15)] text-[hsl(var(--yielder-gold))]',
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Transactions</h2>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'deposit', 'withdraw', 'swap', 'bridge', 'tbill_buy', 'tbill_redeem'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No transactions found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map(tx => (
            <div key={tx.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground">{tx.description}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${typeColors[tx.type] || 'bg-muted text-muted-foreground'}`}>
                    {tx.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">{new Date(tx.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">{tx.amount.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">{tx.asset}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
