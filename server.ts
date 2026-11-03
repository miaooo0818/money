import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Daily Market Analysis Endpoint
app.post('/api/gemini/market-analysis', async (req, res) => {
  const { market = 'TW_US' } = req.body;

  if (!ai) {
    return res.json({
      fallback: true,
      summary: "今日全球市場聚焦半導體供應鏈營收與通膨經濟指標。台股大盤在月線之上呈現強勢整理，美股標普500指數與那斯達克維持多頭震盪格局。建議非專業投資人採取『分批定額、逢拉回支撐點建立部位』之策略，切忌追高。",
      bullishFactors: ["AI晶片與伺服器終端需求強勁", "外資期貨空單顯著減碼", "美債殖利率維持平穩區間"],
      bearishFactors: ["短期融資餘額處於相對高檔", "地緣政治變數帶來潛在震盪"],
      actionPlan: "長線存股者持續累積核心高股息與市值型ETF；波段投資人以10日均線為防守支撐，破線嚴守紀律分批減碼。"
    });
  }

  try {
    const prompt = `你是一位親切、客觀且專業的資深投資顧問，專門為「非專業投資人」解讀股市。
當前市場關注：${market === 'TW' ? '台灣股市 (加權指數/櫃買/權值ETF)' : market === 'US' ? '美國股市 (美股四大指數/大型科技龍頭)' : '台股與美股主流市場'}。
請分析當前最新的股市情勢，用淺顯易懂、直觀的繁體中文提供：
1. 一段100字以內的每日總結（情勢溫度感）。
2. 3個主要利多支撐因素。
3. 2個主要潛在風險或利空考量。
4. 給一般上班族投資人的今日行動指引（清楚的買賣思維）。

請以 JSON 格式回應，格式如下：
{
  "summary": "...",
  "bullishFactors": ["...", "...", "..."],
  "bearishFactors": ["...", "..."],
  "actionPlan": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ fallback: false, ...parsed });
  } catch (error: any) {
    console.error('Gemini market analysis error:', error?.message);
    return res.status(200).json({
      fallback: true,
      error: error?.message,
      summary: "今日盤勢維持箱型整理，科技權值股扮演中流砥柱。大盤短中期均線向上發散，但短線乖離率略高，建議逢震盪拉回再逢低分批布局，不宜急追高。",
      bullishFactors: ["半導體產能利用率持續攀升", "全球AI基礎建設資本支出年增擴大", "主流ETF持續迎來被動買盤推升"],
      bearishFactors: ["近期美債殖利率與匯率波動放大", "短線獲利了結賣壓可能引發洗盤"],
      actionPlan: "守穩重要均線（如月線）個股續抱；若已達目標獲利區間，可考慮先入袋部分利潤降底成本。"
    });
  }
});

// 2. Individual Stock / ETF Deep AI Diagnosis & Buy/Sell Logic
app.post('/api/gemini/stock-diagnosis', async (req, res) => {
  const { symbol, name, price, change, peRatio, yieldRate, maStatus, rsi, kd } = req.body;

  if (!ai) {
    const isBullish = (change >= 0);
    return res.json({
      fallback: true,
      signal: isBullish ? "逢低分批買進" : "支撐區觀望待變",
      confidence: 85,
      entryRange: `${(price * 0.97).toFixed(1)} ~ ${(price * 0.995).toFixed(1)}`,
      stopLoss: `${(price * 0.94).toFixed(1)}`,
      targetPrice: `${(price * 1.12).toFixed(1)}`,
      reasoning: `${name} (${symbol}) 營運基本面維持穩健，目前股價在均線關鍵區間。本益比約為 ${peRatio || 18} 倍，估值位在歷史合理區間中緣。技術面 KD 值為 ${kd || 52}，短線無過熱現象，適合採取智能分批逢低進場。`,
      riskWarning: "若大盤出現系統性重挫跌破防守止損價，請嚴守資金管理紀律停損或換股。"
    });
  }

  try {
    const prompt = `你是一位為一般上班族與散戶設計的「AI 智能交易輔助引擎」。
請針對標的提供精確的買賣點建議與白話文診斷：
標的：${name} (${symbol})
當前股價：${price}
今日漲跌幅：${change}%
本益比 (PE)：${peRatio || 'N/A'}
殖利率：${yieldRate || 'N/A'}%
均線形態：${maStatus || '站穩月線與季線'}
RSI (14)：${rsi || 55}
KD (9,3,3)：${kd || 58}

請產出客觀、結構化的買賣點建議。
請以 JSON 格式回應，格式如下：
{
  "signal": "強烈買進" | "逢低分批買進" | "區間續抱觀望" | "逢高調節停利" | "跌破支撐止損",
  "confidence": 88 (數字0-100),
  "entryRange": "建議最佳切入區間，例如 980 ~ 1005",
  "stopLoss": "建議防守停損價位，例如 945",
  "targetPrice": "建議波段目標停利價，例如 1150",
  "reasoning": "用150字以內淺白說明：為何給出此買賣點？結合價值基本面（如殖利率/本益比）與動能技術面（如均線KD支撐）。",
  "riskWarning": "50字以內的一句關鍵風險提示。"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);
    return res.json({ fallback: false, ...parsed });
  } catch (error: any) {
    console.error('Gemini stock diagnosis error:', error?.message);
    return res.json({
      fallback: true,
      signal: "逢低分批買進",
      confidence: 82,
      entryRange: `${(price * 0.97).toFixed(1)} ~ ${(price * 0.99).toFixed(1)}`,
      stopLoss: `${(price * 0.94).toFixed(1)}`,
      targetPrice: `${(price * 1.11).toFixed(1)}`,
      reasoning: `${name} 基本面具備產業領先地位與穩健獲利體質。現階段股價於關鍵均線獲支撐，配合當前估值，適合採用分批逢回買進策略。`,
      riskWarning: "注意大盤整體成交量能是否萎縮，若破關鍵支撐建議減碼防守。"
    });
  }
});

// 3. News Sentiment Analysis Endpoint
app.post('/api/gemini/news-sentiment', async (req, res) => {
  const { newsHeadlines = [], symbol, name } = req.body;

  if (!ai || !newsHeadlines.length) {
    return res.json({
      fallback: true,
      overallSentiment: "中性偏多",
      sentimentScore: 72,
      analysis: `${name || '精選標的'} 近期產業新聞多數環繞在訂單出貨與資本支出擴增，供應鏈展望樂觀，整體輿情為股價提供良好支撐。`,
      keyTakeaways: [
        "主要客戶拉貨動能持穩，先進製程產能滿載",
        "國際外資機構近期報告評等維持正向",
        "留意短期原物料供應或匯率變動對毛利的些微影響"
      ]
    });
  }

  try {
    const prompt = `請分析以下關於「${name} (${symbol})」的即時新聞與訊息，評估其對股價的情緒衝擊，用一般人看得懂的語言解釋：
新聞清單：
${newsHeadlines.map((h: string, i: number) => `${i + 1}. ${h}`).join('\n')}

請以 JSON 格式回應，格式如下：
{
  "overallSentiment": "極度樂觀" | "中性偏多" | "中立觀望" | "中性偏空" | "利空警示",
  "sentimentScore": 75 (數字 -100 到 +100，正數利多，負數利空),
  "analysis": "100字以內的新聞情緒精簡解析",
  "keyTakeaways": ["關鍵摘要1", "關鍵摘要2", "關鍵摘要3"]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ fallback: false, ...parsed });
  } catch (error: any) {
    console.error('Gemini news sentiment error:', error?.message);
    return res.json({
      fallback: true,
      overallSentiment: "中性偏多",
      sentimentScore: 68,
      analysis: "新聞情緒整體正向，市場關注焦點在於新產品發布與營運成長動能，短線無重大突發利空。",
      keyTakeaways: [
        "營收表現符合甚至略優於法人預期",
        "產業景氣循環處於回溫階段",
        "法人籌碼維持淨買超格局"
      ]
    });
  }
});

// 4. Portfolio AI Health Review & Rebalance Advice
app.post('/api/gemini/portfolio-review', async (req, res) => {
  const { holdings = [], totalValue, totalUnrealizedPnL, pnlPercent } = req.body;

  if (!ai || !holdings.length) {
    return res.json({
      fallback: true,
      healthScore: 88,
      riskLevel: "中等風險 (均衡型)",
      evaluation: "目前投資組合資產配置兼顧成長與收益，核心部位集中在主流權值與高股息ETF，具備良好的防禦抗震力。",
      suggestions: [
        "單一科技類股佔比若超過 40%，建議適度分批將部分獲利轉進大盤指數或債券型ETF",
        "目前整體未實現報酬維持穩健，可維持『月線支撐分批低接、觸及預設停利點收回本金』之節奏",
        "持續保留 15%~20% 現金儲備，以因應突發性市場回檔的加碼機會"
      ]
    });
  }

  try {
    const holdingsSummary = holdings.map((h: any) =>
      `${h.name}(${h.symbol}): 佔比約 ${h.weight}%, 損益 ${h.pnlPercent}%`
    ).join('\n');

    const prompt = `你是一位為個人投資者進行資產配置健檢的 AI 顧問。
投資組合總資產：${totalValue} 元
目前未實現損益：${totalUnrealizedPnL} 元 (${pnlPercent}%)
持倉明細：
${holdingsSummary}

請針對非專業投資人，以通俗、易懂的繁體中文提供健康度評估與調整建議：
請以 JSON 格式回應，格式如下：
{
  "healthScore": 85 (整數 0-100),
  "riskLevel": "穩健防禦型" | "均衡穩健型" | "積極成長型" | "高度集中風險",
  "evaluation": "一段100字評估，說明這份組合的優勢與隱憂",
  "suggestions": [
    "具體建議1",
    "具體建議2",
    "具體建議3"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ fallback: false, ...parsed });
  } catch (error: any) {
    console.error('Gemini portfolio review error:', error?.message);
    return res.json({
      fallback: true,
      healthScore: 82,
      riskLevel: "均衡型投資組合",
      evaluation: "資產配置具備一定分散度，兼顧資本利得與股息現金流。目前主要部位處於獲利狀態，整體結構健康。",
      suggestions: [
        "定期檢視單一產業或個股佔比，避免單一持股超過 35%",
        "獲利超過 20% 的個股可執行移動停利，保護已有戰果",
        "維持定期定額紀律，不必過度頻繁預測短線高低點"
      ]
    });
  }
});

// 5. Custom Guru / Celebrity Investor Lookup & Profile Generator
app.post('/api/gemini/guru-lookup', async (req, res) => {
  const { query } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "請提供想查詢的投資大師或名人名稱" });
  }

  const cleanQuery = query.trim();

  if (!ai) {
    return res.json({
      fallback: true,
      profile: {
        id: `custom_${Date.now()}`,
        name: cleanQuery,
        badge: "AI 智能解析大師",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        title: `${cleanQuery} · 知名投資人 / 基金經理`,
        category: "TW_LOCAL",
        tags: ["AI解析", "實戰配置", "產業選股"],
        styleDescription: `專注於 ${cleanQuery} 的經典投資哲學與代表性持倉策略，重視風險收益比與長期複利成長。`,
        aum: "機構或私人高額管理部位",
        lastUpdated: "AI 即時研判分析",
        philosophy: [
          "嚴守投資紀律與資金控管，避免單一曝險過高。",
          "挑選具有長遠成長動力與防禦護城河之龍頭標的。",
          "耐心等候市場出現便宜合理買點，分批長線持有。"
        ],
        keyInsight: `「投資最重要的是清楚知道自己在買什麼，跟隨客觀產業事實，不隨市場恐慌隨波逐流。」`,
        famousQuote: "「投資不是看你懂得多少，而是看你堅守了什麼。」",
        topHoldings: [
          {
            symbol: "2330",
            name: "台積電 TSMC",
            market: "TW",
            weight: 25.0,
            sharesHeld: "核心重押龍頭",
            quarterChange: 3.0,
            rationale: "全球先進製程與AI晶片代工霸主，護城河深厚。"
          },
          {
            symbol: "006208",
            name: "富邦台灣采吉50",
            market: "TW",
            weight: 20.0,
            sharesHeld: "核心市值配置",
            quarterChange: 2.0,
            rationale: "低經理費貼近大盤長期成長紅利。"
          },
          {
            symbol: "NVDA",
            name: "輝達 NVIDIA",
            market: "US",
            weight: 20.0,
            sharesHeld: "AI算力核心",
            quarterChange: 5.0,
            rationale: "全球算力架構壟斷者，Blackwell需求強烈。"
          },
          {
            symbol: "00878",
            name: "國泰永續高股息",
            market: "TW",
            weight: 15.0,
            sharesHeld: "防禦現金流",
            quarterChange: 0.0,
            rationale: "平準金穩定配發高股息，提供再投資動能。"
          }
        ],
        recentActivities: [
          {
            date: "2024-10-25",
            symbol: "2330",
            action: "BUY",
            amount: "分批逢回加碼",
            comment: "看好先進製程滿載動能，回測月線建立長期部位。"
          }
        ]
      }
    });
  }

  try {
    const prompt = `你是一位精通全球與台灣金融股市的專業分析師。
使用者想查詢並追蹤投資名人/大師/經理人：「${cleanQuery}」。
請根據其公開言論、Podcast節目、13F報告或經典書籍觀點，用繁體中文生成其投資檔案與代表性持股組合：
包含：
1. 姓名、頭銜、代表投資風格簡介。
2. 3條核心投資心法。
3. 一段100字的大師核心觀點金句 (keyInsight) 與代表名言。
4. 4~5檔代表性或偏好的核心持股清單（每檔需包含 symbol, name, market ['TW'|'US'], weight 權重整數百分比使得總和為100%, quarterChange 異動百分比, rationale 持股理由）。
5. 1~2條近期的操作動態與點評 (action: 'BUY'|'SELL'|'HOLD', amount, comment, date)。

請以 JSON 格式回應，格式如下：
{
  "name": "${cleanQuery}",
  "badge": "名人/經理人標籤 (例如：避險基金巨頭 / 台灣實戰KOL)",
  "title": "頭銜稱號",
  "category": "TW_LOCAL" | "GLOBAL_LEGEND" | "GROWTH_TECH" | "VALUE_DIVIDEND",
  "tags": ["標籤1", "標籤2", "標籤3"],
  "styleDescription": "一段50字說明其主要投資風格與核心邏輯",
  "aum": "管理規模或資產水位",
  "philosophy": [
    "心法1",
    "心法2",
    "心法3"
  ],
  "keyInsight": "大師目前的核心觀點與對市場的最新建議",
  "famousQuote": "大師最具代表性的一句名言",
  "topHoldings": [
    {
      "symbol": "例如 2330 或 NVDA",
      "name": "公司名稱",
      "market": "TW" 或 "US",
      "weight": 25,
      "sharesHeld": "例如 核心重押部位",
      "quarterChange": 3.5,
      "rationale": "入選該股的原因與邏輯"
    }
  ],
  "recentActivities": [
    {
      "date": "2024-10-30",
      "symbol": "2330",
      "action": "BUY",
      "amount": "+5% 調升",
      "comment": "評語"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const profile = {
      id: `custom_${Date.now()}`,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      lastUpdated: "AI 即時解析生成",
      ...parsed,
    };

    return res.json({ fallback: false, profile });
  } catch (error: any) {
    console.error('Gemini guru lookup error:', error?.message);
    return res.status(200).json({
      fallback: true,
      profile: {
        id: `custom_${Date.now()}`,
        name: cleanQuery,
        badge: "AI 智能解析大師",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        title: `${cleanQuery} · 實戰投資人`,
        category: "TW_LOCAL",
        tags: ["AI解析", "實戰配置"],
        styleDescription: `專注於 ${cleanQuery} 的經典投資邏輯，重視資產配置與風險報酬比。`,
        aum: "私人實戰配置",
        lastUpdated: "AI 即時分析",
        philosophy: [
          "順應市場大勢，嚴控回撤風險。",
          "挑選獲利扎實、具備技術領先的優質企業。",
          "逢震盪拉回建立部位，長期持有享受複利。"
        ],
        keyInsight: `「保持獨立思考，不要被市場雜訊帶著走，聚焦長線價值。」`,
        famousQuote: "「市場永遠會給有準備的人最好的回報。」",
        topHoldings: [
          { symbol: "2330", name: "台積電 TSMC", market: "TW", weight: 30, sharesHeld: "第一核心", quarterChange: 2.0, rationale: "全球半導體龍頭核心霸權" },
          { symbol: "NVDA", name: "輝達 NVIDIA", market: "US", weight: 25, sharesHeld: "AI算力主力", quarterChange: 5.0, rationale: "AI運算硬體壟斷性市佔" },
          { symbol: "006208", name: "富邦台50 ETF", market: "TW", weight: 25, sharesHeld: "市值大盤配置", quarterChange: 0.0, rationale: "低成本穩健享受整體經濟成長" },
          { symbol: "00878", name: "國泰永續高股息", market: "TW", weight: 20, sharesHeld: "防禦現金流", quarterChange: 3.0, rationale: "高息防禦與再投資" }
        ],
        recentActivities: [
          { date: "2024-10-25", symbol: "2330", action: "BUY", amount: "定期分批買進", comment: "長線營收無虞，逢回加碼" }
        ]
      }
    });
  }
});

// 6. Custom Stock / ETF Deep AI Analysis & Trade Signal Generator
app.post('/api/gemini/stock-lookup', async (req, res) => {
  const { query, market = 'TW' } = req.body;

  if (!query || !query.trim()) {
    return res.status(400).json({ error: "請提供想查詢的股票代碼或名稱" });
  }

  const cleanQuery = query.trim().toUpperCase();

  // Helper to generate 24 points of history
  const generatePoints = (basePrice: number) => {
    const dates = [
      '10/01', '10/02', '10/03', '10/04', '10/07', '10/08', '10/09', '10/11',
      '10/14', '10/15', '10/16', '10/17', '10/18', '10/21', '10/22', '10/23',
      '10/24', '10/25', '10/28', '10/29', '10/30', '10/31', '11/01', '11/02'
    ];
    let cur = basePrice * 0.92;
    return dates.map((d, i) => {
      const isToday = i === dates.length - 1;
      cur = isToday ? basePrice : cur * (1 + (Math.random() - 0.48) * 0.02);
      return {
        date: d,
        price: Number(cur.toFixed(2)),
        open: Number((cur * 0.995).toFixed(2)),
        high: Number((cur * 1.01).toFixed(2)),
        low: Number((cur * 0.99).toFixed(2)),
        close: Number(cur.toFixed(2)),
        ma5: Number((cur * 0.998).toFixed(2)),
        ma20: Number((cur * 0.985).toFixed(2)),
        volume: Math.floor(15000 + Math.random() * 20000)
      };
    });
  };

  if (!ai) {
    const isTw = /^[0-9]+$/.test(cleanQuery) || market === 'TW';
    const estPrice = isTw ? 285.0 : 155.0;

    return res.json({
      fallback: true,
      stock: {
        symbol: cleanQuery,
        name: `${cleanQuery} (自訂查詢標的)`,
        market: isTw ? 'TW' : 'US',
        type: 'STOCK',
        sector: isTw ? '台灣上市主流產業' : '美國科技與消費龍頭',
        price: estPrice,
        previousClose: estPrice * 0.99,
        change: Number((estPrice * 0.01).toFixed(2)),
        changePercent: 1.01,
        volume: isTw ? '24,500 張' : '18.4M',
        high52w: Number((estPrice * 1.25).toFixed(1)),
        low52w: Number((estPrice * 0.75).toFixed(1)),
        peRatio: 18.5,
        pbRatio: 2.8,
        yieldRate: 3.8,
        eps: 12.5,
        marketCap: isTw ? '6,800 億 TWD' : '1,800 億 USD',
        beta: 1.15,
        maStatus: '站穩月線，呈多頭震盪整理',
        rsi: 58,
        kd: 64,
        bollingerStatus: '位於布林中軌上方',
        valuationStatus: 'REASONABLE',
        signal: 'DCA_BUY',
        signalConfidence: 86,
        entryLow: Number((estPrice * 0.96).toFixed(1)),
        entryHigh: Number((estPrice * 0.99).toFixed(1)),
        stopLoss: Number((estPrice * 0.92).toFixed(1)),
        targetPrice: Number((estPrice * 1.15).toFixed(1)),
        signalReason: `${cleanQuery} 營運維持平穩增長，估值位在歷史合理中間水準。技術指標守穩短期均線，適合採取逢回分批建立長線投資部位。`,
        priceHistory: generatePoints(estPrice),
        financials: [
          { quarter: '2024 Q3', revenue: 48500, revenueGrowth: 18.5, grossMargin: 42.0, netMargin: 18.5, roe: 19.2, freeCashFlow: 12400, debtRatio: 32.5 },
          { quarter: '2024 Q2', revenue: 44200, revenueGrowth: 15.0, grossMargin: 41.5, netMargin: 17.8, roe: 18.4, freeCashFlow: 11200, debtRatio: 33.1 }
        ],
        news: [
          { id: 'n_gen1', title: `${cleanQuery} 季報營收表現持穩，法人重申正向投資評等`, source: '工商時報', time: '3小時前', sentiment: 'BULLISH', impactScore: 82, summary: '主力產品出貨暢旺，毛利結構符合預期。' },
          { id: 'n_gen2', title: `分析師展望：下半年新產能陸續開出，有助進一步擴大市佔率`, source: '經濟日報', time: '1天前', sentiment: 'BULLISH', impactScore: 78, summary: '終端需求維持擴張格局。' }
        ]
      }
    });
  }

  try {
    const prompt = `你是一位專業的證券分析系統。
使用者想查詢並分析股票或ETF：「${cleanQuery}」（市場預設偏好：${market}）。
請根據真實金融大數據，生成該檔標的完整的即時分析檔案、估值指標、買賣點建議、4季財報與即時新聞：
包含：
1. symbol (標準代碼如 2382, 2881, 00929, AMD, GOOGL, META, ARM, PLTR), name (公司或ETF中文名稱)
2. market ('TW' 或 'US'), type ('STOCK' 或 'ETF'), sector (產業分類)
3. 當前合理股價 price, 今日漲跌 change, changePercent, 成交量 volume
4. 估值：peRatio (若為ETF可填 null), pbRatio, yieldRate (殖利率%), eps (每股盈餘), marketCap, beta
5. 技術面：maStatus (均線形態), rsi (整數 0-100), kd (整數 0-100), bollingerStatus, valuationStatus ('CHEAP'|'REASONABLE'|'EXPENSIVE')
6. 智能買賣點：signal ('STRONG_BUY'|'DCA_BUY'|'HOLD'|'TAKE_PROFIT'|'STOP_LOSS'), signalConfidence (0-100), entryLow (建議買進下緣), entryHigh (建議買進上緣), stopLoss (防守停損價), targetPrice (波段停利目標價), signalReason (100字白話解析)
7. 最近4季財報 (financials 陣列：quarter, revenue, revenueGrowth, grossMargin, netMargin, roe, freeCashFlow, debtRatio)
8. 2~3則即時重要新聞 (news 陣列：id, title, source, time, sentiment ['BULLISH'|'NEUTRAL'|'BEARISH'], impactScore, summary)

請以 JSON 格式回應，格式如下：
{
  "symbol": "${cleanQuery}",
  "name": "公司完整中文名稱",
  "market": "TW" 或 "US",
  "type": "STOCK" 或 "ETF",
  "sector": "產業名稱",
  "price": 280.0,
  "previousClose": 276.0,
  "change": 4.0,
  "changePercent": 1.45,
  "volume": "32,000 張",
  "high52w": 320.0,
  "low52w": 180.0,
  "peRatio": 16.5,
  "pbRatio": 3.2,
  "yieldRate": 4.2,
  "eps": 16.8,
  "marketCap": "1.1 兆 TWD",
  "beta": 1.15,
  "maStatus": "均線多頭發散",
  "rsi": 62,
  "kd": 68,
  "bollingerStatus": "中軌上方運行",
  "valuationStatus": "REASONABLE",
  "signal": "DCA_BUY",
  "signalConfidence": 88,
  "entryLow": 270.0,
  "entryHigh": 278.0,
  "stopLoss": 255.0,
  "targetPrice": 315.0,
  "signalReason": "基本面扎實，估值具備安全邊際...",
  "financials": [
    { "quarter": "2024 Q3", "revenue": 120000, "revenueGrowth": 22.5, "grossMargin": 42.0, "netMargin": 18.0, "roe": 21.0, "freeCashFlow": 28000, "debtRatio": 35.0 }
  ],
  "news": [
    { "id": "n1", "title": "新聞標題", "source": "財經媒體", "time": "2小時前", "sentiment": "BULLISH", "impactScore": 85, "summary": "新聞摘要" }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const baseP = parsed.price || 100;
    const fullStock = {
      ...parsed,
      priceHistory: generatePoints(baseP),
    };

    return res.json({ fallback: false, stock: fullStock });
  } catch (error: any) {
    console.error('Gemini stock lookup error:', error?.message);
    const isTw = /^[0-9]+$/.test(cleanQuery) || market === 'TW';
    const estPrice = isTw ? 285.0 : 155.0;

    return res.status(200).json({
      fallback: true,
      stock: {
        symbol: cleanQuery,
        name: `${cleanQuery} (自訂標的)`,
        market: isTw ? 'TW' : 'US',
        type: 'STOCK',
        sector: '科技與電子製造',
        price: estPrice,
        previousClose: estPrice * 0.99,
        change: Number((estPrice * 0.01).toFixed(2)),
        changePercent: 1.01,
        volume: isTw ? '18,500 張' : '15.2M',
        high52w: Number((estPrice * 1.2).toFixed(1)),
        low52w: Number((estPrice * 0.8).toFixed(1)),
        peRatio: 18.0,
        pbRatio: 2.5,
        yieldRate: 3.5,
        eps: 12.0,
        marketCap: isTw ? '5,000 億 TWD' : '1,200 億 USD',
        beta: 1.1,
        maStatus: '均線呈現多頭排列',
        rsi: 55,
        kd: 60,
        bollingerStatus: '中軌附近溫和震盪',
        valuationStatus: 'REASONABLE',
        signal: 'DCA_BUY',
        signalConfidence: 85,
        entryLow: Number((estPrice * 0.96).toFixed(1)),
        entryHigh: Number((estPrice * 0.99).toFixed(1)),
        stopLoss: Number((estPrice * 0.92).toFixed(1)),
        targetPrice: Number((estPrice * 1.12).toFixed(1)),
        signalReason: `${cleanQuery} 營運獲利穩健，估值位在合理區間，短線可逢回測均線支撐分批承接。`,
        priceHistory: generatePoints(estPrice),
        financials: [
          { quarter: '2024 Q3', revenue: 38000, revenueGrowth: 15.0, grossMargin: 35.0, netMargin: 15.0, roe: 18.0, freeCashFlow: 8500, debtRatio: 30.0 }
        ],
        news: [
          { id: 'n1', title: `${cleanQuery} 最新財報展望樂觀，持續布局高毛利新業務`, source: '經濟日報', time: '4小時前', sentiment: 'BULLISH', impactScore: 78, summary: '外資研究報告重申持穩評等。' }
        ]
      }
    });
  }
});


async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Server running on port ${port} in ${isDev ? 'development' : 'production'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
