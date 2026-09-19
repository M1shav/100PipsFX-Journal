export default function TopPerformers() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col h-[280px]">
      <h2 className="text-[15px] font-bold text-textMain mb-4">Top Performers</h2>
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <span className="text-[13px] text-muted">No performers yet</span>
      </div>
    </div>
  );
}
