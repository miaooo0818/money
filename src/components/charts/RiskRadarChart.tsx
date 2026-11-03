import React from 'react';

interface Props {
  // 0 - 100 values
  metrics: {
    label: string;
    value: number; // Portfolio score (0-100)
    ideal: number; // Benchmark ideal score (0-100)
    description: string;
  }[];
}

export const RiskRadarChart: React.FC<Props> = ({ metrics }) => {
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const total = metrics.length;

  const getCoordinates = (value: number, index: number) => {
    const angle = (Math.PI * 2 / total) * index - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build polygon path for user portfolio
  const userPoints = metrics.map((m, i) => {
    const { x, y } = getCoordinates(m.value, i);
    return `${x},${y}`;
  }).join(' ');

  // Build polygon path for ideal benchmark
  const idealPoints = metrics.map((m, i) => {
    const { x, y } = getCoordinates(m.ideal, i);
    return `${x},${y}`;
  }).join(' ');

  // Web rings (20, 40, 60, 80, 100)
  const rings = [20, 40, 60, 80, 100];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-slate-100">投資組合多維度風險雷達 (Risk Radar)</h4>
          <p className="text-xs text-slate-400 mt-0.5">5大關鍵維度檢視部位防禦力與集中度風險</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-sky-500/80 inline-block"></span>
            <span className="text-slate-300">目前部位</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/40 border border-emerald-500 inline-block"></span>
            <span className="text-slate-400">標準基準</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-around gap-4">
        {/* SVG Radar */}
        <div className="relative shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Concentric Web Rings */}
            {rings.map((ringVal) => {
              const ringPoints = metrics.map((_, i) => {
                const { x, y } = getCoordinates(ringVal, i);
                return `${x},${y}`;
              }).join(' ');

              return (
                <polygon
                  key={ringVal}
                  points={ringPoints}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Axis spokes from center */}
            {metrics.map((_, i) => {
              const { x, y } = getCoordinates(100, i);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={x}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="0.8"
                />
              );
            })}

            {/* Ideal Benchmark Polygon */}
            <polygon
              points={idealPoints}
              fill="#10b981"
              fillOpacity="0.15"
              stroke="#10b981"
              strokeWidth="1.2"
              strokeDasharray="4 2"
            />

            {/* User Portfolio Polygon */}
            <polygon
              points={userPoints}
              fill="#38bdf8"
              fillOpacity="0.35"
              stroke="#0284c7"
              strokeWidth="2"
            />

            {/* Dots on User Vertices */}
            {metrics.map((m, i) => {
              const { x, y } = getCoordinates(m.value, i);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Dimension Labels */}
            {metrics.map((m, i) => {
              const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
              const labelRadius = radius + 24;
              const lx = center + labelRadius * Math.cos(angle);
              const ly = center + labelRadius * Math.sin(angle);

              return (
                <text
                  key={i}
                  x={lx}
                  y={ly + 4}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="11"
                  fontWeight="500"
                >
                  {m.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Breakdown details */}
        <div className="w-full max-w-sm space-y-2 text-xs">
          {metrics.map((m, i) => (
            <div key={i} className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-slate-200">{m.label}</span>
                <span className={`font-bold ${m.value > 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {m.value} / 100
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{m.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
