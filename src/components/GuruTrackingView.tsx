import React, { useState } from 'react';
import { GuruProfile, StockItem, PortfolioHolding, GuruCategory } from '../types/stock';
import { GURU_PROFILES } from '../data/guruData';
import { Award, TrendingUp, TrendingDown, Copy, CheckCircle2, Calculator, Sparkles, MessageSquareQuote, Search, Filter, Plus, Flame, ExternalLink, X } from 'lucide-react';

interface Props {
  onCopyTradeToPortfolio: (newHoldings: PortfolioHolding[]) => void;
  onSelectStockBySymbol: (symbol: string) => void;
  allStocks: StockItem[];
}

export const GuruTrackingView: React.FC<Props> = ({
  onCopyTradeToPortfolio,
  onSelectStockBySymbol,
  allStocks,
}) => {
  const [guruList, setGuruList] = useState<GuruProfile[]>(() => {
    try {
      const saved = localStorage.getItem('smarttrade_custom_gurus');
      if (saved) {
        const customGurus: GuruProfile[] = JSON.parse(saved);
        // Merge without duplicating IDs
        const existingIds = new Set(GURU_PROFILES.map(g => g.id));
        const merged = [...GURU_PROFILES];
        customGurus.forEach(cg => {
          if (!existingIds.has(cg.id)) merged.push(cg);
        });
        return merged;
      }
    } catch (e) {
      console.error(e);
    }
    return GURU_PROFILES;
  });

  const [selectedGuruId, setSelectedGuruId] = useState<string>('gooaye'); // Default to 股癌
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<GuruCategory>('ALL');
  const [holdingFilterStock, setHoldingFilterStock] = useState<string | null>(null);

  // Copy trade modal state
  const [copyBudget, setCopyBudget] = useState<number>(300000);
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  // AI Guru Lookup Modal State
  const [showAiLookupModal, setShowAiLookupModal] = useState<boolean>(false);
  const [aiLookupQuery, setAiLookupQuery] = useState<string>('');
  const [isAiLookingUp, setIsAiLookingUp] = useState<boolean>(false);
  const [aiLookupError, setAiLookupError] = useState<string | null>(null);

  // Filter gurus based on Search Query, Category, and specific stock holding
  const filteredGurus = guruList.filter((g) => {
    // 1. Category check
    if (selectedCategory !== 'ALL' && g.category !== selectedCategory) {
      return false;
    }

    // 2. Stock holding filter (if clicked a cross-ref pill)
    if (holdingFilterStock) {
      const holds = g.topHoldings.some(h => h.symbol.toUpperCase() === holdingFilterStock.toUpperCase());
      if (!holds) return false;
    }

    // 3. Search query check
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const matchName = g.name.toLowerCase().includes(query);
      const matchTitle = g.title.toLowerCase().includes(query);
      const matchStyle = g.styleDescription.toLowerCase().includes(query);
      const matchTags = g.tags?.some(t => t.toLowerCase().includes(query));
      const matchHoldings = g.topHoldings.some(h =>
        h.symbol.toLowerCase().includes(query) || h.name.toLowerCase().includes(query)
      );

      if (!matchName && !matchTitle && !matchStyle && !matchTags && !matchHoldings) {
        return false;
      }
    }

    return true;
  });

  // Ensure current selected guru exists in filtered list, or default to first match
  const currentGuru =
    filteredGurus.find(g => g.id === selectedGuruId) ||
    filteredGurus[0] ||
    guruList[0];

  const handleExecuteCopyTrade = () => {
    if (!currentGuru) return;
    const newHoldings: PortfolioHolding[] = currentGuru.topHoldings.map((h, i) => {
      const stockInfo = allStocks.find(s => s.symbol === h.symbol);
      const allocatedVal = (copyBudget * h.weight) / 100;
      const price = stockInfo?.price || 100;
      const shares = Math.max(1, Math.round(allocatedVal / price));
      const totalCost = shares * price;

      return {
        id: `guru_copy_${currentGuru.id}_${h.symbol}_${Date.now()}_${i}`,
        symbol: h.symbol,
        name: h.name,
        market: h.market,
        shares,
        avgBuyPrice: price,
        currentPrice: price,
        totalCost,
        currentValue: totalCost,
        unrealizedPnL: 0,
        unrealizedPnLPercent: 0,
        allocationPercent: h.weight,
        targetAllocationPercent: h.weight,
        riskRating: 'MEDIUM',
        notes: `跟單複製自【${currentGuru.name}】核心持股`,
      };
    });

    onCopyTradeToPortfolio(newHoldings);
    setCopiedToast(true);
    setShowCopyModal(false);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Perform AI Lookup for custom celebrity investor
  const handlePerformAiLookup = async () => {
    if (!aiLookupQuery.trim()) return;
    setIsAiLookingUp(true);
    setAiLookupError(null);

    try {
      const res = await fetch('/api/gemini/guru-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiLookupQuery.trim() }),
      });
      const data = await res.json();
      if (data && data.profile) {
        const newProfile: GuruProfile = data.profile;
        const updatedList = [newProfile, ...guruList];
        setGuruList(updatedList);
        setSelectedGuruId(newProfile.id);

        try {
          const customOnly = updatedList.filter(g => g.id.startsWith('custom_'));
          localStorage.setItem('smarttrade_custom_gurus', JSON.stringify(customOnly));
        } catch (e) {
          console.error(e);
        }

        setShowAiLookupModal(false);
        setAiLookupQuery('');
      } else {
        setAiLookupError('無法解析該大師資訊，請確認名稱後重試');
      }
    } catch (err: any) {
      console.error(err);
      setAiLookupError('網路或伺服器連線異常，請稍候重試');
    } finally {
      setIsAiLookingUp(false);
    }
  };

  // Popular stock cross-reference pills
  const popularCrossStocks = [
    { symbol: '2330', name: '台積電' },
    { symbol: 'NVDA', name: '輝達' },
    { symbol: '006208', name: '富邦台50' },
    { symbol: '00878', name: '國泰高股息' },
    { symbol: 'AAPL', name: '蘋果' },
    { symbol: 'TSLA', name: '特斯拉' },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Guru Search & Category Filter Control Hub */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono">
                名人清單追蹤庫 · 共 {guruList.length} 位
              </span>
              {holdingFilterStock && (
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1 font-mono">
                  <span>持有 {holdingFilterStock}</span>
                  <button onClick={() => setHoldingFilterStock(null)} className="hover:text-white">✕</button>
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white mt-1">股市名人存股動向與跟單追蹤</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              支援即時搜尋大師姓名、風格哲學、或查詢哪位大師買了特定的股票代碼。
            </p>
          </div>

          {/* AI Custom Guru Lookup Button */}
          <button
            onClick={() => setShowAiLookupModal(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI 查詢或追蹤新大師</span>
          </button>
        </div>

        {/* Search Bar & Categories Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="搜尋名人 (如：股癌、股魚、巴菲特、貝瑞) 或股票代碼 (2330, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 font-medium focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              全部名人 ({guruList.length})
            </button>
            <button
              onClick={() => setSelectedCategory('TW_LOCAL')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'TW_LOCAL' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🇹🇼 台灣實戰達人 (股癌/股魚/老牛)
            </button>
            <button
              onClick={() => setSelectedCategory('GLOBAL_LEGEND')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'GLOBAL_LEGEND' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🌎 全球傳奇 (巴菲特/達利歐/林區)
            </button>
            <button
              onClick={() => setSelectedCategory('GROWTH_TECH')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'GROWTH_TECH' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🚀 科技成長 (木頭姐/ARK)
            </button>
            <button
              onClick={() => setSelectedCategory('VALUE_DIVIDEND')}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === 'VALUE_DIVIDEND' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              💰 穩健高股息 (陳重銘)
            </button>
          </div>
        </div>

        {/* Quick Cross-Reference: Who holds which stock? */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>查詢誰持有這檔熱門股：</span>
          </span>
          {popularCrossStocks.map((stk) => {
            const isFilterActive = holdingFilterStock === stk.symbol;
            return (
              <button
                key={stk.symbol}
                onClick={() => setHoldingFilterStock(isFilterActive ? null : stk.symbol)}
                className={`px-2.5 py-1 rounded-md font-mono text-[11px] transition-colors ${
                  isFilterActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                {stk.name} ({stk.symbol})
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Guru Cards Grid / Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span>點選任一大師卡片即可切換下方深度持倉與跟單面板 (共找到 {filteredGurus.length} 位)：</span>
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); setHoldingFilterStock(null); }} className="text-indigo-400 hover:underline">
              清除篩選
            </button>
          )}
        </div>

        {filteredGurus.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center space-y-3">
            <p className="text-slate-400 text-sm">找不到符合「{searchQuery}」的大師名人</p>
            <button
              onClick={() => {
                setAiLookupQuery(searchQuery);
                setShowAiLookupModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>啟動 Gemini AI 即時為您解析「{searchQuery}」的持倉動向</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {filteredGurus.map((guru) => {
              const isSelected = guru.id === currentGuru?.id;
              const isGooaye = guru.id === 'gooaye';

              return (
                <button
                  key={guru.id}
                  onClick={() => setSelectedGuruId(guru.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/15 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-xs font-bold text-white truncate">{guru.name}</span>
                      {isGooaye && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono shrink-0">
                          特選
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-1">{guru.title}</p>
                    {/* Tags preview */}
                    {guru.tags && guru.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {guru.tags.slice(0, 2).map((t, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-indigo-400 font-mono mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span>持股 {guru.topHoldings.length} 檔</span>
                    <span className="text-slate-500 font-sans">點擊查看</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Selected Guru Detail Banner */}
      {currentGuru && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
                {currentGuru.name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-white">{currentGuru.name}</h2>
                  <span className="text-xs px-2.5 py-0.5 rounded-full border bg-indigo-950/70 border-indigo-800 text-indigo-300 font-medium">
                    {currentGuru.badge}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {currentGuru.lastUpdated}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  {currentGuru.styleDescription}
                </p>
                {/* Tags */}
                {currentGuru.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentGuru.tags.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/80 text-slate-300 font-mono">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowCopyModal(true)}
              className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>跟單複製試算</span>
            </button>
          </div>

          {copiedToast && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-600/80 rounded-lg text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>已成功將 {currentGuru.name} 的投資組合配置複製到「我的投資組合」中！</span>
            </div>
          )}

          {/* Quote & Philosophy Box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-2">
                  <MessageSquareQuote className="w-4 h-4" />
                  <span>大師本期核心洞察與最新點評</span>
                </div>
                <p className="text-slate-300 italic leading-relaxed">
                  {currentGuru.keyInsight}
                </p>
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-3 pt-2 border-t border-slate-800/60">
                代表名言：{currentGuru.famousQuote}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
              <span className="text-indigo-400 font-semibold block mb-2">大師核心操作心法守則：</span>
              <ul className="space-y-1.5 text-slate-300">
                {currentGuru.philosophy.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-indigo-400 shrink-0 font-mono">0{i + 1}.</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 4. Top Holdings Breakdown Grid */}
          <div className="pt-2">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{currentGuru.name} 核心存股與持倉清單</span>
                  <span className="text-xs text-slate-400 font-mono">({currentGuru.topHoldings.length} 檔)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">點擊標的名稱可快速切換至深度財務圖表與即時新聞</p>
              </div>
              <span className="text-xs text-slate-400 font-mono">資金規模：{currentGuru.aum}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {currentGuru.topHoldings.map((holding) => {
                const isChangePositive = holding.quarterChange > 0;
                const isChangeZero = holding.quarterChange === 0;

                return (
                  <div
                    key={holding.symbol}
                    className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                              {holding.symbol}
                            </span>
                            <h4
                              className="font-bold text-white text-sm hover:text-indigo-400 cursor-pointer"
                              onClick={() => onSelectStockBySymbol(holding.symbol)}
                            >
                              {holding.name}
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">{holding.sharesHeld}</span>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-bold font-mono text-indigo-300">
                            {holding.weight}%
                          </span>
                          <div className="text-[10px] font-mono mt-0.5">
                            {isChangeZero ? (
                              <span className="text-slate-400">維持持平</span>
                            ) : isChangePositive ? (
                              <span className="text-emerald-400">+{holding.quarterChange}% 加碼</span>
                            ) : (
                              <span className="text-rose-400">{holding.quarterChange}% 減碼</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Weight Progress Bar */}
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-2.5">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full rounded-full"
                          style={{ width: `${Math.min(100, holding.weight * 2.5)}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed mt-2 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/60">
                        💡 <strong className="text-slate-200">選股邏輯：</strong>{holding.rationale}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onSelectStockBySymbol(holding.symbol)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        <span>查看該檔技術面與財報</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 5. Recent Activity Timeline */}
          {currentGuru.recentActivities && currentGuru.recentActivities.length > 0 && (
            <div className="pt-2">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span>{currentGuru.name} 最新公開操作軌跡</span>
              </h3>
              <div className="divide-y divide-slate-800 bg-slate-950/60 rounded-xl p-3 border border-slate-800/80">
                {currentGuru.recentActivities.map((act, i) => (
                  <div key={i} className="py-2.5 first:pt-1 last:pb-1 flex flex-wrap items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold shrink-0 ${
                        act.action === 'BUY'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : act.action === 'SELL'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-sky-950 text-sky-300 border border-sky-800'
                      }`}>
                        {act.action === 'BUY' ? '加碼買進' : act.action === 'SELL' ? '調節賣出' : '持股續抱'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white font-mono">{act.symbol}</span>
                          <span className="text-slate-400 font-mono">{act.amount}</span>
                        </div>
                        <p className="text-slate-300 mt-0.5">{act.comment}</p>
                      </div>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">{act.date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Copy Trade Simulation Modal */}
      {showCopyModal && currentGuru && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  跟單模擬試算器 — 【{currentGuru.name}】
                </h3>
              </div>
              <button
                onClick={() => setShowCopyModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              輸入您預計投入的模擬總資金，系統將依據 {currentGuru.name} 的真實持倉比例自動換算各檔標的之建議配置金額與股數。
            </p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                預計跟單投資總金額 (TWD)
              </label>
              <input
                type="number"
                value={copyBudget}
                onChange={(e) => setCopyBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm"
              />
            </div>

            {/* Allocation breakdown list */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto text-xs font-mono">
              {currentGuru.topHoldings.map((h) => {
                const stockInfo = allStocks.find(s => s.symbol === h.symbol);
                const price = stockInfo?.price || 100;
                const allocated = (copyBudget * h.weight) / 100;
                const estShares = Math.max(1, Math.round(allocated / price));

                return (
                  <div key={h.symbol} className="flex items-center justify-between p-2 bg-slate-950/70 rounded border border-slate-800">
                    <div>
                      <span className="font-bold text-white">{h.name}</span>
                      <span className="text-slate-400 ml-1">({h.symbol})</span>
                      <span className="text-[11px] text-indigo-400 ml-1.5">{h.weight}%</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-semibold">${allocated.toLocaleString()} 元</span>
                      <span className="text-slate-400 block text-[10px]">約 {estShares.toLocaleString()} 股</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                onClick={handleExecuteCopyTrade}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>確認一鍵導入我的投資組合</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Lookup New Guru Modal */}
      {showAiLookupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">AI 智能解析大師或經理人</h3>
              </div>
              <button
                onClick={() => setShowAiLookupModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              輸入任何你想追蹤的全球投資大師、基金經理人或台灣財經 KOL（例如：<strong>游庭皓、段詩潔、索羅斯、查理蒙格、比爾艾克曼、段譽</strong> 等），Gemini 3.8 AI 將即時分析其公開言論、13F報告與選股偏好，為您生成專屬追蹤檔案！
            </p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                大師或經理人名稱
              </label>
              <input
                type="text"
                placeholder="例如：游庭皓、索羅斯、比爾·艾克曼..."
                value={aiLookupQuery}
                onChange={(e) => setAiLookupQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePerformAiLookup();
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
              />
            </div>

            {aiLookupError && (
              <div className="text-xs text-rose-400 p-2 bg-rose-950/40 rounded border border-rose-800">
                {aiLookupError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAiLookupModal(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                onClick={handlePerformAiLookup}
                disabled={isAiLookingUp || !aiLookupQuery.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {isAiLookingUp ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini 分析大師持倉中...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>解析並加入追蹤庫</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
