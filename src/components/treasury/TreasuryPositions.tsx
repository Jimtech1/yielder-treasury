import React from 'react';
import { Button } from '@/components/ui/button';
import { TBillPosition } from '@/lib/appState';

interface Props {
  positions: TBillPosition[];
  onRedeem: (id: string) => void;
}

export default function TreasuryPositions({ positions, onRedeem }: Props) {
  if (positions.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">Your Positions</h3>
      <div className="space-y-3">
        {positions.map(pos => {
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
                <Button size="sm" variant={isMatured ? 'default' : 'outline'} onClick={() => onRedeem(pos.id)}>
                  Redeem
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
                <div>
                  <div className="text-muted-foreground">Principal</div>
                  <div className="font-semibold text-foreground">₦{pos.amountNYLD.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Yield</div>
                  <div className="font-semibold text-[hsl(var(--yielder-gold))]">+₦{pos.accruedYield.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total</div>
                  <div className="font-semibold text-foreground">₦{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                </div>
              </div>
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
  );
}
