import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
}) => {
  // Khoá cuộn trang và lắng nghe phím Escape khi modal mở
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup khi component unmount hoặc isOpen thay đổi
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Cấu hình class kích thước cho content
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-7xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      {/* Container - Ngăn sự kiện click lan ra ngoài để không đóng modal khi click vào nội dung */}
      <div
        className={`bg-white rounded-[16px] shadow-[0px_12px_30px_rgba(137,212,255,0.15)] w-full max-h-[90vh] overflow-hidden flex flex-col ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E1F1FF] bg-[#F4F9FF] flex items-center justify-between">
          <h3 className="text-[20px] font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#BA1A1A] transition-colors focus:outline-none rounded-full p-1 hover:bg-red-50"
            aria-label="Đóng"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>

        {/* Footer (Hiển thị nếu prop footer được truyền vào) */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#E1F1FF] bg-[#F4F9FF] flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
