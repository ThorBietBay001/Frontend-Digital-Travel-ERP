import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Plus, Pencil, Trash2, Leaf } from 'lucide-react';
import GreenActionForm from './GreenActionForm';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { GreenAction } from './mockData';
import type { HanhDongXanhResponse, HanhDongXanhRequest } from '../../services/green-actions';
import { greenActionsService } from '../../services/green-actions';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const GreenActionList: React.FC = () => {
  const [data, setData] = useState<GreenAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'create' | 'edit' | 'delete' | null;
    selectedAction: GreenAction | undefined;
  }>({ isOpen: false, mode: null, selectedAction: undefined });

  const mapToUI = (api: HanhDongXanhResponse): GreenAction => ({
    id: api.maHanhDongXanh || '',
    code: api.maHanhDongXanh || '',
    name: api.tenHanhDong || '',
    description: '',
    defaultPoints: api.diemCong || 0,
    status: api.trangThai?.toUpperCase() === 'ACTIVE' ? 'active' : 'inactive',
  });

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'green-actions')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await greenActionsService.danhSach_2();
      setData(res ? res.map(mapToUI) : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const openModal = (mode: typeof modalState.mode, action?: GreenAction) => {
    setModalState({ isOpen: true, mode, selectedAction: action });
  };
  const closeModal = () => setModalState({ isOpen: false, mode: null, selectedAction: undefined });

  const handleFormSubmit = async (actionData: GreenAction) => {
    try {
      const payload: HanhDongXanhRequest = {
        tenHanhDong: actionData.name,
        diemCong: actionData.defaultPoints,
        trangThai: actionData.status.toUpperCase(),
      };
      if (modalState.mode === 'create') {
        await greenActionsService.taoMoi_2(payload);
      } else if (modalState.mode === 'edit') {
        await greenActionsService.capNhat_2(actionData.id, payload);
      }
      closeModal();
      getAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xảy ra lỗi';
      alert('Lỗi: ' + msg);
    }
  };

  const handleDelete = async () => {
    if (modalState.selectedAction) {
      try {
        await greenActionsService.xoa_2(modalState.selectedAction.id);
        closeModal();
        getAll();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Xảy ra lỗi khi xóa';
        alert('Lỗi: ' + msg);
      }
    }
  };

  const filteredData = data.filter((action) => {
    const matchesSearch = action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          action.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || statusFilter === 'all' || action.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<GreenAction>[] = [
    {
      key: 'code',
      title: 'Mã HĐ',
      render: (record) => <span className="font-bold text-[#00668A]">{record.code}</span>,
    },
    {
      key: 'name',
      title: 'Tên Hành Động',
      render: (record) => <span className="font-semibold text-gray-800">{record.name}</span>
    },
    {
      key: 'description',
      title: 'Mô tả ngắn',
      render: (record) => <span className="text-gray-500 text-sm truncate max-w-[200px] block" title={record.description}>{record.description}</span>
    },
    {
      key: 'defaultPoints',
      title: 'Điểm Thưởng Mặc Định',
      render: (record) => (
        <span className="font-semibold text-[#16A34A] flex items-center gap-1">
          <Leaf size={14} />
          +{record.defaultPoints} điểm
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (record) => (
        <Badge
          label={record.status === 'active' ? 'Đang áp dụng' : 'Ngừng áp dụng'}
          variant={record.status === 'active' ? 'success' : 'neutral'}
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
      activeMenu="Hành động Xanh"
      expandedMenus={['Quản lý Sản phẩm Tour']}
      breadcrumb={[
        { label: 'Quản lý Sản phẩm Tour' },
        { label: 'Hành động Xanh' },
      ]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col h-full gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Quản lý Danh mục Hành động Xanh</h1>
            <p className="text-gray-500 text-sm mt-1">Thiết lập kho điểm thưởng gốc để áp dụng cho các tour.</p>
          </div>
          <Button variant="primary" icon={<Plus size={18} />} onClick={() => openModal('create')}>
            Thêm Hành động Mới
          </Button>
        </div>

        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <SearchInput placeholder="Tìm tên hành động xanh..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="w-[200px]">
            <Select
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Đang áp dụng', value: 'active' },
                { label: 'Ngừng áp dụng', value: 'inactive' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
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
            <Table<GreenAction>
              columns={columns}
              dataSource={paginatedData}
              rowKey="id"
              emptyText="Chưa có hành động xanh nào"
            />
          )}
        </div>

        <Pagination current={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
      </div>

      <Modal
        isOpen={modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')}
        onClose={closeModal}
        title={modalState.mode === 'create' ? 'Tạo mới Hành động' : 'Cập nhật Hành động'}
        size="md"
      >
        {(modalState.isOpen && (modalState.mode === 'create' || modalState.mode === 'edit')) && (
          <GreenActionForm
            mode={modalState.mode as 'create' | 'edit'}
            initialData={modalState.selectedAction}
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
            <Button variant="danger" onClick={handleDelete}>Xóa</Button>
          </>
        }
      >
        <div className="text-gray-700">
          <p>Bạn có chắc chắn muốn xóa hành động <strong>'{modalState.selectedAction?.name}'</strong>?</p>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default GreenActionList;
