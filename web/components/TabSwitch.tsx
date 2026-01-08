/**
 * 市場切り替えタブコンポーネント（初心者向けデザイン）
 */

import React from 'react';
import type { Market } from '../types/analysis';

interface TabSwitchProps {
  activeTab: Market;
  onTabChange: (tab: Market) => void;
}

export const TabSwitch: React.FC<TabSwitchProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="inline-flex bg-gradient-to-br from-surface-50 to-surface-100 p-1 rounded-xl border-2 border-surface-200 shadow-sm">
      <button
        onClick={() => onTabChange('JP')}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
          ${activeTab === 'JP'
            ? 'bg-gradient-to-br from-white to-surface-50 text-surface-900 shadow-md border border-surface-200'
            : 'text-surface-500 hover:text-surface-900 hover:bg-white/50'
          }
        `}
      >
        <span className="text-xl">🇯🇵</span>
        日本株
      </button>
      <button
        onClick={() => onTabChange('US')}
        className={`
          flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200
          ${activeTab === 'US'
            ? 'bg-gradient-to-br from-white to-surface-50 text-surface-900 shadow-md border border-surface-200'
            : 'text-surface-500 hover:text-surface-900 hover:bg-white/50'
          }
        `}
      >
        <span className="text-xl">🇺🇸</span>
        米国株
      </button>
    </div>
  );
};
