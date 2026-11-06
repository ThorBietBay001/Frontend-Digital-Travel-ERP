import React, { useState, useEffect } from 'react';
import MainLayout from '../../../components/layouts/MainLayout';
import { Table } from '../../../components/ui/Table';
import type { Column } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
// Import Badge removed
import { Button } from '../../../components/ui/Button';
import { SearchInput } from '../../../components/ui/SearchInput';
import { Select } from '../../../components/ui/Select';
import { logsService } from '../../../services/system/logs';
import { RotateCcw, Plus, Edit2, Trash2, Download } from 'lucide-react';

const SystemLogList: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  // const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const pageSize = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await logsService.nhatKyHeThong({ 
        page: page - 1, 
        size: pageSize,
        hanhDong: actionFilter !== 'all' ? actionFilter : undefined,
        // (add search params here if API supports it, for now just fetch)
      });
      const content = response?.content || (response as any)?.data || [];
      setLogs(content);
      setTotalElements(response?.totalElements || 0);
    } catch (error) {
      console.error('Failed to fetch logs', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const handleRefresh = () => {
    setSearchTerm('');
    setActionFilter('all');
    setPage(1);
    fetchLogs();
  };

  const parseAction = (actionStr: string) => {
    const raw = (actionStr || '').toUpperCase();
    if (raw.includes('THEM') || raw.includes('POST')) return { label: 'Thêm', variant: 'success', icon: <Plus size={14} className="mr-1" /> };
    if (raw.includes('XOA') || raw.includes('DELETE')) return { label: 'Xóa', variant: 'error', icon: <Trash2 size={14} className="mr-1" /> };
    if (raw.includes('SUA') || raw.includes('CAP_NHAT') || raw.includes('PUT') || raw.includes('PATCH')) return { label: 'Cập nhật', variant: 'warning', icon: <Edit2 size={14} className="mr-1" /> };
    if (raw.includes('XUAT') || raw.includes('EXPORT') || raw.includes('POWER_BI')) return { label: 'Xuất dữ liệu PowerBI', variant: 'info', icon: <Download size={14} className="mr-1" /> };
    return { label: actionStr, variant: 'info', icon: null };
  };

  const columns: Column<any>[] = [
    {
      key: 'thoiGian',
      title: 'THỜI GIAN',
      render: (record) => {
        const timeStr = record.thoiGian || record.thoi_gian;
        if (!timeStr) return <span>-</span>;
        const date = new Date(timeStr);
        const time = date.toLocaleTimeString('vi-VN', { hour12: false });
        const day = date.toLocaleDateString('vi-VN');
        return (
          <div className="flex flex-col text-sm">
            <span className="font-semibold text-gray-800">{time}</span>
            <span className="text-gray-500 text-xs">{day}</span>
          </div>
        );
      },
    },
    {
      key: 'nguoiThucHien',
      title: 'NGƯỜI THỰC HIỆN',
      render: (record) => {
        const user = record.taiKhoan || record.tai_khoan;
        const name = user?.ho_ten || user?.tenDangNhap || record.maTaiKhoan || record.ma_tai_khoan || 'Unknown';
        const code = user?.ma_tai_khoan || record.maTaiKhoan || record.ma_tai_khoan || '';
        const initial = name.charAt(0).toUpperCase();
        
        let bgClass = 'bg-[#E8F6FF] text-[#00668A]';
        if (name.toLowerCase().includes('ketoan')) bgClass = 'bg-emerald-100 text-emerald-700';
        else if (name.toLowerCase().includes('hdv')) bgClass = 'bg-cyan-100 text-cyan-700';

        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${bgClass}`}>
              {initial}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 text-sm">{name}</span>
              <span className="text-gray-500 text-xs uppercase">{code}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'hanhDong',
      title: 'HÀNH ĐỘNG',
      render: (record) => {
        const actionInfo = parseAction(record.hanhDong || record.hanh_dong);
        let badgeClass: string;
        if (actionInfo.variant === 'success') badgeClass = 'bg-emerald-50 text-emerald-600 border border-emerald-200';
        else if (actionInfo.variant === 'warning') badgeClass = 'bg-purple-50 text-purple-600 border border-purple-200';
        else if (actionInfo.variant === 'error') badgeClass = 'bg-red-50 text-red-600 border border-red-200';
        else badgeClass = 'bg-blue-50 text-blue-600 border border-blue-200';

        return (
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badgeClass}`}>
            {actionInfo.icon}
            {actionInfo.label}
          </div>
        );
      },
    },
    {
      key: 'chiTiet',
      title: 'CHI TIẾT',
      render: (record) => {
        const doiTuong = record.doiTuong || record.doi_tuong || '';
        const maDoiTuong = record.maDoiTuong || record.ma_doi_tuong || '';
        let display = `${doiTuong} ${maDoiTuong}`.trim();
        // Giả lập đường dẫn hiển thị nếu là CRUD chung
        if (!display.includes('/') && !display.includes('_')) {
           display = `/api/${doiTuong}/${maDoiTuong}`.toLowerCase();
        }
        return <span className="text-gray-600 text-sm truncate max-w-[200px] block" title={display}>{display}</span>;
      },
    },
  ];

  const actionOptions = [
    { value: 'all', label: 'Tất cả hành động' },
    { value: 'THEM', label: 'Thêm' },
    { value: 'CAP_NHAT', label: 'Cập nhật' },
    { value: 'XOA', label: 'Xóa' },
  ];

  return (
    <MainLayout
      activeMenu="Nhật ký hệ thống"
      expandedMenus={["Hệ thống"]}
      breadcrumb={[{ label: 'Hệ thống' }, { label: 'Nhật ký hệ thống' }]}
    >
      <div className="flex flex-col gap-6 h-full">
        <h1 className="text-[32px] font-bold text-[#121C2C]">Nhật ký hệ thống</h1>
        
        <div className="bg-white p-5 rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[280px]">
            <SearchInput
              placeholder="Tìm kiếm theo tên, email, username, SĐT..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="w-[200px]">
            <Select
              options={actionOptions}
              value={actionFilter}
              onChange={setActionFilter}
              placeholder="Tất cả hành động"
            />
          </div>
          <Button
            variant="secondary"
            icon={<RotateCcw size={18} />}
            onClick={handleRefresh}
            className="text-[#00668A] border-[#C5EAFF] bg-[#F4F9FF] hover:bg-[#E8F6FF]"
          >
            Làm mới
          </Button>
        </div>

        <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] flex-1 overflow-x-auto relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
              <div className="w-8 h-8 border-4 border-[#00668A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <Table<any>
            columns={columns}
            dataSource={logs}
            rowKey={(record) => record.maNhatKyHeThong || record.ma_nhat_ky_he_thong || Math.random().toString()}
            emptyText="Chưa có nhật ký hệ thống nào"
          />
        </div>

        {totalElements > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div>
              Hiển thị <strong>{(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalElements)}</strong> trong số <strong>{totalElements}</strong> bản ghi
            </div>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={totalElements}
              onChange={setPage}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SystemLogList;
