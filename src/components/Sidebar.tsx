import React from 'react';
import { LayoutDashboard, BarChart3, PieChart, Users, BellRing, ChevronRight } from 'lucide-react';

export type ViewTab = 'market' | 'analysis' | 'portfolio' | 'gurus' | 'alerts';

interface Props {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  unreadAlertCount: number;
}

export const Sidebar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  unreadAlertCount,
}) => {
  const navItems = [
    {
      id: 'market' as ViewTab,
      label: '今日大盤與買賣點',
      subtext: '多空溫度計與精準信號',
      icon: LayoutDashboard,
    },
    {
      id: 'analysis' as ViewTab,
      label: '個股深度財報與新聞',
      subtext: '走勢圖、河流圖與AI新聞',
      icon: BarChart3,
    },
    {
      id: 'portfolio' as ViewTab,
      label: '我的投資組合損益',
      subtext: '未實現損益與風險雷達',
      icon: PieChart,
    },
    {
      id: 'gurus' as ViewTab,
      label: '股市名人存股動向',
      subtext: '股癌特區、巴菲特與跟單',
      icon: Users,
      badge: '股癌專區',
    },
    {
      id: 'alerts' as ViewTab,
      label: '波動警示與多裝置同步',
      subtext: '推播提醒與跨裝置漫遊',
      icon: BellRing,
      count: unreadAlertCount,
    },
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-slate-950/95 border-b lg:border-b-0 lg:border-r border-slate-800 p-3 lg:p-4 flex lg:flex-col justify-between gap-1 overflow-x-auto lg:overflow-x-visible">
      <div className="flex lg:flex-col gap-1 w-full">
        <div className="hidden lg:block px-3 py-2 text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
          主功能導覽 (Navigation)
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl transition-all text-left whitespace-nowrap shrink-0 lg:w-full ${
                isActive
                  ? 'bg-indigo-600/15 border border-indigo-500/50 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <div className="truncate">
                  <div className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 hidden xl:block truncate">
                    {item.subtext}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-2">
                {item.badge && (
                  <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-mono font-bold">
                    {item.count}
                  </span>
                )}
                <ChevronRight className={`w-3.5 h-3.5 hidden lg:block ${isActive ? 'text-indigo-400' : 'text-slate-600'}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Sidebar Footer info */}
      <div className="hidden lg:block pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex items-center justify-between">
          <span>數據模式：</span>
          <span className="text-emerald-400 font-mono">即時連線</span>
        </div>
        <div className="text-[10px] text-slate-400 leading-tight">
          專為非專業投資人設計 · 繁體中文全視覺化
        </div>
      </div>
    </aside>
  );
};
