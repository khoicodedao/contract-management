import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "@shared/schema";

const sqlite = new Database("./database.sqlite");
export const db = drizzle(sqlite, { schema });

// Create tables manually since we don't have migrations
function createTables() {
  console.log("Creating database tables...");

  // Create all tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS loai_hop_dong (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS can_bo (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL,
      chuc_vu TEXT,
      so_dien_thoai TEXT,
      email TEXT,
      dia_chi TEXT,
      mo_ta TEXT,
      anh TEXT
    );
    
    CREATE TABLE IF NOT EXISTS nha_cung_cap (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL,
      dia_chi TEXT,
      so_dien_thoai TEXT,
      email TEXT,
      nguoi_lien_he TEXT,
      chuc_vu_nguoi_lien_he TEXT,
      mo_ta TEXT,
      ma_quoc_gia TEXT,
      anh TEXT,
      latitude REAL,
      longitude REAL
    );
    
    CREATE TABLE IF NOT EXISTS chu_dau_tu (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL,
      dia_chi TEXT,
      so_dien_thoai TEXT,
      email TEXT,
      nguoi_lien_he TEXT,
      chuc_vu_nguoi_lien_he TEXT,
      mo_ta TEXT,
      anh TEXT
    );
    
    CREATE TABLE IF NOT EXISTS loai_ngan_sach (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS loai_hinh_thuc_thanh_toan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS loai_thanh_toan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS loai_tien (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS loai_trang_bi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS trang_thai_hop_dong (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trang_thai INTEGER NOT NULL
    );
    
    CREATE TABLE IF NOT EXISTS hop_dong (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL,
      mo_ta TEXT,
      so_hd_noi TEXT,
      so_hd_ngoai TEXT,
      ngay TEXT,
      gia_tri_hop_dong REAL,
      loai_hop_dong_id INTEGER,
      chu_dau_tu_id INTEGER,
      nha_cung_cap_id INTEGER,
      loai_ngan_sach_id INTEGER,
      can_bo_id INTEGER,
      trang_thai_hop_dong_id INTEGER,
      loai_tien_id INTEGER,
      ty_gia REAL,
      phi_uy_thac REAL
    );
    
    CREATE TABLE IF NOT EXISTS trang_bi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hop_dong_id INTEGER NOT NULL,
      ten TEXT NOT NULL,
      loai_trang_bi_id INTEGER,
      don_gia REAL,
      so_luong INTEGER,
      loai_tien_id INTEGER,
      nha_cung_cap_id INTEGER,
      mo_ta TEXT,
      trang_thai TEXT,
      ngay_mua TEXT,
      bao_hanh TEXT
    );

    CREATE TABLE IF NOT EXISTS cap_tien (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ngay_cap TEXT NOT NULL,              
  hop_dong_id INTEGER NOT NULL,       
  so_tien REAL NOT NULL,               
  loai_tien_id INTEGER NOT NULL,      
  ty_gia REAL,                         
  ghi_chu TEXT,                       
  FOREIGN KEY (hop_dong_id) REFERENCES hop_dong(id),
  FOREIGN KEY (loai_tien_id) REFERENCES loai_tien(id)
);

    
    CREATE TABLE IF NOT EXISTS thanh_toan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hop_dong_id INTEGER NOT NULL,
      loai_tien_id INTEGER,
      loai_hinh_thuc_thanh_toan_id INTEGER,
      loai_thanh_toan_id INTEGER,
      so_tien REAL,
      ngay_den_han TEXT,
      ngay_thanh_toan TEXT,
      ghi_chu TEXT,
      da_thanh_toan INTEGER DEFAULT 0,
      noi_dung TEXT,
      han_hop_dong TEXT,
      han_thuc_hien TEXT
    );
    
    CREATE TABLE IF NOT EXISTS buoc_thuc_hien (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hop_dong_id INTEGER NOT NULL,
      ten TEXT NOT NULL,
      mo_ta TEXT,
      ngay_bat_dau TEXT,
      ngay_ket_thuc TEXT,
      ngay_bat_dau_thuc_te TEXT,
      ngay_ket_thuc_thuc_te TEXT,
      trang_thai TEXT,
      thu_tu INTEGER,
      can_bo_phu_trach_id INTEGER,
      chi_phi TEXT,
      ty_gia REAL,
      dia_diem TEXT,
      ghi_chu TEXT,
      loai_tien_id INTEGER

    );
    
    CREATE TABLE IF NOT EXISTS file_hop_dong (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hop_dong_id INTEGER NOT NULL,
      ten_file TEXT NOT NULL,
      loai_file TEXT,
      duong_dan TEXT,
      noi_dung_file TEXT,
      kich_thuoc INTEGER,
      ngay_tai_len TEXT,
      nguoi_tai_len INTEGER,
      ghi_chu TEXT
    );

    CREATE TABLE IF NOT EXISTS dia_diem_thong_quan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ten TEXT NOT NULL,
      chi_cuc TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tiep_nhan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hop_dong_id INTEGER NOT NULL,
      ten_hang TEXT NOT NULL,
      so_to_khai TEXT,
      so_van_don TEXT,
      so_phieu_dong_goi TEXT,
      so_hoa_don TEXT,
      so_bao_hiem TEXT,
      dia_diem_thong_quan_id INTEGER,
      dia_diem_thong_quan_tu_do TEXT,
      dieu_kien_giao_hang_id INTEGER,
      ngay_thuc_hien TEXT NOT NULL,
      FOREIGN KEY (hop_dong_id) REFERENCES hop_dong(id),
      FOREIGN KEY (dia_diem_thong_quan_id) REFERENCES dia_diem_thong_quan(id)
      FOREIGN KEY (dieu_kien_giao_hang_id) REFERENCES dieu_kien_giao_hang(id)
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS dieu_kien_giao_hang (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ten TEXT NOT NULL
    );

  `);
}

// Initialize database with sample data
export async function initializeDatabase() {
  console.log("Initializing SQLite database...");

  // Create tables first
  createTables();

  // Check if data already exists
  try {
    const existingContracts = await db.select().from(schema.hopDong).limit(1);
    if (existingContracts.length > 0) {
      console.log("Database already has data, skipping initialization");
      return;
    }
  } catch (error) {
    console.log("Database is empty, proceeding with seeding...");
  }

  console.log("Seeding database with initial data...");

  // Insert contract types
  await db
    .insert(schema.loaiHopDong)
    .values([
      { ten: "Nhập khẩu" },
      { ten: "Xuất khẩu" },
      { ten: "Tạm xuất – Tái nhập" },
      { ten: "Tạm nhập – Tái xuất" },
    ]);

  // Insert budget types
  await db
    .insert(schema.loaiNganSach)
    .values([
      { ten: "Ngân sách thường xuyên" },
      { ten: "Ngân sách dôi dư" },
      { ten: "Ngân sách 432" },
      { ten: "Ngân sách đặc biệt" },
      { ten: "Ngân sách đặc thù" },
    ]);

  // Insert currency types
  await db
    .insert(schema.loaiTien)
    .values([{ ten: "USD" }, { ten: "EUR" }, { ten: "VNĐ" }]);

  // Insert payment methods
  await db
    .insert(schema.loaiHinhThucThanhToan)
    .values([
      { ten: "Điện chuyển tiền L/C" },
      { ten: "Tiền mặt" },
      { ten: "Chuyển khoản" },
    ]);

  // Insert payment types
  await db
    .insert(schema.loaiThanhToan)
    .values([
      { ten: "Giá trị hàng hoá" },
      { ten: "Thuế nhà thầu" },
      { ten: "Thuế VAT" },
      { ten: "Phí nhận hàng" },
      { ten: "Phí giao hàng" },
    ]);

  // Insert equipment types
  await db
    .insert(schema.loaiTrangBi)
    .values([
      { ten: "Trang bị Công nghệ thông tin" },
      { ten: "Trang bị điện tử" },
      { ten: "Trang bị Hoá học" },
    ]);

  // Insert contract statuses
  await db.insert(schema.trangThaiHopDong).values([
    { trangThai: 1 }, // Đang thực hiện
    { trangThai: 2 }, // Chưa thực hiện
    { trangThai: 3 }, // Đã thanh lý
  ]);

  // Insert sample staff
  await db.insert(schema.canBo).values([
    {
      ten: "Ngô Văn Khang",
      chucVu: "Trưởng phòng",
      soDienThoai: "0123456789",
      email: "ngovankang@customs.gov.vn",
      diaChi: "Hà Nội",
      moTa: "Trưởng phòng với 15 năm kinh nghiệm",
    },
    {
      ten: "Nguyễn Văn Sáu",
      chucVu: "Phó trưởng phòng",
      soDienThoai: "0987654321",
      email: "nguyenvansau@customs.gov.vn",
      diaChi: "Hà Nội",
      moTa: "Phó trưởng phòng phụ trách nghiệp vụ",
    },
    {
      ten: "Hoàng Văn Công",
      chucVu: "Trợ lý",
      soDienThoai: "0112233445",
      email: "hoangvancong@customs.gov.vn",
      diaChi: "Hà Nội",
      moTa: "Trợ lý trưởng phòng",
    },
    {
      ten: "Phan Quân",
      chucVu: "Trợ lý",
      soDienThoai: "0556677889",
      email: "phanquan@customs.gov.vn",
      diaChi: "Hà Nội",
      moTa: "Trợ lý chuyên viên",
    },
    {
      ten: "Tô Quyên",
      chucVu: "Trợ lý",
      soDienThoai: "0334455667",
      email: "toquyen@customs.gov.vn",
      diaChi: "Hà Nội",
      moTa: "Trợ lý kỹ thuật",
    },
  ]);

  // Insert sample suppliers
  await db.insert(schema.nhaCungCap).values([
    {
      ten: "YXG",
      diaChi: "Singapore, Singapore",
      soDienThoai: "+65 6555 1234",
      email: "contact@yxg.com.sg",
      nguoiLienHe: "Lim Wei Ming",
      chucVuNguoiLienHe: "Sales Director",
      moTa: "Nhà cung cấp thiết bị công nghệ cao",
      maQuocGia: "SG",
    },
    {
      ten: "Yamaha",
      diaChi: "Madrid, Tây Ban Nha",
      soDienThoai: "+34 91 555 6789",
      email: "spain@yamaha.com",
      nguoiLienHe: "Carlos Rodriguez",
      chucVuNguoiLienHe: "Regional Manager",
      moTa: "Công ty sản xuất thiết bị âm thanh và điện tử",
      maQuocGia: "ES",
    },
    {
      ten: "Corpus",
      diaChi: "Praha, CH Séc",
      soDienThoai: "+420 222 555 888",
      email: "info@corpus.cz",
      nguoiLienHe: "Pavel Novák",
      chucVuNguoiLienHe: "Export Manager",
      moTa: "Nhà sản xuất thiết bị y tế và khoa học",
      maQuocGia: "CZ",
    },
  ]);
  // Insert sample incoterm
  await db
    .insert(schema.dieuKienGiaoHang)
    .values([
      { ten: "Ex Works(EXW)" },
      { ten: "Free Carrier (FCA)" },
      { ten: "Carriage Paid To(CPT)" },
      { ten: "Carriage and Insurance Paid To(CIP)" },
      { ten: "Delivered at Terminal(DAT)" },
      { ten: "Delivered at Place(DAP)" },
      { ten: "Delivered Duty Paid (DDP)" },
      { ten: "Free Alongside Ship(FAS)" },
      { ten: "Cost and Freight(CFR)" },
      { ten: "Free On Board(FOB)" },
      { ten: "Cost, Insurance and Freight(CIF)" },
    ]);
  // Insert sample investors
  await db.insert(schema.chuDauTu).values([
    {
      ten: "Cục Y tế",
      diaChi: "138A Giảng Võ, Đống Đa, Hà Nội",
      soDienThoai: "024-3962-5555",
      email: "cuc.yte@moh.gov.vn",
      nguoiLienHe: "Phạm Duy Tuấn",
      chucVuNguoiLienHe: "Cục trưởng",
      moTa: "Cơ quan quản lý y tế dự phòng và y tế công cộng",
    },
    {
      ten: "Cục Trắc địa",
      diaChi: "1 Hoàng Diệu, Ba Đình, Hà Nội",
      soDienThoai: "024-3734-6666",
      email: "cuc.tracdia@monre.gov.vn",
      nguoiLienHe: "Lê Văn Nam",
      chucVuNguoiLienHe: "Cục trưởng",
      moTa: "Cơ quan quản lý đo đạc bản đồ và thông tin địa lý",
    },
    {
      ten: "Cục Vận tải",
      diaChi: "80 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội",
      soDienThoai: "024-3942-7777",
      email: "cuc.vantai@mt.gov.vn",
      nguoiLienHe: "Nguyễn Văn Hùng",
      chucVuNguoiLienHe: "Cục trưởng",
      moTa: "Cơ quan quản lý vận tải đường bộ, đường sắt, đường thủy",
    },
  ]);

  // Seed sample contracts and related data
  const { seedSQLiteDatabase } = await import("./seed-data-sqlite");
  await seedSQLiteDatabase();

  console.log("Database initialization completed!");
}
