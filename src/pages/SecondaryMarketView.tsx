import React, { useState, useEffect, useMemo } from 'react';
import { useYielder } from '@/lib/AppContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { addTransaction, getTradableAssets, OpenOrder, TradeRecord, addPlatformFee } from '@/lib/appState';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

/**
 * Secondary Market – Trading panel for tokenized assets
 * In production, replace with real exchange API or Stellar DEX orderbook integration.
 */

// Generate mock price history (random walk)
function generatePriceHistory(base: number, points: number): number[] {
  const data: number[] = [base];
  for (let i = 1; i < points; i++) {
    const change = (Math.random() - 0.48) * base * 0.02;
    data.push(Math.max(base * 0.8, data[i - 1] + change));
  }
  return data;
}

// Generate mock order book
function generateOrderBook(marketPrice: number) {
  const buys = Array.from({ length: 8 }, (_, i) => ({
    price: +(marketPrice - (i + 1) * marketPrice * 0.002).toFixed(4),
    quantity: +(Math.random() * 5000 + 500).toFixed(0),
  })).map(o => ({ ...o, total: +(o.price * o.quantity).toFixed(2) }));

  const sells = Array.from({ length: 8 }, (_, i) => ({
    price: +(marketPrice + (i + 1) * marketPrice * 0.002).toFixed(4),
    quantity: +(Math.random() * 5000 + 500).toFixed(0),
  })).map(o => ({ ...o, total: +(o.price * o.quantity).toFixed(2) }));

  return { buys, sells: sells.reverse() };
}

const TIMEFRAMES = ['1D', '1W', '1M', '3M'] as const;

export default function SecondaryMarketView() {
  const { state, updateState } = useYielder();
  const tradableAssets = useMemo(() => getTradableAssets(state), [state]);
  const [selectedAsset, setSelectedAsset] = useState(tradableAssets[0] || 'NYLD');
  const [timeframe, setTimeframe] = useState<string>('1W');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderBook, setOrderBook] = useState(() => generateOrderBook(0.000645));

  // Market price for selected asset (NYLD = 1 NGN = ~0.000645 USDC)
  const marketPrice = selectedAsset === 'NYLD' ? 1 / state.usdcToNgn : 0.001;

  // Refresh order book every 5s
  useEffect(() => {
    setOrderBook(generateOrderBook(marketPrice));
    const iv = setInterval(() => setOrderBook(generateOrderBook(marketPrice)), 5000);
    return () => clearInterval(iv);
  }, [marketPrice, selectedAsset]);

  // Chart data
  const pointCount = timeframe === '1D' ? 24 : timeframe === '1W' ? 7 : timeframe === '1M' ? 30 : 90;
  const priceHistory = useMemo(() => generatePriceHistory(marketPrice, pointCount), [marketPrice, pointCount, selectedAsset]);
  const labels = priceHistory.map((_, i) => {
    if (timeframe === '1D') return `${i}h`;
    return `${i + 1}`;
  });

  const chartData = {
    labels,
    datasets: [{
      data: priceHistory,
      borderColor: 'hsl(250, 60%, 60%)',
      backgroundColor: 'hsla(250, 60%, 60%, 0.08)',
      fill: true,
      tension: 0.3,
      pointRadius: 0,
      borderWidth: 2,
    }],
  };

  const total = (parseFloat(price || String(marketPrice)) * parseFloat(quantity || '0'));

  const getAssetBalance = (asset: string): number => {
    if (asset === 'NYLD') return state.nyldBalance;
    if (asset.startsWith('CP-')) {
      return state.commercialPaperTokens
        .filter(cp => `CP-${cp.issuer}` === asset)
        .reduce((s, cp) => s + cp.amountUSDC, 0);
    }
    return 0;
  };

  const handlePlaceOrder = () => {
    const qty = parseFloat(quantity);
    const orderPrice = orderType === 'market' ? marketPrice : parseFloat(price);
    if (!qty || qty <= 0 || !orderPrice) return;

    const orderTotal = qty * orderPrice;

    if (side === 'buy' && state.usdcBalance < orderTotal) return;
    if (side === 'sell' && getAssetBalance(selectedAsset) < qty) return;

    // For market orders, execute immediately
    if (orderType === 'market') {
      updateState(prev => {
        let updated = { ...prev };
        const fee = orderTotal * 0.001;
        if (side === 'buy') {
          updated.usdcBalance -= orderTotal;
          updated.stellarUsdc -= orderTotal;
          if (selectedAsset === 'NYLD') updated.nyldBalance += qty;
        } else {
          if (selectedAsset === 'NYLD') updated.nyldBalance -= qty;
          updated.usdcBalance += orderTotal - fee;
          updated.stellarUsdc += orderTotal - fee;
        }
        updated = addPlatformFee(updated, fee * 0.2);
        const trade: TradeRecord = {
          id: crypto.randomUUID(),
          date: Date.now(),
          asset: selectedAsset,
          side,
          price: orderPrice,
          quantity: qty,
          total: orderTotal,
        };
        updated.tradeHistory = [trade, ...updated.tradeHistory];
        return addTransaction(updated, 'trade', `${side === 'buy' ? 'Bought' : 'Sold'} ${qty} ${selectedAsset} @ $${orderPrice.toFixed(6)}`, orderTotal, selectedAsset);
      });
    } else {
      // Limit order – add to open orders, reserve balance
      updateState(prev => {
        let updated = { ...prev };
        if (side === 'buy') {
          updated.usdcBalance -= orderTotal;
          updated.stellarUsdc -= orderTotal;
        } else {
          if (selectedAsset === 'NYLD') updated.nyldBalance -= qty;
        }
        const order: OpenOrder = {
          id: crypto.randomUUID(),
          asset: selectedAsset,
          side,
          orderType: 'limit',
          price: orderPrice,
          quantity: qty,
          filled: 0,
          timestamp: Date.now(),
        };
        updated.openOrders = [order, ...updated.openOrders];
        return updated;
      });
    }
    setQuantity('');
    setPrice('');
  };

  const handleCancelOrder = (orderId: string) => {
    const order = state.openOrders.find(o => o.id === orderId);
    if (!order) return;
    updateState(prev => {
      let updated = { ...prev };
      const remaining = order.quantity - order.filled;
      if (order.side === 'buy') {
        updated.usdcBalance += remaining * order.price;
        updated.stellarUsdc += remaining * order.price;
      } else {
        if (order.asset === 'NYLD') updated.nyldBalance += remaining;
      }
      updated.openOrders = updated.openOrders.filter(o => o.id !== orderId);
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Secondary Market</h2>

      {/* Asset selector & timeframe */}
      <div className="flex items-center gap-2">
        <select
          value={selectedAsset}
          onChange={e => setSelectedAsset(e.target.value)}
          className="bg-muted rounded-lg px-3 py-2 text-sm font-medium text-foreground outline-none flex-1"
        >
          {tradableAssets.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <span className="text-sm font-bold text-foreground">${marketPrice.toFixed(6)}</span>
      </div>

      {/* Chart */}
      <div className="glass-card rounded-xl p-3">
        <div className="flex gap-1 mb-2">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                timeframe === tf ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <Line data={chartData} options={{
          responsive: true,
          plugins: { tooltip: { enabled: true } },
          scales: {
            x: { display: false },
            y: { display: true, grid: { color: 'hsla(220,10%,46%,0.1)' }, ticks: { color: 'hsl(220,10%,46%)', font: { size: 9 } } },
          },
        }} height={120} />
      </div>

      {/* Order Book */}
      <div className="glass-card rounded-xl p-3">
        <h3 className="text-xs font-semibold text-foreground mb-2">Order Book</h3>
        <div className="grid grid-cols-3 text-[9px] text-muted-foreground mb-1 px-1">
          <span>Price (USDC)</span><span className="text-center">Qty</span><span className="text-right">Total</span>
        </div>
        <div className="space-y-px max-h-24 overflow-y-auto">
          {orderBook.sells.map((o, i) => (
            <div key={`s${i}`} className="grid grid-cols-3 text-[10px] px-1 py-0.5 bg-destructive/5 rounded">
              <span className="text-destructive">{o.price.toFixed(6)}</span>
              <span className="text-center text-foreground">{o.quantity}</span>
              <span className="text-right text-muted-foreground">{o.total.toFixed(2)}</span>
            </div>
          ))}
          <div className="text-center text-xs font-bold text-foreground py-1">${marketPrice.toFixed(6)}</div>
          {orderBook.buys.map((o, i) => (
            <div key={`b${i}`} className="grid grid-cols-3 text-[10px] px-1 py-0.5 bg-[hsl(var(--yielder-teal))]/5 rounded">
              <span className="text-[hsl(var(--yielder-teal))]">{o.price.toFixed(6)}</span>
              <span className="text-center text-foreground">{o.quantity}</span>
              <span className="text-right text-muted-foreground">{o.total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trading Panel */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setSide('buy')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              side === 'buy' ? 'bg-[hsl(var(--yielder-teal))] text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >Buy</button>
          <button
            onClick={() => setSide('sell')}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
              side === 'sell' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >Sell</button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setOrderType('limit')}
            className={`flex-1 py-1.5 rounded text-xs font-medium ${orderType === 'limit' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
          >Limit</button>
          <button
            onClick={() => setOrderType('market')}
            className={`flex-1 py-1.5 rounded text-xs font-medium ${orderType === 'market' ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}
          >Market</button>
        </div>

        {orderType === 'limit' && (
          <div>
            <label className="text-[10px] text-muted-foreground">Price (USDC)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder={marketPrice.toFixed(6)}
              className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none mt-1"
            />
          </div>
        )}

        <div>
          <label className="text-[10px] text-muted-foreground">Quantity ({selectedAsset})</label>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            placeholder="0"
            className="w-full bg-muted rounded-lg px-3 py-2 text-sm text-foreground outline-none mt-1"
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            {side === 'buy' ? `Available: $${state.usdcBalance.toFixed(2)} USDC` : `Available: ${getAssetBalance(selectedAsset).toFixed(2)} ${selectedAsset}`}
          </div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Est. Total:</span>
          <span className="font-semibold text-foreground">${total.toFixed(4)} USDC</span>
        </div>

        <Button
          onClick={handlePlaceOrder}
          disabled={!quantity || parseFloat(quantity) <= 0}
          className={`w-full ${side === 'buy' ? 'bg-[hsl(var(--yielder-teal))] hover:bg-[hsl(var(--yielder-teal))]/90' : 'bg-destructive hover:bg-destructive/90'} text-primary-foreground`}
        >
          {side === 'buy' ? 'Buy' : 'Sell'} {selectedAsset}
        </Button>
      </div>

      {/* Open Orders */}
      {state.openOrders.length > 0 && (
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-foreground mb-2">Open Orders</h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {state.openOrders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-xs">
                <div>
                  <span className={order.side === 'buy' ? 'text-[hsl(var(--yielder-teal))]' : 'text-destructive'}>
                    {order.side.toUpperCase()}
                  </span>
                  <span className="text-foreground ml-1">{order.asset}</span>
                  <div className="text-[10px] text-muted-foreground">{order.quantity} @ ${order.price.toFixed(6)}</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => handleCancelOrder(order.id)} className="text-[10px] h-6 px-2 text-destructive">
                  Cancel
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trade History */}
      {state.tradeHistory.length > 0 && (
        <div className="glass-card rounded-xl p-3">
          <h3 className="text-xs font-semibold text-foreground mb-2">Trade History</h3>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {state.tradeHistory.slice(0, 10).map(t => (
              <div key={t.id} className="flex items-center justify-between text-[10px] p-1.5 rounded bg-muted/30">
                <div>
                  <span className={t.side === 'buy' ? 'text-[hsl(var(--yielder-teal))]' : 'text-destructive'}>{t.side.toUpperCase()}</span>
                  <span className="text-foreground ml-1">{t.asset}</span>
                </div>
                <div className="text-right">
                  <div className="text-foreground">{t.quantity} @ ${t.price.toFixed(6)}</div>
                  <div className="text-muted-foreground">{new Date(t.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
