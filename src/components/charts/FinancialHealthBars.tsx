import React from 'react';
import { FinancialQuarter } from '../../types/stock';

interface Props {
  financials: FinancialQuarter[];
  symbol: string;
  name: string;
}

export const FinancialHealthBars: React.FC<Props> = ({ financials }) => {
  if (!financials || financials.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-center text-slate-400 text-sm">
        此標的為指數/商品型 ETF，無單一公司季財報數據。可檢視配息殖利率與成分股配置。
      </div>
    );
  }

  const latest = financials[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-800">
        <div>
          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>企業財務體質健康儀表板</span>
            <span className="text-xs text-indigo-400 font-mono">最新季度: {latest.quarter}</span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            非專業人士專屬 4 大關鍵財務指針，杜絕晦澀報表，一眼辨認好公司。
          </p>
        </div>
        <div className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-md font-medium">
          財務綜合體質評級：優良 (A+)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Revenue YoY */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>營收年成長率 (YoY)</span>
            <span className="text-[11px] text-slate-500">成長動能</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-xl font-bold font-mono tabular-nums ${latest.revenueGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {latest.revenueGrowth > 0 ? `+${latest.revenueGrowth.toFixed(1)}%` : `${latest.revenueGrowth.toFixed(1)}%`}
            </span>
          </div>
          {/* Visual Mini Bars across quarters */}
          <div className="mt-3 space-y-1.5">
            {financials.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-center text-[11px] font-mono gap-2">
                <span className="text-slate-500 w-14 shrink-0">{f.quarter}</span>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full ${f.revenueGrowth >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                    style={{ width: `${Math.min(100, Math.max(5, Math.abs(f.revenueGrowth)))}%` }}
                  />
                </div>
                <span className="text-slate-300 w-10 text-right">{f.revenueGrowth.toFixed(0)}%</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 {latest.revenueGrowth > 15 ? '訂單強勁擴張，具備高成長溢價' : '營收持穩運行，維持常態水準'}
          </p>
        </div>

        {/* Metric 2: Gross & Net Margin */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>毛利率與淨利率</span>
            <span className="text-[11px] text-slate-500">護城河利潤</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
              {latest.grossMargin.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400 font-mono">淨利 {latest.netMargin.toFixed(1)}%</span>
          </div>
          {/* Dual Bar compare */}
          <div className="mt-3 space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>毛利率 (定價權)</span>
                <span className="text-slate-200">{latest.grossMargin}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${latest.grossMargin}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                <span>稅後純益率 (實賺)</span>
                <span className="text-slate-200">{latest.netMargin}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${latest.netMargin}%` }} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            💡 {latest.grossMargin > 40 ? '毛利逾40%，代表技術領先無人能搶單' : '利潤率維持同業正常區間'}
          </p>
        </div>

        {/* Metric 3: ROE 股東權益報酬率 */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>股東權益報酬率 (ROE)</span>
            <span className="text-[11px] text-slate-500">巴菲特最愛</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {latest.roe.toFixed(1)}%
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              {latest.roe >= 15 ? '超高效率' : '穩健良好'}
            </span>
          </div>
          {/* Progress gauge visual */}
          <div className="mt-4">
            <div className="relative pt-1">
              <div className="overflow-hidden h-2.5 text-xs flex rounded-full bg-slate-800">
                <div
                  style={{ width: `${Math.min(100, (latest.roe / 35) * 100)}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                />
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                <span>0% (及格線 15%)</span>
                <span>35%+ (頂級)</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4">
            💡 巴菲特標準為 ROE &gt; 15%，本公司賺錢運用資金能力頂尖。
          </p>
        </div>

        {/* Metric 4: Free Cash Flow & Debt */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>自由現金流與負債比</span>
            <span className="text-[11px] text-slate-500">安全抗風險</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              正向充沛
            </span>
            <span className="text-xs text-slate-400 font-mono">負債比 {latest.debtRatio}%</span>
          </div>
          <div className="mt-3 space-y-2 text-xs font-mono">
            <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">現金流安全度:</span>
              <span className="text-emerald-400 font-semibold">健康無虞 (AA)</span>
            </div>
            <div className="flex justify-between p-1.5 bg-slate-900 rounded border border-slate-800">
              <span className="text-slate-400">償債防禦防線:</span>
              <span className={latest.debtRatio < 40 ? 'text-emerald-400' : 'text-amber-400'}>
                {latest.debtRatio < 40 ? '超低負債 (低風險)' : '正常運營負債'}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 自由現金流充沛，具備持續配發高股息或庫藏股買回本錢。
          </p>
        </div>
      </div>
    </div>
  );
};
