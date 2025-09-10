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
import { Eye, Edit, Trash2, Search, Plus, Package } from "lucide-react";
import { TrangBi } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EquipmentModal from "@/components/modals/equipment-modal";

export default function Equipment() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<TrangBi | null>(
    null
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading } = useQuery<TrangBi[]>({
    queryKey: ["/api/trang-bi"],
  });
  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/hop-dong"],
  });

  const { data: nhaCungCap } = useQuery({
    queryKey: ["/api/nha-cung-cap"],
  });
  const deleteEquipmentMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/trang-bi/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trang-bi"] });
      toast({
        title: "Thành công",
        description: "Trang bị đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa trang bị",
        variant: "destructive",
      });
    },
  });

  const handleEditEquipment = (equipment: TrangBi) => {
    setSelectedEquipment(equipment);
    setIsEditModalOpen(true);
  };

  const handleDeleteEquipment = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trang bị này không?")) {
      deleteEquipmentMutation.mutate(id);
    }
  };

  const filteredEquipment = equipment.filter((item) =>
    item.ten?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: string | null, currencyId: number | null) => {
    if (!amount || !currencyId) return "-";
    const value = parseFloat(amount);

    // map id sang mã tiền tệ ISO 4217
    const currencyMap: Record<number, string> = {
      1: "USD",
      2: "EUR",
      3: "VND",
    };

    const currencyCode = currencyMap[currencyId] || "VND";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currencyCode,
    }).format(value);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý trang bị"
          subtitle="Theo dõi thiết bị và trang bị trong các hợp đồng"
          onCreateContract={() => {}}
        />

        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách trang bị</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm trang bị
                </Button>
              </div>

              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm trang bị..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
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
              ) : filteredEquipment.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-500">
                    {searchTerm
                      ? "Không tìm thấy trang bị nào phù hợp"
                      : "Chưa có trang bị nào được thêm"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tên trang bị</TableHead>
                        <TableHead>Loại</TableHead>
                        <TableHead>Đơn giá</TableHead>
                        <TableHead>Nhà cung cấp</TableHead>
                        <TableHead>Hợp đồng</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEquipment.map((item) => (
                        <TableRow key={item.id} className="table-row">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {item.ten || "Chưa có tên"}
                                </div>
                                <div className="text-sm text-slate-500">
                                  ID: {item.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.loaiTrangBiId
                                ? `Loại ${item.loaiTrangBiId}`
                                : "Chưa phân loại"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">
                              {/* @ts-ignore */}
                              {formatCurrency(item.donGia, item.loaiTienId)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.nhaCungCapId
                              ? nhaCungCap.find(
                                  (ncc: any) => ncc.id === item.nhaCungCapId
                                )?.ten || `NCC-${item.nhaCungCapId}`
                              : "Chưa xác định"}
                          </TableCell>
                          <TableCell>
                            {
                              contracts.find(
                                (contract) => contract.id === item.hopDongId
                              )?.soHdNgoai
                            }
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-600 hover:text-slate-800"
                                onClick={() => handleEditEquipment(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-600 hover:text-red-800"
                                onClick={() => handleDeleteEquipment(item.id)}
                                disabled={deleteEquipmentMutation.isPending}
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

        <EquipmentModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {selectedEquipment && (
          <EquipmentModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedEquipment(null);
            }}
            equipment={selectedEquipment}
          />
        )}
      </div>
    </div>
  );
}
