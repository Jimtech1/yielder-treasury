

# Plan: Remove Bridge, Add Stellar Anchor, Update Landing Page with Hero Slider

## Summary

Remove the Bridge feature entirely, add Stellar Anchor as the deposit/withdrawal method for USDC, USD, and EUR (keeping Paydots for NGN), update the landing page features to reflect the new capabilities, and implement an auto-sliding hero section that cycles through feature slides.

## Changes

### 1. Remove Bridge Feature
- **`src/pages/BridgeView.tsx`** -- Delete this file
- **`src/pages/Index.tsx`** -- Remove BridgeView import, remove `'bridge'` from AppTab type and renderTab switch
- **`src/components/TopBar.tsx`** -- Remove Bridge from EXTRA_MENU_ITEMS
- **`src/lib/appState.ts`** -- Remove `ethereumUsdc` and `solanaUsdc` from AppState, keep `stellarUsdc`. Remove bridge-related transaction type references

### 2. Add Stellar Anchor for USDC/USD/EUR Deposits & Withdrawals
- **`src/pages/RampView.tsx`** -- When currency is USD, EUR, or USDC, show "Stellar Anchor" as the payment method (similar to how Paydots is shown for NGN). Add a Stellar Anchor modal with simulated SEP-24 interactive flow for deposits/withdrawals. Display Stellar Anchor branding and explain the process. Keep Paydots for NGN only.

### 3. Update Landing Page Features
- **`src/components/landing/LandingFeatures.tsx`** -- Replace "CCTP Bridge" feature card with "Stellar Anchor" (deposit/withdraw USDC, USD, EUR via Stellar anchors). Update descriptions to match current feature set.
- **`src/pages/LandingPage.tsx`** -- Update hero subtitle text to remove "Bridge" and add "Stellar Anchor". Update trust badges if needed.

### 4. Hero Section Slider (No New Component)
- **`src/pages/LandingPage.tsx`** -- Replace the static hero content with a sliding content system:
  - Define 3-4 slides (e.g., "DeFi Gateway", "Earn 23% APY", "Stellar Anchor Ramp", "Trade Tokenized Assets")
  - Use `useState` for active slide index and `useEffect` with `setInterval` (5s) to auto-advance
  - Use CSS `transition` and `opacity`/`transform` to animate between slides
  - Add dot indicators at the bottom for manual slide selection
  - Each slide has its own headline, subtitle, and badge text
  - The phone mockup and CTA buttons remain static below the sliding text

### 5. Landing Page Sections Update
- **`src/components/landing/LandingHowItWorks.tsx`** -- Minor text updates to remove bridge references

## Technical Details

- Hero slider uses pure React state + CSS transitions (opacity + translateX), no external library
- Stellar Anchor modal reuses the existing Dialog component pattern from Paydots
- Bridge-related state fields (`ethereumUsdc`, `solanaUsdc`) removed; only `stellarUsdc` retained
- `addPlatformFee` calls in BridgeView are removed (swap fees remain as the fee source)

