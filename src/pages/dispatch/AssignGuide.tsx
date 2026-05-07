import React, { useState } from 'react';
import MainLayout from '../../components/layouts/MainLayout';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { Pagination } from '../../components/ui/Pagination';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { Plus, MoreVertical } from 'lucide-react';
import { mockToursNeedGuide, type TourNeedGuide } from './mockData';
import AssignGuideModal from './AssignGuideModal';
import { dispatchService } from '../../services/dispatch';
import type { NhanVienResponse } from '../../services/dispatch';
import { useAuth } from '../../context/AuthContext';
import { hasAccess } from '../../config/rolePermissions';

const AssignGuide: React.FC = () => {
  const [data, setData] = useState<TourNeedGuide[]>(mockToursNeedGuide);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<TourNeedGuide | null>(null);
  const [availableGuides, setAvailableGuides] = useState<NhanVienResponse[]>([]);

  const { user } = useAuth();

  React.useEffect(() => {
    if (!hasAccess(user?.maVaiTro, 'dispatch')) return;
    // TODO: Waiting for backend API.
    // Hiện tại backend chưa hỗ trợ API riêng (hoặc thông tin trong danhSach_5 chưa đủ dữ liệu cho requireSkills, etc.)
    // nên tạm thời giữ mock data cho phần danh sách Tour cần phân bổ.
  }, [user]);

  const openAssignModal = async (tour: TourNeedGuide, _mode: 'assign' | 'replace' = 'assign') => {
    if (!hasAccess(user?.maVaiTro, 'dispatch')) return;
    setSelectedTour(tour);
    setModalOpen(true);
    try {
      const res = await dispatchService.hdvKhaDung();
      setAvailableGuides(res || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssign = async (tourId: string, guideId: string) => {
    try {
      await dispatchService.phanCong({ maTourThucTe: tourId, maNhanVien: guideId });
      const guide = availableGuides.find(g => g.maNhanVien === guideId);
      if (!guide) return;
      
      setData(prev => prev.map(t => 
        t.id === tourId ? { ...t, status: 'assigned', assignedGuide: { id: guide.maNhanVien!, name: guide.hoTen! } } : t
      ));
      setModalOpen(false);
    } catch (error) {
      alert('Lỗi phân công. ' + (error instanceof Error ? error.message : ''));
    }
  };

  const filteredData = data.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.code.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const columns: Column<TourNeedGuide>[] = [
    {
      key: 'tour',
      title: 'Tuyến Tour',
      render: (record) => (
        <div className="flex flex-col">
          <span className="font-bold text-[#00668A]">{record.code}</span>
          <span className="font-semibold text-gray-800 line-clamp-1">{record.name}</span>
          {record.location && <span className="text-xs text-gray-500">{record.location}</span>}
        </div>
      ),
    },
    {
      key: 'time',
      title: 'Thời gian & Lịch trình',
      render: (record) => (
        <div className="flex flex-col text-sm">
          <span className="text-gray-800 font-medium">{record.startDate} - {record.endDate}</span>
          <span className="text-gray-500">[{record.duration}] - {record.passengers} khách</span>
        </div>
      ),
    },
    {
      key: 'skills',
      title: 'Yêu cầu kỹ năng',
      render: (record) => (
        <div className="flex flex-wrap gap-1 max-w-[200px]">
          {record.requiredSkills.map((s, idx) => (
            <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px] border border-gray-200">
              {s}
            </span>
          ))}
        </div>
      )
    },
    {
      key: 'status',
      title: 'Trạng thái',
      align: 'center',
      render: (record) => (
        <Badge 
          label={record.status === 'assigned' ? 'Đã phân bổ' : 'Chờ phân bổ'} 
          variant={record.status === 'assigned' ? 'success' : 'error'} 
        />
      ),
    },
    {
      key: 'actions',
      title: 'Hành động',
      align: 'right',
      render: (record) => {
        if (record.status === 'pending') {
          return (
            <Button 
              variant="primary" 
              size="sm" 
              icon={<Plus size={16} />} 
              onClick={() => openAssignModal(record, 'assign')}
            >
              Phân bổ ngay
            </Button>
          );
        }
        
        // Assigned
        const guide = record.assignedGuide;
        return (
          <div className="flex items-center justify-end gap-3">
            {guide && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#E8F6FF] text-[#00668A] flex items-center justify-center font-bold text-xs">
                  {guide.name.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-bold text-gray-800">{guide.name}</p>
                </div>
              </div>
            )}
            <Button variant="ghost" size="sm" icon={<MoreVertical size={16} />} onClick={() => openAssignModal(record, 'replace')} />
          </div>
        );
      },
    },
  ];

  return (
    <MainLayout
      activeMenu="Phân công HDV"
      expandedMenus={['Điều phối Hướng dẫn viên']}
      breadcrumb={[
        { label: 'Điều phối Hướng dẫn viên' },
        { label: 'Phân công HDV' },
      ]}
    >
      <div className="flex flex-col h-full gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[32px] font-bold text-[#121C2C]">Danh sách chờ phân bổ</h1>
          <p className="text-gray-500 text-sm">Quản lý lịch trình và phân bổ nhân sự dẫn đoàn.</p>
        </div>

        {/* Dashboard KPIs
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E1F1FF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF4F4] text-[#BA1A1A] flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Cần phân bổ gấp</p>
              <p className="text-2xl font-bold text-[#121C2C]">12</p>
              <p className="text-[11px] text-gray-400">Trong 48h tới</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E1F1FF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">HDV Sẵn sàng</p>
              <p className="text-2xl font-bold text-[#121C2C]">45</p>
              <p className="text-[11px] text-gray-400">Trên tổng số 120</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E1F1FF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#FFF8E6] text-[#D97706] flex items-center justify-center">
              <Bus size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tour đang chạy</p>
              <p className="text-2xl font-bold text-[#121C2C]">28</p>
              <p className="text-[11px] text-gray-400">Hôm nay</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E1F1FF] flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#F4F9FF] text-[#00668A] flex items-center justify-center">
              <Star size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Tỷ lệ hài lòng</p>
              <p className="text-2xl font-bold text-[#121C2C]">4.8</p>
              <p className="text-[11px] text-gray-400">Trung bình tháng</p>
            </div>
          </div>
        </div> */}

        {/* Toolbar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#E1F1FF] flex flex-wrap gap-4 items-center justify-between">
          <div className="w-[300px]">
            <SearchInput 
              placeholder="Tìm mã hoặc tên tour cần phân bổ..." 
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <Button variant="secondary">Lọc nâng cao</Button>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl shadow-sm border border-[#E1F1FF] flex-1 overflow-hidden">
          <Table<TourNeedGuide>
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

      <AssignGuideModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tour={selectedTour}
        onAssign={handleAssign}
        availableGuides={availableGuides}
      />
    </MainLayout>
  );
};

export default AssignGuide;