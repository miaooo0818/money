import React, { useState, useEffect } from 'react';
import { StockItem, ColorConvention, PortfolioHolding, MarketAlert, MarketOverviewData } from './types/stock';
import { MOCK_STOCKS, INITIAL_MARKET_OVERVIEW, INITIAL_USER_PORTFOLIO } from './data/mockStockData';
import { Navbar } from './components/Navbar';
import { Sidebar, ViewTab } from './components/Sidebar';
import { MarketDiagnosisView } from './components/MarketDiagnosisView';
import { StockAnalysisView } from './components/StockAnalysisView';
import { PortfolioView } from './components/PortfolioView';
import { GuruTrackingView } from './components/GuruTrackingView';
import { AlertsWatchlistView } from './components/AlertsWatchlistView';
import { TradePointModal } from './components/TradePointModal';

const INITIAL_ALERTS: MarketAlert[] = [
  {
    id: 'a1',
    symbol: '2330',
    stockName: '台積電 TSMC',
    type: 'STRATEGY_SIGNAL',
    severity: 'INFO',
    title: '台積電突破月線，AI信號轉為「逢低分批存股」',
    message: '現價 1045 元站穩月線，成交量放大 20%，估值處於河流圖合理中間區間。',
    suggestedAction: '建議於 1015~1035 元區間分批建立長線持倉，防守價設 975 元。',
    timestamp: '15分鐘前',
    isRead: false,
  },
  {
    id: 'a2',
    symbol: 'NVDA',
    stockName: '輝達 NVIDIA',
    type: 'PRICE_BREAKOUT',
    severity: 'INFO',
    title: '輝達強勢突破 138 美元，挑戰歷史新高',
    message: '受 Blackwell 晶片滿載利多推升，短線動能指標 KD 逼近 78。',
    suggestedAction: '波段持有者續抱；無部位者建議等候回測 132~135 美元支撐再行切入。',
    timestamp: '1小時前',
    isRead: false,
  },
  {
    id: 'a3',
    symbol: '2454',
    stockName: '聯發科 MediaTek',
    type: 'GURU_ACTION',
    severity: 'INFO',
    title: '【股癌 Gooaye 最新動向】加碼聯發科部位',
    message: '看好旗艦天璣 9400 晶片滲透率與 ASIC 潛力，本季持倉比重提升至 14.5%。',
    suggestedAction: '現價 1315 元，殖利率達 4.38%，下檔具備良好殖利率保護。',
    timestamp: '3小時前',
    isRead: false,
  },
  {
    id: 'a4',
    symbol: 'TSLA',
    stockName: '特斯拉 Tesla',
    type: 'PRICE_BREAKDOWN',
    severity: 'WARNING',
    title: '特斯拉短線回測季線支撐，波動度放大',
    message: '單日跌幅 3.68%，觸及布林通道下軌 248.5 美元。',
    suggestedAction: '防守停損價設 218 美元，非專業投資人部位建議控制在總資產 10% 以內。',
    timestamp: '6小時前',
    isRead: false,
  },
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('market');
  const [stocks, setStocks] = useState<StockItem[]>(MOCK_STOCKS);
  const [selectedStock, setSelectedStock] = useState<StockItem>(MOCK_STOCKS[0]);
  const [colorConvention, setColorConvention] = useState<ColorConvention>('TW'); // Default: TW red-up green-down
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>(() => {
    try {
      const saved = localStorage.getItem('smarttrade_portfolio');
      return saved ? JSON.parse(saved) : INITIAL_USER_PORTFOLIO;
    } catch {
      return INITIAL_USER_PORTFOLIO;
    }
  });
  const [marketOverview, setMarketOverview] = useState<MarketOverviewData>(INITIAL_MARKET_OVERVIEW);
  const [alerts, setAlerts] = useState<MarketAlert[]>(() => {
    try {
      const saved = localStorage.getItem('smarttrade_alerts');
      return saved ? JSON.parse(saved) : INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });
  const [activeTradeModalStock, setActiveTradeModalStock] = useState<StockItem | null>(null);
  const [isAiRefreshing, setIsAiRefreshing] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('smarttrade_portfolio', JSON.stringify(portfolio));
    } catch (e) {
      console.error(e);
    }
  }, [portfolio]);

  useEffect(() => {
    try {
      localStorage.setItem('smarttrade_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.error(e);
    }
  }, [alerts]);

  const viewTitles: Record<ViewTab, string> = {
    market: '今日大盤與買賣點診斷',
    analysis: '個股與ETF深度財務及即時新聞分析',
    portfolio: '我的投資組合損益概況與風險分析',
    gurus: '股市名人存股動向與跟單試算（含股癌特輯）',
    alerts: '即時市場波動警示與多裝置同步',
  };

  // 1. Refresh Market Overview via Server-Side Gemini API
  const handleRefreshMarket = async () => {
    setIsAiRefreshing(true);
    try {
      const res = await fetch('/api/gemini/market-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market: 'TW_US' }),
      });
      const data = await res.json();
      if (data && data.summary) {
        setMarketOverview(prev => ({
          ...prev,
          summary: data.summary,
          bullishFactors: data.bullishFactors || prev.bullishFactors,
          bearishFactors: data.bearishFactors || prev.bearishFactors,
          actionAdvice: data.actionPlan || prev.actionAdvice,
        }));
      }
    } catch (err) {
      console.error('Failed to refresh market analysis:', err);
    } finally {
      setIsAiRefreshing(false);
    }
  };

  // 2. Add to Portfolio handler
  const handleAddToPortfolio = (stock: StockItem, shares: number, buyPrice: number) => {
    const totalCost = shares * buyPrice;
    const currentVal = shares * stock.price;
    const pnl = currentVal - totalCost;
    const pnlPercent = totalCost > 0 ? (pnl / totalCost) * 100 : 0;

    const newHolding: PortfolioHolding = {
      id: `p_${Date.now()}`,
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
      shares,
      avgBuyPrice: buyPrice,
      currentPrice: stock.price,
      totalCost,
      currentValue: currentVal,
      unrealizedPnL: pnl,
      unrealizedPnLPercent: pnlPercent,
      allocationPercent: 0,
      targetAllocationPercent: 15,
      riskRating: stock.type === 'ETF' ? 'LOW' : 'MEDIUM',
      notes: '手動加入或自買賣點指引導入',
    };

    setPortfolio(prev => [...prev, newHolding]);
  };

  // 3. Add to Alerts handler
  const handleAddToAlerts = (stock: StockItem) => {
    const newAlert: MarketAlert = {
      id: `alert_${Date.now()}`,
      symbol: stock.symbol,
      stockName: stock.name,
      type: 'STRATEGY_SIGNAL',
      severity: 'INFO',
      title: `${stock.name} (${stock.symbol}) 進入重點觀察名單`,
      message: `建議買進區間為 $${stock.entryLow} ~ $${stock.entryHigh}，關鍵防守停損價 $${stock.stopLoss}。`,
      suggestedAction: '密切注意盤中回測支撐時機分批布局。',
      timestamp: '剛剛',
      isRead: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  // 4. Copy-Trade batch import
  const handleCopyTradeToPortfolio = (newHoldings: PortfolioHolding[]) => {
    setPortfolio(prev => [...prev, ...newHoldings]);
  };

  // 5. Select stock from any view
  const handleSelectStockBySymbol = (symbol: string) => {
    const found = stocks.find(s => s.symbol === symbol);
    if (found) {
      setSelectedStock(found);
      setCurrentTab('analysis');
    }
  };

  // 6. Add new stock (from AI calculation or lookup)
  const handleAddNewStock = (newStock: StockItem) => {
    setStocks(prev => {
      const exists = prev.some(s => s.symbol.toUpperCase() === newStock.symbol.toUpperCase());
      if (exists) {
        return prev.map(s => s.symbol.toUpperCase() === newStock.symbol.toUpperCase() ? newStock : s);
      }
      return [newStock, ...prev];
    });
    setSelectedStock(newStock);
  };

  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <Navbar
        colorConvention={colorConvention}
        onToggleColorConvention={() => setColorConvention(prev => prev === 'TW' ? 'US' : 'TW')}
        activeViewTitle={viewTitles[currentTab]}
        onOpenTradeModalForFirst={() => setActiveTradeModalStock(stocks[0])}
      />

      {/* Main Workspace: Sidebar + Content Viewport */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-[1720px] w-full mx-auto">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          unreadAlertCount={unreadAlerts}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {/* Breadcrumb Header */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span>智投智選</span>
                <span>/</span>
                <span className="text-indigo-400 font-medium">{viewTitles[currentTab]}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {currentTab === 'market' && '每日大盤情勢與智能買賣點建議'}
                {currentTab === 'analysis' && `${selectedStock.name} (${selectedStock.symbol}) 深度財務與即時新聞`}
                {currentTab === 'portfolio' && '投資組合損益概況與多維度風險健檢'}
                {currentTab === 'gurus' && '股市名人存股清單與動態跟單追蹤'}
                {currentTab === 'alerts' && '市場波動警示推播與多裝置漫遊中心'}
              </h1>
            </div>

            {/* Quick Helper Banner for Non-professionals */}
            <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
              <span>非專業人士視覺化輔助模式已開啟</span>
            </div>
          </div>

          {/* Active View Render */}
          {currentTab === 'market' && (
            <MarketDiagnosisView
              marketOverview={marketOverview}
              stocks={stocks}
              colorConvention={colorConvention}
              onSelectStock={(st) => {
                setSelectedStock(st);
                setCurrentTab('analysis');
              }}
              onOpenTradeModal={(st) => setActiveTradeModalStock(st)}
              onRefreshMarket={handleRefreshMarket}
              onAddNewStock={handleAddNewStock}
              isAiRefreshing={isAiRefreshing}
            />
          )}

          {currentTab === 'analysis' && (
            <StockAnalysisView
              stocks={stocks}
              selectedStock={selectedStock}
              colorConvention={colorConvention}
              onSelectStock={setSelectedStock}
              onOpenTradeModal={(st) => setActiveTradeModalStock(st)}
              onAddToAlerts={handleAddToAlerts}
              onAddNewStock={handleAddNewStock}
            />
          )}

          {currentTab === 'portfolio' && (
            <PortfolioView
              holdings={portfolio}
              allStocks={stocks}
              colorConvention={colorConvention}
              onUpdateHolding={setPortfolio}
              onSelectStockBySymbol={handleSelectStockBySymbol}
            />
          )}

          {currentTab === 'gurus' && (
            <GuruTrackingView
              onCopyTradeToPortfolio={handleCopyTradeToPortfolio}
              onSelectStockBySymbol={handleSelectStockBySymbol}
              allStocks={stocks}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsWatchlistView
              alerts={alerts}
              watchlist={stocks.slice(0, 5)}
              allStocks={stocks}
              onDismissAlert={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
              onAddCustomAlert={(newAlert) => setAlerts(prev => [newAlert, ...prev])}
              onRemoveWatchlist={(sym) => console.log('remove', sym)}
              onSelectStock={(st) => {
                setSelectedStock(st);
                setCurrentTab('analysis');
              }}
            />
          )}
        </main>
      </div>

      {/* Trade Point Modal (Pops up when clicking trade signal on any stock) */}
      {activeTradeModalStock && (
        <TradePointModal
          stock={activeTradeModalStock}
          colorConvention={colorConvention}
          onClose={() => setActiveTradeModalStock(null)}
          onAddToPortfolio={handleAddToPortfolio}
          onAddToAlerts={handleAddToAlerts}
        />
      )}
    </div>
  );
}
