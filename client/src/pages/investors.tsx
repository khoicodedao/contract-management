import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
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
  Building2,
  Users,
  FileText,
  TrendingUp,
} from "lucide-react";
import { ChuDauTu, HopDong } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { InvestorModal } from "@/components/modals/investor-modal";
const getInvesterAvatar = (anh?: string | null) => {
  return anh ? `data:image/jpeg;base64,${anh}` : "/default-avatar.png";
};
export default function InvestorsPage() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedInvestor, setSelectedInvestor] =
    React.useState<ChuDauTu | null>(null);
  const { toast } = useToast();

  const { data: investors = [], isLoading } = useQuery({
    queryKey: ["/api/chu-dau-tu"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/hop-dong"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const filteredInvestors = React.useMemo(() => {
    if (!searchTerm) return investors;
    return investors.filter(
      (investor: ChuDauTu) =>
        investor.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        investor.diaChi?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [investors, searchTerm]);

  const handleEdit = (investor: ChuDauTu) => {
    setSelectedInvestor(investor);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chủ đầu tư này không?")) {
      deleteInvestorMutation.mutate(id);
    }
  };

  const deleteInvestorMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/chu-dau-tu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chu-dau-tu"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hop-dong"] });
      toast({
        title: "Thành công",
        description: "Chủ đầu tư đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa chủ đầu tư",
        variant: "destructive",
      });
    },
  });

  const getContractCount = (investor: ChuDauTu) => {
    return contracts.filter(
      (contract: HopDong) =>
        contract.chuDauTuId === investor.id ||
        contract.chuDauTu === investor.ten
    ).length;
  };

  const getContractValue = (investor: ChuDauTu) => {
    return contracts
      .filter(
        (contract: HopDong) =>
          contract.chuDauTuId === investor.id ||
          contract.chuDauTu === investor.ten
      )
      .reduce(
        (sum: number, contract: HopDong) => sum + (contract.giaTriHopDong || 0),
        0
      );
  };

  const totalContracts = contracts.length;
  const totalValue = contracts.reduce(
    (sum: number, contract: HopDong) => sum + (contract.giaTriHopDong || 0),
    0
  );
  const activeInvestors = investors.filter(
    (investor: ChuDauTu) => getContractCount(investor) > 0
  ).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý chủ đầu tư"
          subtitle="Quản lý thông tin các chủ đầu tư và thống kê hợp đồng"
          onCreateContract={() => {}}
        />

        <main className="flex-1 overflow-auto p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Tổng chủ đầu tư
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {investors.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Đang hợp tác
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {activeInvestors}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Tổng hợp đồng
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {totalContracts}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">
                      Tổng giá trị
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {formatCurrency(totalValue).replace("₫", "VNĐ")}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Danh sách chủ đầu tư</CardTitle>
                <Button
                  onClick={() => {
                    setSelectedInvestor(null);
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm chủ đầu tư
                </Button>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm chủ đầu tư..."
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
              ) : filteredInvestors.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-500">
                    {searchTerm
                      ? "Không tìm thấy chủ đầu tư nào"
                      : "Chưa có chủ đầu tư nào"}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên chủ đầu tư</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Số lượng hợp đồng</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvestors.map((investor: ChuDauTu) => {
                      const contractCount = getContractCount(investor);
                      const contractValue = getContractValue(investor);

                      return (
                        <TableRow key={investor.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                {investor.anh?.length > 0 ? (
                                  <img
                                    src={getInvesterAvatar(investor.anh)}
                                    alt="avatar"
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <Building2 className="w-5 h-5 text-blue-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {investor.ten}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{investor.diaChi || "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-blue-50">
                              {contractCount} hợp đồng
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(investor)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(investor.id!)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <InvestorModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvestor(null);
        }}
        investor={selectedInvestor}
      />
    </div>
  );
}
