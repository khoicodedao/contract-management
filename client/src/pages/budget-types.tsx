import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";

interface LoaiNganSach {
  id: number;
  ten: string;
}

export default function BudgetTypes() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingBudgetType, setEditingBudgetType] =
    useState<LoaiNganSach | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgetTypes = [] } = useQuery<LoaiNganSach[]>({
    queryKey: ["/api/loai-ngan-sach"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<LoaiNganSach, "id">) => {
      await apiRequest("POST", "/api/loai-ngan-sach", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loai-ngan-sach"] });
      setIsCreateOpen(false);
      toast({ description: "Đã tạo loại ngân sách thành công" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Lỗi khi tạo loại ngân sách",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: LoaiNganSach) => {
      await apiRequest("PUT", `/api/loai-ngan-sach/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loai-ngan-sach"] });
      setIsEditOpen(false);
      setEditingBudgetType(null);
      toast({ description: "Đã cập nhật loại ngân sách thành công" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Lỗi khi cập nhật loại ngân sách",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/loai-ngan-sach/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loai-ngan-sach"] });
      toast({ description: "Đã xóa loại ngân sách thành công" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Lỗi khi xóa loại ngân sách",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data = {
      ten: formData.get("ten") as string,
    };

    if (editingBudgetType) {
      updateMutation.mutate({ ...data, id: editingBudgetType.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (budgetType: LoaiNganSach) => {
    setEditingBudgetType(budgetType);
    setIsEditOpen(true);
  };

  const openCreateDialog = () => {
    setEditingBudgetType(null);
    setIsCreateOpen(true);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý loại ngân sách"
          subtitle="Quản lý các loại ngân sách trong hệ thống"
          onCreateContract={() => {}}
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={openCreateDialog}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm loại ngân sách
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm loại ngân sách mới</DialogTitle>
                      <DialogDescription>
                        Nhập thông tin loại ngân sách mới
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ten">Tên loại ngân sách</Label>
                        <Input
                          id="ten"
                          name="ten"
                          placeholder="Nhập tên loại ngân sách"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateOpen(false)}
                        >
                          Hủy
                        </Button>
                        <Button type="submit">Tạo</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tổng loại ngân sách
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {budgetTypes.length}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Các loại ngân sách trong hệ thống
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Danh sách loại ngân sách</CardTitle>
                  <CardDescription>
                    Quản lý các loại ngân sách có thể sử dụng cho hợp đồng
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tên loại ngân sách</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {budgetTypes.map((budgetType) => (
                        <TableRow key={budgetType.id}>
                          <TableCell>
                            <Badge variant="outline">{budgetType.id}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {budgetType.ten}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(budgetType)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteMutation.mutate(budgetType.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Edit Dialog */}
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa loại ngân sách</DialogTitle>
                    <DialogDescription>
                      Cập nhật thông tin loại ngân sách
                    </DialogDescription>
                  </DialogHeader>
                  {editingBudgetType && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="ten">Tên loại ngân sách</Label>
                        <Input
                          id="ten"
                          name="ten"
                          defaultValue={editingBudgetType.ten}
                          placeholder="Nhập tên loại ngân sách"
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                        >
                          Hủy
                        </Button>
                        <Button type="submit">Cập nhật</Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
