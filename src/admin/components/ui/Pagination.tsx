import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  const startRecord = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const endRecord = Math.min(current * pageSize, total);

  // Hàm tạo mảng chứa các nút phân trang
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (current <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (current >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', totalPages);
      }
    }

    return pages;
  };

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page !== current) {
      onChange(page);
    }
  };

  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      {/* Thông tin bản ghi */}
      <div className="text-gray-500">
        Hiển thị <span className="font-medium text-gray-700">{startRecord}-{endRecord}</span> trong số <span className="font-medium text-gray-700">{total}</span> bản ghi
      </div>

      {/* Nút phân trang */}
      <div className="flex items-center gap-1">
        {/* Nút Prev */}
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1 || totalPages === 0}
          className={`p-2 rounded-lg border border-[#E1F1FF] text-gray-500 transition-colors
            ${current === 1 || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F9F9FF] text-[#00668A]'}`}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Các trang số */}
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => handlePageClick(page)}
            disabled={page === '...'}
            className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg transition-colors border
              ${page === '...' ? 'border-transparent text-gray-500 cursor-default' : ''}
              ${page === current ? 'bg-[#89D4FF] text-white border-[#89D4FF] font-medium' : ''}
              ${page !== '...' && page !== current ? 'border-[#E1F1FF] text-gray-600 hover:bg-[#F9F9FF]' : ''}
            `}
          >
            {page}
          </button>
        ))}

        {/* Nút Next */}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages || totalPages === 0}
          className={`p-2 rounded-lg border border-[#E1F1FF] text-gray-500 transition-colors
            ${current === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F9F9FF] text-[#00668A]'}`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};
