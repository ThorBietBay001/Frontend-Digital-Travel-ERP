import { useState } from 'react';
import { CheckCircle2, Lock, Mail, Phone, User, X } from 'lucide-react';
import { khService } from '../../services/khService';
import { mapProfile, unwrapData } from '../../services/apiHelpers';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
}

type AuthMode = 'dangNhap' | 'register' | 'forgot';

export default function CuaSoXacThuc({ onClose, onLoginSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('dangNhap');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (message: string, type: 'error' | 'success' = 'error') => {
    setSystemMessage(message);
    setMessageType(type);
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setSystemMessage('');
  };

  const saveAuthSession = async (response: any, fallbackUsername: string) => {
    const data = unwrapData<any>(response);
    const token = data.accessToken || data.token;
    if (token) {
      localStorage.setItem('token', token);
    }

    try {
      const profileResponse = await khService.layHoChieuSo();
      localStorage.setItem('userProfile', JSON.stringify(mapProfile(unwrapData<any>(profileResponse))));
    } catch {
      localStorage.setItem('userProfile', JSON.stringify({
        fullName: data.hoTen || data.tenHienThi || fallbackUsername,
        username: fallbackUsername,
        email,
        phone,
        greenPoints: 0,
        membershipTier: 'THANH_VIEN'
      }));
    }
  };

  const validateForm = () => {
    if (mode === 'forgot') {
      if (!identifier.trim()) {
        showMessage('Vui lòng nhập tên đăng nhập đã đăng ký.');
        return false;
      }
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
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSystemMessage('');

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (mode === 'forgot') {
        await khService.quenMatKhau(identifier.trim());
        showMessage('Yêu cầu khôi phục mật khẩu đã được gửi lên hệ thống.', 'success');
        return;
      }

      if (mode === 'dangNhap') {
        const response = await khService.dangNhap(identifier.trim(), password);
        await saveAuthSession(response, identifier.trim());
        onLoginSuccess();
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
      await saveAuthSession(response, username.trim());
      onLoginSuccess();
    } catch (err: any) {
      showMessage(err?.response?.data?.message || 'Hệ thống chưa xử lý được yêu cầu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const title = mode === 'dangNhap'
    ? 'Đăng nhập khách hàng'
    : mode === 'register'
      ? 'Đăng ký tài khoản'
      : 'Khôi phục mật khẩu';

  const description = mode === 'dangNhap'
    ? 'Nhập tài khoản từ hệ thống ERP để tiếp tục đặt tour.'
    : mode === 'register'
      ? 'Tài khoản mới sẽ được tạo trực tiếp qua Auth API.'
      : 'Nhập tên đăng nhập đã đăng ký để gửi yêu cầu khôi phục lên hệ thống.';

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

        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 text-blue-600 mb-4">
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
          {(mode === 'dangNhap' || mode === 'forgot') ? (
            <label className="block">
              <span className="text-xs font-black text-slate-500 uppercase">
                {mode === 'forgot' ? 'Tên đăng nhập đã đăng ký' : 'Tên đăng nhập'}
              </span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                {mode === 'forgot' ? <Mail className="w-4 h-4 text-slate-400" /> : <User className="w-4 h-4 text-slate-400" />}
                <input
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full outline-none text-sm"
                  placeholder={mode === 'forgot' ? 'Ví dụ: kh01' : 'Ví dụ: kh01'}
                />
              </div>
            </label>
          ) : (
            <>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Tên đăng nhập</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <User className="w-4 h-4 text-slate-400" />
                  <input value={username} onChange={e => setUsername(e.target.value)} className="w-full outline-none text-sm" />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Email</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full outline-none text-sm" />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-black text-slate-500 uppercase">Số điện thoại</span>
                <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <input value={phone} onChange={e => setPhone(e.target.value)} className="w-full outline-none text-sm" />
                </div>
              </label>
            </>
          )}

          {mode !== 'forgot' && (
            <label className="block">
              <span className="text-xs font-black text-slate-500 uppercase">Mật khẩu</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full outline-none text-sm"
                />
              </div>
            </label>
          )}

          {mode === 'register' && (
            <label className="block">
              <span className="text-xs font-black text-slate-500 uppercase">Xác nhận mật khẩu</span>
              <div className="mt-1 flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 focus-within:border-blue-500">
                <Lock className="w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full outline-none text-sm"
                />
              </div>
            </label>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-black text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isLoading
              ? 'Đang xử lý...'
              : mode === 'dangNhap'
                ? 'Đăng nhập'
                : mode === 'register'
                  ? 'Đăng ký'
                  : 'Gửi yêu cầu khôi phục'}
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
