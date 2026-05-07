import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { Account } from './mockData';
import { allRoles, initialAccounts } from './mockData';
import { accountsService } from '../../../services/system/accounts';
import { ROLE_VALUE_MAP } from './AccountList';

interface AccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialData?: Account;
  onSubmit: () => void;
}

interface FormErrors {
  name?: string;
  email?: string;
  username?: string;
  password?: string;
  role?: string;
}

const AccountFormModal: React.FC<AccountFormModalProps> = ({
  isOpen,
  onClose,
  mode,
  initialData,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<Account>({
    id: '',
    code: '',
    name: '',
    email: '',
    phone: '',
    username: '',
    role: '',
    status: 'active',
  });
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        id: initialData?.id ?? '',
        code: initialData?.code ?? '',
        name: initialData?.name ?? '',
        email: initialData?.email ?? '',
        phone: initialData?.phone ?? '',
        username: initialData?.username ?? '',
        role: initialData?.role ?? '',
        status: initialData?.status ?? 'active',
      });
      setPassword('');
      setErrors({});
    }
  }, [initialData, isOpen]);

  const roleOptions = allRoles.map((role) => ({ value: role, label: role }));

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-z0-9._-]+$/;

    if (!formData.name.trim()) {
      nextErrors.name = 'Vui lòng nhập họ tên.';
    }

    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Email không hợp lệ.';
    }

    if (!formData.username.trim()) {
      nextErrors.username = 'Vui lòng nhập username.';
    } else if (!usernameRegex.test(formData.username.trim())) {
      nextErrors.username = 'Username chỉ gồm a-z, 0-9 và ký tự . _ -';
    } else {
      const normalized = formData.username.trim().toLowerCase();
      const existingUsernames = initialAccounts.map((account) =>
        account.username.toLowerCase()
      );
      const isDuplicate =
        existingUsernames.includes(normalized) &&
        normalized !== (initialData?.username ?? '').toLowerCase();
      if (isDuplicate) {
        nextErrors.username = 'Username đã tồn tại trong hệ thống.';
      }
    }

    if (mode === 'create' && password.trim().length < 6) {
      nextErrors.password = 'Mật khẩu tối thiểu 6 ký tự.';
    }

    if (!formData.role) {
      nextErrors.role = 'Vui lòng chọn vai trò.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    if (mode === 'edit') {
      alert('Chức năng cập nhật thông tin tài khoản hiện chưa được hỗ trợ từ phía Backend.');
      return;
    }

    try {
      await accountsService.dangKyNhanVien({
        tenDangNhap: formData.username.trim(),
        matKhau: password,
        hoTen: formData.name.trim(),
        email: formData.email.trim(),
        soDienThoai: formData.phone.trim(),
        maVaiTro: ROLE_VALUE_MAP[formData.role] || 'KINHDOANH'
      });
      alert('Tạo tài khoản thành công.');
      onSubmit();
      onClose();
    } catch (err) {
      alert('Lỗi tạo tài khoản. ' + (err instanceof Error ? err.message : ''));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'create'
          ? 'Thêm tài khoản mới'
          : `Chỉnh sửa tài khoản - ${initialData?.code ?? ''}`
      }
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Lưu
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-[14px] font-semibold text-gray-700">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, name: event.target.value }))
            }
            className="mt-1 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="text-[14px] font-semibold text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, email: event.target.value }))
            }
            className="mt-1 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        <div>
          <label className="text-[14px] font-semibold text-gray-700">Số điện thoại</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, phone: event.target.value }))
            }
            className="mt-1 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
          />
        </div>

        <div>
          <label className="text-[14px] font-semibold text-gray-700">
            Username <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.username}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, username: event.target.value }))
            }
            className="mt-1 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-500">{errors.username}</p>
          )}
        </div>

        {mode === 'create' && (
          <div>
            <label className="text-[14px] font-semibold text-gray-700">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password}</p>
            )}
          </div>
        )}

        <div>
          <Select
            label="Vai trò"
            options={roleOptions}
            value={formData.role}
            onChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
            placeholder="Chọn vai trò"
          />
          {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
        </div>

        <div>
          <label className="text-[14px] font-semibold text-gray-700">Trạng thái</label>
          <div className="mt-2 inline-flex rounded-lg border border-[#C5EAFF] bg-[#F9F9FF] p-1">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, status: 'active' }))}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                formData.status === 'active'
                  ? 'bg-[#89D4FF] text-white'
                  : 'text-gray-600 hover:text-[#00668A]'
              }`}
            >
              Đang hoạt động
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, status: 'locked' }))}
              className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
                formData.status === 'locked'
                  ? 'bg-[#BA1A1A] text-white'
                  : 'text-gray-600 hover:text-[#BA1A1A]'
              }`}
            >
              Bị khóa
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AccountFormModal;
