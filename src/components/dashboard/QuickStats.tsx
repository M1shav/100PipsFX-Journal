import React from 'react';

export default function QuickStats({ avgWin = 0, avgLoss = 0, bestTrade = 0, worstTrade = 0 }: any) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl p-5 flex flex-col">
      <h2 className="text-[15px] font-bold text-textMain mb-4">Quick Stats</h2>
      
      {/* Changed to a clean 4-column horizontal layout */}
      <div className="grid grid-cols-4 gap-4 flex-1 items-center">
        
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted font-medium">Avg Win</span>
          <span className="text-[14px] font-black text-[#0A84FF] tracking-tight">
             {avgWin > 0 ? '+' : ''}${Math.abs(avgWin).toFixed(2)}
          </span>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted font-medium">Avg Loss</span>
          <span className="text-[14px] font-black text-[#FF453A] tracking-tight">
            {avgLoss < 0 ? '−' : ''}${Math.abs(avgLoss).toFixed(2)}
          </span>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted font-medium">Best Trade</span>
          <span className="text-[14px] font-black text-[#0A84FF] tracking-tight">
             {bestTrade > 0 ? '+' : ''}${Math.abs(bestTrade).toFixed(2)}
          </span>
        </div>
        
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted font-medium">Worst Trade</span>
          <span className="text-[14px] font-black text-[#FF453A] tracking-tight">
             {worstTrade < 0 ? '−' : ''}${Math.abs(worstTrade).toFixed(2)}
          </span>
        </div>

      </div>
    </div>
  );
}