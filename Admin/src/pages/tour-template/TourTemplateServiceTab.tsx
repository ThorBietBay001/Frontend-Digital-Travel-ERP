import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { servicesService } from '../../services/services';
import type { Service } from '../services/mockData';
import { Modal } from '../../components/ui/Modal';
import ServiceForm from '../services/ServiceForm';
import { formatApiError } from '../../utils/apiHelpers';
import type { DichVuThemRequest } from '../../services/services';

interface TourTemplateServiceTabProps {
  selectedServices: Service[];
  onChange: (services: Service[]) => void;
}

const TourTemplateServiceTab: React.FC<TourTemplateServiceTabProps> = ({ selectedServices, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      // The backend API doesn't actually support 'ten' query, but we fetch all and filter on frontend
      const res = await servicesService.danhSachDichVuThem();
      const mapped: Service[] = res.map((r) => ({
        id: r.maDichVuThem || '',
        code: r.maDichVuThem || '',
        name: r.ten || '',
        category: 'extra',
        price: r.donGia || 0,
        unit: r.donViTinh || '',
        status: r.trangThai?.toUpperCase() === 'ACTIVE' ? 'active' : 'inactive',
      }));
      setAvailableServices(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSelectService = (service: Service) => {
    if (!selectedServices.find((s) => s.id === service.id)) {
      onChange([...selectedServices, service]);
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveService = (id: string) => {
    onChange(selectedServices.filter((s) => s.id !== id));
  };

  const filteredAvailable = availableServices.filter(
    (s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedServices.find((sel) => sel.id === s.id)
  );

  const handleCreateNewService = async (serviceData: Service) => {
    try {
      const payload: DichVuThemRequest = {
        ten: serviceData.name,
        donViTinh: serviceData.unit,
        donGia: serviceData.price,
        trangThai: serviceData.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      };
      const newServiceResponse = await servicesService.taoDichVuThem(payload);
      if (newServiceResponse) {
        const newService: Service = {
          id: newServiceResponse.maDichVuThem || '',
          code: newServiceResponse.maDichVuThem || '',
          name: newServiceResponse.ten || '',
          category: 'extra',
          price: newServiceResponse.donGia || 0,
          unit: newServiceResponse.donViTinh || '',
          status: newServiceResponse.trangThai?.toUpperCase() === 'ACTIVE' ? 'active' : 'inactive',
        };
        onChange([...selectedServices, newService]);
        await fetchServices();
      }
      setIsServiceFormOpen(false);
    } catch (err) {
      alert('Lỗi tạo dịch vụ: ' + formatApiError(err));
    }
  };

  const handleEditService = (serviceData: Service) => {
    onChange(
      selectedServices.map((s) => (s.id === serviceData.id ? { ...s, ...serviceData } : s))
    );
    setEditingService(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-orange-50 border border-orange-200 text-orange-700 px-4 py-3 rounded-lg text-sm">
        <strong>Lưu ý:</strong> Dịch vụ được lưu cục bộ. Tính năng đồng bộ với backend đang phát triển.
      </div>
      <div className="bg-[#F9F9FF] p-4 rounded-lg border border-[#E1F1FF]">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Tìm & Thêm Dịch Vụ</label>
        <div className="relative">
          <SearchInput
            placeholder="Nhập tên dịch vụ để tìm kiếm..."
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
          />
          {showDropdown && searchTerm && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-3 text-center text-sm text-gray-500">Đang tìm...</div>
              ) : filteredAvailable.length > 0 ? (
                filteredAvailable.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 hover:bg-[#F0F7FF] cursor-pointer border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectService(s);
                    }}
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center">
                        <span className="text-[10px] px-1.5 py-0.5 border border-gray-200 bg-gray-50 text-gray-600 rounded">
                          Mã dịch vụ: {s.code}
                        </span>
                      </div>
                      <div className="font-medium text-sm text-gray-800">{s.name}</div>
                    </div>
                    <div className="font-semibold text-[#00668A] text-sm">
                      {s.price.toLocaleString('vi-VN')} đ / {s.unit}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-gray-500">Không tìm thấy dịch vụ nào</div>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-start">
          <Button type="button" variant="ghost" icon={<Plus size={16} />} onClick={() => setIsServiceFormOpen(true)}>
            Thêm dịch vụ mới vào danh mục
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Dịch vụ đã chọn</h3>
        {selectedServices.length === 0 ? (
          <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-300">
            Chưa có dịch vụ nào được chọn
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedServices.map((s) => (
              <div key={s.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center">
                    <span className="text-[10px] px-1.5 py-0.5 border border-gray-200 bg-white text-gray-600 rounded shadow-sm">
                      Mã dịch vụ: {s.code}
                    </span>
                  </div>
                  <div className="font-medium text-sm text-gray-800">{s.name}</div>
                  <div className="text-xs text-gray-500">{s.price.toLocaleString('vi-VN')} đ/{s.unit}</div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="ghost" size="sm" icon={<Pencil size={16} />} aria-label="Sửa" onClick={() => setEditingService(s)} />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={16} />}
                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                    aria-label="Xóa"
                    onClick={() => handleRemoveService(s.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isServiceFormOpen}
        onClose={() => setIsServiceFormOpen(false)}
        title="Thêm mới Dịch vụ bổ sung"
        size="md"
      >
        {isServiceFormOpen && (
          <ServiceForm mode="create" onSubmit={handleCreateNewService} onCancel={() => setIsServiceFormOpen(false)} />
        )}
      </Modal>

      <Modal
        isOpen={!!editingService}
        onClose={() => setEditingService(null)}
        title="Sửa Dịch vụ bổ sung"
        size="md"
      >
        {editingService && (
          <ServiceForm mode="edit" initialData={editingService} onSubmit={async (s) => handleEditService(s)} onCancel={() => setEditingService(null)} />
        )}
      </Modal>
    </div>
  );
};

export default TourTemplateServiceTab;
