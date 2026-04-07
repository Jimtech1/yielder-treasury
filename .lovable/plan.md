# Yielder – Complete Frontend Build Plan

## Overview

Build a Stellar-based financial dashboard with a stunning landing page, wallet connection (Privy + Stellar), fiat on/off ramp, swap, CCTP bridge, tokenized T-Bill tenures, portfolio, KYC, and settings. All interactions are frontend simulations with localStorage persistence.

## Phase 1: Foundation & Landing Page

### Design System

- Custom CSS variables: deep navy/purple gradients, gold accents, glassmorphism tokens
- Dark/light mode toggle support
- Mobile-first responsive breakpoints

### Landing Page (Long-Form)

- **Hero:** Full-width gradient with floating animated shapes, headline "The Nigerian Gateway to Global DeFi", CTA "Launch App"
- **Trust Badges:** Stellar, Circle, Etherfuse, Privy, MoneyGram logos
- **Live Ticker:** Scrolling prices (USDC, NYLD, APYs per tenure)
- **How It Works:** 3-step visual flow
- **Features Grid:** 6 cards with icons (Ramp, Swap, Bridge, T-Bills, Privy, KYC)
- **App Mockups:** Styled device frames showing dashboard screens
- **Testimonials:** Placeholder user quotes
- **Footer:** Links, social icons

## Phase 2: App Shell & Navigation

- Bottom navigation bar (8 tabs: Dashboard, Ramp, Swap, Bridge, Treasury, Portfolio, KYC, Settings)
- Top bar with wallet indicator, USDC balance, logo, theme toggle
- Central `appState` stored in localStorage with all balances, positions, rates, transactions
- Yield accrual timer (every 60 seconds, iterates T-Bill positions)

## Phase 3: Wallet Connection

- Modal with two options: "Continue with Privy" (email/social) and "Connect Stellar Wallet" (Freighter/Albedo)
- Mock authentication flow, generates wallet address
- Stores `walletType` in state

## Phase 4: Feature Modules

### On/Off Ramp

- Currency selector (NGN, USD, EUR, USDC), Deposit/Withdraw tabs
- Mock anchor flow, updates balances and transaction history

### Swap

- From/To asset selectors, mock exchange rates (1 USDC = 1,550 NGN, etc.)
- Swap button updates balances, records transaction

### Bridge (CCTP V2)

- Source/Destination chain selector (Stellar, Ethereum, Solana)
- USDC only, mock fee (0.05%), ~30s estimate
- Moves USDC between chain balances

### Treasury – T-Bill Tenures

- Grid of 4 product cards (90d/15%, 180d/17.5%, 240d/19%, 365d/23%)
- Each shows tenure, APY, min investment, estimated yield
- Purchase modal: enter NYLD amount → confirm → creates position
- Active positions list with maturity date, accrued yield, redeem button
- Early redemption penalty: 50% of accrued yield forfeited

### Portfolio

- Asset list (USDC, NYLD total, individual T-Bill positions)
- Pie chart (Chart.js) showing allocation

### KYC

- Multi-step form (name, ID, selfie), mock verification status

### Transaction History

- Filterable/searchable table of all transactions

### Settings

- Profile, theme, default currency, wallet management, notifications

## Phase 5: Data Integration & Polish

- All modules share central state; buying T-Bills updates portfolio, balances, history
- Chart.js line chart on dashboard (7-day portfolio value)
- Swipeable summary cards on dashboard
- Scroll animations (fade-in), button pulses, card hover effects
- Glassmorphism styling throughout
- Code comments explaining real SDK integration points (Privy, Circle CCTP V2, Stellar SDK, SEP-24, SEP-12)