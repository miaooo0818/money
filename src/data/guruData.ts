import { GuruProfile } from '../types/stock';

export const GURU_PROFILES: GuruProfile[] = [
  {
    id: 'gooaye',
    name: '股癌 Gooaye (謝孟恭)',
    badge: '台灣頂級投資實戰 KOL · 特選推薦',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: '全職投資人 · Podcast《股癌》主理人',
    category: 'TW_LOCAL',
    tags: ['科技半導體', 'AI算力供應鏈', '波段動能', 'ASIC客製晶片', '實戰交易'],
    styleDescription: '趨勢動能與產業基本面雙軌操作，專注科技半導體/AI先進封裝/客製晶片(ASIC)，重押核心但嚴格風控部位。',
    aum: '個人實戰數億部位',
    lastUpdated: '本週最新節目動向觀點 (2024.11)',
    philosophy: [
      '尊重市場客觀事實，千萬不要跟趨勢做對。',
      '抓緊全球產業大趨勢（AI、伺服器供應鏈、先進封裝），重押核心，但隨市場風向動態調節。',
      '不用猜最低點，下跌的時候有紀律分批建立部位，等大盤醒來時你已經在車上。',
      '買股票絕不能談戀愛，看錯破線就砍，看對抱緊讓利潤奔馳。'
    ],
    keyInsight: '「目前 AI 伺服器與 ASIC 的長線大趨勢依舊很健康。大家不要看到短線震盪就自己嚇自己，拉回月線季線反而提供舒服的右側/分批左側買點。但持股成數建議保留15~20%現金彈性，才不會在波動時被震出場。」',
    famousQuote: '「市場永遠是對的，錯的只有你的持股水位與心理帳戶。」',
    topHoldings: [
      {
        symbol: 'NVDA',
        name: '輝達 NVIDIA',
        market: 'US',
        weight: 24.5,
        sharesHeld: '核心重押部位',
        quarterChange: 4.8,
        rationale: '算力基礎設施軍備競賽剛過半場，Blackwell與後續晶片供不應求，產業護城河極深。'
      },
      {
        symbol: '2330',
        name: '台積電 TSMC',
        market: 'TW',
        weight: 22.0,
        sharesHeld: '台股第一核心',
        quarterChange: 2.5,
        rationale: '全宇宙AI晶片的代工命脈，先進封裝產能持續倍增，定價能力極高。'
      },
      {
        symbol: '2454',
        name: '聯發科 MediaTek',
        market: 'TW',
        weight: 14.5,
        sharesHeld: '衛星波段部位',
        quarterChange: 8.2,
        rationale: '旗艦天璣晶片市佔率擴大，加上與大廠合作的客製化晶片 (ASIC) 長期增長空間可觀。'
      },
      {
        symbol: 'MSFT',
        name: '微軟 Microsoft',
        market: 'US',
        weight: 12.0,
        sharesHeld: '美股長線壓艙',
        quarterChange: -1.2,
        rationale: '企業級AI Copilot落地速度最快，Azure雲端服務具備穩固的企業護城河。'
      },
      {
        symbol: '006208',
        name: '富邦台灣采吉50',
        market: 'TW',
        weight: 10.0,
        sharesHeld: '被動被動基底',
        quarterChange: 0.0,
        rationale: '經理費便宜，作為防禦與被動享受台灣經濟紅利的打底工具。'
      }
    ],
    recentActivities: [
      {
        date: '2024-11-01',
        symbol: '2454',
        action: 'BUY',
        amount: '+8% 調增權重',
        comment: '看好旗艦晶片出貨超越預期，且估值處於同業偏低水準，逢拉回加碼。'
      },
      {
        date: '2024-10-24',
        symbol: 'NVDA',
        action: 'HOLD',
        amount: '續抱不追高',
        comment: '短期乖離率偏大，不建議在歷史高點大筆單筆追，已有部位續抱等拉回。'
      },
      {
        date: '2024-10-15',
        symbol: 'TSLA',
        action: 'SELL',
        amount: '-15% 減碼停利',
        comment: '發表會後缺乏立即可見的獲利數據，逢高獲利了結部分部位轉進確定性更高的晶片鏈。'
      }
    ]
  },
  {
    id: 'buffett',
    name: '華倫·巴菲特 (Warren Buffett)',
    badge: '波克夏·海瑟威 (Berkshire Hathaway) 13F',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: '波克夏海瑟威董事長 · 奧馬哈先知',
    category: 'GLOBAL_LEGEND',
    tags: ['護城河', '價值投資', '高ROE', '自由現金流', '百年長青'],
    styleDescription: '終極價值投資：尋找具有深厚護城河、優秀管理層與強大自由現金流的偉大企業，在價格合理時買進並長期持有。',
    aum: '美金約 3,100 億 (最新 13F)',
    lastUpdated: 'SEC 13F 季度申報',
    philosophy: [
      '在別人貪婪時恐懼，在別人恐懼時貪婪。',
      '如果你不打算持有一檔股票十年，那麼連十分鐘都不要持有它。',
      '時間是優秀企業的朋友，平庸企業的敵人。',
      '投資的第一條法則是不要虧錢，第二條法則是永遠記住第一條。'
    ],
    keyInsight: '「目前波克夏累積了創紀錄的 3,000 億美元現金儲備，並非看壞美國前景，而是等待更具安全邊際的揮棒機會。一般大眾定期定額標普500 (VOO) 就是最聰明的致富法。」',
    famousQuote: '「退潮的時候，你才知道誰在裸泳。」',
    topHoldings: [
      {
        symbol: 'AAPL',
        name: '蘋果 Apple Inc',
        market: 'US',
        weight: 30.5,
        sharesHeld: '約 3 億股',
        quarterChange: -15.0,
        rationale: '消費生態系極致護城河，近兩季適度調節獲利轉入現金儲備降稅。'
      },
      {
        symbol: 'AXP',
        name: '美國運通 American Express',
        market: 'US',
        weight: 12.8,
        sharesHeld: '約 1.5 億股',
        quarterChange: 0.0,
        rationale: '高端信用卡客群消費力強勁，品牌護城河屹立不搖。'
      },
      {
        symbol: 'BAC',
        name: '美國銀行 Bank of America',
        market: 'US',
        weight: 10.5,
        sharesHeld: '約 7.8 億股',
        quarterChange: -8.5,
        rationale: '美國核心商業銀行，適度分批調節回收本金。'
      },
      {
        symbol: 'KO',
        name: '可口可樂 Coca-Cola',
        market: 'US',
        weight: 9.2,
        sharesHeld: '4 億股 (持股數十年不變)',
        quarterChange: 0.0,
        rationale: '抗通膨的超級現金乳牛，每年帶來龐大股息分紅。'
      },
      {
        symbol: 'CVX',
        name: '雪佛龍 Chevron',
        market: 'US',
        weight: 6.5,
        sharesHeld: '約 1.1 億股',
        quarterChange: 1.5,
        rationale: '能源基本面穩健，高自由現金流與庫藏股回購。'
      }
    ],
    recentActivities: [
      {
        date: '2024-10-20',
        symbol: 'AAPL',
        action: 'SELL',
        amount: '小幅減碼',
        comment: '因應未來資本利得稅可能調整，並趁高檔回籠巨額現金儲備。'
      },
      {
        date: '2024-09-15',
        symbol: 'OXY',
        action: 'BUY',
        amount: '+3.2%',
        comment: '持續增持西方石油普通股與優先股，鞏固能源戰略佈局。'
      }
    ]
  },
  {
    id: 'guyufish',
    name: '股魚 (顧倫)',
    badge: '台灣不看盤投資大師 · ETF領航者',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    title: '知名財經專欄作家 · 前科技半導體研發主管',
    category: 'TW_LOCAL',
    tags: ['不看盤投資', '科技半導體', 'ETF配速配置', '台積電供應鏈', '低波動高殖利率'],
    styleDescription: '結合工程師科技產業洞察與財務分析，推廣「不看盤投資法」，以大市值半導體龍頭搭配高殖利率 ETF 打造穩贏防線。',
    aum: '個人長期資產配置逾億元',
    lastUpdated: '2024 10月最新專欄持倉策略',
    philosophy: [
      '不看盤才是最輕鬆且報酬率最高的生活方式。',
      '挑對好公司與優質ETF，讓專業團隊幫你打工，把時間留給家人。',
      '存股要看公司的「賺錢本質」而不是每天股價的幾毛幾分跳動。'
    ],
    keyInsight: '「投資台股最核心的護城河就是台積電與其周邊關鍵設備材料鏈。加上 006208 與 00878 的攻守搭配，左手賺資本利得，右手領現金股息，不用每天盯著綠角紅角神經衰弱。」',
    famousQuote: '「投資就像種果樹，給它養分跟時間，不要天天拔起來看根長了沒有。」',
    topHoldings: [
      {
        symbol: '2330',
        name: '台積電 TSMC',
        market: 'TW',
        weight: 28.0,
        sharesHeld: '長線長抱部位',
        quarterChange: 3.0,
        rationale: '台灣經濟命脈，先進製程不可或缺，長期價值隨AI浪潮翻倍。'
      },
      {
        symbol: '006208',
        name: '富邦台灣采吉50',
        market: 'TW',
        weight: 25.0,
        sharesHeld: '市值型核心',
        quarterChange: 5.0,
        rationale: '低經理費享有前50大成長紅利，定時定額不看盤代表。'
      },
      {
        symbol: '00878',
        name: '國泰永續高股息',
        market: 'TW',
        weight: 22.0,
        sharesHeld: '防禦現金流',
        quarterChange: 2.0,
        rationale: '成份股防禦性極高，提供穩健息收供股息再投入。'
      },
      {
        symbol: '2454',
        name: '聯發科 MediaTek',
        market: 'TW',
        weight: 15.0,
        sharesHeld: 'IC旗艦雙箭頭',
        quarterChange: 4.5,
        rationale: '高通最強勁對手，手機與邊緣運算雙核心推進。'
      }
    ],
    recentActivities: [
      {
        date: '2024-10-28',
        symbol: '006208',
        action: 'BUY',
        amount: '定期定額持續扣款',
        comment: '維持紀律扣款，利用市場洗盤累積更多便宜單位數。'
      }
    ]
  },
  {
    id: 'laoniu',
    name: '股海老牛',
    badge: '抱緊處理存股達人 · 高殖利率選股',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    title: '暢銷理財作家 · 價值抱緊派創辦人',
    category: 'TW_LOCAL',
    tags: ['抱緊處理', '高殖利率7%', '步步為營', '金融金控', '穩健存股'],
    styleDescription: '獨創「抱緊處理」哲學：挑選高殖利率、獲利穩定步步高的好公司，在低估值時買進抱緊，享受股利股價雙賺。',
    aum: '個人百張存股實績',
    lastUpdated: '2024 第三季存股體檢',
    philosophy: [
      '抱：挑到好公司就要有抱緊的決心，不被震盪嚇跑。',
      '緊：掌握買進與加碼節奏，逢利空拉回才是黃金買點。',
      '處：處變不驚，了解公司營運本質，不受市場情緒干擾。',
      '理：理好財務與持股配置，確保生活無後顧之憂。'
    ],
    keyInsight: '「存股新手最怕貪快追高。記住：好股票越跌越要笑著買，殖利率突破 6%~7% 就是老天送禮物的時刻。」',
    famousQuote: '「抱緊享富，慢慢走，走得更長久。」',
    topHoldings: [
      {
        symbol: '00878',
        name: '國泰永續高股息',
        market: 'TW',
        weight: 30.0,
        sharesHeld: '高股息主力',
        quarterChange: 4.0,
        rationale: '抗跌平準金機制穩定，適合作為小資與退休族的現金流底層。'
      },
      {
        symbol: '0056',
        name: '元大高股息',
        market: 'TW',
        weight: 25.0,
        sharesHeld: '老牌存股標竿',
        quarterChange: 0.0,
        rationale: '成分股具高殖利率預測模型，歷史填息成功率高。'
      },
      {
        symbol: '2330',
        name: '台積電 TSMC',
        market: 'TW',
        weight: 20.0,
        sharesHeld: '台股世界第一',
        quarterChange: 2.0,
        rationale: '抱緊優質龍頭，獲利成長推升股利與股價雙重擴張。'
      },
      {
        symbol: '006208',
        name: '富邦台灣采吉50',
        market: 'TW',
        weight: 15.0,
        sharesHeld: '市值大盤配置',
        quarterChange: 3.0,
        rationale: '經理費低，跟隨台灣頂尖企業長線成長。'
      }
    ],
    recentActivities: [
      {
        date: '2024-10-22',
        symbol: '00878',
        action: 'BUY',
        amount: '+15張',
        comment: '第四季配息公告前後逢回布局，鎖定高年化殖利率。'
      }
    ]
  },
  {
    id: 'cathie_wood',
    name: '凱西·伍德 (Cathie Wood / 木頭姐)',
    badge: 'ARK Invest 方舟投資執行長',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: '女股神 · 顛覆式創新科技先鋒',
    category: 'GROWTH_TECH',
    tags: ['顛覆式創新', 'AI與機器人', '特斯拉FSD', '基因編輯', '高波動高成長'],
    styleDescription: '重押顛覆性創新技術（AI、電動車與無人自駕、基因組學、區塊鏈），追求指數級爆發潛力。',
    aum: '美金約 150 億 (ARK旗艦系列)',
    lastUpdated: 'ARK 每日交易即時揭露',
    philosophy: [
      '顛覆性創新是通縮力量，在傳統估值模型中通常被嚴重低估。',
      '聚焦未來 5 年技術趨勢，而不是看上一季的財務報表。',
      '市場恐慌拋售科技創新股時，就是歷史級別的最佳買點。'
    ],
    keyInsight: '「自動駕駛計程車 (Robotaxi) 與 AI 人形機器人將是人類有史以來最大的資本聚集機會。特斯拉絕不僅僅是一家車廠，而是全球最大的實體AI平台。」',
    famousQuote: '「我們投資的是未來，而不是過去。」',
    topHoldings: [
      {
        symbol: 'TSLA',
        name: '特斯拉 Tesla Inc',
        market: 'US',
        weight: 14.5,
        sharesHeld: '第一大旗艦持股',
        quarterChange: 6.5,
        rationale: 'FSD V13無人監管自動駕駛與Cybercab即將開啟千億級高毛利訂閱市場。'
      },
      {
        symbol: 'NVDA',
        name: '輝達 NVIDIA Corp',
        market: 'US',
        weight: 8.5,
        sharesHeld: 'AI基礎建設算力',
        quarterChange: -2.0,
        rationale: '適度高檔調節轉入軟體應用層，但仍看好算力長期支撐。'
      },
      {
        symbol: 'QQQ',
        name: '那斯達克100 ETF',
        market: 'US',
        weight: 12.0,
        sharesHeld: '科技權值指數',
        quarterChange: 1.5,
        rationale: '涵蓋全美頂尖科技創新領袖，提供廣泛科技成長曝險。'
      }
    ],
    recentActivities: [
      {
        date: '2024-10-26',
        symbol: 'TSLA',
        action: 'BUY',
        amount: '+12,000股',
        comment: '財報發布後逢短線震盪積極加碼，重申長期目標價 2,000 美元展望。'
      }
    ]
  },
  {
    id: 'dalio',
    name: '雷·達利歐 (Ray Dalio)',
    badge: '橋水基金 (Bridgewater Associates)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: '橋水基金創辦人 · 全天候投資法之父',
    category: 'GLOBAL_LEGEND',
    tags: ['全天候配置', '宏觀經濟週期', '風險平價', '抗通膨黃金', '全球多元化'],
    styleDescription: '宏觀經濟週期分析與多資產風險平價（Risk Parity），不押注單一市場，透過低相關性資產平抑最大回撤。',
    aum: '美金約 1,200 億',
    lastUpdated: 'SEC 13F 季度申報',
    philosophy: [
      '痛點加上反思，等於進步。',
      '擁有 15 個不相關的良好收益流，可以降低 80% 的風險而不減少收益。',
      '經濟就像一台機器，由信貸擴張與去槓桿的短長債務週期所驅動。'
    ],
    keyInsight: '「全球正處於大債務週期與地緣政治轉折點，投資人最致命的盲點是把全部身家押在同一種貨幣或單一資產。配置核心 ETF、黃金與新興市場是必修課。」',
    famousQuote: '「不要只看今天會發生什麼，要看歷史的長期規律。」',
    topHoldings: [
      {
        symbol: 'VOO',
        name: '標普500指數 ETF (IVV/VOO)',
        market: 'US',
        weight: 18.5,
        sharesHeld: '主要核心指數',
        quarterChange: 2.1,
        rationale: '美國核心生產力基準配置。'
      },
      {
        symbol: 'GLD',
        name: 'SPDR黃金ETF (Gold)',
        market: 'US',
        weight: 14.0,
        sharesHeld: '抗通膨黃金儲備',
        quarterChange: 5.5,
        rationale: '法定貨幣購買力貶值與地緣動盪時的終極保險。'
      },
      {
        symbol: 'AAPL',
        name: '蘋果 Apple Inc',
        market: 'US',
        weight: 8.5,
        sharesHeld: '科技現金流權值',
        quarterChange: 0.0,
        rationale: '全球消費生態系統核心。'
      }
    ],
    recentActivities: [
      {
        date: '2024-10-18',
        symbol: 'GLD',
        action: 'BUY',
        amount: '+5.5%',
        comment: '因應全球央行增持黃金儲備與降息預期，加碼抗震資產。'
      }
    ]
  },
  {
    id: 'chen_guru',
    name: '陳重銘 (不敗教主)',
    badge: '台灣存股名師 · 存股百張法則',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: '財經暢銷作家 · 前公立學校教師 (翻轉財務自由)',
    category: 'VALUE_DIVIDEND',
    tags: ['不敗存股', '高股息季季配', '股息再投入', '被動收入雪球', '小資存股'],
    styleDescription: '以高股息 ETF 與官股金控為核心，推廣「不敗存股法」——利用股息再投入產生複利滾雪球效果。',
    aum: '個人持有數千張 ETF 與金融股',
    lastUpdated: '2024 第三季存股專欄',
    philosophy: [
      '靠薪水不能致富，靠好股票幫你打工才能真正提早退休。',
      '存股就像種樹，剛開始很慢，但當股息可以買下新的股票時，雪球就會越滾越快。',
      '不用去猜大盤高低點，逢跌破年線更要勇敢買進。'
    ],
    keyInsight: '「許多人整天忙進忙出當沖，最後手續費付了一大堆還賠錢。挑選 00878、0056 或 00919 這種穩定季配息的好工具，把領到的股息持續買回，時間就會證明威力。」',
    famousQuote: '「存股最好的時間是十年前，其次是現在。」',
    topHoldings: [
      {
        symbol: '00878',
        name: '國泰永續高股息',
        market: 'TW',
        weight: 35.0,
        sharesHeld: '持股逾 500 張',
        quarterChange: 5.0,
        rationale: '平準金機制穩定，季配息現金流充足，適合退休現金流規劃。'
      },
      {
        symbol: '0056',
        name: '元大高股息',
        market: 'TW',
        weight: 25.0,
        sharesHeld: '持股逾 300 張',
        quarterChange: 2.0,
        rationale: '歷史最悠久的高股息ETF，連續配息填息紀錄優良。'
      },
      {
        symbol: '006208',
        name: '富邦台50 ETF',
        market: 'TW',
        weight: 20.0,
        sharesHeld: '核心市值成長',
        quarterChange: 3.5,
        rationale: '兼顧資本利得成長，跟隨台灣頂尖半導體龍頭一起前進。'
      }
    ],
    recentActivities: [
      {
        date: '2024-10-25',
        symbol: '00878',
        action: 'BUY',
        amount: '+20張',
        comment: '除息前後逢回量縮加碼，將前一季股息全數滾入再投資。'
      }
    ]
  },
  {
    id: 'michael_burry',
    name: '麥可·貝瑞 (Michael Burry)',
    badge: 'Scion 避險基金 · 《大賣空》傳奇',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'Scion Asset Management 創辦人',
    category: 'GLOBAL_LEGEND',
    tags: ['大賣空', '逆向深層價值', '泡沫預警', '週期尋底', '極致獨立思考'],
    styleDescription: '以嚴格的深層逆向價值（Deep Value）研究聞名，擅長在市場極度狂熱時保持清醒，並在極度悲觀崩盤時重押被錯殺標的。',
    aum: '美金約 2.5 億 (集中持倉)',
    lastUpdated: 'SEC 13F 季度更新',
    philosophy: [
      '所有偉大的投資機會都誕生在令人極度不適的孤獨之中。',
      '當所有人都朝同一個方向狂奔時，放慢腳步看清底層數字。',
      '安全邊際是唯一的盾牌。'
    ],
    keyInsight: '「科技巨擘估值過度透支未來時必須警惕。尋找現金流充沛但被市場嚴重忽視的便宜週期股，才是真正暴利的來源。」',
    famousQuote: '「我可能早了，但我沒有錯。」',
    topHoldings: [
      {
        symbol: 'AAPL',
        name: '蘋果 Apple Inc',
        market: 'US',
        weight: 18.0,
        sharesHeld: '防禦期權部位',
        quarterChange: -5.0,
        rationale: '配置部分避險性空單對沖指數過熱。'
      },
      {
        symbol: 'NVDA',
        name: '輝達 NVIDIA Corp',
        market: 'US',
        weight: 15.0,
        sharesHeld: '動能波段觀察',
        quarterChange: 0.0,
        rationale: '高度關注客戶端投資回報週期 (ROI)。'
      }
    ],
    recentActivities: [
      {
        date: '2024-09-30',
        symbol: 'AAPL',
        action: 'SELL',
        amount: '對沖期權調整',
        comment: '因應大盤進入相對高檔區，提升防禦性對沖部位比重。'
      }
    ]
  },
  {
    id: 'peter_lynch',
    name: '彼得·林區 (Peter Lynch)',
    badge: '富達麥哲倫基金傳奇 · 13年年化29%',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: '華爾街傳奇基金經理 · 生活選股之父',
    category: 'GLOBAL_LEGEND',
    tags: ['生活選股', '十倍股', '富達麥哲倫', '不買看不懂的', 'PEG合理成長'],
    styleDescription: '生活選股法：從日常生活、家人消費體驗中發現被華爾街忽視的隱形冠軍（十倍股 Tenbaggers）。',
    aum: '管理麥哲倫基金期間增長千倍',
    lastUpdated: '傳奇經典策略彙編',
    philosophy: [
      '不研究公司就買股票，就像打撲克牌不看牌一樣。',
      '逛街、逛賣場、跟孩子聊天，往往比華爾街分析師更早發現爆款商品。',
      '每個人都有足夠的智慧在股市賺錢，但不是每個人都有足夠的胃納量。'
    ],
    keyInsight: '「如果你去百貨公司或看生活周遭，發現每個人都在用蘋果 iPhone、在用微軟 Office、全世界的晶片都來自台積電代工，那你根本不需要去算複雜的偏微分方程式，答案就在你眼前。」',
    famousQuote: '「買你所懂的，抱你所信的。」',
    topHoldings: [
      {
        symbol: 'AAPL',
        name: '蘋果 Apple Inc',
        market: 'US',
        weight: 25.0,
        sharesHeld: '生活消費霸主',
        quarterChange: 0.0,
        rationale: '全世界消費者每天離不開的超級黏著品牌。'
      },
      {
        symbol: 'MSFT',
        name: '微軟 Microsoft',
        market: 'US',
        weight: 22.0,
        sharesHeld: '辦公生產力命脈',
        quarterChange: 0.0,
        rationale: '企業運作的核心作業系統與雲端，無可取代。'
      },
      {
        symbol: '2330',
        name: '台積電 TSMC',
        market: 'TW',
        weight: 20.0,
        sharesHeld: '全球晶片基石',
        quarterChange: 2.0,
        rationale: '每台高階科技設備裡面都有它的心臟。'
      }
    ],
    recentActivities: [
      {
        date: '2024-10-10',
        symbol: 'AAPL',
        action: 'HOLD',
        amount: '持續長期持有',
        comment: '產品生態系統黏著度絲毫未減，好公司抱緊即可。'
      }
    ]
  }
];
