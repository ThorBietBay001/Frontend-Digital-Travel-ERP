import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import type { Service } from './mockData';

export interface ServiceFormProps {
  mode: 'create' | 'edit';
  initialData?: Service;
  onSubmit: (data: Service) => void;
  onCancel: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Service>>({
    code: '',
    name: '',
    category: 'extra',
    price: 0,
    unit: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({ ...initialData });
    }
  }, [initialData, mode]);

  const handleChange = (field: keyof Service, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Tên dịch vụ không được để trống';
    if (!formData.category) newErrors.category = 'Vui lòng chọn phân loại';
    if (!formData.unit?.trim()) newErrors.unit = 'Đơn vị tính không được để trống';
    if (formData.price === undefined || formData.price < 0) newErrors.price = 'Đơn giá không hợp lệ';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (mode === 'create') {
      formData.code = `DV00${Math.floor(Math.random() * 9) + 4}`; // Mã auto scale
    }
    
    onSubmit(formData as Service);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.name ? 'border-red-500' : 'border-[#C5EAFF]'}`}
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="VD: Phụ thu phòng đơn"
        />
        {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Select
            label="Phân loại *"
            options={[
              { value: 'room', label: 'Loại phòng' },
              { value: 'extra', label: 'Dịch vụ thêm' }
            ]}
            value={formData.category}
            onChange={(val) => handleChange('category', val)}
            placeholder="Chọn phân loại"
          />
          {errors.category && <span className="text-xs text-red-500 mt-1 block">{errors.category}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
          <Select
            options={[
              { value: 'active', label: 'Đang cung cấp' },
              { value: 'inactive', label: 'Ngừng cung cấp' }
            ]}
            value={formData.status}
            onChange={(val) => handleChange('status', val)}
            placeholder="Trạng thái"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn vị tính <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.unit ? 'border-red-500' : 'border-[#C5EAFF]'}`}
            value={formData.unit || ''}
            onChange={(e) => handleChange('unit', e.target.value)}
            placeholder="VD: Phòng, Lượt, Khách"
          />
          {errors.unit && <span className="text-xs text-red-500 mt-1 block">{errors.unit}</span>}
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn giá (VND) <span className="text-red-500">*</span></label>
          <input
            type="number"
            min={0}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.price ? 'border-red-500' : 'border-[#C5EAFF]'}`}
            value={formData.price ?? ''}
            onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
          />
          {errors.price && <span className="text-xs text-red-500 mt-1 block">{errors.price}</span>}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E1F1FF] mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" variant="primary">
          {mode === 'create' ? 'Tạo dịch vụ' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm;
