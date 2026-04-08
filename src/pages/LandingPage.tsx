import React from 'react';
import { Button } from '@/components/ui/button';
import ParticleField from '@/components/ParticleField';
import LandingTicker from '@/components/landing/LandingTicker';
import LandingHowItWorks from '@/components/landing/LandingHowItWorks';
import LandingFeatures from '@/components/landing/LandingFeatures';
import LandingTenures from '@/components/landing/LandingTenures';
import LandingTestimonials from '@/components/landing/LandingTestimonials';
import LandingFooter from '@/components/landing/LandingFooter';

interface LandingPageProps {
  onLaunch: () => void;
}

const TENURES = [
  { days: 90, apy: 15.0 },
  { days: 180, apy: 17.5 },
  { days: 240, apy: 19.0 },
  { days: 365, apy: 23.0 },
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
        {/* Particle canvas */}
        <ParticleField />
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

      <LandingTicker tenures={TENURES} />
      <LandingHowItWorks />
      <LandingFeatures />
      <LandingTenures tenures={TENURES} />
      <LandingTestimonials />

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

      <LandingFooter />
    </div>
  );
}
