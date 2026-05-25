import React, { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import type { Voucher } from './mockData';
import type { VoucherRequest } from '../../services/promotions';

interface CreateVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'create' | 'edit';
  initialData?: Voucher | null;
  onSubmit: (data: VoucherRequest) => Promise<void>;
}

const CreateVoucherModal: React.FC<CreateVoucherModalProps> = ({ isOpen, onClose, mode = 'create', initialData, onSubmit }) => {
  const [code, setCode] = useState('');
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

  useEffect(() => {
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(initialData?.code || '');
    setName(initialData?.name || '');
    setQuantity(initialData?.quantity || '');
    setStartDate('');
    setEndDate(initialData?.expiryDate || '');
    setIsActive(initialData?.status !== 'disabled');
    setDiscountType(initialData?.discountType || 'percent');
    setDiscountValue(initialData?.discountValue || '');
    setMaxDiscount(initialData?.maxDiscount || '');
    setMinOrderValue(initialData?.minOrderValue || '');
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!code.trim()) newErrors.code = 'Mã code không được để trống';
    if (!name.trim()) newErrors.name = 'Tên chương trình không được để trống';
    if (!discountValue || discountValue <= 0) newErrors.discountValue = 'Giá trị giảm phải > 0';
    if (discountType === 'percent' && (!maxDiscount || maxDiscount <= 0)) {
      newErrors.maxDiscount = 'Mức giảm tối đa phải > 0 để tính điểm quy đổi';
    }
    if (!quantity || quantity <= 0) newErrors.quantity = 'Số lượng phát hành phải > 0';
    if (!startDate) newErrors.startDate = 'Ngày hiệu lực không được để trống';
    if (!endDate) newErrors.endDate = 'Ngày hết hạn không được để trống';
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      newErrors.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload = {
      maCode: code.trim(),
      loaiUuDai: discountType === 'percent' ? 'PHAN_TRAM' : 'SO_TIEN',
      giaTriGiam: Number(discountValue),
      mucGiamToiDa: discountType === 'percent' ? Number(maxDiscount) : undefined,
      dieuKienApDung: name,
      soLuotPhatHanh: Math.floor(Number(quantity)),
      ngayHieuLuc: startDate || new Date().toISOString().split('T')[0],
      ngayHetHan: endDate,
    };

    try {
      await onSubmit(payload);
      setCode('');
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
    } catch {
      // Error is handled in the parent, or we can handle it here if we pass the service
    }
  };

  const requiredGreenPoints = discountType === 'percent'
    ? Math.ceil((Number(maxDiscount) || 0) * (Number(discountValue) || 0) * 2 / 100)
    : Number(discountValue) || 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? 'Cập Nhật Chương Trình Khuyến Mãi' : 'Tạo Chương Trình Khuyến Mãi'}
      size="2xl"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="secondary" onClick={onClose}>Hủy</Button>
          <Button variant="primary" icon={<Save size={18} />} onClick={handleSubmit}>Lưu</Button>
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 pb-6">
        {/* Hàng 1 */}
        <div>
            <label className="block text-[#00668A] text-sm font-semibold mb-2">Mã code <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="VD: SUMMER10"
              className={`w-full px-4 py-2 border ${errors.code ? 'border-[#BA1A1A]' : 'border-[#C5EAFF]'} rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent`}
            />
            {errors.code && <p className="text-[#BA1A1A] text-xs mt-1">{errors.code}</p>}
        </div>

        <div>
          <label className="block text-[#00668A] text-sm font-semibold mb-2">Loại giảm giá</label>
          <div className="flex gap-4 h-[42px] items-center">
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

        {/* Hàng 2 */}
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

        {/* Hàng 3 */}
        <div>
            <label className="block text-[#00668A] text-sm font-semibold mb-2">Số lượng phát hành</label>
            <div className="relative">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={`w-full px-4 py-2 border ${errors.quantity ? 'border-[#BA1A1A]' : 'border-[#C5EAFF]'} rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent pr-20`}
              />
              <span className="absolute right-3 top-2 text-gray-500">Voucher</span>
            </div>
            {errors.quantity && <p className="text-[#BA1A1A] text-xs mt-1">{errors.quantity}</p>}
        </div>

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

        {/* Hàng 4 */}
        <div>
          <label className="block text-[#00668A] text-sm font-semibold mb-2">Hạn sử dụng</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`w-1/2 px-4 py-2 border ${errors.startDate ? 'border-[#BA1A1A]' : 'border-[#C5EAFF]'} rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent`}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-1/2 px-4 py-2 border ${errors.endDate ? 'border-[#BA1A1A]' : 'border-[#C5EAFF]'} rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent`}
            />
          </div>
          {errors.startDate && <p className="text-[#BA1A1A] text-xs mt-1">{errors.startDate}</p>}
          {errors.endDate && <p className="text-[#BA1A1A] text-xs mt-1">{errors.endDate}</p>}
        </div>

        <div>
          {discountType === 'percent' ? (
            <>
              <label className="block text-[#00668A] text-sm font-semibold mb-2">Mức giảm tối đa</label>
              <div className="relative">
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                  className={`w-full px-4 py-2 border ${errors.maxDiscount ? 'border-[#BA1A1A]' : 'border-[#C5EAFF]'} rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#89D4FF] focus:border-transparent pr-12`}
                />
                <span className="absolute right-3 top-2 text-gray-500">VNĐ</span>
              </div>
              {errors.maxDiscount && <p className="text-[#BA1A1A] text-xs mt-1">{errors.maxDiscount}</p>}
            </>
          ) : null}
        </div>

        {/* Hàng 5 */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-[#89D4FF] focus:ring-[#89D4FF] border-[#C5EAFF] rounded"
          />
          <label htmlFor="isActive" className="text-[#00668A] text-sm font-semibold">Kích hoạt ngay</label>
        </div>
        <div className="flex items-center justify-between rounded-[8px] bg-green-50 border border-green-200 px-4 py-2 text-sm">
          <span className="font-semibold text-green-800">Điểm xanh cần quy đổi</span>
          <span className="font-bold text-green-700">{requiredGreenPoints.toLocaleString('vi-VN')} điểm</span>
        </div>
      </div>
    </Modal>
  );
};

export default CreateVoucherModal;
