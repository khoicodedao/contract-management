import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTrangBiSchema, InsertTrangBi } from "@shared/schema";

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment?: any;
}

export default function EquipmentModal({ isOpen, onClose, equipment }: EquipmentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertTrangBi>({
    resolver: zodResolver(insertTrangBiSchema),
    defaultValues: equipment ? {
      hopDongId: equipment.hopDongId || 0,
      ten: equipment.ten || "",
      moTa: equipment.moTa || "",
      soLuong: equipment.soLuong || 1,
      donGia: equipment.donGia || "",
      loaiTrangBiId: equipment.loaiTrangBiId,
      trangThai: equipment.trangThai || "",
      ngayMua: equipment.ngayMua || "",
      baoHanh: equipment.baoHanh || "",
    } : {
      hopDongId: 0,
      ten: "",
      moTa: "",
      soLuong: 1,
      donGia: "",
      trangThai: "",
      ngayMua: "",
      baoHanh: "",
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["/api/hop-dong"],
  });

  const { data: equipmentTypes } = useQuery({
    queryKey: ["/api/loai-trang-bi"],
  });

  const createEquipmentMutation = useMutation({
    mutationFn: async (data: InsertTrangBi) => {
      if (equipment) {
        return await apiRequest("PUT", `/api/trang-bi/${equipment.id}`, data);
      } else {
        return await apiRequest("POST", "/api/trang-bi", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trang-bi"] });
      toast({
        title: "Thành công",
        description: equipment ? "Trang bị đã được cập nhật" : "Trang bị đã được tạo",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể lưu trang bị",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTrangBi) => {
    createEquipmentMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{equipment ? "Chỉnh sửa trang bị" : "Thêm trang bị mới"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="hopDongId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hợp đồng</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hợp đồng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contracts?.map((contract: any) => (
                        <SelectItem key={contract.id} value={contract.id.toString()}>
                          {contract.ten}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên trang bị</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên trang bị" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="loaiTrangBiId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại trang bị</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại trang bị" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipmentTypes?.map((type: any) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.ten}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="moTa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập mô tả trang bị..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="soLuong"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Số lượng" 
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="donGia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đơn giá</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập đơn giá" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trangThai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Mới">Mới</SelectItem>
                        <SelectItem value="Đang sử dụng">Đang sử dụng</SelectItem>
                        <SelectItem value="Bảo trì">Bảo trì</SelectItem>
                        <SelectItem value="Hỏng">Hỏng</SelectItem>
                        <SelectItem value="Thanh lý">Thanh lý</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ngayMua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày mua</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="baoHanh"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thời gian bảo hành</FormLabel>
                  <FormControl>
                    <Input placeholder="VD: 12 tháng, 2 năm..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createEquipmentMutation.isPending}>
                {createEquipmentMutation.isPending ? "Đang lưu..." : (equipment ? "Cập nhật" : "Thêm mới")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}