
##  Hướng dẫn cài đặt và chạy dự án (Getting Started)

**Bước 1: Cài đặt các thư viện (Dependencies)**
Mở Terminal / Command Prompt tại thư mục gốc của dự án `Admin` và chạy lệnh sau để tải về các gói thư viện cần thiết:
```bash
npm install
```

**Bước 2: Khởi động dự án (Development Mode)**
Để chạy dự án ở chế độ phát triển (có tính năng tự động cập nhật lại giao diện - Hot Reload), hãy chạy lệnh:
```bash
npm run dev
```

Sau khi chạy thành công, Terminal sẽ hiển thị một đường link cục bộ, mặc định thường là:
👉 **http://localhost:5173**

Bạn chỉ cần bấm vào đường link đó hoặc dán lên trình duyệt web để mở trang Admin.

## ⚙ Cấu hình kết nối API (Configuration)

Mặc định, ứng dụng Admin này sẽ kết nối trực tiếp đến hệ thống Backend API (đang được lập trình bằng NodeJS) thông qua địa chỉ cục bộ:
- `http://localhost:8080/api`

*Lưu ý:* Nếu bạn triển khai (Deploy) Backend API lên máy chủ ảo hoặc tên miền thật, cần thay đổi lại đường dẫn baseURL này trong file `src/api/axiosInstance.js`.


