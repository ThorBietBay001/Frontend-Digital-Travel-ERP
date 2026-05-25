import React, { useState } from 'react';
import { PlusCircle, Send, Ban, RotateCcw } from 'lucide-react';
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
import { formatApiError } from '../../utils/apiHelpers';
import { mapVoucherStatus } from '../../utils/statusMapping';
import { useNotification } from '../../context/NotificationContext';

const statusOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'SAN_SANG', label: 'Sẵn sàng' },
  { value: 'HET_HAN', label: 'Hết hạn' },
  { value: 'VO_HIEU_HOA', label: 'Vô hiệu hóa' },
];

const mapToUI = (api: VoucherResponse): Voucher => ({
  id: api.maVoucher || '',
  code: api.maCode || '',
  name: api.dieuKienApDung || api.maCode || '',
  discountType: api.loaiUuDai?.toUpperCase() === 'PHAN_TRAM' || api.loaiUuDai?.toUpperCase() === 'PERCENT' ? 'percent' : 'amount',
  discountValue: api.giaTriGiam || 0,
  maxDiscount: api.mucGiamToiDa,
  quantity: api.soLuotPhatHanh || 0,
  distributed: api.soLuotDaPhanBo ?? 0,
  startDate: api.ngayHieuLuc || '',
  expiryDate: api.ngayHetHan || '',
  status: api.trangThai || 'SAN_SANG',
});

const VoucherList: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [distributeVoucher, setDistributeVoucher] = useState<Voucher | null>(null);
  const [revokeVoucher, setRevokeVoucher] = useState<Voucher | null>(null);
  const itemsPerPage = 5;

  const { user } = useAuth();
  const { confirm } = useNotification();

  const getAll = React.useCallback(async () => {
    if (!hasAccess(user?.maVaiTro, 'promotions')) return;
    setLoading(true);
    setError(null);
    try {
      const pageSize = 100;
      const firstPage = await promotionsService.danhSach_4({ page: 0, size: pageSize });
      const totalPages = firstPage?.totalPages ?? 1;
      const remainingPages = totalPages > 1
        ? await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, index) =>
            promotionsService.danhSach_4({ page: index + 1, size: pageSize })
          )
        )
        : [];
      const allVouchers = [firstPage, ...remainingPages].flatMap(page => page?.content ?? []);
      setVouchers(allVouchers.map(mapToUI));
    } catch (err: unknown) {
      const msg = formatApiError(err, 'Lỗi khi tải dữ liệu');
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [user?.maVaiTro]);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getAll();
  }, [getAll]);

  const handleCreateVoucher = async (payload: VoucherRequest) => {
    try {
      await promotionsService.taoVoucher(payload);
      alert('Tạo voucher thành công');
      setIsCreateModalOpen(false);
      getAll();
    } catch (err: unknown) {
      let msg = formatApiError(err, 'Lỗi khi tạo voucher');
      if (msg.includes('MaCode da ton tai')) msg = 'Mã Code đã tồn tại';
      if (msg.includes('Giam PHAN_TRAM khong duoc vuot qua 100%')) msg = 'Giảm phần trăm không được vượt quá 100%';
      if (msg.includes('NgayHieuLuc phai truoc NgayHetHan')) msg = 'Ngày hiệu lực phải trước ngày hết hạn';
      alert('Lỗi: ' + msg);
      throw err;
    }
  };

  const handleBanVoucher = async (voucher: Voucher) => {
    if (await confirm(`Bạn có chắc chắn muốn vô hiệu hóa voucher ${voucher.code}?`)) {
      try {
        await promotionsService.voHieuVoucher(voucher.id);
        getAll();
      } catch (err: unknown) {
        let msg = formatApiError(err, 'Lỗi khi vô hiệu hóa');
        if (msg.includes('Khong tim thay voucher')) msg = 'Không tìm thấy voucher';
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
      title: <span className="whitespace-nowrap">Loại Giảm Giá</span>,
      align: 'center',
      render: (record) => (
        <span className="whitespace-nowrap">
          {record.discountType === 'percent'
            ? `Giảm ${record.discountValue}%`
            : `Giảm ${(record.discountValue / 1000).toFixed(0)}k`}
        </span>
      )
    },
    {
      key: 'quantity',
      title: <span className="whitespace-nowrap">Số Lượng</span>,
      align: 'center',
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
    { key: 'expiryDate', title: <span className="whitespace-nowrap">Hạn Sử Dụng</span>, dataIndex: 'expiryDate', align: 'center' },
    {
      key: 'status',
      title: <span className="whitespace-nowrap">Trạng Thái</span>,
      align: 'center',
      render: (record) => {
        const { label, variant } = mapVoucherStatus(record.status);
        return <Badge variant={variant} label={label} className="whitespace-nowrap" />;
      }
    },
    {
      key: 'actions',
      title: <span className="whitespace-nowrap">Hành Động</span>,
      align: 'center',
      render: (record) => (
        <div className="grid grid-cols-3 justify-items-center gap-2 min-w-[104px]">
          <button
            onClick={(e) => { e.stopPropagation(); setDistributeVoucher(record); }}
            disabled={record.status !== 'SAN_SANG' || record.distributed >= record.quantity}
            className="p-2 text-gray-500 hover:text-[#00668A] hover:bg-[#E1F1FF] rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
            title={record.status !== 'SAN_SANG' ? 'Chỉ phân phối voucher sẵn sàng' : record.distributed >= record.quantity ? 'Đã phân phối đủ số lượng' : 'Phân phối'}
          >
            <Send size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleBanVoucher(record); }}
            disabled={record.status === 'VO_HIEU_HOA' || record.status === 'HET_HAN'}
            className="p-2 text-gray-500 hover:text-[#BA1A1A] hover:bg-red-50 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
            title={record.status === 'VO_HIEU_HOA' || record.status === 'HET_HAN' ? 'Không thể vô hiệu hóa' : 'Vô hiệu hóa'}
          >
            <Ban size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setRevokeVoucher(record); }}
            disabled={record.distributed <= 0}
            className="p-2 text-gray-500 hover:text-[#BA1A1A] hover:bg-red-50 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500"
            title={record.distributed > 0 ? 'Thu hồi voucher' : 'Chưa có khách hàng được phân phối'}
          >
            <RotateCcw size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <MainLayout activeMenu="Quản lý Khuyến mãi" breadcrumb={[{ label: 'Quản lý Khuyến mãi' }]}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-[32px] font-bold text-[#121C2C]">Quản lý Khuyến mãi</h1>
          <Button variant="primary" icon={<PlusCircle size={18} />} onClick={() => setIsCreateModalOpen(true)}>
            Tạo Voucher mới
          </Button>
        </div>

        <div className="bg-white rounded-[16px] p-6 shadow-[0px_4px_20px_rgba(137,212,255,0.08)]">
          <div className="flex gap-4 items-center mb-6">
            <div className="flex-1 min-w-[300px]">
              <SearchInput placeholder="Tìm mã voucher, tên chương trình..." value={searchTerm} onChange={setSearchTerm} />
            </div>
            <div className="w-[200px]">
              <Select options={statusOptions} value={filterStatus} onChange={setFilterStatus} />
            </div>
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
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateVoucher}
      />

      <DistributeVoucherModal
        isOpen={!!distributeVoucher}
        onClose={() => setDistributeVoucher(null)}
        voucher={distributeVoucher}
        mode="distribute"
        onSuccess={(newDistributedCount) => {
          if (distributeVoucher) {
            setVouchers(prev => prev.map(v => v.id === distributeVoucher.id ? { ...v, distributed: newDistributedCount } : v));
          }
          getAll();
        }}
      />

      <DistributeVoucherModal
        isOpen={!!revokeVoucher}
        onClose={() => setRevokeVoucher(null)}
        voucher={revokeVoucher}
        mode="revoke"
        onSuccess={(newDistributedCount) => {
          if (revokeVoucher) {
            setVouchers(prev => prev.map(v => v.id === revokeVoucher.id ? { ...v, distributed: newDistributedCount } : v));
          }
          getAll();
        }}
      />
    </MainLayout>
  );
};

export default VoucherList;
