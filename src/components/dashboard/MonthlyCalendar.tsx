import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Trade } from '../../types/trade';
import { processTrade } from '../../utils/tradingCalculations';

interface MonthlyCalendarProps {
  trades?: Trade[];
  totalPnl?: number;
}

export default function MonthlyCalendar({ trades, totalPnl }: MonthlyCalendarProps) {
  const rawTrades = useMemo(() => {
    if (Array.isArray(trades) && trades.length > 0) return trades;
    try {
      const stored = localStorage.getItem('tradefxbook_trades');
      if (!stored || stored === 'undefined') return [];
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(t => t && t.date && !isNaN(new Date(t.date).getTime()));
    } catch {
      return [];
    }
  }, [trades]);

  const processedTrades = useMemo(() => {
    return rawTrades.map((t: Trade) => {
      try {
        return typeof processTrade === 'function' ? processTrade(t) : { ...t, pnl: Number(t.pnl) || 0, status: t.status };
      } catch (e) {
        return { ...t, pnl: 0, status: 'OPEN' };
      }
    }).filter((t: Trade) => t.status === 'CLOSED');
  }, [rawTrades]);

  const [currentDate, setCurrentDate] = useState(new Date());

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const calendarStart = new Date(year, month, 1 - startOffset);
    const weeks = [];
    let currentDay = new Date(calendarStart);
    let monthlyTotal = 0;

    for (let w = 0; w < 6; w++) {
      const days = [];
      let weeklyPnl = 0;
      let weeklyTrades = 0;

      for (let i = 0; i < 7; i++) {
        const dYear = currentDay.getFullYear();
        const dMonth = String(currentDay.getMonth() + 1).padStart(2, '0');
        const dDate = String(currentDay.getDate()).padStart(2, '0');
        const dateStr = `${dYear}-${dMonth}-${dDate}`;
        
        const dayTrades = processedTrades.filter((t: Trade) => {
          if (!t.date) return false;
          try {
            const tDate = new Date(t.date);
            const tY = tDate.getFullYear();
            const tM = String(tDate.getMonth() + 1).padStart(2, '0');
            const tD = String(tDate.getDate()).padStart(2, '0');
            return `${tY}-${tM}-${tD}` === dateStr;
          } catch {
            return false;
          }
        });

        const dailyPnl = dayTrades.reduce((sum: number, t: Trade) => sum + (Number(t.pnl) || 0), 0);

        if (currentDay.getMonth() === month) {
          monthlyTotal += dailyPnl;
        }

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        days.push({
          dateObj: new Date(currentDay),
          isCurrentMonth: currentDay.getMonth() === month,
          isToday: dateStr === todayStr,
          pnl: dailyPnl,
          count: dayTrades.length
        });

        weeklyPnl += dailyPnl;
        weeklyTrades += dayTrades.length;

        currentDay.setDate(currentDay.getDate() + 1);
      }

      weeks.push({
        days,
        summary: { pnl: weeklyPnl, count: weeklyTrades }
      });
    }

    return { weeks, monthlyTotal };
  }, [currentDate, processedTrades]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthYearString = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentDate);

  const formatPnl = (val: number) => {
    if (val === 0) return '';
    const absVal = Math.abs(val);
    const formattedNum = Number.isInteger(absVal) ? absVal.toString() : absVal.toFixed(2);
    return `${val > 0 ? '+' : '-'}$${formattedNum}`;
  };

  const formatWeeklyPnl = (val: number) => {
    if (val === 0) return '$0';
    const absVal = Math.abs(val);
    const prefix = val > 0 ? '+' : '-';
    if (absVal >= 1000) {
      const kVal = absVal / 1000;
      return `${prefix}$${Number.isInteger(kVal) ? kVal : kVal.toFixed(1)}K`;
    }
    const formattedNum = Number.isInteger(absVal) ? absVal.toString() : absVal.toFixed(2);
    return `${prefix}$${formattedNum}`;
  };

  const getResponsiveTextClass = (str: string) => {
    const len = str.length;
    if (len <= 4) return 'text-[11px] lg:text-[12px] tracking-tight'; 
    if (len === 5) return 'text-[10px] lg:text-[11.5px] tracking-tight'; 
    if (len === 6) return 'text-[9px] lg:text-[10px] tracking-tighter'; 
    if (len === 7) return 'text-[8.5px] lg:text-[9px] tracking-tighter'; 
    return 'text-[7.5px] tracking-tighter'; 
  };

  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] p-5 w-full h-full flex flex-col min-w-0 box-border">
      
      <div className="flex flex-row justify-between items-center w-full mb-4 shrink-0">
        <h2 className="text-[16px] xl:text-[18px] font-bold text-textMain tracking-tight whitespace-nowrap">
          Monthly P&L
        </h2>
        
        <div className="flex flex-row items-center gap-3 xl:gap-5 min-w-0">
          <div className="text-[11px] xl:text-[12px] font-medium text-muted whitespace-nowrap hidden sm:block">
            Monthly: <span className={`font-bold ${calendarData.monthlyTotal >= 0 ? 'text-[#0A84FF]' : 'text-[#FF453A]'}`}>
              {calendarData.monthlyTotal >= 0 ? '+' : '-'}${Math.abs(calendarData.monthlyTotal).toFixed(2)}
            </span>
          </div>
          
          <div className="flex flex-row items-center gap-1.5 shrink-0">
            <button onClick={prevMonth} aria-label="Previous month" className="p-1.5 bg-[#121212] border border-[#1C1C1C] hover:bg-[#1C1C1E] rounded-lg text-muted hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4 xl:w-4 xl:h-4" />
            </button>
            <span className="text-[11px] xl:text-[12px] font-semibold text-textMain min-w-[75px] xl:min-w-[85px] text-center select-none whitespace-nowrap">
              {monthYearString}
            </span>
            <button onClick={nextMonth} aria-label="Next month" className="p-1.5 bg-[#121212] border border-[#1C1C1C] hover:bg-[#1C1C1E] rounded-lg text-muted hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4 xl:w-4 xl:h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* justify-start keeps rows compact at the top of the container instead of stretching downwards */}
      <div className="flex flex-col flex-1 justify-start mt-1">
        
        <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_minmax(42px,0.85fr)] gap-1 mb-1.5 px-0.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center text-[10px] xl:text-[11px] font-semibold text-[#8E8E93]">{day}</div>
          ))}
          <div className="text-center text-[10px] xl:text-[11px] font-medium text-[#8E8E93]">Weekly</div>
        </div>

        <div className="flex flex-col gap-1 sm:gap-1.5">
          {calendarData.weeks.map((week, wIdx) => (
            <div key={`w-${wIdx}`} className="grid grid-cols-[repeat(7,minmax(0,1fr))_minmax(42px,0.85fr)] gap-1 sm:gap-1.5">
              
              {week.days.map((day, dIdx) => {
                const pnlStr = formatPnl(day.pnl);
                const pnlClass = getResponsiveTextClass(pnlStr);
                const isCurrentMonth = day.isCurrentMonth;
                const isProfit = day.pnl > 0;
                const isLoss = day.pnl < 0;

                const bgClass = !isCurrentMonth 
                  ? 'opacity-30 bg-transparent border-[#1C1C1C]' 
                  : isProfit 
                    ? 'bg-[#0A84FF]/10 border-[#0A84FF]/30' 
                    : isLoss 
                      ? 'bg-[#FF453A]/10 border-[#FF453A]/30' 
                      : 'bg-transparent border-[#1C1C1E] hover:border-[#333]';

                return (
                  <div 
                    key={`d-${wIdx}-${dIdx}`} 
                    // Tightly locks height to 40-42px to replicate reference density
                    className={`relative flex flex-col justify-center px-0.5 h-[40px] lg:h-[42px] rounded-[8px] border box-border min-w-0 ${bgClass}`}
                  >
                    {isCurrentMonth && (
                      <>
                        <span className={`absolute top-1 left-1.5 text-[9.5px] font-semibold leading-none ${day.isToday ? 'text-[#0A84FF]' : 'text-[#8E8E93]'}`}>
                          {day.dateObj.getDate()}
                        </span>
                        
                        <div className="w-full mt-3.5 px-[1px] box-border">
                          {day.pnl !== 0 && (
                            <div className={`block w-full text-center whitespace-nowrap font-bold ${pnlClass} ${isProfit ? 'text-[#0A84FF]' : 'text-[#FF453A]'}`}>
                              {pnlStr}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}

              {(() => {
                const weeklyPnlStr = formatWeeklyPnl(week.summary.pnl);
                const isWProfit = week.summary.pnl > 0;
                const isWLoss = week.summary.pnl < 0;

                return (
                  <div className="flex flex-col items-center justify-center bg-[#121212] border border-[#1C1C1E] rounded-[8px] h-[40px] lg:h-[42px] px-0.5 box-border min-w-0">
                    <span className="text-[7px] xl:text-[8px] font-bold text-[#4A4A4A] uppercase tracking-wider mb-[3px] leading-none">WEEKLY</span>
                    <div className="w-full px-[1px] box-border">
                      <div className={`block w-full text-center whitespace-nowrap font-bold ${getResponsiveTextClass(weeklyPnlStr)} ${isWProfit ? 'text-[#0A84FF]' : isWLoss ? 'text-[#FF453A]' : 'text-[#8E8E93]'}`}>
                        {weeklyPnlStr}
                      </div>
                    </div>
                    <span className="text-[6.5px] xl:text-[7.5px] text-[#4A4A4A] w-full text-center mt-[3px] leading-none whitespace-nowrap overflow-hidden">
                      {week.summary.count > 0 ? 'Traded D...' : ' '}
                    </span>
                  </div>
                );
              })()}
              
            </div>
          ))}
        </div>
      </div>

      {/* mt-auto pushes the legend naturally to the bottom */}
      <div className="flex items-center justify-center gap-6 mt-auto pt-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0A84FF]"></div>
          <span className="text-[11px] xl:text-[12px] text-[#8E8E93] font-medium">Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#FF453A]"></div>
          <span className="text-[11px] xl:text-[12px] text-[#8E8E93] font-medium">Loss</span>
        </div>
      </div>

    </div>
  );
}
