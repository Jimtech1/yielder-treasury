import React, { useState, useEffect } from 'react';
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

const HERO_SLIDES = [
  {
    badge: '🇳🇬 Built for Nigeria, Powered by Stellar',
    headline: <>The Nigerian Gateway to{' '}<span className="text-gradient">Global DeFi</span></>,
    subtitle: 'On/Off Ramp · Swap · Trade · Tokenized Treasury Bills — One App.',
  },
  {
    badge: '📈 Up to 23% APY on T-Bills',
    headline: <>Earn <span className="text-gradient">Dual Yield</span> on Every Token</>,
    subtitle: 'T-Bill interest + platform utility yield. No staking required — just hold NYLD.',
  },
  {
    badge: '⭐ Stellar Anchor Integration',
    headline: <>Seamless <span className="text-gradient">Global Ramps</span></>,
    subtitle: 'Deposit & withdraw USDC, USD, EUR via Stellar Anchors. NGN via Paydots MFB.',
  },
  {
    badge: '📊 Secondary Market Trading',
    headline: <>Trade <span className="text-gradient">Tokenized Assets</span></>,
    subtitle: 'Buy & sell T-Bills, Commercial Paper, and Bonds with live order books.',
  },
];

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
        <ParticleField />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[hsl(var(--yielder-purple)/0.2)] blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[hsl(var(--yielder-teal)/0.15)] blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[hsl(var(--yielder-gold)/0.08)] blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Sliding content */}
          <div className="relative h-[200px] sm:h-[220px] md:h-[240px] overflow-hidden">
            {HERO_SLIDES.map((slide, i) => (
              <div
                key={i}
                className="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-in-out"
                style={{
                  opacity: i === activeSlide ? 1 : 0,
                  transform: i === activeSlide ? 'translateY(0)' : 'translateY(20px)',
                  pointerEvents: i === activeSlide ? 'auto' : 'none',
                }}
              >
                <div className="inline-block px-4 py-1.5 rounded-full bg-[hsl(var(--yielder-gold)/0.15)] border border-[hsl(var(--yielder-gold)/0.3)] text-[hsl(var(--yielder-gold))] text-sm font-medium mb-4">
                  {slide.badge}
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 leading-tight">
                  {slide.headline}
                </h1>
                <p className="text-base md:text-lg text-primary-foreground/70 max-w-2xl mx-auto">
                  {slide.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-4 mb-6">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === activeSlide ? 'bg-[hsl(var(--yielder-gold))] w-6' : 'bg-primary-foreground/30'
                }`}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button onClick={onLaunch} size="lg" className="gradient-gold text-foreground font-semibold text-lg px-8 py-6 hover:scale-105 transition-transform">
              🚀 Launch App
            </Button>
            <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg">
              Learn More
            </Button>
          </div>

          {/* Phone mockup */}
          <div className="relative mx-auto w-56 h-[420px] rounded-[2.5rem] border-4 border-primary-foreground/20 bg-background/10 backdrop-blur-sm overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-background/20 rounded-b-2xl" />
            <div className="p-3 pt-8 text-left text-primary-foreground/80 text-xs space-y-2">
              <div className="glass-card p-2.5 rounded-xl">
                <div className="text-primary-foreground/50 text-[10px]">USDC Balance</div>
                <div className="text-lg font-bold text-primary-foreground">$1,250.00</div>
              </div>
              <div className="glass-card p-2.5 rounded-xl">
                <div className="text-primary-foreground/50 text-[10px]">NYLD Yield</div>
                <div className="text-base font-bold text-[hsl(var(--yielder-gold))]">+₦12,450</div>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {TENURES.map(t => (
                  <div key={t.days} className="glass-card p-1.5 rounded-lg text-center">
                    <div className="text-[9px] text-primary-foreground/50">{t.days}d</div>
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
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-center items-center gap-6 text-muted-foreground text-sm font-medium">
          {['Stellar', 'Stellar Anchors', 'Etherfuse', 'Paydots MFB', 'Privy'].map(name => (
            <div key={name} className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
              <div className="w-5 h-5 rounded-full bg-muted-foreground/20" />
              <span className="text-xs">{name}</span>
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
