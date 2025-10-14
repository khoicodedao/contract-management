import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Plus,
  CheckSquare,
  AlertTriangle,
  Clock,
  RefreshCw,
  Download,
} from "lucide-react";
import { BuocThucHien, HopDong } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProgressModal from "@/components/modals/progress-modal";
import React from "react";
import * as XLSX from "xlsx";

export default function ProgressPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(
    null
  );
  const [selectedProgress, setSelectedProgress] = useState<BuocThucHien | null>(
    null
  );

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: progressSteps = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery<BuocThucHien[]>({
    queryKey: ["/api/buoc-thuc-hien"],
  });

  const { data: contracts = [] } = useQuery<HopDong[]>({
    queryKey: ["/api/hop-dong"],
  });

  const filteredSteps = useMemo(() => {
    let filtered = progressSteps;
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (step) => step.trangThai?.toLowerCase() === statusFilter
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(
        (step) =>
          step.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          step.moTa?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [progressSteps, searchTerm, statusFilter]);

  const completedSteps = progressSteps.filter(
    (step) => step.trangThai?.toLowerCase() === "hoàn thành"
  ).length;
  const inProgressSteps = progressSteps.filter(
    (step) => step.trangThai?.toLowerCase() === "đang thực hiện"
  ).length;
  const overdueSteps = progressSteps.filter((step) => step.canhBao).length;

  const handleOpenModal = (
    mode: "create" | "edit" | "view",
    step?: BuocThucHien
  ) => {
    setModalMode(mode);
    setSelectedProgress(step || null);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedProgress(null);
  };

  const handleDeleteStep = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bước thực hiện này không?")) {
      deleteMutation.mutate(id);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/buoc-thuc-hien/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buoc-thuc-hien"] });
      toast({ description: "Đã xóa bước tiến độ thành công" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Lỗi khi xóa theo dõi",
      });
    },
  });

  const getProgressPercentage = (step: BuocThucHien) => {
    if (!step.ngayBatDau || !step.ngayKetThuc) return 0;
    const start = new Date(step.ngayBatDau).getTime();
    const end = new Date(step.ngayKetThuc).getTime();
    const now = Date.now();
    if (step.trangThai === "Hoàn thành") return 100;
    if (step.trangThai === "Chờ thực hiện") return 0;
    const progress = ((now - start) / (end - start)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const formatDate = (date: string | null) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "-";

  const getStatusBadge = (status: string | null, isWarning: boolean | null) => {
    if (!status) return null;
    const colorMap: Record<string, string> = {
      "hoàn thành": "bg-green-100 text-green-800",
      "đang thực hiện": "bg-blue-100 text-blue-800",
      "chưa thực hiện": "bg-gray-100 text-gray-800",
      "chờ thực hiện": "bg-yellow-100 text-yellow-800",
      "tạm dừng": "bg-orange-100 text-orange-800",
      "quá hạn": "bg-red-100 text-red-800",
    };
    const color = colorMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";
    return (
      <div className="flex items-center space-x-2">
        <Badge className={color}>{status}</Badge>
        {isWarning && <AlertTriangle className="w-4 h-4 text-red-500" />}
      </div>
    );
  };
  const handleExportExcel = () => {
    if (!filteredSteps.length) {
      toast({
        title: "Không có dữ liệu",
        description:
          "Không có bước thực hiện nào để xuất theo bộ lọc hiện tại.",
      });
      return;
    }

    // Chuẩn hóa dữ liệu => mỗi bước là 1 dòng
    const rows = filteredSteps
      .slice()
      .sort((a, b) => {
        // Sắp xếp theo hợp đồng và ngày bắt đầu
        const ca = contracts.find((c) => c.id === a.hopDongId);
        const cb = contracts.find((c) => c.id === b.hopDongId);
        const sa = (ca?.soHdNgoai || "").localeCompare(cb?.soHdNgoai || "");
        if (sa !== 0) return sa;
        const da = a.ngayBatDau ? new Date(a.ngayBatDau).getTime() : 0;
        const db = b.ngayBatDau ? new Date(b.ngayBatDau).getTime() : 0;
        return da - db;
      })
      .map((step) => ({
        "Tên bước": step.ten || "Không tên",
        "Hợp đồng":
          contracts.find((c) => c.id === step.hopDongId)?.soHdNgoai ||
          "Không liên kết",
        "Ngày bắt đầu": formatDate(step.ngayBatDau),
        "Ngày kết thúc": formatDate(step.ngayKetThuc),
        "Trạng thái": step.trangThai || "Chưa có trạng thái",
        "Mô tả": step.moTa || "Không có mô tả",
      }));

    // Tạo workbook & worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows, {
      header: [
        "Tên bước",
        "Hợp đồng",
        "Ngày bắt đầu",
        "Ngày kết thúc",
        "Trạng thái",
        "Mô tả",
      ],
    });

    // Auto width cột đơn giản
    const cols = Object.keys(rows[0] || {}).map((k) => ({
      wch: Math.max(k.length + 2, 18),
    }));
    (ws as any)["!cols"] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Tiến độ thực hiện");
    const fileName = `tien-do-thuc-hien_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Đã xuất Excel",
      description: "Xuất tiến độ thực hiện thành công.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Theo dõi"
          subtitle="Theo dõi tiến độ thực hiện các bước trong hợp đồng"
          onCreateContract={() => {}}
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <SummaryCard
              title="Tổng bước"
              count={progressSteps.length}
              icon={<CheckSquare />}
              color="blue"
            />
            <SummaryCard
              title="Đang thực hiện"
              count={inProgressSteps}
              icon={<Clock />}
              color="yellow"
            />
            <SummaryCard
              title="Hoàn thành"
              count={completedSteps}
              icon={<CheckSquare />}
              color="green"
            />
            <SummaryCard
              title="Có cảnh báo"
              count={overdueSteps}
              icon={<AlertTriangle />}
              color="red"
            />
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Các bước thực hiện</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    title="Làm mới"
                  >
                    <RefreshCw
                      className={`w-4 h-4 mr-2 ${
                        isFetching ? "animate-spin" : ""
                      }`}
                    />
                    Làm mới
                  </Button>

                  {/* Nút Export Excel */}
                  <Button
                    variant="secondary"
                    onClick={handleExportExcel}
                    title="Xuất Excel"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Xuất Excel
                  </Button>

                  <Button onClick={() => handleOpenModal("create")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm bước thực hiện
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <LoadingSkeleton />
              ) : filteredSteps.length === 0 ? (
                <EmptyState searchTerm={searchTerm} filter={statusFilter} />
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bước thực hiện</TableHead>
                        <TableHead>Hợp đồng</TableHead>

                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày kết thúc</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSteps.map((step) => {
                        const progress = getProgressPercentage(step);
                        return (
                          <TableRow key={step.id}>
                            <TableCell>
                              <div className="font-medium">{step.ten}</div>
                              <div className="text-sm text-slate-500">
                                {step.moTa}
                              </div>
                            </TableCell>
                            <TableCell>
                              {
                                contracts.find(
                                  (contract) => contract.id === step.hopDongId
                                )?.soHdNgoai
                              }
                            </TableCell>

                            <TableCell>{formatDate(step.ngayBatDau)}</TableCell>
                            <TableCell>
                              {formatDate(step.ngayKetThuc)}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(step.trangThai, step?.canhBao)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <IconBtn
                                  icon={<Eye />}
                                  onClick={() => handleOpenModal("view", step)}
                                />
                                <IconBtn
                                  icon={<Edit />}
                                  onClick={() => handleOpenModal("edit", step)}
                                />
                                <IconBtn
                                  icon={<Trash2 />}
                                  onClick={() => handleDeleteStep(step.id)}
                                  className="text-red-600"
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {modalMode && (
          <ProgressModal
            isOpen={true}
            onClose={handleCloseModal}
            progress={selectedProgress}
            mode={modalMode}
          />
        )}
      </div>
    </div>
  );
}

// Helper components for reuse
const SummaryCard = ({ title, count, icon, color }: any) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-2">{count}</p>
        </div>
        <div
          className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}
        >
          {React.cloneElement(icon, { className: `w-6 h-6 text-${color}-600` })}
        </div>
      </div>
    </CardContent>
  </Card>
);

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

const EmptyState = ({ searchTerm, filter }: any) => (
  <div className="text-center py-8">
    <CheckSquare className="mx-auto h-12 w-12 text-slate-400 mb-4" />
    <p className="text-slate-500">
      {searchTerm || filter !== "all"
        ? "Không tìm thấy bước thực hiện nào phù hợp"
        : "Chưa có bước thực hiện nào được thêm"}
    </p>
  </div>
);
