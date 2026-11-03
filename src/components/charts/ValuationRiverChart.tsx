import React from 'react';
import { ValuationStatus } from '../../types/stock';

interface Props {
  symbol: string;
  currentPrice: number;
  peRatio: number | null;
  valuationStatus: ValuationStatus;
}

export const ValuationRiverChart: React.FC<Props> = ({
  symbol,
  currentPrice,
  peRatio,
  valuationStatus,
}) => {
  // Base PE multipliers for River bands (12x, 16x, 20x, 24x, 28x)
  const eps = peRatio ? currentPrice / peRatio : currentPrice / 20;

  // 6 historical time points
  const quarters = ['23 Q3', '23 Q4', '24 Q1', '24 Q2', '24 Q3', '24 Q4(預估)'];
  const epsTrends = [0.82, 0.88, 0.94, 0.98, 1.0, 1.05].map(factor => factor * eps);

  const bands = [
    { label: '超值特價 (12x)', multiplier: 12, color: '#059669', opacity: 0.15 },
    { label: '便宜區 (16x)', multiplier: 16, color: '#10b981', opacity: 0.2 },
    { label: '合理區 (20x)', multiplier: 20, color: '#3b82f6', opacity: 0.2 },
    { label: '偏高區 (24x)', multiplier: 24, color: '#f59e0b', opacity: 0.2 },
    { label: '昂貴警戒 (28x)', multiplier: 28, color: '#ef4444', opacity: 0.15 },
  ];

  const width = 640;
  const height = 240;
  const padLeft = 45;
  const padRight = 85;
  const padTop = 20;
  const padBottom = 35;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;

  const maxVal = epsTrends[epsTrends.length - 1] * 30;
  const minVal = epsTrends[0] * 10;
  const range = maxVal - minVal;

  const getX = (idx: number) => padLeft + (idx / (quarters.length - 1)) * chartWidth;
  const getY = (val: number) => padTop + chartHeight - ((val - minVal) / range) * chartHeight;

  // Historical stock price path
  const priceFactors = [0.75, 0.82, 0.91, 0.96, 1.0, 1.0];
  const stockPrices = priceFactors.map((f, i) => (i === priceFactors.length - 1 ? currentPrice : currentPrice * f));
  const pricePath = stockPrices.map((p, i) => `${getX(i)},${getY(p)}`).join(' ');

  const statusMap = {
    CHEAP: { text: '目前位在「便宜至合理區」· 適合分批存股', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-800' },
    REASONABLE: { text: '目前位在「合理估值區」· 穩定續抱或逢回接', color: 'text-sky-400 bg-sky-950/60 border-sky-800' },
    EXPENSIVE: { text: '目前位在「偏高昂貴區」· 建議注意追高風險', color: 'text-amber-400 bg-amber-950/60 border-amber-800' },
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-800">
        <div>
          <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>本益比估值河流圖 (P/E River)</span>
            <span className="text-xs text-slate-400 font-normal">五線譜河流波段</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            以歷史真實獲利 EPS 計算各倍數河流區間，白話判斷股價是否超漲或超跌。
          </p>
        </div>
        <div className={`text-xs px-2.5 py-1 rounded-md border font-medium ${statusMap[valuationStatus].color}`}>
          {statusMap[valuationStatus].text}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          {/* River Area Bands */}
          {bands.map((band, bIdx) => {
            const nextBand = bands[bIdx + 1];
            if (!nextBand) return null;

            const topPoints = epsTrends.map((ep, i) => `${getX(i)},${getY(ep * nextBand.multiplier)}`);
            const bottomPoints = epsTrends.map((ep, i) => `${getX(i)},${getY(ep * band.multiplier)}`).reverse();
            const polygonStr = `${topPoints.join(' ')} ${bottomPoints.join(' ')}`;

            return (
              <polygon
                key={bIdx}
                points={polygonStr}
                fill={band.color}
                opacity={band.opacity}
              />
            );
          })}

          {/* River boundary lines */}
          {bands.map((band, bIdx) => {
            const lineStr = epsTrends.map((ep, i) => `${getX(i)},${getY(ep * band.multiplier)}`).join(' ');
            return (
              <g key={bIdx}>
                <polyline
                  points={lineStr}
                  fill="none"
                  stroke={band.color}
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />
                <text
                  x={width - padRight + 6}
                  y={getY(epsTrends[epsTrends.length - 1] * band.multiplier) + 3}
                  fill={band.color}
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                >
                  {band.multiplier}x ({(epsTrends[epsTrends.length - 1] * band.multiplier).toFixed(0)})
                </text>
              </g>
            );
          })}

          {/* Stock Price Line (The White/Cyan bold curve cutting through river) */}
          <polyline
            points={pricePath}
            fill="none"
            stroke="#f8fafc"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Current Stock Price Point Marker */}
          <circle
            cx={getX(quarters.length - 1)}
            cy={getY(currentPrice)}
            r="5"
            fill="#38bdf8"
            stroke="#ffffff"
            strokeWidth="2"
          />
          <text
            x={getX(quarters.length - 1) - 6}
            y={getY(currentPrice) - 10}
            fill="#38bdf8"
            fontSize="11"
            fontFamily="JetBrains Mono"
            fontWeight="bold"
            textAnchor="end"
          >
            現價 {currentPrice}
          </text>

          {/* Quarter X Labels */}
          {quarters.map((q, i) => (
            <text
              key={i}
              x={getX(i)}
              y={height - 10}
              textAnchor="middle"
              fill="#64748b"
              fontSize="10"
              fontFamily="JetBrains Mono"
            >
              {q}
            </text>
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500 inline-block"></span>
            <span>便宜特價區 (低於16x)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-blue-500/30 border border-blue-500 inline-block"></span>
            <span>合理均值區 (16x~20x)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500 inline-block"></span>
            <span>昂貴過熱區 (高於24x)</span>
          </span>
        </div>
        <div className="font-mono text-slate-300">
          目前本益比: <strong className="text-white">{peRatio ? `${peRatio} 倍` : 'ETF或無'}</strong>
        </div>
      </div>
    </div>
  );
};
