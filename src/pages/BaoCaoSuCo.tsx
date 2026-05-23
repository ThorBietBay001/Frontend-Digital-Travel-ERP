import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { Passenger, BaoCaoSuCo as IncidentType } from '../types';
import { hdvService } from '../services/hdvService';

interface IncidentReportProps {
  maTour?: string;
  allTours?: any[];
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

export default function BaoCaoSuCo({ maTour, allTours = [], passengers, incidents, setIncidents }: IncidentReportProps) {
  const [selectedTour, setSelectedTour] = useState(maTour || '');
  const [localPassengers, setLocalPassengers] = useState<Passenger[]>(passengers);
  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);

  // Filter tours for dropdown: allow ongoing/upcoming, and past tours ended within 3 days
  const validToursForDropdown = React.useMemo(() => {
    return allTours.filter(t => {
      // Allow ongoing or upcoming tours
      if (t.status !== 'Kết thúc' && t.status !== 'Đã quyết toán') {
        return true;
      }
      if (!t.endDateIso) return true;
      const end = new Date(t.endDateIso);
      const now = new Date();
      const diffTime = now.getTime() - end.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 3;
    });
  }, [allTours]);

  React.useEffect(() => {
    if (selectedTour === maTour) {
      setLocalPassengers(passengers);
    } else if (selectedTour) {
      hdvService.layDanhSachDoan(selectedTour).then(res => {
        if (res?.data) {
          const mapped = res.data.map((p: any) => ({
            code: p.maKhachHang || p.maNguoiDongHanh,
            name: p.hoTenKhachHang || p.hoTen || '(Chưa cập nhật tên)',
            phone: p.soDienThoai || 'N/A',
            rank: p.hangThanhVien || 'THANH_VIEN',
            status: p.trangThai || 'CHUA_DIEM_DANH'
          }));
          setLocalPassengers(mapped);
        }
      }).catch(err => console.error("Error fetching passengers for tour", err));
    }
  }, [selectedTour, maTour, passengers]);
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(incidents.length / ITEMS_PER_PAGE);
  const validCurrentPage = Math.min(currentPage, totalPages) || 1;
  const currentIncidents = incidents.slice((validCurrentPage - 1) * ITEMS_PER_PAGE, validCurrentPage * ITEMS_PER_PAGE);

  const mapLoaiSuCo = (type: string) => {
    return incidentTypes.find(item => item.id === type)?.apiValue || 'KHAC';
  };

  const mapMucDo = (severity: string) => severity === 'Cao' ? 'SOS' : 'THAP';

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTour) {
      setIncidentToast('Lỗi: Vui lòng chọn tour!');
      setTimeout(() => setIncidentToast(null), 4000);
      return;
    }

    const targetPassenger = localPassengers.find(p => p.code === incidentForm.passengerCode);

    try {
      const data = {
        loaiSuCo: mapLoaiSuCo(incidentForm.type),
        mucDo: mapMucDo(incidentForm.severity),
        moTa: incidentForm.description,
        giaiPhap: incidentForm.treatment
      };

      const res = await hdvService.taoSuCo(selectedTour, data);

      if (res.data) {
        const i = res.data;
        const newReport: IncidentType = {
          id: i.maNhatKySuCo,
          type: incidentForm.type,
          severity: i.mucDo === 'SOS' ? 'Cao' : 'Thấp',
          passengerName: targetPassenger ? targetPassenger.name : undefined,
          passengerCode: incidentForm.passengerCode || undefined,
          description: i.moTa || incidentForm.description,
          treatment: i.giaiPhap || incidentForm.treatment,
          result: i.giaiPhap || incidentForm.treatment,
          time: i.thoiGianBaoCao || new Date().toLocaleString('vi-VN').slice(0, 16)
        };

        setIncidents(prev => [newReport, ...prev]);
        setCurrentPage(1);
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
            <p className="text-[10px] text-slate-400 mt-1">Ghi nhận nhanh các trường hợp y tế</p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTourDropdownOpen(!isTourDropdownOpen)}
              className="text-[10px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded font-mono font-bold border border-dashed border-sky-300 flex items-center space-x-1 outline-none transition cursor-pointer hover:bg-sky-100"
            >
              <span>{selectedTour || 'Chọn Tour'}</span>
              <ChevronDown size={10} className={`transition-transform duration-200 ${isTourDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isTourDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsTourDropdownOpen(false)}></div>
                <div className="absolute right-0 top-full mt-1.5 z-50 bg-white border border-sky-200 rounded-xl shadow-xl py-1 w-48 text-[10px] text-slate-700 animate-slide-up max-h-48 overflow-y-auto text-left">
                  {validToursForDropdown.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedTour(t.code || t.maTourThucTe);
                        setIsTourDropdownOpen(false);
                        setIncidentForm(prev => ({ ...prev, passengerCode: '' }));
                      }}
                      className={`w-full text-left px-3 py-1.5 hover:bg-sky-50 transition flex items-center justify-between ${selectedTour === (t.code || t.maTourThucTe) ? 'bg-sky-50 text-sky-600 font-bold' : 'font-medium'}`}
                    >
                      <span className="truncate">{t.code || t.maTourThucTe} - {t.name}</span>
                      {selectedTour === (t.code || t.maTourThucTe) && <span className="text-sky-500">✓</span>}
                    </button>
                  ))}
                  {validToursForDropdown.length === 0 && (
                    <div className="px-3 py-1.5 text-slate-400 italic">Không có tour nào</div>
                  )}
                </div>
              </>
            )}
          </div>
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
                  <div className="absolute inset-0 z-40" onClick={() => setIsIncidentTypeOpen(false)}></div>
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
                  ? localPassengers.find(p => p.code === incidentForm.passengerCode)?.name + ` (${incidentForm.passengerCode})`
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
                  {localPassengers.filter(p => p.status === 'DA_DIEM_DANH').map(p => (
                    <button
                      key={p.code}
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
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Vui lòng mô tả sự việc chi tiết.')}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
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
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Vui lòng ghi rõ phương án xử lý.')}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
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
              <span>GỬI</span>
            )}
          </button>
        </form>
      </div>

      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Lịch sử báo cáo sự cố đã gửi
        </h4>

        <div className="space-y-2">
          {currentIncidents.map((log) => {
            const isExpanded = !!expandedIncidents[log.id];
            const isHigh = log.severity === 'Cao';
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
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${isHigh ? 'bg-rose-500 text-white' : 'bg-sky-100 text-sky-600'
                        }`}>
                        {log.type}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-700 font-mono">
                        {log.id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                      <span>{log.passengerName ? log.passengerName : 'Đoàn chung'}</span>
                      <span>•</span>
                      <span>{log.time}</span>
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
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-200/50">
                      <strong className="text-slate-700 block mb-0.5">Xử lý tại hiện địa:</strong>
                      <p className="text-slate-500 leading-normal">{log.treatment}</p>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100/50">
                      <strong className="text-emerald-800 block mb-0.5 font-bold">Kết quả hiện tại:</strong>
                      <p className="text-emerald-700 leading-normal">{log.result}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {totalPages >= 2 && (
          <div className="flex justify-center items-center space-x-2 mt-4 pt-2 pb-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${validCurrentPage === i + 1
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
