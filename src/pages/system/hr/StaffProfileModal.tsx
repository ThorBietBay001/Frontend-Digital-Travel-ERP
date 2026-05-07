import React from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Briefcase, Cake, Leaf, Mail, MapPin, Phone, Star, User } from 'lucide-react';
import type { Competency, Staff, TourHistory } from './mockData';
import { hrService } from '../../../services/system/hr';
import type { NangLucResponse } from '../../../services/system/hr';

interface StaffProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

const StaffProfileModal: React.FC<StaffProfileModalProps> = ({
  isOpen,
  onClose,
  staff,
}) => {
  const [competencies, setCompetencies] = React.useState<Competency[]>([]);
  const [loading, setLoading] = React.useState(false);

  const parseCompetencies = (res: NangLucResponse): Competency[] => {
    const result: Competency[] = [];
    let idCounter = 1;

    const parseString = (str: string, type: 'Ngôn ngữ' | 'Chứng chỉ' | 'Thế mạnh') => {
      if (!str) return;
      const items = str.split(',');
      items.forEach(item => {
        const match = item.match(/(.*?)(?:\((.*?)\))?$/);
        if (match) {
          result.push({
            id: idCounter++,
            type,
            name: match[1].trim(),
            note: match[2]?.trim()
          });
        }
      });
    };

    parseString(res.ngonNgu || '', 'Ngôn ngữ');
    parseString(res.chungChi || '', 'Chứng chỉ');
    parseString(res.chuyenMon || '', 'Thế mạnh');
    return result;
  };

  React.useEffect(() => {
    if (isOpen && staff) {
      setLoading(true);
      hrService.nangLucNhanVien(staff.id)
        .then(res => setCompetencies(parseCompetencies(res || {})))
        .catch(err => {
          console.error(err);
          setCompetencies([]);
        })
        .finally(() => setLoading(false));
    } else if (!isOpen) {
      setCompetencies([]);
    }
  }, [staff, isOpen]);

  if (!staff) return null;

  const roleLabelMap: Record<string, string> = {
    admin: 'Quản trị viên',
    accountant: 'Nhân viên kế toán',
    operator: 'Nhân viên điều hành',
    product: 'Nhân viên sản phẩm',
    guide: 'Hướng dẫn viên',
    sales: 'Nhân viên kinh doanh',
  };

  const roleVariantMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
    admin: 'info',
    accountant: 'success',
    operator: 'warning',
    product: 'info',
    guide: 'success',
    sales: 'warning',
  };

  const competencyVariantMap: Record<Competency['type'], 'success' | 'warning' | 'error' | 'info'> = {
    'Ngôn ngữ': 'info',
    'Chứng chỉ': 'success',
    'Thế mạnh': 'warning',
  };

  const tourStatusMap: Record<TourHistory['status'], { label: string; variant: 'success' | 'error' | 'warning' | 'info' }> = {
    completed: { label: 'Đã đi', variant: 'success' },
    upcoming: { label: 'Sắp đi', variant: 'info' },
    cancelled: { label: 'Đã hủy', variant: 'error' },
  };

  const reviewMap: Record<string, string[]> = {
    admin: ['Luôn hỗ trợ nhanh và rõ ràng.', 'Phản hồi chính xác khi cần xử lý gấp.'],
    accountant: ['Tỉ mỉ, đối soát minh bạch.', 'Chủ động nhắc nhở tiến độ thanh toán.'],
    operator: ['Phối hợp tour rất mượt.', 'Xử lý tình huống linh hoạt.'],
    product: ['Ý tưởng tour mới đa dạng.', 'Luôn cập nhật xu hướng du lịch.'],
    guide: ['Thuyết minh hấp dẫn, nhiệt tình.', 'Tạo không khí vui vẻ cho đoàn.'],
    sales: ['Tư vấn rõ ràng, dễ hiểu.', 'Chăm sóc khách hàng chu đáo.'],
  };

  const reviews = reviewMap[staff.role] || [];
  const rating = staff.rating ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hồ sơ nhân viên - ${staff.code} - ${staff.name}`}
      size="2xl"
      footer={
        <Button variant="primary" onClick={onClose}>
          Đóng
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm text-gray-700">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="bg-white border border-[#E1F1FF] rounded-[16px] p-4 flex flex-col items-center text-center gap-2">
            <div className="w-24 h-24 rounded-full bg-[#E8F6FF] text-[#00668A] flex items-center justify-center text-2xl font-bold overflow-hidden">
              {staff.avatar ? (
                <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
              ) : (
                staff.name
                  .split(' ')
                  .map((word) => word[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()
              )}
            </div>
            <div className="text-base font-bold text-[#121C2C]">{staff.name}</div>
            <Badge
              label={roleLabelMap[staff.role] || 'Không rõ'}
              variant={roleVariantMap[staff.role] || 'info'}
              dot={false}
            />
            {rating > 0 && (
              <div className="flex items-center gap-1 text-amber-500">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-semibold text-amber-600">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          <div className="bg-[#F4F9FF] border border-[#E1F1FF] rounded-[12px] p-4 flex flex-col gap-3">
            <h4 className="text-sm font-semibold text-gray-800">Thông tin cá nhân</h4>
            <div className="flex items-start gap-2">
              <Cake size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Ngày sinh</p>
                <p className="font-medium text-gray-800">{staff.birthday || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Số điện thoại</p>
                <p className="font-medium text-gray-800">{staff.phone || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-gray-800 break-all">{staff.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Địa chỉ</p>
                <p className="font-medium text-gray-800">{staff.address || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Briefcase size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Ngày vào làm</p>
                <p className="font-medium text-gray-800">{staff.joinDate || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <User size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Giới tính</p>
                <p className="font-medium text-gray-800">{staff.gender || '—'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[12px] p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 text-center">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-full text-emerald-500">
                <Leaf size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Điểm xanh</p>
                <p className="text-lg font-bold text-emerald-600">
                  {staff.greenPoints?.toLocaleString('vi-VN') ?? 0} điểm
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <section className="bg-white border border-[#E1F1FF] rounded-[16px] p-4 relative min-h-[80px]">
            <h4 className="text-sm font-semibold text-gray-800 mb-3">Năng lực hiện tại</h4>
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[16px]">
                <div className="w-6 h-6 border-4 border-[#00668A] border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {competencies.length === 0 && !loading ? (
              <p className="text-sm text-gray-400 italic">Chưa có năng lực.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {competencies.map((competency) => (
                  <Badge
                    key={competency.id}
                    label={`${competency.type}: ${competency.name}`}
                    variant={competencyVariantMap[competency.type]}
                    dot={false}
                    size="sm"
                  />
                ))}
              </div>
            )}
          </section>

          <section className="bg-white border border-[#E1F1FF] rounded-[16px] overflow-hidden">
            <div className="p-4 border-b border-[#E1F1FF] bg-[#F4F9FF]">
              <h4 className="text-sm font-semibold text-gray-800">Lịch sử đi tour</h4>
            </div>
            {staff.tourHistory && staff.tourHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white">
                    <tr className="text-left text-xs text-gray-500">
                      <th className="px-4 py-3">Tên tour</th>
                      <th className="px-4 py-3">Ngày đi</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3 text-right">Tổng tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.tourHistory.map((tour, index) => {
                      const statusInfo = tourStatusMap[tour.status];
                      return (
                        <tr key={`${tour.tourName}-${index}`} className="border-t border-[#E1F1FF]">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">{tour.tourName}</div>
                            {tour.guideName && (
                              <div className="text-xs text-gray-500">HDV: {tour.guideName}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-600">{tour.startDate}</td>
                          <td className="px-4 py-3">
                            <Badge label={statusInfo.label} variant={statusInfo.variant} />
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-800">
                            {tour.amount.toLocaleString('vi-VN')} đ
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 text-sm text-gray-400 italic">Không có lịch sử tour.</div>
            )}
          </section>

          {staff.role === 'guide' && (
            <section className="bg-white border border-[#E1F1FF] rounded-[16px] p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Đánh giá</h4>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-400 italic">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-2 text-sm text-gray-600">
                  {reviews.map((review, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#89D4FF]" />
                      <span>{review}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StaffProfileModal;
