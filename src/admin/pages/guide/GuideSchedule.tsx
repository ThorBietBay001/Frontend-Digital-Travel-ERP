import React from 'react';
import { CalendarDays, RefreshCcw, Route } from 'lucide-react';
import MainLayout from '../../components/layouts/MainLayout';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Table } from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import { dispatchService } from '../../services/dispatch';
import type { PhanCongResponse } from '../../services/dispatch';

const statusMeta: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }> = {
  ACTIVE: { label: 'Đang phân công', variant: 'success' },
  COMPLETED: { label: 'Hoàn thành', variant: 'info' },
  CANCELLED: { label: 'Đã hủy', variant: 'error' },
};

const GuideSchedule: React.FC = () => {
  const [assignments, setAssignments] = React.useState<PhanCongResponse[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  const loadAssignments = React.useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dispatchService.tourCuaToi();
      setAssignments(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải lịch công tác.');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadAssignments();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadAssignments]);

  const columns: Column<PhanCongResponse>[] = [
    {
      key: 'tour',
      title: 'Tour được phân công',
      render: (record) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[#00668A]">{record.maTourThucTe || 'Chưa có mã tour'}</span>
          <span className="font-semibold text-[#121C2C]">{record.tenTour || 'Chưa có tên tour'}</span>
        </div>
      ),
    },
    {
      key: 'assignment',
      title: 'Mã phân công',
      render: (record) => <span className="text-sm font-medium text-gray-700">{record.maPhanCong || '-'}</span>,
    },
    {
      key: 'date',
      title: 'Ngày phân công',
      render: (record) => <span className="text-sm text-gray-600">{record.ngayPhanCong || '-'}</span>,
    },
    {
      key: 'status',
      title: 'Trạng thái',
      align: 'center',
      render: (record) => {
        const meta = statusMeta[record.trangThai || ''] ?? { label: record.trangThai || 'Không rõ', variant: 'neutral' as const };
        return <Badge label={meta.label} variant={meta.variant} />;
      },
    },
  ];

  return (
    <MainLayout
      activeMenu="Lịch công tác của tôi"
      breadcrumb={[{ label: 'Hướng dẫn viên' }, { label: 'Lịch công tác của tôi' }]}
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 rounded-[20px] border border-[#E1F1FF] bg-white p-6 shadow-[0px_4px_20px_rgba(137,212,255,0.08)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#E8F6FF] text-[#00668A]">
              <CalendarDays size={24} aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-[32px] font-bold text-[#121C2C]">Lịch công tác của tôi</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
                Theo dõi các tour đã được điều hành phân công. Các thao tác điểm danh, báo cáo sự cố và chi phí chỉ nên thực hiện trong tour đang chạy.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="secondary"
            icon={<RefreshCcw size={18} aria-hidden="true" />}
            onClick={loadAssignments}
            disabled={loading}
          >
            Tải lại
          </Button>
        </div>

        {error && (
          <div role="alert" className="rounded-[12px] border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-[#BA1A1A]">
            {error}
          </div>
        )}

        <div className="rounded-[16px] border border-[#E1F1FF] bg-white shadow-[0px_4px_20px_rgba(137,212,255,0.08)]">
          {loading ? (
            <div className="p-8 text-center text-sm font-medium text-gray-500">Đang tải lịch công tác...</div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F9FF] text-[#00668A]">
                <Route size={26} aria-hidden="true" />
              </div>
              <h2 className="text-lg font-bold text-[#121C2C]">Chưa có tour được phân công</h2>
              <p className="max-w-md text-sm leading-6 text-gray-600">
                Khi điều hành phân công tour mới, lịch công tác sẽ xuất hiện tại đây để bạn chuẩn bị trước khi khởi hành.
              </p>
            </div>
          ) : (
            <Table<PhanCongResponse>
              columns={columns}
              dataSource={assignments}
              rowKey="maPhanCong"
            />
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default GuideSchedule;
