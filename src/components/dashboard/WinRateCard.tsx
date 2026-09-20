import { Trophy } from 'lucide-react';

export default function WinRateCard({ winRate }: { winRate: number }) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] px-5 py-4 min-h-[116px] flex items-center gap-4">
      <div className="w-12 h-12 rounded-[14px] bg-[#0A84FF]/15 text-[#0A84FF] flex items-center justify-center shrink-0">
        <Trophy className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold text-muted uppercase tracking-wider">WIN RATE</span>
        {/* Adjusted to font-black and exactly 2px smaller */}
        <div className="text-[26px] xl:text-[28px] font-black text-textMain mt-0.5 leading-tight tabular-nums">{winRate.toFixed(1)}%</div>
        <div className="w-full bg-[#1C1C1E] h-1.5 rounded-full overflow-hidden mt-2.5">
          <div 
            className="bg-brand h-full rounded-full transition-all duration-1000" 
            style={{ width: `${winRate}%` }} 
          />
        </div>
      </div>
    </div>
  );
}