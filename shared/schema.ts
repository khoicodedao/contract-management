import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Loại hợp đồng
export const loaiHopDong = sqliteTable("loai_hop_dong", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Cán bộ
export const canBo = sqliteTable("can_bo", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
  chucVu: text("chuc_vu"),
  soDienThoai: text("so_dien_thoai"),
  email: text("email"),
  diaChi: text("dia_chi"),
  moTa: text("mo_ta"),
  anh: text("anh"),
});

// Nhà cung cấp
export const nhaCungCap = sqliteTable("nha_cung_cap", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
  diaChi: text("dia_chi").notNull(),
  soDienThoai: text("so_dien_thoai"),
  email: text("email"),
  nguoiLienHe: text("nguoi_lien_he"),
  chucVuNguoiLienHe: text("chuc_vu_nguoi_lien_he"),
  moTa: text("mo_ta"),
  maQuocGia: text("ma_quoc_gia"),
  anh: text("anh"),
  latitude: real("latitude"),
  longitude: real("longitude"),
});

// Chủ đầu tư
export const chuDauTu = sqliteTable("chu_dau_tu", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
  diaChi: text("dia_chi"),
  soDienThoai: text("so_dien_thoai"),
  email: text("email"),
  nguoiLienHe: text("nguoi_lien_he"),
  chucVuNguoiLienHe: text("chuc_vu_nguoi_lien_he"),
  moTa: text("mo_ta"),
  anh: text("anh"),
});

// Loại ngân sách
export const loaiNganSach = sqliteTable("loai_ngan_sach", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Loại hình thức thanh toán
export const loaiHinhThucThanhToan = sqliteTable("loai_hinh_thuc_thanh_toan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Loại thanh toán
export const loaiThanhToan = sqliteTable("loai_thanh_toan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Loại tiền
export const loaiTien = sqliteTable("loai_tien", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Cơ quan
export const coQuan = sqliteTable("co_quan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Địa điểm thông quan
export const diaDiemThongQuan = sqliteTable("dia_diem_thong_quan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
  chiCuc: text("chi_cuc").notNull(),
});

// Loại giấy phép
export const loaiGiayPhep = sqliteTable("loai_giay_phep", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Loại trang bị
export const loaiTrangBi = sqliteTable("loai_trang_bi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Loại thực hiện
export const loaiThucHien = sqliteTable("loai_thuc_hien", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});

// Trạng thái hợp đồng
export const trangThaiHopDong = sqliteTable("trang_thai_hop_dong", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trangThai: integer("trang_thai").notNull(),
});

// Hợp đồng
export const hopDong = sqliteTable("hop_dong", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
  moTa: text("mo_ta"),
  soHdNoi: text("so_hd_noi"),
  soHdNgoai: text("so_hd_ngoai"),
  ngay: text("ngay"),
  giaTriHopDong: real("gia_tri_hop_dong"),
  loaiHopDongId: integer("loai_hop_dong_id"),
  chuDauTuId: integer("chu_dau_tu_id"),
  nhaCungCapId: integer("nha_cung_cap_id"),
  loaiNganSachId: integer("loai_ngan_sach_id").references(
    () => loaiNganSach.id
  ),
  canBoId: integer("can_bo_id"),
  trangThaiHopDongId: integer("trang_thai_hop_dong_id"),
  loaiTienId: integer("loai_tien_id"),
  tyGia: real("ty_gia"),
  phiUyThac: real("phi_uy_thac"),
});

// Trang bị
export const trangBi = sqliteTable("trang_bi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hopDongId: integer("hop_dong_id").notNull(),
  ten: text("ten").notNull(),
  loaiTrangBiId: integer("loai_trang_bi_id"),
  donGia: real("don_gia"),
  soLuong: integer("so_luong"),
  loaiTienId: integer("loai_tien_id"),
  nhaCungCapId: integer("nha_cung_cap_id"),
  moTa: text("mo_ta"),
  trangThai: text("trang_thai"),
  ngayMua: text("ngay_mua"),
  baoHanh: text("bao_hanh"),
});

// Giấy phép
export const giayPhep = sqliteTable("giay_phep", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  loaiGiayPhepId: integer("loai_giay_phep_id"),
  hopDongId: integer("hop_dong_id"),
  coQuanId: integer("co_quan_id"),
  noiDung: text("noi_dung"),
  ngay: text("ngay"),
});

// Tiếp nhận
export const tiepNhan = sqliteTable("tiep_nhan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hopDongId: integer("hop_dong_id"),
  tenHang: text("ten_hang"),
  soToKhai: text("so_to_khai"),
  soVanDon: text("so_van_don"),
  soPhieuDongGoi: text("so_phieu_dong_goi"),
  soHoaDon: text("so_hoa_don"),
  soBaoHiem: text("so_bao_hiem"),
  diaDiemThongQuanId: integer("dia_diem_thong_quan_id"),
  ngayThucHien: text("ngay_thuc_hien"),
  dieuKienGiaoHangId: integer("dieu_kien_giao_hang_id"),
});

// Thanh toán
export const thanhToan = sqliteTable("thanh_toan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hopDongId: integer("hop_dong_id").notNull(),
  loaiTienId: integer("loai_tien_id"),
  loaiHinhThucThanhToanId: integer("loai_hinh_thuc_thanh_toan_id"),
  loaiThanhToanId: integer("loai_thanh_toan_id"),
  soTien: real("so_tien"),
  ngayDenHan: text("ngay_den_han"),
  ngayThanhToan: text("ngay_thanh_toan"),
  ghiChu: text("ghi_chu"),
  daThanhToan: integer("da_thanh_toan", { mode: "boolean" }).default(false),
  noiDung: text("noi_dung"),
  hanHopDong: text("han_hop_dong"),
  hanThucHien: text("han_thuc_hien"),
});

// Hợp đồng tiến độ
export const hopDongTienDo = sqliteTable("hop_dong_tien_do", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hopDongId: integer("hop_dong_id"),
  loaiThucHienId: integer("loai_thuc_hien_id"),
  canBoId: integer("can_bo_id"),
  ghiChu: text("ghi_chu"),
  hanHopDong: text("han_hop_dong"),
  hanThucHien: text("han_thuc_hien"),
  chiPhi: real("chi_phi"),
  loaiTienId: integer("loai_tien_id"),
  diaDiem: text("dia_diem"),
});

// File hợp đồng
export const fileHopDong = sqliteTable("file_hop_dong", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hopDongId: integer("hop_dong_id").notNull(),
  tenFile: text("ten_file").notNull(),
  loaiFile: text("loai_file"),
  duongDan: text("duong_dan"), // Deprecated - keeping for backward compatibility
  noiDungFile: text("noi_dung_file"), // Base64 content
  kichThuoc: integer("kich_thuoc"),
  ngayTaiLen: text("ngay_tai_len"),
  nguoiTaiLen: integer("nguoi_tai_len"),
  ghiChu: text("ghi_chu"),
});

// Bước thực hiện
export const buocThucHien = sqliteTable("buoc_thuc_hien", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  hopDongId: integer("hop_dong_id").notNull(),
  ten: text("ten").notNull(),
  moTa: text("mo_ta"),
  ghiChu: text("ghi_chu"),
  ngayBatDau: text("ngay_bat_dau"),
  ngayKetThuc: text("ngay_ket_thuc"),
  ngayBatDauThucTe: text("ngay_bat_dau_thuc_te"),
  ngayKetThucThucTe: text("ngay_ket_thuc_thuc_te"),
  trangThai: text("trang_thai"),
  thuTu: integer("thu_tu"),
  canBoPhuTrachId: integer("can_bo_phu_trach_id"),
  chiPhi: text("chi_phi"),
  diaDiem: text("dia_diem"),
  tyGia: real("ty_gia"),
  loaiTienId: integer("loai_tien_id"),
});

export const capTien = sqliteTable("cap_tien", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ngayCap: text("ngay_cap").notNull(),
  hopDongId: integer("hop_dong_id").notNull(),
  soTien: real("so_tien").notNull(),
  loaiTienId: integer("loai_tien_id").notNull(),
  tyGia: real("ty_gia"),
  ghiChu: text("ghi_chu"),
});

export type InsertCapTien = typeof capTien.$inferInsert;

export const insertCapTienSchema = z.object({
  ngayCap: z.string().min(1, "Ngày cấp bắt buộc"),
  hopDongId: z.number().int().min(1, "Hợp đồng bắt buộc"),
  soTien: z.number().min(0, "Số tiền phải lớn hơn 0"),
  loaiTienId: z.number().int().min(1, "Loại tiền bắt buộc"),
  tyGia: z.number().nullable().optional(),
  ghiChu: z.string().optional(),
});

export const updateCapTienSchema = insertCapTienSchema.partial();
// User table for authentication
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").unique().notNull(),
  password: text("password").notNull(),
});

export const dieuKienGiaoHang = sqliteTable("dieu_kien_giao_hang", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ten: text("ten").notNull(),
});
// Insert schemas
export const insertLoaiHopDongSchema = createInsertSchema(loaiHopDong).omit({
  id: true,
});
export const insertCanBoSchema = createInsertSchema(canBo).omit({ id: true });
export const insertNhaCungCapSchema = createInsertSchema(nhaCungCap).omit({
  id: true,
});
export const insertChuDauTuSchema = createInsertSchema(chuDauTu).omit({
  id: true,
});
export const insertLoaiNganSachSchema = createInsertSchema(loaiNganSach).omit({
  id: true,
});
export const insertLoaiHinhThucThanhToanSchema = createInsertSchema(
  loaiHinhThucThanhToan
).omit({ id: true });
export const insertLoaiThanhToanSchema = createInsertSchema(loaiThanhToan).omit(
  { id: true }
);
export const insertLoaiTienSchema = createInsertSchema(loaiTien).omit({
  id: true,
});
export const insertCoQuanSchema = createInsertSchema(coQuan).omit({ id: true });
export const insertDiaDiemThongQuanSchema = createInsertSchema(
  diaDiemThongQuan
).omit({ id: true });
export const insertLoaiGiayPhepSchema = createInsertSchema(loaiGiayPhep).omit({
  id: true,
});
export const insertLoaiTrangBiSchema = createInsertSchema(loaiTrangBi).omit({
  id: true,
});
export const insertLoaiThucHienSchema = createInsertSchema(loaiThucHien).omit({
  id: true,
});
export const insertTrangThaiHopDongSchema = createInsertSchema(
  trangThaiHopDong
).omit({ id: true });
export const insertHopDongSchema = createInsertSchema(hopDong).omit({
  id: true,
});
export const insertTrangBiSchema = createInsertSchema(trangBi).omit({
  id: true,
});
export const insertGiayPhepSchema = createInsertSchema(giayPhep).omit({
  id: true,
});
export const insertTiepNhanSchema = createInsertSchema(tiepNhan).omit({
  id: true,
});
export const insertThanhToanSchema = createInsertSchema(thanhToan).omit({
  id: true,
});
export const insertHopDongTienDoSchema = createInsertSchema(hopDongTienDo).omit(
  { id: true }
);
export const insertFileHopDongSchema = createInsertSchema(fileHopDong).omit({
  id: true,
  ngayTaiLen: true,
});
export const insertBuocThucHienSchema = createInsertSchema(buocThucHien).omit({
  id: true,
});
export const updateBuocThucHienSchema = createInsertSchema(buocThucHien).omit({
  id: true,
});

// Types
export type InsertLoaiHopDong = z.infer<typeof insertLoaiHopDongSchema>;
export type InsertCanBo = z.infer<typeof insertCanBoSchema>;
export type InsertNhaCungCap = z.infer<typeof insertNhaCungCapSchema>;
export type InsertChuDauTu = z.infer<typeof insertChuDauTuSchema>;
export type InsertLoaiNganSach = z.infer<typeof insertLoaiNganSachSchema>;
export type InsertLoaiHinhThucThanhToan = z.infer<
  typeof insertLoaiHinhThucThanhToanSchema
>;
export type InsertLoaiThanhToan = z.infer<typeof insertLoaiThanhToanSchema>;
export type InsertLoaiTien = z.infer<typeof insertLoaiTienSchema>;
export type InsertCoQuan = z.infer<typeof insertCoQuanSchema>;
export type InsertDiaDiemThongQuan = z.infer<
  typeof insertDiaDiemThongQuanSchema
>;
export type InsertLoaiGiayPhep = z.infer<typeof insertLoaiGiayPhepSchema>;
export type InsertLoaiTrangBi = z.infer<typeof insertLoaiTrangBiSchema>;
export type InsertLoaiThucHien = z.infer<typeof insertLoaiThucHienSchema>;
export type InsertTrangThaiHopDong = z.infer<
  typeof insertTrangThaiHopDongSchema
>;
export type InsertHopDong = z.infer<typeof insertHopDongSchema>;
export type InsertTrangBi = z.infer<typeof insertTrangBiSchema>;
export type InsertGiayPhep = z.infer<typeof insertGiayPhepSchema>;
export type InsertTiepNhan = z.infer<typeof insertTiepNhanSchema>;
export type InsertThanhToan = z.infer<typeof insertThanhToanSchema>;
export type InsertHopDongTienDo = z.infer<typeof insertHopDongTienDoSchema>;
export type InsertFileHopDong = z.infer<typeof insertFileHopDongSchema>;
export type InsertBuocThucHien = z.infer<typeof insertBuocThucHienSchema>;

export type LoaiHopDong = typeof loaiHopDong.$inferSelect;
export type CanBo = typeof canBo.$inferSelect;
export type NhaCungCap = typeof nhaCungCap.$inferSelect;
export type ChuDauTu = typeof chuDauTu.$inferSelect;
export type LoaiNganSach = typeof loaiNganSach.$inferSelect;
export type LoaiHinhThucThanhToan = typeof loaiHinhThucThanhToan.$inferSelect;
export type LoaiThanhToan = typeof loaiThanhToan.$inferSelect;
export type LoaiTien = typeof loaiTien.$inferSelect;
export type CoQuan = typeof coQuan.$inferSelect;
export type DiaDiemThongQuan = typeof diaDiemThongQuan.$inferSelect;
export type LoaiGiayPhep = typeof loaiGiayPhep.$inferSelect;
export type LoaiTrangBi = typeof loaiTrangBi.$inferSelect;
export type LoaiThucHien = typeof loaiThucHien.$inferSelect;
export type TrangThaiHopDong = typeof trangThaiHopDong.$inferSelect;
export type HopDong = typeof hopDong.$inferSelect;
export type TrangBi = typeof trangBi.$inferSelect;
export type GiayPhep = typeof giayPhep.$inferSelect;
export type TiepNhan = typeof tiepNhan.$inferSelect;
export type ThanhToan = typeof thanhToan.$inferSelect;
export type HopDongTienDo = typeof hopDongTienDo.$inferSelect;
export type FileHopDong = typeof fileHopDong.$inferSelect;
export type BuocThucHien = typeof buocThucHien.$inferSelect;
export type CapTien = typeof capTien.$inferSelect;
