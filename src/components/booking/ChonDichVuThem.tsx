import { PlusCircle } from 'lucide-react';

export interface ExtraService {
  id: string;
  title: string;
  price: number;
  description: string;
}

interface ExtraServicesSelectionProps {
  extraServices: ExtraService[];
  selectedServices: string[];
  chonDichVuThem: (serviceId: string) => void;
}

export default function ChonDichVuThem({
  extraServices,
  selectedServices,
  chonDichVuThem
}: ExtraServicesSelectionProps) {
  const dinhDangGia = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border-t-4 border-t-amber-500 shadow-sm space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <PlusCircle className="w-4 h-4 text-amber-500" />
          <span>Dịch vụ Bổ sung</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Nâng tầm trải nghiệm chuyến đi của bạn với các dịch vụ tùy chọn.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        {extraServices.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          return (
            <label
              key={service.id}
              className={`flex items-start space-x-3.5 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                isSelected ? 'border-amber-500 bg-amber-50/30' : 'border-slate-100 hover:border-amber-200'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => chonDichVuThem(service.id)}
                className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500/20 mt-1 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${isSelected ? 'text-amber-700' : 'text-slate-800'}`}>
                    {service.title}
                  </span>
                  <span className="font-extrabold text-sm text-slate-900">
                    +{dinhDangGia(service.price)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  {service.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
