import { useState, useEffect } from 'react';
import { hdvService } from '../services/hdvService';

interface LichTrinhProps {
  maTourThucTe?: string;
}

interface ScheduleItem {
  time: string;
  activity: string;
  notes?: string;
}

interface Meals {
  sang: string;
  trua: string;
  chieu: string;
  toi: string;
}

interface ItineraryDay {
  day: number;
  schedule: ScheduleItem[];
  meals: Meals;
}

const parseMeals = (thucDonStr?: string): Meals => {
  const meals = { sang: '', trua: '', chieu: '', toi: '' };
  if (!thucDonStr) return meals;
  
  const parts = thucDonStr.split('|').map(s => s.trim());
  if (parts.length === 1 && !thucDonStr.includes(':')) {
    meals.trua = thucDonStr;
    return meals;
  }
  
  parts.forEach(p => {
    const [key, ...rest] = p.split(':');
    const val = rest.join(':').trim();
    const lowerKey = key.trim().toLowerCase();
    if (lowerKey === 'sáng' || lowerKey === 'sang') meals.sang = val;
    else if (lowerKey === 'trưa' || lowerKey === 'trua') meals.trua = val;
    else if (lowerKey === 'chiều' || lowerKey === 'chieu') meals.chieu = val;
    else if (lowerKey === 'tối' || lowerKey === 'toi') meals.toi = val;
  });
  return meals;
};

const tachTimelineHoatDong = (hoatDong: string): ScheduleItem[] => {
  return hoatDong
    .split(/\\n|\r?\n|<br\s*\/?>/)
    .map((dong) => dong.trim())
    .filter(Boolean)
    .map((dong) => {
      const cleanedDong = dong.replace(/^[-–—•\s]+/, '').trim();
      const khop = cleanedDong.match(/^(\d{2}:\d{2})\s*[-–—]\s*(.+)$/);
      return khop
        ? { time: khop[1], activity: khop[2] }
        : { time: '', activity: cleanedDong };
    });
};

export default function LichTrinh({ maTourThucTe }: LichTrinhProps) {
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!maTourThucTe) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    hdvService.layLichTrinhTourThucTe(maTourThucTe)
      .then((res) => {
        const lichTrinh: any[] = Array.isArray(res?.data) ? res.data : [];

        if (lichTrinh.length === 0) {
          setItinerary([]);
          return;
        }

        const mapped: ItineraryDay[] = lichTrinh.map((lt: any) => ({
          day: lt.ngayThu,
          schedule: tachTimelineHoatDong(lt.hoatDong || ''),
          meals: parseMeals(lt.thucDon)
        }));

        // Sắp xếp theo ngày
        mapped.sort((a, b) => a.day - b.day);
        setItinerary(mapped);
        setSelectedDayNum(mapped[0]?.day ?? 1);
      })
      .catch(() => {
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [maTourThucTe]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 space-x-2">
        <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-500 font-medium">Đang tải lịch trình...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 space-y-2">
        <span className="text-3xl">⚠️</span>
        <p className="text-xs text-slate-400 font-medium">Không thể tải lịch trình. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  if (!maTourThucTe || itinerary.length === 0) {
    return (
      <div className="text-center py-10 space-y-2">
        <span className="text-3xl">📋</span>
        <p className="text-xs text-slate-400 font-medium">Chưa có lịch trình cho tour này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5 animate-slide-up">
      {/* Day selector pills */}
      <div className="bg-sky-50/60 backdrop-blur-md p-1.5 rounded-2xl border border-sky-100/50 flex space-x-1">
        {itinerary.map(day => (
          <button
            key={day.day}
            onClick={() => setSelectedDayNum(day.day)}
            className={`flex-1 py-1.5 text-[11px] rounded-xl font-bold transition-all active:scale-95 duration-300 ${
              selectedDayNum === day.day
                ? 'bg-gradient-to-r from-sky-400 to-sky-500 text-white shadow-lg shadow-sky-200/60 scale-105'
                : 'bg-transparent text-slate-500 hover:text-sky-500 hover:bg-white/50'
            }`}
          >
            Ngày {day.day}
          </button>
        ))}
      </div>

      {/* Day detail */}
      {itinerary.filter(day => day.day === selectedDayNum).map((day) => (
        <div key={day.day} className="space-y-5 animate-slide-up pb-4">

          {/* LichTrinh */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[12px] font-black uppercase tracking-wider text-slate-700">
                Lịch trình hoạt động
              </h4>
              <span className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2 py-0.5 rounded-full border border-sky-100 shadow-sm">
                {day.schedule.length} hoạt động
              </span>
            </div>

            <div className="space-y-3">
              {day.schedule.map((item, index) => (
                <div key={index} className="bg-gradient-to-br from-sky-50 to-white p-3.5 rounded-2xl border border-sky-100/80 shadow-sm hover:shadow-md transition relative overflow-hidden">
                  <div className="flex space-x-3 items-start relative z-10">
                    {item.time && (
                      <div className="bg-white border border-sky-200 text-sky-600 rounded-xl px-2 py-1.5 text-[11px] font-black shrink-0 font-mono text-center min-w-[50px] shadow-sm">
                        {item.time}
                      </div>
                    )}
                    <div className="flex-1 pt-0.5">
                      <h5 className="text-[12px] font-medium text-slate-600 leading-tight">{item.activity}</h5>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Menu */}
          {(day.meals.sang || day.meals.trua || day.meals.chieu || day.meals.toi) && (
            <div className="space-y-2.5 pt-4 border-t border-slate-100/60">
              <h4 className="text-[12px] font-black uppercase tracking-wider text-slate-700 block">🍽️ Thực đơn</h4>
              <div className="grid grid-cols-2 gap-3">
                {day.meals.sang && (
                  <div className="bg-gradient-to-br from-amber-50 to-white p-3 rounded-2xl border border-amber-100/80 shadow-sm relative overflow-hidden">
                    <span className="text-3xl absolute -right-2 -bottom-2 opacity-20 grayscale">☕</span>
                    <strong className="text-amber-600 block mb-1 text-[11px] uppercase tracking-wide">Sáng</strong>
                    <p className="text-slate-600 text-[11px] font-medium leading-relaxed relative z-10">{day.meals.sang}</p>
                  </div>
                )}
                {day.meals.trua && (
                  <div className="bg-gradient-to-br from-orange-50 to-white p-3 rounded-2xl border border-orange-100/80 shadow-sm relative overflow-hidden">
                    <span className="text-3xl absolute -right-2 -bottom-2 opacity-20 grayscale">🍲</span>
                    <strong className="text-orange-600 block mb-1 text-[11px] uppercase tracking-wide">Trưa</strong>
                    <p className="text-slate-600 text-[11px] font-medium leading-relaxed relative z-10">{day.meals.trua}</p>
                  </div>
                )}
                {day.meals.chieu && (
                  <div className="bg-gradient-to-br from-emerald-50 to-white p-3 rounded-2xl border border-emerald-100/80 shadow-sm relative overflow-hidden">
                    <span className="text-3xl absolute -right-2 -bottom-2 opacity-20 grayscale">🍵</span>
                    <strong className="text-emerald-600 block mb-1 text-[11px] uppercase tracking-wide">Chiều</strong>
                    <p className="text-slate-600 text-[11px] font-medium leading-relaxed relative z-10">{day.meals.chieu}</p>
                  </div>
                )}
                {day.meals.toi && (
                  <div className="bg-gradient-to-br from-indigo-50 to-white p-3 rounded-2xl border border-indigo-100/80 shadow-sm relative overflow-hidden">
                    <span className="text-3xl absolute -right-2 -bottom-2 opacity-20 grayscale">🌙</span>
                    <strong className="text-indigo-600 block mb-1 text-[11px] uppercase tracking-wide">Tối</strong>
                    <p className="text-slate-600 text-[11px] font-medium leading-relaxed relative z-10">{day.meals.toi}</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}
