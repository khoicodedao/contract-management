import { storage } from "./storage";

export async function seedDatabase() {
  console.log("Seeding database with sample data...");

  try {
    // Create sample suppliers
    const suppliers = [
      {
        ten: "Công ty TNHH FPT Software",
        diaChi: "Hà Nội",
        maQuocGia: "VN",
        soDienThoai: "024-73007300",
        email: "contact@fpt.com.vn",
      },
      {
        ten: "Công ty CP Viettel",
        diaChi: "Hà Nội",
        maQuocGia: "VN",
        soDienThoai: "18008098",
        email: "info@viettel.com.vn",
      },
      {
        ten: "Công ty TNHH Samsung Electronics",
        diaChi: "Bắc Ninh",
        maQuocGia: "KR",
        soDienThoai: "024-37661000",
        email: "support@samsung.com",
      },
    ];

    for (const supplier of suppliers) {
      await storage.createNhaCungCap(supplier);
    }

    // Create sample staff - 12 customs officers
    const staff = [
      { ten: "Ngô Văn Khang", chucVu: "Trưởng phòng", anh: null },
      { ten: "Nguyễn Văn Sáu", chucVu: "Phó trưởng phòng", anh: null },
      { ten: "Hoàng Văn Công", chucVu: "Trợ lý", anh: null },
      { ten: "Phan Quân", chucVu: "Trợ lý", anh: null },
      { ten: "Tô Quyên", chucVu: "Trợ lý", anh: null },
      { ten: "Đậu Thị Thuỳ Ninh", chucVu: "Trợ lý", anh: null },
      { ten: "Nguyễn Tuấn Anh", chucVu: "Trợ lý", anh: null },
      { ten: "Nguyễn Quỳnh Mai", chucVu: "Nhân viên", anh: null },
      { ten: "Trần Ngọc Tuấn", chucVu: "Trợ lý", anh: null },
      { ten: "Nguyễn Phi", chucVu: "Trợ lý", anh: null },
      { ten: "Nguyễn Ngọc Giang", chucVu: "Nhân viên", anh: null },
      { ten: "Nguyễn Hà Đèn", chucVu: "Trợ lý", anh: null },
    ];

    for (const person of staff) {
      await storage.createCanBo(person);
    }

    // Create sample investors - Government agencies
    const investors = [
      {
        ten: "Cục Y tế",
        diaChi: "138A Giảng Võ, Đống Đa, Hà Nội",
        soDienThoai: "024-3962-5555",
        email: "cuc.yte@moh.gov.vn",
      },
      {
        ten: "Cục Trắc địa",
        diaChi: "1 Hoàng Diệu, Ba Đình, Hà Nội",
        soDienThoai: "024-3734-6666",
        email: "cuc.tracdia@monre.gov.vn",
      },
      {
        ten: "Cục Vận tải",
        diaChi: "80 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
        soDienThoai: "024-3942-7777",
        email: "cuc.vantai@mt.gov.vn",
      },
    ];

    for (const investor of investors) {
      await storage.createChuDauTu(investor);
    }

    // Create sample contracts with different statuses
    const contracts = [
      {
        ten: "Hợp đồng nhập khẩu trang bị Công nghệ thông tin cho Cục Trắc địa",
        moTa: "Nhập khẩu 10 cái máy tính 20 cái máy in",
        soHdNoi: "TD03042022",
        soHdNgoai: "KX03042022-YSG",
        ngay: "2022-04-03",
        loaiHopDongId: 1, // Nhập khẩu
        chuDauTuId: 2, // Cục Trắc địa
        nhaCungCapId: 1, // YXG
        loaiNganSachId: 1,
        canBoId: 1,
        trangThaiHopDongId: 1, // Đang thực hiện
      },
      {
        ten: "Hợp đồng nhập khẩu thiết bị y tế cho Cục Y tế",
        moTa: "Nhập khẩu 5 máy đo nhịp tim, 3 máy phát sóng siêu âm",
        soHdNoi: "YT15062022",
        soHdNgoai: "YM15062022-CRP",
        ngay: "2022-06-15",
        loaiHopDongId: 1, // Nhập khẩu
        chuDauTuId: 1, // Cục Y tế
        nhaCungCapId: 2, // Yamaha
        loaiNganSachId: 1,
        canBoId: 2,
        trangThaiHopDongId: 1, // Đang thực hiện
      },
      {
        ten: "Hợp đồng nhập khẩu thiết bị hoá học cho Cục đo lường",
        moTa: "Nhập khẩu thiết bị phân tích hoá học chuyên dụng",
        soHdNoi: "DL28082022",
        soHdNgoai: "CR28082022-DL",
        ngay: "2022-08-28",
        loaiHopDongId: 1, // Nhập khẩu
        chuDauTuId: 3, // Cục Vận tải (proxy)
        nhaCungCapId: 3, // Corpus
        loaiNganSachId: 2,
        canBoId: 3,
        trangThaiHopDongId: 1, // Đang thực hiện
      },
      {
        ten: "Hợp đồng xuất khẩu sản phẩm điện tử",
        moTa: "Xuất khẩu linh kiện điện tử sang thị trường châu Âu",
        soHdNoi: "XK10092022",
        soHdNgoai: "EX10092022-SIE",
        ngay: "2022-09-10",
        loaiHopDongId: 2, // Xuất khẩu
        chuDauTuId: 1,
        nhaCungCapId: 1,
        loaiNganSachId: 1,
        canBoId: 4,
        trangThaiHopDongId: 1, // Đang thực hiện
      },
      {
        ten: "Hợp đồng tạm nhập tái xuất thiết bị nghiên cứu",
        moTa: "Tạm nhập thiết bị nghiên cứu khoa học để thực hiện dự án hợp tác quốc tế",
        soHdNoi: "TN20102022",
        soHdNgoai: "TF20102022-PH",
        ngay: "2024-05-12",
        loaiHopDongId: 5, // Hợp đồng thuê
        chuDauTuId: 2,
        nhaCungCapId: 2,
        loaiNganSachId: 3,
        canBoId: 5,
        trangThaiHopDongId: 1, // Đang thực hiện
      },
    ];

    const contractIds = [];
    for (const contract of contracts) {
      const result = await storage.createHopDong(contract);
      contractIds.push(result.id);
    }

    // Create sample progress steps
    const progressSteps = [
      // Contract 1 - Completed project
      {
        hopDongId: contractIds[0],
        ten: "Phân tích yêu cầu",
        moTa: "Thu thập và phân tích yêu cầu từ khách hàng",
        thuTu: 1,
        trangThai: "Hoàn thành",
        ngayBatDau: "2024-01-16",
        ngayKetThuc: "2024-01-30",
        ngayBatDauThucTe: "2024-01-16",
        ngayKetThucThucTe: "2024-01-28",
        canBoPhuTrachId: 1,
      },
      {
        hopDongId: contractIds[0],
        ten: "Thiết kế hệ thống",
        moTa: "Thiết kế kiến trúc và giao diện người dùng",
        thuTu: 2,
        trangThai: "Hoàn thành",
        ngayBatDau: "2024-01-31",
        ngayKetThuc: "2024-02-15",
        ngayBatDauThucTe: "2024-01-29",
        ngayKetThucThucTe: "2024-02-12",
        canBoPhuTrachId: 4,
      },
      {
        hopDongId: contractIds[0],
        ten: "Phát triển tính năng",
        moTa: "Lập trình các tính năng chính của hệ thống",
        thuTu: 3,
        trangThai: "Hoàn thành",
        ngayBatDau: "2024-02-16",
        ngayKetThuc: "2024-03-31",
        ngayBatDauThucTe: "2024-02-13",
        ngayKetThucThucTe: "2024-03-28",
        canBoPhuTrachId: 4,
      },
      {
        hopDongId: contractIds[0],
        ten: "Kiểm thử và triển khai",
        moTa: "Kiểm thử hệ thống và triển khai lên môi trường production",
        thuTu: 4,
        trangThai: "Hoàn thành",
        ngayBatDau: "2024-04-01",
        ngayKetThuc: "2024-04-15",
        ngayBatDauThucTe: "2024-03-29",
        ngayKetThucThucTe: "2024-04-10",
        canBoPhuTrachId: 1,
      },

      // Contract 2 - In progress
      {
        hopDongId: contractIds[1],
        ten: "Khảo sát hiện trạng",
        moTa: "Khảo sát và đánh giá hạ tầng hiện tại",
        thuTu: 1,
        trangThai: "Hoàn thành",
        ngayBatDau: "2024-02-21",
        ngayKetThuc: "2024-03-05",
        ngayBatDauThucTe: "2024-02-21",
        ngayKetThucThucTe: "2024-03-03",
        canBoPhuTrachId: 2,
      },
      {
        hopDongId: contractIds[1],
        ten: "Chuẩn bị thiết bị",
        moTa: "Đặt hàng và chuẩn bị các thiết bị cần thiết",
        thuTu: 2,
        trangThai: "Đang thực hiện",
        ngayBatDau: "2024-03-06",
        ngayKetThuc: "2024-04-20",
        ngayBatDauThucTe: "2024-03-04",
        canBoPhuTrachId: 4,
      },
      {
        hopDongId: contractIds[1],
        ten: "Lắp đặt và cấu hình",
        moTa: "Lắp đặt thiết bị và cấu hình hệ thống",
        thuTu: 3,
        trangThai: "Chờ thực hiện",
        ngayBatDau: "2024-04-21",
        ngayKetThuc: "2024-05-15",
        canBoPhuTrachId: 4,
      },

      // Contract 3 - In progress
      {
        hopDongId: contractIds[2],
        ten: "Thiết kế sản phẩm",
        moTa: "Thiết kế và phát triển mẫu sản phẩm",
        thuTu: 1,
        trangThai: "Hoàn thành",
        ngayBatDau: "2024-03-11",
        ngayKetThuc: "2024-04-10",
        ngayBatDauThucTe: "2024-03-11",
        ngayKetThucThucTe: "2024-04-08",
        canBoPhuTrachId: 3,
      },
      {
        hopDongId: contractIds[2],
        ten: "Sản xuất thử nghiệm",
        moTa: "Sản xuất lô hàng thử nghiệm để kiểm tra chất lượng",
        thuTu: 2,
        trangThai: "Đang thực hiện",
        ngayBatDau: "2024-04-11",
        ngayKetThuc: "2024-05-20",
        ngayBatDauThucTe: "2024-04-09",
        canBoPhuTrachId: 3,
      },

      // Contract 5 - In progress
      {
        hopDongId: contractIds[4],
        ten: "Đánh giá nhu cầu",
        moTa: "Đánh giá nhu cầu lưu trữ và băng thông",
        thuTu: 1,
        trangThai: "Hoàn thành",
        ngayBatDau: "2024-05-13",
        ngayKetThuc: "2024-05-25",
        ngayBatDauThucTe: "2024-05-13",
        ngayKetThucThucTe: "2024-05-23",
        canBoPhuTrachId: 5,
      },
      {
        hopDongId: contractIds[4],
        ten: "Cấu hình dịch vụ",
        moTa: "Cấu hình và triển khai các dịch vụ cloud",
        thuTu: 2,
        trangThai: "Đang thực hiện",
        ngayBatDau: "2024-05-26",
        ngayKetThuc: "2024-06-15",
        ngayBatDauThucTe: "2024-05-24",
        canBoPhuTrachId: 5,
      },
    ];

    for (const step of progressSteps) {
      await storage.createBuocThucHien(step);
    }

    // Create sample payments
    const payments = [
      {
        hopDongId: contractIds[0],
        loaiTienId: 1,
        loaiHinhThucThanhToanId: 1,
        loaiThanhToanId: 3,
        noiDung: "Thanh toán lần 1 - 40%",
        hanHopDong: "2024-02-15",
        hanThucHien: "2024-02-10",
        soTien: "800000000",
      },
      {
        hopDongId: contractIds[0],
        loaiTienId: 1,
        loaiHinhThucThanhToanId: 1,
        loaiThanhToanId: 3,
        noiDung: "Thanh toán lần 2 - 40%",
        hanHopDong: "2024-03-31",
        hanThucHien: "2024-03-25",
        soTien: "800000000",
      },
      {
        hopDongId: contractIds[0],
        loaiTienId: 1,
        loaiHinhThucThanhToanId: 1,
        loaiThanhToanId: 3,
        noiDung: "Thanh toán cuối - 20%",
        hanHopDong: "2024-04-15",
        hanThucHien: "2024-04-12",
        soTien: "400000000",
      },
      {
        hopDongId: contractIds[1],
        loaiTienId: 1,
        loaiHinhThucThanhToanId: 1,
        loaiThanhToanId: 1,
        noiDung: "Thanh toán trước 30%",
        hanHopDong: "2024-02-25",
        hanThucHien: "2024-02-22",
        soTien: "450000000",
      },
      {
        hopDongId: contractIds[1],
        loaiTienId: 1,
        loaiHinhThucThanhToanId: 1,
        loaiThanhToanId: 3,
        noiDung: "Thanh toán theo tiến độ 50%",
        hanHopDong: "2024-05-15",
        hanThucHien: null,
        soTien: "750000000",
      },
      {
        hopDongId: contractIds[2],
        loaiTienId: 2,
        loaiHinhThucThanhToanId: 1,
        loaiThanhToanId: 1,
        noiDung: "Advance payment 40%",
        hanHopDong: "2024-03-15",
        hanThucHien: "2024-03-12",
        soTien: "200000",
      },
      {
        hopDongId: contractIds[4],
        loaiTienId: 1,
        loaiHinhThucThanhToanId: 1,
        loaiThanhToanId: 4,
        noiDung: "Thanh toán hàng tháng",
        hanHopDong: "2024-06-12",
        hanThucHien: null,
        soTien: "50000000",
      },
    ];

    for (const payment of payments) {
      await storage.createThanhToan(payment);
    }

    // Create sample equipment
    const equipment = [
      {
        hopDongId: contractIds[1],
        ten: "Router Cisco ISR 4000",
        moTa: "Router doanh nghiệp hiệu năng cao",
        soLuong: 5,
        donGia: "25000000",
        loaiTrangBiId: 1,
        trangThai: "Mới",
        ngayMua: "2024-03-15",
        baoHanh: "36 tháng",
      },
      {
        hopDongId: contractIds[1],
        ten: "Switch Cisco Catalyst 9300",
        moTa: "Switch layer 3 cho mạng doanh nghiệp",
        soLuong: 10,
        donGia: "18000000",
        loaiTrangBiId: 1,
        trangThai: "Mới",
        ngayMua: "2024-03-20",
        baoHanh: "36 tháng",
      },
      {
        hopDongId: contractIds[2],
        ten: "Máy in 3D công nghiệp",
        moTa: "Máy in 3D độ chính xác cao cho sản xuất",
        soLuong: 2,
        donGia: "150000",
        loaiTrangBiId: 1,
        trangThai: "Đang sử dụng",
        ngayMua: "2024-04-01",
        baoHanh: "24 tháng",
      },
      {
        hopDongId: contractIds[0],
        ten: "Máy tính Dell OptiPlex",
        moTa: "Máy tính để bàn cho nhân viên phát triển",
        soLuong: 8,
        donGia: "15000000",
        loaiTrangBiId: 3,
        trangThai: "Đang sử dụng",
        ngayMua: "2024-02-10",
        baoHanh: "36 tháng",
      },
      {
        hopDongId: contractIds[0],
        ten: "Màn hình Dell UltraSharp",
        moTa: "Màn hình 27 inch 4K cho thiết kế",
        soLuong: 8,
        donGia: "8500000",
        loaiTrangBiId: 3,
        trangThai: "Đang sử dụng",
        ngayMua: "2024-02-10",
        baoHanh: "36 tháng",
      },
    ];

    for (const item of equipment) {
      await storage.createTrangBi(item);
    }

    // Create sample documents

    console.log("Sample data seeded successfully!");
    console.log(
      `Created ${contracts.length} contracts, ${progressSteps.length} progress steps, ${payments.length} payments, ${equipment.length} equipment items, and ${documents.length} documents`
    );
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
