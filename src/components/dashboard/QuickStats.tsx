export default function QuickStats({ avgWin, avgLoss, bestTrade, worstTrade }: any) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col h-[280px]">
      <h2 className="text-[15px] font-bold text-textMain mb-6">Quick Stats</h2>
      <div className="grid grid-cols-2 gap-y-6 flex-1 content-start">
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted font-medium">Avg Win</span>
          <span className="text-[16px] font-bold text-textMain">—</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted font-medium">Avg Loss</span>
          <span className="text-[16px] font-bold text-textMain">—</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted font-medium">Best Trade</span>
          <span className="text-[16px] font-bold text-textMain">—</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-muted font-medium">Worst Trade</span>
          <span className="text-[16px] font-bold text-textMain">—</span>
        </div>
      </div>
    </div>
  );
}
