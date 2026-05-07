import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import type { TourInstance } from './mockData';
import type { DaySchedule } from '../tour-template/mockData';
import { Pencil } from 'lucide-react';

export interface TourInstanceFormProps {
  mode: 'create' | 'edit';
  initialData?: TourInstance;
  templateBasePrice?: number;
  onSubmit: (data: TourInstance) => void;
  onCancel: () => void;
}

// Giả lập danh sách template để chọn khi tạo mới
const mockTemplates = [
  { id: 'TM-HL-001', name: 'Mẫu: Khám phá Vịnh Hạ Long', basePrice: 2000000, schedule: [] },
  { id: 'TM-HG-002', name: 'Mẫu: Hà Giang - Mùa Hoa Tam Giác Mạch', basePrice: 3500000, schedule: [] },
  { id: 'TM-ECO-001', name: 'Mẫu: Khám Phá Rừng Ngập Mặn Cần Giờ', basePrice: 1850000, schedule: [
    { title: 'Ngày 1: TP.HCM - Cần Giờ', description: 'Điểm đến sinh thái', meals: { breakfast: '', lunch: '', dinner: '' } }
  ] },
];

const TourInstanceForm: React.FC<TourInstanceFormProps> = ({ mode, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<TourInstance>>({
    code: '',
    name: '',
    startDate: '',
    endDate: '',
    vehicle: '',
    maxSeats: 10,
    bookedSeats: 0,
    currentPrice: 0,
    basePrice: 0,
    status: 'pending_activation',
    templateId: '',
    schedule: [],
    departureDate: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // State quản lý Modal chỉnh sửa lịch trình (Từng ngày)
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editingDayData, setEditingDayData] = useState<DaySchedule | null>(null);

  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({ ...initialData });
    }
  }, [initialData, mode]);

  // Phân quyền disable form field tuỳ trạng thái
  const isCompleted = formData.status === 'completed';
  const isActive = formData.status === 'active';
  const isFormDisabled = isCompleted;
  const isStartDateVehicleDisabled = isCompleted || isActive;

  const handleChange = (field: keyof TourInstance, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateId: template.id,
        name: template.name.replace('Mẫu: ', ''),
        basePrice: template.basePrice,
        currentPrice: template.basePrice, // Mặc định fill bằng basePrice
        schedule: template.schedule.length > 0 ? template.schedule : [{ title: 'Ngày 1: Chưa có thông tin', description: '', meals: { breakfast: '', lunch: '', dinner: '' } }]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCompleted) {
      onCancel();
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!formData.templateId && mode === 'create') newErrors.templateId = 'Vui lòng chọn Tour Mẫu';
    if (!formData.startDate) newErrors.startDate = 'Ngày khởi hành không được để trống';
    if (!formData.endDate) newErrors.endDate = 'Ngày về không được để trống';
    if (!formData.vehicle) newErrors.vehicle = 'Phương tiện không được để trống';
    
    // Validate giá bán >= giá sàn
    if ((formData.currentPrice || 0) < (formData.basePrice || 0)) {
      newErrors.currentPrice = `Giá bán phải lớn hơn hoặc bằng giá sàn (${formData.basePrice?.toLocaleString('vi-VN')} đ)`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    formData.departureDate = formData.startDate; // Đồng bộ
    onSubmit(formData as TourInstance);
  };

  const handleSaveDaySchedule = () => {
    if (editingDayIndex !== null && editingDayData) {
      const newSchedule = [...(formData.schedule || [])];
      newSchedule[editingDayIndex] = editingDayData;
      setFormData(prev => ({ ...prev, schedule: newSchedule }));
      setEditingDayIndex(null);
      setEditingDayData(null);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Chọn Tour Mẫu (Chỉ hiện khi tạo mới) */}
        {mode === 'create' && (
          <div>
            <Select
              label="Chọn Tour Mẫu *"
              options={mockTemplates.map(t => ({ value: t.id, label: t.name }))}
              value={formData.templateId}
              onChange={handleTemplateSelect}
              placeholder="-- Chọn bản mẫu --"
            />
            {errors.templateId && <span className="text-xs text-red-500 mt-1 block">{errors.templateId}</span>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày khởi hành <span className="text-red-500">*</span></label>
            <input
              type="date"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.startDate ? 'border-red-500' : 'border-[#C5EAFF]'} ${isStartDateVehicleDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.startDate || ''}
              onChange={(e) => handleChange('startDate', e.target.value)}
              disabled={isStartDateVehicleDisabled}
            />
            {errors.startDate && <span className="text-xs text-red-500 mt-1 block">{errors.startDate}</span>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày về <span className="text-red-500">*</span></label>
            <input
              type="date"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.endDate ? 'border-red-500' : 'border-[#C5EAFF]'} ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.endDate || ''}
              onChange={(e) => handleChange('endDate', e.target.value)}
              disabled={isFormDisabled}
            />
            {errors.endDate && <span className="text-xs text-red-500 mt-1 block">{errors.endDate}</span>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phương tiện <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.vehicle ? 'border-red-500' : 'border-[#C5EAFF]'} ${isStartDateVehicleDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.vehicle || ''}
              onChange={(e) => handleChange('vehicle', e.target.value)}
              disabled={isStartDateVehicleDisabled}
              placeholder="VD: Xe khách 45 chỗ"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Số chỗ tối đa</label>
            <input
              type="number"
              min={1}
              className={`w-full px-4 py-2 border border-[#C5EAFF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.maxSeats || 1}
              onChange={(e) => handleChange('maxSeats', parseInt(e.target.value) || 1)}
              disabled={isFormDisabled}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Giá bán hiện hành (VNĐ) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min={0}
              className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.currentPrice ? 'border-red-500' : 'border-[#C5EAFF]'} ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              value={formData.currentPrice || 0}
              onChange={(e) => handleChange('currentPrice', parseInt(e.target.value) || 0)}
              disabled={isFormDisabled}
            />
             {formData.basePrice ? (
               <span className="text-xs text-gray-500 mt-1 block">Giá sàn: {formData.basePrice.toLocaleString('vi-VN')} đ</span>
             ) : null}
             {errors.currentPrice && <span className="text-xs text-red-500 mt-1 block">{errors.currentPrice}</span>}
          </div>
        </div>

        {/* Section Lịch trình kế thừa (Chỉ hiển thị khi đã chọn template) */}
        {formData.schedule && formData.schedule.length > 0 && (
          <div className="mt-2">
            <h3 className="text-[18px] font-bold text-[#00668A] border-b border-[#E1F1FF] pb-2 mb-4">Lịch trình kế thừa</h3>
            <div className="flex flex-col gap-3">
              {formData.schedule.map((day, index) => (
                <div key={index} className="flex items-center justify-between bg-[#F9F9FF] border border-[#E1F1FF] p-4 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-gray-800">{day.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{day.description}</p>
                  </div>
                  {!isFormDisabled && (
                    <Button 
                      type="button" 
                      variant="secondary" 
                      size="sm" 
                      icon={<Pencil size={16} />}
                      onClick={() => {
                        setEditingDayIndex(index);
                        setEditingDayData({ ...day });
                      }}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-[#E1F1FF]">
          <Button type="button" variant="secondary" onClick={onCancel}>
            {isFormDisabled ? 'Đóng' : 'Hủy'}
          </Button>
          {!isFormDisabled && (
            <Button type="submit" variant="primary">
              {mode === 'create' ? 'Khởi tạo Tour' : 'Cập nhật Tour'}
            </Button>
          )}
        </div>
      </form>

      {/* Modal Sửa lịch trình (UC09) - Mở lồng/Đè lên trên */}
      <Modal
        isOpen={editingDayIndex !== null}
        onClose={() => setEditingDayIndex(null)}
        title={`Sửa lịch trình - Ngày ${editingDayIndex !== null ? editingDayIndex + 1 : ''}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditingDayIndex(null)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveDaySchedule}>Xác nhận thay đổi</Button>
          </>
        }
      >
        {editingDayData && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề hoạt động</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-[#C5EAFF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF]"
                value={editingDayData.title}
                onChange={(e) => setEditingDayData({ ...editingDayData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả chi tiết</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-[#C5EAFF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] resize-none"
                value={editingDayData.description}
                onChange={(e) => setEditingDayData({ ...editingDayData, description: e.target.value })}
              ></textarea>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bữa Sáng</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-[#C5EAFF] rounded text-xs focus:outline-none focus:border-[#89D4FF]"
                  value={editingDayData.meals.breakfast}
                  onChange={(e) => setEditingDayData({ ...editingDayData, meals: { ...editingDayData.meals, breakfast: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bữa Trưa</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-[#C5EAFF] rounded text-xs focus:outline-none focus:border-[#89D4FF]"
                  value={editingDayData.meals.lunch}
                  onChange={(e) => setEditingDayData({ ...editingDayData, meals: { ...editingDayData.meals, lunch: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bữa Tối</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-[#C5EAFF] rounded text-xs focus:outline-none focus:border-[#89D4FF]"
                  value={editingDayData.meals.dinner}
                  onChange={(e) => setEditingDayData({ ...editingDayData, meals: { ...editingDayData.meals, dinner: e.target.value } })}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TourInstanceForm;
