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
    <div className="inline-flex bg-surface-100 p-1 rounded-lg border border-surface-200">
      <button
        onClick={() => onTabChange('JP')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
          ${activeTab === 'JP'
            ? 'bg-white text-surface-900 shadow-sm'
            : 'text-surface-500 hover:text-surface-900'
          }
        `}
      >
        <span className="text-lg">🇯🇵</span>
        JP Market
      </button>
      <button
        onClick={() => onTabChange('US')}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
          ${activeTab === 'US'
            ? 'bg-white text-surface-900 shadow-sm'
            : 'text-surface-500 hover:text-surface-900'
          }
        `}
      >
        <span className="text-lg">🇺🇸</span>
        US Market
      </button>
    </div>
  );
};
