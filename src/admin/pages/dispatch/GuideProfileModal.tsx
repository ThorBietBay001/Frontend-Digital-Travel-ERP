import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { type Guide } from './mockData';
import { Star, Mail, Phone, Calendar as CalendarIcon, Award, FileText, CheckCircle2 } from 'lucide-react';

interface GuideProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: Guide | null;
}

const GuideProfileModal: React.FC<GuideProfileModalProps> = ({
  isOpen,
  onClose,
  guide
}) => {
  if (!guide) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Hồ sơ chi tiết Hướng dẫn viên"
      size="lg"
    >
      <div className="flex flex-col gap-6">
        {/* Header Profile Section */}
        <div className="flex gap-6 items-start">
          <div className="w-24 h-24 bg-[#E8F6FF] rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
            {guide.avatar ? (
              <img src={guide.avatar} alt={guide.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#00668A]">{guide.name.charAt(0)}</span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{guide.name}</h2>
                <div className="text-gray-500 font-medium mb-2">{guide.code}</div>
              </div>
              <div>
                {guide.status === 'available' && <Badge label="Sẵn sàng" variant="success" />}
                {guide.status === 'busy' && <Badge label="Đang đi tour" variant="warning" />}
                {guide.status === 'resting' && <Badge label="Đang nghỉ" variant="info" />}
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm">
              <div className="flex items-center gap-1.5 text-gray-600">
                <Star size={16} className="text-amber-400" fill="currentColor" />
                <span className="font-semibold text-gray-900">{guide.rating}</span>
                <span>({guide.completedTours} tours)</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Phone size={16} />
                <span>+84 90 123 4567</span> {/* Mặc định hoặc thêm vào mock data */}
              </div>
              <div className="flex items-center gap-1.5 text-gray-600">
                <Mail size={16} />
                <span>{guide.code.toLowerCase()}@vietnamtravel.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            {/* Biography */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                <FileText size={18} className="text-gray-400" />
                Giới thiệu chung
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {guide.biography || "Chưa có thông tin giới thiệu."}
              </p>
            </div>

            {/* Exp & Lang */}
            <div className="flex gap-4">
              <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <div className="text-sm text-gray-500 mb-1">Kinh nghiệm</div>
                <div className="font-bold text-lg text-[#00668A]">{guide.experience} năm</div>
              </div>
              <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
                <div className="text-sm text-gray-500 mb-1">Ngôn ngữ</div>
                <div className="font-bold text-sm text-[#00668A]">{guide.languages.join(", ")}</div>
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Award size={18} className="text-gray-400" />
                Thế mạnh chuyên môn
              </h3>
              <div className="flex flex-wrap gap-2">
                {guide.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* Certificates */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-gray-400" />
                Chứng chỉ & Bằng cấp
              </h3>
              <div className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {guide.certificates?.length ? (
                  guide.certificates.map((cert, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <span className="font-medium text-gray-800">{cert}</span>
                      <span className="text-[#00668A] text-xs font-semibold bg-[#E8F6FF] px-2 py-1 rounded">Đã xác minh</span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-gray-500 text-center italic">Không có chứng chỉ nào được ghi nhận.</div>
                )}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <CalendarIcon size={18} className="text-gray-400" />
                Lịch trình sắp tới
              </h3>
              <div className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {guide.schedule?.length ? (
                  guide.schedule.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-start flex-col gap-1">
                      <div className="font-medium text-gray-800">{item.tour}</div>
                      <div className="text-xs text-gray-500 flex justify-between w-full">
                        <span>{item.start} - {item.end}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-gray-500 text-center italic bg-gray-50">Hiện HDV chưa có lịch trình nào sắp tới.</div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default GuideProfileModal;