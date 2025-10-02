"use client";

import React from "react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { useQuery } from "@tanstack/react-query";

type CapTien = {
  id: string;
  hopDongId: number;
  ngayCap: string;
  soTien: number;
  loaiTienId: number;
  tyGia?: number | null;
  ghiChu?: string | null;
};

type Props = {
  contractId: string | number;
  getLoaiTien: (id?: string | number | null) => string;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
};

export const CapTienTimeline: React.FC<Props> = ({
  contractId,
  getLoaiTien,
}) => {
  const { data: capTienList = [], isLoading } = useQuery<CapTien[]>({
    queryKey: ["/api/cap-tien"],
  });

  const filteredCapTien = capTienList.filter(
    (ct) => ct.hopDongId === Number(contractId)
  );
  const sortedCapTien = [...filteredCapTien].sort(
    (a, b) => new Date(a.ngayCap).getTime() - new Date(b.ngayCap).getTime()
  );

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        💵 Lịch sử cấp tiền ({filteredCapTien.length} lần)
      </h3>

      {isLoading ? (
        <p className="text-gray-500 text-sm">Đang tải dữ liệu cấp tiền...</p>
      ) : (
        <VerticalTimeline lineColor="#16a34a">
          {sortedCapTien.map((ct) => (
            <VerticalTimelineElement
              key={`capTien-${ct.id}`}
              contentStyle={{
                background: "#dcfce7",
                color: "#14532d",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              }}
              contentArrowStyle={{ borderRight: "7px solid #dcfce7" }}
              date={formatDate(ct.ngayCap)}
              iconStyle={{ background: "#16a34a", color: "#fff" }}
              icon={<span className="text-lg font-bold">₫</span>}
            >
              <h4 className="text-md font-bold mb-1">
                Cấp {ct.soTien.toLocaleString("vi-VN")}{" "}
                {getLoaiTien(ct.loaiTienId)}
              </h4>
              {ct.tyGia && (
                <p className="text-sm text-gray-700">🔄 Tỷ giá: {ct.tyGia}</p>
              )}
              {ct.ghiChu && (
                <p className="text-sm text-gray-600 mt-1">📝 {ct.ghiChu}</p>
              )}
            </VerticalTimelineElement>
          ))}
        </VerticalTimeline>
      )}
    </div>
  );
};
