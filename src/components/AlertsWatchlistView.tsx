import React, { useState } from 'react';
import { MarketAlert, StockItem } from '../types/stock';
import { BellRing, Smartphone, Laptop, Tablet, QrCode, ShieldCheck, Check, Trash2, Plus, Download, Upload, RefreshCw } from 'lucide-react';

interface Props {
  alerts: MarketAlert[];
  watchlist: StockItem[];
  allStocks: StockItem[];
  onDismissAlert: (id: string) => void;
  onAddCustomAlert: (newAlert: MarketAlert) => void;
  onRemoveWatchlist: (symbol: string) => void;
  onSelectStock: (stock: StockItem) => void;
}

export const AlertsWatchlistView: React.FC<Props> = ({
  alerts,
  watchlist,
  allStocks,
  onDismissAlert,
  onAddCustomAlert,
  onRemoveWatchlist,
  onSelectStock,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(allStocks[0]?.symbol || '2330');
  const [alertType, setAlertType] = useState<'PRICE_BREAKOUT' | 'PRICE_BREAKDOWN' | 'STRATEGY_SIGNAL'>('PRICE_BREAKOUT');
  const [thresholdPrice, setThresholdPrice] = useState(allStocks[0]?.price || 1000);
  const [showAddAlertModal, setShowAddAlertModal] = useState(false);
  const [syncCodeCopied, setSyncCodeCopied] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('剛剛');

  const handleCreateAlert = () => {
    const stock = allStocks.find(s => s.symbol === selectedSymbol);
    if (!stock) return;

    const newAlert: MarketAlert = {
      id: `alert_${Date.now()}`,
      symbol: stock.symbol,
      stockName: stock.name,
      type: alertType,
      severity: alertType === 'PRICE_BREAKDOWN' ? 'WARNING' : 'INFO',
      title: alertType === 'PRICE_BREAKOUT' ? `${stock.name} 突破上漲目標價提醒` : alertType === 'PRICE_BREAKDOWN' ? `${stock.name} 跌破防守支撐價提醒` : `${stock.name} 策略訊號調整`,
      message: `當前設定監控價為 $${thresholdPrice}。當即時成交價觸及此水位時，將發送即時推播通知。`,
      suggestedAction: alertType === 'PRICE_BREAKOUT' ? '逢高分批調節獲利' : '檢視停損防守紀律',
      timestamp: '剛剛',
      isRead: false,
    };

    onAddCustomAlert(newAlert);
    setShowAddAlertModal(false);
  };

  const handleCopySyncToken = () => {
    navigator.clipboard?.writeText('SMARTTRADE_SYNC_TOKEN_7F9A2B4C8D');
    setSyncCodeCopied(true);
    setTimeout(() => setSyncCodeCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Multi-Device Synchronization Control Center */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                雲端多裝置即時同步中 (Active)
              </span>
              <span className="text-xs text-slate-400 font-mono">上次同步：{lastSyncTime}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1.5">跨裝置資料漫遊與同步中心</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              無論在桌機、手機或平板，您的自選清單、持倉損益與買賣點警示均自動即時同步。
            </p>
          </div>

          <button
            onClick={() => {
              setLastSyncTime('剛剛');
            }}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>立即強制同步</span>
          </button>
        </div>

        {/* Sync Device Cards & QR Code */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Devices */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400 shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block">當前網頁終端</span>
                <span className="text-[11px] text-emerald-400 font-mono block">連線中 (此裝置)</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block">iPhone 16 Pro</span>
                <span className="text-[11px] text-slate-400 font-mono block">5分鐘前同步</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                <Tablet className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-bold text-white block">iPad Air (M2)</span>
                <span className="text-[11px] text-slate-400 font-mono block">已配對待命</span>
              </div>
            </div>
          </div>

          {/* QR Sync Card */}
          <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block">手機掃描立即同步</span>
              <p className="text-[11px] text-slate-400 mt-0.5">用手機鏡頭掃描即可無痛延續所有持倉與自選設定。</p>
              <button
                onClick={handleCopySyncToken}
                className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 font-mono font-medium flex items-center gap-1"
              >
                {syncCodeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <QrCode className="w-3 h-3" />}
                <span>{syncCodeCopied ? '金鑰已複製！' : '複製同步金鑰代碼'}</span>
              </button>
            </div>
            {/* Clean SVG QR Code Representation */}
            <div className="w-16 h-16 bg-white p-1.5 rounded-lg shrink-0 flex items-center justify-center shadow">
              <svg viewBox="0 0 24 24" className="w-full h-full text-slate-950 fill-current">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v4h-2v-2h-2v-2zm2 2h2v2h-2v-2zm-6-2h2v4h-2v-4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Push Notifications & Volatility Alerts */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              <span>即時市場波動警示與個股策略調整提醒</span>
              <span className="text-xs text-indigo-300 font-mono">({alerts.length} 則未讀)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">突破重要均線、觸發止盈停損點位或大師名人調倉時主動通知</p>
          </div>

          <button
            onClick={() => setShowAddAlertModal(true)}
            className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>自訂價格監控條件</span>
          </button>
        </div>

        {/* Alerts list */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              目前無任何未讀市場警示，行情平穩運行中。
            </div>
          ) : (
            alerts.map((alert) => {
              const isWarning = alert.severity === 'WARNING';
              const isCritical = alert.severity === 'CRITICAL';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-xl border flex flex-wrap items-start justify-between gap-3 transition-colors ${
                    isCritical
                      ? 'bg-rose-950/30 border-rose-800/80'
                      : isWarning
                      ? 'bg-amber-950/30 border-amber-800/80'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 shrink-0">
                      {alert.symbol}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">{alert.title}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{alert.message}</p>
                      <div className="mt-2 text-[11px] text-indigo-300 font-medium">
                        💡 系統建議行動：{alert.suggestedAction}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDismissAlert(alert.id)}
                    className="p-1.5 text-slate-500 hover:text-slate-300 rounded transition-colors"
                    title="標記為已讀"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. My Watchlist (自選股監控池) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white">我的自選標的池 (Watchlist)</h3>
            <p className="text-xs text-slate-400 mt-0.5">點擊卡片直接進入個股深度財務與走勢圖表</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{watchlist.length} 檔自選</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {watchlist.map((stock) => (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock)}
              className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-indigo-500/80 rounded-xl cursor-pointer transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-xs text-indigo-300">{stock.symbol}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{stock.market}</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate">{stock.name}</h4>
                <div className="flex items-baseline justify-between mt-2 font-mono">
                  <span className="text-base font-bold text-white tabular-nums">${stock.price.toFixed(2)}</span>
                  <span className={`text-xs font-bold tabular-nums ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {stock.change >= 0 ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">買賣點: <strong className="text-indigo-400">{stock.signal === 'STRONG_BUY' ? '強烈買進' : stock.signal === 'DCA_BUY' ? '分批存股' : '續抱'}</strong></span>
                <span className="text-indigo-400 hover:underline">分析 →</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Custom Alert Modal */}
      {showAddAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">設定自訂價格監控與推播警示</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">選擇監控標的</label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => {
                    const sym = e.target.value;
                    setSelectedSymbol(sym);
                    const found = allStocks.find(s => s.symbol === sym);
                    if (found) setThresholdPrice(found.price);
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
                <label className="text-slate-400 block mb-1">觸發條件類型</label>
                <select
                  value={alertType}
                  onChange={(e) => setAlertType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                >
                  <option value="PRICE_BREAKOUT">🚀 價格向上突破關鍵目標價</option>
                  <option value="PRICE_BREAKDOWN">⚠️ 價格向下跌破防守停損線</option>
                  <option value="STRATEGY_SIGNAL">🔄 AI買賣訊號變更提醒</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">監控門檻價位 ($)</label>
                <input
                  type="number"
                  value={thresholdPrice}
                  onChange={(e) => setThresholdPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddAlertModal(false)}
                className="px-3.5 py-2 text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                onClick={handleCreateAlert}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold"
              >
                啟用警示監控
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
