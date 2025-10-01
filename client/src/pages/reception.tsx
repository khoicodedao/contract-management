import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import BorderGate from "@/components/modals/border_gate-modal";
import { BuocThucHien } from "@shared/schema";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
interface TiepNhan {
  id: number;
  hopDongId: number;
  tenHang: string;
  soToKhai?: string;
  soVanDon?: string;
  soPhieuDongGoi?: string;
  soHoaDon?: string;
  soBaoHiem?: string;
  diaDiemThongQuanId?: number;
  diaDiemThongQuanTuDo?: string;
  ngayThucHien: string;
  dieuKienGiaoHangId: number;
}

interface DiaDiemThongQuan {
  id: number;
  ten: string;
  chiCuc: string;
}

interface HopDong {
  id: number;
  ten: string;
  soHdNgoai: string;
}
interface DieuKienGiaoHang {
  id: number;
  ten: string;
}

export default function Reception() {
  const handleExport = () => {
    const rows = receptions.map((r) => {
      const contract = contracts.find((c) => c.id === r.hopDongId);
      return {
        "Số hợp đồng ngoại": contract?.soHdNgoai || "-",
        "Tên hợp đồng": contract?.ten || "-",
        "Tên hàng": r.tenHang,
        "Số tờ khai": r.soToKhai || "-",
        "Số vận đơn": r.soVanDon || "-",
        "Số phiếu đóng gói": r.soPhieuDongGoi || "-",
        "Số hóa đơn": r.soHoaDon || "-",
        "Số bảo hiểm": r.soBaoHiem || "-",
        "Địa điểm thông quan": getLocationName(r),
        "Ngày thực hiện": new Date(r.ngayThucHien).toLocaleDateString(),
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TiepNhan");

    const buffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([buffer]), "tiep_nhan_export.xlsx");
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateBorderGateModalOpen, setIsCreateBorderGateModalOpen] =
    useState(false);
  const openCreateBorderGate = () => setIsCreateBorderGateModalOpen(true);
  const closeCreateBorderGate = () => setIsCreateBorderGateModalOpen(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingReception, setEditingReception] = useState<TiepNhan | null>(
    null
  );
  const [useCustomLocation, setUseCustomLocation] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: receptions = [] } = useQuery<TiepNhan[]>({
    queryKey: ["/api/tiep-nhan"],
  });

  const { data: locations = [] } = useQuery<DiaDiemThongQuan[]>({
    queryKey: ["/api/dia-diem-thong-quan"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/hop-dong"],
  });
  const { data: incoterms = [] } = useQuery<DieuKienGiaoHang[]>({
    queryKey: ["/api/dieu-kien-giao-hang"],
  });
  const { data: steps = [] } = useQuery<BuocThucHien[]>({
    queryKey: ["/api/buoc-thuc-hien"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<TiepNhan, "id">) => {
      // createProgressMutation(data);
      await apiRequest("POST", "/api/tiep-nhan", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tiep-nhan"] });
      setIsCreateOpen(false);
      toast({ description: "Đã tạo bản ghi tiếp nhận thành công" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Lỗi khi tạo bản ghi tiếp nhận",
      });
    },
  });
  const createProgressMutation = useMutation({
    mutationFn: async (data: Omit<TiepNhan, "id">) => {
      const constract = contracts.find((c) => c.id === data.hopDongId);
      const thuTuMax = steps
        .filter((item) => item.hopDongId === data.hopDongId)
        .reduce((max, item) => {
          return item.thuTu > max ? item.thuTu : max;
        }, 0);
      const thuTu = thuTuMax + 1;
      const progressData = {
        hopDongId: data.hopDongId,
        ten: `Tiếp nhận ${data.tenHang}`,
        moTa: `Tiếp nhận hàng hóa ${
          data.tenHang
        } theo hợp đồng ${getContractName(data.hopDongId)}, số tờ khai ${
          data.soToKhai
        } và số vận đơn ${data.soVanDon}`,
        ngayBatDau: data.ngayThucHien,
        ngayKetThuc: data.ngayThucHien,
        ngayBatDauThucTe: data.ngayThucHien,
        ngayKetThucThucTe: data.ngayThucHien,
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
  const updateMutation = useMutation({
    mutationFn: async (data: TiepNhan) => {
      await apiRequest("PUT", `/api/tiep-nhan/${data.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tiep-nhan"] });
      setIsEditOpen(false);
      setEditingReception(null);
      toast({ description: "Đã cập nhật bản ghi tiếp nhận thành công" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Lỗi khi cập nhật bản ghi tiếp nhận",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tiep-nhan/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tiep-nhan"] });
      toast({ description: "Đã xóa bản ghi tiếp nhận thành công" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Lỗi khi xóa bản ghi tiếp nhận",
      });
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const data = {
      hopDongId: parseInt(formData.get("hopDongId") as string),
      tenHang: formData.get("tenHang") as string,
      soToKhai: (formData.get("soToKhai") as string) || undefined,
      soVanDon: (formData.get("soVanDon") as string) || undefined,
      soPhieuDongGoi: (formData.get("soPhieuDongGoi") as string) || undefined,
      soHoaDon: (formData.get("soHoaDon") as string) || undefined,
      soBaoHiem: (formData.get("soBaoHiem") as string) || undefined,
      dieuKienGiaoHangId: parseInt(
        formData.get("dieuKienGiaoHangId") as string
      ),
      diaDiemThongQuanId: useCustomLocation
        ? undefined
        : parseInt(formData.get("diaDiemThongQuanId") as string) || undefined,
      diaDiemThongQuanTuDo: useCustomLocation
        ? (formData.get("diaDiemThongQuanTuDo") as string) || undefined
        : undefined,
      ngayThucHien: formData.get("ngayThucHien") as string,
    };

    if (editingReception) {
      updateMutation.mutate({ ...data, id: editingReception.id });
    } else {
      createMutation.mutate(data);
      createProgressMutation.mutate(data);
    }
  };

  const getContractName = (hopDongId: number) => {
    const contract = contracts.find((c) => c.id === hopDongId);
    return contract?.ten || `Hợp đồng #${hopDongId}`;
  };
  const getContractNumber = (hopDongId: number) => {
    const contract = contracts.find((c) => c.id === hopDongId);
    return contract?.soHdNgoai || `Hợp đồng #${hopDongId}`;
  };
  const getLocationName = (reception: TiepNhan) => {
    if (reception.diaDiemThongQuanTuDo) {
      return reception.diaDiemThongQuanTuDo;
    }
    if (reception.diaDiemThongQuanId) {
      const location = locations.find(
        (l) => l.id === reception.diaDiemThongQuanId
      );
      return location
        ? `${location.ten} - ${location.chiCuc}`
        : `Location #${reception.diaDiemThongQuanId}`;
    }
    return "Chưa xác định";
  };

  const openEditDialog = (reception: TiepNhan) => {
    setEditingReception(reception);
    setUseCustomLocation(!!reception.diaDiemThongQuanTuDo);
    setIsEditOpen(true);
  };

  const openCreateDialog = () => {
    setEditingReception(null);
    setUseCustomLocation(false);
    setIsCreateOpen(true);
  };
  const filteredReceptions = receptions.filter((reception) => {
    const contract = contracts.find((c) => c.id === reception.hopDongId);
    return contract?.soHdNgoai
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Quản lý tiếp nhận"
          subtitle="Quản lý tiếp nhận hàng hóa và thông tin thông quan"
          onCreateContract={() => {}}
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <div>
                    <div className="flex space-x-2">
                      <Button onClick={openCreateDialog}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm tiếp nhận
                      </Button>
                      <Button onClick={handleExport}>Xuất Excel</Button>
                      <Button onClick={openCreateBorderGate}>
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm địa điểm thông quan
                      </Button>
                    </div>
                  </div>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Thêm bản ghi tiếp nhận mới</DialogTitle>
                      <DialogDescription>
                        Nhập thông tin tiếp nhận hàng hóa và tài liệu thông quan
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hopDongId">Hợp đồng</Label>
                          <Select name="hopDongId" required>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hợp đồng" />
                            </SelectTrigger>
                            <SelectContent>
                              {contracts.map((contract) => (
                                <SelectItem
                                  key={contract.id}
                                  value={contract.id.toString()}
                                >
                                  {contract.ten}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenHang">Tên hàng</Label>
                          <Input id="tenHang" name="tenHang" required />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="soToKhai">Số tờ khai</Label>
                          <Input id="soToKhai" name="soToKhai" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="soVanDon">Số vận đơn</Label>
                          <Input id="soVanDon" name="soVanDon" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dieuKienGiaoHangId">
                          Điều kiện giao hang
                        </Label>
                        <Select name="dieuKienGiaoHangId" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn điều kiện giao hàng" />
                          </SelectTrigger>
                          <SelectContent>
                            {incoterms.map((inconterm) => (
                              <SelectItem
                                key={inconterm.id}
                                value={inconterm.id.toString()}
                              >
                                {inconterm.ten}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="soPhieuDongGoi">
                            Số phiếu đóng gói
                          </Label>
                          <Input id="soPhieuDongGoi" name="soPhieuDongGoi" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="soHoaDon">Số hóa đơn</Label>
                          <Input id="soHoaDon" name="soHoaDon" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="soBaoHiem">Số bảo hiểm</Label>
                          <Input id="soBaoHiem" name="soBaoHiem" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ngayThucHien">Ngày thực hiện</Label>
                          <Input
                            id="ngayThucHien"
                            name="ngayThucHien"
                            type="date"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {useCustomLocation ? (
                          <div className="space-y-2">
                            <Label htmlFor="diaDiemThongQuanTuDo">
                              Địa điểm thông quan
                            </Label>
                            <Input
                              id="diaDiemThongQuanTuDo"
                              name="diaDiemThongQuanTuDo"
                              placeholder="Nhập địa điểm thông quan tự do"
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="diaDiemThongQuanId">
                              Địa điểm thông quan
                            </Label>
                            <Select name="diaDiemThongQuanId">
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn địa điểm thông quan" />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem
                                    key={location.id}
                                    value={location.id.toString()}
                                  >
                                    {location.ten} - {location.chiCuc}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsCreateOpen(false)}
                        >
                          Hủy
                        </Button>
                        <Button type="submit">Tạo</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Danh sách tiếp nhận</CardTitle>
                  <CardDescription>
                    Tổng cộng: {receptions.length} bản ghi tiếp nhận
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Tìm theo số hợp đồng ngoại..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-80 pl-10"
                    />
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Số Hợp đồng ngoại</TableHead>
                        <TableHead>Hợp đồng</TableHead>
                        <TableHead>Tên hàng</TableHead>
                        <TableHead>Số tờ khai</TableHead>
                        <TableHead>Số vận đơn</TableHead>
                        <TableHead>Địa điểm thông quan</TableHead>
                        <TableHead>Ngày thực hiện</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceptions.map((reception) => (
                        <TableRow key={reception.id}>
                          <TableCell>
                            {getContractNumber(reception.hopDongId)}
                          </TableCell>
                          <TableCell>
                            {getContractName(reception.hopDongId)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {reception.tenHang}
                          </TableCell>
                          <TableCell>
                            {reception.soToKhai && (
                              <Badge variant="outline">
                                {reception.soToKhai}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {reception.soVanDon && (
                              <Badge variant="outline">
                                {reception.soVanDon}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                reception.diaDiemThongQuanTuDo
                                  ? "secondary"
                                  : "default"
                              }
                            >
                              {getLocationName(reception)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              reception.ngayThucHien
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(reception)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  deleteMutation.mutate(reception.id)
                                }
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Edit Dialog */}
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Chỉnh sửa bản ghi tiếp nhận</DialogTitle>
                    <DialogDescription>
                      Cập nhật thông tin tiếp nhận hàng hóa và tài liệu thông
                      quan
                    </DialogDescription>
                  </DialogHeader>
                  {editingReception && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hopDongId">Hợp đồng</Label>
                          <Select
                            name="hopDongId"
                            defaultValue={editingReception.hopDongId.toString()}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hợp đồng" />
                            </SelectTrigger>
                            <SelectContent>
                              {contracts.map((contract) => (
                                <SelectItem
                                  key={contract.id}
                                  value={contract.id.toString()}
                                >
                                  {contract.ten}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tenHang">Tên hàng</Label>
                          <Input
                            id="tenHang"
                            name="tenHang"
                            defaultValue={editingReception.tenHang}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="soToKhai">Số tờ khai</Label>
                          <Input
                            id="soToKhai"
                            name="soToKhai"
                            defaultValue={editingReception.soToKhai || ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="soVanDon">Số vận đơn</Label>
                          <Input
                            id="soVanDon"
                            name="soVanDon"
                            defaultValue={editingReception.soVanDon || ""}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dieuKienGiaoHangId">
                          Điều kiện giao hàng
                        </Label>
                        <Select
                          name="dieuKienGiaoHangId"
                          defaultValue={
                            editingReception.dieuKienGiaoHangId?.toString() ||
                            ""
                          }
                          required
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn điều kiện giao hàng" />
                          </SelectTrigger>
                          <SelectContent>
                            {incoterms.map((incoterm) => (
                              <SelectItem
                                key={incoterm.id}
                                value={incoterm.id.toString()}
                              >
                                {incoterm.ten}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="soPhieuDongGoi">
                            Số phiếu đóng gói
                          </Label>
                          <Input
                            id="soPhieuDongGoi"
                            name="soPhieuDongGoi"
                            defaultValue={editingReception.soPhieuDongGoi || ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="soHoaDon">Số hóa đơn</Label>
                          <Input
                            id="soHoaDon"
                            name="soHoaDon"
                            defaultValue={editingReception.soHoaDon || ""}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="soBaoHiem">Số bảo hiểm</Label>
                          <Input
                            id="soBaoHiem"
                            name="soBaoHiem"
                            defaultValue={editingReception.soBaoHiem || ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="ngayThucHien">Ngày thực hiện</Label>
                          <Input
                            id="ngayThucHien"
                            name="ngayThucHien"
                            type="date"
                            defaultValue={editingReception.ngayThucHien}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        {useCustomLocation ? (
                          <div className="space-y-2">
                            <Label htmlFor="diaDiemThongQuanTuDo">
                              Địa điểm thông quan
                            </Label>
                            <Input
                              id="diaDiemThongQuanTuDo"
                              name="diaDiemThongQuanTuDo"
                              defaultValue={
                                editingReception.diaDiemThongQuanTuDo || ""
                              }
                              placeholder="Nhập địa điểm thông quan tự do"
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Label htmlFor="diaDiemThongQuanId">
                              Địa điểm thông quan
                            </Label>
                            <Select
                              name="diaDiemThongQuanId"
                              defaultValue={editingReception.diaDiemThongQuanId?.toString()}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn địa điểm thông quan" />
                              </SelectTrigger>
                              <SelectContent>
                                {locations.map((location) => (
                                  <SelectItem
                                    key={location.id}
                                    value={location.id.toString()}
                                  >
                                    {location.ten} - {location.chiCuc}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditOpen(false)}
                        >
                          Hủy
                        </Button>
                        <Button type="submit">Cập nhật</Button>
                      </div>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <BorderGate
                isOpen={isCreateBorderGateModalOpen}
                onClose={closeCreateBorderGate}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
