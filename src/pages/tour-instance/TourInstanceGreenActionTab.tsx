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
  const [customActionName, setCustomActionName] = useState('');
  const [customActionPoints, setCustomActionPoints] = useState(0);

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
      onChange([...selectedActions, { ...action }]); // clone so we can edit points locally
    } else {
      onChange(selectedActions.filter(a => a.id !== action.id));
    }
  };

  const handleUpdatePoints = (id: string, points: number) => {
    onChange(selectedActions.map(a => a.id === id ? { ...a, defaultPoints: points } : a));
  };

  const handleAddCustomAction = async (checked: boolean) => {
    if (checked) {
      if (!customActionName.trim()) {
        alert("Vui lòng nhập tên hành động khác");
        return;
      }
      try {
        setLoading(true);
        const res = await greenActionsService.taoMoi_2({
          tenHanhDong: customActionName.trim(),
          diemCong: customActionPoints
        });
        if (res) {
          const newAction: GreenAction = {
            id: res.maHanhDongXanh || `custom_${Date.now()}`,
            code: res.maHanhDongXanh || `CUSTOM`,
            name: res.tenHanhDong || customActionName.trim(),
            description: '',
            defaultPoints: res.diemCong || customActionPoints,
            status: 'active'
          };
          setAvailableActions(prev => [...prev, newAction]);
          onChange([...selectedActions, newAction]);
          setCustomActionName('');
          setCustomActionPoints(0);
        }
      } catch (err: any) {
        alert("Không thể lưu hành động xanh. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Hành động đã chọn</h3>
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
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Leaf size={14} className="text-green-600"/>
                      <input 
                        type="number" 
                        min={0}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-green-600 font-bold focus:outline-none" 
                        value={action.defaultPoints}
                        onChange={(e) => handleUpdatePoints(action.id, parseInt(e.target.value) || 0)}
                      />
                      <span className="text-xs text-gray-500">điểm</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        icon={<Trash2 size={16} />} 
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 ml-2"
                        onClick={() => handleToggleAction(action, false)}
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-green-600 font-bold flex items-center gap-1"><Leaf size={14}/> +{action.defaultPoints} điểm</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditing && (
        <div className="bg-[#F9F9FF] p-4 rounded-lg border border-[#E1F1FF]">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-gray-700">Danh sách hành động hiện có</label>
          </div>

          {loading ? (
            <div className="text-sm text-gray-500 text-center py-4">Đang tải danh sách...</div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-2">
              {availableActions.map(action => {
                const isSelected = selectedActions.some(a => a.id === action.id);
                return (
                  <div 
                    key={action.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${isSelected ? 'border-[#89D4FF] bg-blue-50/30' : 'border-gray-200 bg-white hover:bg-gray-50'}`}
                    onClick={() => handleToggleAction(action, !isSelected)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#00668A] rounded border-gray-300 focus:ring-[#89D4FF] cursor-pointer"
                        checked={isSelected}
                        onChange={() => {}} 
                        onClick={(e) => e.stopPropagation()} 
                      />
                      <div className="flex-1" onClick={(e) => { e.stopPropagation(); handleToggleAction(action, !isSelected); }}>
                        <div className="font-medium text-sm text-gray-800">{action.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          Mặc định: <Leaf size={12} className="text-green-600"/> <span className="text-green-600 font-medium">+{action.defaultPoints} điểm</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Ô Thêm Hành Động Khác Inline */}
              <div className="flex items-center justify-between p-3 border rounded-lg border-gray-200 bg-white shadow-sm mt-1">
                <div className="flex items-start gap-3 w-full">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 mt-1 text-[#00668A] rounded border-gray-300 focus:ring-[#89D4FF] cursor-pointer"
                    checked={false} 
                    onChange={(e) => handleAddCustomAction(e.target.checked)}
                  />
                  <div className="flex-1">
                    <input 
                      type="text" 
                      placeholder="Thêm hành động khác (Nhập tên hành động)..." 
                      className="w-full font-medium text-sm text-gray-800 border-b border-gray-200 focus:border-[#89D4FF] outline-none pb-1 bg-transparent"
                      value={customActionName}
                      onChange={e => setCustomActionName(e.target.value)}
                    />
                    <div className="text-xs text-gray-500 flex items-center gap-2 mt-2">
                      <span>Mặc định:</span> 
                      <div className="flex items-center text-green-600 gap-1">
                        <Leaf size={12} /> 
                        <span className="font-medium">+</span>
                        <input 
                          type="number" 
                          min={0}
                          className="w-16 border border-gray-300 rounded px-1.5 py-0.5 outline-none focus:border-green-400 font-medium"
                          value={customActionPoints || ''}
                          onChange={e => setCustomActionPoints(parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                        <span className="font-medium">điểm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TourInstanceGreenActionTab;
