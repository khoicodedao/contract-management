import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertBuocThucHienSchema, InsertBuocThucHien } from "@shared/schema";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress?: any;
  mode?: "create" | "edit" | "view";
}

export default function ProgressModal({
  isOpen,
  onClose,
  progress,
  mode = "create",
}: ProgressModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allProgressSteps = [] } = useQuery<any[]>({
    queryKey: ["/api/buoc-thuc-hien"],
    enabled: !progress, // Only fetch when creating new progress
  });

  const form = useForm<InsertBuocThucHien>({
    resolver: zodResolver(insertBuocThucHienSchema),
    defaultValues: progress
      ? {
          hopDongId: progress.hopDongId || 0,
          ten: progress.ten || "",
          moTa: progress.moTa || "",
          trangThai: progress.trangThai || "",
          ghiChu: progress.ghiChu || "",
          thuTu: progress.thuTu || 1,
          ngayBatDau: progress.ngayBatDau || "",
          ngayKetThuc: progress.ngayKetThuc || "",
          ngayBatDauThucTe: progress.ngayBatDauThucTe || "",
          ngayKetThucThucTe: progress.ngayKetThucThucTe || "",
          canhBao: progress.canhBao || false,
          canBoPhuTrachId: progress.canBoPhuTrachId,
        }
      : {
          hopDongId: 0,
          ten: "",
          moTa: "",
          trangThai: "Chờ thực hiện",
          ghiChu: "",
          thuTu: 1,
          ngayBatDau: "",
          ngayKetThuc: "",
          ngayBatDauThucTe: "",
          ngayKetThucThucTe: "",
          canhBao: false,
        },
  });

  // Auto-calculate next thu_tu when contract is selected
  const selectedContractId = form.watch("hopDongId");

  React.useEffect(() => {
    if (!progress && selectedContractId && allProgressSteps.length > 0) {
      const contractSteps = allProgressSteps.filter(
        (step) => step.hopDongId === selectedContractId
      );
      const maxThuTu = contractSteps.reduce(
        (max, step) => Math.max(max, step.thuTu || 0),
        0
      );
      form.setValue("thuTu", maxThuTu + 1);
    }
  }, [selectedContractId, allProgressSteps, progress, form]);

  const { data: contracts } = useQuery({
    queryKey: ["/api/hop-dong"],
  });

  const { data: staff } = useQuery({
    queryKey: ["/api/can-bo"],
  });

  const createProgressMutation = useMutation({
    mutationFn: async (data: InsertBuocThucHien) => {
      if (progress) {
        return await apiRequest(
          "PUT",
          `/api/buoc-thuc-hien/${progress.id}`,
          data
        );
      } else {
        return await apiRequest("POST", "/api/buoc-thuc-hien", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buoc-thuc-hien"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/system/overview"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/charts"] });
      toast({
        title: "Thành công",
        description: progress
          ? "Tiến độ đã được cập nhật thành công"
          : "Tiến độ đã được tạo thành công",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể lưu tiến độ",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertBuocThucHien) => {
    createProgressMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "view"
              ? "Xem chi tiết tiến độ"
              : mode === "edit"
              ? "Chỉnh sửa tiến độ"
              : "Tạo tiến độ mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hopDongId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số Hợp đồng ngoại</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hợp đồng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contracts?.map((contract: any) => (
                          <SelectItem
                            key={contract.id}
                            value={contract.id.toString()}
                          >
                            {contract.soHdNgoai}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="thuTu"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự (tự động)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        className="bg-gray-50"
                        readOnly={!progress} // Read-only when creating new (auto-calculated)
                      />
                    </FormControl>
                    <FormMessage />
                    {!progress && (
                      <p className="text-xs text-gray-500">
                        Thứ tự sẽ được tự động gán dựa trên hợp đồng được chọn
                      </p>
                    )}
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="ten"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên bước thực hiện</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên bước thực hiện" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="moTa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập mô tả chi tiết..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trangThai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || ""}
                      disabled={mode === "view"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Chờ thực hiện">
                          Chờ thực hiện
                        </SelectItem>
                        <SelectItem value="Đang thực hiện">
                          Đang thực hiện
                        </SelectItem>
                        <SelectItem value="Hoàn thành">Hoàn thành</SelectItem>
                        <SelectItem value="Tạm dừng">Tạm dừng</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canBoPhuTrachId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cán bộ thực hiện</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={mode === "view"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn cán bộ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff?.map((person: any) => (
                          <SelectItem
                            key={person.id}
                            value={person.id.toString()}
                          >
                            {person.ten} - {person.chucVu}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ngayBatDau"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu (Kế hoạch)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ngayKetThuc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc (Kế hoạch)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ngayBatDauThucTe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày bắt đầu (Thực tế)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ngayKetThucThucTe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày kết thúc (Thực tế)</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        disabled={mode === "view"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="chiPhi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chi phí</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập chi phí..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diaDiem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa điểm </FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập địa điểm..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="loaiTienId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Loại Tiền</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại tiền" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        { ten: "VND", id: 3 },
                        { ten: "USD", id: 1 },
                        { ten: "EUR", id: 2 },
                      ]?.map((contract: any) => (
                        <SelectItem
                          key={contract.id}
                          value={contract.id.toString()}
                        >
                          {contract.ten}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ghiChu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nhập ghi chú..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="canhBao"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={mode === "view"}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Cảnh báo khi quá hạn</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {mode === "view" ? "Đóng" : "Hủy"}
              </Button>
              {mode !== "view" && (
                <Button
                  type="submit"
                  disabled={createProgressMutation.isPending}
                >
                  {createProgressMutation.isPending
                    ? "Đang lưu..."
                    : progress
                    ? "Cập nhật"
                    : "Tạo mới"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
