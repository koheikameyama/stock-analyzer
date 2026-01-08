/**
 * データテーブルコンポーネント
 * ソート機能付きのテーブル表示
 */

import React from 'react';
import { Stock, SortOrder } from '../types/stock';

interface Column {
  key: keyof Stock;
  label: string;
  sortable?: boolean;
  format?: (value: any, stock: Stock) => string;
}

interface DataTableProps {
  stocks: Stock[];
  sortBy: string;
  sortOrder: SortOrder;
  onSort: (column: string) => void;
}

/**
 * 数値をフォーマット（桁区切り）
 */
const formatNumber = (value: number | null): string => {
  if (value === null) return '-';
  return value.toLocaleString('ja-JP');
};

/**
 * 小数点付き数値をフォーマット
 */
const formatDecimal = (value: number | null, decimals: number = 2): string => {
  if (value === null) return '-';
  return value.toFixed(decimals);
};

/**
 * データテーブルコンポーネント
 */
export const DataTable: React.FC<DataTableProps> = ({
  stocks,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const columns: Column[] = [
    { key: 'ticker', label: 'ティッカー', sortable: true },
    { key: 'name', label: '銘柄名', sortable: true },
    { key: 'sector', label: 'セクター', sortable: true, format: (v) => v || '-' },
    {
      key: 'marketCap',
      label: '時価総額',
      sortable: true,
      format: (v, stock) => v ? `${formatNumber(v)} ${stock.currency === 'JPY' ? '円' : 'ドル'}` : '-'
    },
    { key: 'per', label: 'PER', sortable: true, format: (v) => formatDecimal(v) },
    { key: 'pbr', label: 'PBR', sortable: true, format: (v) => formatDecimal(v) },
    { key: 'roe', label: 'ROE (%)', sortable: true, format: (v) => formatDecimal(v) },
    { key: 'dividendYield', label: '配当利回り (%)', sortable: true, format: (v) => formatDecimal(v) },
    {
      key: 'price',
      label: '株価',
      sortable: true,
      format: (v, stock) => v ? `${formatDecimal(v, 2)} ${stock.currency === 'JPY' ? '円' : 'ドル'}` : '-'
    },
  ];

  const handleSort = (column: Column) => {
    if (column.sortable) {
      onSort(column.key);
    }
  };

  const renderSortIcon = (column: Column) => {
    if (!column.sortable) return null;

    if (sortBy === column.key) {
      return sortOrder === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ⇅';
  };

  if (stocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">条件に合致する銘柄が見つかりませんでした</p>
        <p className="text-gray-400 text-sm mt-2">フィルタ条件を変更してお試しください</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                onClick={() => handleSort(column)}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                }`}
              >
                {column.label}
                {renderSortIcon(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {stocks.map((stock) => (
            <tr key={stock.ticker} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {column.format
                    ? column.format(stock[column.key], stock)
                    : stock[column.key]?.toString() || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
