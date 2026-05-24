import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { Phone, Mail, CreditCard, Leaf, Cake, AlertCircle, MapPinned } from 'lucide-react';
import type { Customer } from './mockData';
import { customersService } from '../../services/customers';
import api from '../../services/api';
import { mapSupportRequestStatus, mapOrderStatus } from '../../utils/statusMapping';

interface LichSuTourItem {
  maLichSuTour: string;
  maTourThucTe: string;
  tieuDeTour: string;
  ngayKhoiHanh: string;
  thoiLuong: number;
  ngayThamGia: string;
  trangThai?: string;
}

interface YeuCauHoTroItem {
  maYeuCau: string;
  loaiYeuCau: string;
  noiDung: string;
  trangThai: string;
  maDatTour: string;
  ngayTao?: string;
}

interface CustomerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({ isOpen, onClose, customer }) => {
  const [detailData, setDetailData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [tourHistory, setTourHistory] = useState<LichSuTourItem[]>([]);
  const [tourHistoryLoading, setTourHistoryLoading] = useState(false);
  const [tourHistoryError, setTourHistoryError] = useState(false);
  const [complaints, setComplaints] = useState<YeuCauHoTroItem[]>([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [complaintsError, setComplaintsError] = useState(false);

  useEffect(() => {
    if (isOpen && customer?.id) {
      setLoading(true);
      customersService.chiTietKhachHang(customer.id)
        .then((res) => {
          if (res) {
            setDetailData({
              ...customer,
              idCard: res.cccd || customer.idCard,
              birthday: res.ngaySinh ? res.ngaySinh.toString() : customer.birthday,
              greenPoints: res.diemXanh || customer.greenPoints,
            });
          } else {
            setDetailData(customer);
          }
        })
        .catch(() => {
          setDetailData(customer);
        })
        .finally(() => {
          setLoading(false);
        });

      // Fetch tour history and complaints
      setTourHistoryLoading(true);
      setTourHistoryError(false);
      setComplaintsLoading(true);
      setComplaintsError(false);
      
      api.get<{ data: { content?: any[] } }>('/api/kinh-doanh/don-dat-tour', { params: { size: 100 } })
        .then((res) => {
          const allOrders = res.data?.data?.content ?? [];
          const customerOrders = allOrders.filter(o => o.maKhachHang === customer.id);
          const mappedHistory: LichSuTourItem[] = customerOrders.map(o => ({
            maLichSuTour: o.maDatTour,
            maTourThucTe: o.maTourThucTe,
            tieuDeTour: o.tieuDeTour,
            ngayKhoiHanh: o.ngayKhoiHanh,
            thoiLuong: o.thoiLuong,
            ngayThamGia: o.ngayDat,
            trangThai: o.trangThai
          }));
          setTourHistory(mappedHistory);
          
          const customerOrderCodes = customerOrders.map(o => o.maDatTour);
          api.get<{ data: { content?: YeuCauHoTroItem[] } }>('/api/kinh-doanh/yeu-cau-ho-tro', { params: { size: 100 } })
            .then((res2) => {
              const allComplaints = res2.data?.data?.content ?? [];
              const customerComplaints = allComplaints.filter(c => customerOrderCodes.includes(c.maDatTour));
              setComplaints(customerComplaints);
            })
            .catch(() => {
              setComplaints([]);
              setComplaintsError(true);
            })
            .finally(() => {
              setComplaintsLoading(false);
            });
        })
        .catch(() => {
          setTourHistory([]);
          setTourHistoryError(true);
          setComplaints([]);
          setComplaintsError(true);
          setComplaintsLoading(false);
        })
        .finally(() => {
          setTourHistoryLoading(false);
        });
    } else {
      setDetailData(null);
      setTourHistory([]);
      setTourHistoryError(false);
      setComplaints([]);
      setComplaintsError(false);
    }
  }, [isOpen, customer]);

  if (!customer && !detailData) return null;
  const displayData = detailData || customer!;

  const renderTierBadge = (tier: string) => {
    switch (tier) {
      case 'diamond': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 border border-blue-300">Kim Cương</span>;
      case 'gold': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">Vàng</span>;
      case 'silver': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-600 border border-gray-300">Bạc</span>;
      case 'bronze': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-[#fdf8f5] text-[#8b4513] border border-[#d2b48c]">Đồng</span>;
      case 'member': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">Thành viên</span>;
      default: return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">Thành viên</span>;
    }
  };

  const tourColumns: Column<LichSuTourItem>[] = [
    {
      key: 'maTourThucTe',
      title: 'Mã tour',
      width: '110px',
      render: (record) => (
        <span className="font-semibold text-[#00668A] whitespace-nowrap">{record.maTourThucTe || '—'}</span>
      ),
    },
    {
      key: 'tieuDeTour',
      title: 'Tên tour',
      width: '280px',
      render: (record) => (
        <div className="font-medium text-gray-800 truncate" title={record.tieuDeTour || record.maTourThucTe}>
          {record.tieuDeTour || record.maTourThucTe}
        </div>
      ),
    },
    {
      key: 'ngayKhoiHanh',
      title: 'Ngày KH',
      width: '110px',
      render: (record) => <span className="text-sm text-gray-600 whitespace-nowrap">{record.ngayKhoiHanh || '—'}</span>,
    },
    {
      key: 'thoiLuong',
      title: 'Thời lượng',
      width: '90px',
      render: (record) => <span className="text-sm text-gray-600 whitespace-nowrap">{record.thoiLuong ? `${record.thoiLuong} ngày` : '—'}</span>,
    },
    {
      key: 'ngayThamGia',
      title: 'Ngày tham gia',
      width: '130px',
      render: (record) => <span className="text-sm text-gray-600 whitespace-nowrap">{record.ngayThamGia || '—'}</span>,
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      width: '140px',
      render: (record) => {
        if (!record.trangThai) return <span className="text-sm text-gray-500 whitespace-nowrap">—</span>;
        const mapped = mapOrderStatus(record.trangThai);
        return <div className="whitespace-nowrap"><Badge label={mapped.label} variant={mapped.variant} /></div>;
      },
    },
  ];

  const mapRequestType = (type?: string) => {
    switch (type) {
      case 'THANH_TOAN': return 'Thanh toán';
      case 'DICH_VU': return 'Dịch vụ';
      case 'HUY_TOUR': return 'Hủy tour';
      case 'KHAC': return 'Khác';
      default: return type || '—';
    }
  };

  const complaintColumns: Column<YeuCauHoTroItem>[] = [
    {
      key: 'maYeuCau',
      title: 'Mã KN',
      render: (record) => <span className="font-semibold text-[#00668A]">{record.maYeuCau}</span>,
    },
    {
      key: 'noiDung',
      title: 'Nội dung',
      render: (record) => (
        <span className="text-sm text-gray-700 line-clamp-2" title={record.noiDung}>{record.noiDung || '—'}</span>
      ),
    },
    {
      key: 'trangThai',
      title: 'Trạng thái',
      align: 'center',
      render: (record) => {
        const mapped = mapSupportRequestStatus(record.trangThai);
        return <Badge label={mapped.label} variant={mapped.variant} />;
      },
    },
    {
      key: 'loaiYeuCau',
      title: 'Loại yêu cầu',
      render: (record) => <span className="text-sm text-gray-600">{mapRequestType(record.loaiYeuCau)}</span>,
    },
    {
      key: 'ngayTao',
      title: 'Ngày tạo',
      render: (record) => <span className="text-sm text-gray-600">{record.ngayTao || '—'}</span>,
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hồ Sơ Khách Hàng - ${displayData.code} - ${displayData.name}`}
      size={'3xl' as any}
      footer={<Button variant="primary" onClick={onClose}>Đóng</Button>}
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700 font-sans">
        
        {/* Left Column - 1/3 */}
        <div className="flex flex-col gap-5 md:col-span-1">
          {/* Avatar and Basic info */}
          <div className="flex flex-col items-center text-center p-4 bg-[#F9F9FF] border border-[#E1F1FF] rounded-[16px]">
            <div className="w-24 h-24 bg-[#E8F6FF] text-[#00668A] flex items-center justify-center rounded-full mb-3 shadow-sm border-2 border-white text-3xl font-bold">
              {displayData.avatar ? (
                <img src={displayData.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                displayData.name.charAt(0).toUpperCase()
              )}
            </div>
            <h3 className="text-lg font-bold text-[#121C2C] mb-2">{displayData.name}</h3>
            {renderTierBadge(displayData.membershipTier)}
          </div>


          {/* Personal Info */}
          <div className="bg-white border border-[#E1F1FF] p-4 rounded-[12px] shadow-sm flex flex-col gap-3">
            <h4 className="font-bold text-[#121C2C] border-b border-[#E1F1FF] pb-2 mb-1">Thông tin cá nhân</h4>
            <div className="flex items-start gap-2">
              <Phone size={16} className="text-gray-400 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">Điện thoại</span>
                <span className="font-medium text-gray-800">{displayData.phone}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Mail size={16} className="text-gray-400 mt-0.5" />
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-xs text-gray-500">Email</span>
                <span className="font-medium text-gray-800 truncate" title={displayData.email}>{displayData.email}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard size={16} className="text-gray-400 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-gray-500">CCCD/Passport</span>
                <span className="font-medium text-gray-800">{displayData.idCard || '—'}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Cake size={16} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Ngày sinh</p>
                <p className="text-sm font-medium text-gray-800">{displayData.birthday || '—'}</p>
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
              <p className="text-base font-bold text-[#16A34A]">🍃 + {displayData.greenPoints?.toLocaleString('vi-VN')} điểm</p>
            </div>
          </div>

        </div>

        {/* Right Column - 2/3 */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Lịch sử đi tour */}
          <div className="bg-white border border-[#E1F1FF] rounded-[16px] shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E1F1FF] bg-[#F9F9FF] flex items-center gap-2">
              <MapPinned size={18} className="text-[#00668A]" />
              <h3 className="font-bold text-[#121C2C] text-base">Lịch sử đi tour</h3>
            </div>
            {tourHistoryLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00668A]"></div>
                <span className="ml-3 text-sm text-gray-500">Đang tải...</span>
              </div>
            ) : tourHistoryError ? (
              <div className="flex-1 p-8 text-center text-red-500 italic">
                Lỗi khi tải lịch sử tour
              </div>
            ) : tourHistory.length > 0 ? (
              <Table<LichSuTourItem>
                columns={tourColumns}
                dataSource={tourHistory}
                rowKey="maLichSuTour"
                emptyText="Không có lịch sử tour"
              />
            ) : (
              <div className="flex-1 p-8 text-center text-gray-500 italic">
                Chưa có lịch sử đi tour
              </div>
            )}
          </div>

          {/* Lịch sử khiếu nại */}
          <div className="bg-white border border-[#E1F1FF] rounded-[16px] shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#E1F1FF] bg-[#F9F9FF] flex items-center gap-2">
              <AlertCircle size={18} className="text-orange-500" />
              <h3 className="font-bold text-[#121C2C] text-base">Lịch sử khiếu nại</h3>
            </div>
            {complaintsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00668A]"></div>
                <span className="ml-3 text-sm text-gray-500">Đang tải...</span>
              </div>
            ) : complaintsError ? (
              <div className="flex-1 p-8 text-center text-red-500 italic">
                Lỗi khi tải lịch sử khiếu nại
              </div>
            ) : complaints.length > 0 ? (
              <Table<YeuCauHoTroItem>
                columns={complaintColumns}
                dataSource={complaints}
                rowKey="maYeuCau"
                emptyText="Không có khiếu nại"
              />
            ) : (
              <div className="flex-1 p-8 text-center text-gray-500 italic">
                Chưa có khiếu nại
              </div>
            )}
          </div>

        </div>

      </div>
      )}
    </Modal>
  );
};

export default CustomerDetailModal;
