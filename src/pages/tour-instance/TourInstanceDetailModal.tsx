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

export interface TourInstanceFormProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: TourInstance;
  onSubmit: (data: TourInstance) => void;
  onSuccess?: () => void;
}

const tachTimelineHoatDong = (giaTri: string): string[] => {
  return giaTri.split(/\r?\n/).map((dong) => dong.trim()).filter(Boolean);
};

const TourInstanceDetailModal: React.FC<TourInstanceFormProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
  onSuccess
}) => {
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
    services: [],
    greenActions: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [descParts, setDescParts] = useState({
    short: '',
    included: '',
    notIncluded: ''
  });
  const [activeTab, setActiveTab] = useState<'info' | 'services' | 'greenActions'>('info');
  const [editingDayIndex, setEditingDayIndex] = useState<number | null>(null);
  const [editingDayData, setEditingDayData] = useState<DaySchedule | null>(null);
  const [templates, setTemplates] = useState<TourMauResponse[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [createdTourId, setCreatedTourId] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'create') {
      tourTemplateService.danhSach().then(res => {
        if (res && res.content) {
          setTemplates(res.content);
        }
      }).catch(console.error);
    }
  }, [mode]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setActiveTab('info');
      setCreatedTourId(null);
      setErrors({});
      setDescParts({ short: '', included: '', notIncluded: '' });
      return;
    }
    if (initialData && mode === 'edit') {
      setFormData({ ...initialData });
      setIsLoadingDetail(true);
      tourInstanceService.chiTiet(initialData.id).then(async (res: any) => {
        if (res) {
           let parsedSchedule: any[] = [];
           if (res.maTourMau) {
             try {
               const templateDetail = await tourTemplateService.chiTiet(res.maTourMau);
               if (templateDetail && templateDetail.lichTrinh) {
                 parsedSchedule = templateDetail.lichTrinh.map((lt: any) => {
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

                 let desc = templateDetail.moTa || '';
                 let short = desc;
                 let included = '';
                 let notIncluded = '';
                 const incMatch = desc.match(/Bao gồm:\s*\n([\s\S]*?)(?:Không bao gồm:\s*\n|$)/);
                 const notIncMatch = desc.match(/Không bao gồm:\s*\n([\s\S]*)$/);
                 if (incMatch) included = incMatch[1].trim();
                 if (notIncMatch) notIncluded = notIncMatch[1].trim();
                 const firstKeywordIndex = desc.search(/Bao gồm:\s*\n|Không bao gồm:\s*\n/);
                 if (firstKeywordIndex !== -1) {
                   short = desc.substring(0, firstKeywordIndex).trim();
                 } else {
                   short = desc.trim();
                 }
                 setDescParts({ short, included, notIncluded });
               }
             } catch (e) {
               console.error('Failed to load schedule from template', e);
             }
           }

           const services = (res.dichVu || []).map((service: any) => ({
             id: service.maDichVuThem || '',
             code: service.maDichVuThem || '',
             name: service.ten || '',
             category: 'Dịch vụ thêm',
             price: service.donGia || 0,
             unit: service.donViTinh || '',
             status: 'active',
           }));

           const greenActions = (res.hanhDongXanh || []).map((action: any) => ({
             id: action.maHanhDongXanh || '',
             code: action.maHanhDongXanh || '',
             name: action.tenHanhDong || '',
             description: '',
             defaultPoints: action.diemCong || 0,
             status: 'active',
           }));

           setFormData(prev => ({
             ...prev,
             schedule: parsedSchedule.length > 0 ? parsedSchedule : prev.schedule,
             services,
             greenActions
           }));
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
        services: [],
        greenActions: [],
      });
    }
  }, [initialData, mode, isOpen]);

  const isFormDisabled = mode === 'edit' && initialData && initialData.status !== 'CHO_KICH_HOAT';

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

        let desc = detail.moTa || '';
        let short = desc;
        let included = '';
        let notIncluded = '';
        const incMatch = desc.match(/Bao gồm:\s*\n([\s\S]*?)(?:Không bao gồm:\s*\n|$)/);
        const notIncMatch = desc.match(/Không bao gồm:\s*\n([\s\S]*)$/);
        if (incMatch) included = incMatch[1].trim();
        if (notIncMatch) notIncluded = notIncMatch[1].trim();
        const firstKeywordIndex = desc.search(/Bao gồm:\s*\n|Không bao gồm:\s*\n/);
        if (firstKeywordIndex !== -1) {
          short = desc.substring(0, firstKeywordIndex).trim();
        } else {
          short = desc.trim();
        }
        setDescParts({ short, included, notIncluded });

        setFormData((prev) => ({
          ...prev,
          templateId: template.maTourMau,
          name: detail.tieuDe || template.tieuDe || '',
          basePrice: detail.giaSan || template.giaSan || 0,
          currentPrice: detail.giaSan || template.giaSan || 0,
          schedule: parsedSchedule.length > 0 ? parsedSchedule : [{ title: 'Ngày 1: Chưa có thông tin', description: '', meals: { breakfast: '', lunch: '', dinner: '' } }],
        }));
      } catch (err) {
        alert('Lỗi lấy chi tiết tour mẫu');
      }
    }
  };

  const handleStep1Next = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.templateId) newErrors.templateId = 'Vui lòng chọn Tour Mẫu';
    if (!formData.startDate) newErrors.startDate = 'Ngày khởi hành không được để trống';
    if (!formData.maxSeats || formData.maxSeats <= 0) newErrors.maxSeats = 'Số chỗ phải lớn hơn 0';
    if ((formData.currentPrice || 0) < (formData.basePrice || 0)) {
      newErrors.currentPrice = `Giá bán phải lớn hơn hoặc bằng giá sàn (${formData.basePrice?.toLocaleString('vi-VN')} đ)`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        maTourMau: formData.templateId!,
        ngayKhoiHanh: formData.startDate!,
        soKhachToiDa: formData.maxSeats!,
        soKhachToiThieu: formData.minSeats || 1,
        giaHienHanh: formData.currentPrice!,
        trangThai: formData.status!,
        lichTrinh: formData.schedule,
      };
      
      const createdTour = await tourInstanceService.taoMoi(payload);
      if (createdTour && createdTour.maTourThucTe) {
        setCreatedTourId(createdTour.maTourThucTe);
        alert('Tạo tour thành công');
        setCurrentStep(2);
      }
    } catch (err: any) {
      alert("Lỗi tạo tour: " + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep2Next = async () => {
    setIsSubmitting(true);
    try {
      if (createdTourId && formData.services && formData.services.length > 0) {
        await tourInstanceService.capNhat(createdTourId, {
          giaHienHanh: formData.currentPrice,
          soKhachToiDa: formData.maxSeats,
          trangThai: formData.status,
          maDichVuThem: formData.services.map(s => s.id)
        });
      }
      setCurrentStep(3);
    } catch (err: any) {
      alert("Lỗi cập nhật dịch vụ: " + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStep3Finish = async () => {
    setIsSubmitting(true);
    try {
      if (createdTourId && formData.greenActions) {
        await tourInstanceService.capNhat(createdTourId, {
          giaHienHanh: formData.currentPrice,
          soKhachToiDa: formData.maxSeats,
          soKhachToiThieu: formData.minSeats,
          trangThai: formData.status,
          maDichVuThem: (formData.services || []).map(s => s.id),
          maHanhDongXanh: (formData.greenActions || []).map(a => a.id)
        });
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert("Lỗi cập nhật hành động xanh: " + (err.message || ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormDisabled) {
      onClose();
      return;
    }
    
    const newErrors: Record<string, string> = {};
    if (!formData.startDate) newErrors.startDate = 'Ngày khởi hành không được để trống';
    if ((formData.currentPrice || 0) < (formData.basePrice || 0)) {
      newErrors.currentPrice = `Giá bán phải lớn hơn hoặc bằng giá sàn (${formData.basePrice?.toLocaleString('vi-VN')} đ)`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setActiveTab('info');
      return;
    }

    onSubmit(formData as TourInstance);
  };

  const renderInfoForm = () => (
    <div className="flex flex-col gap-5 animate-fadeIn">
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
          {formData.schedule && formData.schedule.length > 0 && (
            <div className="mt-2 flex justify-end">
              <span className="text-sm font-medium text-[#00668A]">
                Thời lượng: {formData.schedule.length} ngày
              </span>
            </div>
          )}

          {/* Read-only Template Description Parts */}
          {(descParts.short || descParts.included || descParts.notIncluded) && (
            <div className="flex flex-col gap-4 mt-2">
              {descParts.short && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả ngắn</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 border border-[#C5EAFF] bg-gray-50 rounded-lg text-sm focus:outline-none cursor-not-allowed resize-none"
                    value={descParts.short}
                    disabled
                  ></textarea>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {descParts.included && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bao gồm</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-[#C5EAFF] bg-gray-50 rounded-lg text-sm focus:outline-none cursor-not-allowed resize-none"
                      value={descParts.included}
                      disabled
                    ></textarea>
                  </div>
                )}
                {descParts.notIncluded && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Không bao gồm</label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-2 border border-[#C5EAFF] bg-gray-50 rounded-lg text-sm focus:outline-none cursor-not-allowed resize-none"
                      value={descParts.notIncluded}
                      disabled
                    ></textarea>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className={`grid grid-cols-2 gap-4`}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày khởi hành <span className="text-red-500">*</span></label>
          <input
            type="date"
            className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.startDate ? 'border-red-500' : 'border-[#C5EAFF]'} ${isFormDisabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            value={formData.startDate || ''}
            onChange={(e) => {
               handleChange('startDate', e.target.value);
               // Simple auto calculation of end date based on schedule length
               if (e.target.value && formData.schedule?.length) {
                 const start = new Date(e.target.value);
                 start.setDate(start.getDate() + formData.schedule.length - 1);
                 const yyyy = start.getFullYear();
                 const mm = String(start.getMonth() + 1).padStart(2, '0');
                 const dd = String(start.getDate()).padStart(2, '0');
                 handleChange('endDate', `${yyyy}-${mm}-${dd}`);
               }
            }}
            disabled={isFormDisabled}
          />
          {errors.startDate && <span className="text-xs text-red-500 mt-1 block">{errors.startDate}</span>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày kết thúc</label>
          <input
            type="date"
            className={`w-full px-4 py-2 border border-[#C5EAFF] bg-gray-50 rounded-lg text-sm focus:outline-none cursor-not-allowed`}
            value={formData.endDate || ''}
            disabled
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái ban đầu <span className="text-red-500">*</span></label>
          <Select
            options={[
              { label: 'Chờ kích hoạt', value: 'CHO_KICH_HOAT' },
              { label: 'Mở bán', value: 'MO_BAN' }
            ]}
            value={formData.status}
            onChange={(value) => handleChange('status', value)}
            disabled={isFormDisabled}
          />
        </div>
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
          {errors.maxSeats && <span className="text-xs text-red-500 mt-1 block">{errors.maxSeats}</span>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
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

      {mode === 'edit' && (descParts.short || descParts.included || descParts.notIncluded) && (
        <div className="flex flex-col gap-4 mt-2">
          {descParts.short && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả ngắn</label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-[#C5EAFF] bg-gray-50 rounded-lg text-sm focus:outline-none cursor-not-allowed resize-none"
                value={descParts.short}
                disabled
              ></textarea>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {descParts.included && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bao gồm</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-[#C5EAFF] bg-gray-50 rounded-lg text-sm focus:outline-none cursor-not-allowed resize-none"
                  value={descParts.included}
                  disabled
                ></textarea>
              </div>
            )}
            {descParts.notIncluded && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Không bao gồm</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 border border-[#C5EAFF] bg-gray-50 rounded-lg text-sm focus:outline-none cursor-not-allowed resize-none"
                  value={descParts.notIncluded}
                  disabled
                ></textarea>
              </div>
            )}
          </div>
        </div>
      )}

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
                  <h4 className="font-bold text-[#00668A] text-base">Ngày {index + 1}</h4>
                  <div className="mt-2 flex flex-col gap-1.5">
                    {tachTimelineHoatDong(day.title).map((hoatDong, mocGioIndex) => (
                      <p key={mocGioIndex} className="text-sm text-gray-700">{hoatDong}</p>
                    ))}
                  </div>
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
            Chưa có thông tin lịch trình
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={mode === 'create' ? (currentStep === 1 ? 'Khởi tạo Tour Thực Tế' : currentStep === 2 ? 'Dịch vụ bổ sung' : 'Hành động xanh') : (isFormDisabled ? `Chi tiết: ${initialData?.name}` : `Cập nhật: ${initialData?.name}`)}
        size="3xl"
      >
        {mode === 'create' ? (
          // WIZARD UI
          <div className="flex flex-col h-[75vh]">


            <div className="flex-1 overflow-y-auto pr-2 pb-4">
              {currentStep === 1 && (
                <div className="animate-fadeIn">
                  {renderInfoForm()}
                </div>
              )}
              {currentStep === 2 && (
                <div className="min-h-[400px] animate-fadeIn">
                  <TourInstanceServiceTab 
                    services={formData.services || []} 
                    onChange={(services) => handleChange('services', services)}
                    isEditing={true} 
                  />
                </div>
              )}
              {currentStep === 3 && (
                <div className="min-h-[400px] animate-fadeIn">
                  <TourInstanceGreenActionTab 
                    selectedActions={formData.greenActions || []} 
                    onChange={(actions) => handleChange('greenActions', actions)} 
                    isEditing={true}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#E1F1FF] mt-4">
              {currentStep === 1 && (
                <>
                  <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
                  <Button type="button" variant="primary" onClick={handleStep1Next} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang xử lý...' : 'Tạo Tour'}
                  </Button>
                </>
              )}
              {currentStep === 2 && (
                <>
                  <Button type="button" variant="secondary" onClick={() => setCurrentStep(3)} disabled={isSubmitting}>Bỏ qua</Button>
                  <Button type="button" variant="primary" onClick={handleStep2Next} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang tạo...' : 'Tạo'}
                  </Button>
                </>
              )}
              {currentStep === 3 && (
                <>
                  <Button type="button" variant="secondary" onClick={() => { if (onSuccess) onSuccess(); }} disabled={isSubmitting}>Bỏ qua</Button>
                  <Button type="button" variant="primary" onClick={handleStep3Finish} disabled={isSubmitting}>
                    {isSubmitting ? 'Đang hoàn tất...' : 'Hoàn tất'}
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          // EDIT / VIEW UI
          <form onSubmit={handleEditSubmit} className="flex flex-col h-[75vh]">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'info' ? 'border-b-2 border-[#00668A] text-[#00668A]' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('info')}
              >
                Thông tin chung & Lịch trình
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'services' ? 'border-b-2 border-[#00668A] text-[#00668A]' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('services')}
              >
                Dịch vụ bổ sung
              </button>
              <button
                type="button"
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'greenActions' ? 'border-b-2 border-[#00668A] text-[#00668A]' : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('greenActions')}
              >
                Hành động xanh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 pb-4">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center h-full text-[#00668A]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A] mr-3"></div>
                  Đang tải dữ liệu...
                </div>
              ) : (
                <>
                  {activeTab === 'info' && renderInfoForm()}
                  {activeTab === 'services' && (
                    <TourInstanceServiceTab 
                      services={formData.services || []} 
                      onChange={(services) => handleChange('services', services)}
                      isEditing={!isFormDisabled} 
                    />
                  )}
                  {activeTab === 'greenActions' && (
                    <TourInstanceGreenActionTab 
                      selectedActions={formData.greenActions || []} 
                      onChange={(actions) => handleChange('greenActions', actions)} 
                      isEditing={!isFormDisabled}
                    />
                  )}
                </>
              )}
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-[#E1F1FF] mt-4">
              <Button type="button" variant="secondary" onClick={onClose}>
                {isFormDisabled ? 'Đóng' : 'Hủy'}
              </Button>
              {!isFormDisabled && (
                <Button type="submit" variant="primary">Lưu thay đổi</Button>
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
            <Button variant="primary" onClick={() => {
              if (editingDayIndex !== null && editingDayData) {
                const newSchedule = [...(formData.schedule || [])];
                newSchedule[editingDayIndex] = editingDayData;
                setFormData(prev => ({ ...prev, schedule: newSchedule }));
                setEditingDayIndex(null);
                setEditingDayData(null);
              }
            }}>Xác nhận thay đổi</Button>
          </>
        }
      >
        {editingDayData && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Timeline hoạt động (HH:mm - Hoạt động)</label>
              <textarea
                rows={5}
                maxLength={1000}
                className="w-full px-4 py-2 border border-[#C5EAFF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF]"
                value={editingDayData.title}
                onChange={(e) => setEditingDayData({ ...editingDayData, title: e.target.value })}
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ghi chú lịch trình</label>
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

// trigger hmr
