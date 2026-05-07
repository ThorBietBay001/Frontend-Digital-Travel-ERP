import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { PlusCircle, Pencil, Copy, Trash2 } from 'lucide-react';
import type { TourTemplate } from './mockData';
import type { TourMauResponse, TaoTourMauRequest, CapNhatTourMauRequest } from '../../services/tour-template';
import TourTemplateForm from './TourTemplateForm';
import { tourTemplateService } from '../../services/tour-template';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const TourTemplateList: React.FC = () => {
  const [data, setData] = useState<TourTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'copy' | 'delete' | null;
    selectedTour: TourTemplate | undefined;
  }>({ isOpen: false, mode: null, selectedTour: undefined });

  const mapToUI = (apiData: TourMauResponse): TourTemplate => ({
    id: apiData.maTourMau || '',
    code: apiData.maTourMau || '',
    title: apiData.tieuDe || '',
    description: apiData.moTa || '',
    duration: {
      days: apiData.thoiLuong || 0,
      nights: Math.max(0, (apiData.thoiLuong || 1) - 1),
    },
    basePrice: apiData.giaSan || 0,
    status: (apiData.trangThai?.toLowerCase() === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80',
    tags: 'Tour Mẫu',
    schedule: [],
  });

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'tour-template')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await tourTemplateService.danhSach();
      if (res && res.content) {
        setData(res.content.map(mapToUI));
      } else {
        setData([]);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getAll();
  }, [user]);

  // Xử lý đóng/mở Modal
  const openModal = (mode: typeof modalState.mode, tour?: TourTemplate) => {
    setModalState({ isOpen: true, mode, selectedTour: tour });
  };
  const closeModal = () => {
    setModalState({ isOpen: false, mode: null, selectedTour: undefined });
  };

  // Submit hành động form
  const handleFormSubmit = async (tourData: TourTemplate) => {
    try {
      if (modalState.mode === 'create') {
        const payload: TaoTourMauRequest = {
           tieuDe: tourData.title,
           moTa: tourData.description,
           thoiLuong: tourData.duration.days,
           giaSan: tourData.basePrice
        };
        await tourTemplateService.taoMoi(payload);
      } else if (modalState.mode === 'edit') {
        const payload: CapNhatTourMauRequest = {
           tieuDe: tourData.title,
           moTa: tourData.description,
           thoiLuong: tourData.duration.days,
           giaSan: tourData.basePrice,
           trangThai: tourData.status.toUpperCase()
        };
        await tourTemplateService.capNhat(tourData.id, payload);
      } else if (modalState.mode === 'copy') {
        // form may have modified some data for copy, but the API only takes the ID for copy.
        await tourTemplateService.saoChep(tourData.id);
      }
      closeModal();
      getAll();
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Xảy ra lỗi'));
    }
  };

  // Xóa tour
  const handleDelete = async () => {
    if (modalState.selectedTour) {
      try {
        await tourTemplateService.xoa(modalState.selectedTour.id);
        closeModal();
        getAll();
      } catch (err: any) {
         alert('Lỗi: ' + (err.message || 'Xảy ra lỗi khi xóa'));
      }
    }
  };

  // Lọc dữ liệu
  const filteredData = data.filter((tour) => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tour.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || statusFilter === 'all' || tour.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Tính toán phân trang
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Định nghĩa Cột
  const columns: Column<TourTemplate>[] = [
    {
      key: 'code',
      title: 'Mã Tour',
      render: (record) => (
        <span className="font-bold text-[#00668A]">{record.code}</span>
      ),
    },
    {
      key: 'title',
      title: 'Tiêu Đề Tour Mẫu',
      render: (record) => (
        <div className="flex items-center gap-3">
          <img src={record.image} alt={record.title} className="w-12 h-12 rounded-lg object-cover border border-[#E1F1FF]" />
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{record.title}</span>
            <span className="text-xs text-gray-500">{record.tags}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'duration',
      title: 'Thời Lượng',
      render: (record) => (
        <span>{record.duration.days}N{record.duration.nights}Đ</span>
      ),
    },
    {
      key: 'basePrice',
      title: 'Giá Sàn (VNĐ)',
      align: 'right',
      render: (record) => (
        <span className="font-medium">{record.basePrice.toLocaleString('vi-VN')} đ</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng Thái',
      render: (record) => (
        <Badge 
          label={record.status === 'active' ? 'Đang mở' : 'Đã đóng'} 
          variant={record.status === 'active' ? 'success' : 'neutral'} 
        />
      ),
    },
    {
      key: 'actions',
      title: 'Hành Động',
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil size={18} />} onClick={() => openModal('edit', record)} className="p-2" aria-label="Sửa" />
          <Button variant="ghost" size="sm" icon={<Copy size={18} />} onClick={() => openModal('copy', record)} className="p-2" aria-label="Sao chép" />
          <Button variant="ghost" size="sm" icon={<Trash2 size={18} />} onClick={() => openModal('delete', record)} className="p-2 text-gray-500 hover:text-[#BA1A1A] hover:bg-red-50" aria-label="Xóa" />
        </div>
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Tour Mẫu"
      expandedMenus={['Quản lý Sản phẩm Tour']}
      breadcrumb={[
        { label: 'Quản lý Sản phẩm Tour' },
        { label: 'Tour Mẫu' },
      ]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col h-full gap-6">
        {/* Header & Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Tour Mẫu</h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý và cấu trúc các khung chương trình du lịch sinh thái tiêu chuẩn</p>
          </div>
          <Button variant="primary" icon={<PlusCircle size={18} />} onClick={() => openModal('create')}>
            Thêm Tour Mẫu mới
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <SearchInput 
              placeholder="Tìm kiếm theo mã hoặc tên tour mẫu..." 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="w-[200px]">
            <Select 
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Đang mở', value: 'active' },
                { label: 'Đã đóng', value: 'inactive' },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Chọn trạng thái"
            />
          </div>
          <div className="w-[200px]">
            <Select 
              options={[
                { label: 'Mới nhất', value: 'newest' },
                { label: 'Giá: Thấp đến cao', value: 'price_asc' },
                { label: 'Thời lượng', value: 'duration' },
              ]}
              placeholder="Sắp xếp"
            />
          </div>
        </div>

        {/* Table & Pagination */}
        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 relative min-h-[300px]">
          {loading ? (
             <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
             </div>
          ) : error ? (
             <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
          ) : (
            <Table<TourTemplate>
              columns={columns}
              dataSource={paginatedData}
              rowKey="id"
              emptyText="Chưa có Tour Mẫu nào"
            />
          )}
        </div>
        
        <Pagination 
          current={page}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={setPage}
        />
      </div>

      {/* Modal Thêm/Sửa/Sao chép */}
      <Modal
        isOpen={modalState.isOpen && modalState.mode !== 'delete'}
        onClose={closeModal}
        title={
          modalState.mode === 'create' ? 'Thêm mới Tour Mẫu' :
          modalState.mode === 'edit' ? 'Chỉnh sửa Tour Mẫu' :
          'Sao chép Tour Mẫu'
        }
        size="lg"
      >
        {(modalState.isOpen && modalState.mode !== 'delete') && (
          <TourTemplateForm
            mode={modalState.mode as 'create' | 'edit' | 'copy'}
            initialData={modalState.selectedTour}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* Modal Xác nhận Xóa */}
      <Modal
        isOpen={modalState.isOpen && modalState.mode === 'delete'}
        onClose={closeModal}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>Hủy</Button>
            <Button variant="danger" onClick={handleDelete}>Xóa ngay</Button>
          </>
        }
      >
        <p className="text-gray-700">
          Bạn có chắc chắn muốn xóa tour mẫu <strong>{modalState.selectedTour?.title}</strong>? Hành động này không thể hoàn tác.
        </p>
      </Modal>
    </MainLayout>
  );
};

export default TourTemplateList;
