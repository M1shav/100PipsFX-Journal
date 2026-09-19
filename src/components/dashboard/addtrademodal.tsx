import { useState, useRef, useEffect } from 'react';
import { X, Plus, TrendingUp, TrendingDown, ChevronDown, Check, Calendar as CalendarIcon } from 'lucide-react';
import type { Trade } from '../../types/trade';
import { calculateTradeCore } from '../../utils/tradingCalculations';

const INSTRUMENTS = [
  { symbol: 'XAUUSD', name: 'Gold' },
  { symbol: 'XAGUSD', name: 'Silver' },
  { symbol: 'EURUSD', name: 'Euro / US Dollar' },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar' },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen' },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar' },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar' },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc' },
  { symbol: 'NZDUSD', name: 'New Zealand Dollar / US Dollar' },
];

const CHECKLIST_ITEMS = [
  "Checked higher timeframe",
  "Risk within limits",
  "Fits my trading plan",
  "Key levels identified",
  "Economic calendar checked"
];

interface AddTradeModalProps {
  onClose: () => void;
  onAddTrade?: (trade: Trade) => void;
  onUpdateTrade?: (trade: Trade) => void;
  tradeToEdit?: Trade | null;
}

export default function AddTradeModal({ onClose, onAddTrade, onUpdateTrade, tradeToEdit }: AddTradeModalProps) {
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [symbol, setSymbol] = useState('');
  const [showSymbolSuggestions, setShowSymbolSuggestions] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [entryDate, setEntryDate] = useState<Date | null>(new Date());
  const [exitDate, setExitDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  
  const [checklistOpen, setChecklistOpen] = useState(true);
  const [checklist, setChecklist] = useState<boolean[]>(Array(CHECKLIST_ITEMS.length).fill(false));
  
  const [activeDatePicker, setActiveDatePicker] = useState<'entry' | 'exit' | null>(null);
  
  const symbolRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const suggestions = INSTRUMENTS.filter(i => i.symbol.toLowerCase().includes(symbol.toLowerCase()));

  // PRE-FILL DATA WHEN EDITING A TRADE
  useEffect(() => {
    if (tradeToEdit) {
      setDirection(tradeToEdit.direction || 'LONG');
      setSymbol(tradeToEdit.pair || '');
      setQuantity(tradeToEdit.lotSize?.toString() || '');
      setEntryPrice(tradeToEdit.entry?.toString() || '');
      setExitPrice(tradeToEdit.exit ? tradeToEdit.exit.toString() : '');
      
      // Load saved notes safely
      setNotes((tradeToEdit as any).notes || '');
      
      // Load saved checklist safely, handle older trades without checklist data
      const savedChecklist = (tradeToEdit as any).checklist;
      if (Array.isArray(savedChecklist) && savedChecklist.length === CHECKLIST_ITEMS.length) {
        setChecklist(savedChecklist);
      } else {
        setChecklist(Array(CHECKLIST_ITEMS.length).fill(false));
      }

      if (tradeToEdit.date) {
        const d = new Date(tradeToEdit.date);
        if (!isNaN(d.getTime())) setEntryDate(d);
      }
    }
  }, [tradeToEdit]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (symbolRef.current && !symbolRef.current.contains(event.target as Node)) {
        setShowSymbolSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleChecklist = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index] = !newChecklist[index];
    setChecklist(newChecklist);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
  };

  const handleSave = () => {
    if (!symbol || !entryPrice || !quantity) return;
    
    const entryNum = parseFloat(entryPrice);
    const lotNum = parseFloat(quantity);
    const rawExitNum = parseFloat(exitPrice);
    
    if (isNaN(entryNum) || isNaN(lotNum) || entryNum <= 0 || lotNum <= 0) return;

    const isClosed = !isNaN(rawExitNum) && rawExitNum > 0;
    const exitNum = isClosed ? rawExitNum : 0;
    
    const { pnl } = calculateTradeCore(symbol, direction, entryNum, exitNum, lotNum);

    // Create the updated trade object mapping ALL local states, including Checklist & Notes
    const newTrade = {
      ...(tradeToEdit || {}), // PRESERVE ANY UNMODIFIED FIELDS
      id: tradeToEdit ? tradeToEdit.id : Date.now().toString(),
      date: entryDate ? entryDate.toISOString() : (tradeToEdit?.date || new Date().toISOString()),
      pair: symbol.toUpperCase(),
      direction,
      entry: entryNum,
      exit: exitNum,
      lotSize: lotNum,
      pnl: isClosed ? pnl : 0, 
      status: isClosed ? 'CLOSED' : 'OPEN',
      notes,            // PERSIST NOTES
      checklist         // PERSIST CHECKLIST
    } as Trade;         // Typecast safely guarantees TS compiler acceptance

    if (tradeToEdit && onUpdateTrade) {
      onUpdateTrade(newTrade);
    } else if (onAddTrade) {
      onAddTrade(newTrade);
    }
    
    onClose();
  };

  const DatePickerPopup = ({ date, setDate }: { date: Date | null, setDate: (d: Date | null) => void }) => {
    const days = Array.from({length: 31}, (_, i) => i + 1);
    const today = new Date().getDate();

    return (
      <div className="absolute top-[105%] left-0 w-[280px] bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] shadow-2xl p-3 z-50">
        <div className="flex justify-between gap-2 mb-3">
          <button onClick={() => setDate(new Date())} className="flex-1 bg-surface2 hover:bg-[#1C1C1C] text-textMain text-[11px] font-medium py-1.5 rounded-lg transition-colors">Now</button>
          <button onClick={() => setDate(new Date(Date.now() - 86400000))} className="flex-1 bg-surface2 hover:bg-[#1C1C1C] text-textMain text-[11px] font-medium py-1.5 rounded-lg transition-colors">Yesterday</button>
          <button onClick={() => setDate(null)} className="flex-1 bg-surface2 hover:bg-[#1C1C1C] text-textMain text-[11px] font-medium py-1.5 rounded-lg transition-colors">Clear</button>
        </div>
        <div className="flex items-center justify-between px-2 mb-3">
          <ChevronDown className="w-4 h-4 text-muted rotate-90 cursor-pointer" />
          <span className="text-[13px] font-semibold text-textMain">Aug 2026</span>
          <ChevronDown className="w-4 h-4 text-muted -rotate-90 cursor-pointer" />
        </div>
        <div className="grid grid-cols-7 text-center gap-1 mb-2">
          {['SU','MO','TU','WE','TH','FR','SA'].map(d => <span key={d} className="text-[9px] font-semibold text-muted">{d}</span>)}
        </div>
        <div className="grid grid-cols-7 text-center gap-y-1 gap-x-1">
          <span className="text-[12px] text-[#333]">26</span>
          <span className="text-[12px] text-[#333]">27</span>
          <span className="text-[12px] text-[#333]">28</span>
          <span className="text-[12px] text-[#333]">29</span>
          <span className="text-[12px] text-[#333]">30</span>
          <span className="text-[12px] text-[#333]">31</span>
          {days.map(d => (
            <button 
              key={d}
              onClick={() => {
                const newD = new Date();
                newD.setDate(d);
                setDate(newD);
                setActiveDatePicker(null);
              }}
              className={`w-7 h-7 flex items-center justify-center rounded-lg text-[12px] mx-auto transition-colors ${
                date?.getDate() === d 
                  ? 'bg-brand text-white font-semibold shadow-[0_0_10px_rgba(10,132,255,0.4)]' 
                  : d === today ? 'text-brand font-semibold' : 'text-textMain hover:bg-[#1C1C1C]'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div ref={modalRef} className="bg-[#050505] w-full max-w-[500px] rounded-[24px] border border-[#1C1C1C] shadow-2xl relative z-10 flex flex-col max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        <div className="flex items-center justify-between p-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand/10 text-brand rounded-[10px] flex items-center justify-center border border-brand/20">
              <Plus className="w-5 h-5" />
            </div>
            <h2 className="text-[16px] font-bold text-textMain tracking-tight">
              {tradeToEdit ? 'Edit Trade' : 'Add Trade'}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-6 space-y-5">
          <div className="flex bg-[#121212] p-1 rounded-xl">
            <button 
              onClick={() => setDirection('LONG')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
                direction === 'LONG' ? 'bg-brand/10 text-brand shadow-[inset_0_0_0_1px_rgba(10,132,255,0.2)]' : 'text-muted hover:text-textMain'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Long
            </button>
            <button 
              onClick={() => setDirection('SHORT')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-[10px] text-[13px] font-semibold transition-all ${
                direction === 'SHORT' ? 'bg-loss/10 text-loss shadow-[inset_0_0_0_1px_rgba(255,69,58,0.2)]' : 'text-muted hover:text-textMain'
              }`}
            >
              <TrendingDown className="w-4 h-4" /> Short
            </button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-5 relative">
            <div className="relative" ref={symbolRef}>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Symbol</label>
              <input 
                type="text" 
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value.toUpperCase());
                  setShowSymbolSuggestions(true);
                }}
                onFocus={() => setShowSymbolSuggestions(true)}
                className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-[13px] font-semibold text-textMain focus:outline-none focus:border-brand/50 focus:shadow-[0_0_15px_rgba(10,132,255,0.15)] transition-all uppercase"
              />
              
              {showSymbolSuggestions && symbol.length > 0 && suggestions.length > 0 && (
                <div className="absolute top-[105%] left-0 w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-[16px] shadow-2xl py-1 z-50">
                  {suggestions.map((item, idx) => (
                    <div 
                      key={item.symbol}
                      onClick={() => {
                        setSymbol(item.symbol);
                        setShowSymbolSuggestions(false);
                      }}
                      className={`flex justify-between items-center px-4 py-2.5 cursor-pointer transition-colors ${idx === 0 ? 'bg-brand/10 text-brand' : 'hover:bg-[#121212]'}`}
                    >
                      <span className={`text-[13px] font-bold ${idx === 0 ? 'text-brand' : 'text-textMain'}`}>{item.symbol}</span>
                      <span className="text-[11px] text-muted">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Quantity</label>
              <input 
                type="number" 
                placeholder="Lots"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-[13px] font-semibold text-textMain focus:outline-none focus:border-brand/50 focus:shadow-[0_0_15px_rgba(10,132,255,0.15)] transition-all placeholder:text-muted/50 placeholder:font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Entry Price</label>
              <input 
                type="number" 
                placeholder="0.00"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-[13px] font-semibold text-textMain focus:outline-none focus:border-brand/50 focus:shadow-[0_0_15px_rgba(10,132,255,0.15)] transition-all placeholder:text-muted/50 placeholder:font-medium"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Exit Price</label>
              <input 
                type="number" 
                placeholder="Optional"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl px-4 py-2.5 text-[13px] font-semibold text-textMain focus:outline-none focus:border-brand/50 focus:shadow-[0_0_15px_rgba(10,132,255,0.15)] transition-all placeholder:text-muted/50 placeholder:font-medium"
              />
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Entry Date</label>
              <div 
                onClick={() => setActiveDatePicker(activeDatePicker === 'entry' ? null : 'entry')}
                className={`w-full flex items-center gap-2 bg-[#0A0A0A] border rounded-xl px-3 py-2.5 cursor-pointer transition-all ${activeDatePicker === 'entry' ? 'border-brand/50 shadow-[0_0_15px_rgba(10,132,255,0.15)]' : 'border-[#1C1C1C] hover:border-[#333]'}`}
              >
                <CalendarIcon className="w-4 h-4 text-muted" />
                <span className={`text-[13px] font-semibold ${entryDate ? 'text-textMain' : 'text-muted/50'}`}>
                  {entryDate ? formatDate(entryDate) : 'Select date'}
                </span>
              </div>
              {activeDatePicker === 'entry' && <DatePickerPopup date={entryDate} setDate={setEntryDate} />}
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Exit Date</label>
              <div 
                onClick={() => setActiveDatePicker(activeDatePicker === 'exit' ? null : 'exit')}
                className={`w-full flex items-center gap-2 bg-[#0A0A0A] border rounded-xl px-3 py-2.5 cursor-pointer transition-all ${activeDatePicker === 'exit' ? 'border-brand/50 shadow-[0_0_15px_rgba(10,132,255,0.15)]' : 'border-[#1C1C1C] hover:border-[#333]'}`}
              >
                <CalendarIcon className="w-4 h-4 text-muted" />
                <span className={`text-[13px] font-semibold ${exitDate ? 'text-textMain' : 'text-muted/50'}`}>
                  {exitDate ? formatDate(exitDate) : 'Optional'}
                </span>
              </div>
              {activeDatePicker === 'exit' && <DatePickerPopup date={exitDate} setDate={setExitDate} />}
            </div>
            
          </div>

          <div className="w-full h-[1px] bg-border my-2"></div>

          <div>
            <div 
              className="flex items-center gap-2 cursor-pointer mb-3"
              onClick={() => setChecklistOpen(!checklistOpen)}
            >
              <ChevronDown className={`w-4 h-4 text-muted transition-transform ${checklistOpen ? '' : '-rotate-90'}`} />
              <span className="text-[12px] font-medium text-muted">Pre-Trade Checklist (Optional)</span>
            </div>
            
            {checklistOpen && (
              <div className="space-y-1.5 ml-1">
                {CHECKLIST_ITEMS.map((item, idx) => {
                  const isChecked = checklist[idx];
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleChecklist(idx)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer transition-all border ${
                        isChecked 
                          ? 'bg-[#00D084]/10 border-[#00D084]/30' 
                          : 'bg-[#0A0A0A] border-[#1C1C1C] hover:border-[#333]'
                      }`}
                    >
                      <div className={`w-[18px] h-[18px] rounded-md flex items-center justify-center transition-colors ${
                        isChecked ? 'bg-[#00D084]' : 'bg-surface2 border border-[#333]'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 text-black stroke-[3]" />}
                      </div>
                      <span className={`text-[13px] ${isChecked ? 'text-white font-medium' : 'text-muted'}`}>{item}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted uppercase tracking-wider mb-2">Notes</label>
            <textarea 
              rows={3}
              placeholder="Trade rationale, entry/exit notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#1C1C1C] rounded-xl px-4 py-3 text-[13px] text-textMain focus:outline-none focus:border-brand/50 focus:shadow-[0_0_15px_rgba(10,132,255,0.15)] transition-all placeholder:text-muted/50 resize-y min-h-[80px]"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-textMain hover:bg-surface2 border border-transparent transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl text-[13px] font-semibold bg-brand hover:bg-brand/90 text-white shadow-[0_0_15px_rgba(10,132,255,0.25)] transition-all"
            >
              {tradeToEdit ? 'Update Trade' : 'Save Trade'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}