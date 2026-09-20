import React from 'react';
import type { Trade } from '../../types/trade';
import PairIcon from '../ui/PairIcon';

export default function RecentActivity({ trades }: { trades: Trade[] }) {
  const safeTrades = Array.isArray(trades) ? trades : [];

  const formatDateSafely = (dateStr: string) => {
    if (!dateStr) return 'Unknown Date';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    }).format(d);
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col h-[280px]">
      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-[15px] font-bold text-textMain">Recent Activity</h2>
        <span className="text-[11px] text-muted bg-surface2 border border-border px-2 py-0.5 rounded">
          {safeTrades.length} trades
        </span>
      </div>

      {safeTrades.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <span className="text-[13px] text-muted">No recent activity</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-hide">
            {safeTrades.slice().reverse().map(trade => {
              const isProfit = Number(trade.pnl) >= 0;
              return (
                <div key={trade.id} className="flex items-center justify-between p-2.5 bg-app rounded-lg border border-border shrink-0">
                  <div className="flex items-center gap-3">
                    <PairIcon symbol={trade.pair || ''} />
                    <div>
                      <div className="text-[14px] font-bold text-textMain flex items-center gap-2">
                        {trade.pair || 'UNKNOWN'}
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${trade.direction === 'LONG' ? 'bg-[#0A84FF]/10 text-[#0A84FF]' : 'bg-[#FF453A]/10 text-[#FF453A]'}`}>
                          {trade.direction}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted font-medium mt-0.5">
                        {formatDateSafely(trade.date)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right flex items-center justify-end gap-3">
                    <span className="text-[11px] text-muted font-medium">
                      {trade.lotSize || 0} lots
                    </span>
                    <span className={`text-[14px] font-black tracking-tight ${isProfit ? 'text-[#0A84FF]' : 'text-[#FF453A]'}`}>
                      {isProfit ? '+' : '−'}${Math.abs(Number(trade.pnl) || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="text-[12px] font-semibold text-[#0A84FF] text-center mt-3 flex items-center justify-center gap-1 w-full shrink-0">
            View All Activity <span className="text-[14px]">→</span>
          </button>
        </div>
      )}
    </div>
  );
}