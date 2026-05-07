import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import type { TourTemplate, DaySchedule } from './mockData';

export interface TourTemplateFormProps {
  mode: 'create' | 'edit' | 'copy';
  initialData?: TourTemplate;
  onSubmit: (data: TourTemplate) => void;
  onCancel: () => void;
}

const defaultDaySchedule: DaySchedule = {
  title: '',
  description: '',
  meals: { breakfast: '', lunch: '', dinner: '' },
};

const TourTemplateForm: React.FC<TourTemplateFormProps> = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<TourTemplate>>({
    code: '',
    title: '',
    description: '',
    duration: { days: 1, nights: 0 },
    basePrice: 0,
    status: 'active',
    schedule: [{ ...defaultDaySchedule }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Khởi tạo dữ liệu
  useEffect(() => {
    if (initialData) {
      if (mode === 'copy') {
        setFormData({
          ...initialData,
          id: undefined, // Xóa id để tạo mới
          code: `${initialData.code}-COPY`,
          title: `${initialData.title} (Bản sao)`,
        });
      } else {
        setFormData({ ...initialData });
      }
    }
  }, [initialData, mode]);

  // Cập nhật số ngày trong lịch trình khi thay đổi duration.days
  useEffect(() => {
    const days = formData.duration?.days || 1;
    setFormData((prev) => {
      const currentSchedule = prev.schedule ? [...prev.schedule] : [];
      if (days > currentSchedule.length) {
        // Thêm ngày
        for (let i = currentSchedule.length; i < days; i++) {
          currentSchedule.push({ ...defaultDaySchedule, title: `Ngày ${i + 1}: ` });
        }
      } else if (days < currentSchedule.length) {
        // Cắt bớt ngày
        currentSchedule.splice(days);
      }
      return { ...prev, schedule: currentSchedule };
    });
  }, [formData.duration?.days]);

  const handleChange = (field: keyof TourTemplate, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleDurationChange = (field: 'days' | 'nights', value: number) => {
    setFormData((prev) => ({
      ...prev,
      duration: { ...prev.duration!, [field]: value },
    }));
  };

  const handleScheduleChange = (index: number, field: string, value: string, isMeal = false) => {
    setFormData((prev) => {
      const newSchedule = [...(prev.schedule || [])];
      if (isMeal) {
        newSchedule[index] = {
          ...newSchedule[index],
          meals: { ...newSchedule[index].meals, [field]: value },
        };
      } else {
        newSchedule[index] = { ...newSchedule[index], [field]: value };
      }
      return { ...prev, schedule: newSchedule };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    // Validate
    if (!formData.title?.trim()) newErrors.title = 'Tên Tour Mẫu không được để trống';
    if (!formData.code?.trim()) newErrors.code = 'Mã Tour không được để trống';
    if (!formData.basePrice || formData.basePrice <= 0) newErrors.basePrice = 'Giá sàn phải lớn hơn 0';
    
    formData.schedule?.forEach((day, index) => {
      if (!day.title.trim()) {
        newErrors[`schedule_${index}`] = `Lịch trình ngày ${index + 1} không được để trống tiêu đề`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData as TourTemplate);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Thông tin chung */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Mã Tour <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.code ? 'border-red-500' : 'border-[#C5EAFF]'}`}
            value={formData.code || ''}
            onChange={(e) => handleChange('code', e.target.value)}
            disabled={mode === 'edit'}
            placeholder="VD: TM-ECO-001"
          />
          {errors.code && <span className="text-xs text-red-500 mt-1 block">{errors.code}</span>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tên Tour Mẫu <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.title ? 'border-red-500' : 'border-[#C5EAFF]'}`}
            value={formData.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Khám phá Rừng Ngập Mặn Cần Giờ"
          />
          {errors.title && <span className="text-xs text-red-500 mt-1 block">{errors.title}</span>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả ngắn</label>
        <textarea
          rows={3}
          className="w-full px-4 py-2 border border-[#C5EAFF] rounded-lg text-sm focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20 resize-none"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Mô tả tóm tắt về tour..."
        ></textarea>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Số ngày</label>
          <input
            type="number"
            min={1}
            className="w-full px-4 py-2 border border-[#C5EAFF] rounded-lg text-sm focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
            value={formData.duration?.days || 1}
            onChange={(e) => handleDurationChange('days', parseInt(e.target.value) || 1)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Số đêm</label>
          <input
            type="number"
            min={0}
            className="w-full px-4 py-2 border border-[#C5EAFF] rounded-lg text-sm focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
            value={formData.duration?.nights || 0}
            onChange={(e) => handleDurationChange('nights', parseInt(e.target.value) || 0)}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Giá Sàn (VNĐ) <span className="text-red-500">*</span></label>
          <input
            type="number"
            min={0}
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.basePrice ? 'border-red-500' : 'border-[#C5EAFF]'}`}
            value={formData.basePrice || ''}
            onChange={(e) => handleChange('basePrice', parseInt(e.target.value) || 0)}
          />
          {errors.basePrice && <span className="text-xs text-red-500 mt-1 block">{errors.basePrice}</span>}
        </div>
      </div>

      {/* Lịch trình chi tiết */}
      <h3 className="text-[18px] font-bold text-[#00668A] mt-2 border-b pb-2">Lịch trình chi tiết</h3>
      <div className="flex flex-col gap-4">
        {formData.schedule?.map((day, index) => (
          <div key={index} className="bg-[#F9F9FF] p-4 rounded-lg border border-[#E1F1FF]">
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề Ngày {index + 1} <span className="text-red-500">*</span></label>
              <input
                type="text"
                className={`w-full px-3 py-2 border rounded text-sm focus:outline-none focus:border-[#89D4FF] ${errors[`schedule_${index}`] ? 'border-red-500' : 'border-[#C5EAFF]'}`}
                value={day.title}
                onChange={(e) => handleScheduleChange(index, 'title', e.target.value)}
                placeholder={`Ngày ${index + 1}: ...`}
              />
              {errors[`schedule_${index}`] && <span className="text-xs text-red-500 mt-1 block">{errors[`schedule_${index}`]}</span>}
            </div>
            <div className="mb-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả hoạt động</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-[#C5EAFF] rounded text-sm focus:outline-none focus:border-[#89D4FF] resize-none"
                value={day.description}
                onChange={(e) => handleScheduleChange(index, 'description', e.target.value)}
                placeholder="Sáng đi đâu, trưa ăn gì, chiều tham quan..."
              ></textarea>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bữa Sáng</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-[#C5EAFF] rounded text-xs focus:outline-none focus:border-[#89D4FF]"
                  value={day.meals.breakfast}
                  onChange={(e) => handleScheduleChange(index, 'breakfast', e.target.value, true)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bữa Trưa</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-[#C5EAFF] rounded text-xs focus:outline-none focus:border-[#89D4FF]"
                  value={day.meals.lunch}
                  onChange={(e) => handleScheduleChange(index, 'lunch', e.target.value, true)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bữa Tối</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-[#C5EAFF] rounded text-xs focus:outline-none focus:border-[#89D4FF]"
                  value={day.meals.dinner}
                  onChange={(e) => handleScheduleChange(index, 'dinner', e.target.value, true)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hành động Footer (được nhúng vào trong Modal header/footer qua structure form) */}
      <div className="flex justify-end gap-3 pt-4 border-t border-[#E1F1FF]">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" variant="primary">
          {mode === 'copy' ? 'Lưu bản sao' : mode === 'edit' ? 'Lưu thay đổi' : 'Tạo mới'}
        </Button>
      </div>
    </form>
  );
};

export default TourTemplateForm;
