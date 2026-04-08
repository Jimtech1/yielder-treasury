import React from 'react';

const TESTIMONIALS = [
  { name: 'Adebayo O.', role: 'Retail Investor', quote: 'Yielder made it incredibly easy to earn yield on my savings. The T-Bill tenure options are fantastic.' },
  { name: 'Sarah K.', role: 'DeFi Enthusiast', quote: 'The CCTP bridge is seamless. Moving USDC between chains has never been this simple.' },
  { name: 'FirstBank Digital', role: 'Institutional Partner', quote: "We trust Yielder's infrastructure for our tokenized asset distribution." },
];

export default function LandingTestimonials() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">Trusted by Thousands</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="glass-card p-6 rounded-2xl text-left">
              <p className="text-foreground mb-4 italic">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-accent" />
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
