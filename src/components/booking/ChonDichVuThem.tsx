import { PlusCircle } from 'lucide-react';

export interface ExtraService {
  id: string;
  title: string;
  price: number;
  description: string;
}

interface ExtraServicesSelectionProps {
  extraServices: ExtraService[];
  selectedServices: Record<string, number>;
  chonDichVuThem: (serviceId: string) => void;
  capNhatSoLuongDichVu: (serviceId: string, quantity: number) => void;
}

export default function ChonDichVuThem({
  extraServices,
  selectedServices,
  chonDichVuThem,
  capNhatSoLuongDichVu
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
          const quantity = selectedServices[service.id] || 0;
          const isSelected = quantity > 0;

          return (
            <div key={service.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label
                className={`flex-1 flex items-center justify-between gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-amber-500 bg-amber-50/30' : 'border-slate-100 hover:border-amber-200'
                }`}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => chonDichVuThem(service.id)}
                    className="mt-1 w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500/20 cursor-pointer flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className={`font-bold text-sm ${isSelected ? 'text-amber-700' : 'text-slate-800'}`}>
                      {service.title}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                </div>

                <span className="font-extrabold text-sm text-slate-900 whitespace-nowrap">
                  +{dinhDangGia(service.price)}
                </span>
              </label>

              {isSelected && (
                <div className="flex-shrink-0 flex items-center justify-end ml-4">
                  <div className="flex items-center border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden h-9">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        capNhatSoLuongDichVu(service.id, Math.max(1, quantity - 1));
                      }}
                      className="w-9 h-full flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(event) => capNhatSoLuongDichVu(service.id, Math.max(1, Number(event.target.value) || 1))}
                      className="w-10 h-full text-center border-0 border-x border-slate-200 text-sm font-bold text-slate-800 outline-none focus:ring-0 p-0"
                    />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        capNhatSoLuongDichVu(service.id, quantity + 1);
                      }}
                      className="w-9 h-full flex items-center justify-center bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
