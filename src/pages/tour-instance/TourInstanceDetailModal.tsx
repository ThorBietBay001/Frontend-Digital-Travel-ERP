import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Select } from '../../components/ui/Select';
import type { TourInstance } from './mockData';
import type { DaySchedule } from '../tour-template/mockData';
import { Pencil } from 'lucide-react';
import TourInstanceGreenActionTab from './TourInstanceGreenActionTab';
import TourInstanceServiceTab from './TourInstanceServiceTab';
import { tourTemplateService } from '../../services/tour-template';
import type { TourMauResponse } from '../../services/tour-template';
import { tourInstanceService } from '../../services/tour-instance';

export interface TourInstanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: TourInstance;
  onSubmit: (data: TourInstance) => void;
}

// No static mockTemplates anymore

const TourInstanceDetailModal: React.FC<TourInstanceDetailModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'green' | 'services'>('info');

  const [formData, setFormData] = useState<Partial<TourInstance>>({
    name: '',
    startDate: '',
    endDate: '',
    maxSeats: 10,
    bookedSeats: 0,
    currentPrice: 0,
    basePrice: 0,
    status: 'CHO_KICH_HOAT',
    templateId: '',
    schedule: [],
    departureDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editingDayData, setEditingDayData] = useState<DaySchedule | null>(null);
  const [templates, setTemplates] = useState<TourMauResponse[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  useEffect(() => {
    tourTemplateService.danhSach().then(res => {
      if (res && res.content) {
        setTemplates(res.content);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('info');
      setErrors({});
      return;
    }
    if (initialData && mode === 'edit') {
      setFormData({ ...initialData });
      setIsLoadingDetail(true);
      tourInstanceService.chiTietCongKhai(initialData.id).then(res => {
        if (res) {
           const rawSchedule = (res as any).lichTrinh;
           if (rawSchedule && Array.isArray(rawSchedule) && rawSchedule.length > 0) {
             const parsedSchedule = rawSchedule.map((lt: any) => {
               let meals = { breakfast: '', lunch: '', dinner: '' };
               if (lt.thucDon) {
                 try { meals = JSON.parse(lt.thucDon); } catch { /* ignore */ }
               } else if (lt.meals) {
                 meals = lt.meals;
               }
               return {
                 title: lt.hoatDong || lt.title || `Ngày ${lt.ngayThu || ''}`,
                 description: lt.moTa || lt.description || '',
                 meals
               };
             });
             setFormData(prev => ({
               ...prev,
               schedule: parsedSchedule
             }));
           }
        }
      }).catch(console.error).finally(() => {
        setIsLoadingDetail(false);
      });
    } else {
      setFormData({
        name: '',
        startDate: '',
        endDate: '',
        maxSeats: 10,
        bookedSeats: 0,
        currentPrice: 0,
        basePrice: 0,
        status: 'CHO_KICH_HOAT',
        templateId: '',
        schedule: [],
        departureDate: '',
      });
    }
  }, [initialData, mode, isOpen]);

  const isFormDisabled = mode === 'edit' && !['CHO_KICH_HOAT', 'SAP_DIEN_RA'].includes(formData.status || '');
  const isStartDateDisabled = isFormDisabled || mode === 'edit';
  const isStatusDisabled = isFormDisabled;

  const handleChange = (field: keyof TourInstance, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    const template = templates.find(t => t.maTourMau === templateId);
    if (template) {
      try {
        const detail = await tourTemplateService.chiTiet(templateId);
        if (!detail) return;
        const parsedSchedule = (detail.lichTrinh || []).map((lt: any) => {
          let meals = { breakfast: '', lunch: '', dinner: '' };
          if (lt.thucDon) {
            try { meals = JSON.parse(lt.thucDon); } catch { /* ignore */ }
          }
          return {
            title: lt.hoatDong || `Ngày ${lt.ngayThu}`,
            description: lt.moTa || '',
            meals
          };
        });

        setFormData((prev) => ({
          ...prev,
          templateId: template.maTourMau,
          name: template.tieuDe || '',
          basePrice: template.giaSan || 0,
          currentPrice: template.giaSan || 0,
          schedule: parsedSchedule.length > 0 ? parsedSchedule : [{ title: 'Ngày 1: Chưa có thông tin', description: '', meals: { breakfast: '', lunch: '', dinner: '' } }],
          services: [], // Inherit services if they were stored in detail
          greenActions: [], // Inherit green actions if they were stored in detail
        }));
      } catch (err) {
        alert('Lỗi lấy chi tiết tour mẫu');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormDisabled) {
      onClose();
      return;
    }

    const newErrors: Record<string, string> = {};
    if (!formData.templateId && mode === 'create') newErrors.templateId = 'Vui lòng chọn Tour Mẫu';
    if (!formData.startDate) newErrors.startDate = 'Ngày khởi hành không được để trống';
    if (!formData.endDate) newErrors.endDate = 'Ngày về không được để trống';
    
    if ((formData.currentPrice || 0) < (formData.basePrice || 0)) {
      newErrors.currentPrice = `Giá bán phải lớn hơn hoặc bằng giá sàn (${formData.basePrice?.toLocaleString('vi-VN')} đ)`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveTab('info');
      return;
    }

    formData.departureDate = formData.startDate;


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
        Thông tin chung & Lịch trình
      </button>
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
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'create' ? 'Khởi tạo Tour Thực Tế từ Tour Mẫu' : `Cập nhật: ${initialData?.name}`}
        size="3xl"
      >
        {isOpen && (
          <form onSubmit={handleSubmit} className="flex flex-col h-[70vh]">
            {renderTabs()}

            <div className="flex-1 overflow-y-auto pr-2 pb-4">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center h-full text-[#00668A]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A] mr-3"></div>
                  Đang tải dữ liệu...
                </div>
              ) : (
                <>
                  {activeTab === 'info' && (
                <div className="flex flex-col gap-5">
                  {mode === 'create' && (
                    <div>
                      <Select
                        label="Chọn Tour Mẫu *"
                        options={templates.map(t => ({ value: t.maTourMau || '', label: t.tieuDe || '' }))}
                        value={formData.templateId}
                        onChange={handleTemplateSelect}
                        placeholder="-- Chọn bản mẫu --"
                      />
                      {errors.templateId && <span className="text-xs text-red-500 mt-1 block">{errors.templateId}</span>}
                    </div>
                  )}

                  <div className={`grid ${mode === 'create' ? 'grid-cols-3' : 'grid-cols-2'} gap-4`}>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày khởi hành <span className="text-red-500">*</span></label>
                      <input
                        type="date"
                        className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.startDate ? 'border-red-500' : 'border-[#C5EAFF]'} ${isStartDateDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={formData.startDate || ''}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                        disabled={isStartDateDisabled}
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
                    {(mode === 'create' || mode === 'edit') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái <span className="text-red-500">*</span></label>
                        <Select
                          options={[
                            { label: 'Chờ kích hoạt', value: 'CHO_KICH_HOAT' },
                            { label: 'Mở bán', value: 'MO_BAN' },
                            { label: 'Sắp diễn ra', value: 'SAP_DIEN_RA' },
                          ]}
                          value={formData.status}
                          onChange={(value) => handleChange('status', value)}
                          disabled={isStatusDisabled}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                  {formData.schedule && formData.schedule.length > 0 ? (
                    <div className="mt-2">
                      <h3 className="text-[18px] font-bold text-[#00668A] border-b border-[#E1F1FF] pb-2 mb-4">Lịch trình chi tiết</h3>
                      <div className="flex flex-col gap-4">
                        {formData.schedule.map((day, index) => (
                          <div key={index} className="bg-[#F9F9FF] border border-[#E1F1FF] p-4 rounded-lg flex flex-col gap-3 relative">
                            {!isFormDisabled && (
                              <div className="absolute top-4 right-4">
                                <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="sm" 
                                  icon={<Pencil size={16} />}
                                  onClick={() => {
                                    setEditingDayIndex(index);
                                    setEditingDayData({ ...day });
                                  }}
                                  className="text-gray-500 hover:text-[#00668A] bg-white border border-gray-200"
                                >
                                  Sửa
                                </Button>
                              </div>
                            )}
                            <div className={!isFormDisabled ? 'pr-20' : ''}>
                              <h4 className="font-bold text-[#00668A] text-base">{day.title}</h4>
                              {day.description && <p className="text-sm text-gray-700 mt-1 whitespace-pre-line">{day.description}</p>}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-xs mt-1">
                              <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                                <span className="font-semibold text-gray-500 block mb-1">Sáng</span>
                                <span className="text-gray-800">{day.meals?.breakfast || 'Tự túc'}</span>
                              </div>
                              <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                                <span className="font-semibold text-gray-500 block mb-1">Trưa</span>
                                <span className="text-gray-800">{day.meals?.lunch || 'Tự túc'}</span>
                              </div>
                              <div className="bg-white p-2 rounded border border-gray-100 shadow-sm">
                                <span className="font-semibold text-gray-500 block mb-1">Tối</span>
                                <span className="text-gray-800">{day.meals?.dinner || 'Tự túc'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <h3 className="text-[18px] font-bold text-[#00668A] border-b border-[#E1F1FF] pb-2 mb-4">Lịch trình chi tiết</h3>
                      <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500 text-sm">
                        Chưa có lịch trình
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'green' && (
                <div className="min-h-[400px]">
                  <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg mb-4 text-sm">
                    <strong>Lưu ý:</strong> Tính năng đang phát triển. Dữ liệu chưa được lưu vào database.
                  </div>
                  <TourInstanceGreenActionTab 
                    selectedActions={formData.greenActions || []} 
                    onChange={(actions) => handleChange('greenActions', actions)} 
                    isEditing={!isFormDisabled}
                  />
                </div>
              )}

              {activeTab === 'services' && (
                <div className="min-h-[400px]">
                  <TourInstanceServiceTab 
                    services={formData.services || []} 
                    onChange={(services) => handleChange('services', services)}
                    isEditing={!isFormDisabled} 
                  />
                </div>
              )}
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E1F1FF] mt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                {isFormDisabled ? 'Đóng' : 'Hủy'}
              </Button>
              {!isFormDisabled && (
                <Button type="submit" variant="primary">
                  {mode === 'create' ? 'Khởi tạo Tour' : 'Cập nhật Tour'}
                </Button>
              )}
            </div>
          </form>
        )}
      </Modal>

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
                  value={editingDayData.meals?.breakfast || ''}
                  onChange={(e) => setEditingDayData({ ...editingDayData, meals: { ...(editingDayData.meals || {}), breakfast: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bữa Trưa</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-[#C5EAFF] rounded text-xs focus:outline-none focus:border-[#89D4FF]"
                  value={editingDayData.meals?.lunch || ''}
                  onChange={(e) => setEditingDayData({ ...editingDayData, meals: { ...(editingDayData.meals || {}), lunch: e.target.value } })}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Bữa Tối</label>
                <input
                  type="text"
                  className="w-full px-3 py-1.5 border border-[#C5EAFF] rounded text-xs focus:outline-none focus:border-[#89D4FF]"
                  value={editingDayData.meals?.dinner || ''}
                  onChange={(e) => setEditingDayData({ ...editingDayData, meals: { ...(editingDayData.meals || {}), dinner: e.target.value } })}
                />
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TourInstanceDetailModal;
