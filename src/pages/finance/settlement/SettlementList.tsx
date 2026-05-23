import React, { useMemo, useState } from 'react';
import MainLayout from '../../../components/layouts/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Table } from '../../../components/ui/Table';
import SettlementModal from './SettlementModal';
import { Eye } from 'lucide-react';
import type { Column } from '../../../components/ui/Table';
import type { SettlementTour } from './mockData';
import { financeService } from '../../../services/finance';
import type { QuyetToanResponse } from '../../../services/finance';
import { useAuth } from '../../../context/AuthContext';
import { hasAccess } from '../../../config/rolePermissions';

const SettlementList: React.FC = () => {
  const [tours, setTours] = useState<SettlementTour[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [selectedTour, setSelectedTour] = useState<SettlementTour | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalReadonly, setModalReadonly] = useState(false);

  const handleOpenModal = (tour: SettlementTour, readonly = false) => {
    setSelectedTour(tour);
    setModalReadonly(readonly);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTour(null);
    setModalOpen(false);
    setModalReadonly(false);
  };

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'finance')) return;
    try {
      const res = await financeService.danhSach_6();
      const mapped = (res?.content || []).map((q: QuyetToanResponse): SettlementTour => {
        let status: SettlementTour['status'] = 'pending';
        if (q.trangThai === 'DA_QUYET_TOAN') status = 'completed';
        else if (q.trangThai === 'CHUA_QUYET_TOAN') status = 'pending';
        
        return {
          id: q.maQuyetToan || '',
          code: q.maTour || '',
          name: q.tenTour || '',
          startDate: '',
          endDate: q.ngayQuyetToan || '',
          totalRevenue: q.tongDoanhThu || 0,
          totalAllotmentCost: 0,
          totalActualCost: q.tongChiPhi || 0,
          passengerCount: 0,
          guideName: q.tenNhanVien || '',
          guideCode: '',
          actualCostItems: [],
          status,
          settlementNote: q.ghiChu
        };
      });
      setTours(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const handleSettle = async (id: string, status: 'completed' | 'pending_info' | 'over_budget', note?: string) => {
    try {
      if (status === 'completed') {
        await financeService.chotQuyetToan(id);
      }
      setTours((prev) =>
        prev.map((tour) => {
          if (tour.id !== id) return tour;
          if (status === 'completed') {
            return { ...tour, status: 'completed', settlementNote: note };
          }
          if (status === 'pending_info') {
            return { ...tour, settlementNote: note };
          }
          return { ...tour, status: 'pending_over_budget', settlementNote: note };
        })
      );
    } catch (e) {
      alert('Lỗi chốt quyết toán. ' + (e instanceof Error ? e.message : ''));
    }
  };

  const filteredData = useMemo(() => {
    return tours.filter((tour) => {
      const keyword = searchTerm.toLowerCase();
      const matchesSearch = tour.code.toLowerCase().includes(keyword) || tour.name.toLowerCase().includes(keyword);

      let matchesStatus = true;
      if (statusFilter && statusFilter !== 'all') {
        matchesStatus = tour.status === statusFilter;
      }

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter, tours]);

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<SettlementTour>[] = [
    {
      key: 'code',
      title: 'Mã Tour',
      render: (record) => <span className="font-semibold text-[#00668A]">{record.code}</span>,
    },
    {
      key: 'name',
      title: 'Tên Tour',
      dataIndex: 'name',
    },
    {
      key: 'endDate',
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
    },
    {
      key: 'totalRevenue',
      title: 'Tổng doanh thu',
      align: 'right',
      render: (record) => (
        <span className="font-semibold text-emerald-700">{record.totalRevenue.toLocaleString('vi-VN')}</span>
      ),
    },
    {
      key: 'totalCost',
      title: 'Tổng chi phí',
      align: 'right',
      render: (record) => {
        const totalCost = record.totalAllotmentCost + record.totalActualCost;
        const isLoss = totalCost > record.totalRevenue;
        return (
          <span className={`font-semibold ${isLoss ? 'text-red-600' : 'text-gray-800'}`}>
            {totalCost.toLocaleString('vi-VN')}
          </span>
        );
      },
    },

    {
      key: 'status',
      title: 'Trạng thái',
      align: 'center',
      render: (record) => {
        if (record.status === 'completed') {
          return <Badge label="Đã quyết toán" variant="success" />;
        }
        return <Badge label="Chờ quyết toán" variant="warning" />;
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'center',
      render: (record) => {
        if (record.status === 'completed') {
          return (
            <Button
              variant="ghost"
              size="sm"
              icon={<Eye size={18} />}
              onClick={() => handleOpenModal(record, true)}
              aria-label="Xem chi tiết"
            />
          );
        }
        return (
          <Button variant="primary" size="sm" onClick={() => handleOpenModal(record)}>
            Quyết toán
          </Button>
        );
      },
    },
  ];

  return (
    <MainLayout
      activeMenu="Quyết toán Tour"
      expandedMenus={["Tài chính & Kế toán"]}
      breadcrumb={[{ label: 'Tài chính & Kế toán' }, { label: 'Quyết toán Tour' }]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-bold text-[#121C2C]">Quyết toán Tài chính Tour</h1>
        </div>

        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[260px]">
            <SearchInput
              placeholder="Tìm kiếm mã tour, tên tour..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="w-[200px]">
            <Select
              options={[
                { label: 'Tất cả', value: 'all' },
                { label: 'Chờ quyết toán', value: 'pending' },
                { label: 'Đã quyết toán', value: 'completed' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            />
          </div>
        </div>

        <Table columns={columns} dataSource={paginatedData} rowKey="id" emptyText="Không có tour cần quyết toán" />

        <Pagination
          current={page}
          total={filteredData.length}
          pageSize={pageSize}
          onChange={setPage}
        />
      </div>

      <SettlementModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        tour={selectedTour}
        onSettle={handleSettle}
        readonly={modalReadonly}
      />
    </MainLayout>
  );
};

export default SettlementList;
