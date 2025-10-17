# 🤖 Auto Bidding Extension

Tiện ích mở rộng Chrome/Edge tự động đấu giá cho hệ thống Mua sắm công của Việt Nam.

## ✨ Tính năng

### 🎯 Đấu giá tự động thông minh
- **Giám sát giá** thời gian thực - tự động phát hiện khi giá thấp nhất thay đổi
- **Tự động trả giá** - tính toán và đưa ra giá cạnh tranh (giá thấp nhất - bước giá)
- **Bảo vệ giá tối thiểu** - tự động dừng khi giá xuống dưới ngưỡng cho phép
- **Xử lý popup tự động** - tự động xác nhận "Có" và đóng dialog thành công

### 🎛️ Bảng điều khiển trực quan
- **Panel nổi** có thể kéo thả đến bất kỳ vị trí nào
- **Thiết lập giá tối thiểu** để tránh đấu giá quá thấp
- **Trạng thái real-time** hiển thị tình trạng hoạt động
- **Giao diện tiếng Việt** hoàn chỉnh

### 🛡️ An toàn và kiểm soát
- **Kích hoạt thủ công** - chỉ hoạt động khi người dùng bật
- **Dừng khẩn cấp** - có thể dừng bất cứ lúc nào
- **Giới hạn giá** - tự động dừng khi đạt ngưỡng tối thiểu

## 🚀 Cài đặt

### 1. Tải mã nguồn
```bash
git clone https://github.com/sunday19x3/auto-bidding-extension.git
cd auto-bidding-extension
```

### 2. Cài đặt vào Chrome/Edge
1. Mở Chrome/Edge và vào `chrome://extensions/` hoặc `edge://extensions/`
2. Bật **Developer mode** (Chế độ nhà phát triển)
3. Click **Load unpacked** (Tải tiện ích đã giải nén)
4. Chọn thư mục `auto-bidding-extension`

### 3. Cấp quyền truy cập
- Tiện ích sẽ tự động hoạt động trên `muasamcong.mpi.gov.vn`
- Không cần cấu hình thêm gì

## 📖 Cách sử dụng

### Bước 1: Truy cập trang đấu thầu
```
https://muasamcong.mpi.gov.vn/egp/bidonlinefe/reoffer-onl-proposals/...
```

### Bước 2: Cấu hình giá tối thiểu
1. Panel điều khiển sẽ xuất hiện ở góc phải màn hình
2. Nhập **giá tối thiểu** có thể chấp nhận (ví dụ: `350000000`)
3. Kéo thả panel đến vị trí mong muốn

### Bước 3: Bắt đầu đấu giá tự động
1. Click **"Bắt Đầu Đấu Giá Tự Động"**
2. Trạng thái chuyển thành **"Hoạt động"**
3. Hệ thống bắt đầu giám sát và tự động đấu giá

### Bước 4: Theo dõi và kiểm soát
- **Trạng thái**: Theo dõi tình trạng hoạt động
- **Dừng khẩn cấp**: Click nút để dừng bất cứ lúc nào
- **Tự động dừng**: Hệ thống dừng khi giá xuống dưới ngưỡng

## 🎮 Giao diện điều khiển

```
🤖 Điều Khiển Đấu Giá Tự Động
┌─────────────────────────────────┐
│ Giá tối thiểu có thể chấp nhận: │
│ [350000000________________]     │
│                                 │
│ [Bắt Đầu Đấu Giá Tự Động]     │
│                                 │
│ Trạng thái: Không hoạt động     │
└─────────────────────────────────┘
```

## 🔧 Tính năng kỹ thuật

### Giám sát thông minh
- **MutationObserver** theo dõi thay đổi DOM
- **Selector động** tìm element chính xác
- **Text parsing** xử lý định dạng số Việt Nam

### Tự động hóa quy trình
```
Giá thay đổi → Tính toán giá mới → Điền form → 
Click "Chào giá" → Xác nhận "Có" → Đóng thông báo
```

### Xử lý Angular Material
- Phát hiện `mat-dialog-container`
- Tự động click nút "Có" và "Đóng"
- Xử lý bất đồng bộ với delay phù hợp

## 🛠️ Cấu trúc dự án

```
auto-bidding-extension/
├── manifest.json           # Cấu hình extension
├── scripts/
│   └── content.js         # Logic chính
└── README.md              # Tài liệu này
```

## 🧪 Testing

### Test thủ công thay đổi giá
```javascript
// Mở Console và chạy:
testPriceChange('350.000.000 VND')
testMultiplePrices() // Test nhiều giá liên tiếp
```

### Kiểm tra hoạt động
1. Bật auto bidding
2. Chạy `testPriceChange('340.000.000 VND')`
3. Quan sát hệ thống tự động phản ứng

## ⚠️ Lưu ý quan trọng

### Sử dụng có trách nhiệm
- **Đọc kỹ** quy định đấu thầu trước khi sử dụng
- **Kiểm tra** giá cả và điều kiện thường xuyên
- **Không nên** để máy chạy không giám sát

### Giới hạn và rủi ro
- Tiện ích chỉ **hỗ trợ**, không thay thế quyết định con người
- **Luôn thiết lập** giá tối thiểu để tránh thua lỗ
- **Có thể dừng** bất cứ lúc nào nếu cần

### Bảo mật
- Không lưu trữ thông tin cá nhân
- Chỉ hoạt động trên domain được phép
- Mã nguồn mở, có thể kiểm tra

## 🤝 Đóng góp

### Báo lỗi
- Mở **Issue** trên GitHub
- Mô tả chi tiết lỗi và cách tái tạo
- Đính kèm screenshot nếu có

### Đề xuất tính năng
- Fork repository
- Tạo branch mới cho tính năng
- Tạo Pull Request với mô tả chi tiết

## 📄 Giấy phép

MIT License - Xem file LICENSE để biết chi tiết

## 📞 Liên hệ

- **GitHub**: [@sunday19x3](https://github.com/sunday19x3)
- **Repository**: [auto-bidding-extension](https://github.com/sunday19x3/auto-bidding-extension)

---

⚡ **Lưu ý**: Công cụ này được phát triển để hỗ trợ quá trình đấu thầu. Người dùng cần tuân thủ đầy đủ các quy định pháp luật và quy định của từng tổ chức khi sử dụng.
