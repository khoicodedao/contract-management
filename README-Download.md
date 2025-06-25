# Hướng dẫn tải project về máy

## Cách 1: Download trực tiếp từ server (Khuyến nghị)
Truy cập link sau để tải project:
**https://[your-replit-url]/api/download/project**

Thay `[your-replit-url]` bằng URL Replit của bạn.

## Cách 2: Download ZIP từ giao diện Replit
1. Nhấn vào menu ba chấm (⋯) ở góc trên bên trái
2. Chọn "Download as zip" 
3. Nếu gặp lỗi "Rate limit exceeded", hãy sử dụng Cách 1

## Cách 3: Copy manual từ file explorer
Trong file explorer bên trái, tìm file `vietnamese-contract-management.tar.gz` và download.

## Nội dung project bao gồm:
- **Frontend**: React + TypeScript với Vite
- **Backend**: Express.js + Node.js  
- **Database**: SQLite với Drizzle ORM
- **UI**: Shadcn/ui + Tailwind CSS
- **Features**: Quản lý hợp đồng, nhà cung cấp, thanh toán, tiến độ, tài liệu

## Để chạy project trên máy local:
1. Cài đặt Node.js (version 18+)
2. Giải nén file: `tar -xzf vietnamese-contract-management.tar.gz`
3. Vào thư mục: `cd vietnamese-contract-management`
4. Cài đặt dependencies: `npm install`
5. Chạy development server: `npm run dev`
6. Mở browser: `http://localhost:5000`

## Cơ sở dữ liệu:
- SQLite database sẽ được tạo tự động
- Dữ liệu mẫu sẽ được seed khi chạy lần đầu