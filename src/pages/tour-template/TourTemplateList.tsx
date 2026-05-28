import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { PlusCircle, Pencil, Copy, Trash2 } from 'lucide-react';
import type { TourTemplate } from './mockData';
import type { TourMauResponse, TaoTourMauRequest, CapNhatTourMauRequest, LichTrinhRequest } from '../../services/tour-template';
import TourTemplateDetailModal from './TourTemplateDetailModal';
import { tourTemplateService } from '../../services/tour-template';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const TourTemplateList: React.FC = () => {
  const [data, setData] = useState<TourTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const apiPageSize = 100;

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
    status: apiData.trangThai || 'HOAT_DONG',
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
      const firstPage = await tourTemplateService.danhSach({ page: 0, size: apiPageSize });
      const allTours = [...(firstPage?.content || [])];
      const totalPages = firstPage?.totalPages || 0;

      for (let pageIndex = 1; pageIndex < totalPages; pageIndex++) {
        const res = await tourTemplateService.danhSach({ page: pageIndex, size: apiPageSize });
        allTours.push(...(res?.content || []));
      }

      // Need to load without schedule first, schedule will be loaded on demand
      setData(allTours.map(mapToUI));
      setPage(1);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getAll();
  }, [user]);

  const parseThucDon = (thucDonStr?: string) => {
    if (!thucDonStr) return { breakfast: '', lunch: '', dinner: '' };
    try {
      const parsed = JSON.parse(thucDonStr);
      return {
        breakfast: parsed.breakfast || '',
        lunch: parsed.lunch || '',
        dinner: parsed.dinner || '',
      };
    } catch {
      return { breakfast: '', lunch: '', dinner: '' };
    }
  };

  // Xử lý đóng/mở Modal
  const openModal = async (mode: typeof modalState.mode, tour?: TourTemplate) => {
    if ((mode === 'edit' || mode === 'copy') && tour?.id) {
      setLoading(true);
      try {
        const detail = await tourTemplateService.chiTiet(tour.id);
        if (!detail) {
          throw new Error('Không tìm thấy chi tiết tour');
        }
        const daysCount = detail.thoiLuong || tour.duration.days || 1;
        const fullTour: TourTemplate = {
          ...tour,
          description: detail?.moTa || tour.description,
          duration: {
            days: daysCount,
            nights: Math.max(0, daysCount - 1)
          },
          schedule: Array.from({ length: daysCount }).map((_, index) => {
            const lt = (detail?.lichTrinh || []).find((l: any) => l.ngayThu === index + 1);
            if (lt) {
              return {
                id: lt.maLichTrinhTour,
                title: lt.hoatDong || `Ngày ${lt.ngayThu}`,
                description: lt.moTa || '',
                meals: parseThucDon(lt.thucDon),
              };
            }
            return { title: '', description: '', meals: { breakfast: '', lunch: '', dinner: '' } };
          }),
          services: [],
        };
        setModalState({ isOpen: true, mode, selectedTour: fullTour });
      } catch (err: any) {
        alert('Lỗi tải chi tiết tour: ' + (err.message || ''));
      } finally {
        setLoading(false);
      }
    } else {
      setModalState({ isOpen: true, mode, selectedTour: tour });
    }
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
          giaSan: tourData.basePrice,
          lichTrinh: tourData.schedule.map((day, index) => ({
            ngayThu: index + 1,
            hoatDong: day.title,
            moTa: day.description,
            thucDon: JSON.stringify(day.meals)
          }))
        };
        await tourTemplateService.taoMoi(payload);
      } else if (modalState.mode === 'edit') {
        const payload: CapNhatTourMauRequest = {
          tieuDe: tourData.title,
          moTa: tourData.description,
          thoiLuong: tourData.duration.days,
          giaSan: tourData.basePrice
        };
        await tourTemplateService.capNhat(tourData.id, payload);

        // Đồng bộ lịch trình thông qua các API riêng biệt
        const originalSchedule = modalState.selectedTour?.schedule || [];

        // 1. Xóa các lịch trình bị thừa (giảm số ngày)
        for (const oldDay of originalSchedule) {
          if (oldDay.id && !tourData.schedule.find(d => d.id === oldDay.id)) {
            await tourTemplateService.xoaLichTrinh(tourData.id, oldDay.id);
          }
        }

        // 2. Thêm hoặc Sửa lịch trình
        for (let i = 0; i < tourData.schedule.length; i++) {
          const day = tourData.schedule[i];
          const ltRequest: LichTrinhRequest = {
            ngayThu: i + 1,
            hoatDong: day.title,
            moTa: day.description,
            thucDon: JSON.stringify(day.meals)
          };

          if (day.id) {
            await tourTemplateService.suaLichTrinh(tourData.id, day.id, ltRequest);
          } else {
            await tourTemplateService.themLichTrinh(tourData.id, ltRequest);
          }
        }
      } else if (modalState.mode === 'copy') {
        // form may have modified some data for copy, but the API only takes the ID for copy.
        if (modalState.selectedTour?.id) {
          await tourTemplateService.saoChep(modalState.selectedTour.id);
        }
      }
      alert(modalState.mode === 'create' ? 'Tạo mới thành công' : 'Lưu thành công');
      closeModal();
      await getAll();
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
        await getAll();
      } catch (err: any) {
        alert('Lỗi: ' + (err.message || 'Xảy ra lỗi khi xóa'));
      }
    }
  };

  // Lọc dữ liệu
  const filteredData = data.filter((tour) => {
    const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tour.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
      key: 'actions',
      title: 'Hành Động',
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" size="sm" icon={<Pencil size={18} />} onClick={() => openModal('edit', record)} className="p-2 text-[#faad14] hover:text-[#d48806] hover:bg-orange-50" aria-label="Sửa" />
          <Button variant="ghost" size="sm" icon={<Copy size={18} />} onClick={() => openModal('copy', record)} className="p-2" aria-label="Sao chép" />
          <Button variant="ghost" size="sm" icon={<Trash2 size={18} />} onClick={() => openModal('delete', record)} className="p-2 text-gray-500 hover:text-[#BA1A1A] hover:bg-red-50" aria-label="Xóa" />
        </div>
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Quản lý Tour mẫu"
      expandedMenus={['Quản lý Sản phẩm']}
      breadcrumb={[
        { label: 'Quản lý Sản phẩm' },
        { label: 'Quản lý Tour mẫu' },
      ]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col h-full gap-6">
        {/* Header & Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Quản lý Tour mẫu</h1>
            {/* <p className="text-gray-500 text-sm mt-1">Quản lý và cấu trúc các khung chương trình du lịch sinh thái tiêu chuẩn</p> */}
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
              onChange={(value) => {
                setSearchTerm(value);
                setPage(1);
              }}
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

      {modalState.isOpen && (
        <TourTemplateDetailModal
          isOpen={modalState.isOpen}
          mode={modalState.mode as 'create' | 'edit' | 'copy'}
          initialData={modalState.selectedTour}
          onSubmit={handleFormSubmit}
          onClose={closeModal}
        />
      )}

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
