import { CanBo } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

export default function Footer() {
  const queryClient = useQueryClient();

  const { data: staff = [], isLoading } = useQuery<CanBo[]>({
    queryKey: ["/api/can-bo"],
  });

  return (
    <div className="w-full bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col items-center space-y-4">
      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 sm:space-x-4 text-center">
        <div className="flex items-center space-x-3">
          <img
            src="https://scontent.fhan5-10.fna.fbcdn.net/v/t39.30808-6/433497264_3742222032771736_2372411655334707575_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeHJezAzXTR8BPYaGOh8ebltXilcilhvP8NeKVyKWG8_w0pp4TzjCLgX1tzPR2CxuEGo3P6imblRa9SLrdeFZIby&_nc_ohc=t9hrGZnGDpgQ7kNvwGe9o1o&_nc_oc=AdlauS8yIxBs4xZBW140mA032MOwXoE2BGFHFbdVQPlvGgEHYfKYyuBxFl-lp5BTq-0&_nc_zt=23&_nc_ht=scontent.fhan5-10.fna&_nc_gid=-u9DCOJ9SZte5LyQ97La6A&oh=00_AfShKk9K0AEqGhMYoJ7qXjb_q-ZmBtgY80GDY4WCsA_YRg&oe=686F0BF0"
            alt="Developer Avatar"
            className="w-8 h-8 rounded-full"
          />
          <div className="text-xs text-slate-500 text-left">
            <p>Developed by</p>
            <p className="text-slate-700 font-medium">Tran Ngoc Tuan</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 mr-4">Powered by</span>
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
      </div>
    </div>
  );
}
