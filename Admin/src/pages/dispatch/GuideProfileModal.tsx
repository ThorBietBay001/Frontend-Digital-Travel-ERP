import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import type { Guide } from './mockData';
import { Star, Mail, Phone, Cake, Calendar, User } from 'lucide-react';
import { hrService } from '../../services/system/hr';
import { accountsService } from '../../services/system/accounts';
import { dispatchService } from '../../services/dispatch';
import type { NhanVienResponse } from '../../services/system/accounts';
import type { NangLucResponse } from '../../services/system/hr';
import type { PhanCongResponse } from './mockData';
import { formatApiError } from '../../utils/apiHelpers';
import { formatDate } from '../../utils/dateHelpers';

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
  const [nhanVien, setNhanVien] = useState<NhanVienResponse | null>(null);
  const [tours, setTours] = useState<PhanCongResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !guide?.id) {
      setNangLuc(null);
      setTours([]);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [nangLucRes, nhanVienRes, toursRes] = await Promise.all([
          hrService.layNangLuc(guide.id).catch(() => null),
          accountsService.chiTietNhanVien(guide.id).catch(() => null),
          dispatchService.lichCongTacNhanVien(guide.id).catch(() => [])
        ]);
        setNangLuc(nangLucRes ?? null);
        setNhanVien(nhanVienRes ?? null);
        setTours(toursRes ?? []);
      } catch (err: unknown) {
        setError(formatApiError(err, 'Không tải được hồ sơ HDV'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, guide?.id]);

  if (!guide) return null;

  const languages = parseList(nangLuc?.ngonNgu);
  const skills = [...parseList(nangLuc?.chuyenMon), ...parseList(nangLuc?.chungChi)];
  const rating = nangLuc?.danhGia ?? guide.rating ?? 0;

  const getTourStatus = (status: string | undefined): { label: string; variant: 'success' | 'warning' | 'error' | 'info' } => {
    switch (status) {
      case 'CHO_KICH_HOAT': return { label: 'Chờ kích hoạt', variant: 'warning' };
      case 'MO_BAN': return { label: 'Mở bán', variant: 'info' };
      case 'DANG_DIEN_RA': return { label: 'Đang diễn ra', variant: 'success' };
      case 'KET_THUC': return { label: 'Kết thúc', variant: 'success' };
      case 'DA_QUYET_TOAN': return { label: 'Đã quyết toán', variant: 'success' };
      case 'HUY': return { label: 'Đã hủy', variant: 'error' };
      default: return { label: status || '—', variant: 'info' };
    }
  };

  // Lọc tours
  const pendingTours = tours.filter(t => t.trangThaiChapNhan === 'CHO_PHAN_HOI');
  const activeTours = tours.filter(t => t.trangThaiChapNhan === 'DA_DONG_Y' && t.trangThaiTour !== 'KET_THUC' && t.trangThaiTour !== 'DA_QUYET_TOAN' && t.trangThaiTour !== 'HUY');
  const pastTours = tours.filter(t => t.trangThaiChapNhan === 'DA_DONG_Y' && (t.trangThaiTour === 'KET_THUC' || t.trangThaiTour === 'DA_QUYET_TOAN' || t.trangThaiTour === 'HUY'));

  const renderTourTable = (tourList: PhanCongResponse[], title: string, emptyMsg: string, headerClass: string) => (
    <section className="bg-white border border-[#E1F1FF] rounded-[16px] overflow-hidden mb-6">
      <div className={`p-4 border-b border-[#E1F1FF] ${headerClass}`}>
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      </div>
      {tourList.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white">
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-3">Mã tour / Tên tour</th>
                <th className="px-4 py-3">Khởi hành</th>
                <th className="px-4 py-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {tourList.map((tour, index) => {
                const statusObj = getTourStatus(tour.trangThaiTour);
                return (
                  <tr key={`${tour.maPhanCong}-${index}`} className="border-t border-[#E1F1FF]">
                    <td className="px-4 py-3">
                      <div className="text-[#00668A] font-medium text-xs mb-0.5">{tour.maTourThucTe}</div>
                      <div className="font-medium text-gray-800">{tour.tenTour}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tour.ngayKhoiHanh ? formatDate(tour.ngayKhoiHanh) : ''}</td>
                    <td className="px-4 py-3">
                      <Badge label={statusObj.label} variant={statusObj.variant} dot={false} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 text-sm text-gray-400 italic">{emptyMsg}</div>
      )}
    </section>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Hồ sơ Hướng dẫn viên - ${guide.code} - ${guide.name}`} size="2xl">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-6">{error}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-gray-700">
          {/* Cột trái: Thông tin cá nhân */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="bg-white border border-[#E1F1FF] rounded-[16px] p-4 flex flex-col items-center text-center gap-2">
              <div className="w-24 h-24 rounded-full bg-[#E8F6FF] text-[#00668A] flex items-center justify-center text-2xl font-bold overflow-hidden border-4 border-white shadow-sm">
                <span className="text-3xl font-bold text-[#00668A]">{guide.name.charAt(0)}</span>
              </div>
              <div className="text-base font-bold text-[#121C2C]">{guide.name}</div>
              {guide.status === 'available' && <Badge label="Sẵn sàng" variant="success" dot={false} />}
              {guide.status === 'busy' && <Badge label="Đang đi tour" variant="warning" dot={false} />}
              {guide.status === 'resting' && <Badge label="Đang nghỉ" variant="info" dot={false} />}
              
              {rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500 mt-1">
                  <Star size={16} className="fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold text-amber-600">
                    {rating.toFixed(1)} <span className="text-gray-400 font-normal">({nangLuc?.soDanhGia ?? 0})</span>
                  </span>
                </div>
              )}
            </div>

            <div className="bg-[#F4F9FF] border border-[#E1F1FF] rounded-[12px] p-4 flex flex-col gap-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-1">Thông tin cá nhân</h4>
              <div className="flex items-start gap-2">
                <Phone size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Điện thoại</p>
                  <p className="font-medium text-gray-800">{nhanVien?.soDienThoai || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium text-gray-800 break-all">{nhanVien?.email || `${guide.code}@vietnamtravel.com`}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">CCCD/Passport</p>
                  <p className="font-medium text-gray-800">{nhanVien?.cccd || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Cake size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Ngày sinh</p>
                  <p className="font-medium text-gray-800">{nhanVien?.ngaySinh ? formatDate(nhanVien.ngaySinh) : '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={16} className="text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Ngày vào làm</p>
                  <p className="font-medium text-gray-800">{nhanVien?.ngayVaoLam ? formatDate(nhanVien.ngayVaoLam) : '—'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E1F1FF] rounded-[12px] p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Năng lực hiện tại</h4>
              <div className="flex flex-col gap-4">
                <div>
                  <span className="text-gray-500 text-xs block mb-2">Ngôn ngữ</span>
                  <div className="flex flex-wrap gap-1.5">
                    {languages.length > 0 ? (
                      languages.map((l) => (
                        <span key={l} className="px-2 py-0.5 bg-white border border-[#C5EAFF] rounded text-[#00668A] text-xs">
                          {l}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs italic">Chưa cập nhật</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs block mb-2">Thế mạnh / Chứng chỉ</span>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.length > 0 ? (
                      skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-gray-700 text-xs">
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400 text-xs italic">Chưa cập nhật</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Lịch sử / Các tour */}
          <div className="lg:col-span-2 flex flex-col">
            {renderTourTable(pendingTours, "Các tour đang chờ HDV xác nhận", "Không có tour nào đang chờ xác nhận.", "bg-amber-50")}
            {renderTourTable(activeTours, "Các tour sắp và đang đi", "Không có tour nào sắp và đang diễn ra.", "bg-blue-50")}
            {renderTourTable(pastTours, "Các tour đã đi", "Không có lịch sử tour.", "bg-emerald-50")}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default GuideProfileModal;
