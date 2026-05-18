import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Button } from '../../components/ui/Button';
import { Eye, User } from 'lucide-react';
import CustomerDetailModal from './CustomerDetailModal';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import type { Customer } from './mockData';
import type { HoChieuSoResponse } from '../../services/customers';
import { customersService } from '../../services/customers';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const mapTier = (s?: string): Customer['membershipTier'] => {
  switch (s?.toUpperCase()) {
    case 'DIAMOND': return 'diamond';
    case 'GOLD': return 'gold';
    case 'SILVER': return 'silver';
    default: return 'bronze';
  }
};

const CustomerList: React.FC = () => {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const mapToUI = (api: HoChieuSoResponse): Customer => ({
    id: api.maKhachHang || '',
    code: api.maKhachHang || '',
    name: api.hoTen || '',
    email: api.email || '',
    phone: api.soDienThoai || '',
    membershipTier: mapTier(api.hangThanhVien),
    greenPoints: api.diemXanh || 0,
    status: 'active',
    tourHistory: [],
    complaints: [],
  });

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'customers')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await customersService.timKiemKhachHang();
      setData(res && res.content ? res.content.map(mapToUI) : []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const handleOpenDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalOpen(true);
  };

  const filteredData = data.filter((customer) => {
    const matchesSearch = customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.phone.includes(searchTerm) ||
                          customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = tierFilter === '' || tierFilter === 'all' || customer.membershipTier === tierFilter;
    const matchesStatus = statusFilter === '' || statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const renderTierBadge = (tier: string) => {
    switch (tier) {
      case 'diamond': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-800 text-white border border-slate-600">Kim Cương</span>;
      case 'gold': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">Vàng</span>;
      case 'silver': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-200 text-gray-800 border border-gray-300">Bạc</span>;
      case 'bronze': return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-300">Đồng</span>;
      default: return null;
    }
  };

  const columns: Column<Customer>[] = [
    {
      key: 'code',
      title: 'MÃ KH',
      render: (record) => <span className="font-bold text-[#00668A]">{record.code}</span>,
    },
    {
      key: 'name',
      title: 'HỌ TÊN',
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E8F6FF] text-[#00668A] flex items-center justify-center font-bold text-xs ring-2 ring-white">
            {record.avatar ? (
              <img src={record.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              <User size={14} />
            )}
          </div>
          <span className="font-semibold text-gray-800">{record.name}</span>
        </div>
      )
    },
    {
      key: 'contact',
      title: 'LIÊN HỆ',
      render: (record) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{record.phone}</span>
          <span className="text-xs text-gray-500">{record.email}</span>
        </div>
      )
    },
    { key: 'tier', title: 'HẠNG THẺ', align: 'center', render: (record) => renderTierBadge(record.membershipTier) },
    {
      key: 'status',
      title: 'TRẠNG THÁI',
      align: 'center',
      render: (record) => (
        <Badge label={record.status === 'active' ? 'Hoạt động' : 'Đã khóa'} variant={record.status === 'active' ? 'success' : 'error'} />
      ),
    },
    {
      key: 'actions',
      title: 'THAO TÁC',
      align: 'center',
      render: (record) => (
        <button
          onClick={() => handleOpenDetail(record)}
          className="p-1.5 text-gray-500 hover:text-[#00668A] hover:bg-[#E8F6FF] rounded-lg transition-colors"
          aria-label="Xem hồ sơ"
        >
          <Eye size={18} />
        </button>
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Quản lý Khách hàng"
      expandedMenus={[]}
      breadcrumb={[{ label: 'Quản lý Khách hàng' }]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col h-full gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Quản Lý Hồ Sơ Khách Hàng</h1>
            <p className="text-gray-500 text-sm mt-1">Tra cứu và xem lịch sử giao dịch, hạng thành viên của khách hàng.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <SearchInput placeholder="Tìm kiếm mã KH, tên, sđt, email..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="w-[180px]">
            <Select
              options={[
                { label: 'Tất cả hạng', value: 'all' },
                { label: 'Kim Cương', value: 'diamond' },
                { label: 'Vàng', value: 'gold' },
                { label: 'Bạc', value: 'silver' },
                { label: 'Đồng', value: 'bronze' }
              ]}
              value={tierFilter}
              onChange={setTierFilter}
              placeholder="Hạng thành viên"
            />
          </div>
          <div className="w-[180px]">
            <Select
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Hoạt động', value: 'active' },
                { label: 'Đã khóa', value: 'locked' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            />
          </div>
          <Button variant="secondary" onClick={() => setPage(1)}>Lọc</Button>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 relative min-h-[300px] overflow-x-auto">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
          ) : (
            <Table<Customer>
              columns={columns}
              dataSource={paginatedData}
              rowKey="id"
              emptyText="Không tìm thấy khách hàng nào"
            />
          )}
        </div>

        <Pagination current={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
      </div>

      <CustomerDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        customer={selectedCustomer}
      />
    </MainLayout>
  );
};

export default CustomerList;
