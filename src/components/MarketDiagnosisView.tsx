import React, { useState } from 'react';
import { StockItem, MarketOverviewData, ColorConvention } from '../types/stock';
import { SpeedometerGauge } from './charts/SpeedometerGauge';
import { Sparkles, ArrowUpRight, TrendingUp, TrendingDown, RefreshCw, Zap, Search, Plus, DollarSign, Activity, Layers } from 'lucide-react';

interface Props {
  marketOverview: MarketOverviewData;
  stocks: StockItem[];
  colorConvention: ColorConvention;
  onSelectStock: (stock: StockItem) => void;
  onOpenTradeModal: (stock: StockItem) => void;
  onRefreshMarket: () => void;
  onAddNewStock: (stock: StockItem) => void;
  isAiRefreshing: boolean;
}

export const MarketDiagnosisView: React.FC<Props> = ({
  marketOverview,
  stocks,
  colorConvention,
  onSelectStock,
  onOpenTradeModal,
  onRefreshMarket,
  onAddNewStock,
  isAiRefreshing,
}) => {
  const [filterMarket, setFilterMarket] = useState<'ALL' | 'TW' | 'US'>('ALL');
  const [filterSignal, setFilterSignal] = useState<'ALL' | 'BUY' | 'HOLD' | 'PROFIT_LOSS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // AI Stock Lookup state
  const [isLookingUpAi, setIsLookingUpAi] = useState(false);
  const [lookupNotice, setLookupNotice] = useState<string | null>(null);

  const upColor = colorConvention === 'TW' ? 'text-red-400' : 'text-emerald-400';
  const downColor = colorConvention === 'TW' ? 'text-emerald-400' : 'text-red-400';

  // Filter stocks
  const filteredStocks = stocks.filter((s) => {
    if (filterMarket !== 'ALL' && s.market !== filterMarket) return false;
    if (filterSignal === 'BUY' && s.signal !== 'STRONG_BUY' && s.signal !== 'DCA_BUY') return false;
    if (filterSignal === 'HOLD' && s.signal !== 'HOLD') return false;
    if (filterSignal === 'PROFIT_LOSS' && s.signal !== 'TAKE_PROFIT' && s.signal !== 'STOP_LOSS') return false;
    if (selectedSector !== 'ALL' && !s.sector.includes(selectedSector)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchSym = s.symbol.toLowerCase().includes(q);
      const matchName = s.name.toLowerCase().includes(q);
      const matchSec = s.sector.toLowerCase().includes(q);
      if (!matchSym && !matchName && !matchSec) return false;
    }
    return true;
  });

  // Handle AI Custom Stock Signal Calculation
  const handleCalculateCustomStockSignal = async () => {
    if (!searchQuery.trim()) return;
    setIsLookingUpAi(true);
    setLookupNotice(null);

    try {
      const res = await fetch('/api/gemini/stock-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), market: filterMarket === 'US' ? 'US' : 'TW' }),
      });
      const data = await res.json();
      if (data && data.stock) {
        onAddNewStock(data.stock);
        setLookupNotice(`已成功為「${data.stock.name}」計算智能買賣點，已自動加入清單！`);
        setTimeout(() => setLookupNotice(null), 3500);
      } else {
        setLookupNotice('無法分析該代碼，請確認代碼後再試');
      }
    } catch (e) {
      console.error(e);
      setLookupNotice('伺服器連線異常，請稍候重試');
    } finally {
      setIsLookingUpAi(false);
    }
  };

  const sectors = ['ALL', '半導體', '伺服器', 'IC', 'ETF', '科技', '金融'];

  return (
    <div className="space-y-6">
      {/* 1. Market Indices Strip (Expanded to 5 key global benchmarks) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Taiwan 加權 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>台股加權 (TAIEX)</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">大盤</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {marketOverview.twIndex.toLocaleString()}
          </div>
          <div className="text-right text-xs font-mono font-semibold mt-1">
            <span className={marketOverview.twChange >= 0 ? upColor : downColor}>
              {marketOverview.twChange >= 0 ? `+${marketOverview.twChange} (+${marketOverview.twChangePercent}%)` : `${marketOverview.twChange} (${marketOverview.twChangePercent}%)`}
            </span>
          </div>
        </div>

        {/* Taiwan 櫃買 OTC */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>櫃買指數 (OTC)</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">中小型動能</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {marketOverview.twOtcIndex || 268.45}
          </div>
          <div className="text-right text-xs font-mono font-semibold mt-1">
            <span className={(marketOverview.twOtcChange || 1) >= 0 ? upColor : downColor}>
              +{(marketOverview.twOtcChange || 2.15)} (+{(marketOverview.twOtcChangePercent || 0.81)}%)
            </span>
          </div>
        </div>

        {/* 費城半導體 SOX */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>費城半導體 (SOX)</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">晶片風向球</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {(marketOverview.usPhlxSemi || 5240.2).toLocaleString()}
          </div>
          <div className="text-right text-xs font-mono font-semibold mt-1">
            <span className={(marketOverview.usPhlxSemiChange || 1) >= 0 ? upColor : downColor}>
              +{(marketOverview.usPhlxSemiChange || 68.5)} (+{(marketOverview.usPhlxSemiChangePercent || 1.32)}%)
            </span>
          </div>
        </div>

        {/* 美股 S&P 500 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>標普500 (S&P 500)</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">美股權值</span>
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1 tabular-nums">
            {marketOverview.usSp500.toLocaleString()}
          </div>
          <div className="text-right text-xs font-mono font-semibold mt-1">
            <span className={marketOverview.usSp500Change >= 0 ? upColor : downColor}>
              +{marketOverview.usSp500Change} (+{marketOverview.usSp500ChangePercent}%)
            </span>
          </div>
        </div>

        {/* 10Y US Yield & USD/TWD */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between font-medium">
            <span>總經資金流標竿</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300">總體</span>
          </div>
          <div className="flex items-baseline justify-between mt-1 text-sm font-mono">
            <span className="text-slate-300">美債10Y: <strong className="text-white">{marketOverview.us10yYield || 4.28}%</strong></span>
          </div>
          <div className="flex items-baseline justify-between text-xs font-mono text-slate-400 mt-1">
            <span>美元/台幣: <strong className="text-indigo-400">{marketOverview.usdTwd || 32.18}</strong></span>
          </div>
        </div>
      </div>

      {/* Institutional Flow Bar (三大法人籌碼) */}
      <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between text-xs font-mono gap-3">
        <div className="flex items-center gap-2 text-slate-300">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span className="font-sans font-semibold">今日三大法人台股籌碼：</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-slate-400">
            外資：<strong className="text-emerald-400">{marketOverview.institutionalFlow?.foreign || '+142.5 億'}</strong>
          </span>
          <span className="text-slate-400">
            投信：<strong className="text-emerald-400">{marketOverview.institutionalFlow?.trust || '+28.4 億'}</strong>
          </span>
          <span className="text-slate-400">
            自營商：<strong className="text-rose-400">{marketOverview.institutionalFlow?.dealer || '-15.2 億'}</strong>
          </span>
        </div>
      </div>

      {/* 2. AI Market Sentiment & Gauge Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Speedometer Gauge Dial */}
        <div className="lg:col-span-1">
          <SpeedometerGauge
            value={marketOverview.fearGreedScore}
            title="多空情緒溫度計 (Fear & Greed)"
            label={marketOverview.fearGreedLabel}
            subtitle="整合全市場成交量、波動率指數 (VIX) 與均線發散度"
          />
        </div>

        {/* Daily Gemini AI Diagnosis Card */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">AI 今日大盤情勢總結與投資者指引</h3>
                <span className="text-xs text-indigo-300 px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/80">
                  {marketOverview.marketMood}
                </span>
              </div>
              <button
                onClick={onRefreshMarket}
                disabled={isAiRefreshing}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-700/50 transition-colors flex items-center gap-1.5 font-medium"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiRefreshing ? 'animate-spin' : ''}`} />
                <span>{isAiRefreshing ? '診斷中...' : '重新分析'}</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {marketOverview.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5 mb-1.5">
                  <TrendingUp className="w-4 h-4" /> 核心利多支撐
                </span>
                <ul className="space-y-1 text-slate-300">
                  {marketOverview.bullishFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 shrink-0">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-amber-400 font-semibold flex items-center gap-1.5 mb-1.5">
                  <TrendingDown className="w-4 h-4" /> 潛在風險考量
                </span>
                <ul className="space-y-1 text-slate-300">
                  {marketOverview.bearishFactors.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-amber-400 shrink-0">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-indigo-300">📌 今日操作指南：{marketOverview.actionAdvice}</span>
          </div>
        </div>
      </div>

      {/* 3. Smart Trade Signal Cards / Table with Self-Query Capability */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
        {/* Header & Description */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>主流標的智能買賣點建議 (Auto Trade Signals)</span>
              <span className="text-xs text-indigo-300 font-mono">({filteredStocks.length} 檔)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              融合「估值河流圖便宜價」與「波段均線動能」，提供確切進出場區間與防守價。支援搜尋或輸入任何代碼讓 AI 即時計算！
            </p>
          </div>
        </div>

        {/* Search & AI Calculator Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search box with AI Calculate button */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="搜尋清單內標的，或輸入任何代碼（例如 2382, 2881, 00929, AMD, GOOGL）由 AI 即時計算買賣點..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && filteredStocks.length === 0) handleCalculateCustomStockSignal();
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-28 py-2.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-none transition-colors"
            />
            {/* If query has text, show AI Calculate button inside right edge */}
            {searchQuery.trim() && (
              <button
                onClick={handleCalculateCustomStockSignal}
                disabled={isLookingUpAi}
                className="absolute right-2 top-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isLookingUpAi ? 'AI 算點中...' : 'AI 算點'}</span>
              </button>
            )}
          </div>

          {/* Market & Signal Segment Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Market filter */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs font-medium">
              <button
                onClick={() => setFilterMarket('ALL')}
                className={`px-3 py-1 rounded transition-colors ${filterMarket === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterMarket('TW')}
                className={`px-3 py-1 rounded transition-colors ${filterMarket === 'TW' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                台股
              </button>
              <button
                onClick={() => setFilterMarket('US')}
                className={`px-3 py-1 rounded transition-colors ${filterMarket === 'US' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                美股
              </button>
            </div>

            {/* Signal filter */}
            <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700/60 text-xs font-medium">
              <button
                onClick={() => setFilterSignal('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${filterSignal === 'ALL' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                所有訊號
              </button>
              <button
                onClick={() => setFilterSignal('BUY')}
                className={`px-2.5 py-1 rounded transition-colors ${filterSignal === 'BUY' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                買進信號
              </button>
              <button
                onClick={() => setFilterSignal('HOLD')}
                className={`px-2.5 py-1 rounded transition-colors ${filterSignal === 'HOLD' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                續抱
              </button>
              <button
                onClick={() => setFilterSignal('PROFIT_LOSS')}
                className={`px-2.5 py-1 rounded transition-colors ${filterSignal === 'PROFIT_LOSS' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                調節/停損
              </button>
            </div>
          </div>
        </div>

        {/* Sector Quick Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] shrink-0 mr-1">產業類別：</span>
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-0.5 rounded-md font-medium shrink-0 transition-colors ${
                selectedSector === sec
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sec === 'ALL' ? '全部產業' : sec}
            </button>
          ))}
        </div>

        {lookupNotice && (
          <div className="p-3 bg-indigo-950/80 border border-indigo-600/80 rounded-xl text-indigo-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{lookupNotice}</span>
            </div>
            <button onClick={() => setLookupNotice(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Stock Signal Cards Grid */}
        {filteredStocks.length === 0 ? (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-8 text-center space-y-3">
            <p className="text-slate-400 text-sm">目前清單中尚無「{searchQuery}」</p>
            <p className="text-xs text-slate-500">點擊下方按鈕，交由 Gemini AI 即時抓取基本面數據並為您運算買賣點：</p>
            <button
              onClick={handleCalculateCustomStockSignal}
              disabled={isLookingUpAi}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLookingUpAi ? 'Gemini 智慧運算中...' : `AI 即時計算「${searchQuery}」買賣點指引`}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredStocks.map((stock) => {
              const isStockUp = stock.change >= 0;
              const signalConfig = {
                STRONG_BUY: { label: '強烈買進', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
                DCA_BUY: { label: '逢低分批存股', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
                HOLD: { label: '區間續抱', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
                TAKE_PROFIT: { label: '逢高調節停利', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
                STOP_LOSS: { label: '跌破支撐止損', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
              }[stock.signal];

              return (
                <div
                  key={stock.symbol}
                  className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 rounded-xl p-4 transition-all duration-150 flex flex-col justify-between"
                >
                  <div>
                    {/* Card Top */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                            {stock.symbol}
                          </span>
                          <h4 className="font-bold text-white text-sm hover:text-indigo-400 cursor-pointer" onClick={() => onSelectStock(stock)}>
                            {stock.name}
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-0.5 block">{stock.sector}</span>
                      </div>

                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${signalConfig.color}`}>
                        {signalConfig.label}
                      </span>
                    </div>

                    {/* Price & Change */}
                    <div className="flex items-baseline justify-between my-3 pb-2 border-b border-slate-800/80">
                      <div>
                        <span className="text-xl font-bold font-mono text-white tabular-nums">
                          ${stock.price.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono text-xs font-bold tabular-nums ${isStockUp ? upColor : downColor}`}>
                          {isStockUp ? `+${stock.change.toFixed(2)} (+${stock.changePercent.toFixed(2)}%)` : `${stock.change.toFixed(2)} (${stock.changePercent.toFixed(2)}%)`}
                        </span>
                      </div>
                    </div>

                    {/* Buy / Stop / Target Triplet */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono my-2 py-2 px-1 rounded-lg bg-slate-900/90 border border-slate-800">
                      <div>
                        <span className="text-[10px] text-emerald-400 block font-sans">建議買進</span>
                        <span className="text-white font-bold tabular-nums">${stock.entryLow}~{stock.entryHigh}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-400 block font-sans">防守停損</span>
                        <span className="text-rose-300 font-bold tabular-nums">${stock.stopLoss}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-400 block font-sans">波段目標</span>
                        <span className="text-indigo-300 font-bold tabular-nums">${stock.targetPrice}</span>
                      </div>
                    </div>

                    {/* Short Reason snippet */}
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                      {stock.signalReason}
                    </p>
                  </div>

                  {/* Bottom Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => onSelectStock(stock)}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors text-center"
                    >
                      深度財報與新聞
                    </button>
                    <button
                      onClick={() => onOpenTradeModal(stock)}
                      className="py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors flex items-center gap-1 shadow-md shadow-indigo-600/20"
                    >
                      <span>交易指引</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
