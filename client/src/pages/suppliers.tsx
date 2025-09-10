"use client";
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
import { Edit, Trash2, Search, Plus } from "lucide-react";
import {
  NhaCungCap,
  insertNhaCungCapSchema,
  InsertNhaCungCap,
} from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import getCountryFlag from "@/lib/getCountryFlag";

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

// Danh sách quốc gia (ISO 3166)
const countries = [
  { name: "Vietnam", code: "VN" },
  { name: "United States", code: "US" },
  { name: "France", code: "FR" },
  { name: "Germany", code: "DE" },
  { name: "China", code: "CN" },
  { name: "Japan", code: "JP" },
  { name: "India", code: "IN" },
  { name: "Russia", code: "RU" },
  { name: "United Kingdom", code: "GB" },
  { name: "South Korea", code: "KR" },
  { name: "Thailand", code: "TH" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "Brazil", code: "BR" },
  { name: "Indonesia", code: "ID" },
  { name: "Singapore", code: "SG" },
  { name: "Malaysia", code: "MY" },
  { name: "Philippines", code: "PH" },
  { name: "Mexico", code: "MX" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "Netherlands", code: "NL" },
  { name: "Argentina", code: "AR" },
  { name: "Turkey", code: "TR" },
  { name: "Sweden", code: "SE" },
  { name: "Norway", code: "NO" },
  { name: "Switzerland", code: "CH" },
  { name: "Poland", code: "PL" },
  { name: "Portugal", code: "PT" },
  { name: "South Africa", code: "ZA" },
  { name: "New Zealand", code: "NZ" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "United Arab Emirates", code: "AE" },
  { name: "Qatar", code: "QA" },
];

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
      toast({ title: "Thành công", description: "Đã thêm nhà cung cấp" });
      form.reset();
      setSelectedImage(null);
      setIsCreateModalOpen(false);
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
      toast({ title: "Thành công", description: "Đã cập nhật nhà cung cấp" });
      form.reset();
      setSelectedImage(null);
      setEditingSupplier(null);
      setIsEditModalOpen(false);
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/nha-cung-cap/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/nha-cung-cap"] });
      toast({ title: "Thành công", description: "Đã xóa nhà cung cấp" });
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
                          <div className="flex items-center space-x-2">
                            <img
                              src={getCountryFlag(supplier.maQuocGia)}
                              alt={supplier.maQuocGia}
                              width={24}
                              height={18}
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

      {/* Modal */}
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
              {editingSupplier ? "Cập nhật nhà cung cấp" : "Thêm nhà cung cấp"}
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

              {/* Chọn quốc gia */}
              <FormField
                control={form.control}
                name="diaChi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quốc gia</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border rounded text-sm"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          const found = countries.find(
                            (c) => c.name === e.target.value
                          );
                          if (found) {
                            form.setValue("maQuocGia", found.code);
                          }
                        }}
                      >
                        <option value="">-- Chọn quốc gia --</option>
                        {countries.map((c) => (
                          <option key={c.code} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tự động điền mã quốc gia */}
              <FormField
                control={form.control}
                name="maQuocGia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã quốc gia</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
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
                      : "Cập nhật"
                    : createSupplierMutation.isPending
                    ? "Đang thêm..."
                    : "Thêm mới"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
