import React, { useState } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';

/**
 * KYC Module (Simulated)
 * In production, replace with SEP-12 KYC/AML integration.
 * See: https://developers.stellar.org/docs/anchoring-assets/setup-a-sep12-server
 */
export default function KYCView() {
  const { state, updateState } = useYielder();
  const [formData, setFormData] = useState({ fullName: '', idNumber: '', idType: 'bvn', selfie: false });

  const handleSubmit = () => {
    if (!formData.fullName || !formData.idNumber) return;
    updateState({ kycStatus: 'pending' });
    // Simulate verification
    setTimeout(() => {
      updateState({ kycStatus: 'verified' });
    }, 3000);
  };

  if (state.kycStatus === 'verified') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">KYC Verification</h2>
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="text-5xl mb-4">✅</div>
          <h3 className="text-lg font-semibold text-foreground">Verified</h3>
          <p className="text-sm text-muted-foreground mt-2">Your identity has been verified. All features are unlocked.</p>
        </div>
      </div>
    );
  }

  if (state.kycStatus === 'pending') {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">KYC Verification</h2>
        <div className="glass-card p-8 rounded-2xl text-center">
          <div className="text-5xl mb-4 animate-pulse">⏳</div>
          <h3 className="text-lg font-semibold text-foreground">Under Review</h3>
          <p className="text-sm text-muted-foreground mt-2">Your documents are being verified. This usually takes a few minutes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-foreground">KYC Verification</h2>
      <p className="text-sm text-muted-foreground">Complete identity verification to unlock all features.</p>

      <div className="space-y-4">
        <div className="glass-card rounded-xl p-4">
          <label className="text-xs text-muted-foreground">Full Legal Name</label>
          <input
            type="text"
            value={formData.fullName}
            onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
            placeholder="Enter your full name"
            className="w-full bg-transparent text-foreground text-lg outline-none mt-1"
          />
        </div>

        <div className="glass-card rounded-xl p-4">
          <label className="text-xs text-muted-foreground">ID Type</label>
          <select
            value={formData.idType}
            onChange={e => setFormData(p => ({ ...p, idType: e.target.value }))}
            className="w-full bg-transparent text-foreground text-lg outline-none mt-1"
          >
            <option value="bvn">BVN (Bank Verification Number)</option>
            <option value="nin">NIN (National Identification Number)</option>
            <option value="passport">International Passport</option>
          </select>
        </div>

        <div className="glass-card rounded-xl p-4">
          <label className="text-xs text-muted-foreground">ID Number</label>
          <input
            type="text"
            value={formData.idNumber}
            onChange={e => setFormData(p => ({ ...p, idNumber: e.target.value }))}
            placeholder="Enter ID number"
            className="w-full bg-transparent text-foreground text-lg outline-none mt-1"
          />
        </div>

        <div className="glass-card rounded-xl p-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.selfie}
              onChange={e => setFormData(p => ({ ...p, selfie: e.target.checked }))}
              className="w-5 h-5 rounded"
            />
            <div>
              <div className="text-sm font-medium text-foreground">Selfie Verification</div>
              <div className="text-xs text-muted-foreground">Take a selfie for facial verification</div>
            </div>
          </label>
        </div>

        <Button onClick={handleSubmit} disabled={!formData.fullName || !formData.idNumber} className="w-full gradient-accent text-primary-foreground">
          Submit for Verification
        </Button>
      </div>
    </div>
  );
}
