import { useMemo, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  Download,
  File,
  FileText,
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { FileHopDong, HopDong } from "@shared/schema";
import { FILE_TYPE_LABELS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DocumentModal from "@/components/modals/document-modal";
import DocumentViewerModal from "@/components/modals/document-view-modal";
import * as XLSX from "xlsx";

/** =========================
 * Helpers
 * ========================*/
const formatFileSize = (sizeInBytes: number | null | undefined) => {
  if (!sizeInBytes) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let size = sizeInBytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${Math.round(size * 100) / 100} ${units[unitIndex]}`;
};

const formatDate = (dateString: Date | string | null | undefined) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("vi-VN");
};

const getFileIcon = (fileType: string | null | undefined) => {
  if (!fileType) return File;
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return FileText;
  if (type.includes("doc")) return FileText;
  if (type.includes("xls") || type.includes("sheet") || type.includes("excel"))
    return FileSpreadsheet;
  return File;
};

const getFileTypeLabel = (
  fileName: string | null | undefined,
  loaiFile?: string | null
) => {
  const name = fileName ?? "";
  const hasDot = name.includes(".");
  const ext = hasDot ? "." + name.split(".").pop()!.toLowerCase() : "";
  if (ext) {
    return FILE_TYPE_LABELS[ext as keyof typeof FILE_TYPE_LABELS] || "Khác";
  }
  if (loaiFile) {
    const lf = loaiFile.toLowerCase();
    if (lf.includes("pdf")) return "PDF";
    if (lf.includes("word") || lf.includes("doc")) return "Word";
    if (lf.includes("excel") || lf.includes("xls") || lf.includes("sheet"))
      return "Excel";
  }
  return "Khác";
};

type TypeFilter = "all" | "PDF" | "Word" | "Excel";

/** =========================
 * Component
 * ========================*/
export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [contractFilter, setContractFilter] = useState<number | "all">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<FileHopDong | null>(
    null
  );
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data
  const {
    data: documents = [],
    isLoading,
    refetch,
    isFetching,
  } = useQuery<FileHopDong[]>({
    queryKey: ["/api/file-hop-dong"],
  });

  const { data: contracts = [] } = useQuery<HopDong[]>({
    queryKey: ["/api/hop-dong"],
  });

  // Mutations
  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/file-hop-dong/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/file-hop-dong"] });
      toast({
        title: "Thành công",
        description: "Tài liệu đã được xóa",
      });
    },
    onError: (e) => {
      console.error(e);
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu",
        variant: "destructive",
      });
    },
  });

  // Handlers
  const handleEditDocument = (document: FileHopDong) => {
    setSelectedDocument(document);
    setIsEditModalOpen(true);
  };

  const handleViewDocument = (document: FileHopDong) => {
    setSelectedDocument(document);
    setIsViewModalOpen(true);
  };

  const handleDownloadDocument = async (document: FileHopDong) => {
    try {
      if (document.noiDungFile && document.noiDungFile.startsWith("data:")) {
        const link = globalThis.document.createElement("a");
        link.href = document.noiDungFile;
        link.download = document.tenFile || "document";
        globalThis.document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (document.duongDan) {
        const isAbsolute =
          document.duongDan.startsWith("http://") ||
          document.duongDan.startsWith("https://");
        if (isAbsolute) {
          const resp = await fetch(document.duongDan);
          if (!resp.ok) throw new Error("Không thể tải file từ đường dẫn");
          const blob = await resp.blob();
          const url = window.URL.createObjectURL(blob);
          const link = globalThis.document.createElement("a");
          link.href = url;
          link.download = document.tenFile || "document";
          globalThis.document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        } else {
          const response = await fetch(
            `/api/file-hop-dong/${document.id}/download`
          );
          if (!response.ok) throw new Error("Không thể tải file");
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = globalThis.document.createElement("a");
          link.href = url;
          link.download = document.tenFile || "document";
          globalThis.document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        }
      } else {
        const response = await fetch(
          `/api/file-hop-dong/${document.id}/download`
        );
        if (!response.ok) throw new Error("Không thể tải file");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = globalThis.document.createElement("a");
        link.href = url;
        link.download = document.tenFile || "document";
        globalThis.document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      toast({
        title: "Thành công",
        description: "Tài liệu đã được tải xuống",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Lỗi",
        description: "Không thể tải xuống tài liệu",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDocument = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài liệu này không?")) {
      deleteDocumentMutation.mutate(id);
    }
  };

  // Derived
  const filteredDocuments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return documents.filter((doc) => {
      const contract = contracts.find((c) => c.id === doc.hopDongId);
      const tenHopDong = contract?.soHdNgoai || "";
      const haystack =
        [
          doc.tenFile,
          doc.ghiChu,
          doc.soVanBan,
          doc.loaiFile,
          tenHopDong,
          doc.duongDan,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase() || "";

      let matchesDateRange = true;
      if (fromDate) {
        const docDate = doc.ngayTaiLen ? new Date(doc.ngayTaiLen) : null;
        matchesDateRange =
          !!docDate && docDate.getTime() >= new Date(fromDate).getTime();
      }
      if (matchesDateRange && toDate) {
        const docDate = doc.ngayTaiLen ? new Date(doc.ngayTaiLen) : null;
        matchesDateRange =
          !!docDate && docDate.getTime() <= new Date(toDate).getTime();
      }

      const label = getFileTypeLabel(doc.tenFile, doc.loaiFile);
      const matchesType =
        typeFilter === "all"
          ? true
          : label.toLowerCase() === typeFilter.toLowerCase();

      const matchesContract =
        contractFilter === "all" ? true : doc.hopDongId === contractFilter;

      const matchesSearch = term ? haystack.includes(term) : true;

      return (
        matchesSearch && matchesType && matchesContract && matchesDateRange
      );
    });
  }, [
    documents,
    contracts,
    searchTerm,
    typeFilter,
    contractFilter,
    fromDate,
    toDate,
  ]);

  const totalFiles = documents.length;
  const totalSize = documents.reduce(
    (sum, doc) => sum + (doc.kichThuoc || 0),
    0
  );
  const recentFiles = documents.filter((doc) => {
    if (!doc.ngayTaiLen) return false;
    const uploadDate = new Date(doc.ngayTaiLen);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return uploadDate > weekAgo;
  }).length;

  /** ===== EXPORT EXCEL THEO HỢP ĐỒNG =====
   * - Mỗi văn bản là 1 dòng (không gộp bằng ';')
   * - Được sắp xếp theo HĐ (soHdNgoai) rồi đến ngày tải lên
   * - Tôn trọng bộ lọc hiện tại (filteredDocuments)
   */
  const handleExportExcelByContract = () => {
    if (!filteredDocuments.length) {
      toast({
        title: "Không có dữ liệu",
        description: "Không có tài liệu nào để xuất theo bộ lọc hiện tại.",
      });
      return;
    }

    // Chuẩn hóa data => mỗi doc 1 dòng
    const rows = filteredDocuments
      .slice()
      .sort((a, b) => {
        const ca = contracts.find((c) => c.id === a.hopDongId);
        const cb = contracts.find((c) => c.id === b.hopDongId);
        const sa = (ca?.soHdNgoai || "").localeCompare(cb?.soHdNgoai || "");
        if (sa !== 0) return sa;
        const da = a.ngayTaiLen ? new Date(a.ngayTaiLen).getTime() : 0;
        const db = b.ngayTaiLen ? new Date(b.ngayTaiLen).getTime() : 0;
        return da - db;
      })
      .map((d) => {
        const c = contracts.find((x) => x.id === d.hopDongId);
        const soHD =
          c?.soHdNgoai ||
          (d.hopDongId ? `HĐ #${d.hopDongId}` : "Không liên kết");
        const ngayThucHien =
          (d as any).ngayThucHien ?? (d as any).ngay_thuc_hien;

        return {
          "Số HĐ": soHD,
          "ID HĐ": d.hopDongId || "",
          "Tên file": d.tenFile || "",
          Loại: getFileTypeLabel(d.tenFile, d.loaiFile),
          "Kích thước (bytes)": d.kichThuoc ?? "",
          "Kích thước (đọc)": formatFileSize(d.kichThuoc),
          "Số văn bản": d.soVanBan || "",
          "Ngày thực hiện": ngayThucHien ? formatDate(ngayThucHien) : "",
          "Ngày tải lên": d.ngayTaiLen ? formatDate(d.ngayTaiLen) : "",
          "Ghi chú": d.ghiChu || "",
          "Đường dẫn": d.duongDan || "",
        };
      });

    // Tạo workbook & worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows, {
      header: [
        "Số HĐ",
        "ID HĐ",
        "Tên file",
        "Loại",
        "Kích thước (bytes)",
        "Kích thước (đọc)",
        "Số văn bản",
        "Ngày thực hiện",
        "Ngày tải lên",
        "Ghi chú",
        "Đường dẫn",
      ],
    });

    // Auto width cột đơn giản
    const cols = Object.keys(rows[0] || {}).map((k) => ({
      wch: Math.max(k.length + 2, 18),
    }));
    (ws as any)["!cols"] = cols;

    XLSX.utils.book_append_sheet(wb, ws, "Tai lieu theo HD");
    const fileName = `tai-lieu-theo-hop-dong_${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast({
      title: "Đã xuất Excel",
      description: "Xuất theo hợp đồng thành công.",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý tài liệu"
          subtitle="Lưu trữ và quản lý tài liệu hợp đồng"
          onCreateContract={() => {}}
        />

        <main className="flex-1 overflow-auto p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Tổng tài liệu
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {totalFiles}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <File className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Dung lượng
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {formatFileSize(totalSize)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Tải lên tuần này
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {recentFiles}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Plus className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Danh sách tài liệu</CardTitle>
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

                  {/* NÚT EXPORT EXCEL THEO HỢP ĐỒNG */}
                  <Button
                    variant="secondary"
                    onClick={handleExportExcelByContract}
                    title="Xuất Excel theo hợp đồng"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Xuất Excel theo HĐ
                  </Button>

                  <Button onClick={() => setIsCreateModalOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tải lên tài liệu
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row md:items-center gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm: tên file, ghi chú, số văn bản, số HĐ, đường dẫn…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select
                  value={typeFilter}
                  onValueChange={(v) => setTypeFilter(v as TypeFilter)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo loại file" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại file</SelectItem>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="Word">Word</SelectItem>
                    <SelectItem value="Excel">Excel</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={String(contractFilter)}
                  onValueChange={(v) =>
                    setContractFilter(v === "all" ? "all" : Number(v))
                  }
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Lọc theo hợp đồng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả hợp đồng</SelectItem>
                    {contracts.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.soHdNgoai || `HĐ #${c.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-40"
                    placeholder="Từ ngày"
                    title="Lọc từ ngày tải lên"
                  />
                  <span className="text-slate-400">→</span>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-40"
                    placeholder="Đến ngày"
                    title="Lọc đến ngày tải lên"
                  />
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-slate-100 rounded animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8">
                  <File className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-500">
                    {searchTerm ||
                    typeFilter !== "all" ||
                    contractFilter !== "all" ||
                    fromDate ||
                    toDate
                      ? "Không tìm thấy tài liệu nào phù hợp"
                      : "Chưa có tài liệu nào được tải lên"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên file</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Kích thước</TableHead>
                        <TableHead>Hợp đồng</TableHead>
                        <TableHead>Số văn bản</TableHead>
                        <TableHead>Ngày thực hiện</TableHead>
                        <TableHead>Ngày tải lên</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((document) => {
                        const FileIcon = getFileIcon(document.loaiFile);
                        const label = getFileTypeLabel(
                          document.tenFile,
                          document.loaiFile
                        );
                        const contract = contracts.find(
                          (c) => c.id === document.hopDongId
                        );

                        return (
                          <TableRow key={document.id} className="table-row">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                                  <FileIcon className="w-5 h-5 text-slate-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-slate-900">
                                    {document.tenFile || "Chưa có tên"}
                                  </div>
                                  <div className="text-sm text-slate-500 line-clamp-1">
                                    {document.ghiChu || "Không có ghi chú"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Badge variant="outline">{label}</Badge>
                            </TableCell>

                            <TableCell>
                              {formatFileSize(document.kichThuoc)}
                            </TableCell>

                            <TableCell>
                              {document.hopDongId ? (
                                <span className="inline-flex items-center gap-1">
                                  {contract?.soHdNgoai ||
                                    `HĐ #${document.hopDongId}`}
                                  {contract?.id && (
                                    <a
                                      href={`/contracts/${contract.id}`}
                                      className="text-primary hover:underline inline-flex items-center"
                                      title="Mở hợp đồng"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                                    </a>
                                  )}
                                </span>
                              ) : (
                                "Không liên kết"
                              )}
                            </TableCell>

                            <TableCell className="max-w-[180px]">
                              <span title={document.soVanBan || ""}>
                                {document.soVanBan || "—"}
                              </span>
                            </TableCell>

                            <TableCell>
                              {formatDate(
                                (document as any).ngayThucHien ??
                                  (document as any).ngay_thuc_hien
                              )}
                            </TableCell>

                            <TableCell>
                              {formatDate(document.ngayTaiLen)}
                            </TableCell>

                            <TableCell>
                              <div className="flex items-center justify-end space-x-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary hover:text-primary/80"
                                  onClick={() => handleViewDocument(document)}
                                  title="Xem tài liệu"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-800"
                                  onClick={() =>
                                    handleDownloadDocument(document)
                                  }
                                  title="Tải xuống"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-600 hover:text-slate-800"
                                  onClick={() => handleEditDocument(document)}
                                  title="Chỉnh sửa"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-800"
                                  onClick={() =>
                                    document.id &&
                                    handleDeleteDocument(document.id)
                                  }
                                  title="Xóa"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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

        {/* Create */}
        <DocumentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {/* Edit */}
        {selectedDocument && (
          <DocumentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
          />
        )}

        {/* Viewer */}
        {selectedDocument && (
          <DocumentViewerModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
          />
        )}
      </div>
    </div>
  );
}
