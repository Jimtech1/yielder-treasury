import React from 'react';

export default function LandingFooter() {
  return (
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
  );
}
