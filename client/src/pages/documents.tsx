import { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { FileHopDong } from "@shared/schema";
import { FILE_TYPE_LABELS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import DocumentModal from "@/components/modals/document-modal";

export default function Documents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<FileHopDong | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: documents = [], isLoading } = useQuery<FileHopDong[]>({
    queryKey: ["/api/file-hop-dong"],
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/file-hop-dong/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/file-hop-dong"] });
      toast({
        title: "Thành công",
        description: "Tài liệu đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa tài liệu",
        variant: "destructive",
      });
    },
  });

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
        // Download from base64 content stored in database
        const link = globalThis.document.createElement("a");
        link.href = document.noiDungFile;
        link.download = document.tenFile || "document";
        globalThis.document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Fallback to server download endpoint
        const response = await fetch(
          `/api/file-hop-dong/${document.id}/download`
        );
        if (!response.ok) {
          throw new Error("Không thể tải file");
        }

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

  const formatFileSize = (sizeInBytes: number | null) => {
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

  const formatDate = (dateString: Date | string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return File;

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) return FileText;
    if (type.includes("doc")) return FileText;
    if (type.includes("xls")) return FileSpreadsheet;
    return File;
  };

  const getFileTypeLabel = (fileName: string | null) => {
    if (!fileName) return "Không xác định";

    const extension = "." + fileName.split(".").pop()?.toLowerCase();
    return (
      FILE_TYPE_LABELS[extension as keyof typeof FILE_TYPE_LABELS] || "Khác"
    );
  };

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.tenFile?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.ghiChu?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || doc.loaiFile === typeFilter;

    return matchesSearch && matchesType;
  });

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
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách tài liệu</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Tải lên tài liệu
                </Button>
              </div>

              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm tài liệu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
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
                    {searchTerm || typeFilter !== "all"
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
                        <TableHead>Ngày tải lên</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map((document) => {
                        const FileIcon = getFileIcon(document.loaiFile);

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
                                  <div className="text-sm text-slate-500">
                                    {document.ghiChu || "Không có ghi chú"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getFileTypeLabel(document.tenFile)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {formatFileSize(document.kichThuoc)}
                            </TableCell>
                            <TableCell>
                              {document.hopDongId
                                ? `HD-${document.hopDongId}`
                                : "Chưa gán"}
                            </TableCell>
                            <TableCell>
                              {formatDate(document.ngayTaiLen)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
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
                                    handleDeleteDocument(document.id!)
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
        <DocumentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

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

        {/* Document Viewer Modal */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {selectedDocument?.tenFile || "Xem tài liệu"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-auto">
              {selectedDocument && (
                <div className="space-y-4">
                  {/* Document Info */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-600">
                          Tên file:
                        </span>
                        <p className="text-slate-900">
                          {selectedDocument.tenFile}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          Kích thước:
                        </span>
                        <p className="text-slate-900">
                          {formatFileSize(selectedDocument.kichThuoc)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          Loại file:
                        </span>
                        <p className="text-slate-900">
                          {getFileTypeLabel(selectedDocument.tenFile)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">
                          Ngày tải lên:
                        </span>
                        <p className="text-slate-900">
                          {formatDate(selectedDocument.ngayTaiLen)}
                        </p>
                      </div>
                      {selectedDocument.ghiChu && (
                        <div className="col-span-2">
                          <span className="font-medium text-slate-600">
                            Ghi chú:
                          </span>
                          <p className="text-slate-900">
                            {selectedDocument.ghiChu}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Preview/Actions */}
                  <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      {(() => {
                        const FileIcon = getFileIcon(selectedDocument.loaiFile);
                        return <FileIcon className="w-8 h-8 text-slate-600" />;
                      })()}
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">
                      {selectedDocument.tenFile}
                    </h3>
                    <p className="text-slate-600 mb-4">
                      {getFileTypeLabel(selectedDocument.tenFile)} •{" "}
                      {formatFileSize(selectedDocument.kichThuoc)}
                    </p>

                    <div className="flex justify-center gap-3">
                      <Button
                        onClick={() => handleDownloadDocument(selectedDocument)}
                        className="bg-primary text-white hover:bg-primary/90"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Tải xuống
                      </Button>

                      {selectedDocument.duongDan && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (selectedDocument.duongDan) {
                              window.open(selectedDocument.duongDan, "_blank");
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Mở trong tab mới
                        </Button>
                      )}
                    </div>

                    {/* Image Preview for image files */}
                    {selectedDocument.loaiFile?.startsWith("image/") &&
                      selectedDocument.noiDung && (
                        <div className="mt-6">
                          <img
                            src={`data:${selectedDocument.loaiFile};base64,${selectedDocument.noiDung}`}
                            alt={selectedDocument.tenFile || "Document preview"}
                            className="max-w-full h-auto max-h-96 border rounded-lg mx-auto"
                          />
                        </div>
                      )}

                    {/* PDF Preview for PDF files */}
                    {selectedDocument.loaiFile?.includes("pdf") &&
                      selectedDocument.duongDan && (
                        <div className="mt-6">
                          <iframe
                            src={`${selectedDocument.duongDan}#toolbar=0`}
                            className="w-full h-96 border rounded-lg"
                            title="PDF Preview"
                          />
                        </div>
                      )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
