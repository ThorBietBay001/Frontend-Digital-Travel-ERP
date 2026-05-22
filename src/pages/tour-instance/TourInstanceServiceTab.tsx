import React from 'react';
import type { Service } from '../services/mockData';

interface TourInstanceServiceTabProps {
  services: Service[];
  isEditing: boolean;
}

const TourInstanceServiceTab: React.FC<TourInstanceServiceTabProps> = ({ services, isEditing }) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-2">
        <p className="text-sm text-blue-800">
          Danh sách dịch vụ dưới đây được kế thừa từ Tour Mẫu và không thể thêm/xóa trực tiếp tại đây.
        </p>
      </div>

      {services.length === 0 ? (
        <div className="text-sm text-gray-500 italic p-6 bg-gray-50 rounded-lg text-center border border-dashed border-gray-300">
          Không có dịch vụ bổ sung nào được kế thừa từ Tour Mẫu.
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
