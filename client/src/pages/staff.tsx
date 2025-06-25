import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Edit, Trash2, Search, Plus, User, Upload, X } from "lucide-react";
import { CanBo, insertCanBoSchema, InsertCanBo } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Staff() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<CanBo | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery<CanBo[]>({
    queryKey: ["/api/can-bo"],
  });

  const form = useForm<InsertCanBo>({
    resolver: zodResolver(insertCanBoSchema),
    defaultValues: {
      ten: "",
      chucVu: "",
      anh: "",
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (data: InsertCanBo) => {
      let finalData = { ...data };
      
      if (selectedImage) {
        try {
          const base64Content = await imageToBase64(selectedImage);
          finalData = {
            ...finalData,
            anh: base64Content,
          };
        } catch (error) {
          throw new Error("Không thể xử lý ảnh");
        }
      }
      
      if (selectedStaff) {
        return await apiRequest("PUT", `/api/can-bo/${selectedStaff.id}`, finalData);
      } else {
        return await apiRequest("POST", "/api/can-bo", finalData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/can-bo"] });
      toast({
        title: "Thành công",
        description: "Cán bộ đã được thêm thành công",
      });
      form.reset();
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm cán bộ",
        variant: "destructive",
      });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/can-bo/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/can-bo"] });
      toast({
        title: "Thành công",
        description: "Cán bộ đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa cán bộ",
        variant: "destructive",
      });
    },
  });

  const filteredStaff = staff.filter(member =>
    member.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.chucVu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteStaff = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa cán bộ này?")) {
      deleteStaffMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertCanBo) => {
    createStaffMutation.mutate(data);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý cán bộ"
          subtitle="Quản lý thông tin và phân quyền cán bộ"
          onCreateContract={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách cán bộ</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm cán bộ
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm cán bộ..."
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
                    <div key={i} className="h-16 bg-slate-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">
                    {searchTerm 
                      ? "Không tìm thấy cán bộ nào phù hợp"
                      : "Chưa có cán bộ nào được thêm"
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cán bộ</TableHead>
                        <TableHead>Chức vụ</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((member) => (
                        <TableRow key={member.id} className="table-row">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarImage src={member.anh || undefined} />
                                <AvatarFallback>
                                  {member.ten ? getInitials(member.ten) : <User className="w-4 h-4" />}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {member.ten || "Chưa có tên"}
                                </div>
                                <div className="text-sm text-slate-500">
                                  ID: {member.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {member.chucVu || "Chưa xác định"}
                            </span>
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
                                onClick={() => handleDeleteStaff(member.id)}
                                disabled={deleteStaffMutation.isPending}
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

      {/* Create Staff Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm cán bộ mới</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên cán bộ *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên cán bộ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chucVu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chức vụ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập chức vụ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL ảnh</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/avatar.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createStaffMutation.isPending}>
                  {createStaffMutation.isPending ? "Đang thêm..." : "Thêm cán bộ"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
