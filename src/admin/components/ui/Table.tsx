import React from 'react';
import { Inbox } from 'lucide-react';

export interface Column<T> {
  key: string;
  title: React.ReactNode;
  dataIndex?: keyof T;
  render?: (record: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  dataSource: T[];
  rowKey?: keyof T | ((record: T) => string);
  loading?: boolean;
  emptyText?: string;
  onRowClick?: (record: T) => void;
  rowClassName?: (record: T) => string;
}

// Hàm hỗ trợ lấy row key
function getRowKey<T>(record: T, rowKey?: keyof T | ((record: T) => string), index?: number): string {
  if (typeof rowKey === 'function') {
    return rowKey(record);
  }
  if (typeof rowKey === 'string' || typeof rowKey === 'number' || typeof rowKey === 'symbol') {
    return String(record[rowKey as keyof T]);
  }
  return String(index);
}

// Khai báo component dưới dạng function để hỗ trợ kiểu generic <T>
export function Table<T>({
  columns,
  dataSource,
  rowKey,
  loading = false,
  emptyText = 'Không có dữ liệu',
  onRowClick,
  rowClassName,
}: TableProps<T>) {
  // Hàm xử lý class căn lề
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className="w-full overflow-x-auto rounded-[8px] border border-[#E1F1FF] bg-white">
      <table className="w-full text-sm text-left">
        {/* Table Header */}
        <thead className="bg-[#F4F9FF] border-b border-[#E1F1FF]">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={`py-3 px-6 font-medium text-xs uppercase text-gray-500 tracking-wider ${getAlignClass(col.align)}`}
              >
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody>
          {loading ? (
            // Trạng thái Loading: Xếp 3 dòng Skeleton
            Array.from({ length: 3 }).map((_, rowIndex) => (
              <tr key={`loading-${rowIndex}`} className="border-b border-[#E1F1FF] last:border-0">
                {columns.map((_col, colIndex) => (
                  <td key={`loading-${rowIndex}-${colIndex}`} className="py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : dataSource.length === 0 ? (
            // Trạng thái Empty
            <tr>
              <td colSpan={columns.length} className="py-16 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Inbox size={48} className="text-gray-300" strokeWidth={1} />
                  <span className="text-sm font-medium">{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            // Render Dữ liệu thực tế
            dataSource.map((record, index) => {
              const key = getRowKey(record, rowKey, index);
              const isClickable = !!onRowClick;

              return (
                <tr
                  key={key}
                  onClick={() => onRowClick?.(record)}
                  className={`border-b border-[#E1F1FF] last:border-0 transition-colors hover:bg-[#F9F9FF] ${
                    isClickable ? 'cursor-pointer' : ''
                  } ${rowClassName ? rowClassName(record) : ''}`}
                >
                  {columns.map((col) => {
                    let cellContent: React.ReactNode = null;
                    if (col.render) {
                      cellContent = col.render(record); // Ưu tiên gọi hàm render tuỳ biến
                    } else if (col.dataIndex) {
                      cellContent = String(record[col.dataIndex] ?? ''); // Fallback lấy giá trị theo dataIndex
                    }

                    return (
                      <td
                        key={`cell-${key}-${col.key}`}
                        className={`py-4 px-6 text-gray-700 ${getAlignClass(col.align)}`}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
