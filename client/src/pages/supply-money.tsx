import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  CheckSquare,
  AlertTriangle,
  Download,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { CapTien, HopDong, LoaiTien } from "@shared/schema";
import CapTienModal from "@/components/modals/supply_money-modal";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function CapTienPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(
    null
  );
  const [selectedRecord, setSelectedRecord] = useState<CapTien | null>(null);
  const [selectedContracts, setSelectedContracts] = useState<number[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query dữ liệu
  const { data: capTienList = [], isLoading } = useQuery<CapTien[]>({
    queryKey: ["/api/cap-tien"],
  });

  const { data: contracts = [] } = useQuery<HopDong[]>({
    queryKey: ["/api/hop-dong"],
  });

  const { data: loaiTien = [] } = useQuery<LoaiTien[]>({
    queryKey: ["/api/loai-tien"],
  });
  const { data: chuDauTu = [] } = useQuery<any[]>({
    queryKey: ["/api/chu-dau-tu"],
  });
  const { data: canBo = [] } = useQuery<any[]>({
    queryKey: ["/api/can-bo"],
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/cap-tien/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cap-tien"] });
      toast({ description: "Đã xóa cấp tiền thành công" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Lỗi khi xóa cấp tiền",
      });
    },
  });

  const handleOpenModal = (
    mode: "create" | "edit" | "view",
    record?: CapTien
  ) => {
    setModalMode(mode);
    setSelectedRecord(record || null);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedRecord(null);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cấp tiền này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return capTienList;
    return capTienList.filter(
      (item) =>
        item.ghiChu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contracts
          .find((c) => c.id === item.hopDongId)
          ?.ten?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [capTienList, searchTerm, contracts]);

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "-";

  const getCurrencyName = (currencyId: number | null) => {
    const currency = loaiTien.find((item: any) => item.id === currencyId);
    return currency?.ten || "VND";
  };

  // Hàm xuất Excel
  const handleExport = () => {
    const filteredCapTien = capTienList.filter((capTien) =>
      selectedContracts.includes(capTien.hopDongId)
    );

    // Nhóm các CapTien theo soHdNgoai
    const groupedByContract = filteredCapTien.reduce((acc, capTien) => {
      const contract = contracts.find((c) => c.id === capTien.hopDongId);
      if (contract) {
        if (!acc[contract.soHdNgoai]) {
          acc[contract.soHdNgoai] = {
            contract: contract.soHdNgoai,
            records: [],
            chuDauTuId: contract.chuDauTuId,
            canBoId: contract.canBoId,
            tenHopDong: contract.ten, // Thêm tên hợp đồng vào
          };
        }
        acc[contract.soHdNgoai].records.push(capTien);
      }
      return acc;
    }, {} as Record<string, { contract: string; records: CapTien[]; chuDauTuId: number; canBoId: number; tenHopDong: string }>);

    const rows = [];

    // Duyệt qua các hợp đồng đã nhóm
    for (const contractId in groupedByContract) {
      const { contract, records, chuDauTuId, canBoId, tenHopDong } =
        groupedByContract[contractId];

      // Lấy tên chủ đầu tư và cán bộ
      const chuDauTuName = chuDauTuId
        ? chuDauTu.find((c) => c.id === chuDauTuId)?.ten
        : "-";
      const canBoName = canBoId
        ? canBo.find((c) => c.id === canBoId)?.ten
        : "-";

      // Tạo các dòng cho mỗi hợp đồng, chỉ hiển thị Số HĐ ngoài, tên chủ đầu tư và cán bộ 1 lần
      records.forEach((record, idx) => {
        const row = {
          "Số HĐ ngoài": idx === 0 ? contract : "", // Hiển thị Số HĐ ngoài chỉ ở dòng đầu tiên
          "Ngày cấp": formatDate(record.ngayCap),
          "Số tiền": record.soTien + getCurrencyName(record.loaiTienId),
          "Tỷ giá": record.tyGia ?? "-",
          "Ghi chú": record.ghiChu,
          "Tên Hợp đồng": idx === 0 ? tenHopDong : "", // Hiển thị tên hợp đồng chỉ 1 lần
          "Tên Chủ đầu tư": idx === 0 ? chuDauTuName : "", // Hiển thị tên chủ đầu tư chỉ 1 lần
          "Tên Cán bộ": idx === 0 ? canBoName : "", // Hiển thị tên cán bộ chỉ 1 lần
        };
        rows.push(row);
      });
    }

    const ws = XLSX.utils.json_to_sheet(rows);

    // Tạo một Workbook và thêm worksheet vào
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CapTienExport");

    // Xuất ra tệp Excel
    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buffer]), "cap_tien_export.xlsx");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý cấp tiền"
          subtitle="Theo dõi các lần cấp tiền trong hợp đồng"
          onCreateContract={() => {}}
        />
        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách cấp tiền</CardTitle>
                <Button onClick={() => handleOpenModal("create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm cấp tiền
                </Button>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm cấp tiền..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredRecords.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ngày cấp</TableHead>
                        <TableHead>Hợp đồng</TableHead>
                        <TableHead>Tên Hợp đồng</TableHead>{" "}
                        {/* Cột tên hợp đồng */}
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Tỷ giá</TableHead>
                        <TableHead>Ghi chú</TableHead>
                        <TableHead></TableHead>
                        <TableHead>
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              const selected = e.target.checked
                                ? contracts.map((c) => c.id)
                                : [];
                              setSelectedContracts(selected);
                            }}
                          />
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{formatDate(record.ngayCap)}</TableCell>
                          <TableCell>
                            {
                              contracts.find((c) => c.id === record.hopDongId)
                                ?.soHdNgoai
                            }
                          </TableCell>
                          <TableCell>
                            {
                              contracts.find((c) => c.id === record.hopDongId)
                                ?.ten
                            }{" "}
                            {/* Tên hợp đồng */}
                          </TableCell>
                          <TableCell>
                            {record.soTien} {getCurrencyName(record.loaiTienId)}
                          </TableCell>
                          <TableCell>{record.tyGia ?? "-"}</TableCell>
                          <TableCell>{record.ghiChu}</TableCell>
                          <TableCell>
                            {/* Nút sửa */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal("edit", record)}
                              className="h-8 w-8 text-blue-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {/* Nút xóa */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(record.id)}
                              className="h-8 w-8 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <input
                              type="checkbox"
                              checked={selectedContracts.includes(
                                record.hopDongId
                              )}
                              onChange={(e) => {
                                const newSelected = e.target.checked
                                  ? [...selectedContracts, record.hopDongId]
                                  : selectedContracts.filter(
                                      (id) => id !== record.hopDongId
                                    );
                                setSelectedContracts(newSelected);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          <Button onClick={handleExport} className="mt-6">
            <Download className="w-4 h-4 mr-2" /> Xuất Excel
          </Button>
        </main>

        {modalMode && (
          <CapTienModal
            isOpen={true}
            onClose={handleCloseModal}
            record={selectedRecord}
            mode={modalMode}
          />
        )}
      </div>
    </div>
  );
}

// Helper components
const IconBtn = ({ icon, onClick, className = "" }: any) => (
  <Button
    variant="ghost"
    size="icon"
    className={`h-8 w-8 ${className}`}
    onClick={onClick}
  >
    {icon}
  </Button>
);

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-8">
    <CheckSquare className="mx-auto h-12 w-12 text-slate-400 mb-4" />
    <p className="text-slate-500">Chưa có bản ghi cấp tiền nào</p>
  </div>
);
