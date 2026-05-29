import React, { useMemo, useState } from 'react';
import MainLayout from '../../../components/layouts/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Table } from '../../../components/ui/Table';
import RefundProcessingModal from './RefundProcessingModal';
import { Eye } from 'lucide-react';
import type { Column } from '../../../components/ui/Table';
import type { RefundRequest } from './mockData';
import type { RefundData } from './RefundProcessingModal';
import { financeService } from '../../../services/finance';
import { ordersService } from '../../../services/orders';
import type { ThanhToanResponse } from '../../../services/finance';
import { useAuth } from '../../../context/AuthContext';
import { hasAccess } from '../../../config/rolePermissions';
import { mapTransactionStatus } from '../../../utils/statusMapping';

const RefundList: React.FC = () => {
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReadonly, setModalReadonly] = useState(false);

  const handleOpenModal = (refund: RefundRequest, readonly = false) => {
    setSelectedRefund(refund);
    setModalReadonly(readonly);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRefund(null);
    setModalOpen(false);
    setModalReadonly(false);
  };

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'finance')) return;
    try {
      const refundPageSize = 100;
      const firstPage = await financeService.danhSachChoHoanTien({ page: 0, size: refundPageSize });
      const totalPages = firstPage?.totalPages ?? 1;
      const remainingPages = totalPages > 1
        ? await Promise.all(
            Array.from({ length: totalPages - 1 }, (_, index) =>
              financeService.danhSachChoHoanTien({ page: index + 1, size: refundPageSize })
            )
          )
        : [];
      const allRefunds = [firstPage, ...remainingPages].flatMap(page => page?.content ?? []);
      const ordersRes = await ordersService.danhSachTatCa({ page: 0, size: 500 }).catch(() => null);
      const orders = ordersRes?.content || [];

      const mapped = allRefunds.map((t: ThanhToanResponse): RefundRequest => {
        const status: RefundRequest['status'] = (t.trangThai as RefundRequest['status']) || 'CHO_THANH_TOAN';
        const orderInfo = orders.find(o => o.maDatTour === t.maDatTour);

        return {
          id: t.maGiaoDich || '',
          code: t.maGiaoDich || '',
          orderCode: t.maDatTour || '',
          customerName: orderInfo?.tenKhachHang || 'Khách hàng',
          customerPhone: (orderInfo as any)?.soDienThoai || '',
          amount: t.soTien || 0,
          reason: '',
          status,
          refundMethod: t.phuongThuc === 'CHUYEN_KHOAN' ? 'gateway' : 'manual'
        };
      });

      setRefunds(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const handleProcessRefund = async (id: string, action: 'complete' | 'reject', data?: RefundData) => {
    try {
      if (action === 'complete') {
        await financeService.xacNhanHoanTien(id);
      } else if (action === 'reject') {
        await financeService.tuChoiHoanTien(id);
      }
      setRefunds((prev) =>
        prev.map((refund) => {
          if (refund.id !== id) return refund;
          if (action === 'complete') {
            return {
              ...refund,
              status: 'DA_HOAN_TIEN',
              refundMethod: data?.method,
              bankAccount: data?.bankAccount,
              bankName: data?.bankName,
              transactionCode: data?.transactionCode,
            };
          }
          return { ...refund, status: 'TU_CHOI' };
        })
      );
    } catch (e) {
      throw e;
    }
  };

  const filteredData = useMemo(() => {
    return refunds.filter((refund) => {
      const keyword = searchTerm.toLowerCase();
      const matchesSearch =
        refund.code.toLowerCase().includes(keyword) ||
        refund.orderCode.toLowerCase().includes(keyword) ||
        refund.customerName.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === '' || statusFilter === 'all' || refund.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, refunds]);

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<RefundRequest>[] = [
    {
      key: 'code',
      title: 'Mã Yêu Cầu',
      render: (record) => <span className="font-semibold text-[#00668A]">{record.code}</span>,
    },
    {
      key: 'orderCode',
      title: 'Mã Đơn Hàng',
      render: (record) => (
        <button className="text-sm font-semibold text-[#00668A] hover:underline" type="button">
          {record.orderCode}
        </button>
      ),
    },
    {
      key: 'customer',
      title: 'Khách Hàng',
      width: '25%',
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex-shrink-0 rounded-full bg-[#E8F6FF] text-[#00668A] font-semibold flex items-center justify-center">
            {record.customerName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-gray-800 truncate">{record.customerName}</div>
            {record.customerPhone && <div className="text-xs text-gray-500 truncate">{record.customerPhone}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'amount',
      title: 'Số Tiền Hoàn',
      align: 'right',
      render: (record) => (
        <span className="font-semibold text-gray-800">{record.amount.toLocaleString('vi-VN')}</span>
      ),
    },

    {
      key: 'status',
      title: 'Trạng Thái',
      width: '15%',
      render: (record) => {
        const mappedStatus = mapTransactionStatus(record.status as string);
        return <Badge label={mappedStatus.label} variant={mappedStatus.variant} />;
      },
    },
    {
      key: 'actions',
      title: 'Hành Động',
      align: 'center',
      width: '12%',
      render: (record) => {
        if (record.status === 'CHO_THANH_TOAN' || record.status === 'CHO_HOAN_TIEN' || record.status === 'pending' || record.status === 'THANH_CONG') {
          return (
            <Button variant="primary" size="sm" onClick={() => handleOpenModal(record)}>
              Xử lý ngay
            </Button>
          );
        }
        return (
          <Button
            variant="ghost"
            size="sm"
            icon={<Eye size={18} />}
            onClick={() => handleOpenModal(record, true)}
            className="p-2"
            aria-label="Xem chi tiết"
          />
        );
      },
    },
  ];

  return (
    <MainLayout
      activeMenu="Xử lý Hoàn tiền"
      expandedMenus={["Tài chính & Kế toán"]}
      breadcrumb={[{ label: 'Tài chính & Kế toán' }, { label: 'Xử lý Hoàn tiền' }]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Quản Lý Yêu Cầu Hoàn Tiền</h1>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[260px]">
            <SearchInput
              placeholder="Tìm kiếm mã yêu cầu, khách hàng..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="w-[200px]">
            <Select
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Chờ thanh toán', value: 'CHO_THANH_TOAN' },
                { label: 'Đã hoàn tiền', value: 'DA_HOAN_TIEN' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            />
          </div>
        </div>

        <Table columns={columns} dataSource={paginatedData} rowKey="id" emptyText="Không có yêu cầu hoàn tiền" />

        <Pagination
          current={page}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={setPage}
        />
      </div>

      <RefundProcessingModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        refund={selectedRefund}
        onProcessRefund={handleProcessRefund}
        readonly={modalReadonly}
      />
    </MainLayout>
  );
};

export default RefundList;
