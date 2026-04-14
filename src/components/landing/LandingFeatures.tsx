import React from 'react';

const FEATURES = [
  { icon: '💳', title: 'Fiat On/Off Ramp', desc: 'Deposit & withdraw NGN via Paydots MFB. USD, EUR, USDC via Stellar Anchors.' },
  { icon: '🔄', title: 'Instant Swap', desc: 'Swap USDC ↔ NYLD, NGN, USD, EUR with zero slippage.' },
  { icon: '⭐', title: 'Stellar Anchor', desc: 'Deposit & withdraw USDC, USD, EUR through Stellar SEP-24 interactive anchors.' },
  { icon: '📈', title: 'Treasury Products', desc: 'T-Bills, Commercial Paper & Bonds — earn 12–23% APY on tokenized assets.' },
  { icon: '📊', title: 'Secondary Market', desc: 'Trade tokenized assets with live order books and charts.' },
  { icon: '✅', title: 'KYC Verified', desc: 'SEC-compliant verification for institutional-grade security.' },
];

export default function LandingFeatures() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">Everything You Need</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="glass-card p-6 rounded-2xl text-left hover:scale-105 transition-transform">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
