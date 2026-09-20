import React from 'react';
import { Wallet, Activity, CreditCard, ArrowRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value?: number;
  subtitle?: string;
  icon?: React.ElementType; // Made optional to prevent the crash
}

export default function StatCard({ title, value = 0, subtitle = '', icon: CustomIcon }: StatCardProps) {
  
  // 1. CRITICAL CRASH GUARD: Automatically assign a fallback icon if none is provided
  let Icon = CustomIcon || Wallet;
  if (!CustomIcon) {
    if (title.toUpperCase().includes('UNREALIZED')) Icon = Activity;
    else if (title.toUpperCase().includes('REALIZED')) Icon = CreditCard;
  }

  // 2. Safely format the currency value
  const formatValue = (val: number) => {
    if (isNaN(val) || !isFinite(val)) return '$0.00';
    const absVal = Math.abs(val);
    
    // In your reference images, Unrealized is white ($0.00), while Realized/Total show +/-
    const isUnrealized = title.toUpperCase() === 'UNREALIZED';
    const prefix = !isUnrealized && val >= 0 ? '+' : val < 0 ? '−' : '';
    
    return `${prefix}$${absVal.toFixed(2)}`;
  };

  const valStr = formatValue(value);
  const isPositive = value >= 0;
  const isUnrealized = title.toUpperCase() === 'UNREALIZED';

  const iconTone = isUnrealized
    ? 'bg-[#FF9500]/15 text-[#FFCC00]'
    : 'bg-[#0A84FF]/15 text-[#0A84FF]';

  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] px-5 py-4 min-h-[116px] flex items-center gap-4 min-w-0">
      <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${iconTone}`}>
        <Icon className="w-5 h-5" />
      </div>

      <div className="min-w-0 flex-1">
        <span className="block text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider truncate">
          {title}
        </span>
        {/* Adjusted to font-black and exactly 2px smaller */}
        <span className={`block mt-0.5 whitespace-nowrap tabular-nums text-[26px] xl:text-[28px] font-black tracking-tight leading-tight ${
          isUnrealized
            ? 'text-white'
            : isPositive
              ? 'text-[#0A84FF]'
              : 'text-[#FF453A]'
        }`}>
          {valStr}
        </span>
        <span className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#8E8E93] min-w-0">
          <ArrowRight className="w-3 h-3 shrink-0" />
          <span className="truncate">{subtitle}</span>
        </span>
      </div>
    </div>
  );
}