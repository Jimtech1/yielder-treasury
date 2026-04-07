import React from 'react';
import { Button } from '@/components/ui/button';

interface LandingPageProps {
  onLaunch: () => void;
}

const TENURES = [
  { days: 90, apy: 15.0 },
  { days: 180, apy: 17.5 },
  { days: 240, apy: 19.0 },
  { days: 365, apy: 23.0 },
];

const FEATURES = [
  { icon: '💳', title: 'Fiat On/Off Ramp', desc: 'Deposit & withdraw NGN, USD, EUR seamlessly via MoneyGram anchors.' },
  { icon: '🔄', title: 'Instant Swap', desc: 'Swap USDC ↔ NYLD, NGN, USD, EUR with zero slippage.' },
  { icon: '🌉', title: 'CCTP Bridge', desc: 'Move USDC across Stellar, Ethereum & Solana via Circle CCTP V2.' },
  { icon: '📈', title: 'T-Bill Tenures', desc: 'Earn 15–23% APY on tokenized Nigerian Treasury Bills.' },
  { icon: '🔐', title: 'Privy Wallet', desc: 'Login with email or social — no seed phrase needed.' },
  { icon: '✅', title: 'KYC Verified', desc: 'SEC-compliant verification for institutional-grade security.' },
];

const TESTIMONIALS = [
  { name: 'Adebayo O.', role: 'Retail Investor', quote: 'Yielder made it incredibly easy to earn yield on my savings. The T-Bill tenure options are fantastic.' },
  { name: 'Sarah K.', role: 'DeFi Enthusiast', quote: 'The CCTP bridge is seamless. Moving USDC between chains has never been this simple.' },
  { name: 'FirstBank Digital', role: 'Institutional Partner', quote: 'We trust Yielder\'s infrastructure for our tokenized asset distribution.' },
];

export default function LandingPage({ onLaunch }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center text-sm font-bold text-primary-foreground">Y</div>
            <span className="text-lg font-bold text-foreground">Yielder</span>
          </div>
          <Button onClick={onLaunch} size="sm" className="gradient-accent text-primary-foreground border-0">
            Launch App
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center gradient-primary overflow-hidden pt-16">
        {/* Floating shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[hsl(var(--yielder-purple)/0.2)] blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[hsl(var(--yielder-teal)/0.15)] blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--yielder-gold)/0.08)] blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[hsl(var(--yielder-gold)/0.15)] border border-[hsl(var(--yielder-gold)/0.3)] text-[hsl(var(--yielder-gold))] text-sm font-medium mb-6">
            🇳🇬 Built for Nigeria, Powered by Stellar
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            The Nigerian Gateway to{' '}
            <span className="text-gradient">Global DeFi</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/70 mb-8 max-w-2xl mx-auto">
            On/Off Ramp · Swap · Bridge · Tokenized Treasury Bills — One App. Earn up to 23% APY on tokenized Nigerian T-Bills.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onLaunch} size="lg" className="gradient-gold text-foreground font-semibold text-lg px-8 py-6 hover:scale-105 transition-transform">
              🚀 Launch App
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>
          {/* Hero phone mockup */}
          <div className="mt-12 relative mx-auto w-64 h-[500px] rounded-[2.5rem] border-4 border-primary-foreground/20 bg-background/10 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-background/20 rounded-b-2xl" />
            <div className="p-4 pt-10 text-left text-primary-foreground/80 text-xs space-y-3">
              <div className="glass-card p-3 rounded-xl">
                <div className="text-primary-foreground/50 text-[10px]">USDC Balance</div>
                <div className="text-xl font-bold text-primary-foreground">$1,250.00</div>
              </div>
              <div className="glass-card p-3 rounded-xl">
                <div className="text-primary-foreground/50 text-[10px]">NYLD Yield</div>
                <div className="text-lg font-bold text-[hsl(var(--yielder-gold))]">+₦12,450</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {TENURES.map(t => (
                  <div key={t.days} className="glass-card p-2 rounded-lg text-center">
                    <div className="text-[10px] text-primary-foreground/50">{t.days}d</div>
                    <div className="text-sm font-bold text-[hsl(var(--yielder-gold))]">{t.apy}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-8 border-b border-border bg-muted/50">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center items-center gap-8 text-muted-foreground text-sm font-medium">
          {['Stellar', 'Circle CCTP', 'Etherfuse', 'Privy', 'MoneyGram'].map(name => (
            <div key={name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-6 h-6 rounded-full bg-muted-foreground/20" />
              <span>{name}</span>
            </div>
          ))}
          <div className="px-3 py-1 rounded-full border border-[hsl(var(--yielder-gold)/0.4)] text-[hsl(var(--yielder-gold))] text-xs">
            SEC-registered partner
          </div>
        </div>
      </section>

      {/* Live Ticker */}
      <section className="py-3 bg-card border-b border-border overflow-hidden">
        <div className="animate-ticker whitespace-nowrap flex gap-8 text-sm">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="text-muted-foreground">USDC <span className="text-foreground font-semibold">$1.00</span></span>
              <span className="text-muted-foreground">NYLD <span className="text-foreground font-semibold">₦1,550</span></span>
              {TENURES.map(t => (
                <span key={t.days} className="text-muted-foreground">
                  {t.days}d APY <span className="text-[hsl(var(--yielder-gold))] font-semibold">{t.apy}%</span>
                </span>
              ))}
              <span className="text-muted-foreground mx-4">•</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground mb-12 max-w-xl mx-auto">Start earning yield on tokenized Nigerian Treasury Bills in three simple steps.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Deposit', desc: 'Fund with fiat (NGN, USD, EUR) or USDC via our secure on-ramp.' },
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

      {/* Features */}
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

      {/* T-Bill Tenures Preview */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">T-Bill Tenure Options</h2>
          <p className="text-muted-foreground mb-12">Backed 1:1 by Nigerian Government Treasury Bills</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TENURES.map(t => (
              <div key={t.days} className="glass-card p-6 rounded-2xl border-2 border-transparent hover:border-[hsl(var(--yielder-gold)/0.5)] transition-all hover:scale-105 group">
                <div className="text-sm text-muted-foreground mb-1">Tenure</div>
                <div className="text-2xl font-bold text-foreground mb-3">{t.days} Days</div>
                <div className="text-4xl font-bold text-gradient mb-3">{t.apy}%</div>
                <div className="text-xs text-muted-foreground">APY</div>
                <div className="mt-4 text-xs text-muted-foreground">
                  Min. $10 USDC · Yield: ~${(100 * t.apy / 100 * t.days / 365).toFixed(2)} per $100
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
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

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 rounded-3xl gradient-primary">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Start Earning Today</h2>
          <p className="text-primary-foreground/70 mb-8">Join thousands of Nigerians earning yield on tokenized Treasury Bills.</p>
          <Button onClick={onLaunch} size="lg" className="gradient-gold text-foreground font-semibold text-lg px-10 py-6 hover:scale-105 transition-transform">
            🚀 Launch App
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-4 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-md gradient-accent" />
              <span className="font-bold text-foreground">Yielder</span>
            </div>
            <p className="text-muted-foreground">The Nigerian Gateway to Global DeFi. Built on Stellar.</p>
          </div>
          {[
            { title: 'Product', links: ['Dashboard', 'T-Bills', 'Bridge', 'Swap'] },
            { title: 'Resources', links: ['Documentation', 'API', 'Support', 'Blog'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Compliance', 'KYC Policy'] },
          ].map(col => (
            <div key={col.title}>
              <h4 className="font-semibold text-foreground mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(l => (
                  <li key={l}><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center text-xs text-muted-foreground">
          <span>© 2026 Yielder. All rights reserved.</span>
          <div className="flex gap-4 mt-4 sm:mt-0">
            {['Twitter', 'Discord', 'Telegram', 'GitHub'].map(s => (
              <a key={s} href="#" className="hover:text-foreground transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
