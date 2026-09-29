# HỆ THỐNG QUẢN LÝ VÕ SINH & THĂNG ĐAI PHẬT QUANG QUYỀN (PQQ)

Ứng dụng Web quản trị nội bộ dành cho Môn phái **Phật Quang Quyền (PQQ)**, kết nối trực tiếp với **Google Sheets** làm cơ sở dữ liệu đám mây, hỗ trợ phân cấp theo Câu lạc bộ và 5 cấp đai truyền thống, chấm thi điện tử và xuất Văn bằng thăng đai / Phiếu thi chuẩn PDF sắc nét.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Quản lý Võ sinh (CRUD)**:
   - Hồ sơ chi tiết: Mã võ sinh, Họ tên, Pháp danh, Ngày sinh, Giới tính, SĐT, CLB trực thuộc, Cấp đai hiện tại, Ngày nhập môn, Ngày thăng đai gần nhất.
   - Tìm kiếm tức thì, lọc đa chiều theo CLB, Cấp đai, Tình trạng sinh hoạt.
   - Chuyển đổi linh hoạt giữa chế độ xem Bảng (Table) và Lưới thẻ (Grid).

2. **Quản lý Khóa thi & Phiếu dự thi (CRUD)**:
   - Tạo khóa thi/đợt thi theo năm, địa điểm, hội đồng chấm thi.
   - Đăng ký võ sinh vào kỳ thi: tự động đề xuất cấp đai kế tiếp theo lộ trình thăng đai.
   - **Phiếu chấm điểm điện tử 6 nội dung**: Căn bản, Bài quyền, Binh khí, Thể lực, Đối kháng, Lý thuyết võ đạo PQQ.
   - Tự động tính điểm tổng (thang 60), điểm trung bình (thang 10) và tự động xếp loại: **Đạt** / **Thủ khoa** / **Chưa đạt**.

3. **Quản lý Văn bằng Thăng đai (CRUD)**:
   - **1-Click sinh văn bằng tự động**: Tự động phát hành văn bằng số hiệu chuẩn hóa cho toàn bộ thí sinh thi đỗ đợt thi.
   - Quản lý sổ văn bằng, ngày cấp, số quyết định, người ký.
   - Đồng thời tự động cập nhật cấp đai mới và ngày thăng đai cho hồ sơ võ sinh.

4. **Xuất file PDF Chuẩn Đẹp (A4)**:
   - **Văn bằng Thăng đai**: Khổ A4 ngang hoàng gia truyền thống, viền hoa văn vàng kim cổ điển, triện son đỏ môn phái, phông chữ trang trọng, mã định danh tra cứu.
   - **Phiếu dự thi & Bảng điểm**: Khổ A4 đứng chi tiết điểm từng phần thi, chữ ký giám khảo và Ban Chuyên môn.
   - **Báo cáo danh sách võ sinh theo CLB**: Xuất PDF lưu trữ và in ấn nội bộ.

5. **Phân cấp CLB & 5 Bậc Cấp Đai PQQ**:
   - Phân cấp quản lý trực quan theo từng Câu lạc bộ.
   - Trong mỗi CLB, phân chia theo 5 bậc cấp đai chuẩn:
     1. **Lam Đai (Đai Xanh Lam - Sơ Cấp)**
     2. **Lục Đai (Đai Xanh Lá - Trung Cấp)**
     3. **Hồng Đai (Đai Hồng/Đỏ - Nâng Cao)**
     4. **Hoàng Đai (Đai Vàng - Huấn Luyện Viên)**
     5. **Bạch Đai (Bạch Đai - Thượng Đẳng / Võ Sư)**
   - Thống kê tỷ lệ võ sinh từng đai của mỗi CLB.

6. **Không cần đăng nhập - Dùng ngay nội bộ**:
   - Không có rào cản mật khẩu/PIN, ai trong nội bộ mở link là thao tác được ngay.
   - Dữ liệu Offline-First: Chạy mượt tức thì trên trình duyệt, tự động lưu đệm và đồng bộ với Google Sheets.

---

## 📋 HƯỚNG DẪN KẾT NỐI VỚI GOOGLE SHEET ĐÃ TẠO

Link Google Sheet của bạn:
👉 **[Mở Google Sheet PQQ](https://docs.google.com/spreadsheets/d/1GzC6WywESgThVzUQCfAcsbDsvYoeHjvIPpM6QUlO42s/edit?usp=sharing)**

### 4 Bước Kết Nối Đơn Giản:

1. **Mở Apps Script**:
   - Mở link Google Sheet ở trên.
   - Trên thanh menu của Google Sheet, chọn: `Tiện ích mở rộng (Extensions)` > `Apps Script`.

2. **Dán mã nguồn `Code.gs`**:
   - Xóa toàn bộ nội dung trong file `Code.gs` ở màn hình Apps Script.
   - Mở file `google-apps-script/Code.gs` trong dự án (hoặc bấm nút **"Sao chép mã Code.gs"** trong mục Cài đặt của Web App) và dán toàn bộ vào đó.
   - Bấm nút **Lưu (Ctrl+S)**.

3. **Khởi tạo các bảng tự động (Tùy chọn)**:
   - Trên thanh công cụ Apps Script, chọn hàm `initAllSheets` và bấm nút **Chạy (Run)**.
   - Các bảng `VOSINH`, `KYTHI`, `PHIEUTHI`, `VANBANG`, `CLB` sẽ được tự động tạo với tiêu đề màu sắc chuẩn đẹp.

4. **Triển khai Web App (Deploy)**:
   - Bấm nút màu xanh **Triển khai (Deploy)** ở góc trên bên phải > chọn **Tùy chọn triển khai mới (New deployment)**.
   - Bấm biểu tượng bánh răng chọn loại: **Ứng dụng web (Web app)**.
   - Điền thông tin:
     - Mô tả: `PQQ API Backend`
     - Thực thi dưới dạng (Execute as): `Tôi (email của bạn)`
     - Ai có quyền truy cập (Who has access): **Bất kỳ ai (Anyone)** *(Bắt buộc chọn Anyone để web app gửi nhận dữ liệu)*
   - Bấm **Triển khai (Deploy)** và cấp quyền nếu Google hỏi.
   - Sao chép **URL ứng dụng web (Web App URL)** (có đuôi `/exec`).
   - Mở Web App > Bấm biểu tượng ⚙️ **Cài đặt** ở góc trên > Dán URL vào ô **URL Ứng Dụng Web** > Bấm **Kiểm Tra Kết Nối & Lưu**!

---

## 🚀 HƯỚNG DẪN CHẠY WEB APP TRÊN MÁY TÍNH

Mở terminal trong thư mục dự án:

```bash
# Cài đặt gói thư viện (nếu chưa cài)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Sau đó mở trình duyệt tại địa chỉ: `http://localhost:5173` để trải nghiệm web app!
