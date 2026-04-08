import React from 'react';

interface Props {
  tenures: { days: number; apy: number }[];
}

export default function LandingTicker({ tenures }: Props) {
  return (
    <section className="py-3 bg-card border-b border-border overflow-hidden">
      <div className="animate-ticker whitespace-nowrap flex gap-8 text-sm">
        {[...Array(2)].map((_, i) => (
          <React.Fragment key={i}>
            <span className="text-muted-foreground">USDC <span className="text-foreground font-semibold">$1.00</span></span>
            <span className="text-muted-foreground">NYLD <span className="text-foreground font-semibold">₦1 (1:1 NGN)</span></span>
            {tenures.map(t => (
              <span key={t.days} className="text-muted-foreground">
                {t.days}d APY <span className="text-[hsl(var(--yielder-gold))] font-semibold">{t.apy}%</span>
              </span>
            ))}
            <span className="text-muted-foreground mx-4">•</span>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}
