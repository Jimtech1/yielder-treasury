import React from 'react';

interface Props {
  tenures: { days: number; apy: number }[];
}

export default function LandingTenures({ tenures }: Props) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">T-Bill Tenure Options</h2>
        <p className="text-muted-foreground mb-12">Backed 1:1 by Nigerian Government Treasury Bills. Purchase with NYLD (1 NYLD = 1 NGN).</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tenures.map(t => (
            <div key={t.days} className="glass-card p-6 rounded-2xl border-2 border-transparent hover:border-[hsl(var(--yielder-gold)/0.5)] transition-all hover:scale-105 group">
              <div className="text-sm text-muted-foreground mb-1">Tenure</div>
              <div className="text-2xl font-bold text-foreground mb-3">{t.days} Days</div>
              <div className="text-4xl font-bold text-gradient mb-3">{t.apy}%</div>
              <div className="text-xs text-muted-foreground">APY</div>
              <div className="mt-4 text-xs text-muted-foreground">
                Min. ₦10,000 NYLD · Yield: ~₦{(10000 * t.apy / 100 * t.days / 365).toFixed(0)} per ₦10k
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
