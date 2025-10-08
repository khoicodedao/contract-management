import { useEffect, useMemo, useState } from "react";
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
import { insertFileHopDongSchema, InsertFileHopDong } from "@shared/schema";
import { Upload, X, FileText, File, LinkIcon } from "lucide-react";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: any; // FileHopDong
}

function toInputDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function DocumentModal({
  isOpen,
  onClose,
  document,
}: DocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ==== Queries (contracts, staff) ====
  const { data: contracts } = useQuery({
    queryKey: ["/api/hop-dong"],
  });
  const { data: staff } = useQuery({
    queryKey: ["/api/can-bo"],
  });

  // ==== Default values (đảm bảo luôn controlled) ====
  const defaultValues: InsertFileHopDong = {
    hopDongId: document?.hopDongId ?? 0,
    tenFile: document?.tenFile ?? "",
    loaiFile: document?.loaiFile ?? "",
    duongDan: document?.duongDan ?? "",
    kichThuoc: document?.kichThuoc ?? 0,
    ghiChu: document?.ghiChu ?? "",
    nguoiTaiLen: document?.nguoiTaiLen ?? undefined, // có thể rỗng
    soVanBan: document?.soVanBan ?? "",
    ngayThucHien: document?.ngayThucHien
      ? toInputDate(document.ngayThucHien)
      : "",
  };

  const form = useForm<InsertFileHopDong>({
    resolver: zodResolver(insertFileHopDongSchema),
    defaultValues,
  });

  // Khi mở modal edit tài liệu khác → reset tránh uncontrolled->controlled
  useEffect(() => {
    form.reset({
      hopDongId: document?.hopDongId ?? 0,
      tenFile: document?.tenFile ?? "",
      loaiFile: document?.loaiFile ?? "",
      duongDan: document?.duongDan ?? "",
      kichThuoc: document?.kichThuoc ?? 0,
      ghiChu: document?.ghiChu ?? "",
      nguoiTaiLen: document?.nguoiTaiLen ?? undefined,
      soVanBan: document?.soVanBan ?? "",
      ngayThucHien: document?.ngayThucHien
        ? toInputDate(document.ngayThucHien)
        : "",
    });
    setSelectedFile(null);
  }, [document, form]);

  // ==== File helpers ====
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string); // giữ "data:<mime>;base64,..."
      reader.onerror = (error) => reject(error);
    });

  const validateAndSetFile = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB ảnh, 10MB tài liệu
    if (file.size > maxSize) {
      toast({
        title: "Lỗi",
        description: `File không được vượt quá ${
          isImage ? "5MB (ảnh)" : "10MB (tài liệu)"
        }`,
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Lỗi",
        description: "Loại file không được hỗ trợ",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    form.setValue("tenFile", file.name);
    form.setValue("loaiFile", file.type || "");
    form.setValue("kichThuoc", file.size || 0);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateAndSetFile(f);
  };
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSetFile(f);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

  // ==== Mutation (Create/Update) ====
  const createOrUpdateMutation = useMutation({
    mutationFn: async (data: InsertFileHopDong) => {
      let payload: any = { ...data };

      // EDIT: PUT (JSON)
      if (document) {
        if (selectedFile) {
          const b64 = await fileToBase64(selectedFile);
          payload = {
            ...payload,
            tenFile: selectedFile.name,
            loaiFile: selectedFile.type,
            kichThuoc: selectedFile.size,
            noiDungFile: b64, // server lưu full dataURL
          };
        }
        // dùng đúng chữ ký apiRequest(method, url, body?)
        return await apiRequest(
          "PUT",
          `/api/file-hop-dong/${document.id}`,
          payload
        );
      }

      // CREATE:
      if (selectedFile) {
        // multipart (có file)
        const fd = new FormData();
        fd.append("hopDongId", String(payload.hopDongId ?? 0));
        fd.append("tenFile", selectedFile.name);
        fd.append("loaiFile", selectedFile.type || "");
        fd.append("kichThuoc", String(selectedFile.size || 0));
        fd.append("ghiChu", payload.ghiChu || "");
        fd.append("soVanBan", payload.soVanBan || "");
        fd.append("ngayThucHien", payload.ngayThucHien || "");
        fd.append("duongDan", payload.duongDan || ""); // optional
        if (payload.nguoiTaiLen != null) {
          fd.append("nguoiTaiLen", String(payload.nguoiTaiLen));
        }
        fd.append("file", selectedFile);

        const res = await fetch("/api/file-hop-dong", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) throw new Error("Upload failed");
        return res.json();
      } else {
        // POST JSON (chỉ meta + duongDan)
        const res = await fetch("/api/file-hop-dong", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Create failed");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/file-hop-dong"] });
      toast({
        title: "Thành công",
        description: document
          ? "Tài liệu đã được cập nhật"
          : "Tài liệu đã được tạo",
      });
      onClose();
      form.reset(defaultValues);
      setSelectedFile(null);
    },
    onError: (e: any) => {
      console.error(e);
      toast({
        title: "Lỗi",
        description: "Không thể lưu tài liệu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertFileHopDong) => {
    // Ép kiểu chắc chắn để tránh undefined
    console.log("===============", data);
    const clean: InsertFileHopDong = {
      ...data,
      tenFile: data.tenFile ?? "",
      loaiFile: data.loaiFile ?? "",
      duongDan: data.duongDan ?? "",
      ghiChu: data.ghiChu ?? "",
      soVanBan: data.soVanBan ?? "",
      ngayThucHien: data.ngayThucHien ?? "",
      hopDongId: Number(data.hopDongId ?? 0),
      kichThuoc: Number(data.kichThuoc ?? 0),
      nguoiTaiLen:
        data.nguoiTaiLen === undefined || data.nguoiTaiLen === null
          ? undefined
          : Number(data.nguoiTaiLen),
    };
    createOrUpdateMutation.mutate(clean);
  };

  const currentFileInfo = useMemo(() => {
    if (!document) return null;
    return {
      name: document.tenFile as string | undefined,
      type: document.loaiFile as string | undefined,
      size: document.kichThuoc as number | undefined,
      link: document.duongDan as string | undefined,
    };
  }, [document]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {document ? "Chỉnh sửa tài liệu" : "Tạo tài liệu mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Hợp đồng */}
            <FormField
              control={form.control}
              name="hopDongId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hợp đồng</FormLabel>
                  <Select
                    value={field.value != null ? String(field.value) : ""}
                    onValueChange={(v) =>
                      field.onChange(v === "" ? 0 : Number(v))
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn hợp đồng" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* @ts-ignore */}
                      {contracts?.map((c: any) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.soHdNgoai || `HĐ #${c.id}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Kéo/thả chọn file */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {document ? "Thay file (tùy chọn)" : "Tải lên file"}
              </label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors"
                onDrop={handleFileDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Nhấp để chọn file hoặc kéo thả vào đây
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF/DOC/XLS (≤10MB) • PNG/JPG/GIF/WEBP (≤5MB)
                  </p>
                </label>
              </div>

              {/* File mới chọn */}
              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      {selectedFile.type.includes("pdf") ? (
                        <FileText className="w-4 h-4 text-blue-600" />
                      ) : (
                        <File className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      // trả về giá trị cũ khi bỏ chọn file
                      form.setValue("tenFile", document?.tenFile ?? "");
                      form.setValue("loaiFile", document?.loaiFile ?? "");
                      form.setValue("kichThuoc", document?.kichThuoc ?? 0);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* File hiện tại khi edit (nếu không chọn file mới) */}
              {!selectedFile && currentFileInfo && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      {(currentFileInfo.type || "").includes("pdf") ? (
                        <FileText className="w-4 h-4 text-gray-600" />
                      ) : (
                        <File className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {currentFileInfo.name || "—"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(currentFileInfo.size
                          ? (currentFileInfo.size / 1024 / 1024).toFixed(2)
                          : "0") + " MB"}
                      </p>
                    </div>
                  </div>
                  {currentFileInfo.link ? (
                    <a
                      href={currentFileInfo.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline text-sm"
                      title="Mở đường dẫn hiện tại"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Mở link
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Không có link</span>
                  )}
                </div>
              )}
            </div>

            {/* Tên/Loại */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tenFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên file</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tên file"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="loaiFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại file (MIME hoặc mô tả)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="vd: application/pdf"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Kích thước / Người tải lên */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kichThuoc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kích thước (bytes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        value={field.value ?? 0}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value || 0))
                        }
                        placeholder="Kích thước"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nguoiTaiLen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người tải lên</FormLabel>
                    <Select
                      value={field.value != null ? String(field.value) : ""}
                      onValueChange={(v) =>
                        field.onChange(v === "" ? undefined : Number(v))
                      }
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người tải lên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* @ts-ignore */}
                        {staff?.map((person: any) => (
                          <SelectItem key={person.id} value={String(person.id)}>
                            {person.ten}{" "}
                            {person.chucVu ? `- ${person.chucVu}` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Số văn bản / Ngày thực hiện */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="soVanBan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số văn bản</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số văn bản..."
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ngayThucHien"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ngày thực hiện</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Đường dẫn (optional) */}
            <FormField
              control={form.control}
              name="duongDan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn tệp (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://... hoặc /uploads/..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ghi chú */}
            <FormField
              control={form.control}
              name="ghiChu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập ghi chú..."
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createOrUpdateMutation.isPending}>
                {createOrUpdateMutation.isPending
                  ? "Đang lưu..."
                  : document
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
