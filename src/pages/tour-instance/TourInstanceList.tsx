import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import TourInstanceForm from './TourInstanceForm';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { TourInstance } from './mockData';
import type { TourThucTeResponse, TaoTourThucTeRequest, CapNhatTourThucTeRequest } from '../../services/tour-instance';
import { tourInstanceService } from '../../services/tour-instance';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const TourInstanceList: React.FC = () => {
  const [data, setData] = useState<TourInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete' | null;
    selectedTour: TourInstance | undefined;
  }>({ isOpen: false, mode: null, selectedTour: undefined });

  const mapToUI = (api: TourThucTeResponse): TourInstance => ({
    id: api.maTourThucTe || '',
    code: api.maTourThucTe || '',
    name: api.tieuDeTour || '',
    startDate: api.ngayKhoiHanh || '',
    endDate: api.ngayKetThuc || '',
    departureDate: api.ngayKhoiHanh || '',
    vehicle: '',
    maxSeats: api.soKhachToiDa || 0,
    bookedSeats: api.soKhachToiDa != null && api.choConLai != null
      ? api.soKhachToiDa - api.choConLai
      : 0,
    currentPrice: api.giaHienHanh || 0,
    basePrice: api.giaHienHanh || 0,
    status: mapStatus(api.trangThai),
    templateId: api.maTourMau || '',
    schedule: [],
  });

  const mapStatus = (s?: string): TourInstance['status'] => {
    switch (s?.toUpperCase()) {
      case 'ACTIVE': return 'active';
      case 'FULL': return 'full';
      case 'CANCELLED': return 'cancelled';
      case 'COMPLETED': return 'completed';
      default: return 'pending_activation';
    }
  };

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'tour-instance')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await tourInstanceService.danhSach_5();
      if (res && res.content) {
        setData(res.content.map(mapToUI));
      } else {
        setData([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const getStatusBadgeVariant = (status: TourInstance['status']) => {
    switch (status) {
      case 'active': return 'success';
      case 'full': return 'warning';
      case 'cancelled': return 'error';
      case 'pending_activation': return 'info';
      case 'completed': return 'neutral';
      default: return 'neutral';
    }
  };

  const getStatusLabel = (status: TourInstance['status']) => {
    switch (status) {
      case 'active': return 'Mở bán';
      case 'full': return 'Đã đầy';
      case 'cancelled': return 'Đã hủy';
      case 'pending_activation': return 'Chờ kích hoạt';
      case 'completed': return 'Hoàn thành';
      default: return status;
    }
  };

  const openModal = (mode: typeof modalState.mode, tour?: TourInstance) => {
    setModalState({ isOpen: true, mode, selectedTour: tour });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: null, selectedTour: undefined });
  };

  const handleFormSubmit = async (tourData: TourInstance) => {
    try {
      if (modalState.mode === 'create') {
        const payload: TaoTourThucTeRequest = {
          maTourMau: tourData.templateId,
          ngayKhoiHanh: tourData.startDate,
          soKhachToiDa: tourData.maxSeats,
          giaHienHanh: tourData.currentPrice,
        };
        await tourInstanceService.taoMoi_4(payload);
      } else if (modalState.mode === 'edit') {
        const payload: CapNhatTourThucTeRequest = {
          giaHienHanh: tourData.currentPrice,
          soKhachToiDa: tourData.maxSeats,
          trangThai: tourData.status.toUpperCase(),
        };
        await tourInstanceService.capNhat_4(tourData.id, payload);
      }
      closeModal();
      getAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xảy ra lỗi';
      alert('Lỗi: ' + msg);
    }
  };

  const handleDelete = async () => {
    if (modalState.selectedTour) {
      try {
        await tourInstanceService.xoa_4(modalState.selectedTour.id);
        closeModal();
        getAll();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xảy ra lỗi khi xóa';
        alert('Lỗi: ' + msg);
      }
    }
  };

  const filteredData = data.filter((tour) => {
    const matchesSearch = tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tour.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || statusFilter === 'all' || tour.status === statusFilter;
    const tourMonth = tour.startDate ? tour.startDate.split('-')[1] : '';
    const matchesMonth = monthFilter === '' || monthFilter === 'all' || tourMonth === monthFilter;
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<TourInstance>[] = [
    {
      key: 'code',
      title: 'Mã Tour',
      render: (record) => (
        <span className="font-bold text-[#00668A]">{record.code}</span>
      ),
    },
    {
      key: 'name',
      title: 'Tên Tour',
      render: (record) => <span className="font-medium text-gray-800">{record.name}</span>
    },
    {
      key: 'startDate',
      title: 'Ngày khởi hành',
      render: (record) => {
        const [year, month, day] = record.startDate.split('-');
        return <span>{`${day}/${month}/${year}`}</span>;
      }
    },
    {
      key: 'seats',
      title: 'Số chỗ',
      align: 'center',
      render: (record) => {
        const isFull = record.bookedSeats >= record.maxSeats;
        return (
          <span className={isFull ? 'text-[#BA1A1A] font-bold' : 'text-gray-700'}>
            {record.bookedSeats}/{record.maxSeats}
          </span>
        );
      }
    },
    {
      key: 'currentPrice',
      title: 'Giá bán (VNĐ)',
      align: 'right',
      render: (record) => (
        <span className="font-bold text-gray-800">{record.currentPrice.toLocaleString('vi-VN')} đ</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (record) => (
        <Badge label={getStatusLabel(record.status)} variant={getStatusBadgeVariant(record.status)} />
      ),
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil size={18} />} onClick={() => openModal('edit', record)} className="p-2" aria-label="Sửa" />
          <Button variant="ghost" size="sm" icon={<Trash2 size={18} />} onClick={() => openModal('delete', record)} className="p-2 text-gray-500 hover:text-[#BA1A1A] hover:bg-red-50" aria-label="Xóa" />
        </div>
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Tour Thực Tế"
      expandedMenus={['Quản lý Sản phẩm Tour']}
      breadcrumb={[
        { label: 'Quản lý Sản phẩm Tour' },
        { label: 'Tour Thực Tế' },
      ]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col h-full gap-6">
        {/* Header & Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Tour Thực Tế</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi các chuyến đi cụ thể đang hoạt động</p>
          </div>
          <Button variant="primary" icon={<PlusCircle size={18} />} onClick={() => openModal('create')}>
            Khởi tạo Tour
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <SearchInput placeholder="Tìm kiếm theo mã hoặc tên tour..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="w-[200px]">
            <Select
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Mở bán', value: 'active' },
                { label: 'Đã đầy', value: 'full' },
                { label: 'Đã hủy', value: 'cancelled' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            />
          </div>
          <div className="w-[200px]">
            <Select
              options={[
                { label: 'Tất cả tháng', value: 'all' },
                { label: 'Tháng 4', value: '04' },
                { label: 'Tháng 5', value: '05' },
                { label: 'Tháng 6', value: '06' },
              ]}
              value={monthFilter}
              onChange={setMonthFilter}
              placeholder="Tháng khởi hành"
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
          ) : (
            <Table<TourInstance>
              columns={columns}
              dataSource={paginatedData}
              rowKey="id"
              emptyText="Không tìm thấy Tour thực tế nào"
            />
          )}
        </div>

        <Pagination current={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
      </div>

      {/* Modal Khởi tạo/Chỉnh sửa */}
      <Modal
        isOpen={modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')}
        onClose={closeModal}
        title={modalState.mode === 'create' ? 'Khởi tạo Tour Thực Tế từ Tour Mẫu' : 'Cập nhật Tour Thực Tế'}
        size="lg"
      >
        {(modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')) && (
          <TourInstanceForm
            mode={modalState.mode as 'create' | 'edit'}
            initialData={modalState.selectedTour}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Modal Xóa */}
      <Modal
        isOpen={modalState.isOpen && modalState.mode === 'delete'}
        onClose={closeModal}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xác nhận xóa</Button>
          </>
        }
      >
        <div className="text-gray-700">
          <p>Bạn có chắc chắn muốn xóa tour thực tế <strong>{modalState.selectedTour?.name}</strong> mã <strong>{modalState.selectedTour?.code}</strong>?</p>
          {(modalState.selectedTour?.bookedSeats || 0) > 0 && (
            <p className="mt-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              Cảnh báo: Tour đã có <span className="font-bold">{modalState.selectedTour?.bookedSeats} khách đặt</span>.
              Hủy tour sẽ lập tức kích hoạt quy trình hoàn tiền tự động.
            </p>
          )}
        </div>
      </Modal>
    </MainLayout>
  );
};

export default TourInstanceList;
