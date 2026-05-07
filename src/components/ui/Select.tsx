import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string; // class cho wrapper
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Vui lòng chọn',
  label,
  className = '',
  disabled,
  ...props
}) => {
  // Thay đổi giá trị select
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {/* Label (Nếu có) */}
      {label && (
        <label className="text-[14px] font-semibold text-gray-700">
          {label}
        </label>
      )}

      {/* Wrapper của Select & Icon */}
      <div className="relative">
        <select
          value={value ?? ''}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20 appearance-none transition-all ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#89D4FF]'
          }`}
          {...props}
        >
          {/* Option mặc định rỗng dùng cho placeholder */}
          <option value="" disabled hidden>
            {placeholder}
          </option>
          
          {/* Render các options truyền vào */}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Icon mũi tên xổ xuống giả lập */}
        <ChevronDown
          size={16}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
};
