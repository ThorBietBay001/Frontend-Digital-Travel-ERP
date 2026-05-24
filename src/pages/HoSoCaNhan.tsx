import { Shield, Award, Star, Compass, CheckCircle, ArrowLeft, Key, X, AlertTriangle } from 'lucide-react';
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

  // Đổi mật khẩu states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    matKhauCu: '',
    matKhauMoi: '',
    xacNhanMatKhau: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isOtpMode, setIsOtpMode] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [expectedOtp, setExpectedOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if (isOtpMode && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpMode, otpCountdown]);

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

  if (loading) return <div className="text-center p-4 mt-10 font-medium text-slate-500">Đang tải hồ sơ...</div>;
  if (!profile) return <div className="text-center p-4 mt-10 text-red-500">Lỗi không thể tải hồ sơ!</div>;

  const initials = profile.hoTen ? profile.hoTen.split(' ').map((n: string) => n[0]).slice(-2).join('').toUpperCase() : 'HD';

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.matKhauCu || !passwordForm.matKhauMoi || !passwordForm.xacNhanMatKhau) {
      setPasswordError('Vui lòng điền đầy đủ các trường hợp lệ.');
      return;
    }
    if (passwordForm.matKhauMoi !== passwordForm.xacNhanMatKhau) {
      setPasswordError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    if (passwordForm.matKhauMoi.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await hdvService.kiemTraMatKhau(passwordForm.matKhauCu);
      // Mật khẩu cũ đúng, gửi OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedOtp(generatedOtp);
      setOtpCountdown(60);
      setOtpArray(['', '', '', '', '', '']);
      setIsOtpMode(true);
      setPasswordSuccess(`Mã OTP đã được gửi đến email của bạn: ${generatedOtp}`);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Mật khẩu cũ không đúng.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleVerifyPasswordOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const enteredOtp = otpArray.join('');
    if (enteredOtp !== expectedOtp) {
      setPasswordError('Mã OTP không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await hdvService.doiMatKhau(passwordForm);
      setPasswordSuccess('Đổi mật khẩu thành công!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordForm({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
        setPasswordSuccess('');
        setIsOtpMode(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Lỗi khi đổi mật khẩu.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResendPasswordOtp = async () => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setExpectedOtp(generatedOtp);
    setOtpCountdown(60);
    setOtpArray(['', '', '', '', '', '']);
    setPasswordError('');
    setPasswordSuccess(`Mã OTP mới của bạn là: ${generatedOtp}`);
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
          <span className="text-xs font-black text-slate-800">{pastToursCount} tour dẫn</span>
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
              <span className="text-slate-700 font-bold">Điện thoại:</span>
              <span className="text-slate-500 font-medium ml-1.5">{profile.soDienThoai || 'Đang cập nhật'}</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Email:</span>
              <span className="text-slate-500 font-medium ml-1.5 font-mono">{profile.email || 'Đang cập nhật'}</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">CCCD:</span>
              <span className="text-slate-500 font-medium ml-1.5 font-mono">{profile.cccd || 'Đang cập nhật'}</span>
            </div>
            <div className="border-b border-slate-50 pb-1.5 text-left">
              <span className="text-slate-700 font-bold">Ngày sinh:</span>
              <span className="text-slate-500 font-medium ml-1.5">
                {profile.ngaySinh ? new Date(profile.ngaySinh).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
              </span>
            </div>
            <div className="text-left">
              <span className="text-slate-700 font-bold">Ngày vào làm:</span>
              <span className="text-slate-500 font-medium ml-1.5">
                {profile.ngayVaoLam ? new Date(profile.ngayVaoLam).toLocaleDateString('vi-VN') : 'Đang cập nhật'}
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

        {/* Password & Logout Buttons */}
        <div className="pt-2 flex flex-col items-center space-y-2">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full max-w-[240px] py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition active:scale-95 border border-slate-200/60 text-center shadow-sm flex items-center justify-center space-x-1.5"
          >
            <Key size={14} />
            <span>Đổi mật khẩu bảo mật</span>
          </button>

          <button 
            onClick={onLogout}
            className="w-full max-w-[240px] py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-full transition active:scale-95 border border-rose-200/60 text-center shadow-sm"
          >
            Đăng xuất tài khoản
          </button>
        </div>

      </div>

      {/* Modal Đổi mật khẩu */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm p-5 shadow-2xl relative animate-slide-up border border-slate-100">
            <button 
              onClick={() => {
                setShowPasswordModal(false);
                setPasswordError('');
                setPasswordSuccess('');
                setPasswordForm({ matKhauCu: '', matKhauMoi: '', xacNhanMatKhau: '' });
                setIsOtpMode(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-50 p-1.5 rounded-full"
            >
              <X size={16} />
            </button>
            
            <div className="text-center mb-5">
              <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Key size={20} />
              </div>
              <h3 className="font-black text-slate-800 text-base">Đổi Mật Khẩu</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Bảo mật tài khoản nghiệp vụ của bạn</p>
            </div>

            {passwordError && (
              <div className="p-2.5 mb-4 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-semibold rounded-xl flex items-center space-x-1.5 animate-shake">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-2.5 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-semibold rounded-xl flex items-center space-x-1.5 animate-slide-up">
                <CheckCircle size={14} className="shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {!isOtpMode ? (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu cũ..."
                    value={passwordForm.matKhauCu}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, matKhauCu: e.target.value }))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70"
                    required
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Vui lòng nhập mật khẩu hiện tại.')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Mật khẩu mới (Tối thiểu 6 ký tự)..."
                    value={passwordForm.matKhauMoi}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, matKhauMoi: e.target.value }))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70"
                    required
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Vui lòng nhập mật khẩu mới.')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1 uppercase">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới..."
                    value={passwordForm.xacNhanMatKhau}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, xacNhanMatKhau: e.target.value }))}
                    className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70"
                    required
                    onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Vui lòng xác nhận mật khẩu mới.')}
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 disabled:opacity-70 flex justify-center items-center"
                >
                  {isChangingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Xác nhận thông tin'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyPasswordOtp} className="space-y-4 animate-slide-up">
                <div className="flex justify-center space-x-1.5">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <input
                      key={index}
                      id={`pwd-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={otpArray[index] || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isNaN(Number(val))) return;
                        const newOtp = [...otpArray];
                        newOtp[index] = val.substring(val.length - 1);
                        setOtpArray(newOtp);
                        if (val && index < 5) {
                          document.getElementById(`pwd-otp-${index + 1}`)?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
                          document.getElementById(`pwd-otp-${index - 1}`)?.focus();
                          const newOtp = [...otpArray];
                          newOtp[index - 1] = '';
                          setOtpArray(newOtp);
                        }
                      }}
                      className="w-11 h-11 text-center text-lg font-black text-slate-800 bg-white/80 border-2 border-slate-200 focus:border-sky-500 focus:bg-sky-50/20 rounded-xl outline-none transition-all duration-200 shadow-sm font-mono"
                      required
                      onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity('Vui lòng nhập mã OTP.')}
                      onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
                    />
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 text-center font-medium mt-4">
                  Bạn chưa nhận được mã?{' '}
                  {otpCountdown > 0 ? (
                    <span className="text-sky-500 font-bold">
                      Gửi lại OTP (00:{otpCountdown.toString().padStart(2, '0')})
                    </span>
                  ) : (
                    <span
                      onClick={handleResendPasswordOtp}
                      className="text-sky-500 font-bold hover:underline cursor-pointer"
                    >
                      Gửi lại OTP
                    </span>
                  )}
                </p>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 disabled:opacity-70 flex justify-center items-center"
                >
                  {isChangingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    'Cập nhật mật khẩu'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
