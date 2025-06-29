import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
  //@ts-ignore
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WorldMapProps {
  data: Array<{
    country: string;
    count: number;
    coordinates: [number, number];
  }>;
}

export default function WorldMap({ data }: WorldMapProps) {
  const maxCount = Math.max(...data.map((d) => d.count));

  const getMarkerSize = (count: number) => {
    const minSize = 8;
    const maxSize = 25;
    return minSize + (count / maxCount) * (maxSize - minSize);
  };

  const getMarkerColor = (count: number) => {
    if (count >= 3) return "#dc2626";
    if (count >= 2) return "#ea580c";
    return "#16a34a";
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Không có dữ liệu bản đồ</div>
      </div>
    );
  }

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
              geographies.map((geo: any) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#e5e7eb"
                  stroke="#d1d5db"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "#d1d5db" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {data.map((marker, index) => (
            <Marker key={index} coordinates={marker.coordinates}>
              <circle
                r={getMarkerSize(marker.count)}
                fill={getMarkerColor(marker.count)}
                fillOpacity={0.8}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                textAnchor="middle"
                y={getMarkerSize(marker.count) + 15}
                style={{
                  fontFamily: "system-ui",
                  fontSize: "11px",
                  fontWeight: "500",
                  fill: "#374151",
                }}
              >
                {marker.country}
              </text>
              <text
                textAnchor="middle"
                y={getMarkerSize(marker.count) + 28}
                style={{
                  fontFamily: "system-ui",
                  fontSize: "10px",
                  fill: "#6b7280",
                }}
              >
                {marker.count} hợp đồng
              </text>
            </Marker>
          ))}
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

      {/* Instructions - optional to remove */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 border text-xs text-gray-600">
        <div>Bản đồ tĩnh, không thể phóng to/thu nhỏ</div>
      </div>
    </div>
  );
}
