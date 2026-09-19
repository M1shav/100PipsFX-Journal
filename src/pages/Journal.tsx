import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Calendar as CalendarIcon, ChevronDown, RotateCcw, FileText, 
  BarChart2, ClipboardList, CheckCircle2, Smile, BookOpen, Target, 
  Star, Tag, CheckSquare, Image as ImageIcon, Plus, Check, Play 
} from 'lucide-react';
import type { Trade, ChecklistItem } from '../types/trade';
import { processTrade } from '../utils/tradingCalculations';

const DEFAULT_CHECKLIST = [
  { text: "Checked higher timeframe", checked: false },
  { text: "Risk within limits", checked: false },
  { text: "Fits my trading plan", checked: false },
  { text: "Key levels identified", checked: false },
  { text: "Economic calendar checked", checked: false }
];

interface JournalProps {
  trades: Trade[];
  onUpdateTrade: (updatedTrade: Trade) => void;
}

export default function Journal({ trades, onUpdateTrade }: JournalProps) {
  // Ensure the Journal displays exactly what the engine calculated
  const processedTrades = useMemo(() => trades.map(processTrade), [trades]);

  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  
  // Local state for the editor
  const [preTrade, setPreTrade] = useState('');
  const [postTrade, setPostTrade] = useState('');
  const [emotions, setEmotions] = useState('');
  const [lessons, setLessons] = useState('');
  const [risk, setRisk] = useState<number>(1);
  const [reward, setReward] = useState<number>(2);
  const [rating, setRating] = useState<number>(5.0);
  const [tags, setTags] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [customItemText, setCustomItemText] = useState('');

  const journaledCount = processedTrades.filter(t => t.journal).length;
  const pendingCount = processedTrades.length - journaledCount;

  // Auto-select first trade if none selected
  useEffect(() => {
    if (processedTrades.length > 0 && !selectedTradeId) {
      setSelectedTradeId(processedTrades[0].id);
    }
  }, [processedTrades, selectedTradeId]);

  const selectedTrade = processedTrades.find(t => t.id === selectedTradeId) || null;

  // Sync selected trade data to local editor state
  useEffect(() => {
    if (selectedTrade) {
      const j = selectedTrade.journal;
      setPreTrade(j?.preTrade || '');
      setPostTrade(j?.postTrade || '');
      setEmotions(j?.emotions || '');
      setLessons(j?.lessons || '');
      setRisk(j?.risk || 1);
      setReward(j?.reward || 2);
      setRating(j?.rating || 5.0);
      setTags(j?.tags || '');
      
      if (j?.checklist && j.checklist.length > 0) {
        setChecklist(j.checklist);
      } else {
        setChecklist(JSON.parse(JSON.stringify(DEFAULT_CHECKLIST)));
      }
    }
  }, [selectedTradeId]); 

  const handleSave = () => {
    if (!selectedTrade) return;
    
    // We send back the standard Trade interface structure. 
    // The engine fields (calculatedPips, riskRewardString) are dropped during save, 
    // ensuring the DB stays clean and the engine is the only authority.
    const updatedTrade: Trade = {
      id: selectedTrade.id,
      date: selectedTrade.date,
      pair: selectedTrade.pair,
      direction: selectedTrade.direction,
      entry: selectedTrade.entry,
      exit: selectedTrade.exit,
      lotSize: selectedTrade.lotSize,
      pnl: selectedTrade.pnl,
      status: selectedTrade.status,
      stopLoss: selectedTrade.stopLoss,
      takeProfit: selectedTrade.takeProfit,
      commission: selectedTrade.commission,
      swap: selectedTrade.swap,
      journal: {
        preTrade, postTrade, emotions, lessons, risk, reward, rating, tags, checklist
      }
    };
    onUpdateTrade(updatedTrade);
  };

  const toggleChecklist = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index].checked = !newChecklist[index].checked;
    setChecklist(newChecklist);
  };

  const addCustomChecklistItem = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if ((e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') || !customItemText.trim()) return;
    setChecklist([...checklist, { text: customItemText.trim(), checked: true }]);
    setCustomItemText('');
  };

  const formatDateShort = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(d);
  };

  const checkedCount = checklist.filter(i => i.checked).length;

  return (
    <div className="flex h-full bg-app">
      
      {/* LEFT PANEL: Trade List */}
      <div className="w-[360px] border-r border-[#1C1C1C] flex flex-col h-full bg-[#050505]">
        <div className="p-6 border-b border-[#1C1C1C]">
          <div className="flex justify-between items-center mb-1">
            <h1 className="text-[20px] font-bold text-textMain tracking-tight">Trade Journal</h1>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface2 border border-border">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse"></div>
              <span className="text-[10px] text-muted font-bold uppercase">Live</span>
            </div>
          </div>
          <p className="text-[12px] text-muted mb-5">{journaledCount} journaled in period</p>

          <div className="flex bg-[#0A0A0A] p-1 rounded-xl border border-[#1C1C1C] mb-4">
            <button className="flex-1 py-1.5 rounded-lg bg-surface2 text-[11px] font-bold text-textMain transition-all shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
              All <span className="ml-1 bg-brand text-white px-1.5 py-0.5 rounded text-[9px]">{processedTrades.length}</span>
            </button>
            <button className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-muted hover:text-textMain transition-all">
              Journaled <span className="ml-1 bg-[#1C1C1C] text-muted px-1.5 py-0.5 rounded text-[9px]">{journaledCount}</span>
            </button>
            <button className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-muted hover:text-textMain transition-all">
              Pending <span className="ml-1 bg-[#FF9500]/20 text-[#FF9500] px-1.5 py-0.5 rounded text-[9px]">{pendingCount}</span>
            </button>
            <button className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-muted hover:text-textMain transition-all">Legacy</button>
          </div>

          <div className="relative mb-3">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search symbol..." 
              className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl pl-9 pr-4 py-2.5 text-[12px] text-textMain focus:outline-none focus:border-brand/50 transition-all placeholder:text-[#4A4A4A]"
            />
          </div>

          <div className="flex gap-2">
            <button className="flex-1 flex items-center justify-between bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-muted" />
                <span className="text-[11px] font-semibold text-textMain">Last 30 Days</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            </button>
            <button className="flex-1 flex items-center justify-between bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-textMain text-muted ml-1">↓↑ Date</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {processedTrades.map(trade => {
            const isSelected = selectedTradeId === trade.id;
            const isProfit = trade.pnl >= 0;
            const hasJournal = !!trade.journal;
            
            return (
              <div 
                key={trade.id} 
                onClick={() => setSelectedTradeId(trade.id)}
                className={`p-4 rounded-[16px] cursor-pointer transition-all border ${
                  isSelected ? 'bg-surface2 border-brand shadow-[0_0_15px_rgba(10,132,255,0.1)]' : 'bg-[#0A0A0A] border-transparent hover:border-[#333]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${trade.direction === 'LONG' ? 'bg-brand text-white' : 'bg-loss text-white'}`}>
                      {trade.pair.substring(0,1)}
                    </div>
                    <span className="text-[14px] font-bold text-textMain">{trade.pair}</span>
                  </div>
                  <span className={`text-[13px] font-bold ${isProfit ? 'text-profit' : 'text-loss'}`}>
                    {isProfit ? '+' : '-'}${Math.abs(trade.pnl).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[11px] font-bold ${trade.direction === 'LONG' ? 'text-brand' : 'text-loss'}`}>{trade.direction === 'LONG' ? 'Long' : 'Short'}</span>
                  <span className="text-[11px] text-muted font-medium">${trade.entry.toFixed(2)}</span>
                  {!hasJournal && <span className="bg-[#1C1C1E] text-textMain border border-[#333] px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider">NEW</span>}
                </div>
                <p className="text-[10px] text-[#4A4A4A] font-medium">{formatDateShort(trade.date)}</p>
              </div>
            );
          })}
          {processedTrades.length === 0 && (
            <div className="text-center py-10 text-[13px] text-muted">No trades recorded yet.</div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Editor */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-app relative">
        {selectedTrade ? (
          <div className="flex-1 overflow-y-auto scrollbar-hide p-8">
            <div className="max-w-[1000px] mx-auto">
              
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[14px] font-bold ${selectedTrade.direction === 'LONG' ? 'bg-brand text-white' : 'bg-[#FF9500] text-white'}`}>
                      {selectedTrade.pair.substring(0,1)}
                    </div>
                    <h2 className="text-[24px] font-bold text-textMain leading-none">{selectedTrade.pair}</h2>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${selectedTrade.pnl >= 0 ? 'bg-brand/10 text-brand border-brand/20' : 'bg-loss/10 text-loss border-loss/20'}`}>
                      {selectedTrade.pnl >= 0 ? 'WINNER' : 'LOSER'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[12px] text-muted font-medium ml-11">
                    <span className={`font-bold ${selectedTrade.direction === 'LONG' ? 'text-brand' : 'text-loss'}`}>
                      {selectedTrade.direction === 'LONG' ? 'Long' : 'Short'}
                    </span>
                    <span>•</span>
                    <span>Entry ${selectedTrade.entry.toFixed(2)}</span>
                    <span>•</span>
                    <span>Size {selectedTrade.lotSize}</span>
                    <span>•</span>
                    <span>{formatDateShort(selectedTrade.date)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button className="w-10 h-10 rounded-xl bg-surface2 border border-[#1C1C1C] flex items-center justify-center text-muted hover:text-textMain transition-colors">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button className="h-10 px-4 rounded-xl bg-surface2 border border-[#1C1C1C] flex items-center gap-2 text-[12px] font-semibold text-textMain hover:bg-[#1C1C1E] transition-colors">
                    <FileText className="w-4 h-4 text-muted" /> Report
                  </button>
                  <button className="h-10 px-4 rounded-xl bg-surface2 border border-[#1C1C1C] flex items-center gap-2 text-[12px] font-semibold text-textMain hover:bg-[#1C1C1E] transition-colors">
                    <BarChart2 className="w-4 h-4 text-muted" /> Analytics
                  </button>
                  <button onClick={handleSave} className="h-10 px-6 rounded-xl bg-brand hover:bg-brand/90 text-white text-[13px] font-bold shadow-[0_0_15px_rgba(10,132,255,0.25)] transition-all">
                    Save
                  </button>
                </div>
              </div>

              {/* Editor Grid */}
              <div className="grid grid-cols-2 gap-5 mb-5">
                
                {/* Pre-Trade Analysis */}
                <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="w-4 h-4 text-brand" />
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Pre-Trade Analysis</span>
                  </div>
                  <textarea 
                    value={preTrade}
                    onChange={(e) => setPreTrade(e.target.value)}
                    className="w-full flex-1 bg-transparent text-[13px] text-textMain focus:outline-none resize-none min-h-[120px] placeholder:text-[#4A4A4A] leading-relaxed" 
                    placeholder="What did you see? Plan, thesis, levels, risk..."
                  ></textarea>
                </div>

                {/* Post-Trade Review */}
                <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-brand" />
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Post-Trade Review</span>
                  </div>
                  <textarea 
                    value={postTrade}
                    onChange={(e) => setPostTrade(e.target.value)}
                    className="w-full flex-1 bg-transparent text-[13px] text-textMain focus:outline-none resize-none min-h-[120px] placeholder:text-[#4A4A4A] leading-relaxed" 
                    placeholder="What happened? Execution, slippage, improvements..."
                  ></textarea>
                </div>

                {/* Emotions */}
                <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] p-5 flex flex-col h-[140px]">
                  <div className="flex items-center gap-2 mb-3">
                    <Smile className="w-4 h-4 text-brand" />
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Emotions</span>
                  </div>
                  <textarea 
                    value={emotions}
                    onChange={(e) => setEmotions(e.target.value)}
                    className="w-full flex-1 bg-transparent text-[13px] text-textMain focus:outline-none resize-none placeholder:text-[#4A4A4A] leading-relaxed" 
                    placeholder="Calm, anxious, FOMO, confident..."
                  ></textarea>
                </div>

                {/* Lessons Learned */}
                <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] p-5 flex flex-col h-[140px]">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-4 h-4 text-brand" />
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Lessons Learned</span>
                  </div>
                  <textarea 
                    value={lessons}
                    onChange={(e) => setLessons(e.target.value)}
                    className="w-full flex-1 bg-transparent text-[13px] text-textMain focus:outline-none resize-none placeholder:text-[#4A4A4A] leading-relaxed" 
                    placeholder="Key takeaways to repeat or avoid..."
                  ></textarea>
                </div>

                {/* Risk : Reward */}
                <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] p-5 flex flex-col justify-between h-[120px]">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-brand" />
                    <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Risk : Reward</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        value={risk}
                        onChange={(e) => setRisk(Number(e.target.value))}
                        className="w-[70px] bg-[#121212] border border-[#1C1C1C] rounded-xl text-center py-2.5 text-[15px] text-textMain font-bold focus:outline-none focus:border-brand/50 transition-colors" 
                      />
                      <span className="text-[18px] text-brand font-bold">:</span>
                      <input 
                        type="number" 
                        value={reward}
                        onChange={(e) => setReward(Number(e.target.value))}
                        className="w-[70px] bg-[#121212] border border-[#1C1C1C] rounded-xl text-center py-2.5 text-[15px] text-textMain font-bold focus:outline-none focus:border-brand/50 transition-colors" 
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#4A4A4A]">Planned ratio</span>
                  </div>
                </div>

                {/* Rating */}
                <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] p-5 flex flex-col justify-between h-[120px]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-brand" />
                      <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Rating</span>
                    </div>
                    <span className="text-[15px] font-bold text-brand">{rating.toFixed(1)}/10</span>
                  </div>
                  <div className="px-1 mt-2">
                    <input 
                      type="range" 
                      min="1" max="10" step="0.5" 
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="rating-slider" 
                    />
                    <div className="flex justify-between mt-3 px-1 text-[10px] font-bold text-[#4A4A4A]">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags (Full Width) */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <Tag className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Tags</span>
                </div>
                <input 
                  type="text" 
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="breakout, trend, news (comma separated)"
                  className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl px-5 py-4 text-[13px] text-textMain focus:outline-none focus:border-brand/50 transition-all placeholder:text-[#4A4A4A]"
                />
              </div>

              {/* Execution Checklist (Full Width) */}
              <div className="mb-5">
                <div className="flex justify-between items-center mb-3 ml-1 pr-1">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-3.5 h-3.5 text-brand" />
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Execution Checklist</span>
                  </div>
                  <span className="text-[11px] font-bold text-brand">{checkedCount}/{checklist.length}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {checklist.map((item, idx) => (
                    <button 
                      key={idx}
                      onClick={() => toggleChecklist(idx)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${
                        item.checked 
                          ? 'bg-brand/10 border-brand/50 shadow-[inset_0_0_0_1px_rgba(10,132,255,0.2)]' 
                          : 'bg-[#0A0A0A] border-[#1C1C1C] hover:border-[#333]'
                      }`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-md flex items-center justify-center transition-colors ${
                        item.checked ? 'bg-brand' : 'bg-surface2 border border-[#333]'
                      }`}>
                        {item.checked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                      </div>
                      <span className={`text-[13px] font-medium ${item.checked ? 'text-white' : 'text-muted'}`}>{item.text}</span>
                    </button>
                  ))}
                  
                  {/* Custom Checklist Item Input */}
                  <div className="flex items-center bg-[#0A0A0A] border border-[#1C1C1C] rounded-2xl px-4 py-3 min-w-[200px] focus-within:border-[#333] transition-colors">
                    <input 
                      type="text" 
                      value={customItemText}
                      onChange={(e) => setCustomItemText(e.target.value)}
                      onKeyDown={addCustomChecklistItem}
                      placeholder="Add custom item..." 
                      className="bg-transparent text-[13px] text-textMain placeholder:text-[#4A4A4A] focus:outline-none flex-1"
                    />
                    <button onClick={addCustomChecklistItem} className="ml-2 w-5 h-5 flex items-center justify-center rounded bg-surface2 hover:bg-[#333] transition-colors">
                      <Plus className="w-3 h-3 text-brand" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Screenshots (Full Width) */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 ml-1">
                  <ImageIcon className="w-3.5 h-3.5 text-brand" />
                  <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Screenshots</span>
                </div>
                <button className="w-[160px] h-[100px] rounded-2xl border-2 border-dashed border-brand/40 bg-brand/5 hover:bg-brand/10 flex flex-col items-center justify-center gap-2 transition-colors">
                  <Plus className="w-5 h-5 text-brand" />
                  <span className="text-[12px] font-bold text-brand">Add Image</span>
                </button>
              </div>

              {/* Trade Summary */}
              <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[24px] p-5 flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[16px] font-bold ${selectedTrade.direction === 'LONG' ? 'bg-brand text-white' : 'bg-[#FF9500] text-white'}`}>
                    {selectedTrade.pair.substring(0,1)}
                  </div>
                  <div>
                    <span className="text-[15px] font-bold text-textMain block leading-tight">{selectedTrade.pair}</span>
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${selectedTrade.direction === 'LONG' ? 'text-brand' : 'text-loss'}`}>
                      • {selectedTrade.direction === 'LONG' ? 'Long' : 'Short'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-12 mr-8">
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Entry</span>
                    <span className="text-[15px] font-bold text-textMain">${selectedTrade.entry.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Exit</span>
                    <span className="text-[15px] font-bold text-textMain">{selectedTrade.exit ? `$${selectedTrade.exit.toFixed(2)}` : '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">P&L</span>
                    <span className={`text-[15px] font-bold ${selectedTrade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {selectedTrade.pnl >= 0 ? '+' : '-'}${Math.abs(selectedTrade.pnl).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="h-9 px-4 rounded-xl bg-brand/10 text-brand text-[12px] font-bold flex items-center gap-2 hover:bg-brand/20 transition-colors">
                    <BarChart2 className="w-4 h-4" /> Analyze
                  </button>
                  <button className="h-9 px-4 rounded-xl bg-surface2 text-textMain border border-[#1C1C1C] text-[12px] font-bold flex items-center gap-2 hover:bg-[#1C1C1E] transition-colors">
                    <Play className="w-4 h-4" /> Replay
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* Empty State for Editor */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-surface2 border border-[#1C1C1C] flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-[#333]" />
            </div>
            <h3 className="text-[18px] font-bold text-textMain mb-2">No Trade Selected</h3>
            <p className="text-[13px] text-muted max-w-sm">Select a trade from the list on the left to add your journal entry, emotions, and screenshots.</p>
          </div>
        )}
      </div>
    </div>
  );
}
