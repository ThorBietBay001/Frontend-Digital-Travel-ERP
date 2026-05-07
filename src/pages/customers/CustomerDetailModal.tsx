import React from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { User, Phone, Mail, MapPin, CreditCard, Leaf, Cake, AlertCircle } from 'lucide-react';
import type { Customer } from './mockData';

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
  if (!customer) return null;

  const renderTierBadge = (tier: string) => {
    switch (tier) {
      case 'diamond': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-white border border-slate-600">Kim Cương</span>;
      case 'gold': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">Vàng</span>;
      case 'silver': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-800 border border-gray-300">Bạc</span>;
      case 'bronze': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-300">Đồng</span>;
      default: return null;
    }
  };

  const renderComplaintStatus = (status: string) => {
    switch (status) {
      case 'pending': return <Badge label="Chờ tiếp nhận" variant="warning" />;
      case 'processing': return <Badge label="Đang xử lý" variant="info" />;
      case 'resolved': return <Badge label="Đã giải quyết" variant="success" />;
      case 'rejected': return <Badge label="Từ chối" variant="error" />;
      default: return <Badge label="Không rõ" variant="neutral" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hồ Sơ Khách Hàng - ${customer.code} - ${customer.name}`}
      size={'3xl' as any}
      footer={<Button variant="primary" onClick={onClose}>Đóng</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700 font-sans">
        
        {/* Left Column - 1/3 */}
        <div className="flex flex-col gap-5 md:col-span-1">
          {/* Avatar and Basic info */}
          <div className="flex flex-col items-center text-center p-4 bg-[#F9F9FF] border border-[#E1F1FF] rounded-[16px]">
            <div className="w-24 h-24 bg-[#E8F6FF] text-[#00668A] flex items-center justify-center rounded-full mb-3 shadow-sm border-2 border-white text-3xl font-bold">
              {customer.avatar ? (
                <img src={customer.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                customer.name.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="text-lg font-bold text-[#121C2C] mb-2">{customer.name}</h3>
            {renderTierBadge(customer.membershipTier)}
          </div>


          {/* Personal Info */}
          <div className="bg-white border border-[#E1F1FF] p-4 rounded-[12px] shadow-sm flex flex-col gap-3">
            <h4 className="font-bold text-[#121C2C] border-b border-[#E1F1FF] pb-2 mb-1">Thông tin cá nhân</h4>
            <div className="flex items-start gap-2">
              <Phone size={16} className="text-gray-400 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Điện thoại</span>
                <span className="font-medium text-gray-800">{customer.phone}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail size={16} className="text-gray-400 mt-0.5" />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs text-gray-500">Email</span>
                <span className="font-medium text-gray-800 truncate" title={customer.email}>{customer.email}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard size={16} className="text-gray-400 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">CCCD/Passport</span>
                <span className="font-medium text-gray-800">{customer.idCard || '—'}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Cake size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Ngày sinh</p>
                <p className="text-sm font-medium text-gray-800">{customer.birthday || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Giới tính</p>
                <p className="text-sm font-medium text-gray-800">{customer.gender || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-gray-400 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Địa chỉ</span>
                <span className="font-medium text-gray-800 line-clamp-2" title={customer.address}>{customer.address || '—'}</span>
              </div>
            </div>
          </div>

        {/* Green Points Card */}
          <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-4 rounded-[12px] flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm text-[#16A34A]">
              <Leaf size={20} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600 mb-0.5">Điểm Xanh (Green Points)</p>
              <p className="text-base font-bold text-[#16A34A]">🍃 + {customer.greenPoints.toLocaleString('vi-VN')} điểm</p>
            </div>
          </div>

        </div>

        {/* Right Column - 2/3 */}
        <div className="md:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-[#E1F1FF] rounded-[16px] shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E1F1FF] bg-[#F9F9FF]">
              <h3 className="font-bold text-[#121C2C] text-base">Lịch sử đi tour</h3>
            </div>
            <div className="flex-1 p-0 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3 border-b border-[#E1F1FF]">Mã Tour</th>
                    <th className="px-4 py-3 border-b border-[#E1F1FF]">Tên Tour</th>
                    <th className="px-4 py-3 border-b border-[#E1F1FF]">Ngày đi</th>
                    <th className="px-4 py-3 border-b border-[#E1F1FF] text-center">Trạng thái</th>
                    <th className="px-4 py-3 border-b border-[#E1F1FF] text-right">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.tourHistory && customer.tourHistory.length > 0 ? (
                    customer.tourHistory.map((tour, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F9FF] transition-colors border-b border-[#E1F1FF] last:border-b-0">
                        <td className="px-4 py-3 font-semibold text-[#00668A]">{tour.tourCode}</td>
                        <td className="px-4 py-3 text-gray-800 max-w-[200px] truncate" title={tour.tourName}>{tour.tourName}</td>
                        <td className="px-4 py-3 text-gray-600">{tour.startDate}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge 
                            label={tour.status === 'completed' ? 'Đã đi' : 'Đã hủy'} 
                            variant={tour.status === 'completed' ? 'success' : 'error'} 
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-gray-800">{tour.amount.toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">
                        Khách hàng này chưa có lịch sử đi tour.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lịch sử khiếu nại */}
          <div className="bg-white border border-[#E1F1FF] rounded-[16px] shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E1F1FF] bg-[#F9F9FF] flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" />
              <h3 className="font-bold text-[#121C2C] text-base">Lịch sử khiếu nại</h3>
            </div>
            <div className="flex-1 p-0 overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 font-medium">
                  <tr>
                    <th className="px-4 py-3 border-b border-[#E1F1FF]">Mã KN</th>
                    <th className="px-4 py-3 border-b border-[#E1F1FF]">Ngày gửi</th>
                    <th className="px-4 py-3 border-b border-[#E1F1FF]">Nội dung</th>
                    <th className="px-4 py-3 border-b border-[#E1F1FF] text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.complaints && customer.complaints.length > 0 ? (
                    customer.complaints.map((complaint, idx) => (
                      <tr key={idx} className="hover:bg-[#F4F9FF] transition-colors border-b border-[#E1F1FF] last:border-b-0">
                        <td className="px-4 py-3 font-semibold text-[#00668A]">{complaint.code}</td>
                        <td className="px-4 py-3 text-gray-600">{complaint.date}</td>
                        <td className="px-4 py-3 text-gray-800 max-w-[250px] truncate" title={complaint.description}>{complaint.description}</td>
                        <td className="px-4 py-3 text-center">
                          {renderComplaintStatus(complaint.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                        Khách hàng này chưa có khiếu nại nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </Modal>
  );
};

export default CustomerDetailModal;