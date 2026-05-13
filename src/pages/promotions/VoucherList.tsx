import React, { useState } from 'react';
import { PlusCircle, Send, Ban, Pencil } from 'lucide-react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import CreateVoucherModal from './CreateVoucherModal';
import DistributeVoucherModal from './DistributeVoucherModal';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { Voucher } from './mockData';
import type { VoucherResponse, VoucherRequest } from '../../services/promotions';
import { promotionsService } from '../../services/promotions';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'disabled', label: 'Vô hiệu hóa' },
];

const mapToUI = (api: VoucherResponse): Voucher => ({
  id: api.maVoucher || '',
  code: api.maCode || '',
  name: api.dieuKienApDung || api.maCode || '',
  discountType: api.loaiUuDai?.toUpperCase() === 'PERCENT' ? 'percent' : 'amount',
  discountValue: api.giaTriGiam || 0,
  quantity: api.soLuotPhatHanh || 0,
  distributed: api.soLuotDaDung || 0,
  expiryDate: api.ngayHetHan || '',
  status: api.trangThai?.toUpperCase() === 'ACTIVE' ? 'ready' : 'disabled',
});

const VoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [distributeVoucher, setDistributeVoucher] = useState<Voucher | null>(null);
  const itemsPerPage = 5;

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'promotions')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await promotionsService.danhSach_4();
      setVouchers(res && res.content ? res.content.map(mapToUI) : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const mapToRequest = (voucher: Voucher): VoucherRequest => ({
    maCode: voucher.code,
    loaiUuDai: voucher.discountType === 'percent' ? 'PERCENT' : 'AMOUNT',
    giaTriGiam: voucher.discountValue,
    soLuotPhatHanh: voucher.quantity,
    ngayHieuLuc: new Date().toISOString().split('T')[0],
    ngayHetHan: voucher.expiryDate,
    dieuKienApDung: voucher.name,
  });

  const handleSaveVoucher = async (voucher: Voucher) => {
    try {
      if (editingVoucher) {
        await promotionsService.capNhatVoucher(voucher.id, mapToRequest(voucher));
      } else {
        await promotionsService.taoVoucher(mapToRequest(voucher));
      }
      setIsCreateModalOpen(false);
      setEditingVoucher(null);
      getAll();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu voucher';
      alert('Lỗi: ' + msg);
    }
  };

  const handleBanVoucher = async (voucher: Voucher) => {
    if (confirm(`Bạn có chắc chắn muốn vô hiệu hóa voucher ${voucher.code}?`)) {
      try {
        await promotionsService.voHieuVoucher(voucher.id);
        getAll();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi vô hiệu hóa';
        alert('Lỗi: ' + msg);
      }
    }
  };

  const filteredVouchers = vouchers.filter(v => {
    const matchesSearch = v.code.toLowerCase().includes(searchTerm.toLowerCase()) || v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const currentVouchers = filteredVouchers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const columns: Column<Voucher>[] = [
    {
      key: 'code',
      title: 'Mã Voucher',
      render: (record) => <span className="font-bold">{record.code}</span>
    },
    { key: 'name', title: 'Tên Chương Trình', dataIndex: 'name' },
    {
      key: 'discount',
      title: 'Loại Giảm Giá',
      render: (record) => (
        <span>
          {record.discountType === 'percent'
            ? `Giảm ${record.discountValue}%`
            : `Giảm ${(record.discountValue / 1000).toFixed(0)}k`}
        </span>
      )
    },
    {
      key: 'quantity',
      title: 'Số Lượng',
      render: (record) => {
        const percent = record.quantity > 0 ? (record.distributed / record.quantity) * 100 : 0;
        return (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span>{record.distributed}/{record.quantity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-[#00668A] h-1.5 rounded-full" style={{ width: `${Math.min(percent, 100)}%` }}></div>
            </div>
          </div>
        );
      }
    },
    { key: 'expiryDate', title: 'Hạn Sử Dụng', dataIndex: 'expiryDate' },
    {
      key: 'status',
      title: 'Trạng Thái',
      render: (record) => (
        <Badge variant={record.status === 'ready' ? 'success' : 'error'} label={record.status === 'ready' ? 'Sẵn sàng' : 'Vô hiệu hóa'} />
      )
    },
    {
      key: 'actions',
      title: 'Hành Động',
      align: 'center',
      render: (record) => (
        record.status === 'ready' ? (
          <div className="flex justify-center gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); setDistributeVoucher(record); }}
              className="p-2 text-gray-500 hover:text-[#00668A] hover:bg-[#E1F1FF] rounded-full transition-colors"
              title="Phân phối"
            >
              <Send size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setEditingVoucher(record); setIsCreateModalOpen(true); }}
              className="p-2 text-gray-500 hover:text-[#00668A] hover:bg-[#E1F1FF] rounded-full transition-colors"
              title="Chỉnh sửa"
            >
              <Pencil size={18} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleBanVoucher(record); }}
              className="p-2 text-gray-500 hover:text-[#BA1A1A] hover:bg-red-50 rounded-full transition-colors"
              title="Vô hiệu hóa"
            >
              <Ban size={18} />
            </button>
          </div>
        ) : null
      )
    }
  ];

  return (
    <MainLayout activeMenu="Quản lý Khuyến mãi" breadcrumb={[{ label: 'Quản lý Khuyến mãi' }]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#00668A]">Quản lý Khuyến mãi</h1>
          <p className="text-gray-500 mt-1">Theo dõi và quản lý các chương trình ưu đãi, voucher cho khách hàng.</p>
        </div>

        <div className="bg-white rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(137,212,255,0.08)]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <div className="w-[300px]">
                <SearchInput placeholder="Tìm mã voucher, tên chương trình..." value={searchTerm} onChange={setSearchTerm} />
              </div>
              <div className="w-[200px]">
                <Select options={statusOptions} value={filterStatus} onChange={setFilterStatus} />
              </div>
            </div>
            <Button variant="primary" icon={<PlusCircle size={18} />} onClick={() => setIsCreateModalOpen(true)}>
              Tạo Voucher mới
            </Button>
          </div>

          <div className="relative min-h-[200px]">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
            ) : (
              <Table columns={columns} dataSource={currentVouchers} rowKey="id" />
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Pagination current={currentPage} total={filteredVouchers.length} pageSize={itemsPerPage} onChange={setCurrentPage} />
          </div>
        </div>
      </div>

      <CreateVoucherModal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); setEditingVoucher(null); }}
        mode={editingVoucher ? 'edit' : 'create'}
        initialData={editingVoucher}
        onSubmit={handleSaveVoucher}
      />

      <DistributeVoucherModal
        isOpen={!!distributeVoucher}
        onClose={() => setDistributeVoucher(null)}
        voucher={distributeVoucher}
        onSuccess={getAll}
      />
    </MainLayout>
  );
};

export default VoucherList;
