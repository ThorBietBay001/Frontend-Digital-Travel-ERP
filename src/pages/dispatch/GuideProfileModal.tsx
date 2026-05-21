import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import type { Guide } from './mockData';
import { Star, Mail, Phone, FileText } from 'lucide-react';
import { hrService } from '../../services/system/hr';
import type { NangLucResponse } from '../../services/system/hr';
import { formatApiError } from '../../utils/apiHelpers';

interface GuideProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  guide: Guide | null;
}

const parseList = (value?: string): string[] => {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
};

const GuideProfileModal: React.FC<GuideProfileModalProps> = ({ isOpen, onClose, guide }) => {
  const [nangLuc, setNangLuc] = useState<NangLucResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !guide?.id) {
      setNangLuc(null);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await hrService.layNangLuc(guide.id);
        setNangLuc(res ?? null);
      } catch (err: unknown) {
        setError(formatApiError(err, 'Không tải được năng lực HDV'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, guide?.id]);

  if (!guide) return null;

  const languages = parseList(nangLuc?.ngonNgu);
  const skills = [...parseList(nangLuc?.chuyenMon), ...parseList(nangLuc?.chungChi)];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Hồ sơ chi tiết Hướng dẫn viên" size="lg">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-6">{error}</div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex gap-6 items-start">
            <div className="w-24 h-24 bg-[#E8F6FF] rounded-full flex items-center justify-center border-4 border-white shadow-sm flex-shrink-0">
              <span className="text-3xl font-bold text-[#00668A]">{guide.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{guide.name}</h2>
              <div className="text-gray-500 font-medium mb-2">{guide.code}</div>
              {guide.status === 'available' && <Badge label="Sẵn sàng" variant="success" />}
              {guide.status === 'busy' && <Badge label="Đang đi tour" variant="warning" />}
              {guide.status === 'resting' && <Badge label="Đang nghỉ" variant="info" />}
              <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-amber-400" fill="currentColor" />
                  <span>
                    {nangLuc?.danhGia != null ? nangLuc.danhGia.toFixed(1) : '—'} ({nangLuc?.soDanhGia ?? 0} đánh giá)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone size={16} />
                  <span>—</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Mail size={16} />
                  <span>{guide.code}@vietnamtravel.com</span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              Năng lực (GET /api/dieu-hanh/nhan-vien/{'{id}'}/nang-luc)
            </h3>
            <div className="bg-[#F9F9FF] p-4 rounded-xl border border-[#E1F1FF] text-sm space-y-3">
              <div>
                <span className="text-gray-500 block mb-1">Ngôn ngữ</span>
                <div className="flex flex-wrap gap-1">
                  {languages.length > 0 ? (
                    languages.map((l) => (
                      <span key={l} className="px-2 py-0.5 bg-white border border-[#C5EAFF] rounded text-[#00668A]">
                        {l}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Chưa cập nhật</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">Thế mạnh / Chứng chỉ</span>
                <div className="flex flex-wrap gap-1">
                  {skills.length > 0 ? (
                    skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">Chưa cập nhật</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default GuideProfileModal;
