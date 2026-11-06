import React, { useEffect, useState } from 'react';
import type { Service } from '../services/mockData';
import { servicesService } from '../../services/services';
import type { DichVuThemRequest } from '../../services/services';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface TourInstanceServiceTabProps {
  services: Service[];
  onChange: (services: Service[]) => void;
  isEditing: boolean;
}

const TourInstanceServiceTab: React.FC<TourInstanceServiceTabProps> = ({ services, onChange, isEditing }) => {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Dropdown state
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<DichVuThemRequest>({ ten: '', donGia: 0, donViTinh: '', trangThai: 'HOAT_DONG' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const dichVu = await servicesService.danhSachDichVuThem().catch(() => []);
      const mappedDichVu: Service[] = dichVu.map(service => ({
        id: service.maDichVuThem || '',
        code: service.maDichVuThem || '',
        name: service.ten || '',
        category: 'extra',
        price: service.donGia || 0,
        unit: service.donViTinh || '',
        status: 'active',
      }));
      setAvailableServices(mappedDichVu);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = availableServices.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectService = (s: Service) => {
    if (!services.some(x => x.id === s.id)) {
      onChange([...services, s]);
    }
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleRemoveService = (id: string) => {
    onChange(services.filter(s => s.id !== id));
  };

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({ ten: '', donGia: 0, donViTinh: '', trangThai: 'HOAT_DONG' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: Service) => {
    setEditingService(s);
    setFormData({ ten: s.name, donGia: s.price, donViTinh: s.unit, trangThai: s.status });
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.ten || formData.donGia < 0) {
      alert('Vui lòng nhập đầy đủ thông tin hợp lệ');
      return;
    }
    setIsSubmitting(true);
    try {
      let updatedService: Service;
      const payload = { ten: formData.ten, donGia: formData.donGia, donViTinh: formData.donViTinh, trangThai: 'HOAT_DONG' };
      
      if (editingService) {
        const res = await servicesService.capNhatDichVuThem(editingService.id, payload);
        updatedService = { ...editingService, name: res?.ten || formData.ten, price: res?.donGia || formData.donGia, unit: res?.donViTinh || formData.donViTinh || '' };
      } else {
        const res = await servicesService.taoDichVuThem(payload);
        updatedService = { id: res?.maDichVuThem || '', code: res?.maDichVuThem || '', name: res?.ten || '', category: 'extra', price: res?.donGia || 0, unit: res?.donViTinh || '', status: 'active' };
      }

      if (editingService) {
        setAvailableServices(prev => prev.map(x => x.id === editingService.id ? updatedService : x));
        onChange(services.map(x => x.id === editingService.id ? updatedService : x));
      } else {
        setAvailableServices(prev => [...prev, updatedService]);
        onChange([...services, updatedService]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Lỗi: " + (err.message || 'Có lỗi xảy ra'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isEditing && (
        <div className="bg-[#F9F9FF] p-5 rounded-lg border border-[#E1F1FF]">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-gray-700">Tìm & Chọn dịch vụ bổ sung</label>
            <Button type="button" variant="primary" size="sm" icon={<Plus size={16} />} onClick={handleOpenAddModal}>
              Thêm dịch vụ mới
            </Button>
          </div>
          
          <div className="relative">
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white focus-within:ring-2 focus-within:ring-[#89D4FF]/50 focus-within:border-[#89D4FF]">
              <div className="pl-3 text-gray-400"><Search size={18} /></div>
              <input 
                type="text" 
                placeholder="Tìm kiếm dịch vụ (tên, mã)..." 
                className="w-full px-3 py-2.5 outline-none text-sm"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-[5]" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center text-sm text-gray-500">Đang tải...</div>
                  ) : filteredServices.length > 0 ? (
                    filteredServices.map(s => {
                      const isSelected = services.some(x => x.id === s.id);
                      return (
                        <div 
                          key={s.id} 
                          className={`p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center ${isSelected ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                          onClick={() => { if (!isSelected) handleSelectService(s); }}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center">
                              <span className="text-[10px] px-1.5 py-0.5 border border-gray-200 bg-gray-50 text-gray-600 rounded">
                                Mã dịch vụ: {s.code}
                              </span>
                            </div>
                            <div className="font-medium text-sm text-gray-800">{s.name}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-[#00668A]">
                              {s.price.toLocaleString('vi-VN')} đ / {s.unit}
                            </span>
                            {isSelected && <span className="text-xs text-green-600 font-medium px-2 py-0.5 bg-green-50 rounded border border-green-200">Đã chọn</span>}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-sm text-gray-500">Không tìm thấy dịch vụ nào</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-sm text-gray-500 italic p-6 bg-gray-50 rounded-lg text-center border border-dashed border-gray-300 mt-2">
          Tour này chưa cấu hình dịch vụ bổ sung nào.
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-2">
          <h4 className="font-semibold text-gray-700 text-sm mb-1">Các dịch vụ đã chọn:</h4>
          {services.map((s) => (
            <div key={s.id} className="flex justify-between items-center p-4 border border-[#89D4FF] rounded-lg bg-blue-50/20 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center">
                  <span className="text-[10px] px-1.5 py-0.5 border border-gray-200 bg-white text-gray-600 rounded">
                    Mã dịch vụ: {s.code}
                  </span>
                </div>
                <div className="font-medium text-sm text-gray-800">{s.name}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="font-semibold text-[#00668A] text-sm block">
                    {s.price.toLocaleString('vi-VN')} đ / {s.unit}
                  </span>
                </div>
                {isEditing && (
                  <div className="flex items-center gap-1.5 border-l border-blue-200 pl-4 ml-2">
                    <button type="button" onClick={() => handleOpenEditModal(s)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Sửa dịch vụ">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => handleRemoveService(s.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors" title="Xóa khỏi tour">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm/Sửa Dịch Vụ */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Sửa dịch vụ' : 'Thêm dịch vụ mới'} size="md">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên dịch vụ <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF]"
              value={formData.ten}
              onChange={e => setFormData({ ...formData, ten: e.target.value })}
              placeholder="VD: Xe đưa đón sân bay"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn giá (VNĐ) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                min={0}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF]"
                value={formData.donGia}
                onChange={e => setFormData({ ...formData, donGia: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Đơn vị tính</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-[#89D4FF]"
                value={formData.donViTinh || ''}
                onChange={e => setFormData({ ...formData, donViTinh: e.target.value })}
                placeholder="VD: Chuyến, Khách..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Hủy</Button>
            <Button type="button" variant="primary" onClick={() => handleModalSubmit()} disabled={isSubmitting}>{isSubmitting ? 'Đang lưu...' : 'Lưu'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TourInstanceServiceTab;
