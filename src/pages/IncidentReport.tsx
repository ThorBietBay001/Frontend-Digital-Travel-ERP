import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import type { Passenger, IncidentReport as IncidentType } from '../types';

interface IncidentReportProps {
  passengers: Passenger[];
  incidents: IncidentType[];
  setIncidents: React.Dispatch<React.SetStateAction<IncidentType[]>>;
}

export default function IncidentReport({ passengers, incidents, setIncidents }: IncidentReportProps) {
  // Incident State
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

  // Incident Submit
  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPassenger = passengers.find(p => p.code === incidentForm.passengerCode);

    const newReport: IncidentType = {
      id: `INC00${incidents.length + 1}`,
      type: incidentForm.type,
      severity: incidentForm.severity,
      passengerName: targetPassenger ? targetPassenger.name : undefined,
      passengerCode: incidentForm.passengerCode || undefined,
      description: incidentForm.description,
      treatment: incidentForm.treatment,
      result: incidentForm.result || 'Đang theo dõi sát sao tại chỗ.',
      time: new Date().toLocaleString('vi-VN').slice(0, 16)
    };

    setIncidents(prev => [newReport, ...prev]);
    setIncidentToast(`Đã gửi báo cáo sự cố ${newReport.id} thành công!`);

    // Reset form
    setIncidentForm({
      type: 'Y tế',
      severity: 'Thấp',
      passengerCode: '',
      description: '',
      treatment: '',
      result: ''
    });
    setSosActive(false);

    setTimeout(() => {
      setIncidentToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Sent Toast notification */}
      {incidentToast && (
        <div className="p-3 bg-sky-400 text-white text-xs font-bold rounded-2xl shadow-lg border border-sky-500 flex items-center space-x-2 animate-bounce">
          <CheckCircle size={16} />
          <p>{incidentToast}</p>
        </div>
      )}

      {/* Incident Form Card Title Outside */}
      <div className="px-1 py-1">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle size={14} className="text-rose-500" />
            <span>BÁO CÁO SỰ CỐ MỚI</span>
          </h3>
          <span className="text-[10px] bg-sky-50 text-sky-600 px-2 py-0.5 rounded font-mono font-bold border border-dashed border-sky-300">PQ001</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">Ghi nhận nhanh sự cố tại hiện trường và gửi hỗ trợ SOS</p>
      </div>

      {/* Incident Form Card */}
      <div className="glass-card p-4 rounded-3xl space-y-3">
        <form onSubmit={handleIncidentSubmit} className="space-y-3.5 text-xs">
          {/* Row 1: Type + Severity inline */}
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
                  {/* Click-away backdrop */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsIncidentTypeOpen(false)}></div>

                  {/* Dropdown Menu */}
                  <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-md border border-sky-100 rounded-2xl shadow-xl py-1 animate-slide-up text-[11px] font-bold text-slate-700 overflow-hidden">
                    {[
                      { id: 'Y tế', label: 'Y tế' },
                      { id: 'Thời tiết', label: 'Thời tiết' },
                      { id: 'Phương tiện', label: 'Phương tiện' },
                      { id: 'Khách hàng', label: 'Khách hàng' },
                      { id: 'Ăn uống', label: 'Ăn uống' },
                      { id: 'Khác', label: 'Khác' }
                    ].map(t => (
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

          {/* Passenger selector */}
          <div className="relative">
            <label className="text-[10px] font-bold text-slate-400 block mb-1 tracking-wider">Hành khách liên quan</label>
            <button
              type="button"
              onClick={() => setIsIncidentPassengerOpen(!isIncidentPassengerOpen)}
              className="w-full text-[11px] px-3 py-1 rounded-xl border border-slate-200 bg-white font-semibold text-slate-700 outline-none hover:border-sky-300 focus:border-sky-400 transition h-[30px] flex items-center justify-between shadow-sm cursor-pointer"
            >
              <span>
                {incidentForm.passengerCode
                  ? passengers.find(p => p.code === incidentForm.passengerCode)?.name + ` (${incidentForm.passengerCode})`
                  : '-- Không có hành khách cụ thể --'}
              </span>
              <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${isIncidentPassengerOpen ? 'rotate-180' : ''}`} />
            </button>

            {isIncidentPassengerOpen && (
              <>
                {/* Click-away backdrop */}
                <div className="fixed inset-0 z-40" onClick={() => setIsIncidentPassengerOpen(false)}></div>

                {/* Dropdown Menu */}
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
                  {passengers.map(p => (
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

          {/* Description & treatment */}
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

          {/* Submit */}
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
                <span>🔥 GỬI BÁO CÁO KHẨN SOS</span>
              </>
            ) : (
              <span>Gửi Báo Cáo Sự Cố</span>
            )}
          </button>
        </form>
      </div>

      {/* Sent logs */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Lịch sử báo cáo sự cố đã gửi
        </h4>

        <div className="space-y-2">
          {incidents.map((log) => {
            const isExpanded = !!expandedIncidents[log.id];
            const isHigh = log.severity === 'Cao';
            return (
              <div
                key={log.id}
                className={`glass-card rounded-2xl border transition-all duration-200 shadow-sm ${isHigh ? 'border-rose-100 bg-rose-50/20' : 'border-slate-100 bg-white'
                  }`}
              >
                {/* Accordion header */}
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

                {/* Accordion Collapsible Inner detail parameters */}
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
      </div>
    </div>
  );
}
