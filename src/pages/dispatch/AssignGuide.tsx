import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import { Plus, MoreVertical, CheckCircle, Calendar, User, Hash, Users, ShieldCheck } from 'lucide-react';
import type { TourNeedGuide } from './mockData';
import AssignGuideModal from './AssignGuideModal';
import { dispatchService } from '../../services/dispatch';
import type { NhanVienResponse } from '../../services/dispatch';
import type { TourThucTeResponse } from '../../services/tour-instance';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';
import { formatApiError, unwrapPageContent } from '../../utils/apiHelpers';
import { formatDate } from '../../utils/dateHelpers';

const PENDING_STATUSES = new Set(['CHO_KICH_HOAT']);

const calcDurationDays = (start?: string, end?: string): string => {
  if (!start || !end) return '—';
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return '—';
  const days = Math.max(1, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  return `${days} ngày`;
};

const mapTourToUI = (t: TourThucTeResponse): TourNeedGuide => ({
  id: t.maTourThucTe || '',
  code: t.maTourThucTe || '',
  name: t.tieuDeTour || '',
  startDate: t.ngayKhoiHanh ? formatDate(t.ngayKhoiHanh) : '',
  endDate: t.ngayKetThuc ? formatDate(t.ngayKetThuc) : '',
  duration: calcDurationDays(t.ngayKhoiHanh, t.ngayKetThuc),
  passengers: t.soKhachToiDa || 0,
  requiredSkills: [],
  status: PENDING_STATUSES.has(t.trangThai || '') ? 'pending' : 'assigned',
  location: '',
});

const AssignGuide: React.FC = () => {
  const [data, setData] = useState<TourNeedGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourNeedGuide | null>(null);
  const [availableGuides, setAvailableGuides] = useState<NhanVienResponse[]>([]);
  const [guidesLoading, setGuidesLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ tour: TourNeedGuide; guide: NhanVienResponse } | null>(null);

  const { user } = useAuth();

  const fetchTours = async () => {
    if (!hasAccess(user?.maVaiTro, 'dispatch')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await dispatchService.tourCanPhanCong();
      const pending = unwrapPageContent(res).filter((t) => PENDING_STATUSES.has(t.trangThai || ''));
      setData(pending.map(mapTourToUI));
    } catch (err: unknown) {
      setError(formatApiError(err, 'Lỗi khi tải danh sách tour'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTours();
  }, [user]);

  const openAssignModal = async (tour: TourNeedGuide) => {
    if (!hasAccess(user?.maVaiTro, 'dispatch')) return;
    setSelectedTour(tour);
    setModalOpen(true);
    setGuidesLoading(true);
    setAvailableGuides([]);
    try {
      if (!tour.id) {
        setToastMessage('Không thể tải danh sách HDV khả dụng: Mã tour không hợp lệ.');
        setTimeout(() => setToastMessage(null), 4000);
        setGuidesLoading(false);
        return;
      }
      const res = await dispatchService.hdvKhaDung({ maTourThucTe: tour.id });
      setAvailableGuides(res);
    } catch (err: unknown) {
      console.error(formatApiError(err));
      setAvailableGuides([]);
      setToastMessage('Không thể tải danh sách HDV. Vui lòng thử lại sau.');
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setGuidesLoading(false);
    }
  };

  const handleAssign = async (tourId: string, guideId: string) => {
    try {
      await dispatchService.phanCong({ maTourThucTe: tourId, maNhanVien: guideId });

      const assignedGuide = availableGuides.find((g) => g.maNhanVien === guideId);
      if (assignedGuide && selectedTour) {
        setSuccessData({ tour: selectedTour, guide: assignedGuide });
      }

      setModalOpen(false);
      setToastMessage(null);
    } catch (err: unknown) {
      setToastMessage('Lỗi phân công: ' + formatApiError(err));
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleCloseSuccess = () => {
    setSuccessData(null);
    fetchTours(); // Refresh the list after assignment
  };

  const filteredData = data.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<TourNeedGuide>[] = [
    {
      key: 'tour',
      title: 'Tuyến Tour',
      render: (record) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#00668A]">{record.code}</span>
          <span className="font-semibold text-gray-800 line-clamp-1">{record.name}</span>
        </div>
      ),
    },
    {
      key: 'time',
      title: 'Thời gian & Lịch trình',
      render: (record) => (
        <div className="flex flex-col text-sm">
          <span className="text-gray-800 font-medium">
            {record.startDate} đến {record.endDate}
          </span>
          <span className="text-gray-500">
            [{record.duration}] - {record.passengers} khách
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      align: 'center',
      render: (record) => (
        <Badge
          label={record.status === 'assigned' ? 'Đã phân bổ' : 'Chờ phân bổ'}
          variant={record.status === 'assigned' ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'right',
      render: (record) => {
        if (record.status === 'pending') {
          return (
            <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={() => openAssignModal(record)}>
              Phân bổ ngay
            </Button>
          );
        }
        return (
          <Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} onClick={() => openAssignModal(record)} />
        );
      },
    },
  ];

  return (
    <MainLayout
      activeMenu="Phân công HDV"
      expandedMenus={['Điều phối Hướng dẫn viên']}
      breadcrumb={[{ label: 'Điều phối Hướng dẫn viên' }, { label: 'Phân công HDV' }]}
    >
      <div className="flex flex-col h-full gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[#121C2C]">Danh sách chờ phân bổ</h1>
        </div>

        <div className="bg-white p-4 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[300px]">
            <SearchInput placeholder="Tìm mã hoặc tên tour..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <Button variant="secondary" onClick={fetchTours}>
            Làm mới
          </Button>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 relative min-h-[300px] overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
          ) : (
            <Table<TourNeedGuide> columns={columns} dataSource={paginatedData} rowKey="id" emptyText="Không có tour chờ phân bổ" />
          )}
        </div>

        <Pagination current={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
      </div>

      <AssignGuideModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tour={selectedTour}
        onAssign={handleAssign}
        availableGuides={availableGuides}
        guidesLoading={guidesLoading}
      />

      {/* Success Modal */}
      <Modal
        isOpen={!!successData}
        onClose={handleCloseSuccess}
        size="md"
        title={
          <div className="flex flex-col items-center justify-center pt-6 pb-2 w-full gap-3 text-center pr-6">
            <div className="w-16 h-16 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#121C2C]">Phân công thành công!</h2>
            <p className="text-sm text-gray-500">
              Bạn đã phân công HDV cho tour <span className="font-bold text-[#00668A]">{successData?.tour.name}</span>
            </p>
          </div>
        }
        footer={
          <div className="flex justify-center w-full pb-4">
            <Button variant="primary" onClick={handleCloseSuccess} className="w-[120px]">
              Đóng
            </Button>
          </div>
        }
      >
        {successData && (
          <div className="flex flex-col gap-4 p-2">

            {/* Tour Info (Top) */}
            <div className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E2E8F0]">
                <ShieldCheck size={20} className="text-[#00668A]" />
                <h3 className="font-bold text-[#121C2C] text-base">Thông tin Tour</h3>
              </div>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600 w-24 shrink-0">Mã tour:</span>
                  <span className="font-bold text-[#00668A]">{successData.tour.code}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 w-4 h-4 shrink-0 flex items-center justify-center">T</span>
                  <span className="text-gray-600 w-24 shrink-0">Tên tour:</span>
                  <span className="font-medium text-[#121C2C] leading-snug">{successData.tour.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600 w-24 shrink-0">Thời gian:</span>
                  <span className="font-medium text-[#121C2C]">{successData.tour.startDate} đến {successData.tour.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600 w-24 shrink-0">Số khách:</span>
                  <span className="font-medium text-[#121C2C]">{successData.tour.passengers} người</span>
                </div>
              </div>
            </div>

            {/* Guide Info (Bottom) */}
            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0] shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#E2E8F0]">
                <User size={20} className="text-[#16A34A]" />
                <h3 className="font-bold text-[#121C2C] text-base">Hướng dẫn viên</h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#E1EFFE] text-[#1A56DB] font-bold text-xl rounded-full flex items-center justify-center shrink-0 border-2 border-[#BFDBFE]">
                  {successData.guide.hoTen?.charAt(0) || 'U'}
                </div>
                <div className="flex flex-col gap-1">
                  <p className="font-bold text-[#121C2C] text-base">{successData.guide.hoTen}</p>
                  <div className="flex items-center gap-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium border border-gray-200">
                      {successData.guide.maNhanVien}
                    </span>
                    <span className="text-xs text-gray-500">{successData.guide.soDienThoai}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-500 text-center italic mt-2">
              Tour này sẽ rời danh sách chờ phân bổ trong lúc chờ HDV phản hồi.
            </p>
          </div>
        )}
      </Modal>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-up flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {toastMessage}
        </div>
      )}
    </MainLayout>
  );
};

export default AssignGuide;
