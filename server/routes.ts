import { Express } from "express";
import { Server } from "http";
import { eq, ilike, sql } from "drizzle-orm";
import { db } from "./database.js";
import * as schema from "../shared/schema.js";
import {
  insertLoaiHopDongSchema,
  insertCanBoSchema,
  insertNhaCungCapSchema,
  insertChuDauTuSchema,
  insertHopDongSchema,
  insertLoaiNganSachSchema,
  insertLoaiTienSchema,
  insertThanhToanSchema,
  insertTrangBiSchema,
  insertBuocThucHienSchema,
  insertFileHopDongSchema,
  insertHopDongTienDoSchema,
  insertDiaDiemThongQuanSchema,
  insertTiepNhanSchema,
} from "../shared/schema.js";
import multer from "multer";
import path from "path";

const upload = multer({
  storage: multer.memoryStorage(), // Lưu file trong RAM (có thể đổi thành diskStorage)
  limits: {
    fileSize: 1000 * 1024 * 1024, // 10MB
  },
});
export async function registerRoutes(app: Express): Promise<void> {
  // System overview route
  app.get("/api/system/overview", async (req, res) => {
    try {
      const contracts = await db.select().from(schema.hopDong);
      const payments = await db.select().from(schema.thanhToan);
      const equipment = await db.select().from(schema.trangBi);
      const documents = await db.select().from(schema.fileHopDong);
      const progressSteps = await db.select().from(schema.buocThucHien);

      const stats = {
        totalContracts: contracts.length,
        activeContracts: contracts.filter((c) => c.trangThaiId === 1).length,
        completedContracts: contracts.filter((c) => c.trangThaiId === 3).length,
        pausedContracts: contracts.filter((c) => c.trangThaiId === 2).length,
        totalValue: contracts.reduce(
          (sum, c) => sum + (c.giaTriHopDong || 0),
          0
        ),
        totalPayments: payments.length,
        pendingPayments: payments.filter(
          (p) => p.trangThai === "Chưa thanh toán"
        ).length,
        completedPayments: payments.filter(
          (p) => p.trangThai === "Đã thanh toán"
        ).length,
        totalEquipment: equipment.length,
        totalDocuments: documents.length,
        totalProgressSteps: progressSteps.length,
        inProgressSteps: progressSteps.filter(
          (p) => p.trangThai === "Đang thực hiện"
        ).length,
        completedSteps: progressSteps.filter(
          (p) => p.trangThai === "Hoàn thành"
        ).length,
        pendingSteps: progressSteps.filter(
          (p) => p.trangThai === "Chưa bắt đầu"
        ).length,
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching system overview:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  // Download project route
  app.get("/api/download/project", (req, res) => {
    const filePath =
      "/home/runner/workspace/vietnamese-contract-management-fixed.tar.gz";
    res.download(
      filePath,
      "vietnamese-contract-management-fixed.tar.gz",
      (err) => {
        if (err) {
          console.error("Download error:", err);
          res.status(500).json({ error: "Không thể tải file" });
        }
      }
    );
  });

  // Dashboard charts route
  app.get("/api/dashboard/charts", async (req, res) => {
    try {
      const contractTypes = await db.select().from(schema.loaiHopDong);
      const contracts = await db.select().from(schema.hopDong);

      const contractTypeData = contractTypes.map((type) => ({
        name: type.ten,
        value: contracts.filter((c) => c.loaiHopDongId === type.id).length,
      }));

      const payments = await db.select().from(schema.thanhToan);
      const paymentStatusData = [
        {
          name: "Đã thanh toán",
          value: payments.filter((p) => p.trangThai === "Đã thanh toán").length,
        },
        {
          name: "Chưa thanh toán",
          value:
            payments.filter((p) => p.trangThai === "Chưa thanh toán").length ||
            payments.length,
        },
      ];

      const progressSteps = await db.select().from(schema.buocThucHien);
      const progressStatusData = [
        {
          name: "Hoàn thành",
          value: progressSteps.filter((p) => p.trangThai === "Hoàn thành")
            .length,
        },
        {
          name: "Đang thực hiện",
          value: progressSteps.filter((p) => p.trangThai === "Đang thực hiện")
            .length,
        },
        {
          name: "Chưa bắt đầu",
          value: progressSteps.filter((p) => p.trangThai === "Chưa bắt đầu")
            .length,
        },
      ];

      // Supplier statistics by country
      const suppliers = await db.select().from(schema.nhaCungCap);
      const supplierCountryData = [
        {
          name: "Singapore",
          value: suppliers.filter((s) => s.diaChi.includes("Singapore")).length,
        },
        {
          name: "Tây Ban Nha",
          value: suppliers.filter(
            (s) =>
              s.diaChi.includes("Tây Ban Nha") || s.diaChi.includes("Madrid")
          ).length,
        },
        {
          name: "CH Séc",
          value: suppliers.filter(
            (s) => s.diaChi.includes("CH Séc") || s.diaChi.includes("Praha")
          ).length,
        },
        {
          name: "Đức",
          value: suppliers.filter(
            (s) => s.diaChi.includes("Đức") || s.diaChi.includes("Berlin")
          ).length,
        },
        {
          name: "Áo",
          value: suppliers.filter(
            (s) => s.diaChi.includes("Áo") || s.diaChi.includes("Vienna")
          ).length,
        },
        {
          name: "Thụy Sĩ",
          value: suppliers.filter(
            (s) => s.diaChi.includes("Thụy Sĩ") || s.diaChi.includes("Zurich")
          ).length,
        },
      ].filter((item) => item.value > 0);

      // World map data for countries with suppliers and contracts
      const worldMapData = [];

      // Process each country that has suppliers
      for (const countryData of supplierCountryData) {
        const countryName = countryData.name;
        const countrySuppliers = suppliers.filter((s) => {
          if (countryName === "Singapore")
            return s.diaChi.includes("Singapore");
          if (countryName === "Tây Ban Nha")
            return (
              s.diaChi.includes("Tây Ban Nha") || s.diaChi.includes("Madrid")
            );
          if (countryName === "CH Séc")
            return s.diaChi.includes("CH Séc") || s.diaChi.includes("Praha");
          if (countryName === "Đức")
            return s.diaChi.includes("Đức") || s.diaChi.includes("Berlin");
          if (countryName === "Áo")
            return s.diaChi.includes("Áo") || s.diaChi.includes("Vienna");
          if (countryName === "Thụy Sĩ")
            return s.diaChi.includes("Thụy Sĩ") || s.diaChi.includes("Zurich");
          return false;
        });

        // Count contracts for this country's suppliers
        const contractCount = contracts.filter((contract) =>
          countrySuppliers.some(
            (supplier) => supplier.id === contract.nhaCungCapId
          )
        ).length;

        if (contractCount > 0) {
          // Map country coordinates
          const coordinates = {
            Singapore: [103.8198, 1.3521],
            "Tây Ban Nha": [-3.7038, 40.4168],
            "CH Séc": [14.4378, 50.0755],
            Đức: [13.405, 52.52],
            Áo: [16.3738, 48.2082],
            "Thụy Sĩ": [8.5417, 47.3769],
          };

          if (coordinates[countryName]) {
            worldMapData.push({
              country: countryName,
              count: contractCount,
              suppliers: countrySuppliers.length,
              coordinates: coordinates[countryName],
            });
          }
        }
      }

      res.json({
        contractTypes: contractTypeData,
        paymentStatus: paymentStatusData,
        progressStatus: progressStatusData,
        supplierCountries: supplierCountryData,
        worldMap: worldMapData,
        monthlyTrend: [],
      });
    } catch (error) {
      console.error("Error fetching dashboard charts:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  // Loại hợp đồng routes
  app.get("/api/loai-hop-dong", async (req, res) => {
    try {
      const items = await db.select().from(schema.loaiHopDong);
      res.json(items);
    } catch (error) {
      console.error("Error fetching loai hop dong:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.post("/api/loai-hop-dong", async (req, res) => {
    try {
      const validatedData = insertLoaiHopDongSchema.parse(req.body);
      const items = await db
        .insert(schema.loaiHopDong)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating loai hop dong:", error);
      res.status(500).json({ error: "Lỗi khi tạo loại hợp đồng" });
    }
  });

  // Cán bộ routes
  app.get("/api/can-bo", async (req, res) => {
    try {
      const items = await db.select().from(schema.canBo);
      res.json(items);
    } catch (error) {
      console.error("Error fetching can bo:", error);
      res.status(500).json({ error: "Lỗi khi lấy danh sách cán bộ" });
    }
  });

  app.post("/api/can-bo", async (req, res) => {
    try {
      const validatedData = insertCanBoSchema.parse(req.body);
      const items = await db
        .insert(schema.canBo)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating can bo:", error);
      res.status(500).json({ error: "Lỗi khi tạo cán bộ" });
    }
  });
  app.put("/api/can-bo/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCanBoSchema.parse(req.body);

      const updated = await db
        .update(schema.canBo)
        .set(validatedData)
        .where(eq(schema.canBo.id, id))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy cán bộ" });
      }

      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating can bo:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật cán bộ" });
    }
  });
  app.delete("/api/can-bo/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      console.log(id);
      const deleted = await db
        .delete(schema.canBo)
        .where(eq(schema.canBo.id, id))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy cán bộ để xóa" });
      }

      res.json({ message: "Đã xóa cán bộ thành công", item: deleted[0] });
    } catch (error) {
      console.error("Error deleting can bo:", error);
      res.status(500).json({ error: "Lỗi khi xóa cán bộ" });
    }
  });

  // Nhà cung cấp routes
  app.get("/api/nha-cung-cap", async (req, res) => {
    try {
      const items = await db.select().from(schema.nhaCungCap);
      res.json(items);
    } catch (error) {
      console.error("Error fetching nha cung cap:", error);
      res.status(500).json({ error: "Lỗi khi lấy danh sách nhà cung cấp" });
    }
  });

  app.post("/api/nha-cung-cap", async (req, res) => {
    try {
      const validatedData = insertNhaCungCapSchema.parse(req.body);
      const items = await db
        .insert(schema.nhaCungCap)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating nha cung cap:", error);
      res.status(500).json({ error: "Lỗi khi tạo nhà cung cấp" });
    }
  });
  app.put("/api/nha-cung-cap/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertNhaCungCapSchema.parse(req.body);

      const updated = await db
        .update(schema.nhaCungCap)
        .set(validatedData)
        .where(eq(schema.nhaCungCap.id, id))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy nhà cung cấp" });
      }

      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating nha cung cap:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật nhà cung cấp" });
    }
  });
  app.delete("/api/nha-cung-cap/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      const deleted = await db
        .delete(schema.nhaCungCap)
        .where(eq(schema.nhaCungCap.id, id))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy nhà cung cấp" });
      }

      res.json({ message: "Đã xoá nhà cung cấp thành công" });
    } catch (error) {
      console.error("Error deleting nha cung cap:", error);
      res.status(500).json({ error: "Lỗi khi xoá nhà cung cấp" });
    }
  });

  // Chủ đầu tư routes
  app.get("/api/chu-dau-tu", async (req, res) => {
    try {
      const items = await db.select().from(schema.chuDauTu);
      res.json(items);
    } catch (error) {
      console.error("Error fetching chu dau tu:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.post("/api/chu-dau-tu", async (req, res) => {
    try {
      const validatedData = insertChuDauTuSchema.parse(req.body);
      const items = await db
        .insert(schema.chuDauTu)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating chu dau tu:", error);
      res.status(500).json({ error: "Lỗi khi tạo chủ đầu tư" });
    }
  });
  // Cập nhật chủ đầu tư
  app.put("/api/chu-dau-tu/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertChuDauTuSchema.parse(req.body); // Sử dụng schema giống POST
      const updated = await db
        .update(schema.chuDauTu)
        .set(validatedData)
        .where(eq(schema.chuDauTu.id, Number(id)))
        .returning();
      if (updated.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy chủ đầu tư" });
      }
      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating chu dau tu:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật chủ đầu tư" });
    }
  });

  // Xóa chủ đầu tư
  app.delete("/api/chu-dau-tu/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await db
        .delete(schema.chuDauTu)
        .where(eq(schema.chuDauTu.id, Number(id)))
        .returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy chủ đầu tư" });
      }
      res.json({ message: "Đã xóa thành công", data: deleted[0] });
    } catch (error) {
      console.error("Error deleting chu dau tu:", error);
      res.status(500).json({ error: "Lỗi khi xóa chủ đầu tư" });
    }
  });

  // Loại ngân sách routes
  app.get("/api/loai-ngan-sach", async (req, res) => {
    try {
      const items = await db.select().from(schema.loaiNganSach);
      res.json(items);
    } catch (error) {
      console.error("Error fetching loai ngan sach:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  // Loại tiền routes
  app.get("/api/loai-tien", async (req, res) => {
    try {
      const items = await db.select().from(schema.loaiTien);
      res.json(items);
    } catch (error) {
      console.error("Error fetching loai tien:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  // Trạng thái hợp đồng routes
  app.get("/api/trang-thai-hop-dong", async (req, res) => {
    try {
      const items = await db.select().from(schema.trangThaiHopDong);
      res.json(items);
    } catch (error) {
      console.error("Error fetching trang thai hop dong:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  // Hợp đồng routes
  app.get("/api/hop-dong", async (req, res) => {
    console.log("🔍 API /api/hop-dong được gọi");
    const search = req.query.search;
    console.log("Search:", search);
    try {
      let items;

      if (search) {
        items = await db
          .select()
          .from(schema.hopDong)
          .where(
            sql`LOWER(${schema.hopDong.ten}) LIKE LOWER(${`%${search}%`})`
          );
      } else {
        items = await db.select().from(schema.hopDong);
      }

      res.json(items);
    } catch (error) {
      console.error("Error fetching hop dong:", error);
      res.status(500).json({ error: "Lỗi khi lấy danh sách hợp đồng" });
    }
  });

  app.post("/api/hop-dong", async (req, res) => {
    try {
      const validatedData = insertHopDongSchema.parse(req.body);
      const items = await db
        .insert(schema.hopDong)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating hop dong:", error);
      res.status(500).json({ error: "Lỗi khi tạo hợp đồng" });
    }
  });

  app.put("/api/hop-dong/:id", async (req, res) => {
    const id = req.params.id;
    try {
      // Validate dữ liệu đầu vào (nếu cần chỉnh sửa thì dùng schema riêng)
      const validatedData = insertHopDongSchema.parse(req.body);

      const updated = await db
        .update(schema.hopDong)
        .set(validatedData)
        .where(eq(schema.hopDong.id, Number(id))) // Convert string id to number
        .returning();
      if (updated.length === 0) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy hợp đồng để cập nhật" });
      }
      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating hop dong:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật hợp đồng" });
    }
  });

  app.delete("/api/hop-dong/:id", async (req, res) => {
    const id = req.params.id;
    try {
      const deleted = await db
        .delete(schema.hopDong)
        .where(eq(schema.hopDong.id, Number(id))) // hoặc Number(id) nếu id là số
        .returning();

      if (deleted.length === 0) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy hợp đồng để xóa" });
      }

      res.json({ message: "Đã xóa hợp đồng thành công", item: deleted[0] });
    } catch (error) {
      console.error("Error deleting hop dong:", error);
      res.status(500).json({ error: "Lỗi khi xóa hợp đồng" });
    }
  });

  // Thanh toán routes
  app.get("/api/thanh-toan", async (req, res) => {
    try {
      const items = await db.select().from(schema.thanhToan);
      res.json(items);
    } catch (error) {
      console.error("Error fetching thanh toan:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.post("/api/thanh-toan", async (req, res) => {
    try {
      const validatedData = insertThanhToanSchema.parse(req.body);
      const items = await db
        .insert(schema.thanhToan)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating thanh toan:", error);
      res.status(500).json({ error: "Lỗi khi tạo thanh toán" });
    }
  });
  // PUT: Cập nhật thanh toán
  app.put("/api/thanh-toan/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertThanhToanSchema.parse(req.body);

      const updated = await db
        .update(schema.thanhToan)
        .set(validatedData)
        .where(eq(schema.thanhToan.id, Number(id)))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy thanh toán" });
      }

      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating thanh toan:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật thanh toán" });
    }
  });

  // DELETE: Xóa thanh toán
  app.delete("/api/thanh-toan/:id", async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await db
        .delete(schema.thanhToan)
        .where(eq(schema.thanhToan.id, Number(id)))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy thanh toán" });
      }

      res.json({ message: "Đã xóa thành công", data: deleted[0] });
    } catch (error) {
      console.error("Error deleting thanh toan:", error);
      res.status(500).json({ error: "Lỗi khi xóa thanh toán" });
    }
  });

  // Bước thực hiện routes
  app.get("/api/buoc-thuc-hien", async (req, res) => {
    try {
      const items = await db.select().from(schema.buocThucHien);
      res.json(items);
    } catch (error) {
      console.error("Error fetching buoc thuc hien:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.post("/api/buoc-thuc-hien", async (req, res) => {
    try {
      const validatedData = insertBuocThucHienSchema.parse(req.body);
      const items = await db
        .insert(schema.buocThucHien)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating buoc thuc hien:", error);
      res.status(500).json({ error: "Lỗi khi tạo bước thực hiện" });
    }
  });
  // Cập nhật bước thực hiện theo id
  app.put("/api/buoc-thuc-hien/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = schema.updateBuocThucHienSchema.parse(req.body); // cần có schema cho update
      const updated = await db
        .update(schema.buocThucHien)
        .set(validatedData)
        .where(eq(schema.buocThucHien.id, id))
        .returning();
      if (updated.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy bước thực hiện" });
      }
      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating buoc thuc hien:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật bước thực hiện" });
    }
  });

  // Xóa bước thực hiện theo id
  app.delete("/api/buoc-thuc-hien/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await db
        .delete(schema.buocThucHien)
        .where(eq(schema.buocThucHien.id, id))
        .returning();
      if (deleted.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy bước thực hiện" });
      }
      res.json({ message: "Xóa thành công", item: deleted[0] });
    } catch (error) {
      console.error("Error deleting buoc thuc hien:", error);
      res.status(500).json({ error: "Lỗi khi xóa bước thực hiện" });
    }
  });
  // Trang bị routes
  app.get("/api/trang-bi", async (req, res) => {
    try {
      const items = await db.select().from(schema.trangBi);
      res.json(items);
    } catch (error) {
      console.error("Error fetching trang bi:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.post("/api/trang-bi", async (req, res) => {
    try {
      const validatedData = insertTrangBiSchema.parse(req.body);
      const items = await db
        .insert(schema.trangBi)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating trang bi:", error);
      res.status(500).json({ error: "Lỗi khi tạo trang bị" });
    }
  });
  // Cập nhật trang bị
  app.put("/api/trang-bi/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertTrangBiSchema.parse(req.body); // có thể dùng updateSchema nếu có
      const updated = await db
        .update(schema.trangBi)
        .set(validatedData)
        .where(eq(schema.trangBi.id, Number(id)))
        .returning();

      if (updated.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy trang bị" });
      }

      res.json(updated[0]);
    } catch (error) {
      console.error("Error updating trang bi:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật trang bị" });
    }
  });

  // Xóa trang bị
  app.delete("/api/trang-bi/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await db
        .delete(schema.trangBi)
        .where(eq(schema.trangBi.id, Number(id)))
        .returning();

      if (deleted.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy trang bị" });
      }

      res.json({ message: "Đã xóa thành công", data: deleted[0] });
    } catch (error) {
      console.error("Error deleting trang bi:", error);
      res.status(500).json({ error: "Lỗi khi xóa trang bị" });
    }
  });
  // File hợp đồng routes
  app.get("/api/file-hop-dong", async (req, res) => {
    try {
      const items = await db.select().from(schema.fileHopDong);
      res.json(items);
    } catch (error) {
      console.error("Error fetching file hop dong:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.get("/api/file-hop-dong/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await db
        .select()
        .from(schema.fileHopDong)
        .where(eq(schema.fileHopDong.id, id));
      if (items.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy tài liệu" });
      }
      res.json(items[0]);
    } catch (error) {
      console.error("Error fetching file hop dong by id:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });
  const toInt = (val: any, fallback = 0) =>
    isNaN(parseInt(val)) ? fallback : parseInt(val);
  app.post("/api/file-hop-dong", upload.single("file"), async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "Không có file được gửi lên" });
      }

      // Lấy dữ liệu từ body
      const { tenFile, loaiFile, hopDongId, nguoiTaiLen, ghiChu } = req.body;

      // Parse & validate bằng Zod
      const parsedData = insertFileHopDongSchema.parse({
        tenFile,
        loaiFile,
        kichThuoc: file.size, // ✅ lấy từ file
        hopDongId: toInt(hopDongId),
        nguoiTaiLen: toInt(nguoiTaiLen),
        ghiChu,
      });

      // Convert file.buffer thành base64
      const base64FileContent = file.buffer.toString("base64");

      // Lưu vào DB
      const items = await db
        .insert(schema.fileHopDong)
        .values({
          ...parsedData,
          noiDungFile: `data:${file.mimetype};base64,${base64FileContent}`,
          ngayTaiLen: new Date().toISOString(),
        })
        .returning();

      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      res.status(500).json({ error: "Lỗi khi tạo tài liệu" });
    }
  });

  app.put("/api/file-hop-dong/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFileHopDongSchema.partial().parse(req.body);
      const items = await db
        .update(schema.fileHopDong)
        .set(validatedData)
        .where(eq(schema.fileHopDong.id, id))
        .returning();

      if (items.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy tài liệu" });
      }

      res.json(items[0]);
    } catch (error) {
      console.error("Error updating file hop dong:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật tài liệu" });
    }
  });

  app.delete("/api/file-hop-dong/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await db
        .delete(schema.fileHopDong)
        .where(eq(schema.fileHopDong.id, id))
        .returning();

      if (items.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy tài liệu" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ error: "Lỗi khi xóa tài liệu" });
    }
  });

  app.get("/api/file-hop-dong/:id/download", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await db
        .select()
        .from(schema.fileHopDong)
        .where(eq(schema.fileHopDong.id, id));

      if (items.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy tài liệu" });
      }

      const document = items[0];

      if (!document.noiDungFile) {
        return res.status(404).json({ error: "File không tồn tại" });
      }

      // Extract base64 content from data URL
      const base64Content = document.noiDungFile.split(",")[1];
      const buffer = Buffer.from(base64Content, "base64");

      // Set appropriate headers
      res.setHeader(
        "Content-Type",
        document.loaiFile || "application/octet-stream"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.tenFile}"`
      );
      res.setHeader("Content-Length", buffer.length);

      res.send(buffer);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ error: "Lỗi khi tải file" });
    }
  });

  // Loại trang bị
  app.get("/api/loai-trang-bi", async (req, res) => {
    try {
      const items = await db.select().from(schema.loaiTrangBi);
      res.json(items);
    } catch (error) {
      console.error("Error fetching loai trang bi:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  // Loại thanh toán
  app.get("/api/loai-thanh-toan", async (req, res) => {
    try {
      const items = await db.select().from(schema.loaiThanhToan);
      res.json(items);
    } catch (error) {
      console.error("Error fetching loai thanh toan:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  // Loại hình thức thanh toán
  app.get("/api/loai-hinh-thuc-thanh-toan", async (req, res) => {
    try {
      const items = await db.select().from(schema.loaiHinhThucThanhToan);
      res.json(items);
    } catch (error) {
      console.error("Error fetching loai hinh thuc thanh toan:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  // Địa điểm thông quan routes
  app.get("/api/dia-diem-thong-quan", async (req, res) => {
    try {
      const items = await db.select().from(schema.diaDiemThongQuan);
      res.json(items);
    } catch (error) {
      console.error("Error fetching dia diem thong quan:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.post("/api/dia-diem-thong-quan", async (req, res) => {
    console.log("Received request body:", req.body);
    try {
      const validatedData = insertDiaDiemThongQuanSchema.parse(req.body);
      console.log("Validated Data:", validatedData);
      const items = await db
        .insert(schema.diaDiemThongQuan)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating dia diem thong quan:", error);
      res.status(500).json({ error: "Lỗi khi tạo địa điểm thông quan" });
    }
  });
  app.put("/api/dia-diem-thong-quan/:id", async (req, res) => {
    const id = req.params.id;

    try {
      // Validate dữ liệu gửi lên
      const validatedData = insertDiaDiemThongQuanSchema.parse(req.body);

      const updated = await db
        .update(schema.diaDiemThongQuan)
        .set(validatedData)
        .where(eq(schema.diaDiemThongQuan.id, Number(id)))
        .returning();

      if (updated.length === 0) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy địa điểm để cập nhật" });
      }

      res.json({ message: "Cập nhật thành công", item: updated[0] });
    } catch (error) {
      console.error("Error updating dia diem thong quan:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật địa điểm thông quan" });
    }
  });
  app.delete("/api/dia-diem-thong-quan/:id", async (req, res) => {
    const id = req.params.id;

    try {
      const deleted = await db
        .delete(schema.diaDiemThongQuan)
        .where(eq(schema.diaDiemThongQuan.id, Number(id)))
        .returning();

      if (deleted.length === 0) {
        return res
          .status(404)
          .json({ error: "Không tìm thấy địa điểm để xóa" });
      }

      res.json({ message: "Xóa thành công", item: deleted[0] });
    } catch (error) {
      console.error("Error deleting dia diem thong quan:", error);
      res.status(500).json({ error: "Lỗi khi xóa địa điểm thông quan" });
    }
  });

  // Tiếp nhận routes
  app.get("/api/tiep-nhan", async (req, res) => {
    try {
      const items = await db.select().from(schema.tiepNhan);
      res.json(items);
    } catch (error) {
      console.error("Error fetching tiep nhan:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.get("/api/tiep-nhan/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await db
        .select()
        .from(schema.tiepNhan)
        .where(eq(schema.tiepNhan.id, id));
      if (items.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy tiếp nhận" });
      }
      res.json(items[0]);
    } catch (error) {
      console.error("Error fetching tiep nhan by id:", error);
      res.status(500).json({ error: "Lỗi khi lấy tiếp nhận" });
    }
  });

  app.get("/api/tiep-nhan/hop-dong/:hopDongId", async (req, res) => {
    try {
      const hopDongId = parseInt(req.params.hopDongId);
      const items = await db
        .select()
        .from(schema.tiepNhan)
        .where(eq(schema.tiepNhan.hopDongId, hopDongId));
      res.json(items);
    } catch (error) {
      console.error("Error fetching tiep nhan by hop dong:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });

  app.post("/api/tiep-nhan", async (req, res) => {
    try {
      const validatedData = insertTiepNhanSchema.parse(req.body);
      const items = await db
        .insert(schema.tiepNhan)
        .values(validatedData)
        .returning();
      res.status(201).json(items[0]);
    } catch (error) {
      console.error("Error creating tiep nhan:", error);
      res.status(500).json({ error: "Lỗi khi tạo tiếp nhận" });
    }
  });

  app.put("/api/tiep-nhan/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTiepNhanSchema.partial().parse(req.body);
      const items = await db
        .update(schema.tiepNhan)
        .set(validatedData)
        .where(eq(schema.tiepNhan.id, id))
        .returning();
      if (items.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy tiếp nhận" });
      }
      res.json(items[0]);
    } catch (error) {
      console.error("Error updating tiep nhan:", error);
      res.status(500).json({ error: "Lỗi khi cập nhật tiếp nhận" });
    }
  });

  app.delete("/api/tiep-nhan/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const items = await db
        .delete(schema.tiepNhan)
        .where(eq(schema.tiepNhan.id, id))
        .returning();
      if (items.length === 0) {
        return res.status(404).json({ error: "Không tìm thấy tiếp nhận" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting tiep nhan:", error);
      res.status(500).json({ error: "Lỗi khi xóa tiếp nhận" });
    }
  });
  // Điều kiện giao hàng
  app.get("/api/dieu-kien-giao-hang", async (req, res) => {
    try {
      const items = await db.select().from(schema.dieuKienGiaoHang);
      res.json(items);
    } catch (error) {
      console.error("Error fetching incoterm:", error);
      res.status(500).json({ error: "Lỗi server" });
    }
  });
}
