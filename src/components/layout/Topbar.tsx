import { useEffect, useState, useRef } from 'react';
import { Search, Moon, Sun, Plus, Bell, Clock, PenLine, RefreshCw, BarChart2, ChevronDown } from 'lucide-react';
import type { Trade } from '../../types/trade';
import AddTradeModal from '../dashboard/AddTradeModal';

interface TopbarProps {
  onAddTrade: (trade: Trade) => void;
  onNavigate: (page: string) => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export default function Topbar({ onAddTrade, onNavigate, isDark = true, onToggleTheme }: TopbarProps) {
  const [time, setTime] = useState('');
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [addTradeOpen, setAddTradeOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setQuickActionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- NEW: LISTEN FOR EXTERNAL ADD TRADE REQUESTS ---
  useEffect(() => {
    const handleOpenAddTrade = () => setAddTradeOpen(true);
    window.addEventListener('openAddTrade', handleOpenAddTrade);
    return () => window.removeEventListener('openAddTrade', handleOpenAddTrade);
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <>
      <div className={`h-[70px] border-b sticky top-0 z-10 flex items-center justify-between px-6 transition-colors ${
        isDark ? 'bg-app border-border' : 'bg-white border-[#E5E5EA]'
      }`}>
        <div>
          <h1 className={`text-[22px] font-bold tracking-tight leading-none mb-1 ${isDark ? 'text-textMain' : 'text-[#111111]'}`}>Dashboard</h1>
          <p className="text-[12px] text-muted">{today}</p>
        </div>

        <div className="flex-1 max-w-[480px] mx-8 relative hidden sm:block">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search..." 
            className={`w-full border rounded-xl pl-10 pr-12 py-2 text-[13px] focus:outline-none focus:border-brand focus:shadow-[0_0_10px_rgba(10,132,255,0.2)] transition-all placeholder:text-muted ${
              isDark ? 'bg-surface2 border-border text-textMain' : 'bg-[#F0F1F3] border-[#E5E5EA] text-[#111111]'
            }`}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${isDark ? 'text-muted bg-[#121212]' : 'text-muted bg-[#E5E5EA]'}`}>Ctrl+K</kbd>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Theme Toggle Button */}
          <button 
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors group relative ${
              isDark ? 'border-border bg-surface2 text-muted hover:text-textMain' : 'border-[#E5E5EA] bg-[#F0F1F3] text-[#555555] hover:text-[#111111]'
            }`}
          >
            {isDark ? <Moon className="w-4 h-4 text-purple-400 group-hover:text-purple-300" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          <div ref={menuRef} className="relative">
            <button 
              onClick={() => setQuickActionsOpen(!quickActionsOpen)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                quickActionsOpen ? 'bg-brand/90 text-white shadow-[0_0_15px_rgba(10,132,255,0.4)]' : 'bg-brand hover:bg-brand/90 text-white shadow-[0_0_15px_rgba(10,132,255,0.25)]'
              }`}
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Quick Actions Dropdown */}
            {quickActionsOpen && (
              <div className={`absolute right-0 top-12 w-64 border rounded-[20px] shadow-2xl p-2 z-50 flex flex-col ${
                isDark ? 'bg-[#0A0A0A] border-[#1C1C1C]' : 'bg-white border-[#E5E5EA]'
              }`}>
                <div className="px-3 py-2">
                  <span className={`text-[14px] font-bold ${isDark ? 'text-textMain' : 'text-[#111111]'}`}>Quick Actions</span>
                </div>
                <div className="space-y-1 mt-1">
                  <button 
                    onClick={() => { setQuickActionsOpen(false); setAddTradeOpen(true); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors group text-left ${
                      isDark ? 'hover:bg-surface2' : 'hover:bg-[#F4F5F7]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-[10px] bg-brand flex items-center justify-center shadow-[0_0_10px_rgba(10,132,255,0.2)]">
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                    <span className={`text-[14px] font-medium ${isDark ? 'text-white' : 'text-[#111111]'}`}>Add Manual Trade</span>
                  </button>

                  <button 
                    onClick={() => { setQuickActionsOpen(false); onNavigate('Journal'); }}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors group text-left ${
                      isDark ? 'hover:bg-surface2' : 'hover:bg-[#F4F5F7]'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-[10px] border flex items-center justify-center transition-colors ${
                      isDark ? 'bg-surface2 border-[#1C1C1C]' : 'bg-[#F0F1F3] border-[#E5E5EA]'
                    }`}>
                      <PenLine className={`w-4 h-4 ${isDark ? 'text-textMain' : 'text-[#555555]'}`} />
                    </div>
                    <span className={`text-[14px] font-medium ${isDark ? 'text-textMain' : 'text-[#111111]'}`}>New Journal Entry</span>
                  </button>

                  <div className="w-full flex items-center gap-3 p-2 rounded-xl opacity-50 cursor-not-allowed text-left">
                    <div className={`w-10 h-10 rounded-[10px] border flex items-center justify-center ${
                      isDark ? 'bg-surface2 border-border' : 'bg-[#F0F1F3] border-[#E5E5EA]'
                    }`}>
                      <RefreshCw className="w-4 h-4 text-muted" />
                    </div>
                    <span className="text-[14px] font-medium text-muted">Sync MT5 Account</span>
                  </div>

                  <div className="w-full flex items-center gap-3 p-2 rounded-xl opacity-50 cursor-not-allowed text-left">
                    <div className={`w-10 h-10 rounded-[10px] border flex items-center justify-center ${
                      isDark ? 'bg-surface2 border-border' : 'bg-[#F0F1F3] border-[#E5E5EA]'
                    }`}>
                      <BarChart2 className="w-4 h-4 text-muted" />
                    </div>
                    <span className="text-[14px] font-medium text-muted">View Analytics</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className={`items-center gap-2 text-muted text-[12px] border rounded-xl px-3 py-2 hidden lg:flex ${
            isDark ? 'bg-surface2 border-border' : 'bg-[#F0F1F3] border-[#E5E5EA]'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono w-[75px]">{time}</span>
          </div>
          
          <button className={`w-9 h-9 rounded-xl border flex items-center justify-center text-muted transition-colors relative ${
            isDark ? 'border-border bg-surface2 hover:text-textMain' : 'border-[#E5E5EA] bg-[#F0F1F3] hover:text-[#111111]'
          }`}>
            <Bell className="w-4 h-4" />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand rounded-full"></div>
          </button>

          <button
            type="button"
            aria-label="Account menu"
            className={`h-9 w-[72px] rounded-xl border flex items-center justify-between px-2 cursor-pointer ml-1 transition-colors ${
              isDark ? 'bg-surface2 border-border hover:border-[#2C2C2E]' : 'bg-[#F0F1F3] border-[#E5E5EA]'
            }`}
          >
            <span className="w-6 h-6 rounded-lg bg-brand flex items-center justify-center shadow-[0_0_10px_rgba(10,132,255,0.2)]">
              <span className="w-2 h-2 bg-white rounded-sm" />
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-muted" />
          </button>
        </div>
      </div>

      {addTradeOpen && (
        <AddTradeModal 
          onClose={() => setAddTradeOpen(false)} 
          onAddTrade={(trade) => {
            onAddTrade(trade);
            setAddTradeOpen(false);
          }} 
        />
      )}
    </>
  );
}
