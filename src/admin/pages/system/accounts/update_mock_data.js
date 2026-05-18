const fs = require('fs');
const path = 'c:/Users/Admin/OneDrive/Desktop/pttk/FECredit/travel-admin-frontend/src/pages/system/accounts/mockData.ts';
let content = fs.readFileSync(path, 'utf8');

// Add Hướng dẫn viên to allRoles
if (!content.includes("'Hướng dẫn viên'")) {
    content = content.replace("  'Khách hàng',", "  'Hướng dẫn viên',\n  'Khách hàng',");
}

// Add Hướng dẫn viên to permissionsMap
if (!content.includes("'Hướng dẫn viên':")) {
    content = content.replace("  'Khách hàng': [],", "  'Hướng dẫn viên': ['Quản lý tour thực tế'],\n  'Khách hàng': [],");
}

fs.writeFileSync(path, content, 'utf8');
console.log('File updated successfully');
