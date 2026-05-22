import { Leaf } from 'lucide-react';
import { type GreenAction } from '../../types';

interface GreenActionSelectionProps {
  greenActions: GreenAction[];
  selectedGreenActions: Record<string, number>;
  chonHanhDongXanh: (actionId: string) => void;
  capNhatSoLuongHanhDongXanh: (actionId: string, quantity: number) => void;
}

export default function ChonHanhDongXanh({
  greenActions,
  selectedGreenActions,
  chonHanhDongXanh,
  capNhatSoLuongHanhDongXanh
}: GreenActionSelectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border-t-4 border-t-green-600 shadow-sm space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-green-600 animate-spin-slow" />
          <span>Cam kết Hành động Xanh</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Nhận thêm Điểm Thưởng Xanh để quy đổi voucher hoặc nâng hạng thành viên.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        {greenActions.map((action) => {
          const quantity = selectedGreenActions[action.id] || 0;
          const isSelected = quantity > 0;

          return (
            <label
              key={action.id}
              className={`grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${
                isSelected ? 'border-green-500 bg-green-50/40' : 'border-transparent hover:bg-slate-50/50'
              }`}
            >
              <div className="flex min-w-0 items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => chonHanhDongXanh(action.id)}
                  className="mt-1 w-4 h-4 rounded text-green-600 border-slate-300 focus:ring-green-500/20 cursor-pointer flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-bold text-slate-800 text-sm group-hover:text-green-700 transition-colors">
                    {action.title}
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>

              {isSelected && (
                <div className="col-span-2 sm:col-span-1 sm:col-start-2 flex items-center justify-end gap-2 rounded-lg bg-white border border-green-100 px-2.5 py-1.5">
                  <span className="hidden md:inline text-[10px] font-black uppercase text-slate-500">Số lượng</span>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      capNhatSoLuongHanhDongXanh(action.id, Math.max(1, quantity - 1));
                    }}
                    className="w-7 h-7 rounded-full border border-green-200 bg-white text-green-700 font-black hover:bg-green-50"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onChange={(event) => capNhatSoLuongHanhDongXanh(action.id, Math.max(1, Number(event.target.value) || 1))}
                    className="w-14 text-center rounded-lg border border-green-200 py-1 text-xs font-black text-green-800"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      capNhatSoLuongHanhDongXanh(action.id, quantity + 1);
                    }}
                    className="w-7 h-7 rounded-full border border-green-200 bg-white text-green-700 font-black hover:bg-green-50"
                  >
                    +
                  </button>
                </div>
              )}

              <span className="row-start-1 col-start-2 sm:col-start-3 justify-self-end self-start text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100 whitespace-nowrap">
                +{action.points} điểm
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
