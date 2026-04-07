/**
 * Yielder App State Management
 * 
 * Central state stored in localStorage. In production, replace with:
 * - Real wallet SDK state (Privy SDK: @privy-io/react-auth, Stellar: @stellar/wallets-kit)
 * - On-chain balances from Stellar Horizon API
 * - Real T-Bill positions from Etherfuse / smart contract reads
 * - Transaction history from Horizon or indexer
 */

export interface TBillPosition {
  id: string;
  amountUSDC: number;
  amountNYLD: number;
  tenureDays: number;
  apy: number;
  purchaseDate: number; // timestamp
  maturityDate: number; // timestamp
  accruedYield: number; // in NYLD
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'bridge' | 'tbill_buy' | 'tbill_redeem';
  description: string;
  amount: number;
  asset: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface AppState {
  usdcBalance: number;
  nyldBalance: number;
  fiatBalances: { ngn: number; usd: number; eur: number };
  totalYieldEarned: number;
  transactions: Transaction[];
  kycStatus: 'not_started' | 'pending' | 'verified' | 'rejected';
  walletConnected: boolean;
  walletType: 'privy' | 'stellar' | null;
  walletAddress: string;
  stellarUsdc: number;
  ethereumUsdc: number;
  solanaUsdc: number;
  tBillPositions: TBillPosition[];
  usdcToNgn: number;
  usdToNgn: number;
  eurToNgn: number;
  apys: Record<number, number>;
  lastYieldUpdate: number;
  theme: 'light' | 'dark';
  defaultCurrency: string;
  notifications: boolean;
}

const DEFAULT_STATE: AppState = {
  usdcBalance: 1250.00,
  nyldBalance: 0,
  fiatBalances: { ngn: 0, usd: 0, eur: 0 },
  totalYieldEarned: 0,
  transactions: [],
  kycStatus: 'not_started',
  walletConnected: false,
  walletType: null,
  walletAddress: '',
  stellarUsdc: 1250,
  ethereumUsdc: 0,
  solanaUsdc: 0,
  tBillPositions: [],
  usdcToNgn: 1550,
  usdToNgn: 1550,
  eurToNgn: 1700,
  apys: { 90: 15.0, 180: 17.5, 240: 19.0, 365: 23.0 },
  lastYieldUpdate: Date.now(),
  theme: 'dark',
  defaultCurrency: 'USD',
  notifications: true,
};

const STORAGE_KEY = 'yielder_state';

export function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_STATE, ...JSON.parse(saved) };
    }
  } catch {}
  return { ...DEFAULT_STATE };
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState(): AppState {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_STATE };
}

export function addTransaction(
  state: AppState,
  type: Transaction['type'],
  description: string,
  amount: number,
  asset: string
): AppState {
  const tx: Transaction = {
    id: crypto.randomUUID(),
    type,
    description,
    amount,
    asset,
    timestamp: Date.now(),
    status: 'completed',
  };
  return { ...state, transactions: [tx, ...state.transactions] };
}

/**
 * Yield accrual: iterates T-Bill positions, calculates yield based on APY and elapsed time.
 * In production, yield would come from on-chain token balance (NYLD rebasing or claim).
 */
export function accrueYield(state: AppState): AppState {
  const now = Date.now();
  const elapsed = (now - state.lastYieldUpdate) / 1000; // seconds
  if (elapsed < 10) return state; // min 10s between accruals

  let totalNewYield = 0;
  const updatedPositions = state.tBillPositions.map(pos => {
    const dailyRate = pos.apy / 100 / 365;
    const daysElapsed = elapsed / 86400;
    const yieldAmount = pos.amountNYLD * dailyRate * daysElapsed;
    totalNewYield += yieldAmount;
    return { ...pos, accruedYield: pos.accruedYield + yieldAmount };
  });

  return {
    ...state,
    tBillPositions: updatedPositions,
    nyldBalance: state.nyldBalance + totalNewYield,
    totalYieldEarned: state.totalYieldEarned + totalNewYield,
    lastYieldUpdate: now,
  };
}

export function generateMockAddress(type: 'privy' | 'stellar'): string {
  const chars = '0123456789ABCDEF';
  let addr = '';
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return type === 'stellar' ? 'G' + addr.substring(0, 55) : '0x' + addr;
}
