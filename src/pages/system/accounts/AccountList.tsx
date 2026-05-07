import React, { useMemo, useState } from 'react';
import MainLayout from '../../../components/layouts/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table } from '../../../components/ui/Table';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Lock, LockOpen, Pencil, RotateCcw, ShieldCheck, Trash2, UserPlus } from 'lucide-react';
import type { Column } from '../../../components/ui/Table';
import type { Account } from './mockData';
import { allRoles } from './mockData';
import AccountFormModal from './AccountFormModal';
import PermissionModal from './PermissionModal';
import { accountsService } from '../../../services/system/accounts';
import type { NhanVienResponse } from '../../../services/system/accounts';
import { useAuth } from '../../../context/AuthContext';
import { hasAccess } from '../../../config/rolePermissions';

export const ROLE_MAP: Record<string, string> = {
  'ADMIN': 'Quản trị viên',
  'SANPHAM': 'Nhân viên sản phẩm',
  'KINHDOANH': 'Nhân viên kinh doanh',
  'DIEUHANH': 'Nhân viên điều hành',
  'KETOAN': 'Nhân viên kế toán',
};
export const ROLE_VALUE_MAP: Record<string, string> = {
  'Quản trị viên': 'ADMIN',
  'Nhân viên sản phẩm': 'SANPHAM',
  'Nhân viên kinh doanh': 'KINHDOANH',
  'Nhân viên điều hành': 'DIEUHANH',
  'Nhân viên kế toán': 'KETOAN',
};

const AccountList: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedAccount, setSelectedAccount] = useState<Account | undefined>(undefined);

  const [permissionOpen, setPermissionOpen] = useState(false);
  const [permissionAccount, setPermissionAccount] = useState<Account | null>(null);

  const roleOptions = [
    { value: 'all', label: 'Tất cả vai trò' },
    ...allRoles.map((role) => ({ value: role, label: role })),
  ];

  const statusOptions = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'locked', label: 'Bị khóa' },
  ];

  const filteredAccounts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !normalizedSearch ||
        account.name.toLowerCase().includes(normalizedSearch) ||
        account.email.toLowerCase().includes(normalizedSearch) ||
        account.username.toLowerCase().includes(normalizedSearch) ||
        account.phone.includes(normalizedSearch) ||
        account.code.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'all' || account.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || account.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, roleFilter, searchTerm, statusFilter]);

  const paginatedAccounts = filteredAccounts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const handleRefresh = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const getNextCode = () => {
    return `TK-${String(accounts.length + 1).padStart(3, '0')}`;
  };

  const fetchAccounts = async () => {
    if (!hasAccess(user?.maVaiTro, 'accounts')) return;
    try {
      setLoading(true);
      const res = await accountsService.danhSachNhanVien();
      const mapped = (res?.content || []).map((nv: NhanVienResponse): Account => ({
        id: nv.maNhanVien || '',
        code: nv.maNhanVien || '',
        name: nv.hoTen || '',
        email: nv.email || '',
        phone: nv.soDienThoai || '',
        username: nv.tenDangNhap || '',
        role: ROLE_MAP[nv.maVaiTro?.replace('ROLE_', '') || ''] || 'Khách hàng',
        status: nv.trangThaiTaiKhoan === 'ACTIVE' ? 'active' : 'locked',
        avatar: undefined
      }));
      setAccounts(mapped);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Lỗi tải danh sách tài khoản');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAccounts();
  }, [user]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setSelectedAccount({
      id: String(Date.now()),
      code: getNextCode(),
      name: '',
      email: '',
      phone: '',
      username: '',
      role: '',
      status: 'active',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (account: Account) => {
    setFormMode('edit');
    setSelectedAccount(account);
    setFormOpen(true);
  };

  const handleFormSubmit = () => {
    fetchAccounts();
  };

  const handleToggleStatus = async (account: Account) => {
    const nextStatus = account.status === 'active' ? 'locked' : 'active';
    const confirmed = window.confirm(
      `${nextStatus === 'locked' ? 'Khóa' : 'Mở khóa'} tài khoản ${account.code}?`
    );
    if (!confirmed) return;

    try {
      if (nextStatus === 'locked') {
        await accountsService.khoaTaiKhoan(account.id);
      } else {
        await accountsService.moKhoaTaiKhoan(account.id);
      }
      alert(`${nextStatus === 'locked' ? 'Khóa' : 'Mở khóa'} tài khoản thành công.`);
      fetchAccounts();
    } catch (error) {
      alert('Lỗi khi thao tác tài khoản');
    }
  };

  const handleDelete = (account: Account) => {
    const canDelete = account.role === 'Khách hàng';
    if (!canDelete) {
      alert('Không thể xóa tài khoản nhân sự còn dữ liệu liên quan.');
      return;
    }

    const confirmed = window.confirm(`Xóa tài khoản ${account.code}?`);
    if (!confirmed) return;

    setAccounts((prev) => prev.filter((item) => item.id !== account.id));
    alert('Xóa tài khoản thành công.');
  };

  const handleOpenPermissions = (account: Account) => {
    setPermissionAccount(account);
    setPermissionOpen(true);
  };

  const renderRoleBadge = (role: string) => {
    const variantMap: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      'Quản trị viên': 'info',
      'Nhân viên sản phẩm': 'success',
      'Nhân viên kinh doanh': 'warning',
      'Nhân viên điều hành': 'info',
      'Nhân viên kế toán': 'warning',
      'Khách hàng': 'success',
    };

    return <Badge label={role} variant={variantMap[role] || 'info'} dot={false} />;
  };

  const columns: Column<Account>[] = [
    {
      key: 'code',
      title: 'Mã TK',
      render: (record) => (
        <span className="font-bold text-[#00668A]">{record.code}</span>
      ),
    },
    {
      key: 'name',
      title: 'Người dùng',
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#E8F6FF] text-[#00668A] flex items-center justify-center font-bold text-xs">
            {record.avatar ? (
              <img
                src={record.avatar}
                alt={record.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              record.name
                .split(' ')
                .map((word) => word[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{record.name}</span>
            <span className="text-xs text-gray-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      title: 'Liên hệ',
      render: (record) => (
        <span className="text-sm font-medium text-gray-700">{record.phone}</span>
      ),
    },
    {
      key: 'role',
      title: 'Vai trò',
      render: (record) => renderRoleBadge(record.role),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      align: 'center',
      render: (record) => (
        <Badge
          label={record.status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
          variant={record.status === 'active' ? 'success' : 'error'}
        />
      ),
    },
    {
      key: 'actions',
      title: 'Thao tác',
      align: 'center',
      render: (record) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<ShieldCheck size={18} />}
            onClick={() => handleOpenPermissions(record)}
            disabled={record.status !== 'active'}
            aria-label="Phân quyền"
            className="px-2"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Pencil size={18} />}
            onClick={() => handleOpenEdit(record)}
            aria-label="Chỉnh sửa"
            className="px-2"
          />
          {record.status === 'active' ? (
            <Button
              variant="ghost"
              size="sm"
              icon={<Lock size={18} />}
              onClick={() => handleToggleStatus(record)}
              aria-label="Khóa"
              className="px-2"
            />
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                icon={<LockOpen size={18} />}
                onClick={() => handleToggleStatus(record)}
                aria-label="Mở khóa"
                className="px-2"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Trash2 size={18} />}
                onClick={() => handleDelete(record)}
                aria-label="Xóa"
                className="px-2 text-[#BA1A1A] hover:text-[#BA1A1A]"
              />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Quản lý tài khoản"
      expandedMenus={["Hệ thống"]}
      breadcrumb={[{ label: 'Hệ thống' }, { label: 'Quản lý Tài khoản' }]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-bold text-[#121C2C]">Quản lý Tài khoản</h1>
            <p className="text-gray-500 text-sm mt-1">
              Tạo, phân quyền và quản lý tài khoản nhân viên và khách hàng trong hệ thống.
            </p>
          </div>
          <Button
            variant="primary"
            icon={<UserPlus size={18} />}
            onClick={handleOpenCreate}
          >
            Thêm tài khoản mới
          </Button>
        </div>

        {error && <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>}
        
        <div className="bg-white p-6 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <SearchInput
              placeholder="Tìm kiếm theo tên, email, username, SĐT..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="w-[200px]">
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Vai trò"
            />
          </div>
          <div className="w-[180px]">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Trạng thái"
            />
          </div>
          <Button
            variant="secondary"
            icon={<RotateCcw size={18} />}
            onClick={handleRefresh}
          >
            Làm mới
          </Button>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 overflow-x-auto relative min-h-[200px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-[#00668A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <Table<Account>
            columns={columns}
            dataSource={paginatedAccounts}
            rowKey="id"
            emptyText="Không tìm thấy tài khoản phù hợp"
          />
        </div>

        <Pagination
          current={page}
          pageSize={pageSize}
          total={filteredAccounts.length}
          onChange={setPage}
        />
      </div>

      <AccountFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        mode={formMode}
        initialData={selectedAccount}
        onSubmit={handleFormSubmit}
      />

      <PermissionModal
        isOpen={permissionOpen}
        onClose={() => setPermissionOpen(false)}
        account={permissionAccount}
        onSuccess={fetchAccounts}
      />
    </MainLayout>
  );
};

export default AccountList;
