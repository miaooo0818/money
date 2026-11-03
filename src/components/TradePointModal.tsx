import React, { useState } from 'react';
import { StockItem, ColorConvention } from '../types/stock';
import { X, Sparkles, ShieldAlert, ArrowUpRight, CheckCircle2, BookmarkPlus, BellRing } from 'lucide-react';

interface Props {
  stock: StockItem;
  colorConvention: ColorConvention;
  onClose: () => void;
  onAddToPortfolio: (stock: StockItem, shares: number, buyPrice: number) => void;
  onAddToAlerts: (stock: StockItem) => void;
}

export const TradePointModal: React.FC<Props> = ({
  stock,
  colorConvention,
  onClose,
  onAddToPortfolio,
  onAddToAlerts,
}) => {
  const [sharesInput, setSharesInput] = useState<number>(stock.market === 'TW' ? 1000 : 10);
  const [buyPriceInput, setBuyPriceInput] = useState<number>(stock.price);
  const [addedToast, setAddedToast] = useState(false);
  const [alertToast, setAlertToast] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiCustomReason, setAiCustomReason] = useState<string | null>(null);

  const isUp = stock.change >= 0;
  const upColor = colorConvention === 'TW' ? 'text-red-400' : 'text-emerald-400';
  const downColor = colorConvention === 'TW' ? 'text-emerald-400' : 'text-red-400';

  const signalBadge = {
    STRONG_BUY: { label: '強烈買進', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    DCA_BUY: { label: '逢低分批存股', bg: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
    HOLD: { label: '區間續抱觀望', bg: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
    TAKE_PROFIT: { label: '逢高調節停利', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
    STOP_LOSS: { label: '跌破支撐止損', bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  }[stock.signal];

  const handleFetchAiDeepDiagnosis = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/gemini/stock-diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price,
          change: stock.changePercent,
          peRatio: stock.peRatio,
          yieldRate: stock.yieldRate,
          maStatus: stock.maStatus,
          rsi: stock.rsi,
          kd: stock.kd,
        }),
      });
      const data = await res.json();
      if (data && data.reasoning) {
        setAiCustomReason(data.reasoning);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddToPortfolioSubmit = () => {
    onAddToPortfolio(stock, sharesInput, buyPriceInput);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleAddAlertSubmit = () => {
    onAddToAlerts(stock);
    setAlertToast(true);
    setTimeout(() => setAlertToast(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300">
              {stock.symbol}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{stock.name}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${signalBadge.bg}`}>
                  {signalBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{stock.sector} · {stock.market === 'TW' ? '台股主流' : '美股主流'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Current Price & Indicator Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs font-mono">
            <div>
              <span className="text-slate-400 block mb-1">現價</span>
              <span className="text-lg font-bold text-white tabular-nums">${stock.price.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">今日漲跌</span>
              <span className={`text-lg font-bold tabular-nums ${isUp ? upColor : downColor}`}>
                {isUp ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">本益比 / 殖利率</span>
              <span className="text-slate-200 font-semibold">
                {stock.peRatio ? `${stock.peRatio}x` : 'N/A'} / {stock.yieldRate}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block mb-1">技術形態</span>
              <span className="text-slate-200 font-medium truncate block">{stock.maStatus}</span>
            </div>
          </div>

          {/* Core Decision Grid: 3 Targets (Entry, StopLoss, Target) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Entry zone */}
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60 relative">
              <span className="text-[11px] text-emerald-400 font-semibold block uppercase tracking-wider">
                建議切入買進區間
              </span>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1 tabular-nums">
                ${stock.entryLow} ~ ${stock.entryHigh}
              </div>
              <p className="text-[11px] text-emerald-400/80 mt-1.5">
                回測均線或估值河流圖下緣時分批承接，安全邊際最高。
              </p>
            </div>

            {/* 2. Stop loss defense */}
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 relative">
              <span className="text-[11px] text-rose-400 font-semibold block uppercase tracking-wider">
                關鍵防守停損價
              </span>
              <div className="text-xl font-bold font-mono text-rose-300 mt-1 tabular-nums">
                ${stock.stopLoss}
              </div>
              <p className="text-[11px] text-rose-400/80 mt-1.5">
                跌破此關鍵支撐應減碼防守，控制單筆最大損失低於 7%。
              </p>
            </div>

            {/* 3. Target profit */}
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/60 relative">
              <span className="text-[11px] text-indigo-400 font-semibold block uppercase tracking-wider">
                波段目標停利價
              </span>
              <div className="text-xl font-bold font-mono text-indigo-300 mt-1 tabular-nums">
                ${stock.targetPrice}
              </div>
              <p className="text-[11px] text-indigo-400/80 mt-1.5">
                若達標可分批收回成本，讓剩餘獲利部位繼續奔馳。
              </p>
            </div>
          </div>

          {/* AI Decision Reasoning */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI 策略推理與買賣依據 (基本面與技術面雙軌)</span>
              </div>
              <button
                onClick={handleFetchAiDeepDiagnosis}
                disabled={isAiLoading}
                className="text-xs px-2.5 py-1 rounded bg-indigo-600/30 text-indigo-200 hover:bg-indigo-600/50 transition-colors flex items-center gap-1 font-medium"
              >
                {isAiLoading ? 'Gemini 運算中...' : '重新生成 AI 深度推理'}
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {aiCustomReason || stock.signalReason}
            </p>
            <div className="flex items-center gap-2 pt-2 text-[11px] text-amber-300/90 border-t border-slate-800/80">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>風控警語：非投資保證建議，所有下單請配合整體資金配置與風險承受度執行。</span>
            </div>
          </div>

          {/* Simulation Action Box */}
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
            <span className="text-xs font-semibold text-slate-200 block">
              快速模擬與操作設定
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">
                  模擬買進股數 ({stock.market === 'TW' ? '股，台股1張=1000股' : '股'})
                </label>
                <input
                  type="number"
                  value={sharesInput}
                  onChange={(e) => setSharesInput(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">自訂買進價格</label>
                <input
                  type="number"
                  value={buyPriceInput}
                  onChange={(e) => setBuyPriceInput(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleAddToPortfolioSubmit}
                className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>加入我的投資組合</span>
              </button>

              <button
                onClick={handleAddAlertSubmit}
                className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <BellRing className="w-4 h-4 text-amber-400" />
                <span>追蹤警示推播</span>
              </button>
            </div>

            {addedToast && (
              <div className="p-2 bg-emerald-950/80 border border-emerald-600/80 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>已成功將 {stock.name} 加入投資組合！可至「我的投資組合」檢視總損益。</span>
              </div>
            )}
            {alertToast && (
              <div className="p-2 bg-amber-950/80 border border-amber-600/80 rounded-lg text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>已將 {stock.name} 設為即時波動與買賣點警示！</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
