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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  insertThanhToanSchema,
  InsertThanhToan,
  loaiTien,
} from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { BuocThucHien } from "@shared/schema";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment?: any;
}

export default function PaymentModal({
  isOpen,
  onClose,
  payment,
}: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const form = useForm<InsertThanhToan>({
    resolver: zodResolver(insertThanhToanSchema),
    defaultValues: payment
      ? {
          hopDongId: payment.hopDongId || 0,
          loaiTienId: payment.loaiTienId,
          loaiHinhThucThanhToanId: payment.loaiHinhThucThanhToanId,
          loaiThanhToanId: payment.loaiThanhToanId,
          noiDung: payment.noiDung || "",
          hanHopDong: payment.hanHopDong || "",
          hanThucHien: payment.hanThucHien || "",
          soTien: payment.soTien || "",
          daThanhToan: payment.daThanhToan ?? false, // ✅ Thêm dòng này
        }
      : {
          hopDongId: 0,
          noiDung: "",
          hanHopDong: "",
          hanThucHien: "",
          soTien: "",
          daThanhToan: false, // ✅ Thêm dòng này
        },
  });

  const { data: contracts } = useQuery({
    queryKey: ["/api/hop-dong"],
  });

  const { data: currencies } = useQuery({
    queryKey: ["/api/loai-tien"],
  });

  const { data: paymentMethods } = useQuery({
    queryKey: ["/api/loai-hinh-thuc-thanh-toan"],
  });

  const { data: paymentTypes } = useQuery({
    queryKey: ["/api/loai-thanh-toan"],
  });
  const { data: steps = [] } = useQuery<BuocThucHien[]>({
    queryKey: ["/api/buoc-thuc-hien"],
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: InsertThanhToan) => {
      if (payment) {
        return await apiRequest("PUT", `/api/thanh-toan/${payment.id}`, data);
      } else {
        return await apiRequest("POST", "/api/thanh-toan", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/thanh-toan"] });
      toast({
        title: "Thành công",
        description: payment
          ? "Thanh toán đã được cập nhật"
          : "Thanh toán đã được tạo",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể lưu thanh toán",
        variant: "destructive",
      });
    },
  });
  const getContractName = (hopDongId: number) => {
    const contract = contracts.find((c) => c.id === hopDongId);
    return contract?.ten || `Hợp đồng #${hopDongId}`;
  };
  const createProgressMutation = useMutation({
    mutationFn: async (data: Omit<InsertThanhToan, "id">) => {
      const constract = contracts.find((c) => c.id === data.hopDongId);
      const thuTuMax = steps
        .filter((item) => item.hopDongId === data.hopDongId)
        .reduce((max, item) => {
          return item.thuTu > max ? item.thuTu : max;
        }, 0);
      const thuTu = thuTuMax + 1;
      const progressData = {
        hopDongId: data.hopDongId,
        ten: data.noiDung,
        moTa: `Thanh toán số tiền  ${data.soTien} ${
          loaiTien.find((t) => t.id === data.loaiTienId)?.ten
        } hợp đồng ${getContractName(data.hopDongId)} `,
        ngayBatDau: data.ngayDenHan,
        ngayKetThuc: data.hanThucHien,
        ngayBatDauThucTe: data.hanThucHien,
        ngayKetThucThucTe: data.hanThucHien,
        trangThai: "Hoàn thành",
        thuTu: thuTu,
        canBoPhuTrachId: constract?.canBoId || 1,
      };
      await apiRequest("POST", "/api/buoc-thuc-hien", progressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/buoc-thuc-hien"] });
      // setIsCreateOpen(false);
      // toast({ description: "Đã tạo bản ghi tiếp nhận thành công" });
    },
    onError: () => {
      // toast({
      //   variant: "destructive",
      //   description: "Lỗi khi tạo bản ghi tiếp nhận",
      // });
    },
  });
  const onSubmit = (data: InsertThanhToan) => {
    createPaymentMutation.mutate(data);
    createProgressMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {payment ? "Chỉnh sửa thanh toán" : "Tạo thanh toán mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              name="noiDung"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung thanh toán</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung thanh toán..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                name="soTien"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số tiền</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Nhập số tiền"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
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
                    <FormLabel>Loại tiền</FormLabel>
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
                        {currencies?.map((currency: any) => (
                          <SelectItem
                            key={currency.id}
                            value={currency.id.toString()}
                          >
                            {currency.ten}
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
                name="loaiHinhThucThanhToanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình thức thanh toán</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hình thức" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods?.map((method: any) => (
                          <SelectItem
                            key={method.id}
                            value={method.id.toString()}
                          >
                            {method.ten}
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
                name="loaiThanhToanId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại thanh toán</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại thanh toán" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentTypes?.map((type: any) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hanHopDong"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn hợp đồng</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hanThucHien"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hạn thực hiện</FormLabel>
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
              name="daThanhToan"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl className="mt-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="mb-0">Đã thanh toán</FormLabel>
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createPaymentMutation.isPending}>
                {createPaymentMutation.isPending
                  ? "Đang lưu..."
                  : payment
                  ? "Cập nhật"
                  : "Tạo mới"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
