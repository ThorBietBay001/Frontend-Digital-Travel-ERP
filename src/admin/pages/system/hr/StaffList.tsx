import React, { useMemo, useState } from 'react';
import MainLayout from '../../../components/layouts/MainLayout';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Table } from '../../../components/ui/Table';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { Pagination } from '../../../components/ui/Pagination';
import { Award, Eye, RotateCcw } from 'lucide-react';
import CompetencyModal from './CompetencyModal';
import StaffProfileModal from './StaffProfileModal';
import type { Column } from '../../../components/ui/Table';
import type { Staff } from './mockData';
import { roles } from './mockData';
import { accountsService } from '../../../services/system/accounts';
import type { NhanVienResponse } from '../../../services/system/accounts';
import { useAuth } from '../../../context/AuthContext';
import { hasAccess } from '../../../config/rolePermissions';

const roleMap: Record<string, string> = {
  'ADMIN': 'admin',
  'SANPHAM': 'product',
  'KINHDOANH': 'sales',
  'DIEUHANH': 'operator',
  'KETOAN': 'accountant',
  'HDV': 'guide'
};

const StaffList: React.FC = () => {
  const [staffList, _setStaffList] = useState<Staff[]>([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchStaff = async () => {
      if (!hasAccess(user?.maVaiTro, 'hr')) return;
      try {
        setLoading(true);
        const res = await accountsService.danhSachNhanVien();
        const mapped = (res?.content || []).map((nv: NhanVienResponse): Staff => ({
          id: nv.maNhanVien || '',
          code: nv.maNhanVien || '',
          name: nv.hoTen || '',
          email: nv.email || '',
          phone: nv.soDienThoai || '',
          role: roleMap[nv.maVaiTro?.replace('ROLE_', '') || ''] || 'guide',
          joinDate: nv.ngayVaoLam || '',
        }));
        _setStaffList(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [user]);

  // We no longer manage competencies locally for all staff, CompetencyModal will fetch it.
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const totalStaffCount = 45;

  const [profileModal, setProfileModal] = useState<{ open: boolean; staff: Staff | null }>({
    open: false,
    staff: null,
  });
  const [competencyModal, setCompetencyModal] = useState<{ open: boolean; staff: Staff | null }>({
    open: false,
    staff: null,
  });

  const roleOptions = roles.map((role) => ({ value: role.id, label: role.label }));

  const filteredStaff = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return staffList.filter((staff) => {
      const matchesSearch =
        !normalizedSearch ||
        staff.name.toLowerCase().includes(normalizedSearch) ||
        staff.code.toLowerCase().includes(normalizedSearch) ||
        staff.email.toLowerCase().includes(normalizedSearch);
      const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchTerm, staffList]);

  const paginatedStaff = filteredStaff.slice((page - 1) * pageSize, page * pageSize);

  const handleRefresh = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setPage(1);
  };

  const handleOpenCompetency = (staff: Staff) => {
    setCompetencyModal({ open: true, staff });
  };

  const handleOpenProfile = (staff: Staff) => {
    setProfileModal({ open: true, staff });
  };

  const roleBadgeMap: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
    admin: { label: 'Quản trị viên', variant: 'info' },
    accountant: { label: 'Nhân viên kế toán', variant: 'success' },
    operator: { label: 'Nhân viên điều hành', variant: 'warning' },
    product: { label: 'Nhân viên sản phẩm', variant: 'info' },
    guide: { label: 'Hướng dẫn viên', variant: 'success' },
    sales: { label: 'Nhân viên kinh doanh', variant: 'warning' },
  };

  const columns: Column<Staff>[] = [
    {
      key: 'code',
      title: 'Mã NV',
      render: (record) => (
        <span className="font-bold text-[#00668A]">{record.code}</span>
      ),
    },
    {
      key: 'name',
      title: 'Họ tên',
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E8F6FF] text-[#00668A] flex items-center justify-center font-bold text-xs">
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
          <span className="font-semibold text-gray-800">{record.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      title: 'Email',
      render: (record) => <span className="text-sm text-gray-600">{record.email}</span>,
    },
    {
      key: 'role',
      title: 'Vai trò',
      render: (record) => {
        const roleInfo = roleBadgeMap[record.role];
        return (
          <Badge
            label={roleInfo?.label ?? 'Không rõ'}
            variant={roleInfo?.variant ?? 'info'}
            dot={false}
          />
        );
      },
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      render: (record) => <span className="text-sm text-gray-600">{record.phone}</span>,
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
            icon={<Eye size={18} />}
            onClick={() => handleOpenProfile(record)}
            aria-label="Xem hồ sơ"
            className="px-2"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Award size={18} />}
            onClick={() => handleOpenCompetency(record)}
            aria-label="Cập nhật năng lực"
            className="px-2"
          />
        </div>
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Quản lý nhân sự"
      expandedMenus={["Hệ thống"]}
      breadcrumb={[{ label: 'Hệ thống' }, { label: 'Quản lý nhân sự' }]}
      userName="Admin Hệ Thống"
      userRole="Quản trị viên"
    >
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-[32px] font-bold text-[#121C2C]">Quản lý nhân sự</h1>
          <p className="text-gray-500 text-sm mt-1">
            Xem và cập nhật hồ sơ năng lực, chứng chỉ, ngôn ngữ của nhân viên.
          </p>
        </div>

        <div className="bg-white p-5 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[280px]">
            <SearchInput
              placeholder="Tìm theo tên, mã nhân viên, email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="w-[220px]">
            <Select
              options={roleOptions}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Vai trò"
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
          <Table<Staff>
            columns={columns}
            dataSource={paginatedStaff}
            rowKey="id"
            emptyText="Không tìm thấy nhân viên phù hợp"
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="text-sm text-gray-500">
            Hiển thị {paginatedStaff.length} trong số {totalStaffCount} nhân viên
          </div>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={totalStaffCount}
            onChange={setPage}
          />
        </div>
      </div>

      <StaffProfileModal
        isOpen={profileModal.open}
        onClose={() => setProfileModal({ open: false, staff: null })}
        staff={profileModal.staff}
      />

      <CompetencyModal
        isOpen={competencyModal.open}
        onClose={() => setCompetencyModal({ open: false, staff: null })}
        staff={competencyModal.staff}
      />
    </MainLayout>
  );
};

export default StaffList;
