import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Search, Plus, Building2, MapPin } from "lucide-react";
import { NhaCungCap, insertNhaCungCapSchema, InsertNhaCungCap } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Suppliers() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: suppliers = [], isLoading } = useQuery<NhaCungCap[]>({
    queryKey: ["/api/nha-cung-cap"],
  });

  const form = useForm<InsertNhaCungCap>({
    resolver: zodResolver(insertNhaCungCapSchema),
    defaultValues: {
      ten: "",
      diaChi: "",
      maQuocGia: "",
      anh: "",
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertNhaCungCap) => {
      return await apiRequest("POST", "/api/nha-cung-cap", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nha-cung-cap"] });
      toast({
        title: "Thành công",
        description: "Nhà cung cấp đã được thêm thành công",
      });
      form.reset();
      setIsCreateModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm nhà cung cấp",
        variant: "destructive",
      });
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/nha-cung-cap/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nha-cung-cap"] });
      toast({
        title: "Thành công",
        description: "Nhà cung cấp đã được xóa",
      });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhà cung cấp",
        variant: "destructive",
      });
    },
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.diaChi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.maQuocGia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteSupplier = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhà cung cấp này?")) {
      deleteSupplierMutation.mutate(id);
    }
  };

  const onSubmit = (data: InsertNhaCungCap) => {
    createSupplierMutation.mutate(data);
  };

  const getCountryFlag = (countryCode: string | null) => {
    if (!countryCode) return "🌐";
    
    const flags: { [key: string]: string } = {
      "VN": "🇻🇳",
      "US": "🇺🇸", 
      "CN": "🇨🇳",
      "JP": "🇯🇵",
      "KR": "🇰🇷",
      "DE": "🇩🇪",
      "FR": "🇫🇷",
      "GB": "🇬🇧",
    };
    
    return flags[countryCode.toUpperCase()] || "🌐";
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý nhà cung cấp"
          subtitle="Quản lý thông tin đối tác và nhà cung cấp"
          onCreateContract={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Danh sách nhà cung cấp</CardTitle>
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm nhà cung cấp
                </Button>
              </div>
              
              <div className="flex items-center space-x-4 mt-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm nhà cung cấp..."
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
              ) : filteredSuppliers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">
                    {searchTerm 
                      ? "Không tìm thấy nhà cung cấp nào phù hợp"
                      : "Chưa có nhà cung cấp nào được thêm"
                    }
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nhà cung cấp</TableHead>
                        <TableHead>Địa chỉ</TableHead>
                        <TableHead>Quốc gia</TableHead>
                        <TableHead>Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers.map((supplier) => (
                        <TableRow key={supplier.id} className="table-row">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Building2 className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  {supplier.ten || "Chưa có tên"}
                                </div>
                                <div className="text-sm text-slate-500">
                                  ID: {supplier.id}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700">
                                {supplier.diaChi || "Chưa có địa chỉ"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="flex items-center space-x-1 w-fit">
                              <span>{getCountryFlag(supplier.maQuocGia)}</span>
                              <span>{supplier.maQuocGia || "Chưa xác định"}</span>
                            </Badge>
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
                                onClick={() => handleDeleteSupplier(supplier.id)}
                                disabled={deleteSupplierMutation.isPending}
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

      {/* Create Supplier Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm nhà cung cấp mới</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="ten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên nhà cung cấp *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên nhà cung cấp" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diaChi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập địa chỉ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="maQuocGia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã quốc gia</FormLabel>
                    <FormControl>
                      <Input placeholder="VN, US, CN..." {...field} />
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
                    <FormLabel>URL ảnh logo</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createSupplierMutation.isPending}>
                  {createSupplierMutation.isPending ? "Đang thêm..." : "Thêm nhà cung cấp"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
