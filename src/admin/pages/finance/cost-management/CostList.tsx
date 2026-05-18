import React, { useMemo, useState } from 'react';
import MainLayout from '../../../components/layouts/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Table } from '../../../components/ui/Table';
import CostApprovalModal from './CostApprovalModal';
import type { Column } from '../../../components/ui/Table';
import type { CostItem } from './mockData';
import { financeService } from '../../../services/finance';
import type { ChiPhiThucTeResponse } from '../../../services/finance';
import { useAuth } from '../../../context/AuthContext';
import { hasAccess } from '../../../config/rolePermissions';

const CostList: React.FC = () => {
  const [costs, setCosts] = useState<CostItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [warningOnly, setWarningOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [selectedCost, setSelectedCost] = useState<CostItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = (cost: CostItem) => {
    setSelectedCost(cost);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCost(null);
    setModalOpen(false);
  };

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'finance')) return;
    try {
      const res = await financeService.danhSachChiPhi();
      const mapped = (res?.content || []).map((c: ChiPhiThucTeResponse): CostItem => {
        let status: CostItem['status'] = 'pending';
        if (c.trangThaiDuyet === 'DUYET') status = 'approved';
        else if (c.trangThaiDuyet === 'TU_CHOI') status = 'rejected';
        
        return {
          id: c.maChiPhi || '',
          tourCode: c.maTour || '',
          tourName: '',
          guideName: c.tenNhanVien || '',
          category: c.danhMuc || '',
          amount: c.thanhTien || 0,
          submittedDate: c.ngayKhai || '',
          receiptImage: c.hoaDonAnh,
          status,
        };
      });
      setCosts(mapped);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: 'approved' | 'rejected' | 'pending_info', note?: string) => {
    try {
      if (newStatus === 'approved') {
        await financeService.duyetChiPhi(id);
      } else if (newStatus === 'rejected') {
        await financeService.tuChoiChiPhi(id);
      }
      setCosts((prev) =>
        prev.map((cost) =>
          cost.id === id
            ? {
              ...cost,
              status: newStatus,
              resolutionNote: note || cost.resolutionNote,
            }
            : cost
        )
      );
    } catch (e) {
      alert('Lỗi cập nhật. ' + (e instanceof Error ? e.message : ''));
    }
  };

  const filteredData = useMemo(() => {
    return costs.filter((cost) => {
      const keyword = searchTerm.toLowerCase();
      const matchesSearch =
        cost.tourCode.toLowerCase().includes(keyword) ||
        cost.guideName.toLowerCase().includes(keyword) ||
        cost.category.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter === '' || statusFilter === 'all' || cost.status === statusFilter;

      let matchesMonth = true;
      if (monthFilter) {
        const parts = cost.submittedDate.split('/');
        if (parts.length === 3) {
          const monthKey = `${parts[2]}-${parts[1]}`;
          matchesMonth = monthKey === monthFilter;
        }
      }

      const matchesWarning = !warningOnly || cost.status === 'warning' || cost.status === 'error';

      return matchesSearch && matchesStatus && matchesMonth && matchesWarning;
    });
  }, [costs, monthFilter, searchTerm, statusFilter, warningOnly]);

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<CostItem>[] = [
    {
      key: 'tourCode',
      title: 'Mã Tour',
      render: (record) => <span className="font-semibold text-[#00668A]">{record.tourCode}</span>,
    },
    {
      key: 'guide',
      title: 'HDV',
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E8F6FF] text-[#00668A] font-semibold flex items-center justify-center">
            {record.guideName.charAt(0)}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{record.guideName}</div>
            <div className="text-xs text-gray-500">{record.tourName}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Hạng mục',
      dataIndex: 'category',
    },
    {
      key: 'amount',
      title: 'Số tiền (VND)',
      align: 'right',
      render: (record) => (
        <span className="font-semibold text-gray-800">{record.amount.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái / Cảnh báo',
      render: (record) => {
        if (record.status === 'pending') {
          return <Badge label="Chờ duyệt" variant="info" />;
        }
        if (record.status === 'pending_info') {
          return <Badge label="Chờ bổ sung" variant="warning" />;
        }
        if (record.status === 'approved') {
          return <Badge label="Đã duyệt" variant="success" />;
        }
        if (record.status === 'rejected') {
          return <Badge label="Đã từ chối" variant="error" />;
        }
        if (record.status === 'warning') {
          return <Badge label={record.warningMessage || 'Vượt định mức'} variant="warning" />;
        }
        return <Badge label={record.warningMessage || 'Thiếu chứng từ'} variant="error" />;
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'center',
      render: (record) => (
        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(record)}>
          Xử lý
        </Button>
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Quản lý Chi phí"
      expandedMenus={["Tài chính & Kế toán"]}
      breadcrumb={[{ label: 'Tài chính & Kế toán' }, { label: 'Quản lý Chi phí' }]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-bold text-[#121C2C]">Kiểm Duyệt Chi Phí Thực Tế</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi, rà soát và phê duyệt các khoản chi thực tế của từng tour.</p>
        </div>

        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <SearchInput
              placeholder="Tìm mã tour, HDV, hạng mục chi..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="w-[180px]">
            <Select
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Chờ duyệt', value: 'pending' },
                { label: 'Chờ bổ sung', value: 'pending_info' },
                { label: 'Có cảnh báo', value: 'warning' },
                { label: 'Thiếu chứng từ', value: 'error' },
                { label: 'Đã duyệt', value: 'approved' },
                { label: 'Đã từ chối', value: 'rejected' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            />
          </div>
          <div className="w-[180px]">
            <label className="text-[14px] font-semibold text-gray-700">Tháng</label>
            <input
              type="month"
              value={monthFilter}
              onChange={(event) => setMonthFilter(event.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={warningOnly}
              onChange={(event) => setWarningOnly(event.target.checked)}
              className="w-4 h-4 text-[#00668A] border-[#C5EAFF] rounded"
            />
            Chỉ hiển thị các khoản chi có CẢNH BÁO
          </label>
        </div>

        <Table
          columns={columns}
          dataSource={paginatedData}
          rowKey="id"
          rowClassName={(record) => {
            if (record.status === 'warning') {
              return 'bg-amber-50 hover:bg-amber-100/60';
            }
            if (record.status === 'error') {
              return 'bg-red-50 hover:bg-red-100/60';
            }
            return '';
          }}
          emptyText="Không có khoản chi phù hợp"
        />

        <Pagination
          current={page}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={setPage}
        />
      </div>

      <CostApprovalModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        cost={selectedCost}
        onUpdateStatus={handleUpdateStatus}
      />
    </MainLayout>
  );
};

export default CostList;
