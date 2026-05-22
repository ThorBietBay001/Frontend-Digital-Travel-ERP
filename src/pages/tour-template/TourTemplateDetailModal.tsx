import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { TourTemplate, DaySchedule } from './mockData';
import GreenActionList from '../green-actions/GreenActionList';
import ServiceList from '../services/ServiceList';

export interface TourTemplateDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'copy';
  initialData?: TourTemplate;
  onSubmit: (data: TourTemplate) => void;
}

const defaultDaySchedule: DaySchedule = {
  title: '',
  description: '',
  meals: { breakfast: '', lunch: '', dinner: '' },
};

const TourTemplateDetailModal: React.FC<TourTemplateDetailModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'schedule' | 'green' | 'services'>('info');

  const [formData, setFormData] = useState<Partial<TourTemplate>>({
    title: '',
    description: '',
    duration: { days: 1, nights: 0 },
    basePrice: 0,
    status: 'active',
    schedule: [{ ...defaultDaySchedule }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('info');
      setErrors({});
      return;
    }
    if (initialData) {
      if (mode === 'copy') {
        setFormData({
          ...initialData,
          id: undefined,
          title: `${initialData.title} (Bản sao)`,
        });
      } else {
        setFormData({ ...initialData });
      }
    } else {
      setFormData({
        title: '',
        description: '',
        duration: { days: 1, nights: 0 },
        basePrice: 0,
        status: 'active',
        schedule: [{ ...defaultDaySchedule }],
      });
    }
  }, [initialData, mode, isOpen]);

  useEffect(() => {
    const days = formData.duration?.days || 1;
    setFormData((prev) => {
      const currentSchedule = prev.schedule ? [...prev.schedule] : [];
      if (days > currentSchedule.length) {
        for (let i = currentSchedule.length; i < days; i++) {
          currentSchedule.push({ ...defaultDaySchedule, title: `Ngày ${i + 1}: ` });
        }
      } else if (days < currentSchedule.length) {
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

    if (!formData.title?.trim()) newErrors.title = 'Tên Tour Mẫu không được để trống';
    if (!formData.basePrice || formData.basePrice <= 0) newErrors.basePrice = 'Giá sàn phải lớn hơn 0';
    
    formData.schedule?.forEach((day, index) => {
      if (!day.title.trim()) {
        newErrors[`schedule_${index}`] = `Lịch trình ngày ${index + 1} không được để trống tiêu đề`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Switch to tab with error
      if (newErrors.title || newErrors.basePrice) {
        setActiveTab('info');
      } else {
        setActiveTab('schedule');
      }
      return;
    }

    onSubmit(formData as TourTemplate);
  };

  const renderTabs = () => (
    <div className="flex border-b border-gray-200 mb-6">
      <button
        type="button"
        className={`px-4 py-2 font-medium text-sm transition-colors ${
          activeTab === 'info'
            ? 'border-b-2 border-[#00668A] text-[#00668A]'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('info')}
      >
        Thông tin chung
      </button>
      <button
        type="button"
        className={`px-4 py-2 font-medium text-sm transition-colors ${
          activeTab === 'schedule'
            ? 'border-b-2 border-[#00668A] text-[#00668A]'
            : 'text-gray-500 hover:text-gray-700'
        }`}
        onClick={() => setActiveTab('schedule')}
      >
        Lịch trình
      </button>
      {mode !== 'create' && (
        <>
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'green'
                ? 'border-b-2 border-[#00668A] text-[#00668A]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('green')}
          >
            Hành động xanh
          </button>
          <button
            type="button"
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === 'services'
                ? 'border-b-2 border-[#00668A] text-[#00668A]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('services')}
          >
            Dịch vụ bổ sung
          </button>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'create'
          ? 'Thêm mới Tour Mẫu'
          : mode === 'edit'
          ? `Chỉnh sửa: ${initialData?.title}`
          : 'Sao chép Tour Mẫu'
      }
      size="3xl"
    >
      {isOpen && (
        <form onSubmit={handleSubmit} className="flex flex-col h-[70vh]">
          {renderTabs()}
          
          <div className="flex-1 overflow-y-auto pr-2 pb-4">
            {activeTab === 'info' && (
              <div className="flex flex-col gap-6">
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
              </div>
            )}

            {activeTab === 'schedule' && (
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
            )}

            {activeTab === 'green' && (
              <div className="min-h-[400px]">
                <GreenActionList />
              </div>
            )}

            {activeTab === 'services' && (
              <div className="min-h-[400px]">
                <ServiceList />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#E1F1FF] mt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Đóng
            </Button>
            {['info', 'schedule'].includes(activeTab) && (
              <Button type="submit" variant="primary">
                {mode === 'copy' ? 'Lưu bản sao' : mode === 'edit' ? 'Lưu thay đổi' : 'Tạo mới'}
              </Button>
            )}
          </div>
        </form>
      )}
    </Modal>
  );
};

export default TourTemplateDetailModal;
