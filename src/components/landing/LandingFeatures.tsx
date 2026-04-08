import React from 'react';

const FEATURES = [
  { icon: '💳', title: 'Fiat On/Off Ramp', desc: 'Deposit & withdraw NGN, USD, EUR seamlessly via MoneyGram anchors.' },
  { icon: '🔄', title: 'Instant Swap', desc: 'Swap USDC ↔ NYLD, NGN, USD, EUR with zero slippage.' },
  { icon: '🌉', title: 'CCTP Bridge', desc: 'Move USDC across Stellar, Ethereum & Solana via Circle CCTP V2.' },
  { icon: '📈', title: 'T-Bill Tenures', desc: 'Earn 15–23% APY on tokenized Nigerian Treasury Bills.' },
  { icon: '🔐', title: 'Privy Wallet', desc: 'Login with email or social — no seed phrase needed.' },
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
