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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InsertCanBo, insertCanBoSchema, CanBo } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";

function imageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

type StaffModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InsertCanBo) => void;
  isSubmitting?: boolean;
  staff?: CanBo | null;
};

export default function StaffModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  staff,
}: StaffModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const form = useForm<InsertCanBo>({
    resolver: zodResolver(insertCanBoSchema),
    defaultValues: {
      ten: "",
      chucVu: "",
      anh: "",
    },
  });

  useEffect(() => {
    if (staff) {
      form.reset({
        ten: staff.ten || "",
        chucVu: staff.chucVu || "",
        anh: staff.anh || "",
      });
    }
  }, [staff]);

  const handleSubmit = async (data: InsertCanBo) => {
    let finalData = { ...data };
    if (selectedImage) {
      finalData.anh = await imageToBase64(selectedImage);
    }
    onSubmit(finalData);
    setSelectedImage(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {staff ? "Xem / Sửa cán bộ" : "Thêm cán bộ mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormItem>
              <FormLabel>Ảnh cán bộ</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setSelectedImage(file);
                  }}
                />
              </FormControl>
              {selectedImage && (
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="Preview"
                  className="w-24 h-24 mt-2 rounded object-cover"
                />
              )}
              {!selectedImage && staff?.anh && (
                <img
                  src={staff.anh}
                  alt="Preview"
                  className="w-24 h-24 mt-2 rounded object-cover"
                />
              )}
            </FormItem>

            <FormField
              control={form.control}
              name="ten"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên cán bộ *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên cán bộ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="chucVu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập chức vụ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setSelectedImage(null);
                  onClose();
                }}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? staff
                    ? "Đang cập nhật..."
                    : "Đang thêm..."
                  : staff
                  ? "Lưu thay đổi"
                  : "Thêm cán bộ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
