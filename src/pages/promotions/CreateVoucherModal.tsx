import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { Voucher } from './mockData';

interface CreateVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Voucher) => void;
}

const CreateVoucherModal: React.FC<CreateVoucherModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [discountType, setDiscountType] = useState<'percent' | 'amount'>('percent');
  const [discountValue, setDiscountValue] = useState<number | ''>('');
  const [maxDiscount, setMaxDiscount] = useState<number | ''>('');
  const [minOrderValue, setMinOrderValue] = useState<number | ''>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Tên chương trình không được để trống';
    if (!discountValue || discountValue <= 0) newErrors.discountValue = 'Giá trị giảm phải > 0';
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newVoucher: Voucher = {
      id: Math.random().toString(36).substr(2, 9),
      code: `VC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      name,
      discountType,
      discountValue: Number(discountValue),
      maxDiscount: discountType === 'percent' ? Number(maxDiscount) : undefined,
      minOrderValue: Number(minOrderValue),
      quantity: Number(quantity),
      distributed: 0,
      expiryDate: endDate,
      status: isActive ? 'ready' : 'disabled',
    };

    onSubmit(newVoucher);
    setName('');
    setQuantity('');
    setStartDate('');
    setEndDate('');
    setIsActive(true);
    setDiscountType('percent');
    setDiscountValue('');
    setMaxDiscount('');
    setMinOrderValue('');
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Chương Trình Khuyến Mãi"
      size="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" icon={<Save size={18} />} onClick={handleSubmit}>Lưu & Kích hoạt</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-6 pb-6">
        {/* Cột trái */}
        <div className="space-y-4">
          <div>
            <label className="block text-[#00668A] text-sm font-semibold mb-2">Tên chương trình <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 border ${errors.name ? 'border-[#BA1A1A]' : 'border-[#C5EAFF]'} rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent`}
            />
            {errors.name && <p className="text-[#BA1A1A] text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[#00668A] text-sm font-semibold mb-2">Số lượng phát hành</label>
            <div className="relative">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-4 py-2 border border-[#C5EAFF] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent pr-20"
              />
              <span className="absolute right-3 top-2 text-gray-500">Voucher</span>
            </div>
          </div>

          <div>
            <label className="block text-[#00668A] text-sm font-semibold mb-2">Hạn sử dụng</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-1/2 px-4 py-2 border border-[#C5EAFF] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-1/2 px-4 py-2 border ${errors.endDate ? 'border-[#BA1A1A]' : 'border-[#C5EAFF]'} rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent`}
              />
            </div>
            {errors.endDate && <p className="text-[#BA1A1A] text-xs mt-1">{errors.endDate}</p>}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-[#89D4FF] focus:ring-[#89D4FF] border-[#C5EAFF] rounded"
            />
            <label htmlFor="isActive" className="text-[#00668A] text-sm font-semibold">Kích hoạt ngay</label>
          </div>
        </div>

        {/* Cột phải */}
        <div className="space-y-4">
          <div>
            <label className="block text-[#00668A] text-sm font-semibold mb-2">Loại giảm giá</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="discountType"
                  value="percent"
                  checked={discountType === 'percent'}
                  onChange={() => setDiscountType('percent')}
                  className="text-[#89D4FF] focus:ring-[#89D4FF]"
                />
                Theo phần trăm (%)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="discountType"
                  value="amount"
                  checked={discountType === 'amount'}
                  onChange={() => setDiscountType('amount')}
                  className="text-[#89D4FF] focus:ring-[#89D4FF]"
                />
                Số tiền cố định
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[#00668A] text-sm font-semibold mb-2">Giá trị giảm <span className="text-red-500">*</span></label>
            <div className="relative">
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className={`w-full px-4 py-2 border ${errors.discountValue ? 'border-[#BA1A1A]' : 'border-[#C5EAFF]'} rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent pr-12`}
              />
              <span className="absolute right-3 top-2 text-gray-500">{discountType === 'percent' ? '%' : 'VNĐ'}</span>
            </div>
            {errors.discountValue && <p className="text-[#BA1A1A] text-xs mt-1">{errors.discountValue}</p>}
          </div>

          {discountType === 'percent' && (
            <div>
              <label className="block text-[#00668A] text-sm font-semibold mb-2">Mức giảm tối đa</label>
              <div className="relative">
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-[#C5EAFF] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent pr-12"
                />
                <span className="absolute right-3 top-2 text-gray-500">VNĐ</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-[#00668A] text-sm font-semibold mb-2">Giá trị đơn hàng tối thiểu</label>
            <div className="relative">
              <input
                type="number"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(Number(e.target.value))}
                className="w-full px-4 py-2 border border-[#C5EAFF] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent pr-12"
              />
              <span className="absolute right-3 top-2 text-gray-500">VNĐ</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateVoucherModal;