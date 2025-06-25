import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit, Trash2, Search, Plus, CheckSquare, AlertTriangle, Clock, Calendar } from "lucide-react";
import { BuocThucHien } from "@shared/schema";
import { PROGRESS_STATUS_COLORS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import React from "react";
import ProgressModal from "@/components/modals/progress-modal";

export default function ProgressPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProgress, setSelectedProgress] = useState<BuocThucHien | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: progressSteps = [], isLoading } = useQuery<BuocThucHien[]>({
    queryKey: ["/api/buoc-thuc-hien"],
    refetchOnWindowFocus: true,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["/api/hop-dong"],
  });

  // Group progress by contract
  const progressByContract = React.useMemo(() => {
    if (!progressSteps.length || !contracts.length) return [];
    
    const contractGroups = contracts.map(contract => {
      const contractSteps = progressSteps.filter(step => step.hopDongId === contract.id);
      return {
        contract,
        steps: contractSteps
      };
    });
    
    return contractGroups.filter(group => group.steps.length > 0);
  }, [progressSteps, contracts]);

  const handleEditStep = (step: BuocThucHien) => {
    setSelectedProgress(step);
    setIsEditModalOpen(true);
  };

  const handleViewStep = (step: BuocThucHien) => {
    setSelectedProgress(step);
    setIsViewModalOpen(true);
  };

  const handleDeleteStep = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bước thực hiện này không?")) {
      deleteProgressMutation.mutate(id);
    }
  };

  const deleteProgressMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/buoc-thuc-hien/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buoc-thuc-hien"] });
      toast({
        title: "Thành công",
        description: "Tiến độ đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa tiến độ",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('vi-VN');
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return <CheckSquare className="h-5 w-5 text-green-600" />;
      case "Đang thực hiện":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "Chờ thực hiện":
        return <Clock className="h-5 w-5 text-orange-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoàn thành":
        return "bg-green-100 text-green-800";
      case "Đang thực hiện":
        return "bg-blue-100 text-blue-800";
      case "Chờ thực hiện":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const completedSteps = progressSteps.filter(step => step.trangThai === "hoàn thành").length;
  const inProgressSteps = progressSteps.filter(step => step.trangThai === "đang thực hiện").length;
  const overdueSteps = progressSteps.filter(step => step.canhBao).length;

  // Filter steps based on search query
  const filteredSteps = React.useMemo(() => {
    if (!searchTerm) return progressSteps;
    return progressSteps.filter(step =>
      step.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      step.moTa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [progressSteps, searchTerm]);

  const getStatusBadge = (status: string | null, isWarning: boolean | null) => {
    if (!status) return null;
    
    const statusColors = {
      "hoàn thành": "bg-green-100 text-green-800", 
      "đang thực hiện": "bg-blue-100 text-blue-800",
      "chưa thực hiện": "bg-gray-100 text-gray-800",
      "chờ thực hiện": "bg-yellow-100 text-yellow-800",
      "tạm dừng": "bg-orange-100 text-orange-800",
      "quá hạn": "bg-red-100 text-red-800"
    };
    
    const color = statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
    
    return (
      <div className="flex items-center space-x-2">
        <Badge className={color}>
          {status}
        </Badge>
        {isWarning && (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        )}
      </div>
    );
  };

  const handleViewProgress = (step: BuocThucHien) => {
    setSelectedProgress(step);
    setIsViewModalOpen(true);
  };

  const handleEditProgress = (step: BuocThucHien) => {
    setSelectedProgress(step);
    setIsEditModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/buoc-thuc-hien/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buoc-thuc-hien"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({ description: "Đã xóa bước tiến độ thành công" });
    },
    onError: () => {
      toast({ variant: "destructive", description: "Lỗi khi xóa bước tiến độ" });
    },
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý tiến độ"
          subtitle="Theo dõi tiến độ thực hiện các bước trong hợp đồng"
          onCreateContract={() => {}}
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Tổng bước</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {progressSteps.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Đang thực hiện</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {inProgressSteps}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Hoàn thành</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {completedSteps}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-600">Có cảnh báo</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2">
                      {overdueSteps}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tiến độ thực hiện</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm bước thực hiện
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm bước thực hiện..."
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
                    <SelectItem value="chưa thực hiện">Chưa thực hiện</SelectItem>
                    <SelectItem value="đang thực hiện">Đang thực hiện</SelectItem>
                    <SelectItem value="hoàn thành">Hoàn thành</SelectItem>
                    <SelectItem value="quá hạn">Quá hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredSteps.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                  <p className="text-slate-500">
                    {searchTerm || statusFilter !== "all"
                      ? "Không tìm thấy bước thực hiện nào phù hợp"
                      : "Chưa có bước thực hiện nào được thêm"
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Bước thực hiện</TableHead>
                        <TableHead>Hợp đồng</TableHead>
                        <TableHead>Tiến độ</TableHead>
                        <TableHead>Ngày bắt đầu</TableHead>
                        <TableHead>Ngày kết thúc</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSteps.map((step) => {
                        const progressPercentage = getProgressPercentage(step);
                        
                        return (
                          <TableRow key={step.id} className="table-row">
                            <TableCell>
                              <div>
                                <div className="font-medium text-slate-900 flex items-center space-x-2">
                                  <span>#{step.thuTu || "-"}</span>
                                  <span>{step.ten || "Chưa có tên"}</span>
                                </div>
                                <div className="text-sm text-slate-500">
                                  {step.moTa || "Không có mô tả"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {step.hopDongId ? `HD-${step.hopDongId}` : "Chưa gán"}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-2">
                                <Progress value={progressPercentage} className="h-2" />
                                <div className="text-xs text-slate-500">
                                  {Math.round(progressPercentage)}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(step.ngayBatDau)}</TableCell>
                            <TableCell>{formatDate(step.ngayKetThuc)}</TableCell>
                            <TableCell>
                              {getStatusBadge(step.trangThai, step.canhBao)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary hover:text-primary/80"
                                  onClick={() => handleViewProgress(step)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-600 hover:text-slate-800"
                                  onClick={() => handleEditProgress(step)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-800"
                                  onClick={() => handleDeleteProgress(step.id)}
                                  disabled={deleteProgressMutation.isPending}
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
        <ProgressModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
        
        {selectedProgress && (
          <ProgressModal 
            isOpen={isEditModalOpen} 
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedProgress(null);
            }}
            progress={selectedProgress}
          />
        )}

        {selectedProgress && (
          <ProgressModal 
            isOpen={isViewModalOpen} 
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedProgress(null);
            }}
            progress={selectedProgress}
            viewOnly={true}
          />
        )}
        {/* Modals */}
        <ProgressModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        <ProgressModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedProgress(null);
          }}
          progress={selectedProgress}
          mode="view"
        />

        <ProgressModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProgress(null);
          }}
          progress={selectedProgress}
          mode="edit"
        />
      </div>
    </div>
  );
}
