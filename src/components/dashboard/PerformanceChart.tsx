import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LineChart, TrendingUp, TrendingDown } from 'lucide-react';
import type { Trade } from '../../types/trade';
import { processTrade } from '../../utils/tradingCalculations';

interface PerformanceChartProps {
  trades: Trade[];
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | 'ALL';

export default function PerformanceChart({ trades }: PerformanceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 200 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({ 
          width: entry.contentRect.width, 
          height: entry.contentRect.height 
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const chartData = useMemo(() => {
    const safeTrades = Array.isArray(trades) ? trades : [];
    const now = new Date();
    
    const closedTrades = safeTrades
      .map(t => {
        try {
          return typeof processTrade === 'function' ? processTrade(t) : { ...t, pnl: Number(t.pnl) || 0, status: t.status };
        } catch {
          return { ...t, pnl: 0, status: 'OPEN' };
        }
      })
      .filter(t => t.status === 'CLOSED')
      .filter(t => {
        if (timeRange === 'ALL') return true;
        const d = new Date(t.date);
        if (isNaN(d.getTime())) return false;
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        
        if (timeRange === '1D') return diffDays <= 1;
        if (timeRange === '1W') return diffDays <= 7;
        if (timeRange === '1M') return diffDays <= 30;
        if (timeRange === '3M') return diffDays <= 90;
        return true;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningPnl = 0;
    const dataPoints = closedTrades.map(t => {
      runningPnl += Number(t.pnl) || 0;
      const d = new Date(t.date);
      return {
        cumulative: runningPnl,
        pnl: Number(t.pnl) || 0,
        dateObj: d,
        shortDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(d),
        fullDate: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(d),
      };
    });

    if (dataPoints.length > 0) {
      const anchorDate = new Date(dataPoints[0].dateObj);
      anchorDate.setHours(anchorDate.getHours() - 12);
      dataPoints.unshift({
        cumulative: 0,
        pnl: 0,
        dateObj: anchorDate,
        shortDate: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(anchorDate),
        fullDate: new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(anchorDate),
      });
    }

    return dataPoints;
  }, [trades, timeRange]);

  const finalPnl = chartData.length > 0 ? chartData[chartData.length - 1].cumulative : 0;
  const isPositive = finalPnl >= 0;
  
  const winningTrades = chartData.filter(d => d.pnl > 0).length;
  const totalRealTrades = Math.max(1, chartData.length - 1);
  const winRate = chartData.length > 1 ? ((winningTrades / totalRealTrades) * 100).toFixed(1) : '0.0';

  const { width, height } = dimensions;
  const margin = { top: 15, right: 45, bottom: 20, left: 5 };
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);

  const yValues = chartData.map(d => d.cumulative);
  let minY = Math.min(0, ...yValues);
  let maxY = Math.max(0, ...yValues);
  
  if (minY === 0 && maxY === 0) {
    minY = -50;
    maxY = 50;
  } else {
    const padding = (maxY - minY) * 0.15;
    minY -= padding;
    maxY += padding;
  }

  const mapX = (index: number) => margin.left + (index / Math.max(1, chartData.length - 1)) * innerWidth;
  const mapY = (val: number) => margin.top + innerHeight - ((val - minY) / (maxY - minY)) * innerHeight;
  const zeroY = mapY(0);

  const yTicks = [];
  const tickCount = 4;
  for (let i = 0; i <= tickCount; i++) {
    yTicks.push(minY + (i * (maxY - minY)) / tickCount);
  }

  const xTicks = [];
  if (chartData.length > 1) {
    const xTickCount = Math.min(7, chartData.length);
    for (let i = 0; i < xTickCount; i++) {
      xTicks.push(Math.floor(i * (chartData.length - 1) / (xTickCount - 1)));
    }
  }

  const pathPoints = chartData.map((d, i) => ({ x: mapX(i), y: mapY(d.cumulative) }));

  const createSmoothPath = (points: {x: number, y: number}[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    if (points.length === 2) return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 === points.length ? i + 1 : i + 2];

      const t = 0.2; 
      
      let cp1x = p1.x + (p2.x - p0.x) * t;
      let cp1y = p1.y + (p2.y - p0.y) * t;
      let cp2x = p2.x - (p3.x - p1.x) * t;
      let cp2y = p2.y - (p3.y - p1.y) * t;

      const yMin = Math.min(p1.y, p2.y);
      const yMax = Math.max(p1.y, p2.y);
      cp1y = Math.max(yMin, Math.min(yMax, cp1y));
      cp2y = Math.max(yMin, Math.min(yMax, cp2y));
      
      cp1x = Math.max(p1.x, Math.min(p2.x, cp1x));
      cp2x = Math.max(p1.x, Math.min(p2.x, cp2x));

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = createSmoothPath(pathPoints);
  const areaPath = pathPoints.length > 0 ? `${linePath} L ${pathPoints[pathPoints.length - 1].x} ${zeroY} L ${pathPoints[0].x} ${zeroY} Z` : '';
  const formatAxisValue = (value: number) => {
    const absolute = Math.abs(value);
    const suffix = absolute >= 1000
      ? `${(absolute / 1000).toFixed(absolute >= 10000 ? 0 : 1).replace(/\.0$/, '')}K`
      : absolute.toFixed(0);
    return `${value < 0 ? '−' : ''}$${suffix}`;
  };
  const clearHover = () => setHoverIndex(null);

  return (
    <div className="bg-[#0A0A0A] border border-[#1C1C1C] rounded-[20px] p-5 w-full h-full flex flex-col min-w-0 box-border">
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 w-full min-w-0 shrink-0">
        <div className="min-w-0 shrink">
          <div className="flex items-center gap-2 text-[#8E8E93] mb-1.5">
            <LineChart className="w-4 h-4" />
            <span className="text-[11px] font-bold tracking-wider uppercase">Performance</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[28px] xl:text-[32px] font-bold tracking-tight truncate ${isPositive ? 'text-[#0A84FF]' : 'text-[#FF453A]'}`}>
              {finalPnl >= 0 ? '+' : '−'}${Math.abs(finalPnl).toFixed(2)}
            </span>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold shadow-sm shrink-0 ${
              isPositive ? 'bg-[#0A84FF]/10 border-[#0A84FF]/30 text-[#0A84FF]' : 'bg-[#FF453A]/10 border-[#FF453A]/30 text-[#FF453A]'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {winRate}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-[#121212] border border-[#1C1C1C] p-1 rounded-xl shrink-0 mt-1">
          {(['1D', '1W', '1M', '3M', 'ALL'] as TimeRange[]).map(tr => (
            <button
              key={tr}
              onClick={() => {
                clearHover();
                setTimeRange(tr);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] xl:text-[12px] font-semibold transition-all shrink-0 ${
                timeRange === tr 
                  ? 'bg-[#2C2C2E] text-white shadow-sm' 
                  : 'text-muted hover:text-textMain hover:bg-[#1C1C1E]'
              }`}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* flex-1 handles the plot height dynamically based on the parent card, solving the artificial stretching bug */}
      <div 
        ref={containerRef} 
        className="relative w-full flex-1 min-h-[220px] select-none mt-4"
        onMouseLeave={clearHover}
        onPointerLeave={clearHover}
        onPointerCancel={clearHover}
      >
        {chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
            <LineChart className="w-8 h-8 mb-2 opacity-20" />
            <span className="text-[13px] font-medium">No closed trades in this period</span>
          </div>
        ) : (
          <>
            <svg width={width} height={height} className="absolute inset-0 block overflow-visible">
              <defs>
                <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0A84FF" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0A84FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF453A" stopOpacity={0} />
                  <stop offset="100%" stopColor="#FF453A" stopOpacity={0.25} />
                </linearGradient>
                <clipPath id="posClip">
                  <rect x="0" y="0" width={width} height={Math.max(0, zeroY)} />
                </clipPath>
                <clipPath id="negClip">
                  <rect x="0" y={Math.max(0, zeroY)} width={width} height={Math.max(0, height - zeroY)} />
                </clipPath>
              </defs>

              {yTicks.map((tick, i) => (
                <line key={`hy-${i}`} x1={margin.left} y1={mapY(tick)} x2={width - margin.right} y2={mapY(tick)} stroke="#1C1C1E" strokeWidth="1" />
              ))}
              
              {xTicks.map((tickIdx, i) => (
                <line key={`vx-${i}`} x1={mapX(tickIdx)} y1={margin.top} x2={mapX(tickIdx)} y2={height - margin.bottom} stroke="#1C1C1E" strokeWidth="1" />
              ))}

              <line x1={margin.left} y1={zeroY} x2={width - margin.right} y2={zeroY} stroke="#8E8E93" strokeWidth="1" strokeDasharray="4 4" opacity={0.4} />

              <g clipPath="url(#posClip)">
                <path d={areaPath} fill="url(#posGrad)" />
                <path d={linePath} fill="none" stroke="#0A84FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
              <g clipPath="url(#negClip)">
                <path d={areaPath} fill="url(#negGrad)" />
                <path d={linePath} fill="none" stroke="#FF453A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>

              {xTicks.map((tickIdx, i) => (
                <text key={`lx-${i}`} x={mapX(tickIdx)} y={height - 5} fill="#8E8E93" fontSize="9" fontWeight="600" textAnchor="middle">
                  {chartData[tickIdx].shortDate}
                </text>
              ))}

              {yTicks.map((tick, i) => (
                <text key={`ly-${i}`} x={width - margin.right + 10} y={mapY(tick) + 3} fill="#0A84FF" fontSize="9" fontWeight="600" textAnchor="start">
                  {formatAxisValue(tick)}
                </text>
              ))}

              {chartData.map((d, i) => {
                const segmentWidth = innerWidth / Math.max(1, chartData.length - 1);
                return (
                  <rect
                    key={`hover-${i}`}
                    x={mapX(i) - segmentWidth / 2}
                    y={margin.top}
                    width={segmentWidth}
                    height={innerHeight}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(i)}
                  />
                );
              })}

              {hoverIndex !== null && chartData[hoverIndex] && (
                <>
                  <line 
                    x1={mapX(hoverIndex)} y1={margin.top} 
                    x2={mapX(hoverIndex)} y2={height - margin.bottom} 
                    stroke="#4A4A4A" strokeWidth="1" strokeDasharray="4 4" 
                  />
                  <circle 
                    cx={mapX(hoverIndex)} 
                    cy={mapY(chartData[hoverIndex].cumulative)} 
                    r="4" 
                    fill={chartData[hoverIndex].cumulative >= 0 ? '#0A84FF' : '#FF453A'} 
                    stroke="#121212" strokeWidth="2" 
                  />
                </>
              )}
            </svg>

            {hoverIndex !== null && chartData[hoverIndex] && (
              <div 
                className="absolute pointer-events-none bg-[#121212]/95 border border-[#2C2C2E] backdrop-blur-md rounded-2xl p-3 shadow-2xl transition-all duration-100"
                style={{
                  left: mapX(hoverIndex) > width / 2 ? mapX(hoverIndex) - 140 : mapX(hoverIndex) + 20,
                  top: Math.max(margin.top, mapY(chartData[hoverIndex].cumulative) - 30)
                }}
              >
                <div className="text-[#8E8E93] text-[11px] font-semibold mb-1">
                  {chartData[hoverIndex].fullDate}
                </div>
                <div className={`text-[20px] font-bold leading-tight mb-0.5 ${chartData[hoverIndex].cumulative >= 0 ? 'text-[#0A84FF]' : 'text-[#FF453A]'}`}>
                  {chartData[hoverIndex].cumulative >= 0 ? '+' : '−'}${Math.abs(chartData[hoverIndex].cumulative).toFixed(2)}
                </div>
                <div className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-wider">
                  Cumulative P&L
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
