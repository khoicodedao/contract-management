import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Trash2, Filter } from "lucide-react";
import { HopDong } from "@shared/schema";
import {
  CONTRACT_STATUS_LABELS,
  CONTRACT_STATUS_COLORS,
} from "@/lib/constants";
import { useState } from "react";

interface ContractTableProps {
  contracts?: HopDong[];
  isLoading: boolean;
}

export default function ContractTable({
  contracts = [],
  isLoading,
}: ContractTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredContracts = contracts.filter((contract) => {
    if (statusFilter === "all") return true;
    return contract.trangThaiHopDongId?.toString() === statusFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Hợp đồng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Hợp đồng gần đây
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="1">Đang thực hiện</SelectItem>
                <SelectItem value="2">Hoàn thành</SelectItem>
                <SelectItem value="3">Tạm dừng</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredContracts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Không có hợp đồng nào để hiển thị</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hợp đồng</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày ký</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id} className="table-row">
                    <TableCell>
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {contract.ten || "Chưa có tên"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {contract.soHdNoi || "Chưa có số HĐ"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900">
                        {contract.nhaCungCapId
                          ? `NCC-${contract.nhaCungCapId}`
                          : "Chưa xác định"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-slate-900">
                        {formatDate(contract.ngay)}
                      </div>
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
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-600 hover:text-slate-800"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-800"
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

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-700">
            Hiển thị <strong>1</strong> đến{" "}
            <strong>{Math.min(filteredContracts.length, 10)}</strong> trong tổng
            số <strong>{filteredContracts.length}</strong> kết quả
          </p>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" disabled>
              Trước
            </Button>
            <Button variant="default" size="sm">
              1
            </Button>
            <Button variant="ghost" size="sm">
              2
            </Button>
            <Button variant="ghost" size="sm">
              3
            </Button>
            <Button variant="ghost" size="sm">
              Sau
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
