import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Pagination } from '../../components/ui/Pagination';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { Search, RotateCcw, Eye, UserPlus, Star } from 'lucide-react';
import type { Guide } from './mockData';
import { useNavigate } from 'react-router-dom';
import GuideProfileModal from './GuideProfileModal';
import { dispatchService } from '../../services/dispatch';
import type { NhanVienResponse } from '../../services/dispatch';
import { accountsService } from '../../services/system/accounts';
import { tourInstanceService } from '../../services/tour-instance';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';
import { formatApiError, unwrapPageContent } from '../../utils/apiHelpers';
import { hrService } from '../../services/system/hr';
import type { NangLucResponse } from '../../services/system/hr';
import { mapEmployeeStatus } from '../../utils/statusMapping';

const parseCommaList = (value?: string): string[] => {
  if (!value) return [];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
};

const mapNhanVienToGuide = (g: NhanVienResponse, nangLuc?: NangLucResponse): Guide => ({
  id: g.maNhanVien || '',
  code: g.maNhanVien || '',
  name: g.hoTen || g.tenDangNhap || '',
  phone: g.soDienThoai || '',
  languages: parseCommaList(nangLuc?.ngonNgu).length > 0 ? parseCommaList(nangLuc?.ngonNgu) : ['Tiếng Việt'],
  skills: [...parseCommaList(nangLuc?.chuyenMon), ...parseCommaList(nangLuc?.chungChi)],
  rating: nangLuc?.danhGia ?? 0,
  status: g.trangThaiLamViec || 'Không xác định',
  completedTours: nangLuc?.soDanhGia ?? 0,
});

const GuideList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const { user } = useAuth();
  const isAdmin = user?.maVaiTro === 'ADMIN';

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'dispatch')) return;
    setLoading(true);
    setError(null);
    try {
      let guides: NhanVienResponse[] = [];

      if (isAdmin) {
        const res = await accountsService.danhSachNhanVien({ maVaiTro: 'HDV', page: 0, size: 200 });
        guides = unwrapPageContent(res).filter((nv) => nv.maVaiTro === 'HDV' || nv.maVaiTro === 'ROLE_HDV');
      } else {
        const tours = await tourInstanceService.danhSach({ trangThai: 'CHO_KICH_HOAT', page: 0, size: 1 });
        const refTour = unwrapPageContent(tours)[0];
        if (!refTour?.maTourThucTe) {
          setError('Chưa có tour thực tế để tham chiếu. Vui lòng tạo tour trước.');
          setData([]);
          return;
        }
        guides = await dispatchService.hdvKhaDung({ maTourThucTe: refTour.maTourThucTe });
      }

      const mappedGuides = await Promise.all(
        guides.map(async (g) => {
          try {
            if (!g.maNhanVien) return mapNhanVienToGuide(g);
            const nangLuc = await hrService.layNangLuc(g.maNhanVien);
            return mapNhanVienToGuide(g, nangLuc);
          } catch (e) {
            return mapNhanVienToGuide(g);
          }
        })
      );

      setData(mappedGuides);
    } catch (err: unknown) {
      setError(formatApiError(err, 'Lỗi khi tải danh sách HDV'));
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    getAll();
  }, [user]);

  const openProfileModal = (guide: Guide) => {
    setSelectedGuide(guide);
    setProfileModalOpen(true);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterStatus('all');
    setFilterSkill('all');
    setPage(1);
    getAll();
  };

  const filteredData = data.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || g.status === filterStatus;
    const matchesSkill = filterSkill === 'all' || g.skills.includes(filterSkill);
    return matchesSearch && matchesStatus && matchesSkill;
  });

  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Guide>[] = [
    {
      key: 'code',
      title: 'Mã HDV',
      width: '15%',
      render: (record) => <span className="font-bold text-[#00668A]">{record.code}</span>,
    },
    {
      key: 'guide',
      title: 'Hướng dẫn viên',
      width: '25%',
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E8F6FF] text-[#00668A] flex items-center justify-center font-bold text-sm">
            {record.name.charAt(0)}
          </div>
          <span className="font-bold text-[#121C2C]">{record.name}</span>
        </div>
      ),
    },
    {
      key: 'phone',
      title: 'Số điện thoại',
      width: '15%',
      render: (record) => <span className="text-sm font-medium text-gray-700">{record.phone || '—'}</span>,
    },

    {
      key: 'rating',
      title: 'Đánh giá',
      width: '15%',
      render: (record) => (
        <div className="flex items-center gap-1.5 text-sm">
          {record.rating > 0 ? (
            <>
              <Star size={16} className="text-amber-400" fill="currentColor" />
              <span className="font-bold text-gray-800">{record.rating.toFixed(1)}</span>
              <span className="text-gray-500 text-xs">({record.completedTours})</span>
            </>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Trạng thái',
      width: '15%',
      render: (record) => {
        const { label, variant } = mapEmployeeStatus(record.status);
        return <Badge label={label} variant={variant} />;
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      width: '15%',
      render: (record) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" icon={<Eye size={18} />} onClick={() => openProfileModal(record)} />
          <Button
            variant="ghost"
            size="sm"
            icon={<UserPlus size={18} />}
            onClick={() => navigate('/dispatch/assign')}
            className="text-[#00668A]"
            title="Chuyển sang Phân công"
          />
        </div>
      ),
    },
  ];

  return (
    <MainLayout
      activeMenu="Danh Sách HDV"
      expandedMenus={['Điều phối Hướng dẫn viên']}
      breadcrumb={[{ label: 'Điều phối Hướng dẫn viên' }, { label: 'Danh Sách HDV' }]}
    >
      <div className="flex flex-col h-full gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[#121C2C]">Danh sách Hướng dẫn viên</h1>
          <p className="text-gray-500 text-sm">
            Quản lý và theo dõi đội ngũ hướng dẫn viên
          </p>
        </div>

        <div className="bg-white p-5 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <SearchInput placeholder="Tìm tên, mã HDV..." value={searchTerm} onChange={setSearchTerm} />
          </div>
          <div className="w-[180px]">
            <Select
              options={[
                { label: 'Tất cả trạng thái', value: 'all' },
                { label: 'Sẵn sàng', value: 'HOAT_DONG' },
                { label: 'Đang đi tour', value: 'BAN' },
                { label: 'Đang nghỉ', value: 'NGHI' },
              ]}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Trạng thái"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" icon={<RotateCcw size={18} />} onClick={handleReset}>
              Làm mới
            </Button>
            <Button variant="primary" icon={<Search size={18} />} onClick={() => setPage(1)}>
              Tìm kiếm
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 relative min-h-[300px] overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00668A]"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full text-red-500 p-8">{error}</div>
          ) : (
            <Table<Guide> columns={columns} dataSource={paginatedData} rowKey="id" emptyText="Không có HDV" />
          )}
        </div>

        <Pagination current={page} pageSize={pageSize} total={filteredData.length} onChange={setPage} />
      </div>

      <GuideProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        guide={selectedGuide}
      />
    </MainLayout>
  );
};

export default GuideList;
