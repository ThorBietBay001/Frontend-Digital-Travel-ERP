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
        {extraServices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/30 px-4 py-3 text-xs font-semibold text-slate-500">
            Tour này hiện chưa có dịch vụ bổ sung riêng.
          </div>
        ) : extraServices.map((service) => {
          const quantity = selectedServices[service.id] || 0;
          const isSelected = quantity > 0;
          const displayQuantity = Math.max(1, quantity);

          return (
            <div key={service.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label
                className={`flex-1 flex items-center justify-between gap-3 p-3.5 rounded-xl border-1 transition-all cursor-pointer group ${isSelected ? 'border-amber-500 bg-amber-50/30' : 'border-slate-100 hover:border-amber-200'
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
                    <span className={`font-bold text-sm group-hover:text-amber-700 transition-colors ${isSelected ? 'text-amber-700' : 'text-slate-800'}`}>
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

              <div className="flex-shrink-0 flex items-center justify-end sm:ml-2">
                <div className={`flex items-center justify-end gap-2 ${isSelected ? '' : 'opacity-60'}`}>
                  <button
                    type="button"
                    disabled={!isSelected}
                    onClick={() => capNhatSoLuongDichVu(service.id, Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border-1 border-amber-200 bg-white text-amber-700 font-black hover:bg-amber-50 transition-colors disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={displayQuantity}
                    disabled={!isSelected}
                    onChange={(event) => capNhatSoLuongDichVu(service.id, Math.max(1, Number(event.target.value) || 1))}
                    className="w-14 h-8 text-center rounded-xl border-2 border-amber-300 text-sm font-black text-amber-800 disabled:bg-transparent focus:ring-0 focus:border-amber-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 m-0"
                  />
                  <button
                    type="button"
                    disabled={!isSelected}
                    onClick={() => capNhatSoLuongDichVu(service.id, quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border-1 border-amber-200 bg-white text-amber-700 font-black hover:bg-amber-50 transition-colors disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
