export type MarketType = 'TW' | 'US';
export type AssetType = 'STOCK' | 'ETF';
export type ColorConvention = 'TW' | 'US'; // TW: Red up, Green down; US: Green up, Red down

export type SignalType = 
  | 'STRONG_BUY'       // 強烈買進
  | 'DCA_BUY'          // 逢低分批
  | 'HOLD'             // 區間續抱
  | 'TAKE_PROFIT'      // 逢高調節
  | 'STOP_LOSS';       // 跌破止損

export type ValuationStatus = 'CHEAP' | 'REASONABLE' | 'EXPENSIVE';

export interface PricePoint {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  ma5: number;
  ma20: number;
  volume: number;
}

export interface StockItem {
  symbol: string;
  name: string;
  market: MarketType;
  type: AssetType;
  sector: string;
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  volume: string;
  high52w: number;
  low52w: number;
  peRatio: number | null;
  pbRatio: number | null;
  yieldRate: number;
  eps: number | null;
  marketCap: string;
  beta: number;
  
  // Technical status
  maStatus: string;
  rsi: number;
  kd: number;
  bollingerStatus: string;
  valuationStatus: ValuationStatus;
  
  // Suggested Trade Signal
  signal: SignalType;
  signalConfidence: number; // 0-100
  entryLow: number;
  entryHigh: number;
  stopLoss: number;
  targetPrice: number;
  signalReason: string;

  priceHistory: PricePoint[];
  financials: FinancialQuarter[];
  news: StockNews[];
}

export interface FinancialQuarter {
  quarter: string;
  revenue: number; // in Millions
  revenueGrowth: number; // YoY %
  grossMargin: number; // %
  netMargin: number; // %
  roe: number; // %
  freeCashFlow: number; // Millions
  debtRatio: number; // %
}

export interface StockNews {
  id: string;
  title: string;
  source: string;
  time: string;
  sentiment: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  impactScore: number; // -100 to +100
  summary: string;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  market: MarketType;
  shares: number;
  avgBuyPrice: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  allocationPercent: number;
  targetAllocationPercent: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  notes?: string;
}

export interface GuruHolding {
  symbol: string;
  name: string;
  market: MarketType;
  weight: number; // %
  sharesHeld: string;
  quarterChange: number; // % changed this quarter (e.g. +12% or -5%)
  entryPriceAvg?: number;
  rationale: string;
}

export interface GuruActivity {
  date: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD' | 'NEW';
  amount: string;
  comment: string;
}

export type GuruCategory = 'ALL' | 'TW_LOCAL' | 'GLOBAL_LEGEND' | 'GROWTH_TECH' | 'VALUE_DIVIDEND';

export interface GuruProfile {
  id: string;
  name: string;
  badge: string;
  avatar: string;
  title: string;
  category?: GuruCategory;
  tags?: string[];
  styleDescription: string;
  aum: string;
  lastUpdated: string;
  philosophy: string[];
  keyInsight: string;
  famousQuote: string;
  topHoldings: GuruHolding[];
  recentActivities: GuruActivity[];
}

export interface MarketAlert {
  id: string;
  symbol: string;
  stockName: string;
  type: 'PRICE_BREAKOUT' | 'PRICE_BREAKDOWN' | 'STRATEGY_SIGNAL' | 'GURU_ACTION' | 'VOLATILITY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  suggestedAction: string;
  timestamp: string;
  isRead: boolean;
}

export interface MarketOverviewData {
  twIndex: number;
  twChange: number;
  twChangePercent: number;
  twOtcIndex: number;
  twOtcChange: number;
  twOtcChangePercent: number;
  usSp500: number;
  usSp500Change: number;
  usSp500ChangePercent: number;
  usNasdaq: number;
  usNasdaqChange: number;
  usNasdaqChangePercent: number;
  usPhlxSemi: number;
  usPhlxSemiChange: number;
  usPhlxSemiChangePercent: number;
  us10yYield: number;
  usdTwd: number;
  institutionalFlow: {
    foreign: string;
    trust: string;
    dealer: string;
  };
  fearGreedScore: number; // 0-100 (0=Extreme Fear, 100=Extreme Greed)
  fearGreedLabel: string;
  marketMood: '多頭強勢' | '高檔震盪' | '中立盤整' | '回檔修正' | '空頭防守';
  summary: string;
  bullishFactors: string[];
  bearishFactors: string[];
  actionAdvice: string;
}
