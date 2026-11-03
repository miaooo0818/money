import React from 'react';

interface Props {
  value: number; // 0 - 100
  title?: string;
  label?: string;
  subtitle?: string;
}

export const SpeedometerGauge: React.FC<Props> = ({
  value,
  title = '大盤多空溫度計 (Fear & Greed)',
  label,
  subtitle,
}) => {
  // Clamped 0-100
  const clamped = Math.max(0, Math.min(100, value));

  // Determine sentiment label & color
  let sentimentColor = '#10b981';
  let defaultLabel = '中立觀望';

  if (clamped < 25) {
    sentimentColor = '#ef4444';
    defaultLabel = '極度恐慌 (超跌買點浮現)';
  } else if (clamped < 45) {
    sentimentColor = '#f97316';
    defaultLabel = '偏向恐慌 (逢回尋找支撐)';
  } else if (clamped <= 60) {
    sentimentColor = '#38bdf8';
    defaultLabel = '中立盤整 (均線區間整理)';
  } else if (clamped < 80) {
    sentimentColor = '#10b981';
    defaultLabel = '多頭貪婪 (順勢持股續抱)';
  } else {
    sentimentColor = '#ec4899';
    defaultLabel = '極度貪婪 (短線提防過熱拉回)';
  }

  const displayLabel = label || defaultLabel;

  // Gauge geometry
  const width = 240;
  const height = 140;
  const cx = width / 2;
  const cy = 115;
  const radius = 85;
  const strokeWidth = 14;

  // Angle from -180 deg to 0 deg
  const needleAngle = -180 + (clamped / 100) * 180;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleLen = radius - 15;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-between">
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-200">{title}</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">即時指數</span>
      </div>

      <div className="relative my-1">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="25%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#38bdf8" />
              <stop offset="75%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Background arc track */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Colored arc track */}
          <path
            d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r="6" fill="#ffffff" />
          <circle cx={cx} cy={cy} r="3" fill="#0f172a" />

          {/* Scale marks */}
          <text x={cx - radius + 5} y={cy + 16} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">0 恐慌</text>
          <text x={cx} y={cy - radius + 18} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">50 中立</text>
          <text x={cx + radius - 5} y={cy + 16} fill="#64748b" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">100 貪婪</text>
        </svg>

        {/* Big Score in center */}
        <div className="text-center -mt-4">
          <div className="text-2xl font-bold font-mono text-white tabular-nums">
            {clamped}
          </div>
          <div className="text-xs font-semibold mt-0.5" style={{ color: sentimentColor }}>
            {displayLabel}
          </div>
        </div>
      </div>

      {subtitle && (
        <div className="text-[11px] text-slate-400 text-center mt-2 px-1">
          {subtitle}
        </div>
      )}
    </div>
  );
};
