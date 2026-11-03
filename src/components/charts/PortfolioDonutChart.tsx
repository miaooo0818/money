import React, { useState } from 'react';
import { PortfolioHolding } from '../../types/stock';

interface Props {
  holdings: PortfolioHolding[];
  onSelectHolding?: (symbol: string) => void;
}

const COLORS = ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#fb923c'];

export const PortfolioDonutChart: React.FC<Props> = ({ holdings, onSelectHolding }) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  // Calculate slice angles
  let cumulativeAngle = 0;
  const slices = holdings.map((h, i) => {
    const fraction = totalValue > 0 ? h.currentValue / totalValue : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + fraction * 360;
    cumulativeAngle = endAngle;
    return {
      ...h,
      fraction,
      startAngle,
      endAngle,
      color: COLORS[i % COLORS.length],
    };
  });

  const size = 260;
  const center = size / 2;
  const radius = 95;
  const innerRadius = 60;

  // Helper to convert polar to cartesian coordinates
  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleRad),
      y: cy + r * Math.sin(angleRad),
    };
  };

  const describeArc = (cx: number, cy: number, r: number, inR: number, startAngle: number, endAngle: number) => {
    // Avoid full 360 glitch by capping at 359.99
    const effectiveEnd = endAngle - startAngle >= 360 ? startAngle + 359.99 : endAngle;
    const p1 = polarToCartesian(cx, cy, r, effectiveEnd);
    const p2 = polarToCartesian(cx, cy, r, startAngle);
    const p3 = polarToCartesian(cx, cy, inR, startAngle);
    const p4 = polarToCartesian(cx, cy, inR, effectiveEnd);

    const arcSweep = effectiveEnd - startAngle <= 180 ? '0' : '1';

    return [
      `M ${p2.x} ${p2.y}`,
      `A ${r} ${r} 0 ${arcSweep} 1 ${p1.x} ${p1.y}`,
      `L ${p4.x} ${p4.y}`,
      `A ${inR} ${inR} 0 ${arcSweep} 0 ${p3.x} ${p3.y}`,
      'Z',
    ].join(' ');
  };

  const selectedHolding = activeIdx !== null ? slices[activeIdx] : null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <h4 className="text-sm font-semibold text-slate-100">投資部位資產佔比 (Asset Allocation)</h4>
        <span className="text-xs text-slate-400 font-mono">共 {holdings.length} 檔持倉</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* SVG Donut */}
        <div className="relative shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {slices.map((slice, i) => {
              const isHovered = activeIdx === i;
              const r = isHovered ? radius + 5 : radius;
              const path = describeArc(center, center, r, innerRadius, slice.startAngle, slice.endAngle);

              return (
                <path
                  key={slice.id}
                  d={path}
                  fill={slice.color}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-150 cursor-pointer hover:opacity-90"
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseLeave={() => setActiveIdx(null)}
                  onClick={() => onSelectHolding && onSelectHolding(slice.symbol)}
                />
              );
            })}
          </svg>

          {/* Donut Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {selectedHolding ? (
              <>
                <span className="text-[11px] font-mono text-slate-400">{selectedHolding.symbol}</span>
                <span className="text-sm font-bold text-white max-w-[90px] truncate">{selectedHolding.name}</span>
                <span className="text-xs font-mono font-bold text-indigo-400">
                  {(selectedHolding.fraction * 100).toFixed(1)}%
                </span>
              </>
            ) : (
              <>
                <span className="text-[11px] text-slate-400">總持倉現值</span>
                <span className="text-sm font-bold font-mono text-white tabular-nums">
                  ${(totalValue / 10000).toFixed(1)} 萬
                </span>
                <span className="text-[10px] text-slate-500">點擊查看</span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {slices.map((slice, i) => {
            const isHovered = activeIdx === i;
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setActiveIdx(i)}
                onMouseLeave={() => setActiveIdx(null)}
                onClick={() => onSelectHolding && onSelectHolding(slice.symbol)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                  isHovered ? 'bg-slate-800 border border-slate-700' : 'hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                  <div className="truncate">
                    <span className="font-semibold text-slate-200 mr-1.5">{slice.name}</span>
                    <span className="font-mono text-slate-400 text-[11px]">{slice.symbol}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 font-mono">
                  <div className="text-slate-100 font-semibold tabular-nums">
                    {(slice.fraction * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-400 tabular-nums">
                    ${(slice.currentValue / 1000).toFixed(0)}k
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
