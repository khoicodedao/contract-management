import { db } from "./database";
import * as schema from "@shared/schema";

export async function seedSQLiteDatabase() {
  console.log("Seeding SQLite database with Vietnamese customs data...");

  // Seed sample contracts
  const contracts = [
    {
      ten: "Hợp đồng nhập khẩu trang bị Công nghệ thông tin",
      moTa: "Nhập khẩu thiết bị máy tính và phần mềm cho cơ quan hải quan",
      soHdNoi: "HD-NK-001/2024",
      soHdNgoai: "IT-IMP-2024-001",
      ngay: "2024-01-15",
      giaTriHopDong: 2000000000,
      loaiHopDongId: 1,
      chuDauTuId: 1,
      nhaCungCapId: 1,
      loaiNganSachId: 1,
      canBoId: 1,
      trangThaiHopDongId: 1,
    },
    {
      ten: "Hợp đồng xuất khẩu thiết bị điện tử",
      moTa: "Xuất khẩu thiết bị điện tử sản xuất trong nước",
      soHdNoi: "HD-XK-002/2024",
      soHdNgoai: "EXP-ELEC-2024-002",
      ngay: "2024-02-20",
      giaTriHopDong: 1500000000,
      loaiHopDongId: 2,
      chuDauTuId: 2,
      nhaCungCapId: 2,
      loaiNganSachId: 2,
      canBoId: 2,
      trangThaiHopDongId: 1,
    },
    {
      ten: "Hợp đồng tạm xuất tái nhập máy móc",
      moTa: "Tạm xuất máy móc để sửa chữa tại nước ngoài",
      soHdNoi: "HD-TXTN-003/2024",
      soHdNgoai: "TEMP-EXP-2024-003",
      ngay: "2024-03-10",
      giaTriHopDong: 500000000,
      loaiHopDongId: 3,
      chuDauTuId: 1,
      nhaCungCapId: 3,
      loaiNganSachId: 3,
      canBoId: 3,
      trangThaiHopDongId: 1,
    },
    {
      ten: "Hợp đồng tạm nhập tái xuất thiết bị hoá học",
      moTa: "Tạm nhập thiết bị hoá học để thử nghiệm",
      soHdNoi: "HD-TNTX-004/2024",
      soHdNgoai: "TEMP-IMP-2024-004",
      ngay: "2024-04-05",
      giaTriHopDong: 800000000,
      loaiHopDongId: 4,
      chuDauTuId: 3,
      nhaCungCapId: 1,
      loaiNganSachId: 1,
      canBoId: 4,
      trangThaiHopDongId: 1,
    },
    {
      ten: "Hợp đồng nhập khẩu trang bị y tế",
      moTa: "Nhập khẩu thiết bị y tế chuyên dụng",
      soHdNoi: "HD-NK-005/2024",
      soHdNgoai: "MED-IMP-2024-005",
      ngay: "2024-05-12",
      giaTriHopDong: 950200000,
      loaiHopDongId: 1,
      chuDauTuId: 1,
      nhaCungCapId: 2,
      loaiNganSachId: 2,
      canBoId: 5,
      trangThaiHopDongId: 1,
    },
  ];

  const contractResults = await db
    .insert(schema.hopDong)
    .values(contracts)
    .returning();
  const contractIds = contractResults.map((c) => c.id);

  // Seed progress steps
  const progressSteps = [
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
  ];

  await db.insert(schema.buocThucHien).values(progressSteps);

  // Seed payments
  const payments = [
    {
      hopDongId: contractIds[0],
      loaiTienId: 1,
      loaiHinhThucThanhToanId: 1,
      loaiThanhToanId: 1,
      noiDung: "Thanh toán lần 1 - 40%",
      hanHopDong: "2024-02-15",
      hanThucHien: "2024-02-10",
      soTien: 800000000,
    },
    {
      hopDongId: contractIds[0],
      loaiTienId: 1,
      loaiHinhThucThanhToanId: 1,
      loaiThanhToanId: 1,
      noiDung: "Thanh toán lần 2 - 40%",
      hanHopDong: "2024-03-31",
      hanThucHien: "2024-03-25",
      soTien: 800000000,
    },
    {
      hopDongId: contractIds[1],
      loaiTienId: 1,
      loaiHinhThucThanhToanId: 1,
      loaiThanhToanId: 2,
      noiDung: "Thanh toán trước 30%",
      hanHopDong: "2024-02-25",
      hanThucHien: "2024-02-22",
      soTien: 450000000,
    },
  ];

  await db.insert(schema.thanhToan).values(payments);

  // Seed equipment
  const equipment = [
    {
      hopDongId: contractIds[0],
      ten: "Máy tính Dell OptiPlex",
      moTa: "Máy tính để bàn cho nhân viên phát triển",
      soLuong: 8,
      donGia: 15000000,
      loaiTrangBiId: 1,
      trangThai: "Đang sử dụng",
      ngayMua: "2024-02-10",
      baoHanh: "36 tháng",
    },
    {
      hopDongId: contractIds[1],
      ten: "Router Cisco ISR 4000",
      moTa: "Router doanh nghiệp hiệu năng cao",
      soLuong: 5,
      donGia: 25000000,
      loaiTrangBiId: 2,
      trangThai: "Mới",
      ngayMua: "2024-03-15",
      baoHanh: "36 tháng",
    },
  ];

  await db.insert(schema.trangBi).values(equipment);

  // Seed địa điểm thông quan
  const locationIds = await db
    .insert(schema.diaDiemThongQuan)
    .values([
      { ten: "DHL", chiCuc: "Khu vực I" },
      { ten: "DHL", chiCuc: "Khu vực II" },
      { ten: "Nội Bài", chiCuc: "Khu vực I" },
      { ten: "Đình Vũ", chiCuc: "Khu vực III" },
    ])
    .returning();

  // Seed tiếp nhận hàng
  await db.insert(schema.tiepNhan).values([
    {
      hopDongId: contractIds[0],
      tenHang: "Máy tính và thiết bị IT",
      soToKhai: "TK2022040001",
      soVanDon: "VD2022040001",
      soPhieuDongGoi: "PDG2022040001",
      soHoaDon: "HD2022040001",
      soBaoHiem: "BH2022040001",
      diaDiemThongQuanId: locationIds[0].id,
      ngayThucHien: "2022-04-15",
    },
    {
      hopDongId: contractIds[1],
      tenHang: "Thiết bị y tế xuất khẩu",
      soToKhai: "TK2022050001",
      soVanDon: "VD2022050001",
      soPhieuDongGoi: "PDG2022050001",
      soHoaDon: "HD2022050001",
      soBaoHiem: "BH2022050001",
      diaDiemThongQuanId: locationIds[2].id,
      ngayThucHien: "2022-05-20",
    },
    {
      hopDongId: contractIds[2],
      tenHang: "Máy phát sóng tạm nhập",
      soToKhai: "TK2022060001",
      soVanDon: "VD2022060001",
      soPhieuDongGoi: "PDG2022060001",
      soHoaDon: "HD2022060001",
      soBaoHiem: "BH2022060001",
      diaDiemThongQuanId: locationIds[1].id,
      ngayThucHien: "2022-06-20",
    },
  ]);

  console.log(`SQLite database seeded successfully!`);
  console.log(
    `Created ${contractIds.length} contracts, ${progressSteps.length} progress steps, ${payments.length} payments, ${equipment.length} equipment items, ${documents.length} documents, and reception records`
  );
}
