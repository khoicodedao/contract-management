import { useState } from "react";
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
import { insertHopDongSchema, InsertHopDong } from "@shared/schema";
// import { CloudUpload, X } from "lucide-react";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract?: any;
}

const HINH_THUC_HOP_DONG_OPTIONS = [
  "Đấu thầu rộng rãi",
  "Chỉ định thầu",
  "Đàm phán trực tiếp",
  "Đàm phán gián tiếp",
];

export default function ContractModal({
  isOpen,
  onClose,
  contract,
}: ContractModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertHopDong>({
    resolver: zodResolver(insertHopDongSchema),
    defaultValues: contract
      ? {
          ten: contract.ten || "",
          moTa: contract.moTa || "",
          soHdNoi: contract.soHdNoi || "",
          soHdNgoai: contract.soHdNgoai || "",
          ngay: contract.ngay || new Date().toISOString().split("T")[0],
          loaiHopDongId: contract.loaiHopDongId,
          chuDauTuId: contract.chuDauTuId,
          nhaCungCapId: contract.nhaCungCapId,
          loaiNganSachId: contract.loaiNganSachId,
          canBoId: contract.canBoId,
          trangThaiHopDongId: contract.trangThaiHopDongId,
          giaTriHopDong: contract.giaTriHopDong ?? 0,
          loaiTienId: contract.loaiTienId ?? 1,
          tyGia: contract.tyGia,
          phiUyThac: contract.phiUyThac,
          thueNhaThau: contract.thueNhaThau,
          // ---- các trường mới ----
          hinhThucHopDong: contract.hinhThucHopDong || undefined,
          hinhThucGiaoHang: contract.hinhThucGiaoHang || "",
          thuTruongPhuTrach: contract.thuTruongPhuTrach || "",
          soLanGiaoHang: contract.soLanGiaoHang ?? undefined,
        }
      : {
          ten: "",
          moTa: "",
          soHdNoi: "",
          soHdNgoai: "",
          ngay: new Date().toISOString().split("T")[0],
          // ---- default cho trường mới (nếu cần) ----
          hinhThucHopDong: undefined,
          hinhThucGiaoHang: "",
          thuTruongPhuTrach: "",
          soLanGiaoHang: undefined,
        },
  });

  // Fetch reference data
  const { data: loaiHopDong } = useQuery({ queryKey: ["/api/loai-hop-dong"] });
  const { data: nhaCungCap } = useQuery({ queryKey: ["/api/nha-cung-cap"] });
  const { data: chuDauTu } = useQuery({ queryKey: ["/api/chu-dau-tu"] });
  const { data: canBo } = useQuery({ queryKey: ["/api/can-bo"] });
  const { data: loaiNganSach } = useQuery({
    queryKey: ["/api/loai-ngan-sach"],
  });
  const { data: trangThaiHopDong } = useQuery({
    queryKey: ["/api/trang-thai-hop-dong"],
  });
  const { data: loaiTien } = useQuery({ queryKey: ["/api/loai-tien"] });

  const createContractMutation = useMutation({
    mutationFn: async (data: InsertHopDong) => {
      if (contract) {
        return await apiRequest("PUT", `/api/hop-dong/${contract.id}`, data);
      } else {
        return await apiRequest("POST", "/api/hop-dong", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hop-dong"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Thành công",
        description: contract
          ? "Hợp đồng đã được cập nhật thành công"
          : "Hợp đồng đã được tạo thành công",
      });
      form.reset();
      setSelectedFiles([]);
      onClose();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể tạo hợp đồng. Vui lòng thử lại.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).filter((file) => {
        const validTypes = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
        return (
          validTypes.includes(fileExtension) && file.size <= 10 * 1024 * 1024
        ); // 10MB
      });
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: InsertHopDong) => {
    createContractMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-900">
            {contract ? "Chỉnh sửa hợp đồng" : "Tạo hợp đồng mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tên HĐ */}
              <FormField
                control={form.control}
                name="ten"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên hợp đồng *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên hợp đồng" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Số HĐ nội */}
              <FormField
                control={form.control}
                name="soHdNoi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hợp đồng nội bộ *</FormLabel>
                    <FormControl>
                      <Input placeholder="HD-2024-XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Số HĐ ngoại */}
              <FormField
                control={form.control}
                name="soHdNgoai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số hợp đồng ngoại</FormLabel>
                    <FormControl>
                      <Input placeholder="Số HĐ từ đối tác" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Ngày ký */}
              <FormField
                control={form.control}
                name="ngay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày ký *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Loại HĐ (ref) */}
              <FormField
                control={form.control}
                name="loaiHopDongId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại hợp đồng *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại hợp đồng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loaiHopDong?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.ten}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Trạng thái HĐ (ref) */}
              <FormField
                control={form.control}
                name="trangThaiHopDongId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái hợp đồng *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trangThaiHopDong?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.id === 1
                              ? "Đang thực hiện"
                              : item.id === 2
                              ? "Đã Thanh lý"
                              : item.id === 3
                              ? "Chưa thực hiện"
                              : `Trạng thái ${item.id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Nhà cung cấp (ref) */}
              <FormField
                control={form.control}
                name="nhaCungCapId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhà cung cấp *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhà cung cấp" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {nhaCungCap?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.ten}</span>
                              <span className="text-xs text-gray-500">
                                {item.diaChi}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Chủ đầu tư (ref) */}
              <FormField
                control={form.control}
                name="chuDauTuId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chủ đầu tư *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn chủ đầu tư" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {chuDauTu?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.ten}</span>
                              <span className="text-xs text-gray-500">
                                {item.diaChi}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Giá trị HĐ */}
              <FormField
                control={form.control}
                name="giaTriHopDong"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trị giá hàng hoá, dịch vụ *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={100000}
                        placeholder="VD: 100000000"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Loại tiền (ref) */}
              <FormField
                control={form.control}
                name="loaiTienId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại Tiền *</FormLabel>
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
                        {loaiTien?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.ten}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Phí ủy thác */}
              <FormField
                control={form.control}
                name="phiUyThac"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phí ủy thác *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={100000}
                        placeholder="VD: 100000000"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Tỷ giá */}
              <FormField
                control={form.control}
                name="tyGia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỷ giá *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={0.1}
                        placeholder="VD: 1.2"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          field.onChange(isNaN(value) ? 0 : value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Cán bộ phụ trách (ref) */}
              <FormField
                control={form.control}
                name="canBoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cán bộ phụ trách *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn cán bộ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {canBo?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{item.ten}</span>
                              <span className="text-xs text-gray-500">
                                {item.chucVu}
                              </span>
                              {item.email && (
                                <span className="text-xs text-gray-400">
                                  {item.email}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Loại ngân sách (ref) */}
              <FormField
                control={form.control}
                name="loaiNganSachId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại ngân sách</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value ? parseInt(value) : undefined)
                      }
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn loại ngân sách" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loaiNganSach?.map((item: any) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.ten}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* ========= CÁC TRƯỜNG MỚI THEO SCHEMA ========= */}

              {/* Hình thức hợp đồng (select text) */}
              <FormField
                control={form.control}
                name="hinhThucHopDong"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình thức hợp đồng</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn hình thức" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {HINH_THUC_HOP_DONG_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Hình thức giao hàng (text) */}
              <FormField
                control={form.control}
                name="hinhThucGiaoHang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình thức giao hàng</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Giao từng đợt, FOB/CIF, giao tại kho..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Thủ trưởng phụ trách (text) */}
              <FormField
                control={form.control}
                name="thuTruongPhuTrach"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thủ trưởng phụ trách</FormLabel>
                    <FormControl>
                      <Input placeholder="Họ tên người phụ trách" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Số lần giao hàng (int) */}
              <FormField
                control={form.control}
                name="soLanGiaoHang"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lần giao hàng</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        placeholder="VD: 3"
                        value={field.value?.toString() ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          // cho phép để trống => undefined
                          if (v === "") {
                            field.onChange(undefined);
                          } else {
                            const num = parseInt(v, 10);
                            field.onChange(Number.isNaN(num) ? undefined : num);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* ========= HẾT CÁC TRƯỜNG MỚI ========= */}
            </div>

            {/* Thuế nhà thầu */}
            <FormField
              control={form.control}
              name="thueNhaThau"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thuế nhà thầu *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      placeholder="VD: 100000000"
                      {...field}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="moTa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả hợp đồng</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Mô tả chi tiết về hợp đồng..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createContractMutation.isPending}>
                {createContractMutation.isPending
                  ? contract
                    ? "Đang lưu..."
                    : "Đang tạo..."
                  : contract
                  ? "Lưu thay đổi"
                  : "Tạo hợp đồng"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
