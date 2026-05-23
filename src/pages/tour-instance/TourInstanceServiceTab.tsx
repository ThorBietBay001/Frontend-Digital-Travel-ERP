import React, { useEffect, useState } from 'react';
import type { Service } from '../services/mockData';
import { servicesService } from '../../services/services';

interface TourInstanceServiceTabProps {
  services: Service[];
  onChange: (services: Service[]) => void;
  isEditing: boolean;
}

const TourInstanceServiceTab: React.FC<TourInstanceServiceTabProps> = ({ services, onChange, isEditing }) => {
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const res = await servicesService.danhSachDichVuThem();
        setAvailableServices(res.map(service => ({
          id: service.maDichVuThem || '',
          code: service.maDichVuThem || '',
          name: service.ten || '',
          category: 'extra',
          price: service.donGia || 0,
          unit: service.donViTinh || '',
          status: 'active',
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleToggleService = (service: Service, checked: boolean) => {
    if (checked) {
      onChange([...services, service]);
      return;
    }
    onChange(services.filter(item => item.id !== service.id));
  };

  return (
    <div className="flex flex-col gap-4">
      {isEditing && (
        <div className="bg-[#F9F9FF] p-4 rounded-lg border border-[#E1F1FF]">
          <label className="text-sm font-semibold text-gray-700 block mb-4">Cấu hình dịch vụ bổ sung cho tour</label>
          {loading ? (
            <div className="text-sm text-gray-500 text-center py-4">Đang tải danh sách...</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
              {availableServices.map(service => {
                const isSelected = services.some(item => item.id === service.id);
                return (
                  <div key={service.id} className={`flex items-center justify-between p-3 border rounded-lg ${isSelected ? 'border-[#89D4FF] bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-[#00668A] rounded border-gray-300 focus:ring-[#89D4FF]"
                        checked={isSelected}
                        onChange={(e) => handleToggleService(service, e.target.checked)}
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-800">{service.name}</div>
                        <div className="text-xs text-gray-500 mt-1">{service.code}</div>
                      </div>
                    </div>
                    <span className="font-semibold text-[#00668A] text-sm">
                      {service.price.toLocaleString('vi-VN')} đ / {service.unit || 'lần'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-sm text-gray-500 italic p-6 bg-gray-50 rounded-lg text-center border border-dashed border-gray-300">
          Tour này chưa cấu hình dịch vụ bổ sung nào.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((s, idx) => (
            <div key={idx} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg bg-white">
              <div>
                <div className="font-medium text-sm text-gray-800">{s.name}</div>
                <div className="text-xs text-gray-500 mt-1">{s.code}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="font-semibold text-[#00668A] text-sm">
                  {s.price.toLocaleString('vi-VN')} đ / {s.unit}
                </span>
                {isEditing && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">Ghi chú:</span>
                    <input type="text" className="border border-gray-300 rounded px-2 py-1 text-xs w-40" placeholder="VD: Khách VIP..." />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TourInstanceServiceTab;
