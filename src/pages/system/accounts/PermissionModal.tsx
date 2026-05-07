import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { Account } from './mockData';
import { allPermissions, permissionsMap, allRoles } from './mockData';
import { accountsService } from '../../../services/system/accounts';
import { ROLE_VALUE_MAP } from './AccountList';

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSuccess?: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ isOpen, onClose, account, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState(account?.role || '');

  useEffect(() => {
    setSelectedRole(account?.role || '');
  }, [account, isOpen]);

  if (!account) return null;

  const allowedPermissions = permissionsMap[selectedRole] || [];

  const handleSave = async () => {
    try {
      const maVaiTro = ROLE_VALUE_MAP[selectedRole] || 'KINHDOANH';
      await accountsService.ganVaiTro(account.id, { maVaiTro });
      alert('Phân quyền thành công');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      alert('Lỗi phân quyền. ' + (err instanceof Error ? err.message : ''));
    }
  };

  const roleOptions = allRoles.map((r) => ({ value: r, label: r }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Phân quyền truy cập - ${account.name}`}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={selectedRole === account.role}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <Select
            label="Vai trò"
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            placeholder="Chọn vai trò..."
          />
        </div>

        <div className="space-y-2">
          {allPermissions.map((permission) => {
            const checked = allowedPermissions.includes(permission);
            return (
              <label
                key={permission}
                className="flex items-center gap-3 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled
                  className="h-4 w-4 rounded border-gray-300 text-[#00668A] focus:ring-[#89D4FF]"
                />
                <span>{permission}</span>
              </label>
            );
          })}
        </div>

        <p className="text-xs text-gray-500">
          Quyền được tự động gán dựa trên Vai trò. Để thay đổi quyền hạn, vui lòng chọn Vai trò tương ứng.
        </p>
      </div>
    </Modal>
  );
};

export default PermissionModal;
