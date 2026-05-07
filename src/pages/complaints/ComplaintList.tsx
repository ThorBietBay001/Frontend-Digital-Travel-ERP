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
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const mapStatus = (s?: string): Complaint['status'] => {
  switch (s?.toUpperCase()) {
    case 'PROCESSING': return 'processing';
    case 'PENDING_INFO': return 'pending_info';
    case 'PENDING_GUIDE': return 'pending_guide';
    case 'RESOLVED': return 'resolved';
    case 'REJECTED': return 'rejected';
    case 'CANCELLED': return 'cancelled';
    default: return 'pending';
  }
};

const ComplaintList: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTour, setSelectedTour] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [drawerMode, setDrawerMode] = useState<'edit' | 'view'>('view');

  const mapToUI = (api: YeuCauHoTroResponse): Complaint => ({
    id: api.maYeuCau || '',
    code: api.maYeuCau || '',
    customerName: api.maDatTour || '',
    customerPhone: '',
    tourName: api.loaiYeuCau || '',
    guideName: api.maNhanVienXuLy,
    sentDate: api.thoiDiemTao ? api.thoiDiemTao.split('T')[0] : '',
    severity: 'medium',
    status: mapStatus(api.trangThai),
    description: api.noiDung || '',
    timeline: [],
  });

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'complaints')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await complaintsService.danhSachYeuCauHoTro();
      setComplaints(res && res.content ? res.content.map(mapToUI) : []);
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
    const matchesSeverity = selectedSeverity === 'all' || c.severity === selectedSeverity;
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
    const matchesTour = selectedTour === 'all' || c.tourName === selectedTour;
    return matchesSearch && matchesSeverity && matchesStatus && matchesTour;
  });

  const columns: Column<Complaint>[] = [
    {
      key: 'code',
      title: 'Mã KN',
      render: (record) => <span className="font-bold text-[#00668A]">{record.code}</span>
    },
    {
      key: 'sentDate',
      title: 'Ngày gửi',
      render: (record) => (
        <div className="flex flex-col">
          <span>{record.sentDate}</span>
          <span className="text-xs text-gray-500">{record.timeline[0]?.timestamp?.split(' - ')[1] || ''}</span>
        </div>
      )
    },
    {
      key: 'customerName',
      title: 'Khách hàng / Mã ĐH',
      render: (record) => (
        <div className="flex flex-col">
          <span className="font-bold">{record.customerName}</span>
          <span className="text-xs text-gray-500">{record.customerPhone}</span>
        </div>
      )
    },
    {
      key: 'tourName',
      title: 'Tour/HDV',
      render: (record) => (
        <div className="flex flex-col">
          <span>{record.tourName}</span>
          {record.guideName && <span className="text-xs text-gray-500">HDV: {record.guideName}</span>}
        </div>
      )
    },
    {
      key: 'severity',
      title: 'Mức độ',
      render: (record) => {
        let label = '';
        let variant: 'success' | 'warning' | 'error' | 'info' = 'info';
        if (record.severity === 'high') { label = 'Cao'; variant = 'error'; }
        else if (record.severity === 'medium') { label = 'Trung bình'; variant = 'warning'; }
        else { label = 'Thấp'; variant = 'success'; }
        return <Badge label={label} variant={variant} />;
      }
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (record) => {
        let label = '';
        let variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'info';
        switch (record.status) {
          case 'pending': label = 'Chờ xử lý'; variant = 'info'; break;
          case 'processing': label = 'Đang xử lý'; variant = 'info'; break;
          case 'pending_info': label = 'Chờ bổ sung'; variant = 'warning'; break;
          case 'pending_guide': label = 'Chờ giải trình'; variant = 'warning'; break;
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
      render: (record) => {
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
      const payload: XuLyHoTroRequest = {
        trangThai: updatedComplaint.status.toUpperCase(),
        ghiChu: updatedComplaint.resolution,
      };
      await complaintsService.xuLyYeuCauHoTro(updatedComplaint.id, payload);
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
        <p className="text-gray-500 mt-1">Quản lý và theo dõi tiến độ xử lý khiếu nại từ khách hàng.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#E1F1FF] mb-6 flex flex-wrap gap-4 items-center">
        <div className="w-64">
          <SearchInput placeholder="Tìm mã khiếu nại, tên khách hàng..." value={search} onChange={setSearch} />
        </div>
        <div className="w-48">
          <Select
            value={selectedSeverity}
            onChange={setSelectedSeverity}
            options={[
              { value: 'all', label: 'Mức độ: Tất cả' },
              { value: 'high', label: 'Cao' },
              { value: 'medium', label: 'Trung bình' },
              { value: 'low', label: 'Thấp' }
            ]}
          />
        </div>
        <div className="w-48">
          <Select
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={[
              { value: 'all', label: 'Trạng thái: Tất cả' },
              { value: 'pending', label: 'Chờ xử lý' },
              { value: 'processing', label: 'Đang xử lý' },
              { value: 'pending_info', label: 'Chờ bổ sung' },
              { value: 'pending_guide', label: 'Chờ giải trình' },
              { value: 'resolved', label: 'Đã giải quyết' },
              { value: 'rejected', label: 'Từ chối' },
              { value: 'cancelled', label: 'Đã hủy' }
            ]}
          />
        </div>
        <div className="w-48">
          <Select
            value={selectedTour}
            onChange={setSelectedTour}
            options={[
              { value: 'all', label: 'Tour: Tất cả' },
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
          <Table<Complaint> dataSource={filteredComplaints} columns={columns} />
        )}
        <div className="p-4 border-t border-[#E1F1FF]">
          <Pagination
            current={currentPage}
            total={filteredComplaints.length}
            pageSize={10}
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
