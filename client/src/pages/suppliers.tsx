import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Plus,
  Building2,
  MapPin,
} from "lucide-react";
import {
  NhaCungCap,
  insertNhaCungCapSchema,
  InsertNhaCungCap,
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const imageToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result?.toString().split(",")[1];
      resolve(base64 || "");
    };
    reader.onerror = (error) => reject(error);
  });

import getCountryFlag from "@/lib/getCountryFlag";
export default function Suppliers() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<NhaCungCap | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
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
      latitude: null,
      longitude: null,
    },
  });

  const createSupplierMutation = useMutation({
    mutationFn: async (data: InsertNhaCungCap) => {
      let finalData = { ...data };
      if (selectedImage) {
        const base64Content = await imageToBase64(selectedImage);
        finalData.anh = base64Content;
      }
      return await apiRequest("POST", "/api/nha-cung-cap", finalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nha-cung-cap"] });
      toast({
        title: "Thành công",
        description: "Nhà cung cấp đã được thêm thành công",
      });
      form.reset();
      setSelectedImage(null);
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

  const updateSupplierMutation = useMutation({
    mutationFn: async (data: NhaCungCap) => {
      let finalData = { ...data };
      if (selectedImage) {
        const base64Content = await imageToBase64(selectedImage);
        finalData.anh = base64Content;
      }
      return await apiRequest("PUT", `/api/nha-cung-cap/${data.id}`, finalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nha-cung-cap"] });
      toast({
        title: "Cập nhật thành công",
        description: "Thông tin nhà cung cấp đã được cập nhật",
      });
      form.reset();
      setSelectedImage(null);
      setEditingSupplier(null);
      setIsEditModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật nhà cung cấp",
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
      toast({ title: "Thành công", description: "Nhà cung cấp đã được xóa" });
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể xóa nhà cung cấp",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (supplier: NhaCungCap) => {
    form.reset({
      ten: supplier.ten,
      diaChi: supplier.diaChi || "",
      maQuocGia: supplier.maQuocGia || "",
      anh: supplier.anh || "",
      latitude: supplier.latitude || null,
      longitude: supplier.longitude || null,
    });
    setEditingSupplier(supplier);
    setIsEditModalOpen(true);
    setSelectedImage(null);
  };

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
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
    if (editingSupplier) {
      updateSupplierMutation.mutate({ ...editingSupplier, ...data });
    } else {
      createSupplierMutation.mutate(data);
    }
  };

  const getSupplierAvatar = (anh?: string | null) => {
    return anh ? `data:image/jpeg;base64,${anh}` : "/default-avatar.png";
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
                <p>Đang tải...</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ảnh</TableHead>
                      <TableHead>Tên</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Quốc gia</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <img
                            src={getSupplierAvatar(supplier.anh)}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </TableCell>
                        <TableCell>{supplier.ten}</TableCell>
                        <TableCell>{supplier.diaChi}</TableCell>
                        <TableCell>
                          <div className="flex justify-center items-center">
                            {" "}
                            <img
                              src={getCountryFlag(supplier.maQuocGia)}
                              alt="Singapore flag"
                              width={40}
                              height={30}
                            />
                            {supplier.maQuocGia}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(supplier)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSupplier(supplier.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Modal for Create/Edit */}
      <Dialog
        open={isCreateModalOpen || isEditModalOpen}
        onOpenChange={(open) => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          if (!open) {
            setEditingSupplier(null);
            form.reset();
            setSelectedImage(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSupplier
                ? "Cập nhật nhà cung cấp"
                : "Thêm nhà cung cấp mới"}
            </DialogTitle>
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
                    <FormLabel>Địa chỉ (Quốc gia)</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border rounded text-sm"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <option value="">Chọn quốc gia</option>
                        <option value="Vietnam">Vietnam</option>
                        <option value="United States of America">
                          United States
                        </option>
                        <option value="France">France</option>
                        <option value="Germany">Germany</option>
                        <option value="China">China</option>
                        <option value="Japan">Japan</option>
                        <option value="India">India</option>
                        <option value="Russia">Russia</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="South Korea">South Korea</option>
                        <option value="Thailand">Thailand</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Brazil">Brazil</option>
                        <option value="Indonesia">Indonesia</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Malaysia">Malaysia</option>
                        <option value="Philippines">Philippines</option>
                        <option value="Mexico">Mexico</option>
                        <option value="Italy">Italy</option>
                        <option value="Spain">Spain</option>
                        <option value="Netherlands">Netherlands</option>
                      </select>
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
              <FormItem>
                <FormLabel>Ảnh logo (tùy chọn)</FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                  />
                </FormControl>
                {editingSupplier?.anh && !selectedImage && (
                  <img
                    src={`data:image/jpeg;base64,${editingSupplier.anh}`}
                    alt="Ảnh hiện tại"
                    className="mt-2 w-20 h-20 object-cover rounded"
                  />
                )}
              </FormItem>
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vĩ độ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Vĩ độ..."
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kinh độ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Kinh độ..."
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createSupplierMutation.isPending ||
                    updateSupplierMutation.isPending
                  }
                >
                  {editingSupplier
                    ? updateSupplierMutation.isPending
                      ? "Đang cập nhật..."
                      : "Cập nhật nhà cung cấp"
                    : createSupplierMutation.isPending
                    ? "Đang thêm..."
                    : "Thêm nhà cung cấp"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
