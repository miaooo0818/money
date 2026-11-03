import React, { useState } from 'react';
import { PricePoint, ColorConvention } from '../../types/stock';

interface Props {
  data: PricePoint[];
  colorConvention: ColorConvention;
  symbol: string;
  name: string;
  currentPrice: number;
  entryLow?: number;
  entryHigh?: number;
  stopLoss?: number;
  targetPrice?: number;
}

export const InteractivePriceChart: React.FC<Props> = ({
  data,
  colorConvention,
  symbol,
  currentPrice,
  entryLow,
  entryHigh,
  stopLoss,
  targetPrice,
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [chartType, setChartType] = useState<'line' | 'candlestick'>('line');

  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-500 text-sm">暫無走勢圖資料</div>;
  }

  // Calculate scales
  const prices = data.flatMap(d => [d.high, d.low, d.price]);
  if (entryLow) prices.push(entryLow);
  if (entryHigh) prices.push(entryHigh);
  if (stopLoss) prices.push(stopLoss);
  if (targetPrice) prices.push(targetPrice);

  const minPrice = Math.min(...prices) * 0.985;
  const maxPrice = Math.max(...prices) * 1.015;
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...data.map(d => d.volume), 1);

  const width = 760;
  const height = 340;
  const padLeft = 55;
  const padRight = 55;
  const padTop = 25;
  const padBottom = 65;
  const chartWidth = width - padLeft - padRight;
  const chartHeight = height - padTop - padBottom;
  const volHeight = 45;

  const getX = (idx: number) => padLeft + (idx / (data.length - 1)) * chartWidth;
  const getY = (price: number) => padTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  const getVolY = (vol: number) => height - padBottom + volHeight - (vol / maxVolume) * volHeight;

  // Path generators
  const linePoints = data.map((d, i) => `${getX(i)},${getY(d.price)}`).join(' ');
  const ma5Points = data.map((d, i) => `${getX(i)},${getY(d.ma5)}`).join(' ');
  const ma20Points = data.map((d, i) => `${getX(i)},${getY(d.ma20)}`).join(' ');

  const activePoint = hoverIndex !== null ? data[hoverIndex] : data[data.length - 1];

  // Up/down colors according to selected convention
  const isUp = activePoint.price >= data[0].price;
  const upColor = colorConvention === 'TW' ? '#ef4444' : '#10b981'; // TW Red, US Green
  const downColor = colorConvention === 'TW' ? '#10b981' : '#ef4444'; // TW Green, US Red

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 relative select-none">
      {/* Chart Top Bar Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold">{symbol}</span>
            <span className="text-sm font-medium text-slate-200">價格走勢與技術信號帶</span>
            <span className="text-xs text-slate-500 font-mono">30日即時資料</span>
          </div>
          <div className="flex items-center gap-4 text-xs mt-1 text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-sky-400 rounded-full inline-block"></span>
              <span>現價</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-amber-400 rounded-full inline-block"></span>
              <span>MA5 週線</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-indigo-400 rounded-full inline-block"></span>
              <span>MA20 月線</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chart type toggle */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60">
            <button
              onClick={() => setChartType('line')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                chartType === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              折線
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                chartType === 'candlestick' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              K線
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[580px] max-h-[380px]"
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * width;
            const clampedX = Math.max(padLeft, Math.min(width - padRight, relX));
            const idx = Math.round(((clampedX - padLeft) / chartWidth) * (data.length - 1));
            setHoverIndex(idx);
          }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="entryZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Background grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const priceVal = minPrice + (1 - ratio) * priceRange;
            const y = padTop + ratio * chartHeight;
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#334155"
                  strokeDasharray="3 3"
                  strokeWidth="0.8"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                >
                  {priceVal.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* Entry Buy Zone Band (Visual trade guide for beginners) */}
          {entryLow && entryHigh && (
            <g>
              <rect
                x={padLeft}
                y={getY(entryHigh)}
                width={chartWidth}
                height={Math.max(2, getY(entryLow) - getY(entryHigh))}
                fill="url(#entryZoneGrad)"
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="4 2"
                strokeOpacity="0.5"
              />
              <text
                x={width - padRight + 6}
                y={getY(entryHigh) + (getY(entryLow) - getY(entryHigh)) / 2 + 3}
                fill="#10b981"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                買進區間
              </text>
            </g>
          )}

          {/* Stop Loss Line */}
          {stopLoss && (
            <g>
              <line
                x1={padLeft}
                y1={getY(stopLoss)}
                x2={width - padRight}
                y2={getY(stopLoss)}
                stroke="#ef4444"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />
              <text
                x={width - padRight + 6}
                y={getY(stopLoss) + 3}
                fill="#ef4444"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                停損 {stopLoss}
              </text>
            </g>
          )}

          {/* Target Price Line */}
          {targetPrice && (
            <g>
              <line
                x1={padLeft}
                y1={getY(targetPrice)}
                x2={width - padRight}
                y2={getY(targetPrice)}
                stroke="#8b5cf6"
                strokeWidth="1.2"
                strokeDasharray="4 4"
                strokeOpacity="0.8"
              />
              <text
                x={width - padRight + 6}
                y={getY(targetPrice) + 3}
                fill="#a78bfa"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                目標 {targetPrice}
              </text>
            </g>
          )}

          {/* Volume bars */}
          {data.map((d, i) => {
            const barWidth = Math.max(2, (chartWidth / data.length) * 0.6);
            const x = getX(i) - barWidth / 2;
            const y = getVolY(d.volume);
            const barH = height - padBottom + volHeight - y;
            const barColor = d.close >= d.open ? upColor : downColor;

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(1, barH)}
                fill={barColor}
                opacity={hoverIndex === i ? 0.9 : 0.4}
              />
            );
          })}

          {/* Candlesticks or Line */}
          {chartType === 'candlestick' ? (
            data.map((d, i) => {
              const candleWidth = Math.max(3, (chartWidth / data.length) * 0.65);
              const x = getX(i);
              const yHigh = getY(d.high);
              const yLow = getY(d.low);
              const yOpen = getY(d.open);
              const yClose = getY(d.close);
              const isCandleUp = d.close >= d.open;
              const candleColor = isCandleUp ? upColor : downColor;

              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

              return (
                <g key={i}>
                  {/* High - Low wick */}
                  <line
                    x1={x}
                    y1={yHigh}
                    x2={x}
                    y2={yLow}
                    stroke={candleColor}
                    strokeWidth="1.2"
                  />
                  {/* Candle body */}
                  <rect
                    x={x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={candleColor}
                    rx="1"
                  />
                </g>
              );
            })
          ) : (
            <>
              {/* Area fill */}
              <polygon
                points={`${padLeft},${padTop + chartHeight} ${linePoints} ${width - padRight},${padTop + chartHeight}`}
                fill="url(#priceGradient)"
              />
              {/* Price Line */}
              <polyline
                points={linePoints}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Moving Averages */}
          <polyline
            points={ma5Points}
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.4"
            opacity="0.85"
          />
          <polyline
            points={ma20Points}
            fill="none"
            stroke="#818cf8"
            strokeWidth="1.4"
            opacity="0.85"
          />

          {/* Date labels at bottom */}
          {data.filter((_, i) => i % 4 === 0 || i === data.length - 1).map((d) => {
            const idx = data.indexOf(d);
            return (
              <text
                key={idx}
                x={getX(idx)}
                y={height - 20}
                textAnchor="middle"
                fill="#64748b"
                fontSize="10"
                fontFamily="JetBrains Mono"
              >
                {d.date}
              </text>
            );
          })}

          {/* Interactive crosshair & tooltip indicator */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padTop}
                x2={getX(hoverIndex)}
                y2={height - padBottom + volHeight}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(activePoint.price)}
                r="4"
                fill="#38bdf8"
                stroke="#0f172a"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      </div>

      {/* Real-time Hover Detail Bar */}
      <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-2">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">日期: <strong className="text-slate-200">{activePoint.date}</strong></span>
          <span>收盤: <strong className="text-white text-sm">{activePoint.price.toFixed(2)}</strong></span>
          <span className="text-amber-400">MA5: <strong>{activePoint.ma5.toFixed(2)}</strong></span>
          <span className="text-indigo-400">MA20: <strong>{activePoint.ma20.toFixed(2)}</strong></span>
          <span className="text-slate-400">成交量: <strong>{activePoint.volume.toLocaleString()}</strong></span>
        </div>
        <div className="text-slate-500 text-[11px]">
          滑鼠移動即可預覽歷史點位
        </div>
      </div>
    </div>
  );
};
