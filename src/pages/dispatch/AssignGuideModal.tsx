import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { UserCheck, MapPin, Calendar, Users, Target, ShieldCheck, AlertCircle, Star } from 'lucide-react';
import type { NhanVienResponse } from '../../services/dispatch';
import type { TourNeedGuide } from './mockData';

interface AssignGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: TourNeedGuide | null;
  mode?: 'assign' | 'replace';
  onAssign: (tourId: string, guideId: string) => void;
  availableGuides: NhanVienResponse[];
}

const AssignGuideModal: React.FC<AssignGuideModalProps> = ({ isOpen, onClose, tour, mode = 'assign', onAssign, availableGuides }) => {
  const [conflictGuideId, setConflictGuideId] = useState<string | null>(null);

  if (!tour) return null;

  // Tính match point (Mock)
  const suggestedGuides = availableGuides.map(g => {
    let match = 50; // default base point
    const status = g.trangThaiLamViec === 'AVAILABLE' ? 'available' : g.trangThaiLamViec === 'BUSY' ? 'busy' : 'resting';
    if (status === 'available') match += 20;
    if (status === 'resting') match -= 10;
    if (status === 'busy') match -= 40;
    
    // Check skills (Mock since NhanVienResponse has no skills)
    const mockSkills = ['Trekking', 'Tiếng Anh'];
    const matchingSkills = mockSkills.filter(s => tour.requiredSkills.includes(s)).length;
    match += matchingSkills * 15;

    return { 
      ...g, 
      status, 
      matchPercent: Math.min(100, Math.max(10, match)),
      mockSkills
    };
  }).sort((a, b) => (b.matchPercent || 0) - (a.matchPercent || 0));

  const handleSelectGuide = (guide: any) => {
    // Mock conflict check
    if (guide.status === 'busy') {
      setConflictGuideId(guide.maNhanVien || null);
      return;
    }
    
    setConflictGuideId(null);
    if (window.confirm(`Phân công HDV ${guide.hoTen} cho tour ${tour.name}?`)) {
      onAssign(tour.id, guide.maNhanVien || '');
    }
  };

  const customHeader = (
    <div className="flex items-center justify-between w-full pr-6">
      <div className="flex items-center gap-3">
        <div className="bg-[#E8F6FF] text-[#00668A] p-2 rounded-full">
          <UserCheck size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#121C2C]">
            {mode === 'replace' ? 'Thay thế Hướng dẫn viên' : 'Phân công Hướng dẫn viên'}
          </h2>
          <p className="text-sm font-medium text-[#00668A]">{tour.name}</p>
        </div>
      </div>
      {mode === 'replace' && (
        <Button variant="danger" size="sm" onClick={() => alert('Đã hủy phân công cũ')}>
          Hủy phân công hiện tại
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setConflictGuideId(null);
        onClose();
      }}
      title={customHeader}
      size="3xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-sm text-gray-700 font-sans">
        
        {/* Left Column (35%) - Thông tin tour */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#F9F9FF] p-4 rounded-[12px] border border-[#E1F1FF]">
            <h3 className="font-bold text-[#121C2C] mb-3 border-b border-[#E1F1FF] pb-2">Thông tin yêu cầu</h3>
            
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Mã - Tuyến</p>
                  <p className="font-semibold text-[#00668A]">{tour.code}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Thời gian ({tour.duration})</p>
                  <p className="font-medium text-gray-800">{tour.startDate} - {tour.endDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Users size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Số khách</p>
                  <p className="font-medium text-gray-800">{tour.passengers} người</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Target size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Yêu cầu chuyên môn</p>
                  <div className="flex flex-wrap gap-1">
                    {tour.requiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#E8F6FF] text-[#00668A] text-xs font-medium rounded-full border border-[#89D4FF]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {tour.status === 'assigned' && tour.assignedGuide && (
            <div className="bg-[#FFF4F4] border border-[#FFD9D9] p-4 rounded-[12px]">
              <h3 className="font-bold text-[#BA1A1A] mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                Đang phân công cho
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                  {tour.assignedGuide.avatar ? (
                    <img src={tour.assignedGuide.avatar} alt="avatar" className="w-full h-full rounded-full object-cover"/>
                  ) : (
                    tour.assignedGuide.name.charAt(0)
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{tour.assignedGuide.name}</p>
                  <p className="text-xs text-gray-500">{tour.assignedGuide.id}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (65%) - Gợi ý HDV */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-[#121C2C] flex items-center gap-2 text-base">
              <ShieldCheck size={18} className="text-[#16A34A]" />
              Top HDV Phù hợp nhất
            </h3>
            <span className="text-xs text-gray-500">Dựa trên lịch trống và kỹ năng</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2">
            {suggestedGuides.map(guide => {
              const isConflict = conflictGuideId === guide.maNhanVien;
              
              return (
                <div 
                  key={guide.maNhanVien} 
                  className={`flex flex-col gap-2 p-3 rounded-[12px] border transition-colors ${
                    isConflict ? 'bg-[#FFF4F4] border-[#BA1A1A]' : 'bg-white border-[#E1F1FF] hover:border-[#89D4FF]'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-[#F4F9FF] text-[#00668A] text-lg font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                        {guide.hoTen?.charAt(0) || 'U'}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-[#121C2C]">{guide.hoTen}</p>
                          <Badge 
                            label={guide.status === 'available' ? 'Sẵn sàng' : guide.status === 'busy' ? 'Đang đi tour' : 'Đang nghỉ'} 
                            variant={guide.status === 'available' ? 'success' : guide.status === 'busy' ? 'warning' : 'neutral'} 
                          />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{guide.maNhanVien}</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                            <Star size={12} fill="currentColor" /> 5.0
                          </span>
                          <span>0 tour</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {guide.mockSkills.map((tag: string, i: number) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[11px] rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-[#F0FDF4] text-[#16A34A] px-2 py-1 rounded-lg border border-[#BBF7D0]">
                        <span className="text-xs font-medium">Độ phù hợp</span>
                        <span className="font-bold">{guide.matchPercent}%</span>
                      </div>
                      <Button 
                        variant={(guide.matchPercent || 0) > 60 ? 'primary' : 'secondary'} 
                        size="sm"
                        onClick={() => handleSelectGuide(guide)}
                      >
                        Chọn người này
                      </Button>
                    </div>

                  </div>

                  {isConflict && (
                    <div className="bg-[#BA1A1A] text-white text-xs px-3 py-1.5 rounded-md mt-1 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      <p><strong>Xung đột lịch:</strong> Hướng dẫn viên này đang có lịch chạy tour khác trong thời gian này!</p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default AssignGuideModal;