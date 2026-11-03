import React from 'react';
import { ColorConvention } from '../types/stock';
import { Sparkles, Palette, Activity } from 'lucide-react';

interface Props {
  colorConvention: ColorConvention;
  onToggleColorConvention: () => void;
  activeViewTitle: string;
  onOpenTradeModalForFirst: () => void;
}

export const Navbar: React.FC<Props> = ({
  colorConvention,
  onToggleColorConvention,
  activeViewTitle,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a href="/" className="text-lg font-bold tracking-tight text-white whitespace-nowrap flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
            ST
          </span>
          <span>智投智選 SmartTrade AI</span>
        </a>
        <span className="hidden xl:inline-block text-slate-600">/</span>
        <span className="hidden xl:inline-block text-xs text-slate-400 font-medium">
          {activeViewTitle}
        </span>
      </div>

      {/* Zone 2: Navigation / Market telemetry quiet pill */}
      <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-400 whitespace-nowrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-slate-300">台美雙市場行情：</span>
          <span className="text-emerald-400 font-semibold">即時推播中</span>
        </div>
      </div>

      {/* Zone 3: 1 primary action / settings */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Taiwan vs US Red/Green color convention toggle */}
        <button
          onClick={onToggleColorConvention}
          title="切換紅綠漲跌配色習慣"
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors flex items-center gap-2"
        >
          <Palette className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            {colorConvention === 'TW' ? '台股慣例 (紅漲綠跌)' : '國際慣例 (綠漲紅跌)'}
          </span>
        </button>

        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 px-2 py-1 rounded bg-slate-900 border border-slate-800/80">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Gemini 3.8</span>
        </div>
      </div>
    </header>
  );
};
