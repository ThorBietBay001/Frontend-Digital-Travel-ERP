import { Check, Leaf, X, Clock } from 'lucide-react';

interface BookingSuccessProps {
  onClose: () => void;
  xuLyThanhCong: () => void;
  greenPoints: number;
  bookingStatus?: string;
  bookingCode: string;
}

export default function DatTourThanhCong({
  onClose,
  xuLyThanhCong,
  greenPoints,
  bookingStatus = 'upcoming',
  bookingCode
}: BookingSuccessProps) {
  const isPending = bookingStatus === 'CHO_XAC_NHAN';

  return (
    <div className="fixed inset-0 bg-[#020617]/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-[2rem] max-w-md w-full p-8 relative border border-slate-200/50 shadow-2xl overflow-hidden">
        {/* Subtle decorative background patterns for premium feel */}
        <div className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none ${isPending ? 'bg-amber-500' : 'bg-green-500'}`} />
        <div className={`absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-2xl opacity-20 pointer-events-none ${isPending ? 'bg-yellow-500' : 'bg-blue-500'}`} />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-all active:scale-95 z-10"
          title="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center relative z-10">
          {/* Main Icon Indicator */}
          {isPending ? (
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-amber-100 relative">
              <span className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping opacity-75" />
              <Clock className="w-10 h-10 text-amber-600 relative z-10 animate-pulse" />
            </div>
          ) : (
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-green-100">
              <Check className="w-10 h-10 text-green-600" />
            </div>
          )}

          {/* Booking Title & Description */}
          {isPending ? (
            <>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Đăng Ký Thành Công!</h3>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-250/50 mb-4 animate-pulse">
                Đang chờ xác nhận thanh toán
              </span>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                Cảm ơn bạn! Đơn hàng đang được hệ thống chờ xác nhận giao dịch chuyển khoản từ ngân hàng của bạn.
              </p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">Đặt Tour Thành Công!</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
                Vé điện tử đã được kích hoạt thành công và gửi tới email/số điện thoại liên hệ của bạn.
              </p>
            </>
          )}

          {/* Ticket Information Box */}
          <div className={`rounded-xl px-4 py-3.5 mb-6 border relative overflow-hidden ${
            isPending 
              ? 'bg-amber-50/60 border-amber-200/70'
              : 'bg-blue-50/60 border-blue-200/70'
          }`}>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.16em] mb-1">Mã đặt tour</p>
            <p className={`text-base font-bold font-mono tracking-wide ${isPending ? 'text-amber-700' : 'text-blue-700'}`}>
              {bookingCode}
            </p>
            
            {greenPoints > 0 && (
              <div className={`mt-3 pt-3 border-t ${isPending ? 'border-amber-100' : 'border-blue-100'}`}>
                <p className="text-xs text-emerald-650 font-bold flex items-center justify-center">
                  <Leaf className="w-3.5 h-3.5 mr-1.5 text-emerald-550 fill-emerald-50" />
                  Bạn nhận thêm +{greenPoints} điểm xanh!
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={xuLyThanhCong}
            className={`w-full py-3.5 text-white rounded-xl transition-all font-black text-xs shadow-md tracking-wide active:scale-[0.98] ${
              isPending 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/10' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/15'
            }`}
          >
            Xem chi tiết trong Hộ chiếu số
          </button>
        </div>
      </div>
    </div>
  );
}
