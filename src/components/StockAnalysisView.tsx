import React, { useState } from 'react';
import { StockItem, ColorConvention } from '../types/stock';
import { InteractivePriceChart } from './charts/InteractivePriceChart';
import { ValuationRiverChart } from './charts/ValuationRiverChart';
import { FinancialHealthBars } from './charts/FinancialHealthBars';
import { Sparkles, Newspaper, Search, ArrowUpRight, TrendingUp, TrendingDown, BellRing, BookmarkPlus, CheckCircle2, Plus, SlidersHorizontal, Activity } from 'lucide-react';

interface Props {
  stocks: StockItem[];
  selectedStock: StockItem;
  colorConvention: ColorConvention;
  onSelectStock: (stock: StockItem) => void;
  onOpenTradeModal: (stock: StockItem) => void;
  onAddToAlerts: (stock: StockItem) => void;
  onAddNewStock: (stock: StockItem) => void;
}

export const StockAnalysisView: React.FC<Props> = ({
  stocks,
  selectedStock,
  colorConvention,
  onSelectStock,
  onOpenTradeModal,
  onAddToAlerts,
  onAddNewStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'chart' | 'river' | 'financials' | 'news'>('chart');
  const [isAiNewsLoading, setIsAiNewsLoading] = useState(false);
  const [aiNewsData, setAiNewsData] = useState<{
    overallSentiment: string;
    sentimentScore: number;
    analysis: string;
    keyTakeaways: string[];
  } | null>(null);
  const [alertNotice, setAlertNotice] = useState(false);

  // Custom stock AI lookup state
  const [isGeneratingStock, setIsGeneratingStock] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const isUp = selectedStock.change >= 0;
  const upColor = colorConvention === 'TW' ? 'text-red-400' : 'text-emerald-400';
  const downColor = colorConvention === 'TW' ? 'text-emerald-400' : 'text-red-400';

  const filteredSearchList = stocks.filter(
    s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFetchAiNewsSentiment = async () => {
    setIsAiNewsLoading(true);
    try {
      const headlines = selectedStock.news.map(n => n.title);
      const res = await fetch('/api/gemini/news-sentiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newsHeadlines: headlines,
          symbol: selectedStock.symbol,
          name: selectedStock.name,
        }),
      });
      const data = await res.json();
      if (data && data.analysis) {
        setAiNewsData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiNewsLoading(false);
    }
  };

  const handleAlertClick = () => {
    onAddToAlerts(selectedStock);
    setAlertNotice(true);
    setTimeout(() => setAlertNotice(false), 2500);
  };

  // Perform AI custom stock search & analysis
  const handlePerformCustomStockAnalysis = async () => {
    if (!searchQuery.trim()) return;
    setIsGeneratingStock(true);
    setGenerateError(null);

    try {
      const res = await fetch('/api/gemini/stock-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim() }),
      });
      const data = await res.json();
      if (data && data.stock) {
        onAddNewStock(data.stock);
        onSelectStock(data.stock);
        setSearchQuery('');
        setAiNewsData(null);
      } else {
        setGenerateError('無法解析該標的代碼，請確認後重試');
      }
    } catch (e) {
      console.error(e);
      setGenerateError('連線異常，請稍候重試');
    } finally {
      setIsGeneratingStock(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Stock Selector & Quick Bar with Custom Search */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        {/* Quick Stock Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-2xl">
          <span className="text-xs text-slate-400 font-medium shrink-0 mr-1">快捷切換:</span>
          {stocks.slice(0, 8).map((s) => (
            <button
              key={s.symbol}
              onClick={() => {
                onSelectStock(s);
                setAiNewsData(null);
              }}
              className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium shrink-0 transition-colors ${
                selectedStock.symbol === s.symbol
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {s.symbol} {s.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Search Input with Auto-Lookup Dropdown */}
        <div className="relative min-w-[240px] sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="搜尋代碼或自訂查詢 (如 2382, PLTR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredSearchList.length === 0) {
                handlePerformCustomStockAnalysis();
              }
            }}
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />
          {searchQuery && (
            <div className="absolute right-0 top-10 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-20 max-h-64 overflow-y-auto divide-y divide-slate-800">
              {filteredSearchList.map(s => (
                <div
                  key={s.symbol}
                  onClick={() => {
                    onSelectStock(s);
                    setSearchQuery('');
                    setAiNewsData(null);
                  }}
                  className="px-3 py-2 text-xs hover:bg-slate-800 cursor-pointer flex justify-between items-center"
                >
                  <div>
                    <span className="font-semibold text-white block">{s.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{s.symbol} · {s.market}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-white">${s.price}</span>
                </div>
              ))}

              {/* If no exact match in preloaded list, offer AI generation button */}
              <div
                onClick={handlePerformCustomStockAnalysis}
                className="p-3 text-xs bg-indigo-950/60 hover:bg-indigo-900/60 cursor-pointer text-indigo-200 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>
                    {isGeneratingStock ? 'AI 分析生成中...' : `以 AI 即時解析「${searchQuery}」完整財報與估值`}
                  </span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {generateError && (
        <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center justify-between">
          <span>{generateError}</span>
          <button onClick={() => setGenerateError(null)}>✕</button>
        </div>
      )}

      {/* 2. Stock Header Hero Card (Enriched with More Financial Columns) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-sm font-mono font-bold px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-300">
                {selectedStock.symbol}
              </span>
              <h2 className="text-2xl font-bold text-white">{selectedStock.name}</h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full border bg-slate-800 text-slate-300 border-slate-700">
                {selectedStock.sector}
              </span>
            </div>

            <div className="flex flex-wrap items-baseline gap-4 mt-3">
              <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                ${selectedStock.price.toFixed(2)}
              </span>
              <span className={`text-base font-bold font-mono tabular-nums ${isUp ? upColor : downColor}`}>
                {isUp ? `+${selectedStock.change.toFixed(2)} (+${selectedStock.changePercent.toFixed(2)}%)` : `${selectedStock.change.toFixed(2)} (${selectedStock.changePercent.toFixed(2)}%)`}
              </span>
              <span className="text-xs text-slate-500 font-mono">成交量 {selectedStock.volume}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                52週區間: ${selectedStock.low52w} ~ ${selectedStock.high52w}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleAlertClick}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>設為波動警示</span>
            </button>
            <button
              onClick={() => onOpenTradeModal(selectedStock)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-colors flex items-center gap-1.5"
            >
              <span>精準買賣點指引</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {alertNotice && (
          <div className="mt-3 p-2 bg-amber-950/80 border border-amber-600/80 rounded-lg text-amber-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>已將 {selectedStock.name} 加入波動警示雷達！突破關鍵價將即時推播提醒。</span>
          </div>
        )}

        {/* Expanded Key Financial & Valuation Columns (8-grid) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-4 pt-4 border-t border-slate-800 text-xs font-mono">
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">本益比 (PE)</span>
            <span className="text-white font-bold">{selectedStock.peRatio ? `${selectedStock.peRatio}x` : 'ETF或無'}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">股價淨值比 (PB)</span>
            <span className="text-white font-bold">{selectedStock.pbRatio ? `${selectedStock.pbRatio}x` : 'N/A'}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">現金殖利率</span>
            <span className="text-emerald-400 font-bold">{selectedStock.yieldRate}%</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">每股盈餘 (EPS)</span>
            <span className="text-white font-bold">{selectedStock.eps ? `$${selectedStock.eps}` : 'N/A'}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">總市值規模</span>
            <span className="text-slate-200">{selectedStock.marketCap}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">波動度 Beta</span>
            <span className="text-slate-200">{selectedStock.beta}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">KD(9,3,3)</span>
            <span className="text-indigo-400 font-bold">{selectedStock.kd}</span>
          </div>
          <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80">
            <span className="text-slate-400 text-[10px] block">RSI (14日)</span>
            <span className="text-indigo-400 font-bold">{selectedStock.rsi}</span>
          </div>
        </div>
      </div>

      {/* 3. Deep Analysis Mode Segment Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl w-fit text-xs font-medium">
        <button
          onClick={() => setActiveTab('chart')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'chart' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          📈 走勢與技術買賣帶
        </button>
        <button
          onClick={() => setActiveTab('river')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'river' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          🌊 本益比河流圖
        </button>
        <button
          onClick={() => setActiveTab('financials')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'financials' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          📊 企業財務體質健康
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`px-4 py-2 rounded-lg transition-colors ${activeTab === 'news' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          📰 即時新聞與情緒
        </button>
      </div>

      {/* 4. Tab Views Content */}
      {activeTab === 'chart' && (
        <InteractivePriceChart
          data={selectedStock.priceHistory}
          colorConvention={colorConvention}
          symbol={selectedStock.symbol}
          name={selectedStock.name}
          currentPrice={selectedStock.price}
          entryLow={selectedStock.entryLow}
          entryHigh={selectedStock.entryHigh}
          stopLoss={selectedStock.stopLoss}
          targetPrice={selectedStock.targetPrice}
        />
      )}

      {activeTab === 'river' && (
        <ValuationRiverChart
          symbol={selectedStock.symbol}
          currentPrice={selectedStock.price}
          peRatio={selectedStock.peRatio}
          valuationStatus={selectedStock.valuationStatus}
        />
      )}

      {activeTab === 'financials' && (
        <FinancialHealthBars
          financials={selectedStock.financials}
          symbol={selectedStock.symbol}
          name={selectedStock.name}
        />
      )}

      {activeTab === 'news' && (
        <div className="space-y-4">
          {/* AI News Synthesis Box */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">Gemini AI 即時新聞情緒分析</h4>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                  情緒評分: {aiNewsData ? aiNewsData.sentimentScore : 72}/100 (利多偏向)
                </span>
              </div>
              <button
                onClick={handleFetchAiNewsSentiment}
                disabled={isAiNewsLoading}
                className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors font-medium"
              >
                {isAiNewsLoading ? '分析中...' : '深度新聞情緒重構'}
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {aiNewsData ? aiNewsData.analysis : `${selectedStock.name} 近期媒體與法人新聞整體偏向正面。主要客戶訂單能見度佳，產能利用率維持高檔，短線無突發結構性利空，情緒對股價具備正向支撐力。`}
            </p>

            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <span className="text-xs font-semibold text-slate-400 block mb-2">重點核心摘要：</span>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(aiNewsData ? aiNewsData.keyTakeaways : [
                  '主要客戶拉貨動能持穩，先進製程產能滿載',
                  '外資法人報告目標價維持調升趨勢',
                  '建議投資人注意短線獲利了結震盪，逢支撐再行建立長線部位'
                ]).map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 shrink-0">✔</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Raw News Headlines List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-slate-400" />
              <span>相關即時重要新聞報導</span>
            </h4>
            <div className="divide-y divide-slate-800">
              {selectedStock.news.map((item) => (
                <div key={item.id} className="py-3.5 first:pt-1 last:pb-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h5 className="text-xs sm:text-sm font-semibold text-slate-100 hover:text-indigo-400 cursor-pointer transition-colors">
                        {item.title}
                      </h5>
                      <p className="text-xs text-slate-400 mt-1">{item.summary}</p>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono mt-2">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 font-medium ${
                      item.sentiment === 'BULLISH'
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        : item.sentiment === 'BEARISH'
                        ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {item.sentiment === 'BULLISH' ? '正面利多' : item.sentiment === 'BEARISH' ? '負面利空' : '中立觀望'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
