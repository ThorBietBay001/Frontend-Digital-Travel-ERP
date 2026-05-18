import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import ServiceForm from './ServiceForm';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { Service } from './mockData';
import type {
  LoaiPhongResponse,
  DichVuThemResponse,
  LoaiPhongRequest,
  DichVuThemRequest,
} from '../../services/services';
import { servicesService } from '../../services/services';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const ServiceList: React.FC = () => {
  const [data, setData] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete' | null;
    selectedService: Service | undefined;
  }>({ isOpen: false, mode: null, selectedService: undefined });

  const mapRoom = (r: LoaiPhongResponse): Service => ({
    id: r.maLoaiPhong || '',
    code: r.maLoaiPhong || '',
    name: r.tenLoai || '',
    category: 'room',
    price: r.mucPhuThu || 0,
    unit: 'Phòng',
    status: r.trangThai?.toUpperCase() === 'ACTIVE' ? 'active' : 'inactive',
  });

  const mapExtra = (r: DichVuThemResponse): Service => ({
    id: r.maDichVuThem || '',
    code: r.maDichVuThem || '',
    name: r.ten || '',
    category: 'extra',
    price: r.donGia || 0,
    unit: r.donViTinh || '',
    status: r.trangThai?.toUpperCase() === 'ACTIVE' ? 'active' : 'inactive',
  });

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'services')) return;
    setLoading(true);
    setError(null);
    try {
      const [rooms, extras] = await Promise.all([
        servicesService.danhSach_1(),
        servicesService.danhSach_3(),
      ]);
      const roomList = rooms ? rooms.map(mapRoom) : [];
      const extraList = extras ? extras.map(mapExtra) : [];
      setData([...roomList, ...extraList]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const openModal = (mode: typeof modalState.mode, service?: Service) => {
    setModalState({ isOpen: true, mode, selectedService: service });
  };
  const closeModal = () => setModalState({ isOpen: false, mode: null, selectedService: undefined });

  const handleFormSubmit = async (serviceData: Service) => {
    try {
      if (modalState.mode === 'create') {
        if (serviceData.category === 'room') {
          const payload: LoaiPhongRequest = { tenLoai: serviceData.name, mucPhuThu: serviceData.price, trangThai: serviceData.status.toUpperCase() };
          await servicesService.taoMoi_1(payload);
        } else {
          const payload: DichVuThemRequest = { ten: serviceData.name, donViTinh: serviceData.unit, donGia: serviceData.price, trangThai: serviceData.status.toUpperCase() };
          await servicesService.taoMoi_3(payload);
        }
      } else if (modalState.mode === 'edit') {
        if (serviceData.category === 'room') {
          const payload: LoaiPhongRequest = { tenLoai: serviceData.name, mucPhuThu: serviceData.price, trangThai: serviceData.status.toUpperCase() };
          await servicesService.capNhat_1(serviceData.id, payload);
        } else {
          const payload: DichVuThemRequest = { ten: serviceData.name, donViTinh: serviceData.unit, donGia: serviceData.price, trangThai: serviceData.status.toUpperCase() };
          await servicesService.capNhat_3(serviceData.id, payload);
        }
      }
      closeModal();
      getAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xảy ra lỗi';
      alert('Lỗi: ' + msg);
    }
  };

  const handleDelete = async () => {
    if (modalState.selectedService) {
      try {
        if (modalState.selectedService.category === 'room') {
          await servicesService.xoa_1(modalState.selectedService.id);
        } else {
          await servicesService.xoa_3(modalState.selectedService.id);
        }
        closeModal();
        getAll();
      } catch (err: unknown) {
        // Nếu backend báo đã sử dụng → chuyển inactive
        const payload = modalState.selectedService.category === 'room'
          ? { tenLoai: modalState.selectedService.name, trangThai: 'INACTIVE' } as LoaiPhongRequest
          : { ten: modalState.selectedService.name, donGia: modalState.selectedService.price, trangThai: 'INACTIVE' } as DichVuThemRequest;

        try {
          if (modalState.selectedService.category === 'room') {
            await servicesService.capNhat_1(modalState.selectedService.id, payload as LoaiPhongRequest);
          } else {
            await servicesService.capNhat_3(modalState.selectedService.id, payload as DichVuThemRequest);
          }
          closeModal();
          getAll();
        } catch {
          const msg = err instanceof Error ? err.message : 'Xảy ra lỗi khi xóa';
          alert('Lỗi: ' + msg);
        }
      }
    }
  };

  const filteredData = data.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || categoryFilter === 'all' || service.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Service>[] = [
    {
      key: 'code',
      title: 'Mã Dịch Vụ',
      render: (record) => <span className="font-bold text-[#00668A]">{record.code}</span>,
    },
    {
      key: 'name',
      title: 'Tên Dịch Vụ',
      render: (record) => <span className="font-medium text-gray-800">{record.name}</span>
    },
    {
      key: 'category',
      title: 'Phân loại',
      render: (record) => (
        <Badge
          label={record.category === 'room' ? 'Loại phòng' : 'Dịch vụ thêm'}
          variant={record.category === 'room' ? 'info' : 'neutral'}
        />
      )
    },
    {
      key: 'unit',
      title: 'Đơn vị tính',
      dataIndex: 'unit',
    },
    {
      key: 'price',
      title: 'Đơn Giá (VND)',
      align: 'right',
      render: (record) => (
        <span className="font-bold text-gray-800">{record.price.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (record) => (
        <Badge
          label={record.status === 'active' ? 'Đang cung cấp' : 'Ngừng cung cấp'}
          variant={record.status === 'active' ? 'success' : 'error'}
        />
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
      activeMenu="Dịch vụ Bổ sung"
      expandedMenus={['Quản lý Sản phẩm Tour']}
      breadcrumb={[
        { label: 'Quản lý Sản phẩm Tour' },
        { label: 'Dịch vụ Bổ sung' },
      ]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col h-full gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Dịch vụ Bổ sung</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý danh mục các dịch vụ cộng thêm cho tour.</p>
          </div>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => openModal('create')}>
            Thêm dịch vụ
          </Button>
        </div>

        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <SearchInput placeholder="Tìm kiếm tên hoặc mã dịch vụ..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="w-[200px]">
            <Select
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Loại phòng', value: 'room' },
                { label: 'Dịch vụ thêm', value: 'extra' }
              ]}
              value={categoryFilter}
              onChange={setCategoryFilter}
              placeholder="Loại dịch vụ"
            />
          </div>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 relative min-h-[300px]">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
          ) : (
            <Table<Service>
              columns={columns}
              dataSource={paginatedData}
              rowKey="id"
              emptyText="Chưa có dịch vụ nào"
            />
          )}
        </div>

        <Pagination current={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
      </div>

      <Modal
        isOpen={modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')}
        onClose={closeModal}
        title={modalState.mode === 'create' ? 'Tạo mới Dịch vụ' : 'Cập nhật Dịch vụ'}
        size="md"
      >
        {(modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')) && (
          <ServiceForm
            mode={modalState.mode as 'create' | 'edit'}
            initialData={modalState.selectedService}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalState.isOpen && modalState.mode === 'delete'}
        onClose={closeModal}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa / Ngừng cung cấp</Button>
          </>
        }
      >
        <div className="text-gray-700">
          <p>Bạn có chắc chắn muốn xóa dịch vụ <strong>{modalState.selectedService?.name}</strong>?</p>
          <p className="mt-2 p-3 bg-orange-50 text-orange-700 rounded-lg text-sm border border-orange-100">
            Nếu dịch vụ đã được sử dụng trong đơn hàng, hệ thống sẽ chuyển sang trạng thái 'Ngừng cung cấp'.
          </p>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default ServiceList;
