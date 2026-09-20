import React, { useState, useMemo } from 'react';
import { Share2, Trash2, Edit2, PenLine, AlertTriangle, X, TrendingUp, TrendingDown, Calendar, Filter, Plus } from 'lucide-react';
import type { Trade } from '../types/trade';
import { processTrade } from '../utils/tradingCalculations';
import AddTradeModal from '../components/dashboard/addtrademodal';
import PairIcon from '../components/ui/PairIcon'; // NEW IMPORT

interface TradesProps {
  trades: Trade[];
  onUpdateTrade: (updatedTrade: Trade) => void;
  onDeleteTrade: (id: string) => void;
  onClearAllTrades: () => void;
}

type FilterTimeType = 'All Time' | 'Today' | 'This Week' | 'Last 30 Days' | 'This Month' | 'Last Month' | 'Last 3 Months' | 'Custom';

export default function Trades({ trades, onUpdateTrade, onDeleteTrade, onClearAllTrades }: TradesProps) {
  const safeTrades = Array.isArray(trades) ? trades.filter(t => t !== null && typeof t === 'object') : [];

  const processedTrades = useMemo(() => {
    return safeTrades.map(t => {
      try {
        if (typeof processTrade === 'function') {
          return processTrade(t);
        }
        return { ...t, pnl: Number(t.pnl) || 0, status: t.status || 'OPEN' };
      } catch (e) {
        return { ...t, pnl: 0, status: 'OPEN' };
      }
    });
  }, [safeTrades]);

  // Filter States
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filterPnl, setFilterPnl] = useState<'All' | 'Profitable' | 'Loss'>('All');
  const [filterType, setFilterType] = useState<'All' | 'Long' | 'Short'>('All');
  const [filterTime, setFilterTime] = useState<FilterTimeType>('All Time');

  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  
  // States for Editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  const profitCount = processedTrades.filter(t => Number(t.pnl) > 0 && t.status === 'CLOSED').length;
  const lossCount = processedTrades.filter(t => Number(t.pnl) < 0 && t.status === 'CLOSED').length;

  const filteredTrades = useMemo(() => {
    return processedTrades.filter(t => {
      const pnl = Number(t.pnl) || 0;
      
      if (filterPnl === 'Profitable' && (pnl <= 0 || t.status === 'OPEN')) return false;
      if (filterPnl === 'Loss' && (pnl >= 0 || t.status === 'OPEN')) return false;
      if (filterType === 'Long' && t.direction !== 'LONG') return false;
      if (filterType === 'Short' && t.direction !== 'SHORT') return false;

      if (filterTime !== 'All Time' && t.date) {
        const d = new Date(t.date);
        if (!isNaN(d.getTime())) {
          const now = new Date();
          const diffTime = now.getTime() - d.getTime();
          const diffDays = diffTime / (1000 * 3600 * 24);

          if (filterTime === 'Today' && d.toDateString() !== now.toDateString()) return false;
          if (filterTime === 'Last 30 Days' && diffDays > 30) return false;
          if (filterTime === 'This Month' && (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear())) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  }, [processedTrades, filterPnl, filterType, filterTime]);

  const handleClearAllFilters = () => {
    setFilterPnl('All');
    setFilterType('All');
    setFilterTime('All Time');
  };

  const handleAddTradeClick = () => {
    window.dispatchEvent(new CustomEvent('openAddTrade'));
  };

  const handleEditClick = (trade: Trade) => {
    setEditingTrade(trade);
    setIsEditModalOpen(true);
  };

  const handleShareClick = async (trade: Trade) => {
    const safePnl = Number(trade.pnl) || 0;
    const pnlPrefix = safePnl >= 0 ? '+' : '−';
    const formattedPnl = `${pnlPrefix}$${Math.abs(safePnl).toFixed(2)}`;
    const safePair = typeof trade.pair === 'string' ? trade.pair.toUpperCase() : 'UNKNOWN';
    const safeEntry = Number(trade.entry) || 0;
    const safeExit = Number(trade.exit) || 0;
    const safeLot = Number(trade.lotSize) || 0;

    const shareText = `My Trade Performance 🚀\n\n` +
      `Symbol: ${safePair}\n` +
      `Type: ${trade.direction}\n` +
      `Entry: $${safeEntry.toFixed(2)}\n` +
      `Exit: ${trade.status === 'CLOSED' ? '$' + safeExit.toFixed(2) : 'Open'}\n` +
      `Lot Size: ${safeLot}\n` +
      `P&L: ${formattedPnl}\n\n` +
      `Tracked with TradeFXBook`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Trade', text: shareText });
      } catch (err) {
        console.log('Share window closed or not supported');
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Trade details copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  const formatRowDate = (isoString: string | undefined) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return 'Invalid Date';
      const month = d.toLocaleString('en-US', { month: 'short' });
      const day = d.getDate().toString().padStart(2, '0');
      const time = d.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${month} ${day} ${time}`;
    } catch (e) {
      return '—';
    }
  };

  const todayHeaderDate = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const hasActiveFilters = filterPnl !== 'All' || filterType !== 'All' || filterTime !== 'All Time';

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-textMain tracking-tight mb-1">Trades</h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-medium text-muted">{todayHeaderDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4A4A4A]"></div>
            <span className="text-[12px] font-medium text-muted">Not connected</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 rounded-[12px] bg-brand hover:bg-brand/90 text-white text-[13px] font-bold transition-colors">
            Connect MT4/MT5
          </button>
          <button 
            onClick={() => setIsClearConfirmOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-transparent border border-loss/30 text-loss text-[13px] font-bold hover:bg-loss/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
          <button 
            onClick={handleAddTradeClick}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] bg-brand text-white text-[13px] font-bold shadow-[0_0_15px_rgba(10,132,255,0.25)] hover:bg-brand/90 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Trade
          </button>
        </div>
      </div>

      {/* TRADE HISTORY CARD */}
      <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] flex flex-col overflow-hidden">
        
        <div className="p-6 border-b border-[#1C1C1C]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-[16px] font-bold text-textMain tracking-tight">Trade History</h2>
              <span className="text-[12px] font-medium text-muted">
                {filteredTrades.length} of {processedTrades.length} trades
              </span>
            </div>
            <button 
              onClick={() => setFiltersOpen(!filtersOpen)} 
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#1C1C1C] text-[13px] font-semibold text-muted hover:text-white hover:bg-[#1C1C1E] transition-colors"
            >
              <Filter className="w-3.5 h-3.5" /> Filters 
              {hasActiveFilters && <div className="w-1.5 h-1.5 rounded-full bg-brand ml-0.5"></div>}
            </button>
          </div>

          {filtersOpen && (
            <div className="flex flex-col gap-6 relative mt-6 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap gap-8">
                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">P&L</span>
                  <div className="flex gap-2">
                    <FilterPill label="All" active={filterPnl === 'All'} onClick={() => setFilterPnl('All')} />
                    <FilterPill label={`Profitable (${profitCount})`} active={filterPnl === 'Profitable'} onClick={() => setFilterPnl('Profitable')} />
                    <FilterPill label={`Loss (${lossCount})`} active={filterPnl === 'Loss'} onClick={() => setFilterPnl('Loss')} />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Type</span>
                  <div className="flex gap-2">
                    <FilterPill label="All" active={filterType === 'All'} onClick={() => setFilterType('All')} />
                    <FilterPill label="Long" icon={<TrendingUp className="w-3.5 h-3.5" />} active={filterType === 'Long'} onClick={() => setFilterType('Long')} />
                    <FilterPill label="Short" icon={<TrendingDown className="w-3.5 h-3.5" />} active={filterType === 'Short'} onClick={() => setFilterType('Short')} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Time Period</span>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {['All Time', 'Today', 'This Week', 'Last 30 Days', 'This Month', 'Last Month', 'Last 3 Months'].map(time => (
                      <FilterPill key={time} label={time} active={filterTime === time} onClick={() => setFilterTime(time as FilterTimeType)} />
                    ))}
                    <FilterPill label="Custom" icon={<Calendar className="w-3.5 h-3.5" />} active={filterTime === 'Custom'} onClick={() => setFilterTime('Custom')} />
                  </div>
                  <button 
                    onClick={handleClearAllFilters}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-[12px] border border-[#1C1C1C] text-[12px] font-bold text-muted hover:text-white hover:bg-[#1C1C1E] transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left min-w-[1100px]">
            <thead className="bg-[#0A0A0A] shadow-[0_1px_0_#1C1C1C]">
              <tr>
                <th className="py-4 px-6 text-[11px] font-bold text-muted uppercase tracking-wider text-left w-[200px]">Open / Close</th>
                <th className="py-4 px-4 text-[11px] font-bold text-muted uppercase tracking-wider text-left">Symbol</th>
                <th className="py-4 px-4 text-[11px] font-bold text-muted uppercase tracking-wider text-left">Type</th>
                <th className="py-4 px-4 text-[11px] font-bold text-muted uppercase tracking-wider text-left">Entry</th>
                <th className="py-4 px-4 text-[11px] font-bold text-muted uppercase tracking-wider text-left">Exit</th>
                <th className="py-4 px-4 text-[11px] font-bold text-muted uppercase tracking-wider text-left">Size</th>
                <th className="py-4 px-4 text-[11px] font-bold text-muted uppercase tracking-wider text-left">P&L</th>
                <th className="py-4 px-4 text-[11px] font-bold text-muted uppercase tracking-wider text-left">Source</th>
                <th className="py-4 px-6 text-[11px] font-bold text-muted uppercase tracking-wider text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, idx) => {
                const safeId = trade.id || `fallback-id-${idx}`;
                const safeEntry = Number(trade.entry) || 0;
                const safeExit = Number(trade.exit) || 0;
                const safePnl = Number(trade.pnl) || 0;
                const safePair = typeof trade.pair === 'string' ? trade.pair.toUpperCase() : 'UNKNOWN';
                const safeLot = Number(trade.lotSize) || 0;
                const safeDirection = trade.direction === 'SHORT' ? 'SHORT' : 'LONG';
                const safeStatus = trade.status === 'CLOSED' ? 'CLOSED' : 'OPEN';

                const isWinner = safePnl >= 0 && safeStatus === 'CLOSED';
                const isLoser = safePnl < 0 && safeStatus === 'CLOSED';
                const pnlColor = isWinner ? 'text-[#4DA6FF]' : isLoser ? 'text-loss' : 'text-textMain';

                return (
                  <tr key={safeId} className="border-b border-[#1C1C1C] hover:bg-[#121212] transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 text-[13px]">
                          <span className="text-muted font-semibold">Open:</span>
                          <span className="text-textMain font-bold">{formatRowDate(trade.date)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px]">
                          <span className="text-muted font-semibold">Close:</span>
                          <span className="text-textMain font-bold">{safeStatus === 'CLOSED' ? formatRowDate(trade.date) : '—'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        
                        {/* INSERTED THE NEW PAIR ICON COMPONENT HERE */}
                        <PairIcon symbol={safePair} />
                        
                        <span className="text-[15px] font-extrabold text-textMain">{safePair}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[13px] font-extrabold border ${
                        safeDirection === 'LONG' ? 'bg-[#0A84FF]/10 text-[#4DA6FF] border-[#0A84FF]/20' : 'bg-loss/10 text-loss border-loss/20'
                      }`}>
                        {safeDirection === 'LONG' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {safeDirection === 'LONG' ? 'Long' : 'Short'}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-[14px] font-extrabold text-textMain">
                      ${safeEntry.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-[14px] font-extrabold text-textMain">
                      {safeStatus === 'CLOSED' ? `$${safeExit.toFixed(2)}` : '—'}
                    </td>
                    <td className="py-4 px-4 text-[14px] font-extrabold text-textMain">
                      {safeLot}
                    </td>
                    <td className={`py-4 px-4 text-[16px] font-black tracking-tight ${pnlColor}`}>
                      {safeStatus === 'CLOSED' ? `${safePnl >= 0 ? '+' : '−'}$${Math.abs(safePnl).toFixed(2)}` : '—'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#8A2BE2]/10 border border-[#8A2BE2]/20 text-[#8A2BE2] text-[12px] font-extrabold tracking-wide">
                        <PenLine className="w-3.5 h-3.5" /> Manual
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(trade)} className="text-brand/80 hover:text-brand transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleShareClick(trade)} className="text-brand/80 hover:text-brand transition-colors" title="Share">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => onDeleteTrade(safeId)} className="text-loss/80 hover:text-loss transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTrades.length === 0 && processedTrades.length > 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted text-[13px]">
                    No trades match your current filters.
                  </td>
                </tr>
              )}
              {processedTrades.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-muted text-[13px]">
                    You haven't recorded any trades yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsClearConfirmOpen(false)}></div>
          <div className="bg-[#050505] w-full max-w-[400px] rounded-[24px] border border-[#1C1C1C] shadow-2xl relative z-10 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-loss/10 border border-loss/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-loss" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-textMain mb-1">Clear All Trades?</h2>
                <p className="text-[13px] text-muted leading-relaxed">
                  This will permanently delete all trades in your history. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#1C1C1C]">
              <button 
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-textMain hover:bg-surface2 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  onClearAllTrades();
                  setIsClearConfirmOpen(false);
                }}
                className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-loss text-white shadow-[0_0_15px_rgba(255,69,58,0.3)] hover:bg-loss/90 transition-all"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <AddTradeModal 
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingTrade(null);
          }} 
          tradeToEdit={editingTrade}
          onUpdateTrade={onUpdateTrade}
        />
      )}

    </div>
  );
}

function FilterPill({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-[10px] text-[12px] font-bold transition-all border ${
        active 
          ? 'bg-brand/10 border-brand/40 text-brand shadow-[0_0_10px_rgba(10,132,255,0.1)]' 
          : 'bg-[#121212] border-[#1C1C1C] text-muted hover:text-textMain hover:bg-[#1C1C1E]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}