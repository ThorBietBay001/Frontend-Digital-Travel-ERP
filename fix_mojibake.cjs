const fs = require('fs');
let content = fs.readFileSync('src/pages/finance/cost-management/CostApprovalModal.tsx', 'utf-8');

const replacements = {
  'Cnh bAo vt `<nh mcc': 'Cảnh báo vượt định mức',
  'Thiu chcng t': 'Thiếu chứng từ',
  'Vui lAng nh-p lA do t ch`i': 'Vui lòng nhập lý do từ chối',
  'T ch`i': 'Từ chối',
  'PhA duyt chi phA-': 'Phê duyệt chi phí',
  'PhA duyt': 'Phê duyệt',
  '?A3ng': 'Đóng',
  'Chi tit chi phA-': 'Chi tiết chi phí',
  'HA3a `n chi phA-': 'Hóa đơn chi phí',
  'nh hA3a `n': 'Ảnh hóa đơn',
  'KhA\'ng cA3 nh hA3a `n': 'Không có ảnh hóa đơn',
  'Chp lAc': 'Chụp lúc',
  'HA NTi, Vit Nam': 'Hà Nội, Việt Nam',
  'ThA\'ng tin tour & HDV': 'Thông tin tour & HDV',
  'MA tour': 'Mã tour',
  'TAn tour': 'Tên tour',
  'H>ng dn viAn': 'Hướng dẫn viên',
  'S?T': 'SĐT',
  '?"': '—',
  'Chi tit hng mc': 'Chi tiết hạng mục',
  'Hng mc': 'Hạng mục',
  'S` ti?n': 'Số tiền',
  'Trng thAi': 'Trạng thái',
  '?A duyt': 'Đã duyệt',
  'Cnh bAo chi phA-': 'Cảnh báo chi phí',
  'Ghi chA duyt': 'Ghi chú duyệt',
  'Nh-p ghi chA duyt...': 'Nhập ghi chú duyệt...',
  'MA tour': 'Mã tour',
  'TAn tour': 'Tên tour',
  'H>ng dn viAn': 'Hướng dẫn viên',
  'S?T': 'SĐT',
  'nh hA3a `n mu': 'Ảnh hóa đơn mẫu',
  'ThA\'ng tin tour & HDV': 'Thông tin tour & HDV',
  'Chi tit hng mc': 'Chi tiết hạng mục',
  'Hng mc': 'Hạng mục',
  'S` ti?n': 'Số tiền'
};

for (const [bad, good] of Object.entries(replacements)) {
  content = content.split(bad).join(good);
}

// Ensure the new useEffect and state are correct
if (!content.includes('tourInstanceService.chiTiet')) {
    // If not present, the previous fix might have been lost when reverting.
    console.log("Missing useEffect logic, applying again...");
}

fs.writeFileSync('src/pages/finance/cost-management/CostApprovalModal.tsx', content, 'utf-8');
console.log("Fixed Mojibake");
