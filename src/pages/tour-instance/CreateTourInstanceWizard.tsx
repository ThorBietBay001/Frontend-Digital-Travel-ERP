import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { tourTemplateService } from '../../services/tour-template';
import type { TourMauResponse } from '../../services/tour-template';
import { tourInstanceService } from '../../services/tour-instance';
import type { TaoTourThucTeRequest, CapNhatTourThucTeRequest } from '../../services/tour-instance';
import type { TourInstance } from './mockData';
import TourInstanceServiceTab from './TourInstanceServiceTab';
import TourInstanceGreenActionTab from './TourInstanceGreenActionTab';

export interface CreateTourInstanceWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateTourInstanceWizard: React.FC<CreateTourInstanceWizardProps> = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [createdTourId, setCreatedTourId] = useState<string | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [templates, setTemplates] = useState<TourMauResponse[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Partial<TourInstance>>({
    templateId: '',
    startDate: '',
    minSeats: 1,
    maxSeats: 10,
    currentPrice: 0,
    basePrice: 0,
    status: 'CHO_KICH_HOAT',
    schedule: [],
    services: [],
    greenActions: []
  });

  useEffect(() => {
    if (isOpen) {
      tourTemplateService.danhSach().then(res => {
        if (res && res.content) {
          setTemplates(res.content);
        }
      }).catch(console.error);
      setStep(1);
      setCreatedTourId(null);
      setFormData({
        templateId: '',
        startDate: '',
        minSeats: 1,
        maxSeats: 10,
        currentPrice: 0,
        basePrice: 0,
        status: 'CHO_KICH_HOAT',
        schedule: [],
        services: [],
        greenActions: []
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (field: keyof TourInstance, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTemplateSelect = async (templateId: string) => {
    const template = templates.find(t => t.maTourMau === templateId);
    if (template) {
      try {
        const detail = await tourTemplateService.chiTiet(templateId);
        const parsedSchedule = (detail?.lichTrinh || []).map((lt: any) => {
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

        setFormData(prev => ({
          ...prev,
          templateId: template.maTourMau,
          name: template.tieuDe || '',
          basePrice: template.giaSan || 0,
          currentPrice: template.giaSan || 0,
          schedule: parsedSchedule.length > 0 ? parsedSchedule : [{ title: 'Ngày 1: Chưa có thông tin', description: '', meals: { breakfast: '', lunch: '', dinner: '' } }],
        }));
      } catch (err) {
        alert('Lỗi lấy chi tiết tour mẫu');
      }
    }
  };

  const changeStep = (newStep: 1 | 2 | 3) => {
    setIsFading(true);
    setTimeout(() => {
      setStep(newStep);
      setIsFading(false);
    }, 300);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.templateId) newErrors.templateId = 'Vui lòng chọn Tour Mẫu';
    if (!formData.startDate) newErrors.startDate = 'Ngày khởi hành không được để trống';
    if ((formData.currentPrice || 0) < (formData.basePrice || 0)) {
      newErrors.currentPrice = `Giá bán phải lớn hơn hoặc bằng giá sàn (${formData.basePrice?.toLocaleString('vi-VN')} đ)`;
    }
    if ((formData.maxSeats || 10) < (formData.minSeats || 1)) {
      newErrors.maxSeats = 'Số chỗ tối đa phải lớn hơn hoặc bằng số chỗ tối thiểu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createTour = async () => {
    const payload: TaoTourThucTeRequest = {
      maTourMau: formData.templateId,
      ngayKhoiHanh: formData.startDate,
      soKhachToiDa: formData.maxSeats,
      soKhachToiThieu: formData.minSeats,
      giaHienHanh: formData.currentPrice,
      trangThai: formData.status
    };
    return tourInstanceService.taoMoi(payload);
  };

  const handleStep1Continue = async () => {
    if (!validateStep1()) return;
    try {
      const created = await createTour();
      if (created?.maTourThucTe) {
        setCreatedTourId(created.maTourThucTe);
        alert('Tạo tour thành công');
        changeStep(2);
      }
    } catch (err: any) {
      alert('Lỗi khi tạo tour: ' + (err.message || 'Unknown error'));
    }
  };

  const handleStep1SkipAndCreate = async () => {
    if (!validateStep1()) return;
    try {
      await createTour();
      alert('Khởi tạo tour thành công');
      onSuccess();
    } catch (err: any) {
      alert('Lỗi khi tạo tour: ' + (err.message || 'Unknown error'));
    }
  };

  const handleStep2SaveAndContinue = async () => {
    try {
      if (createdTourId) {
        const payload: CapNhatTourThucTeRequest = {
          maDichVuThem: (formData.services || []).map(s => s.id)
        };
        await tourInstanceService.capNhat(createdTourId, payload);
      }
      changeStep(3);
    } catch (err: any) {
      alert('Lỗi cập nhật dịch vụ: ' + (err.message || 'Unknown error'));
    }
  };

  const handleStep3Finish = async () => {
    try {
      if (createdTourId) {
        const payload: CapNhatTourThucTeRequest = {
          maDichVuThem: (formData.services || []).map(s => s.id),
          maHanhDongXanh: (formData.greenActions || []).map(a => a.id)
        };
        await tourInstanceService.capNhat(createdTourId, payload);
      }
      alert('Hoàn tất cấu hình tour!');
      onSuccess();
    } catch (err: any) {
      alert('Lỗi cập nhật hành động xanh: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Khởi tạo Tour Thực Tế (Bước ${step}/3)`}
      size="3xl"
    >
      <div className={`transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'} flex flex-col h-[70vh]`}>
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-[#00668A] mb-2">Bước 1: Thông tin chung</h2>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Ngày khởi hành <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.startDate ? 'border-red-500' : 'border-[#C5EAFF]'}`}
                    value={formData.startDate || ''}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                  />
                  {errors.startDate && <span className="text-xs text-red-500 mt-1 block">{errors.startDate}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái <span className="text-red-500">*</span></label>
                  <Select
                    options={[
                      { label: 'Chờ kích hoạt', value: 'CHO_KICH_HOAT' },
                      { label: 'Mở bán', value: 'MO_BAN' },
                    ]}
                    value={formData.status}
                    onChange={(value) => handleChange('status', value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số chỗ tối thiểu</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-4 py-2 border border-[#C5EAFF] rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20"
                    value={formData.minSeats || 1}
                    onChange={(e) => handleChange('minSeats', parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Số chỗ tối đa</label>
                  <input
                    type="number"
                    min={1}
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.maxSeats ? 'border-red-500' : 'border-[#C5EAFF]'}`}
                    value={formData.maxSeats || 10}
                    onChange={(e) => handleChange('maxSeats', parseInt(e.target.value) || 1)}
                  />
                  {errors.maxSeats && <span className="text-xs text-red-500 mt-1 block">{errors.maxSeats}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Giá bán hiện hành (VNĐ) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={0}
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF] focus:ring-[#89D4FF]/20 ${errors.currentPrice ? 'border-red-500' : 'border-[#C5EAFF]'}`}
                    value={formData.currentPrice || 0}
                    onChange={(e) => handleChange('currentPrice', parseInt(e.target.value) || 0)}
                  />
                  {formData.basePrice ? (
                    <span className="text-xs text-gray-500 mt-1 block">Giá sàn: {formData.basePrice.toLocaleString('vi-VN')} đ</span>
                  ) : null}
                  {errors.currentPrice && <span className="text-xs text-red-500 mt-1 block">{errors.currentPrice}</span>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-5 min-h-[400px]">
              <h2 className="text-xl font-bold text-[#00668A] mb-2">Bước 2: Cấu hình Dịch vụ Bổ sung</h2>
              <TourInstanceServiceTab
                services={formData.services || []}
                isEditing={true}
                onChange={(services) => handleChange('services', services)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-5 min-h-[400px]">
              <h2 className="text-xl font-bold text-[#00668A] mb-2">Bước 3: Cấu hình Hành động Xanh</h2>
              <TourInstanceGreenActionTab
                selectedActions={formData.greenActions || []}
                onChange={(actions) => handleChange('greenActions', actions)}
                isEditing={true}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t border-[#E1F1FF] mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <div className="flex gap-3">
            {step === 1 && (
              <>
                <Button type="button" variant="secondary" onClick={handleStep1SkipAndCreate}>
                  Bỏ qua & Tạo ngay
                </Button>
                <Button type="button" variant="primary" onClick={handleStep1Continue}>
                  Tiếp tục
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <Button type="button" variant="secondary" onClick={() => changeStep(3)}>
                  Bỏ qua
                </Button>
                <Button type="button" variant="primary" onClick={handleStep2SaveAndContinue}>
                  Lưu & Tiếp tục
                </Button>
              </>
            )}
            {step === 3 && (
              <>
                <Button type="button" variant="secondary" onClick={onSuccess}>
                  Bỏ qua
                </Button>
                <Button type="button" variant="primary" onClick={handleStep3Finish}>
                  Hoàn tất
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateTourInstanceWizard;
