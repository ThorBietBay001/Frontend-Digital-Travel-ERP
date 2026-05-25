import { useEffect, useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Lock, User } from 'lucide-react';
import { hdvService } from '../services/hdvService';

interface LoginProps {
  loginCode: string;
  setLoginCode: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: string | null;
  setLoginError: (val: string | null) => void;
  setIsLoggedIn: (val: boolean) => void;
}

export default function DangNhap({
  loginCode,
  setLoginCode,
  loginPassword,
  setLoginPassword,
  loginError,
  setLoginError,
  setIsLoggedIn
}: LoginProps) {
  const [mode, setMode] = useState<'LOGIN' | 'FORGOT' | 'OTP_FORGOT'>('LOGIN');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpArray, setOtpArray] = useState<string[]>(['', '', '', '', '', '']);
  const [expectedOtp, setExpectedOtp] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [resetToken, setResetToken] = useState('');
  const [submittingForgot, setSubmittingForgot] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const displayError = errorMsg || loginError;

  useEffect(() => {
    if (mode !== 'OTP_FORGOT' || isOtpVerified || otpCountdown <= 0) return;
    const timer = window.setInterval(() => {
      setOtpCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isOtpVerified, mode, otpCountdown]);

  const issueForgotOtp = async (showResendMessage = false) => {
    if (!forgotEmail.trim()) {
      setErrorMsg('Vui lòng nhập email đã đăng ký.');
      return;
    }

    setSubmittingForgot(true);
    setErrorMsg(null);
    try {
      const response = await hdvService.quenMatKhau(forgotEmail.trim());
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setResetToken(response?.data || '');
      setExpectedOtp(generatedOtp);
      setOtpArray(['', '', '', '', '', '']);
      setOtpCountdown(60);
      setIsOtpVerified(false);
      setSuccessMsg(`${showResendMessage ? 'Mã OTP mới' : 'Mã OTP xác thực'} đã được gửi: ${generatedOtp}`);
      setMode('OTP_FORGOT');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.');
    } finally {
      setSubmittingForgot(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otpArray];
    newOtp[index] = value.substring(value.length - 1);
    setOtpArray(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) {
        (prevInput as HTMLInputElement).focus();
        const newOtp = [...otpArray];
        newOtp[index - 1] = '';
        setOtpArray(newOtp);
      }
    }
  };

  const switchMode = (nextMode: 'LOGIN' | 'FORGOT' | 'OTP_FORGOT') => {
    setMode(nextMode);
    setErrorMsg(null);
    setLoginError(null);
    setSuccessMsg(null);
    if (nextMode !== 'OTP_FORGOT') {
      setOtpArray(['', '', '', '', '', '']);
      setExpectedOtp('');
      setOtpCountdown(60);
      setIsOtpVerified(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6 relative overflow-y-auto overflow-x-hidden bg-gradient-to-tr from-sky-100/50 via-white to-sky-50 animate-fade-in">
      <div className="absolute -right-20 -top-20 w-60 h-60 rounded-full bg-sky-300/10 blur-2xl animate-float"></div>
      <div className="absolute -left-20 bottom-10 w-60 h-60 rounded-full bg-indigo-300/10 blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>

      <div className="flex flex-col space-y-6 z-10 my-auto -translate-y-6 w-full max-w-sm mx-auto">
        <div className="text-center space-y-3 animate-slide-up">
          <img
            src="/favicon.svg"
            alt="Digital Travel"
            className="w-16 h-16 mx-auto rounded-3xl shadow-xl shadow-sky-200 animate-pulse-subtle"
          />
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-wider text-center">DIGITAL TRAVEL ERP</h1>
            <p className="text-xs text-sky-500 font-bold uppercase tracking-widest mt-0.5">Nghiệp vụ Hướng dẫn viên</p>
          </div>
        </div>

        {mode === 'LOGIN' && (
          <div className="glass-panel p-5 rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-100/50 space-y-4 animate-slide-up">
            <div className="text-center">
              <h3 className="font-black text-slate-800 text-sm text-center">Đăng nhập hệ thống</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 text-center">Vui lòng sử dụng tài khoản hướng dẫn viên được cấp.</p>
            </div>

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-semibold rounded-xl text-center">
                {successMsg}
              </div>
            )}

            {displayError && (
              <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-600 text-[10.5px] font-semibold rounded-xl flex items-center space-x-1.5 animate-shake">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await hdvService.dangNhap(loginCode, loginPassword);
                  if (res.data?.accessToken) {
                    localStorage.setItem('token', res.data.accessToken);
                    setIsLoggedIn(true);
                    setLoginError(null);
                    setErrorMsg(null);
                  }
                } catch (err: any) {
                  setLoginError(err.response?.data?.message || 'Đăng nhập thất bại!');
                }
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Mã hướng dẫn viên</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><User size={15} /></span>
                  <input
                    type="text"
                    placeholder="Ví dụ: hdv01"
                    value={loginCode}
                    onChange={(e) => setLoginCode(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition bg-white/70 select-text"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Mật khẩu nghiệp vụ</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400"><Lock size={15} /></span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 outline-none transition bg-white/70 select-text"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-500 transition"
                    aria-label={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                    title={showLoginPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500">
                <label className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-sky-400 border-slate-300" />
                  <span>Ghi nhớ thiết bị</span>
                </label>
                <span
                  onClick={() => switchMode('FORGOT')}
                  className="hover:text-sky-500 cursor-pointer font-bold"
                >
                  Quên mật khẩu?
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-200 transition active:scale-98"
              >
                Đăng Nhập Ngay
              </button>
            </form>
          </div>
        )}

        {mode === 'FORGOT' && (
          <div className="glass-panel p-5 rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-100/50 space-y-4 animate-slide-up">
            <div className="text-center">
              <h3 className="font-black text-slate-800 text-sm text-center">Khôi phục mật khẩu</h3>
            </div>

            {displayError && (
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-semibold rounded-xl flex items-center space-x-1.5 animate-shake">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await issueForgotOtp();
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-[9px] font-bold text-slate-400 block mb-1 uppercase">Địa chỉ email đăng ký</label>
                <input
                  type="email"
                  placeholder="email@digitaltravel.vn"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70 select-text"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingForgot}
                className="w-full py-2.5 bg-gradient-to-r from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-200 transition active:scale-98"
              >
                {submittingForgot ? 'Đang gửi OTP...' : 'Gửi Yêu Cầu OTP'}
              </button>
            </form>

            <div className="text-center">
              <span
                onClick={() => {
                  switchMode('LOGIN');
                  setIsOtpVerified(false);
                }}
                className="text-[10px] text-sky-500 font-bold hover:underline cursor-pointer"
              >
                Quay lại đăng nhập
              </span>
            </div>
          </div>
        )}

        {mode === 'OTP_FORGOT' && (
          <div className="glass-panel p-5 rounded-3xl border border-sky-100/50 shadow-xl shadow-sky-100/50 space-y-4 animate-slide-up">
            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-800 text-base text-center">
                {!isOtpVerified ? 'Xác thực mã OTP' : 'Đặt lại mật khẩu'}
              </h3>
              <p className="text-[10px] text-slate-500 text-center font-medium leading-relaxed">
                {!isOtpVerified
                  ? 'Vui lòng nhập mã OTP'
                  : 'Xác thực thành công! Hãy đặt mật khẩu mới bên dưới.'}
              </p>
            </div>

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-semibold rounded-xl text-center">
                {successMsg}
              </div>
            )}

            {displayError && (
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-semibold rounded-xl flex items-center space-x-1.5 animate-shake">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{displayError}</span>
              </div>
            )}

            {!isOtpVerified ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const enteredOtp = otpArray.join('');
                  if (enteredOtp !== expectedOtp) {
                    setErrorMsg('Mã OTP không chính xác. Vui lòng kiểm tra lại.');
                    return;
                  }
                  setErrorMsg(null);
                  setSuccessMsg('OTP được xác thực chính xác!');
                  setIsOtpVerified(true);
                  setTimeout(() => setSuccessMsg(null), 2500);
                }}
                className="space-y-5 animate-slide-up"
              >
                <div className="flex justify-between items-center gap-1 px-1">
                  {otpArray.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-input-${index}`}
                      type="text"
                      pattern="\d*"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                      className="w-11 h-11 text-center text-lg font-black text-slate-800 bg-white/80 border-2 border-slate-200 focus:border-sky-500 focus:bg-sky-50/20 rounded-xl outline-none transition-all duration-200 shadow-sm font-mono"
                      required
                    />
                  ))}
                </div>

                <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                  {otpCountdown > 0 ? (
                    <span>Gửi lại OTP sau 00:{otpCountdown.toString().padStart(2, '0')}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => issueForgotOtp(true)}
                      className="text-sky-500 font-bold hover:underline"
                      disabled={submittingForgot}
                    >
                      Gửi lại OTP
                    </button>
                  )}
                </p>

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-sky-100 transition active:scale-95 uppercase tracking-wider"
                >
                  XÁC NHẬN
                </button>

                <div className="text-center pt-1">
                  <span
                    onClick={() => switchMode('FORGOT')}
                    className="text-[10px] text-sky-500 font-bold hover:underline cursor-pointer"
                  >
                    Quay lại gửi yêu cầu
                  </span>
                </div>
              </form>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (forgotNewPassword.length < 6) {
                    setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự!');
                    return;
                  }
                  if (forgotNewPassword !== forgotConfirmPassword) {
                    setErrorMsg('Mật khẩu mới không trùng khớp!');
                    return;
                  }
                  if (!resetToken) {
                    setErrorMsg('Phiên đặt lại mật khẩu không hợp lệ. Vui lòng gửi lại OTP.');
                    setIsOtpVerified(false);
                    return;
                  }

                  setSubmittingForgot(true);
                  setErrorMsg(null);
                  try {
                    await hdvService.datLaiMatKhau({
                      resetToken,
                      matKhauMoi: forgotNewPassword,
                      xacNhanMatKhau: forgotConfirmPassword
                    });
                    setSuccessMsg('Đặt lại mật khẩu thành công! Hãy đăng nhập bằng mật khẩu mới.');
                    setForgotEmail('');
                    setForgotNewPassword('');
                    setForgotConfirmPassword('');
                    setOtpArray(['', '', '', '', '', '']);
                    setExpectedOtp('');
                    setResetToken('');
                    setIsOtpVerified(false);
                    setMode('LOGIN');
                  } catch (err: any) {
                    setErrorMsg(err?.response?.data?.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
                  } finally {
                    setSubmittingForgot(false);
                  }
                }}
                className="space-y-3.5 animate-slide-up"
              >
                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Mật khẩu mới..."
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70"
                    required
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 block mb-0.5 uppercase">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Xác nhận mật khẩu mới..."
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-sky-400 outline-none transition bg-white/70"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingForgot}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-750 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-98 animate-pulse-subtle"
                >
                  {submittingForgot ? 'Đang cập nhật...' : 'Cập nhật mật khẩu mới'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="z-10 text-center space-y-4 w-full animate-slide-up mt-auto" style={{ animationDelay: '200ms' }}>
        <footer className="mt-6 text-center space-y-2 w-full pb-2">
          <div className="flex items-center justify-center space-x-3 text-[10px] text-slate-400 font-medium">
            <a href="mailto:support@digitaltravel.vn" className="hover:text-sky-500 transition">Hỗ trợ</a>
            <span className="text-slate-300">•</span>
            <button type="button" onClick={() => setSuccessMsg('Thông tin bảo mật đang được cập nhật.')} className="hover:text-sky-500 transition">Bảo mật</button>
            <span className="text-slate-300">•</span>
            <button type="button" onClick={() => setSuccessMsg('Điều khoản sử dụng đang được cập nhật.')} className="hover:text-sky-500 transition">Điều khoản</button>
          </div>

          <div className="flex items-center justify-center space-x-2 text-[9px] text-slate-400">
            <span>© 2026 Digital Travel ERP</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <div className="flex items-center space-x-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span>v2.4.0</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
