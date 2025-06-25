import { useState } from "react";
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
import { insertFileHopDongSchema, InsertFileHopDong } from "@shared/schema";
import { Upload, X, FileText, File } from "lucide-react";

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: any;
}

export default function DocumentModal({ isOpen, onClose, document }: DocumentModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertFileHopDong>({
    resolver: zodResolver(insertFileHopDongSchema),
    defaultValues: document ? {
      hopDongId: document.hopDongId || 0,
      tenFile: document.tenFile || "",
      loaiFile: document.loaiFile || "",
      duongDan: document.duongDan || "",
      kichThuoc: document.kichThuoc || 0,
      ghiChu: document.ghiChu || "",
      nguoiTaiLen: document.nguoiTaiLen,
    } : {
      hopDongId: 0,
      tenFile: "",
      loaiFile: "",
      duongDan: "",
      kichThuoc: 0,
      ghiChu: "",
    },
  });

  const { data: contracts } = useQuery({
    queryKey: ["/api/hop-dong"],
  });

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/jpeg;base64, prefix to store only the base64 content
        const base64Content = result.split(',')[1];
        resolve(base64Content);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
      form.setValue("tenFile", file.name);
      form.setValue("loaiFile", file.type);
      form.setValue("kichThuoc", file.size);
      form.setValue("duongDan", `/file/${file.name}`);
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const validateAndSetFile = (file: File) => {
    // Check file size (5MB limit for images, 10MB for documents)
    const isImage = file.type.startsWith('image/');
    const maxSize = isImage ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    
    if (file.size > maxSize) {
      toast({
        title: "Lỗi",
        description: `File không được vượt quá ${isImage ? '5MB' : '10MB'}`,
        variant: "destructive",
      });
      return;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/gif',
      'image/webp'
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
  };

  const { data: staff } = useQuery({
    queryKey: ["/api/can-bo"],
  });

  const createDocumentMutation = useMutation({
    mutationFn: async (data: InsertFileHopDong) => {
      let finalData = { ...data };
      
      // Convert file to base64 if selected
      if (selectedFile) {
        try {
          const base64Content = await fileToBase64(selectedFile);
          finalData = {
            ...finalData,
            tenFile: selectedFile.name,
            loaiFile: selectedFile.type,
            kichThuoc: selectedFile.size,
            noiDung: base64Content,
            duongDan: `/file/${selectedFile.name}`, // Virtual path for display
          };
        } catch (error) {
          throw new Error("Không thể xử lý file");
        }
      }
      
      if (document) {
        return await apiRequest("PUT", `/api/file-hop-dong/${document.id}`, finalData);
      } else {
        return await apiRequest("POST", "/api/file-hop-dong", finalData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/file-hop-dong"] });
      toast({
        title: "Thành công",
        description: document ? "Tài liệu đã được cập nhật" : "Tài liệu đã được tạo",
      });
      onClose();
      form.reset();
      setSelectedFile(null);
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể lưu tài liệu",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertFileHopDong) => {
    createDocumentMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{document ? "Chỉnh sửa tài liệu" : "Tạo tài liệu mới"}</DialogTitle>
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

            {!document && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tải lên file</label>
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
                      Nhấp để chọn file hoặc kéo thả file vào đây
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, XLS, XLSX, TXT (10MB) • PNG, JPG, GIF, WEBP (5MB)
                    </p>
                  </label>
                </div>
                {selectedFile && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        {selectedFile.type.includes('pdf') ? (
                          <FileText className="w-4 h-4 text-blue-600" />
                        ) : selectedFile.type.includes('image') ? (
                          <File className="w-4 h-4 text-blue-600" />
                        ) : (
                          <File className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
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
                        form.setValue("tenFile", "");
                        form.setValue("loaiFile", "");
                        form.setValue("kichThuoc", 0);
                        form.setValue("duongDan", "");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tenFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên file</FormLabel>
                    <FormControl>
                      <Input placeholder="Tên file" {...field} />
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
                    <FormLabel>Loại file</FormLabel>
                    <FormControl>
                      <Input placeholder="Loại file" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duongDan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường dẫn</FormLabel>
                  <FormControl>
                    <Input placeholder="Đường dẫn file" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                        placeholder="Kích thước" 
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
                name="nguoiTaiLen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Người tải lên</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn người tải lên" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {staff?.map((person: any) => (
                          <SelectItem key={person.id} value={person.id.toString()}>
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Hủy
              </Button>
              <Button type="submit" disabled={createDocumentMutation.isPending}>
                {createDocumentMutation.isPending ? "Đang lưu..." : (document ? "Cập nhật" : "Tạo mới")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}