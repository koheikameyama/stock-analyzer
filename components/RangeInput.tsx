/**
 * 範囲指定入力コンポーネント
 * 最小値・最大値を入力するフォームフィールド
 */

import React from 'react';

interface RangeInputProps {
  label: string;
  minValue?: number | string;
  maxValue?: number | string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
  unit?: string;
  error?: string;
}

/**
 * 範囲指定入力コンポーネント
 */
export const RangeInput: React.FC<RangeInputProps> = ({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  unit,
  error,
}) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {unit && <span className="text-gray-500 ml-1">({unit})</span>}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={minValue ?? ''}
          onChange={(e) => onMinChange(e.target.value)}
          placeholder="最小値"
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <span className="text-gray-500">〜</span>
        <input
          type="number"
          value={maxValue ?? ''}
          onChange={(e) => onMaxChange(e.target.value)}
          placeholder="最大値"
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
