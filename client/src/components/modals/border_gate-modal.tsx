import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const schema = z.object({
  ten: z.string().min(1, "Tên không được để trống"),
  chiCuc: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface DiaDiemThongQuanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DiaDiemThongQuanModal({
  isOpen,
  onClose,
}: DiaDiemThongQuanModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      return await apiRequest("POST", "/api/dia-diem-thong-quan", data);
    },
    onSuccess: () => {
      toast({
        title: "Thành công",
        description: "Đã thêm địa điểm thông quan",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dia-diem-thong-quan"] });
      reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Lỗi",
        description: "Không thể thêm địa điểm",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm địa điểm thông quan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="ten">Tên địa điểm</Label>
            <Input id="ten" {...register("ten")} />
            {errors.ten && (
              <p className="text-sm text-red-500">{errors.ten.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="chi_cuc">Chi cục</Label>
            <Input id="chi_cuc" {...register("chiCuc")} />
            {errors.chiCuc && (
              <p className="text-sm text-red-500">{errors.chiCuc.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Đang lưu..." : "Lưu"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
