import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { PlusCircle, Pencil, Trash2, Ban, Eye } from 'lucide-react';
import TourInstanceDetailModal from './TourInstanceDetailModal';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { TourInstance } from './mockData';
import type { TourThucTeResponse, CapNhatTourThucTeRequest } from '../../services/tour-instance';
import { tourInstanceService } from '../../services/tour-instance';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { hasAccess } from '../../config/rolePermissions';
import { mapTourInstanceStatus } from '../../utils/statusMapping';

const TourInstanceList: React.FC = () => {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [data, setData] = useState<TourInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete' | 'close' | null;
    selectedTour: TourInstance | undefined;
  }>({ isOpen: false, mode: null, selectedTour: undefined });
  const [closeReason, setCloseReason] = useState('');

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
    status: mapStatus(api),
    templateId: api.maTourMau || '',
    schedule: [],
    services: (api.dichVu || []).map((service: any) => ({
      id: service.maDichVuThem || '',
      code: service.maDichVuThem || '',
      name: service.ten || '',
      category: 'Dịch vụ thêm',
      price: service.donGia || 0,
      unit: service.donViTinh || '',
      status: 'active',
    })),
    greenActions: (api.hanhDongXanh || []).map((action: any) => ({
      id: action.maHanhDongXanh || '',
      code: action.maHanhDongXanh || '',
      name: action.tenHanhDong || '',
      description: '',
      defaultPoints: action.diemCong || 0,
      status: 'active',
    })),
  });

  const mapStatus = (tour: TourThucTeResponse): string => {
    if (tour.soKhachToiDa != null && tour.choConLai === 0 && tour.trangThai === 'MO_BAN') {
      return 'MO_BAN'; // The UI will interpret this using mapTourInstanceStatus, but wait - if it's full maybe we should handle it? For now just use the backend status.
    }
    return tour.trangThai || 'CHO_KICH_HOAT';
  };

  const mapStatusToApi = (status: string) => {
    return status;
  };

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
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu tour thực tế';
      setError(msg);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);



  const openModal = (mode: typeof modalState.mode, tour?: TourInstance) => {
    if (mode === 'create' && user?.maVaiTro === 'DIEUHANH') {
      notify('Bạn không có quyền khởi tạo tour thực tế. Vui lòng liên hệ Quản trị viên hoặc bộ phận Sản phẩm.', { type: 'error' });
      return;
    }
    setModalState({ isOpen: true, mode, selectedTour: tour });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: null, selectedTour: undefined });
    setCloseReason('');
  };

  const handleFormSubmit = async (tourData: TourInstance) => {
    const wasCreate = modalState.mode === 'create';
    try {
      if (wasCreate) {
        // Wizard handles API creation directly.
        return;
      } else if (modalState.mode === 'edit') {
        const payload: CapNhatTourThucTeRequest = {
          giaHienHanh: tourData.currentPrice,
          soKhachToiDa: tourData.maxSeats,
          soKhachToiThieu: tourData.minSeats,
          trangThai: mapStatusToApi(tourData.status),
          maDichVuThem: (tourData.services || []).map((service: any) => service.id).filter(Boolean),
          maHanhDongXanh: (tourData.greenActions || []).map((action: any) => action.id).filter(Boolean),
        };
        await tourInstanceService.capNhat(tourData.id, payload);
      }
      closeModal();
      await getAll();
      alert(wasCreate ? 'Thành công' : 'Cập nhật tour thành công');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xảy ra lỗi';
      alert('Lỗi: ' + msg);
    }
  };

  const handleDelete = async () => {
    if (modalState.selectedTour) {
      try {
        const payload: CapNhatTourThucTeRequest = {
          giaHienHanh: modalState.selectedTour.currentPrice,
          soKhachToiDa: modalState.selectedTour.maxSeats,
          trangThai: 'HUY'
        };
        await tourInstanceService.capNhat(modalState.selectedTour.id, payload);
        closeModal();
        await getAll();
        alert('Hủy tour thành công');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xảy ra lỗi khi hủy tour';
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
      width: '12%',
      render: (record) => (
        <span className="font-bold text-[#00668A]">{record.code}</span>
      ),
    },
    {
      key: 'name',
      title: 'Tên Tour',
      width: '28%',
      render: (record) => <span className="font-medium text-gray-800 line-clamp-2" title={record.name}>{record.name}</span>
    },
    {
      key: 'startDate',
      title: 'Ngày khởi hành',
      width: '12%',
      render: (record) => {
        const [year, month, day] = record.startDate.split('-');
        return <span>{`${day}/${month}/${year}`}</span>;
      }
    },
    {
      key: 'seats',
      title: 'Số chỗ',
      align: 'center',
      width: '10%',
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
      title: <span className="whitespace-nowrap">Giá bán (VNĐ)</span>,
      align: 'right',
      width: '14%',
      render: (record) => (
        <span className="font-bold text-gray-800 whitespace-nowrap">{record.currentPrice.toLocaleString('vi-VN')}Đ</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '12%',
      render: (record) => {
        const { label, variant } = mapTourInstanceStatus(record.status);
        return <Badge label={label} variant={variant} />;
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'center',
      width: '12%',
      render: (record) => {
        const isInternalRole = user?.maVaiTro === 'ADMIN' || user?.maVaiTro === 'SANPHAM';
        const canEditOrDelete = isInternalRole && record.status === 'CHO_KICH_HOAT';
        const canBan = isInternalRole && record.status === 'MO_BAN';

        return (
          <div className="flex items-center justify-center gap-1">
            {/* Xem is always allowed, or at least always shown */}
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye size={18} />}
              onClick={() => openModal('edit', record)}
              className="p-2 text-[#00668A]"
              aria-label="Xem chi tiết"
            />

            <Button
              variant="ghost"
              size="sm"
              icon={<Pencil size={18} />}
              onClick={() => {
                if (!isInternalRole) {
                  notify('Bạn không có quyền chỉnh sửa cấu hình tour. Vui lòng liên hệ bộ phận Sản phẩm.', { type: 'error' });
                  return;
                }
                canEditOrDelete && openModal('edit', record);
              }}
              className={`p-2 ${canEditOrDelete ? 'text-[#faad14] hover:text-[#d48806] hover:bg-orange-50' : 'opacity-40 cursor-not-allowed'}`}
              aria-label="Sửa"
              disabled={user?.maVaiTro === 'DIEUHANH'}
            />

            <Button
              variant="ghost"
              size="sm"
              icon={<Ban size={18} />}
              onClick={() => {
                if (!isInternalRole) {
                  notify('Bạn không có quyền khóa tour. Vui lòng liên hệ Admin.', { type: 'error' });
                  return;
                }
                canBan && openModal('delete', record);
              }}
              className={`p-2 ${canBan ? 'text-red-500 hover:text-red-700 hover:bg-red-50' : 'opacity-40 cursor-not-allowed'}`}
              aria-label="Khóa tour"
              disabled={user?.maVaiTro === 'DIEUHANH'}
            />

            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 size={18} />}
              onClick={() => {
                if (!isInternalRole) {
                  notify('Bạn không có quyền xóa tour. Vui lòng liên hệ Admin.', { type: 'error' });
                  return;
                }
                canEditOrDelete && openModal('delete', record);
              }}
              className={`p-2 ${canEditOrDelete ? 'text-gray-500 hover:text-[#BA1A1A] hover:bg-red-50' : 'opacity-40 cursor-not-allowed'}`}
              aria-label="Xóa"
              disabled={user?.maVaiTro === 'DIEUHANH'}
            />
          </div>
        );
      },
    },
  ];

  return (
    <MainLayout
      activeMenu="Quản lý Tour thực tế"
      expandedMenus={['Quản lý Sản phẩm']}
      breadcrumb={[
        { label: 'Quản lý Sản phẩm' },
        { label: 'Quản lý Tour thực tế' },
      ]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col h-full gap-6">
        {/* Header & Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]"> Quản lý Tour thực tế</h1>
            {/* <p className="text-gray-500 text-sm mt-1">Quản lý và theo dõi các chuyến đi cụ thể đang hoạt động</p> */}
          </div>
          <Button
            variant="primary"
            icon={<PlusCircle size={18} />}
            onClick={() => openModal('create')}
            className={user?.maVaiTro === 'DIEUHANH' ? 'opacity-50 cursor-not-allowed grayscale' : ''}
            title={user?.maVaiTro === 'DIEUHANH' ? 'Bạn không có quyền khởi tạo' : ''}
          >
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
                { label: 'Chờ kích hoạt', value: 'CHO_KICH_HOAT' },
                { label: 'Mở bán', value: 'MO_BAN' },
                { label: 'Đang diễn ra', value: 'DANG_DIEN_RA' },
                { label: 'Kết thúc', value: 'KET_THUC' },
                { label: 'Đã quyết toán', value: 'DA_QUYET_TOAN' },
                { label: 'Đã hủy', value: 'HUY' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            />
          </div>
          {/* <div className="w-[200px]">
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
          </div> */}
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
      {(modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')) && (
        <TourInstanceDetailModal
          isOpen={modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')}
          mode={modalState.mode as 'create' | 'edit'}
          initialData={modalState.selectedTour}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            getAll();
            alert('Khởi tạo tour thành công!');
          }}
        />
      )}

      {/* Modal Xóa */}
      <Modal
        isOpen={modalState.isOpen && modalState.mode === 'delete'}
        onClose={closeModal}
        title="Xác nhận hủy tour"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xác nhận hủy</Button>
          </>
        }
      >
        <div className="text-gray-700">
          <p>Bạn có chắc muốn hủy tour này?</p>
          {modalState.selectedTour?.status === 'MO_BAN' && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              <p className="font-bold mb-2">Cảnh báo: Tour đã có {modalState.selectedTour?.bookedSeats || 0} khách đặt.</p>
              <label className="block text-xs font-semibold mb-1">Vui lòng nhập lý do hủy:</label>
              <textarea
                className="w-full px-3 py-2 border border-red-200 rounded focus:outline-none focus:ring-1 focus:ring-red-400"
                rows={2}
                value={closeReason}
                onChange={(e) => setCloseReason(e.target.value)}
                placeholder="Nhập lý do hủy tour..."
              ></textarea>
            </div>
          )}
        </div>
      </Modal>
    </MainLayout>
  );
};

export default TourInstanceList;
