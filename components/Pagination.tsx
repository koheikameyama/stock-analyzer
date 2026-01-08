/**
 * ページネーションコンポーネント
 * ページ切り替えUI
 */

import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * ページネーションコンポーネント
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}) => {
  // 表示するページ番号を生成
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // 表示する最大ページ数

    if (totalPages <= maxVisible) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 省略表示
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return (
      <div className="mt-4 text-sm text-gray-600">
        検索結果: {totalCount}件
      </div>
    );
  }

  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="text-sm text-gray-600">
        検索結果: {totalCount}件（{currentPage} / {totalPages}ページ）
      </div>

      <div className="flex items-center space-x-2">
        {/* 前へボタン */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            currentPage === 1
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          前へ
        </button>

        {/* ページ番号 */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={page === '...' || page === currentPage}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              page === currentPage
                ? 'bg-blue-600 text-white'
                : page === '...'
                ? 'bg-white text-gray-400 cursor-default'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            {page}
          </button>
        ))}

        {/* 次へボタン */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          次へ
        </button>
      </div>
    </div>
  );
};
