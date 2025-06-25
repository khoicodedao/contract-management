import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  HopDong,
  BuocThucHien,
  FileHopDong,
  insertBuocThucHienSchema,
  InsertBuocThucHien,
  insertFileHopDongSchema,
  InsertFileHopDong,
} from "@shared/schema";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
  PROGRESS_STATUS_COLORS,
} from "@/lib/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Folder,
  FileText,
  Plus,
  CreditCard,
  Download,
  Eye,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface ContractViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: HopDong;
}

export default function ContractViewModal({
  isOpen,
  onClose,
  contract,
}: ContractViewModalProps) {
  const [isAddingProgress, setIsAddingProgress] = useState(false);
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<FileHopDong | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: progressSteps = [] } = useQuery<BuocThucHien[]>({
    queryKey: ["/api/buoc-thuc-hien"],
    enabled: isOpen && !!contract,
  });

  // Fetch files for this contract
  const { data: contractFiles = [] } = useQuery<FileHopDong[]>({
    queryKey: ["/api/file-hop-dong"],
    enabled: isOpen && !!contract,
  });

  // Fetch staff list for file upload
  const { data: staffList = [] } = useQuery({
    queryKey: ["/api/can-bo"],
    enabled: isAddingFile,
  });

  // Fetch payment data for this contract
  const { data: payments = [] } = useQuery({
    queryKey: ["/api/thanh-toan"],
    enabled: isOpen && !!contract,
  });

  const { data: loaiTien = [] } = useQuery({
    queryKey: ["/api/loai-tien"],
    enabled: isOpen && !!contract,
  });

  const { data: loaiThanhToan = [] } = useQuery({
    queryKey: ["/api/loai-thanh-toan"],
    enabled: isOpen && !!contract,
  });

  const { data: loaiHinhThucThanhToan = [] } = useQuery({
    queryKey: ["/api/loai-hinh-thuc-thanh-toan"],
    enabled: isOpen && !!contract,
  });

  const contractProgressSteps = progressSteps.filter(
    (step) => step.hopDongId === contract.id
  );
  const contractPayments = payments.filter(
    (payment) => payment.hopDongId === contract.id
  );
  const contractFileList = contractFiles.filter(
    (file) => file.hopDongId === contract.id
  );

  const form = useForm<InsertBuocThucHien>({
    resolver: zodResolver(insertBuocThucHienSchema),
    defaultValues: {
      hopDongId: contract?.id,
      ten: "",
      moTa: "",
      ngayBatDau: new Date().toISOString().split("T")[0],
      ngayKetThuc: "",
      trangThai: "Chờ thực hiện",
      thuTu: (contractProgressSteps?.length || 0) + 1,
    },
  });

  const createProgressMutation = useMutation({
    mutationFn: async (data: InsertBuocThucHien) => {
      return await apiRequest("POST", "/api/buoc-thuc-hien", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buoc-thuc-hien"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/overview"] });
      toast({
        title: "Thành công",
        description: "Bước thực hiện đã được thêm",
      });
      form.reset({
        hopDongId: contract?.id,
        ten: "",
        moTa: "",
        ngayBatDau: new Date().toISOString().split("T")[0],
        ngayKetThuc: "",
        trangThai: "Chờ thực hiện",
        thuTu: (contractProgressSteps?.length || 0) + 2,
      });
      setIsAddingProgress(false);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm bước thực hiện",
        variant: "destructive",
      });
    },
  });

  // Fetch reference data to show detailed information instead of IDs
  const { data: loaiHopDong = [] } = useQuery({
    queryKey: ["/api/loai-hop-dong"],
    enabled: isOpen && !!contract,
  });

  const { data: nhaCungCap = [] } = useQuery({
    queryKey: ["/api/nha-cung-cap"],
    enabled: isOpen && !!contract,
  });

  const { data: chuDauTu = [] } = useQuery({
    queryKey: ["/api/chu-dau-tu"],
    enabled: isOpen && !!contract,
  });

  const { data: canBo = [] } = useQuery({
    queryKey: ["/api/can-bo"],
    enabled: isOpen && !!contract,
  });

  const { data: loaiNganSach = [] } = useQuery({
    queryKey: ["/api/loai-ngan-sach"],
    enabled: isOpen && !!contract,
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (statusId: number | null) => {
    if (!statusId) return null;

    const label =
      CONTRACT_STATUS_LABELS[statusId as keyof typeof CONTRACT_STATUS_LABELS] ||
      "Không xác định";
    const color =
      CONTRACT_STATUS_COLORS[statusId as keyof typeof CONTRACT_STATUS_COLORS] ||
      "bg-gray-100 text-gray-800";

    return <Badge className={color}>{label}</Badge>;
  };

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

  const getProgressStatusIcon = (status: string | null) => {
    if (!status) return Clock;

    switch (status.toLowerCase()) {
      case "hoàn thành":
        return CheckSquare;
      case "đang thực hiện":
        return Clock;
      case "tạm dừng":
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getProgressStatusColor = (status: string | null) => {
    if (!status) return "text-gray-500";

    switch (status.toLowerCase()) {
      case "hoàn thành":
        return "text-green-600";
      case "đang thực hiện":
        return "text-blue-600";
      case "tạm dừng":
        return "text-yellow-600";
      default:
        return "text-gray-500";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const getCurrencyName = (currencyId: number | null) => {
    const currency = loaiTien.find((item: any) => item.id === currencyId);
    return currency?.ten || "VND";
  };

  const getPaymentTypeName = (typeId: number | null) => {
    const type = loaiThanhToan.find((item: any) => item.id === typeId);
    return type?.ten || "Chưa xác định";
  };

  const getPaymentMethodName = (methodId: number | null) => {
    const method = loaiHinhThucThanhToan.find(
      (item: any) => item.id === methodId
    );
    return method?.ten || "Chưa xác định";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Chi tiết hợp đồng: {contract?.ten}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="progress">Tiến độ</TabsTrigger>
            <TabsTrigger value="payments">Thanh toán</TabsTrigger>
            <TabsTrigger value="files">Tài liệu</TabsTrigger>
          </TabsList>

          {/* Contract Info Tab */}
          <TabsContent value="info" className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Thông tin cơ bản</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Tên hợp đồng
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {contract.ten || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    {getStatusBadge(contract.trangThaiHopDongId)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Số HĐ nội bộ
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {contract.soHdNoi || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Số HĐ ngoài
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {contract.soHdNgoai || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Ngày ký
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(contract.ngay)}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Description */}
            {contract.moTa && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Mô tả</h3>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {contract.moTa}
                </p>
              </div>
            )}

            <Separator />

            {/* Progress Tree */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Folder className="w-5 h-5 mr-2 text-blue-600" />
                Tiến độ thực hiện ({contractProgressSteps.length} bước)
              </h3>

              {contractProgressSteps.length > 0 ? (
                <div className="space-y-3">
                  {contractProgressSteps
                    .sort((a, b) => (a.thuTu || 0) - (b.thuTu || 0))
                    .map((step, index) => {
                      const StatusIcon = getProgressStatusIcon(step.trangThai);
                      const progressPercentage = getProgressPercentage(step);
                      const statusColor = getProgressStatusColor(
                        step.trangThai
                      );

                      return (
                        <div
                          key={step.id}
                          className="border rounded-lg p-4 bg-gray-50"
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                                step.trangThai === "Hoàn thành"
                                  ? "bg-green-100"
                                  : step.trangThai === "Đang thực hiện"
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <StatusIcon
                                className={`w-4 h-4 ${statusColor}`}
                              />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                    #{step.thuTu || index + 1}
                                  </span>
                                  {step.ten || "Chưa có tên"}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    step.trangThai === "Hoàn thành"
                                      ? "border-green-200 text-green-700"
                                      : step.trangThai === "Đang thực hiện"
                                      ? "border-blue-200 text-blue-700"
                                      : "border-gray-200 text-gray-700"
                                  }`}
                                >
                                  {step.trangThai || "Chưa xác định"}
                                </Badge>
                              </div>

                              {step.moTa && (
                                <p className="text-sm text-gray-600 mb-2">
                                  {step.moTa}
                                </p>
                              )}

                              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-2">
                                <div>
                                  <span className="font-medium">Bắt đầu:</span>{" "}
                                  {formatDate(step.ngayBatDau)}
                                </div>
                                <div>
                                  <span className="font-medium">Kết thúc:</span>{" "}
                                  {formatDate(step.ngayKetThuc)}
                                </div>
                              </div>

                              {step.ngayBatDau && step.ngayKetThuc && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-gray-600">
                                    <span>Tiến độ</span>
                                    <span>
                                      {Math.round(progressPercentage)}%
                                    </span>
                                  </div>
                                  <Progress
                                    value={progressPercentage}
                                    className="h-2"
                                  />
                                </div>
                              )}

                              {step.ghiChu && (
                                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                  <span className="font-medium text-yellow-800">
                                    Ghi chú:
                                  </span>{" "}
                                  {step.ghiChu}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có bước thực hiện nào</p>
                  <p className="text-sm">
                    Vào trang Tiến độ để thêm các bước thực hiện
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Thông tin thanh toán
              </h3>
              {contractPayments.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border">
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Tổng số lần</p>
                      <p className="text-xl font-bold text-blue-600">
                        {contractPayments.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Tổng giá trị</p>
                      <p className="text-xl font-bold text-green-600">
                        {contractPayments
                          .reduce(
                            (sum, p) =>
                              sum + (parseFloat(p.soTien || "0") || 0),
                            0
                          )
                          .toLocaleString("vi-VN")}{" "}
                        VND
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-slate-600">Đã thanh toán</p>
                      <p className="text-xl font-bold text-slate-700">
                        {contractPayments.filter((p) => p.hanThucHien).length}/
                        {contractPayments.length}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {contractPayments.map((payment, index) => (
                      <div
                        key={payment.id || index}
                        className="p-4 border rounded-lg bg-white"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-slate-900">
                            Lần thanh toán #{index + 1}
                          </h4>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              payment.hanThucHien
                                ? "bg-green-100 text-green-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {payment.hanThucHien
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-slate-600">Số tiền:</span>
                            <p className="font-medium">
                              {parseFloat(payment.soTien || "0").toLocaleString(
                                "vi-VN"
                              )}{" "}
                              {loaiTien.find(
                                (lt: any) => lt.id === payment.loaiTienId
                              )?.ten || "VND"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-600">
                              Loại thanh toán:
                            </span>
                            <p className="font-medium">
                              {loaiThanhToan.find(
                                (lt: any) => lt.id === payment.loaiThanhToanId
                              )?.ten || "Chưa xác định"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-600">Hình thức:</span>
                            <p className="font-medium">
                              {loaiHinhThucThanhToan.find(
                                (lh: any) =>
                                  lh.id === payment.loaiHinhThucThanhToanId
                              )?.ten || "Chưa xác định"}
                            </p>
                          </div>
                          <div>
                            <span className="text-slate-600">
                              Hạn thực hiện:
                            </span>
                            <p className="font-medium">
                              {payment.hanThucHien
                                ? formatDate(payment.hanThucHien)
                                : "Chưa xác định"}
                            </p>
                          </div>
                        </div>

                        {payment.ghiChu && (
                          <div className="mt-2 pt-2 border-t">
                            <span className="text-slate-600 text-sm">
                              Ghi chú:
                            </span>
                            <p className="text-sm text-slate-700 mt-1">
                              {payment.ghiChu}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                  <CreditCard className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-sm">Chưa có thông tin thanh toán</p>
                  <p className="text-sm">
                    Vào trang Thanh toán để thêm các lần thanh toán
                  </p>
                </div>
              )}
            </div>

            <Separator />

            {/* Related Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Thông tin liên quan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Loại hợp đồng
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-blue-50 p-2 rounded border">
                    {loaiHopDong.find(
                      (item: any) => item.id === contract.loaiHopDongId
                    )?.ten || "Chưa xác định"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Chủ đầu tư
                  </label>
                  <div className="mt-1 bg-green-50 p-3 rounded border">
                    <p className="text-sm font-medium text-gray-900">
                      {chuDauTu.find(
                        (item: any) => item.id === contract.chuDauTuId
                      )?.ten || "Chưa xác định"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {chuDauTu.find(
                        (item: any) => item.id === contract.chuDauTuId
                      )?.diaChi || ""}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Nhà cung cấp
                  </label>
                  <div className="mt-1 bg-purple-50 p-3 rounded border">
                    <p className="text-sm font-medium text-gray-900">
                      {nhaCungCap.find(
                        (item: any) => item.id === contract.nhaCungCapId
                      )?.ten || "Chưa xác định"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {nhaCungCap.find(
                        (item: any) => item.id === contract.nhaCungCapId
                      )?.diaChi || ""}
                    </p>
                    {nhaCungCap.find(
                      (item: any) => item.id === contract.nhaCungCapId
                    )?.soDienThoai && (
                      <p className="text-xs text-gray-600">
                        SĐT:{" "}
                        {
                          nhaCungCap.find(
                            (item: any) => item.id === contract.nhaCungCapId
                          )?.soDienThoai
                        }
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Loại ngân sách
                  </label>
                  <p className="mt-1 text-sm text-gray-900 bg-yellow-50 p-2 rounded border">
                    {loaiNganSach.find(
                      (item: any) => item.id === contract.loaiNganSachId
                    )?.ten || "Chưa xác định"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-600">
                    Cán bộ phụ trách
                  </label>
                  <div className="mt-1 bg-indigo-50 p-3 rounded border">
                    <p className="text-sm font-medium text-gray-900">
                      {canBo.find((item: any) => item.id === contract.canBoId)
                        ?.ten || "Chưa xác định"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      Chức vụ:{" "}
                      {canBo.find((item: any) => item.id === contract.canBoId)
                        ?.chucVu || ""}
                    </p>
                    {canBo.find((item: any) => item.id === contract.canBoId)
                      ?.email && (
                      <p className="text-xs text-gray-600">
                        Email:{" "}
                        {
                          canBo.find(
                            (item: any) => item.id === contract.canBoId
                          )?.email
                        }
                      </p>
                    )}
                    {canBo.find((item: any) => item.id === contract.canBoId)
                      ?.soDienThoai && (
                      <p className="text-xs text-gray-600">
                        SĐT:{" "}
                        {
                          canBo.find(
                            (item: any) => item.id === contract.canBoId
                          )?.soDienThoai
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center">
                <Folder className="w-5 h-5 mr-2 text-blue-600" />
                Tiến độ thực hiện ({contractProgressSteps.length} bước)
              </h3>
              <Button
                onClick={() => setIsAddingProgress(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm bước
              </Button>
            </div>

            {/* Progress Step Form */}
            {isAddingProgress && (
              <Card className="p-4 border-blue-200 bg-blue-50">
                <Form {...progressForm}>
                  <form
                    onSubmit={progressForm.handleSubmit(onProgressSubmit)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={progressForm.control}
                        name="ten"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên bước</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Nhập tên bước..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={progressForm.control}
                        name="trangThai"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trạng thái</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Chờ thực hiện">
                                  Chờ thực hiện
                                </SelectItem>
                                <SelectItem value="Đang thực hiện">
                                  Đang thực hiện
                                </SelectItem>
                                <SelectItem value="Hoàn thành">
                                  Hoàn thành
                                </SelectItem>
                                <SelectItem value="Tạm dừng">
                                  Tạm dừng
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={progressForm.control}
                        name="ngayBatDau"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngày bắt đầu</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={progressForm.control}
                        name="ngayKetThuc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ngày kết thúc</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={progressForm.control}
                      name="ghiChu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghi chú</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Mô tả chi tiết về bước này..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddingProgress(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={createProgressMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createProgressMutation.isPending
                          ? "Đang thêm..."
                          : "Thêm bước"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Card>
            )}

            {/* Progress Steps List */}
            <div className="space-y-3">
              {contractProgressSteps.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Clock className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>Chưa có bước thực hiện nào</p>
                </div>
              ) : (
                contractProgressSteps
                  .sort((a, b) => (a.thuTu || 0) - (b.thuTu || 0))
                  .map((step, index) => {
                    const StatusIcon = getProgressStatusIcon(step.trangThai);
                    const progressPercentage = getProgressPercentage(step);
                    const statusColor = getProgressStatusColor(step.trangThai);

                    return (
                      <div
                        key={step.id}
                        className="border rounded-lg p-4 bg-gray-50"
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                              step.trangThai === "Hoàn thành"
                                ? "bg-green-100"
                                : step.trangThai === "Đang thực hiện"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                            }`}
                          >
                            <StatusIcon className={`w-4 h-4 ${statusColor}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                  #{step.thuTu || index + 1}
                                </span>
                                {step.ten || "Chưa có tên"}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  step.trangThai === "Hoàn thành"
                                    ? "border-green-200 text-green-700"
                                    : step.trangThai === "Đang thực hiện"
                                    ? "border-blue-200 text-blue-700"
                                    : "border-gray-200 text-gray-700"
                                }`}
                              >
                                {step.trangThai || "Chưa xác định"}
                              </Badge>
                            </div>

                            {step.moTa && (
                              <p className="text-sm text-gray-600 mb-2">
                                {step.moTa}
                              </p>
                            )}

                            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-2">
                              <div>
                                <span className="font-medium">Bắt đầu:</span>{" "}
                                {formatDate(step.ngayBatDau)}
                              </div>
                              <div>
                                <span className="font-medium">Kết thúc:</span>{" "}
                                {formatDate(step.ngayKetThuc)}
                              </div>
                            </div>

                            {step.ngayBatDau && step.ngayKetThuc && (
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs text-gray-600">
                                  <span>Tiến độ</span>
                                  <span>{Math.round(progressPercentage)}%</span>
                                </div>
                                <Progress
                                  value={progressPercentage}
                                  className="h-2"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Thông tin thanh toán</h3>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600">Tổng thanh toán</p>
                    <p className="text-xl font-bold text-blue-900">
                      {contractPayments.length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckSquare className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600">Đã thanh toán</p>
                    <p className="text-xl font-bold text-green-900">
                      {
                        contractPayments.filter(
                          (p) => p.trangThai === "Đã thanh toán"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-sm text-red-600">Chưa thanh toán</p>
                    <p className="text-xl font-bold text-red-900">
                      {
                        contractPayments.filter(
                          (p) => p.trangThai === "Chưa thanh toán"
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="space-y-3">
              {contractPayments.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>Chưa có thông tin thanh toán</p>
                </div>
              ) : (
                contractPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            payment.trangThai === "Đã thanh toán"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <h4 className="font-medium">
                          {formatCurrency(payment.soTien || 0)}{" "}
                          {getCurrencyName(payment.loaiTienId)}
                        </h4>
                      </div>
                      <Badge
                        variant={
                          payment.trangThai === "Đã thanh toán"
                            ? "default"
                            : "destructive"
                        }
                        className="text-xs"
                      >
                        {payment.trangThai || "Chưa xác định"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Loại thanh toán:</span>{" "}
                        {getPaymentTypeName(payment.loaiThanhToanId)}
                      </div>
                      <div>
                        <span className="font-medium">Hình thức:</span>{" "}
                        {getPaymentMethodName(payment.loaiHinhThucThanhToanId)}
                      </div>
                      <div>
                        <span className="font-medium">Ngày đến hạn:</span>{" "}
                        {formatDate(payment.ngayDenHan)}
                      </div>
                      <div>
                        <span className="font-medium">Ngày thanh toán:</span>{" "}
                        {formatDate(payment.ngayThanhToan)}
                      </div>
                    </div>

                    {payment.ghiChu && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Ghi chú:</span>{" "}
                        {payment.ghiChu}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Tài liệu hợp đồng</h3>
              <Button
                onClick={() => setIsAddingFile(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm tài liệu
              </Button>
            </div>

            {/* File Upload Form */}
            {isAddingFile && (
              <Card className="p-4 border-blue-200 bg-blue-50">
                <Form {...fileForm}>
                  <form
                    onSubmit={fileForm.handleSubmit(handleFileUpload)}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={fileForm.control}
                        name="tenFile"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tên file</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Tên file sẽ tự động điền"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={fileForm.control}
                        name="nguoiTaiLen"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Người tải lên</FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(parseInt(value))
                              }
                              value={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Chọn người tải lên" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {staffList.map((staff: any) => (
                                  <SelectItem
                                    key={staff.id}
                                    value={staff.id.toString()}
                                  >
                                    {staff.ten} - {staff.chucVu}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={fileForm.control}
                      name="ghiChu"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ghi chú</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Mô tả về tài liệu..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chọn file</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            onChange={handleFileSelect}
                            className="hidden"
                            id="file-upload"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer"
                          >
                            <Button type="button" variant="outline" asChild>
                              <span>
                                <Upload className="w-4 h-4 mr-2" />
                                {selectedFile ? selectedFile.name : "Chọn file"}
                              </span>
                            </Button>
                          </label>
                          {selectedFile && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFile(null)}
                              className="ml-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, XLS, PNG, JPG. Tối đa 10MB cho tài liệu, 5MB
                        cho hình ảnh
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsAddingFile(false);
                          setSelectedFile(null);
                          fileForm.reset();
                        }}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="submit"
                        disabled={createFileMutation.isPending || !selectedFile}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createFileMutation.isPending
                          ? "Đang tải lên..."
                          : "Tải lên"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </Card>
            )}

            {/* Files List */}
            <div className="space-y-2">
              {contractFileList.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                  <p>Chưa có tài liệu nào</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên file</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Kích thước</TableHead>
                      <TableHead>Ngày tải</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contractFileList.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-medium">
                          {file.tenFile}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {file.loaiFile?.includes("image/")
                              ? "Hình ảnh"
                              : file.loaiFile?.includes("pdf")
                              ? "PDF"
                              : file.loaiFile?.includes("word") ||
                                file.loaiFile?.includes("document")
                              ? "Word"
                              : file.loaiFile?.includes("sheet") ||
                                file.loaiFile?.includes("excel")
                              ? "Excel"
                              : "File"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {file.kichThuoc
                            ? `${(file.kichThuoc / 1024 / 1024).toFixed(2)} MB`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {file.ngayTaiLen
                            ? format(new Date(file.ngayTaiLen), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedFile(file)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleFileDownload(
                                  file.id!,
                                  file.tenFile || "file"
                                )
                              }
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
