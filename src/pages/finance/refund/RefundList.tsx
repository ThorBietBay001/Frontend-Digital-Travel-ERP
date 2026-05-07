import React, { useMemo, useState } from 'react';
import MainLayout from '../../../components/layouts/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Table } from '../../../components/ui/Table';
import RefundProcessingModal from './RefundProcessingModal';
import { Download, Eye } from 'lucide-react';
import type { Column } from '../../../components/ui/Table';
import type { RefundRequest } from './mockData';
import type { RefundData } from './RefundProcessingModal';
import { financeService } from '../../../services/finance';
import type { ThanhToanResponse } from '../../../services/finance';
import { useAuth } from '../../../context/AuthContext';
import { hasAccess } from '../../../config/rolePermissions';

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
      const res = await financeService.danhSachChoHoanTien();
      const mapped = (res?.content || []).map((t: ThanhToanResponse): RefundRequest => {
        let status: RefundRequest['status'] = 'pending';
        if (t.trangThai === 'DA_HOAN_TIEN') status = 'completed';
        else if (t.trangThai === 'TU_CHOI') status = 'rejected';

        return {
          id: t.maGiaoDich || '',
          code: t.maGiaoDich || '',
          orderCode: t.maDatTour || '',
          customerName: 'Khách hàng', // Mock if unavailable
          customerPhone: '', // Mock
          amount: t.soTien || 0,
          reason: t.thongBao || '',
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
      }
      setRefunds((prev) =>
        prev.map((refund) => {
          if (refund.id !== id) return refund;
          if (action === 'complete') {
            return {
              ...refund,
              status: 'completed',
              refundMethod: data?.method,
              bankAccount: data?.bankAccount,
              transactionCode: data?.transactionCode,
            };
          }
          return { ...refund, status: 'rejected' };
        })
      );
    } catch (e) {
      alert('Lỗi xử lý hoàn tiền. ' + (e instanceof Error ? e.message : ''));
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
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E8F6FF] text-[#00668A] font-semibold flex items-center justify-center">
            {record.customerName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{record.customerName}</div>
            <div className="text-xs text-gray-500">{record.customerPhone}</div>
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
      key: 'reason',
      title: 'Lý do hủy',
      dataIndex: 'reason',
    },
    {
      key: 'status',
      title: 'Trạng thái',
      render: (record) => {
        if (record.status === 'pending') {
          return <Badge label="Chờ xử lý" variant="warning" />;
        }
        if (record.status === 'completed') {
          return <Badge label="Đã hoàn" variant="success" />;
        }
        return <Badge label="Đã từ chối" variant="error" />;
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'center',
      render: (record) => {
        if (record.status === 'pending') {
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
            <p className="text-sm text-gray-500 mt-1">Theo dõi trạng thái và xử lý các yêu cầu hoàn tiền từ khách hàng.</p>
          </div>
          <Button variant="secondary" icon={<Download size={18} />}>
            Xuất file
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="text-sm text-gray-500">Yêu cầu chờ xử lý</div>
            <div className="text-2xl font-bold text-[#00668A] mt-2">5</div>
          </div>
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="text-sm text-gray-500">Tổng tiền cần hoàn</div>
            <div className="text-2xl font-bold text-amber-600 mt-2">45.000.000 VND</div>
          </div>
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
            <div className="text-sm text-gray-500">Đã hoàn trong tháng</div>
            <div className="text-2xl font-bold text-emerald-600 mt-2">120.000.000 VND</div>
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
                { label: 'Chờ xử lý', value: 'pending' },
                { label: 'Đã hoàn', value: 'completed' },
                { label: 'Đã từ chối', value: 'rejected' }
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
