import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Trash2, Leaf } from 'lucide-react';
import { greenActionsService } from '../../services/green-actions';
import type { GreenAction } from '../green-actions/mockData';

interface TourInstanceGreenActionTabProps {
  selectedActions: GreenAction[];
  onChange: (actions: GreenAction[]) => void;
  isEditing?: boolean;
}

const TourInstanceGreenActionTab: React.FC<TourInstanceGreenActionTabProps> = ({ selectedActions, onChange, isEditing = true }) => {
  const [availableActions, setAvailableActions] = useState<GreenAction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchActions = async () => {
    setLoading(true);
    try {
      const res = await greenActionsService.danhSach_2();
      if (res) {
        setAvailableActions(res.map(api => ({
          id: api.maHanhDongXanh || '',
          code: api.maHanhDongXanh || '',
          name: api.tenHanhDong || '',
          description: '',
          defaultPoints: api.diemCong || 0,
          status: api.trangThai?.toUpperCase() === 'ACTIVE' ? 'active' : 'inactive',
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const handleToggleAction = (action: GreenAction, checked: boolean) => {
    if (checked) {
      onChange([...selectedActions, action]);
    } else {
      onChange(selectedActions.filter(a => a.id !== action.id));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isEditing && (
        <div className="bg-[#F9F9FF] p-4 rounded-lg border border-[#E1F1FF]">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-gray-700">Cấu hình hành động xanh cho tour</label>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500 text-center py-4">Đang tải danh sách...</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
              {availableActions.map(action => {
                const isSelected = selectedActions.some(a => a.id === action.id);
                return (
                  <div key={action.id} className={`flex items-center justify-between p-3 border rounded-lg ${isSelected ? 'border-[#89D4FF] bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#00668A] rounded border-gray-300 focus:ring-[#89D4FF]"
                        checked={isSelected}
                        onChange={(e) => handleToggleAction(action, e.target.checked)}
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-800">{action.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          Mặc định: <Leaf size={12} className="text-green-600"/> <span className="text-green-600 font-medium">+{action.defaultPoints} điểm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Hành động đã cấu hình</h3>
        {selectedActions.length === 0 ? (
          <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg text-center border border-dashed border-gray-300">
            Tour này chưa cấu hình hành động xanh nào.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {selectedActions.map(action => (
              <div key={action.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
                <span className="text-sm font-medium text-gray-800">{action.name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-green-600 font-bold flex items-center gap-1"><Leaf size={14}/> +{action.defaultPoints}</span>
                  {isEditing && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      icon={<Trash2 size={16} />} 
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1"
                      onClick={() => handleToggleAction(action, false)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourInstanceGreenActionTab;
