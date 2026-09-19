import type { Trade } from '../types/trade';

export const formatMoney = (val: number) => {
  if (isNaN(val) || !isFinite(val)) return '$0.00';
  return `${val >= 0 ? '+' : '-'}$${Math.abs(val).toFixed(2)}`;
};

export interface InstrumentSpec {
  type: 'forex' | 'metal' | 'index' | 'crypto';
  contractSize: number;
  pipSize: number;
}

export const INSTRUMENT_SPECS: Record<string, InstrumentSpec> = {
  'EURUSD': { type: 'forex', contractSize: 100000, pipSize: 0.0001 },
  'GBPUSD': { type: 'forex', contractSize: 100000, pipSize: 0.0001 },
  'USDJPY': { type: 'forex', contractSize: 100000, pipSize: 0.01 },
  'AUDUSD': { type: 'forex', contractSize: 100000, pipSize: 0.0001 },
  'USDCAD': { type: 'forex', contractSize: 100000, pipSize: 0.0001 },
  'USDCHF': { type: 'forex', contractSize: 100000, pipSize: 0.0001 },
  'NZDUSD': { type: 'forex', contractSize: 100000, pipSize: 0.0001 },
  'XAUUSD': { type: 'metal', contractSize: 100, pipSize: 0.01 },
  'XAGUSD': { type: 'metal', contractSize: 5000, pipSize: 0.01 },
};

export function getInstrumentSpec(pair: string): InstrumentSpec {
  if (!pair) return { type: 'forex', contractSize: 100000, pipSize: 0.0001 };
  const normalized = String(pair).replace(/[^A-Z]/gi, '').toUpperCase();
  if (INSTRUMENT_SPECS[normalized]) return INSTRUMENT_SPECS[normalized];
  
  if (normalized.includes('JPY')) return { type: 'forex', contractSize: 100000, pipSize: 0.01 };
  if (normalized.startsWith('XAU')) return { type: 'metal', contractSize: 100, pipSize: 0.01 };
  if (normalized.startsWith('XAG')) return { type: 'metal', contractSize: 5000, pipSize: 0.01 };
  
  return { type: 'forex', contractSize: 100000, pipSize: 0.0001 };
}

export function calculateTradeCore(pair: string, direction: 'LONG' | 'SHORT', entry: number, exit: number, lotSize: number) {
  if (!entry || !exit || !lotSize || entry <= 0 || exit <= 0 || lotSize <= 0) {
    return { pnl: 0, pips: 0 };
  }

  const spec = getInstrumentSpec(pair);
  const diff = direction === 'LONG' ? (exit - entry) : (entry - exit);
  const pips = diff / spec.pipSize;
  
  let grossPnl = 0;
  if (pair && pair.endsWith('USD')) {
    grossPnl = diff * spec.contractSize * lotSize;
  } else if (pair && pair.startsWith('USD')) {
    grossPnl = (diff * spec.contractSize * lotSize) / exit;
  } else {
    grossPnl = diff * spec.contractSize * lotSize;
  }

  return {
    pnl: isFinite(grossPnl) ? grossPnl : 0,
    pips: isFinite(pips) ? pips : 0
  };
}

export function processTrade(trade: Trade): Trade & { calculatedPips: number; riskRewardString: string } {
  const isActuallyClosed = trade.exit !== undefined && trade.exit > 0;
  
  if (!isActuallyClosed) {
    return { ...trade, pnl: 0, calculatedPips: 0, riskRewardString: '—', status: 'OPEN' };
  }
  
  const core = calculateTradeCore(trade.pair || '', trade.direction, trade.entry, trade.exit, trade.lotSize);
  const comm = (trade as any).commission || 0;
  const swap = (trade as any).swap || 0;
  const netPnl = core.pnl - comm + swap;

  let riskRewardString = "—";
  const sl = (trade as any).stopLoss;
  const tp = (trade as any).takeProfit;
  
  // FIXED TS ERROR: Safely bypassed strict type-checking for optional R:R fields
  if (trade.entry > 0 && sl && tp) {
    let risk = trade.direction === 'LONG' ? trade.entry - sl : sl - trade.entry;
    let reward = trade.direction === 'LONG' ? tp - trade.entry : trade.entry - tp;
    if (risk > 0 && reward > 0) riskRewardString = `1:${(reward / risk).toFixed(2)}`;
  }

  return { ...trade, pnl: netPnl, calculatedPips: core.pips, riskRewardString, status: 'CLOSED' };
}

export const calculateDashboardStats = (rawTrades: Trade[]) => {
  const processedTrades = rawTrades.map(processTrade);
  
  const closedTrades = processedTrades.filter(t => t.status === 'CLOSED');
  const openTrades = processedTrades.filter(t => t.status === 'OPEN');
  
  const realizedPnl = closedTrades.reduce((sum, t) => sum + t.pnl, 0);
  const unrealizedPnl = 0; 
  const totalPnl = realizedPnl + unrealizedPnl;
  
  const winningTrades = closedTrades.filter(t => t.pnl > 0);
  const losingTrades = closedTrades.filter(t => t.pnl < 0);
  const winLossCount = winningTrades.length + losingTrades.length; 
  const winRate = winLossCount > 0 ? (winningTrades.length / winLossCount) * 100 : 0;
  
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length : 0;
  
  const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnl)) : 0;
  const worstTrade = closedTrades.length > 0 ? Math.min(...closedTrades.map(t => t.pnl)) : 0;

  // FIXED FATAL DATE CRASH: Prevent invalid dates from breaking the sort algorithm
  const sortedClosedTrades = [...closedTrades]
    .filter(t => t.date && !isNaN(new Date(t.date).getTime()))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  let cumulative = 0;
  const equityCurve = sortedClosedTrades.map(t => {
    cumulative += t.pnl;
    const safeDate = new Date(t.date); // Guaranteed safe by filter above
    return {
      date: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(safeDate),
      fullDate: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(safeDate),
      pnl: t.pnl,
      cumulative: cumulative
    };
  });

  return {
    processedTrades, 
    totalPnl, 
    unrealizedPnl, 
    realizedPnl, 
    winRate,
    openPositionsCount: openTrades.length, 
    closedTradesCount: closedTrades.length,
    avgWin, 
    avgLoss, 
    bestTrade, 
    worstTrade, 
    equityCurve
  };
};