import React, { useMemo, useRef } from 'react';
import type { Trade } from '../../types/trade';
import PairIcon from '../ui/PairIcon';

export default function TopPerformers({ trades }: { trades: Trade[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const performers = useMemo(() => {
    const safeTrades = Array.isArray(trades) ? trades : [];
    
    // Only rank CLOSED trades with valid P&L
    const closedTrades = safeTrades.filter(t => t.status === 'CLOSED' && t.pair);

    const performersMap = new Map<string, { pair: string, pnl: number, count: number }>();

    closedTrades.forEach(t => {
      const pair = t.pair.toUpperCase();
      const pnl = Number(t.pnl) || 0;
      
      if (!performersMap.has(pair)) {
        performersMap.set(pair, { pair, pnl: 0, count: 0 });
      }
      
      const data = performersMap.get(pair)!;
      data.pnl += pnl;
      data.count += 1;
    });

    // Convert to array and sort descending by Total P&L
    return Array.from(performersMap.values()).sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    
    // Calculate if we are at the horizontal scrolling boundaries
    const isAtLeftBoundary = container.scrollLeft === 0;
    const isAtRightBoundary = container.scrollLeft + container.clientWidth >= container.scrollWidth;

    // Check if the user is scrolling in a direction that allows horizontal movement
    const isScrollingLeft = e.deltaY < 0;
    const isScrollingRight = e.deltaY > 0;

    // If we can scroll in the intended direction, prevent default vertical scrolling and scroll horizontally
    if ((isScrollingLeft && !isAtLeftBoundary) || (isScrollingRight && !isAtRightBoundary)) {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-5 flex flex-col h-full min-h-[260px]">
      <style>
        {`
          .custom-dark-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .custom-dark-scrollbar::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 8px;
          }
          .custom-dark-scrollbar::-webkit-scrollbar-thumb {
            background-color: #2C2C2E;
            border-radius: 9999px;
          }
          .custom-dark-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: #3A3A3C;
          }
        `}
      </style>

      <div className="flex justify-between items-center mb-4 shrink-0">
        <h2 className="text-[15px] font-bold text-textMain">Top Performers</h2>
      </div>
      
      {performers.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <span className="text-[13px] text-muted">No performers yet</span>
        </div>
      ) : (
        <div 
          ref={scrollRef}
          onWheel={handleWheel}
          className="flex-1 flex gap-3 overflow-x-auto pb-3 items-start custom-dark-scrollbar"
        >
          {performers.map((p, index) => (
            <div 
              key={p.pair} 
              // EXACTLY 3 CARDS FIT: 33.333% minus gap adjustments
              className="min-w-[calc(33.333%-8px)] bg-[#121212] border border-[#1C1C1C] rounded-[16px] p-4 flex flex-col shrink-0 snap-start"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-[11px] font-bold text-[#0A84FF] bg-[#0A84FF]/10 px-2 py-0.5 rounded-md">
                  #{index + 1}
                </span>
                <div className="scale-[0.85] origin-top-right -mt-1 -mr-1">
                  <PairIcon symbol={p.pair} />
                </div>
              </div>
              
              <div className="flex flex-col mb-2">
                <span className="text-[14px] font-bold text-textMain tracking-tight">{p.pair}</span>
                <span className="text-[11px] text-[#8E8E93] font-medium">
                  {p.count} trade{p.count !== 1 ? 's' : ''}
                </span>
              </div>
              
              <span className={`text-[15px] font-black tracking-tight ${p.pnl >= 0 ? 'text-[#0A84FF]' : 'text-[#FF453A]'}`}>
                {p.pnl >= 0 ? '+' : '−'}${Math.abs(p.pnl).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}