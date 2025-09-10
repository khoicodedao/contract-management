"use client";

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
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import { CapTien, HopDong, LoaiTien } from "@shared/schema";
import CapTienModal from "@/components/modals/supply_money-modal";

export default function CapTienPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view" | null>(
    null
  );
  const [selectedRecord, setSelectedRecord] = useState<CapTien | null>(null);

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

  const formatCurrency = (amount: number, loaiTienId: number) => {
    const code = loaiTien.find((lt) => lt.id === loaiTienId)?.ten || "VND";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: code,
    }).format(amount);
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
                        <TableHead>Số tiền</TableHead>
                        <TableHead>Tỷ giá</TableHead>
                        <TableHead>Ghi chú</TableHead>
                        <TableHead></TableHead>
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
                            {formatCurrency(record.soTien, record.loaiTienId)}
                          </TableCell>
                          <TableCell>{record.tyGia ?? "-"}</TableCell>
                          <TableCell>{record.ghiChu}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <IconBtn
                                icon={<Eye />}
                                onClick={() => handleOpenModal("view", record)}
                              />
                              <IconBtn
                                icon={<Edit />}
                                onClick={() => handleOpenModal("edit", record)}
                              />
                              <IconBtn
                                icon={<Trash2 />}
                                onClick={() => handleDelete(record.id)}
                                className="text-red-600"
                              />
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
