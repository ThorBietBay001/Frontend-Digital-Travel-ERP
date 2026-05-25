import { useState, useEffect } from 'react';
import { CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, User, X } from 'lucide-react';
import { khService } from '../../services/khService';
import { mapProfile, unwrapData } from '../../services/apiHelpers';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

type AuthMode = 'dangNhap' | 'register' | 'register-otp' | 'forgot' | 'forgot-otp' | 'reset';

export default function CuaSoXacThuc({ onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('dangNhap');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [otp, setOtp] = useState('');
  const [expectedOtp, setExpectedOtp] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [isLoading, setIsLoading] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);

  useEffect(() => {
    let timer: any;
    if ((mode === 'forgot-otp' || mode === 'register-otp') && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [mode, otpCountdown]);

  const showMessage = (message: string, type: 'error' | 'success' = 'error') => {
    setSystemMessage(message);
    setMessageType(type);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setSystemMessage('');
  };

  const saveAuthSession = async (response: any) => {
    const data = unwrapData<any>(response);
    const token = data.accessToken || data.token;
    if (!token || data.maVaiTro !== 'KHACHHANG') {
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      throw new Error('Tài khoản này không thuộc cổng khách hàng.');
    }

    localStorage.setItem('token', token);
    try {
      const profileResponse = await khService.layHoChieuSo();
      localStorage.setItem('userProfile', JSON.stringify(mapProfile(unwrapData<any>(profileResponse))));
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      throw error;
    }
  };

  const validateForm = () => {
    if (mode === 'forgot') {
      if (!identifier.trim()) {
        showMessage('Vui lòng nhập Email đã đăng ký.');
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier.trim())) {
        showMessage('Email không đúng định dạng.');
        return false;
      }
      return true;
    }

    if (mode === 'forgot-otp') {
      if (!otp) { showMessage('Vui lòng nhập mã OTP.'); return false; }
      return true;
    }

    if (mode === 'reset') {
      if (!password) { showMessage('Vui lòng nhập mật khẩu mới.'); return false; }
      if (password.length < 6) { showMessage('Mật khẩu phải có ít nhất 6 ký tự.'); return false; }
      if (password !== confirmPassword) { showMessage('Mật khẩu xác nhận không trùng khớp.'); return false; }
      return true;
    }

    if (mode === 'dangNhap') {
      if (!identifier.trim()) {
        showMessage('Vui lòng nhập tên đăng nhập.');
        return false;
      }
      if (!password) {
        showMessage('Vui lòng nhập mật khẩu.');
        return false;
      }
      return true;
    }

    if (username.trim().length < 4) {
      showMessage('Tên đăng nhập phải có ít nhất 4 ký tự.');
      return false;
    }
    if (!email.trim()) {
      showMessage('Vui lòng nhập Email.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showMessage('Email không đúng định dạng.');
      return false;
    }
    if (!password) {
      showMessage('Vui lòng nhập mật khẩu.');
      return false;
    }
    if (password.length < 6) {
      showMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return false;
    }
    if (password !== confirmPassword) {
      showMessage('Mật khẩu xác nhận không trùng khớp.');
      return false;
    }

    if (mode === 'register-otp') {
      if (!otp) { showMessage('Vui lòng nhập mã OTP.'); return false; }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSystemMessage('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'forgot') {
        const response = await khService.quenMatKhau(identifier.trim());
        setResetToken(response.data);
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setExpectedOtp(generatedOtp);
        setOtpCountdown(60);
        setOtp('');
        showMessage(`Mã OTP khôi phục của bạn là: ${generatedOtp}. Vui lòng nhập để tiếp tục.`, 'success');
        setMode('forgot-otp');
        return;
      }

      if (mode === 'forgot-otp') {
        if (otp !== expectedOtp) {
          showMessage('Mã OTP không chính xác. Vui lòng kiểm tra lại.', 'error');
          setIsLoading(false);
          return;
        }
        showMessage('Xác minh OTP thành công! Vui lòng nhập mật khẩu mới.', 'success');
        setMode('reset');
        return;
      }

      if (mode === 'reset') {
        await khService.datLaiMatKhau({ resetToken, matKhauMoi: password, xacNhanMatKhau: confirmPassword });
        showMessage('Khôi phục mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
        setMode('dangNhap');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
        return;
      }

      if (mode === 'dangNhap') {
        const response = await khService.dangNhap(identifier.trim(), password);
        await saveAuthSession(response);
        onLoginSuccess();
        return;
      }

      if (mode === 'register') {
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        setExpectedOtp(generatedOtp);
        setOtpCountdown(60);
        setOtp('');
        setMode('register-otp');
        showMessage(`Mã OTP xác thực đăng ký là: ${generatedOtp}. Vui lòng nhập để hoàn tất.`, 'success');
        return;
      }

      if (mode === 'register-otp') {
        if (otp !== expectedOtp) {
          showMessage('Mã OTP không chính xác. Vui lòng kiểm tra lại.', 'error');
          setIsLoading(false);
          return;
        }
        await khService.register({
          tenDangNhap: username.trim(),
          matKhau: password,
          xacNhanMatKhau: confirmPassword,
          hoTen: username.trim(),
          email: email.trim(),
          soDienThoai: phone.trim(),
          cccd: ''
        });

        const response = await khService.dangNhap(username.trim(), password);
        await saveAuthSession(response);
        onLoginSuccess();
        return;
      }
    } catch (err: any) {
      showMessage(err?.response?.data?.message || err?.message || 'Hệ thống chưa xử lý được yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      if (mode === 'forgot-otp') {
        const response = await khService.quenMatKhau(identifier.trim());
        setResetToken(response.data);
      }
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedOtp(generatedOtp);
      setOtpCountdown(60);
      setOtp('');
      showMessage(`Mã OTP mới của bạn là: ${generatedOtp}.`, 'success');
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'dangNhap'
    ? 'Đăng nhập khách hàng'
    : mode === 'register'
      ? 'Đăng ký tài khoản'
      : mode === 'register-otp'
        ? 'Xác thực tài khoản'
        : mode === 'forgot-otp'
          ? 'Xác nhận mã bảo mật'
          : mode === 'reset' ? 'Tạo mật khẩu mới' : 'Khôi phục mật khẩu';

  const description = mode === 'dangNhap'
    ? 'Nhập tài khoản từ hệ thống ERP để tiếp tục đặt tour.'
    : mode === 'register'
      ? 'Tài khoản mới sẽ được tạo trực tiếp qua Auth API.'
      : mode === 'register-otp'
        ? 'Nhập mã OTP được gửi về điện thoại / email của bạn.'
        : mode === 'forgot-otp'
          ? 'Nhập mã OTP đã được gửi đến email để xác minh.'
          : mode === 'reset' ? 'Thiết lập mật khẩu mới cho tài khoản của bạn.' : 'Nhập Email để khôi phục mật khẩu.';

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl border border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-blue-50 text-blue-600 mb-4 mx-auto">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

        {systemMessage && (
          <div className={`mb-4 rounded-xl border px-4 py-3 text-sm font-semibold flex items-start gap-2 ${
            messageType === 'success'
              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
              : 'border-red-100 bg-red-50 text-red-700'
          }`}>
            {messageType === 'success' && <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />}
            <span>{systemMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {mode === 'reset' ? (
            <>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Mật khẩu mới</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full outline-none text-sm"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Xác nhận mật khẩu</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full outline-none text-sm"
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </label>
            </>
          ) : mode === 'forgot-otp' ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600 font-medium">Mã xác thực (OTP) đã được gửi đến</p>
                <p className="text-slate-900 font-bold mt-1">{identifier}</p>
              </div>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    id={`forgot-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otp[idx] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      let nextOtp = otp.split('');
                      nextOtp[idx] = val;
                      setOtp(nextOtp.join(''));
                      if (val && idx < 5) document.getElementById(`forgot-otp-${idx + 1}`)?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`forgot-otp-${idx - 1}`)?.focus();
                    }}
                    className="w-12 h-12 text-center text-xl font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 text-center font-medium mt-4">
                Bạn chưa nhận được mã?{' '}
                {otpCountdown > 0 ? (
                  <span className="text-blue-600 font-bold">
                    Gửi lại OTP (00:{otpCountdown.toString().padStart(2, '0')})
                  </span>
                ) : (
                  <span 
                    onClick={handleResendOtp} 
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Gửi lại OTP
                  </span>
                )}
              </p>
            </div>
          ) : mode === 'register-otp' ? (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600 font-medium">Mã xác thực (OTP) đã được gửi đến</p>
                <p className="text-slate-900 font-bold mt-1">{email}</p>
              </div>
              <div className="flex justify-center space-x-2">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <input
                    key={idx}
                    id={`reg-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otp[idx] || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      let nextOtp = otp.split('');
                      nextOtp[idx] = val;
                      setOtp(nextOtp.join(''));
                      if (val && idx < 5) document.getElementById(`reg-otp-${idx + 1}`)?.focus();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[idx] && idx > 0) document.getElementById(`reg-otp-${idx - 1}`)?.focus();
                    }}
                    className="w-12 h-12 text-center text-xl font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-500 text-center font-medium mt-4">
                Bạn chưa nhận được mã?{' '}
                {otpCountdown > 0 ? (
                  <span className="text-blue-600 font-bold">
                    Gửi lại OTP (00:{otpCountdown.toString().padStart(2, '0')})
                  </span>
                ) : (
                  <span 
                    onClick={handleResendOtp} 
                    className="text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    Gửi lại OTP
                  </span>
                )}
              </p>
            </div>
          ) : (mode === 'dangNhap' || mode === 'forgot') ? (
            <>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">
                  {mode === 'forgot' ? 'Email đã đăng ký' : 'Tên đăng nhập'}
                </span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  {mode === 'forgot' ? <Mail className="w-4 h-4 text-slate-400" /> : <User className="w-4 h-4 text-slate-400" />}
                  <input
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    className="w-full outline-none text-sm"
                    placeholder={mode === 'forgot' ? 'Ví dụ: name@domain.com' : 'Ví dụ: kh01'}
                  />
                </div>
              </label>
              {mode === 'dangNhap' && (
                <label className="block">
                  <span className="text-xs font-black text-slate-500 uppercase">Mật khẩu</span>
                  <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full outline-none text-sm"
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>
              )}
            </>
          ) : (
            <>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Tên đăng nhập</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <User className="w-4 h-4 text-slate-400" />
                  <input value={username} onChange={e => setUsername(e.target.value)} className="w-full outline-none text-sm" placeholder="Ví dụ: khachhang01" />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Email</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full outline-none text-sm" placeholder="Ví dụ: name@domain.com" />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Số điện thoại</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full outline-none text-sm" placeholder="Ví dụ: 0987654321" />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Mật khẩu</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full outline-none text-sm"
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Xác nhận mật khẩu</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full outline-none text-sm"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'dangNhap' ? 'Đăng nhập'
              : mode === 'register' ? 'Tiếp tục'
              : mode === 'register-otp' ? 'Xác thực & Đăng ký'
              : mode === 'forgot' ? 'Gửi mã khôi phục'
              : mode === 'forgot-otp' ? 'Xác minh OTP'
                : 'Xác nhận đổi mật khẩu'}
          </button>
        </form>

        <div className="mt-5 space-y-3 text-center">
          {mode === 'dangNhap' && (
            <button type="button" onClick={() => switchMode('forgot')} className="block w-full text-sm font-bold text-blue-600 hover:text-blue-700">
              Quên mật khẩu?
            </button>
          )}
          <button
            type="button"
            onClick={() => switchMode(mode === 'dangNhap' ? 'register' : 'dangNhap')}
            className="w-full text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            {mode === 'dangNhap' ? 'Chưa có tài khoản? Đăng ký' : 'Quay lại đăng nhập'}
          </button>
        </div>
      </div>
    </div>
  );
}
