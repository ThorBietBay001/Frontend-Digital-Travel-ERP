# Design Tokens & Coding Standards for Travel Admin

## Màu sắc
- Primary: #00668A, Primary Container: #89D4FF, On Primary Container: #005C7E
- Background: #F9F9FF, Surface: #FFFFFF, Error: #BA1A1A
- Border: #E1F1FF, #C5EAFF

## Typography
- Font: Plus Jakarta Sans
- Headings: h1 (32px/700), h2 (24px/700), h3 (20px/600)
- Body: body-md (14px/400), label-md (14px/600), label-sm (12px/500)

## Hiệu ứng
- Shadow card: `0px 4px 20px rgba(137, 212, 255, 0.08)`
- Bo góc: Card 16px, Input 8px, Badge full

## Quy tắc Component
- Sidebar rộng 260px, nền trắng, border phải #E1F1FF
- TopBar cao 64px, breadcrumb, avatar
- Card luôn dùng `bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(137,212,255,0.08)] p-6`
- Button: primary (`bg-[#89D4FF] text-white px-6 py-3 rounded-lg`), secondary (viền #5BB8F5)
- Modal: overlay đen mờ + backdrop blur, header `bg-[#F4F9FF]`, footer nút Hủy/Lưu
- Table header `bg-[#F4F9FF]`, hover dòng `bg-[#F9F9FF]`

## Nguyên tắc Code
- Tất cả component phải có interface TypeScript rõ ràng
- Dùng `lucide-react` cho icons
- Component UI "câm": chỉ nhận props, không gọi API
- Mỗi module có file mock data riêng (`mockData.ts`)
- Validate form trước khi submit, lỗi hiển thị bên dưới trường màu đỏ