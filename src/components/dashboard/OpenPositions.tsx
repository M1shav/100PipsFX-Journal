import { FileText } from 'lucide-react';

export default function OpenPositions() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col h-[280px]">
      <h2 className="text-[15px] font-bold text-textMain mb-4">Open Positions</h2>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-surface2 border border-border flex items-center justify-center mb-3">
          <FileText className="w-5 h-5 text-muted/40" />
        </div>
        <span className="text-[13px] text-muted">No open positions</span>
      </div>
      <button className="text-[12px] font-semibold text-brand text-center mt-auto flex items-center justify-center gap-1">
        View All Positions <span className="text-[14px]">→</span>
      </button>
    </div>
  );
}
