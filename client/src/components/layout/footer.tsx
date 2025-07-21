import { CanBo, NhaCungCap } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

export default function Footer() {
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery<CanBo[]>({
    queryKey: ["/api/can-bo"],
  });
  const { data: suppliers = [] } = useQuery<NhaCungCap[]>({
    queryKey: ["/api/nha-cung-cap"],
  });
  return (
    <div className=" bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col items-center space-y-4">
      {/* Footer Info */}
      <div className="w-full flex flex-row sm:flex-row items-center justify-around space-y-2 sm:space-y-0 sm:space-x-4 text-center">
        <div className="w-1/3 flex items-center space-x-3">
          <img
            src="https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png"
            alt="Developer Avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className="text-xs text-slate-500 text-left">
            <p>Developed by</p>
            <p className="text-slate-700 font-medium">Tran Ngoc Tuan</p>
          </div>
        </div>

        <div className=" w-1/3 flex items-center justify-center space-x-2">
          <span className="text-xs text-slate-500 mr-4">
            Powered by <b> Quản lý dự án / Vaxuco</b>
          </span>
          {/* Contributor avatars */}
          <div className="flex flex-wrap justify-center gap-2">
            {staff
              .filter((cb) => cb.anh) // chỉ hiển thị nếu có ảnh
              .map((cb) => (
                <img
                  key={cb.id}
                  src={cb.anh ?? undefined}
                  alt={cb.ten}
                  title={cb.ten}
                  className="w-8 h-8 rounded-full border hover:scale-110 transition"
                  style={{ marginLeft: "-1rem" }}
                />
              ))}
          </div>
        </div>
        <div className="w-1/3 flex items-center space-x-2 justify-end">
          <span className="text-xs text-slate-500 mr-4">Supplier by</span>
          {/* Contributor avatars */}
          <div className="flex flex-wrap justify-center gap-2">
            {suppliers
              .filter((ncc) => ncc.anh) // chỉ hiển thị nếu có ảnh
              .map((ncc) => (
                <img
                  key={ncc.id}
                  src={`data:image/png;base64,${ncc.anh}`}
                  alt={ncc.ten}
                  title={ncc.ten}
                  className="w-8 h-8 rounded-full border hover:scale-110 transition"
                  style={{ marginLeft: "-1rem" }}
                />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
