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
import { type Guide } from './mockData';
import { useNavigate } from 'react-router-dom';
import GuideProfileModal from './GuideProfileModal';
import { dispatchService } from '../../services/dispatch';
import type { NhanVienResponse } from '../../services/dispatch';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const GuideList: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Guide[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLang, setFilterLang] = useState('all');
  const [filterSkill, setFilterSkill] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);

  const { user } = useAuth();

  const getAll = async () => {
    if (!hasAccess(user?.maVaiTro, 'dispatch')) return;
    try {
      const res = await dispatchService.hdvKhaDung();
      const mapped = (res || []).map((g: NhanVienResponse): Guide => ({
        id: g.maNhanVien || '',
        code: g.maNhanVien || '',
        name: g.hoTen || g.tenDangNhap || '',
        languages: ['Tiếng Việt'], // Mock
        skills: ['Trekking'], // Mock
        rating: 5.0,
        status: g.trangThaiLamViec === 'AVAILABLE' ? 'available' : g.trangThaiLamViec === 'BUSY' ? 'busy' : 'resting',
        completedTours: 0,
      }));
      setData(mapped);
    } catch(err) {
      console.error(err);
    }
  };

  React.useEffect(() => { getAll(); }, [user]);

  const openProfileModal = (guide: Guide) => {
    setSelectedGuide(guide);
    setProfileModalOpen(true);
  };

  const handleReset = () => {
    setSearchTerm('');
    setFilterLang('all');
    setFilterSkill('all');
  };

  const filteredData = data.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          g.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLang = filterLang === 'all' || g.languages.some(l => l.includes(filterLang));
    const matchesSkill = filterSkill === 'all' || g.skills.includes(filterSkill);

    return matchesSearch && matchesLang && matchesSkill;
  });
  
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<Guide>[] = [
    {
      key: 'guide',
      title: 'Hướng dẫn viên',
      render: (record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#E8F6FF] text-[#00668A] flex items-center justify-center font-bold text-sm">
            {record.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#121C2C]">{record.name}</span>
            <span className="text-xs text-gray-500">{record.code}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'languages',
      title: 'Ngôn ngữ',
      render: (record) => (
        <span className="text-sm text-gray-700">{record.languages.join(', ')}</span>
      ),
    },
    {
      key: 'skills',
      title: 'Thế mạnh',
      render: (record) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {record.skills.map((s, idx) => (
            <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] border border-gray-200">
              {s}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'rating',
      title: 'Đánh giá',
      render: (record) => (
        <div className="flex items-center gap-1.5 text-sm">
          <Star size={14} className="text-amber-400" fill="currentColor" />
          <span className="font-bold text-gray-800">{record.rating}</span>
          <span className="text-xs text-gray-500">({record.completedTours} tours)</span>
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      align: 'center',
      render: (record) => {
        if (record.status === 'available') return <Badge label="Sẵn sàng" variant="success" />;
        if (record.status === 'busy') return <Badge label="Đang đi tour" variant="warning" />;
        return <Badge label="Đang nghỉ" variant="neutral" />;
      },
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'right',
      render: (record) => (
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<Eye size={18} />} 
            onClick={() => openProfileModal(record)} 
          />
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
      breadcrumb={[
        { label: 'Điều phối Hướng dẫn viên' },
        { label: 'Danh Sách HDV' },
      ]}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[#121C2C]">Danh sách Hướng dẫn viên</h1>
          <p className="text-gray-500 text-sm">Quay lại danh sách tổng hợp tất cả Hướng dẫn viên của công ty.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E1F1FF] flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <SearchInput 
              placeholder="Tìm tên, mã HDV..." 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          
          <div className="w-[180px]">
            <Select 
              options={[
                { label: 'Tất cả ngôn ngữ', value: 'all' },
                { label: 'Tiếng Việt', value: 'Tiếng Việt' },
                { label: 'Tiếng Anh', value: 'Tiếng Anh' },
                { label: 'Tiếng Trung', value: 'Tiếng Trung' },
              ]}
              value={filterLang}
              onChange={setFilterLang}
              placeholder="Ngôn ngữ"
            />
          </div>

          <div className="w-[180px]">
            <Select 
              options={[
                { label: 'Tất cả kỹ năng', value: 'all' },
                { label: 'Trekking', value: 'Trekking' },
                { label: 'Lặn biển', value: 'Lặn biển' },
                { label: 'Sơ cứu', value: 'Sơ cứu' },
                { label: 'Văn hóa', value: 'Văn hóa' },
                { label: 'Chụp ảnh', value: 'Chụp ảnh' }
              ]}
              value={filterSkill}
              onChange={setFilterSkill}
              placeholder="Kỹ năng/Thế mạnh"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" icon={<RotateCcw size={18} />} onClick={handleReset}>
              Làm mới
            </Button>
            <Button variant="primary" icon={<Search size={18} />}>
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E1F1FF] flex-1 overflow-hidden">
          <Table<Guide>
            columns={columns}
            dataSource={paginatedData}
            rowKey="id"
          />
        </div>

        <Pagination 
          current={page}
          pageSize={pageSize}
          total={filteredData.length}
          onChange={setPage}
        />
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