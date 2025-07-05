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
import { Progress } from "@/components/ui/progress";
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
  CheckSquare,
  Clock,
  CreditCard,
  Calendar,
} from "lucide-react";
import { ThanhToan } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import PaymentModal from "@/components/modals/payment-modal";

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<ThanhToan | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery<ThanhToan[]>({
    queryKey: ["/api/thanh-toan"],
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/hop-dong"],
  });

  const { data: loaiTien = [] } = useQuery({
    queryKey: ["/api/loai-tien"],
  });

  const { data: loaiThanhToan = [] } = useQuery({
    queryKey: ["/api/loai-thanh-toan"],
  });

  const { data: loaiHinhThucThanhToan = [] } = useQuery({
    queryKey: ["/api/loai-hinh-thuc-thanh-toan"],
  });

  const deletePaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/thanh-toan/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thanh-toan"] });
      toast({
        title: "Thành công",
        description: "Thanh toán đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa thanh toán",
        variant: "destructive",
      });
    },
  });

  // Group payments by contract
  const paymentsByContract = React.useMemo(() => {
    if (!payments.length || !contracts.length) return [];

    const contractGroups = contracts.map((contract) => {
      const contractPayments = payments.filter(
        (payment) => payment.hopDongId === contract.id
      );
      return {
        contract,
        payments: contractPayments,
      };
    });

    return contractGroups.filter((group) => group.payments.length > 0);
  }, [payments, contracts]);

  const filteredPaymentsByContract = paymentsByContract
    .map(({ contract, payments: contractPayments }) => {
      const filteredPayments = contractPayments.filter((payment) => {
        const matchesSearch =
          !searchTerm ||
          payment.ghiChu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contract.ten?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "paid" && payment.hanThucHien) ||
          (statusFilter === "unpaid" && !payment.hanThucHien);

        return matchesSearch && matchesStatus;
      });

      return {
        contract,
        payments: filteredPayments,
      };
    })
    .filter((group) => group.payments.length > 0);

  const handleEditPayment = (payment: ThanhToan) => {
    setSelectedPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleDeletePayment = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thanh toán này không?")) {
      deletePaymentMutation.mutate(id);
    }
  };

  const handleViewPayment = (payment: ThanhToan) => {
    toast({
      title: "Thông tin",
      description: `Xem chi tiết: ${payment.soTien} ${payment.loaiTienId}`,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (daThanhToan: boolean) => {
    return daThanhToan ? (
      <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
    ) : (
      <Badge className="bg-orange-100 text-orange-800">Chưa thanh toán</Badge>
    );
  };
  const getPaymentStatus = (
    hanHopDong: string | null,
    hanThucHien: string | null,
    daThanhToan: boolean
  ) => {
    const now = new Date();
    const deadline = hanThucHien
      ? new Date(hanThucHien)
      : hanHopDong
      ? new Date(hanHopDong)
      : null;

    if (!deadline)
      return { label: "Chưa xác định", color: "bg-gray-100 text-gray-800" };

    if (!daThanhToan && deadline < now)
      return { label: "Quá hạn", color: "bg-red-100 text-red-800" };

    if (
      !daThanhToan &&
      deadline.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000
    )
      return { label: "Sắp đến hạn", color: "bg-yellow-100 text-yellow-800" };

    return { label: "Bình thường", color: "bg-green-100 text-green-800" };
  };
  const overdueCount = payments.filter((p) => {
    const status = getPaymentStatus(p.hanHopDong, p.hanThucHien, p.daThanhToan);
    return status.label === "Quá hạn";
  }).length;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý thanh toán"
          subtitle="Theo dõi và quản lý các khoản thanh toán"
          onCreateContract={() => {}}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Tổng thanh toán
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {payments.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Sắp đến hạn
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {
                        payments.filter((p) => {
                          const status = getPaymentStatus(
                            p.hanHopDong,
                            p.hanThucHien
                          );
                          return status.label === "Sắp đến hạn";
                        }).length
                      }
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Quá hạn
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {overdueCount}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách thanh toán</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thanh toán
                </Button>
              </div>

              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm thanh toán..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="due_soon">Sắp đến hạn</SelectItem>
                    <SelectItem value="overdue">Quá hạn</SelectItem>
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
              ) : filteredPaymentsByContract.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-500">
                    {searchTerm || statusFilter !== "all"
                      ? "Không tìm thấy thanh toán nào phù hợp"
                      : "Chưa có thanh toán nào được thêm"}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredPaymentsByContract.map(
                    ({ contract, payments: contractPayments }) => {
                      const contractPaymentSummary = {
                        total: contractPayments.length,
                        paid: contractPayments.filter((p) => p.hanThucHien)
                          .length,
                        unpaid: contractPayments.filter((p) => !p.hanThucHien)
                          .length,
                        totalAmount: contract.giaTriHopDong,
                        paidAmount: contractPayments
                          .filter((p) => p.hanThucHien)
                          .reduce(
                            (sum, p) =>
                              sum + (parseFloat(p.soTien || "0") || 0),
                            0
                          ),
                      };

                      return (
                        <div
                          key={contract.id}
                          className="border rounded-lg bg-white overflow-hidden"
                        >
                          {/* Contract Header */}
                          <div className="bg-slate-50 px-6 py-4 border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h2 className="text-lg font-semibold text-slate-900">
                                  {contract.ten}
                                </h2>
                                <p className="text-sm text-slate-600 mt-1">
                                  Số HĐ: {contract.soHdNoi} •{" "}
                                  {contract.soHdNgoai || "Không có số ngoài"}
                                </p>
                              </div>
                              <div className="flex items-center space-x-4">
                                <div className="text-right">
                                  <div className="text-sm text-slate-600">
                                    Tổng thanh toán
                                  </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span className="text-sm font-medium">
                                      {contractPaymentSummary.total} lần
                                    </span>
                                    <div className="w-20">
                                      <Progress
                                        value={
                                          (contractPaymentSummary.paidAmount /
                                            contractPaymentSummary.totalAmount) *
                                          100
                                        }
                                        className="h-2"
                                      />
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    {contractPaymentSummary.paidAmount.toLocaleString(
                                      "vi-VN"
                                    )}{" "}
                                    VND đã thanh toán
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="bg-orange-50 text-orange-700 border-orange-200"
                                  >
                                    {(
                                      contractPaymentSummary.totalAmount -
                                      contractPaymentSummary.paidAmount
                                    ).toLocaleString("vi-VN")}{" "}
                                    VND còn lại
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment Records */}
                          <div className="p-6">
                            <div className="space-y-4">
                              {contractPayments.map((payment, index) => (
                                <div
                                  key={payment.id || index}
                                  className="flex items-start space-x-4 p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex-shrink-0 mt-1">
                                    {payment.hanThucHien ? (
                                      <CheckSquare className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <Clock className="h-5 w-5 text-orange-600" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <h4 className="text-md font-medium text-slate-900">
                                        Lần thanh toán #{index + 1}
                                      </h4>
                                      {getStatusBadge(
                                        payment.daThanhToan ?? false
                                      )}
                                      {/* Badge trạng thái thời hạn */}
                                      {!payment.daThanhToan &&
                                        (() => {
                                          const { label, color } =
                                            getPaymentStatus(
                                              payment.hanHopDong,
                                              payment.hanThucHien,
                                              payment.daThanhToan ?? false
                                            );
                                          if (
                                            label === "Sắp đến hạn" ||
                                            label === "Quá hạn"
                                          ) {
                                            return (
                                              <Badge className={color}>
                                                {label}
                                              </Badge>
                                            );
                                          }
                                          return null;
                                        })()}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-3">
                                      <div>
                                        <span className="text-slate-600">
                                          Số tiền:
                                        </span>
                                        <p className="font-medium text-lg text-green-600">
                                          {parseFloat(
                                            payment.soTien || "0"
                                          ).toLocaleString("vi-VN")}{" "}
                                          {loaiTien.find(
                                            (lt: any) =>
                                              lt.id === payment.loaiTienId
                                          )?.ten || "VND"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-slate-600">
                                          Loại thanh toán:
                                        </span>
                                        <p className="font-medium">
                                          {loaiThanhToan.find(
                                            (lt: any) =>
                                              lt.id === payment.loaiThanhToanId
                                          )?.ten || "Chưa xác định"}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-slate-600">
                                          Hình thức:
                                        </span>
                                        <p className="font-medium">
                                          {loaiHinhThucThanhToan.find(
                                            (lh: any) =>
                                              lh.id ===
                                              payment.loaiHinhThucThanhToanId
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
                                      <div className="pt-2 border-t">
                                        <span className="text-slate-600 text-sm">
                                          Ghi chú:
                                        </span>
                                        <p className="text-sm text-slate-700 mt-1">
                                          {payment.ghiChu}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-primary hover:text-primary/80"
                                      onClick={() => handleViewPayment(payment)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-slate-600 hover:text-slate-800"
                                      onClick={() => handleEditPayment(payment)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-red-600 hover:text-red-800"
                                      onClick={() =>
                                        handleDeletePayment(payment.id)
                                      }
                                      disabled={deletePaymentMutation.isPending}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <PaymentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {selectedPayment && (
          <PaymentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPayment(null);
            }}
            payment={selectedPayment}
          />
        )}
      </div>
    </div>
  );
}
