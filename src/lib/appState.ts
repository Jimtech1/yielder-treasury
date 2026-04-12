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
  purchaseDate: number;
  maturityDate: number;
  accruedYield: number;
}

export interface CommercialPaperToken {
  id: string;
  issuer: string;
  tenureDays: number;
  apy: number;
  amountUSDC: number;
  purchaseDate: number;
  maturityDate: number;
  accruedYield: number;
}

export interface OtherProduct {
  id: string;
  name: string;
  type: string;
  tenureDays: number;
  apy: number;
  amountUSDC: number;
  purchaseDate: number;
  maturityDate: number;
  accruedYield: number;
}

export interface OpenOrder {
  id: string;
  asset: string;
  side: 'buy' | 'sell';
  orderType: 'limit' | 'market';
  price: number;
  quantity: number;
  filled: number;
  timestamp: number;
}

export interface TradeRecord {
  id: string;
  date: number;
  asset: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  total: number;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw' | 'swap' | 'bridge' | 'tbill_buy' | 'tbill_redeem' | 'claim_utility_rewards' | 'cp_buy' | 'product_buy' | 'trade';
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
  platformFeePool: number;
  totalNyldSupply: number;
  utilityRewards: number;
  lastUtilityUpdate: number;
  commercialPaperTokens: CommercialPaperToken[];
  otherProducts: OtherProduct[];
  openOrders: OpenOrder[];
  tradeHistory: TradeRecord[];
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
  platformFeePool: 50,
  totalNyldSupply: 5000000,
  utilityRewards: 0,
  lastUtilityUpdate: Date.now(),
  commercialPaperTokens: [],
  otherProducts: [],
  openOrders: [],
  tradeHistory: [],
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

export function accrueYield(state: AppState): AppState {
  const now = Date.now();
  const elapsed = (now - state.lastYieldUpdate) / 1000;
  if (elapsed < 10) return state;

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

export function accrueUtilityYield(state: AppState): AppState {
  const now = Date.now();
  const elapsed = (now - state.lastUtilityUpdate) / 1000;
  if (elapsed < 10 || state.nyldBalance <= 0 || state.platformFeePool <= 0) return state;

  const userShare = state.nyldBalance / state.totalNyldSupply;
  const dailyFraction = elapsed / 86400;
  const poolDistribution = state.platformFeePool * 0.10 * dailyFraction;
  const userReward = poolDistribution * userShare;

  return {
    ...state,
    utilityRewards: state.utilityRewards + userReward,
    platformFeePool: state.platformFeePool - userReward,
    lastUtilityUpdate: now,
  };
}

export function addPlatformFee(state: AppState, feeUsdc: number): AppState {
  return {
    ...state,
    platformFeePool: state.platformFeePool + feeUsdc,
  };
}

export function claimUtilityRewards(state: AppState): AppState {
  if (state.utilityRewards <= 0) return state;
  const rewards = state.utilityRewards;
  let updated = {
    ...state,
    usdcBalance: state.usdcBalance + rewards,
    stellarUsdc: state.stellarUsdc + rewards,
    utilityRewards: 0,
  };
  return addTransaction(updated, 'claim_utility_rewards', `Claimed utility rewards: $${rewards.toFixed(4)} USDC`, rewards, 'USDC');
}

export function generateMockAddress(type: 'privy' | 'stellar'): string {
  const chars = '0123456789ABCDEF';
  let addr = '';
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return type === 'stellar' ? 'G' + addr.substring(0, 55) : '0x' + addr;
}

/** All tradable assets on the secondary market */
export function getTradableAssets(state: AppState): string[] {
  const assets = ['NYLD'];
  const cpIssuers = new Set(state.commercialPaperTokens.map(cp => `CP-${cp.issuer}`));
  cpIssuers.forEach(a => assets.push(a));
  const otherNames = new Set(state.otherProducts.map(p => `BOND-${p.name}`));
  otherNames.forEach(a => assets.push(a));
  return assets;
}
