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
        {greenActions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-green-200 bg-green-50/30 px-4 py-3 text-xs font-semibold text-slate-500">
            Tour này hiện chưa có hành động xanh riêng.
          </div>
        ) : greenActions.map((action) => {
          const quantity = selectedGreenActions[action.id] || 0;
          const isSelected = quantity > 0;
          const displayQuantity = Math.max(1, quantity);

          return (
            <div key={action.id} className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label
                className={`flex-1 flex items-center justify-between gap-3 p-3.5 rounded-xl border transition-all cursor-pointer group ${
                  isSelected ? 'border-green-500 bg-green-50/40' : 'border-slate-100 hover:border-green-200'
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
                    <span className={`font-bold text-sm group-hover:text-green-700 transition-colors ${isSelected ? 'text-green-700' : 'text-slate-800'}`}>
                      {action.title}
                    </span>
                    <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 whitespace-nowrap">
                  +{action.points} điểm
                </span>
              </label>

              <div className="flex-shrink-0 flex items-center justify-end sm:ml-2">
                <div className={`flex items-center justify-end gap-2 ${isSelected ? '' : 'opacity-60'}`}>
                  <button
                    type="button"
                    disabled={!isSelected}
                    onClick={() => capNhatSoLuongHanhDongXanh(action.id, Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-green-300 bg-white text-green-700 font-black hover:bg-green-50 transition-colors disabled:cursor-not-allowed disabled:hover:bg-white"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={displayQuantity}
                    disabled={!isSelected}
                    onChange={(event) => capNhatSoLuongHanhDongXanh(action.id, Math.max(1, Number(event.target.value) || 1))}
                    className="w-14 h-8 text-center rounded-xl border-2 border-green-300 text-sm font-black text-green-800 disabled:bg-transparent focus:ring-0 focus:border-green-400 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none p-0 m-0"
                  />
                  <button
                    type="button"
                    disabled={!isSelected}
                    onClick={() => capNhatSoLuongHanhDongXanh(action.id, quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-green-300 bg-white text-green-700 font-black hover:bg-green-50 transition-colors disabled:cursor-not-allowed disabled:hover:bg-white"
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
