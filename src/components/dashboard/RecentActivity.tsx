import React from 'react';
import type { Trade } from '../../types/trade';

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
      <div className="flex justify-between items-center mb-4">
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
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {safeTrades.slice().reverse().map(trade => (
            <div key={trade.id} className="flex items-center justify-between p-2.5 bg-app rounded-lg border border-border">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full ${trade.direction === 'LONG' ? 'bg-brand' : 'bg-loss'}`} />
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    {trade.pair || 'UNKNOWN'}
                    <span className={`text-[9px] px-1.5 py-0.5 rounded ${trade.direction === 'LONG' ? 'bg-brand/10 text-brand' : 'bg-loss/10 text-loss'}`}>
                      {trade.direction}
                    </span>
                  </div>
                  {/* CRASH PREVENTED: Safely formats date */}
                  <div className="text-[10px] text-muted">
                    {formatDateSafely(trade.date)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-[13px] font-bold ${Number(trade.pnl) >= 0 ? 'text-brand' : 'text-loss'}`}>
                  {Number(trade.pnl) >= 0 ? '+' : '-'}${Math.abs(Number(trade.pnl) || 0).toFixed(2)}
                </div>
                <div className="text-[10px] text-muted">
                  Lot: {trade.lotSize || 0}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}