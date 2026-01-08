/**
 * 複数選択コンポーネント
 * チェックボックスで複数項目を選択可能
 */

import React from 'react';

interface MultiSelectProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

/**
 * 複数選択コンポーネント
 */
export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
}) => {
  const handleCheckboxChange = (value: string) => {
    if (selectedValues.includes(value)) {
      // 選択解除
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      // 選択追加
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
        {options.length === 0 ? (
          <p className="text-sm text-gray-500 p-2">選択可能な項目がありません</p>
        ) : (
          options.map((option) => (
            <label
              key={option}
              className="flex items-center py-1 px-2 hover:bg-gray-50 rounded cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={() => handleCheckboxChange(option)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))
        )}
      </div>
    </div>
  );
};
