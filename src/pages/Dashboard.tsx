import React, { useMemo } from 'react';
import StatCard from '../components/dashboard/StatCard';
import WinRateCard from '../components/dashboard/WinRateCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import MonthlyCalendar from '../components/dashboard/MonthlyCalendar';
import OpenPositions from '../components/dashboard/OpenPositions';
import RecentActivity from '../components/dashboard/RecentActivity';
import TopPerformers from '../components/dashboard/TopPerformers';
import { calculateDashboardStats } from '../utils/tradingCalculations';
import type { Trade } from '../types/trade';

interface DashboardProps {
  trades?: Trade[];
}

export default function Dashboard({ trades = [] }: DashboardProps) {
  const safeTrades = useMemo(() => {
    const arr = Array.isArray(trades) ? trades : [];
    return arr.filter(t => {
      if (!t || typeof t !== 'object') return false;
      if (!t.date) return false;
      return !isNaN(new Date(t.date).getTime());
    });
  }, [trades]);
  
  const stats = useMemo(() => {
    try {
      return calculateDashboardStats(safeTrades);
    } catch (e) {
      return {
        totalPnl: 0, unrealizedPnl: 0, realizedPnl: 0, winRate: 0,
        closedTradesCount: 0, openPositionsCount: 0, equityCurve: []
      };
    }
  }, [safeTrades]);

  return (
    <div className="px-6 py-5 md:px-8 md:py-5 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* 1. SUMMARY STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        <StatCard title="TOTAL P&L" value={stats.totalPnl} subtitle={`${stats.closedTradesCount} trades`} />
        <StatCard title="UNREALIZED" value={stats.unrealizedPnl} subtitle={`${stats.openPositionsCount} open positions`} />
        <StatCard title="REALIZED" value={stats.realizedPnl} subtitle={`${stats.closedTradesCount} closed trades`} />
        <WinRateCard winRate={stats.winRate} />
      </div>

      {/* Keep the chart and calendar proportioned and aligned as one compact row. */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-5 items-stretch">
        <PerformanceChart trades={safeTrades} />
        <MonthlyCalendar trades={safeTrades} totalPnl={stats.totalPnl} />
      </div>

      {/* 3. BOTTOM CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <OpenPositions trades={safeTrades} />
        <RecentActivity trades={safeTrades} />
        <TopPerformers trades={safeTrades} />
      </div>
      
    </div>
  );
}
