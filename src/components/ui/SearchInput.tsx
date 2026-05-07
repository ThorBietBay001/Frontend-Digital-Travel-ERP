import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Tìm kiếm...',
  value,
  onChange,
  onSearch,
  className = '',
}) => {
  // Quản lý state nội bộ nếu component không bị điều khiển (uncontrolled)
  const [internalValue, setInternalValue] = useState<string>(value || '');

  // Cập nhật state nội bộ khi prop thay đổi
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(internalValue);
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Icon Search đặt tuyệt đối (absolute) bên trái */}
      <Search
        size={18}
        className="absolute left-3 text-gray-400 pointer-events-none"
      />
      
      {/* O Input với padding trái để chừa chỗ cho icon */}
      <input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#C5EAFF] rounded-[8px] text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20 transition-all"
      />
    </div>
  );
};
