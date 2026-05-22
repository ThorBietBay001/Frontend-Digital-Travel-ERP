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
  const [customPoints, setCustomPoints] = useState<Record<string, number>>({});
  const [isOtherChecked, setIsOtherChecked] = useState(false);
  const [otherName, setOtherName] = useState('');
  const [otherPoints, setOtherPoints] = useState(0);

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
      setCustomPoints({ ...customPoints, [action.id]: action.defaultPoints });
    } else {
      onChange(selectedActions.filter(a => a.id !== action.id));
    }
  };

  const handlePointChange = (actionId: string, points: number) => {
    setCustomPoints({ ...customPoints, [actionId]: points });
  };

  const handleOtherToggle = (checked: boolean) => {
    setIsOtherChecked(checked);
    if (checked) {
      onChange([...selectedActions, { id: 'custom_other', code: 'CUSTOM', name: otherName, description: '', defaultPoints: otherPoints, status: 'active' }]);
    } else {
      onChange(selectedActions.filter(a => a.id !== 'custom_other'));
    }
  };

  const handleOtherChange = (name: string, points: number) => {
    setOtherName(name);
    setOtherPoints(points);
    if (isOtherChecked) {
      onChange(selectedActions.map(a => a.id === 'custom_other' ? { ...a, name, defaultPoints: points } : a));
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
                    {isSelected && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 font-medium">Điểm thưởng:</span>
                        <input 
                          type="number" 
                          min={0}
                          className="w-20 px-2 py-1 text-sm border border-[#C5EAFF] rounded focus:outline-none focus:ring-1 focus:ring-[#89D4FF]"
                          value={customPoints[action.id] ?? action.defaultPoints}
                          onChange={(e) => handlePointChange(action.id, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Khác Checkbox */}
              <div className={`flex flex-col gap-2 p-3 border rounded-lg ${isOtherChecked ? 'border-[#89D4FF] bg-blue-50/30' : 'border-gray-200 bg-white'}`}>
                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 text-[#00668A] rounded border-gray-300 focus:ring-[#89D4FF]"
                    checked={isOtherChecked}
                    onChange={(e) => handleOtherToggle(e.target.checked)}
                  />
                  <div className="font-medium text-sm text-gray-800">Khác</div>
                </div>
                {isOtherChecked && (
                  <div className="flex gap-4 ml-7 mt-2">
                    <div className="flex-1">
                      <input 
                        type="text"
                        className="w-full px-3 py-1.5 text-sm border border-[#C5EAFF] rounded focus:outline-none focus:ring-1 focus:ring-[#89D4FF]"
                        placeholder="Tên hành động..."
                        value={otherName}
                        onChange={(e) => handleOtherChange(e.target.value, otherPoints)}
                      />
                    </div>
                    <div className="w-32 flex items-center gap-2">
                      <span className="text-xs text-gray-600 font-medium">Điểm:</span>
                      <input 
                        type="number" 
                        min={0}
                        className="w-full px-2 py-1.5 text-sm border border-[#C5EAFF] rounded focus:outline-none focus:ring-1 focus:ring-[#89D4FF]"
                        value={otherPoints}
                        onChange={(e) => handleOtherChange(otherName, parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                )}
              </div>
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
                  <span className="text-sm text-green-600 font-bold flex items-center gap-1"><Leaf size={14}/> +{customPoints[action.id] ?? action.defaultPoints}</span>
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
