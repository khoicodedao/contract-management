import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ChuDauTu, insertChuDauTuSchema, InsertChuDauTu } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface InvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor?: ChuDauTu | null;
}

export function InvestorModal({ isOpen, onClose, investor }: InvestorModalProps) {
  const { toast } = useToast();
  const isEditing = Boolean(investor);

  const form = useForm<InsertChuDauTu>({
    resolver: zodResolver(insertChuDauTuSchema),
    defaultValues: {
      ten: investor?.ten || "",
      diaChi: investor?.diaChi || "",
      soDienThoai: investor?.soDienThoai || "",
      email: investor?.email || "",
      nguoiDaiDien: investor?.nguoiDaiDien || "",
      chucVuNguoiDaiDien: investor?.chucVuNguoiDaiDien || "",
      moTa: investor?.moTa || "",
    },
  });

  React.useEffect(() => {
    if (investor) {
      form.reset({
        ten: investor.ten || "",
        diaChi: investor.diaChi || "",
        soDienThoai: investor.soDienThoai || "",
        email: investor.email || "",
        nguoiDaiDien: investor.nguoiDaiDien || "",
        chucVuNguoiDaiDien: investor.chucVuNguoiDaiDien || "",
        moTa: investor.moTa || "",
      });
    } else {
      form.reset({
        ten: "",
        diaChi: "",
        soDienThoai: "",
        email: "",
        nguoiDaiDien: "",
        chucVuNguoiDaiDien: "",
        moTa: "",
      });
    }
  }, [investor, form]);

  const createMutation = useMutation({
    mutationFn: async (data: InsertChuDauTu) => {
      return await apiRequest("POST", "/api/chu-dau-tu", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chu-dau-tu"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hop-dong"] });
      toast({
        title: "Thành công",
        description: "Chủ đầu tư đã được tạo",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo chủ đầu tư",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertChuDauTu) => {
      return await apiRequest("PUT", `/api/chu-dau-tu/${investor!.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chu-dau-tu"] });
      queryClient.invalidateQueries({ queryKey: ["/api/hop-dong"] });
      toast({
        title: "Thành công",
        description: "Chủ đầu tư đã được cập nhật",
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật chủ đầu tư",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertChuDauTu) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Chỉnh sửa chủ đầu tư" : "Thêm chủ đầu tư mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ten">Tên chủ đầu tư *</Label>
              <Input
                id="ten"
                {...form.register("ten")}
                placeholder="Nhập tên chủ đầu tư"
              />
              {form.formState.errors.ten && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.ten.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="soDienThoai">Số điện thoại</Label>
              <Input
                id="soDienThoai"
                {...form.register("soDienThoai")}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="diaChi">Địa chỉ</Label>
            <Input
              id="diaChi"
              {...form.register("diaChi")}
              placeholder="Nhập địa chỉ"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Nhập email"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nguoiDaiDien">Người đại diện</Label>
              <Input
                id="nguoiDaiDien"
                {...form.register("nguoiDaiDien")}
                placeholder="Nhập tên người đại diện"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chucVuNguoiDaiDien">Chức vụ người đại diện</Label>
              <Input
                id="chucVuNguoiDaiDien"
                {...form.register("chucVuNguoiDaiDien")}
                placeholder="Nhập chức vụ"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="moTa">Mô tả</Label>
            <Textarea
              id="moTa"
              {...form.register("moTa")}
              placeholder="Nhập mô tả về chủ đầu tư"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang xử lý..." : isEditing ? "Cập nhật" : "Tạo mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}