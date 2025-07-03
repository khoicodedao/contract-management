import {
  LoaiHopDong,
  InsertLoaiHopDong,
  loaiHopDong,
  CanBo,
  InsertCanBo,
  canBo,
  NhaCungCap,
  InsertNhaCungCap,
  nhaCungCap,
  ChuDauTu,
  InsertChuDauTu,
  chuDauTu,
  LoaiNganSach,
  InsertLoaiNganSach,
  loaiNganSach,
  LoaiHinhThucThanhToan,
  InsertLoaiHinhThucThanhToan,
  loaiHinhThucThanhToan,
  LoaiThanhToan,
  InsertLoaiThanhToan,
  loaiThanhToan,
  LoaiTien,
  InsertLoaiTien,
  loaiTien,
  CoQuan,
  InsertCoQuan,
  coQuan,
  DiaDiemThongQuan,
  InsertDiaDiemThongQuan,
  diaDiemThongQuan,
  LoaiGiayPhep,
  InsertLoaiGiayPhep,
  loaiGiayPhep,
  LoaiTrangBi,
  InsertLoaiTrangBi,
  loaiTrangBi,
  LoaiThucHien,
  InsertLoaiThucHien,
  loaiThucHien,
  TrangThaiHopDong,
  InsertTrangThaiHopDong,
  trangThaiHopDong,
  HopDong,
  InsertHopDong,
  hopDong,
  TrangBi,
  InsertTrangBi,
  trangBi,
  GiayPhep,
  InsertGiayPhep,
  giayPhep,
  TiepNhan,
  InsertTiepNhan,
  tiepNhan,
  ThanhToan,
  InsertThanhToan,
  thanhToan,
  HopDongTienDo,
  InsertHopDongTienDo,
  hopDongTienDo,
  FileHopDong,
  InsertFileHopDong,
  fileHopDong,
  BuocThucHien,
  InsertBuocThucHien,
  buocThucHien,
  User,
  InsertUser,
  users,
} from "@shared/schema";

export interface IStorage {
  // User methods (keeping for authentication)
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Loại hợp đồng
  getLoaiHopDong(): Promise<LoaiHopDong[]>;
  getLoaiHopDongById(id: number): Promise<LoaiHopDong | undefined>;
  createLoaiHopDong(item: InsertLoaiHopDong): Promise<LoaiHopDong>;
  updateLoaiHopDong(
    id: number,
    item: Partial<InsertLoaiHopDong>
  ): Promise<LoaiHopDong | undefined>;
  deleteLoaiHopDong(id: number): Promise<boolean>;

  // Cán bộ
  getCanBo(): Promise<CanBo[]>;
  getCanBoById(id: number): Promise<CanBo | undefined>;
  createCanBo(item: InsertCanBo): Promise<CanBo>;
  updateCanBo(
    id: number,
    item: Partial<InsertCanBo>
  ): Promise<CanBo | undefined>;
  deleteCanBo(id: number): Promise<boolean>;

  // Nhà cung cấp
  getNhaCungCap(): Promise<NhaCungCap[]>;
  getNhaCungCapById(id: number): Promise<NhaCungCap | undefined>;
  createNhaCungCap(item: InsertNhaCungCap): Promise<NhaCungCap>;
  updateNhaCungCap(
    id: number,
    item: Partial<InsertNhaCungCap>
  ): Promise<NhaCungCap | undefined>;
  deleteNhaCungCap(id: number): Promise<boolean>;

  // Chủ đầu tư
  getChuDauTu(): Promise<ChuDauTu[]>;
  getChuDauTuById(id: number): Promise<ChuDauTu | undefined>;
  createChuDauTu(item: InsertChuDauTu): Promise<ChuDauTu>;
  updateChuDauTu(
    id: number,
    item: Partial<InsertChuDauTu>
  ): Promise<ChuDauTu | undefined>;
  deleteChuDauTu(id: number): Promise<boolean>;

  // Loại ngân sách
  getLoaiNganSach(): Promise<LoaiNganSach[]>;
  getLoaiNganSachById(id: number): Promise<LoaiNganSach | undefined>;
  createLoaiNganSach(item: InsertLoaiNganSach): Promise<LoaiNganSach>;
  updateLoaiNganSach(
    id: number,
    item: Partial<InsertLoaiNganSach>
  ): Promise<LoaiNganSach | undefined>;
  deleteLoaiNganSach(id: number): Promise<boolean>;

  // Loại hình thức thanh toán
  getLoaiHinhThucThanhToan(): Promise<LoaiHinhThucThanhToan[]>;
  getLoaiHinhThucThanhToanById(
    id: number
  ): Promise<LoaiHinhThucThanhToan | undefined>;
  createLoaiHinhThucThanhToan(
    item: InsertLoaiHinhThucThanhToan
  ): Promise<LoaiHinhThucThanhToan>;
  updateLoaiHinhThucThanhToan(
    id: number,
    item: Partial<InsertLoaiHinhThucThanhToan>
  ): Promise<LoaiHinhThucThanhToan | undefined>;
  deleteLoaiHinhThucThanhToan(id: number): Promise<boolean>;

  // Loại thanh toán
  getLoaiThanhToan(): Promise<LoaiThanhToan[]>;
  getLoaiThanhToanById(id: number): Promise<LoaiThanhToan | undefined>;
  createLoaiThanhToan(item: InsertLoaiThanhToan): Promise<LoaiThanhToan>;
  updateLoaiThanhToan(
    id: number,
    item: Partial<InsertLoaiThanhToan>
  ): Promise<LoaiThanhToan | undefined>;
  deleteLoaiThanhToan(id: number): Promise<boolean>;

  // Loại tiền
  getLoaiTien(): Promise<LoaiTien[]>;
  getLoaiTienById(id: number): Promise<LoaiTien | undefined>;
  createLoaiTien(item: InsertLoaiTien): Promise<LoaiTien>;
  updateLoaiTien(
    id: number,
    item: Partial<InsertLoaiTien>
  ): Promise<LoaiTien | undefined>;
  deleteLoaiTien(id: number): Promise<boolean>;

  // Cơ quan
  getCoQuan(): Promise<CoQuan[]>;
  getCoQuanById(id: number): Promise<CoQuan | undefined>;
  createCoQuan(item: InsertCoQuan): Promise<CoQuan>;
  updateCoQuan(
    id: number,
    item: Partial<InsertCoQuan>
  ): Promise<CoQuan | undefined>;
  deleteCoQuan(id: number): Promise<boolean>;

  // Địa điểm thông quan
  getDiaDiemThongQuan(): Promise<DiaDiemThongQuan[]>;
  getDiaDiemThongQuanById(id: number): Promise<DiaDiemThongQuan | undefined>;
  createDiaDiemThongQuan(
    item: InsertDiaDiemThongQuan
  ): Promise<DiaDiemThongQuan>;
  updateDiaDiemThongQuan(
    id: number,
    item: Partial<InsertDiaDiemThongQuan>
  ): Promise<DiaDiemThongQuan | undefined>;
  deleteDiaDiemThongQuan(id: number): Promise<boolean>;

  // Loại giấy phép
  getLoaiGiayPhep(): Promise<LoaiGiayPhep[]>;
  getLoaiGiayPhepById(id: number): Promise<LoaiGiayPhep | undefined>;
  createLoaiGiayPhep(item: InsertLoaiGiayPhep): Promise<LoaiGiayPhep>;
  updateLoaiGiayPhep(
    id: number,
    item: Partial<InsertLoaiGiayPhep>
  ): Promise<LoaiGiayPhep | undefined>;
  deleteLoaiGiayPhep(id: number): Promise<boolean>;

  // Loại trang bị
  getLoaiTrangBi(): Promise<LoaiTrangBi[]>;
  getLoaiTrangBiById(id: number): Promise<LoaiTrangBi | undefined>;
  createLoaiTrangBi(item: InsertLoaiTrangBi): Promise<LoaiTrangBi>;
  updateLoaiTrangBi(
    id: number,
    item: Partial<InsertLoaiTrangBi>
  ): Promise<LoaiTrangBi | undefined>;
  deleteLoaiTrangBi(id: number): Promise<boolean>;

  // Loại thực hiện
  getLoaiThucHien(): Promise<LoaiThucHien[]>;
  getLoaiThucHienById(id: number): Promise<LoaiThucHien | undefined>;
  createLoaiThucHien(item: InsertLoaiThucHien): Promise<LoaiThucHien>;
  updateLoaiThucHien(
    id: number,
    item: Partial<InsertLoaiThucHien>
  ): Promise<LoaiThucHien | undefined>;
  deleteLoaiThucHien(id: number): Promise<boolean>;

  // Trạng thái hợp đồng
  getTrangThaiHopDong(): Promise<TrangThaiHopDong[]>;
  getTrangThaiHopDongById(id: number): Promise<TrangThaiHopDong | undefined>;
  createTrangThaiHopDong(
    item: InsertTrangThaiHopDong
  ): Promise<TrangThaiHopDong>;
  updateTrangThaiHopDong(
    id: number,
    item: Partial<InsertTrangThaiHopDong>
  ): Promise<TrangThaiHopDong | undefined>;
  deleteTrangThaiHopDong(id: number): Promise<boolean>;

  // Hợp đồng
  getHopDong(): Promise<HopDong[]>;
  getHopDongById(id: number): Promise<HopDong | undefined>;
  createHopDong(item: InsertHopDong): Promise<HopDong>;
  updateHopDong(
    id: number,
    item: Partial<InsertHopDong>
  ): Promise<HopDong | undefined>;
  deleteHopDong(id: number): Promise<boolean>;

  // Trang bị
  getTrangBi(): Promise<TrangBi[]>;
  getTrangBiById(id: number): Promise<TrangBi | undefined>;
  getTrangBiByHopDong(hopDongId: number): Promise<TrangBi[]>;
  createTrangBi(item: InsertTrangBi): Promise<TrangBi>;
  updateTrangBi(
    id: number,
    item: Partial<InsertTrangBi>
  ): Promise<TrangBi | undefined>;
  deleteTrangBi(id: number): Promise<boolean>;

  // Giấy phép
  getGiayPhep(): Promise<GiayPhep[]>;
  getGiayPhepById(id: number): Promise<GiayPhep | undefined>;
  getGiayPhepByHopDong(hopDongId: number): Promise<GiayPhep[]>;
  createGiayPhep(item: InsertGiayPhep): Promise<GiayPhep>;
  updateGiayPhep(
    id: number,
    item: Partial<InsertGiayPhep>
  ): Promise<GiayPhep | undefined>;
  deleteGiayPhep(id: number): Promise<boolean>;

  // Tiếp nhận
  getTiepNhan(): Promise<TiepNhan[]>;
  getTiepNhanById(id: number): Promise<TiepNhan | undefined>;
  getTiepNhanByHopDong(hopDongId: number): Promise<TiepNhan[]>;
  createTiepNhan(item: InsertTiepNhan): Promise<TiepNhan>;
  updateTiepNhan(
    id: number,
    item: Partial<InsertTiepNhan>
  ): Promise<TiepNhan | undefined>;
  deleteTiepNhan(id: number): Promise<boolean>;

  // Thanh toán
  getThanhToan(): Promise<ThanhToan[]>;
  getThanhToanById(id: number): Promise<ThanhToan | undefined>;
  getThanhToanByHopDong(hopDongId: number): Promise<ThanhToan[]>;
  createThanhToan(item: InsertThanhToan): Promise<ThanhToan>;
  updateThanhToan(
    id: number,
    item: Partial<InsertThanhToan>
  ): Promise<ThanhToan | undefined>;
  deleteThanhToan(id: number): Promise<boolean>;

  // Hợp đồng tiến độ
  getHopDongTienDo(): Promise<HopDongTienDo[]>;
  getHopDongTienDoById(id: number): Promise<HopDongTienDo | undefined>;
  getHopDongTienDoByHopDong(hopDongId: number): Promise<HopDongTienDo[]>;
  createHopDongTienDo(item: InsertHopDongTienDo): Promise<HopDongTienDo>;
  updateHopDongTienDo(
    id: number,
    item: Partial<InsertHopDongTienDo>
  ): Promise<HopDongTienDo | undefined>;
  deleteHopDongTienDo(id: number): Promise<boolean>;

  // File hợp đồng
  getFileHopDong(): Promise<FileHopDong[]>;
  getFileHopDongById(id: number): Promise<FileHopDong | undefined>;
  getFileHopDongByHopDong(hopDongId: number): Promise<FileHopDong[]>;
  createFileHopDong(item: InsertFileHopDong): Promise<FileHopDong>;
  updateFileHopDong(
    id: number,
    item: Partial<InsertFileHopDong>
  ): Promise<FileHopDong | undefined>;
  deleteFileHopDong(id: number): Promise<boolean>;

  // Bước thực hiện
  getBuocThucHien(): Promise<BuocThucHien[]>;
  getBuocThucHienById(id: number): Promise<BuocThucHien | undefined>;
  getBuocThucHienByHopDong(hopDongId: number): Promise<BuocThucHien[]>;
  createBuocThucHien(item: InsertBuocThucHien): Promise<BuocThucHien>;
  updateBuocThucHien(
    id: number,
    item: Partial<InsertBuocThucHien>
  ): Promise<BuocThucHien | undefined>;
  deleteBuocThucHien(id: number): Promise<boolean>;

  // Dashboard stats
  getDashboardStats(): Promise<{
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    overdueContracts: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private loaiHopDongMap: Map<number, LoaiHopDong> = new Map();
  private canBoMap: Map<number, CanBo> = new Map();
  private nhaCungCapMap: Map<number, NhaCungCap> = new Map();
  private chuDauTuMap: Map<number, ChuDauTu> = new Map();
  private loaiNganSachMap: Map<number, LoaiNganSach> = new Map();
  private loaiHinhThucThanhToanMap: Map<number, LoaiHinhThucThanhToan> =
    new Map();
  private loaiThanhToanMap: Map<number, LoaiThanhToan> = new Map();
  private loaiTienMap: Map<number, LoaiTien> = new Map();
  private coQuanMap: Map<number, CoQuan> = new Map();
  private diaDiemThongQuanMap: Map<number, DiaDiemThongQuan> = new Map();
  private loaiGiayPhepMap: Map<number, LoaiGiayPhep> = new Map();
  private loaiTrangBiMap: Map<number, LoaiTrangBi> = new Map();
  private loaiThucHienMap: Map<number, LoaiThucHien> = new Map();
  private trangThaiHopDongMap: Map<number, TrangThaiHopDong> = new Map();
  private hopDongMap: Map<number, HopDong> = new Map();
  private trangBiMap: Map<number, TrangBi> = new Map();
  private giayPhepMap: Map<number, GiayPhep> = new Map();
  private tiepNhanMap: Map<number, TiepNhan> = new Map();
  private thanhToanMap: Map<number, ThanhToan> = new Map();
  private hopDongTienDoMap: Map<number, HopDongTienDo> = new Map();
  private fileHopDongMap: Map<number, FileHopDong> = new Map();
  private buocThucHienMap: Map<number, BuocThucHien> = new Map();

  private currentId: number = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize contract types (loai hop dong) - Vietnamese customs
    this.loaiHopDongMap.set(1, { id: 1, ten: "Nhập khẩu" });
    this.loaiHopDongMap.set(2, { id: 2, ten: "Xuất khẩu" });
    this.loaiHopDongMap.set(3, { id: 3, ten: "Tạm xuất – Tái nhập" });
    this.loaiHopDongMap.set(4, { id: 4, ten: "Tạm nhập – Tái xuất" });

    // Initialize budget types (loai ngan sach) - Vietnamese customs
    this.loaiNganSachMap.set(1, { id: 1, ten: "Ngân sách thường xuyên" });
    this.loaiNganSachMap.set(2, { id: 2, ten: "Ngân sách dôi dư" });
    this.loaiNganSachMap.set(3, { id: 3, ten: "Ngân sách 432" });
    this.loaiNganSachMap.set(4, { id: 4, ten: "Ngân sách đặc biệt" });
    this.loaiNganSachMap.set(5, { id: 5, ten: "Ngân sách đặc thù" });

    // Initialize currency types (loai tien) - Vietnamese customs
    this.loaiTienMap.set(1, { id: 1, ten: "USD" });
    this.loaiTienMap.set(2, { id: 2, ten: "EUR" });
    this.loaiTienMap.set(3, { id: 3, ten: "VNĐ" });

    // Initialize payment methods (loai hinh thuc thanh toan) - Vietnamese customs
    this.loaiHinhThucThanhToanMap.set(1, {
      id: 1,
      ten: "Điện chuyển tiền L/C",
    });
    this.loaiHinhThucThanhToanMap.set(2, { id: 2, ten: "Tiền mặt" });
    this.loaiHinhThucThanhToanMap.set(3, { id: 3, ten: "Chuyển khoản" });

    // Initialize payment types (loai thanh toan) - Vietnamese customs
    this.loaiThanhToanMap.set(1, { id: 1, ten: "Giá trị hàng hoá" });
    this.loaiThanhToanMap.set(2, { id: 2, ten: "Thuế nhà thầu" });
    this.loaiThanhToanMap.set(3, { id: 3, ten: "Thuế VAT" });
    this.loaiThanhToanMap.set(4, { id: 4, ten: "Phí nhận hàng" });
    this.loaiThanhToanMap.set(5, { id: 5, ten: "Phí giao hàng" });

    // Initialize equipment types (loai trang bi) - Vietnamese customs
    this.loaiTrangBiMap.set(1, { id: 1, ten: "Trang bị Công nghệ thông tin" });
    this.loaiTrangBiMap.set(2, { id: 2, ten: "Trang bị điện tử" });
    this.loaiTrangBiMap.set(3, { id: 3, ten: "Trang bị Hoá học" });

    // Initialize execution types (loai thuc hien)
    this.loaiThucHienMap.set(1, { id: 1, ten: "Thực hiện trực tiếp" });
    this.loaiThucHienMap.set(2, { id: 2, ten: "Thuê ngoài" });
    this.loaiThucHienMap.set(3, { id: 3, ten: "Hợp tác" });
    this.loaiThucHienMap.set(4, { id: 4, ten: "Tư vấn" });

    // Initialize contract status (trang thai hop dong) - Vietnamese customs
    this.trangThaiHopDongMap.set(1, { id: 1, trangThai: 1 }); // Đang thực hiện
    this.trangThaiHopDongMap.set(2, { id: 2, trangThai: 2 }); // Chưa thực hiện
    this.trangThaiHopDongMap.set(3, { id: 3, trangThai: 3 }); // Đã thanh lý

    this.currentId = 100; // Start from 100 to avoid conflicts with default data
  }

  private getNextId(): number {
    return this.currentId++;
  }

  // User methods (keeping for authentication)
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.getNextId();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Loại hợp đồng
  async getLoaiHopDong(): Promise<LoaiHopDong[]> {
    return Array.from(this.loaiHopDongMap.values());
  }

  async getLoaiHopDongById(id: number): Promise<LoaiHopDong | undefined> {
    return this.loaiHopDongMap.get(id);
  }

  async createLoaiHopDong(item: InsertLoaiHopDong): Promise<LoaiHopDong> {
    const id = this.getNextId();
    const newItem: LoaiHopDong = { ...item, id };
    this.loaiHopDongMap.set(id, newItem);
    return newItem;
  }

  async updateLoaiHopDong(
    id: number,
    item: Partial<InsertLoaiHopDong>
  ): Promise<LoaiHopDong | undefined> {
    const existing = this.loaiHopDongMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.loaiHopDongMap.set(id, updated);
    return updated;
  }

  async deleteLoaiHopDong(id: number): Promise<boolean> {
    return this.loaiHopDongMap.delete(id);
  }

  // Cán bộ
  async getCanBo(): Promise<CanBo[]> {
    return Array.from(this.canBoMap.values());
  }

  async getCanBoById(id: number): Promise<CanBo | undefined> {
    return this.canBoMap.get(id);
  }

  async createCanBo(item: InsertCanBo): Promise<CanBo> {
    const id = this.getNextId();
    const newItem: CanBo = {
      ...item,
      id,
      chucVu: item.chucVu || null,
      anh: item.anh || null,
    };
    this.canBoMap.set(id, newItem);
    return newItem;
  }

  async updateCanBo(
    id: number,
    item: Partial<InsertCanBo>
  ): Promise<CanBo | undefined> {
    const existing = this.canBoMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.canBoMap.set(id, updated);
    return updated;
  }

  async deleteCanBo(id: number): Promise<boolean> {
    return this.canBoMap.delete(id);
  }

  // Nhà cung cấp
  async getNhaCungCap(): Promise<NhaCungCap[]> {
    return Array.from(this.nhaCungCapMap.values());
  }

  async getNhaCungCapById(id: number): Promise<NhaCungCap | undefined> {
    return this.nhaCungCapMap.get(id);
  }

  async createNhaCungCap(item: InsertNhaCungCap): Promise<NhaCungCap> {
    const id = this.getNextId();
    const newItem: NhaCungCap = {
      ...item,
      id,
      diaChi: item.diaChi || null,
      maQuocGia: item.maQuocGia || null,
      anh: item.anh || null,
    };
    this.nhaCungCapMap.set(id, newItem);
    return newItem;
  }

  async updateNhaCungCap(
    id: number,
    item: Partial<InsertNhaCungCap>
  ): Promise<NhaCungCap | undefined> {
    const existing = this.nhaCungCapMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.nhaCungCapMap.set(id, updated);
    return updated;
  }

  async deleteNhaCungCap(id: number): Promise<boolean> {
    return this.nhaCungCapMap.delete(id);
  }

  // Chủ đầu tư
  async getChuDauTu(): Promise<ChuDauTu[]> {
    return Array.from(this.chuDauTuMap.values());
  }

  async getChuDauTuById(id: number): Promise<ChuDauTu | undefined> {
    return this.chuDauTuMap.get(id);
  }

  async createChuDauTu(item: InsertChuDauTu): Promise<ChuDauTu> {
    const id = this.getNextId();
    const newItem: ChuDauTu = {
      ...item,
      id,
      anh: item.anh || null,
    };
    this.chuDauTuMap.set(id, newItem);
    return newItem;
  }

  async updateChuDauTu(
    id: number,
    item: Partial<InsertChuDauTu>
  ): Promise<ChuDauTu | undefined> {
    const existing = this.chuDauTuMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.chuDauTuMap.set(id, updated);
    return updated;
  }

  async deleteChuDauTu(id: number): Promise<boolean> {
    return this.chuDauTuMap.delete(id);
  }

  // Implementing all other CRUD methods in similar pattern...
  // For brevity, I'll implement a few more key ones and indicate the pattern

  // Loại ngân sách
  async getLoaiNganSach(): Promise<LoaiNganSach[]> {
    return Array.from(this.loaiNganSachMap.values());
  }

  async getLoaiNganSachById(id: number): Promise<LoaiNganSach | undefined> {
    return this.loaiNganSachMap.get(id);
  }

  async createLoaiNganSach(item: InsertLoaiNganSach): Promise<LoaiNganSach> {
    const id = this.getNextId();
    const newItem: LoaiNganSach = { ...item, id };
    this.loaiNganSachMap.set(id, newItem);
    return newItem;
  }

  async updateLoaiNganSach(
    id: number,
    item: Partial<InsertLoaiNganSach>
  ): Promise<LoaiNganSach | undefined> {
    const existing = this.loaiNganSachMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.loaiNganSachMap.set(id, updated);
    return updated;
  }

  async deleteLoaiNganSach(id: number): Promise<boolean> {
    return this.loaiNganSachMap.delete(id);
  }

  // Continue with all other entities... (similar pattern)
  // For the sake of space, I'll implement key ones and show the pattern is consistent

  // Hợp đồng (main entity)
  async getHopDong(): Promise<HopDong[]> {
    return Array.from(this.hopDongMap.values());
  }

  async getHopDongById(id: number): Promise<HopDong | undefined> {
    return this.hopDongMap.get(id);
  }

  async createHopDong(item: InsertHopDong): Promise<HopDong> {
    const id = this.getNextId();
    const newItem: HopDong = {
      ...item,
      id,
      moTa: item.moTa || null,
      soHdNoi: item.soHdNoi || null,
      soHdNgoai: item.soHdNgoai || null,
      ngay: item.ngay || null,
      loaiHopDongId: item.loaiHopDongId || null,
      chuDauTuId: item.chuDauTuId || null,
      nhaCungCapId: item.nhaCungCapId || null,
      loaiNganSachId: item.loaiNganSachId || null,
      canBoId: item.canBoId || null,
      trangThaiHopDongId: item.trangThaiHopDongId || null,
    };
    this.hopDongMap.set(id, newItem);
    return newItem;
  }

  async updateHopDong(
    id: number,
    item: Partial<InsertHopDong>
  ): Promise<HopDong | undefined> {
    const existing = this.hopDongMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.hopDongMap.set(id, updated);
    return updated;
  }

  async deleteHopDong(id: number): Promise<boolean> {
    return this.hopDongMap.delete(id);
  }

  // Dashboard stats
  async getDashboardStats(): Promise<{
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    overdueContracts: number;
  }> {
    const contracts = Array.from(this.hopDongMap.values());
    const today = new Date();

    return {
      totalContracts: contracts.length,
      activeContracts: contracts.filter((c) => c.trangThaiHopDongId === 1)
        .length,
      completedContracts: contracts.filter((c) => c.trangThaiHopDongId === 2)
        .length,
      overdueContracts: contracts.filter((c) => c.trangThaiHopDongId === 3)
        .length,
    };
  }

  // Implementing remaining methods following the same pattern...
  // I'll add all the remaining methods but keep them concise

  async getLoaiHinhThucThanhToan(): Promise<LoaiHinhThucThanhToan[]> {
    return Array.from(this.loaiHinhThucThanhToanMap.values());
  }

  async getLoaiHinhThucThanhToanById(
    id: number
  ): Promise<LoaiHinhThucThanhToan | undefined> {
    return this.loaiHinhThucThanhToanMap.get(id);
  }

  async createLoaiHinhThucThanhToan(
    item: InsertLoaiHinhThucThanhToan
  ): Promise<LoaiHinhThucThanhToan> {
    const id = this.getNextId();
    const newItem: LoaiHinhThucThanhToan = { ...item, id };
    this.loaiHinhThucThanhToanMap.set(id, newItem);
    return newItem;
  }

  async updateLoaiHinhThucThanhToan(
    id: number,
    item: Partial<InsertLoaiHinhThucThanhToan>
  ): Promise<LoaiHinhThucThanhToan | undefined> {
    const existing = this.loaiHinhThucThanhToanMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.loaiHinhThucThanhToanMap.set(id, updated);
    return updated;
  }

  async deleteLoaiHinhThucThanhToan(id: number): Promise<boolean> {
    return this.loaiHinhThucThanhToanMap.delete(id);
  }

  // Add all remaining methods following same pattern - omitting for space but all would be implemented
  async getLoaiThanhToan(): Promise<LoaiThanhToan[]> {
    return Array.from(this.loaiThanhToanMap.values());
  }
  async getLoaiThanhToanById(id: number): Promise<LoaiThanhToan | undefined> {
    return this.loaiThanhToanMap.get(id);
  }
  async createLoaiThanhToan(item: InsertLoaiThanhToan): Promise<LoaiThanhToan> {
    const id = this.getNextId();
    const newItem: LoaiThanhToan = { ...item, id };
    this.loaiThanhToanMap.set(id, newItem);
    return newItem;
  }
  async updateLoaiThanhToan(
    id: number,
    item: Partial<InsertLoaiThanhToan>
  ): Promise<LoaiThanhToan | undefined> {
    const existing = this.loaiThanhToanMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.loaiThanhToanMap.set(id, updated);
    return updated;
  }
  async deleteLoaiThanhToan(id: number): Promise<boolean> {
    return this.loaiThanhToanMap.delete(id);
  }

  async getLoaiTien(): Promise<LoaiTien[]> {
    return Array.from(this.loaiTienMap.values());
  }
  async getLoaiTienById(id: number): Promise<LoaiTien | undefined> {
    return this.loaiTienMap.get(id);
  }
  async createLoaiTien(item: InsertLoaiTien): Promise<LoaiTien> {
    const id = this.getNextId();
    const newItem: LoaiTien = { ...item, id };
    this.loaiTienMap.set(id, newItem);
    return newItem;
  }
  async updateLoaiTien(
    id: number,
    item: Partial<InsertLoaiTien>
  ): Promise<LoaiTien | undefined> {
    const existing = this.loaiTienMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.loaiTienMap.set(id, updated);
    return updated;
  }
  async deleteLoaiTien(id: number): Promise<boolean> {
    return this.loaiTienMap.delete(id);
  }

  async getCoQuan(): Promise<CoQuan[]> {
    return Array.from(this.coQuanMap.values());
  }
  async getCoQuanById(id: number): Promise<CoQuan | undefined> {
    return this.coQuanMap.get(id);
  }
  async createCoQuan(item: InsertCoQuan): Promise<CoQuan> {
    const id = this.getNextId();
    const newItem: CoQuan = { ...item, id };
    this.coQuanMap.set(id, newItem);
    return newItem;
  }
  async updateCoQuan(
    id: number,
    item: Partial<InsertCoQuan>
  ): Promise<CoQuan | undefined> {
    const existing = this.coQuanMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.coQuanMap.set(id, updated);
    return updated;
  }
  async deleteCoQuan(id: number): Promise<boolean> {
    return this.coQuanMap.delete(id);
  }

  async getDiaDiemThongQuan(): Promise<DiaDiemThongQuan[]> {
    return Array.from(this.diaDiemThongQuanMap.values());
  }
  async getDiaDiemThongQuanById(
    id: number
  ): Promise<DiaDiemThongQuan | undefined> {
    return this.diaDiemThongQuanMap.get(id);
  }
  async createDiaDiemThongQuan(
    item: InsertDiaDiemThongQuan
  ): Promise<DiaDiemThongQuan> {
    const id = this.getNextId();
    const newItem: DiaDiemThongQuan = { ...item, id };
    this.diaDiemThongQuanMap.set(id, newItem);
    return newItem;
  }
  async updateDiaDiemThongQuan(
    id: number,
    item: Partial<InsertDiaDiemThongQuan>
  ): Promise<DiaDiemThongQuan | undefined> {
    const existing = this.diaDiemThongQuanMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.diaDiemThongQuanMap.set(id, updated);
    return updated;
  }
  async deleteDiaDiemThongQuan(id: number): Promise<boolean> {
    return this.diaDiemThongQuanMap.delete(id);
  }

  async getLoaiGiayPhep(): Promise<LoaiGiayPhep[]> {
    return Array.from(this.loaiGiayPhepMap.values());
  }
  async getLoaiGiayPhepById(id: number): Promise<LoaiGiayPhep | undefined> {
    return this.loaiGiayPhepMap.get(id);
  }
  async createLoaiGiayPhep(item: InsertLoaiGiayPhep): Promise<LoaiGiayPhep> {
    const id = this.getNextId();
    const newItem: LoaiGiayPhep = { ...item, id };
    this.loaiGiayPhepMap.set(id, newItem);
    return newItem;
  }
  async updateLoaiGiayPhep(
    id: number,
    item: Partial<InsertLoaiGiayPhep>
  ): Promise<LoaiGiayPhep | undefined> {
    const existing = this.loaiGiayPhepMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.loaiGiayPhepMap.set(id, updated);
    return updated;
  }
  async deleteLoaiGiayPhep(id: number): Promise<boolean> {
    return this.loaiGiayPhepMap.delete(id);
  }

  async getLoaiTrangBi(): Promise<LoaiTrangBi[]> {
    return Array.from(this.loaiTrangBiMap.values());
  }
  async getLoaiTrangBiById(id: number): Promise<LoaiTrangBi | undefined> {
    return this.loaiTrangBiMap.get(id);
  }
  async createLoaiTrangBi(item: InsertLoaiTrangBi): Promise<LoaiTrangBi> {
    const id = this.getNextId();
    const newItem: LoaiTrangBi = { ...item, id };
    this.loaiTrangBiMap.set(id, newItem);
    return newItem;
  }
  async updateLoaiTrangBi(
    id: number,
    item: Partial<InsertLoaiTrangBi>
  ): Promise<LoaiTrangBi | undefined> {
    const existing = this.loaiTrangBiMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.loaiTrangBiMap.set(id, updated);
    return updated;
  }
  async deleteLoaiTrangBi(id: number): Promise<boolean> {
    return this.loaiTrangBiMap.delete(id);
  }

  async getLoaiThucHien(): Promise<LoaiThucHien[]> {
    return Array.from(this.loaiThucHienMap.values());
  }
  async getLoaiThucHienById(id: number): Promise<LoaiThucHien | undefined> {
    return this.loaiThucHienMap.get(id);
  }
  async createLoaiThucHien(item: InsertLoaiThucHien): Promise<LoaiThucHien> {
    const id = this.getNextId();
    const newItem: LoaiThucHien = { ...item, id };
    this.loaiThucHienMap.set(id, newItem);
    return newItem;
  }
  async updateLoaiThucHien(
    id: number,
    item: Partial<InsertLoaiThucHien>
  ): Promise<LoaiThucHien | undefined> {
    const existing = this.loaiThucHienMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.loaiThucHienMap.set(id, updated);
    return updated;
  }
  async deleteLoaiThucHien(id: number): Promise<boolean> {
    return this.loaiThucHienMap.delete(id);
  }

  async getTrangThaiHopDong(): Promise<TrangThaiHopDong[]> {
    return Array.from(this.trangThaiHopDongMap.values());
  }
  async getTrangThaiHopDongById(
    id: number
  ): Promise<TrangThaiHopDong | undefined> {
    return this.trangThaiHopDongMap.get(id);
  }
  async createTrangThaiHopDong(
    item: InsertTrangThaiHopDong
  ): Promise<TrangThaiHopDong> {
    const id = this.getNextId();
    const newItem: TrangThaiHopDong = { ...item, id };
    this.trangThaiHopDongMap.set(id, newItem);
    return newItem;
  }
  async updateTrangThaiHopDong(
    id: number,
    item: Partial<InsertTrangThaiHopDong>
  ): Promise<TrangThaiHopDong | undefined> {
    const existing = this.trangThaiHopDongMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.trangThaiHopDongMap.set(id, updated);
    return updated;
  }
  async deleteTrangThaiHopDong(id: number): Promise<boolean> {
    return this.trangThaiHopDongMap.delete(id);
  }

  async getTrangBi(): Promise<TrangBi[]> {
    return Array.from(this.trangBiMap.values());
  }
  async getTrangBiById(id: number): Promise<TrangBi | undefined> {
    return this.trangBiMap.get(id);
  }
  async getTrangBiByHopDong(hopDongId: number): Promise<TrangBi[]> {
    return Array.from(this.trangBiMap.values()).filter(
      (item) => item.hopDongId === hopDongId
    );
  }
  async createTrangBi(item: InsertTrangBi): Promise<TrangBi> {
    const id = this.getNextId();
    const newItem: TrangBi = {
      ...item,
      id,
      nhaCungCapId: item.nhaCungCapId || null,
      loaiTrangBiId: item.loaiTrangBiId || null,
      donGia: item.donGia || null,
      loaiTienId: item.loaiTienId || null,
      hopDongId: item.hopDongId || null,
    };
    this.trangBiMap.set(id, newItem);
    return newItem;
  }
  async updateTrangBi(
    id: number,
    item: Partial<InsertTrangBi>
  ): Promise<TrangBi | undefined> {
    const existing = this.trangBiMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.trangBiMap.set(id, updated);
    return updated;
  }
  async deleteTrangBi(id: number): Promise<boolean> {
    return this.trangBiMap.delete(id);
  }

  async getGiayPhep(): Promise<GiayPhep[]> {
    return Array.from(this.giayPhepMap.values());
  }
  async getGiayPhepById(id: number): Promise<GiayPhep | undefined> {
    return this.giayPhepMap.get(id);
  }
  async getGiayPhepByHopDong(hopDongId: number): Promise<GiayPhep[]> {
    return Array.from(this.giayPhepMap.values()).filter(
      (item) => item.hopDongId === hopDongId
    );
  }
  async createGiayPhep(item: InsertGiayPhep): Promise<GiayPhep> {
    const id = this.getNextId();
    const newItem: GiayPhep = {
      ...item,
      id,
      ngay: item.ngay || null,
      hopDongId: item.hopDongId || null,
      loaiGiayPhepId: item.loaiGiayPhepId || null,
      coQuanId: item.coQuanId || null,
      noiDung: item.noiDung || null,
    };
    this.giayPhepMap.set(id, newItem);
    return newItem;
  }
  async updateGiayPhep(
    id: number,
    item: Partial<InsertGiayPhep>
  ): Promise<GiayPhep | undefined> {
    const existing = this.giayPhepMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.giayPhepMap.set(id, updated);
    return updated;
  }
  async deleteGiayPhep(id: number): Promise<boolean> {
    return this.giayPhepMap.delete(id);
  }

  async getTiepNhan(): Promise<TiepNhan[]> {
    return Array.from(this.tiepNhanMap.values());
  }
  async getTiepNhanById(id: number): Promise<TiepNhan | undefined> {
    return this.tiepNhanMap.get(id);
  }
  async getTiepNhanByHopDong(hopDongId: number): Promise<TiepNhan[]> {
    return Array.from(this.tiepNhanMap.values()).filter(
      (item) => item.hopDongId === hopDongId
    );
  }
  async createTiepNhan(item: InsertTiepNhan): Promise<TiepNhan> {
    const id = this.getNextId();
    const newItem: TiepNhan = {
      ...item,
      id,
      hopDongId: item.hopDongId || null,
      tenHang: item.tenHang || null,
      soToKhai: item.soToKhai || null,
      soVanDon: item.soVanDon || null,
      soPhieuDongGoi: item.soPhieuDongGoi || null,
      soHoaDon: item.soHoaDon || null,
      soBaoHiem: item.soBaoHiem || null,
      diaDiemThongQuanId: item.diaDiemThongQuanId || null,
      ngayThucHien: item.ngayThucHien || null,
    };
    this.tiepNhanMap.set(id, newItem);
    return newItem;
  }
  async updateTiepNhan(
    id: number,
    item: Partial<InsertTiepNhan>
  ): Promise<TiepNhan | undefined> {
    const existing = this.tiepNhanMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.tiepNhanMap.set(id, updated);
    return updated;
  }
  async deleteTiepNhan(id: number): Promise<boolean> {
    return this.tiepNhanMap.delete(id);
  }

  async getThanhToan(): Promise<ThanhToan[]> {
    return Array.from(this.thanhToanMap.values());
  }
  async getThanhToanById(id: number): Promise<ThanhToan | undefined> {
    return this.thanhToanMap.get(id);
  }
  async getThanhToanByHopDong(hopDongId: number): Promise<ThanhToan[]> {
    return Array.from(this.thanhToanMap.values()).filter(
      (item) => item.hopDongId === hopDongId
    );
  }
  async createThanhToan(item: InsertThanhToan): Promise<ThanhToan> {
    const id = this.getNextId();
    const newItem: ThanhToan = {
      ...item,
      id,
      hopDongId: item.hopDongId || null,
      loaiHinhThucThanhToanId: item.loaiHinhThucThanhToanId || null,
      loaiThanhToanId: item.loaiThanhToanId || null,
      noiDung: item.noiDung || null,
      hanHopDong: item.hanHopDong || null,
      hanThucHien: item.hanThucHien || null,
      soTien: item.soTien || null,
      loaiTienId: item.loaiTienId || null,
    };
    this.thanhToanMap.set(id, newItem);
    return newItem;
  }
  async updateThanhToan(
    id: number,
    item: Partial<InsertThanhToan>
  ): Promise<ThanhToan | undefined> {
    const existing = this.thanhToanMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.thanhToanMap.set(id, updated);
    return updated;
  }
  async deleteThanhToan(id: number): Promise<boolean> {
    return this.thanhToanMap.delete(id);
  }

  async getHopDongTienDo(): Promise<HopDongTienDo[]> {
    return Array.from(this.hopDongTienDoMap.values());
  }
  async getHopDongTienDoById(id: number): Promise<HopDongTienDo | undefined> {
    return this.hopDongTienDoMap.get(id);
  }
  async getHopDongTienDoByHopDong(hopDongId: number): Promise<HopDongTienDo[]> {
    return Array.from(this.hopDongTienDoMap.values()).filter(
      (item) => item.hopDongId === hopDongId
    );
  }
  async createHopDongTienDo(item: InsertHopDongTienDo): Promise<HopDongTienDo> {
    const id = this.getNextId();
    const newItem: HopDongTienDo = {
      ...item,
      id,
      canBoId: item.canBoId || null,
      loaiTienId: item.loaiTienId || null,
      hopDongId: item.hopDongId || null,
      hanHopDong: item.hanHopDong || null,
      hanThucHien: item.hanThucHien || null,
      loaiThucHienId: item.loaiThucHienId || null,
      ghiChu: item.ghiChu || null,
      chiPhi: item.chiPhi || null,
      diaDiem: item.diaDiem || null,
    };
    this.hopDongTienDoMap.set(id, newItem);
    return newItem;
  }
  async updateHopDongTienDo(
    id: number,
    item: Partial<InsertHopDongTienDo>
  ): Promise<HopDongTienDo | undefined> {
    const existing = this.hopDongTienDoMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.hopDongTienDoMap.set(id, updated);
    return updated;
  }
  async deleteHopDongTienDo(id: number): Promise<boolean> {
    return this.hopDongTienDoMap.delete(id);
  }

  async getFileHopDong(): Promise<FileHopDong[]> {
    return Array.from(this.fileHopDongMap.values());
  }
  async getFileHopDongById(id: number): Promise<FileHopDong | undefined> {
    return this.fileHopDongMap.get(id);
  }
  async getFileHopDongByHopDong(hopDongId: number): Promise<FileHopDong[]> {
    return Array.from(this.fileHopDongMap.values()).filter(
      (item) => item.hopDongId === hopDongId
    );
  }
  async createFileHopDong(item: InsertFileHopDong): Promise<FileHopDong> {
    const id = this.getNextId();
    const newItem: FileHopDong = {
      ...item,
      id,
      ngayTaiLen: new Date(),
      ghiChu: item.ghiChu || null,
      tenFile: item.tenFile || null,
      loaiFile: item.loaiFile || null,
      kichThuoc: item.kichThuoc || null,
      nguoiTaiLen: item.nguoiTaiLen || null,
    };
    this.fileHopDongMap.set(id, newItem);
    return newItem;
  }
  async updateFileHopDong(
    id: number,
    item: Partial<InsertFileHopDong>
  ): Promise<FileHopDong | undefined> {
    const existing = this.fileHopDongMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.fileHopDongMap.set(id, updated);
    return updated;
  }
  async deleteFileHopDong(id: number): Promise<boolean> {
    return this.fileHopDongMap.delete(id);
  }

  async getBuocThucHien(): Promise<BuocThucHien[]> {
    return Array.from(this.buocThucHienMap.values());
  }
  async getBuocThucHienById(id: number): Promise<BuocThucHien | undefined> {
    return this.buocThucHienMap.get(id);
  }
  async getBuocThucHienByHopDong(hopDongId: number): Promise<BuocThucHien[]> {
    return Array.from(this.buocThucHienMap.values()).filter(
      (item) => item.hopDongId === hopDongId
    );
  }
  async createBuocThucHien(item: InsertBuocThucHien): Promise<BuocThucHien> {
    const id = this.getNextId();
    const newItem: BuocThucHien = {
      ...item,
      id,
      ten: item.ten || null,
      moTa: item.moTa || null,
      trangThai: item.trangThai || null,
      ghiChu: item.ghiChu || null,
      thuTu: item.thuTu || null,
      ngayBatDau: item.ngayBatDau || null,
      ngayKetThuc: item.ngayKetThuc || null,
      ngayBatDauThucTe: item.ngayBatDauThucTe || null,
      ngayKetThucThucTe: item.ngayKetThucThucTe || null,
      canhBao: item.canhBao || null,
      canBoPhuTrachId: item.canBoPhuTrachId || null,
    };
    this.buocThucHienMap.set(id, newItem);
    return newItem;
  }
  async updateBuocThucHien(
    id: number,
    item: Partial<InsertBuocThucHien>
  ): Promise<BuocThucHien | undefined> {
    const existing = this.buocThucHienMap.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...item };
    this.buocThucHienMap.set(id, updated);
    return updated;
  }
  async deleteBuocThucHien(id: number): Promise<boolean> {
    return this.buocThucHienMap.delete(id);
  }
}

export const storage = new MemStorage();
