import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Plus, Trash2 } from 'lucide-react';
import type { Competency, Staff } from './mockData';
import { hrService } from '../../../services/system/hr';
import type { NangLucResponse, NangLucRequest } from '../../../services/system/hr';

interface CompetencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

const CompetencyModal: React.FC<CompetencyModalProps> = ({
  isOpen,
  onClose,
  staff,
}) => {
  const [draftCompetencies, setDraftCompetencies] = useState<Competency[]>([]);
  const [newType, setNewType] = useState<Competency['type']>('Ngôn ngữ');
  const [newName, setNewName] = useState('');
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  const parseCompetencies = (res: NangLucResponse): Competency[] => {
    const result: Competency[] = [];
    let idCounter = 1;

    const parseString = (str: string, type: 'Ngôn ngữ' | 'Chứng chỉ' | 'Thế mạnh') => {
      if (!str) return;
      const items = str.split(',');
      items.forEach(item => {
        const match = item.match(/(.*?)(?:\((.*?)\))?$/);
        if (match) {
          result.push({
            id: idCounter++,
            type,
            name: match[1].trim(),
            note: match[2]?.trim()
          });
        }
      });
    };

    parseString(res.ngonNgu || '', 'Ngôn ngữ');
    parseString(res.chungChi || '', 'Chứng chỉ');
    parseString(res.chuyenMon || '', 'Thế mạnh');
    return result;
  };

  const serializeCompetencies = (comps: Competency[]): NangLucRequest => {
    const ngonNgu = comps.filter(c => c.type === 'Ngôn ngữ').map(c => c.note ? `${c.name} (${c.note})` : c.name).join(', ');
    const chungChi = comps.filter(c => c.type === 'Chứng chỉ').map(c => c.note ? `${c.name} (${c.note})` : c.name).join(', ');
    const chuyenMon = comps.filter(c => c.type === 'Thế mạnh').map(c => c.note ? `${c.name} (${c.note})` : c.name).join(', ');
    return { ngonNgu, chungChi, chuyenMon };
  };

  useEffect(() => {
    if (isOpen && staff) {
      setNewType('Ngôn ngữ');
      setNewName('');
      setNewNote('');
      setLoading(true);
      hrService.nangLucNhanVien(staff.id)
        .then(res => {
          setDraftCompetencies(parseCompetencies(res || {}));
        })
        .catch(err => {
          console.error(err);
          setDraftCompetencies([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!isOpen) {
      setDraftCompetencies([]);
    }
  }, [staff, isOpen]);

  const typeOptions = useMemo(
    () => [
      { value: 'Ngôn ngữ', label: 'Ngôn ngữ' },
      { value: 'Chứng chỉ', label: 'Chứng chỉ' },
      { value: 'Thế mạnh', label: 'Thế mạnh' },
    ],
    []
  );

  if (!staff) return null;

  const typeVariantMap: Record<Competency['type'], 'success' | 'warning' | 'error' | 'info'> = {
    'Ngôn ngữ': 'info',
    'Chứng chỉ': 'success',
    'Thế mạnh': 'warning',
  };

  const handleAddCompetency = () => {
    if (!newName.trim()) return;

    const nextCompetency: Competency = {
      id: Date.now(),
      type: newType,
      name: newName.trim(),
      note: newNote.trim() || undefined,
    };

    setDraftCompetencies((prev) => [...prev, nextCompetency]);
    setNewName('');
    setNewNote('');
  };

  const handleRemove = (competencyId: number) => {
    const confirmed = window.confirm('Xóa năng lực này khỏi danh sách?');
    if (!confirmed) return;

    setDraftCompetencies((prev) => prev.filter((item) => item.id !== competencyId));
  };

  const handleSave = async () => {
    if (!staff) return;
    try {
      setLoading(true);
      const data = serializeCompetencies(draftCompetencies);
      await hrService.capNhatNangLuc(staff.id, data);
      alert(`Năng lực của ${staff.name} đã được cập nhật.`);
      onClose();
    } catch (err) {
      alert('Lỗi cập nhật năng lực. ' + (err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cập nhật năng lực - ${staff.name}`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Lưu thay đổi
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3 relative">
          <h4 className="text-sm font-semibold text-gray-800">Năng lực hiện tại</h4>
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm rounded-[12px]">
              <div className="w-8 h-8 border-4 border-[#00668A] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <div className="flex flex-col gap-3 min-h-[100px]">
            {draftCompetencies.length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                Chưa có năng lực nào được ghi nhận.
              </p>
            ) : (
              draftCompetencies.map((competency) => (
                <div
                  key={competency.id}
                  className="flex items-start justify-between gap-4 rounded-[12px] border border-[#E1F1FF] bg-white p-4"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        label={competency.type}
                        variant={typeVariantMap[competency.type]}
                        dot={false}
                      />
                      <span className="text-sm font-semibold text-gray-800">
                        {competency.name}
                      </span>
                    </div>
                    {competency.note && (
                      <span className="text-xs text-gray-500">{competency.note}</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={18} />}
                    onClick={() => handleRemove(competency.id)}
                    className="px-2 text-[#BA1A1A] hover:text-[#BA1A1A]"
                    aria-label="Xóa năng lực"
                  />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4 rounded-xl border-2 border-dashed border-sky-100 bg-[#F4F9FF] p-4">
          <h4 className="text-sm font-semibold text-gray-800">Thêm năng lực mới</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Loại"
              options={typeOptions}
              value={newType}
              onChange={(value) => setNewType(value as Competency['type'])}
            />
            <div className="md:col-span-2">
              <label className="text-[14px] font-semibold text-gray-700">Tên năng lực</label>
              <input
                type="text"
                placeholder="VD: Tiếng Anh, Sơ cứu..."
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                className="mt-1 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
              />
            </div>
          </div>
          <div>
            <label className="text-[14px] font-semibold text-gray-700">
              Ghi chú (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: IELTS 7.0..."
              value={newNote}
              onChange={(event) => setNewNote(event.target.value)}
              className="mt-1 w-full px-4 py-2.5 bg-white border border-[#C5EAFF] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-[#89D4FF] focus:ring-2 focus:ring-[#89D4FF]/20"
            />
          </div>
          <Button
            variant="secondary"
            icon={<Plus size={18} />}
            onClick={handleAddCompetency}
            disabled={!newName.trim()}
          >
            Thêm vào danh sách
          </Button>
        </section>
      </div>
    </Modal>
  );
};

export default CompetencyModal;
