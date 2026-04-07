import React from 'react';
import { useYielder } from '@/lib/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { generateMockAddress } from '@/lib/appState';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Wallet Connection Modal
 * 
 * In production, replace with:
 * - Privy SDK: @privy-io/react-auth (usePrivy, useWallets hooks)
 * - Stellar Wallets Kit: @stellar/wallets-kit (Freighter, Albedo)
 * - See: https://docs.privy.io/guide/react/quickstart
 */
export default function WalletModal({ open, onClose }: WalletModalProps) {
  const { updateState } = useYielder();

  const connect = (type: 'privy' | 'stellar') => {
    const addr = generateMockAddress(type);
    updateState({
      walletConnected: true,
      walletType: type,
      walletAddress: addr,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>Choose how you want to connect to Yielder.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          <Button onClick={() => connect('privy')} className="w-full h-14 text-left justify-start gap-4 gradient-accent text-primary-foreground">
            <span className="text-2xl">🔐</span>
            <div>
              <div className="font-semibold">Continue with Privy</div>
              <div className="text-xs opacity-70">Email, Google, Apple — no seed phrase</div>
            </div>
          </Button>
          <Button onClick={() => connect('stellar')} variant="outline" className="w-full h-14 text-left justify-start gap-4">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="font-semibold">Connect Stellar Wallet</div>
              <div className="text-xs text-muted-foreground">Freighter or Albedo</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
