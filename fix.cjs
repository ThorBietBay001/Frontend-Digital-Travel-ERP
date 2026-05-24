const fs = require('fs');
let content = fs.readFileSync('src/pages/finance/cost-management/CostApprovalModal.tsx', 'utf-8');

// 1. Add imports
content = content.replace(
  'import type { CostItem } from \'./mockData\';',
  'import type { CostItem } from \'./mockData\';\nimport { tourInstanceService } from \'../../../services/tour-instance\';\nimport { accountsService } from \'../../../services/system/accounts\';'
);

// 2. Add extraDetails state and useEffect
const oldUseEffect = `  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setNote('');
      setNoteError('');
    }
  }, [isOpen, cost?.id]);`;

const newUseEffect = `  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const [extraDetails, setExtraDetails] = useState<{ tourName: string; guidePhone: string }>({
    tourName: 'Đang tải...',
    guidePhone: 'Đang tải...',
  });

  useEffect(() => {
    if (isOpen && cost) {
      setNote('');
      setNoteError('');
      
      setExtraDetails({
        tourName: cost.tourName && cost.tourName !== 'Đang tải...' ? cost.tourName : 'Đang tải...',
        guidePhone: cost.guidePhone && cost.guidePhone !== 'Đang tải...' ? cost.guidePhone : 'Đang tải...',
      });

      if (!cost.tourName || cost.tourName === 'Đang tải...') {
        tourInstanceService.chiTiet(cost.tourCode).then(res => {
          if (res && res.tieuDeTour) {
            setExtraDetails(prev => ({ ...prev, tourName: res.tieuDeTour! }));
          } else {
            setExtraDetails(prev => ({ ...prev, tourName: 'Không xác định' }));
          }
        }).catch(() => {
          setExtraDetails(prev => ({ ...prev, tourName: 'Lỗi tải dữ liệu' }));
        });
      }

      if ((!cost.guidePhone || cost.guidePhone === 'Đang tải...') && cost.guideId) {
        accountsService.chiTietNhanVien(cost.guideId).then(res => {
          if (res && res.soDienThoai) {
            setExtraDetails(prev => ({ ...prev, guidePhone: res.soDienThoai! }));
          } else {
            setExtraDetails(prev => ({ ...prev, guidePhone: 'Chưa cập nhật' }));
          }
        }).catch(() => {
          setExtraDetails(prev => ({ ...prev, guidePhone: 'Chưa cập nhật' }));
        });
      }
    }
  }, [isOpen, cost?.id]);`;

content = content.replace(oldUseEffect, newUseEffect);

// 3. Update the UI for tourName and guidePhone
content = content.replace(
  '{cost.tourName || \'—\'}',
  '{extraDetails.tourName}'
);
content = content.replace(
  '{cost.guidePhone || \'—\'}',
  '{extraDetails.guidePhone}'
);

// 4. Update image placeholder to mockData image
content = content.replace(
  '<span className=\"text-gray-500 font-medium\">Không có ảnh hóa đơn</span>',
  '<img src=\"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80\" alt=\"Ảnh hóa đơn mẫu\" className=\"w-full h-full object-cover opacity-60\" />'
);

// 5. Add Ghi chú duyệt display when readonly
const oldReadonlyGhiChu = `          {!isReadonly && (
            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
              <label className="text-sm font-semibold text-gray-700">Ghi chú duyệt</label>`;

const newReadonlyGhiChu = `          {isReadonly && cost.resolutionNote && (
            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
              <h3 className="text-[16px] font-semibold text-gray-900 mb-2">Ghi chú duyệt</h3>
              <div className="bg-gray-50 rounded-[12px] p-4 border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                {cost.resolutionNote}
              </div>
            </div>
          )}

          {!isReadonly && (
            <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6">
              <label className="text-[16px] font-semibold text-gray-900">Ghi chú duyệt</label>`;

content = content.replace(oldReadonlyGhiChu, newReadonlyGhiChu);

fs.writeFileSync('src/pages/finance/cost-management/CostApprovalModal.tsx', content, 'utf-8');
