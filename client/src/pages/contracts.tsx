import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContractModal from "@/components/modals/contract-modal";
import ContractViewModal from "@/components/modals/contract-view-modal";
import { Eye, Edit, Trash2, Search, Filter, Plus } from "lucide-react";
import { HopDong } from "@shared/schema";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
} from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";

export default function Contracts() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialSearch = searchParams.get("search") || "";
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<HopDong | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contracts = [], isLoading } = useQuery<HopDong[]>({
    queryKey: ["/api/hop-dong"],
  });

  const { data: contractTypes = [] } = useQuery({
    queryKey: ["/api/loai-hop-dong"],
  });

  // Fetch reference data to display detailed information instead of IDs
  const { data: nhaCungCap = [] } = useQuery({
    queryKey: ["/api/nha-cung-cap"],
  });

  const { data: chuDauTu = [] } = useQuery({
    queryKey: ["/api/chu-dau-tu"],
  });

  const { data: canBo = [] } = useQuery({
    queryKey: ["/api/can-bo"],
  });

  const deleteContractMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/hop-dong/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hop-dong"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Thành công",
        description: "Hợp đồng đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa hợp đồng",
        variant: "destructive",
      });
    },
  });

  const handleViewContract = (contract: HopDong) => {
    setSelectedContract(contract);
    setIsViewModalOpen(true);
  };

  const handleEditContract = (contract: HopDong) => {
    setSelectedContract(contract);
    setIsEditModalOpen(true);
  };

  const handleDeleteContract = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hợp đồng này không?")) {
      deleteContractMutation.mutate(id);
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.soHdNoi?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      contract.trangThaiHopDongId?.toString() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (statusId: number | null) => {
    if (!statusId) return null;

    const label =
      CONTRACT_STATUS_LABELS[statusId as keyof typeof CONTRACT_STATUS_LABELS];
    const colors =
      CONTRACT_STATUS_COLORS[statusId as keyof typeof CONTRACT_STATUS_COLORS];

    return <Badge className={`status-badge ${colors}`}>{label}</Badge>;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý hợp đồng"
          subtitle="Tạo, chỉnh sửa và theo dõi tất cả hợp đồng"
          onCreateContract={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách hợp đồng</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm hợp đồng
                </Button>
              </div>

              {/* Filters */}
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm hợp đồng..."
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
                    <SelectItem value="1">Đang thực hiện</SelectItem>
                    <SelectItem value="2">Hoàn thành</SelectItem>
                    <SelectItem value="3">Tạm dừng</SelectItem>
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
              ) : filteredContracts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">
                    {searchTerm || statusFilter !== "all"
                      ? "Không tìm thấy hợp đồng nào phù hợp"
                      : "Chưa có hợp đồng nào được tạo"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên hợp đồng</TableHead>
                        <TableHead>Số hợp đồng</TableHead>
                        <TableHead>Ngày ký</TableHead>
                        <TableHead>Nhà cung cấp</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContracts.map((contract) => (
                        <TableRow key={contract.id} className="table-row">
                          <TableCell>
                            <div>
                              <div className="font-medium text-slate-900">
                                {contract.ten || "Chưa có tên"}
                              </div>
                              <div className="text-sm text-slate-500">
                                {contract.moTa || "Không có mô tả"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {contract.soHdNoi || "Chưa có"}
                              </div>
                              {contract.soHdNgoai && (
                                <div className="text-sm text-slate-500">
                                  Ngoài: {contract.soHdNgoai}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(contract.ngay)}</TableCell>
                          <TableCell>
                            {contract.nhaCungCapId
                              ? `NCC-${contract.nhaCungCapId}`
                              : "Chưa xác định"}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(contract.trangThaiHopDongId)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary hover:text-primary/80"
                                onClick={() => handleViewContract(contract)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-slate-800"
                                onClick={() => handleEditContract(contract)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-800"
                                onClick={() =>
                                  handleDeleteContract(contract.id)
                                }
                                disabled={deleteContractMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <ContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedContract && (
        <ContractModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedContract(null);
          }}
          contract={selectedContract}
        />
      )}

      {selectedContract && (
        <ContractViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedContract(null);
          }}
          contract={selectedContract}
        />
      )}
    </div>
  );
}
