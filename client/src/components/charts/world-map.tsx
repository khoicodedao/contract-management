import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  data: Array<{
    country: string; // Tên quốc gia khớp geo.properties.name
    count: number;
  }>;
}

export default function WorldMap({ data }: WorldMapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Không có dữ liệu bản đồ</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const getFillColor = (count: number) => {
    if (count >= 3) return "#dc2626"; // đỏ
    if (count === 2) return "#ea580c"; // cam
    if (count === 1) return "#16a34a"; // xanh
    return "#e5e7eb"; // xám nhạt
  };

  // Tạo Map để truy nhanh
  const countryCountMap = new Map<string, number>();
  data.forEach((d) => {
    countryCountMap.set(d.country, d.count);
  });

  return (
    <div className="w-full h-96 bg-gray-50 rounded-lg overflow-hidden relative">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 140,
          center: [0, 20],
        }}
        style={{ width: "100%", height: "100%" }}
      >
        <ZoomableGroup disableZoom disablePanning>
          <Geographies geography={geoUrl}>
            {/* @ts-ignore */}
            {({ geographies }) =>
              geographies.map((geo: any) => {
                const name = geo.properties.name;
                const count = countryCountMap.get(name) || 0;

                const fill = count > 0 ? getFillColor(count) : "#e5e7eb";

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#d1d5db"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        cursor: count > 0 ? "pointer" : "default",
                        // ❌ Không thay đổi fill để giữ nguyên màu gốc
                      },
                      pressed: { outline: "none" },
                    }}
                  >
                    <title>
                      {count > 0 ? `${name}: ${count} hợp đồng` : name}
                    </title>
                  </Geography>
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
        <h4 className="text-sm font-medium text-gray-900 mb-2">
          Số lượng hợp đồng
        </h4>
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span>1</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 rounded-full bg-orange-600"></div>
            <span>2</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-5 h-5 rounded-full bg-red-600"></div>
            <span>3+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
