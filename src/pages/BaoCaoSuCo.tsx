import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Passenger, Tour, BaoCaoSuCo as IncidentType } from '../types';
import { hdvService } from '../services/hdvService';

interface IncidentReportProps {
  maTour?: string;
  currentTour?: Tour | null;
  pastTours?: Tour[];
  passengers: Passenger[];
  incidents: IncidentType[];
  setIncidents: React.Dispatch<React.SetStateAction<IncidentType[]>>;
}

const incidentTypes = [
  { id: 'Y tế', label: 'Y tế', apiValue: 'Y_TE' },
  { id: 'Thời tiết', label: 'Thời tiết', apiValue: 'THOI_TIET' },
  { id: 'Phương tiện', label: 'Phương tiện', apiValue: 'PHUONG_TIEN' },
  { id: 'Ăn uống', label: 'Ăn uống', apiValue: 'AN_UONG' },
  { id: 'Khác', label: 'Khác', apiValue: 'KHAC' }
];

const PAGE_SIZE = 4;
const REPORT_WINDOW_DAYS = 3;

const getIncidentTypeMeta = (type: string) => {
  const normalized = type.toUpperCase();
  const label = incidentTypes.find(item => item.id === type || item.apiValue === normalized)?.label || type;
  if (normalized === 'Y_TE' || type === 'Y tế') {
    return { label, className: 'bg-rose-50 text-rose-600 border-rose-100' };
  }
  if (normalized === 'THOI_TIET' || type === 'Thời tiết') {
    return { label, className: 'bg-sky-50 text-sky-600 border-sky-100' };
  }
  return { label, className: 'bg-slate-50 text-slate-600 border-slate-100' };
};

const isMedicalIncident = (type: string) => {
  const normalized = type.toUpperCase();
  return normalized === 'Y_TE' || type === 'Y tế';
};


const formatIncidentTime = (time?: string) => {
  if (!time) return 'Chưa cập nhật';
  const date = new Date(time);
  if (Number.isNaN(date.getTime())) return time;
  const formattedTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return `${formattedTime} - ${formattedDate}`;
};

const formatAllergyNote = (allergy: unknown): string => {
  const value = String(allergy || '').trim();
  if (!value) return '';
  const detail = value.replace(/^dị ứng\s*:?\s*/i, '').trim() || value;
  return `Dị ứng ${detail.charAt(0).toLocaleLowerCase('vi-VN')}${detail.slice(1)}`;
};

const buildHealthNotes = (p: any): string => {
  return [p.ghiChuYTe, formatAllergyNote(p.diUng)]
    .map((note) => String(note || '').trim())
    .filter(Boolean)
    .join(' | ');
};

const mapPassenger = (p: any): Passenger => ({
  code: p.maKhachHang || p.maNguoiDongHanh,
  listKey: p.maDatTour
    ? `${p.maDatTour}:${p.loaiKhach || ''}:${p.maKhachHang || p.maNguoiDongHanh}`
    : undefined,
  maKhachHang: p.maKhachHang || undefined,
  maNguoiDongHanh: p.maNguoiDongHanh || undefined,
  loaiKhach: p.loaiKhach,
  name: p.hoTenKhachHang || p.hoTen,
  phone: p.soDienThoai || 'N/A',
  rank: p.hangThanhVien || 'THANH_VIEN',
  healthNotes: buildHealthNotes(p),
  status: p.trangThai || 'CHUA_DIEM_DANH',
  greenPoints: p.diemXanh || 0
});

const isTourInReportWindow = (tour: Tour) => {
  if (!tour.endDate) return false;
  const endDate = new Date(tour.endDate);
  if (Number.isNaN(endDate.getTime())) return false;
  const deadline = new Date(endDate);
  deadline.setDate(deadline.getDate() + REPORT_WINDOW_DAYS);
  deadline.setHours(23, 59, 59, 999);
  return new Date() <= deadline;
};

interface PaginationTabsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const getPaginationItems = (totalPages: number, currentPage: number) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages = Array.from(new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]))
    .filter(page => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  return pages.reduce<(number | 'ellipsis')[]>((items, page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) items.push('ellipsis');
    items.push(page);
    return items;
  }, []);
};

function PaginationTabs({ currentPage, totalPages, onPageChange }: PaginationTabsProps) {
  if (totalPages <= 1) return null;
  const pageItems = getPaginationItems(totalPages, currentPage);

  return (
    <nav aria-label="Phân trang" className="mx-auto mt-1 flex w-fit items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
        aria-label="Trang trước"
      >
        <ChevronLeft size={14} />
      </button>
      {pageItems.map((page, index) => page === 'ellipsis' ? (
        <span key={`ellipsis-${index}`} className="size-8 rounded-lg border border-slate-100 bg-white text-[11px] font-semibold text-slate-400 flex items-center justify-center">
          ...
        </span>
      ) : (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={`size-8 rounded-lg border bg-white text-[11px] font-semibold transition active:scale-95 ${currentPage === page
            ? 'border-sky-500 bg-sky-50 text-sky-700 ring-1 ring-sky-500'
            : 'border-slate-100 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
            }`}
          aria-label={`Trang ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="size-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 active:scale-95 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
        aria-label="Trang sau"
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  );
}

export default function BaoCaoSuCo({
  maTour,
  currentTour,
  pastTours = [],
  passengers,
  incidents,
  setIncidents
}: IncidentReportProps) {
  const [incidentForm, setIncidentForm] = useState({
    type: 'Y tế',
    severity: 'Thấp' as 'Thấp' | 'Cao',
    passengerCode: '',
    description: '',
    treatment: '',
    result: ''
  });
  const [sosActive, setSosActive] = useState(false);
  const [isIncidentTypeOpen, setIsIncidentTypeOpen] = useState(false);
  const [isIncidentPassengerOpen, setIsIncidentPassengerOpen] = useState(false);
  const [incidentToast, setIncidentToast] = useState<string | null>(null);
  const [expandedIncidents, setExpandedIncidents] = useState<Record<string, boolean>>({});
  const [incidentPage, setIncidentPage] = useState(1);
  const reportableTours = useMemo(() => {
    const tours = [
      ...(currentTour ? [currentTour] : []),
      ...pastTours.filter(isTourInReportWindow)
    ];
    return tours.filter((tour, index, list) => list.findIndex(item => item.code === tour.code) === index);
  }, [currentTour, pastTours]);
  const [selectedTourCode, setSelectedTourCode] = useState(maTour || reportableTours[0]?.code || '');
  const [selectedTourPassengers, setSelectedTourPassengers] = useState<Passenger[]>(passengers);
  const activePassengers = useMemo(
    () => selectedTourPassengers.filter(p => p.status === 'DA_DIEM_DANH'),
    [selectedTourPassengers]
  );
  const totalIncidentPages = Math.max(1, Math.ceil(incidents.length / PAGE_SIZE));
  const paginatedIncidents = useMemo(
    () => incidents.slice((incidentPage - 1) * PAGE_SIZE, incidentPage * PAGE_SIZE),
    [incidentPage, incidents]
  );

  useEffect(() => {
    if (incidentForm.passengerCode && !activePassengers.some(p => p.code === incidentForm.passengerCode)) {
      setIncidentForm(prev => ({ ...prev, passengerCode: '' }));
    }
  }, [activePassengers, incidentForm.passengerCode]);

  useEffect(() => {
    if (maTour) {
      setSelectedTourCode(maTour);
      return;
    }
    if (reportableTours.length > 0 && !reportableTours.some(tour => tour.code === selectedTourCode)) {
      setSelectedTourCode(reportableTours[0].code);
    }
  }, [maTour, reportableTours]);

  useEffect(() => {
    setIncidentForm(prev => ({ ...prev, passengerCode: '' }));
    if (!selectedTourCode) {
      setSelectedTourPassengers([]);
      return;
    }
    if (selectedTourCode === maTour) {
      setSelectedTourPassengers(passengers);
      return;
    }

    let cancelled = false;
    hdvService.layDanhSachDoan(selectedTourCode)
      .then((res) => {
        if (!cancelled) {
          setSelectedTourPassengers((res?.data || []).map(mapPassenger));
        }
      })
      .catch(() => {
        if (!cancelled) setSelectedTourPassengers([]);
      });
    return () => {
      cancelled = true;
    };
  }, [maTour, passengers, selectedTourCode]);

  useEffect(() => {
    setIncidentPage(prev => Math.min(prev, totalIncidentPages));
  }, [totalIncidentPages]);

  const mapLoaiSuCo = (type: string) => {
    return incidentTypes.find(item => item.id === type)?.apiValue || 'KHAC';
  };

  const mapMucDo = (severity: string) => severity === 'Cao' ? 'SOS' : 'THAP';

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTourCode) {
      setIncidentToast('Lỗi: Không tìm thấy thông tin tour!');
      setTimeout(() => setIncidentToast(null), 4000);
      return;
    }

    const targetPassenger = activePassengers.find(p => p.code === incidentForm.passengerCode);
    const shouldAttachHealthNotes = Boolean(targetPassenger) && (isMedicalIncident(incidentForm.type) || Boolean(incidentForm.passengerCode));

    try {
      const data = {
        loaiSuCo: mapLoaiSuCo(incidentForm.type),
        mucDo: mapMucDo(incidentForm.severity),
        moTa: incidentForm.description,
        giaiPhap: incidentForm.treatment,
        ...(targetPassenger?.maNguoiDongHanh
          ? { maNguoiDongHanh: targetPassenger.maNguoiDongHanh }
          : targetPassenger?.maKhachHang
            ? { maKhachHang: targetPassenger.maKhachHang }
            : {})
      };

      const res = await hdvService.taoSuCo(selectedTourCode, data);

      if (res.data) {
        const i = res.data;
        const newReport: IncidentType = {
          id: i.maNhatKySuCo,
          tourCode: i.maTour || selectedTourCode,
          type: incidentForm.type,
          severity: i.mucDo === 'SOS' ? 'Cao' : 'Thấp',
          passengerName: targetPassenger ? targetPassenger.name : undefined,
          passengerCode: incidentForm.passengerCode || undefined,
          healthNotes: shouldAttachHealthNotes ? targetPassenger?.healthNotes : undefined,
          description: i.moTa || incidentForm.description,
          treatment: i.giaiPhap || incidentForm.treatment,
          result: i.giaiPhap || incidentForm.treatment,
          time: i.thoiGianBaoCao || new Date().toLocaleString('vi-VN').slice(0, 16)
        };

        setIncidents(prev => [newReport, ...prev]);
        setIncidentToast(`Đã gửi báo cáo sự cố ${newReport.id} thành công!`);

        setIncidentForm({
          type: 'Y tế',
          severity: 'Thấp',
          passengerCode: '',
          description: '',
          treatment: '',
          result: ''
        });
        setSosActive(false);
        setTimeout(() => setIncidentToast(null), 4000);
      }
    } catch (error) {
      console.error(error);
      setIncidentToast('Lỗi: Không thể gửi báo cáo sự cố!');
      setTimeout(() => setIncidentToast(null), 4000);
    }
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {incidentToast && (
        <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-2xl shadow-sm border border-emerald-200 flex items-center space-x-2 animate-slide-up">
          <CheckCircle size={16} className="text-emerald-500" />
          <p>{incidentToast}</p>
        </div>
      )}

      <div className="px-1 py-1">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider flex items-center">
              <AlertTriangle size={14} className="mr-1.5 text-rose-500" />
              Sổ tay sự cố y tế
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Chỉ cho phép báo cáo trong vòng 3 ngày</p>
          </div>
          <select
            value={selectedTourCode}
            onChange={(event) => setSelectedTourCode(event.target.value)}
            className="max-w-[120px] text-[10px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded font-mono font-bold border border-dashed border-sky-300 outline-none"
            aria-label="Chọn tour báo cáo sự cố"
          >
            {reportableTours.length === 0 && <option value="">N/A</option>}
            {reportableTours.map(tour => (
              <option key={tour.code} value={tour.code}>{tour.code}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-card p-4 rounded-3xl space-y-3">
        <form onSubmit={handleIncidentSubmit} className="space-y-3.5 text-xs">
          <div className="flex items-start space-x-4">
            <div className="w-[55%] relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 tracking-wider">Loại sự cố</label>
              <button
                type="button"
                onClick={() => setIsIncidentTypeOpen(!isIncidentTypeOpen)}
                className="w-full text-[11px] px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 outline-none hover:border-sky-300 focus:border-sky-400 transition h-[28px] flex items-center justify-between shadow-sm cursor-pointer"
              >
                <span>{incidentForm.type}</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isIncidentTypeOpen ? 'rotate-180' : ''}`} />
              </button>

              {isIncidentTypeOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsIncidentTypeOpen(false)}></div>
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl shadow-xl py-1 animate-slide-up text-[11px] font-bold text-slate-700 overflow-hidden">
                    {incidentTypes.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setIncidentForm(prev => ({ ...prev, type: t.id }));
                          setIsIncidentTypeOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left hover:bg-sky-50/60 transition-colors flex items-center justify-between ${incidentForm.type === t.id ? 'bg-sky-50 text-sky-600' : ''}`}
                      >
                        <span>{t.label}</span>
                        {incidentForm.type === t.id && <span className="text-[10px] text-sky-500">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 tracking-wider">Mức độ</label>
              <div className="flex space-x-3 items-center h-[30px] pl-1">
                <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={incidentForm.severity === 'Thấp'}
                    onChange={() => {
                      setIncidentForm(prev => ({ ...prev, severity: 'Thấp' }));
                      setSosActive(false);
                    }}
                    className="w-3.5 h-3.5 rounded text-sky-500 border-slate-300 focus:ring-sky-400"
                  />
                  <span>Thấp</span>
                </label>
                <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] font-bold text-rose-600">
                  <input
                    type="checkbox"
                    checked={incidentForm.severity === 'Cao'}
                    onChange={() => {
                      setIncidentForm(prev => ({ ...prev, severity: 'Cao' }));
                      setSosActive(true);
                    }}
                    className="w-3.5 h-3.5 rounded text-rose-500 border-slate-300 focus:ring-rose-400"
                  />
                  <span>SOS</span>
                </label>
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 tracking-wider">Hành khách liên quan</label>
            <button
              type="button"
              onClick={() => setIsIncidentPassengerOpen(!isIncidentPassengerOpen)}
              className="w-full text-[11px] px-3 py-1 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none hover:border-sky-300 focus:border-sky-400 transition h-[30px] flex items-center justify-between shadow-sm cursor-pointer"
            >
              <span>
                {incidentForm.passengerCode
                  ? activePassengers.find(p => p.code === incidentForm.passengerCode)?.name + ` (${incidentForm.passengerCode})`
                  : '-- Không có hành khách cụ thể --'}
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isIncidentPassengerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isIncidentPassengerOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsIncidentPassengerOpen(false)}></div>
                <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl shadow-xl py-1 max-h-48 overflow-y-auto animate-slide-up text-[11px] font-bold text-slate-700">
                  <button
                    type="button"
                    onClick={() => {
                      setIncidentForm(prev => ({ ...prev, passengerCode: '' }));
                      setIsIncidentPassengerOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left hover:bg-sky-50/60 transition-colors flex items-center justify-between border-b border-slate-50 ${incidentForm.passengerCode === '' ? 'bg-sky-50 text-sky-600' : ''}`}
                  >
                    <span>-- Không có hành khách cụ thể --</span>
                    {incidentForm.passengerCode === '' && <span className="text-[10px] text-sky-500">✓</span>}
                  </button>
                  {activePassengers.map((p, index) => (
                    <button
                      key={p.listKey || `${p.code}:${index}`}
                      type="button"
                      onClick={() => {
                        setIncidentForm(prev => ({ ...prev, passengerCode: p.code }));
                        setIsIncidentPassengerOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-left hover:bg-sky-50/60 transition-colors flex items-center justify-between ${incidentForm.passengerCode === p.code ? 'bg-sky-50 text-sky-600' : ''}`}
                    >
                      <span>{p.name} ({p.code})</span>
                      {incidentForm.passengerCode === p.code && <span className="text-[10px] text-sky-500">✓</span>}
                    </button>
                  ))}
                  {activePassengers.length === 0 && (
                    <div className="px-3 py-2 text-slate-400 font-semibold">
                      Chưa có hành khách đang tham gia.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Mô tả sự việc</label>
            <textarea
              rows={2}
              value={incidentForm.description}
              onChange={(e) => setIncidentForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Diễn biến sự việc..."
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-400 bg-white text-[11px] font-semibold text-slate-700 shadow-sm select-text"
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">Phương án xử lý</label>
            <textarea
              rows={2}
              value={incidentForm.treatment}
              onChange={(e) => setIncidentForm(prev => ({ ...prev, treatment: e.target.value }))}
              placeholder="Đã xử lý những gì tại chỗ..."
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-sky-400 bg-white text-[11px] font-semibold text-slate-700 shadow-sm select-text"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-2.5 font-bold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center space-x-1.5 ${sosActive
              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200 animate-pulse-subtle'
              : 'bg-sky-400 hover:bg-sky-500 text-white'
              }`}
          >
            {sosActive ? (
              <>
                <AlertTriangle size={14} />
                <span>GỬI BÁO CÁO KHẨN SOS</span>
              </>
            ) : (
              <span>GỬI BÁO CÁO</span>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Lịch sử báo cáo sự cố đã gửi
        </h4>

        <div className="space-y-2">
          {paginatedIncidents.map((log) => {
            const isExpanded = !!expandedIncidents[log.id];
            const isHigh = log.severity === 'Cao';
            const typeMeta = getIncidentTypeMeta(log.type);
            const showHealthNotes = Boolean(log.healthNotes) && (isMedicalIncident(log.type) || Boolean(log.passengerCode));
            return (
              <div
                key={log.id}
                className={`glass-card rounded-2xl border transition-all duration-200 shadow-sm ${isHigh ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100 bg-white'
                  }`}
              >
                <div
                  onClick={() => {
                    setExpandedIncidents(prev => ({
                      ...prev,
                      [log.id]: !isExpanded
                    }));
                  }}
                  className="p-3 flex items-start justify-between cursor-pointer select-none"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-semibold text-slate-700 font-mono">
                        {log.id}
                      </span>
                      {log.tourCode && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {log.tourCode}
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${typeMeta.className}`}>
                        {typeMeta.label}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                      <span>{log.passengerName ? log.passengerName : 'Đoàn chung'}</span>
                      <span>•</span>
                      <span>{formatIncidentTime(log.time)}</span>
                    </div>
                  </div>

                  <ChevronRight
                    size={14}
                    className={`text-slate-300 shrink-0 mt-1 transition-transform duration-300 ${isExpanded ? 'rotate-90 text-sky-400' : ''
                      }`}
                  />
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 pt-1.5 border-t border-slate-100 text-[11px] text-slate-600 space-y-2 animate-slide-up">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/50">
                      <strong className="text-slate-700 block mb-0.5">Mô tả sự việc:</strong>
                      <p className="text-slate-500 leading-normal">{log.description}</p>
                    </div>
                    {showHealthNotes && (
                      <div className="bg-amber-50 p-2 rounded-xl border border-amber-100/70">
                        <strong className="text-amber-800 block mb-0.5 font-bold">Thông tin y tế:</strong>
                        <p className="text-amber-700 leading-normal">{log.healthNotes}</p>
                      </div>
                    )}
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100/50">
                      <strong className="text-emerald-800 block mb-0.5 font-bold">Phương án xử lí:</strong>
                      <p className="text-emerald-700 leading-normal">{log.treatment}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {incidents.length > PAGE_SIZE && (
          <PaginationTabs
            currentPage={incidentPage}
            totalPages={totalIncidentPages}
            onPageChange={setIncidentPage}
          />
        )}
      </div>
    </div>
  );
}
