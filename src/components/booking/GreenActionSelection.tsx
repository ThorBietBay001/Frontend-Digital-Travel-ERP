import { Leaf } from 'lucide-react';
import { type GreenAction } from '../../data/mockData';

interface GreenActionSelectionProps {
  greenActions: GreenAction[];
  selectedGreenActions: string[];
  toggleGreenAction: (actionId: string) => void;
}

export default function GreenActionSelection({
  greenActions,
  selectedGreenActions,
  toggleGreenAction
}: GreenActionSelectionProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border-t-4 border-t-green-600 shadow-sm space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
          <Leaf className="w-4 h-4 text-green-600 animate-spin-slow" />
          <span>Cam kết Hành động Xanh</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Nhận thêm Điểm Thưởng Xanh (Green Points) để quy đổi voucher hoặc nâng hạng thành viên.
        </p>
      </div>

      <div className="space-y-2 pt-2">
        {greenActions.map((action) => {
          const isSelected = selectedGreenActions.includes(action.id);
          return (
            <label
              key={action.id}
              className="flex items-start space-x-3.5 p-3.5 rounded-xl hover:bg-slate-50/50 cursor-pointer group transition-colors"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleGreenAction(action.id)}
                className="w-4 h-4 rounded text-green-600 border-slate-300 focus:ring-green-500/20 mt-1 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm group-hover:text-green-700 transition-colors">
                    {action.title}
                  </span>
                  <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                    +{action.points} PTS
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
                  {action.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
