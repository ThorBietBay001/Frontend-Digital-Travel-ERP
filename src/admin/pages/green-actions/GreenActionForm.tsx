import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import type { GreenAction } from './mockData';

export interface GreenActionFormProps {
  mode: 'create' | 'edit';
  initialData?: GreenAction;
  onSubmit: (data: GreenAction) => void;
  onCancel: () => void;
}

const GreenActionForm: React.FC<GreenActionFormProps> = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<GreenAction>>({
    code: '',
    name: '',
    description: '',
    defaultPoints: 0,
    status: 'active',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({ ...initialData });
    }
  }, [initialData, mode]);

  const handleChange = (field: keyof GreenAction, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = 'Tên hành động không được để trống';
    if (formData.defaultPoints === undefined || formData.defaultPoints <= 0) newErrors.defaultPoints = 'Điểm thưởng phải lớn hơn 0';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (mode === 'create') {
      formData.code = `HD00${Math.floor(Math.random() * 9) + 4}`;
    }
    
    onSubmit(formData as GreenAction);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Tên hành động <span className="text-red-500">*</span></label>
        <input
          type="text"
          className={`w-full px-4 py-2 border rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.name ? 'border-red-500' : 'border-[#C5EAFF]'}`}
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="VD: Nhặt rác bãi biển"
        />
        {errors.name && <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả ngắn</label>
        <textarea
          className="w-full px-4 py-2 border border-[#C5EAFF] rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 h-20 resize-none"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Mô tả chi tiết về hành động xanh này..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Điểm thưởng mặc định <span className="text-red-500">*</span></label>
          <input
            type="number"
            min={1}
            className={`w-full px-4 py-2 border rounded-[8px] text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.defaultPoints ? 'border-red-500' : 'border-[#C5EAFF]'}`}
            value={formData.defaultPoints || ''}
            onChange={(e) => handleChange('defaultPoints', Number(e.target.value))}
          />
          {errors.defaultPoints && <span className="text-xs text-red-500 mt-1 block">{errors.defaultPoints}</span>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
          <Select
            options={[
              { value: 'active', label: 'Đang áp dụng' },
              { value: 'inactive', label: 'Ngừng áp dụng' }
            ]}
            value={formData.status}
            onChange={(val) => handleChange('status', val)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E1F1FF] mt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" variant="primary">
          {mode === 'create' ? 'Tạo hành động' : 'Lưu thay đổi'}
        </Button>
      </div>
    </form>
  );
};

export default GreenActionForm;
