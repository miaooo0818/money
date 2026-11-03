import React, { useState } from 'react';
import { PortfolioHolding, ColorConvention, StockItem } from '../types/stock';
import { PortfolioDonutChart } from './charts/PortfolioDonutChart';
import { RiskRadarChart } from './charts/RiskRadarChart';
import { Sparkles, Plus, Trash2, ArrowUpDown, TrendingUp, TrendingDown, RefreshCw, SlidersHorizontal, CheckCircle2, ShieldCheck } from 'lucide-react';

interface Props {
  holdings: PortfolioHolding[];
  allStocks: StockItem[];
  colorConvention: ColorConvention;
  onUpdateHolding: (updated: PortfolioHolding[]) => void;
  onSelectStockBySymbol: (symbol: string) => void;
}

export const PortfolioView: React.FC<Props> = ({
  holdings,
  allStocks,
  colorConvention,
  onUpdateHolding,
  onSelectStockBySymbol,
}) => {
  const [isAiReviewing, setIsAiReviewing] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<{
    healthScore: number;
    riskLevel: string;
    evaluation: string;
    suggestions: string[];
  } | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSymbol, setNewSymbol] = useState(allStocks[0]?.symbol || '2330');
  const [newShares, setNewShares] = useState(1000);
  const [newBuyPrice, setNewBuyPrice] = useState(allStocks[0]?.price || 1000);

  // Position adjustment simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simAdjustments, setSimAdjustments] = useState<Record<string, number>>({});

  const upColor = colorConvention === 'TW' ? 'text-red-400' : 'text-emerald-400';
  const downColor = colorConvention === 'TW' ? 'text-emerald-400' : 'text-red-400';

  // Calculate totals
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalUnrealizedPnL = totalCurrentValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalUnrealizedPnL / totalCost) * 100 : 0;
  const isOverallProfitable = totalUnrealizedPnL >= 0;

  // Prepare Risk Radar Metrics based on real portfolio holdings
  const techConcentration = holdings
    .filter(h => ['2330', '2454', 'NVDA', 'AAPL'].includes(h.symbol))
    .reduce((s, h) => s + (h.currentValue / (totalCurrentValue || 1)) * 100, 0);

  const etfProtection = holdings
    .filter(h => ['006208', '00878', 'VOO'].includes(h.symbol))
    .reduce((s, h) => s + (h.currentValue / (totalCurrentValue || 1)) * 100, 0);

  const riskMetrics = [
    {
      label: '系統Beta風險',
      value: Math.min(95, Math.round(55 + (techConcentration * 0.35))),
      ideal: 65,
      description: techConcentration > 50 ? '科技權值股權重較大，隨全球半導體景氣波動' : 'Beta係數平穩健康',
    },
    {
      label: '資產波動度',
      value: Math.min(90, Math.round(50 + (techConcentration * 0.3))),
      ideal: 60,
      description: '年化標準差估算中等，可抵禦日常一般市場回檔',
    },
    {
      label: '產業集中度',
      value: Math.min(100, Math.round(techConcentration)),
      ideal: 50,
      description: techConcentration > 50 ? '半導體與AI產業比重偏高，建議適度分散' : '產業分佈良好',
    },
    {
      label: '防禦抗震力',
      value: Math.min(95, Math.round(etfProtection * 1.5 + 30)),
      ideal: 75,
      description: '擁有 00878/006208/VOO 核心指數保護，下檔具備良好抗跌底氣',
    },
    {
      label: '股息現金流',
      value: Math.min(95, Math.round(etfProtection * 1.2 + 25)),
      ideal: 70,
      description: '季配息與年化息率提供穩定現金再投資活水',
    },
  ];

  const handleFetchAiPortfolioReview = async () => {
    setIsAiReviewing(true);
    try {
      const summaryHoldings = holdings.map(h => ({
        symbol: h.symbol,
        name: h.name,
        weight: ((h.currentValue / (totalCurrentValue || 1)) * 100).toFixed(1),
        pnlPercent: h.unrealizedPnLPercent.toFixed(1),
      }));

      const res = await fetch('/api/gemini/portfolio-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          holdings: summaryHoldings,
          totalValue: totalCurrentValue.toLocaleString(),
          totalUnrealizedPnL: totalUnrealizedPnL.toLocaleString(),
          pnlPercent: totalPnLPercent.toFixed(1),
        }),
      });
      const data = await res.json();
      if (data && data.evaluation) {
        setAiAdvice(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiReviewing(false);
    }
  };

  const handleDeleteHolding = (id: string) => {
    const updated = holdings.filter(h => h.id !== id);
    onUpdateHolding(updated);
  };

  const handleAddNewHolding = () => {
    const stockInfo = allStocks.find(s => s.symbol === newSymbol);
    if (!stockInfo) return;

    const totalC = newShares * newBuyPrice;
    const curVal = newShares * stockInfo.price;
    const pnl = curVal - totalC;
    const pnlP = totalC > 0 ? (pnl / totalC) * 100 : 0;

    const newH: PortfolioHolding = {
      id: `p_${Date.now()}`,
      symbol: stockInfo.symbol,
      name: stockInfo.name,
      market: stockInfo.market,
      shares: newShares,
      avgBuyPrice: newBuyPrice,
      currentPrice: stockInfo.price,
      totalCost: totalC,
      currentValue: curVal,
      unrealizedPnL: pnl,
      unrealizedPnLPercent: pnlP,
      allocationPercent: 0,
      targetAllocationPercent: 15,
      riskRating: stockInfo.type === 'ETF' ? 'LOW' : 'MEDIUM',
    };

    onUpdateHolding([...holdings, newH]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Portfolio Header KPIs Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
          <div>
            <span className="text-xs text-indigo-400 font-semibold block uppercase tracking-wider">
              我的投資組合概況 (Portfolio Overview)
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">個人持倉健檢與損益分析</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>新增持倉部位</span>
            </button>
            <button
              onClick={handleFetchAiPortfolioReview}
              disabled={isAiReviewing}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-900/50 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className={`w-4 h-4 text-indigo-400 ${isAiReviewing ? 'animate-spin' : ''}`} />
              <span>{isAiReviewing ? '分析健檢中...' : 'AI 投資組合體檢'}</span>
            </button>
          </div>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">目前總資產現值</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              ${totalCurrentValue.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500 block mt-1 font-mono">
              總投入成本 ${totalCost.toLocaleString()}
            </span>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">未實現損益總額</span>
            <div className={`text-2xl font-bold font-mono tabular-nums ${isOverallProfitable ? upColor : downColor}`}>
              {isOverallProfitable ? `+$${totalUnrealizedPnL.toLocaleString()}` : `-$${Math.abs(totalUnrealizedPnL).toLocaleString()}`}
            </div>
            <span className={`text-[11px] font-mono font-semibold block mt-1 ${isOverallProfitable ? upColor : downColor}`}>
              總報酬率 {isOverallProfitable ? `+${totalPnLPercent.toFixed(2)}%` : `${totalPnLPercent.toFixed(2)}%`}
            </span>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">投資組合體質健康度</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {aiAdvice ? aiAdvice.healthScore : 88} <span className="text-xs font-normal text-slate-400">/ 100</span>
            </div>
            <span className="text-[11px] text-emerald-400 block mt-1">
              評等：A+ 結構均衡穩健
            </span>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl">
            <span className="text-xs text-slate-400 block mb-1">抗風險防禦力評級</span>
            <div className="text-2xl font-bold text-sky-400">
              中低風險
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              ETF壓艙石佔比約 {etfProtection.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts Row: Donut Chart & Risk Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioDonutChart
          holdings={holdings}
          onSelectHolding={(sym) => onSelectStockBySymbol(sym)}
        />
        <RiskRadarChart metrics={riskMetrics} />
      </div>

      {/* 3. AI Portfolio Health Diagnosis & Rebalance Suggestions */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Gemini AI 智能持倉診斷與動態調整建議</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              {aiAdvice ? aiAdvice.riskLevel : '均衡成長配置'}
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {aiAdvice ? aiAdvice.evaluation : '您目前的投資組合資產配置兼顧科技爆發力與穩健股息收益。核心部位以台積電與輝達帶動獲利，同時配置 006208、00878 及 VOO 等指數型工具，具備優異的長期複利抗震體質。'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {(aiAdvice ? aiAdvice.suggestions : [
            '台積電目前佔比達 34%，若未來漲幅持續擴大超過 40%，可考慮逢高小額獲利了結部分增持大盤型ETF。',
            '高股息 00878 每季配發之現金股息建議全數設定「自動滾入再投資」，發揮雪球複利最大威力。',
            '逢大盤回測月線或季線時，可執行「金字塔式定期定額加碼」，拉低持倉平均成本。'
          ]).map((s, i) => (
            <div key={i} className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
              <span className="font-bold text-indigo-400 block mb-1">調整建議 0{i + 1}</span>
              <p className="text-slate-300 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Holdings Breakdown Table with Live Operations */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>持有標的明細與調整</span>
            <span className="text-xs font-mono text-slate-400">({holdings.length} 檔)</span>
          </h3>
          <span className="text-xs text-slate-400">點擊標的名稱可快速切換至深度財報分析</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">標的名稱</th>
                <th className="py-2.5 px-3">持有股數</th>
                <th className="py-2.5 px-3">買進均價</th>
                <th className="py-2.5 px-3">現價</th>
                <th className="py-2.5 px-3">總市值</th>
                <th className="py-2.5 px-3">未實現損益</th>
                <th className="py-2.5 px-3">報酬率</th>
                <th className="py-2.5 px-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {holdings.map((h) => {
                const isItemProfitable = h.unrealizedPnL >= 0;
                return (
                  <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3">
                      <div
                        className="cursor-pointer hover:text-indigo-400 font-sans"
                        onClick={() => onSelectStockBySymbol(h.symbol)}
                      >
                        <span className="font-bold text-white block">{h.name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{h.symbol} · {h.market}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 tabular-nums text-slate-200">
                      {h.shares.toLocaleString()} 股
                    </td>
                    <td className="py-3 px-3 tabular-nums text-slate-300">
                      ${h.avgBuyPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 tabular-nums font-bold text-white">
                      ${h.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 tabular-nums font-semibold text-slate-100">
                      ${h.currentValue.toLocaleString()}
                    </td>
                    <td className={`py-3 px-3 tabular-nums font-bold ${isItemProfitable ? upColor : downColor}`}>
                      {isItemProfitable ? `+$${h.unrealizedPnL.toLocaleString()}` : `-$${Math.abs(h.unrealizedPnL).toLocaleString()}`}
                    </td>
                    <td className={`py-3 px-3 tabular-nums font-bold ${isItemProfitable ? upColor : downColor}`}>
                      {isItemProfitable ? `+${h.unrealizedPnLPercent.toFixed(2)}%` : `${h.unrealizedPnLPercent.toFixed(2)}%`}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteHolding(h.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="自組合中移除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">新增自訂持股部位</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">選擇標的</label>
                <select
                  value={newSymbol}
                  onChange={(e) => {
                    const sym = e.target.value;
                    setNewSymbol(sym);
                    const found = allStocks.find(s => s.symbol === sym);
                    if (found) setNewBuyPrice(found.price);
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                >
                  {allStocks.map(s => (
                    <option key={s.symbol} value={s.symbol}>
                      {s.symbol} - {s.name} (${s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">買進持有股數</label>
                <input
                  type="number"
                  value={newShares}
                  onChange={(e) => setNewShares(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">每股平均買進成本 ($)</label>
                <input
                  type="number"
                  value={newBuyPrice}
                  onChange={(e) => setNewBuyPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                onClick={handleAddNewHolding}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                確認新增至部位
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
