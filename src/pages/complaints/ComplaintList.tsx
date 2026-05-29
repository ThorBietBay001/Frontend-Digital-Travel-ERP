import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { ArrowRight, Eye } from 'lucide-react';
import ComplaintDrawer from './ComplaintDrawer';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { Complaint } from './mockData';
import type { YeuCauHoTroResponse, XuLyHoTroRequest } from '../../services/complaints';
import { complaintsService } from '../../services/complaints';
import { incidentService } from '../../services/incidents';
import type { NhatKySuCoResponse } from '../../services/incidents';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const mapStatus = (s?: string, noiDung?: string): Complaint['status'] => {
  const isGuideExplanation = !!noiDung?.includes('[Yêu cầu HDV giải trình');
  switch (s?.toUpperCase()) {
    case 'DA_XU_LY': return 'resolved';
    case 'TU_CHOI': return 'rejected';
    case 'CHO_BO_SUNG': return isGuideExplanation ? 'pending_guide' : 'pending_info';
    case 'CHO_GIAI_TRINH': return 'pending_guide';
    case 'CHO_DUYET': return 'pending_review';
    case 'CHUA_XU_LY': return 'pending';
    default: return 'pending';
  }
};

const FINANCE_REQUEST_TYPES = new Set(['HUY_TOUR', 'HOAN_TIEN']);

const ComplaintList: React.FC = () => {
  const itemsPerPage = 5;
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [drawerMode, setDrawerMode] = useState<'edit' | 'view'>('view');

  const mapToUI = (api: YeuCauHoTroResponse): Complaint => {
    const savedResolution = localStorage.getItem(`complaint_res_${api.maYeuCau}`);
    const savedTimelineStr = localStorage.getItem(`complaint_timeline_${api.maYeuCau}`);
    let savedTimeline = [];
    try {
      if (savedTimelineStr) savedTimeline = JSON.parse(savedTimelineStr);
    } catch (e) {}

    return {
      id: api.maYeuCau || '',
      code: api.maYeuCau || '',
      maDatTour: api.maDatTour || '',
      customerName: api.maDatTour || '',
      customerPhone: '',
      tourName: api.loaiYeuCau || '',
      guideName: api.maNhanVienXuLy,
      sentDate: api.thoiDiemTao ? formatDate(api.thoiDiemTao) : '',
      severity: 'THAP',
      status: mapStatus(api.trangThai, api.noiDung),
      description: (api.noiDung || '')
        .replace(/\[Yêu cầu (?:KH bổ sung|HDV giải trình) lúc [^\]]+\]:.*?(?=\n\[|$)/gs, '')
        .trim(),
      resolution: savedResolution || undefined,
      timeline: savedTimeline,
      source: 'complaint',
    };
  };

  const mapIncidentToUI = (api: NhatKySuCoResponse): Complaint => ({
    id: api.maNhatKySuCo || '',
    code: api.maNhatKySuCo || '',
    maDatTour: '',
    customerName: api.hoTenKhachHang || api.maKhachHang || '',
    customerPhone: '',
    tourName: api.loaiSuCo || '',
    guideName: api.maHdvBaoCao,
    sentDate: api.thoiGianBaoCao ? formatDate(api.thoiGianBaoCao) : '',
    severity: api.mucDo === 'SOS' ? 'SOS' : 'THAP',
    status: 'pending',
    description: api.moTa || '',
    timeline: [],
    source: 'incident',
  });

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'complaints')) return;
    setLoading(true);
    setError(null);
    try {
      const [complaintsRes, incidents] = await Promise.all([
        (async () => {
          const pageSize = 100;
          const firstPage = await complaintsService.danhSachYeuCauHoTro({ page: 0, size: pageSize });
          const totalPages = firstPage?.totalPages ?? 1;
          if (totalPages <= 1) return firstPage?.content ?? [];
          const remainingPages = await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              complaintsService.danhSachYeuCauHoTro({ page: index + 1, size: pageSize })
            )
          );
          return [firstPage, ...remainingPages].flatMap(page => page?.content ?? []);
        })(),
        incidentService.lichSuSuCoCuaHdv().catch(() => [] as NhatKySuCoResponse[]),
      ]);
      const mapped = [
        ...complaintsRes
          .filter(item => !FINANCE_REQUEST_TYPES.has((item.loaiYeuCau || '').toUpperCase()))
          .map(mapToUI),
        ...incidents.map(mapIncidentToUI),
      ];
      setComplaints(mapped);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(search.toLowerCase()) ||
                          c.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'all' || c.severity === selectedSeverity;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus, selectedSeverity]);

  React.useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const columns: Column<Complaint>[] = [
    {
      key: 'code',
      title: 'Mã KN',
      width: '12%',
      render: (record) => <span className="font-bold text-[#00668A]">{record.code}</span>
    },
    {
      key: 'guideName',
      title: 'Tên nhân viên',
      width: '15%',
      render: (record) => (
        <span className="font-medium text-gray-800">{record.guideName || '—'}</span>
      )
    },
    {
      key: 'description',
      title: 'Nội dung',
      width: '33%',
      render: (record) => (
        <span className="text-sm text-gray-700 line-clamp-2" title={record.description}>
          {record.description || '—'}
        </span>
      )
    },
    {
      key: 'severity',
      title: 'Mức độ',
      width: '13%',
      render: (record) => {
        const isSOS = record.severity === 'SOS';
        return <Badge label={isSOS ? 'SOS' : 'Thấp'} variant={isSOS ? 'error' : 'warning'} />;
      }
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '15%',
      render: (record) => {
        if (record.source === 'incident') {
          return <Badge label="Đã ghi nhận" variant="neutral" />;
        }
        let label = '';
        let variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'info';
        switch (record.status) {
          case 'pending': label = 'Chờ xử lý'; variant = 'info'; break;
          case 'processing': label = 'Đang xử lý'; variant = 'info'; break;
          case 'pending_info': label = 'Chờ bổ sung'; variant = 'warning'; break;
          case 'pending_guide': label = 'Chờ giải trình'; variant = 'warning'; break;
          case 'pending_review': label = 'Chờ duyệt'; variant = 'warning'; break;
          case 'resolved': label = 'Đã giải quyết'; variant = 'success'; break;
          case 'rejected': label = 'Từ chối'; variant = 'error'; break;
          case 'cancelled': label = 'Đã hủy'; variant = 'neutral'; break;
          default: label = 'Chờ xử lý'; variant = 'info';
        }
        return <Badge label={label} variant={variant as 'success' | 'warning' | 'error' | 'info' | 'neutral'} />;
      }
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: '12%',
      align: 'center',
      render: (record) => {
        if (record.source === 'incident') {
          return <Badge label="Sự cố" variant="neutral" />;
        }
        const isDone = record.status === 'resolved' || record.status === 'rejected' || record.status === 'cancelled';
        return (
          <Button
            variant={isDone ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => handleOpenDrawer(record, isDone ? 'view' : 'edit')}
            icon={isDone ? <Eye size={16} /> : <ArrowRight size={16} />}
          >
            {isDone ? 'Xem' : 'Xử lý'}
          </Button>
        );
      }
    }
  ];

  const handleOpenDrawer = (complaint: Complaint, mode: 'edit' | 'view') => {
    if (complaint.source === 'incident') return;
    setSelectedComplaint(complaint);
    setDrawerMode(mode);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedComplaint(null);
  };

  const handleComplaintUpdate = async (updatedComplaint: Complaint) => {
    try {
      let apiStatus = '';
      switch (updatedComplaint.status) {
        case 'resolved': apiStatus = 'DA_XU_LY'; break;
        case 'rejected': apiStatus = 'TU_CHOI'; break;
        case 'pending_info': apiStatus = 'CHO_BO_SUNG'; break;
        case 'pending_guide': apiStatus = 'CHO_GIAI_TRINH'; break;
        case 'pending_review': apiStatus = 'CHO_DUYET'; break;
        case 'pending': apiStatus = 'CHUA_XU_LY'; break;
        default: apiStatus = 'CHUA_XU_LY';
      }
      
      const payload: XuLyHoTroRequest = {
        trangThai: apiStatus,
        ghiChu: updatedComplaint.resolution,
      };
      
      if (updatedComplaint.status === 'pending_guide') {
        const lastAction = updatedComplaint.timeline[updatedComplaint.timeline.length - 1]?.action || '';
        const noiDung = lastAction.includes(':') ? lastAction.split(':').slice(1).join(':').trim() : lastAction;
        await complaintsService.yeuCauHdvGiaiTrinh(updatedComplaint.id, noiDung || 'Vui lòng giải trình yêu cầu hỗ trợ này.');
      } else if (updatedComplaint.status === 'pending_info') {
        const lastAction = updatedComplaint.timeline[updatedComplaint.timeline.length - 1]?.action || '';
        const noiDung = lastAction.includes(':') ? lastAction.split(':').slice(1).join(':').trim() : lastAction;
        await complaintsService.yeuCauKhachHangBoSung(updatedComplaint.id, noiDung || 'Vui lòng bổ sung thông tin cho yêu cầu hỗ trợ này.');
      } else {
        await complaintsService.xuLyYeuCauHoTro(updatedComplaint.id, payload);
      }

      // Save local state to persist across API reloads since Backend doesn't support these fields yet
      if (updatedComplaint.resolution) {
        localStorage.setItem(`complaint_res_${updatedComplaint.id}`, updatedComplaint.resolution);
      }
      if (updatedComplaint.timeline && updatedComplaint.timeline.length > 0) {
        localStorage.setItem(`complaint_timeline_${updatedComplaint.id}`, JSON.stringify(updatedComplaint.timeline));
      }
      setSelectedComplaint(updatedComplaint);
      getAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi cập nhật';
      alert('Lỗi: ' + msg);
    }
  };

  return (
    <MainLayout activeMenu="Quản lý Khiếu nại" breadcrumb={[{ label: 'Quản lý Khiếu nại' }]}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#121C2C]">Danh sách Khiếu nại & Phản hồi</h1>
        {/* <p className="text-gray-500 mt-1">Quản lý và theo dõi tiến độ xử lý khiếu nại từ khách hàng.</p> */}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E1F1FF] mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <SearchInput placeholder="Tìm mã khiếu nại, tên khách hàng..." value={search} onChange={setSearch} />
        </div>
        <div className="w-[160px]">
          <Select
            value={selectedSeverity}
            onChange={setSelectedSeverity}
            options={[
              { value: 'all', label: 'Mức độ: Tất cả' },
              { value: 'THAP', label: 'Thấp' },
              { value: 'SOS', label: 'SOS' }
            ]}
          />
        </div>
        <div className="w-[200px]">
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'all', label: 'Trạng thái: Tất cả' },
              { value: 'pending', label: 'Chờ xử lý' },
              { value: 'pending_info', label: 'Chờ bổ sung' },
              { value: 'pending_guide', label: 'Chờ giải trình' },
              { value: 'pending_review', label: 'Chờ duyệt' },
              { value: 'resolved', label: 'Đã giải quyết' },
              { value: 'rejected', label: 'Từ chối' }
            ]}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#E1F1FF] overflow-hidden relative min-h-[300px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
        ) : (
          <Table<Complaint> dataSource={paginatedComplaints} columns={columns} />
        )}
        <div className="p-4 border-t border-[#E1F1FF]">
          <Pagination
            current={currentPage}
            total={filteredComplaints.length}
            pageSize={itemsPerPage}
            onChange={setCurrentPage}
          />
        </div>
      </div>

      <ComplaintDrawer
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        complaint={selectedComplaint}
        mode={drawerMode}
        onUpdate={handleComplaintUpdate}
      />
    </MainLayout>
  );
};

export default ComplaintList;
