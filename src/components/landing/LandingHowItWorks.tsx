import React from 'react';

export default function LandingHowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
        <p className="text-muted-foreground mb-12 max-w-xl mx-auto">Start earning yield on tokenized Nigerian Treasury Bills in three simple steps.</p>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Deposit & Mint', desc: 'Fund with fiat (NGN, USD, EUR) or USDC. Mint NYLD tokens 1:1 with NGN.' },
            { step: '02', title: 'Choose Tenure', desc: 'Select a T-Bill tenure from 90 to 365 days with APY up to 23%.' },
            { step: '03', title: 'Earn Yield', desc: 'Yield accrues daily in NYLD tokens. Redeem anytime.' },
          ].map(item => (
            <div key={item.step} className="glass-card p-8 rounded-2xl hover:scale-105 transition-transform">
              <div className="text-5xl font-bold text-gradient mb-4">{item.step}</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
