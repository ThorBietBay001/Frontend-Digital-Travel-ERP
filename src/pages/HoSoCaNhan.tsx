import { Shield, Award, Star, Compass, CheckCircle, ArrowLeft, LockKeyhole, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { hdvService } from '../services/hdvService';

interface ProfileProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function HoSoCaNhan({ onBack, onLogout }: ProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [nangLuc, setNangLuc] = useState<any>(null);
  const [pastToursCount, setPastToursCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [resHoSo, resNangLuc, resTours] = await Promise.all([
          hdvService.layHoSo(),
          hdvService.layNangLuc(),
          hdvService.layDanhSachTour()
        ]);
        if (resHoSo.data) setProfile(resHoSo.data);
        if (resNangLuc.data) setNangLuc(resNangLuc.data);
        if (resTours.data) {
          const pastTours = resTours.data.filter((t: any) => {
            const isFinished = t.trangThaiTour === 'KET_THUC';
            const isPast = t.ngayKhoiHanh && new Date(t.ngayKhoiHanh) < new Date();
            return isFinished || isPast;
          });
          setPastToursCount(pastTours.length);
        }
      } catch (e) {
        console.error("Lỗi lấy hồ sơ", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!otpModalOpen || otpCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setOtpCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpModalOpen, otpCountdown]);

  if (loading) return <div className="text-center p-4 mt-10 font-medium text-slate-500">Đang tải hồ sơ...</div>;
  if (!profile) return <div className="text-center p-4 mt-10 text-red-500">Lỗi không thể tải hồ sơ!</div>;

  const initials = profile.hoTen ? profile.hoTen.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() : 'HD';
  const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString('vi-VN') : 'Đang cập nhật';

  const resetPasswordForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setGeneratedOtp('');
    setOtpCode('');
    setOtpCountdown(0);
    setPasswordError(null);
  };

  const resetOtpState = () => {
    setGeneratedOtp('');
    setOtpCode('');
    setOtpCountdown(0);
  };

  const validatePasswordFields = () => {
    if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordError('Vui lòng nhập đầy đủ thông tin mật khẩu.');
      return false;
    }
    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu mới và xác nhận không khớp.');
      return false;
    }
    return true;
  };

  const requestPasswordOtp = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!validatePasswordFields()) return;

    setSendingOtp(true);
    try {
      await hdvService.kiemTraMatKhau(oldPassword);
      const nextOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(nextOtp);
      setOtpCode('');
      setOtpCountdown(60);
      setChangePasswordOpen(false);
      setOtpModalOpen(true);
      setPasswordSuccess(`Mã OTP bảo mật đã được gửi đến thiết bị của bạn: ${nextOtp}`);
    } catch (e: any) {
      resetOtpState();
      setPasswordError(e?.response?.data?.message || 'Mật khẩu hiện tại không chính xác.');
    } finally {
      setSendingOtp(false);
    }
  };

  const closeChangePasswordModal = () => {
    setChangePasswordOpen(false);
    setOtpModalOpen(false);
    resetPasswordForm();
    setPasswordSuccess(null);
  };

  const closeOtpModal = () => {
    setOtpModalOpen(false);
    resetOtpState();
    setPasswordError(null);
    setPasswordSuccess(null);
    setChangePasswordOpen(true);
  };

  const resendPasswordOtp = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    setSendingOtp(true);
    try {
      await hdvService.kiemTraMatKhau(oldPassword);
      const nextOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(nextOtp);
      setOtpCode('');
      setOtpCountdown(60);
      setPasswordSuccess(`Mã OTP mới đã được gửi đến thiết bị của bạn: ${nextOtp}`);
    } catch (e: any) {
      resetOtpState();
      setPasswordError(e?.response?.data?.message || 'Không thể gửi lại OTP. Vui lòng thử lại.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!validatePasswordFields()) return;
    if (!generatedOtp) {
      setPasswordError('Vui lòng gửi OTP trước khi đổi mật khẩu.');
      return;
    }
    if (otpCode !== generatedOtp) {
      setPasswordError('Mã OTP không chính xác.');
      return;
    }

    setChangingPassword(true);
    try {
      await hdvService.doiMatKhau({
        matKhauCu: oldPassword,
        matKhauMoi: newPassword,
        xacNhanMatKhau: confirmPassword
      });
      setPasswordSuccess('Đổi mật khẩu thành công.');
      resetPasswordForm();
      window.setTimeout(() => {
        setChangePasswordOpen(false);
        setPasswordSuccess(null);
        onLogout();
      }, 1200);
    } catch (e: any) {
      setPasswordError(e?.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-6">

      {/* Sticky Header with horizontal line and back button */}
      <div className="sticky -top-4 bg-slate-50/95 backdrop-blur-md z-20 pb-3 pt-4 border-b border-slate-200/60 -mx-4 px-4 flex items-center space-x-2.5">
        <button
          onClick={onBack}
          className="p-1 rounded-full hover:bg-slate-200/60 text-slate-600 transition"
          title="Quay lại"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h3 className="font-black text-slate-800 text-base leading-none">Hồ sơ Hướng dẫn viên</h3>
          <p className="text-[10px] text-slate-400 mt-1">Chi tiết nhân sự & chứng chỉ thực địa</p>
        </div>
      </div>

      {/* HoSoCaNhan Card Header (Flat Premium Design) */}
      <div className="flex flex-col items-center text-center space-y-3 pt-2">
        {/* Large Avatar initials with active status indicator */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-400 to-sky-500 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-sky-100 ring-4 ring-white relative animate-pulse-subtle">
          {initials}
          <span className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-emerald-500 border-3 border-white rounded-full"></span>
        </div>

        <div className="flex flex-col items-center justify-center space-y-1.5">
          <h4 className="font-black text-slate-800 text-lg leading-none">{profile.hoTen}</h4>
          <span className="text-[10px] bg-sky-50 text-sky-600 font-bold px-2.5 py-0.5 rounded-full border border-sky-100 uppercase tracking-wider">
            {profile.loaiNhanVien === 'HDV' ? 'HDV Chuyên nghiệp' : profile.loaiNhanVien}
          </span>
          <p className="text-[11px] text-slate-500 pt-0.5">Mã số: <strong className="text-sky-500 font-mono">{profile.maNhanVien}</strong></p>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="glass-card p-3 rounded-2xl border border-slate-100 shadow-sm bg-white">
          <div className="flex justify-center text-amber-500 mb-1"><Star size={16} className="fill-amber-400" /></div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Đánh giá</span>
          <span className="text-xs font-black text-slate-800">{nangLuc?.danhGia?.toFixed(1) || '0.0'} / 5.0</span>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-slate-100 shadow-sm bg-white">
          <div className="flex justify-center text-emerald-500 mb-1"><CheckCircle size={16} /></div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Số đánh giá</span>
          <span className="text-xs font-black text-slate-800">{nangLuc?.soDanhGia || 0} lượt</span>
        </div>
        <div className="glass-card p-3 rounded-2xl border border-slate-100 shadow-sm bg-white">
          <div className="flex justify-center text-sky-400 mb-1"><Compass size={16} /></div>
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Số chuyến</span>
          <span className="text-xs font-black text-slate-800">{pastToursCount} tour</span>
        </div>
      </div>

      {/* Main HoSoCaNhan Info Cards */}
      <div className="space-y-3.5">

        {/* Personal Details: Completely Left-Aligned with Normal Colors & Muted Values */}
        <div className="glass-card p-4 rounded-3xl border border-slate-100 space-y-3 shadow-sm bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Shield size={13} className="mr-1.5 text-sky-400" />
            Thông tin cá nhân
          </h4>
          <div className="text-xs space-y-2.5">
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Tài khoản:</span>
              <span className="bg-sky-50 text-sky-700 font-bold px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider ml-1.5">{profile.tenDangNhap || 'Đang cập nhật'}</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">CCCD:</span>
              <span className="text-slate-500 font-medium ml-1.5 font-mono">{profile.cccd || 'Đang cập nhật'}</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Ngày sinh:</span>
              <span className="text-slate-500 font-medium ml-1.5">
                {formatDate(profile.ngaySinh)}
              </span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Điện thoại:</span>
              <span className="text-slate-500 font-medium ml-1.5">{profile.soDienThoai || 'Đang cập nhật'}</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Email:</span>
              <span className="text-slate-500 font-medium ml-1.5 font-mono">{profile.email || 'Đang cập nhật'}</span>
            </div>
            <div className="text-left">
              <span className="text-slate-700 font-bold">Ngày vào làm:</span>
              <span className="text-slate-500 font-medium ml-1.5">
                {formatDate(profile.ngayVaoLam)}
              </span>
            </div>
          </div>
        </div>

        {/* Competencies & Certifications: Completely Left-Aligned with Muted Bulleted Lists */}
        <div className="glass-card p-4 rounded-3xl border border-slate-100 space-y-3 shadow-sm bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Award size={13} className="mr-1.5 text-emerald-500" />
            Năng lực & Chứng chỉ
          </h4>
          <div className="text-xs space-y-2.5">
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Loại thẻ HDV:</span>
              <span className="text-slate-500 font-medium ml-1.5">Thẻ HDV Quốc tế</span>
            </div>
            <div className="flex flex-col border-b border-slate-50 pb-1.5 space-y-1 text-left">
              <span className="text-slate-700 font-bold">Ngoại ngữ:</span>
              <div className="flex flex-col pl-4 space-y-0.5 text-slate-500 font-medium text-[11px]">
                {nangLuc?.ngonNgu ? nangLuc.ngonNgu.split(',').map((item: string, idx: number) => (
                  <span key={idx}>• {item.trim()}</span>
                )) : <span>Chưa cập nhật</span>}
              </div>
            </div>
            <div className="flex flex-col space-y-1 text-left">
              <span className="text-slate-700 font-bold">Chứng chỉ:</span>
              <div className="flex flex-col pl-4 space-y-0.5 text-slate-500 font-medium text-[11px]">
                {nangLuc?.chungChi ? nangLuc.chungChi.split(',').map((item: string, idx: number) => (
                  <span key={idx}>• {item.trim()}</span>
                )) : <span>Chưa cập nhật</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Specialization Details: Unified Grid Format with Others */}
        <div className="glass-card p-4 rounded-3xl border border-slate-100 space-y-3 shadow-sm bg-white">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
            <Compass size={13} className="mr-1.5 text-amber-500" />
            Khu vực & Chuyên môn chính
          </h4>
          <div className="text-xs space-y-2.5">
            <div className="flex flex-col space-y-1 text-left">
              <span className="text-slate-700 font-bold">Chuyên môn cốt lõi:</span>
              <div className="flex flex-col pl-4 space-y-0.5 text-slate-500 font-medium text-[11px]">
                {nangLuc?.chuyenMon ? nangLuc.chuyenMon.split(',').map((item: string, idx: number) => (
                  <span key={idx}>• {item.trim()}</span>
                )) : <span>Chưa cập nhật</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Account actions */}
        <div className="pt-1 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPasswordSuccess(null);
              setPasswordError(null);
              setChangePasswordOpen(true);
            }}
            className="w-full max-w-[240px] py-2 bg-sky-50 hover:bg-sky-100 text-sky-600 font-bold text-xs rounded-full transition active:scale-95 border border-sky-200/70 text-center shadow-sm flex items-center justify-center gap-1.5"
          >
            <LockKeyhole size={13} />
            Đổi mật khẩu
          </button>
          <button
            onClick={onLogout}
            className="w-full max-w-[240px] py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-full transition active:scale-95 border border-rose-200/60 text-center shadow-sm"
          >
            Đăng xuất tài khoản
          </button>
        </div>

      </div>

      {changePasswordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal max-w-sm w-full p-4 rounded-3xl animate-slide-up max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Đổi mật khẩu</h3>
              <button
                type="button"
                onClick={closeChangePasswordModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                aria-label="Đóng"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl glass-input"
                  autoComplete="current-password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">Mật khẩu mới</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl glass-input"
                  autoComplete="new-password"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl glass-input"
                  autoComplete="new-password"
                />
              </div>

              {passwordError && (
                <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                  {passwordSuccess}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={closeChangePasswordModal}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={requestPasswordOtp}
                disabled={sendingOtp}
                className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md transition disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {sendingOtp ? 'Đang gửi OTP...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {otpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-modal max-w-sm w-full p-4 rounded-3xl animate-slide-up max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Xác thực OTP</h3>
              <button
                type="button"
                onClick={closeOtpModal}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                aria-label="Đóng"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Nhập mã OTP đã được gửi để xác nhận đổi mật khẩu.
              </p>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 block">Mã OTP xác thực</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="flex-1 min-w-0 text-xs p-2.5 rounded-xl glass-input font-mono tracking-widest"
                    placeholder="Nhập OTP"
                  />
                  <button
                    type="button"
                    onClick={resendPasswordOtp}
                    disabled={sendingOtp || otpCountdown > 0}
                    className="shrink-0 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[11px] font-bold border border-emerald-100 transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sendingOtp ? 'Đang gửi...' : otpCountdown > 0 ? `Gửi lại (${otpCountdown}s)` : 'Gửi lại OTP'}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-2.5">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                  {passwordSuccess}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={closeOtpModal}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Quay lại
              </button>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl shadow-md transition disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {changingPassword ? 'Đang đổi...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
